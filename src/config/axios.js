import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
});


API.interceptors.request.use(
  (config) => {
    
    if (config.withAuth !== false) {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    // Handle custom content types if provided, else default to application/json
    if (config.contentType) {
      config.headers["Content-Type"] = config.contentType;
    } else {
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
API.interceptors.response.use(
  (response) => {
    // Log the status so it can be seen in the console
    console.log(`[API] ${response.config.method?.toUpperCase()} ${response.config.url} - Status: ${response.status}`);
    
    // Attach status to the data object so it can be accessed in the calling code without breaking existing `.data` expectations
    if (response.data && typeof response.data === "object") {
      response.data.status = response.status;
    }
    
    return response.data; // Return data to simplify calls
  },
  (error) => {
    if (error.response) {
      console.log(`[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url} - Status: ${error.response.status}`);
      if (error.response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        // Optional: redirect to login
        // window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Generic API call helper
 * @param {string} url - Endpoint URL
 * @param {string} method - HTTP method (GET, POST, etc.)
 * @param {object} data - Payload for POST/PUT
 * @param {object} options - Custom config (withAuth, contentType, etc.)
 */
export const apiCall = async (url, method = "GET", data = null, options = {}) => {
  return API({
    url,
    method,
    data,
    ...options,
  });
};

export default API;
