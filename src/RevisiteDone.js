import { StyleSheet, Text, View, TouchableOpacity, FlatList, Image, StatusBar, Linking } from 'react-native';
import React, { useEffect, useState } from 'react';
import Back from '../assets/svg/drop.svg';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Search from './Search';
const RevisiteDone = () => {
  const navigation = useNavigation();
  const [profile,setProfile]=useState(null);
  const route = useRoute();
  const { data } = route.params;
  const [filteredData, setFilteredData] = useState([]);
  console.log(data);

  useEffect(() => {
    setFilteredData(data);
    const fetchUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem('userData');
        if (userData !== null) {
          setProfile(JSON.parse(userData));
        }
      } catch (error) {
        console.error("Failed to fetch user data", error);
      }
    };
    fetchUserData();
  }, [data]);

  const nav=(item)=>{
    const color = '#fb703f';
    if(profile.designation?.toLowerCase() == 'technician')
    navigation.navigate('IncScreen',{item,color});
  else
  navigation.navigate('IncTeam',{item,color});
  }

  const handleSearch = (query) => {
    const sanitizedQuery = query.trim().replace(/\s+/g, '').toLowerCase();
    const results = data.filter(item =>
      (item.site_id && item.site_id.toString().replace(/\s+/g, '').toLowerCase().startsWith(sanitizedQuery)) ||
      (item.site_name && item.site_name.replace(/\s+/g, '').toLowerCase().startsWith(sanitizedQuery)) || 
      (item.state_name && item.state_name.replace(/\s+/g, '').toLowerCase().startsWith(sanitizedQuery)) || 
      (item.imei && item.imei.toString().replace(/\s+/g, '').toLowerCase().startsWith(sanitizedQuery)) 
    );
    setFilteredData(results);
  };
  const makeCall = (number) => {
    const url = `tel:${number}`;
    Linking.openURL(url).catch((err) => console.error('Error opening dialer', err));
  };
  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => { nav(item); }}>
      <Text style={styles.text}>Site name: {item.site_name}</Text>
      <Text style={styles.text}>Global id: {item.site_id}</Text>
      <Text style={styles.text}>Circle: {item.state_name}</Text>
      {profile?.designation?.toLowerCase() == 'technician' ? (
        <>
          <Text style={styles.text}>Technician Name: {item.technician_name}</Text>
          <Text
            style={[styles.text, styles.link]}
            onPress={() => makeCall(item.technician_mobile)}
          >
            Technician Mobile: {item.technician_mobile}
          </Text>
        </>
      ) : (
        <>
          <Text style={styles.text}>Technician Name: {item.name}</Text>
          <Text
            style={[styles.text, styles.link]}
            onPress={() => makeCall(item.mobile)}>
            Technician Mobile: {item.mobile}
          </Text>
        </>
      )}
      <Text style={styles.text}>Insert Time: {item.insert_time}</Text>
      <Text style={styles.text}>
        Request Close Time: {item.request_close_time || 'Not Closed Yet'}
      </Text>
      <Text style={styles.text}>
        Remark by soc: {item.remark_soc ? item.remark_soc : "NA"}
      </Text>
      <Text style={styles.text}>
       Complain Remark: <Text style={[styles.remarkText,{color:'red'}]}>{item.before_remark}</Text>
      </Text>
      <Text style={styles.text}>
       Visit Remark: <Text style={[styles.remarkText,{color:'green'}]}>{item.after_remark}</Text>
      </Text>
    </TouchableOpacity>
  );
  return (
    <>
      <StatusBar translucent={true} backgroundColor="transparent" barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Back width={24} height={24} rotation={90} fill={'white'} />
        </TouchableOpacity>
        <Text style={styles.headerText}>REVISIT DONE</Text>
      </View>
       <Search onSearch={handleSearch}></Search>
      <View style={styles.container}>
        <FlatList
          data={filteredData}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          ListEmptyComponent={<Text style={styles.emptyText}>No data available</Text>}
        />
      </View>
    </>
  );
};
export default RevisiteDone;
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
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  text: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
    fontFamily:'Prociono-Regular',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#aaa',
    marginTop: 20,
  },
  link: {
    color: '#007BFF',
    textDecorationLine: 'underline',
  },
});
