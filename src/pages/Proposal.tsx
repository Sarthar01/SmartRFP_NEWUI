// src/pages/Proposal.tsx
import React, { useEffect, useState, useRef } from "react";
import Sidebar from "../components/sidebar";
import {
  createRfpProject,
  getRfpProjects,
  getOrganizationRfpStats,
  getRfpFileDownloadUrl,
} from "../services/api1";
import type {
  RfpProject,
  OrgStats,
  PaginatedProjects,
  ProjectMetadata 
} from "../services/api1";
import "../style/Proposal.css";
 


interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  source: 'local' | 'google-drive';
  uploadedAt: Date;
  file?: File; 
}


interface Filters {
  searchTerm: string;
  statusFilter: string;
  typeFilter: string;
  priorityFilter: string;
  libSearch: string;
  libStatusFilter: string;
  libTypeFilter: string;
}

const Proposal: React.FC = () => {
  const token = localStorage.getItem("token") || "";
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [proposalState, setProposalState] = useState<{
  ongoingCount: number;
  isLoading: boolean;
  lastUpdated: string;
  proposalProgress: Record<string, number>;
  currentlyGenerating: RfpProject | null;
  nextInQueue: RfpProject | null;
  generationProgress: number;
}>({
  ongoingCount: 0,
  isLoading: true,
  lastUpdated: new Date().toISOString(),
  proposalProgress: {},
  currentlyGenerating: null,
  nextInQueue: null,
  generationProgress: 0,
});


  const [uploadState, setUploadState] = useState<{
    uploadedFiles: File[];
    isUploading: boolean;
    uploadForm: { title: string; description: string; file?: File };
    uploadError: string | null;
    uploadSuccess: string | null;
    isDragOver: boolean;
  }>({
    uploadedFiles: [],
    isUploading: false,
    uploadForm: { title: "", description: "" },
    uploadError: null,
    uploadSuccess: null,
    isDragOver: false,
  });
  const [formData, setFormData] = useState({
  title: '',
  description: ''
});

  const getToken = () => localStorage.getItem("token") || ""

  const [projectMetadata, setProjectMetadata] = useState<any>(null);
  const [isMetadataVisible, setIsMetadataVisible] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    searchTerm: "",
    statusFilter: "all",
    typeFilter: "all",
    priorityFilter: "all",
    libSearch: "",
    libStatusFilter: "all",
    libTypeFilter: "all",
  });
  const [rfpProjects, setRfpProjects] = useState<RfpProject[]>([]);
  const [orgStats, setOrgStats] = useState<OrgStats | null>(null);

  // ---------------- Fetch Organization Stats ----------------
  const fetchOrgStats = async () => {
    try {
      setProposalState(prev => ({ ...prev, isLoading: true }));
      const stats = await getOrganizationRfpStats(token);
      setOrgStats(stats);
      setProposalState(prev => ({
        ...prev,
        ongoingCount: stats.processing_projects,
        lastUpdated: new Date().toISOString(),
        isLoading: false,
      }));
    } catch (error) {
      console.error("Error fetching org stats:", error);
      setProposalState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // ---------------- Fetch RFP Projects ----------------
  const fetchRfpProjects = async () => {
    try {
      const data: PaginatedProjects = await getRfpProjects(token, 1, 50);
      setRfpProjects(data.projects);
      const progressMap: Record<string, number> = {};
      data.projects.forEach(p => {
        progressMap[p.id.toString()] = p.processing_progress;
      });
      setProposalState(prev => ({ ...prev, proposalProgress: progressMap }));
    } catch (error) {
      console.error("Error fetching RFP projects:", error);
    }
  };

  // ---------------- Effects ----------------
  useEffect(() => {
    fetchOrgStats();
    fetchRfpProjects();
  }, []);

  // ---------------- File Upload ----------------
  const handleLocalFileClick = () => fileInputRef.current?.click();
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setUploadState(prev => ({
        ...prev,
        uploadedFiles: files,
        uploadForm: { ...prev.uploadForm, file: files[0] },
      }));
    }
  };
  const libraryProjects = Object.keys(proposalState.proposalProgress)
  .map(id => {
    const project = rfpProjects.find(p => p.id.toString() === id);
    if (!project) return null;
    return {
      ...project,
      progress: proposalState.proposalProgress[id] ?? 0
    };
  })
  .filter(Boolean)
  .filter(proj => {
    // 🔍 Search filter (by title or ID)
    const matchesSearch =
      filters.libSearch === "" ||
      proj!.title.toLowerCase().includes(filters.libSearch.toLowerCase()) ||
      proj!.id.toString().includes(filters.libSearch);

    // 📌 Status filter (in-progress or completed)
    const status = proj!.progress >= 100 ? "completed" : "in-progress";
    const matchesStatus =
      filters.libStatusFilter === "all" || filters.libStatusFilter === status;

    // 🏷️ Type filter (Budget, Policy, etc.)
    const matchesType =
      filters.libTypeFilter === "all" ||
      (proj!.type && proj!.type.toLowerCase() === filters.libTypeFilter.toLowerCase());

    return matchesSearch && matchesStatus && matchesType;
  });

  const removeFile = () =>
    setUploadState(prev => ({
      ...prev,
      uploadedFiles: [],
      uploadForm: { title: "", description: "" },
    }));

const handleFormSubmit = async () => {
  if (!uploadState.uploadForm.file || !uploadState.uploadForm.title) return;

  if (!projectMetadata) {
    alert("Please fill project metadata before submitting!");
    return;
  }

  setUploadState(prev => ({ ...prev, isUploading: true }));

  try {
    await createRfpProject(
      uploadState.uploadForm.title,
      uploadState.uploadForm.description,
      uploadState.uploadForm.file!,
      token,
      
    );

    setUploadState(prev => ({
      ...prev,
      isUploading: false,
      uploadedFiles: [],
      uploadForm: { title: "", description: "" },
      uploadSuccess: "Project uploaded successfully!",
    }));
    setProjectMetadata(null); // reset
    fetchRfpProjects(); // refresh list
  } catch (error) {
    console.error("Upload error:", error);
    setUploadState(prev => ({
      ...prev,
      isUploading: false,
      uploadError: "Upload failed",
    }));
  }
};

   

const handleView = async (projId: number) => {
  try {
    const token = getToken()
    if (!token) {
      alert("No token found. Please log in again.")
      return
    }

    const res = await getRfpFileDownloadUrl(projId, token)
    window.open(res.download_url, "_blank")
  } catch (err) {
    console.error("View failed:", err)
  }
}

const handleDownload = async (projId: number, title: string) => {
  try {
    const token = getToken()
    if (!token) {
      alert("No token found. Please log in again.")
      return
    }

    const res = await getRfpFileDownloadUrl(projId, token)

    const link = document.createElement("a")
    link.href = res.download_url
    link.download = `${title || projId}.pdf`
    link.click()
  } catch (err) {
    console.error("Download failed:", err)
  }
}



  // ---------------- Filters ----------------
  const updateFilters = (updated: Partial<Filters>) =>
    setFilters(prev => ({ ...prev, ...updated }));

  const filteredRFPs = rfpProjects.filter(rfp => {
    const matchesSearch =
      rfp.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      rfp.id.toString().includes(filters.searchTerm);
    const matchesStatus =
      filters.statusFilter === "all" || rfp.status === filters.statusFilter;
    const matchesType = filters.typeFilter === "all" || rfp.description?.includes(filters.typeFilter);
    const matchesPriority = filters.priorityFilter === "all" || rfp.processing_progress.toString() === filters.priorityFilter;
    return matchesSearch && matchesStatus && matchesType && matchesPriority;
  });

  // ---------------- Helpers ----------------
  const getStatusMessage = () => `${proposalState.ongoingCount} ongoing`;
  const formatLastUpdated = (dateStr: string) => new Date(dateStr).toLocaleString();
  const getTypeIcon = (type?: string) => {
  if (!type) return "📄"; // fallback icon
  switch (type.toLowerCase()) {
    case "budget": return "💰";
    case "policy": return "📜";
    case "infrastructure": return "🏗️";
    case "community": return "🌐";
    case "research": return "🔬";
    default: return "📄";
  }
};

const getPriorityColor = (priority?: string) => {
  if (!priority) return "gray";
  switch (priority.toLowerCase()) {
    case "high": return "red";
    case "medium": return "orange";
    case "low": return "green";
    default: return "gray";
  }
};

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setUploadState(prev => ({ ...prev, isDragOver: true })); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setUploadState(prev => ({ ...prev, isDragOver: false })); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setUploadState(prev => ({ ...prev, isDragOver: false }));
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      setUploadState(prev => ({
        ...prev,
        uploadedFiles: files,
        uploadForm: { ...prev.uploadForm, file: files[0] },
      }));
    }
  };
  const getFileIcon = (type: string) => {
    if (type.includes("pdf")) return "📄";
    if (type.includes("word")) return "📝";
    if (type.includes("excel")) return "📊";
    return "📁";
  };
  const formatFileSize = (size: number) => `${(size / 1024).toFixed(2)} KB`;
  const handleRFPView = async (id: number) => {
  try {
    const token = getToken()
    if (!token) {
      alert("No token found. Please log in again.")
      return
    }

    const res = await getRfpFileDownloadUrl(id, token)
    window.open(res.download_url, "_blank")
  } catch (err) {
    console.error("Failed to open RFP:", err)
    alert("Could not open RFP file. Please try again later.")
  }
}
  const formatDeadline = (dateStr?: string) => dateStr ? new Date(dateStr).toLocaleDateString() : "-";

  // ---------------- JSX ----------------
  return (
     <>
    {isMetadataVisible && (
      <div className="metadata-overlay" onClick={() => setIsMetadataVisible(false)}>
        <div className="metadata-modal" onClick={e => e.stopPropagation()}>
          <h2>Project Metadata</h2>
          <form onSubmit={async (e) => {
  e.preventDefault();
  if (!uploadState.uploadForm.file) {
    alert("Please select a file first!");
    return;
  }

  try {
    setUploadState(prev => ({ ...prev, isUploading: true }));

    await createRfpProject(
      formData.title,
      formData.description,
      uploadState.uploadForm.file,
      token
    );

    setUploadState(prev => ({
      ...prev,
      isUploading: false,
      uploadedFiles: [],
      uploadForm: { title: "", description: "" },
      uploadSuccess: "Project uploaded successfully!"
    }));

    setFormData({ title: "", description: "" });
    setIsMetadataVisible(false);
    fetchRfpProjects();
  } catch (error) {
    console.error("Upload error:", error);
    setUploadState(prev => ({
      ...prev,
      isUploading: false,
      uploadError: "Upload failed"
    }));
  }
}}>
  <input
    type="text"
    placeholder="Project Name"
    value={formData.title}
    onChange={e => setFormData({ ...formData, title: e.target.value })}
    required
  />
  <textarea
    placeholder="Description (optional)"
    value={formData.description}
    onChange={e => setFormData({ ...formData, description: e.target.value })}
  />
  <button type="submit" disabled={uploadState.isUploading}>
    {uploadState.isUploading ? "Saving..." : "Submit"}
  </button>
</form>
        </div>
      </div>
    )}
    <div className="proposal-container">
      <Sidebar />
      <div className="proposal-content">
        <main className="proposal-main">
          <h1 className="proposal-title">PROPOSAL</h1>
          {/* First row of boxes */}
          <div className="proposal-boxes">
            {/* Box 1: Ongoing Proposals */}
            <div
              className={`proposal-box ongoing-proposals-box ${proposalState.ongoingCount > 0 ? "pulse" : ""} ${proposalState.isLoading ? "loading" : ""}`}
              onClick={() => console.log("Navigate to ongoing proposals details")}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === "Enter" || e.key === " ") console.log("Navigate to ongoing proposals details");
              }}
              aria-label={`${proposalState.ongoingCount} ongoing proposals`}
            >
              <div className="ongoing-proposals-content">
                <div className="proposal-label">Ongoing Proposals</div>
                <div className="proposal-number">{proposalState.isLoading ? "..." : proposalState.ongoingCount}</div>
                <div className="proposal-status">{getStatusMessage()}</div>
                {!proposalState.isLoading && (
                  <div className="last-updated">Updated: {formatLastUpdated(proposalState.lastUpdated)}</div>
                )}
              </div>
              <div className="proposal-icon">📋</div>
            </div>

            {/* Box 2: RFP Generation Queue */}
            <div
              className={`proposal-box generation-queue-box ${proposalState.currentlyGenerating ? "active" : ""} ${proposalState.isLoading ? "loading" : ""}`}
              onClick={() => console.log("Navigate to generation queue details")}
              role="button"
              tabIndex={0}
              aria-label="RFP generation queue"
            >
              <div className="generation-queue-content">
                <div className="proposal-label">RFP Response Queue</div>

                {proposalState.isLoading ? (
                  <div className="queue-loading">
                    <div className="proposal-number">...</div>
                    <div className="proposal-status">Loading queue...</div>
                  </div>
                ) : (
                  <>
                    {proposalState.currentlyGenerating ? (
                      <div className="currently-generating">
                        <div className="generating-header">
                          <span className="generating-icon">⚙️</span>
                          <span className="generating-text">Generating</span>
                        </div>
                        <div className="proposal-item">
                          <div className="proposal-info">
                            <span className="proposal-id">{proposalState.currentlyGenerating.id}</span>
                            <span className="proposal-priority" style={{ color: getPriorityColor(proposalState.currentlyGenerating.priority) }}>
                              {proposalState.currentlyGenerating.priority}
                            </span>
                          </div>
                          <div className="proposal-title-small">{proposalState.currentlyGenerating.title}</div>
                          <div className="progress-container">
                            <div className="progress-bar">
                              <div className="progress-fill" style={{ width: `${Math.min(proposalState.generationProgress, 100)}%` }}></div>
                            </div>
                            <span className="progress-text">{Math.round(Math.min(proposalState.generationProgress, 100))}%</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="no-generation">
                        <div className="proposal-number">0</div>
                        <div className="proposal-status">No active generation</div>
                      </div>
                    )}

                    {proposalState.nextInQueue && (
                      <div className="next-in-queue">
                        <div className="queue-header">
                          <span className="queue-icon">⏳</span>
                          <span className="queue-text">Next: {proposalState.nextInQueue.id}</span>
                        </div>
                        <div className="next-proposal-info">
                          <span className="next-proposal-type">{getTypeIcon(proposalState.nextInQueue.type)} {proposalState.nextInQueue.type}</span>
                          <span className="next-proposal-time">~{proposalState.nextInQueue.estimatedTime}</span>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
              <div className="proposal-icon1">{proposalState.currentlyGenerating ? "⚡" : ""}</div>
            </div>

            {/* Box 3: RFP Upload Center */}
            <div
              className={`proposal-box upload-box ${uploadState.isDragOver ? "drag-over" : ""} ${uploadState.isUploading ? "uploading" : ""}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={!uploadState.isUploading ? handleLocalFileClick : undefined}
              role="button"
              tabIndex={0}
              aria-label="Upload RFP documents"
            >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileInputChange}
                  accept="application/pdf,.pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  style={{ display: "none" }}
                />


              <div className="upload-content">
                <div className="proposal-label">RFP Document Upload</div>

                {uploadState.uploadedFiles.length === 0 && !uploadState.isUploading ? (
                  <div className="upload-empty">
                    <div className="upload-icon">📁</div>
                    <div className="upload-text">
                      <div className="upload-primary">Drop RFP document here</div>
                      <div className="upload-secondary">or click to browse</div>
                    </div>
                    <div className="supported-formats"><small>Supports PDF, DOC, and DOCX file</small></div>
                  </div>
                ) : (
                  <div className="uploaded-files">
                    {uploadState.uploadedFiles.map((file , index) => (
                      <div key={file.name + "_" + file.size + "_" + index} className="file-item">
                        <div className="file-name">{file.name}</div>
                        <div className="file-info">
                          <span className="file-icon">{getFileIcon(file.type)}</span>
                          <div className="file-details">
                            <div className="file-name">{file.name}</div>
                            <div className="file-meta">
                              <span className="file-size">{formatFileSize(file.size)}</span>
                              <span className="file-source">📂 Local</span>
                            </div>
                          </div>
                        </div>
                        <button className="file-remove" onClick={(e) => { e.stopPropagation(); removeFile(); }} aria-label={`Remove ${file.name}`}>✕</button>
                      </div>
                    ))}

                    {/* Upload Actions */}
                    <div className="upload-actions">
                      <button className="upload-submit-btn" onClick={(e) => { e.stopPropagation(); handleFormSubmit(); }} disabled={!uploadState.uploadForm.title.trim() || !uploadState.uploadForm.file}>
                        🚀 Submit RFP
                      </button>
                      <button className="metadata-button" onClick={(e) => { e.stopPropagation(); setIsMetadataVisible(true); }}>
                        📝 Add Details
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Second row of boxes: RFP Responses + Proposal Library */}
<div className="proposal-boxes-row-2">

  {/* Box 4 - RFP Responses */}
  <div className="proposal-box rfp-responses-box">
    <div className="rfp-responses-header">
      <h3 className="rfp-responses-title">
        📄 RFP Responses
        <span className="rfp-count-badge">{filteredRFPs.length}</span>
      </h3>
    </div>

    {/* Search and Filters */}
    <div className="rfp-search-section">
      <div className="rfp-search-bar">
        <span className="rfp-search-icon">🔍</span>
        <input
          type="text"
          className="rfp-search-input"
          placeholder="Search RFPs by title or ID..."
          value={filters.searchTerm}
          onChange={(e) => updateFilters({ searchTerm: e.target.value })}
        />
      </div>

      <div className="rfp-filters">
        <select
          className="rfp-filter-select"
          value={filters.statusFilter}
          onChange={(e) => updateFilters({ statusFilter: e.target.value as any })}
        >
          <option value="all">Status</option>
          <option value="completed">Completed</option>
          <option value="reviewed">Reviewed</option>
          <option value="pending">Pending</option>
        </select>

        <select
          className="rfp-filter-select"
          value={filters.typeFilter}
          onChange={(e) => updateFilters({ typeFilter: e.target.value as any })}
        >
          <option value="all">Type</option>
          <option value="Budget">Budget</option>
          <option value="Policy">Policy</option>
          <option value="Infrastructure">Infrastructure</option>
          <option value="Community">Community</option>
          <option value="Research">Research</option>
        </select>

        <select
          className="rfp-filter-select"
          value={filters.priorityFilter}
          onChange={(e) => updateFilters({ priorityFilter: e.target.value as any })}
        >
          <option value="all">Priority</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>
    </div>

    {/* RFP Responses List */}
    <div className="rfp-responses-content">
      <div className="rfp-responses-list">
        {filteredRFPs.length > 0 ? (
          filteredRFPs.map((rfp) => (
            <div key={rfp.id} className={`rfp-response-item ${rfp.status}`}>
              <div className="rfp-item-header">
                <span className="rfp-item-id">{rfp.id}</span>
                <div className="rfp-item-status">
                  <div className={`rfp-status-indicator ${rfp.status}`}></div>
                  <span className={`rfp-status-text ${rfp.status}`}>{rfp.status}</span>
                </div>
              </div>

              <div className="rfp-item-details">
                <h4 className="rfp-item-title">{rfp.title}</h4>

                <div className="rfp-item-meta">
                  <div className="rfp-item-type">
                    <span className="rfp-type-icon">{getTypeIcon(rfp.type)}</span>
                    <span>{rfp.type || "N/A"}</span>
                    <span style={{ color: getPriorityColor(rfp.priority) }}>• {rfp.priority}</span>
                  </div>
                  <div className="rfp-item-time">
                    <span className="rfp-time-icon">⏰</span>
                    <span>{formatDeadline(rfp.submissionDeadline)}</span>
                  </div>
                </div>

                <div className="rfp-item-actions">
                  <button
                    className="rfp-action-btn primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRFPView(rfp.id);
                    }}
                  >
                    👁️ View
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rfp-empty-state">
            <div className="rfp-empty-icon">🔭</div>
            <h4 className="rfp-empty-title">No RFP responses found</h4>
            <p className="rfp-empty-text">
              {filters.searchTerm || filters.statusFilter !== "all" || filters.typeFilter !== "all" || filters.priorityFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Generated RFP responses will appear here"}
            </p>
          </div>
        )}
      </div>
    </div>

    <div className="rfp-responses-footer">
      <a href="#" className="rfp-view-all">View all responses <span>→</span></a>
      <span className="rfp-last-updated">Updated: {formatLastUpdated(proposalState.lastUpdated)}</span>
    </div>
  </div>

  {/* Box 5 - Proposal Library */}
  <div className="proposal5-box">
    <div className="proposal5-header">
      <span className="proposal5-title">Proposal Library</span>
      <div className="proposal5-filters">
        <input
          type="text"
          placeholder="Search..."
          value={filters.libSearch}
          onChange={(e) => updateFilters({ libSearch: e.target.value })}
        />
        <select
          value={filters.libStatusFilter}
          onChange={(e) => updateFilters({ libStatusFilter: e.target.value as any })}
        >
          <option value="all">All Statuses</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <select
          value={filters.libTypeFilter}
          onChange={(e) => updateFilters({ libTypeFilter: e.target.value as any })}
        >
          <option value="all">All Types</option>
          <option value="Budget">Budget</option>
          <option value="Policy">Policy</option>
          <option value="Infrastructure">Infrastructure</option>
          <option value="Community">Community</option>
          <option value="Research">Research</option>
        </select>
      </div>
    </div>

    <div className="proposal5-list">
  {libraryProjects.map((proj,index) => (
    <div key={proj!.id.toString() + "_" + index} className="proposal5-card">
      <div className="proposal5-card-header">
        <span className="proposal5-id">{proj!.id}</span>
        <div className="proposal5-status">
          <div
            className="proposal5-status-indicator"
            style={{
              backgroundColor: proj!.progress >= 100 ? "#10b981" : "#f59e0b",
            }}
          ></div>
          {proj!.progress >= 100 ? "completed" : "in-progress"}
        </div>
      </div>
      <div className="proposal5-title">{proj!.title}</div> {/* <-- use real title */}
      {proj!.progress < 100 ? (
        <div className="proposal5-progress-container">
          <div
            className="proposal5-progress-fill"
            style={{ width: `${proj!.progress}%` }}
          ></div>
        </div>
      ) : (
        <div className="proposal5-actions">
          <button
            className="proposal5-btn view"
            onClick={() => handleView(proj!.id)}
          >
            View
          </button>
          <button
            className="proposal5-btn download"
           onClick={() => handleDownload(proj!.id, proj!.title)}
          >
            Download
          </button>
        </div>
      )}
    </div>
  ))}
</div>

  </div>
</div>
        </main>
      </div>

      
    </div>
    </>
  );
};

export default Proposal;



// import { useState, useEffect, useRef, useCallback, useMemo } from "react";
// import { useNavigate } from "react-router-dom";
// import Sidebar from "../components/sidebar";
// import Metadata from "../components/Metadata";
// import "../style/Proposal.css";
// import { proposalApi, rfpProjectApi } from "../services/api";

// // Types
// interface ProposalItem {
//   id: string;
//   title: string;
//   type: string;
//   priority: string;
//   estimatedTime?: string;
// }

// interface CompletedRFP {
//   id: string;
//   title: string;
//   type: "Budget" | "Policy" | "Infrastructure" | "Community" | "Research";
//   status: "completed" | "reviewed" | "pending";
//   completedAt: Date;
//   priority: "High" | "Medium" | "Low";
//   estimatedValue: string;
//   submissionDeadline: Date;
//   responseLength: number;
//   confidence: number;
// }

// interface UploadedFile {
//   id: string;
//   name: string;
//   size: number;
//   type: string;
//   file: File;
//   source: "local" | "google-drive";
//   uploadedAt: Date;
// }

// interface ProjectMetadata {
//   projectName: string;
//   budget: number;
//   budgetCurrency: string;
//   startDate: string;
//   endDate: string;
//   description: string;
//   priority: "High" | "Medium" | "Low";
//   department: string;
// }

// interface UploadFormData {
//   title: string;
//   description: string;
//   file: File | null;
// }

// interface ProposalState {
//   ongoingCount: number;
//   isLoading: boolean;
//   lastUpdated: Date;
//   currentlyGenerating: ProposalItem | null;
//   nextInQueue: ProposalItem | null;
//   generationProgress: number;
//   proposalProgress: Record<string, number>;
// }

// interface UploadState {
//   isDragOver: boolean;
//   uploadedFiles: UploadedFile[];
//   isUploading: boolean;
//   uploadProgress: number;
//   uploadError: string | null;
//   uploadSuccess: string | null;
//   uploadForm: UploadFormData;
// }

// interface FilterState {
//   searchTerm: string;
//   statusFilter: "all" | "completed" | "reviewed" | "pending";
//   typeFilter: "all" | "Budget" | "Policy" | "Infrastructure" | "Community" | "Research";
//   priorityFilter: "all" | "High" | "Medium" | "Low";
//   libSearch: string;
//   libStatusFilter: "all" | "in-progress" | "completed";
//   libTypeFilter: "all" | "Budget" | "Policy" | "Infrastructure" | "Community" | "Research";
// }

// // Constants
// const ALLOWED_FILE_TYPES = [
//   'application/pdf',
//   'application/msword',
//   'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
//   'application/vnd.ms-excel',
//   'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
// ];

// const SAMPLE_PROPOSALS: ProposalItem[] = [
//   {
//     id: "PROP-2023-001",
//     title: "Enterprise Cloud Migration Strategy",
//     type: "Infrastructure",
//     priority: "High",
//     estimatedTime: "4 weeks"
//   },
//   {
//     id: "PROP-2023-002",
//     title: "Annual Financial Planning Framework",
//     type: "Budget",
//     priority: "Medium",
//     estimatedTime: "2 weeks"
//   },
//   {
//     id: "PROP-2023-003",
//     title: "Community Outreach Program",
//     type: "Community",
//     priority: "Low",
//     estimatedTime: "3 weeks"
//   },
//   {
//     id: "PROP-2023-004",
//     title: "Data Security Compliance Policy",
//     type: "Policy",
//     priority: "High",
//     estimatedTime: "1 week"
//   },
//   {
//     id: "PROP-2023-005",
//     title: "Market Trend Analysis Report",
//     type: "Research",
//     priority: "Medium",
//     estimatedTime: "5 weeks"
//   }
// ];

// const SAMPLE_RFPS: CompletedRFP[] = [
//   {
//     id: "RFP-2023-001",
//     title: "Cloud Infrastructure Migration",
//     type: "Infrastructure",
//     status: "completed",
//     completedAt: new Date(2023, 5, 15),
//     priority: "High",
//     estimatedValue: "$250,000",
//     submissionDeadline: new Date(2023, 6, 30),
//     responseLength: 42,
//     confidence: 92
//   },
//   {
//     id: "RFP-2023-002",
//     title: "Annual Budget Planning Tool",
//     type: "Budget",
//     status: "reviewed",
//     completedAt: new Date(2023, 4, 20),
//     priority: "Medium",
//     estimatedValue: "$75,000",
//     submissionDeadline: new Date(2023, 5, 15),
//     responseLength: 28,
//     confidence: 88
//   },
//   {
//     id: "RFP-2023-003",
//     title: "Community Engagement Platform",
//     type: "Community",
//     status: "pending",
//     completedAt: new Date(2023, 6, 5),
//     priority: "Low",
//     estimatedValue: "$120,000",
//     submissionDeadline: new Date(2023, 7, 10),
//     responseLength: 35,
//     confidence: 78
//   }
// ];

// // Custom hooks
// const useProposalState = () => {
//   const [state, setState] = useState<ProposalState>({
//     ongoingCount: 0,
//     isLoading: true,
//     lastUpdated: new Date(),
//     currentlyGenerating: null,
//     nextInQueue: null,
//     generationProgress: 0,
//     proposalProgress: {},
//   });

//   const updateState = useCallback(
//     (updates: Partial<ProposalState> | ((prev: ProposalState) => ProposalState)) => {
//       setState((prev) =>
//         typeof updates === "function" ? updates(prev) : { ...prev, ...updates }
//       );
//     },
//     []
//   );

//   return [state, updateState] as const;
// };

// const useUploadState = () => {
//   const [state, setState] = useState<UploadState>({
//     isDragOver: false,
//     uploadedFiles: [],
//     isUploading: false,
//     uploadProgress: 0,
//     uploadError: null,
//     uploadSuccess: null,
//     uploadForm: { title: "", description: "", file: null },
//   });

//   const updateState = useCallback(
//     (updates: Partial<UploadState> | ((prev: UploadState) => UploadState)) => {
//       setState((prev) =>
//         typeof updates === "function" ? updates(prev) : { ...prev, ...updates }
//       );
//     },
//     []
//   );

//   const resetUploadState = useCallback(() => {
//     setState((prev) => ({
//       ...prev,
//       uploadedFiles: [],
//       uploadError: null,
//       uploadSuccess: null,
//       uploadForm: { title: "", description: "", file: null },
//     }));
//   }, []);

//   return [state, updateState, resetUploadState] as const;
// };

// const useFilterState = () => {
//   const [filters, setFilters] = useState<FilterState>({
//     searchTerm: "",
//     statusFilter: "all",
//     typeFilter: "all",
//     priorityFilter: "all",
//     libSearch: "",
//     libStatusFilter: "all",
//     libTypeFilter: "all",
//   });

//   const updateFilters = useCallback((updates: Partial<FilterState>) => {
//     setFilters(prev => ({ ...prev, ...updates }));
//   }, []);

//   return [filters, updateFilters] as const;
// };

// // Utility functions
// const formatFileSize = (bytes: number): string => {
//   if (bytes === 0) return "0 Bytes";
//   const k = 1024;
//   const sizes = ["Bytes", "KB", "MB", "GB"];
//   const i = Math.floor(Math.log(bytes) / Math.log(k));
//   return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
// };

// const formatLastUpdated = (date: Date): string => {
//   return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
// };

// const formatDeadline = (date: Date): string => {
//   const now = new Date();
//   const diffInDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
//   if (diffInDays <= 0) return "Due today";
//   if (diffInDays === 1) return "Due tomorrow";
//   return `${diffInDays} days left`;
// };

// const getPriorityColor = (priority: string): string => {
//   switch (priority) {
//     case "High": return "#ef4444";
//     case "Medium": return "#f59e0b";
//     case "Low": return "#10b981";
//     default: return "#6b7280";
//   }
// };

// const getTypeIcon = (type: string): string => {
//   switch (type) {
//     case "Budget": return "💰";
//     case "Policy": return "📋";
//     case "Infrastructure": return "🏗️";
//     case "Community": return "👥";
//     case "Research": return "🔬";
//     default: return "📄";
//   }
// };

// const getFileIcon = (type: string): string => {
//   if (type.includes("pdf")) return "📄";
//   if (type.includes("word") || type.includes("document")) return "📝";
//   if (type.includes("sheet") || type.includes("excel")) return "📊";
//   return "📄";
// };

// const Proposal = () => {
//   const navigate = useNavigate();
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   // Custom hooks

//   const [proposalState, updateProposalState] = useProposalState();
// const [uploadState, updateUploadState, resetUploadState] = useUploadState();
// const [filters, updateFilters] = useFilterState();

//   // Additional state
//   const [completedRFPs, setCompletedRFPs] = useState<CompletedRFP[]>([]);
//   const [projectMetadata, setProjectMetadata] = useState<ProjectMetadata | null>(null);
//   const [isMetadataVisible, setIsMetadataVisible] = useState(false);

//   // Memoized computations
//   const filteredRFPs = useMemo(() => {
//     return completedRFPs.filter((rfp) => {
//       const matchesSearch = rfp.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
//         rfp.id.toLowerCase().includes(filters.searchTerm.toLowerCase());
//       const matchesStatus = filters.statusFilter === "all" || rfp.status === filters.statusFilter;
//       const matchesType = filters.typeFilter === "all" || rfp.type === filters.typeFilter;
//       const matchesPriority = filters.priorityFilter === "all" || rfp.priority === filters.priorityFilter;
//       return matchesSearch && matchesStatus && matchesType && matchesPriority;
//     });
//   }, [completedRFPs, filters.searchTerm, filters.statusFilter, filters.typeFilter, filters.priorityFilter]);

//   const getStatusMessage = useCallback(() => {
//     if (proposalState.isLoading) return "Loading...";
//     if (proposalState.ongoingCount > 0) {
//       return `+${Math.floor(Math.random() * 15)}% from last month`;
//     }
//     return "No active proposals";
//   }, [proposalState.isLoading, proposalState.ongoingCount]);

//   // Data fetching
//   const fetchProposals = useCallback(async () => {
//     updateProposalState({ isLoading: true });
//     try {
//       const res = await proposalApi.getAll();
//       const combinedProposals = [...((res as { data: ProposalItem[] }).data || []), ...SAMPLE_PROPOSALS];
      
//       const initial: Record<string, number> = {};
//       combinedProposals.forEach((p, idx) => {
//         initial[p.id] = idx % 3 === 0 ? Math.floor(Math.random() * 70) : 100;
//       });
      
//       updateProposalState({
//         ongoingCount: combinedProposals.length,
//         currentlyGenerating: combinedProposals[0] || null,
//         nextInQueue: combinedProposals[1] || null,
//         proposalProgress: initial,
//         lastUpdated: new Date(),
//         isLoading: false
//       });
//     } catch (error) {
//       console.error("Error fetching proposals:", error);
      
//       // Fallback to sample data
//       const initial: Record<string, number> = {};
//       SAMPLE_PROPOSALS.forEach((p, idx) => {
//         initial[p.id] = idx % 3 === 0 ? Math.floor(Math.random() * 70) : 100;
//       });
      
//       updateProposalState({
//         ongoingCount: SAMPLE_PROPOSALS.length,
//         currentlyGenerating: SAMPLE_PROPOSALS[0],
//         nextInQueue: SAMPLE_PROPOSALS[1],
//         proposalProgress: initial,
//         lastUpdated: new Date(),
//         isLoading: false
//       });
//     }
//   }, [updateProposalState]);

//   const fetchCompletedRFPs = useCallback(async () => {
//     try {
//       const res = await proposalApi.getAll();
//       const combinedData = [...((res as { data: CompletedRFP[] }).data || []), ...SAMPLE_RFPS];
//       setCompletedRFPs(combinedData);
//     } catch (error) {
//       console.error("Error fetching RFP responses:", error);
//       setCompletedRFPs(SAMPLE_RFPS);
//     }
//   }, []);

//   // File upload handlers
//   const handleDragOver = useCallback((e: React.DragEvent) => {
//     e.preventDefault();
//     updateUploadState({ isDragOver: true });
//   }, [updateUploadState]);

//   const handleDragLeave = useCallback((e: React.DragEvent) => {
//     e.preventDefault();
//     updateUploadState({ isDragOver: false });
//   }, [updateUploadState]);

//   const handleDrop = useCallback((e: React.DragEvent) => {
//     e.preventDefault();
//     updateUploadState({ isDragOver: false });
//     const files = Array.from(e.dataTransfer.files);
//     handleFileSelection(files);
//   }, [updateUploadState]);

//   const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
//     const files = Array.from(e.target.files || []);
//     handleFileSelection(files);
//   }, []);

//   const handleFileSelection = useCallback((files: File[]) => {
//     if (files.length === 0) return;
    
//     updateUploadState({
//       uploadError: null,
//       uploadSuccess: null
//     });
    
//     const selectedFile = files[0];
    
//     if (!ALLOWED_FILE_TYPES.includes(selectedFile.type)) {
//       updateUploadState({ uploadError: 'Please upload a PDF, Word document, or Excel file.' });
//       return;
//     }

//     const uploadedFile: UploadedFile = {
//       id: `file-${Date.now()}`,
//       name: selectedFile.name,
//       size: selectedFile.size,
//       type: selectedFile.type,
//       file: selectedFile,
//       source: "local",
//       uploadedAt: new Date(),
//     };

//     updateUploadState({
//       uploadedFiles: [uploadedFile],
//       uploadForm: {
//         ...uploadState.uploadForm,
//         file: selectedFile,
//         title: uploadState.uploadForm.title || selectedFile.name.replace(/\.[^/.]+$/, "")
//       }
//     });

//     if (fileInputRef.current) {
//       fileInputRef.current.value = "";
//     }
//   }, [updateUploadState, uploadState.uploadForm]);

//   const handleFormSubmit = useCallback(async () => {
//     if (!uploadState.uploadForm.file || !uploadState.uploadForm.title.trim()) {
//       updateUploadState({ uploadError: 'Please provide both a title and select a file.' });
//       return;
//     }

//     updateUploadState({
//       isUploading: true,
//       uploadProgress: 0,
//       uploadError: null,
//       uploadSuccess: null
//     });

//     try {
//       // Create a properly structured payload
//       const payload = {
//         title: uploadState.uploadForm.title.trim(),
//         description: uploadState.uploadForm.description.trim() || '',
//         file: uploadState.uploadForm.file,
//         // Only include projectMetadata if it exists
//         ...(projectMetadata ? { projectMetadata } : {})
//       };

//       // Simulate progress
//       const progressInterval = setInterval(() => {
//         updateUploadState(prev => ({
//           ...prev,
//           uploadProgress: prev.uploadProgress >= 90 ? prev.uploadProgress : prev.uploadProgress + Math.random() * 20
//         }));
//       }, 200);

//       // Make the API call
//       const response = await rfpProjectApi.create(payload);
      
//       clearInterval(progressInterval);
//       updateUploadState({ uploadProgress: 100 });
      
//       // Update success message with response data if available
//       updateUploadState({ 
//         uploadSuccess: `Successfully uploaded "${uploadState.uploadForm.title}"${response?.id ? ` (ID: ${response.id})` : ''}` 
//       });
      
//       // Refresh the proposals list
//       fetchProposals();
//       fetchCompletedRFPs();
      
//       setTimeout(() => {
//         resetUploadState();
//       }, 3000);

//     } catch (error) {
//       console.error("Upload error:", error);
//       updateUploadState({ 
//         uploadError: error instanceof Error ? error.message : 'Upload failed. Please try again.' 
//       });
//     } finally {
//       updateUploadState({ isUploading: false });
//     }
//   }, [uploadState.uploadForm, projectMetadata, updateUploadState, resetUploadState, fetchProposals, fetchCompletedRFPs]);

//   // Event handlers
//   const handleLocalFileClick = useCallback(() => {
//     if (!uploadState.isUploading) {
//       fileInputRef.current?.click();
//     }
//   }, [uploadState.isUploading]);

//   const removeFile = useCallback(() => {
//     updateUploadState({
//       uploadedFiles: [],
//       uploadForm: { ...uploadState.uploadForm, file: null },
//       uploadError: null,
//       uploadSuccess: null
//     });
//   }, [updateUploadState, uploadState.uploadForm]);

//   const handleMetadataSubmit = useCallback((metadata: ProjectMetadata) => {
//     // Validate required metadata fields
//     if (!metadata.projectName || !metadata.department || !metadata.priority) {
//       alert('Please fill in all required metadata fields');
//       return;
//     }
    
//     setProjectMetadata(metadata);
//     updateUploadState({
//       uploadForm: {
//         ...uploadState.uploadForm,
//         description: uploadState.uploadForm.description || metadata.description
//       }
//     });
    
//     // Close the metadata dialog
//     setIsMetadataVisible(false);
//   }, [updateUploadState, uploadState.uploadForm]);

//   const handleRFPView = useCallback((rfpId: string) => {
//     navigate(`/response/${rfpId}`);
//   }, [navigate]);

//   // Effects
//   useEffect(() => {
//     fetchProposals();
//     fetchCompletedRFPs();
//   }, [fetchProposals, fetchCompletedRFPs]);

//   useEffect(() => {
//     if (proposalState.currentlyGenerating && !proposalState.isLoading) {
//       const progressInterval = setInterval(() => {
//         updateProposalState(prev => {
//           if (prev.generationProgress >= 100) {
//             const newProgress = {
//               ...prev.proposalProgress,
//               [proposalState.currentlyGenerating!.id]: 100,
//             };
//             return { ...prev, proposalProgress: newProgress, generationProgress: 0 };
//           }
//           return { ...prev, generationProgress: prev.generationProgress + Math.random() * 15 };
//         });
//       }, 2000);
//       return () => clearInterval(progressInterval);
//     }
//   }, [proposalState.currentlyGenerating, proposalState.isLoading, updateProposalState]);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       updateProposalState({ lastUpdated: new Date() });
//     }, 30000);
//     return () => clearInterval(interval);
//   }, [updateProposalState]);

//   return (
//     <div className="proposal-container">
//       <Sidebar />
//       <div className="proposal-content">
//         <div className="container1">
//           <main className="proposal-main">
//             <h1 className="proposal-title">PROPOSAL</h1>

//             {/* First row of boxes */}
//             <div className="proposal-boxes">
//               {/* Box 1: Ongoing Proposals */}
//               <div
//                 className={`proposal-box ongoing-proposals-box ${proposalState.ongoingCount > 0 ? "pulse" : ""} ${proposalState.isLoading ? "loading" : ""}`}
//                 onClick={() => console.log("Navigate to ongoing proposals details")}
//                 role="button"
//                 tabIndex={0}
//                 onKeyPress={(e) => {
//                   if (e.key === "Enter" || e.key === " ") {
//                     console.log("Navigate to ongoing proposals details");
//                   }
//                 }}
//                 aria-label={`${proposalState.ongoingCount} ongoing proposals. Click to view details.`}
//               >
//                 <div className="ongoing-proposals-content">
//                   <div className="proposal-label">Ongoing Proposals</div>
//                   <div className="proposal-number">{proposalState.isLoading ? "..." : proposalState.ongoingCount}</div>
//                   <div className="proposal-status">{getStatusMessage()}</div>
//                   {!proposalState.isLoading && (
//                     <div className="last-updated">
//                       Updated: {formatLastUpdated(proposalState.lastUpdated)}
//                     </div>
//                   )}
//                 </div>
//                 <div className="proposal-icon">📋</div>
//               </div>

//               {/* Box 2: Generation Queue */}
//               <div
//                 className={`proposal-box generation-queue-box ${proposalState.currentlyGenerating ? "active" : ""} ${proposalState.isLoading ? "loading" : ""}`}
//                 onClick={() => console.log("Navigate to generation queue details")}
//                 role="button"
//                 tabIndex={0}
//                 aria-label="Generation queue status. Click to view details."
//               >
//                 <div className="generation-queue-content">
//                   <div className="proposal-label">RFP Response Queue</div>

//                   {proposalState.isLoading ? (
//                     <div className="queue-loading">
//                       <div className="proposal-number">...</div>
//                       <div className="proposal-status">Loading queue...</div>
//                     </div>
//                   ) : (
//                     <>
//                       {proposalState.currentlyGenerating ? (
//                         <div className="currently-generating">
//                           <div className="generating-header">
//                             <span className="generating-icon">⚙️</span>
//                             <span className="generating-text">Generating</span>
//                           </div>
//                           <div className="proposal-item">
//                             <div className="proposal-info">
//                               <span className="proposal-id">{proposalState.currentlyGenerating.id}</span>
//                               <span
//                                 className="proposal-priority"
//                                 style={{ color: getPriorityColor(proposalState.currentlyGenerating.priority) }}
//                               >
//                                 {proposalState.currentlyGenerating.priority}
//                               </span>
//                             </div>
//                             <div className="proposal-title-small">{proposalState.currentlyGenerating.title}</div>
//                             <div className="progress-container">
//                               <div className="progress-bar">
//                                 <div
//                                   className="progress-fill"
//                                   style={{ width: `${Math.min(proposalState.generationProgress, 100)}%` }}
//                                 ></div>
//                               </div>
//                               <span className="progress-text">
//                                 {Math.round(Math.min(proposalState.generationProgress, 100))}%
//                               </span>
//                             </div>
//                           </div>
//                         </div>
//                       ) : (
//                         <div className="no-generation">
//                           <div className="proposal-number">0</div>
//                           <div className="proposal-status">No active generation</div>
//                         </div>
//                       )}

//                       {proposalState.nextInQueue && (
//                         <div className="next-in-queue">
//                           <div className="queue-header">
//                             <span className="queue-icon">⏳</span>
//                             <span className="queue-text">Next: {proposalState.nextInQueue.id}</span>
//                           </div>
//                           <div className="next-proposal-info">
//                             <span className="next-proposal-type">
//                               {getTypeIcon(proposalState.nextInQueue.type)} {proposalState.nextInQueue.type}
//                             </span>
//                             <span className="next-proposal-time">~{proposalState.nextInQueue.estimatedTime}</span>
//                           </div>
//                         </div>
//                       )}
//                     </>
//                   )}
//                 </div>
//                 <div className="proposal-icon1">{proposalState.currentlyGenerating ? "⚡" : ""}</div>
//               </div>

//               {/* Box 3: Enhanced Upload Center */}
//               <div
//                 className={`proposal-box upload-box ${uploadState.isDragOver ? "drag-over" : ""} ${uploadState.isUploading ? "uploading" : ""}`}
//                 onDragOver={handleDragOver}
//                 onDragLeave={handleDragLeave}
//                 onDrop={handleDrop}
//                 onClick={!uploadState.isUploading ? handleLocalFileClick : undefined}
//                 role="button"
//                 tabIndex={0}
//                 onKeyPress={(e) => {
//                   if ((e.key === "Enter" || e.key === " ") && !uploadState.isUploading) {
//                     handleLocalFileClick();
//                   }
//                 }}
//                 aria-label="Upload RFP documents by clicking or dragging and dropping"
//               >
//                 <input
//                   type="file"
//                   ref={fileInputRef}
//                   onChange={handleFileInputChange}
//                   accept=".pdf,.doc,.docx,.xls,.xlsx"
//                   style={{ display: "none" }}
//                 />

//                 <div className="upload-content">
//                   <div className="proposal-label">RFP Document Upload</div>

//                   {/* Upload Form Fields */}
//                   {uploadState.uploadedFiles.length > 0 && !uploadState.isUploading && (
//                     <div className="upload-form-fields">
//                       <div className="form-field">
//                         <input
//                           type="text"
//                           placeholder="Enter project title..."
//                           value={uploadState.uploadForm.title}
//                           onChange={(e) => updateUploadState({
//                             uploadForm: { ...uploadState.uploadForm, title: e.target.value }
//                           })}
//                           className="upload-input-field"
//                           onClick={(e) => e.stopPropagation()}
//                         />
//                       </div>
//                       <div className="form-field">
//                         <textarea
//                           placeholder="Project description (optional)..."
//                           value={uploadState.uploadForm.description}
//                           onChange={(e) => updateUploadState({
//                             uploadForm: { ...uploadState.uploadForm, description: e.target.value }
//                           })}
//                           className="upload-textarea-field"
//                           rows={2}
//                           onClick={(e) => e.stopPropagation()}
//                         />
//                       </div>
//                     </div>
//                   )}

//                   {/* Upload Progress */}
//                   {uploadState.isUploading ? (
//                     <div className="upload-progress-section">
//                       <div className="upload-spinner">⚡</div>
//                       <div className="upload-status">Uploading to server...</div>
//                       <div className="upload-progress-bar">
//                         <div
//                           className="upload-progress-fill"
//                           style={{ width: `${uploadState.uploadProgress}%` }}
//                         ></div>
//                       </div>
//                       <div className="upload-progress-text">{Math.round(uploadState.uploadProgress)}%</div>
//                     </div>
//                   ) : (
//                     <>
//                       {uploadState.uploadedFiles.length === 0 ? (
//                         <div className="upload-empty">
//                           <div className="upload-icon">📁</div>
//                           <div className="upload-text">
//                             <div className="upload-primary">Drop RFP document here</div>
//                             <div className="upload-secondary">or click to browse</div>
//                           </div>
//                           <div className="supported-formats">
//                             <small>Supports PDF, Word, Excel files</small>
//                           </div>
//                         </div>
//                       ) : (
//                         <div className="uploaded-files">
//                           <div className="files-count">
//                             Ready to upload: {uploadState.uploadForm.title || 'Untitled Project'}
//                           </div>
                          
//                           {/* File Display */}
//                           <div className="files-list">
//                             {uploadState.uploadedFiles.map((file) => (
//                               <div key={file.id} className="file-item">
//                                 <div className="file-info">
//                                   <span className="file-icon">{getFileIcon(file.type)}</span>
//                                   <div className="file-details">
//                                     <div className="file-name">{file.name}</div>
//                                     <div className="file-meta">
//                                       <span className="file-size">{formatFileSize(file.size)}</span>
//                                       <span className="file-source">📂 Local</span>
//                                     </div>
//                                   </div>
//                                 </div>
//                                 <button
//                                   className="file-remove"
//                                   onClick={(e) => {
//                                     e.stopPropagation();
//                                     removeFile();
//                                   }}
//                                   aria-label={`Remove ${file.name}`}
//                                 >
//                                   ✕
//                                 </button>
//                               </div>
//                             ))}
//                           </div>

//                           {/* Submit and Metadata Actions */}
//                           <div className="upload-actions">
//                             <button
//                               className="upload-submit-btn"
//                               onClick={(e) => {
//                                 e.stopPropagation();
//                                 handleFormSubmit();
//                               }}
//                               disabled={!uploadState.uploadForm.title.trim() || !uploadState.uploadForm.file}
//                               aria-label="Upload RFP document"
//                             >
//                               <span className="btn-icon">🚀</span>
//                               Submit RFP
//                             </button>
                            
//                             <button
//                               className="metadata-button"
//                               onClick={(e) => {
//                                 e.stopPropagation();
//                                 setIsMetadataVisible(true);
//                               }}
//                               aria-label="Add project metadata"
//                             >
//                               <span className="metadata-icon">📝</span>
//                               Add Details
//                             </button>
//                           </div>

//                           {/* Project metadata status */}
//                           {projectMetadata && (
//                             <div className="metadata-status">
//                               <span className="metadata-check">✓</span>
//                               <span className="metadata-text">{projectMetadata.projectName}</span>
//                             </div>
//                           )}
//                         </div>
//                       )}
//                     </>
//                   )}

//                   {/* Status Messages */}
//                   {uploadState.uploadError && (
//                     <div className="upload-error-message">
//                       <span className="error-icon">⚠️</span>
//                       {uploadState.uploadError}
//                     </div>
//                   )}

//                   {uploadState.uploadSuccess && (
//                     <div className="upload-success-message">
//                       <span className="success-icon">✅</span>
//                       {uploadState.uploadSuccess}
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>

//             {/* Second row of boxes */}
//             <div className="proposal-boxes-row-2">
//               {/* Box 4 - RFP Responses */}
//               <div className="proposal-box rfp-responses-box">
//                 <div className="rfp-responses-header">
//                   <h3 className="rfp-responses-title">
//                     📄 RFP Responses
//                     <span className="rfp-count-badge">{filteredRFPs.length}</span>
//                   </h3>
//                 </div>

//                 <div className="rfp-search-section">
//                   <div className="rfp-search-bar">
//                     <span className="rfp-search-icon">🔍</span>
//                     <input
//                       type="text"
//                       className="rfp-search-input"
//                       placeholder="Search RFPs by title or ID..."
//                       value={filters.searchTerm}
//                       onChange={(e) => updateFilters({ searchTerm: e.target.value })}
//                     />
//                   </div>

//                   <div className="rfp-filters">
//                     <select
//                       className="rfp-filter-select"
//                       value={filters.statusFilter}
//                       onChange={(e) => updateFilters({ statusFilter: e.target.value as any })}
//                     >
//                       <option value="all">Status</option>
//                       <option value="completed">Completed</option>
//                       <option value="reviewed">Reviewed</option>
//                       <option value="pending">Pending</option>
//                     </select>

//                     <select
//                       className="rfp-filter-select"
//                       value={filters.typeFilter}
//                       onChange={(e) => updateFilters({ typeFilter: e.target.value as any })}
//                     >
//                       <option value="all">Type</option>
//                       <option value="Budget">Budget</option>
//                       <option value="Policy">Policy</option>
//                       <option value="Infrastructure">Infrastructure</option>
//                       <option value="Community">Community</option>
//                       <option value="Research">Research</option>
//                     </select>

//                     <select
//                       className="rfp-filter-select"
//                       value={filters.priorityFilter}
//                       onChange={(e) => updateFilters({ priorityFilter: e.target.value as any })}
//                     >
//                       <option value="all">Priority</option>
//                       <option value="High">High</option>
//                       <option value="Medium">Medium</option>
//                       <option value="Low">Low</option>
//                     </select>
//                   </div>
//                 </div>

//                 <div className="rfp-responses-content">
//                   <div className="rfp-responses-list">
//                     {filteredRFPs.length > 0 ? (
//                       filteredRFPs.map((rfp) => (
//                         <div
//                           key={rfp.id}
//                           className={`rfp-response-item ${rfp.status}`}
//                           onClick={() => handleRFPView(rfp.id)}
//                         >
//                           <div className="rfp-item-header">
//                             <span className="rfp-item-id">{rfp.id}</span>
//                             <div className="rfp-item-status">
//                               <div className={`rfp-status-indicator ${rfp.status}`}></div>
//                               <span className={`rfp-status-text ${rfp.status}`}>{rfp.status}</span>
//                             </div>
//                           </div>

//                           <div className="rfp-item-details">
//                             <h4 className="rfp-item-title">{rfp.title}</h4>

//                             <div className="rfp-item-meta">
//                               <div className="rfp-item-type">
//                                 <span className="rfp-type-icon">{getTypeIcon(rfp.type)}</span>
//                                 <span>{rfp.type}</span>
//                                 <span style={{ color: getPriorityColor(rfp.priority) }}>
//                                   • {rfp.priority}
//                                 </span>
//                               </div>
//                               <div className="rfp-item-time">
//                                 <span className="rfp-time-icon">⏰</span>
//                                 <span>{formatDeadline(rfp.submissionDeadline)}</span>
//                               </div>
//                             </div>

//                             <div className="rfp-item-actions">
//                               <button
//                                 className="rfp-action-btn primary"
//                                 onClick={(e) => {
//                                   e.stopPropagation();
//                                   handleRFPView(rfp.id);
//                                 }}
//                               >
//                                 <span>👁️</span> View
//                               </button>
//                             </div>
//                           </div>
//                         </div>
//                       ))
//                     ) : (
//                       <div className="rfp-empty-state">
//                         <div className="rfp-empty-icon">🔭</div>
//                         <h4 className="rfp-empty-title">No RFP responses found</h4>
//                         <p className="rfp-empty-text">
//                           {filters.searchTerm ||
//                           filters.statusFilter !== "all" ||
//                           filters.typeFilter !== "all" ||
//                           filters.priorityFilter !== "all"
//                             ? "Try adjusting your search or filters"
//                             : "Generated RFP responses will appear here"}
//                         </p>
//                       </div>
//                     )}
//                   </div>
//                 </div>

//                 <div className="rfp-responses-footer">
//                   <a href="#" className="rfp-view-all">
//                     View all responses <span>→</span>
//                   </a>
//                   <span className="rfp-last-updated">
//                     Updated: {formatLastUpdated(proposalState.lastUpdated)}
//                   </span>
//                 </div>
//               </div>

//               {/* Box 5 - Proposal Library */}
//               <div className="proposal5-box">
//                 <div className="proposal5-header">
//                   <span className="proposal5-title">Proposal Library</span>
//                   <div className="proposal5-filters">
//                     <input
//                       type="text"
//                       placeholder="Search..."
//                       value={filters.libSearch}
//                       onChange={(e) => updateFilters({ libSearch: e.target.value })}
//                     />
//                     <select
//                       value={filters.libStatusFilter}
//                       onChange={(e) => updateFilters({ libStatusFilter: e.target.value as any })}
//                     >
//                       <option value="all">All Statuses</option>
//                       <option value="in-progress">In Progress</option>
//                       <option value="completed">Completed</option>
//                     </select>
//                     <select
//                       value={filters.libTypeFilter}
//                       onChange={(e) => updateFilters({ libTypeFilter: e.target.value as any })}
//                     >
//                       <option value="all">All Types</option>
//                       <option value="Budget">Budget</option>
//                       <option value="Policy">Policy</option>
//                       <option value="Infrastructure">Infrastructure</option>
//                       <option value="Community">Community</option>
//                       <option value="Research">Research</option>
//                     </select>
//                   </div>
//                 </div>

//                 <div className="proposal5-list">
//                   {Object.keys(proposalState.proposalProgress)
//                     .filter((id) => {
//                       const progress = proposalState.proposalProgress[id] ?? 0;
//                       const status = progress >= 100 ? "completed" : "in-progress";
//                       const matchesSearch = id.toLowerCase().includes(filters.libSearch.toLowerCase());
//                       const matchesStatus = filters.libStatusFilter === "all" || status === filters.libStatusFilter;
//                       return matchesSearch && matchesStatus;
//                     })
//                     .map((id) => (
//                     <div key={id} className="proposal5-card">
//                       <div className="proposal5-card-header">
//                         <span className="proposal5-id">{id}</span>
//                         <div className="proposal5-status">
//                           <div
//                             className="proposal5-status-indicator"
//                             style={{
//                               backgroundColor:
//                                 proposalState.proposalProgress[id] >= 100 ? "#10b981" : "#f59e0b",
//                             }}
//                           ></div>
//                           {proposalState.proposalProgress[id] >= 100 ? "completed" : "in-progress"}
//                         </div>
//                       </div>
//                       <div>Sample Proposal Title</div>
//                       {proposalState.proposalProgress[id] < 100 ? (
//                         <div className="proposal5-progress-container">
//                           <div
//                             className="proposal5-progress-fill"
//                             style={{ width: `${proposalState.proposalProgress[id]}%` }}
//                           ></div>
//                         </div>
//                       ) : (
//                         <div className="proposal5-actions">
//                           <button
//                             className="proposal5-btn view"
//                             onClick={() => window.open(`/proposals/${id}.pdf`, "_blank")}
//                           >
//                             View
//                           </button>
//                           <button
//                             className="proposal5-btn download"
//                             onClick={() => {
//                               const link = document.createElement("a");
//                               link.href = `/proposals/${id}.pdf`;
//                               link.download = `${id}.pdf`;
//                               link.click();
//                             }}
//                           >
//                             Download
//                           </button>
//                         </div>
//                       )}
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           </main>
//         </div>
//       </div>

//       {/* Metadata Modal */}
//       <Metadata
//         isVisible={isMetadataVisible}
//         onClose={() => setIsMetadataVisible(false)}
//         onSubmit={handleMetadataSubmit}
//         uploadedFiles={uploadState.uploadedFiles}
//       />
//     </div>
//   );
// };

// export default Proposal;