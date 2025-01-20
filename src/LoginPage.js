import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  SafeAreaView,
  View,
  Image,
  Text,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import logo from '../assets/account.png';
import {getLogin} from './service/ApiService';
export default function LoginPage() {
  const navigation = useNavigation();
  const [form, setForm] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false); // Loading state for modal

  const login = async () => {
    setIsLoading(true); // Show loading dialog
    try {
      const response = await getLogin(form.email, form.password);

      if (response.status === 'success') {
        await AsyncStorage.setItem('userData', JSON.stringify(response.data));
        setIsLoading(false);
        navigation.reset({
          index: 0,
          routes: [{name: 'BookingScreen'}],
        });
        //navigation.navigate('BookingScreen');
      } else {
        setIsLoading(false); // Hide loading dialog
        Alert.alert(
          'Login Failed',
          response.message || 'Invalid email or password.',
        );
      }
    } catch (error) {
      setIsLoading(false); // Hide loading dialog
      Alert.alert('Error', 'Something went wrong. Please try again later.');
      console.error(error);
    }
  };
 
  return (
    <>
      <StatusBar
        translucent={true}
        backgroundColor="transparent"
        barStyle="dark-content"
      />
      <SafeAreaView style={{flex: 1, backgroundColor: '#e8ecf4'}}>
        <KeyboardAwareScrollView style={styles.container}>
          <View style={styles.header}>
            <Image
              alt="App Logo"
              resizeMode="contain"
              style={styles.headerImg}
              source={require('../assets/logo.png')}
            />

            <Text style={styles.title}>
              Sign in to <Text style={{color: '#075eec'}}>TpmsTracker</Text>
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.input}>
              <Text style={styles.inputLabel}>Email / Mobile</Text>

              <TextInput
                autoCapitalize="none"
                autoCorrect={false}
                clearButtonMode="while-editing"
                keyboardType="email-address"
                onChangeText={email => setForm({...form, email})}
                placeholder="Enter Mobile No"
                placeholderTextColor="#6b7280"
                style={styles.inputControl}
                value={form.email}
              />
            </View>

            <View style={styles.input}>
              <Text style={styles.inputLabel}>Password</Text>

              <TextInput
                autoCorrect={false}
                clearButtonMode="while-editing"
                onChangeText={password => setForm({...form, password})}
                placeholder="********"
                placeholderTextColor="#6b7280"
                style={styles.inputControl}
                secureTextEntry={true}
                value={form.password}
              />
            </View>

            <View style={styles.formAction}>
              <TouchableOpacity onPress={login}>
                <View style={styles.btn}>
                  <Text style={styles.btnText}>Sign in</Text>
                </View>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => {
                navigation.navigate('ForgetPassword');
              }}>
              <Text style={styles.formLink}>Forgot password?</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAwareScrollView>

        <TouchableOpacity onPress={() => {}}>
          <Text style={styles.formFooter}>
            Don't have an account?{' '}
            <Text style={{textDecorationLine: 'underline'}}>Sign up</Text>
          </Text>
        </TouchableOpacity>

        {/* Loading Modal */}
        <Modal visible={isLoading} transparent={true} animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <ActivityIndicator size="large" color="#075eec" />
              <Text style={styles.modalText}>Verifying credentials...</Text>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 24,
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
  },
  title: {
    fontSize: 31,
    fontWeight: '700',
    color: '#1D2A32',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#929292',
    justifyContent: 'flex-start',
    alignSelf: 'flex-start',
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 36,
  },
  headerImg: {
    width: 80,
    height: 80,
    alignSelf: 'center',
    marginBottom: 36,
  },
  form: {
    marginBottom: 24,
    paddingHorizontal: 24,
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
  },
  formAction: {
    marginTop: 4,
    marginBottom: 16,
  },
  formLink: {
    fontSize: 16,
    fontWeight: '600',
    color: '#075eec',
    textAlign: 'center',
  },
  formFooter: {
    paddingVertical: 24,
    fontSize: 15,
    fontWeight: '600',
    color: '#222',
    textAlign: 'center',
    letterSpacing: 0.15,
  },
  input: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: '#222',
    marginBottom: 8,
  },
  inputControl: {
    height: 50,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    borderRadius: 12,
    fontSize: 15,
    fontWeight: '500',
    color: '#222',
    borderWidth: 1,
    borderColor: '#C9D3DB',
    borderStyle: 'solid',
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    backgroundColor: '#075eec',
    borderColor: '#075eec',
  },
  btnText: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '600',
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 200,
    height: 120,
    backgroundColor: '#fff',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalText: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#075eec',
  },
});
