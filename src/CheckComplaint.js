import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  StatusBar,
  FlatList,
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Back from '../assets/svg/drop.svg';
import NetInfo from '@react-native-community/netinfo';
import NoInternet from './NoInternet';
import Toast from 'react-native-toast-message';
import {
  get_complaints,
  cancel_complaint,
  update_complaint,
} from './service/ApiService';

const STATUS_FILTERS = [
  {id: 'all', label: 'All'},
  {id: 'open', label: '🔴 Open'},
  {id: 'cancel', label: '⚫ Cancelled'},
  {id: 'resolved', label: '🟢 Resolved'},
];

const STATUS_COLORS = {
  open: {bg: '#fee2e2', text: '#d50909', border: '#ec1d1d'},
  cancel: {bg: '#f3f4f6', text: '#6b7280', border: '#6b7280'},
  resolved: {bg: '#dcfce7', text: '#10b981', border: '#10b981'},
};

const CATEGORY_NAMES = {
  1: '🔧 Hardware Issue',
  2: '💻 Software Issue',
  3: '📡 Connectivity Issue',
  4: '🔋 Battery Issue',
  5: '🔔 Alarm Issue',
  6: '📶 Network Issue',
};

const PRIORITY_COLORS = {
  low: {bg: '#dcfce7', text: '#10b981'},
  medium: {bg: '#fef9c3', text: '#f59e0b'},
  high: {bg: '#fee2e2', text: '#ef4444'},
};

const TRC_STATUS_OPTIONS = [
  {id: 'open', label: '🔴 Open'},
  {id: 'resolved', label: '🟢 Resolved'},
  {id: 'cancel', label: '⚫ Cancelled'},
];

const CheckComplaint = () => {
  const navigation = useNavigation();

  const [isConnected, setIsConnected] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [complaints, setComplaints] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [editStatus, setEditStatus] = useState('');
  const [editRemark, setEditRemark] = useState('');
  const [userData, setUserData] = useState(null);
  const [isTrcTeam, setIsTrcTeam] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected && state.isInternetReachable);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const init = async () => {
      const ud = JSON.parse(await AsyncStorage.getItem('userData'));
      setUserData(ud);
      setIsTrcTeam(ud?.designation?.toLowerCase() === 'trc team');
      fetchComplaints(ud.id, ud.designation);
    };
    init();
  }, []);

  const fetchComplaints = async (userId, designation) => {
    try {
      
      setIsLoading(true);
      const response = await get_complaints(userId, designation);
      if (response.status === 'success') {
        // console.log('Fetched Complaints:', response);
        setComplaints(response.data.complaints || []);
      } else {
        Alert.alert('Error', response.message || 'Failed to fetch complaints');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = complaint => {
    Alert.alert(
      'Cancel Complaint',
      `Are you sure you want to cancel complaint #${complaint.complaint_id}?`,
      [
        {text: 'No', style: 'cancel'},
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsCancelling(true);
              const response = await cancel_complaint({
                complaint_id: complaint.complaint_id,
                user_id: userData.id,
              });
              if (response.status === 'success') {
                setComplaints(prev =>
                  prev.map(c =>
                    c.complaint_id === complaint.complaint_id
                      ? {...c, status: 'cancel'}
                      : c,
                  ),
                );
                setDetailVisible(false);
                Toast.show({
                  type: 'success',
                  text1: 'Complaint Cancelled',
                  text2: `Complaint #${complaint.complaint_id} has been cancelled.`,
                });
              } else {
                Alert.alert('Error', response.message || 'Failed to cancel');
              }
            } catch (error) {
              Alert.alert('Error', error.message || 'Something went wrong');
            } finally {
              setIsCancelling(false);
            }
          },
        },
      ],
    );
  };

  const handleOpenEdit = complaint => {
    setEditStatus(complaint.status);
    setEditRemark(complaint.remarks || '');
    setDetailVisible(false);
    setEditVisible(true);
  };

  const filteredData = complaints.filter(item => {
    const matchStatus = activeFilter === 'all' || item.status === activeFilter;
    const matchSearch =
      item.imei?.includes(searchQuery) ||
      item.serial_no?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  const stats = {
    total: complaints.length,
    open: complaints.filter(c => c.status === 'open').length,
    cancel: complaints.filter(c => c.status === 'cancel').length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
  };

  const renderItem = ({item}) => {
    const sColors = STATUS_COLORS[item.status] || STATUS_COLORS.cancel;
    const pColors = PRIORITY_COLORS[item.priority] || PRIORITY_COLORS.medium;
    const canCancel = item.status === 'open';

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => {
          setSelectedItem(item);
          setDetailVisible(true);
        }}
        activeOpacity={0.85}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <Text style={styles.imeiLabel}>IMEI</Text>
            <Text style={styles.imeiValue}>{item.imei}</Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              {backgroundColor: sColors.bg, borderColor: sColors.border},
            ]}>
            <Text style={[styles.statusText, {color: sColors.text}]}>
              {item.status
                ?.replace('_', ' ')
                .replace(/\b\w/g, l => l.toUpperCase())}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.cardBody}>
          <View style={styles.row}>
            <InfoItem label="Serial No" value={item.serial_no} />
            <InfoItem
              label="Category"
              value={
                item.category_name || CATEGORY_NAMES[parseInt(item.category)]
              }
            />
          </View>
          <View style={styles.row}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Priority</Text>
              <View
                style={[styles.priorityBadge, {backgroundColor: pColors.bg}]}>
                <Text style={[styles.priorityText, {color: pColors.text}]}>
                  {item.priority?.charAt(0).toUpperCase() +
                    item.priority?.slice(1)}
                </Text>
              </View>
            </View>
            <InfoItem label="Submitted" value={item.created_at?.slice(0, 10)} />
          </View>

          <View style={styles.descBox}>
            <Text style={styles.descLabel}>📄 Description</Text>
            <Text style={styles.descValue} numberOfLines={2}>
              {item.description}
            </Text>
          </View>

          {item.remarks ? (
            <View
              style={[
                styles.descBox,
                {backgroundColor: '#f0fdf4', borderColor: '#10b981'},
              ]}>
              <Text style={[styles.descLabel, {color: '#10b981'}]}>
                💬 Team Remark
              </Text>
              <Text style={styles.descValue} numberOfLines={2}>
                {item.remarks}
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.footerText}>ID: #{item.complaint_id}</Text>
          <View style={styles.footerActions}>
            {canCancel && !isTrcTeam && (
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => handleCancel(item)}
                activeOpacity={0.8}>
                <Text style={styles.cancelBtnText}>✕ Cancel</Text>
              </TouchableOpacity>
            )}
            {isTrcTeam && (
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => {
                  setSelectedItem(item);
                  handleOpenEdit(item);
                }}
                activeOpacity={0.8}>
                <Text style={styles.editBtnText}>✏ Update</Text>
              </TouchableOpacity>
            )}
            <Text style={styles.footerTap}>Tap for details →</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // ================= Detail Modal =================
  const DetailModal = () => {
    if (!selectedItem) return null;
    const sColors = STATUS_COLORS[selectedItem.status] || STATUS_COLORS.cancel;
    const pColors =
      PRIORITY_COLORS[selectedItem.priority] || PRIORITY_COLORS.medium;
    const canCancel = selectedItem.status === 'open' && !isTrcTeam;

    return (
      <Modal
        visible={detailVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setDetailVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Complaint Details</Text>
              <TouchableOpacity onPress={() => setDetailVisible(false)}>
                <Text style={styles.modalCloseX}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View
                style={[
                  styles.statusBanner,
                  {backgroundColor: sColors.bg, borderColor: sColors.border},
                ]}>
                <Text style={[styles.statusBannerText, {color: sColors.text}]}>
                  {selectedItem.status
                    ?.replace('_', ' ')
                    .replace(/\b\w/g, l => l.toUpperCase())}
                </Text>
              </View>

              <View style={styles.detailSection}>
                <DetailRow
                  label="Complaint ID"
                  value={`#${selectedItem.complaint_id}`}
                />
                <DetailRow label="IMEI" value={selectedItem.imei} />
                <DetailRow label="Serial No" value={selectedItem.serial_no} />
                <DetailRow
                  label="Category"
                  value={
                    selectedItem.category_name ||
                    CATEGORY_NAMES[parseInt(selectedItem.category)]
                  }
                />
                <DetailRow
                  label="Submitted"
                  value={selectedItem.created_at?.slice(0, 10)}
                />
                {selectedItem.resolved_at && (
                  <DetailRow
                    label="Resolved On"
                    value={selectedItem.resolved_at?.slice(0, 10)}
                  />
                )}
                <View style={styles.detailRow}>
                  <Text style={styles.detailRowLabel}>Priority</Text>
                  <View
                    style={[
                      styles.priorityBadge,
                      {backgroundColor: pColors.bg},
                    ]}>
                    <Text style={[styles.priorityText, {color: pColors.text}]}>
                      {selectedItem.priority?.charAt(0).toUpperCase() +
                        selectedItem.priority?.slice(1)}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.detailBox}>
                <Text style={styles.detailBoxLabel}>📄 Your Description</Text>
                <Text style={styles.detailBoxValue}>
                  {selectedItem.description}
                </Text>
              </View>

              {selectedItem.remarks ? (
                <View
                  style={[
                    styles.detailBox,
                    {borderColor: '#10b981', backgroundColor: '#f0fdf4'},
                  ]}>
                  <Text style={[styles.detailBoxLabel, {color: '#10b981'}]}>
                    💬 Team Remark
                  </Text>
                  <Text style={styles.detailBoxValue}>
                    {selectedItem.remarks}
                  </Text>
                </View>
              ) : (
                <View
                  style={[
                    styles.detailBox,
                    {borderColor: '#f59e0b', backgroundColor: '#fefce8'},
                  ]}>
                  <Text style={[styles.detailBoxLabel, {color: '#f59e0b'}]}>
                    ⏳ Awaiting Response
                  </Text>
                  <Text style={styles.detailBoxValue}>
                    Our team will respond to your complaint shortly.
                  </Text>
                </View>
              )}
            </ScrollView>

            <View style={styles.modalActions}>
              {canCancel && (
                <TouchableOpacity
                  style={[
                    styles.modalCancelBtn,
                    isCancelling && {opacity: 0.6},
                  ]}
                  onPress={() => handleCancel(selectedItem)}
                  disabled={isCancelling}>
                  {isCancelling ? (
                    <ActivityIndicator color="#ef4444" size="small" />
                  ) : (
                    <Text style={styles.modalCancelBtnText}>
                      ✕ Cancel Complaint
                    </Text>
                  )}
                </TouchableOpacity>
              )}
              {isTrcTeam && (
                <TouchableOpacity
                  style={styles.editModalBtn}
                  onPress={() => handleOpenEdit(selectedItem)}>
                  <Text style={styles.editModalBtnText}>✏ Update Status</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setDetailVisible(false)}>
                <Text style={styles.modalCloseBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  // ================= Edit Modal (TRC Team only) =================
  const EditModal = () => {
    if (!selectedItem) return null;

    const [localStatus, setLocalStatus] = useState(editStatus);
    const [localRemark, setLocalRemark] = useState(editRemark);

    const handleSave = async () => {
      if (!localStatus) {
        Alert.alert('Validation', 'Please select a status.');
        return;
      }
      try {
        setIsUpdating(true);
        const response = await update_complaint({
          complaint_id: selectedItem.complaint_id,
          status: localStatus,
          remarks: localRemark,
          updated_by: userData.id,
        });
        if (response.status === 'success') {
          setComplaints(prev =>
            prev.map(c =>
              c.complaint_id === selectedItem.complaint_id
                ? {...c, status: localStatus, remarks: localRemark}
                : c,
            ),
          );
          setEditVisible(false);
          Toast.show({
            type: 'success',
            text1: 'Complaint Updated',
            text2: `Complaint #${selectedItem.complaint_id} has been updated.`,
          });
        } else {
          Alert.alert(
            'Error',
            response.message || 'Failed to update complaint',
          );
        }
      } catch (error) {
        Alert.alert('Error', error.message || 'Something went wrong');
      } finally {
        setIsUpdating(false);
      }
    };

    return (
      <Modal
        visible={editVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditVisible(false)}
        statusBarTranslucent={true}>
        {/* FIX: KAV replaces modalOverlay for EditModal */}
        <KeyboardAvoidingView
          style={styles.kavContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.editModalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Update Complaint</Text>
              <TouchableOpacity onPress={() => setEditVisible(false)}>
                <Text style={styles.modalCloseX}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              bounces={false}>
              <View style={styles.editInfoBox}>
                <Text style={styles.editInfoLabel}>Complaint ID</Text>
                <Text style={styles.editInfoValue}>
                  #{selectedItem.complaint_id}
                </Text>
              </View>
              <View style={styles.editInfoBox}>
                <Text style={styles.editInfoLabel}>IMEI</Text>
                <Text style={styles.editInfoValue}>{selectedItem.imei}</Text>
              </View>

              <Text style={styles.editSectionLabel}>Select Status</Text>
              <View style={styles.statusOptions}>
                {TRC_STATUS_OPTIONS.map(opt => (
                  <TouchableOpacity
                    key={opt.id}
                    style={[
                      styles.statusOption,
                      {borderColor: STATUS_COLORS[opt.id]?.border || '#ddd'},
                      localStatus === opt.id && {
                        backgroundColor: STATUS_COLORS[opt.id]?.bg || '#eee',
                        borderColor: STATUS_COLORS[opt.id]?.text || '#333',
                        borderWidth: 2.5,
                        // darker shadow for selected
                        elevation: 4,
                        shadowColor: STATUS_COLORS[opt.id]?.text || '#333',
                        shadowOpacity: 0.3,
                        shadowOffset: {width: 0, height: 2},
                        shadowRadius: 4,
                      },
                    ]}
                    onPress={() => setLocalStatus(opt.id)}>
                    {/* Checkmark tick on selected */}
                    {localStatus === opt.id && (
                      <Text
                        style={[
                          styles.statusOptionTick,
                          {color: STATUS_COLORS[opt.id]?.text},
                        ]}>
                        ✓
                      </Text>
                    )}

                    <Text
                      style={[
                        styles.statusOptionText,
                        localStatus === opt.id && {
                          color: STATUS_COLORS[opt.id]?.text || '#333',
                          fontWeight: '800',
                          fontSize: 13,
                        },
                      ]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.editSectionLabel}>Remark</Text>
              <TextInput
                style={styles.remarkInput}
                placeholder="Enter team remark..."
                placeholderTextColor="#aaa"
                defaultValue={localRemark}
                onChangeText={setLocalRemark}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                blurOnSubmit={false}
                scrollEnabled={false}
              />

              {/* Padding so input stays above keyboard */}
              <View style={{height: 20}} />
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setEditVisible(false)}>
                <Text style={styles.modalCloseBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, isUpdating && {opacity: 0.6}]}
                onPress={handleSave}
                disabled={isUpdating}>
                {isUpdating ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.saveBtnText}>✓ Save Update</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    );
  };

  return !isConnected ? (
    <NoInternet />
  ) : (
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
        <View style={styles.headerTextWrapper}>
          <Text style={styles.headerTitle}>
            {isTrcTeam ? 'All Complaints' : 'My Complaints'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {complaints.length} total · {stats.open} open · {stats.resolved}{' '}
            resolved
          </Text>
        </View>
        <TouchableOpacity
          onPress={() =>
            fetchComplaints(
              userData?.id,
              userData?.designation,
            )
          }
          style={styles.refreshBtn}>
          <Text style={styles.refreshIcon}>🔄</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        <View style={styles.statsRow}>
          <StatChip label="Total" value={stats.total} color="#6b7280" />
          <StatChip label="Open" value={stats.open} color="#ef4444" />
          <StatChip label="Cancelled" value={stats.cancel} color="#6b7280" />
          <StatChip label="Resolved" value={stats.resolved} color="#10b981" />
        </View>

        <TextInput
          style={styles.searchInput}
          placeholder="Search IMEI, serial no, description..."
          placeholderTextColor="#aaa"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          alwaysBounceVertical={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContent}>
          {STATUS_FILTERS.map(f => (
            <TouchableOpacity
              key={f.id}
              style={[
                styles.filterChip,
                activeFilter === f.id && styles.filterChipActive,
              ]}
              onPress={() => setActiveFilter(f.id)}>
              <Text
                style={[
                  styles.filterChipText,
                  activeFilter === f.id && styles.filterChipTextActive,
                ]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {isLoading ? (
          <View style={styles.centerMessage}>
            <ActivityIndicator size="large" color="#fcad2e" />
            <Text style={styles.centerText}>Loading complaints...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredData}
            keyExtractor={item => item.complaint_id?.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.centerMessage}>
                <Text style={styles.emptyIcon}>📭</Text>
                <Text style={styles.centerText}>No complaints found</Text>
                <Text style={styles.centerSubText}>
                  {activeFilter !== 'all'
                    ? 'Try changing the filter'
                    : 'You have not submitted any complaints yet'}
                </Text>
              </View>
            }
          />
        )}
      </View>

      <DetailModal />
      <EditModal />
      <Toast />
    </>
  );
};

const InfoItem = ({label, value}) => (
  <View style={styles.infoItem}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value || '—'}</Text>
  </View>
);

const DetailRow = ({label, value}) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailRowLabel}>{label}</Text>
    <Text style={styles.detailRowValue}>{value || '—'}</Text>
  </View>
);

const StatChip = ({label, value, color}) => (
  <View style={[styles.statChip, {borderColor: color}]}>
    <Text style={[styles.statValue, {color}]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

export default CheckComplaint;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 20,
    paddingTop: 60,
    paddingHorizontal: 20,
    backgroundColor: '#fcad2e',
  },
  backButton: {marginRight: 10},
  headerTextWrapper: {flex: 1, paddingLeft: 8},
  headerTitle: {fontSize: 20, fontWeight: 'bold', color: '#fff'},
  headerSubtitle: {fontSize: 11, color: '#fff', opacity: 0.85, marginTop: 2},
  refreshBtn: {padding: 6},
  refreshIcon: {fontSize: 20},

  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    paddingHorizontal: 16,
    paddingTop: 14,
  },

  statsRow: {flexDirection: 'row', gap: 8, marginBottom: 12},
  statChip: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 8,
    alignItems: 'center',
    elevation: 1,
  },
  statValue: {fontSize: 18, fontWeight: '800'},
  statLabel: {fontSize: 10, color: '#888', marginTop: 2},

  searchInput: {
    borderWidth: 1,
    borderColor: '#007aff',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#fff',
    color: '#333',
    elevation: 2,
    marginBottom: 10,
  },

  filterScroll: {flexGrow: 0, marginBottom: 12, overflow: 'hidden'},
  filterContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingRight: 10,
  },
  filterChip: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
  },
  filterChipActive: {borderColor: '#fcad2e', backgroundColor: '#fcad2e'},
  filterChipText: {fontSize: 13, color: '#555', fontWeight: '500'},
  filterChipTextActive: {color: '#fff', fontWeight: '700'},

  listContent: {paddingBottom: 30},

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
  cardHeaderLeft: {flex: 1},
  imeiLabel: {
    fontSize: 11,
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  imeiValue: {fontSize: 14, fontWeight: '700', color: '#1a1a1a', marginTop: 2},
  statusBadge: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: {fontSize: 12, fontWeight: '600'},
  divider: {height: 1, backgroundColor: '#f0f0f0', marginHorizontal: 14},
  cardBody: {padding: 14, gap: 10},
  row: {flexDirection: 'row', gap: 10},
  infoItem: {flex: 1},
  infoLabel: {fontSize: 11, color: '#888', marginBottom: 2},
  infoValue: {fontSize: 13, fontWeight: '600', color: '#333'},

  priorityBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  priorityText: {fontSize: 12, fontWeight: '700'},

  descBox: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 10,
    borderLeftWidth: 3,
    borderColor: '#ddd',
  },
  descLabel: {fontSize: 11, color: '#888', marginBottom: 4, fontWeight: '600'},
  descValue: {fontSize: 13, color: '#444', lineHeight: 18},

  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fafafa',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  footerText: {fontSize: 11, color: '#aaa'},
  footerActions: {flexDirection: 'row', alignItems: 'center', gap: 10},
  footerTap: {fontSize: 11, color: '#aaa'},

  cancelBtn: {
    backgroundColor: '#fee2e2',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  cancelBtnText: {fontSize: 11, color: '#ef4444', fontWeight: '700'},
  editBtn: {
    backgroundColor: '#eff6ff',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  editBtnText: {fontSize: 11, color: '#3b82f6', fontWeight: '700'},

  centerMessage: {flex: 1, alignItems: 'center', paddingTop: 60, gap: 8},
  emptyIcon: {fontSize: 48},
  centerText: {fontSize: 16, color: '#888', fontWeight: '600'},
  centerSubText: {fontSize: 13, color: '#bbb', textAlign: 'center'},

  // ---- FIX: single clean modalOverlay — NO position:absolute ----
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },

  // ---- FIX: single clean modalContainer — NO position:absolute ----
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '85%',
  },

  // ---- FIX: KAV container for EditModal ----
  kavContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },

  // ---- Separate container for EditModal ----
  editModalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
    width: '100%',
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {fontSize: 18, fontWeight: '800', color: '#1a1a1a'},
  modalCloseX: {fontSize: 18, color: '#888', fontWeight: '600'},

  statusBanner: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  statusBannerText: {fontSize: 16, fontWeight: '800', letterSpacing: 0.5},

  detailSection: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
  },
  detailRowLabel: {fontSize: 13, color: '#888'},
  detailRowValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    maxWidth: '60%',
    textAlign: 'right',
  },

  detailBox: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
  },
  detailBoxLabel: {
    fontSize: 12,
    color: '#888',
    fontWeight: '700',
    marginBottom: 6,
  },
  detailBoxValue: {fontSize: 14, color: '#444', lineHeight: 20},

  modalActions: {flexDirection: 'row', gap: 10, marginTop: 8},
  modalCancelBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#ef4444',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#fee2e2',
  },
  modalCancelBtnText: {fontSize: 15, fontWeight: '800', color: '#ef4444'},
  modalCloseBtn: {
    flex: 1,
    backgroundColor: '#fcad2e',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalCloseBtnText: {fontSize: 15, fontWeight: '800', color: '#fff'},
  editModalBtn: {
    flex: 1,
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  editModalBtnText: {fontSize: 15, fontWeight: '800', color: '#fff'},

  editInfoBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  editInfoLabel: {fontSize: 13, color: '#888'},
  editInfoValue: {fontSize: 13, fontWeight: '700', color: '#333'},

  editSectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#555',
    marginBottom: 8,
    marginTop: 12,
  },

  statusOptions: {flexDirection: 'row', gap: 8, marginBottom: 4},
  statusOption: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  statusOptionText: {fontSize: 12, color: '#aaa', fontWeight: '500'},
  statusOptionTick: {
    fontSize: 14,
    fontWeight: '800',
  },

  remarkInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#fff',
    color: '#333',
    minHeight: 100,
    marginBottom: 8,
  },

  saveBtn: {
    flex: 1,
    backgroundColor: '#10b981',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveBtnText: {fontSize: 15, fontWeight: '800', color: '#fff'},
});
