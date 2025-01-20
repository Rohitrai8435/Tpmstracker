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
    return response.data;
  } catch (error) {
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
export const getSiteDetailV2 = async imei => {
  try {
    const response = await ApiService.post('new_getimei_nu', {imei});
    return response?.data;
  } catch (error) {
    throw error;
  }
};
export const hooter_on_off = async (imei, hooter_onoff) => {
  try {
    const response = await ApiService.post('hooter_on_off', {
      imei,
      hooter_onoff,
    });
    return response?.data;
  } catch (error) {
    throw error;
  }
};
export const insert_Hooter_log = async (imei, aid, login_id, status) => {
  try {
    const response = await ApiService.post('insert_Hooter_log', {
      imei,
      aid,
      login_id,
      status,
    });
    return response?.data;
  } catch (error) {
    throw error;
  }
};

export const getSiteDetailv1 = async imei => {
  try {
    const response = await ApiService.post('new_getimei_nuV1', {imei});
    return response?.data;
  } catch (error) {
    throw error;
  }
};
export const getAlarmV1 = async imei => {
  try {
    const response = await ApiService.post('new_alarm_V1', {imei});
    return response?.data;
  } catch (error) {
    throw error;
  }
};
export const getLogReport = async (
  imei,
  aid,
  ctm_id,
  s_date,
  e_date,
  usertype,
  client_version,
) => {
  try {
    const response = await ApiService.post('getAlarmLogByImei', {
      imei,
      aid,
      ctm_id,
      s_date,
      e_date,
      usertype,
      client_version,
    });
    return response?.data;
  } catch (error) {
    throw error;
  }
};

export const getSiteRunningSource = async (
  aidv4,
  ctm_idv4,
  usertypev4,
  state_id,
  dist_id,
  cluster_id,
  aidv2,
  ctm_idv2,
  usertypev2,
) => {
  try {
    const response = await ApiService.post('new_siteRunningSource', {
      aidv4,
      ctm_idv4,
      usertypev4,
      state_id,
      dist_id,
      cluster_id,
      aidv2,
      ctm_idv2,
      usertypev2,
    });
    return response?.data;
  } catch (error) {
    throw error;
  }
};
export const siteRunning = async (
  aidv4,
  ctm_idv4,
  usertypev4,
  state_id,
  dist_id,
  cluster_id,
  aidv2,
  ctm_idv2,
  usertypev2,
) => {
  try {
    const response = await ApiService.post('new_siteRunning', {
      aidv4,
      ctm_idv4,
      usertypev4,
      state_id,
      dist_id,
      cluster_id,
      aidv2,
      ctm_idv2,
      usertypev2,
    });
    return response?.data;
  } catch (error) {
    throw error;
  }
};
export const getcurrentAlarmByImei = async imei => {
  try {
    const response = await ApiService.post('new_getcurrentAlarmByImeiV4', {
      imei,
    });
    return response?.data;
  } catch (error) {
    throw error;
  }
};
export const getcurrentAlarmByImeiv2 = async imei => {
  try {
    const response = await ApiService.post('new_getcurrentAlarmByImei', {imei});
    return response?.data;
  } catch (error) {
    throw error;
  }
};
export const notification = async (
  aidv1,
  aidv2,
  aidv4,
  userv1,
  userv2,
  userv4,
  value,
) => {
  try {
    const response = await ApiService.post('noncom2hour', {
      aidv1,
      aidv2,
      aidv4,
      userv1,
      userv2,
      userv4,
      value,
    });
    return response?.data;
  } catch (error) {
    throw error;
  }
};

export const dcem_analytics = async imei => {
  try {
    const response = await ApiService.post('dcem_analytics', {imei});
    return response?.data;
  } catch (error) {
    throw error;
  }
};
export const dg_on_off = async (imei, value) => {
  try {
    const response = await ApiService.post('dg_on_off', {imei, value});
    return response?.data;
  } catch (error) {
    throw error;
  }
};
export const auto_manul = async (imei, value) => {
  try {
    const response = await ApiService.post('auto_manul', {imei, value});
    return response?.data;
  } catch (error) {
    throw error;
  }
};
export const auto_manual_show = async imei => {
  try {
    const response = await ApiService.post('auto_manual_show', {imei});
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
