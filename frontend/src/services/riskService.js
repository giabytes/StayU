import axios from "axios";

const BASE = import.meta.env.VITE_API_RISK || "/api/risk";

export const updateAndGetRiskData = async () => {
  const res = await axios.get(`${BASE}/update-data-and-risk`);
  return res.data?.updated_data || [];
};

export const getRecord = async (studentId) => {
  const res = await axios.get(`${BASE}/get-record/${encodeURIComponent(studentId)}`);
  return res.data || {};
};
