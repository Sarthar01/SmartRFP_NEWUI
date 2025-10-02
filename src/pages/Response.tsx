import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/sidebar';
import TemplateSelector from '../components/TemplateSelector';
import type { RFPTemplate } from '../components/TemplateSelector';
import TemplatePreview from '../components/TemplatePreview';
import '../style/Response.css';

interface ResponseItem {
  id: string;
  requirement: string;
  answer: string;
  reviewStatus: 'none' | 'approved' | 'partial' | 'rejected';
}

interface RFPData {
  id: string;
  title: string;
  description?: string;
  deadline?: string;
  responses: ResponseItem[];
}

const Response = () => {
  const { rfpId } = useParams<{ rfpId: string }>();
  const navigate = useNavigate();
  const [rfpData, setRfpData] = useState<RFPData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState<string | null>(null);
  const [openDropdowns, setOpenDropdowns] = useState<Set<string>>(new Set());
  const [selectedTemplate, setSelectedTemplate] = useState<RFPTemplate | null>(null);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showTemplatePreview, setShowTemplatePreview] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<RFPTemplate | null>(null);
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Load persisted data from memory (in a real app, this would be from localStorage or API)
  const loadPersistedData = (id: string): RFPData | null => {
    try {
      // In a real application, you would load from localStorage:
      // const saved = localStorage.getItem(getStorageKey(id));
      // return saved ? JSON.parse(saved) : null;
      
      // For now, we'll use a global variable to simulate persistence
      if ((window as any).rfpPersistedData && (window as any).rfpPersistedData[id]) {
        return (window as any).rfpPersistedData[id];
      }
      return null;
    } catch (error) {
      console.error('Error loading persisted data:', error);
      return null;
    }
  };

  // Save data to memory (in a real app, this would be to localStorage or API)
  const savePersistedData = (data: RFPData) => {
    try {
      // In a real application, you would save to localStorage:
      // localStorage.setItem(getStorageKey(data.id), JSON.stringify(data));
      
      // For now, we'll use a global variable to simulate persistence
      if (!(window as any).rfpPersistedData) {
        (window as any).rfpPersistedData = {};
      }
      (window as any).rfpPersistedData[data.id] = data;
    } catch (error) {
      console.error('Error saving persisted data:', error);
    }
  };

  // Enhanced mock RFP data with more professional content
  const getMockRFPData = (id: string): RFPData => {
    const rfpDataMap: { [key: string]: RFPData } = {
      'RFP001': {
        id: 'RFP001',
        title: 'Smart City IoT Infrastructure Implementation',
        description: 'Comprehensive IoT solution for urban infrastructure management',
        deadline: '2024-12-15',
        responses: [
          {
            id: 'resp1',
            requirement: 'Provide a comprehensive overview of the proposed IoT infrastructure for smart city implementation, including network architecture, sensor deployment strategy, and integration capabilities.',
            answer: 'Our proposed IoT infrastructure leverages a multi-tier architecture comprising edge devices, fog computing nodes, and cloud-based analytics. The solution includes 10,000+ sensors for traffic monitoring, environmental sensing, and infrastructure health monitoring, connected via a hybrid network of LoRaWAN, 5G, and fiber optics.',
            reviewStatus: 'none'
          },
          {
            id: 'resp2',
            requirement: 'Detail the security measures and protocols that will be implemented to protect citizen data and ensure system integrity.',
            answer: 'Implementation includes end-to-end AES-256 encryption, zero-trust network architecture, multi-factor authentication, blockchain-based data integrity verification, and compliance with GDPR, CCPA, and ISO 27001 standards. Regular penetration testing and 24/7 SOC monitoring included.',
            reviewStatus: 'none'
          },
          {
            id: 'resp3',
            requirement: 'Explain the scalability of the proposed solution and how it can accommodate future city growth and technology evolution.',
            answer: 'The solution utilizes containerized microservices architecture with auto-scaling capabilities, supporting horizontal scaling to 100,000+ devices. Cloud-native deployment ensures elastic resource allocation, while standardized APIs enable seamless integration of future technologies and third-party systems.',
            reviewStatus: 'none'
          },
          {
            id: 'resp4',
            requirement: 'Provide a detailed timeline for implementation phases, key milestones, and deliverables with risk mitigation strategies.',
            answer: 'Phase 1 (Months 1-4): Infrastructure planning, pilot deployment in 3 districts, stakeholder training. Phase 2 (Months 5-10): City-wide rollout, system integration, performance optimization. Phase 3 (Months 11-12): Advanced analytics deployment, final testing, project handover. Each phase includes risk assessment and contingency planning.',
            reviewStatus: 'none'
          },
          {
            id: 'resp5',
            requirement: 'Outline the maintenance and support structure, including SLA commitments, monitoring systems, and long-term sustainability plans.',
            answer: 'Comprehensive support includes 99.9% uptime SLA, 24/7 NOC monitoring, predictive maintenance using AI/ML algorithms, quarterly system updates, dedicated technical support team with <2-hour response time for critical issues, and 10-year technology refresh roadmap.',
            reviewStatus: 'none'
          }
        ]
      },
      'RFP002': {
        id: 'RFP002',
        title: 'Digital Transformation Strategy for Municipal Services',
        description: 'Modernization of government services and citizen engagement platforms',
        deadline: '2024-11-30',
        responses: [
          {
            id: 'resp1',
            requirement: 'Describe your approach to modernizing legacy municipal systems while ensuring minimal service disruption.',
            answer: 'Our phased modernization approach includes parallel system operation, gradual data migration, comprehensive staff training, and robust rollback procedures. We utilize API-first architecture, cloud-native solutions, and agile development methodologies to ensure seamless transition.',
            reviewStatus: 'none'
          },
          {
            id: 'resp2',
            requirement: 'Outline the citizen engagement platform features and accessibility compliance measures.',
            answer: 'Platform features include mobile-responsive web portal, native iOS/Android apps, multilingual support (15+ languages), AI-powered chatbots, document management, appointment scheduling, and payment processing. Full WCAG 2.1 AA compliance and accessibility testing included.',
            reviewStatus: 'none'
          },
          {
            id: 'resp3',
            requirement: 'Detail the data analytics and business intelligence capabilities for informed decision-making.',
            answer: 'Advanced analytics suite with real-time dashboards, predictive modeling, citizen sentiment analysis, service performance metrics, automated reporting, and machine learning insights. Integration with existing ERP systems and third-party data sources for comprehensive business intelligence.',
            reviewStatus: 'none'
          }
        ]
      },
      'RFP003': {
        id: 'RFP003',
        title: 'Sustainable Energy Management System',
        description: 'Renewable energy integration and smart grid optimization',
        deadline: '2025-01-20',
        responses: [
          {
            id: 'resp1',
            requirement: 'Explain your renewable energy integration strategy and grid optimization approach.',
            answer: 'Comprehensive strategy includes solar/wind farm integration, battery energy storage systems (BESS), demand response management, smart inverters, and grid stabilization technology. AI-driven optimization algorithms maximize renewable energy utilization while maintaining grid stability.',
            reviewStatus: 'none'
          },
          {
            id: 'resp2',
            requirement: 'Describe the energy monitoring, forecasting, and optimization features of your solution.',
            answer: 'Real-time energy consumption monitoring, weather-based generation forecasting, automated load balancing, peak shaving algorithms, predictive maintenance alerts, and dynamic pricing optimization. Machine learning models continuously improve accuracy and efficiency.',
            reviewStatus: 'none'
          },
          {
            id: 'resp3',
            requirement: 'Provide comprehensive cost-benefit analysis and ROI projections with sensitivity analysis.',
            answer: 'Projected 35% reduction in energy costs within 18 months, full ROI achieved in 4.2 years. Benefits include $2.3M annual savings, 45% carbon footprint reduction, improved grid reliability, and enhanced energy independence. Sensitivity analysis covers various scenarios and market conditions.',
            reviewStatus: 'none'
          }
        ]
      }
    };

    return rfpDataMap[id] || {
      id: id || 'UNKNOWN',
      title: 'RFP Not Found',
      description: 'The requested RFP could not be located',
      responses: [
        {
          id: 'resp1',
          requirement: 'This RFP ID was not found in the system. Please verify the correct RFP identifier.',
          answer: 'Please contact the procurement team to verify the correct RFP ID and try again.',
          reviewStatus: 'none'
        }
      ]
    };
  };

  // Handle back navigation
  const handleBackToProposals = () => {
    // Save current state before navigating away
    if (rfpData) {
      savePersistedData(rfpData);
    }
    navigate('/proposal'); // Adjust this path according to your routing setup
  };

  // Handle template selection
  const handleTemplateSelect = (template: RFPTemplate) => {
    setSelectedTemplate(template);
    setShowTemplateSelector(false);
    setShowTemplatePreview(false);
    console.log('Selected template:', template);
  };

  // Handle template preview
  const handleTemplatePreview = (template: RFPTemplate) => {
    setPreviewTemplate(template);
    setShowTemplatePreview(true);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const clickedElement = event.target as HTMLElement;
      let shouldClose = true;
      
      // Check if click is inside any dropdown
      Object.values(dropdownRefs.current).forEach(ref => {
        if (ref?.contains(clickedElement)) {
          shouldClose = false;
        }
      });
      
      if (shouldClose) {
        setOpenDropdowns(new Set());
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load RFP data with persistence
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!rfpId) return;
      
      // Try to load persisted data first
      const persistedData = loadPersistedData(rfpId);
      
      if (persistedData) {
        setRfpData(persistedData);
      } else {
        // Load fresh mock data
        const mockData = getMockRFPData(rfpId);
        setRfpData(mockData);
      }
      
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [rfpId]);

  // Auto-save data whenever it changes
  useEffect(() => {
    if (rfpData && !isLoading) {
      savePersistedData(rfpData);
    }
  }, [rfpData, isLoading]);

  const handleAnswerChange = (id: string, newAnswer: string) => {
    if (!rfpData) return;
    setRfpData({
      ...rfpData,
      responses: rfpData.responses.map(response =>
        response.id === id ? { ...response, answer: newAnswer } : response
      )
    });
  };

  const handleDeleteAnswer = (id: string) => {
    if (!rfpData) return;
    const confirmed = window.confirm('Are you sure you want to delete this answer? This action cannot be undone.');
    if (confirmed) {
      setRfpData({
        ...rfpData,
        responses: rfpData.responses.map(response =>
          response.id === id ? { ...response, answer: '', reviewStatus: 'none' } : response
        )
      });
    }
  };

  const handleEditAnswer = (id: string) => {
    const textarea = document.querySelector(`textarea[data-id="${id}"]`) as HTMLTextAreaElement;
    if (textarea) {
      textarea.focus();
      textarea.select();
      setEditingId(id);
    }
  };

  const handleVoiceInput = (id: string) => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser. Please try using Chrome or Edge.');
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    setIsListening(id);

    recognition.onresult = (event: any) => {
      const transcript = event.results[event.results.length - 1][0].transcript;
      handleAnswerChange(id, transcript.trim());
      setIsListening(null);
    };

    recognition.onerror = (event: any) => {
      setIsListening(null);
      console.error('Speech recognition error:', event.error);
      alert(`Speech recognition error: ${event.error}. Please try again.`);
    };

    recognition.onend = () => {
      setIsListening(null);
    };

    recognition.start();
  };

  const toggleDropdown = (id: string) => {
    const newOpenDropdowns = new Set(openDropdowns);
    if (newOpenDropdowns.has(id)) {
      newOpenDropdowns.delete(id);
    } else {
      // Close all other dropdowns first
      newOpenDropdowns.clear();
      newOpenDropdowns.add(id);
    }
    setOpenDropdowns(newOpenDropdowns);
  };

  const handleReviewChange = (id: string, status: 'approved' | 'partial' | 'rejected') => {
    if (!rfpData) return;
    setRfpData({
      ...rfpData,
      responses: rfpData.responses.map(response =>
        response.id === id ? { ...response, reviewStatus: status } : response
      )
    });
    // Close dropdown after selection
    setOpenDropdowns(new Set());
  };

  const canSubmit = () => {
    if (!rfpData || !selectedTemplate) return false;
    return rfpData.responses.every(response => 
      response.reviewStatus !== 'none' && response.answer.trim() !== ''
    );
  };

  const getFirstUnreviewedRequirement = () => {
    if (!rfpData) return null;
    return rfpData.responses.find(response => 
      response.reviewStatus === 'none' || response.answer.trim() === ''
    );
  };

  const scrollToRequirement = (id: string) => {
    const element = document.querySelector(`[data-requirement-id="${id}"]`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add('highlight-requirement');
      setTimeout(() => {
        element.classList.remove('highlight-requirement');
      }, 3000);
    }
  };

  const handleSubmit = () => {
    if (!selectedTemplate) {
      alert('⚠️ Please select an RFP template before submitting your response.');
      setShowTemplateSelector(true);
      return;
    }

    if (!canSubmit()) {
      const firstUnreviewed = getFirstUnreviewedRequirement();
      if (firstUnreviewed) {
        alert(`Please complete and review: "${firstUnreviewed.requirement.substring(0, 60)}..."`);
        scrollToRequirement(firstUnreviewed.id);
      }
      return;
    }
    
    const submitData = {
      rfpId: rfpData?.id,
      selectedTemplate: selectedTemplate,
      responses: rfpData?.responses,
      submittedAt: new Date().toISOString()
    };
    
    console.log('Submitting RFP responses:', submitData);
    
    // Clear persisted data after successful submission
    if (rfpData) {
      try {
        if ((window as any).rfpPersistedData && (window as any).rfpPersistedData[rfpData.id]) {
          delete (window as any).rfpPersistedData[rfpData.id];
        }
        // In a real app: localStorage.removeItem(getStorageKey(rfpData.id));
      } catch (error) {
        console.error('Error clearing persisted data:', error);
      }
    }
    
    alert(`🎉 RFP responses submitted successfully using ${selectedTemplate.name} template! Your submission has been recorded and will be reviewed by the procurement team.`);
    
    // Navigate back to proposals after submission
    navigate('/proposal');
  };

  const getReviewStatusDisplay = (status: 'none' | 'approved' | 'partial' | 'rejected') => {
    switch (status) {
      case 'approved':
        return { 
          icon: '✓', 
          label: 'Approved', 
          class: 'approved',
          description: 'Response meets all requirements'
        };
      case 'partial':
        return { 
          icon: '!', 
          label: 'Needs Review', 
          class: 'partial',
          description: 'Response needs minor improvements'
        };
      case 'rejected':
        return { 
          icon: '✗', 
          label: 'Rejected', 
          class: 'rejected',
          description: 'Response requires significant revision'
        };
      default:
        return { 
          icon: '○', 
          label: 'Not Reviewed', 
          class: 'none',
          description: 'Response pending review'
        };
    }
  };

  const getCompletionStats = () => {
    if (!rfpData) return { completed: 0, total: 0, percentage: 0 };
    
    const completed = rfpData.responses.filter(r => 
      r.reviewStatus !== 'none' && r.answer.trim() !== ''
    ).length;
    const total = rfpData.responses.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { completed, total, percentage };
  };

  if (isLoading) {
    return (
      <div className="response-container">
        <Sidebar />
        <div className="response-content">
          <div className="response-loading">
            <div className="loading-spinner"></div>
            <div className="loading-content">
              <h2>Loading RFP Response</h2>
              <p>Retrieving requirements and preparing workspace...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!rfpData) {
    return (
      <div className="response-container">
        <Sidebar />
        <div className="response-content">
          <div className="response-error">
            <div className="error-icon">⚠️</div>
            <h2>RFP Not Found</h2>
            <p>The requested RFP could not be loaded. Please check the RFP ID and try again.</p>
            <button 
              className="retry-btn"
              onClick={() => window.location.reload()}
            >
              Retry Loading
            </button>
          </div>
        </div>
      </div>
    );
  }

  const stats = getCompletionStats();

  return (
    <div className="response-container">
      <Sidebar />
      <div className="response-content">
        {/* Back Navigation Header */}
        <div className="back-navigation">
          <button 
            className="back-btn"
            onClick={handleBackToProposals}
            title="Back to Proposals"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5"/>
              <path d="m12 19-7-7 7-7"/>
            </svg>
            <span>Back to Proposals</span>
          </button>
          <div className="breadcrumb">
            <span className="breadcrumb-item">Proposals</span>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-item active">{rfpData.title}</span>
          </div>
        </div>

        <div className="response-header">
          <div className="header-main">
            <h1 className="response-title">{rfpData.title}</h1>
            {rfpData.description && (
              <p className="response-description">{rfpData.description}</p>
            )}
          </div>
          
          <div className="response-meta">
            <div className="meta-item">
              <span className="meta-label">RFP ID</span>
              <span className="meta-value rfp-id">{rfpData.id}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Requirements</span>
              <span className="meta-value">{rfpData.responses.length}</span>
            </div>
            {rfpData.deadline && (
              <div className="meta-item">
                <span className="meta-label">Deadline</span>
                <span className="meta-value">{new Date(rfpData.deadline).toLocaleDateString()}</span>
              </div>
            )}
            <div className="meta-item progress-item">
              <span className="meta-label">Progress</span>
              <div className="progress-container">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${stats.percentage}%` }}
                  ></div>
                </div>
                <span className="progress-text">{stats.completed}/{stats.total}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Template Selection Status */}
        <div className="template-status-section">
          {selectedTemplate ? (
            <div className="template-selected">
              <div className="template-selected-info">
                <div className="template-icon">📄</div>
                <div className="template-details">
                  <span className="template-name">{selectedTemplate.name}</span>
                  <span className="template-category">{selectedTemplate.category} Template</span>
                </div>
              </div>
              <button
                className="change-template-btn"
                onClick={() => setShowTemplateSelector(true)}
              >
                Change Template
              </button>
            </div>
          ) : (
            <div className="template-not-selected">
              <div className="template-warning">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                  <path d="M12 9v4"/>
                  <path d="m12 17 .01 0"/>
                </svg>
                <span>Please select an RFP template before submitting</span>
              </div>
              <button
                className="select-template-btn"
                onClick={() => setShowTemplateSelector(true)}
              >
                Select Template
              </button>
            </div>
          )}
        </div>

        <div className="response-table">
          <div className="response-table-header">
            <div className="column-header number-column">#</div>
            <div className="column-header requirements-column">Requirements</div>
            <div className="column-header answers-column">Your Response</div>
            <div className="column-header actions-column">Actions</div>
            <div className="column-header review-column">Review Status</div>
          </div>

          <div className="response-table-body">
            {rfpData.responses.map((response, index) => (
              <div
                key={response.id}
                className={`response-row ${editingId === response.id ? 'editing' : ''} ${response.reviewStatus}`}
                data-requirement-id={response.id}
              >
                <div className="response-cell number-cell">
                  <div className="requirement-number">{index + 1}</div>
                </div>

                <div className="response-cell requirements-cell">
                  <div className="requirement-text">{response.requirement}</div>
                </div>

                <div className="response-cell answers-cell">
                  <textarea
                    className="answer-textarea"
                    data-id={response.id}
                    value={response.answer}
                    onChange={(e) => handleAnswerChange(response.id, e.target.value)}
                    onFocus={() => setEditingId(response.id)}
                    onBlur={() => setEditingId(null)}
                    placeholder="Enter your detailed response here..."
                    rows={5}
                  />
                  <div className="answer-meta">
                    <span className="char-count">
                      {response.answer.length} characters
                    </span>
                  </div>
                </div>

                <div className="response-cell actions-cell">
                  <div className="action-buttons">
                    <button
                      className="action-btn edit-btn"
                      onClick={() => handleEditAnswer(response.id)}
                      title="Edit Response"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="m18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"/>
                      </svg>
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={() => handleDeleteAnswer(response.id)}
                      title="Clear Response"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3,6 5,6 21,6"/>
                        <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
                        <line x1="10" y1="11" x2="10" y2="17"/>
                        <path d="M14 11 L14 17"/>
                      </svg>
                    </button>
                    <button
                      className={`action-btn microphone-btn ${isListening === response.id ? 'listening' : ''}`}
                      onClick={() => handleVoiceInput(response.id)}
                      title="Voice Input"
                      disabled={isListening === response.id}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                        <line x1="12" y1="19" x2="12" y2="23"/>
                        <line x1="8" y1="23" x2="16" y2="23"/>
                      </svg>
                      {isListening === response.id && <span className="listening-pulse"></span>}
                    </button>
                  </div>
                </div>

                <div className="response-cell review-cell">
                  <div 
                    className="review-dropdown"
                    ref={(el: HTMLDivElement | null) => {
                      dropdownRefs.current[response.id] = el;
                    }}
                  >
                    <button
                      className={`review-status-btn ${getReviewStatusDisplay(response.reviewStatus).class}`}
                      onClick={() => toggleDropdown(response.id)}
                      title={getReviewStatusDisplay(response.reviewStatus).description}
                    >
                      <span className="status-icon">
                        {getReviewStatusDisplay(response.reviewStatus).icon}
                      </span>
                      <span className="status-label">
                        {getReviewStatusDisplay(response.reviewStatus).label}
                      </span>
                      <svg 
                        className={`dropdown-arrow ${openDropdowns.has(response.id) ? 'open' : ''}`} 
                        width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                      >
                        <polyline points="6,9 12,15 18,9"/>
                      </svg>
                    </button>
                    
                    {openDropdowns.has(response.id) && (
                      <div className="review-dropdown-menu">
                        <button
                          className="review-option approved"
                          onClick={() => handleReviewChange(response.id, 'approved')}
                        >
                          <span className="option-icon">✓</span>
                          <div className="option-content">
                            <span className="option-label">Approved</span>
                          </div>
                        </button>
                        <button
                          className="review-option partial"
                          onClick={() => handleReviewChange(response.id, 'partial')}
                        >
                          <span className="option-icon">!</span>
                          <div className="option-content">
                            <span className="option-label">Needs Review</span>
                          </div>
                        </button>
                        <button
                          className="review-option rejected"
                          onClick={() => handleReviewChange(response.id, 'rejected')}
                        >
                          <span className="option-icon">✗</span>
                          <div className="option-content">
                            <span className="option-label">Rejected</span>
                          </div>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="response-footer">
          <div className="submit-section">
            <div className="submit-stats">
              <div className="stat-item">
                <span className="stat-number">{stats.completed}</span>
                <span className="stat-label">Completed</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{stats.total - stats.completed}</span>
                <span className="stat-label">Remaining</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{stats.percentage}%</span>
                <span className="stat-label">Progress</span>
              </div>
            </div>
            
            {(!canSubmit() || !selectedTemplate) && (
              <div className="submit-warning">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                  <path d="M12 9v4"/>
                  <path d="m12 17 .01 0"/>
                </svg>
                {!selectedTemplate ? 
                  'Please select an RFP template before submitting' : 
                  'Please complete and review all responses before submitting'
                }
              </div>
            )}
            
            <button
              className={`submit-btn ${canSubmit() && selectedTemplate ? 'enabled' : 'disabled'}`}
              onClick={handleSubmit}
              disabled={!canSubmit() || !selectedTemplate}
            >
              <span className="btn-text">Submit RFP Response</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m9 18 6-6-6-6"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Template Selector Modal */}
      <TemplateSelector
        isOpen={showTemplateSelector}
        onClose={() => setShowTemplateSelector(false)}
        onSelect={handleTemplateSelect}
        onPreview={handleTemplatePreview}
      />

      {/* Template Preview Modal */}
      <TemplatePreview
        isOpen={showTemplatePreview}
        template={previewTemplate}
        onClose={() => setShowTemplatePreview(false)}
        onSelect={handleTemplateSelect}
      />
    </div>
  );
};

export default Response;