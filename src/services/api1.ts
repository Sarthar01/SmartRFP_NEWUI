// src/services/api1.ts
import axios from "axios";

// ----------------- Types -----------------
export interface RfpProject {
  id: number;
  title: string;
  description: string;
  status: string;
  processing_progress: number;
  organization_name: string;
  created_by_name: string;
  ai_processing_complete: boolean;
  created_at: string;
  updated_at: string;
   type?: string;           
  priority?: string;         
  submissionDeadline?: string;
  // optional fields
  original_filename?: string;
  file_size?: number;
  file_type?: string;
  processing_log?: string;
  task_id?: string;
  processing_notes?: string;
  processing_time_seconds?: number;
  extracted_requirements?: string;
  generated_proposal?: string;
  organization_id?: number;
  created_by_user_id?: number;
  file_download_url?: string;
  processed_at?: string;
  estimatedTime?: string; 
}

export interface PaginatedProjects {
  projects: RfpProject[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface OrgStats {
  total_projects: number;
  draft_projects: number;
  processing_projects: number;
  completed_projects: number;
  failed_projects: number;
  archived_projects: number;
  total_storage_mb: number;
  recent_projects: RfpProject[];
}

export interface QueueResponse {
  message: string;
  task_id: string;
  project_id: number;
  status: string;
}

export interface ProcessingStatus {
  project_id: number;
  status: "queued" | "processing" | "completed" | "failed";
  progress: number;
  task_id: string;
  processing_notes?: string;
  estimated_completion?: string;
  started_at?: string;
}

export interface CancelResponse {
  message: string;
}

export interface StartProcessingResponse {
  success: boolean;
  message: string;
  project_id: number;
  task_id: string;
  status: string;
  estimated_time: string;
}

export interface RetryResponse {
  message: string;
  task_id: string;
  project_id: number;
}

export interface QueueOverview {
  active_tasks: number;
  pending_tasks: number;
  failed_tasks: number;
  completed_today: number;
  average_processing_time: number; // in seconds
  queue_details: {
    task_id: string;
    project_id: number;
    status: string;
    progress: number;
    started_at: string;
  }[];
}

export interface LlamaTestSuccess {
  success: true;
  input: string;
  llama_response: string;
  processing_time_seconds: number;
  llama_api_url: string;
  llama_model: string;
  status_code: number;
}
export interface ProjectMetadata {
  projectName: string;
  budget: number;
  budgetCurrency: string;
  startDate: string; // 
  endDate: string;   // 
  priority: 'High' | 'Medium' | 'Low';
  department: string;
  description?: string;
}

export interface LlamaTestError {
  success: false;
  error: string;
  llama_api_url: string;
  llama_model: string;
}

export type LlamaTestResponse = LlamaTestSuccess | LlamaTestError;

// ----------------- Helpers -----------------
const API_URL = `api/v1`;

const getAuthHeader = (token: string) => ({
  Authorization: `Bearer ${token}`,
});

// ----------------- RFP Project Endpoints -----------------


// 1. Create RFP Project
export const createRfpProject = async (
  title: string,
  description: string,
  file: File,
  token: string
): Promise<RfpProject> => {
  try {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("file", file);

    const response = await axios.post<RfpProject>(
      `${API_URL}/rfp-projects/`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error("RFP project creation error:", error);
    throw new Error(
      error.response?.data?.message || "Failed to create RFP project"
    );
  }
};


// ------------------ Proposal Download ------------------
export const downloadProposalFile = async (
  projectId: number,
  format: "pdf" | "docx",
  token: string
) => {
  try {
    const response = await axios.get(
      `/api/v1/rfp-projects/${projectId}/download-proposal?format=${format}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob", // important for binary file
      }
    );

    // Extract filename from header
    const disposition = response.headers["content-disposition"];
    const filename =
      disposition?.split("filename=")[1]?.replace(/["']/g, "") ||
      `proposal_${projectId}.${format}`;

    // Create blob download link
    const url = window.URL.createObjectURL(response.data);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return true;
  } catch (error: any) {
    console.error("Proposal download failed:", error);
    throw error;
  }
};





// 2. Get RFP Projects (Paginated)
export const getRfpProjects = async (
  token: string,
  page = 1,
  per_page = 20,
  status_filter?: string
): Promise<PaginatedProjects> => {
  const response = await axios.get<PaginatedProjects>(
    `${API_URL}/rfp-projects/`,
    {
      headers: getAuthHeader(token),
      params: { page, per_page, status_filter },
    }
  );
  return response.data;
};

// 3. Get RFP Project Details
export const getRfpProjectDetails = async (
  projectId: number,
  token: string
): Promise<RfpProject> => {
  const response = await axios.get<RfpProject>(
    `${API_URL}/rfp-projects/${projectId}`,
    { headers: getAuthHeader(token) }
  );
  return response.data;
};

// 4. Update RFP Project
export const updateRfpProject = async (
  projectId: number,
  updates: { title?: string; description?: string },
  token: string
): Promise<RfpProject> => {
  const response = await axios.put<RfpProject>(
    `${API_URL}/rfp-projects/${projectId}`,
    updates,
    { headers: getAuthHeader(token) }
  );
  return response.data;
};

// 5. Delete RFP Project
export const deleteRfpProject = async (
  projectId: number,
  token: string
): Promise<{ message: string }> => {
  const response = await axios.delete<{ message: string }>(
    `${API_URL}/rfp-projects/${projectId}`,
    { headers: getAuthHeader(token) }
  );
  return response.data;
};

// 6. Get File Download URL
export const getRfpFileDownloadUrl = async (
  projectId: number,
  token: string
): Promise<{ download_url: string; expires_in_minutes: number }> => {
  const response = await axios.get<{ download_url: string; expires_in_minutes: number }>(
    `${API_URL}/rfp-projects/${projectId}/download`,
    { headers: getAuthHeader(token) }
  );
  return response.data;
};

// 7. Get Organization RFP Statistics
export const getOrganizationRfpStats = async (
  token: string
): Promise<OrgStats> => {
  const response = await axios.get<OrgStats>(
    `${API_URL}/rfp-projects/stats/organization`,
    { headers: getAuthHeader(token) }
  );
  return response.data;
};

// ----------------- AI Processing Endpoints -----------------

// 8. Queue RFP for AI Processing
export const queueRfpForAI = async (
  projectId: number,
  token: string
): Promise<QueueResponse> => {
  const response = await axios.post<QueueResponse>(
    `${API_URL}/rfp-projects/${projectId}/process`,
    {},
    { headers: getAuthHeader(token) }
  );
  return response.data;
};

// 9. Get Processing Status
export const getRfpProcessingStatus = async (
  projectId: number,
  token: string
): Promise<ProcessingStatus> => {
  const response = await axios.get<ProcessingStatus>(
    `${API_URL}/rfp-projects/${projectId}/processing-status`,
    { headers: getAuthHeader(token) }
  );
  return response.data;
};

// 10. Cancel Processing
export const cancelRfpProcessing = async (projectId: number, token: string): Promise<{ message: string }> => {
  const response = await axios.post<{ message: string }>(
    `${API_URL}/rfp-projects/${projectId}/cancel-processing`,
    {},
    { headers: getAuthHeader(token) }
  );
  return response.data;
};

// 11. Retry Failed Processing
export const retryRfpProcessing = async (projectId: number, token: string) => {
  const response = await axios.post<{ message: string; task_id: string; project_id: number }>(
    `${API_URL}/rfp-projects/${projectId}/retry-processing`,
    {},
    { headers: getAuthHeader(token) }
  );
  return response.data;
};

// 12. Get Queue Overview
export const getRfpQueueOverview = async (token: string) => {
  const response = await axios.get(
    `${API_URL}/rfp-projects/queue/overview`,
    { headers: getAuthHeader(token) }
  );
  return response.data;
};
// ----------------- Testing Endpoints -----------------

// 13. Test LLaMA Connection
export const testLlamaConnection = async (
  token: string,
  message: string = "Say hello"
): Promise<LlamaTestResponse> => {
  const response = await axios.post<LlamaTestResponse>(
    `${API_URL}/rfp-projects/test/llama?message=${encodeURIComponent(message)}`,
    {},
    { headers: getAuthHeader(token) }
  );
  return response.data;
};
export const startCompleteProcessing = async (
  projectId: number,
  token: string
): Promise<StartProcessingResponse> => {
  const response = await axios.post<StartProcessingResponse>(
    `${API_URL}/rfp-projects/${projectId}/start-complete-processing`,
    {},
    { headers: getAuthHeader(token) }
  );
  return response.data;
};