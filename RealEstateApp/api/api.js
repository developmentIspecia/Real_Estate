import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// 🌍 Global IP (change here only if needed)
export const GLOBAL_IP = "192.168.1.33";
export const API_BASE = `http://${GLOBAL_IP}:5000/api`;

// Axios instance
export const api = axios.create({ baseURL: API_BASE });

// Interceptor to handle 401/403 (Unauthorized/Forbidden) errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.log("[API] Session expired or unauthorized. Clearing tokens.");
      await AsyncStorage.multiRemove(["userToken", "userRole"]);
      setAuthToken(null);
    }
    return Promise.reject(error);
  }
);

// Attach/remove auth token globally
export const setAuthToken = (token) => {
  if (token) api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  else delete api.defaults.headers.common["Authorization"];
};

// ------------------ Auth APIs ------------------
export const loginUser = async (data) => {
  const res = await api.post("/auth/login", {
    email: data.email.trim().toLowerCase(),
    password: data.password.trim(),
  });
  return res.data;
};

export const signup = async (data) => {
  const res = await api.post("/auth/signup", {
    name: data.name.trim(),
    middleName: data.middleName ? data.middleName.trim() : "",
    lastName: data.lastName ? data.lastName.trim() : "",
    email: data.email.trim().toLowerCase(),
    password: data.password.trim(),
    phone: data.phone ? data.phone.trim() : "",
  });
  return res.data;
};

export const verifyOtp = async (data) => {
  const res = await api.post("/auth/verify-otp", {
    email: data.email.toLowerCase(),
    otp: data.otp.trim(),
  });
  return res.data;
};

export const resendOtp = async (email) => {
  const res = await api.post("/auth/resend-otp", { email: email.toLowerCase() });
  return res.data;
};

export const forgotPassword = async (email) => {
  const res = await api.post("/auth/forgot-password", { email: email.toLowerCase() });
  return res.data;
};

export const resetPassword = async (data) => {
  const res = await api.post("/auth/reset-password", {
    email: data.email.toLowerCase(),
    otp: data.otp,
    newPassword: data.newPassword,
  });
  return res.data;
};

// ------------------ User APIs ------------------
export const fetchProfile = async (token) => {
  const res = await api.get("/user/profile", { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
};

export const updateProfile = async (token, formData) => {
  setAuthToken(token);
  const res = await api.post("/user/profile-update", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// ------------------ Admin APIs ------------------
export const fetchAllUsers = async (token) => {
  const res = await api.get("/admin/users", { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
};

// ------------------ Property APIs ------------------
// Upload property with image
export const uploadProperty = async (formData) => {
  const res = await api.post("/upload-property", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// Get all properties
export const getAllProperties = async () => {
  const res = await api.get("/properties");
  return res.data;
};

// Get properties by category (Houses, Flats, Lands, Others)
export const getPropertiesByCategory = async (category) => {
  const res = await api.get(`/properties/category/${category}`);
  return res.data;
};

// ------------------ Chat APIs ------------------

// Get all messages (admin view)
export const fetchAllMessages = async () => {
  const res = await api.get("/chat");
  return res.data;
};

// Get messages of specific conversation
export const fetchUserMessages = async (partnerId) => {
  const res = await api.get(`/chat/conversation/${partnerId}`);
  return res.data;
};

// Send a message
export const sendMessage = async ({ message, receiverId }) => {
  const res = await api.post("/chat", { message, receiverId });
  return res.data;
};

// Delete a message
export const deleteMessage = async (msgId) => {
  const res = await api.delete(`/chat/${msgId}`);
  return res.data;
};

// Update a property
export const updateProperty = async (id, data) => {
  const res = await api.put(`/properties/${id}`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// Delete a property
export const deleteProperty = async (id) => {
  const res = await api.delete(`/properties/${id}`);
  return res.data;
};

// Mark messages as read
export const markMessagesAsRead = async (partnerId) => {
  if (!partnerId) return { message: "No partnerId provided" };
  const res = await api.put(`/chat/read/${partnerId}`);
  return res.data;
};


