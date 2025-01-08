import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Avatar from '../../assets/svg/avatar.svg';
const DrawerItem = () => {
  return (
    <View style={{padding:10,
        flexDirection:'row',
        alignItems:'center',
        backgroundColor:'black',
        margin:6,
        borderRadius:8
       }}>
     <Avatar width={35} height={35}></Avatar>
     <View style={{alignItems:'center',marginLeft:20 }}>
     <Text style={{fontSize:16 ,fontWeight:700}}>Hellow</Text>
     </View>
    </View>
  )
}

export default DrawerItem

const styles = StyleSheet.create({})