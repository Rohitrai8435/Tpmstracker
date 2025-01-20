import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  StatusBar,
  ScrollView,
  Alert,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import Back from '../../assets/svg/drop.svg';
import {useNavigation, useRoute} from '@react-navigation/native';
import {closeRequest, getDetailOfCard} from '../service/ApiService';
import Close from '../../assets/svg/cross.svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FastImage from 'react-native-fast-image';
import axios from 'axios';

const IncTeam = () => {
  const navigation = useNavigation();
  const [version, setVersion] = useState(null);
  const [beforeList, setBeforeList] = useState([]);
  const [afterList, setAfterList] = useState([]);
  const [wcc, setWcc] = useState([]);
  const [id, setId] = useState('');
  const route = useRoute();
  const {item, color} = route.params;
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState({
    imageUrl: null,
    time: null,
  });
  // console.log(route);
  useEffect(() => {
    const fetchUserData = async () => {
      const userData = await AsyncStorage.getItem('userData');
      if (!userData) {
        console.error('User data not found.');
        return;
      }
      const parsedData = JSON.parse(userData);
      const userId = parsedData?.id;
      setId(userId);
    };
    fetchUserData();
  }, []);

  const formatDateTime = isoTime => {
    try {
      const dateObj = new Date(isoTime);
      if (isNaN(dateObj)) {
        throw new Error('Invalid date format');
      }
      const date = isoTime.split('T')[0];
      const hours = dateObj.getHours();
      const minutes = dateObj.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const formattedHours = hours % 12 || 12;
      const time = `${formattedHours}:${minutes} ${ampm}`;

      return `${date} ${time}`;
    } catch (error) {
      console.error('Date parsing error:', error.message);
      return 'Invalid date';
    }
  };
  const handleImagePress = (imageUrl, imageTime) => {
    const formattedTime = formatDateTime(imageTime);
    setSelectedImage({imageUrl, time: formattedTime});
    setIsModalVisible(true);
  };
  const close = async () => {
    try {
      const response = await closeRequest(item.unique_id, id, item.imei);
      if (response.status) {
        Alert.alert(
          'Success',
          'Request closed successfully. Site status updated.',
        );
        navigation.goBack();
      } else {
        Alert.alert(
          'Error',
          response.message || 'Failed to close the request.',
        );
      }
    } catch (error) {
      console.error('Error closing request:', error);
      Alert.alert(
        'Unexpected Error',
        'An error occurred while closing the request. Please try again.',
      );
    }
  };
  const controller = new AbortController();
  useEffect(() => {
        const fetchData = async () => {
          try {
            const response = await getDetailOfCard(
              item.unique_id,
              item.imei,
              controller.signal, // Pass the signal
            );
  
            // Update state with response data
            setVersion(response.dataVersion[0]?.version);
            setWcc(response.wcc);
  
            const beforeItems = [];
            const afterItems = [];
  
            response.data.forEach(dataItem => {
              if (dataItem.type === 'Before' || !dataItem.type) {
                beforeItems.push(dataItem);
              } else if (dataItem.type === 'After') {
                afterItems.push(dataItem);
              }
            });
  
            setBeforeList(beforeItems);
            setAfterList(afterItems);
  
            // console.log('Before List:', beforeItems);
            // console.log('After List:', afterItems);
            console.log("API Call successfully")
          } catch (error) {
            // Handle Axios request cancellations and other errors
            if (axios.isCancel(error)) {
              console.log('Request cancelled:', error.message);
            } else {
              Alert.alert('Error fetching card details:', error.message);
            }
          }
        };
  
        // Trigger the API call
        fetchData();
  
        // Cleanup function to cancel the request
        return () => {
          controller.abort(); // Cancel the request
          console.log('API request cancelled.');
        };
      }, [item]);

  return (
    <>
      <StatusBar
        translucent={true}
        backgroundColor="transparent"
        barStyle="dark-content"
      />
      <View style={[styles.header, {backgroundColor: color}]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Back width={24} height={24} rotation={90} fill={'white'} />
        </TouchableOpacity>
        <Text style={styles.headerText}>SITE DETAIL</Text>
        {!item.request_close_time && (
          <TouchableOpacity
            style={{alignItems: 'flex-end', flex: 1}}
            onPress={() => {
              navigation.navigate('Pending', {item, color});
            }}>
            <Text style={[styles.headerText, {alignItems: 'flex-end'}]}>
              MAP PENDING
            </Text>
          </TouchableOpacity>
        )}
      </View>
      <ScrollView style={styles.container}>
        <View style={styles.option}>
          {/* IMEI Row */}
          <View style={styles.row}>
            <Text style={styles.title}>IMEI</Text>
            <Text style={styles.value}>{item.imei}</Text>
          </View>

          {/* Location Row */}
          <View style={styles.row}>
            <Text style={styles.title}>Location</Text>
            <TouchableOpacity
              style={styles.locationButton}
              onPress={() => {
                /* Handle location button click */
              }}>
              <Text style={[styles.value, styles.locationText]}>
                {item.location}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.row}>
            <Text style={styles.title}>Site Name:</Text>
            <Text style={styles.value}>{item.site_name}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.title}>Site id:</Text>
            <Text style={styles.value}>{item.site_id}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.title}>Technician Name:</Text>
            <Text style={styles.value}>{item.name}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.title}>Technician Mobile:</Text>
            <Text style={styles.value}>{item.mobile}</Text>
          </View>
          {item.remark_soc && (
            <View style={styles.row}>
              <Text style={styles.title}>Remark by soc:</Text>
              <Text style={styles.value}>{item.remark_soc}</Text>
            </View>
          )}
        </View>
        {wcc && wcc.length > 0 && (
          <>
            <Text style={styles.uploadLabel}>
              WCC IMAGE && User with PPE kit
            </Text>
            <View style={styles.photoContainer}>
              {wcc.map((photo, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.photoSlot}
                  onPress={() =>
                    handleImagePress(photo.image_urls, item.insert_time)
                  }>
                  <FastImage
                    source={{uri: photo.image_urls}}
                    style={styles.photo}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
        <Text style={styles.uploadLabel}>
          {beforeList.length > 0 && beforeList[0].type ? 'Before:' : 'Photo:'}
        </Text>
        <View style={styles.photoContainer}>
          {beforeList && beforeList.length > 0 ? (
            beforeList.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.photoSlot}
                onPress={() => handleImagePress(item.image_urls, item.time)}>
                <FastImage
                  source={{uri: item.image_urls}}
                  style={styles.photo}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.placeholderText}>No photos available</Text>
          )}
        </View>
        {afterList.length > 0 && (
          <View>
            <Text style={styles.uploadLabel}>After:</Text>
            <View style={styles.photoContainer}>
              {afterList.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.photoSlot}
                  onPress={() => handleImagePress(item.image_urls, item.time)}>
                  <FastImage
                    source={{uri: item.image_urls}}
                    style={styles.photo}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.flightCard,
            {backgroundColor: color, marginBottom: 10},
          ]}
          onPress={() =>
            navigation.navigate('SiteDetail', {
              imei: item.imei,
              mode: false,
              version: version,
              color: color,
            })
          }>
          <Text style={styles.flightPrice}>Site Detail</Text>
        </TouchableOpacity>
        {item.request_close_time == null && (
          <TouchableOpacity
            style={[styles.flightCard, {backgroundColor: color}]}
            onPress={() => {
              close();
            }}>
            <Text style={styles.flightPrice}>Close Request</Text>
          </TouchableOpacity>
        )}

        <View style={{marginBottom: 30}}></View>
      </ScrollView>
      {isModalVisible && (
        <View
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            width: '100%',
            height: '100%',
            position: 'absolute',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <View
            style={{
              width: '100%',
              height: '80%',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <FastImage
              style={{
                width: '90%',
                height: '90%',
                borderRadius: 10,
                resizeMode: 'container',
              }}
              source={{uri: selectedImage.imageUrl}}
            />
            <View style={styles.overlay}>
              <View
                style={{
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexDirection: 'row',
                  paddingLeft: 4,
                  paddingRight: 4,
                }}>
                <Text style={styles.text}>Latitude :</Text>
                <Text style={styles.text}>{item.latitude}</Text>
              </View>
              <View
                style={{
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexDirection: 'row',
                  paddingLeft: 4,
                  paddingRight: 4,
                }}>
                <Text style={styles.text}>Longitude :</Text>
                <Text style={styles.text}>{item.longitude}</Text>
              </View>
              <View
                style={{
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexDirection: 'row',
                  paddingLeft: 4,
                  paddingRight: 4,
                }}>
                <Text style={styles.text}>Time :</Text>
                <Text style={styles.text}>{selectedImage.time}</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => setIsModalVisible(false)}
              style={{
                alignItems: 'center',
                backgroundColor: 'white',
                padding: 8,
                borderRadius: 8,
              }}>
              <Text style={{fontSize: 16, color: '#333'}}>CLOSE</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </>
  );
};
export default IncTeam;
const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: StatusBar.currentHeight,
    paddingBottom: 20,
    paddingTop: 66,
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
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 8,
    elevation: 2,
    marginTop: 34,
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
    padding: 10,
    fontFamily: 'Prociono-Regular',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Prociono-Regular',
    color: '#333',
  },
  value: {
    fontSize: 16,
    color: 'black',
    fontFamily: 'Prociono-Regular',
  },
  locationButton: {
    backgroundColor: 'red',
    padding: 5,
    borderRadius: 5,
  },
  locationText: {
    color: 'white',
    fontFamily: 'Prociono-Regular',
  },
  uploadLabel: {
    fontSize: 18,
    fontFamily: 'Prociono-Regular',
    color: '#333',
    marginBottom: 15,
    marginTop: 10,
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
    fontFamily: 'Prociono-Regular',
  },
  flightCard: {
    backgroundColor: '#fb703f',
    padding: 16,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {width: 2, height: 3},
    shadowOpacity: 0.55,
    shadowRadius: 4.84,
    elevation: 5,
  },
  flightPrice: {
    fontSize: 20,
    fontFamily: 'Prociono-Regular',
    color: '#fff',
    textAlign: 'center',
  },
  overlay: {
    position: 'relative',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
    bottom: '9%',
    width: '90%',
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
  },
});
