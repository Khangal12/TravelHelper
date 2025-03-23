import axios from "axios";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { message } from "antd"; // ✅ Use Ant Design for notifications

function useApi() {
  const navigate = useNavigate();

  // Create Axios instance
  const adminInstance = axios.create({
    baseURL: process.env.REACT_APP_API_URL + '/api/admin',  // Update the base URL to Nginx API gateway path
    headers: {
      "Content-Type": "application/json", // This will be replaced by the FormData headers when needed
    },
  });

  const tripInstance = axios.create({
    baseURL: process.env.REACT_APP_API_URL + '/api/trip',  // Update the base URL to Nginx API gateway path
    headers: {
      "Content-Type": "application/json", // This will be replaced by the FormData headers when needed
    },
  });

  const userInstance = axios.create({
    baseURL: process.env.REACT_APP_API_URL + '/api/users',  // Update the base URL to Nginx API gateway path
    headers: {
      "Content-Type": "application/json", // This will be replaced by the FormData headers when needed
    },
  });

  const responseInterceptor = (error) => {
    if (error.response?.status === 403) {
      localStorage.removeItem("token");
      navigate("/login");
      message.error("Session expired. Please log in again.");
    }
    return Promise.reject(error);
  };

  adminInstance.interceptors.response.use((res) => res.data, responseInterceptor);
  tripInstance.interceptors.response.use((res) => res.data, responseInterceptor);
  userInstance.interceptors.response.use((res) => res.data, responseInterceptor);

  // Interceptor to set Authorization header for every request
  const requestInterceptor = (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }
    return config;
  };

  adminInstance.interceptors.request.use(requestInterceptor);
  tripInstance.interceptors.request.use(requestInterceptor);
  userInstance.interceptors.request.use(requestInterceptor);

  return {
    user: {
      instance: userInstance,
      user: {
        login: (data) => userInstance.post(`/login-admin/`, data),  // Remove `/api/users` because it's part of the base URL
      },
    },
    admin: {
      instance: adminInstance,
      place: {
        get: () => adminInstance.get(`/place/all/`),  // Updated to just the endpoint, base URL has `/api/admin`
        getPlaces: (id) => adminInstance.get(`/place/${id}/`),  // Same here
        post: (cdata) => adminInstance.post(`/place/`, cdata),  // Same here
      },
      camp: {
        get: () => adminInstance.get(`/camps/`),
        post: (cdata) => adminInstance.post(`/camps/`, cdata),
        getDetail: (id) => adminInstance.get(`/camps/${id}/`),
        getByPlaces: (id) => adminInstance.get(`/camps/byplace/${id}/`),
      },
    },
    trip: {
      instance: tripInstance,
      place: {
        getPlaces: (id) => tripInstance.get(`/place/${id}/`)
      },
      trip:{
        createTrip: (data) => tripInstance.post(`/trip/create/` , data)
      }
    },
  };
}

export default useApi;
