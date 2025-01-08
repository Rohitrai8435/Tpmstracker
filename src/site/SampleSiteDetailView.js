import React from 'react';
import { View, StyleSheet, Linking } from 'react-native';
import { Text } from 'react-native-animatable';
import * as Animatable from 'react-native-animatable';
import Hooter from '../../assets/svg/hootericon.svg'
import { TouchableOpacity } from 'react-native-gesture-handler';
const SampleSiteDetailView = ({ name, value, view,color,col, alarmType, hotterInstal,mode,btlv,hrt }) => {
    const handlePress = (open, application) => {
        Linking.openURL(`${open}${application}`);

    };
    if (view === '1') {
        return (
            <Animatable.View style={{ flex: 1 }} animation={'lightSpeedIn'} duration={500}>
                <View style={styles.container}>
                    <Text style={[styles.title,{color:mode?'white':'black',flex:1.2}]}>{name}</Text>
                    {['L1 :', 'L2 :', 'L3 :', 'L4 :', 'L5 :'].includes(name) ? (
    <TouchableOpacity onPress={() => handlePress('tel:', value)}>
      <Text style={[styles.title, {color: mode ? 'white' : 'black', flex: 2, textAlign: 'right'}]} selectable>{value}</Text>
    </TouchableOpacity> ) : (
    <Text style={[styles.title, {color: mode ? 'white' : 'black', flex: 2, textAlign: 'right'}]} selectable>
      {value}
    </Text>
  )}
                </View>
                <View style={{ marginHorizontal: 18, height: 1,marginVertical:0.2 }}></View>
            </Animatable.View>
        );
    }
  else if (col === "y") {
        return (
            <Animatable.View style={{ flex: 1 }} animation={'lightSpeedIn'} duration={500}>
                <View style={styles.container}>
                    <Text style={[styles.title,{color:mode?'white':'black'}]}>{name}</Text>
                    <Text style={[styles.title,{color:color, flex:1, flexWrap: 'wrap',alignContent:'flex-end',textAlign:'right'}]}>{value}</Text>
                </View>
                <View style={{ marginHorizontal: 18, height: 1,  }}></View>
            </Animatable.View>
        );
    }
    else {
        return (
            <Animatable.View style={{ flex: 1 }} animation={'lightSpeedIn'} duration={500}>
                <View style={styles.container}>
                    <Text style={[styles.title,{color:mode?'white':'black'}]}>{name}</Text>
                    {(alarmType === 'TPMS' && hotterInstal === 'yes' && name !='BTLV' && name !='HRT' ) ? (
                        <Hooter width={24} height={24} style={{ marginRight: 10 }} fill={'green'} />
                    ):name =='HRT'?(<Text style={[styles.title,{color:'red'}]}> {hrt ? hrt : ''}</Text>):name =='BTLV'?(<Text style={[styles.title,{color:'red'}]}> {btlv?btlv : ''}</Text>):(<></>)}
                </View>
                <View style={{ marginHorizontal: 18, height: 1,  }}></View>
            </Animatable.View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        marginLeft: 10,
        marginRight: 10,
        padding: 10,
        justifyContent: 'space-between',

    },
    title: {
        paddingLeft: 10,
        paddingRight: 10,
        paddingTop: 5,
        fontFamily: 'AndadaPro-Regular',
        color: 'black',
        fontSize: 15,
    }
})

export default SampleSiteDetailView;
