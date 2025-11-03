import axios from "axios";

const BASE = import.meta.env.VITE_API_USERS || "http://localhost:3000";

export const getStudents = async () => {
  // ajusta la ruta si en tu API de Users es distinta (ej: /users or /students)
  const res = await axios.get(`${BASE}/students`);
  return res.data || [];
};
