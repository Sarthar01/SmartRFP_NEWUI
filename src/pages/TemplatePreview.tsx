import { useState } from 'react';
import type { RFPTemplate } from '../components/TemplateSelector';
import '../style/TemplatePreview.css';

interface TemplatePreviewProps {
  isOpen: boolean;
  template: RFPTemplate | null;
  onClose: () => void;
  onSelect?: (template: RFPTemplate) => void;
}

const templateContent: { [key: string]: any } = {
  general: {
    title: "Request for Proposal – Smart City Infrastructure Project",
    sections: {
      "Introduction & Background": {
        content: `Metropolitan City Council is seeking qualified vendors to develop and implement a comprehensive smart city infrastructure solution. Our city of 500,000+ residents aims to modernize public services, improve citizen engagement, and enhance operational efficiency through innovative technology solutions.

Current challenges include:
• Limited digital service delivery
• Inefficient resource management
• Poor citizen-government communication channels
• Aging infrastructure monitoring systems`
      },
      "Project Goals & Scope": {
        content: `PROJECT OBJECTIVES:
• Implement IoT-enabled infrastructure monitoring
• Deploy citizen engagement digital platform
• Establish real-time city operations dashboard
• Integrate existing municipal systems

DELIVERABLES:
• Complete system architecture design
• Hardware installation and configuration
• Software development and customization
• Staff training and documentation
• 12-month warranty and support

TIMELINE: 18 months from contract signing`
      },
      "Requirements": {
        content: `FUNCTIONAL REQUIREMENTS:
• Multi-platform citizen portal (web, mobile)
• Real-time infrastructure monitoring
• Automated reporting and analytics
• Integration with existing ERP systems
• Multi-language support (English, Spanish)

TECHNICAL REQUIREMENTS:
• Cloud-based architecture (AWS/Azure preferred)
• 99.9% uptime SLA
• HTTPS encryption and data security
• API-first development approach
• Scalable to 1M+ citizens

COMPLIANCE:
• GDPR and privacy law compliance
• ADA accessibility standards
• Municipal security requirements`
      },
      "Submission Guidelines": {
        content: `SUBMISSION DEADLINE: December 15, 2024, 5:00 PM EST

REQUIRED FORMAT:
• PDF format only
• Maximum 50 pages
• Include executive summary (2 pages max)
• Detailed technical proposal
• Project timeline with milestones
• Team qualifications and experience

CONTACT INFORMATION:
Sarah Johnson, Procurement Manager
Email: procurement@metrocity.gov
Phone: (555) 123-4567

Questions deadline: November 30, 2024`
      },
      "Evaluation Criteria": {
        content: `EVALUATION FACTORS (Total 100 points):

TECHNICAL APPROACH (35 points):
• Solution architecture and design
• Innovation and methodology
• Risk mitigation strategies

EXPERIENCE & QUALIFICATIONS (25 points):
• Relevant project experience
• Team expertise and certifications
• Client references and testimonials

COST EFFECTIVENESS (25 points):
• Total project cost
• Value for money proposition
• Maintenance and support costs

IMPLEMENTATION PLAN (15 points):
• Project timeline feasibility
• Resource allocation
• Change management approach`
      }
    }
  },
  software: {
    title: "Request for Proposal – Enterprise Resource Planning System",
    sections: {
      "Organization Overview": {
        content: `TechCorp Industries is a mid-sized manufacturing company with 850+ employees across 5 locations. We currently operate with disconnected legacy systems that limit our operational efficiency and growth potential.

CURRENT CHALLENGES:
• Manual data entry across multiple systems
• Limited real-time reporting capabilities
• Poor inventory management visibility
• Inefficient financial consolidation process

BUSINESS GOALS:
• Streamline operations across all departments
• Improve data accuracy and accessibility
• Enable real-time business intelligence
• Support future growth and scalability`
      },
      "Project Scope": {
        content: `REQUIRED MODULES:
• Financial Management (GL, AP, AR, Fixed Assets)
• Human Resources & Payroll
• Supply Chain Management
• Customer Relationship Management
• Business Intelligence & Analytics

PLATFORM REQUIREMENTS:
• Web-based application
• Mobile accessibility for field operations
• Cloud or hybrid deployment options
• Multi-location, multi-currency support

SECURITY & COMPLIANCE:
• Role-based access control
• Audit trail capabilities
• SOX compliance features
• Data encryption at rest and in transit`
      },
      "Technical Environment": {
        content: `PREFERRED TECHNOLOGY STACK:
• Database: SQL Server or PostgreSQL
• Framework: .NET Core or Java Spring
• Frontend: Modern JavaScript (React/Angular)
• Cloud Platform: Microsoft Azure preferred

EXISTING INTEGRATIONS:
• Manufacturing execution system (MES)
• Customer portal (WordPress)
• EDI trading partner connections
• Third-party logistics providers

INFRASTRUCTURE:
• Hybrid cloud environment
• Microsoft Active Directory authentication
• Existing VPN and firewall systems
• 24/7 monitoring and backup solutions`
      },
      "Vendor Qualifications": {
        content: `MINIMUM REQUIREMENTS:
• 5+ years in enterprise software development
• Experience with manufacturing industry
• Minimum 10 similar implementations
• Certified project management professionals

PREFERRED QUALIFICATIONS:
• Microsoft Gold Partner status
• Industry-specific expertise
• Agile development methodology
• Post-implementation support capabilities

REFERENCES:
• Provide 3 references from similar projects
• Include client contact information
• Specify project size and complexity
• Highlight achieved ROI and benefits`
      },
      "Proposal Submission": {
        content: `COST BREAKDOWN REQUIRED:
• Software licensing (per user/module)
• Implementation services
• Data migration and integration
• Training and change management
• Annual maintenance and support

PROJECT TIMELINE:
• Requirements gathering: 4 weeks
• System configuration: 12 weeks
• Testing and validation: 6 weeks
• Go-live and support: 4 weeks
• Total project duration: 6-8 months

TEAM STRUCTURE:
• Project manager and technical lead
• Functional consultants by module
• Data migration specialists
• Training and change management resources`
      }
    }
  },
  marketing: {
    title: "Request for Proposal – Digital Marketing Services",
    sections: {
      "Company Background": {
        content: `GreenTech Solutions is an innovative clean energy startup specializing in residential solar installations. Founded in 2020, we've grown from 2 to 45 employees and completed over 1,200 installations across the Southwest region.

TARGET MARKET:
• Homeowners aged 35-65
• Household income $75K+
• Environmentally conscious consumers
• Tech-savvy early adopters

BRAND POSITIONING:
• Premium quality solar solutions
• Exceptional customer service
• Cutting-edge technology
• Environmental sustainability

CURRENT CHALLENGES:
• Limited brand awareness in new markets
• High customer acquisition costs
• Competition from established players
• Need for lead generation optimization`
      },
      "Scope of Work": {
        content: `SEARCH ENGINE OPTIMIZATION (SEO):
• Comprehensive website audit and optimization
• Local SEO for multi-market presence
• Content strategy and creation
• Technical SEO improvements
• Ongoing performance monitoring

SEARCH ENGINE MARKETING (SEM):
• Google Ads campaign management
• Bing Ads setup and optimization
• Landing page optimization
• Conversion tracking implementation
• Budget management and ROI optimization

SOCIAL MEDIA MARKETING:
• Facebook and Instagram advertising
• LinkedIn B2B lead generation
• Content calendar development
• Community management
• Influencer partnership coordination

CONTENT MARKETING:
• Blog content creation (4 posts/month)
• Video content production
• Email marketing campaigns
• Lead nurturing automation
• Customer success stories`
      },
      "Budget Range": {
        content: `MONTHLY BUDGET ALLOCATION:
• Total monthly budget: $25,000 - $35,000
• Paid advertising spend: 60-70%
• Creative development: 15-20%
• Strategy and management: 15-20%

CAMPAIGN SPECIFIC BUDGETS:
• Google Ads: $12,000 - $15,000/month
• Social media ads: $6,000 - $8,000/month
• Content creation: $3,000 - $4,000/month
• Tools and software: $1,000 - $1,500/month

CONTRACT TERMS:
• Initial 6-month commitment
• 30-day cancellation notice
• Performance-based bonuses available
• Quarterly budget reviews and adjustments`
      },
      "Deliverables & Reporting": {
        content: `MONTHLY REPORTS:
• Campaign performance dashboard
• Lead generation and conversion metrics
• Website traffic and engagement analysis
• Social media growth and engagement
• ROI and ROAS calculations

KEY PERFORMANCE INDICATORS:
• Cost per lead (target: <$150)
• Conversion rate (target: >3%)
• Return on ad spend (target: >400%)
• Website organic traffic growth
• Brand awareness metrics

REPORTING SCHEDULE:
• Weekly performance summaries
• Monthly comprehensive reports
• Quarterly strategy reviews
• Annual planning sessions

COMMUNICATION:
• Dedicated account manager
• Bi-weekly strategy calls
• Real-time campaign notifications
• Access to reporting dashboard`
      },
      "Proposal Instructions": {
        content: `CAMPAIGN EXAMPLES REQUIRED:
• 3 similar industry case studies
• Before/after performance metrics
• Creative samples and strategies
• Client testimonials or references

STRATEGIC APPROACH:
• Market analysis methodology
• Competitive research process
• Customer journey mapping
• Attribution model recommendations
• A/B testing frameworks

TEAM QUALIFICATIONS:
• Google Ads and Facebook certified
• Industry experience and expertise
• Account management structure
• Escalation and support procedures

PRICING STRUCTURE:
• Management fee structure
• Performance incentive options
• Additional service pricing
• Contract terms and conditions
• Cancellation and refund policies`
      }
    }
  },
  construction: {
    title: "Request for Proposal – Medical Center Construction",
    sections: {
      "Project Overview": {
        content: `Regional Healthcare Network is seeking qualified general contractors for the construction of a new 75,000 square foot outpatient medical center in Downtown Metro Area.

PROJECT DETAILS:
• Location: 123 Medical Plaza Drive
• Building size: 75,000 sq ft (3 floors)
• Estimated value: $18-22 million
• Site preparation: 2.5 acre lot

FACILITY PURPOSE:
• Multi-specialty medical offices
• Outpatient surgery center
• Diagnostic imaging center
• Physical therapy and rehabilitation
• Retail pharmacy and laboratory

SPECIAL CONSIDERATIONS:
• Healthcare facility regulations
• Medical gas and electrical requirements
• Specialized HVAC systems
• Patient accessibility compliance`
      },
      "Scope of Work": {
        content: `DESIGN & ARCHITECTURAL:
• Detailed construction drawings review
• Value engineering recommendations
• Material selection and specifications
• Building code compliance verification
• Sustainable design integration (LEED Silver target)

CONSTRUCTION ACTIVITIES:
• Site preparation and utilities
• Foundation and structural work
• MEP (mechanical, electrical, plumbing) systems
• Medical gas installation
• Interior finishes and specialties
• Exterior landscaping and parking

MATERIALS & STANDARDS:
• Healthcare-grade flooring and finishes
• Medical equipment rough-ins
• High-efficiency HVAC systems
• Emergency power and backup systems
• Advanced fire suppression systems

QUALITY ASSURANCE:
• Regular inspection schedules
• Material testing and certification
• Healthcare facility commissioning
• Final inspections and approvals`
      },
      "Timeline & Milestones": {
        content: `PROJECT SCHEDULE (24 months total):

PHASE 1 - PRE-CONSTRUCTION (Months 1-3):
• Permit acquisition and approvals
• Final design development
• Subcontractor selection
• Site preparation

PHASE 2 - FOUNDATION & STRUCTURE (Months 4-9):
• Excavation and foundation
• Structural steel erection
• Building shell completion
• MEP rough-ins

PHASE 3 - INTERIOR CONSTRUCTION (Months 10-18):
• Drywall and interior framing
• Flooring and ceiling installation
• Medical gas and electrical connections
• Equipment installation preparation

PHASE 4 - FINALIZATION (Months 19-24):
• Final finishes and fixtures
• Testing and commissioning
• Final inspections and approvals
• Project closeout and handover

CRITICAL MILESTONES:
• Building permit approval: Month 2
• Foundation completion: Month 6
• Substantial completion: Month 22
• Certificate of occupancy: Month 24`
      },
      "Submission Requirements": {
        content: `LICENSING & INSURANCE:
• General contractor license (Class A)
• Current certificate of insurance
• Bonding capacity verification
• Healthcare construction experience

PROJECT REFERENCES:
• 3 similar healthcare facilities
• Project size and complexity
• Client contact information
• Completion dates and final costs

DETAILED COST ESTIMATES:
• Labor costs by trade
• Material costs and specifications
• Equipment and tool rental
• Subcontractor pricing
• Contingency allowances (5-10%)

FINANCIAL INFORMATION:
• Company financial statements
• Bank references and credit rating
• Bonding company information
• Current project commitments

PROJECT TEAM:
• Project manager qualifications
• Superintendent experience
• Safety record and protocols
• Quality control procedures`
      },
      "Evaluation Criteria": {
        content: `SCORING METHODOLOGY (100 points total):

COST COMPETITIVENESS (30 points):
• Total project cost
• Value engineering proposals
• Cost breakdown accuracy
• Payment schedule reasonableness

EXPERIENCE & QUALIFICATIONS (25 points):
• Healthcare construction experience
• Similar project size and complexity
• Team qualifications and certifications
• Safety performance record

PROJECT APPROACH (20 points):
• Construction methodology
• Schedule feasibility
• Risk management plan
• Quality assurance procedures

REFERENCES & PAST PERFORMANCE (15 points):
• Client satisfaction ratings
• On-time completion record
• Budget management performance
• Problem resolution capabilities

FINANCIAL STABILITY (10 points):
• Company financial strength
• Bonding capacity
• Insurance coverage adequacy
• Business continuity planning

MINIMUM QUALIFICATION REQUIREMENTS:
• Licensed general contractor
• $25M+ bonding capacity
• 10+ years healthcare construction
• EMR <1.0 safety rating`
      }
    }
  }
};

const TemplatePreview: React.FC<TemplatePreviewProps> = ({
  isOpen,
  template,
  onClose,
  onSelect
}) => {
  const [activeSection, setActiveSection] = useState<string>('');

  if (!isOpen || !template) return null;

  const content = templateContent[template.id];
  const sections = Object.keys(content.sections);

  if (!activeSection && sections.length > 0) {
    setActiveSection(sections[0]);
  }

  return (
    <div className="template-preview-overlay">
      <div className="template-preview-modal">
        <div className="template-preview-header">
          <div className="header-info">
            <h2 className="preview-title">{template.name} - Preview</h2>
            <p className="preview-subtitle">Sample RFP Document</p>
          </div>
          <div className="header-actions">
            {onSelect && (
              <button
                className="select-template-btn"
                onClick={() => onSelect(template)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20,6 9,17 4,12"/>
                </svg>
                Use This Template
              </button>
            )}
            <button 
              className="close-preview-btn"
              onClick={onClose}
              aria-label="Close preview"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="template-preview-content">
          <div className="preview-sidebar">
            <h3 className="sidebar-title">Document Sections</h3>
            <nav className="section-nav">
              {sections.map((section) => (
                <button
                  key={section}
                  className={`section-nav-btn ${activeSection === section ? 'active' : ''}`}
                  onClick={() => setActiveSection(section)}
                >
                  <span className="section-icon">📄</span>
                  {section}
                </button>
              ))}
            </nav>
          </div>

          <div className="preview-document">
            <div className="document-header">
              <h1 className="document-title">{content.title}</h1>
              <div className="document-meta">
                <span className="meta-item">
                  <strong>Template:</strong> {template.name}
                </span>
                <span className="meta-item">
                  <strong>Category:</strong> {template.category}
                </span>
                <span className="meta-item">
                  <strong>Generated:</strong> {new Date().toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="document-content">
              <div className="section-content">
                <h2 className="section-title">{activeSection}</h2>
                <div className="section-body">
                  {content.sections[activeSection]?.content.split('\n').map((paragraph: string, index: number) => {
                    if (paragraph.trim() === '') return null;
                    
                    if (paragraph.includes('•')) {
                      const lines = paragraph.split('•').filter(line => line.trim());
                      return (
                        <div key={index} className="bullet-list">
                          {lines.map((line, i) => (
                            <div key={i} className="bullet-item">
                              <span className="bullet">•</span>
                              <span>{line.trim()}</span>
                            </div>
                          ))}
                        </div>
                      );
                    }
                    
                    if (paragraph.includes(':') && paragraph.length < 100) {
                      return (
                        <h3 key={index} className="subsection-title">
                          {paragraph}
                        </h3>
                      );
                    }
                    
                    return (
                      <p key={index} className="content-paragraph">
                        {paragraph}
                      </p>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="template-preview-footer">
          <div className="footer-info">
            <span className="preview-note">
              📄 This is a sample preview. Actual templates can be customized to match your specific requirements.
            </span>
          </div>
          <div className="footer-actions">
            <button className="back-btn" onClick={onClose}>
              Back to Selection
            </button>
            {onSelect && (
              <button
                className="use-template-btn"
                onClick={() => onSelect(template)}
              >
                Use This Template
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplatePreview;