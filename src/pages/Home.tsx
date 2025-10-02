import React from 'react';
import NavBar from '../components/NavBar';
import { Link } from 'react-router-dom';
import {  useEffect } from 'react';
import '../style/Home.css';

const Home: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const currentPage = 'home';

  return (
    <div className="home">
      <NavBar currentPage={currentPage} />

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">
                Streamline Your <span className="gradient-text">RFP Process</span>
              </h1>
              <p className="hero-subtitle">
                SmartRFP helps businesses respond to RFPs faster and more effectively with
                AI-powered document analysis, automated workflows, and collaborative tools.
              </p>
              <div className="hero-actions">
                <button className="cta-primary">
                  Start Free Trial
                  <div className="btn-shine"></div>
                </button>
                <button className="cta-secondary">
                  Watch Demo
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 5V19L19 12L8 5Z" fill="currentColor" />
                  </svg>
                </button>
              </div>
              <div className="hero-badges">
                <div className="badge">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  No credit card required
                </div>
                <div className="badge">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2V22M17 5H9.5C8.11929 5 7 6.11929 7 7.5C7 8.88071 8.11929 10 9.5 10H14.5C15.8807 10 17 11.1193 17 12.5C17 13.8807 15.8807 15 14.5 15H7M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  14-day free trial
                </div>
              </div>
            </div>

            <div className="hero-visual">
              <div className="floating-elements">
                <div className="floating-card card-1">
                  <div className="card-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div className="card-text">AI Analysis</div>
                </div>

                <div className="floating-card card-2">
                  <div className="card-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div className="card-text">Automation</div>
                </div>

                <div className="floating-card card-3">
                  <div className="card-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 19C6.23858 19 4 16.7614 4 14C4 11.2386 6.23858 9 9 9C10.4922 9 11.815 9.74209 12.6834 10.8951C13.5519 9.74209 14.8747 9 16.3669 9C19.1283 9 21.3669 11.2386 21.3669 14C21.3669 16.7614 19.1283 19 16.3669 19H9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div className="card-text">Collaboration</div>
                </div>
              </div>

              <div className="hero-document">
                <div className="document-container">
                  <div className="proposal-document">
                    <div className="document-header">
                      <div className="document-title">REQUEST FOR PROPOSAL</div>
                      <div className="document-id">RFP-2023-0142</div>
                    </div>
                    <div className="document-body">
                      <div className="document-section">
                        <div className="section-title">EXECUTIVE SUMMARY</div>
                        <div className="section-content"></div>
                      </div>
                      <div className="document-section">
                        <div className="section-title">TECHNICAL APPROACH</div>
                        <div className="section-content"></div>
                      </div>
                      <div className="document-section">
                        <div className="section-title">PAST PERFORMANCE</div>
                        <div className="section-content"></div>
                      </div>
                      <div className="document-section">
                        <div className="section-title">COST PROPOSAL</div>
                        <div className="section-content"></div>
                      </div>
                    </div>
                    <div className="document-footer">
                      <div className="document-stamp">CONFIDENTIAL</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="hero-background">
          <div className="gradient-orb orb-1"></div>
          <div className="gradient-orb orb-2"></div>
          <div className="gradient-orb orb-3"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <div className="features-header">
            <h2 className="section-title">Powerful RFP Management Features</h2>
            <p className="section-subtitle">
              Our platform provides everything you need to streamline your RFP process from start to finish.
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 className="feature-title">AI Document Analysis</h3>
              <p className="feature-description">
                Our AI automatically extracts key requirements and information from RFP documents,
                saving you hours of manual review.
              </p>
              <a href="#" className="feature-link">Learn more →</a>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 className="feature-title">Automated Workflows</h3>
              <p className="feature-description">
                Create custom workflows to automate your RFP response process,
                from initial review to final submission.
              </p>
              <a href="#" className="feature-link">Learn more →</a>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 3V21H21V3H3Z M9 17L7 15L9 13L11 15L17 9L19 11L11 19L9 17Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 className="feature-title">Analytics & Insights</h3>
              <p className="feature-description">
                Track your RFP performance with detailed analytics and gain insights
                to improve your win rate over time.
              </p>
              <a href="#" className="feature-link">Learn more →</a>
            </div>
          </div>
        </div>
      </section>

      {/* RFP Education Section */}
      <section className="rfp-education">
        <div className="container">
          <div className="education-content">
            <div className="education-text">
              <h2 className="section-title">What is a Request for Proposal (RFP)?</h2>
              <p className="section-description">
                A Request for Proposal (RFP) is a formal document that organizations use to solicit
                proposals from potential vendors or service providers. RFPs outline specific requirements,
                evaluation criteria, and project details to help organizations make informed purchasing decisions.
              </p>
            </div>

            <div className="education-tabs">
              <div className="tab-content">
                <div className="tab-panel active">
                  <h3 className="tab-title">Key Components of an RFP</h3>
                  <div className="component-list">
                    <div className="component-item">
                      <div className="component-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M14 2H6C4.89 2 4 2.89 4 4V20C4 21.11 4.89 22 6 22H18C19.11 22 20 21.11 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <div className="component-text">
                        <h4>Introduction and Background</h4>
                        <p>Overview of the organization and the project context</p>
                      </div>
                    </div>

                    <div className="component-item">
                      <div className="component-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9 11H15M9 15H15M17 21L21 17L17 13M7 13L3 17L7 21M21 3H3C1.89 3 1 3.89 1 5V19C1 20.11 1.89 21 3 21H21C22.11 21 23 20.11 23 19V5C23 3.89 22.11 3 21 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <div className="component-text">
                        <h4>Project Scope</h4>
                        <p>Detailed description of the products or services being requested</p>
                      </div>
                    </div>

                    <div className="component-item">
                      <div className="component-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <div className="component-text">
                        <h4>Requirements</h4>
                        <p>Technical, functional, and business requirements</p>
                      </div>
                    </div>

                    <div className="component-item">
                      <div className="component-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <div className="component-text">
                        <h4>Timeline</h4>
                        <p>Key dates including submission deadline and project milestones</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RFP Process Section */}
      <section className="rfp-process">
        <div className="container">
          <div className="process-header">
            <h2 className="section-title">The RFP Process</h2>
            <p className="section-subtitle">
              The RFP process typically follows these steps:
            </p>
          </div>

          <div className="process-timeline">
            <div className="timeline-item">
              <div className="timeline-number">1</div>
              <div className="timeline-content">
                <h3>Planning and Drafting</h3>
                <p>Planning and drafting the RFP document</p>
              </div>
            </div>

            <div className="timeline-item">
              <div className="timeline-number">2</div>
              <div className="timeline-content">
                <h3>Publishing and Distribution</h3>
                <p>Publishing and distributing the RFP to potential vendors</p>
              </div>
            </div>

            <div className="timeline-item">
              <div className="timeline-number">3</div>
              <div className="timeline-content">
                <h3>Vendor Questions</h3>
                <p>Responding to vendor questions</p>
              </div>
            </div>

            <div className="timeline-item">
              <div className="timeline-number">4</div>
              <div className="timeline-content">
                <h3>Proposal Submission</h3>
                <p>Receiving vendor proposals</p>
              </div>
            </div>

            <div className="timeline-item">
              <div className="timeline-number">5</div>
              <div className="timeline-content">
                <h3>Evaluation</h3>
                <p>Evaluating and scoring proposals</p>
              </div>
            </div>

            <div className="timeline-item">
              <div className="timeline-number">6</div>
              <div className="timeline-content">
                <h3>Selection</h3>
                <p>Selecting a vendor and negotiating terms</p>
              </div>
            </div>

            <div className="timeline-item">
              <div className="timeline-number">7</div>
              <div className="timeline-content">
                <h3>Contract Award</h3>
                <p>Awarding the contract</p>
              </div>
            </div>
          </div>

          <div className="process-description">
            <p>
              Organizations use RFPs to ensure fair competition, transparency, and to find the best solution
              for their needs. For vendors, responding to RFPs is a critical business development activity
              that requires significant resources and expertise.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Transform Your RFP Process?</h2>
            <p className="cta-subtitle">
              Join thousands of businesses that are saving time and winning more contracts with SmartRFP.
            </p>
            <button className="cta-button">
              Start Free Trial
              <div className="btn-shine"></div>
            </button>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="trust-section">
        <div className="container">
          <div className="trust-stats">
            <div className="trust-stat">
              <div className="stat-number">500+</div>
              <div className="stat-label">Trusted by companies</div>
            </div>
            <div className="trust-stat">
              <div className="stat-number">98%</div>
              <div className="stat-label">Industry-leading satisfaction</div>
            </div>
            <div className="trust-stat">
              <div className="stat-number">24/7</div>
              <div className="stat-label">Customer support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="about-footer">
        <div className="about-container">
          <div className="footer-content">
            <div className="footer-brand">
              <div className="footer-logo">
                <span className="footer-logo-text">SmartRFP</span>
              </div>
              <p className="footer-tagline">Streamline your RFP process with our AI-powered platform. Save time, reduce errors, and win more business.</p>
            </div>
            <div className="footer-links">
              <div className="footer-column">
                <h4>Company</h4>
                <ul>
                  <li><Link to="/about">About Us</Link></li>
                  <li><Link to="/contact">Contact</Link></li>
                  <li><a href="#">Careers</a></li>
                </ul>
              </div>
              <div className="footer-column">
                <h4>Resources</h4>
                <ul>
                  <li><a href="#">Blog</a></li>
                  <li><a href="#">Guides</a></li>
                  <li><a href="#">Webinars</a></li>
                </ul>
              </div>
              <div className="footer-column">
                <h4>Legal</h4>
                <ul>
                  <li><a href="#">Privacy Policy</a></li>
                  <li><a href="#">Terms of Service</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2025 SmartRFP. All rights reserved.</p>
            <p className="version">version 1.1.0</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;