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
  ToastAndroid,
} from 'react-native';

import {SelectList} from 'react-native-dropdown-select-list';
import {useNavigation, useRoute} from '@react-navigation/native';
import {
  getmaterailName,
  insert_wcc_data,
  get_gps_current_status,
  get_tpms_current_status
} from '../service/ApiService';

import Back from '../../assets/svg/drop.svg';
import SignatureCanvas from 'react-native-signature-canvas';
import {Image} from 'react-native-animatable';
import Toast from 'react-native-toast-message';

const EditWcc = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const signatureRef = useRef(null);
  const [selectResetKey, setSelectResetKey] = useState(0);
  const [signatureModalVisible, setSignatureModalVisible] = useState(false);
  const [currentSignatureType, setCurrentSignatureType] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);
  const navigation = useNavigation();
  const [matrailName, setMatrailName] = useState([]);
  const [current_status, setCurrentStatus] = useState({});
  // const [tpms_current_status, setTpmsCurrentStatus] = useState({});
  const [errors, setErrors] = useState({});

  const getErrorStyle = field =>
    errors[field] ? {borderColor: 'red', borderWidth: 1} : {};
  const isInvalid = value => {
    return (
      !value ||
      value.trim() == '' ||
      value.trim().toLowerCase() == 'na' ||
      value.trim().toLowerCase() == 'req' ||
      value.trim().toLowerCase() == 'required'
    );
  };
  const {
    ignition,
    motion,
    charge,
    adc1,
    battery_level,
    rssi,
    sat,
    status,
    latitude,
    longitude,
    iccid,
    volt,
    idc1,
    idc2,
    idc3,
    idc4,
    idc5,
    vdc,
    l1_number,
    l2_number,
    l3_number,
    l4_number,
    l5_number,
  } = current_status || {};
  // console.log('Current Status:', current_status);

  const route = useRoute();
  const {
    client_name,
    state_name,
    district_name,
    cluster_name,
    site_name,
    site_id,
    system_version_type,
    site_mobile_no,
    sim_serial_no,
    gsm_imei_no,
    system_serial_no,
    product_type,
    site_type,
    battery_bank_one,
    battery_bank_two,
    battery_bank_three,
    battery_bank_four,
    ch1,
    ch2,
    ch3,
    ch4,
    ch5,
    is_chargeable,
  
  } = route.params.item;
  console.log(route.params.item,"route.params.item");
  const {
    imei,
    mode,
    version,
    color,
    uniqueId,
    serviceType,
    complainNo,
    technicianName,
    item,
  } = route.params;

  const validateStep1 = () => {
    const fields = formData.siteDetails;
    const newErrors = {};

    const requiredFields = [
      'client',
      'circle',
      'zone',
      'cluster',
      'dist',
      'siteId',
      'siteRefId',
      'globalId',
      'siteName',
      'gsmImeiNumber',
    ];

    requiredFields.forEach(field => {
      if (isInvalid(fields[field])) {
        newErrors[field] = 'This field is required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const {workDetails} = formData;
    const newErrors = {};
    const requiredFields = [
      'workDescription',
      'scope',
      'workCompletionDate',
      'siteType',
    ];

    requiredFields.forEach(field => {
      if (isInvalid(workDetails[field])) {
        newErrors[field] = 'Required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const validateStep8 = () => {
    const {materials} = formData;
    return materials.length > 0;
  };

  const data1 = [
    ...matrailName.map(item => ({
      key: {
        id: item.id,
        name: item.name,
        part_code: item.PartCode,
        unit: item.Unit,
      },
      value: `${item.name} (${item.PartCode}) - ${item.Unit}`,
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
  const data4 = [
    {key: '1', value: 'Consumed'},
    {key: '2', value: 'Not-Consumed'},
  ];

  const data5 = [
    {key: '1', value: 'Returning'},
    {key: '2', value: 'Not Returning'},
  ];

  const reverseGeocode = async (lat, lon) => {
    try {
      const apiKey = '2dbbdec346794303ae8f1b02b250b941';
      const url = `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&apiKey=${apiKey}`;
      const response = await fetch(url);
      const json = await response.json();

      const feature = json?.features?.[0];
      if (!feature) return `${lat}, ${lon}`;

      // formatted is Geoapify's ready-to-display address string
      return feature.properties?.formatted || `${lat}, ${lon}`;
    } catch (error) {
      console.log('Reverse geocode failed:', error);
      return `${lat}, ${lon}`; // fall back to raw coordinates
    }
  };

  // console.log('route.params', route.params.item);

  const fetchMaterailName = async () => {
    data.data = await getmaterailName();
    setMatrailName(data?.data?.data);
  };
  const fetch_gps_current_status = async gps_imei => {
    const result = await get_gps_current_status(gps_imei);
    const statusData = result?.data || {};
    // console.log('GPS Current Status:', statusData);
    setCurrentStatus(statusData);

    let locationText = '';
    if (
      statusData?.latitude !== undefined &&
      statusData?.longitude !== undefined
    ) {
      locationText = await reverseGeocode(
        statusData.latitude,
        statusData.longitude,
      );
    }

    updateFormData('gpsTestingDetails', {
      ignition: statusData?.ignition,
      motion: statusData?.motion,
      charge: statusData?.charge,
      adc1: statusData?.adc1,
      battery_level: statusData?.battery_level,
      rssi: statusData?.rssi,
      sat: statusData?.sat,
      status: statusData?.status,
      gps_imei: statusData?.gps_imei,
      dg_name: statusData?.dg_name,
      dg_rating: statusData?.dg_rating,
      dg_make: statusData?.dg_make,
      dg_number: statusData?.dg_number,
      dg_contact_no: statusData?.dg_contact_no,
      dg_contact_person_name: statusData?.dg_contact_person_name,
      gps_indus_id: statusData?.gps_indus_id,
      deviceid: statusData?.deviceid,
      iccid: statusData?.iccid,
      location: locationText,
    });
    
  };
  
  const fetch_tpms_current_status = async tpms_imei => {
    try {
      // console.log('Fetching TPMS Current Status for IMEI:', tpms_imei);
      const result = await get_tpms_current_status(tpms_imei);
      // console.log('TPMS API Response:', result);
      const statusData = result?.data || {};
      // console.log('TPMS Current Status:', statusData);
      setCurrentStatus(statusData);
    } catch (error) {
      console.log(
        'TPMS Current Status Error:',
        error?.response?.data || error?.message || error,
      );
    }
  };

  // console.log(current_status,"current_status");
  const isGpsProduct =
    (product_type || '').toString().trim().toLowerCase() === 'gps';
  const skipSteps = isGpsProduct ? [4, 5, 7, 9] : [3, 6];
  const totalSteps = 11;
  const isStepSkipped = step => skipSteps.includes(step);

  useEffect(() => {
    fetchMaterailName();
    if (product_type && product_type.toLowerCase() === 'gps') {
      fetch_gps_current_status(gsm_imei_no);
    }
    else{
      // console.log('Fetching TPMS Current Status for IMEI:', gsm_imei_no);
      fetch_tpms_current_status(gsm_imei_no);
    }

    const currentDate = new Date().toLocaleDateString('en-GB');
    setFormData({
      uniqueId,
      siteDetails: {
        client: client_name,
        circle: state_name,
        zone: district_name,
        cluster: cluster_name,
        dist: district_name,
        siteId: site_id,
        siteRefId: site_id,
        globalId: site_id,
        siteName: site_name,
        siteNumber: site_mobile_no,
        simSerialNumber: current_status.iccid,
        gsmImeiNumber: gsm_imei_no,
        ProductType: product_type,
        systemVer: system_version_type,
        systemSlNo: system_serial_no,
        is_chargeable: is_chargeable,
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
        workDescription: '',
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
        fiberCut: 'notRequired',
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
      materials: [],
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
  }, [route.params.item.site_id]);

  useEffect(() => {
    // if (!current_status || Object.keys(current_status).length === 0) return;

    updateFormData('escalation', {
      level1: current_status.l1_number,
      level2: current_status.l2_number,
      level3: current_status.l3_number,
      level4: current_status.l4_number,
      level5: current_status.l5_number,
    });
    updateFormData(
      'siteDetails', {
        client: client_name,
        circle: state_name,
        zone: district_name,
        cluster: cluster_name,
        dist: district_name,
        siteId: site_id,
        siteRefId: site_id,
        globalId: site_id,
        siteName: site_name,
        siteNumber: site_mobile_no,
        simSerialNumber: current_status.iccid,
        gsmImeiNumber: gsm_imei_no,
        ProductType: product_type,
        systemVer: system_version_type,
        systemSlNo: system_serial_no,
        is_chargeable: is_chargeable,
      }
    );

    updateFormData('dcemDetail', {
      dcemMake: current_status.volt,
      dcemVolt: current_status.vdc,
      ch1: ch1,
      ch2: ch2,
      ch3: ch3,
      ch4: ch4,
      ch5: ch5,
      idc1: current_status.idc1,
      idc2: current_status.idc2,
      idc3: current_status.idc3,
      idc4: current_status.idc4,
      idc5: current_status.idc5,
    });
  }, [current_status]);
  const [formData, setFormData] = useState({
    // Site & SIM Installation Details
    uniqueId,
    siteDetails: {
      client: client_name,
      circle: state_name,
      zone: district_name,
      cluster: cluster_name,
      dist: district_name,
      siteId: site_id,
      siteRefId: site_id,
      globalId: site_id,
      siteName: site_name,
      siteNumber: site_mobile_no,
      simSerialNumber: iccid,
      gsmImeiNumber: gsm_imei_no,
      systemVer: system_version_type,
      systemSlNo: system_serial_no,
      ProductType: product_type,
      is_chargeable: is_chargeable,
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
      fiberCut: 'notrequired',
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
    // DCEM Details
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
    // Batteries Details
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
    // GPS Alarm Check Points
    gpsAlarms: {
      ignition: 'notRequired',
      motionSense: 'notRequired',
      chargeStatus: 'notRequired',
      gpsSignal: 'notRequired',
      satellite: 'notRequired',
      InputVolt: 'notRequired',
      trackerStatus: 'notRequired',
      BatteryLevel: 'notRequired',
      Location: 'notRequired',
    },
    materials: {
      name: '',
      quantity: '',
      ConsumptionStatus: '',
      DefectiveReturningToStore: '',
      ReturnStatus: '',
      ReasonForNotOk: '',
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

  const updateNestedFormData = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));

    // Clear error for this field
    setErrors(prev => ({
      ...prev,
      [field]: null,
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
    ConsumptionStatus: '',
    DefectiveReturningToStore: '',
    ReturnStatus: '',
    ReasonForNotOk: '',
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
    if (newMaterial.name == '' || newMaterial.ConsumptionStatus == '') {
      showToast('Error', 'Please Select Material Name');
      return;
    }
    if (newMaterial.ConsumptionStatus === 'Consumed') {
      if (newMaterial.quantity == '') {
        // You could show an alert here
        showToast('Error', 'Please fill Consumed Quantity.');
        return;
      }
      if (
        newMaterial.DefectiveReturningToStore === 'Not Returning' &&
        newMaterial.ReasonForNotOk == ''
      ) {
        showToast('Error', 'Please fill Reason For Not Returning.');
        return;
      }
    }

    // Create updated materials array
    const updatedMaterials = [...(formData.materials || []), newMaterial];

    // Update form data
    updateFormData('materials', updatedMaterials);

    // Reset new material form
    setNewMaterial({
      name: '',
      quantity: '',
      ConsumptionStatus: '',
      DefectiveReturningToStore: '',
      ReturnStatus: '',
      ReasonForNotOk: '',
    });
    setSelectResetKey(prev => prev + 1);
  };
  const showToast = (title, message) => {
    ToastAndroid.show(`${title + ' ' + message}`, ToastAndroid.SHORT);
    Toast.show({
      type: 'success',
      text1: title,
      text2: message,
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
    console.log('Current Step:');
    if (currentStep === 1 && !validateStep1()) {
      Alert.alert(
        'Validation Error',
        'Please fill all required fields in Step 1.',
      );
      return;
    }

    if (currentStep === 2 && !validateStep2()) {
      Alert.alert(
        'Validation Error',
        'Please fill all required fields in Step 2.',
      );
      return;
    }
    if (currentStep === 10 && !validateStep8()) {
      Alert.alert('Validation Error', 'Please add matterial in Step 10.');
      return;
    }

    let next = currentStep + 1;
    while (next <= totalSteps && isStepSkipped(next)) next++;
    setCurrentStep(next);
  };

  const prevStep = () => {
    let prev = currentStep - 1;
    while (prev >= 1 && isStepSkipped(prev)) prev--;
    setCurrentStep(prev);
  };
  const handleSubmit = async () => {
    // Show loader
    try {
      const stplSig = formData?.stplSignature;
      const customerSig = formData?.customerSignature;
      console.log(formData.siteDetails.is_chargeable);

      // Check if STPL Signature is empty
      if (!stplSig?.name) {
        Alert.alert(
          'Missing Data',
          'Please Provide Name of STPL Representative.',
        );
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
      console.log('Submitting form data:', formData.gpsTestingDetails);

      const response = await insert_wcc_data(formData);

      if (response.status) {
        console.log(response.received.gpsTestingDetails);
        showToast('Wcc Created Successfully', '');
        navigation.navigate('BookingScreen');
      }
    } catch (error) {
      console.log('Submission error:', error);
      console.log('Server response:', error?.response?.data);

      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Something went wrong while submitting. Please try again.';

      Alert.alert('Submission Error', message);
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
          style={[
            styles.input,
            errors.client && {borderColor: 'red', borderWidth: 1},
          ]}
          value={formData.siteDetails.client}
          onChangeText={text =>
            updateNestedFormData('siteDetails', 'client', text)
          }
          readOnly={true}
          placeholder="Enter client name"
          placeholderTextColor="gray"
        />
        {errors.client && <Text style={styles.errorText}>{errors.client}</Text>}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Circle</Text>
        <TextInput
          style={[
            styles.input,
            errors.circle && {borderColor: 'red', borderWidth: 1},
          ]}
          value={formData.siteDetails.circle}
          readOnly={true}
          onChangeText={text =>
            updateNestedFormData('siteDetails', 'circle', text)
          }
          placeholder="Enter circle"
          placeholderTextColor="gray"
        />
        {errors.circle && <Text style={styles.errorText}>{errors.circle}</Text>}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Zone</Text>
        <TextInput
          style={[
            styles.input,
            errors.zone && {borderColor: 'red', borderWidth: 1},
          ]}
          value={formData.siteDetails.zone}
          onChangeText={text =>
            updateNestedFormData('siteDetails', 'zone', text)
          }
          readOnly={true}
          placeholder="Enter zone"
          placeholderTextColor="gray"
        />
        {errors.zone && <Text style={styles.errorText}>{errors.zone}</Text>}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Cluster</Text>
        <TextInput
          style={[
            styles.input,
            errors.cluster && {borderColor: 'red', borderWidth: 1},
          ]}
          value={formData.siteDetails.cluster}
          readOnly={true}
          onChangeText={text =>
            updateNestedFormData('siteDetails', 'cluster', text)
          }
          placeholder="Enter cluster"
          placeholderTextColor="gray"
        />
        {errors.cluster && (
          <Text style={styles.errorText}>{errors.cluster}</Text>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Dist</Text>
        <TextInput
          style={[
            styles.input,
            errors.dist && {borderColor: 'red', borderWidth: 1},
          ]}
          value={formData.siteDetails.dist}
          onChangeText={text =>
            updateNestedFormData('siteDetails', 'dist', text)
          }
          readOnly={true}
          placeholder="Enter district"
          placeholderTextColor="gray"
        />
        {errors.dist && <Text style={styles.errorText}>{errors.dist}</Text>}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Site ID</Text>
        <TextInput
          style={[
            styles.input,
            errors.siteId && {borderColor: 'red', borderWidth: 1},
          ]}
          value={formData.siteDetails.siteId}
          onChangeText={text =>
            updateNestedFormData('siteDetails', 'siteId', text)
          }
          placeholder="Enter site ID"
          placeholderTextColor="gray"
        />
        {errors.siteId && <Text style={styles.errorText}>{errors.siteId}</Text>}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Site Ref ID</Text>
        <TextInput
          style={[
            styles.input,
            errors.siteRefId && {borderColor: 'red', borderWidth: 1},
          ]}
          value={formData.siteDetails.siteRefId}
          onChangeText={text =>
            updateNestedFormData('siteDetails', 'siteRefId', text)
          }
          placeholder="Enter site reference ID"
          placeholderTextColor="gray"
        />
        {errors.siteRefId && (
          <Text style={styles.errorText}>{errors.siteRefId}</Text>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Global ID</Text>
        <TextInput
          style={[
            styles.input,
            errors.globalId && {borderColor: 'red', borderWidth: 1},
          ]}
          value={formData.siteDetails.globalId}
          readOnly={true}
          onChangeText={text =>
            updateNestedFormData('siteDetails', 'globalId', text)
          }
          placeholder="Enter global ID"
          placeholderTextColor="gray"
        />
        {errors.globalId && (
          <Text style={styles.errorText}>{errors.globalId}</Text>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Site Name</Text>
        <TextInput
          style={[
            styles.input,
            errors.siteName && {borderColor: 'red', borderWidth: 1},
          ]}
          value={formData.siteDetails.siteName}
          onChangeText={text =>
            updateNestedFormData('siteDetails', 'siteName', text)
          }
          readOnly={true}
          placeholder="Enter site name"
          placeholderTextColor="gray"
        />
        {errors.siteName && (
          <Text style={styles.errorText}>{errors.siteName}</Text>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Site Number</Text>
        <TextInput
          style={[
            styles.input,
            errors.siteNumber && {borderColor: 'red', borderWidth: 1},
          ]}
          value={formData.siteDetails.siteNumber}
          onChangeText={text =>
            updateNestedFormData('siteDetails', 'siteNumber', text)
          }
          placeholder="Enter site number"
          placeholderTextColor="gray"
          keyboardType="numeric"
        />
        {errors.siteNumber && (
          <Text style={styles.errorText}>{errors.siteNumber}</Text>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>SIM Serial Number</Text>
        <TextInput
          style={[
            styles.input,
            errors.simSerialNumber && {borderColor: 'red', borderWidth: 1},
          ]}
          value={formData.siteDetails.simSerialNumber}
          onChangeText={text =>
            updateNestedFormData('siteDetails', 'simSerialNumber', text)
          }
          placeholder="Enter SIM serial number"
          placeholderTextColor="gray"
        />
        {errors.simSerialNumber && (
          <Text style={styles.errorText}>{errors.simSerialNumber}</Text>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>GSM IMEI Number</Text>
        <TextInput
          style={[
            styles.input,
            errors.gsmImeiNumber && {borderColor: 'red', borderWidth: 1},
          ]}
          value={formData.siteDetails.gsmImeiNumber}
          readOnly={true}
          onChangeText={text =>
            updateNestedFormData('siteDetails', 'gsmImeiNumber', text)
          }
          placeholder="Enter GSM IMEI number"
          placeholderTextColor="gray"
        />
        {errors.gsmImeiNumber && (
          <Text style={styles.errorText}>{errors.gsmImeiNumber}</Text>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>System Version</Text>
        <TextInput
          style={[
            styles.input,
            errors.systemVer && {borderColor: 'red', borderWidth: 1},
          ]}
          value={formData.siteDetails.systemVer}
          onChangeText={text =>
            updateNestedFormData('siteDetails', 'systemVer', text)
          }
          placeholder="Enter System Version"
          placeholderTextColor="gray"
        />
        {errors.systemVer && (
          <Text style={styles.errorText}>{errors.systemVer}</Text>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>System Serial Number</Text>
        <TextInput
          style={[
            styles.input,
            errors.systemSlNo && {borderColor: 'red', borderWidth: 1},
          ]}
          value={formData.siteDetails.systemSlNo}
          onChangeText={text =>
            updateNestedFormData('siteDetails', 'systemSlNo', text)
          }
          placeholder="Enter System Serial Number"
          placeholderTextColor="gray"
        />
        {errors.systemSlNo && (
          <Text style={styles.errorText}>{errors.systemSlNo}</Text>
        )}
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Product type</Text>
        <TextInput
          style={[
            styles.input,
            errors.ProductType && {borderColor: 'red', borderWidth: 1},
          ]}
          value={formData.siteDetails.ProductType}
          readOnly={true}
          onChangeText={text =>
            updateNestedFormData('siteDetails', 'ProductType', text)
          }
          placeholder="Enter Product Type"
          placeholderTextColor="gray"
        />
        {errors.ProductType && (
          <Text style={styles.errorText}>{errors.ProductType}</Text>
        )}
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
          placeholder="Select Work Status"
          boxStyles={[
            styles.input,
            errors.workDescription && {borderColor: 'red', borderWidth: 1},
            {borderColor: '#333'},
          ]}
          inputStyles={{
            color: formData.workDetails?.workDescription ? 'black' : 'gray',
          }}
          dropdownTextStyles={{color: 'gray'}}
          save="value"
        />
        {errors.workDescription && (
          <Text style={styles.errorText}>{errors.workDescription}</Text>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Visit Type</Text>
        <TextInput
          style={[
            styles.input,
            errors.scope && {borderColor: 'red', borderWidth: 1},
          ]}
          value={formData.workDetails?.scope}
          onChangeText={text =>
            updateNestedFormData('workDetails', 'scope', text)
          }
          placeholder="Enter Visit Type"
          placeholderTextColor="gray"
        />
        {errors.scope && <Text style={styles.errorText}>{errors.scope}</Text>}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Service Complaint Number</Text>
        <TextInput
          style={[
            styles.input,
            errors.serviceComplaintNumber && {
              borderColor: 'red',
              borderWidth: 1,
            },
          ]}
          value={formData.workDetails?.serviceComplaintNumber}
          onChangeText={text =>
            updateNestedFormData('workDetails', 'serviceComplaintNumber', text)
          }
          readOnly={true}
          placeholder="Enter service complaint number"
          placeholderTextColor="gray"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Work Completion Date</Text>
        <TextInput
          style={[
            styles.input,
            errors.workCompletionDate && {borderColor: 'red', borderWidth: 1},
          ]}
          value={formData.workDetails?.workCompletionDate}
          onChangeText={text =>
            updateNestedFormData('workDetails', 'workCompletionDate', text)
          }
          placeholder="DD/MM/YYYY"
          placeholderTextColor="gray"
        />
        {errors.workCompletionDate && (
          <Text style={styles.errorText}>{errors.workCompletionDate}</Text>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Site Type</Text>
        <TextInput
          style={[
            styles.input,
            errors.siteType && {borderColor: 'red', borderWidth: 1},
          ]}
          value={formData.workDetails?.siteType}
          onChangeText={text =>
            updateNestedFormData('workDetails', 'siteType', text)
          }
          placeholder="Enter site type"
          placeholderTextColor="gray"
        />
        {errors.siteType && (
          <Text style={styles.errorText}>{errors.siteType}</Text>
        )}
      </View>
    </View>
  );

  const renderStep3 = () => {
    const gpsTestingDetails = {
      ignition: ignition,
      motion: motion,
      charge: charge,
      adc1: adc1,
      battery_level: battery_level,
      rssi: rssi,
      sat: sat,
      status: status,
      location: formData.gpsTestingDetails?.location,
    };

    const rows = [
      {label: 'Ignition', value: gpsTestingDetails.ignition},
      {label: 'Motion Sense', value: gpsTestingDetails.motion},
      {label: 'Charge Status', value: gpsTestingDetails.charge},
      {label: 'Input Volt', value: gpsTestingDetails.adc1},
      {label: 'Battery Level', value: gpsTestingDetails.battery_level},
      {label: 'GPS Signal', value: gpsTestingDetails.rssi},
      {label: 'Satellite', value: gpsTestingDetails.sat},
      {label: 'Tracker Status', value: gpsTestingDetails.status},
      {label: 'Location', value: gpsTestingDetails.location},
    ];

    const formatValue = row => {
      if (row.value === undefined || row.value === null || row.value === '') {
        return '-';
      }

      const isOn = row.value === '1' || row.value === 1 || row.value === true;

      switch (row.label) {
        case 'Ignition':
          return isOn ? 'DG_ON' : 'DG_OFF';
        case 'Motion Sense':
          return isOn ? 'MOVING' : 'STOPPED';
        case 'Charge Status':
          return isOn ? 'CHARGING' : 'NOT_CHARGING';
        default:
          return String(row.value);
      }
    };

    return (
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>GPS Testing Details</Text>

        <View style={styles.tableRow}>
          <View style={styles.tableHeaderCell}>
            <Text style={styles.tableHeaderText}>Parameter</Text>
          </View>
          <View style={styles.tableHeaderCell}>
            <Text style={styles.tableHeaderText}>Value</Text>
          </View>
        </View>

        {rows.map((row, index) => (
          <View key={index} style={styles.tableRow}>
            <View style={styles.tableCell}>
              <Text style={styles.tableCellText}>{row.label}</Text>
            </View>
            <View style={styles.tableCell}>
              <Text style={styles.tableCellText}>{formatValue(row)}</Text>
            </View>
          </View>
        ))}
      </View>
    );
  };
  // Step 3: TPMS Alarm Check Points
  const renderStep4 = () => {
    const alarmItems = [
      {id: 1, name: 'bbLoopBreak', label: 'BB Loop Break'},
      {id: 2, name: 'bb1Disconnect1', label: 'BB1 Disconnect1'},
      {id: 3, name: 'bb1Disconnect2', label: 'BB1 Disconnect2'},
      {id: 4, name: 'bb2Disconnect1', label: 'BB2 Disconnect1'},
      {id: 5, name: 'bb2Disconnect2', label: 'BB2 Disconnect2'},
      {id: 6, name: 'llvdCut', label: 'LLVD Cut'},
      {id: 7, name: 'fiberCut', label: 'Fiber Cut'},
      {id: 8, name: 'extraDoor', label: 'Extra Door'},
      {id: 9, name: 'shelterLoop', label: 'Shelter Loop'},
      {id: 10, name: 'bb4Disconnect', label: 'BB4 Disconnect'},
      {id: 11, name: 'btsOpen', label: 'BTS Open'},
      {id: 12, name: 'rectifierFail', label: 'Rectifier Fail'},
      {id: 13, name: 'rruDisconnect', label: 'RRU Disconnect'},
      {id: 14, name: 'rtnOpen', label: 'RTN Open'},
      {id: 15, name: 'extraAlarm1', label: 'Extra Alarm'},
      {id: 16, name: 'extraAlarm2', label: 'Extra Alarm'},
      {id: 17, name: 'extraAlarm3', label: 'Extra Alarm'},
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
  const renderStep5 = () => {
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
  // Step 5: Gps Alarms Check Point
  const renderStep6 = () => {
    const alarmItems = [
      {id: 1, name: 'ignition', label: 'ignition'},
      {id: 2, name: 'motionSense', label: 'motionSense'},
      {id: 3, name: 'chargeStatus', label: 'chargeStatus'},
      {id: 4, name: 'gpsSignal', label: 'gpsSignal'},
      {id: 5, name: 'satellite', label: 'satellite'},
      {id: 6, name: 'InputVolt', label: 'InputVolt'},
      {id: 7, name: 'trackerStatus', label: 'trackerStatus'},
      {id: 8, name: 'BatteryLevel', label: 'BatteryLevel'},
      {id: 9, name: 'Location', label: 'Location'},
    ];

    return (
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>Gps Check Points</Text>

        {/* Header row for the options */}
        <View style={styles.alarmHeaderRow}>
          <Text style={styles.alarmItemLabel}>Check Point</Text>
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
                updateNestedFormData('gpsAlarms', item.name, 'yes')
              }>
              <View
                style={[
                  styles.radioButton,
                  formData.gpsAlarms?.[item.name] === 'yes' &&
                    styles.radioButtonSelected,
                ]}
              />
            </TouchableOpacity>

            {/* No option */}
            <TouchableOpacity
              style={styles.radioContainer}
              onPress={() =>
                updateNestedFormData('gpsAlarms', item.name, 'no')
              }>
              <View
                style={[
                  styles.radioButton,
                  formData.gpsAlarms?.[item.name] === 'no' &&
                    styles.radioButtonSelected,
                ]}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.radioContainer}
              onPress={() =>
                updateNestedFormData('gpsAlarms', item.name, 'notRequired')
              }>
              <View
                style={[
                  styles.radioButton,
                  formData.gpsAlarms?.[item.name] === 'notRequired' &&
                    styles.radioButtonSelected,
                ]}
              />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    );
  };

  // Step 6: DCEM and Channel Details
  const renderStep7 = () => (
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
          placeholderTextColor="gray"
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
          placeholderTextColor="gray"
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

      <View style={styles.tableRow}>
        <View style={styles.tableCell}>
          <Text style={styles.tableCellText}>CH-1</Text>
        </View>
        <View style={[styles.tableCell, {flex: 2}]}>
          <SelectList
            setSelected={itemValue => {
              // Only update if itemValue exists in the actual values of data2
              const isValidValue = data2.some(item => item.value === itemValue);
              if (isValidValue) {
                updateNestedFormData('dcemDetail', 'ch1', itemValue);
              }
            }}
            search={false}
            placeholder="Select Channel"
            data={data2}
            defaultOption={
              formData.dcemDetail?.ch1
                ? data2.find(item => item.value === formData.dcemDetail.ch1)
                : undefined
            }
            boxStyles={{borderColor: '#333'}}
            inputStyles={{color: formData.dcemDetail?.ch1 ? 'black' : 'gray'}}
            dropdownTextStyles={{color: 'gray'}}
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
            placeholderTextColor="gray"
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={styles.tableRow}>
        <View style={styles.tableCell}>
          <Text style={styles.tableCellText}>CH-2</Text>
        </View>
        <View style={[styles.tableCell, {flex: 2}]}>
          <SelectList
            setSelected={itemValue => {
              // Only update if itemValue exists in the actual values of data2
              const isValidValue = data2.some(item => item.value === itemValue);
              if (isValidValue) {
                updateNestedFormData('dcemDetail', 'ch2', itemValue);
              }
            }}
            search={false}
            placeholder="Select Channel"
            data={data2}
            defaultOption={
              formData.dcemDetail?.ch2
                ? data2.find(item => item.value === formData.dcemDetail.ch2)
                : undefined
            }
            boxStyles={{borderColor: '#333'}}
            inputStyles={{color: formData.dcemDetail?.ch2 ? 'black' : 'gray'}}
            dropdownTextStyles={{color: 'gray'}}
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
            placeholderTextColor="gray"
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={styles.tableRow}>
        <View style={styles.tableCell}>
          <Text style={styles.tableCellText}>CH-3</Text>
        </View>
        <View style={[styles.tableCell, {flex: 2}]}>
          <SelectList
            setSelected={itemValue => {
              // Only update if itemValue exists in the actual values of data2
              const isValidValue = data2.some(item => item.value === itemValue);
              if (isValidValue) {
                updateNestedFormData('dcemDetail', 'ch3', itemValue);
              }
            }}
            search={false}
            data={data2}
            defaultOption={
              formData.dcemDetail?.ch3
                ? data2.find(item => item.value === formData.dcemDetail.ch3)
                : undefined
            }
            boxStyles={{borderColor: '#333'}}
            inputStyles={{color: formData.dcemDetail?.ch3 ? 'black' : 'gray'}}
            dropdownTextStyles={{color: 'gray'}}
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
            placeholderTextColor="gray"
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={styles.tableRow}>
        <View style={styles.tableCell}>
          <Text style={styles.tableCellText}>CH-4</Text>
        </View>
        <View style={[styles.tableCell, {flex: 2}]}>
          <SelectList
            setSelected={itemValue => {
              // Only update if itemValue exists in the actual values of data2
              const isValidValue = data2.some(item => item.value === itemValue);
              if (isValidValue) {
                updateNestedFormData('dcemDetail', 'ch4', itemValue);
              }
            }}
            placeholder="Select Channel"
            search={false}
            data={data2}
            defaultOption={
              formData.dcemDetail?.ch4
                ? data2.find(item => item.value === formData.dcemDetail?.ch4)
                : undefined
            }
            boxStyles={{borderColor: '#333'}}
            inputStyles={{color: formData.dcemDetail?.ch4 ? 'black' : 'gray'}}
            dropdownTextStyles={{color: 'gray'}}
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
            placeholderTextColor="gray"
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
            setSelected={itemValue => {
              // Only update if itemValue exists in the actual values of data2
              const isValidValue = data2.some(item => item.value === itemValue);
              if (isValidValue) {
                updateNestedFormData('dcemDetail', 'ch5', itemValue);
              }
            }}
            search={false}
            placeholder="Select Channel"
            data={data2}
            defaultOption={
              formData.dcemDetail?.ch5
                ? data2.find(item => item.value === formData.dcemDetail?.ch5)
                : undefined
            }
            boxStyles={{borderColor: '#333'}}
            inputStyles={{color: formData.dcemDetail?.ch5 ? 'black' : 'gray'}}
            dropdownTextStyles={{color: 'gray'}}
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
            placeholderTextColor="gray"
            keyboardType="numeric"
          />
        </View>
      </View>
    </View>
  );
  // Step 7: Escalation Details
  const renderStep8 = () => (
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
          placeholderTextColor="gray"
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
          placeholderTextColor="gray"
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
          placeholderTextColor="gray"
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
          placeholderTextColor="gray"
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
          placeholderTextColor="gray"
        />
      </View>
    </View>
  );

  // Step:8 Battery Details
  const renderStep9 = () => (
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
            placeholderTextColor="gray"
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
            placeholderTextColor="gray"
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
            placeholderTextColor="gray"
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
            placeholderTextColor="gray"
            autoFocus={true}
          />
        </View>
      )}
    </View>
  );

  // Visit Status & Material Use render function
  const renderStep10 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Material Use</Text>

      {/* Materials Used section */}
      <Text style={[styles.sectionTitle, {marginTop: 15}]}>Materials Used</Text>

      {/* Table header for materials */}
      <View style={styles.tableRow}>
        <View style={[styles.tableHeaderCell]}>
          <Text style={styles.tableHeaderText}>Material Name</Text>
        </View>
        <View style={[styles.tableHeaderCell]}>
          <Text style={styles.tableHeaderText}>ConsumptionStatus</Text>
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
            <View style={[styles.tableCell]}>
              <Text style={styles.tableCellText}>{material?.name?.name}</Text>
            </View>
            <View style={[styles.tableCell]}>
              <Text style={styles.tableCellText}>
                {material?.ConsumptionStatus}
              </Text>
            </View>
            <View style={styles.tableCell}>
              <Text style={styles.tableCellText}>{material?.quantity}</Text>
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
            key={selectResetKey}
            setSelected={value => updateNewMaterial('name', value)}
            data={data1}
            boxStyles={{borderColor: '#ccc'}}
            inputStyles={{color: newMaterial.name ? 'black' : 'gray'}}
            dropdownTextStyles={{color: 'gray'}}
            placeholder="Select Material"
            save="key"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.subLabel}>ConsumptionStatus</Text>
          <SelectList
            key={selectResetKey}
            setSelected={value => updateNewMaterial('ConsumptionStatus', value)}
            data={data4}
            boxStyles={{borderColor: '#ccc'}}
            inputStyles={{
              color: newMaterial.ConsumptionStatus ? 'black' : 'gray',
            }}
            dropdownTextStyles={{color: 'gray'}}
            placeholder="ConsumptionStatus"
            save="value"
          />
        </View>

        {newMaterial.ConsumptionStatus === 'Consumed' && (
          <>
            <View style={styles.column}>
              <Text style={styles.subLabel}>ConsumedQuantity</Text>
              <TextInput
                style={styles.input}
                value={newMaterial.quantity}
                onChangeText={text => updateNewMaterial('quantity', text)}
                placeholder="Quantity"
                keyboardType="numeric"
                placeholderTextColor="gray"
              />
            </View>
            <View style={styles.column}>
              <Text style={styles.subLabel}>DefectiveReturningToStore</Text>
              <SelectList
                key={selectResetKey}
                setSelected={value =>
                  updateNewMaterial('DefectiveReturningToStore', value)
                }
                data={data5}
                boxStyles={{borderColor: '#ccc'}}
                inputStyles={{
                  color: newMaterial.DefectiveReturningToStore
                    ? 'black'
                    : 'gray',
                }}
                dropdownTextStyles={{color: 'gray'}}
                placeholder="Select Option"
                defaultOption={{
                  key: 'Returning',
                  value: 'Returning',
                }}
                save="value"
              />
            </View>
            {newMaterial.DefectiveReturningToStore === 'Not Returning' && (
              <View style={styles.column}>
                <Text style={styles.subLabel}>ReasonForNotReturning</Text>
                <TextInput
                  style={styles.input}
                  value={newMaterial.ReasonForNotOk}
                  onChangeText={text =>
                    updateNewMaterial('ReasonForNotOk', text)
                  }
                  placeholder="Enter Reason"
                  placeholderTextColor="gray"
                />
              </View>
            )}
          </>
        )}

        <TouchableOpacity style={styles.addButton} onPress={addMaterial}>
          <Text style={styles.addButtonText}>Add Material</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStep11 = () => {
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
                placeholderTextColor="gray"
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
                placeholderTextColor="gray"
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
      case 10:
        return renderStep10();
      case 11:
        return renderStep11();
      default:
        return renderStep1();
    }
  };

  const renderStepIndicator = () => {
    const visibleSteps = Array.from(
      {length: totalSteps},
      (_, i) => i + 1,
    ).filter(step => !isStepSkipped(step));
    return (
      <View style={styles.stepIndicatorContainer}>
        {visibleSteps.map(step => (
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

  const isLastStep = currentStep === 11;

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
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Back width={24} height={24} rotation={90} fill={'white'} />
          </TouchableOpacity>
          <Text style={styles.headerText}>Wcc Form</Text>
        </View>
        <Toast></Toast>

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
    color: 'black',
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    color: 'black',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 10,
    fontSize: 14,
    color: 'black',
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
    color: 'black',
    borderBottomColor: '#f0f0f0',
  },
  alarmItemLabel: {
    flex: 3,
    fontWeight: 'bold',
    color: 'black',
    fontSize: 15,
  },
  alarmOptionLabel: {
    flex: 1,
    textAlign: 'center',
    fontWeight: 'bold',
    color: 'black',
    fontSize: 14,
  },
  alarmItemText: {
    flex: 3,
    fontSize: 15,
    color: 'black',
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
    color: 'black',
  },
  tableCell: {
    padding: 5,
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    color: 'black',
  },
  tableCellText: {
    textAlign: 'center',
    paddingVertical: 10,
    color: 'black',
  },
  tableInput: {
    height: 40,
    color: 'black',
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
    color: '#ccc',
    marginRight: 10,
    minWidth: 60,
    alignItems: 'center',
  },
  selectedOption: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
    color: '#333',
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
    color: 'black',
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
    fontWeight: '100',
    color: '#333',
  },
  signatureInput: {
    flex: 1,
    height: 40,
    paddingHorizontal: 10,
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
  },
  signatureImage: {
    width: '100%',
    height: '100%',
  },
  signaturePlaceholder: {
    color: '#999',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 4,
  },
});

export default EditWcc;
