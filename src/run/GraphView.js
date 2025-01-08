import { useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { View, Dimensions, StyleSheet, Text, Animated } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { ScrollView } from 'react-native-gesture-handler';
import Orientation from 'react-native-orientation-locker'; // Import Orientation
import * as Animatable from 'react-native-animatable';
const GraphView = () => {
    const [orientation, setOrientation] = useState('portrait');
    useEffect(() => {
        const updateOrientation = () => {
            const isLandscape = Dimensions.get('window').width > Dimensions.get('window').height;
            setOrientation(isLandscape ? 'landscape' : 'portrait');
        };

        Orientation.lockToLandscape();
        updateOrientation();

        const subscription = Dimensions.addEventListener('change', updateOrientation);
        return () => {
            subscription.remove();
            Orientation.unlockAllOrientations();
        };
    }, []);

    const route = useRoute();
    const result = route.params;
    const [show, setShow] = useState(null);
    const [x, setX] = useState(null);
    const [y, setY] = useState(null);
    console.log(result);
    const [backgroundColor] = useState(new Animated.Value(0));
    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(backgroundColor, {
                    toValue: 1,
                    duration: 2000, // Duration for each color change
                    useNativeDriver: false
                }),
                Animated.timing(backgroundColor, {
                    toValue: 0,
                    duration: 2000, // Duration for each color change
                    useNativeDriver: false
                })
            ])
        ).start();
    }, []);

    const interpolatedColor = backgroundColor.interpolate({
        inputRange: [0, 0.4, 0.8, 1],
        outputRange: ['#dae2f8', '#ffedbc', '#ffe47a', '#4389a2'] // Specify the colors you want to transition between
    });

    const handleDataPointClick = (index, x, y) => {
        setShow(index);
        setX(x);
        setY(y);
        console.log(x + " " + y + " " + index);
    };

    const timeStringToSeconds = (timeString) => {
        const [hours, minutes, seconds] = timeString.split(':').map(parseFloat);
        return hours * 3600 + minutes * 60 + seconds;
    };


    // Extract labels and datasets from result
    const labels = result.map(item => item.date);
    const datasets = [

        {
            name: 'SOEB',
            data: result.map(item => timeStringToSeconds(item.timeSoeb)),
            strokeWidth: 2,
            color: (opacity = 1) => `rgba(83, 207, 23, ${opacity})`,
        },
        {
            name: 'SODG',
            data: result.map(item => timeStringToSeconds(item.timeSodg)),
            strokeWidth: 2,
            color: (opacity = 1) => `rgba(235, 0, 61, ${opacity})`,
        },
        {
            name: 'SOBT',
            data: result.map(item => timeStringToSeconds(item.timeSobt)),
            strokeWidth: 2,
            color: (opacity = 1) => `rgba(255,193,7, ${opacity})`,
        },
        {
            name: 'kwhSoeb',
            data: result.map(item => item.kwhSoeb),
            strokeWidth: 2,
            color: (opacity = 1) => `rgba(245, 203, 167, ${opacity})`,
        },
        {
            name: 'kwhSodg',
            data: result.map(item => item.kwhSodg),
            strokeWidth: 2,
            color: (opacity = 1) => `rgba(40, 55, 71, ${opacity})`,
        },
        {
            name: 'kwhSobt',
            data: result.map(item => item.kwhSobt),
            strokeWidth: 2,
            color: (opacity = 1) => `rgba(36, 113, 163, ${opacity})`,
        }
        // Add more datasets as needed

    ];
    return (
        <Animated.View style={[styles.container, { flexDirection: orientation === 'landscape' ? 'row' : 'column' },]}>
            <ScrollView >
                <LineChart
                    bezier
                    withHorizontalLabels={false}
                    withVerticalLabels={false}
                    data={{
                        labels: labels,
                        datasets: datasets,
                        legend: ['SOEB RUN', 'SODG RUN', 'SOBT RUN', 'KWH SOEB', 'KWH SODG', 'KWH SOBT'],
                    }}
                    width={Dimensions.get('window').width-10}
                    height={Dimensions.get('window').height-70}
                    onDataPointClick={({ index, x, y }) => handleDataPointClick(index, x, y)}
                    chartConfig={{
                        backgroundColor: 'transparent',
                        backgroundGradientFrom: 'rgba(239, 243, 255, 0)',
                        backgroundGradientTo: 'rgba(239, 243, 255, 0)',
                        decimalPlaces: 2,
                        color: (opacity = 0) => `rgba(0, 0, 0, ${opacity})`,
                        style: {
                            borderRadius: 16,
                        },
                    }}

                    style={{
                        borderRadius: 16,
                        backgroundColor: 'transparent'
                    }}
                />
           
            {show !== null && (
                
                <Animated.View style={{ backgroundColor: interpolatedColor, position: 'absolute', top: y-17, left: x-50, padding: 6, borderBottomRightRadius: 26, borderTopLeftRadius: 16 }}>
                 
                    <Animatable.View style={{}} duration={1000} animation={'zoomIn'}>
                      
                        <Text style={{ fontFamily: 'AndadaPro-Regular', color: 'blue' }}>DATE : {result[show].date}</Text>
                        <Text style={{ fontFamily: 'AndadaPro-Regular', color: '#53CF17' }}>SOEB : {result[show].timeSoeb}</Text>
                        <Text style={{ fontFamily: 'AndadaPro-Regular', color: '#EB003D' }}>SODG : {result[show].timeSodg}</Text>
                        <Text style={{ fontFamily: 'AndadaPro-Regular', color: '#FFC107' }}>SOBT : {result[show].timeSobt}</Text>
                        <Text style={{ fontFamily: 'AndadaPro-Regular', color: '#F5CBA7' }}>Kwh SOEB : {result[show].kwhSoeb}</Text>
                        <Text style={{ fontFamily: 'AndadaPro-Regular', color: '#283747' }}>Kwh SODG : {result[show].kwhSodg}</Text>
                        <Text style={{ fontFamily: 'AndadaPro-Regular', color: '#2471A3' }}>Kwh SOBT : {result[show].kwhSobt}</Text>
                     
                    </Animatable.View>
                   
                </Animated.View >
               
               )}
                </ScrollView>
        </Animated.View>

    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    selectedPointContainer: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 8,
        marginTop: 8,
    },
});

export default GraphView;
