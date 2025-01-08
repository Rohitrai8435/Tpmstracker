import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TextInput, FlatList, Pressable, Dimensions, ActivityIndicator } from 'react-native';
import Back from '../../assets/svg/drop.svg';
import Graph from '../../assets/svg/graph.svg';
import { Text } from 'react-native-animatable';
import { useNavigation, useRoute } from '@react-navigation/native';
import { dcem_analytics } from '../service/ApiService';
import * as Animatable from 'react-native-animatable';
import NoData from '../../assets/loties/nodata.json'
import LottieView from 'lottie-react-native';
import RunHoursCard from './RunHoursCard';
import NetInfo from '@react-native-community/netinfo';
import NoInternet from '../NoInternet';
import { TouchableOpacity } from 'react-native-gesture-handler';
const RunHours = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { imei, client, d ,mode} = route.params;
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [isConnected, setIsConnected] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const onBackPress = () => {
        navigation.goBack();
      };

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            setIsConnected(state.isConnected);
        });

        return () => {
            unsubscribe();
        };
    }, []);

    const aggregatedData = {};
    console.log("route",route);
    let sumTimeSobt = 0;
    let sumTimeSodg = 0;
    let sumTimeSoeb = 0;
    let sumKwhSobt = 0;
    let sumKwhSodg = 0;
    let sumKwhSoeb = 0;
    let totalTime = 0;
    let totalKwh = 0;

    useEffect(() => {
        getRunHours();
    }, []);

    const getRunHours = async () => {
        try {
            const response = await dcem_analytics(imei);
            console.log(response);
            setError(response.error);
    
            response.result.forEach(item => {
                const { event_date, source, total_running_time, total_kwh } = item;
                if (!aggregatedData[event_date]) {
                    aggregatedData[event_date] = {
                        date: event_date,
                        timeSobt: "00:00:00",
                        timeSodg: "00:00:00",
                        timeSoeb: "00:00:00",
                        kwhSobt: 0.0,
                        kwhSodg: 0.0,
                        kwhSoeb: 0.0,
                        totalRun: "00:00:00",
                        totalKwh: 0.0
                    };
                }
                if (source === "SOBT") {
                    aggregatedData[event_date].timeSobt = total_running_time || "00:00:00";
                    aggregatedData[event_date].kwhSobt += parseFloat(total_kwh) || 0.0;
                } else if (source === "SODG") {
                    aggregatedData[event_date].timeSodg = total_running_time || "00:00:00";
                    aggregatedData[event_date].kwhSodg += parseFloat(total_kwh) || 0.0;
                } else if (source === "SOEB") {
                    aggregatedData[event_date].timeSoeb = total_running_time || "00:00:00";
                    aggregatedData[event_date].kwhSoeb += parseFloat(total_kwh) || 0.0;
                }
            });
    
            Object.values(aggregatedData).forEach(item => {
                const { timeSobt, timeSodg, timeSoeb, kwhSobt, kwhSodg, kwhSoeb } = item;
                const totalRunInSeconds = getTimeInSeconds(timeSobt) + getTimeInSeconds(timeSodg) + getTimeInSeconds(timeSoeb);
                const totalKwh = kwhSobt + kwhSodg + kwhSoeb;
                item.totalRun = formatTime(totalRunInSeconds);
                item.kwhSobt = kwhSobt.toFixed(2); // Ensure kWh values are formatted to two decimal places
                item.kwhSodg = kwhSodg.toFixed(2);
                item.kwhSoeb = kwhSoeb.toFixed(2);
                item.totalKwh = totalKwh.toFixed(2);
            });
    
            const finalArray = Object.values(aggregatedData);
            const sortedResult = [...finalArray];
            sortedResult.sort((a, b) => {
                const dateA = new Date(a.date);
                const dateB = new Date(b.date);
                return dateB - dateA;
            });
            setResult(sortedResult);
            console.log(finalArray);
            setIsLoading(false);
        } catch (error) {
            setIsLoading(false);
            return (
                <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                    <Text style={{ fontFamily: 'AndadaPro-Regular' }}>Something Went wrong</Text>
                </View>
            );
        }
        setTimeout(() => {
            setIsLoading(false); // Set loading state to false when API call completes
        }, 10000);
    };
    
    function getTimeInSeconds(time) {
        const [hours, minutes, seconds] = time.split(':').map(Number);
        return hours * 3600 + minutes * 60 + seconds;
    }
    
    // Helper function to format time in seconds to HH:mm:ss format
    function formatTime(totalSeconds) {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    
    if (result && result.length > 0) {
        result.forEach(item => {
            sumTimeSobt += getTimeInSeconds(item.timeSobt);
            sumTimeSodg += getTimeInSeconds(item.timeSodg);
            sumTimeSoeb += getTimeInSeconds(item.timeSoeb);
            sumKwhSobt += parseFloat(item.kwhSobt);
            sumKwhSodg += parseFloat(item.kwhSodg);
            sumKwhSoeb += parseFloat(item.kwhSoeb);
            totalKwh += parseFloat(item.totalKwh);
        });
    
        sumKwhSobt = sumKwhSobt.toFixed(2);
        sumKwhSodg = sumKwhSodg.toFixed(2);
        sumKwhSoeb = sumKwhSoeb.toFixed(2);
        totalKwh = totalKwh.toFixed(2);
    }
    
    totalTime = formatTime(sumTimeSobt + sumTimeSodg + sumTimeSoeb);
    sumTimeSobt = formatTime(sumTimeSobt);
    sumTimeSodg = formatTime(sumTimeSodg);
    sumTimeSoeb = formatTime(sumTimeSoeb);
    

    const press = () => {
        navigation.navigate('GraphView', result);
    }
    if (error == null) {
        return (
            <>{isConnected ? (isLoading ?
                (<View style={{ justifyContent: 'center', alignItems: 'center', flex: 1,  backgroundColor: mode ? 'black' : 'white'}}>
                    <ActivityIndicator size="large" width={50} height={50} color={['#0a478f','#54c9b2','#e8c592','#e861af']} />
                    <Text style={{ fontFamily: 'AndadaPro-Regular', marginTop: 10, fontSize: 20 ,color: mode ? 'white' : 'black'}}>Data is loading...</Text>

                </View>) :
                (<View style={[styles.mainContainer,{ backgroundColor: mode ? 'black' : 'white' }]}>
                    <View style={[styles.subContainer,{ backgroundColor: mode ? 'black' : '#0a478f' }]}>
                        <View style={{ flexDirection: 'row' }}>
                            <TouchableOpacity onPress={onBackPress}>
                            <Back width={24} height={24} />
                            </TouchableOpacity>
                            <Text style={styles.headerText}>Run Hours</Text>
                        </View>
                        <Pressable onPress={press}>
                            <View style={{ justifyContent: 'flex-end', alignItems: 'center' }}>
                                <Graph width={24} height={24} fill={'white'} />
                                <Text style={styles.headerText}>Analytical View</Text>
                            </View>
                        </Pressable>
                    </View>
                    <View style={[styles.insideContainer,{ backgroundColor: mode ? '#3f3f3f' : 'white' }]}>
                    <View style={[styles.total,{ backgroundColor: mode ? '#232323' : '#0a478f' }]}>
                    {result && result.length > 0 && (
                        <Text style={styles.headerText}>
                     {`Total from : ${result[0].date} to ${result[result.length - 1].date}`}
                       </Text>)}

                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <View>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Text style={[styles.totalText, { color: '#53cf17' }]}>EB(Run Hrs)</Text>
                                    <Animatable.Text style={[styles.totalText, { color: '#53cf17' }, { marginLeft: 2, fontFamily: 'digital-7 (italic)', fontSize: 18 },]} animation="fadeIn" iterationCount="infinite">{sumTimeSoeb}</Animatable.Text>
                                </View>
                                {client != 'CREST DIGITEL' && (
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                        <Text style={[styles.totalText, { color: '#eb003d' }]}>DG(Run Hrs)</Text>
                                        <Animatable.Text style={[styles.totalText, { color: '#eb003d' }, { marginLeft: 2, fontFamily: 'digital-7 (italic)', fontSize: 18 }]} animation="fadeIn" iterationCount="infinite">{sumTimeSodg}</Animatable.Text>
                                    </View>)}
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <Text style={[styles.totalText, { color: '#ffc107' }]}>BT(Run Hrs)</Text>
                                    <Animatable.Text style={[styles.totalText, { color: '#ffc107' }, { marginLeft: 2, fontFamily: 'digital-7 (italic)', fontSize: 18 }]} animation="fadeIn" iterationCount="infinite">{sumTimeSobt}</Animatable.Text>
                                </View>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <Text style={[styles.totalText, { color:mode?'#1eb3eb' :'#0a478f' }]}>Total(Run Hrs)</Text>
                                    <Animatable.Text style={[styles.totalText, { color: mode?'#1eb3eb':'#0a478f' }, { marginLeft: 2, fontFamily: 'digital-7 (italic)', fontSize: 18 }]} animation="fadeIn" iterationCount="infinite">{totalTime}</Animatable.Text>
                                </View>
                            </View>
                            <View>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Text style={[styles.totalText, { color: '#53cf17' }]}>EB(Kwh)</Text>
                                    <Text style={[styles.totalText, { color: '#53cf17' }, { marginLeft: 2, }]}>{d === '1' ? sumKwhSoeb : 'NA'}</Text>
                                </View>
                                {client != 'CREST DIGITEL' && (<View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <Text style={[styles.totalText, { color: '#eb003d' }]}>DG(Kwh)</Text>
                                    <Text style={[styles.totalText, { color: '#eb003d' }, { marginLeft: 2, }]}>{d === '1' ? sumKwhSodg : 'NA'}</Text>
                                </View>)}
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <Text style={[styles.totalText, { color: '#ffc107' }]}>BT(Kwh)</Text>
                                    <Text style={[styles.totalText, { color: '#ffc107' }, { marginLeft: 2, }]}>{d === '1' ? sumKwhSobt : 'NA'}</Text>
                                </View>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <Text style={[styles.totalText, { color:mode?'#1eb3eb': '#0a478f' }]}>Total(Kwh)</Text>
                                    <Text style={[styles.totalText, { color:mode?'#1eb3eb': '#0a478f' }, { marginLeft: 2, }]}>{d === '1' ? totalKwh : 'NA'}</Text>
                                </View>

                            </View>
                        </View>
                    </View>
                    <FlatList
                        data={result}
                        renderItem={({ item }) => (<RunHoursCard dgK={d === '1' ? item.kwhSodg : 'NA'} btK={d === '1' ? item.kwhSobt : 'NA'} ebK={d === '1' ? item.kwhSoeb : 'NA'} ebR={item.timeSoeb} dgR={item.timeSodg} btR={item.timeSobt} tR={item.totalRun} tK={d === '1' ? item.totalKwh : 'NA'} date={item.date} client={client} mode={mode}></RunHoursCard>)}
                        keyExtractor={(item, index) => index.toString()} />
                </View >)) : (<NoInternet></NoInternet>)}
            </>
        );
    }
    else {
        return (
            <>
                {isConnected ? (<View style={{ justifyContent: 'center', alignItems: 'center', flex: 1, backgroundColor: '#c8dcf4' }}>
                    <LottieView source={NoData} width={Dimensions.get('window').width}
                        height={Dimensions.get('window').height} autoPlay loop />
                </View>) : (<NoInternet></NoInternet>)}
            </>
        );
    }

}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        flexDirection: 'column',
    },
    subContainer: {
        flexDirection: 'row',
        backgroundColor: '#0a478f',
        padding: 16,
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    searchBox: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 28,
        flex: 1,
        marginLeft: 18,
        marginRight: 8,
        color: 'white',
    },
    text: {
        padding: 8,
        paddingRight: 50

    },
    view: {
        borderRadius: 4,
        borderWidth: 0.5,
        borderColor: '#000'
    },
    headerText: {
        fontFamily: 'AndadaPro-Regular',
        color: 'white',
        alignItems: 'flex-start',
        marginLeft: 12,
        fontSize: 18
    },
    total: {
        backgroundColor: '#0a478f',
        padding: 6,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8
    },
    insideContainer: {
        marginLeft: 14,
        marginRight: 14,
        marginTop: 6,
        backgroundColor: 'white',
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8
    },
    totalText: {
        fontFamily: 'AndadaPro-Regular',
        color: 'green',
        alignItems: 'flex-start',
        marginLeft: 12,
        marginRight: 12,
        fontSize: 15
    },
    animationContainer: {
        position: 'relative',
        alignContent: 'center',
        justifyContent: 'center',
        marginTop: 8,
    },
})

export default RunHours;
