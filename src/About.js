import React from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

const About = () => {
  return (
    <>
    <StatusBar translucent={true} backgroundColor="transparent" barStyle="dark-content" />
    <View style={styles.container}>
      <WebView 
        source={{ uri: 'https://shroti.in/about.html' }}
        style={{ flex: 1 }}
      />
    </View>
    </>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
       paddingTop: 25,
        backgroundColor: '#fff',
      
    },
});

export default About;
