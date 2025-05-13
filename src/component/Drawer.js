import { StyleSheet, View, Dimensions, TouchableOpacity, Animated, Easing, Text, Image, Pressable } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import Avatar from '../../assets/svg/avatar.svg';

import ViewProfile from '../../assets/svg/view.svg';
import Logout from '../../assets/svg/logout.svg';
import DrawerItem from './DrawerItem';
import Help from '../../assets/svg/help.svg'
import Language from '../../assets/svg/language.svg'
import Privacy from '../../assets/svg/policy.svg'
import Close from '../../assets/svg/cross.svg'
import User from '../../assets/svg/showpassword.svg'
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const { height } = Dimensions.get('window');

const Drawer = ({ onClose, data }) => {
  const slideAnim = useRef(new Animated.Value(width)).current;
  const navigation = useNavigation();
  const [logoutClose, setLogout] = useState(false);
  const [profile, setProfile] = useState(data);
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      easing: Easing.ease,
      useNativeDriver: false,
    }).start();
  }, [slideAnim]);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: width,
      duration: 300,
      easing: Easing.ease,
      useNativeDriver: false,
    }).start(onClose);
  };

  const logOut = async () => {
    try {
      await AsyncStorage.removeItem('userData');
      await AsyncStorage.removeItem('uploadData');
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error("Error during logout:", error);
      Alert.alert("Logout Failed", "An error occurred while logging out. Please try again.");
    }
  };


  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleClose} style={styles.backdrop}>
        <View></View>
      </TouchableOpacity>
      <Animated.View style={[styles.drawer, { transform: [{ translateX: slideAnim }] }]}>
        <TouchableOpacity style={{
          padding: 60,
          justifyContent: 'center',
          alignItems: 'center',
          elevation: 0.5,
          paddingBottom: 30
        }}>
          <Avatar
            width={100}
            height={100}
            style={{ borderRadius: 25 }} />
          <Text style={styles.subtitle}>Hii {profile.name}</Text></TouchableOpacity>
        <TouchableOpacity style={styles.iteam} onPress={() => { navigation.navigate('Profile', { profile }); }}>
          <ViewProfile width={20} height={20}></ViewProfile>
          <View style={{ alignItems: 'center', marginLeft: 20 }}>
            <Text style={styles.level}>View Profile</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.iteam}>
          <User width={20} height={20} fill={'white'}></User>
          <View style={{ alignItems: 'center', marginLeft: 20 }}>
            <Text style={styles.level}>Level</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.iteam}>
          <Help width={20} height={20} fill={'white'}></Help>
          <View style={{ alignItems: 'center', marginLeft: 20 }}>
            <Text style={styles.level}>Help</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.iteam} onPress={() => { navigation.navigate('Privacy') }}>
          <Privacy width={20} height={20} fill={'white'}></Privacy>
          <View style={{ alignItems: 'center', marginLeft: 20 }}>
            <Text style={styles.level}>Privacy & policy</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.iteam} onPress={() => { setLogout(!logoutClose) }}>
          <Logout width={20} height={20} fill={'white'}></Logout>
          <View style={{ alignItems: 'center', marginLeft: 20 }}>
            <Text style={styles.level}>Log out</Text>
          </View>
        </TouchableOpacity>

      </Animated.View>
      {logoutClose && <View style={styles.logoutcard}>
        <View style={styles.innercard}>
          <TouchableOpacity style={styles.closeButton} onPress={() => { setLogout(!logoutClose) }}>
            <Close width={30} height={30} />
          </TouchableOpacity>
          <View style={styles.imageWrapper}>
            <Image
              alt="App Logo"
              resizeMode="contain"
              style={styles.headerImg}
              source={require('../../assets/sadpng.png')}
            />
          </View>
          <Text style={{ fontFamily: 'Prociono-Regular' ,color:'#333'}}>Are You Sure to logout?</Text>
          <View style={{ flexDirection: 'row', marginTop: 10 }}>
            <TouchableOpacity style={{ backgroundColor: 'red', padding: 12, borderRadius: 8, marginLeft: 2, marginRight: 2, width: 70, height: 40, justifyContent: 'center', alignItems: 'center' }} onPress={() => {
              logOut();
            }}>
              <Text style={{ color: 'white', textAlign: 'center', fontFamily: 'Prociono-Regular' }}>Yes</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ backgroundColor: 'green', padding: 12, borderRadius: 8, marginLeft: 2, marginRight: 2, width: 70, height: 40 }} onPress={() => { setLogout(!logoutClose) }}>
              <Text style={{ color: 'white', textAlign: 'center', fontFamily: 'Prociono-Regular' }}>No</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>}
    </View>
  );
};

export default Drawer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  drawer: {
    backgroundColor: '#fff',
    width: width / 1.6,
    height: '100%',
    position: 'absolute',
    right: 0,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: 'Prociono-Regular',
    color: '#929292',
    padding: 10
  },
  iteam: {
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fcad2e',
    margin: 6,
    borderRadius: 38,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutcard: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Slight overlay to give focus to the card
    flex: 1,
    width: '100%',
    height: '100%',
  },
  innercard: {
    width: width / 1.5,
    height: height / 3,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    justifyContent: 'center', // Centers the content vertically
    alignItems: 'center', // Centers the content horizontally
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1, // Ensures the close button stays on top
  },
  imageWrapper: {
    justifyContent: 'center',
    alignItems: 'center',

  },
  headerImg: {
    width: width / 2.5,
    height: height / 7,
    resizeMode: 'cover'
  },
  level: { fontSize: 16, color: 'white', fontFamily: 'Prociono-Regular' }


});
