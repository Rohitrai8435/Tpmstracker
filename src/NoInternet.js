import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import InterNetOff from '../assets/loties/nointernet.json'
import LottieView from 'lottie-react-native';
import * as Animatable from 'react-native-animatable';
const NoInternet = () => {
    const [isConnected, setIsConnected] = useState(true);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            setIsConnected(state.isConnected);
        });

        return () => {
            unsubscribe();
        };
    }, []);

    return (
        <View style={styles.container}>
            {!isConnected && (<View style={styles.container}><LottieView source={InterNetOff} width={Dimensions.get('window').width - 100}
                height={Dimensions.get('window').height - 550} autoPlay loop />
                <Animatable.Text style={styles.noInternetText}  iterationCount={Infinity} animation={'flipInY'}>No Internet Connection!!</Animatable.Text>
                <Animatable.Text style={styles.noInternetText} iterationCount={Infinity} animation={'flipInY'}>Please Check Your Connection</Animatable.Text></View>)}

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#c9ddf5',
    },
    noInternetText: {
        color: 'red',
        fontSize: 18,
        fontFamily:'AndadaPro-Medium'
    },
});


export default NoInternet;
