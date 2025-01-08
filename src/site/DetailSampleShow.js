import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Animated, Switch } from 'react-native';
import { Image, Text } from 'react-native-animatable';
import Drop from '../../assets/svg/drop.svg'
import { useNavigation } from '@react-navigation/native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import * as Animatable from 'react-native-animatable';
import SampleSiteDetailView from './SampleSiteDetailView';
import accountLog from '../../assets/accountlogo.png'
import TemperatureMeter from '../../assets/svg/tempmeter.svg';
import Meter from '../../assets/svg/meter.svg';
import Eb from '../../assets/svg/eb.svg';
import Dg from '../../assets/svg/dg.svg';
import Bt from '../../assets/svg/bt.svg';
import AlarmReport from './AlarmReport';
import LinearGradient from 'react-native-linear-gradient';
import NoData from '../../assets/loties/nodata.json'
import LottieView from 'lottie-react-native';
import { hooter_on_off, insert_Hooter_log } from '../service/ApiService';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
const AnimatedFlatList = Animatable.createAnimatableComponent(FlatList);

const DetailSampleShow = ({ name, anim, dataProp, alarmConfig,current, logData, logv1, dcem, volt, currentSite, activeAlarm, pendingAlarm, runHours, imei, client, d ,mode,hoter_val,hooter_cnt,showDialog,yesClick,btlv,hrt,colorRecevie}) => {
  const [show, setShow] = useState(false);
  const [data, setData] = useState(null);
  const [hooter_cnt_val,setHooterCnt]=useState(hooter_cnt);
  const [currentSts,setCurrentSts]=useState(null);
  const [alarmConData, setAlarmConfige] = useState(null);
  const [log, setLog] = useState(null);
  const [logve1, setLogve1] = useState(null);
  const [tempData, setTempData] = useState(null);
  const [dcemData, setDcemData] = useState(null);
  const [initial, setRotation] = useState(0);
  const [currentSiteStatus, setCurrentSite] = useState(null);
  const navigation = useNavigation();
  useEffect(()=>{
    console.log("hello",colorRecevie);
  },colorRecevie);
  console.log("hello",colorRecevie);
  
 
  useEffect(() => {
    if (dataProp) {
      setData(dataProp);
    } else if (alarmConfig) {
      setAlarmConfige(alarmConfig);
    } else if (logData) {
      setLog(logData);
    } else if (dcem) {
      setDcemData(dcem);
    }
    else if (logv1) {
      setLogve1(logv1);
    }
    else if (current) {
      setCurrentSts(current);
    }  else if (currentSite) {
      setCurrentSite(currentSite);
      console.log(currentSite);
    }
  }, [dataProp, alarmConfig, logData, dcem, current, logv1, currentSite]);

  useEffect(() => {
    if (show) {
      if (data)
        setTempData(data);
      else if (alarmConData) {
        setTempData(alarmConData);
      }
      else if (log) {
       console.log("ji",log);
        setTempData(log);

      }
      else if (dcemData) {
        setTempData(dcemData);
      }else if (logve1) {
        setTempData(logve1);
        console.log("no",logv1);
      }
      else if (currentSts) {
        setTempData(currentSts);
      }
      else if (currentSiteStatus) {
        setTempData(currentSiteStatus);
      }
      setRotation(180);
    } else {
      setTempData(null);
      setRotation(0);
    }
  }, [show, data,dcemData, currentSts, logve1, alarmConData, log, tempData, currentSiteStatus]);

  const handlePress = () => {

    setShow(!show);
    if (runHours === '1') {
      navigation.navigate('RunHours', { imei, client, d ,mode});
    }
  }

const handleSwitch= async(value)=>{
      showDialog(true,value);
 }

  useEffect(() => {
      if(yesClick>0){
        console.log("inside yes",yesClick);
      if(hooter_cnt_val==="1"){
            setHooterCnt("0");
            hotter_on_fun(imei,"0");
      }
      else{
        setHooterCnt("1");
        hotter_on_fun(imei,"1");
      }}},[yesClick]);

     const hotter_on_fun =async(imei,value)=>{
             try {
               const response =await hooter_on_off(imei,value);
               if(response.data){
                Toast.show({
                  type: 'success',
                  text1: 'Success',
                  text2: 'Hooter status updated successfully!',
                  position: 'bottom'
                });
                try {
                  const userDataString = await AsyncStorage.getItem('user_data');
            if (userDataString) {
                const userData = JSON.parse(userDataString);
                const {login_id,aidv4}=userData;
                await insert_Hooter_log(imei,aidv4,login_id,value);
                }
                 } catch (error) {
          
                  }
               }
               else{
                setHooterCnt(value==="0"?"1":"0");
                Toast.show({
                  type: 'error',
                  text1: 'Error',
                  text2: 'Failed to update hooter status!',
                  position: 'bottom'
                });
               }
             } catch (error) {
              
             }
     }



  if (!dcem) {
    return (
      <View>
        <TouchableOpacity onPress={handlePress}>
          <Animatable.View style={[styles.container,{backgroundColor:mode?'#232323': colorRecevie}]} duration={2000} animation={"rubberBand"}>
            <View>
              <Text style={styles.title}>{name}</Text>
            </View>
            <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'flex-end' }}>
              <Drop width={18} height={18} fill={'white'} rotation={initial} />
            </View>
          </Animatable.View>
        </TouchableOpacity>
        {initial === 180 && hoter_val && (<View style={{marginTop: 6, padding: 8, borderRadius: 6, marginLeft: 18, marginRight: 18 ,flexDirection:'row',justifyContent:'space-between'}}>
          <View><Text style={{ fontFamily: 'AndadaPro-Regular', color:mode?'white':'black',fontSize:16 }}>{hooter_cnt_val==="1"?"Hooter ON":"Hooter OFF"}</Text></View>
          <Switch styles={{ alignItems: 'end' }}
               trackColor={{ false: "#767577", true: "#81b0ff" }}
               thumbColor={true ? "#f5dd4b" : "black"}
               ios_backgroundColor="#3e3e3e"
               onValueChange={handleSwitch}
               value={hooter_cnt_val==="1"?true:false}
            />
             <Toast ref={(ref) => Toast.setRef(ref)} />
            </View>)}
        {tempData && (
          currentSite ? (
            <View style={{}}>
              <Animated.View style={{ flexDirection: 'row', justifyContent: 'space-evenly', padding: 3, marginLeft: 18, marginRight: 18 }}>
                <View style={styles.currentSiteBoxInside}>
                  {currentSiteStatus && currentSiteStatus[0] == 'SOEB' ? (
                    <Eb width={44} height={44} />
                  ) : currentSiteStatus && currentSiteStatus[0] == 'SODG' ? (
                    <Dg width={44} height={44} fill={'#eb003d'} />
                  ) : (
                    <Bt width={44} height={44} fill={'green'} />
                  )}
                  <Text style={[styles.siteRunnginText,{color:mode?'white':'black'}]}>{`${currentSiteStatus && currentSiteStatus[0]}`}</Text>
                </View>
                <View style={{ width: 1, backgroundColor: '#319edf' }}></View>
                <View style={styles.currentSiteBoxInside}>
                  <TemperatureMeter width={44} height={44}></TemperatureMeter>
                  <Text style={[styles.siteRunnginText,{color:mode?'white':'black'}]}>{`${currentSiteStatus && currentSiteStatus[1]}`}°C</Text>
                </View>
                <View style={{ width: 1, backgroundColor: '#319edf' }}></View>
                <View style={styles.currentSiteBoxInside}>
                  <Meter width={44} height={44}></Meter>
                  <Text style={[styles.siteRunnginText,{color:mode?'white':'black'}]}>{`${currentSiteStatus && currentSiteStatus[2]}`}V</Text>
                </View>
              </Animated.View>
              {activeAlarm && activeAlarm.length > 0 ? (
                <View>
                  <View style={{ backgroundColor:mode?'#232323':'#0a478f', marginTop: 6, marginLeft: 18, marginRight: 18, padding: 8, borderRadius: 6 }}>
                    <Text style={{ fontFamily: 'AndadaPro-Regular', color: 'white' }}>ACTIVE ALARM</Text>
                  </View>
                  <FlatList
                    scrollEnabled={false}
                    data={activeAlarm}
                    renderItem={({ item }) => (<SampleSiteDetailView name={item.alarm} value={item.start_time} view={'1'} mode={mode} />)}
                    keyExtractor={(item, index) => index.toString()} />
                </View>
              ) : (
                <View style={{ marginLeft: 18, marginRight: 18 }}>
                  <Text style={{ fontFamily: 'AndadaPro-Regular', color: '#62bf33', padding: 8 }}>
                    No Alarm Active Since 1 Day
                  </Text>
                </View>
              )}

              {pendingAlarm &&
                pendingAlarm.length > 0 && (<View>
                  <View style={{ backgroundColor:mode?'#232323':'#0a478f', marginTop: 6, padding: 8, borderRadius: 6, marginLeft: 18, marginRight: 18 }}>
                    <Text style={{ fontFamily: 'AndadaPro-Regular', color: 'white' }}>PENDING ALARM</Text>
                  </View>
                  <FlatList
                    scrollEnabled={false}
                    data={pendingAlarm}
                    renderItem={({ item }) => (<SampleSiteDetailView name={item.alarm} value={item.start_time} view={'1'} mode={mode} />)}
                    keyExtractor={(item, index) => index.toString()} />
                </View>)
              }

            </View>
          ) :tempData.length > 0 ? (
            <FlatList
              scrollEnabled={false}
              data={tempData}
              renderItem={({ item }) => (
                data ? (
                  <SampleSiteDetailView name={item[0]} value={item[1]} view={'1'} mode={mode} />
                ) : currentSts ? (
                  <SampleSiteDetailView name={item[0]} value={item[1]} color={item[2]} col="y" mode={mode} />
                ) : alarmConData ? (
                  <SampleSiteDetailView name={item.alarm} alarmType={item.alarm_type} btlv={btlv} hrt={hrt} hotterInstal={item.hooter_installed} mode={mode} color={colorRecevie}/>
                ) : logve1 && logve1.length > 0 ? (
                  <AlarmReport name={item.alarm_description} start={item.create_dt} end={item.sms_text} temp={item.Acknowledge} version={"v1"} mode={mode}  color={colorRecevie}/>
                ) : log && log.length > 0 ? (
                  <AlarmReport name={item.alarm_desc} start={item.start_time} end={item.end_time} temp={item.temp} volt={item.volt} version={"v2"} mode={mode} color={colorRecevie}/>
                ) : (
                  <Text style={{ fontSize: 16 }}>Unknown condition</Text> // Adjust or remove as per your needs
                )
              )}
              keyExtractor={(item, index) => index.toString()}
            />
          ) : (
            <View style={{ justifyContent:'center' ,alignItems:'center'}}>
              <LottieView  style={{alignItems:'center',justifyContent:'center',flex:1}} source={NoData} width={250} height={250} autoPlay loop />
            </View>    
          ) 
        )}
      </View>
    );
  }
  else {
    return (
      <View>
        <TouchableOpacity onPress={handlePress}>
          <Animatable.View style={[styles.container, {backgroundColor:mode?'#232323': '#0a478f'}]} duration={2000} animation={"rubberBand"}>
            <View>
              <Text style={styles.title}>{name}</Text>
            </View>
            <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'flex-end' }}>
              <Drop width={18} height={18} fill={'white'} rotation={initial} />
            </View>
          </Animatable.View>
        </TouchableOpacity>
     
        {tempData && (
          <View style={{ width: '95%', margin: 10, paddingBottom: 6, backgroundColor:mode?'#232323': 'white', borderRadius: 18, borderWidth: 20, borderColor: '#626874', shadowColor: 'red', shadowOpacity: 16, elevation: 15, shadowRadius: 8, }}>
            <View style={{ backgroundColor: '#1a2f5c', alignItems: 'center' }}>
              <Text style={{ color: 'white', padding: 8, fontFamily: 'AndadaPro-Regular' }}>DC ENERGY METER</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginLeft: 10, marginRight: 10, marginTop: 4 }}>
              <View style={{ marginLeft: 40, justifyContent: 'center', alignItems: 'center' }}>
                <LinearGradient colors={["#b2f102", "#A3f000"]} style={{ justifyContent: 'center', alignItems: 'center', padding: 3, paddingLeft: 8, paddingRight: 8, borderRadius: 8 }}>
                  <Text style={{ fontFamily: 'digital-7 (mono)', fontSize: 28, color: 'black', alignItems: 'center', color: 'red' }} animation="fadeIn" iterationCount="infinite" duration={1000}>{volt}</Text>
                  <Text style={{ fontFamily: 'AndadaPro-Regular', color: 'black', fontSize: 12, alignItems: 'center' }}>VOLTAGE</Text>
                </LinearGradient>
                <View style={{ flexDirection: 'row', marginTop: 12 }}>
                  <Animatable.Text style={{ backgroundColor: 'red', width: 15, height: 15, borderRadius: 8, shadowColor: 'red', shadowOpacity: 800, elevation: 65, shadowRadius: 58, }} animation="fadeIn" iterationCount="infinite" duration={1000}></Animatable.Text>
                  <Text style={{ backgroundColor: 'green', width: 15, height: 15, marginLeft: 14, borderRadius: 8, shadowColor: 'green', shadowOpacity: 100, elevation: 8, shadowRadius: 16, }} animation="fadeIn" iterationCount="infinite" duration={500}></Text>
                </View>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Animatable.Image source={accountLog} style={{ height: 45, width: 45, marginTop: 8, marginBottom: 8 }} duration={2000} animation="zoomIn"></Animatable.Image>
                <Text style={{ fontFamily: 'digital-7 (mono)', color: '#29c5f6', fontSize: 18, textShadowColor: '#5579cd', textShadowRadius: 2 }}>STPL</Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginLeft: 25, marginRight: 25, marginTop: 10 }}>
              <Text style={[styles.amp,{color:mode?'red': '#5579cd'}]}>Amp(A)</Text>
              <Text style={[styles.amp,{color:mode?'red': '#5579cd'}]}>Kwh</Text>
            </View>
            <AnimatedFlatList
              scrollEnabled={false}
              data={tempData}
              renderItem={({ item }) => (
                <LinearGradient colors={["#b2f102", "#A3f000"]} style={{ borderRadius: 8, marginTop: 5, marginLeft: 10, marginRight: 10 }}>
                  <Animatable.View style={{ padding: 4 }} animation="fadeIn" iterationCount="infinite">
                    <View style={styles.display}>
                      <Text style={styles.displayText}>{item[0]}</Text>
                      <Text style={styles.displayText}>{item[1]}</Text>
                    </View>
                    <View style={styles.display}>
                      <Text style={styles.displayText}>{item[2]}</Text>
                      <Text style={styles.displayText}>{item[3]}</Text>
                    </View>
                  </Animatable.View>
                </LinearGradient>
              )}
              keyExtractor={(item, index) => index.toString()}
            />

          </View>
        )}
      </View>
    );
  }
}

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
    fontFamily: 'AndadaPro-Regular'
  },
  text: {
    color: 'black',
    fontSize: 13,
    fontFamily: 'AndadaPro-Regular'
  },
  display: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    paddingLeft: 6,
    paddingRight: 6
  },
  displayText: {
    fontFamily: 'digital-7 (mono)',
    fontSize: 18,
    color: 'black'
  },
  amp: {
    fontFamily: 'AndadaPro-Medium',
   
    shadowColor: '#5579cd',
    textShadowColor: '#5579cd',
    textShadowRadius: 2
  },
  currentSiteBoxInside: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  siteRunnginText: {
    color: 'white',
    paddingTop: 5,
    fontFamily: 'AndadaPro-Medium'
  },



})

export default DetailSampleShow;
