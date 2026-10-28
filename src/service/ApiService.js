import axios from 'axios';

const ApiService = axios.create({
  baseURL: 'https://dashboard.shrotitele.com/apitpms/tpiamsApi/',
  headers: {
    'Content-Type': 'application/json',
  },
});
const LocalApi = axios.create({
  baseURL: 'https://dashboard.shrotitele.com/apitpms/TpmsTracker/',
  headers: {
    'Content-Type': 'application/json',
  },
});
// Helper function to add abort signal support

export const getData = async tech_id => {
  try {
    const response = await LocalApi.post('detail_tpms', {tech_id});
    return response?.data;
  } catch (error) {
    throw error;
  }
};
export const get_wcc_data = async unique_id => {
  try {
    const response = await LocalApi.post('get_wcc_data', {unique_id});
    return response?.data;
  } catch (error) {
    throw error;
  }
};
export const updatephotos = async (
  updatedphoto,
  updatedwcc,
  newphotoBefore,
  newphotoAfter,
  visitRemark,
  AfterRemark,
  ActualRemark,
  unique_id,
  service_type,
) => {
  try {
    // console.log(updatedwcc);
    const response = await LocalApi.post('updates_photos', {
      // Ensure this matches backend route
      updatedphoto,
      updatedwcc,
      newphotoBefore,
      newphotoAfter,
      visitRemark,
      AfterRemark,
      ActualRemark,
      unique_id,
      service_type,
    });
    return response.data;
  } catch (error) {
    console.log('API Error:', error);
    throw error;
  }
};
export const insert_wcc_data = async wccData => {
  try {
    const response = await LocalApi.post('insert_wcc', {
      wccData,
    });
    // console.log(response.data);
    return response.data;
  } catch (error) {
    console.log('API Error:', error);
    throw error;
  }
};
export const serachCmtracker = async globel_id => {
  try {
    const response = await LocalApi.post('Cm_tracker', {
      globel_id,
    });
    // console.log(response.data);
    return response.data;
  } catch (error) {
    console.log('API Error:', error);
    throw error;
  }
};

export const getDataSoc = async tech_id => {
  try {
    const response = await LocalApi.post('detail_tpms_soc', {tech_id});
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const get_gps_current_status = async gps_imei => {
  try {
    const response = await LocalApi.post('get_gps_current_status', {gps_imei});
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const get_tpms_current_status = async tpms_imei => {
  try {
    const response = await LocalApi.post('get_tpms_current_status', {tpms_imei});
    return response.data;
  } catch (error) {
    throw error;
  }
};
const createRequestConfig = signal => (signal ? {signal} : {});

export const getImei = async signal => {
  try {
    const response = await LocalApi.post(
      'imei_list', // API endpoint
      {}, // Empty payload
      createRequestConfig(signal), // Correct configuration placement
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const get_all_sites_product = async (
  signal,
  product_id,
  service_type,
  profile,
  search = '',
  limit = 50,
) => {
  try {
    const response = await LocalApi.post(
      'get_all_sites_product',
      {product_id,service_type,profile,search,limit},
      createRequestConfig(signal),
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const get_all_product = async (signal) => {
  try {
    const response = await LocalApi.post(
      'get_all_product',
      {},
      createRequestConfig(signal),
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const get_qc_master = async (signal, assignCircle, designation) => {
  try {
    const response = await LocalApi.post(
      'get_qc_master',
      {assignCircle, designation},
      createRequestConfig(signal),
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const getImeiAll = async signal => {
  try {
    const response = await LocalApi.post(
      'imei_list_all', // API endpoint
      {}, // Empty payload
      createRequestConfig(signal), // Correct configuration placement
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const getmaterailName = async signal => {
  try {
    const response = await LocalApi.post(
      'get_matrail_list', // API endpoint
      {}, // Empty payload
      createRequestConfig(signal), // Correct configuration placement
    );

    return response.data;
  } catch (error) {
    throw error;
  }
};
export const getmaterailUnit = async signal => {
  try {
    const response = await LocalApi.post(
      'get_matrail_unit_list', // API endpoint
      {}, // Empty payload
      createRequestConfig(signal), // Correct configuration placement
    );

    return response.data;
  } catch (error) {
    throw error;
  }
};
export const closeRequest = async (id, soc_id, imei) => {
  try {
    const response = await LocalApi.post('close_request', {id, soc_id, imei});
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getDetailOfCard = async (unique_id, imei, signal) => {
  try {
    const response = await LocalApi.post(
      'detail_ofcard',
      {unique_id, imei}, // Payload
      createRequestConfig(signal), // Signal in config
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getLogin = async (id, password) => {
  try {
    const response = await LocalApi.post('login', {id, password});
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const submit_qc_complaint = async payload => {
  try {
    const response = await LocalApi.post('submit_qc_complaint', {payload});
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const get_complaints = async (user_id, designation) => {
  try {
    const response = await LocalApi.post('get_complaints', {
      user_id,
      designation,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const cancel_complaint = async payload => {
  try {
    const response = await LocalApi.post('cancel_complaint', {payload});
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const update_complaint = async payload => {
  try {
    const response = await LocalApi.post('update_complaint', payload); // ✅ FIX
    return response.data;
  } catch (error) {
    throw error;
  }
};
// export const login = async (login_id, password) => {
//   try {
//     const response = await ApiService.post('loginTwo', { login_id, password });
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };
export const pendingRemarkApi = async (unique_id, remark_soc, soc_id) => {
  try {
    const response = await LocalApi.post('pending_remark', {
      unique_id,
      remark_soc,
      soc_id,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getSiteDetail = async imei => {
  try {
    const response = await ApiService.post('new_getimei_nuV4', {imei});
    return response?.data;
  } catch (error) {
    throw error;
  }
};
export const get_complaint_categories = async () => {
  try {
    const response = await LocalApi.post('getComplaintCategories');
    return response?.data;
  } catch (error) {
    throw error;
  }
};







export const imei_list = async () => {
  try {
    const response = await ApiService.post('imei_list');
    return response?.data;
  } catch (error) {
    throw error;
  }
};

export default ApiService;
