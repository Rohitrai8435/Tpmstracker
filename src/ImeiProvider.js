import React, {createContext, useState, useEffect} from 'react';
import {Alert} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import {getImei} from './service/ApiService';

// Create context
export const ImeiContext = createContext();

// Create a provider component
export const ImeiProvider = ({children}) => {
  const [options, setOptions] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Listen to network status changes
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
      console.log(isConnected);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const fetchImei = async () => {
    try {
      const response = await getImei();
      console.log('IMEI Response Status:', response.status);
      if (response.status === 'success') {
        setOptions(response.data);
      } else {
        Alert.alert('Error', response.message || 'Unknown error');
      }
    } catch (error) {
      Alert.alert('Fetch global_id Error:', `${error}`);
    }
  };

  // Fetch IMEI data only when internet is connected
  useEffect(() => {
    if (isConnected) {
      fetchImei();
    }
  }, [isConnected]); // Re-run this effect when `isConnected` changes

  return (
    <ImeiContext.Provider value={{options}}>{children}</ImeiContext.Provider>
  );
};
