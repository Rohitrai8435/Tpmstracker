import React, {useRef, useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import {SelectList} from 'react-native-dropdown-select-list';
import {useNavigation, useRoute} from '@react-navigation/native';
import {
  getAlarmV1,
  getLogReport,
  getSiteDetail,
  getSiteDetailV2,
  getSiteDetailv1,
  getcurrentAlarmByImei,
  getcurrentAlarmByImeiv2,
  getmaterailName,
  insert_wcc_data,
} from '../service/ApiService';
import DatePicker from 'react-native-date-picker';

import Back from '../../assets/svg/drop.svg';
import SignatureCanvas from 'react-native-signature-canvas';
import {Image} from 'react-native-animatable';

const SiteInstallationForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const signatureRef = useRef(null);

  const [signatureModalVisible, setSignatureModalVisible] = useState(false);
  const [currentSignatureType, setCurrentSignatureType] = useState(null);
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(new Date());

  const [isLoading, setIsLoading] = useState(true);
  const [hooterCnt, setHooterCnt] = useState(false);
  const [data, setData] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [lowestLevel, setLowestLevel] = useState('0');
  const [btlv, setBtlv] = useState(null);
  const [hrt, setHrt] = useState(null);
  const [yesPress, setYes] = useState(0);
  const [alarmConfig, setAlarmCon] = useState([]);
  const [log, setLog] = useState([]);
  const [logv1, setLogv1] = useState([]);
  const [source, setSource] = useState(null);
  const [current, setCurrentAlarm] = useState(null);
  const [pending, setPendingAlarm] = useState(null);

  const [isConnected, setIsConnected] = useState(true);
  const [dialogHint, setdialogHint] = useState([]);
  const [currentSiteStatusv1, setCurrentSiteStatusv1] = useState([]);
  const navigation = useNavigation();
  const [automation, setAutomation] = useState(false);
  const [matrailName, setMatrailName] = useState([]);
  const [selected, setSelected] = React.useState('');

  
  const data1 = [
    ...matrailName.map((item, index) => ({
      key: {'id':item.id,
        "name":item.name
      }, 
      value: item.name,
    })),
  ];
  const data2 = [
    {key: '1', value: 'AIRTEL'},
    {key: '2', value: 'JIO'},
    {key: '3', value: 'VODA'},
    {key: '4', value: 'BSNL'},
    {key: '5', value: 'TCL'},
  ];
  const data3 = [
    {key: '1', value: 'Completed'},
    {key: '2', value: 'Pending'},
  ];

  const route = useRoute();
  //862211070275458	//50
  const {
    imei,
    mode,
    version,
    color,
    uniqueId,
    serviceType,
    complainNo,
    technicianName,
  } = route.params;
  console.log(imei);
  const fetchMaterailName = async () => {
    data.data = await getmaterailName();
    setMatrailName(data?.data?.data);
  };

  // console.log(route.params);
  const fetchLogData = async () => {
    try {
      if (version == '0' || version == 'v4') {
        try {
          setIsLoading(true);
          const currentAlarm = await getcurrentAlarmByImei(imei);
          if (currentAlarm && currentAlarm.data1) {
            const uniqueAlarms = currentAlarm.data1.reduce((acc, curr) => {
              if (!acc.some(item => item.alarm === curr.alarm)) {
                acc.push(curr);
              }
              return acc;
            }, []);
            currentAlarm.data1 = uniqueAlarms;
          }
          const {activeAlarms, pendingAlarms} = parseAlarmData(
            currentAlarm.data1,
          );
          setCurrentAlarm(activeAlarms);
          setPendingAlarm(pendingAlarms);

          setIsLoading(false);
        } catch (error) {
          setIsLoading(false);
        }
        try {
          setIsLoading(true);
          const response = await getSiteDetail(imei);

          setData(response.data);
          // console.log('sourabh', response.data);
          if ((response.data.func_type >> 0) & 1) {
            setAutomation(true);
          }
          setBtlv(response.data.btlv);
          setHrt(response.data.hrt);
          setHooterCnt(response.hooter_ctr);
          setAlarmCon(response.alarm_con);
          setSource(response.source);
          setIsLoading(false);
        } catch (error) {
          setIsLoading(false);
        }

        /*  try {
            setIsLoading(true);
            const userDataString = await AsyncStorage.getItem('user_data');
            if (userDataString) {
              const userData = JSON.parse(userDataString);  
                const { aidv4, ctmidv4, user_typev4, client_versionv4,lowest_level} = userData;
                setLowestLevel(lowest_level);
                const logResponse = await getLogReport(imei, aidv4, ctmidv4, formattedStartDate, formattedEndDate, user_typev4, client_versionv4);
                setLog(logResponse.data);
                console.log(" detail log :", logResponse);
                setIsLoading(false);
              
            }
          }catch (error) {
            setIsLoading(false);
            console.log(error);   
          
          }*/
      } else if (version === 'v2') {
        try {
          setIsLoading(true);
          const currentAlarm = await getcurrentAlarmByImeiv2(imei);
          // console.log('helloe ', currentAlarm);
          if (currentAlarm && currentAlarm.data1) {
            const uniqueAlarms = currentAlarm.data1.reduce((acc, curr) => {
              if (!acc.some(item => item.alarm === curr.alarm)) {
                acc.push(curr);
              }
              return acc;
            }, []);
            currentAlarm.data1 = uniqueAlarms;
          }
          const {activeAlarms, pendingAlarms} = parseAlarmData(
            currentAlarm.data1,
          );
          setCurrentAlarm(activeAlarms);
          setPendingAlarm(pendingAlarms);

          setIsLoading(false);
        } catch (error) {
          setIsLoading(false);
        }
        try {
          setIsLoading(true);
          const response = await getSiteDetailV2(imei);
          setLog(response.log);
          // console.log(response);
          setData(response.data);
          setAlarmCon(response.alarm_con);
          setSource(response.source);
          setIsLoading(false);
        } catch (error) {
          setIsLoading(false);
        }
      } else if (version === 'v1') {
        try {
          try {
            setIsLoading(true);
            const response = await getSiteDetailv1(imei);
            // console.log(response);
            setData(response.data[0]);
            setCurrentSiteStatusv1(response.current_site[0]);

            setIsLoading(false);
          } catch (error) {
            setIsLoading(false);
          }
          try {
            setIsLoading(true);
            const response = await getAlarmV1(imei);
            // console.log(response);
            setLogv1(response.data);
            setIsLoading(false);
          } catch (error) {
            setIsLoading(false);
          }
        } catch (error) {
          setIsLoading(false);
          console.log(error);
        }
      }
    } catch (error) {
      return (
        <View style={{justifyContent: 'center', alignItems: 'center', flex: 1}}>
          <Text style={{fontFamily: 'AndadaPro-Regular'}}>
            Something Went wrong
          </Text>
        </View>
      );
    }
  };

  const {
    client_type_name,
    state_name,
    district_name,
    cluster_name,
    site_name,
    site_id,
    id_definition,
    system_version_type,
    site_mobile_no,
    sim_serial_no,
    gsm_imei_no,
    system_serial_no,
    site_type,
    globel_id,
    l1_number,
    l2_number,
    l3_number,
    l4_number,
    l5_number,
    i_c_date,
    no_of_battery_bank,
    door_sensor,
    antenna,
    hooter,
    battery_bank_one,
    battery_bank_two,
    battery_bank_three,
    battery_bank_four,
    update_at,
    energy_meter_installed,
    volt,
    ch1,
    ch2,
    ch3,
    ch4,
    ch5,
    idc1,
    idc2,
    idc3,
    idc4,
    idc5,
    kwh1,
    kwh2,
    kwh3,
    kwh4,
    kwh5,
    temp,
    site_id_ref,
    vdc,
  } = data;
  // console.log(data);
  const {
    D,
    D_dt,
    B,
    B_dt,
    BB1,
    BB1_dt,
    BB2,
    BB2_dt,
    BB3,
    BB3_dt,
    BB4,
    BB4_dt,
    E,
    E_dt,
    C,
    C_dt,
    S,
    S_dt,
    BL,
    BL_dt,
    H,
    H_dt,
  } = currentSiteStatusv1;
  // console.log(site_id_ref);
  useEffect(() => {
    //  fetchSiteDetail();
    fetchMaterailName();
  
    fetchLogData();
    const currentDate = new Date().toLocaleDateString('en-GB');
    setFormData({
      uniqueId,
      siteDetails: {
        client: client_type_name,
        circle: state_name,
        zone: district_name,
        cluster: cluster_name,
        dist: district_name,
        siteId: site_id,
        siteRefId: site_id_ref,
        globalId: globel_id,
        siteName: site_name,
        siteNumber: site_mobile_no,
        simSerialNumber: sim_serial_no,
        gsmImeiNumber: gsm_imei_no,
        systemVer: system_version_type,
        systemSlNo: system_serial_no,
      },
      dcemDetail: {
        dcemMake: volt,
        dcemVolt: vdc,
        ch1: ch1,
        ch2: ch2,
        ch3: ch3,
        ch4: ch4,
        ch5: ch5,
        idc1: idc1,
        idc2: idc2,
        idc3: idc3,
        idc4: idc4,
        idc5: idc5,
      },
      workDetails: {
        workDescription: 'done',
        workCompletionDate: currentDate,
        scope: serviceType,
        serviceComplaintNumber: complainNo,
        siteType: site_type,
      },
      // TPMS Alarm Check Points
      tpmsAlarms: {
        bbLoopBreak: 'notRequired',
        bb1Disconnect1: 'notRequired',
        bb1Disconnect2: 'notRequired',
        bb2Disconnect1: 'notRequired',
        bb2Disconnect2: 'notRequired',
        llvdCut: 'notRequired',
        extraDoor: 'notRequired',
        shelterLoop: 'notRequired',
        bb4Disconnect: 'notRequired',
        btsOpen: 'notRequired',
        rectifierFail: 'notRequired',
        rruDisconnect: 'notRequired',
        rtnOpen: 'notRequired',
        extraAlarm1: 'notRequired',
        extraAlarm2: 'notRequired',
        extraAlarm3: 'notRequired',
      },
      // IAMS Alarm Check Points
      iamsAlarms: {
        mainsFail: 'notRequired',
        dgSupply: 'notRequired',
        fireAlarm: 'notRequired',
        motionSense: 'notRequired',
        doorStatus: 'notRequired',
        systemCover: 'notRequired',
        highRoomTemp: 'notRequired',
        siteVoltage: 'notRequired',
        siteTemp: 'notRequired',
        signal: 'notRequired',
        hooter: 'notRequired',
      },
      battriesDetail: {
        battery_bank_one: battery_bank_one,
        battery_bank_two: battery_bank_two,
        battery_bank_three: battery_bank_three,
        battery_bank_four: battery_bank_four,
        voltSense1: '',
        voltSense2: '',
        voltSense3: '',
        voltSense4: '',
        batteryloop1: '',
        batteryloop2: '',
        batteryloop3: '',
        batteryloop4: '',
        remark1: '',
        remark2: '',
        remark3: '',
        remark4: '',
      },

      escalation: {
        level1: l1_number,
        level2: l2_number,
        level3: l3_number,
        level4: l4_number,
        level5: l5_number,
      },
      stplSignature: {
        name: technicianName,
      },
    });
  }, [data.globel_id]);
  const [formData, setFormData] = useState({
    // Site & SIM Installation Details
    uniqueId,
    siteDetails: {
      client: client_type_name,
      circle: state_name,
      zone: district_name,
      cluster: cluster_name,
      dist: district_name,
      siteId: site_id,
      siteRefId: site_id_ref,
      globalId: globel_id,
      siteName: site_name,
      siteNumber: site_mobile_no,
      simSerialNumber: sim_serial_no,
      gsmImeiNumber: gsm_imei_no,
      systemVer: system_version_type,
      systemSlNo: system_serial_no,
    },
    dcemDetail: {
      dcemMake: volt,
      dcemVolt: vdc,
      ch1: ch1,
      ch2: ch2,
      ch3: ch3,
      ch4: ch4,
      ch5: ch5,
      idc1: idc1,
      idc2: idc2,
      idc3: idc3,
      idc4: idc4,
      idc5: idc5,
    },
    battriesDetail: {
      battery_bank_one: battery_bank_one,
      battery_bank_two: battery_bank_two,
      battery_bank_three: battery_bank_three,
      battery_bank_four: battery_bank_four,
      voltSense1: '',
      voltSense2: '',
      voltSense3: '',
      voltSense4: '',
      batteryloop1: '',
      batteryloop2: '',
      batteryloop3: '',
      batteryloop4: '',
      remark1: '',
      remark2: '',
      remark3: '',
      remark4: '',
    },

    // Work Description

    workDetails: {
      workDescription: '',
      scope: serviceType,
      serviceComplaintNumber: complainNo,
      workCompletionDate: '',
      siteType: site_type,
    },

    // TPMS Alarm Check Points
    tpmsAlarms: {
      bbLoopBreak: 'notRequired',
      bb1Disconnect1: 'notRequired',
      bb1Disconnect2: 'notRequired',
      bb2Disconnect1: 'notRequired',
      bb2Disconnect2: 'notRequired',
      llvdCut: 'notRequired',
      extraDoor: 'notRequired',
      shelterLoop: 'notRequired',
      bb4Disconnect: 'notRequired',
      btsOpen: 'notRequired',
      rectifierFail: 'notRequired',
      rruDisconnect: 'notRequired',
      rtnOpen: 'notRequired',
      extraAlarm1: 'notRequired',
      extraAlarm2: 'notRequired',
      extraAlarm3: 'notRequired',
    },

    // IAMS Alarm Check Points
    iamsAlarms: {
      mainsFail: 'notRequired',
      dgSupply: 'notRequired',
      fireAlarm: 'notRequired',
      motionSense: 'notRequired',
      doorStatus: 'notRequired',
      systemCover: 'notRequired',
      highRoomTemp: 'notRequired',
      siteVoltage: 'notRequired',
      siteTemp: 'notRequired',
      signal: 'notRequired',
      hooter: 'notRequired',
    },

    // Escalation Details
    escalation: {
      level1: l1_number,
      level2: l2_number,
      level3: l3_number,
      level4: l4_number,
      level5: l5_number,
    },
  });
  // console.log(formData.dcemDetail);

  const updateFormData = (field, value) => {
    setFormData(prevState => ({
      ...prevState,
      [field]: value,
    }));
  };

  const updateNestedFormData = (parent, field, value) => {
    setFormData(prevState => ({
      ...prevState,
      [parent]: {
        ...prevState[parent],
        [field]: value,
      },
    }));
  };

  // Add this function to your component
  const updateChannelData = (index, field, value) => {
    const updatedChannels = [...(formData.channels || [])];

    // Ensure the array has enough elements
    while (updatedChannels.length <= index) {
      updatedChannels.push({});
    }

    // Update the specified field
    updatedChannels[index] = {
      ...updatedChannels[index],
      [field]: value,
    };

    // Update the form data
    updateFormData('channels', updatedChannels);
  };
  // Add this function to your component
  const updateBatteryData = (index, field, value) => {
    // Create a copy of the current batteries array or initialize it if it doesn't exist
    const updatedBatteries = [...(formData.batteries || [])];

    // Ensure the array has enough elements
    while (updatedBatteries.length <= index) {
      updatedBatteries.push({});
    }

    // Update the specified field
    updatedBatteries[index] = {
      ...updatedBatteries[index],
      [field]: value,
    };

    // Update the form data
    updateFormData('batteries', updatedBatteries);
  };

  // State for new material input
  const [newMaterial, setNewMaterial] = useState({
    name: '',
    quantity: '',
  });

  // Update new material input fields
  const updateNewMaterial = (field, value) => {
    console.log(value);
    setNewMaterial(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Add a new material to the list
  const addMaterial = () => {
    // Validate inputs
    if (!newMaterial.name || !newMaterial.quantity) {
      // You could show an alert here
      return;
    }

    // Create updated materials array
    const updatedMaterials = [...(formData.materials || []), newMaterial];

    // Update form data
    updateFormData('materials', updatedMaterials);

    // Reset new material form
    setNewMaterial({
      name: '',
      quantity: '',
    });
  };

  // Remove a material from the list
  const removeMaterial = index => {
    const updatedMaterials = [...formData.materials];
    updatedMaterials.splice(index, 1);
    updateFormData('materials', updatedMaterials);
  };

  const handleSignature = type => {
    setCurrentSignatureType(type);
    setSignatureModalVisible(true);
  };

  const handleSignatureComplete = signature => {
    if (currentSignatureType === 'stpl') {
      updateNestedFormData('stplSignature', 'signature', signature);
      updateNestedFormData('stplSignature', 'date', new Date().toISOString());
    } else if (currentSignatureType === 'customer') {
      updateNestedFormData('customerSignature', 'signature', signature);
      updateNestedFormData(
        'customerSignature',
        'date',
        new Date().toISOString(),
      );
    }
    setSignatureModalVisible(false);
  };

  const handleSignatureEmpty = () => {
    Alert.alert('Error', 'Please provide a signature');
  };

  const handleSignatureCancel = () => {
    setSignatureModalVisible(false);
  };
  const handleData = data => {
    console.log(data);
  };

  const handleEnd = () => {
    if (signatureRef && signatureRef.current) {
      //  console.log(signatureRef.current.readSignature());
    }
  };

  const SignatureModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={signatureModalVisible}
      onRequestClose={handleSignatureCancel}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {currentSignatureType === 'stpl'
              ? 'STPL Representative Signature'
              : 'Customer Representative Signature'}
          </Text>

          <View style={styles.signatureCanvasContainer}>
            <SignatureCanvas
              ref={signatureRef}
              onOK={handleSignatureComplete}
              onEmpty={handleSignatureEmpty}
              onGetData={handleData}
              onEnd={handleEnd}
              autoClear={false}
              descriptionText="testing"
              clearText="Clear"
              confirmText="Save"
              webStyle={`.m-signature-pad--footer
                 { display: flex; justify-content: space-between; }
                 .m-signature-pad--footer .button {
                   background-color: #3498db;
                   color: #fff;
                   padding: 10px 20px;
                   border-radius: 4px;
                   margin: 0 5px;
                 }
                 body,html {
                   width: 100%; height: 100%;
                 }
               `}
            />
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => signatureRef.current.clearSignature()}>
              <Text style={styles.buttonText}>Clear</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => signatureRef.current.readSignature()}>
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleSignatureCancel}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const nextStep = () => {
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
     // Show loader
    try {
      const stplSig = formData?.stplSignature;
      const customerSig = formData?.customerSignature;

      // Check if STPL Signature is empty
      if (!stplSig?.name) {
        Alert.alert('Missing Data', 'Please Provide Name of STPL Representative.');
        return;
      }
      if (!stplSig?.signature || !stplSig?.date) {
        Alert.alert(
          'Missing Data',
          'Please Provide Signature of STPL Representative.',
        );
        return;
      }

      // Check if Customer Signature is empty
      if (!customerSig?.name) {
        Alert.alert(
          'Missing Data',
          'Please provide Name of Customer Representative',
        );
        return;
      }
      // Check if Customer Signature is empty
      if (!customerSig?.signature || !customerSig?.date) {
        Alert.alert(
          'Missing Data',
          'Please provide Signature of Customer Representative',
        );
        return;
      }
      setIsLoading(true);
      const response = await insert_wcc_data(formData);
      console.log(response);
      // console.log('testing data', response, 'wccdata');
      if (response.status) {
        navigation.navigate('BookingScreen');
      }
    } catch (error) {
      Alert.alert('Submission error:', error);
    } finally {
      setIsLoading(false); // Hide loader
    }
  };

  // Step 1: Site & SIM Installation Details
  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>SITE & SIM Installation Details</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Client</Text>
        <TextInput
          style={styles.input}
          value={formData.siteDetails.client}
          onChangeText={text =>
            updateNestedFormData('siteDetails', 'client', text)
          }
          placeholder="Enter client name"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Circle</Text>
        <TextInput
          style={styles.input}
          value={formData.siteDetails.circle}
          onChangeText={text =>
            updateNestedFormData('siteDetails', 'circle', text)
          }
          placeholder="Enter circle"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Zone</Text>
        <TextInput
          style={styles.input}
          value={formData.siteDetails.zone}
          onChangeText={text =>
            updateNestedFormData('siteDetails', 'zone', text)
          }
          placeholder="Enter zone"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Cluster</Text>
        <TextInput
          style={styles.input}
          value={formData.siteDetails.cluster}
          onChangeText={text =>
            updateNestedFormData('siteDetails', 'cluster', text)
          }
          placeholder="Enter cluster"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Dist</Text>
        <TextInput
          style={styles.input}
          value={formData.siteDetails.dist}
          onChangeText={text =>
            updateNestedFormData('siteDetails', 'dist', text)
          }
          placeholder="Enter district"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Site ID</Text>
        <TextInput
          style={styles.input}
          value={formData.siteDetails.siteId}
          onChangeText={text =>
            updateNestedFormData('siteDetails', 'siteId', text)
          }
          placeholder="Enter site ID"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Site Ref ID</Text>
        <TextInput
          style={styles.input}
          value={formData.siteDetails.siteRefId}
          onChangeText={text =>
            updateNestedFormData('siteDetails', 'siteRefId', text)
          }
          placeholder="Enter site reference ID"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Global ID</Text>
        <TextInput
          style={styles.input}
          value={formData.siteDetails.globalId}
          onChangeText={text =>
            updateNestedFormData('siteDetails', 'globalId', text)
          }
          placeholder="Enter global ID"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Site Name</Text>
        <TextInput
          style={styles.input}
          value={formData.siteDetails.siteName}
          onChangeText={text =>
            updateNestedFormData('siteDetails', 'siteName', text)
          }
          placeholder="Enter site name"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Site Number</Text>
        <TextInput
          style={styles.input}
          value={formData.siteDetails.siteNumber}
          onChangeText={text =>
            updateNestedFormData('siteDetails', 'siteNumber', text)
          }
          placeholder="Enter site number"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>SIM Serial Number</Text>
        <TextInput
          style={styles.input}
          value={formData.siteDetails.simSerialNumber}
          onChangeText={text =>
            updateNestedFormData('siteDetails', 'simSerialNumber', text)
          }
          placeholder="Enter SIM serial number"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>GSM IMEI Number</Text>
        <TextInput
          style={styles.input}
          value={formData.siteDetails.gsmImeiNumber}
          onChangeText={text =>
            updateNestedFormData('siteDetails', 'gsmImeiNumber', text)
          }
          placeholder="Enter GSM IMEI number"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>System Version </Text>
        <TextInput
          style={styles.input}
          value={formData.siteDetails.systemVer}
          onChangeText={text =>
            updateNestedFormData('siteDetails', 'systemVer', text)
          }
          placeholder="Enter System Version "
        />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>System Serial Number</Text>
        <TextInput
          style={styles.input}
          value={formData.siteDetails.systemSlNo}
          onChangeText={text =>
            updateNestedFormData('siteDetails', 'systemSlNo', text)
          }
          placeholder="Enter System Serial Number"
        />
      </View>
    </View>
  );

  // Step 2: Work Description
  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Work Description</Text>
      <View style={styles.inputGroup}>
        <SelectList
          search={false}
          setSelected={itemValue =>
            updateNestedFormData('workDetails', 'workDescription', itemValue)
          }
          data={data3}
          placeholder="Work Status"
          save="value"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Visit Type</Text>
        <TextInput
          style={styles.input}
          value={formData.workDetails?.scope}
          onChangeText={text =>
            updateNestedFormData('workDetails', 'scope', text)
          }
          placeholder="Enter Visit Type"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Service Complaint Number</Text>
        <TextInput
          style={styles.input}
          value={formData.workDetails?.serviceComplaintNumber}
          onChangeText={text =>
            updateNestedFormData('workDetails', 'serviceComplaintNumber', text)
          }
          placeholder="Enter service complaint number"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Work Completion Date</Text>
        <TextInput
          style={styles.input}
          value={formData.workDetails?.workCompletionDate}
          onChangeText={text =>
            updateNestedFormData('workDetails', 'workCompletionDate', text)
          }
          placeholder="DD/MM/YYYY"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Site Type</Text>
        <TextInput
          style={styles.input}
          value={formData.workDetails?.siteType}
          onChangeText={text =>
            updateNestedFormData('workDetails', 'siteType', text)
          }
          placeholder="Enter site type"
        />
      </View>
    </View>
  );

  // Step 3: TPMS Alarm Check Points
  const renderStep3 = () => {
    const alarmItems = [
      {id: 1, name: 'bbLoopBreak', label: 'BB Loop Break'},
      {id: 2, name: 'bb1Disconnect1', label: 'BB1 Disconnect1'},
      {id: 3, name: 'bb1Disconnect2', label: 'BB1 Disconnect2'},
      {id: 4, name: 'bb2Disconnect1', label: 'BB2 Disconnect1'},
      {id: 5, name: 'bb2Disconnect2', label: 'BB2 Disconnect2'},
      {id: 6, name: 'llvdCut', label: 'LLVD Cut'},
      {id: 7, name: 'extraDoor', label: 'Extra Door'},
      {id: 8, name: 'shelterLoop', label: 'Shelter Loop'},
      {id: 9, name: 'bb4Disconnect', label: 'BB4 Disconnect'},
      {id: 10, name: 'btsOpen', label: 'BTS Open'},
      {id: 11, name: 'rectifierFail', label: 'Rectifier Fail'},
      {id: 12, name: 'rruDisconnect', label: 'RRU Disconnect'},
      {id: 13, name: 'rtnOpen', label: 'RTN Open'},
      {id: 14, name: 'extraAlarm1', label: 'Extra Alarm'},
      {id: 15, name: 'extraAlarm2', label: 'Extra Alarm'},
      {id: 16, name: 'extraAlarm3', label: 'Extra Alarm'},
    ];

    return (
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>TPMS Alarm Check Points</Text>

        {/* Header row for the options */}
        <View style={styles.alarmHeaderRow}>
          <Text style={styles.alarmItemLabel}>Alarm Point</Text>
          <Text style={styles.alarmOptionLabel}>Yes</Text>
          <Text style={styles.alarmOptionLabel}>No</Text>
          <Text style={styles.alarmOptionLabel}>N/R</Text>
        </View>

        {alarmItems.map(item => (
          <View key={item.id} style={styles.alarmRow}>
            <Text style={styles.alarmItemText}>
              {item.id}. {item.label}
            </Text>

            <TouchableOpacity
              style={styles.radioContainer}
              onPress={() =>
                updateNestedFormData('tpmsAlarms', item.name, 'yes')
              }>
              <View
                style={[
                  styles.radioButton,
                  formData.tpmsAlarms?.[item.name] === 'yes' &&
                    styles.radioButtonSelected,
                ]}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.radioContainer}
              onPress={() =>
                updateNestedFormData('tpmsAlarms', item.name, 'no')
              }>
              <View
                style={[
                  styles.radioButton,
                  formData.tpmsAlarms?.[item.name] === 'no' &&
                    styles.radioButtonSelected,
                ]}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.radioContainer}
              onPress={() =>
                updateNestedFormData('tpmsAlarms', item.name, 'notRequired')
              }>
              <View
                style={[
                  styles.radioButton,
                  formData.tpmsAlarms?.[item.name] === 'notRequired' &&
                    styles.radioButtonSelected,
                ]}
              />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    );
  };

  // Step 4: IAMS Alarms Check Point
  const renderStep4 = () => {
    const alarmItems = [
      {id: 1, name: 'mainsFail', label: 'Mains Fail'},
      {id: 2, name: 'dgSupply', label: 'DG Supply'},
      {id: 3, name: 'fireAlarm', label: 'Fire Alarm'},
      {id: 4, name: 'motionSense', label: 'Motion Sense'},
      {id: 5, name: 'doorStatus', label: 'Door Status'},
      {id: 6, name: 'systemCover', label: 'System Cover'},
      {id: 7, name: 'highRoomTemp', label: 'High Room Temp'},
      {id: 8, name: 'siteVoltage', label: 'Site Voltage(volt)'},
      {id: 9, name: 'siteTemp', label: 'Site Temp(deg)'},
      {id: 10, name: 'signal', label: 'Signal'},
      {id: 11, name: 'hooter', label: 'Hooter'},
    ];

    return (
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>IAMS Alarm Check Points</Text>

        {/* Header row for the options */}
        <View style={styles.alarmHeaderRow}>
          <Text style={styles.alarmItemLabel}>Alarm Point</Text>
          <Text style={styles.alarmOptionLabel}>Yes</Text>
          <Text style={styles.alarmOptionLabel}>No</Text>
          <Text style={styles.alarmOptionLabel}>N/R</Text>
        </View>

        {alarmItems.map(item => (
          <View key={item.id} style={styles.alarmRow}>
            <Text style={styles.alarmItemText}>
              {item.id}. {item.label}
            </Text>

            {/* Yes option */}
            <TouchableOpacity
              style={styles.radioContainer}
              onPress={() =>
                updateNestedFormData('iamsAlarms', item.name, 'yes')
              }>
              <View
                style={[
                  styles.radioButton,
                  formData.iamsAlarms?.[item.name] === 'yes' &&
                    styles.radioButtonSelected,
                ]}
              />
            </TouchableOpacity>

            {/* No option */}
            <TouchableOpacity
              style={styles.radioContainer}
              onPress={() =>
                updateNestedFormData('iamsAlarms', item.name, 'no')
              }>
              <View
                style={[
                  styles.radioButton,
                  formData.iamsAlarms?.[item.name] === 'no' &&
                    styles.radioButtonSelected,
                ]}
              />
            </TouchableOpacity>

            {/* Not Required option */}
            <TouchableOpacity
              style={styles.radioContainer}
              onPress={() =>
                updateNestedFormData('iamsAlarms', item.name, 'notRequired')
              }>
              <View
                style={[
                  styles.radioButton,
                  formData.iamsAlarms?.[item.name] === 'notRequired' &&
                    styles.radioButtonSelected,
                ]}
              />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    );
  };

  // Step 5: DCEM and Channel Details
  const renderStep5 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>DCEM Details</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Site Voltage</Text>
        <TextInput
          style={styles.input}
          value={formData.dcemDetail?.dcemMake}
          onChangeText={text =>
            updateNestedFormData('dcemDetail', 'dcemMake', text)
          }
          placeholder="Enter Site Voltage"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>DCEM Voltage</Text>
        <TextInput
          style={styles.input}
          value={formData.dcemDetail?.dcemVolt}
          onChangeText={text =>
            updateNestedFormData('dcemDetail', 'dcemVolt', text)
          }
          keyboardType="numeric"
          placeholder="Enter DCEM voltage"
        />
      </View>

      <Text style={[styles.stepTitle, {marginTop: 20}]}>Channel Details</Text>

      {/* Channel table header */}
      <View style={styles.tableRow}>
        <View style={styles.tableHeaderCell}>
          <Text style={styles.tableHeaderText}>Channel</Text>
        </View>
        <View style={[styles.tableHeaderCell, {flex: 2}]}>
          <Text style={styles.tableHeaderText}>Channel Operator Name</Text>
        </View>
        <View style={styles.tableHeaderCell}>
          <Text style={styles.tableHeaderText}>Channel Amp</Text>
        </View>
      </View>

      {/* Channel 1 */}
      <View style={styles.tableRow}>
        <View style={styles.tableCell}>
          <Text style={styles.tableCellText}>CH-1</Text>
        </View>
        <View style={[styles.tableCell, {flex: 2}]}>
          <SelectList
            setSelected={itemValue =>
              updateNestedFormData('dcemDetail', 'ch1', itemValue)
            }
            search={false}
            placeholder="Select Channel"
            data={data2}
            defaultOption={
              formData.dcemDetail?.ch1
                ? {key: '1', value: formData.dcemDetail.ch1}
                : undefined
            }
            save="value"
          />
        </View>
        <View style={styles.tableCell}>
          <TextInput
            style={styles.tableInput}
            value={formData.dcemDetail?.idc1}
            onChangeText={text =>
              updateNestedFormData('dcemDetail', 'idc1', text)
            }
            placeholder="Amp"
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* Channel 2 */}
      <View style={styles.tableRow}>
        <View style={styles.tableCell}>
          <Text style={styles.tableCellText}>CH-2</Text>
        </View>
        <View style={[styles.tableCell, {flex: 2}]}>
          <SelectList
            setSelected={itemValue =>
              updateNestedFormData('dcemDetail', 'ch2', itemValue)
            }
            search={false}
            placeholder="Select Channel"
            data={data2}
            defaultOption={
              formData.dcemDetail?.ch2
                ? {key: '1', value: formData.dcemDetail.ch2}
                : undefined
            }
            save="value"
          />
        </View>
        <View style={styles.tableCell}>
          <TextInput
            style={styles.tableInput}
            value={formData?.dcemDetail?.idc2}
            onChangeText={text =>
              updateNestedFormData('dcemDetail', 'idc2', text)
            }
            placeholder="Amp"
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* Channel 3 */}
      <View style={styles.tableRow}>
        <View style={styles.tableCell}>
          <Text style={styles.tableCellText}>CH-3</Text>
        </View>
        <View style={[styles.tableCell, {flex: 2}]}>
          <SelectList
            setSelected={itemValue =>
              updateNestedFormData('dcemDetail', 'ch3', itemValue)
            }
            search={false}
            data={data2}
            defaultOption={
              formData.dcemDetail?.ch3
                ? {key: '1', value: formData.dcemDetail?.ch3}
                : undefined
            }
            placeholder="Select Channel"
            save="value"
          />
        </View>
        <View style={styles.tableCell}>
          <TextInput
            style={styles.tableInput}
            value={formData.dcemDetail?.idc3}
            onChangeText={text =>
              updateNestedFormData('dcemDetail', 'idc3', text)
            }
            placeholder="Amp"
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* Channel 4 */}
      <View style={styles.tableRow}>
        <View style={styles.tableCell}>
          <Text style={styles.tableCellText}>CH-4</Text>
        </View>
        <View style={[styles.tableCell, {flex: 2}]}>
          <SelectList
            setSelected={itemValue =>
              updateNestedFormData('dcemDetail', 'ch4', itemValue)
            }
            placeholder="Select Channel"
            search={false}
            data={data2}
            defaultOption={
              formData.dcemDetail?.ch4
                ? {key: '1', value: formData.dcemDetail?.ch4}
                : undefined
            }
            save="value"
          />
        </View>
        <View style={styles.tableCell}>
          <TextInput
            style={styles.tableInput}
            value={formData.dcemDetail?.idc4}
            onChangeText={text =>
              updateNestedFormData('dcemDetail', 'idc4', text)
            }
            placeholder="Amp"
            keyboardType="numeric"
          />
        </View>
      </View>
      {/* Channel 5 */}
      <View style={styles.tableRow}>
        <View style={styles.tableCell}>
          <Text style={styles.tableCellText}>CH-5</Text>
        </View>
        <View style={[styles.tableCell, {flex: 2}]}>
          <SelectList
            setSelected={itemValue =>
              updateNestedFormData('dcemDetail', 'ch5', itemValue)
            }
            search={false}
            placeholder="Select Channel"
            data={data2}
            defaultOption={
              formData.dcemDetail?.ch5
                ? {key: '1', value: formData.dcemDetail?.ch5}
                : undefined
            }
            save="value"
          />
        </View>
        <View style={styles.tableCell}>
          <TextInput
            style={styles.tableInput}
            value={formData.dcemDetail?.idc5}
            onChangeText={text =>
              updateNestedFormData('dcemDetail', 'idc5', text)
            }
            placeholder="Amp"
            keyboardType="numeric"
          />
        </View>
      </View>
    </View>
  );
  // Step 6: Escalation Details
  const renderStep6 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Escalation Details</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Level 1</Text>
        <TextInput
          style={styles.input}
          value={formData.escalation?.level1}
          onChangeText={text =>
            updateNestedFormData('escalation', 'level1', text)
          }
          placeholder="Enter Level 1 contact"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Level 2</Text>
        <TextInput
          style={styles.input}
          value={formData.escalation?.level2}
          onChangeText={text =>
            updateNestedFormData('escalation', 'level2', text)
          }
          placeholder="Enter Level 2 contact"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Level 3</Text>
        <TextInput
          style={styles.input}
          value={formData.escalation?.level3}
          onChangeText={text =>
            updateNestedFormData('escalation', 'level3', text)
          }
          placeholder="Enter Level 3 contact"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Level 4</Text>
        <TextInput
          style={styles.input}
          value={formData.escalation?.level4}
          onChangeText={text =>
            updateNestedFormData('escalation', 'level4', text)
          }
          placeholder="Enter Level 4 contact"
        />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Level 5</Text>
        <TextInput
          style={styles.input}
          value={formData.escalation?.level5}
          onChangeText={text =>
            updateNestedFormData('escalation', 'level5', text)
          }
          placeholder="Enter Level 5 contact"
        />
      </View>
    </View>
  );

  // Step: Battery Details
  const renderStep7 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Battery Details</Text>

      {/* First 300ah battery */}
      {battery_bank_one && (
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Battery 1 ({battery_bank_one})</Text>
          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.subLabel}>Volt. Sense</Text>
              <View style={styles.optionContainer}>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    formData.battriesDetail?.voltSense1 === 'yes' &&
                      styles.selectedOption,
                  ]}
                  onPress={() =>
                    updateNestedFormData('battriesDetail', 'voltSense1', 'yes')
                  }>
                  <Text
                    style={
                      formData.battriesDetail?.voltSense1 === 'yes'
                        ? styles.selectedOptionText
                        : styles.optionText
                    }>
                    Yes
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    formData.battriesDetail?.voltSense1 === 'no' &&
                      styles.selectedOption,
                  ]}
                  onPress={() =>
                    updateNestedFormData('battriesDetail', 'voltSense1', 'no')
                  }>
                  <Text
                    style={
                      formData.battriesDetail?.voltSense1 === 'no'
                        ? styles.selectedOptionText
                        : styles.optionText
                    }>
                    No
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.column}>
              <Text style={styles.subLabel}>Batt. Loop</Text>
              <View style={styles.optionContainer}>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    formData.battriesDetail?.batteryloop1 === 'yes' &&
                      styles.selectedOption,
                  ]}
                  onPress={() =>
                    updateNestedFormData(
                      'battriesDetail',

                      'batteryloop1',
                      'yes',
                    )
                  }>
                  <Text
                    style={
                      formData.battriesDetail?.batteryloop1 === 'yes'
                        ? styles.selectedOptionText
                        : styles.optionText
                    }>
                    Yes
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    formData.battriesDetail?.batteryloop1 === 'no' &&
                      styles.selectedOption,
                  ]}
                  onPress={() =>
                    updateNestedFormData(
                      'battriesDetail',

                      'batteryloop1',
                      'no',
                    )
                  }>
                  <Text
                    style={
                      formData.battriesDetail?.batteryloop1 === 'no'
                        ? styles.selectedOptionText
                        : styles.optionText
                    }>
                    No
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <Text style={styles.subLabel}>Remarks</Text>
          <TextInput
            style={styles.input}
            value={formData.battriesDetail?.remark1}
            onChangeText={text =>
              updateNestedFormData('battriesDetail', 'remark1', text)
            }
            placeholder="Enter remarks"
            autoFocus={true}
          />
        </View>
      )}

      {/* Second 300ah battery */}
      {battery_bank_two && (
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Battery 2 ({battery_bank_two})</Text>
          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.subLabel}>Volt. Sense</Text>
              <View style={styles.optionContainer}>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    formData.battriesDetail?.voltSense2 === 'yes' &&
                      styles.selectedOption,
                  ]}
                  onPress={() =>
                    updateNestedFormData('battriesDetail', 'voltSense2', 'yes')
                  }>
                  <Text
                    style={
                      formData.battriesDetail?.voltSense2 === 'yes'
                        ? styles.selectedOptionText
                        : styles.optionText
                    }>
                    Yes
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    formData.battriesDetail?.voltSense2 === 'no' &&
                      styles.selectedOption,
                  ]}
                  onPress={() =>
                    updateNestedFormData('battriesDetail', 'voltSense2', 'no')
                  }>
                  <Text
                    style={
                      formData.battriesDetail?.voltSense2 === 'no'
                        ? styles.selectedOptionText
                        : styles.optionText
                    }>
                    No
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.column}>
              <Text style={styles.subLabel}>Batt. Loop</Text>
              <View style={styles.optionContainer}>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    formData.battriesDetail?.batteryloop2 === 'yes' &&
                      styles.selectedOption,
                  ]}
                  onPress={() =>
                    updateNestedFormData(
                      'battriesDetail',
                      'batteryloop2',
                      'yes',
                    )
                  }>
                  <Text
                    style={
                      formData.battriesDetail?.batteryloop2 === 'yes'
                        ? styles.selectedOptionText
                        : styles.optionText
                    }>
                    Yes
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    formData.battriesDetail?.batteryloop2 === 'no' &&
                      styles.selectedOption,
                  ]}
                  onPress={() =>
                    updateNestedFormData('battriesDetail', 'batteryloop2', 'no')
                  }>
                  <Text
                    style={
                      formData.battriesDetail?.batteryloop2 === 'no'
                        ? styles.selectedOptionText
                        : styles.optionText
                    }>
                    No
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <Text style={styles.subLabel}>Remarks</Text>
          <TextInput
            style={styles.input}
            value={formData.battriesDetail?.remark2}
            onChangeText={text =>
              updateNestedFormData('battriesDetail', 'remark2', text)
            }
            placeholder="Enter remarks"
            autoFocus={true}
          />
        </View>
      )}

      {/* Third 300ah battery */}
      {battery_bank_three && (
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Battery 3 ({battery_bank_three})</Text>
          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.subLabel}>Volt. Sense</Text>
              <View style={styles.optionContainer}>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    formData.battriesDetail?.voltSense3 === 'yes' &&
                      styles.selectedOption,
                  ]}
                  onPress={() =>
                    updateNestedFormData('battriesDetail', 'voltSense3', 'yes')
                  }>
                  <Text
                    style={
                      formData.battriesDetail?.voltSense3 === 'yes'
                        ? styles.selectedOptionText
                        : styles.optionText
                    }>
                    Yes
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    formData.battriesDetail?.voltSense3 === 'no' &&
                      styles.selectedOption,
                  ]}
                  onPress={() =>
                    updateNestedFormData('battriesDetail', 'voltSense3', 'no')
                  }>
                  <Text
                    style={
                      formData.battriesDetail?.voltSense3 === 'no'
                        ? styles.selectedOptionText
                        : styles.optionText
                    }>
                    No
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.column}>
              <Text style={styles.subLabel}>Batt. Loop</Text>
              <View style={styles.optionContainer}>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    formData.battriesDetail?.batteryloop3 === 'yes' &&
                      styles.selectedOption,
                  ]}
                  onPress={() =>
                    updateNestedFormData(
                      'battriesDetail',
                      'batteryloop3',
                      'yes',
                    )
                  }>
                  <Text
                    style={
                      formData.battriesDetail?.batteryloop3 === 'yes'
                        ? styles.selectedOptionText
                        : styles.optionText
                    }>
                    Yes
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    formData.battriesDetail?.batteryloop3 === 'no' &&
                      styles.selectedOption,
                  ]}
                  onPress={() =>
                    updateNestedFormData('battriesDetail', 'batteryloop3', 'no')
                  }>
                  <Text
                    style={
                      formData.battriesDetail?.batteryloop3 === 'no'
                        ? styles.selectedOptionText
                        : styles.optionText
                    }>
                    No
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <Text style={styles.subLabel}>Remarks</Text>
          <TextInput
            style={styles.input}
            value={formData.battriesDetail?.remark3}
            onChangeText={text =>
              updateNestedFormData('battriesDetail', 'remark3', text)
            }
            placeholder="Enter remarks"
            autoFocus={true}
          />
        </View>
      )}

      {/* First 600ah battery */}
      {battery_bank_four && (
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Battery 4 ({battery_bank_four})</Text>
          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.subLabel}>Volt. Sense</Text>
              <View style={styles.optionContainer}>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    formData.battriesDetail?.voltSense4 === 'yes' &&
                      styles.selectedOption,
                  ]}
                  onPress={() =>
                    updateNestedFormData('battriesDetail', 'voltSense4', 'yes')
                  }>
                  <Text
                    style={
                      formData.battriesDetail?.voltSense4 === 'yes'
                        ? styles.selectedOptionText
                        : styles.optionText
                    }>
                    Yes
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    formData.battriesDetail?.voltSense4 === 'no' &&
                      styles.selectedOption,
                  ]}
                  onPress={() =>
                    updateNestedFormData('battriesDetail', 'voltSense4', 'no')
                  }>
                  <Text
                    style={
                      formData.battriesDetail?.voltSense4 === 'no'
                        ? styles.selectedOptionText
                        : styles.optionText
                    }>
                    No
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.column}>
              <Text style={styles.subLabel}>Batt. Loop</Text>
              <View style={styles.optionContainer}>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    formData.battriesDetail?.batteryloop4 === 'yes' &&
                      styles.selectedOption,
                  ]}
                  onPress={() =>
                    updateNestedFormData(
                      'battriesDetail',
                      'batteryloop4',
                      'yes',
                    )
                  }>
                  <Text
                    style={
                      formData.battriesDetail?.batteryloop4 === 'yes'
                        ? styles.selectedOptionText
                        : styles.optionText
                    }>
                    Yes
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    formData.battriesDetail?.batteryloop4 === 'no' &&
                      styles.selectedOption,
                  ]}
                  onPress={() =>
                    updateNestedFormData('battriesDetail', 'batteryloop4', 'no')
                  }>
                  <Text
                    style={
                      formData.battriesDetail?.batteryloop4 === 'no'
                        ? styles.selectedOptionText
                        : styles.optionText
                    }>
                    No
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <Text style={styles.subLabel}>Remarks</Text>
          <TextInput
            style={styles.input}
            value={formData.battriesDetail?.remark4}
            onChangeText={text =>
              updateNestedFormData('battriesDetail', 'remark4', text)
            }
            placeholder="Enter remarks"
            autoFocus={true}
          />
        </View>
      )}

      {/* Second 600ah battery
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Battery 5 (600ah)</Text>
        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.subLabel}>Volt. Sense</Text>
            <View style={styles.optionContainer}>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  formData.batteries?.[4]?.voltSense === 'Yes' &&
                    styles.selectedOption,
                ]}
                onPress={() => updateBatteryData(4, 'voltSense', 'Yes')}>
                <Text
                  style={
                    formData.batteries?.[4]?.voltSense === 'Yes'
                      ? styles.selectedOptionText
                      : styles.optionText
                  }>
                  Yes
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  formData.batteries?.[4]?.voltSense === 'No' &&
                    styles.selectedOption,
                ]}
                onPress={() => updateBatteryData(4, 'voltSense', 'No')}>
                <Text
                  style={
                    formData.batteries?.[4]?.voltSense === 'No'
                      ? styles.selectedOptionText
                      : styles.optionText
                  }>
                  No
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.column}>
            <Text style={styles.subLabel}>Batt. Loop</Text>
            <View style={styles.optionContainer}>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  formData.batteries?.[4]?.battLoop === 'Yes' &&
                    styles.selectedOption,
                ]}
                onPress={() => updateBatteryData(4, 'battLoop', 'Yes')}>
                <Text
                  style={
                    formData.batteries?.[4]?.battLoop === 'Yes'
                      ? styles.selectedOptionText
                      : styles.optionText
                  }>
                  Yes
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  formData.batteries?.[4]?.battLoop === 'No' &&
                    styles.selectedOption,
                ]}
                onPress={() => updateBatteryData(4, 'battLoop', 'No')}>
                <Text
                  style={
                    formData.batteries?.[4]?.battLoop === 'No'
                      ? styles.selectedOptionText
                      : styles.optionText
                  }>
                  No
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <Text style={styles.subLabel}>Remarks</Text>
        <TextInput
          style={styles.input}
          value={formData.batteries?.[4]?.remarks || ''}
          onChangeText={text => updateBatteryData(4, 'remarks', text)}
          placeholder="Enter remarks"
          multiline={true}
        />
      </View> */}
    </View>
  );

  // Visit Status & Material Use render function
  const renderStep8 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Material Use</Text>

      {/* Visit Status section */}
      {/* <View style={styles.inputGroup}>
        <Text style={styles.label}>Visit Status</Text>
        <TextInput
          style={styles.input}
          value={formData.visitStatus}
          onChangeText={text => updateFormData('visitStatus', text)}
          placeholder="Enter visit status"
          multiline={true}
        />
      </View> */}

      {/* Materials Used section */}
      <Text style={[styles.sectionTitle, {marginTop: 15}]}>Materials Used</Text>

      {/* Table header for materials */}
      <View style={styles.tableRow}>
        <View style={[styles.tableHeaderCell, {flex: 2}]}>
          <Text style={styles.tableHeaderText}>Material Name</Text>
        </View>
        <View style={styles.tableHeaderCell}>
          <Text style={styles.tableHeaderText}>Quantity</Text>
        </View>

        <View style={styles.tableHeaderCell}>
          <Text style={styles.tableHeaderText}>Actions</Text>
        </View>
      </View>

      {/* Render existing materials */}
      {formData.materials &&
        formData.materials.map((material, index) => (
          <View key={index} style={styles.tableRow}>
            <View style={[styles.tableCell, {flex: 2}]}>
              <Text style={styles.tableCellText}>{material?.name?.name}</Text>
            </View>
            <View style={styles.tableCell}>
              <Text style={styles.tableCellText}>{material.quantity}</Text>
            </View>

            <View style={styles.tableCell}>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => removeMaterial(index)}>
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

      {/* Add new material section */}
      <View
        style={[
          styles.inputGroup,
          {
            marginTop: 15,
            borderTopWidth: 1,
            borderTopColor: '#ddd',
            paddingTop: 15,
          },
        ]}>
        <Text style={styles.label}>Add New Material</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.subLabel}>Material Name</Text>

          <SelectList
            setSelected={value => updateNewMaterial('name', value)}
            data={data1}
            save="key"
          />
        </View>

        <View style={styles.column}>
          <Text style={styles.subLabel}>Quantity</Text>
          <TextInput
            style={styles.input}
            value={newMaterial.quantity}
            onChangeText={text => updateNewMaterial('quantity', text)}
            placeholder="Quantity"
            keyboardType="numeric"
          />
        </View>

        <TouchableOpacity style={styles.addButton} onPress={addMaterial}>
          <Text style={styles.addButtonText}>Add Material</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStep9 = () => {
    return (
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>Signatures</Text>

        <View style={styles.signatureContainer}>
          {/* STPL Representative Signature */}
          <View style={styles.signatureBox}>
            <Text style={styles.signatureTitle}>
              Signature of STPL Representative
            </Text>

            <View style={styles.signatureRow}>
              <Text style={styles.signatureLabel}>Name:</Text>
              <TextInput
                style={styles.signatureInput}
                value={formData.stplSignature?.name || ''}
                autoFocus={true}
                onChangeText={text =>
                  updateNestedFormData('stplSignature', 'name', text)
                }
                placeholder="Enter name"
              />
            </View>

            <View style={styles.signatureRow}>
              <Text style={styles.signatureLabel}>Date:</Text>
              <Text style={styles.signatureDate}>
                {formData.stplSignature?.date
                  ? new Date(formData.stplSignature.date).toLocaleDateString()
                  : 'Not signed yet'}
              </Text>
            </View>

            <View style={styles.signatureRow}>
              <Text style={styles.signatureLabel}>Sign:</Text>
              <View style={styles.signatureAreaContainer}>
                <TouchableOpacity
                  style={styles.signatureArea}
                  onPress={() => handleSignature('stpl')}>
                  {formData.stplSignature?.signature ? (
                    <Image
                      source={{uri: formData.stplSignature.signature}}
                      style={styles.signatureImage}
                      resizeMode="contain"
                    />
                  ) : (
                    <Text style={styles.signaturePlaceholder}>Tap to sign</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Customer Representative Signature */}
          <View style={styles.signatureBox}>
            <Text style={styles.signatureTitle}>
              Signature of Customer Representative (Tech/CE/CI)
            </Text>

            <View style={styles.signatureRow}>
              <Text style={styles.signatureLabel}>Name:</Text>
              <TextInput
                style={styles.signatureInput}
                value={formData.customerSignature?.name || ''}
                autoFocus={true}
                onChangeText={text =>
                  updateNestedFormData('customerSignature', 'name', text)
                }
                placeholder="Enter name"
              />
            </View>

            <View style={styles.signatureRow}>
              <Text style={styles.signatureLabel}>Date:</Text>
              <Text style={styles.signatureDate}>
                {formData.customerSignature?.date
                  ? new Date(
                      formData.customerSignature.date,
                    ).toLocaleDateString()
                  : 'Not signed yet'}
              </Text>
            </View>

            <View style={styles.signatureRow}>
              <Text style={styles.signatureLabel}>Sign:</Text>
              <View style={styles.signatureAreaContainer}>
                <TouchableOpacity
                  style={styles.signatureArea}
                  onPress={() => handleSignature('customer')}>
                  {formData.customerSignature?.signature ? (
                    <Image
                      source={{uri: formData.customerSignature.signature}}
                      style={styles.signatureImage}
                      resizeMode="contain"
                    />
                  ) : (
                    <Text style={styles.signaturePlaceholder}>Tap to sign</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Signature capture modal */}
        <SignatureModal />
      </View>
    );
  };
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      case 5:
        return renderStep5();
      case 6:
        return renderStep6();
      case 7:
        return renderStep7();
      case 8:
        return renderStep8();
      case 9:
        return renderStep9();
      default:
        return renderStep1();
    }
  };

  const renderStepIndicator = () => {
    const totalSteps = 9;
    return (
      <View style={styles.stepIndicatorContainer}>
        {Array.from({length: totalSteps}, (_, i) => i + 1).map(step => (
          <View
            key={step}
            style={[
              styles.stepIndicator,
              currentStep === step && styles.currentStepIndicator,
            ]}>
            <Text
              style={[
                styles.stepIndicatorText,
                currentStep === step && styles.currentStepIndicatorText,
              ]}>
              {step}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const isLastStep = currentStep === 9;

  return (
    <>
      <SafeAreaView style={styles.container}>
        <StatusBar
          translucent={true}
          backgroundColor="transparent"
          barStyle="dark-content"
        />
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}>
            <Back width={24} height={24} rotation={90} fill={'white'} />
          </TouchableOpacity>
          <Text style={styles.headerText}>Wcc Form</Text>
        </View>

        <ScrollView>
          {renderStepIndicator()}
          {renderCurrentStep()}

          <View style={styles.buttonContainer}>
            {currentStep > 1 && (
              <TouchableOpacity
                style={[styles.button, styles.prevButton]}
                onPress={prevStep}
                disabled={isLoading}>
                <Text style={styles.buttonText}>Previous</Text>
              </TouchableOpacity>
            )}

            {!isLastStep ? (
              <TouchableOpacity
                style={[styles.button, styles.nextButton]}
                onPress={nextStep}
                disabled={isLoading}>
                <Text style={styles.buttonText}>Next</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.button, styles.submitButton]}
                onPress={handleSubmit}
                disabled={isLoading}>
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Submit</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: StatusBar.currentHeight,
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
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  stepIndicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 16,
  },
  stepIndicator: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  currentStepIndicator: {
    backgroundColor: '#4CAF50',
  },
  stepIndicatorText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#757575',
  },
  currentStepIndicatorText: {
    color: 'white',
  },
  stepContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    margin: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#4CAF50',
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  picker: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#757575',
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 16,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 120,
  },
  prevButton: {
    backgroundColor: '#757575',
  },
  nextButton: {
    backgroundColor: '#2196F3',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },

  alarmHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginBottom: 8,
  },
  alarmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  alarmItemLabel: {
    flex: 3,
    fontWeight: 'bold',
    fontSize: 15,
  },
  alarmOptionLabel: {
    flex: 1,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 14,
  },
  alarmItemText: {
    flex: 3,
    fontSize: 15,
  },
  radioContainer: {
    flex: 1,
    alignItems: 'center',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#757575',
  },
  radioButtonSelected: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  // Add these to your styles object
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  tableHeaderCell: {
    padding: 10,
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  tableHeaderText: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tableCell: {
    padding: 5,
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  tableCellText: {
    textAlign: 'center',
    paddingVertical: 10,
  },
  tableInput: {
    height: 40,
    paddingHorizontal: 5,
    width: '100%',
  },
  // Add these to your styles object
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  column: {
    flex: 1,
    marginRight: 10,
  },
  subLabel: {
    fontSize: 14,
    marginBottom: 5,
    fontWeight: '500',
    color: '#333',
  },
  optionContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    width: '100%',
  },
  optionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 10,
    minWidth: 60,
    alignItems: 'center',
  },
  selectedOption: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  optionText: {
    color: '#333',
  },
  selectedOptionText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#f44336',
    padding: 5,
    borderRadius: 5,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 12,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  signatureCanvasContainer: {
    width: '100%',
    height: 300,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 20,
  },
  cancelButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  signatureAreaContainer: {
    flex: 1,
  },
  signatureArea: {
    height: 100,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    width: '100%',
  },
  signatureDate: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    color: '#555',
  },
  // Existing styles remain the same
  signatureContainer: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
  },
  signatureBox: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  signatureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    backgroundColor: '#f5f5f5',
    padding: 5,
  },
  signatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 5,
  },
  signatureLabel: {
    width: 50,
    fontWeight: '500',
  },
  signatureInput: {
    flex: 1,
    height: 40,
    paddingHorizontal: 10,
  },
  signatureImage: {
    width: '100%',
    height: '100%',
  },
  signaturePlaceholder: {
    color: '#999',
  },
});

export default SiteInstallationForm;
