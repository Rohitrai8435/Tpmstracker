import { Alert, StyleSheet, Text, View, TextInput, TouchableOpacity, StatusBar } from 'react-native';
import React, { useEffect, useState } from 'react';
import Back from '../../assets/svg/drop.svg';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { pendingRemarkApi } from '../service/ApiService';

const PendingRemark = () => {
  const navigation = useNavigation();
  const [id, setId] = useState('');
  const route = useRoute();
  const { item, color } = route.params;
  const [remark, setRemark] = useState(''); 
  useEffect(() => {
    const fetchUserData = async () => {
      const userData = await AsyncStorage.getItem('userData');
      if (!userData) {
        console.error("User data not found.");
        return;
      }
      const parsedData = JSON.parse(userData);
      const userId = parsedData?.id;
      setId(userId);
    };
    fetchUserData();
  }, []);

  const submitPendingRemark = async () => {
    if (!remark.trim()) {
      Alert.alert('Error', 'Please enter a valid pending remark.');
      return;
    }
    try {
      const response = await pendingRemarkApi(item.unique_id, remark, id);
      console.log(response);
      if (response.status) {
        Alert.alert('Success',response.message);
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while submitting the remark.');
      console.error(error);
    }
  };
  return (
    <>
      <StatusBar translucent={true} backgroundColor="transparent" barStyle="dark-content" />
      <View style={[styles.header, { backgroundColor: color }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Back width={24} height={24} rotation={90} fill={'white'} />
        </TouchableOpacity>
        <Text style={styles.headerText}>Pending Remark</Text>
      </View>
      <View style={styles.container}>
        <Text style={styles.label}>Pending Remark</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Enter pending remark..."
          placeholderTextColor="#999"
          value={remark}
          onChangeText={setRemark}
        />
        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: color }]}
          onPress={submitPendingRemark}>
          <Text style={styles.submitButtonText}>Submit</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

export default PendingRemark;

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
  label: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  textInput: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  submitButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
