import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  StatusBar,
  FlatList,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import {WebView} from 'react-native-webview';
import Back from '../assets/svg/drop.svg';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {get_qc_master} from './service/ApiService';
import Toast from 'react-native-toast-message';
import NetInfo from '@react-native-community/netinfo';
import NoInternet from './NoInternet';

const TestSystem = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState([]);
  const [webViewVisible, setWebViewVisible] = useState(false);
  const [webViewUrl, setWebViewUrl] = useState('');
  const [webViewLoading, setWebViewLoading] = useState(true);
  const [selectedImei, setSelectedImei] = useState('');

  const controller = new AbortController();
  const navigation = useNavigation();

  useEffect(() => {
    const fetch_qc_report = async () => {
      try {
        setIsLoading(true);
        const userData = JSON.parse(await AsyncStorage.getItem('userData'));
        
       console.log(userData.assignCircle)
        const response = await get_qc_master(
          controller.signal,
          userData.assignCircle,
          userData.designation,
        );
        
        if (response.status === 'success') {
          setOptions(response?.data);
          console.log('QC Master Data:', response.rdata);
        } else {
          Alert.alert('Error', response.message || 'Unknown error');
        }
      } catch (error) {
        if (axios.isCancel(error)) {
          console.log('Request cancelled:', error.message);
        } else {
          Alert.alert('Error fetching data:', error.message);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetch_qc_report();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected && state.isInternetReachable);
    });
    return () => unsubscribe();
  }, []);

  const handleImeisystemPress = imei => {
    setSelectedImei(imei);
    setWebViewUrl(`https://soc.shrotitele.com/tpiams_test.php?imei=${imei}`);
    setWebViewLoading(true);
    setWebViewVisible(true);
  };
  const handleImeiPress = imei => {
    setSelectedImei(imei);
    setWebViewUrl(`https://soc.shrotitele.com/test.php?imei=${imei}`);
    setWebViewLoading(true);
    setWebViewVisible(true);
  };

  const filteredData = options.filter(
    item =>
      item.imei?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.serail_no?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.invoice_no?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const getStatusColor = status => {
    switch (status?.toLowerCase()) {
      case 'dispateched':
        return '#f59e0b';
      case 'completed':
        return '#10b981';
      case 'pending':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const InfoItem = ({label, value, icon}) => (
    <View style={styles.infoItem}>
      <Text style={styles.infoLabel}>
        {icon} {label}
      </Text>
      <Text style={styles.infoValue}>{value || '—'}</Text>
    </View>
  );

  const renderItem = ({item}) => (
    <View style={styles.card}>
      {/* Card Header */}
      
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <Text style={styles.imeiLabel}>IMEI</Text>
          <TouchableOpacity
            onPress={() => handleImeiPress(item.imei)}
            activeOpacity={0.7}
            style={styles.imeiRow}>
            <Text style={styles.imeiValue}>{item.imei}</Text>
            <View style={styles.viewBadge}>
              <Text style={styles.viewBadgeText}>🔗 View</Text>
            </View>
          </TouchableOpacity>
        </View>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: getStatusColor(item.status) + '20',
              borderColor: getStatusColor(item.status),
            },
          ]}>
          <Text
            style={[styles.statusText, {color: getStatusColor(item.status)}]}>
            {item.status}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Card Body */}
      <View style={styles.cardBody}>
        <View style={styles.row}>
          <InfoItem label="Serial No" value={item.serail_no} icon="📦" />
          <InfoItem label="Product Type" value={item.product_type} icon="📱" />
          <InfoItem label="Service Type" value={item.service_type} icon="🔧" />
        </View>
        <View style={styles.row}></View>
        <View style={styles.row}>
          <InfoItem label="Client name" value={item.client_name} icon="🪪" />
          <InfoItem label="State name" value={item.state_name} icon="🪪" />
          <InfoItem label="QC Team" value={item.qs_team_name} icon="👤" />
        </View>
        <View style={styles.row}>
          <InfoItem
            label="Dispatch Date"
            value={item.dispatech_date}
            icon="📅"
          />
          <InfoItem label="QC Date" value={item.qc_date} icon="✅" />
          <TouchableOpacity
            style={styles.queryBtn}
            onPress={() => navigation.navigate('SubmitComplaint', {item})}>
            <Text style={styles.queryBtnText}>🎫 Ask Query</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.queryBtn}
            onPress={() => handleImeisystemPress(item.imei)}>
            <Text style={styles.queryBtnText}>📡 Check current status</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Card Footer */}
      <View style={styles.cardFooter}>
        <Text style={styles.footerText}>Tracker ID: #{item.qc_tracker_id}</Text>
        <Text style={styles.footerText}>
          Updated: {item.updated_at?.slice(0, 10)}
        </Text>
      </View>
    </View>
  );

  return isConnected ? (
    <>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Back width={24} height={24} rotation={90} fill={'white'} />
        </TouchableOpacity>
        <Text style={styles.headerText}>TestSystem</Text>
      </View>

      <Toast />

      <View style={styles.container}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by IMEI, Serial No, Invoice..."
          placeholderTextColor="#888"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        {isLoading ? (
          <View style={styles.centerMessage}>
            <ActivityIndicator size="large" color="#fcad2e" />
            <Text style={styles.centerText}>Loading...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredData}
            keyExtractor={item => item.qc_tracker_id?.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.centerMessage}>
                <Text style={styles.centerText}>No records found</Text>
              </View>
            }
          />
        )}
      </View>

      {/* ✅ WebView Modal */}
      <Modal
        visible={webViewVisible}
        animationType="slide"
        onRequestClose={() => setWebViewVisible(false)}>
        <StatusBar
          translucent
          backgroundColor="transparent"
          barStyle="dark-content"
        />

        {/* Modal Header */}
        <View style={styles.modalHeader}>
          <TouchableOpacity
            onPress={() => setWebViewVisible(false)}
            style={styles.backButton}>
            <Back width={24} height={24} rotation={90} fill={'white'} />
          </TouchableOpacity>
          <View style={styles.modalHeaderText}>
            <Text style={styles.modalTitle}>IMEI Details</Text>
            <Text style={styles.modalSubtitle} numberOfLines={1}>
              {selectedImei}
            </Text>
          </View>
          {webViewLoading && (
            <ActivityIndicator
              size="small"
              color="#fff"
              style={{marginLeft: 8}}
            />
          )}
        </View>

        {/* WebView */}
        <WebView
          source={{uri: webViewUrl}}
          onLoadStart={() => setWebViewLoading(true)}
          onLoadEnd={() => setWebViewLoading(false)}
          startInLoadingState={true}
          renderLoading={() => (
            <View style={styles.webViewLoader}>
              <ActivityIndicator size="large" color="#fcad2e" />
              <Text style={styles.webViewLoaderText}>Loading page...</Text>
            </View>
          )}
          style={styles.webview}
        />
      </Modal>
    </>
  ) : (
    <NoInternet />
  );
};

export default TestSystem;

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
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    paddingLeft: 8,
  },
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#007aff',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    backgroundColor: '#fff',
    color: '#333',
    elevation: 2,
    marginBottom: 14,
  },
  listContent: {
    paddingBottom: 30,
  },

  // Card
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 14,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 6,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 10,
  },
  cardHeaderLeft: {
    flex: 1,
  },
  imeiLabel: {
    fontSize: 11,
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  imeiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  imeiValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#007aff',
  },
  viewBadge: {
    backgroundColor: '#007aff15',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  viewBadgeText: {
    fontSize: 11,
    color: '#007aff',
    fontWeight: '600',
  },
  statusBadge: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 14,
  },
  cardBody: {
    padding: 14,
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: '#888',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fafafa',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  footerText: {
    fontSize: 11,
    color: '#aaa',
  },

  // Center States
  centerMessage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
    gap: 10,
  },
  centerText: {
    fontSize: 16,
    color: '#888',
  },

  // Modal / WebView
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 16,
    paddingTop: 60,
    paddingHorizontal: 20,
    backgroundColor: '#fcad2e',
  },
  modalHeaderText: {
    flex: 1,
    paddingLeft: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.85,
    marginTop: 2,
  },
  webview: {
    flex: 1,
  },
  webViewLoader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7f7f7',
    gap: 12,
  },
  webViewLoaderText: {
    fontSize: 14,
    color: '#888',
  },
  queryBtn: {
    flex: 1,
    backgroundColor: '#fcad2e20',
    borderWidth: 1,
    borderColor: '#fcad2e',
    borderRadius: 8,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  queryBtnText: {
    fontSize: 12,
    color: '#fcad2e',
    fontWeight: '700',
  },
});
