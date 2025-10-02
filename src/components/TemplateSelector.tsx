import { useState } from 'react';
import '../style/TemplateSelector.css';

export interface RFPTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  sections: string[];
}

interface TemplateSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (template: RFPTemplate) => void;
  onPreview: (template: RFPTemplate) => void;
}

const rfpTemplates: RFPTemplate[] = [
  {
    id: 'general',
    name: 'General Project RFP',
    description: 'A comprehensive template for general project proposals covering all essential aspects.',
    category: 'General',
    sections: [
      'Introduction & Background',
      'Project Goals & Scope', 
      'Requirements',
      'Submission Guidelines',
      'Evaluation Criteria'
    ]
  },
  {
    id: 'software',
    name: 'Software Development RFP',
    description: 'Specialized template for software development projects with technical specifications.',
    category: 'Technology',
    sections: [
      'Organization Overview',
      'Project Scope',
      'Technical Environment',
      'Vendor Qualifications',
      'Proposal Submission'
    ]
  },
  {
    id: 'marketing',
    name: 'Marketing Services RFP',
    description: 'Focused template for digital marketing and promotional service requests.',
    category: 'Marketing',
    sections: [
      'Company Background',
      'Scope of Work',
      'Budget Range',
      'Deliverables & Reporting',
      'Proposal Instructions'
    ]
  },
  {
    id: 'construction',
    name: 'Construction RFP',
    description: 'Comprehensive template for construction and infrastructure projects.',
    category: 'Construction',
    sections: [
      'Project Overview',
      'Scope of Work',
      'Timeline & Milestones',
      'Submission Requirements',
      'Evaluation Criteria'
    ]
  }
];

const TemplateSelector: React.FC<TemplateSelectorProps> = ({ 
  isOpen, 
  onClose, 
  onSelect, 
  onPreview 
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  if (!isOpen) return null;

  const categories = ['All', ...Array.from(new Set(rfpTemplates.map(t => t.category)))];
  
  const filteredTemplates = selectedCategory === 'All' 
    ? rfpTemplates 
    : rfpTemplates.filter(t => t.category === selectedCategory);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'General': return '📋';
      case 'Technology': return '💻';
      case 'Marketing': return '📈';
      case 'Construction': return '🏗️';
      default: return '📄';
    }
  };

  return (
    <div className="template-selector-overlay">
      <div className="template-selector-modal">
        <div className="template-selector-header">
          <div className="header-content">
            <h2 className="modal-title">Select RFP Template</h2>
            <p className="modal-subtitle">
              Choose a template that best matches your project requirements
            </p>
          </div>
          <button 
            className="close-btn"
            onClick={onClose}
            aria-label="Close template selector"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="template-selector-filters">
          <div className="filter-label">Category:</div>
          <div className="category-buttons">
            {categories.map(category => (
              <button
                key={category}
                className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category !== 'All' && getCategoryIcon(category)} {category}
              </button>
            ))}
          </div>
        </div>

        <div className="template-grid">
          {filteredTemplates.map(template => (
            <div key={template.id} className="template-card">
              <div className="template-header">
                <div className="template-icon">
                  {getCategoryIcon(template.category)}
                </div>
                <div className="template-info">
                  <h3 className="template-name">{template.name}</h3>
                  <span className="template-category">{template.category}</span>
                </div>
              </div>
              
              <p className="template-description">{template.description}</p>
              
              <div className="template-sections">
                <h4 className="sections-title">Includes:</h4>
                <ul className="sections-list">
                  {template.sections.map((section, index) => (
                    <li key={index} className="section-item">
                      <span className="section-bullet">•</span>
                      {section}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="template-actions">
                <button
                  className="preview-btn"
                  onClick={() => onPreview(template)}
                  title="Preview this template"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  Preview
                </button>
                <button
                  className="select-btn"
                  onClick={() => onSelect(template)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20,6 9,17 4,12"/>
                  </svg>
                  Select Template
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="template-selector-footer">
          <p className="footer-note">
            💡 You can customize any template after selection to match your specific requirements.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TemplateSelector;