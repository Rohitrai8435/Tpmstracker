import { StyleSheet, Text, View, ScrollView, StatusBar, Dimensions, SafeAreaView, TouchableOpacity } from 'react-native';
import React from 'react';
import Avatar from '../assets/svg/avatar.svg';
import Back from '../assets/svg/drop.svg';
import { useNavigation, useRoute } from '@react-navigation/native';
const { width, height } = Dimensions.get('window');
const Profile = ({data}) => {
  const route = useRoute();
  const {profile} = route.params;
  // console.log(route);
  const navigation=useNavigation();
  const profileData = [
    { key: 'Name', value: profile.name ? profile.name.charAt(0).toUpperCase()+profile.name.slice(1) : 'Not Available' },
  { key: 'Email', value: profile.email || 'Not Available' },
  { key: 'Phone', value: profile.mobile || 'Not Available' },
  { key: 'Occupation', value: profile.designation ? profile.designation.charAt(0).toUpperCase() + profile.designation.slice(1) : 'Not Available' },
  { key: 'Company', value: 'Shroti Telecome Pvt. Ltd' },
  ];
  const formattedProfileDetails = profileData.map(item => ({
    key: item.key.charAt(0).toUpperCase() + item.key.slice(1),
    value: item.value
  }));
  
  return (
    <>
      <StatusBar translucent={true} backgroundColor="transparent" barStyle="dark-content" />
      <View style={styles.headerP}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
         <Back width={24} height={24}  rotation={90} fill={'white'}></Back>
        </TouchableOpacity>
        <Text style={styles.headerText}>PROFILE</Text>
      </View>
      <SafeAreaView style={styles.container}>
        <View style={styles.profileHeader}>
          <Avatar width={width * 0.4} height={width * 0.4} style={styles.avatar} />
          <Text style={styles.subtitle}>Hii {profile.name}</Text>
        </View>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.profileDetails}>
            {profileData.map((item, index) => (
              <View key={index} style={styles.profileItem}>
                <Text style={styles.profileKey}>{item.key}:</Text>
                <Text style={styles.profileValue}>{item.value}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

export default Profile;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4ff',
    paddingTop: StatusBar.currentHeight,
  },
  headerP: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: StatusBar.currentHeight,
    paddingBottom: 20,
    paddingTop:66,
    paddingHorizontal: 20,
    backgroundColor: '#fcad2e',
  },
  backButton: {
    marginRight: 10,
  },
  backButtonText: {
    fontSize: 18,
    color: '#fff',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    paddingLeft:8
  },
  profileHeader: {
    alignItems: 'center',
    marginTop: height * 0.04, // Space between back button and avatar
  },
  avatar: {
    borderRadius: width * 0.1,
  },
  subtitle: {
    fontSize: width * 0.04,
    fontFamily:'Prociono-Regular',
    color: '#929292',
    paddingTop: height * 0.02,
  },
  scrollContent: {
    paddingHorizontal: width * 0.05,
    paddingBottom: height * 0.1,
    paddingTop: width * 0.04,
  },
  profileDetails: {
    paddingHorizontal: 10,
  },
  profileItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: height * 0.015,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  profileKey: {
    fontFamily:'Prociono-Regular',
    color: '#333',
    fontSize: width * 0.04,
    paddingLeft: width * 0.02,
  },
  profileValue: {
    color: '#666',
    fontSize: width * 0.04,
    paddingRight: width * 0.02,
    fontFamily:'AndadaPro-Regular'
  },
});
