import axios from 'axios';

const BASE_URL_RACING_API = 'https://api.theracingapi.com';
const BASE_URL_LSORTS = 'https://api.lsports.eu';

// Replace with your actual API keys
const RACING_API_KEY = 'YOUR_RACING_API_KEY';
const LSORTS_API_KEY = 'YOUR_LSORTS_API_KEY';

export const fetchRacingData = async (endpoint: string, params: object = {}) => {
  try {
    const response = await axios.get(`${BASE_URL_RACING_API}/${endpoint}`, {
      params: { ...params, api_key: RACING_API_KEY },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching data from The Racing API:', error);
    throw error;
  }
};

export const fetchLSportsData = async (endpoint: string, params: object = {}) => {
  try {
    const response = await axios.get(`${BASE_URL_LSORTS}/${endpoint}`, {
      params: { ...params, api_key: LSORTS_API_KEY },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching data from LSports:', error);
    throw error;
  }
};