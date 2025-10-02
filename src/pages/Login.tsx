// src/pages/Login.tsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import "../style/Login.css";
import { login,type LoginRequest,type User } from "../api/services/auth"; // import auth functions

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [welcomeClickCount, setWelcomeClickCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const currentPage = "login";
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleWelcomeClick = () => {
    setWelcomeClickCount((prev) => prev + 1);
  };

  useEffect(() => {
    if (welcomeClickCount >= 5) {
      setWelcomeClickCount(0);
    }
  }, [welcomeClickCount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const data: LoginRequest = { username: email, password };
      const response = await login(data);

      // Store token and user info (without password)
      localStorage.setItem("token", response.access_token);
      localStorage.setItem("user", JSON.stringify(response.user));

      // Role-based navigation
      if (response.user.role === "superadmin") {
         navigate("/super-admin-dashboard"); // show overlay instead of redirect
      } else {
        navigate("/dashboard"); // normal admin or other roles
      }
    } catch (err: any) {
      console.error("Login failed:", err.response?.data || err.message);
      setError(err.response?.data?.detail || "Login failed. Try again.");
    }
  };

  return (
    <div className="login-page">
      <NavBar currentPage={currentPage} />

      <div className="login-container">
        <div className="login-content">
          <div className="login-form-container">
            <div className="login-header">
              <h1 onClick={handleWelcomeClick}>
                Welcome <span className="gradient-text">Back</span>
              </h1>
              <p>Sign in to your account to continue</p>
              {error && (
                <p style={{ color: "red", marginBottom: "1rem" }}>{error}</p>
              )}
            </div>

            <form className="login-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M22 6C22 4.9 21.1 4 20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6ZM20 6L12 11L4 6H20ZM20 18H4V8L12 13L20 8V18Z"
                      fill="currentColor"
                    />
                  </svg>
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M18 8H17V6C17 3.24 14.76 1 12 1C9.24 1 7 3.24 7 6V8H6C4.9 8 4 8.9 4 10V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V10C20 8.9 19.1 8 18 8ZM12 17C10.9 17 10 16.1 10 15C10 13.9 10.9 13 12 13C13.1 13 14 13.9 14 15C14 16.1 13.1 17 12 17ZM15 8H9V6C9 4.34 10.34 3 12 3C13.66 3 15 4.34 15 6V8Z"
                      fill="currentColor"
                    />
                  </svg>
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                />
              </div>

              <div className="form-options">
                <div className="remember-me">
                  <input type="checkbox" id="remember" />
                  <label htmlFor="remember">Remember me</label>
                </div>
                <Link to="/forgot-password" className="forgot-password">
                  Forgot password?
                </Link>
              </div>

              <button type="submit" className="login-button">
                <span>Sign In</span>
                <div className="btn-glow"></div>
              </button>
            </form>

            <div className="login-footer">
              <p>
                Don't have an account?{" "}
                <Link to="/Signup" className="signup-link">
                  Sign up
                </Link>
              </p>
            </div>
          </div>

          <div className="login-3d-element">
            <div className="floating-cube">
              <div className="cube-face cube-front"></div>
              <div className="cube-face cube-back"></div>
              <div className="cube-face cube-right"></div>
              <div className="cube-face cube-left"></div>
              <div className="cube-face cube-top"></div>
              <div className="cube-face cube-bottom"></div>
            </div>
          </div>
        </div>
      </div>

      
    </div>
  );
};

export default Login;


//[login page before chnage333333333333##############################################################################]

// import { useState, useEffect } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import NavBar from '../components/NavBar';
// import SuperAdmin from './SuperAdmin';
// import '../style/Login.css';

// const Login: React.FC = () => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [showOverlay, setShowOverlay] = useState(false);
//   const [welcomeClickCount, setWelcomeClickCount] = useState(0);
//   const currentPage = 'login';
//   const navigate = useNavigate();

//   // Scroll to top on mount
//   useEffect(() => {
//     window.scrollTo(0, 0);
//   }, []);

//   const handleWelcomeClick = () => {
//     setWelcomeClickCount(prevCount => prevCount + 1);
//   };

//   useEffect(() => {
//     if (welcomeClickCount >= 5) {
//       setShowOverlay(true);
//       setWelcomeClickCount(0); // Reset count after showing overlay
//     }
//   }, [welcomeClickCount]);
  
 

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     console.log('Login attempt with:', { email, password });

//     // User credentials and roles
//     const users = {
//       'a@example.com': { password: '12345678', role: 'user', name: 'John Doe' },
//       'admin@example.com': { password: 'admin123', role: 'admin', name: 'Admin User' }
//     };

//     const user = users[email as keyof typeof users];

//     if (user && user.password === password) {
//       // Store user data in localStorage for persistence
//       const userData = {
//         email,
//         name: user.name,
//         role: user.role,
//         isLoggedIn: true
//       };
      
//       localStorage.setItem('userData', JSON.stringify(userData));
//       navigate('/dashboard');
//     } else {
//       alert('Invalid credentials. Please use:\n\nRegular User:\nemail: a@example.com\npassword: 12345678\n\nAdmin User:\nemail: admin@example.com\npassword: admin123');
//     }
//   };

//   return (
//     <div className="login-page">
//       <NavBar currentPage={currentPage} />

//       <div className="login-container">
//         <div className="login-content">
//           <div className="login-form-container">
//             <div className="login-header">
//               <h1 onClick={handleWelcomeClick}>Welcome <span className="gradient-text">Back</span></h1>
//               <p>Sign in to your account to continue</p>
//             </div>

//             <form className="login-form" onSubmit={handleSubmit}>
//               <div className="form-group">
//                 <label htmlFor="email">
//                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
//                     <path d="M22 6C22 4.9 21.1 4 20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6ZM20 6L12 11L4 6H20ZM20 18H4V8L12 13L20 8V18Z" fill="currentColor" />
//                   </svg>
//                   Email
//                 </label>
//                 <input
//                   type="email"
//                   id="email"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   required
//                   placeholder="Enter your email"
//                 />
//               </div>

//               <div className="form-group">
//                 <label htmlFor="password">
//                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
//                     <path d="M18 8H17V6C17 3.24 14.76 1 12 1C9.24 1 7 3.24 7 6V8H6C4.9 8 4 8.9 4 10V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V10C20 8.9 19.1 8 18 8ZM12 17C10.9 17 10 16.1 10 15C10 13.9 10.9 13 12 13C13.1 13 14 13.9 14 15C14 16.1 13.1 17 12 17ZM15 8H9V6C9 4.34 10.34 3 12 3C13.66 3 15 4.34 15 6V8Z" fill="currentColor" />
//                   </svg>
//                   Password
//                 </label>
//                 <input
//                   type="password"
//                   id="password"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   required
//                   placeholder="Enter your password"
//                 />
//               </div>

//               <div className="form-options">
//                 <div className="remember-me">
//                   <input type="checkbox" id="remember" />
//                   <label htmlFor="remember">Remember me</label>
//                 </div>
//                 <Link to="/forgot-password" className="forgot-password">Forgot password?</Link>
//               </div>

//               <button type="submit" className="login-button">
//                 <span>Sign In</span>
//                 <div className="btn-glow"></div>
//               </button>
//             </form>

//             <div className="login-footer">
//               <p>Don't have an account? <Link to="/signup" className="signup-link">Sign up</Link></p>
//             </div>

//             {/* Demo Credentials Info */}
//             <div className="demo-credentials" style={{
//               marginTop: '2rem',
//               padding: '1rem',
//               background: 'rgba(59, 130, 246, 0.1)',
//               borderRadius: '8px',
//               border: '1px solid rgba(59, 130, 246, 0.3)',
//               fontSize: '0.875rem',
//               color: '#a0aec0'
//             }}>
//               <h4 style={{ margin: '0 0 0.5rem 0', color: '#3b82f6' }}>Demo Credentials:</h4>
//               <div style={{ marginBottom: '0.5rem' }}>
//                 <strong>Regular User:</strong> a@example.com / 12345678
//               </div>
//               <div>
//                 <strong>Admin User:</strong> admin@example.com / admin123
//               </div>
//             </div>
//           </div>

//           <div className="login-3d-element">
//             <div className="floating-cube">
//               <div className="cube-face cube-front"></div>
//               <div className="cube-face cube-back"></div>
//               <div className="cube-face cube-right"></div>
//               <div className="cube-face cube-left"></div>
//               <div className="cube-face cube-top"></div>
//               <div className="cube-face cube-bottom"></div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Super Admin Login Overlay */}
//       {showOverlay && (
//         <SuperAdmin onClose={() => setShowOverlay(false)} />
//       )}
//     </div>
//   );
// };

// export default Login;