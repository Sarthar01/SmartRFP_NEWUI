// src/pages/TemplatesPage.tsx
import React, { useEffect, useState } from "react";
import Sidebar from "../components/sidebar";
import {
  getRfpProjects,
  getRfpProjectDetails,
  deleteRfpProject,
  startCompleteProcessing,
  getRfpProcessingStatus,
  updateRfpProject,
  getRfpFileDownloadUrl,
  cancelRfpProcessing,
  getRfpQueueOverview,
  downloadProposalFile,
} from "../services/api1";
import type { RfpProject } from "../services/api1";
import "../style/TemplatesPage.css";
import { FaEye, FaTrash, FaFileAlt, FaTimes, FaDownload } from "react-icons/fa";

const TemplatesPage: React.FC = () => {
  const [projects, setProjects] = useState<RfpProject[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProject, setSelectedProject] = useState<RfpProject | null>(null);
  const [activeTab, setActiveTab] = useState("info");
  const [statusFilter, setStatusFilter] = useState<"all" | "completed" | "draft" | "failed">("all");
  const [processingStatus, setProcessingStatus] = useState<string | null>(null);
  const [queueOverview, setQueueOverview] = useState<any>(null);

  const filteredProjects = projects.filter((p) => {
    if (statusFilter === "all") return true;
    return p.status.toLowerCase() === statusFilter;
  });

  const token = localStorage.getItem("token") || "";

  // Fetch projects
  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const res = await getRfpProjects(token, 1, 20);
        setProjects(res.projects);
      } catch (err) {
        console.error("Failed to fetch projects", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [token]);
  const handleUpdateProject = async (updates: { title?: string; description?: string }) => {
    if (!selectedProject) return;
    try {
      const updated = await updateRfpProject(selectedProject.id, updates, token);
      setSelectedProject(updated);
      setProjects(prev => prev.map(p => (p.id === updated.id ? updated : p)));
      alert("Project updated successfully!");
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  const handleProposalDownload = async (projectId: number, format: "pdf" | "docx") => {
    try {
      await downloadProposalFile(projectId, format, token);
    } catch {
      alert("Failed to download proposal. Please try again.");
    }
  };

  const fetchQueueOverview = async () => {
    try {
      const overview = await getRfpQueueOverview(token);
      setQueueOverview(overview);
    } catch (err) {
      console.error("Failed to fetch queue overview", err);
    }
  };

  // Call once on mount
  useEffect(() => {
    fetchQueueOverview();
  }, [token]);

  const handleDownload = async () => {
    if (!selectedProject) return;
    try {
      const res = await getRfpFileDownloadUrl(selectedProject.id, token);
      window.open(res.download_url, "_blank");
    } catch (err) {
      console.error("Download failed", err);
    }
  };
  const handleCancelProcessing = async () => {
    if (!selectedProject) return;
    try {
      const res = await cancelRfpProcessing(selectedProject.id, token);
      alert(res.message);
      setProcessingStatus("Processing cancelled");
      setSelectedProject(prev => prev ? { ...prev, status: "draft" } : null);
    } catch (err) {
      console.error("Cancel failed", err);
    }
  };
  const handleRetryProcessing = async () => {
    if (!selectedProject) return;

    const projectId = selectedProject.id; // capture id to avoid closure issues

    try {
      // Start a fresh processing run (acts as a retry fallback)
      const startRes = await startCompleteProcessing(projectId, token);

      alert(startRes.message || "Processing started");

      setProcessingStatus(`${startRes.status ?? "queued"} - ${startRes.message ?? ""}`);

      // Update local status to queued so UI reflects change immediately
      setSelectedProject(prev => (prev ? { ...prev, status: "queued" } : prev));

      // Poll processing status every 5s (same logic as handleStartProcessing)
      const interval = window.setInterval(async () => {
        try {
          const statusRes = await getRfpProcessingStatus(projectId, token);
          setProcessingStatus(`${statusRes.status} - ${statusRes.progress}%`);

          if (statusRes.status === "completed" || statusRes.status === "failed") {
            window.clearInterval(interval);
            setProcessingStatus(`${statusRes.status} - Processing finished`);
            setSelectedProject(prev => (prev ? { ...prev, status: statusRes.status } : prev));
          }
        } catch (err) {
          console.error("Error fetching processing status", err);
          window.clearInterval(interval);
          setProcessingStatus("Error fetching processing status");
        }
      }, 5000);
    } catch (err) {
      console.error("Retry -> start fallback failed", err);
      setProcessingStatus("Retry failed (start fallback)");
    }
  };


  const handleStartProcessing = async () => {
    if (!selectedProject) return;

    try {
      const startRes = await startCompleteProcessing(selectedProject.id, token);
      setProcessingStatus(`${startRes.status} - ${startRes.message}`);

      // Start polling the processing status every 5 seconds
      const interval = setInterval(async () => {
        try {
          const statusRes = await getRfpProcessingStatus(selectedProject.id, token);
          setProcessingStatus(`${statusRes.status} - ${statusRes.progress}%`);

          // If completed or failed, stop polling
          if (statusRes.status === "completed" || statusRes.status === "failed") {
            clearInterval(interval);
            setProcessingStatus(`${statusRes.status} - Processing finished`);
            // Optionally update selectedProject status
            setSelectedProject(prev => prev ? { ...prev, status: statusRes.status } : prev);
          }
        } catch (err) {
          console.error("Error fetching processing status", err);
          clearInterval(interval);
          setProcessingStatus("Error fetching processing status");
        }
      }, 5000); // 5 seconds interval

    } catch (err) {
      console.error("Error starting processing", err);
      setProcessingStatus("Error starting processing");
    }
  };

  // Delete project
  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    try {
      await deleteRfpProject(id, token);
      setProjects(projects.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  // Open details
  const handleViewDetails = async (id: number) => {
    try {
      const details = await getRfpProjectDetails(id, token);
      setSelectedProject(details);
      setActiveTab("info");
    } catch (err) {
      console.error("Failed to load details", err);
    }
  };

  return (
    <div className="templates-page">
      <Sidebar />
      <div className="templates-content">
        <div className="page-header">
          <h2>📑 RFP Templates</h2>
          <p className="subtitle">Manage and review all your projects in one place</p>
        </div>

        {loading ? (
          <p className="loading">Loading projects...</p>
        ) : projects.length === 0 ? (
          <div className="empty-state">
            <FaFileAlt size={48} />
            <p>No templates found. Start by uploading an RFP!</p>
          </div>
        ) : (
          <>
            {/* Filter Buttons */}
            <div className="filter-container">
              <button
                className={statusFilter === "all" ? "active" : ""}
                onClick={() => setStatusFilter("all")}
              >
                All
              </button>
              <button
                className={statusFilter === "completed" ? "active" : ""}
                onClick={() => setStatusFilter("completed")}
              >
                Completed
              </button>
              <button
                className={statusFilter === "draft" ? "active" : ""}
                onClick={() => setStatusFilter("draft")}
              >
                Draft
              </button>
              <button
                className={statusFilter === "failed" ? "active" : ""}
                onClick={() => setStatusFilter("failed")}
              >
                Failed
              </button>
            </div>

            {/* Projects Grid */}
            <div className="projects-grid">
              {filteredProjects.map((p) => (
                <div key={p.id} className="project-card">
                  <div className="project-header">
                    <h3>{p.title}</h3>
                    <span className={`status-badge ${p.status.toLowerCase()}`}>{p.status}</span>
                  </div>
                  <p className="created-by">Created by: {p.created_by_name}</p>
                  <div className="card-actions">
                    <button className="view-btn" onClick={() => handleViewDetails(p.id)}>
                      <FaEye /> View
                    </button>
                    <button className="delete-btn" onClick={() => handleDelete(p.id)}>
                      <FaTrash /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Details Modal */}
        {selectedProject && (
          <div className="modal-overlay" onClick={() => setSelectedProject(null)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>{selectedProject.title}</h3>
                <button className="close-btn" onClick={() => {
                  setSelectedProject(null);
                  setProcessingStatus(null);
                }}>
                  <FaTimes size={18} />
                </button>
              </div>

              <div className="modal-body">
                {/* Sidebar tabs */}
                <div className="modal-tabs">
                  {["info", "requirements", "document", "proposal"].map((tab) => (
                    <button
                      key={tab}
                      className={activeTab === tab ? "active" : ""}
                      onClick={() => setActiveTab(tab)}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>

                {/* Right panel content */}
                <div className="modal-content">
                  {activeTab === "info" && (
                    <div>
                      <p><strong>Status:</strong> {selectedProject.status}</p>
                      <p><strong>Description:</strong> {selectedProject.description}</p>
                      <p><strong>Priority:</strong> {selectedProject.priority}</p>
                      <p><strong>Created:</strong> {new Date(selectedProject.created_at).toLocaleString()}</p>

                      {/* Buttons depending on status */}
                      {selectedProject.status === "draft" && (
                        <>
                          <button className="start-processing-btn" onClick={handleStartProcessing}>
                            🚀 Start Processing
                          </button>
                          <button
                            className="update-project-btn"
                            onClick={() => {
                              const newTitle = prompt("Enter new title:", selectedProject.title);
                              const newDesc = prompt("Enter new description:", selectedProject.description);
                              if (newTitle !== null || newDesc !== null) {
                                handleUpdateProject({ title: newTitle || undefined, description: newDesc || undefined });
                              }
                            }}
                          >
                            ✏️ Update Project
                          </button>
                        </>
                      )}

                      {(selectedProject.status === "processing" || selectedProject.status === "queued") && (
                        <button className="cancel-processing-btn" onClick={handleCancelProcessing}>
                          ❌ Cancel Processing
                        </button>
                      )}

                      {selectedProject.status === "failed" && (
                        <button className="retry-processing-btn" onClick={handleRetryProcessing}>
                          🔁 Retry Processing
                        </button>
                      )}

                      {processingStatus && (
                        <p className="processing-response">
                          <strong>Processing:</strong> {processingStatus}
                        </p>
                      )}

                      {/* Queue Overview only in info tab */}
                      {activeTab === "info" && queueOverview && (
                        <div className="queue-overview">
                          <h4>Queue Overview</h4>
                          <p>Active: {queueOverview.active_tasks}</p>
                          <p>Pending: {queueOverview.pending_tasks}</p>
                          <p>Failed: {queueOverview.failed_tasks}</p>
                          <p>Completed Today: {queueOverview.completed_today}</p>
                        </div>
                      )}
                    </div>
                  )}




                  {activeTab === "requirements" && (
                    <div className="requirements-section">
                      {(() => {
                        try {
                          const parsed = typeof selectedProject.extracted_requirements === "string"
                            ? JSON.parse(selectedProject.extracted_requirements)
                            : selectedProject.extracted_requirements;

                          if (parsed?.requirements && parsed.requirements.length > 0) {
                            return parsed.requirements.map((req: string, i: number) => (
                              <div
                                key={i}
                                className="requirement-text"
                                dangerouslySetInnerHTML={{
                                  __html: req
                                    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
                                    .replace(/^\* (.+)$/gm, "• $1")
                                    .replace(/\n/g, "<br/>"),
                                }}
                              />
                            ));
                          }
                          return <div className="requirement-text">{parsed || "No requirements extracted yet."}</div>;
                        } catch {
                          return <div className="requirement-text">{selectedProject.extracted_requirements || "No requirements extracted yet."}</div>;
                        }
                      })()}
                    </div>
                  )}
                  {selectedProject.status === "failed" && (
                    <button className="retry-processing-btn" onClick={handleRetryProcessing}>
                      🔁 Retry Processing
                    </button>
                  )}

                  {activeTab === "document" && (
                    <div className="document-section">
                      <p><strong>File:</strong> {selectedProject.original_filename}</p>
                      <p><strong>Size:</strong>{" "}{((selectedProject.file_size ?? 0) / 1024).toFixed(2)} KB</p>
                      {selectedProject.file_download_url ? (
                        <button className="download-btn" onClick={handleDownload}>
                          <FaDownload /> Download Document
                        </button>
                      ) : (
                        <p>No document available.</p>
                      )}
                    </div>
                  )}

                  {activeTab === "proposal" && (
                    <pre>  {selectedProject.generated_proposal ? (
                      <>
                        <div className="proposal-header">
                          <h4>Generated Proposal</h4>
                          <div className="proposal-download-buttons">
                            <button
                              className="download-btn"
                              onClick={() => handleProposalDownload(selectedProject.id, "pdf")}
                            >
                              <FaDownload /> Download PDF
                            </button>
                            <button
                              className="download-btn"
                              onClick={() => handleProposalDownload(selectedProject.id, "docx")}
                            >
                              <FaDownload /> Download DOCX
                            </button>
                          </div>
                        </div>

                        <pre className="generated">
                          {selectedProject.generated_proposal}
                        </pre>
                      </>
                    ) : (
                      <p>Proposal not generated yet.</p>
                    )}</pre>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplatesPage;
