import { Image, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import accountlogo from "../assets/accountlogo.png";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Animatable from 'react-native-animatable';
import NoInternet from "./NoInternet";
import NetInfo from '@react-native-community/netinfo';
import Orientation from "react-native-orientation-locker";
import { useNavigation } from "@react-navigation/native";
import { getLogin } from "./service/ApiService";

const Splash = () => {
  const [isConnected, setIsConnected] = useState(true);
  const navigation = useNavigation();
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });
    return () => {
      unsubscribe();
    };
  }, []);
  useEffect(() => {
    Orientation.lockToPortrait();
  }, []);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const userData = await AsyncStorage.getItem('userData');
        const data = JSON.parse(userData);
        const {id,password,mobile} =data;
        console.log(data);
        if (data) {
          try {
            const loginField = password ? password : mobile; 
            const response = await  getLogin(id,loginField);
             if(response.status === 'success'){
             navigation.replace('BookingScreen');
             }else if(isConnected){
               await AsyncStorage.removeItem('userData');
               navigation.replace('Login');
              }
          }
            catch (error) {
          }
        } else {
          navigation.replace('Login');
        }
      } catch (error) {
        navigation.replace('Login');
      }
    };
    setTimeout(() => {
      checkLoginStatus();
    }, 2000);
  }, [navigation,isConnected]);

  return (
    isConnected ? (
      <View style={styles.container}>
        <Animatable.Image
          source={accountlogo}
          style={styles.logo}
          duration={2000}
          animation="zoomIn"
        />
        <Animatable.Text
          style={styles.text}
          duration={2000}
          animation="bounceInDown"
        >
          {"Welcome to Shroti Telecom \n Pvt Ltd"}
        </Animatable.Text>
      </View>
    ) : (
      <NoInternet />
    )
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'black',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    height: 120,
    width: 120,
  },
  text: {
    color: 'white',
    fontSize: 24,
    fontWeight: '200',
    textAlign: 'center',
  },
});

export default Splash;
