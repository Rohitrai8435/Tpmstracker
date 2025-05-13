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
  ToastAndroid,
  Clipboard,
  ActivityIndicator,
  Modal,
  Linking,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import Back from '../../assets/svg/drop.svg';
import {useNavigation, useRoute} from '@react-navigation/native';
import {launchCamera} from 'react-native-image-picker';
import {
  closeRequest,
  getDetailOfCard,
  updatephotos,
} from '../service/ApiService';
import FastImage from 'react-native-fast-image';
import axios from 'axios';
import EditIcon from '../../assets/svg/edit.svg';
import RNFS from 'react-native-fs';

const IncScreen = () => {
  const navigation = useNavigation();
  const [version, setVersion] = useState(null);
  const [beforeList, setBeforeList] = useState([]);
  const [afterList, setAfterList] = useState([]);
  const [wcc, setWcc] = useState([]);
  const route = useRoute();
  const {item, color} = route.params;
  console.log(item);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState({
    imageUrl: null,
    time: null,
  });
  const [isEditable, setIsEditable] = useState(false);
  const [itemState, setItemState] = useState(false);
  const [updatedPhotos, setUpdatedPhotos] = useState([]);
  // const [selectedPhotos, setSelectedPhotos] = useState([null]);
  // const [selectedPhotosAfter, setSelectedPhotosAfter] = useState([null]);
  const [loading, setLoading] = useState(false);
  const [wccudt, setWccudt] = useState([]);
  const [visitRemark, setvisitRemark] = useState('');
  const [AfterRemark, setAfterRemark] = useState('');
  const [ActualRemark, setActualRemark] = useState('');
  const [service_type, Setservice_type] = useState('');
  const [unique_id, setunique_id] = useState('');


  const [selectedPhotos, setSelectedPhotos] = useState([
    {uri: null, type: 'Before'},
  ]);
  const [selectedPhotosAfter, setSelectedPhotosAfter] = useState([
    {uri: null, type: 'After'},
  ]);

  // console.log(item, 'todo');
  useEffect(() => {
    if (item.request_close_time == null) {
      setItemState(true);
    }

    setvisitRemark(item?.before_remark);
    setAfterRemark(item?.after_remark);
    setActualRemark(item?.actualRemark);
    Setservice_type(item?.service_type);
    setunique_id(item?.unique_id);
  }, [item.request_close_time]);

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
      console.log('Date parsing error:', error.message);
      return 'Invalid date';
    }
  };
  const handleImagePress = (imageUrl, imageTime) => {
    const formattedTime = formatDateTime(imageTime);
    setSelectedImage({imageUrl, time: formattedTime});
    setIsModalVisible(true);
  };

  const handleConsole = (id, oldimageurl, unique_id) => {
    launchCamera({mediaType: 'photo', quality: 0.3}, async response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorMessage) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else {
        const uri = response.assets[0].uri;

        try {
          // Convert image file to Base64
          const base64Image = await RNFS.readFile(uri, 'base64');
          const imageData = `data:image/jpeg;base64,${base64Image}`;

          // Update state with Base64 image instead of file URI
          setUpdatedPhotos(
            prevPhotos =>
              prevPhotos.some(p => p.id === id)
                ? prevPhotos.map(p =>
                    p.id === id
                      ? {id, imageurl: imageData, oldimageurl, unique_id}
                      : p,
                  ) // Replace existing entry
                : [
                    ...prevPhotos,
                    {id, imageurl: imageData, oldimageurl, unique_id},
                  ], // Add new entry if not found
          );

          // console.log('Updated Photos:', updatedPhotos);
        } catch (error) {
          console.log('Error converting image to base64:', error);
        }
      }
    });
  };
  const handleclickwcc = (id, oldimageurl, unique_id) => {
    launchCamera({mediaType: 'photo', quality: 0.3}, async response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorMessage) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else {
        const uri = response.assets[0].uri;

        try {
          // Convert image file to Base64
          const base64Image = await RNFS.readFile(uri, 'base64');
          const imageData = `data:image/jpeg;base64,${base64Image}`;

          // Update state with base64 data instead of file URI
          setWccudt(
            prevPhotos =>
              prevPhotos.some(p => p.id === id)
                ? prevPhotos.map(p =>
                    p.id === id
                      ? {id, imageurl: imageData, oldimageurl, unique_id}
                      : p,
                  ) // Replace existing entry
                : [
                    ...prevPhotos,
                    {id, imageurl: imageData, oldimageurl, unique_id},
                  ], // Add new entry
          );

          console.log('Updated WCC Images:', wccudt);
        } catch (error) {
          console.log('Error converting image to base64:', error);
        }
      }
    });
  };

  const controller = new AbortController();
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getDetailOfCard(
          item.unique_id,
          item.imei,
          controller.signal,
        );

        setVersion(response.dataVersion[0]?.version);
        setWcc(response.wcc);
        // console.log(response.wcc);
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
        // console.log(beforeItems);
        setAfterList(afterItems);
        //  console.log(afterItems);
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

  const handleEdit = () => {
    if (isEditable) {
      setIsEditable(false);
    } else {
      setIsEditable(true);
    }
  };
  const copyToClipboard = text => {
    Clipboard.setString(text);
    ToastAndroid.show('Copy', ToastAndroid.SHORT);
  };
  const makeCall = number => {
    const url = `tel:${number}`;
    Linking.openURL(url).catch(err => console.log('Error opening dialer', err));
  };
  const addPhotoToBox = (index, type) => {
    console.log('nkj', type);
    launchCamera({mediaType: 'photo', quality: 0.3}, async response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorMessage) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else {
        const uri = response.assets?.[0]?.uri;
        if (uri) {
          const base64Image = await RNFS.readFile(uri, 'base64');
          const imageData = `data:image/jpeg;base64,${base64Image}`;
          const updatedPhotos = [...selectedPhotos];
          updatedPhotos[index] = {uri, type, imageData};

          if (index === selectedPhotos.length - 1) {
            updatedPhotos.push({uri: null, type, imageData});
          }

          setSelectedPhotos(updatedPhotos);
        }
      }
    });
  };
  const addPhotoToBoxAfter = (index, type) => {
    console.log(type);
    launchCamera({mediaType: 'photo', quality: 0.3}, async response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorMessage) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else {
        const uri = response.assets?.[0]?.uri;
        if (uri) {
          const base64Image = await RNFS.readFile(uri, 'base64');
          const imageData = `data:image/jpeg;base64,${base64Image}`;
          const updatedPhotos = [...selectedPhotosAfter];
          updatedPhotos[index] = {uri, type, imageData};

          // Add new empty slot if last box was just filled
          if (index === selectedPhotosAfter.length - 1) {
            updatedPhotos.push({uri: null, type, imageData});
          }

          setSelectedPhotosAfter(updatedPhotos);
        }
      }
    });
  };
  const handleEditsite = async () => {
    try {
      setLoading(true); // Show loader

      console.log('API call started...');
      // Remove null values from the arrays
      const cleanedSelectedPhotos = selectedPhotos.filter(
        photo => photo.uri !== null,
      );
      const cleanedSelectedPhotosAfter = selectedPhotosAfter.filter(
        photo => photo.uri !== null,
      );

      // Call the API function
      const response = await updatephotos(
        updatedPhotos,
        wccudt,
        cleanedSelectedPhotos,
        cleanedSelectedPhotosAfter,
        visitRemark,
        AfterRemark,
        ActualRemark,
        unique_id,
        service_type,
      );

      if (response.status) {
        navigation.navigate('BookingScreen');
        
        Alert.alert('Updated Succesfully');
      } else {
        console.log('Response data is missing.');
      }
    } catch (error) {
      console.log('Error updating images:', error);
      Alert.alert('An error occurred while updating images.');
    } finally {
      setLoading(false); // Hide loader
      setIsEditable(false);
    }
  };
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
        <View style={styles.statusbarsection}>
          <Text style={styles.headerText}>SITE DETAIL</Text>

          {itemState && (
            <View>
              <TouchableOpacity onPress={handleEdit}>
                <View style={styles.editButton}>
                  <EditIcon width={28} height={28} />
                </View>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
      <ScrollView style={styles.container}>
        <View style={styles.option}>
          <View style={styles.row}>
            <Text style={styles.title}>IMEI</Text>
            <Text
              style={styles.value}
              onLongPress={() => copyToClipboard(item.imei)}>
              {item.imei}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.title}>Site Name:</Text>
            <Text
              style={styles.value}
              onLongPress={() => copyToClipboard(item.site_name)}>
              {item.site_name}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.title}>Site id:</Text>
            <Text
              style={styles.value}
              onLongPress={() => copyToClipboard(item.site_id)}>
              {item.site_id}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.title}>Site Technician Name:</Text>
            <Text
              style={styles.value}
              onLongPress={() => copyToClipboard(item.technician_name)}>
              {item.technician_name}
            </Text>
          </View>
          {item.remark_soc && (
            <View style={styles.row}>
              <Text style={styles.title}>Remark by soc:</Text>
              <Text style={styles.value}>{item.remark_soc}</Text>
            </View>
          )}
          <View style={styles.row}>
            <Text style={styles.title}>Site Technician Mobile:</Text>
            <Text
              style={[styles.value, styles.link]}
              onPress={() => makeCall(item.technician_mobile)}
              onLongPress={() => copyToClipboard(item.technician_mobile)}>
              {item.technician_mobile}
            </Text>
          </View>
        </View>

        {wcc && wcc.length > 0 && (
          <>
            <Text style={styles.uploadLabel}>
              WCC IMAGE && User with PPE kit
            </Text>
            <View style={styles.photoContainer}>
              {wcc.map((photo, index) => {
                // Check if the photo has an updated image
                const updatedPhoto = wccudt.find(p => p.id === photo.id);
                const imageUri = updatedPhoto
                  ? updatedPhoto.imageurl
                  : photo.image_urls;

                return (
                  <TouchableOpacity
                    key={index}
                    style={styles.photoSlot}
                    onPress={() =>
                      !isEditable
                        ? handleImagePress(photo.image_urls, item.insert_time)
                        : handleclickwcc(
                            photo.id,
                            photo.image_urls,
                            item.unique_id,
                          )
                    }>
                    <FastImage
                      source={{uri: imageUri}}
                      style={styles.photo}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}
        {service_type == 'Revisit' && (
          <>
            <Text style={styles.uploadLabel}>Complaine Remark</Text>
            <TextInput
              style={[styles.searchInput, {marginTop: 0, marginBottom: 10}]}
              placeholder="Enter Complain Remarks"
              placeholderTextColor={'#888'}
              value={visitRemark}
              editable={isEditable}
              onChangeText={text => setvisitRemark(text)}
            />
          </>
        )}
        <Text style={styles.uploadLabel}>
          {beforeList.length > 0 && beforeList[0].type ? 'Before:' : 'Photo:'}
        </Text>
        <View style={styles.photoContainer}>
          {beforeList.length > 0 ? (
            beforeList.map((photo, index) => {
              // Check if the photo has been updated
              const updatedPhoto = updatedPhotos.find(p => p.id === photo.id);
              const imageUri = updatedPhoto
                ? updatedPhoto.imageurl
                : photo.image_urls;

              return (
                <>
                  <TouchableOpacity
                    key={index}
                    style={styles.photoSlot}
                    onPress={() =>
                      !isEditable
                        ? handleImagePress(photo.image_urls, photo.time)
                        : handleConsole(
                            photo.id,
                            photo.image_urls,
                            item.unique_id,
                          )
                    }>
                    <FastImage
                      source={{uri: imageUri}}
                      style={styles.photo}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                </>
              );
            })
          ) : (
            <Text style={styles.placeholderText}>No photos available</Text>
          )}
        </View>
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
          }}>
          {isEditable &&
            selectedPhotos.map((photo, index) => (
              <TouchableOpacity
                key={photo?.uri || `empty-before-${index}`}
                style={styles.photoSlot}
                onPress={() => addPhotoToBox(index, beforeList[0].type)}>
                {photo?.uri ? (
                  <FastImage
                    source={{uri: photo.uri}}
                    style={styles.photo}
                    resizeMode="cover"
                  />
                ) : (
                  <Text style={[styles.addMoreText, {color: 'orange'}]}>
                    Tap to add photo
                  </Text>
                )}
              </TouchableOpacity>
            ))}
        </View>
        {service_type === 'Revisit' && (
          <>
            <Text style={styles.uploadLabel}>Action Taken</Text>
            <TextInput
              style={[styles.searchInput, {marginTop: 0, marginBottom: 10}]}
              placeholder="Enter Action Taken"
              placeholderTextColor="#888"
              value={AfterRemark}
              editable={isEditable}
              onChangeText={text => setAfterRemark(text)}
            />
            <Text style={styles.uploadLabel}>Actual Remark</Text>
            <TextInput
              style={[styles.searchInput, {marginTop: 0, marginBottom: 10}]}
              placeholder="Enter Actual Remark"
              placeholderTextColor="#888"
              value={ActualRemark}
              editable={isEditable}
              onChangeText={text => setActualRemark(text)}
            />

            {afterList?.length > 0 ? (
              <View>
                <Text style={styles.uploadLabel}>After:</Text>
                <View style={styles.photoContainer}>
                  {afterList.map((item, index) => {
                    const updatedPhoto = updatedPhotos?.find(
                      p => p.id === item.id,
                    );
                    const imageUri = updatedPhoto
                      ? updatedPhoto.imageurl
                      : item.image_urls;

                    return (
                      <TouchableOpacity
                        key={item.id || index}
                        style={styles.photoSlot}
                        onPress={() =>
                          !isEditable
                            ? handleImagePress(imageUri, item.time)
                            : handleConsole(item.id, item.image_urls)
                        }>
                        <FastImage
                          source={{uri: imageUri}}
                          style={styles.photo}
                          resizeMode="cover"
                        />
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ) : (
              <Text style={styles.uploadLabel}>No After Photo available</Text>
            )}

            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
              }}>
              {isEditable &&
                selectedPhotosAfter?.map((photo, index) => (
                  <TouchableOpacity
                    key={photo?.uri || `empty-${index}`}
                    style={styles.photoSlot}
                    onPress={() => addPhotoToBoxAfter(index, 'After')}>
                    {photo?.uri ? (
                      <FastImage
                        source={{uri: photo.uri}}
                        style={styles.photo}
                        resizeMode="cover"
                      />
                    ) : (
                      <Text style={[styles.addMoreText, {color: 'orange'}]}>
                        Tap to add photo
                      </Text>
                    )}
                  </TouchableOpacity>
                ))}
            </View>
          </>
        )}
        {isEditable && (
          <TouchableOpacity style={[styles.editesite]} onPress={handleEditsite}>
            <Text style={styles.flightPrice}>Update photo</Text>
          </TouchableOpacity>
        )}
        {!isEditable && (
          <TouchableOpacity
            style={[styles.flightCard, {backgroundColor: color}]}
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
        )}

        <View style={{marginBottom: 30}}></View>
      </ScrollView>
      {/* Loader Overlay */}
      {loading && (
        <Modal transparent={true} animationType="fade">
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
            }}>
            <ActivityIndicator size="large" color="#ffffff" />
            <Text style={{color: '#fff', marginTop: 10}}>
              Updating Images...
            </Text>
          </View>
        </Modal>
      )}
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
export default IncScreen;
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
  statusbarsection: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 50,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {width: 2, height: 3},
    shadowOpacity: 0.55,
    shadowRadius: 4.84,
    elevation: 5,
  },
  editesite: {
    backgroundColor: 'green',
    padding: 16,
    borderRadius: 10,
    marginBottom: 20,
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
  link: {
    color: '#007BFF',
    textDecorationLine: 'underline',
  },
});
