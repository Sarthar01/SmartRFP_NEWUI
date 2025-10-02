import axios from "axios";
import type { AxiosResponse, AxiosError } from "axios";

// Configuration
// Ensure: VITE_API_URL=http://localhost/api
const BASE_URL = `${import.meta.env.VITE_API_URL?.replace(/\/$/, "") || ""}/v1`;
const REQUEST_TIMEOUT = 30000; // 30 seconds

// Create axios instance with common configuration
const API = axios.create({
  baseURL: BASE_URL, // -> http://localhost/api/v1
  timeout: REQUEST_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

// Types
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ProposalPayload {
  title: string;
  description?: string;
  type: string;
  priority: string;
  estimatedTime?: string;
}

export interface RFPProjectPayload {
  title: string;
  description?: string;
  file?: File;
  budget?: number;
  budgetCurrency?: string;
  startDate?: string;
  endDate?: string;
  priority?: string;
  department?: string;
}

export interface TemplatePayload {
  name: string;
  content: string;
  type: string;
}

export interface KnowledgePayload {
  title: string;
  content: string;
  category: string;
}

export interface UserPayload {
  email: string;
  password: string;
  name?: string;
}

// Error handler
const handleApiError = (error: AxiosError): never => {
  if (error.response) {
    const message =
      (error.response.data as { message?: string })?.message ||
      `HTTP ${error.response.status}: ${error.response.statusText}`;
    throw new Error(message);
  } else if (error.request) {
    throw new Error("Network error: Unable to connect to server");
  } else {
    throw new Error(error.message || "An unexpected error occurred");
  }
};

// Generic API methods
const get = async <T>(url: string): Promise<T | undefined> => {
  try {
    const response: AxiosResponse<T> = await API.get(url);
    return response.data;
  } catch (error) {
    handleApiError(error as AxiosError);
  }
};

const post = async <T>(url: string, payload: any): Promise<T | undefined> => {
  try {
    const response: AxiosResponse<T> = await API.post(url, payload);
    return response.data;
  } catch (error) {
    handleApiError(error as AxiosError);
  }
};

const put = async <T>(url: string, payload: any): Promise<T | undefined> => {
  try {
    const response: AxiosResponse<T> = await API.put(url, payload);
    return response.data;
  } catch (error) {
    handleApiError(error as AxiosError);
  }
};

const del = async <T>(url: string): Promise<T | undefined> => {
  try {
    const response: AxiosResponse<T> = await API.delete(url);
    return response.data;
  } catch (error) {
    handleApiError(error as AxiosError);
  }
};

// Proposal APIs (unchanged)
export const proposalApi = {
  create: (payload: ProposalPayload) => post("/proposal", payload),
  getAll: () => get("/proposal"),
  getById: (id: string) => get(`/proposal/${id}`),
  update: (id: string, payload: Partial<ProposalPayload>) => put(`/proposal/${id}`, payload),
  delete: (id: string) => del(`/proposal/${id}`),
};

// RFP Project APIs -> paths are relative to /api/v1
export const rfpProjectApi = {
  create: async (payload: RFPProjectPayload) => {
    const formData = new FormData();

    // Append text fields
    Object.entries(payload).forEach(([key, value]) => {
      if (key !== "file" && value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });

    // Append file if present
    if (payload.file) {
      formData.append("file", payload.file);
    }

    try {
      const response = await API.post("/rfp-projects", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      handleApiError(error as AxiosError);
      throw error;
    }
  },
  getAll: () => get("/rfp-projects"),
  getById: (id: string | number) => get(`/rfp-projects/${id}`),
  update: (id: string | number, payload: Partial<RFPProjectPayload>) => put(`/rfp-projects/${id}`, payload),
  delete: (id: string | number) => del(`/rfp-projects/${id}`),

  // Optional helpers if used by UI
  process: (id: string | number) => post(`/rfp-projects/${id}/process`, {}),
  processingStatus: (id: string | number) => get(`/rfp-projects/${id}/processing-status`),
  cancelProcessing: (id: string | number) => post(`/rfp-projects/${id}/cancel-processing`, {}),
  retryProcessing: (id: string | number) => post(`/rfp-projects/${id}/retry-processing`, {}),
  downloadUrl: (id: string | number) => get(`/rfp-projects/${id}/download`),
  queueOverview: () => get(`/rfp-projects/queue/overview`),
};

// Template APIs (unchanged)
export const templateApi = {
  create: (payload: TemplatePayload) => post("/template", payload),
  getAll: () => get("/template"),
  getById: (id: string) => get(`/template/${id}`),
  update: (id: string, payload: Partial<TemplatePayload>) => put(`/template/${id}`, payload),
  delete: (id: string) => del(`/template/${id}`),
};

// Knowledge Base APIs (unchanged)
export const knowledgeApi = {
  create: (payload: KnowledgePayload) => post("/knowledge", payload),
  getAll: () => get("/knowledge"),
  getById: (id: string) => get(`/knowledge/${id}`),
  update: (id: string, payload: Partial<KnowledgePayload>) => put(`/knowledge/${id}`, payload),
  delete: (id: string) => del(`/knowledge/${id}`),
};

// User APIs (unchanged)
export const userApi = {
  register: (payload: UserPayload & { name: string }) => post("/users/register", payload),
  login: (payload: Pick<UserPayload, "email" | "password">) => post("/users/login", payload),
  getProfile: () => get("/users/profile"),
};

// Token management
export const tokenManager = {
  get: () => localStorage.getItem("token"),
  set: (token: string) => localStorage.setItem("token", token),
  remove: () => localStorage.removeItem("token"),
  isValid: (token?: string) => {
    const currentToken = token || tokenManager.get();
    if (!currentToken) return false;

    try {
      const payload = JSON.parse(atob(currentToken.split(".")[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  },
};

// Request interceptor for auth
API.interceptors.request.use(
  (config) => {
    const token = tokenManager.get();
    if (token && tokenManager.isValid(token)) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
API.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      tokenManager.remove();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default API;


// // src/services/api.ts
// import axios from "axios";
// import type { AxiosResponse, AxiosError } from "axios";

// // Configuration


// // Create axios instance with common configuration
// const API = axios.create({
//  baseURL: `${import.meta.env.VITE_API_URL?.replace(/\/$/, "") || ""}/v1`,
//     headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
// });

// // Types
// export interface ApiResponse<T = any> {
//   data: T;
//   message?: string;
//   success: boolean;
// }

// export interface ProposalPayload {
//   title: string;
//   description?: string;
//   type: string;
//   priority: string;
//   estimatedTime?: string;
// }

// export interface RFPProjectPayload {
//   title: string;
//   description?: string;
//   file?: File;
//   budget?: number;
//   budgetCurrency?: string;
//   startDate?: string;
//   endDate?: string;
//   priority?: string;
//   department?: string;
// }

// export interface TemplatePayload {
//   name: string;
//   content: string;
//   type: string;
// }

// export interface KnowledgePayload {
//   title: string;
//   content: string;
//   category: string;
// }

// export interface UserPayload {
//   email: string;
//   password: string;
//   name?: string;
// }

// // Error handler
// const handleApiError = (error: AxiosError): never => {
//   if (error.response) {
//     // Server responded with error status
//     const message = (error.response.data as { message?: string })?.message || `HTTP ${error.response.status}: ${error.response.statusText}`;
//     throw new Error(message);
//   } else if (error.request) {
//     // Request made but no response received
//     throw new Error("Network error: Unable to connect to server");
//   } else {
//     // Something else happened
//     throw new Error(error.message || "An unexpected error occurred");
//   }
// };

// // Generic API methods
// const get = async <T>(url: string): Promise<T | undefined> => {
//   try {
//     const response: AxiosResponse<T> = await API.get(url);
//     return response.data;
//   } catch (error) {
//     handleApiError(error as AxiosError);
//   }
// };

// const post = async <T>(url: string, payload: any): Promise<T | undefined> => {
//   try {
//     const response: AxiosResponse<T> = await API.post(url, payload);
//     return response.data;
//   } catch (error) {
//     handleApiError(error as AxiosError);
//   }
// };

// const put = async <T>(url: string, payload: any): Promise<T | undefined> => {
//   try {
//     const response: AxiosResponse<T> = await API.put(url, payload);
//     return response.data;
//   } catch (error) {
//     handleApiError(error as AxiosError);
//   }
// };

// const del = async <T>(url: string): Promise<T | undefined> => {
//   try {
//     const response: AxiosResponse<T> = await API.delete(url);
//     return response.data;
//   } catch (error) {
//     handleApiError(error as AxiosError);
//   }
// };

// // Proposal APIs
// export const proposalApi = {
//   create: (payload: ProposalPayload) => post("/proposal", payload),
//   getAll: () => get("/proposal"),
//   getById: (id: string) => get(`/proposal/${id}`),
//   update: (id: string, payload: Partial<ProposalPayload>) => put(`/proposal/${id}`, payload),
//   delete: (id: string) => del(`/proposal/${id}`),
// };

// // RFP Project APIs
// export const rfpProjectApi = {
//   create: async (payload: RFPProjectPayload) => {
//     const formData = new FormData();
    
//     // Append text fields
//     Object.entries(payload).forEach(([key, value]) => {
//       if (key !== 'file' && value !== undefined && value !== null) {
//         // Handle nested objects like projectMetadata
//         if (typeof value === 'object' && value !== null && !(value instanceof File)) {
//           Object.entries(value).forEach(([nestedKey, nestedValue]) => {
//             if (nestedValue !== undefined && nestedValue !== null) {
//               formData.append(`${key}.${nestedKey}`, String(nestedValue));
//             }
//           });
//         } else {
//           formData.append(key, String(value));
//         }
//       }
//     });
    
//     // Append file if present
//     if (payload.file) {
//       formData.append('file', payload.file);
//     }
    
//     try {
//       const response = await API.post("/rfp-projects", formData, {
//         headers: {
//           "Content-Type": "multipart/form-data",
//         },
//       });
//       return response.data;
//     } catch (error) {
//       handleApiError(error as AxiosError);
//       throw error; // Re-throw to allow proper error handling in components
//     }
//   },
//   getAll: () => get("/rfp-projects"),
//   getById: (id: string) => get(`/rfp-projects/${id}`),
//   update: (id: string, payload: Partial<RFPProjectPayload>) => put(`/rfp-projects/${id}`, payload),
//   delete: (id: string) => del(`/rfp-projects/${id}`),
// };

// // Template APIs
// export const templateApi = {
//   create: (payload: TemplatePayload) => post("/template", payload),
//   getAll: () => get("/template"),
//   getById: (id: string) => get(`/template/${id}`),
//   update: (id: string, payload: Partial<TemplatePayload>) => put(`/template/${id}`, payload),
//   delete: (id: string) => del(`/template/${id}`),
// };

// // Knowledge Base APIs
// export const knowledgeApi = {
//   create: (payload: KnowledgePayload) => post("/knowledge", payload),
//   getAll: () => get("/knowledge"),
//   getById: (id: string) => get(`/knowledge/${id}`),
//   update: (id: string, payload: Partial<KnowledgePayload>) => put(`/knowledge/${id}`, payload),
//   delete: (id: string) => del(`/knowledge/${id}`),
// };

// // User APIs
// export const userApi = {
//   register: (payload: UserPayload & { name: string }) => post("/users/register", payload),
//   login: (payload: Pick<UserPayload, 'email' | 'password'>) => post("/users/login", payload),
//   getProfile: () => get("/users/profile"),
// };

// // Token management
// export const tokenManager = {
//   get: () => localStorage.getItem("token"),
//   set: (token: string) => localStorage.setItem("token", token),
//   remove: () => localStorage.removeItem("token"),
//   isValid: (token?: string) => {
//     const currentToken = token || tokenManager.get();
//     if (!currentToken) return false;
    
//     try {
//       const payload = JSON.parse(atob(currentToken.split('.')[1]));
//       return payload.exp * 1000 > Date.now();
//     } catch {
//       return false;
//     }
//   }
// };

// // Request interceptor for auth
// API.interceptors.request.use(
//   (config) => {
//     const token = tokenManager.get();
//     if (token && tokenManager.isValid(token)) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// // Response interceptor for error handling
// API.interceptors.response.use(
//   (response) => response,
//   (error: AxiosError) => {
//     // Handle 401 Unauthorized
//     if (error.response?.status === 401) {
//       tokenManager.remove();
//       // Redirect to login or emit event for global auth state management
//       window.location.href = '/login';
//     }
//     return Promise.reject(error);
//   }
// );

// export default API;