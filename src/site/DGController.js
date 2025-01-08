import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform, Alert, Vibration, ActivityIndicator } from 'react-native';
import Drop from '../../assets/svg/drop.svg';
import Stop from "../../assets/stop.png";
import Start from "../../assets/start.png";
import * as Animatable from 'react-native-animatable';
import HapticFeedback from 'react-native-haptic-feedback';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import { err } from 'react-native-svg';
import { dg_on_off, getSiteDetail, getSiteDetailV2 } from '../service/ApiService';
import CustomSwitch from './CustomSwitch';

const DGController = ({ name, mode, source, imei, dg,autocall}) => {
  const [initial, setRotation] = useState(0);
  const [siteSource, setSource] = useState(null);
  const [loading, setLoading] = useState(false); // State for controlling progress bar
 
  const handle = () => {
    if (initial === 0) {
      setRotation(180);
    } else {
      setRotation(0);
    }
  };

  useEffect(() => {
    setSource(source);
  }, [source]);

  const showToast = (message) => {
    Toast.show({
      type: 'info',
      text1: message,
      position: 'bottom',
    });
  };

  const handlePress = (value) => {
    if (HapticFeedback) {
      HapticFeedback.trigger('impactLight', {
        enableVibrateFallback: true,
        ignoreAndroidSystemSettings: false,
      });
    }else {
      if (Platform.OS === 'android') {
        Vibration.vibrate(100);
      } else {
        Alert.alert('Haptic feedback not available');
      }
    }

    if ((siteSource == "SOEB" || siteSource == "SOBT") && value == 'start') {
      dgcontrolapi('1', imei, 'SODG');
      
    } else if (siteSource == "SODG" && value == 'stop') {
      dgcontrolapi('0', imei, 'SOEB');
    } else if (siteSource == "SODG" && value == 'start') {
      showToast('DG is already in Start State');
    } else if (siteSource == "SOBT" || siteSource == "SOEB" && value == 'stop') {
      showToast('DG is already in OFF State');
    }
  };

  const dgcontrolapi = async (status, imei, s) => {
    try {
     setLoading(true); // Show progress bar
      showToast('Status is updating...');
      const response = await dg_on_off(imei, status);
      if (response.data) {
        setTimeout(() => {
          setLoading(false); 
          
          //if (status == '1') {
          //  dg(s);
            autocall();
            if (status == '1'){
              if(siteSource == 'SODG'){
                showToast('Site status is updated successfully');
              }else{
                showToast('Fail to update site status');
              }
            } else if (status == '0'){
               if(siteSource == 'SOEB' || siteSource == 'SOBT'){
                showToast('Site status is updated successfully');
               }else{
                showToast('Fail to update site status');
               }
            }
            setLoading(false);
          //} else {
            //  v4();
        //  }
        }, 30000);  
      } else {
        setLoading(false);
        showToast('Failed to update status.');
      }
    } catch (error) {
      setLoading(false); 
      showToast('Failed to update status.');
    }
  };
  
   useEffect(()=>{
    const interval = setInterval(v4, 20000);
    return () => clearInterval(interval);
   },[]);

  const v4 = async () => {
    try {
      autocall();
    } catch (error) {
      console.error('Error getting site details:', error);
    }
  };

  return (
    <View>
      
      <TouchableOpacity onPress={handle}>
        <Animatable.View style={[styles.container, { backgroundColor: mode ? '#232323' : '#0a478f' }]} duration={2000} animation={"rubberBand"}>
          <View>
            <Text style={styles.title}>{name}</Text>
          </View>
          <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'flex-end' }}>
            <Drop width={18} height={18} fill={'white'} rotation={initial} />
          </View>
        </Animatable.View>
      </TouchableOpacity>
      {initial === 180 && (
      <View style={{marginLeft:18,marginRight:18,justifyContent:'space-between',alignItems:'center',marginTop:18, flexDirection:'row',marginBottom:10,borderRadius:40,padding:5, borderWidth: 2,
        borderColor: '#ade8f4'}}>
        <Text style={{marginLeft:18,fontSize:14 ,fontFamily:'AndadaPro-Regular', color:mode?'white':'black'}}>DG Auto / Manual </Text>
     <CustomSwitch imei={imei} ></CustomSwitch>
      
      </View>)}
      {initial === 180 && (
        <View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={() => handlePress('start')}>
              <Animatable.Image
                source={Start}
                style={styles.image}
                duration={1000}
                animation="zoomIn"
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handlePress('stop')}>
              <Animatable.Image
                source={Stop}
                style={styles.image}
                duration={2000}
                animation="zoomIn"
              />
            </TouchableOpacity>
          </View>
          <View style={styles.statusContainer}>
            <Text style={[styles.title, { color: mode ? 'white' : 'black' }]}>DG Current Status :</Text>
            <Text style={[styles.title, { color: mode ? 'white' : 'black' }]}>{siteSource == 'SODG' ? 'DG ON' : 'DG OFF'}</Text>
          </View>
        </View>
      )}
    
      {loading && (
        <View style={styles.progressBarContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}
      <Toast ref={(ref) => Toast.setRef(ref)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#0a478f',
    borderRadius: 38,
    marginLeft: 10,
    marginTop: 8,
    marginRight: 10,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'AndadaPro-Regular',
  },
  buttonContainer: {
    justifyContent: 'space-evenly',
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 18,
    marginRight: 18,
    marginTop: 6,
  },
  image: {
    height: 160,
    width: 160,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 18,
    marginRight: 18,
    marginTop: 6,
    justifyContent: 'center',
  },
  progressBarContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
   switch: {
    width: 100,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  switchOn: {
    backgroundColor: '#4caf50',
    borderColor: '#4caf50',
  },
  switchOff: {
    backgroundColor: '#f44336',
    borderColor: '#f44336',
  },
  switchText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default DGController;
