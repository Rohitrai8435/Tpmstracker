import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity,ActivityIndicator, Dimensions} from 'react-native';
import { Text } from 'react-native-animatable';
import Back from '../../assets/svg/drop.svg';
import DetailSampleShow from './DetailSampleShow';
import Cross from "../../assets/svg/cross.svg";
import SadLogOut from "../../assets/sound.png";
import * as Animatable from 'react-native-animatable';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getAlarmV1, getLogReport, getSiteDetail, getSiteDetailV2, getSiteDetailv1, getcurrentAlarmByImei, getcurrentAlarmByImeiv2 } from '../service/ApiService';
import { ScrollView } from 'react-native-gesture-handler';
import NetInfo from '@react-native-community/netinfo';
import NoInternet from '../NoInternet';
import { Image } from 'react-native-animatable';
import Orientation from 'react-native-orientation-locker';
import DGController from './DGController';
const SiteDetail = () =>{
  const route = useRoute();
  //862211070275458	//50
  const { imei,mode,version,color} = route.params;
  console.log(imei,version);
  const [isLoading, setIsLoading] = useState(true);
  const [hooterCnt, setHooterCnt] = useState(false);
  const [data, setData] = useState([]);
  const [showDialog,setShowDialog]=useState(false);
  const [lowestLevel,setLowestLevel]=useState("0");
  const [btlv,setBtlv]=useState(null);
  const [hrt,setHrt]=useState(null);
  const [yesPress,setYes]=useState(0);
  const [alarmConfig, setAlarmCon] = useState([]);
  const [log, setLog] = useState([]);
  const [logv1, setLogv1] = useState([]);
  const [source, setSource] = useState(null);
  const [current,setCurrentAlarm]=useState(null);
  const [pending,setPendingAlarm]=useState(null);
  const moment = require('moment');
  const [isConnected, setIsConnected] = useState(true);
  const [dialogHint, setdialogHint] = useState([]);
  const [currentSiteStatusv1,setCurrentSiteStatusv1]=useState([]);
  const navigation=useNavigation();
  const [automation, setAutomation] = useState(false);
 // console.log("route",route);

  useEffect(() => {
      const unsubscribe = NetInfo.addEventListener(state => {
          setIsConnected(state.isConnected);
      });

      return () => {
          unsubscribe();
      };
  }, []);

  useEffect(() => {
    Orientation.lockToPortrait(); 
  }, []);

  const onBackPress = () => {
    navigation.goBack();
  };


  useEffect(() => {
  //  fetchSiteDetail();
   fetchLogData();
  }, []);

  const currentDate = new Date();
  const startDate = new Date();
  startDate.setDate(currentDate.getDate() - 30);

  const formatDateString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formattedStartDate = formatDateString(startDate);
  const formattedEndDate = formatDateString(currentDate);

  const parseAlarmData = (alarmDataArray) => {
    const currentDate = new Date();
    const currentMidnight = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    
    const activeAlarms = [];
    const pendingAlarms = [];
  
    alarmDataArray.forEach((alarmData) => {
      const { start_time } = alarmData;
      const startDate = new Date(start_time);
  
      const startMidnight = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  
      const timeDifferenceInDays = (currentMidnight - startMidnight) / (1000 * 60 * 60 * 24);
  
      if (timeDifferenceInDays <= 1) {
        activeAlarms.push(alarmData);
      } else {
        pendingAlarms.push(alarmData);
      }
    });
  
    return { activeAlarms, pendingAlarms };
  };
   
  const refresh=async()=>{
   /* setIsLoading(false);
      if(version =='0'||version =='v4'){
      try{
        const currentAlarm = await getcurrentAlarmByImei(imei);
        if (currentAlarm && currentAlarm.data1){
          const uniqueAlarms = currentAlarm.data1.reduce((acc, curr) => {
            if (!acc.some(item => item.alarm === curr.alarm)) {
              acc.push(curr);
                             }
            return acc;
          }, []);
          currentAlarm.data1 = uniqueAlarms;
        }
        const { activeAlarms, pendingAlarms } = parseAlarmData(currentAlarm.data1);
        setCurrentAlarm(activeAlarms);
        setPendingAlarm(pendingAlarms);
       // console.log("refresh", alarmConfig);
        //console.log("refresh ", data);
       // console.log("refresh", currentAlarm.data1);
      } catch (error) {
       
      }
      try {
       
        const response = await getSiteDetail(imei);
          //console.log('data',response);
          setData(response.data);
          setBtlv(response.data.btlv);
          setHrt(response.data.hrt);
          setHooterCnt(response.hooter_ctr);
          setAlarmCon(response.alarm_con);
          setSource(response.source);
         
       } catch (error) {
        
       }
      }*/
  }
  
  const fetchLogData=async()=>{
    try {
      if(version =='0'||version =='v4'){
     try{
        setIsLoading(true);
        const currentAlarm = await getcurrentAlarmByImei(imei);
        if (currentAlarm && currentAlarm.data1){
          const uniqueAlarms = currentAlarm.data1.reduce((acc, curr) => {
            if (!acc.some(item => item.alarm === curr.alarm)) {
              acc.push(curr);
                             }
            return acc;
          }, []);
          currentAlarm.data1 = uniqueAlarms;
        }
        const { activeAlarms, pendingAlarms } = parseAlarmData(currentAlarm.data1);
        setCurrentAlarm(activeAlarms);
        setPendingAlarm(pendingAlarms);
        console.log("Alarm Configue", alarmConfig);
        console.log("Alarm ", data);
        console.log("Current Alarm", currentAlarm.data1);
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
      }
      try {
        setIsLoading(true);
        const response = await getSiteDetail(imei);
         
          setData(response.data);
          console.log('sourabh',response.data);
          if(response.data.func_type>>0&1){
            setAutomation(true);
          }
          setBtlv(response.data.btlv);
          setHrt(response.data.hrt);
          setHooterCnt(response.hooter_ctr);
          setAlarmCon(response.alarm_con);
          setSource(response.source);
          setIsLoading(false);
       } catch (error) {
        setIsLoading(false);
       }

     /*  try {
        setIsLoading(true);
        const userDataString = await AsyncStorage.getItem('user_data');
        if (userDataString) {
          const userData = JSON.parse(userDataString);  
            const { aidv4, ctmidv4, user_typev4, client_versionv4,lowest_level} = userData;
            setLowestLevel(lowest_level);
            const logResponse = await getLogReport(imei, aidv4, ctmidv4, formattedStartDate, formattedEndDate, user_typev4, client_versionv4);
            setLog(logResponse.data);
            console.log(" detail log :", logResponse);
            setIsLoading(false);
          
        }
      }catch (error) {
        setIsLoading(false);
        console.log(error);   
      
      }*/

    }
    else if(version === "v2"){
      try {
        setIsLoading(true);
        const currentAlarm = await getcurrentAlarmByImeiv2(imei);
        console.log("helloe ",currentAlarm);
        if (currentAlarm && currentAlarm.data1){
          const uniqueAlarms = currentAlarm.data1.reduce((acc, curr) => {
            if (!acc.some(item => item.alarm === curr.alarm)) {
              acc.push(curr);
            }
            return acc;
          }, []);
          currentAlarm.data1 = uniqueAlarms;
        }
        const { activeAlarms, pendingAlarms } = parseAlarmData(currentAlarm.data1);
        setCurrentAlarm(activeAlarms);
        setPendingAlarm(pendingAlarms);
       //console.log("Alarm Configue", alarmConfig);
        console.log("Alarm ", data);
        console.log("Current Alarm", currentAlarm.data1);
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        }
      try {
        setIsLoading(true);
        const response = await getSiteDetailV2(imei);
          setLog(response.log);
          console.log(response);
          setData(response.data);
          setAlarmCon(response.alarm_con);
          setSource(response.source);
          setIsLoading(false);
       } catch (error) {
        setIsLoading(false);
       }

    }
      else if(version === "v1"){
        console.log("inside loop",version);
        try {
          try {
            setIsLoading(true);
            const response = await getSiteDetailv1(imei);
              console.log(response);
              setData(response.data[0]);
              setCurrentSiteStatusv1(response.current_site[0]);
              console.log(data);
              setIsLoading(false);
           } catch (error) {
            setIsLoading(false);
           }
            try {
              setIsLoading(true);
              const response =await getAlarmV1(imei);
              console.log(response);
              setLogv1(response.data);
              setIsLoading(false);

            } catch (error) {
              setIsLoading(false);
            }
        } catch (error) {
          setIsLoading(false);
          console.log(error); 
        }
     
        }
    }
     catch (error) {
      return (<View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}><Text style={{ fontFamily: 'AndadaPro-Regular' }}>
      Something Went wrong</Text></View>)
    }
     
     
  }
  

 
    
  const { client_type_name, state_name, district_name, cluster_name, site_name, site_id, id_definition, system_version_type, site_mobile_no, sim_serial_no, gsm_imei_no, system_serial_no, site_type, globel_id, l1_number, l2_number, l3_number, l4_number, l5_number, i_c_date, no_of_battery_bank, door_sensor, antenna, hooter, battery_bank_one, battery_bank_two, battery_bank_three, battery_bank_four, update_at, energy_meter_installed, volt, ch1, ch2, ch3, ch4, ch5, idc1, idc2, idc3, idc4, idc5, kwh1, kwh2, kwh3, kwh4, kwh5, temp } = data;
  const  {D,D_dt, B,B_dt, BB1,BB1_dt,	BB2,BB2_dt,	BB3,BB3_dt,	BB4,BB4_dt,	E,E_dt,	C,C_dt,	S,S_dt,	BL,BL_dt ,H,H_dt  }=currentSiteStatusv1;
  					 			
  const currentSite=[
    ['Door',D === "0" ? 'CLOSE' : 'OPEN '+'( '+D_dt+' )',D === "0" ? '#00c04b' : '#de0a26'],
    ['BB Loop Break',B === "0" ? 'INTACT': 'ACT '+'( '+B_dt+' )',B === "0" ? '#00c04b' : '#de0a26'],
    ['BB1 DisConnect',BB1 === "0" ? 'NO' : 'YES '+'( '+BB1_dt+' )',BB1=== "0" ? '#00c04b' : '#de0a26'],
    ['BB2 DisConnect',BB2 === "0" ? 'NO' : 'YES '+'( '+BB2_dt+' )',BB2=== "0" ? '#00c04b' : '#de0a26'],
    ['BB3 DisConnect',BB3 === "0" ? 'NO' : 'YES '+'( '+BB3_dt+' )',BB3 === "0" ? '#00c04b' : '#de0a26'],
    ['BB4 DisConnect',BB4 === "0" ? 'NO' : 'YES '+'( '+BB4_dt+' )',BB4 === "0" ? '#00c04b' : '#de0a26'],
    ['Extra Alarm',E === "0" ? 'OFF' : 'ON '+'( '+E_dt+' )',E === "0" ? '#00c04b' : '#de0a26'],
    ['TPMS Cover Open',C === "0" ? 'CLOSE' : 'OPEN '+'( '+C_dt+' )',C === "0" ? '#00c04b' : '#de0a26'],
    ['TPMS Supply Failed',S === "0" ? 'INTACT' : 'ACT '+'( '+S_dt+' )',S === "0" ? '#00c04b' : '#de0a26'],
    ['TPMS Battery Low',BL === "0" ? 'NORMAL' : 'Standby Battery Low '+'( '+BL_dt+' )',BL === "0" ? '#00c04b' : '#de0a26'],
    ['Hooter',H === "0" ? 'OFF' : 'ON '+'( '+H_dt+' )',H === "0" ? '#00c04b' : '#de0a26']
  ]
  const siteDetail = [
    ['Client Name', client_type_name],
    ['Circle', state_name],
    ['Zone', district_name],
    ['Cluster', cluster_name],
    ['Site Name', site_name],
    ['Site Id', site_id],
    [id_definition, globel_id],
    ['System Version Type', system_version_type],
    ['Site Mobile No', site_mobile_no],
    ['Sim Serial No', sim_serial_no],
    ['GSM IMEI No', gsm_imei_no],
    ['System Serial No', system_serial_no],
    ['Site Type', site_type],
  ];
  
  const escalation = [
    ['L1 :', l1_number?l1_number:"NA"],
    ['L2 :', l2_number?l2_number:"NA"],
    ['L3 :', l3_number?l3_number:"NA"],
    ['L4 :', l4_number?l4_number:"NA"],
    ['L5 :', l5_number?l5_number:"NA"]];

  const doorSensorValue = door_sensor === '1' ? 'Installed' : "NA";
  const antennaValue = antenna === '1' ? 'Installed' : "NA";
  const hooterValue = hooter === '1' ? 'Installed' : "NA";
  const icDate = [
    ['I & C Date :', i_c_date],
    ['No of Battery Bank :', no_of_battery_bank? no_of_battery_bank:"NA"],
    ['Door Sensor :', doorSensorValue],
    ['Antenna :', antennaValue],
    ['Hooter :', hooterValue],
  ];
  const batteryBankDetail = [
    ["Battery Bank 1 :", battery_bank_one ? battery_bank_one : "NA"],
    ["Battery Bank 2 :", battery_bank_two ? battery_bank_two : "NA"],
    ["Battery Bank 3 :", battery_bank_three ? battery_bank_three : "NA"],
    ["Battery Bank 4 :", battery_bank_four ? battery_bank_four : "NA"],
    
  ];
  const dcem = [
    ["CH-1 :", ch1, idc1, kwh1],
    ["CH-2 :", ch2, idc2, kwh2],
    ["CH-3 :", ch3, idc3, kwh3],
    ["CH-4 :", ch4, idc4, kwh4],
    ["CH-5 :", ch5, idc5, kwh5],
  ];
  const currentSiteData = [
    [source],
    [temp],
    [volt],

  ];
  const dgfun=(value)=>{
     setSource(value);
  }


  function calculateAging(aging) {
   
    const inputDate = moment(aging, 'YYYY-MM-DD HH:mm:ss');
    const currentDate = moment();
    const days = currentDate.diff(inputDate, 'days');
    const hours = currentDate.diff(inputDate, 'hours') % 24;
    const minutes = currentDate.diff(inputDate, 'minutes') % 60;
    const seconds = currentDate.diff(inputDate, 'seconds') % 60;
    if (days === 0) {
      if (hours === 0) {
        if (minutes === 0) {
          return seconds + ' seconds ago';
        } else {
          return minutes + ' minutes ago';
        }
      } else {
        return hours + ' hours ago';
      }
    } else {
      return days + ' days ago';
    }
  }
  const handleValueChange = (val,value) => {
    setShowDialog(val);
    if(value){
      setdialogHint("ON");
    }else {
      setdialogHint("OFF");
    }
    
};


const hideDialog=()=>{
  setShowDialog(false);
}

const yesBtn=()=>{
  setShowDialog(false);
    setYes(prevYesClick => prevYesClick + 1);
}
  return (
    <>
    {isConnected ?(isLoading ?
        (<View style={{ justifyContent: 'center', alignItems:'center', flex: 1, backgroundColor: mode ? 'black' : 'white'}}>
          <ActivityIndicator size="large" width={50} height={50} color={['#0a478f','#54c9b2','#e8c592','#e861af']} />
          <Text style={{ fontFamily: 'AndadaPro-Regular', marginTop: 10, fontSize: 20, color: mode ? 'white' : 'black' }}>Data is loading...</Text>
          
      </View>) : (<Animatable.View style={[styles.mainContainer,{backgroundColor:mode?'black':'white'}]} duration={1000} animation="bounceInDown">
        
      <View style={[styles.subContainer,{ backgroundColor: mode ? 'black' : color ,paddingTop:55}]}>
      <TouchableOpacity onPress={onBackPress}>
      <Back width={24} height={24} style={{ marginLeft: 10 }} rotation={90} fill={'white'}></Back>
      </TouchableOpacity>
      <Text style={styles.title}>Site :</Text>
      <Text style={{ fontSize: 18, color: 'white', marginLeft: 8, fontFamily: 'AndadaPro-Regular', flex:1 }}>
        {site_name}</Text>
    </View>
    
    <ScrollView>
   
      <View style={{ margin: 10, flexDirection: 'column', marginLeft: 18, marginBottom: 5, }}>
        <View style={{ flexDirection: 'row' }}>
          <Text style={styles.aging}>Last Seen : </Text>
          <Text style={styles.aging}>{update_at}</Text>
        </View>
        <View style={{ flexDirection: 'row' }}>
          <Text style={styles.aging}>Aging :</Text>
          <Text style={styles.aging}>{calculateAging(update_at)}</Text>
        </View>
      </View>
      
      { (version === "v4" || version === "v2" ) && <DetailSampleShow name={"Current Site Status"} anim={"bounce"} currentSite={currentSiteData} activeAlarm={current}  pendingAlarm ={pending} mode={mode} colorRecevie={color}></DetailSampleShow>}
      <DetailSampleShow name={"Site Details"} anim={"flash"} dataProp={siteDetail} mode={mode} colorRecevie={color}></DetailSampleShow>
      {(version === "v1") && <DetailSampleShow name={"Current Site Status"} anim={"flash"} current={currentSite} mode={mode} colorRecevie={color}></DetailSampleShow>}
      <DetailSampleShow name={"Escalation"} anim={"jello"} dataProp={escalation} mode={mode} colorRecevie={color}></DetailSampleShow>
      <DetailSampleShow name={"I&C Details"} anim={"rubberBand"} dataProp={icDate} mode={mode} colorRecevie={color}></DetailSampleShow>
      <DetailSampleShow name={"Battery Bank Details"} anim={"rubberBand"} dataProp={batteryBankDetail} mode={mode} colorRecevie={color}></DetailSampleShow>
      {(version === "v4") && <DetailSampleShow name={"Alarm Configure"} anim={"rubberBand"} alarmConfig={alarmConfig} mode={mode}  btlv={btlv} hrt={hrt} colorRecevie={color}></DetailSampleShow>}
      {(energy_meter_installed === '1') && (version === "v4") &&
     <DetailSampleShow name={"DCEM"} anim={"swing"} dcem={dcem} volt={volt} mode={mode} colorRecevie={color}></DetailSampleShow>}
     { (version === "v4" || version === "v2") && <DetailSampleShow name={"Run Hours"} anim={"swing"} runHours={"1"} imei={imei} client={client_type_name} d={energy_meter_installed} mode={mode} colorRecevie={color}></DetailSampleShow>}
     { (version === "v4" && lowestLevel!="0" && hooterCnt!= null) &&  <DetailSampleShow name={"Hooter Control"} anim={"wobble"}  mode={mode} hoter_val={true} hooter_cnt={hooterCnt} showDialog={handleValueChange} yesClick={yesPress} imei={imei} colorRecevie={color}></DetailSampleShow>}
     {(version === "v4" && currentSiteData != null && source != "NA"  && source != null && automation  && lowestLevel!="0") && (
  <DGController mode={mode} name={"DG Control"} source={currentSiteData[0]} dg={dgfun} imei={imei} autocall={refresh}/>)}
     { (version === "v4" || version === "v2" ) &&  <DetailSampleShow name={"Alarm Reports"} anim={"wobble"} logData={log} mode={mode} colorRecevie={color}></DetailSampleShow>}
     {(version === "v1") &&  <DetailSampleShow name={"Alarm Reports"} anim={"wobble"} logv1={logv1} mode={mode} colorRecevie={color}></DetailSampleShow>}
    </ScrollView>
   {showDialog && (<View style={{position: 'absolute',flex: 1,top: 0,left: 0,backgroundColor: 'rgba(0,0,0,0.5)',
    width: Dimensions.get('window').width,height: Dimensions.get('window').height,justifyContent:'center' ,alignItems:'center'}}>
       <View style={{backgroundColor:mode?'#3f3f3f':'white' ,borderRadius:18, width:280,height:250,justifyContent:'center',alignItems:'center'}}>
                       <View style={{justifyContent:'flex-end' ,alignItems:'flex-end',width:'100%', marginRight:29,marginTop:0}}>
                       <TouchableOpacity onPress={hideDialog}>
                       <Cross width={25} height={25} fill={'white'} ></Cross>
                       </TouchableOpacity>
                       </View>

                      <Image source={SadLogOut} style={[styles.imageLog,{width:90,height:90}]}></Image>
                      <Text style={[styles.text,{fontSize:15,color:mode?'white':'black', marginTop:10}]}>Are You Sure you want to {dialogHint} Hooter</Text>
                      <View style={{flexDirection:'row',marginTop:12}}>
                       <TouchableOpacity style={[styles.logoutStyle,{backgroundColor:mode?'#840000':'red'}]}  onPress={yesBtn}>
                           <Text style={[styles.text,{fontSize:15,color:'white',paddingLeft:10,paddingRight:10}]}>Yes</Text>
                       </TouchableOpacity>
                       <TouchableOpacity style={[styles.logoutStyle,{backgroundColor:mode?'#033519':'green'}]} onPress={hideDialog} >
                        <Text style={[styles.text,{fontSize:15,color:'white',paddingLeft:10,paddingRight:10}]}>No </Text>
                       </TouchableOpacity>
                      </View>
                      </View>
                     
                      </View>
                    )}
  </Animatable.View>)):(<NoInternet></NoInternet>)} 
  </>
   
  );
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
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 2,
    paddingBottom: 20,
   
  },
  title: {
    fontSize: 18,
    color: 'white',
    marginLeft: 16,
    fontFamily: 'AndadaPro-Regular'

  },
  aging: {
    color: 'red',
    fontFamily: 'digital-7 (mono)',
    fontSize: 17
  },
  menuContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menu: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
  },
  menuItem: {
    paddingVertical: 10,
    alignItems: 'center',
  }, logoutStyle:{
    margin:8,
    borderRadius:8,
    padding:8,
    backgroundColor:'red'
 
}
})

export default SiteDetail;
