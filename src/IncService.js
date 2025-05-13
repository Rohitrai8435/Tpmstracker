import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, Image, StatusBar, ScrollView, Alert, PermissionsAndroid, Platform, ActivityIndicator, ToastAndroid } from 'react-native';
import React, { useState, useEffect, useContext } from 'react';
import Back from '../assets/svg/drop.svg';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import Geolocation from 'react-native-geolocation-service';
import { launchCamera } from 'react-native-image-picker';
import {getImeiAll } from './service/ApiService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import NetInfo from '@react-native-community/netinfo';
import NoInternet from './NoInternet';


const IncService = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState([]);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [selectedPhotos, setSelectedPhotos] = useState([
    null,
    null,
    null,
    null,
    null,
  ]);
  const [uniqueId, setUniqueId] = useState(null);
  const [obj, setObj] = useState({imei: '', version: '', global: ''});
  const [profile, setProfile] = useState(null);
  const [wcc, setWcc] = useState([null, null]);
  const [location, setLocation] = useState({latitude: null, longitude: null});
  const [uploadFile, setuploadFile] = useState(true);
  const [photoCaption, setPhotoCaption] = useState([
    'TPMS',
    'TPMS open',
    'TPMS Supply',
    'Door Sensor',
    'Hooter',
    'Antenna',
    'BB-1/BB-2/BB-3',
    'Mains(MCB)',
    'DG(MCB)',
    'RRU',
    'Upload more',
  ]);
  const navigation = useNavigation();


  useEffect(() => {
    const fetchAsy = async () => {
      try {
        const userData = await AsyncStorage.getItem('userData');
        const parsedData = JSON.parse(userData);
        setProfile(parsedData);
      } catch (error) {}
    };
    fetchAsy();
  }, []);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected && state.isInternetReachable);
    });
    return () => unsubscribe();
  }, []);
const controller = new AbortController();

useEffect(() => {
  const fetchImei = async () => {
    try {
      setIsLoading(true);
      // Pass the signal to the getImei function
      const response = await getImeiAll(controller.signal);
      // console.log('IMEI Response Status:', response.status);

      if (response.status === 'success') {
        setOptions(response.data);
      } else {
        Alert.alert('Error', response.message || 'Unknown error');
      }
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log('Request cancelled:', error.message);
      } else {
        Alert.alert('Error fetching IMEI:', error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  fetchImei();

  // Cleanup function to cancel the request
  return () => {
    controller.abort();
    console.log("api close");
  };
}, []);

  useEffect(() => {
    const cleanedQuery = searchQuery.replace(/\s+/g, '').toLowerCase();
    const filtered = options.filter(option =>
      option.globel_id
        .replace(/\s+/g, '')
        .toLowerCase()
        .startsWith(cleanedQuery),
    );
    setFilteredOptions(filtered);
  }, [searchQuery, options]);

  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        ]);

        if (
          granted['android.permission.ACCESS_FINE_LOCATION'] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          granted['android.permission.ACCESS_COARSE_LOCATION'] ===
            PermissionsAndroid.RESULTS.GRANTED
        ) {
          console.log('Location permissions granted.');
          getCurrentLocation();
        } else {
          Alert.alert(
            'Permission Denied',
            'Location permission is required to access your current location.',
          );
        }
      } else {
        getCurrentLocation();
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        // console.log(position);
      },
      error => {
        console.log(error.code, error.message);
      },
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  };

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const handlePhotoSelect = (index, isWCC = false) => {
    launchCamera({mediaType: 'photo', quality: 0.3}, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorMessage) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else {
        const uri = response.assets[0].uri;

        if (isWCC) {
          let newPhotos = [...wcc];
          newPhotos[index] = {uri}; 
          setWcc(newPhotos);
        } else {
          const timestamp = new Date().toISOString();
          let newPhotos = [...selectedPhotos];
          newPhotos[index] = {uri, timestamp};
          setSelectedPhotos(newPhotos);
          console.log(uri);
        }
      }
    });
  };

  const generateUniqueId = imeiP => {
    const imei = imeiP || '0000000000';
    const timestamp = Date.now().toString();
    const longitude = location.longitude
      ? location.longitude.toString().slice(-4)
      : '0000';
    return `${imei.slice(-4)}${longitude}${timestamp.slice(-2)}`;
  };
  const handleUploadButtonClick = () => {
    let localObj = {...obj};

    if (searchQuery.length > 0 && !localObj?.imei) {
      const cleanedQuery = searchQuery.trim().toLowerCase();
      const filtered = options.filter(option =>
        option.globel_id?.trim().toLowerCase().startsWith(cleanedQuery),
      );

      if (filtered.length > 0) {
        localObj = {
          imei: filtered[0].gsm_imei_no || '',
          version: filtered[0].version || '',
          global: filtered[0].globel_id || '',
        };
        setObj(localObj);
        console.log('selected');
      } else {
        Alert.alert('Error', 'Respective Global ID not found in the database');
        return;
      }
    }

    if (!localObj?.imei) {
      Alert.alert('Error', 'Global ID is missing.');
      return;
    }

    if (!location?.latitude || !location?.longitude) {
      Alert.alert('Error', 'Location coordinates are missing.');
      return;
    }
    if (!selectedPhotos || selectedPhotos.length === 0) {
      Alert.alert('Error', 'Please select at least one photo.');
      return;
    }
    if (wcc.some(photo => photo === null)) {
      Alert.alert(
        'Error',
        'Please upload both WCC image && Your image with PPE kit',
      );
      return;
    }

    setIsLoading(true);
    const uniqueId = generateUniqueId(localObj.imei);
    setUniqueId(uniqueId);
    const currentTimestamp = new Date().toISOString();
    const formData = new FormData();
    formData.append('unique_id', uniqueId);
    formData.append('imei', localObj.global);
    formData.append('tech_id', profile.id);
    formData.append('insert_time', currentTimestamp);
    formData.append('service_type', 'Inc');
    formData.append('latitude', location.latitude);
    formData.append('longitude', location.longitude);
    formData.append('location', `${location.latitude},${location.longitude}`);
    //formData.append('wcc', { uri: wcc, name: 'wcc.jpg', type: 'image/jpeg' });
    wcc.forEach((photo, index) => {
      if (photo) {
        formData.append('wcc[]', {
          uri: photo.uri,
          name: `photo${index + 1}.jpg`,
          type: 'image/jpeg',
        });
      }
    });
    selectedPhotos.forEach((photo, index) => {
      if (photo) {
        formData.append('image[]', {
          uri: photo.uri,
          name: `photo${index + 1}.jpg`,
          type: 'image/jpeg',
        });
        formData.append(`timestamp[${index}]`, photo.timestamp);
      }
    });

    axios
      .post(
        'https://dashboard.shrotitele.com/apitpms/TpmsTracker/inc_insertdata',
        formData,
        {
          headers: {'Content-Type': 'multipart/form-data'},
        },
      )
      .then(response => {
        setIsLoading(false);
        console.log('Upload response:', response.data);
        Alert.alert('Upload Successful', response.data.message);
        let localObj = {...obj};
        if (searchQuery.length > 0 && !localObj?.imei) {
          const cleanedQuery = searchQuery.trim().toLowerCase();
          const filtered = options.filter(option =>
            option.globel_id?.trim().toLowerCase().startsWith(cleanedQuery),
          );

          if (filtered.length > 0) {
            localObj = {
              imei: filtered[0].gsm_imei_no || '',
              version: filtered[0].version || '',
              global: filtered[0].globel_id || '',
            };
            setObj(localObj); // Update the state
            console.log('selected');
          } else {
            Alert.alert(
              'Error',
              'Respective Global ID not found in the database',
            );
            return;
          }
        }

        if (!localObj.imei || !localObj.version) {
          Alert.alert('Error', 'First select a site by Global ID.');
          return;
        }

        console.log('click');
        navigation.navigate('wccform', {
          imei: localObj.imei,
          mode: false,
          version: localObj.version,
          uniqueId: uniqueId,
          complainNo: 'NA',
          serviceType: 'Inc',
          technicianName: profile.name,
          color: '#fb703f',
        });
        setuploadFile(false);
      })
      .catch(error => {
        setIsLoading(false);
        console.error('Error uploading images:', error);
        Alert.alert(
          'Upload Failed',
          'There was an error uploading your images.',
        );
      });
  };
  const showToast = (title, message) => {
    ToastAndroid.show(`${title + ' ' + message}`, ToastAndroid.SHORT);
    Toast.show({
      type: 'success',
      text1: title,
      text2: message,
    });
  };

  const handlewcc=()=>{
    let localObj = {...obj};
    if (searchQuery.length > 0 && !localObj?.imei) {
      const cleanedQuery = searchQuery.trim().toLowerCase();
      const filtered = options.filter(option =>
        option.globel_id?.trim().toLowerCase().startsWith(cleanedQuery),
      );

      if (filtered.length > 0) {
        localObj = {
          imei: filtered[0].gsm_imei_no || '',
          version: filtered[0].version || '',
          global: filtered[0].globel_id || '',
        };
        setObj(localObj); // Update the state
        console.log('selected');
      } else {
        Alert.alert('Error', 'Respective Global ID not found in the database');
        return;
      }
    }

    if (!localObj.imei || !localObj.version) {
      Alert.alert('Error', 'First select a site by Global ID.');
      return;
    }

  
     navigation.navigate('wccform', {
       imei: localObj.imei,
       mode: false,
       uniqueId: uniqueId,
       technicianName: profile.name,
       version: localObj.version,
       serviceType: 'Inc',
       complainNo: 'NA',
       color: '#fb703f',
     });

  }

  const siteDetail = () => {
    let localObj = {...obj};
    if (searchQuery.length > 0 && !localObj?.imei) {
      const cleanedQuery = searchQuery.trim().toLowerCase();
      const filtered = options.filter(option =>
        option.globel_id?.trim().toLowerCase().startsWith(cleanedQuery),
      );

      if (filtered.length > 0) {
        localObj = {
          imei: filtered[0].gsm_imei_no || '',
          version: filtered[0].version || '',
          global: filtered[0].globel_id || '',
        };
        setObj(localObj); // Update the state
        console.log('selected');
      } else {
        Alert.alert('Error', 'Respective Global ID not found in the database');
        return;
      }
    }

    if (!localObj.imei || !localObj.version) {
      Alert.alert('Error', 'First select a site by Global ID.');
      return;
    }

    navigation.navigate('SiteDetail', {
      imei: localObj.imei,
      mode: false,
      version: localObj.version,
      

      color: '#fb703f',
    });
  };
  return isConnected ? (
    <>
      <StatusBar
        translucent={true}
        backgroundColor="transparent"
        barStyle="dark-content"
      />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Back width={24} height={24} rotation={90} fill={'white'} />
        </TouchableOpacity>
        <Text style={styles.headerText}>INC</Text>
      </View>
      <Toast></Toast>
      {isLoading ? (
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            flex: 1,
            backgroundColor: 'white',
          }}>
          <ActivityIndicator
            size="large"
            width={50}
            height={50}
            color={['#0a478f', '#54c9b2', '#e8c592', '#e861af']}
          />
          <Text
            style={{
              fontFamily: 'AndadaPro-Regular',
              marginTop: 10,
              fontSize: 20,
              color: 'black',
            }}>
            Data is loading...
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.container}>
          <TextInput
            style={styles.searchInput}
            placeholder="Enter Global ID"
            placeholderTextColor={'#888'}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <FlatList
              data={filteredOptions}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={styles.option}
                  onPress={() => {
                    showToast('Global id', 'Global id selected successfully');
                    setSearchQuery(item.globel_id);
                    setObj({
                      imei: item.gsm_imei_no,
                      version: item.version,
                      global: item.globel_id,
                    });
                  }}>
                  <Text style={styles.optionText}>{item.globel_id}</Text>
                  <Text style={[styles.optionText, {fontSize: 10}]}>
                    {item.site_name}
                  </Text>
                </TouchableOpacity>
              )}
            />
          )}
          <Text style={styles.uploadLabel}>Upload Photos:</Text>
          <View style={styles.photoContainer}>
            {selectedPhotos.map((photo, index) => (
              <TouchableOpacity
                key={index}
                style={styles.photoSlot}
                onPress={() => {
                  handlePhotoSelect(index);
                }}>
                {photo ? (
                  <Image source={{uri: photo.uri}} style={styles.photo} />
                ) : (
                  <Text style={styles.placeholderText}>
                    {index < photoCaption.length
                      ? 'Tap to Upload ' + photoCaption[index] + ' Photo'
                      : 'Tap to Upload Photo'}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
            {selectedPhotos.length < 20 && (
              <TouchableOpacity
                style={[styles.photoSlot, styles.addMoreButton]}
                onPress={() => {
                  const updatedPhotos = [...selectedPhotos, null];
                  setSelectedPhotos(updatedPhotos);
                }}>
                <Text style={[styles.addMoreText, {color: 'orange'}]}>
                  + Add More
                </Text>
              </TouchableOpacity>
            )}
            {wcc.map((photo, index) => (
              <TouchableOpacity
                key={index}
                style={styles.photoSlot}
                onPress={() => handlePhotoSelect(index, true)}>
                {photo && photo.uri ? (
                  <Image source={{uri: photo.uri}} style={styles.photo} />
                ) : (
                  <Text
                    style={[
                      styles.placeholderText,
                      {color: 'green', textAlign: 'center'},
                    ]}>
                    {index === 0
                      ? 'System Serial Number'
                      : 'Selfi with Technician with PPE Kit'}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            style={styles.flightCard}
            onPress={() => {
              uploadFile
                ? handleUploadButtonClick()
                : Alert.alert(
                    'Images are already uploaded',
                    'Images are already uploaded Please do not try to upload again',
                  );
            }}>
            <Text style={styles.flightPrice}>Upload Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.flightCard, {marginBottom: 40}]}
            onPress={() => {
              siteDetail();
            }}>
            <Text style={styles.flightPrice}>Site Detail</Text>
          </TouchableOpacity>
          
        </ScrollView>
      )}
    </>
  ) : (
    <NoInternet></NoInternet>
  );
};

export default IncService;
const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: StatusBar.currentHeight,
    paddingBottom: 20,
    paddingTop: 60,
    paddingHorizontal: 20,
    backgroundColor: '#fb703f',
  },
  backButton: {
    marginRight: 10,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    paddingLeft: 8,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f7f7f7',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#007aff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
    color: '#666',
    fontFamily: 'AndadaPro-Regular',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
    marginTop: 10,
  },
  dropdownList: {
    borderWidth: 1,
    borderColor: '#007aff',
    borderRadius: 8,
    backgroundColor: '#fff',
    maxHeight: 150,
    marginBottom: 20,
    paddingHorizontal: 5,
    elevation: 2,
  },
  option: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ddd',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  uploadLabel: {
    fontSize: 18,
    fontFamily: 'AndadaPro-Regular',
    color: '#333',
    marginBottom: 15,
    marginTop: 20,
  },
  photoContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  photoSlot: {
    width: '48%',
    height: 120,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eaeaea',
    marginBottom: 10,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  placeholderText: {
    fontSize: 14,
    color: '#888',
    fontFamily: 'AndadaPro-Regular',
    textAlign:'center'
  },
  flightCard: {
    backgroundColor: '#fb703f',
    padding: 16,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 3 },
    shadowOpacity: 0.55,
    shadowRadius: 4.84,
    elevation: 5,
  },
  flightPrice: {
    fontSize: 20,
    fontFamily: 'AndadaPro-Regular',
    color: '#fff',
    textAlign: 'center',
  },
});
