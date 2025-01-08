import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-animatable';
import Watch from '../../assets/svg/watch.svg'
import { useEffect, useState } from 'react';
const AlarmReport = ({ name, start, end,mode,temp,volt ,version,color}) => {
  const [alarmStatus, setAlarmStatus] = useState('');

  useEffect(() => {
    if (end === null) {
      
      const startDate = new Date(start);
      const currentDate = new Date();
      const startMidnight = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
      const currentMidnight = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
      const timeDifferenceInDays = (currentMidnight - startMidnight) / (1000 * 60 * 60 * 24);
      
      if (timeDifferenceInDays <= 1) {
        setAlarmStatus('Active');
       // activeAlarms.push(alarmData);
      }else {
        setAlarmStatus('Pending');
      }
      
    } else {
      setAlarmStatus(end);
    }
  }, [end, start]);

  if(version ==="v1"){
    return (
      <View>
        <View style={[styles.container ,{backgroundColor:mode?'#3f3f3f':'#fff'}]}>
          <View style={[styles.header,{ backgroundColor:mode?'#3f3f3f':color}]}>
            <Text style={styles.title}>{name}</Text>
          </View>
          <View style={styles.subContainer}>
            <View style={{ flexDirection: 'row' }}>
              <Watch width={24} height={24} fill={mode?'white':'#0a478f'}></Watch>
              <Text style={[styles.text,{color:mode?'white':'black'}]}>Date Time</Text>
            </View>
            <Text style={[styles.text,{color:mode?'white':'black'}]}>{start}</Text>
          </View>
          <View style={styles.subContainer}>
            <View style={{ flexDirection: 'row',marginTop:5,flex:1.3}}>
              <Watch width={24} height={24} fill={mode?'white':'#0a478f'} rotation={180}></Watch>
              <Text style={[styles.text,{color:mode?'white':'black'}]}>Description</Text>
            </View>
            <Text style={[styles.text,{color:mode?'white':'black',flex: 2,alignItems:'flex-end',justifyContent:'flex-end',textAlign:'right'}]}>{end}</Text>
          </View>
          <View style={styles.subContainer}>
            <View style={{ flexDirection: 'row',marginTop:5,flex:1 }}>
              <Watch width={24} height={24} fill={mode?'white':'#0a478f'} rotation={180}></Watch>
              <Text style={[styles.text,{color:mode?'white':'black'}]}>Call Acknowledge</Text>
            </View>
            <Text style={[styles.text,{color:mode?'white':'black',flex: 1,textAlign:'right'}]}>{temp}</Text>
          </View>
        </View>
  
      </View>
    );
  }else{
  return (
    <View>
      <View style={[styles.container ,{backgroundColor:mode?'#3f3f3f':'#fff'}]}>
        <View style={[styles.header, alarmStatus === 'Active' ? { backgroundColor: '#ff3535' } : alarmStatus === 'Pending' ? { backgroundColor: '#fed000' } : { backgroundColor: '#4fa64f' }]}>
          <Text style={styles.title}>{name}</Text>
        </View>
        <View style={styles.subContainer}>
          <View style={{ flexDirection: 'row' }}>
            <Watch width={24} height={24} fill={mode?'white':'#0a478f'}></Watch>
            <Text style={[styles.text,{color:mode?'white':'black'}]}>Start Time</Text>
          </View>
          <Text style={[styles.text,{color:mode?'white':'black'}]}>{start}</Text>
        </View>
        <View style={styles.subContainer}>
          <View style={{ flexDirection: 'row',marginTop:5 }}>
            <Watch width={24} height={24} fill={mode?'white':'#0a478f'} rotation={180}></Watch>
            <Text style={[styles.text,{color:mode?'white':'black'}]}>End Time</Text>
          </View>
          <Text style={[styles.text,{color:mode?'white':'black'}]}>{alarmStatus}</Text>
        </View>
        <View style={styles.subContainer}>
          <View style={{ flexDirection: 'row',marginTop:5 }}>
            <Watch width={24} height={24} fill={mode?'white':'#0a478f'} rotation={180}></Watch>
            <Text style={[styles.text,{color:mode?'white':'black'}]}>Voltage</Text>
          </View>
          <Text style={[styles.text,{color:mode?'white':'black'}]}>{volt}</Text>
        </View>
        <View style={styles.subContainer}>
          <View style={{ flexDirection: 'row',marginTop:5 }}>
            <Watch width={24} height={24} fill={mode?'white':'#0a478f'} rotation={180}></Watch>
            <Text style={[styles.text,{color:mode?'white':'black'}]}>Temperature</Text>
          </View>
          <Text style={[styles.text,{color:mode?'white':'black'}]}>{temp}</Text>
        </View>
      </View>

    </View>
  );}

}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    borderBottomEndRadius: 30,
    borderTopStartRadius: 30,
    marginLeft: 15,
    marginTop: 6,
    marginRight: 15,
    paddingBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    marginBottom: 8,
    borderTopLeftRadius: 30,
    justifyContent: 'space-between',
    alignItems: 'center',
    //#0a478f#4fa64f
  },
  title: {
    fontSize: 16,
    fontFamily: 'AndadaPro-Regular',
    padding: 10,
    paddingLeft: 14,
    color: 'white',
    flexWrap: 'wrap',
  },
  subContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
  },
  text: {
    fontSize: 16,
    fontFamily: 'AndadaPro-Regular',
    color:'black'
  },
})

export default AlarmReport;
