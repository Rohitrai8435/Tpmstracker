import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const Card = ({ svgSource, count, color, click, data }) => {
  const [name, setName] = useState(click);
  const navigation = useNavigation();

  const handlePress = () => {
    if (data && data.length > 0) {
      navigation.navigate(name, { data });
    } else {
      console.log('Data is empty, navigation prevented.');
    }
  };

  return (
    <TouchableOpacity
      style={{ justifyContent: 'center', alignItems: 'center' }}
      onPress={handlePress}
    >
      <View style={[styles.card, { backgroundColor: color }]}>
        <View style={styles.imageContainer}>{svgSource}</View>
      </View>
      <Text style={styles.countText}>{count}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 'auto',
    height: 'auto',
    backgroundColor: '#f0f4ff',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  countText: {
    color: '#333',
    textAlign: 'center',
    fontFamily: 'Prociono-Regular',
    
  },
});

export default Card;
