import axios from "axios";

const BASE = import.meta.env.VITE_API_RISK || "http://localhost:5002/risk-analysis";

export const updateAndGetRiskData = async () => {
  const res = await axios.get(`${BASE}/update-data-and-risk`);
  return res.data?.updated_data || [];
};

export const getRecord = async (studentId) => {
  const res = await axios.get(`${BASE}/get-record/${encodeURIComponent(studentId)}`);
  return res.data || {};
};
