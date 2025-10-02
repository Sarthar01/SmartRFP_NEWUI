import React from 'react';
import NavBar from '../components/NavBar';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import '../style/Contact.css';

const Contact: React.FC = () => {
    useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
    const currentPage = 'contact';

    return (
        <div className="contact-page">
            <NavBar currentPage={currentPage} />

            {/* Hero Section */}
            <section className="contact-hero">
                <div className="contact-container">
                    <div className="contact-hero-content">
                        <h1 className="contact-title">Contact <span className="gradient-text">Us</span></h1>
                        <p className="contact-subtitle">
                            Have questions about SmartRFP? Our team is here to help you streamline your RFP process.
                        </p>
                    </div>
                </div>
            </section>

            {/* Get in Touch Section */}
            <section className="get-in-touch-section">
                <div className="contact-container">
                    <div className="section-content">
                        <div className="section-header">
                            <div className="icon-container">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M21 5H3C1.89543 5 1 5.89543 1 7V17C1 18.1046 1.89543 19 3 19H21C22.1046 19 23 18.1046 23 17V7C23 5.89543 22.1046 5 21 5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M1 7L12 13L23 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <h2>Get in Touch</h2>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Form and Info Section */}
            <section className="contact-form-section">
                <div className="contact-container">
                    <div className="contact-grid">
                        <div className="contact-form">
                            <form>
                                <div className="form-group">
                                    <label htmlFor="fullName">Full Name</label>
                                    <input type="text" id="fullName" name="fullName" required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="email">Email Address</label>
                                    <input type="email" id="email" name="email" required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="company">Company Name</label>
                                    <input type="text" id="company" name="company" required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="phone">Phone Number</label>
                                    <input type="tel" id="phone" name="phone" />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="message">Message</label>
                                    <textarea id="message" name="message" rows={5} required></textarea>
                                </div>
                                <button type="submit" className="submit-button">
                                    Send Message
                                    <div className="btn-shine"></div>
                                </button>
                            </form>
                        </div>
                        <div className="contact-info">
                            <div className="info-card">
                                <h3>Contact Information</h3>
                                <div className="info-item">
                                    <div className="info-icon">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M21 5H3C1.89543 5 1 5.89543 1 7V17C1 18.1046 1.89543 19 3 19H21C22.1046 19 23 18.1046 23 17V7C23 5.89543 22.1046 5 21 5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M1 7L12 13L23 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                    <div className="info-content">
                                        <h4>Email Us</h4>
                                        <p><a href="mailto:info@smartrfp.com">info@smartrfp.com</a></p>
                                    </div>
                                </div>
                                <div className="info-item">
                                    <div className="info-icon">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M22 16.92V19.92C22 20.4704 21.7893 20.9996 21.4142 21.3747C21.0391 21.7498 20.5099 21.9605 19.96 21.96C16.4223 21.6505 13.0418 20.3193 10.21 18.12C7.57404 16.0861 5.45775 13.4248 4.07 10.39C2.86 7.54 1.99 4.13 2 0.59C2.00046 0.0404478 2.21156 -0.488249 2.58636 -0.862922C2.96115 -1.2376 3.49014 -1.44807 4.04 -1.45H7.04C8.08806 -1.45 8.97357 -0.691228 9.14 0.34C9.28 1.21 9.5 2.06 9.8 2.88C10.0667 3.63344 9.92854 4.46978 9.44 5.04L8.21 6.27C9.40127 9.01393 11.6861 11.2988 14.43 12.49L15.66 11.26C16.2302 10.7715 17.0665 10.6333 17.82 10.9C18.64 11.2 19.49 11.42 20.36 11.56C21.4123 11.7292 22.1695 12.6379 22.15 13.7L22 16.92Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                    <div className="info-content">
                                        <h4>Call Us</h4>
                                        <p><a href="tel:+15551234567">+1 (555) 123-4567</a></p>
                                    </div>
                                </div>
                                <div className="info-item">
                                    <div className="info-icon">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                    <div className="info-content">
                                        <h4>Visit Us</h4>
                                        <p>123 Tech Plaza, Suite 400<br />San Francisco, CA 94105<br />United States</p>
                                    </div>
                                </div>
                            </div>
                            <div className="info-card">
                                <h3>Business Hours</h3>
                                <p>Monday - Friday: 9:00 AM - 6:00 PM (EST)<br />Saturday - Sunday: Closed</p>
                            </div>
                            <div className="info-card">
                                <h3>Connect With Us</h3>
                                <div className="social-icons">
                                    <a href="#" className="social-icon" aria-label="Twitter">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M23 3.00005C22.0424 3.67552 20.9821 4.19216 19.86 4.53005C19.2577 3.83756 18.4573 3.34674 17.567 3.12397C16.6767 2.90121 15.7395 2.95724 14.8821 3.2845C14.0247 3.61176 13.2884 4.19445 12.773 4.95376C12.2575 5.71308 11.9877 6.61238 12 7.53005V8.53005C10.2426 8.57561 8.50127 8.18586 6.93101 7.39549C5.36074 6.60513 4.01032 5.43868 3 4.00005C3 4.00005 -1 13 8 17C5.94053 18.398 3.48716 19.099 1 19C10 24 21 19 21 7.50005C20.9991 7.2215 20.9723 6.94364 20.92 6.67005C21.9406 5.66354 22.6608 4.39276 23 3.00005Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </a>
                                    <a href="#" className="social-icon" aria-label="LinkedIn">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M16 8C17.5913 8 19.1174 8.63214 20.2426 9.75736C21.3679 10.8826 22 12.4087 22 14V21H18V14C18 13.4696 17.7893 12.9609 17.4142 12.5858C17.0391 12.2107 16.5304 12 16 12C15.4696 12 14.9609 12.2107 14.5858 12.5858C14.2107 12.9609 14 13.4696 14 14V21H10V14C10 12.4087 10.6321 10.8826 11.7574 9.75736C12.8826 8.63214 14.4087 8 16 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M6 9H2V21H6V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M4 6C5.10457 6 6 5.10457 6 4C6 2.89543 5.10457 2 4 2C2.89543 2 2 2.89543 2 4C2 5.10457 2.89543 6 4 6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </a>
                                    <a href="#" className="social-icon" aria-label="Facebook">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M18 2H15C13.6739 2 12.4021 2.52678 11.4645 3.46447C10.5268 4.40215 10 5.67392 10 7V10H7V14H10V22H14V14H17L18 10H14V7C14 6.73478 14.1054 6.48043 14.2929 6.29289C14.4804 6.10536 14.7348 6 15 6H18V2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </a>
                                    <a href="#" className="social-icon" aria-label="GitHub">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M9 19C4.7 20.4 4.7 16.5 3 16M15 21V17.5C15 16.5 15.1 16.1 14.5 15.5C17.3 15.2 20 14.1 20 9.50001C19.9988 8.30498 19.5325 7.15732 18.7 6.30001C19.0905 5.26198 19.0545 4.11164 18.6 3.10001C18.6 3.10001 17.5 2.80001 15.1 4.40001C13.0672 3.8706 10.9328 3.8706 8.9 4.40001C6.5 2.80001 5.4 3.10001 5.4 3.10001C4.94548 4.11164 4.90953 5.26198 5.3 6.30001C4.46745 7.15732 4.00122 8.30498 4 9.50001C4 14.1 6.7 15.2 9.5 15.5C8.9 16.1 8.9 16.7 9 17.5V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Map Section */}
            <section className="map-section">
                <div className="contact-container">
                    <div className="map-placeholder">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.8521136186447!2d77.59456631482236!3d12.917403990899597!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae149e6dfced43%3A0x8a8a8a8a8a8a8a8a!2sBangalore%2C%20Karnataka%2C%20India!5e0!3m2!1sen!2sus!4v1635000000000!5m2!1sen!2sus"
                            width="100%"
                            height="400"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                        />
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="faq-section">
                <div className="contact-container">
                    <div className="section-header">
                        <div className="icon-container">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M9.09 9.00002C9.3251 8.33169 9.78915 7.76813 10.4 7.40915C11.0108 7.05018 11.7289 6.91896 12.4272 7.03873C13.1255 7.15851 13.7588 7.52154 14.2151 8.06355C14.6713 8.60555 14.9211 9.29154 14.92 10C14.92 12 11.92 13 11.92 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M12 17H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <h2>Frequently Asked Questions</h2>
                    </div>
                    <p className="faq-intro">Find answers to common questions about SmartRFP and our services.</p>

                    <div className="faq-grid">
                        <div className="faq-item">
                            <h3>How does the free trial work?</h3>
                            <p>Our 14-day free trial gives you full access to all SmartRFP features. No credit card is required to sign up, and you can cancel at any time. At the end of your trial, you can choose a plan that fits your needs.</p>
                        </div>
                        <div className="faq-item">
                            <h3>Can I import existing RFP documents?</h3>
                            <p>Yes, SmartRFP supports importing RFP documents in various formats including PDF, Word, and Excel. Our AI will automatically extract key information and organize it for you.</p>
                        </div>
                        <div className="faq-item">
                            <h3>Is my data secure with SmartRFP?</h3>
                            <p>Absolutely. We take security seriously and employ industry-leading encryption and security practices. Your data is stored securely and never shared with third parties without your permission.</p>
                        </div>
                        <div className="faq-item">
                            <h3>Do you offer custom enterprise solutions?</h3>
                            <p>Yes, we offer custom enterprise solutions tailored to your organization's specific needs. Contact our sales team to discuss your requirements and get a personalized demo.</p>
                        </div>
                    </div>

                    <div className="faq-cta">
                        <p>Still have questions?</p>
                        <button className="cta-secondary">
                            Contact Support
                            <div className="btn-shine"></div>
                        </button>
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
                                    <li><Link to="/">Home</Link></li>
                                    <li><Link to="/about">About Us</Link></li>
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

export default Contact;