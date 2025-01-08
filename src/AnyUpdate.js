import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, Image, StatusBar } from 'react-native';
import React, { useState } from 'react';
import Back from '../assets/svg/drop.svg';
import { useNavigation } from '@react-navigation/native';
const AnyUpdate = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedPhotos, setSelectedPhotos] = useState([null, null, null, null, null]);
  const navigation=useNavigation();
  const options = ['Option 1', 'Option 2', 'Option 3', 'Option 4', 'Option 5'];

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePhotoSelect = (index) => {
    let newPhotos = [...selectedPhotos];
    newPhotos[index] = 'https://via.placeholder.com/100';
    setSelectedPhotos(newPhotos);
  };

  return (
    <>
      <StatusBar translucent={true} backgroundColor="transparent" barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
         <Back width={24} height={24}  rotation={90} fill={'white'}></Back>
        </TouchableOpacity>
        <Text style={styles.headerText}>Any Update</Text>
      </View>

      <View style={styles.container}>
        <Text  style={{color:'black'}}>No Update Found</Text>
      </View>
    </>
  );
};

export default AnyUpdate;

const styles = StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingTop: StatusBar.currentHeight,
      paddingBottom: 20,
      paddingTop:66,
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
      paddingLeft:8
    },
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: '#f7f7f7',
      justifyContent:'center',
      alignItems:'center'
    },
  
  });
  