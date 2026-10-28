import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Back from '../assets/svg/drop.svg';
import NetInfo from '@react-native-community/netinfo';
import NoInternet from './NoInternet';
import Toast from 'react-native-toast-message';
import { get_complaint_categories, submit_qc_complaint } from './service/ApiService';

const COMPLAINT_CATEGORIES = [
  {id: '1', label: '🔧 Hardware Issue'},
  {id: '2', label: '💻 Software Issue'},
  {id: '3', label: '📡 Connectivity Issue'},
  {id: '4', label: '🔋 Battery Issue'},
  {id: '5', label: '🔋 Alarm Issue'},
  {id: '6', label: '📡 Network Issue'},
];

const PRIORITY_LEVELS = [
  {id: 'low', label: 'Low', color: '#10b981'},
  {id: 'medium', label: 'Medium', color: '#f59e0b'},
  {id: 'high', label: 'High', color: '#ef4444'},
];

const SubmitComplaint = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {item} = route.params;

  const [isConnected, setIsConnected] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedPriority, setSelectedPriority] = useState('medium');
  const [COMPLAINT_CATEGORIES, setCOMPLAINT_CATEGORIES] = useState([]);
 
  const [description, setDescription] = useState('');


  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected && state.isInternetReachable);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await get_complaint_categories();
        if (response.status === 'success') {
          console.log('Fetched Categories:', response.data);
          setCOMPLAINT_CATEGORIES(response.data);
        } else {
          // Fallback to hardcoded if API fails
          // setCOMPLAINT_CATEGORIES([
          //   {id: '1', label: '🔧 Hardware Issue'},
          //   {id: '2', label: '💻 Software Issue'},
          //   {id: '3', label: '📡 Connectivity Issue'},
          //   {id: '4', label: '🔋 Battery Issue'},
          //   {id: '5', label: '🔔 Alarm Issue'},
          //   {id: '6', label: '📶 Network Issue'},
          // ]);
        }
      } catch (error) {
        //Fallback to hardcoded if API fails
        setCOMPLAINT_CATEGORIES([
          {id: '1', label: '🔧 Hardware Issue'},
          {id: '2', label: '💻 Software Issue'},
          {id: '3', label: '📡 Connectivity Issue'},
          {id: '4', label: '🔋 Battery Issue'},
          {id: '5', label: '🔔 Alarm Issue'},
          {id: '6', label: '📶 Network Issue'},
        ]);
      }
    };
    loadCategories();
  }, []);

  const handleSubmit = async () => {
    const userData = JSON.parse(await AsyncStorage.getItem('userData'));

    if (!selectedCategory) {
      Toast.show({type: 'error', text1: 'Select a complaint category'});
      return;
    }
    if (!description.trim()) {
      Toast.show({type: 'error', text1: 'Description is required'});
      return;
    }

    try {
      setIsLoading(true);

      const payload = {
        imei: item.imei,
        serial_no: item.serail_no,
        qc_tracker_id: item.qc_tracker_id,
        category: parseInt(selectedCategory),
        priority: selectedPriority,
        complain_given_by: userData.id,
        description: description.trim(),
      };

      console.log('Complaint Payload:', payload);

      const response = await submit_qc_complaint(payload);

      if (response.status !== 'success') {
        throw new Error(response.message || 'Failed to submit complaint');
      }

      Toast.show({
        type: 'success',
        text1: 'Complaint Submitted! ✅',
        text2: 'Our team will get back to you shortly.',
      });

      navigation.goBack();
      

      
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to submit complaint');
    } finally {
      setIsLoading(false);
    }
  };

  return !isConnected ? (
    <NoInternet />
  ) : (
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Back width={24} height={24} rotation={90} fill={'white'} />
        </TouchableOpacity>
        <View style={styles.headerTextWrapper}>
          <Text style={styles.headerTitle}>Submit Complaint</Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>
            IMEI: {item.imei}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        {/* Device Info Card */}
        <View style={styles.deviceCard}>
          <Text style={styles.sectionTitle}>📱 Device Information</Text>
          <View style={styles.deviceGrid}>
            <DeviceInfo label="Serial No" value={item.serail_no} />
            <DeviceInfo label="Product Type" value={item.product_type} />
            <DeviceInfo label="Service Type" value={item.service_type} />
            <DeviceInfo label="QC Team" value={item.qs_team_name} />
            <DeviceInfo label="Tracker ID" value={`#${item.qc_tracker_id}`} />
          </View>
        </View>

        {/* Category */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            🗂 Complaint Category <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.categoryGrid}>
            {COMPLAINT_CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryChip,
                  selectedCategory === cat.id && styles.categoryChipActive,
                ]}
                onPress={() => setSelectedCategory(cat.id)}
                activeOpacity={0.7}>
                <Text
                  style={[
                    styles.categoryChipText,
                    selectedCategory === cat.id &&
                      styles.categoryChipTextActive,
                  ]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Priority */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🚦 Priority Level</Text>
          <View style={styles.priorityRow}>
            {PRIORITY_LEVELS.map(p => (
              <TouchableOpacity
                key={p.id}
                style={[
                  styles.priorityBtn,
                  {borderColor: p.color},
                  selectedPriority === p.id && {backgroundColor: p.color},
                ]}
                onPress={() => setSelectedPriority(p.id)}
                activeOpacity={0.8}>
                <Text
                  style={[
                    styles.priorityBtnText,
                    {color: selectedPriority === p.id ? '#fff' : p.color},
                  ]}>
                  {p.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

       

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            📄 Description <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe your issue in detail ..."
            placeholderTextColor="#aaa"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            maxLength={500}
          />
          <Text style={styles.charCount}>{description.length}/500</Text>
        </View>

       

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitBtn, isLoading && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
          activeOpacity={0.85}>
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.submitBtnText}>🎫 Submit Complaint</Text>
          )}
        </TouchableOpacity>

        <View style={{height: 30}} />
      </ScrollView>

      <Toast />
    </KeyboardAvoidingView>
  );
};

const DeviceInfo = ({label, value}) => (
  <View style={styles.deviceInfoItem}>
    <Text style={styles.deviceInfoLabel}>{label}</Text>
    <Text style={styles.deviceInfoValue}>{value || '—'}</Text>
  </View>
);

export default SubmitComplaint;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 20,
    paddingTop: 60,
    paddingHorizontal: 20,
    backgroundColor: '#fcad2e',
  },
  backButton: {
    marginRight: 10,
  },
  headerTextWrapper: {
    flex: 1,
    paddingLeft: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.85,
    marginTop: 2,
  },
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  scrollContent: {
    padding: 16,
  },

  // Device Card
  deviceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 4,
  },
  deviceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    gap: 10,
  },
  deviceInfoItem: {
    width: '47%',
  },
  deviceInfoLabel: {
    fontSize: 11,
    color: '#888',
  },
  deviceInfoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginTop: 2,
  },

  // Section
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    marginBottom: 10,
  },
  required: {
    color: '#ef4444',
  },
  optional: {
    fontSize: 12,
    color: '#aaa',
    fontWeight: '400',
  },

  // Category
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: '#fafafa',
  },
  categoryChipActive: {
    borderColor: '#fcad2e',
    backgroundColor: '#fcad2e20',
  },
  categoryChipText: {
    fontSize: 13,
    color: '#555',
  },
  categoryChipTextActive: {
    color: '#fcad2e',
    fontWeight: '700',
  },

  // Priority
  priorityRow: {
    flexDirection: 'row',
    gap: 10,
  },
  priorityBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  priorityBtnText: {
    fontWeight: '700',
    fontSize: 14,
  },

  // Input
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: '#333',
    backgroundColor: '#fafafa',
  },
  textArea: {
    minHeight: 110,
    lineHeight: 22,
  },
  charCount: {
    fontSize: 11,
    color: '#bbb',
    textAlign: 'right',
    marginTop: 4,
  },

  // Submit
  submitBtn: {
    backgroundColor: '#fcad2e',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#fcad2e',
    shadowOpacity: 0.4,
    shadowOffset: {width: 0, height: 4},
    shadowRadius: 8,
    marginTop: 4,
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
});
