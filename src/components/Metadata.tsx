import { useState, useEffect } from "react";
import '../style/Metadata.css';
import { createRfpProject } from "../services/api1";

interface MetadataFormProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (metadata: ProjectMetadata) => void;
  uploadedFiles: UploadedFile[];
  token: string;   
}

interface ProjectMetadata {
  projectName: string;
  budget: number;
  budgetCurrency: string;
  startDate: string;
  endDate: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  department: string;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  source: 'local' | 'google-drive';
  uploadedAt: Date;
    file: File;
}

const Metadata: React.FC<MetadataFormProps> = ({ 
  isVisible, 
  onClose, 
  onSubmit, 
  uploadedFiles,
  token
}) => {
  const [formData, setFormData] = useState<ProjectMetadata>({
    projectName: '',
    budget: 0,
    budgetCurrency: 'USD',
    startDate: '',
    endDate: '',
    description: '',
    priority: 'Medium',
    department: ''
  });

  const [errors, setErrors] = useState<Partial<ProjectMetadata>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set default dates when component mounts
  useEffect(() => {
    if (isVisible) {
      const today = new Date();
      const nextMonth = new Date(today);
      nextMonth.setMonth(today.getMonth() + 1);
      
      setFormData(prev => ({
        ...prev,
        startDate: today.toISOString().split('T')[0],
        endDate: nextMonth.toISOString().split('T')[0]
      }));
    }
  }, [isVisible]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'budget' ? parseFloat(value) || 0 : value
    }));

    // Clear error when user starts typing
    if (errors[name as keyof ProjectMetadata]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  // Check if form has been modified
  const isFormModified = () => {
    const initialState = {
      projectName: '',
      budget: 0,
      budgetCurrency: 'USD',
      startDate: '',
      endDate: '',
      description: '',
      priority: 'Medium' as const,
      department: ''
    };

    // Compare current form data with initial state (ignoring auto-set dates)
    return (
      formData.projectName !== initialState.projectName ||
      formData.budget !== initialState.budget ||
      formData.budgetCurrency !== initialState.budgetCurrency ||
      formData.description !== initialState.description ||
      formData.priority !== initialState.priority ||
      formData.department !== initialState.department ||
      // Only check dates if they were manually changed (not just auto-set)
      (formData.startDate && formData.startDate !== new Date().toISOString().split('T')[0]) ||
      (formData.endDate && formData.endDate !== new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0])
    );
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<ProjectMetadata> = {};

    if (!formData.projectName.trim()) {
      newErrors.projectName = 'Project name is required';
    }

    if (formData.budget <= 0) {
      newErrors.budget = 0;
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      newErrors.endDate = 'End date must be after start date';
    }

    if (!formData.department.trim()) {
      newErrors.department = 'Department is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!validateForm()) return;

  if (uploadedFiles.length === 0) {
    alert("Please upload a file before submitting.");
    return;
  }

  setIsSubmitting(true);

  try {
   const fileToUpload = uploadedFiles[0].file;
if (!fileToUpload) throw new Error("No file found for upload");

await createRfpProject(
  formData.projectName,
  formData.description,
  fileToUpload!,
  token,
  formData
);

    onSubmit(formData); // notify parent

    // Reset form
    setFormData({
      projectName: '',
      budget: 0,
      budgetCurrency: 'USD',
      startDate: '',
      endDate: '',
      description: '',
      priority: 'Medium',
      department: ''
    });

    onClose();
  } catch (error) {
    console.error('Error submitting project metadata:', error);
    alert('Failed to submit project metadata. Check console.');
  } finally {
    setIsSubmitting(false);
  }
};


  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  // Handle overlay click with confirmation
  const handleOverlayClick = () => {
    // Don't close if currently submitting
    if (isSubmitting) return;
    
    // Check if form has been modified
    if (isFormModified()) {
      const confirmed = window.confirm(
        'Are you sure you want to close? Any unsaved changes will be lost.'
      );
      if (confirmed) {
        handleClose();
      }
    } else {
      // If form is empty/unchanged, close without confirmation
      handleClose();
    }
  };

  // Handle close button click with confirmation
  const handleCloseButtonClick = () => {
    // Don't close if currently submitting
    if (isSubmitting) return;
    
    // Check if form has been modified
    if (isFormModified()) {
      const confirmed = window.confirm(
        'Are you sure you want to close? Any unsaved changes will be lost.'
      );
      if (confirmed) {
        handleClose();
      }
    } else {
      // If form is empty/unchanged, close without confirmation
      handleClose();
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return '📄';
    if (type.includes('word') || type.includes('document')) return '📝';
    if (type.includes('sheet') || type.includes('excel')) return '📊';
    if (type.includes('image')) return '🖼️';
    if (type.includes('video')) return '🎥';
    if (type.includes('audio')) return '🎵';
    return '📄';
  };

  if (!isVisible) return null;

  return (
    <div className="metadata-overlay" onClick={handleOverlayClick}>
      <div className="metadata-modal" onClick={(e) => e.stopPropagation()}>
        <div className="metadata-header">
          <h2 className="metadata-title">Project Metadata</h2>
          <button 
            className="metadata-close"
            onClick={handleCloseButtonClick}
            disabled={isSubmitting}
            aria-label="Close metadata form"
          >
            ✕
          </button>
        </div>

        {uploadedFiles.length > 0 && (
          <div className="uploaded-files-section">
            <h3 className="files-section-title">Uploaded Documents ({uploadedFiles.length})</h3>
            <div className="files-preview">
              {uploadedFiles.map(file => (
                <div key={file.id} className="file-preview-item">
                  <span className="file-preview-icon">{getFileIcon(file.type)}</span>
                  <div className="file-preview-info">
                    <div className="file-preview-name">{file.name}</div>
                    <div className="file-preview-size">{formatFileSize(file.size)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <form className="metadata-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            {/* Project Name */}
            <div className="form-group full-width">
              <label htmlFor="projectName" className="form-label">
                Project Name
              </label>
              <input
                type="text"
                id="projectName"
                name="projectName"
                value={formData.projectName}
                onChange={handleInputChange}
                className={`form-input ${errors.projectName ? 'error' : ''}`}
                placeholder="Enter project name"
                disabled={isSubmitting}
              />
              {errors.projectName && (
                <span className="error-message">{errors.projectName}</span>
              )}
            </div>

            {/* Budget */}
            <div className="form-group">
              <label htmlFor="budget" className="form-label">
                Budget *
              </label>
              <div className="budget-input-group">
                <select
                  name="budgetCurrency"
                  value={formData.budgetCurrency}
                  onChange={handleInputChange}
                  className="currency-select"
                  disabled={isSubmitting}
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="INR">INR</option>
                  <option value="JPY">JPY</option>
                </select>
                <input
                  type="number"
                  id="budget"
                  name="budget"
                  value={formData.budget || ''}
                  onChange={handleInputChange}
                  className={`form-input budget-input ${errors.budget ? 'error' : ''}`}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  disabled={isSubmitting}
                />
              </div>
              {errors.budget && (
                <span className="error-message">{errors.budget}</span>
              )}
            </div>

            {/* Priority */}
            <div className="form-group">
              <label htmlFor="priority" className="form-label">
                Priority
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="form-select"
                disabled={isSubmitting}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            {/* Start Date */}
            <div className="form-group">
              <label htmlFor="startDate" className="form-label">
                Start Date *
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                className={`form-input ${errors.startDate ? 'error' : ''}`}
                disabled={isSubmitting}
              />
              {errors.startDate && (
                <span className="error-message">{errors.startDate}</span>
              )}
            </div>

            {/* End Date */}
            <div className="form-group">
              <label htmlFor="endDate" className="form-label">
                End Date *
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                className={`form-input ${errors.endDate ? 'error' : ''}`}
                disabled={isSubmitting}
              />
              {errors.endDate && (
                <span className="error-message">{errors.endDate}</span>
              )}
            </div>

            {/* Department */}
            <div className="form-group">
              <label htmlFor="department" className="form-label">
                Department *
              </label>
              <input
                type="text"
                id="department"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                className={`form-input ${errors.department ? 'error' : ''}`}
                placeholder="e.g., Engineering, Marketing"
                disabled={isSubmitting}
              />
              {errors.department && (
                <span className="error-message">{errors.department}</span>
              )}
            </div>

            {/* Description */}
            <div className="form-group full-width">
              <label htmlFor="description" className="form-label">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="form-textarea"
                placeholder="Enter project description (optional)"
                rows={3}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={handleCloseButtonClick}
              className="btn-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
  type="submit"
  className="btn-primary btn-submit"
  disabled={isSubmitting}
  aria-busy={isSubmitting}
>
  {isSubmitting ? (
    <>
      <span className="loading-spinner" role="status" aria-live="polite">⚡</span>
      Saving Project...
    </>
  ) : (
    <>
      <span className="submit-icon">💾</span>
      Submit Project Metadata
    </>
  )}
</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Metadata;``