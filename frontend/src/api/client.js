import axios from "axios";

const apiClient = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // required so the refreshToken cookie is sent with requests
});

export default apiClient;