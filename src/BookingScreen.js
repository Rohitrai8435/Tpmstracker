import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, ScrollView, RefreshControl } from 'react-native';
import Menu from '../assets/svg/menu.svg';
import Avatar from '../assets/svg/avatar.svg';
import Revisit from '../assets/svg/revisit.svg';
import Inc from '../assets/svg/inc.svg';
import CloseInc from '../assets/svg/closeinc.svg';
import CloseRequest from '../assets/svg/closerequest.svg';
import Card from './component/Card';
import { useNavigation } from '@react-navigation/native';
import Drawer from './component/Drawer';
import { getData, getDataSoc } from './service/ApiService';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import NoInternet from './NoInternet';
const BookingScreen = () => {
    const [isConnected, setIsConnected] = useState(true);
    const navigation = useNavigation();
    const [drawer, setDrawer] = useState(false);
    const [data, setData] = useState([]);
    const [profile,setProfile]=useState([]);
    const [incNotClose, setIncNotClose] = useState([]);
    const [incClose, setIncClose] = useState([]);
    const [revisitNotClose, setRevisitNotClose] = useState([]);
    const [revisitClose, setRevisitClose] = useState([]);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const toggleDrawer = () => {
        console.log('click');
        setDrawer(!drawer);
    };
    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
          setIsConnected(state.isConnected && state.isInternetReachable);
        });
        return () => unsubscribe();
      }, []);
      
    const fetchData = async () => {
        try {
          const userData = await AsyncStorage.getItem('userData');
        
          if (!userData) {
            Alert.alert('User data not found.');
            return;
          }
    
          const parsedData = JSON.parse(userData);
          const userId = parsedData?.id;
          setProfile(parsedData);
          if (!userId) {
            Alert.alert('User ID not found in userData.');
            return;
          }
          let response;
          if(parsedData.designation?.toLowerCase() == 'technician'){
              response= await getData(userId);}
          else if(parsedData.designation?.toLowerCase() == 'soc team'){
             response = await getDataSoc(userId);}
          else{
            logOut();
             }
            // console.log("IMEI Response Status:", response.status);
          if (response.status === 'success') {
            const data = response.data;
            setData(data);
            const incNotCloseList = data.filter(
              item => item.service_type === 'Inc' && item.request_close_time === null
            );
            const incCloseList = data.filter(
              item => item.service_type === 'Inc' && item.request_close_time !== null
            );
            const revisitNotCloseList = data.filter(
              item => item.service_type === 'Revisit' && item.request_close_time === null
            );
            const revisitCloseList = data.filter(
              item => item.service_type === 'Revisit' && item.request_close_time !== null
            );
            setIncNotClose(incNotCloseList);
            setIncClose(incCloseList);
            setRevisitNotClose(revisitNotCloseList);
            setRevisitClose(revisitCloseList);
          }
        } catch (error) {
          console.error("Fetch Data Error:", error);
          Alert.alert("Network Error", "An error occurred while fetching data. Please check your network connection.");
        }
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

    useEffect(() => { 
        fetchData();
      }, []);
      const onRefresh = async () => {
        setIsRefreshing(true);
        await fetchData();
        setIsRefreshing(false);
    };


      const {id,name ,mobile,designation,password}=profile;
      // console.log(designation);
  
    return (
        isConnected ?  ( <>
            <StatusBar translucent={true} backgroundColor="transparent" barStyle="dark-content" />
            <View style={styles.container}>
                <ScrollView
                    refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
                >
                    <View style={styles.header}>
                        <TouchableOpacity onPress={toggleDrawer}>
                            <Menu width={45} height={45} />
                        </TouchableOpacity>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <View style={{ marginTop: 20 }}>
                                <Text style={styles.subtitle}>
                                    Hii {profile.name}
                                </Text>
                                <Text style={styles.title}>Welcome!!!</Text>
                            </View>
                            <TouchableOpacity
                                style={{
                                    backgroundColor: 'white',
                                    padding: 10,
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.25,
                                    shadowRadius: 4.84,
                                    elevation: 5,
                                    borderTopLeftRadius: 14,
                                    borderBottomEndRadius: 14
                                }} 
                                onPress={() => { navigation.navigate('Profile', { profile }) }}
                            >
                                <Avatar width={50} height={50} style={{ borderRadius: 25 }} />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={styles.containers}>
                        <Card
                            svgSource={<Inc width={50} height={50} style={{ borderRadius: 25 }} rotation={5} />}
                            count={`Inc \nDone ${incClose.length}`}
                            color={'#666de4'} 
                            click={"INCDONE"}
                            data={incClose}
                        />
                        <Card
                            svgSource={<Revisit width={50} height={50} style={{ borderRadius: 25 }} rotation={45} />}
                            count={`Revisit \nDone ${revisitClose.length}`}
                            color={'#fb703f'}
                            click={"REVISITDONE"}
                            data={revisitClose} 
                        />
                        <Card
                            svgSource={<CloseInc width={50} height={50} style={{ borderRadius: 25 }} />}
                            count={`Inc Not \nClose ${incNotClose.length}`}
                            color={'#fcad2e'} 
                            click={"INCNOTCLOSE"}
                            data={incNotClose}
                        />
                        <Card
                            svgSource={<CloseRequest width={50} height={50} style={{ borderRadius: 25 }} />}
                            count={`Revisit Not \nClose ${revisitNotClose.length}`}
                            color={'#00a7ff'} 
                            click={"REVISITNOTCLOSE"}
                            data={revisitNotClose}
                        />
                    </View>
                    {profile.designation === "technician" &&
                    <View style={styles.recommendedContainer}>
                        <Text style={styles.recommendedTitle}>Services Type</Text>
                        <TouchableOpacity style={styles.flightCard} onPress={() => { navigation.navigate('IncService') }}>
                            <Text style={styles.flightPrice}>Inc</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.flightCard} onPress={() => { navigation.navigate('Revisit') }}>
                            <Text style={styles.flightPrice}>Revisit</Text>
                        </TouchableOpacity>
                    </View>
                    }
                    <View style={[styles.recommendedContainer, { marginTop: 12 }]}>
                        <Text style={styles.recommendedTitle}>Company Update</Text>
                        <TouchableOpacity style={styles.flightCard} onPress={() => { navigation.navigate('Update') }}>
                            <Text style={styles.flightPrice}>Any Update</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.flightCard} onPress={() => { navigation.navigate('About') }}>
                            <Text style={styles.flightPrice}>About</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
               
            </View>
            {drawer && <Drawer onClose={toggleDrawer} data={profile}></Drawer>}
        </>):(<NoInternet></NoInternet>)

    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f4ff',
        padding: 20,
    },
    header: {
        marginTop: 24,
        marginBottom: 20,
    },
   
     
    recommendedContainer: {
        marginTop: 25,
    },
    recommendedTitle: {
        fontSize: 20,
        fontFamily:'Prociono-Regular',
        marginBottom: 18,
        color:'#333'
    },
    flightCard: {
        backgroundColor: '#4f6cff',
        padding: 16,
        borderRadius: 10,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 3 },
        shadowOpacity: 0.55,
        shadowRadius: 4.84,
        elevation: 5,

    },
    
  
    flightPrice: {
        fontSize: 20,
        color: '#fff',
        fontFamily:'Prociono-Regular',

    },
    title: {
        fontSize: 32,
      
        color: '#1D2A32',
        marginBottom: 6,
        fontFamily:'Prociono-Regular'
    },
    subtitle: {
        fontSize: 15,
        fontFamily:'Prociono-Regular',
        color: '#929292',

    },
    containers: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',

    },
  
});

export default BookingScreen;
