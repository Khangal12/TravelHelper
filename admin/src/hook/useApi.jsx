import axios from "axios";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { message } from "antd"; // ✅ Use Ant Design for notifications

function useApi() {
  const navigate = useNavigate();

  // Create Axios instance
  const instance = axios.create({
    baseURL: process.env.REACT_APP_SERVER_URL,
    // Do not set "Content-Type" for FormData, let Axios set it automatically
    headers: {
      "Content-Type": "application/json", // This will be replaced by the FormData headers when needed
    },
  });

  // Interceptor for handling 401 errors (session expired)
  instance.interceptors.response.use(
    (response) => response.data, // Simply return response if no errors
    (error) => {
      if (error.response && error.response.status === 403) {
        localStorage.removeItem("token"); // Clear token if 401 error (unauthorized)
        navigate("/login"); // Redirect to login page
        message.error("Session expired. Please log in again."); // Show error message
      }
      return Promise.reject(error);
    }
  );

  // Interceptor to set Authorization header for every request
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
      // If the request is sending FormData, don't set "Content-Type"
      if (config.data instanceof FormData) {
        delete config.headers["Content-Type"]; // Let FormData set the proper Content-Type
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  return {
    instance,

    user: {
      login: (data) => instance.post(`/api/admin/login/`, data),
    },
    place: {
      get: () => instance.get(`/api/admin/place/`),
      post: (cdata) => instance.post(`/api/admin/place/`, cdata),
    },
    camp: {
      get: () => instance.get(`/api/admin/camps/`),
      post: (cdata) => instance.post(`/api/admin/camps/`, cdata),
      getDetail: (id) => instance.get(`/api/admin/camps/${id}/`),
      getByPlaces: (id) => instance.get(`/api/admin/camps/byplace/${id}/`),
    },
  };
}

export default useApi;
