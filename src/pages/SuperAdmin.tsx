import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/SuperAdmin.css';

interface SuperAdminProps {
    onClose: () => void;
}

const SuperAdmin: React.FC<SuperAdminProps> = ({ onClose }) => {
    const navigate = useNavigate();
    const [adminEmail, setAdminEmail] = useState('');
    const [adminPassword, setAdminPassword] = useState('');
    const [showCaution, setShowCaution] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real application, you would send these credentials to a secure backend
        // For this example, we'll just log them and show a caution for non-admins
        if (adminEmail === 'a@gmail.com' && adminPassword === '2010') {
            console.log('Super Admin Login Successful!');
            alert('Super Admin Login Successful!');
            onClose();
            navigate('/super-admin-dashboard');
        } else {
            setShowCaution(true);
            console.log('Invalid Super Admin Credentials or Unauthorized Access Attempt.');
        }
    };

    return (
        <div className="super-admin-overlay">
            <div className="super-admin-content">
                <button className="close-button" onClick={onClose}>&times;</button>
                <div className="super-admin-header">
                    <h1>Super Admin <span className="gradient-text">Access</span></h1>
                    <p>Authorized personnel only. Proceed with caution.</p>
                </div>

                {showCaution && (
                    <div className="caution-message">
                        <p>🚨 **CAUTION**: Unauthorized access detected! This area is for Super Administrators only. Your attempt has been logged. 🚨</p>
                    </div>
                )}

                <form className="super-admin-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="adminEmail">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22 6C22 4.9 21.1 4 20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6ZM20 6L12 11L4 6H20ZM20 18H4V8L12 13L20 8V18Z" fill="currentColor" />
                            </svg>
                            Admin Email
                        </label>
                        <input
                            type="email"
                            id="adminEmail"
                            value={adminEmail}
                            onChange={(e) => setAdminEmail(e.target.value)}
                            required
                            placeholder="Enter admin email"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="adminPassword">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M18 8H17V6C17 3.24 14.76 1 12 1C9.24 1 7 3.24 7 6V8H6C4.9 8 4 8.9 4 10V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V10C20 8.9 19.1 8 18 8ZM12 17C10.9 17 10 16.1 10 15C10 13.9 10.9 13 12 13C13.1 13 14 13.9 14 15C14 16.1 13.1 17 12 17ZM15 8H9V6C9 4.34 10.34 3 12 3C13.66 3 15 4.34 15 6V8Z" fill="currentColor" />
                            </svg>
                            Admin Password
                        </label>
                        <input
                            type="password"
                            id="adminPassword"
                            value={adminPassword}
                            onChange={(e) => setAdminPassword(e.target.value)}
                            required
                            placeholder="Enter admin password"
                        />
                    </div>

                    <button type="submit" className="admin-login-button">
                        <span>Login as Super Admin</span>
                        <div className="btn-glow"></div>
                    </button>
                </form>

                <div className="super-admin-3d-element">
                    <div className="admin-shield">
                        <div className="shield-body">
                            <div className="shield-core">
                                <div className="admin-crown">
                                    <div className="crown-peak"></div>
                                    <div className="crown-peak"></div>
                                    <div className="crown-peak"></div>
                                </div>
                                <div className="security-rings">
                                    <div className="ring ring-1"></div>
                                    <div className="ring ring-2"></div>
                                    <div className="ring ring-3"></div>
                                </div>
                                <div className="shield-glow"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SuperAdmin;