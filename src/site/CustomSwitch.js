import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { auto_manual_show, auto_manul } from '../service/ApiService';
import Toast from 'react-native-toast-message';
const CustomSwitch = ({ imei }) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const animatedValue = useRef(new Animated.Value(0)).current;

  const toggleSwitch = () => {
    const newValue = !isEnabled;
    setIsEnabled(newValue);
    updateAuto_manual(newValue ? 1 : 0); // Call API with the correct value
    Animated.timing(animatedValue, {
      toValue: newValue ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const switchInterpolation = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 52],
  });

  const showToast = (message) => {
    Toast.show({
      type: 'info',
      text1: message,
      position: 'bottom',
    });
  };
  const backgroundColorInterpolation = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#f44336', '#4caf50'],
  });

  const showauto = async () => {
    try {
      const response = await auto_manual_show(imei);
      if (response.status) {
        setIsEnabled(true);
        animatedValue.setValue(1);
      } else {
        setIsEnabled(false);
        animatedValue.setValue(0);
      }
    } catch (error) {
      console.error('Error fetching auto/manual status:', error);
    }
  };

  const updateAuto_manual = async (value) => {
    try {
      const response = await auto_manul(imei, value);
      showToast('Status change successfully');
    } catch (error) {
      console.error('Error updating auto/manual status:', error);
    }
  };

  useEffect(() => {
    if (imei) {
      showauto();
    }
  }, [imei]);

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={toggleSwitch} activeOpacity={1}>
        <Animated.View style={[styles.switch, { backgroundColor: backgroundColorInterpolation }]}>
          <View style={styles.switchLabels}>
            <Text style={[styles.switchLabel, { color: isEnabled ? 'white' : 'black'}]}>Auto</Text>
            <Text style={[styles.switchLabel, { color: isEnabled ? 'black' : 'white'}]}>Manual</Text>
          </View>
          <Animated.View
            style={[
              styles.switchThumb,
              { transform: [{ translateX: switchInterpolation }] },
            ]}
          />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
   
  },
  switch: {
    width: 120,
    height: 50,
    borderRadius: 30,
    justifyContent: 'center',
    padding: 2,
    borderWidth: 2,
    borderColor: '#ccc',
    position: 'relative',
  },
  switchLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    width: '100%',
    paddingHorizontal: 9,
   
  },
  switchLabel: {
    fontSize: 12,
     fontFamily:'AndadaPro-Regular'
  },
  switchThumb: {
    width: 60,
    height: 46,
    borderRadius: 28,
    backgroundColor: 'white',
    position: 'absolute',
    top: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CustomSwitch;
