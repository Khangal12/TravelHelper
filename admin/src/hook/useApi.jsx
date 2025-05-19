import axios from "axios";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { message } from "antd"; // ✅ Use Ant Design for notifications

function useApi() {
  const navigate = useNavigate();

  const adminInstance = axios.create({
    baseURL: process.env.REACT_APP_API_URL + '/api/admin',
    headers: {
      "Content-Type": "application/json",
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

  const bookingInstance = axios.create({
    baseURL: process.env.REACT_APP_API_URL + '/api/booking',  // Update the base URL to Nginx API gateway path
    headers: {
      "Content-Type": "application/json", // This will be replaced by the FormData headers when needed
    },
  });

  const responseInterceptor = (error) => {
    if (error.response) {
      if (error.response.status === 403) {
        localStorage.removeItem("token");
        navigate("/login");
        message.error("Session expired. Please log in again.");
      }
      else if (error.response.status === 400) {
        message.error(error.response.data?.error || 'Bad Request');
      }
      else if (error.response.status === 401) {
        message.error(error.response.data?.error || 'Invalid credintials');
      }
      else {
        message.error(`Error: ${error.response.status} - ${error.response.data?.message || 'An error occurred'}`);
      }
    } else {
      message.error("Network error: Please check your connection.");
    }
    return Promise.reject(error);
  };
  

  adminInstance.interceptors.response.use((res) => res.data, responseInterceptor);
  tripInstance.interceptors.response.use((res) => res.data, responseInterceptor);
  userInstance.interceptors.response.use((res) => res.data, responseInterceptor);
  bookingInstance.interceptors.response.use((res) => res.data, responseInterceptor);

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
  bookingInstance.interceptors.request.use(requestInterceptor);

  return {
    user: {
      instance: userInstance,
      user: {
        login: (data) => userInstance.post(`/login-admin/`, data),
        signup:(data) => userInstance.post(`/sign-up/`,data),
        forgotPassword:(data) => userInstance.post(`/forgot-password/`,data),
        list: () => userInstance.get(`/list/`),

      },
      permission: {
        get: () => userInstance.get(`/auth/permission/`),
        update: (id,permiossion) => userInstance.post(`/auth/update/${id}/`,permiossion),
      }
    },
    admin: {
      instance: adminInstance,
      place: {
        get: (query = '') => adminInstance.get(`/place/all/?search=${query}`),  // Updated to just the endpoint, base URL has `/api/admin`
        getPlaces: (id) => adminInstance.get(`/place/${id}/`),  // Same here
        post: (cdata) => adminInstance.post(`/place/all/`, cdata),
        delete: (id) => adminInstance.delete(`/place/${id}/`),
      },
      camp: {
        get: (query = '') => adminInstance.get(`/camps/?search=${query}`),
        post: (cdata) => adminInstance.post(`/camps/`, cdata),
        getDetail: (id) => adminInstance.get(`/camps/${id}/`),
        getByPlaces: (id) => adminInstance.get(`/camps/byplace/${id}/`),
        delete:(id) => adminInstance.delete(`/camps/${id}/`),
      },
    },
    trip: {
      instance: tripInstance,
      place: {
        getPlaces: (id) => tripInstance.get(`/place/${id}/`)
      },
      trip:{
        createTrip: (data) => tripInstance.post(`/trip/create/` , data),
        get: (page, search) => tripInstance.get(`/trip/?page=${page}&search=${search}`),
        getDetail: (id) => tripInstance.get(`/detail/${id}/`),
        pdf: (data) => tripInstance.post(`/pdf/`,data),
      },
      chat:{
        chat: (data) => tripInstance.post(`/chat/`,data),
      }
    },
    booking:{
      instance: bookingInstance,
      book:{
        get: (page , query = '', range_date, status ) => bookingInstance.get(`/all/?page=${page}&search=${query}&range_date=${range_date}&status=${status}`),
        createBooking: (data) => bookingInstance.post(`/`,data),
        cancelBooking: (id) => bookingInstance.delete(`/cancel/${id}/`),
        approveBooking: (id) => bookingInstance.post(`/approve/${id}/`),
        count: (id) => bookingInstance.get(`/count/${id}/`),
        detail: (id) => bookingInstance.get(`/detail/${id}/`),
      }
    }
  };
}

export default useApi;
