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
  Modal,
  PermissionsAndroid,
  ActivityIndicator,
  ToastAndroid,
} from 'react-native';
import React, {useState, useEffect, useRef, useCallback} from 'react';
import Back from '../assets/svg/drop.svg';
import {useNavigation} from '@react-navigation/native';
import axios from 'axios';
import Geolocation from 'react-native-geolocation-service';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {get_all_product, get_all_sites_product} from './service/ApiService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import NetInfo from '@react-native-community/netinfo';
import NoInternet from './NoInternet';
import FastImage from 'react-native-fast-image';
import ImageResizer from 'react-native-image-resizer';
import {SelectList} from 'react-native-dropdown-select-list';

// const ProductDropdown = ({onProductSelect}) => {
//   const [productList, setProductList] = useState([]);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     const controller = new AbortController();

//     const fetchProducts = async () => {
//       setLoading(true);
//       try {
//         const response = await get_all_product(controller.signal);
//         if (response.status === 'success' && Array.isArray(response.data)) {
//           const formatted = response.data.map(item => ({
//             key: item.product_id,
//             value: item.product_name,
//           }));
//           setProductList(formatted);
//         } else {
//           setProductList([]);
//         }
//       } catch (error) {
//         if (error.name !== 'AbortError' && error.name !== 'CanceledError') {
//           console.error('Failed to fetch products:', error);
//         }
//         setProductList([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProducts();
//     return () => controller.abort();
//   }, []);

//   const handleSelect = productId => {
//     onProductSelect(productId);
//   };

//   return (
//     <SelectList
//       setSelected={handleSelect}
//       placeholder={loading ? 'Loading products...' : 'Select Product'}
//       data={productList}
//       colors={{primary: '#fb703f', placeholder: '#888'}}
//       save="key"
//     />
//   );
// };
const ProductDropdown = ({onProductSelect}) => {
  const [productList, setProductList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedKey, setSelectedKey] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await get_all_product(controller.signal);
        if (response.status === 'success' && Array.isArray(response.data)) {
          const formatted = response.data.map(item => ({
            key: item.product_id,
            value: item.product_name,
          }));
          setProductList(formatted);
        } else {
          setProductList([]);
        }
      } catch (error) {
        if (error.name !== 'AbortError' && error.name !== 'CanceledError') {
          console.error('Failed to fetch products:', error);
        }
        setProductList([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
    return () => controller.abort();
  }, []);

  const handleSelect = productId => {
    setSelectedKey(productId);
    onProductSelect(productId);
  };

  return (
    <SelectList
      setSelected={handleSelect}
      placeholder={loading ? 'Loading products...' : 'Select Product'}
      data={productList}
      save="key"
      boxStyles={{
        borderColor: '#fb703f',
        borderWidth: 1,
        backgroundColor: '#fff',
      }}
      inputStyles={{
        color: selectedKey ? '#000' : '#999',
      }}
      dropdownStyles={{
        borderColor: '#fb703f',
      }}
      dropdownTextStyles={{
        color: '#333',
      }}
    />
  );
};
const SitIdDropdown = ({productId, onSiteSelect}) => {
  const [siteData, setSiteData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedLabel, setSelectedLabel] = useState('');
  const controllerRef = useRef(null);
  const debounceRef = useRef(null);

  const fetchSites = useCallback(
    async (query = '') => {
      if (!productId) return;

      if (controllerRef.current) {
        controllerRef.current.abort();
      }
      const controller = new AbortController();
      controllerRef.current = controller;

      setLoading(true);
      try {
        const serviceType = 'Revisit'; // Adjust this if you have a specific service type
        const userData = await AsyncStorage.getItem('userData');
        const profile = JSON.parse(userData);

        const response = await get_all_sites_product(
          controller.signal,
          productId,
          serviceType,
          profile,
          query,
          50,
        );
        if (response.status === 'success' && Array.isArray(response.data)) {
          console.log('Fetched sites:', response.data.service_type);
          setSiteData(response.data);
        } else {
          setSiteData([]);
        }
      } catch (error) {
        if (error.name !== 'AbortError' && error.name !== 'CanceledError') {
          console.error('Failed to fetch sites:', error);
        }
        setSiteData([]);
      } finally {
        setLoading(false);
      }
    },
    [productId],
  );

  useEffect(() => {
    if (!productId) {
      setSiteData([]);
      setSelectedLabel('');
      setSearch('');
      return;
    }
    setSelectedLabel('');
    setSearch('');
    fetchSites('');
  }, [productId, fetchSites]);

  const handleSearchChange = text => {
    setSearch(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchSites(text);
    }, 400);
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (controllerRef.current) controllerRef.current.abort();
    };
  }, []);

  const handleSelect = item => {
    setSelectedLabel(`${item.site_id} - ${item.site_name}`);
    setModalVisible(false);
    setSearch('');
    onSiteSelect(item);
  };

  const openModal = () => {
    if (!productId) return;
    setModalVisible(true);
    if (siteData.length === 0) fetchSites('');
  };

  return (
    <View>
      <TouchableOpacity
        onPress={openModal}
        style={[styles.dropdownButton, !productId && styles.disabled]}
        disabled={!productId}>
        <Text style={styles.dropdownText}>
          {!productId
            ? 'Select a product first'
            : selectedLabel || 'Select Site ID'}
        </Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <TextInput
            placeholder="Search by site ID or name..."
            value={search}
            onChangeText={handleSearchChange}
            style={styles.modalSearchInput}
            autoFocus
          />

          {loading && <ActivityIndicator style={{marginVertical: 12}} />}

          <FlatList
            data={siteData}
            keyExtractor={item => String(item.tracker_id)}
            initialNumToRender={20}
            maxToRenderPerBatch={20}
            windowSize={10}
            keyboardShouldPersistTaps="handled"
            renderItem={({item}) => (
              <TouchableOpacity
                onPress={() => handleSelect(item)}
                style={styles.itemRow}>
                <Text
                  style={
                    styles.itemText
                  }>{`${item.site_id} - ${item.site_name}`}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              !loading ? (
                <Text style={styles.emptyText}>No sites found</Text>
              ) : null
            }
          />

          <TouchableOpacity
            onPress={() => {
              setModalVisible(false);
              setSearch('');
            }}
            style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const RevisitService = () => {
  const [isConnected, setIsConnected] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [timestampBefore, setTimeStampBefore] = useState([]);
  const [timestampAfter, setTimeStampAfter] = useState([]);
  const [uniqueId, setUniqueId] = useState(null);

  const [selectedProductId, setSelectedProductId] = useState(null);
  const [selectedSite, setSelectedSite] = useState(null);

  const [selectedPhotos, setSelectedPhotos] = useState([
    null,
    null,
    null,
    null,
    null,
  ]);
  const [selectedPhotosAfter, setSelectedPhotosAfter] = useState([
    null,
    null,
    null,
    null,
    null,
  ]);

  const [profile, setProfile] = useState(null);
  const [uploadFileB, setuploadFileB] = useState(true);
  const [uploadFileA, setuploadFileA] = useState(true);
  const [location, setLocation] = useState({latitude: null, longitude: null});
  const [complainNo, setComplainNo] = useState(null);
  const [faultyRemark, setFaultyRemark] = useState('');
  const [proublemType, setproublemType] = useState('');
  const [replaceRemark, setReplaceRemark] = useState('');
  const [ActualRemark, setActualRemark] = useState('');

  const [siteStatus, SetsiteStatus] = useState('');
  const [wcc, setWcc] = useState([null, null]);
  const [photoCaption, setPhotoCaption] = useState([
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
  ]);

  const navigation = useNavigation();
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userData = await AsyncStorage.getItem('userData');
        setProfile(JSON.parse(userData));
      } catch (error) {
        console.error('Failed to load profile:', error);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected && state.isInternetReachable);
    });
    return () => unsubscribe();
  }, []);

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
          // console.log('Location permissions granted.');
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
      Alert.alert(
        'Location permission is required to access your current location.',
      );
    }
  };

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      error => {
        Alert.alert(error.code, error.message);
      },
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  };

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const handlePhotoSelect = index => {
    Alert.alert(
      'Select Photo',
      'Choose an option',
      [
        {
          text: 'Camera',
          onPress: () => {
            launchCamera({mediaType: 'photo', quality: 0.2}, response => {
              processImage(response);
            });
          },
        },
        {
          text: 'Gallery',
          onPress: () => {
            launchImageLibrary({mediaType: 'photo', quality: 0.2}, response => {
              processImage(response);
            });
          },
        },
        {text: 'Cancel', style: 'cancel'},
      ],
      {cancelable: true},
    );

    async function processImage(response) {
      if (response.didCancel) {
        Alert.alert('User cancelled image picker');
        return;
      }

      if (response.errorMessage) {
        Alert.alert('ImagePicker Error:', response.errorMessage);
        return;
      }

      const asset = response.assets?.[0];
      if (!asset?.uri) {
        Alert.alert('Error', 'No image URI returned');
        return;
      }

      const {uri: originalUri, width, height} = asset; // original size

      try {
        // Re‑encode JPEG with same dimensions but lower quality
        const compressedImage = await ImageResizer.createResizedImage(
          originalUri,
          width,
          height,
          'JPEG',
          50,
        );

        const uri = compressedImage.uri;

        // Update selectedPhotos array
        let newPhotos = [...selectedPhotos];
        newPhotos[index] = uri;
        setSelectedPhotos(newPhotos);

        // Save timestamp
        const timestamp = new Date().toISOString();
        let newTimestamps = [...timestampBefore];
        newTimestamps[index] = timestamp;
        setTimeStampBefore(newTimestamps);
      } catch (error) {
        console.error('Image compression error:', error);
        Alert.alert('Error', 'Failed to compress image');
      }
    }
  };

  const handlePhotoSelectAfter = (index, isWCC = false) => {
    Alert.alert(
      'Select Photo',
      'Choose an option',
      [
        {
          text: 'Camera',
          onPress: () => {
            launchCamera({mediaType: 'photo', quality: 0.2}, response => {
              processImage(response);
            });
          },
        },
        {
          text: 'Gallery',
          onPress: () => {
            launchImageLibrary({mediaType: 'photo', quality: 0.2}, response => {
              processImage(response);
            });
          },
        },
        {text: 'Cancel', style: 'cancel'},
      ],
      {cancelable: true},
    );

    async function processImage(response) {
      if (response.didCancel) {
        Alert.alert('User cancelled image picker');
        return;
      }

      if (response.errorMessage) {
        Alert.alert('ImagePicker Error:', response.errorMessage);
        return;
      }

      const asset = response.assets?.[0];
      if (!asset?.uri) {
        Alert.alert('Error', 'No image URI returned');
        return;
      }

      const {uri: originalUri, width, height} = asset;

      try {
        const compressedImage = await ImageResizer.createResizedImage(
          originalUri,
          width,
          height,
          'JPEG',
          50,
        );

        const uri = compressedImage.uri;

        if (isWCC) {
          let newPhotos = [...wcc];
          newPhotos[index] = {uri};
          setWcc(newPhotos);
        } else {
          let newPhotos = [...selectedPhotosAfter];
          newPhotos[index] = uri;
          setSelectedPhotosAfter(newPhotos);

          const timestamp = new Date().toISOString();
          let newTimestamps = [...timestampAfter];
          newTimestamps[index] = timestamp;
          setTimeStampAfter(newTimestamps);
        }
      } catch (error) {
        console.error('Image compression error:', error);
        Alert.alert('Error', 'Failed to compress image');
      }
    }
  };

  const generateUniqueId = imeiP => {
    const imei = imeiP || '0000000000';
    const timestamp = Date.now().toString();
    const longitude = location.longitude
      ? location.longitude.toString().slice(-4)
      : '0000';
    return `${imei.slice(-4)}${longitude}${timestamp.slice(-2)}`;
  };

  const handleUploadButtonClick = async () => {
    if (selectedSite?.imei) {
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
    setIsLoading(true);
    // console.log('Selected Site:', selectedSite);

    const uniqueId = generateUniqueId(selectedSite?.imei);
    const currentTimestamp = new Date().toISOString();
    const formData = new FormData();
    formData.append('unique_id', uniqueId);
    formData.append('tech_id', profile.id);
    formData.append('insert_time', currentTimestamp);
    formData.append('service_type', 'Revisit');
    formData.append('latitude', location.latitude);
    formData.append('longitude', location.longitude);
    formData.append('location', `${location.latitude},${location.longitude}`);
    formData.append('complain_no', complainNo);
    formData.append('before_remark', faultyRemark);
    formData.append('tracker_id', selectedSite?.tracker_id || '');
    formData.append('ctmid', selectedSite?.ctmid || '');
    formData.append('state_id', selectedSite?.state_id || '');
    formData.append('dist_id', selectedSite?.dist_id || '');
    formData.append('cluster_id', selectedSite?.cluster_id || '');
    formData.append('aid_l1', selectedSite?.aid_l1 || '');
    formData.append('aid_l2', selectedSite?.aid_l2 || '');
    formData.append('aid_l3', selectedSite?.aid_l3 || '');
    formData.append('aid_l4', selectedSite?.aid_l4 || '');
    formData.append('aid_l5', selectedSite?.aid_l5 || '');
    formData.append('techid', selectedSite?.techid || '');
    formData.append('site_type', selectedSite?.site_type || '');
    formData.append('product_type', selectedSite?.product_type || '');
    formData.append('site_id', selectedSite?.site_id || '');
    formData.append('imei', selectedSite?.site_id || '');
    formData.append('site_name', selectedSite?.site_name || '');
    formData.append('gsm_imei_no', selectedSite?.gsm_imei_no || '');
    formData.append('system_serial_no', selectedSite?.system_serial_no || '');
    formData.append('is_chargeable', selectedSite?.is_chargeable || '');
    formData.append(
      'system_version_type',
      selectedSite?.system_version_type || '',
    );
    formData.append('i_c_date', selectedSite?.i_c_date || '');
    formData.append(
      'no_of_battery_bank',
      selectedSite?.no_of_battery_bank || '',
    );
    formData.append('battery_bank_one', selectedSite?.battery_bank_one || '');
    formData.append('battery_bank_two', selectedSite?.battery_bank_two || '');
    formData.append(
      'battery_bank_three',
      selectedSite?.battery_bank_three || '',
    );
    formData.append('battery_bank_four', selectedSite?.battery_bank_four || '');
    formData.append('ch1', selectedSite?.ch1 || '');
    formData.append('ch2', selectedSite?.ch2 || '');
    formData.append('ch3', selectedSite?.ch3 || '');
    formData.append('ch4', selectedSite?.ch4 || '');
    formData.append('ch5', selectedSite?.ch5 || '');

    selectedPhotos.forEach((photo, index) => {
      if (photo) {
        formData.append('image[]', {
          uri: photo,
          name: `photo${index + 1}.jpg`,
          type: 'image/jpeg',
        });
        if (timestampBefore[index]) {
          formData.append(`timestamp[${index}]`, timestampBefore[index]);
        }
      }
    });

    try {
      const response = await axios.post(
        'https://dashboard.shrotitele.com/apitpms/TpmsTracker/revisit_insertdata',
        formData,
        {
          headers: {'Content-Type': 'multipart/form-data'},
        },
      );

      if (response?.data?.status) {
        showToast(response?.data?.message, '');

        const dataToSave = {
          uniqueId,
          complainNo,
          faultyRemark,
          proublemType,
          siteStatus,
          selectedPhotos,
          uploadB: false,
        };

        try {
          await AsyncStorage.setItem('uploadData', JSON.stringify(dataToSave));
        } catch (storageError) {
          Alert.alert('Error saving data', storageError.message);
        }

        setuploadFileB(false);
        setUniqueId(uniqueId);
      } else {
        Alert.alert('Upload Failed', response?.data?.message);
      }
    } catch (error) {
      Alert.alert('Upload Failed', 'There was an error uploading your images.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadAfter = async () => {
    if (!uniqueId) {
      Alert.alert(
        'Before Section Images are Not Uploaded',
        'Please first upload before section images',
      );

      return;
    }
    if (!selectedPhotosAfter || selectedPhotosAfter.length === 0) {
      Alert.alert('Error', 'Please select at least one photo.');
      return;
    }
    if (!replaceRemark || replaceRemark.trim() === '') {
      Alert.alert('Error', 'Please fill Action Taken Remarks');
      return;
    }
    if (!ActualRemark || ActualRemark.trim() === '') {
      Alert.alert('Error', 'Please fill Actaul  Remarks');
      return;
    }

    if (wcc.some(photo => photo === null)) {
      Alert.alert(
        'Error',
        'Please Upload System Serial Number and Selfi with Technician with PPE Kit',
      );
      return;
    }
    setIsLoading(true);
    const formData = new FormData();
    formData.append('unique_id', uniqueId);
    formData.append('tech_id', profile.id);
    formData.append('after_remark', replaceRemark);
    formData.append('actualRemark', ActualRemark);
    wcc.forEach((photo, index) => {
      if (photo) {
        formData.append('wcc[]', {
          uri: photo.uri,
          name: `photo${index + 1}.jpg`,
          type: 'image/jpeg',
        });
      }
    });
    selectedPhotosAfter.forEach((photo, index) => {
      if (photo) {
        formData.append('image[]', {
          uri: photo,
          name: `photo${index + 1}.jpg`,
          type: 'image/jpeg',
        });
        if (timestampAfter[index]) {
          formData.append(`timestamp[${index}]`, timestampAfter[index]);
        }
      }
    });

    axios
      .post(
        'https://dashboard.shrotitele.com/apitpms/TpmsTracker/upload_images_revisit',
        formData,
        {
          headers: {'Content-Type': 'multipart/form-data'},
        },
      )
      .then(response => {
        setIsLoading(false);

        if (response?.data?.status) {
          if (selectedSite?.imei) {
            Alert.alert('Error', 'First select a site by Global ID.');
            return;
          }
          showToast(response?.data?.message, '');
          navigation.navigate('BookingScreen');

          setuploadFileA(false);
          try {
            AsyncStorage.removeItem('uploadData');
          } catch (error) {
            Alert.alert('Error removing uploadData from AsyncStorage:', error);
          }
        } else {
          Alert.alert('Upload Failed', response?.data?.message);
        }
      })
      .catch(error => {
        setIsLoading(false);
        Alert.alert(
          'Upload Failed',
          'There was an error uploading your images.',
        );
      })
      .finally(() => {
        setIsLoading(false);
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
        <Text style={styles.headerText}>REVISIT</Text>
      </View>
      <Toast></Toast>

      <ScrollView style={styles.container}>
        <ProductDropdown onProductSelect={setSelectedProductId} />
        <SitIdDropdown
          productId={selectedProductId}
          onSiteSelect={site => {
            setSelectedSite(site);
            setComplainNo(site?.complaint_no);
            setFaultyRemark(site?.problem_desc);

            setproublemType(site?.problem_type);
            SetsiteStatus(site?.status);
          }}
        />

        <Text style={styles.uploadLabel}>Complaint No:</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Enter Complain No"
          placeholderTextColor={'#888'}
          value={complainNo}
          readOnly={true}
          onChangeText={setComplainNo}
        />
        <Text style={styles.uploadLabel}>Complaint Status:</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Complaint Status"
          placeholderTextColor={'#888'}
          readOnly={true}
          value={siteStatus}
          onChangeText={SetsiteStatus}
        />
        <Text style={styles.uploadLabel}>Complaint Remarks:</Text>
        <TextInput
          style={[styles.searchInput, {marginTop: 0, marginBottom: 10}]}
          placeholder="Enter Complaint Remarks"
          placeholderTextColor={'#888'}
          readOnly={true}
          value={faultyRemark}
          onChangeText={setFaultyRemark}
        />
        <Text style={styles.uploadLabel}>Proublem Type:</Text>
        <TextInput
          style={[styles.searchInput, {marginTop: 0, marginBottom: 10}]}
          placeholder="Enter Complaint Remarks"
          placeholderTextColor={'#888'}
          value={proublemType}
          readOnly={true}
          onChangeText={setproublemType}
        />
        <Text style={styles.uploadLabel}>Before Work Photos:</Text>
        <View style={styles.photoContainer}>
          {selectedPhotos.map((photo, index) => (
            <TouchableOpacity
              key={index}
              style={styles.photoSlot}
              onPress={() => handlePhotoSelect(index)}>
              {photo ? (
                <FastImage source={{uri: photo}} style={styles.photo} />
              ) : (
                <Text style={styles.placeholderText}>
                  Tap to Upload Photo{index + 1}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
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
          <TouchableOpacity
            style={styles.flightCard}
            onPress={() => {
              uploadFileB
                ? handleUploadButtonClick()
                : Alert.alert(
                    'Images are already uploaded',
                    'Images are already uploaded Please do not try to upload again',
                  );
            }}>
            <Text style={styles.flightPrice}>Upload Photo</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.uploadLabel}>Actual Remark:</Text>
        <TextInput
          style={[styles.searchInput, {marginTop: 0, marginBottom: 10}]}
          placeholder="Enter Actual Remarks"
          placeholderTextColor={'#888'}
          value={ActualRemark}
          onChangeText={setActualRemark}
        />
        <Text style={styles.uploadLabel}>Action Taken:</Text>
        <TextInput
          style={[styles.searchInput, {marginTop: 0, marginBottom: 10}]}
          placeholder="Enter Action Taken"
          placeholderTextColor={'#888'}
          value={replaceRemark}
          onChangeText={setReplaceRemark}
        />
        <Text style={styles.uploadLabel}>After Work Photos:</Text>
        <View style={styles.photoContainer}>
          {selectedPhotosAfter.map((photo, index) => (
            <TouchableOpacity
              key={index}
              style={styles.photoSlot}
              onPress={() => handlePhotoSelectAfter(index)}>
              {photo ? (
                <Image source={{uri: photo}} style={styles.photo} />
              ) : (
                <Text style={styles.placeholderText}>
                  {index < photoCaption.length
                    ? 'Tap to Upload ' + photoCaption[index] + ' Photo'
                    : 'Tap to Upload Photo'}
                </Text>
              )}
            </TouchableOpacity>
          ))}
          {selectedPhotosAfter.length < 20 && (
            <TouchableOpacity
              style={[styles.photoSlot, styles.addMoreButton]}
              onPress={() => {
                const updatedPhotos = [...selectedPhotosAfter, null];
                setSelectedPhotosAfter(updatedPhotos);
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
              onPress={() => handlePhotoSelectAfter(index, true)}>
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
          <TouchableOpacity
            style={styles.flightCard}
            onPress={() => {
              uploadFileA
                ? handleUploadAfter()
                : Alert.alert(
                    'Images are already uploaded',
                    'Images are already uploaded Please do not try to upload again',
                  );
            }}>
            <Text style={styles.flightPrice}>Upload Photo</Text>
          </TouchableOpacity>
        )}
        {/* <TouchableOpacity
          style={[styles.flightCard, {marginBottom: 50}]}
          onPress={() => {
            siteDetail();
          }}>
          <Text style={styles.flightPrice}>Site Detail</Text>
        </TouchableOpacity> */}
      </ScrollView>
    </>
  ) : (
    <NoInternet></NoInternet>
  );
};

export default RevisitService;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#fcad2e',
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
    fontFamily: 'AndadaPro-Regular',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
    color: '#666',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 2},
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
    color: '#888',
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
    textAlign: 'center',
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
    fontFamily: 'AndadaPro-Regular',
    color: '#fff',
    textAlign: 'center',
  },
  modalSearchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
    color: '#333', // ✅ added — was missing, typed text had no explicit color
  },
  dropdownButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 12,
    backgroundColor: '#fff',
  },
  dropdownText: {
    // ✅ added — was completely missing, this is why selected label was invisible
    color: '#333',
    fontSize: 15,
  },
  disabled: {
    backgroundColor: '#f0f0f0',
  },
  modalContainer: {
    flex: 1,
    padding: 16,
    paddingTop: 48,
    backgroundColor: '#fff',
  },
  itemRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemText: {
    color: '#333',
    fontSize: 15,
  },
  closeButton: {
    marginTop: 12,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
  },
  closeButtonText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#888',
  },
});
