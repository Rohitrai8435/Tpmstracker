import React from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

const Privacy = () => {
  return (
    <>
    <StatusBar translucent={true} backgroundColor="transparent" barStyle="dark-content" />
    <View style={styles.container}>
      <WebView 
        source={{ uri:'https://dashboard.shrotitele.com/policy/privacypolicy.html' }}
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
        backgroundColor: '#004080',
      
    },
});

export default Privacy;
