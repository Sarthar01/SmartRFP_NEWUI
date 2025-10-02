import { useState, useEffect, useCallback } from "react";
import {
  FaTachometerAlt,
  FaFileAlt,
  FaFileSignature,
  FaBook,
  FaUser,
  FaSignOutAlt,
  FaChevronLeft,
  FaChevronRight,
  FaCog,
  FaLock,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "../style/sidebar.css";
import axios from "axios";

// ---------------------- Constants ----------------------
const MOBILE_BREAKPOINT = 768;
const SIDEBAR_STATE_KEY = "sidebarCollapsed";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL?.replace(/\/$/, "") || ""}/v1`,
  headers: { "Content-Type": "application/json" },
});

// ---------------------- Menu Config ----------------------
const BASE_MENU_ITEMS = [
  { id: "dashboard", icon: FaTachometerAlt, label: "Dashboard", path: "/dashboard" },
  { id: "proposal", icon: FaFileAlt, label: "Proposal", path: "/proposal" },
  { id: "template", icon: FaFileSignature, label: "Template", path: "/template" },
  { id: "knowledge", icon: FaBook, label: "Knowledge Base", path: "/knowledge" },
  { id: "settings", icon: FaCog, label: "Settings", path: "/settings" },
];

const ADMIN_MENU_ITEM = {
  id: "admin-panel",
  icon: FaUser,
  label: "Admin Panel",
  path: "/admin-panel",
};
const SUPERADMIN_MENU_ITEM = {
  id: "superadmin-dashboard",
  icon: FaUser,
  label: "Super Admin Dashboard",
  path: "/super-admin-dashboard",
};

// ---------------------- Interfaces ----------------------
interface UserData {
  email: string;
  name: string;
  role: "user" | "admin" | "superadmin";
}

// ---------------------- Component ----------------------
const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      const savedState = localStorage.getItem(SIDEBAR_STATE_KEY);
      return savedState ? JSON.parse(savedState) : false;
    } catch {
      return false;
    }
  });

  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const navigate = useNavigate();

  // persist collapsed state
  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_STATE_KEY, JSON.stringify(collapsed));
    } catch (err) {
      console.error("[SIDEBAR] Failed to save collapsed state", err);
    }
  }, [collapsed]);

  // ✅ Fetch user profile from API once
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUserData({ name: "Guest", email: "Not logged in", role: "user" });
      return;
    }

    api
      .get("/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        setUserData({
          name: res.data.full_name || "User",
          email: res.data.email || "user@example.com",
          role: res.data.role || "user",
        });
      })
      .catch(() => {
        setUserData({ name: "Guest", email: "Not logged in", role: "user" });
      });
  }, []);

  // menu items
  const getMenuItems = useCallback(() => {
    const items = [...BASE_MENU_ITEMS];
    if (userData?.role === "admin") items.push(ADMIN_MENU_ITEM);
    else if (userData?.role === "superadmin") items.push(SUPERADMIN_MENU_ITEM);
    return items;
  }, [userData?.role]);

  const checkScreenSize = useCallback(() => {
    const mobile = window.innerWidth <= MOBILE_BREAKPOINT;
    setIsMobile(mobile);
    if (!mobile) setMobileOpen(false);
  }, []);

  useEffect(() => {
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, [checkScreenSize]);

  const toggleSidebar = useCallback(() => {
    if (isMobile) setMobileOpen((prev) => !prev);
    else setCollapsed((prev: any) => !prev);
  }, [isMobile]);

  const closeMobileSidebar = useCallback(() => {
    if (isMobile && mobileOpen) setMobileOpen(false);
  }, [isMobile, mobileOpen]);

  const handleNavigation = useCallback(
    (path: string) => {
      navigate(path);
      closeMobileSidebar();
    },
    [navigate, closeMobileSidebar]
  );

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    setUserData({ name: "Guest", email: "Not logged in", role: "user" });
    closeMobileSidebar();
    navigate("/");
  }, [navigate, closeMobileSidebar]);

  const handleChangePassword = async () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      setMessage("❌ New password and confirm password do not match.");
      return;
    }
    try {
      setLoading(true);
      setMessage(null);
      const token = localStorage.getItem("token");
      await api.post(
        "/auth/change-password",
        {
          current_password: passwords.currentPassword,
          new_password: passwords.newPassword,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("✅ Password changed successfully.");
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setShowPasswordForm(false);
    } catch (err: any) {
      setMessage(`❌ ${err.response?.data?.detail || "Failed to change password."}`);
    } finally {
      setLoading(false);
    }
  };

  const renderMenuItem = useCallback(
    (item: { id: string; icon: React.ComponentType; label: string; path: string }) => {
      const IconComponent = item.icon;
      return (
        <button
          key={item.id}
          className={`menu-item ${item.id.includes("admin") ? "admin-item" : ""}`}
          onClick={() => handleNavigation(item.path)}
        >
          <IconComponent />
          <span>{item.label}</span>
        </button>
      );
    },
    [handleNavigation]
  );

  const menuItems = getMenuItems();
  const currentUser = userData || { name: "Loading...", email: "...", role: "user" as const };

  // ---------------------- Profile Modal ----------------------
  const ProfileModal = () => (
    <div className="modal-overlay profile-modal" onClick={() => setShowProfileModal(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>👤 Profile</h3>
        <p><strong>Name:</strong> {currentUser.name}</p>
        <p><strong>Email:</strong> {currentUser.email}</p>
        <p><strong>Role:</strong> {currentUser.role === "superadmin" ? "Super Admin" : currentUser.role === "admin" ? "Admin" : "User"}</p>

        {!showPasswordForm ? (
          <button className="change-password-btn" onClick={() => setShowPasswordForm(true)}>
            <FaLock /> Change Password
          </button>
        ) : (
          <div className="password-form">
            <input
              type="password"
              placeholder="Current Password"
              value={passwords.currentPassword}
              onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
            />
            <input
              type="password"
              placeholder="New Password"
              value={passwords.newPassword}
              onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              value={passwords.confirmPassword}
              onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
            />
            <button className="save-password-btn" onClick={handleChangePassword} disabled={loading}>
              {loading ? "Changing..." : "Save Password"}
            </button>
            <button className="cancel-btn" onClick={() => setShowPasswordForm(false)}>Cancel</button>
          </div>
        )}

        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );

  // ---------------------- Desktop & Mobile Sidebar ----------------------
  return (
    <>
      <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
        <div className="sidebar-top">
          <button className="collapse-btn" onClick={toggleSidebar}>
            {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
          </button>

          <div className="logo">
  SmartRFP
  {userData?.role === "admin" && !collapsed && (
    <span style={{ fontSize: "0.75rem", color: "#60a5fa", display: "block" }}>
      Admin Portal
    </span>
  )}
 
</div>

          <nav className="menu">{menuItems.map(renderMenuItem)}</nav>
        </div>

        <div className="sidebar-bottom">
          <div className="profile" onClick={() => setShowProfileModal(true)}>
            <div className="profile-section">
              <div className="profile-icon"><FaUser /></div>
              <div className="user-info">
                <div className="name">
  {currentUser.name}
  {userData?.role === "admin" && !collapsed && (
    <span style={{ fontSize: "0.7rem", color: "#60a5fa", marginLeft: "0.5rem" }}>
      (Admin)
    </span>
  )}
  
</div>
                <div className="email">{currentUser.email}</div>
              </div>
            </div>
          </div>
          <button className="logout" onClick={handleLogout}>
            <FaSignOutAlt /> <span>Logout</span>
          </button>
        </div>
      </div>

      {showProfileModal && <ProfileModal />}
    </>
  );
};

export default Sidebar;




// import { useState, useEffect, useCallback } from "react";
// import {
//   FaTachometerAlt,
//   FaFileAlt,
//   FaFileSignature,
//   FaBook,
//   FaUser,
//   FaSignOutAlt,
//   FaChevronLeft,
//   FaChevronRight,
//   FaBars,
//   FaTimes,
//   FaCog,
// } from "react-icons/fa";
// import { useNavigate } from "react-router-dom";
// import "../style/sidebar.css";
// import axios from "axios";

// // ---------------------- Constants ----------------------
// const MOBILE_BREAKPOINT = 768;
// const SIDEBAR_STATE_KEY = "sidebarCollapsed";

// const api = axios.create({
//   baseURL: `${import.meta.env.VITE_API_URL?.replace(/\/$/, "") || ""}/v1`,
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// // ---------------------- Menu Config ----------------------
// const BASE_MENU_ITEMS = [
//   { id: "dashboard", icon: FaTachometerAlt, label: "Dashboard", path: "/dashboard" },
//   { id: "proposal", icon: FaFileAlt, label: "Proposal", path: "/proposal" },
//   { id: "template", icon: FaFileSignature, label: "Template", path: "/template" },
//   { id: "knowledge", icon: FaBook, label: "Knowledge Base", path: "/knowledge" },
//   { id: "settings", icon: FaCog, label: "Settings", path: "/settings" },
// ];

// const ADMIN_MENU_ITEM = {
//   id: "admin-panel",
//   icon: FaUser,
//   label: "Admin Panel",
//   path: "/admin-panel",
// };


// // ---------------------- Interfaces ----------------------
// interface UserData {
//   email: string;
//   name: string;
//   role: "user" | "admin" |`superadmin`;
// }

// // ---------------------- Component ----------------------
// const Sidebar = () => {
//   const [collapsed, setCollapsed] = useState(() => {
//     try {
//       const savedState = localStorage.getItem(SIDEBAR_STATE_KEY);
//       return savedState ? JSON.parse(savedState) : false;
//     } catch {
//       return false;
//     }
//   });

//   const [mobileOpen, setMobileOpen] = useState(false);
//   const [isMobile, setIsMobile] = useState(false);
//   const [userData, setUserData] = useState<UserData | null>(null);

//   const navigate = useNavigate();

//   // persist collapsed state
//   useEffect(() => {
//     try {
//       localStorage.setItem(SIDEBAR_STATE_KEY, JSON.stringify(collapsed));
//     } catch (err) {
//       console.error("[SIDEBAR] Failed to save collapsed state", err);
//     }
//   }, [collapsed]);

//   // ✅ Fetch user profile from API once
//   useEffect(() => {
//     const token = localStorage.getItem("token");

//     if (!token) {
//       console.warn("[PROFILE] No accessToken found → Guest mode");
//       setUserData({ name: "Guest", email: "Not logged in", role: "user" });
//       return;
//     }

//     console.log("[PROFILE] accessToken found → fetching profile...");

//     api
//       .get("/auth/me", {
//         headers: { Authorization: `Bearer ${token}` },
//       })
//       .then((res) => {
//         console.log("[PROFILE] Loaded successfully:", res.data);
//         setUserData({
//           name: res.data.full_name || "User",
//           email: res.data.email || "user@example.com",
//           role: res.data.role || "user",
//         });
//       })
//       .catch((err) => {
//         console.error("[PROFILE] Failed to fetch user profile:", err.response?.data || err.message);
//         setUserData({ name: "Guest", email: "Not logged in", role: "user" });
//       });
//   }, []);

//   // menu items
// const getMenuItems = useCallback(() => {
//   const items = [...BASE_MENU_ITEMS];
//   if (userData?.role === "admin") {
//     items.push(ADMIN_MENU_ITEM);
//   } 
//   return items;
// }, [userData?.role]);

//   const checkScreenSize = useCallback(() => {
//     const mobile = window.innerWidth <= MOBILE_BREAKPOINT;
//     setIsMobile(mobile);
//     if (!mobile) setMobileOpen(false);
//   }, []);

//   useEffect(() => {
//     checkScreenSize();
//     window.addEventListener("resize", checkScreenSize);
//     return () => window.removeEventListener("resize", checkScreenSize);
//   }, [checkScreenSize]);

//   const toggleSidebar = useCallback(() => {
//     if (isMobile) {
//       setMobileOpen((prev) => !prev);
//     } else {
//       setCollapsed((prev: any) => !prev);
//     }
//   }, [isMobile]);

//   const closeMobileSidebar = useCallback(() => {
//     if (isMobile && mobileOpen) setMobileOpen(false);
//   }, [isMobile, mobileOpen]);

//   const handleNavigation = useCallback(
//     (path: string) => {
//       navigate(path);
//       closeMobileSidebar();
//     },
//     [navigate, closeMobileSidebar]
//   );

//   const handleLogout = useCallback(() => {
//     localStorage.removeItem("accessToken");
//     console.log("[LOGOUT] Token removed. Switching to Guest.");
//     setUserData({ name: "Guest", email: "Not logged in", role: "user" });
//     closeMobileSidebar();
//     navigate("/");
//   }, [navigate, closeMobileSidebar]);

//   const renderMenuItem = useCallback(
//     (item: { id: string; icon: React.ComponentType; label: string; path: string }) => {
//       const IconComponent = item.icon;
//       return (
//         <button
//           key={item.id}
//           className={`menu-item ${item.id === "admin-panel" ? "admin-item" : ""}`}
//           data-tooltip={item.label}
//           title={item.label}
//           onClick={() => handleNavigation(item.path)}
//           aria-label={item.label}
//         >
//           <IconComponent />
//           <span>{item.label}</span>
//         </button>
//       );
//     },
//     [handleNavigation]
//   );

//   const menuItems = getMenuItems();
//   const currentUser = userData || { name: "Loading...", email: "...", role: "user" as const };

//   // ---------------------- Mobile Sidebar ----------------------
//   if (isMobile) {
//     return (
//       <>
//         <div className="mobile-navbar">
//           <button className="hamburger-btn" onClick={toggleSidebar}>
//             {mobileOpen ? <FaTimes /> : <FaBars />}
//           </button>
//           <div className="mobile-logo">
//             SmartRFP
//             {userData?.role === "admin" && (
//               <span style={{ fontSize: "0.7rem", color: "#60a5fa", marginLeft: "0.5rem" }}>
//                 ADMIN
//               </span>
//             )}
//           </div>
//         </div>

//         {mobileOpen && (
//           <>
//             <div className="mobile-overlay" onClick={closeMobileSidebar} />
//             <div className="sidebar mobile-sidebar open">
//               <div className="sidebar-top">
//                 <div className="logo">
//                   SmartRFP
//                   {userData?.role === "admin" && (
//                     <span style={{ fontSize: "0.8rem", color: "#60a5fa", display: "block" }}>
//                       Admin Portal
//                     </span>
//                   )}
//                 </div>
//                 <nav className="menu">{menuItems.map(renderMenuItem)}</nav>
//               </div>

//               <div className="sidebar-bottom">
//                 <div className="profile">
//                   <div className="profile-section">
//                     <div className="profile-icon">
//                       <FaUser />
//                     </div>
//                     <div className="user-info">
//                       <div className="name">
//                         {currentUser.name}
//                         {userData?.role === "admin" && (
//                           <span style={{ fontSize: "0.7rem", color: "#60a5fa", marginLeft: "0.5rem" }}>
//                             (Admin)
//                           </span>
//                         )}
//                         {userData?.role === "superadmin" && (
//                           <span style={{ fontSize: "0.7rem", color: "#60a5fa", marginLeft: "0.5rem" }}>
//                             (Super Admin)
//                           </span>
//                         )}
//                       </div>
//                       <div className="email">{currentUser.email}</div>
//                     </div>
//                   </div>
//                   <button className="logout" onClick={handleLogout}>
//                     <FaSignOutAlt />
//                     <span>Logout</span>
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </>
//         )}
//       </>
//     );
//   }

//   // ---------------------- Desktop Sidebar ----------------------
//   return (
//     <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
//       <div className="sidebar-top">
//         <button
//           className="collapse-btn"
//           onClick={toggleSidebar}
//           title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
//         >
//           {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
//         </button>

//         <div className="logo">
//           SmartRFP
//           {userData?.role === "admin" && !collapsed && (
//             <span style={{ fontSize: "0.75rem", color: "#60a5fa", display: "block" }}>
//               Admin Portal
//             </span>
//           )}
//           {userData?.role === "superadmin" && !collapsed && (
//             <span style={{ fontSize: "0.75rem", color: "#60a5fa", display: "block" }}>
//               Super Admin Portal
//             </span>
//           )}
//         </div>
      

//         <nav className="menu">{menuItems.map(renderMenuItem)}</nav>
//       </div>

//       <div className="sidebar-bottom">
//         <div className="profile">
//           <div className="profile-section">
//             <div className="profile-icon">
//               <FaUser />
//             </div>
//             <div className="user-info">
//               <div className="name">
//                 {currentUser.name}
//                 {userData?.role === "admin" && !collapsed && (
//                   <span style={{ fontSize: "0.7rem", color: "#60a5fa", marginLeft: "0.5rem" }}>
//                     (Admin)
//                   </span>
//                 )}
//                 {userData?.role === "superadmin" && !collapsed && (
//                   <span style={{ fontSize: "0.7rem", color: "#60a5fa", marginLeft: "0.5rem" }}>
//                     (Super Admin)
//                   </span>
//                 )}
//               </div>
//               <div className="email">{currentUser.email}</div>
//             </div>
//           </div>
//           <button className="logout" onClick={handleLogout}>
//             <FaSignOutAlt />
//             <span>Logout</span>
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Sidebar;









// import { useState, useEffect, useCallback } from "react";
// import {
//   FaTachometerAlt,
//   FaFileAlt,
//   FaFileSignature,
//   FaBook,
//   FaUser,
//   FaSignOutAlt,
//   FaChevronLeft,
//   FaChevronRight,
//   FaBars,
//   FaTimes,
//   FaCog,
// } from "react-icons/fa";
// import { useNavigate } from "react-router-dom";
// import "../style/sidebar.css";

// // Constants
// const MOBILE_BREAKPOINT = 768;
// const SIDEBAR_STATE_KEY = "sidebarCollapsed"; // Key for localStorage


// // Base menu items configuration
// const BASE_MENU_ITEMS = [
//   {
//     id: "dashboard",
//     icon: FaTachometerAlt,
//     label: "Dashboard",
//     path: "/dashboard",
//   },
//   { id: "proposal", icon: FaFileAlt, label: "Proposal", path: "/proposal" },
//   {
//     id: "template",
//     icon: FaFileSignature,
//     label: "Template",
//     path: "/template",
//   },
//   {
//     id: "knowledge",
//     icon: FaBook,
//     label: "Knowledge Base",
//     path: "/knowledge",
//   },
//   { id: "settings", icon: FaUser, label: "Settings", path: "/settings" },
// ];

// // Admin-only menu item
// const ADMIN_MENU_ITEM = {
//   id: "admin-panel",
//   icon: FaCog,
//   label: "Admin Panel",
//   path: "/admin-panel",
// };

// // Interface for user data
// interface UserData {
//   email: string;
//   name: string;
//   role: "user" | "admin";
//   isLoggedIn: boolean;
// }

// const Sidebar = () => {
//   // Initialize collapsed state from localStorage
//   const [collapsed, setCollapsed] = useState(() => {
//     try {
//       const savedState = localStorage.getItem(SIDEBAR_STATE_KEY);
//       return savedState ? JSON.parse(savedState) : false;
//     } catch (error) {
//       console.error("Error loading sidebar state:", error);
//       return false;
//     }
//   });

//   const [mobileOpen, setMobileOpen] = useState(false);
//   const [isMobile, setIsMobile] = useState(false);
//   const [userData, setUserData] = useState<UserData | null>(null);

//   const navigate = useNavigate();

//   // Save collapsed state to localStorage whenever it changes
//   useEffect(() => {
//     try {
//       localStorage.setItem(SIDEBAR_STATE_KEY, JSON.stringify(collapsed));
//     } catch (error) {
//       console.error("Error saving sidebar state:", error);
//     }
//   }, [collapsed]);

//   // Load user data from localStorage
//   useEffect(() => {
//     const storedUserData = localStorage.getItem("userData");
//     if (storedUserData) {
//       try {
//         const parsedData = JSON.parse(storedUserData) as UserData;
//         setUserData(parsedData);
//       } catch (error) {
//         console.error("Error parsing user data:", error);
//         // Clear invalid data
//         localStorage.removeItem("userData");
//       }
//     }
//   }, []);

//   // Generate menu items based on user role
//   const getMenuItems = useCallback(() => {
//     const items = [...BASE_MENU_ITEMS];

//     // Add Admin Panel for admin users
//     if (userData?.role === "admin") {
//       items.push(ADMIN_MENU_ITEM);
//     }

//     return items;
//   }, [userData?.role]);

//   // Memoized screen size checker
//   const checkScreenSize = useCallback(() => {
//     const mobile = window.innerWidth <= MOBILE_BREAKPOINT;
//     setIsMobile(mobile);

//     // Auto-close mobile sidebar when switching to desktop
//     if (!mobile) {
//       setMobileOpen(false);
//     }
//   }, []);

//   // Setup responsive behavior
//   useEffect(() => {
//     checkScreenSize();
//     window.addEventListener("resize", checkScreenSize);

//     return () => window.removeEventListener("resize", checkScreenSize);
//   }, [checkScreenSize]);

//   // Handle sidebar toggle with persistence
//   const toggleSidebar = useCallback(() => {
//     if (isMobile) {
//       setMobileOpen((prev) => !prev);
//     } else {
//       setCollapsed((prev: boolean) => {
//         const newCollapsed = !prev;
//         // State will be saved automatically by the useEffect above
//         return newCollapsed;
//       });
//     }
//   }, [isMobile]);

//   // Close mobile sidebar
//   const closeMobileSidebar = useCallback(() => {
//     if (isMobile && mobileOpen) {
//       setMobileOpen(false);
//     }
//   }, [isMobile, mobileOpen]);

//   // Handle navigation
//   const handleNavigation = useCallback(
//     (path: string) => {
//       navigate(path);
//       closeMobileSidebar();
//     },
//     [navigate, closeMobileSidebar]
//   );

//   // Handle logout
//   const handleLogout = useCallback(() => {
//     // Clear user data from localStorage
//     localStorage.removeItem("userData");
//     setUserData(null);
//     closeMobileSidebar();
//     navigate("/");
//   }, [navigate, closeMobileSidebar]);

//   // Render menu items
//   const renderMenuItem = useCallback(
//     (item: {
//       id: string;
//       icon: React.ComponentType;
//       label: string;
//       path: string;
//     }) => {
//       const IconComponent = item.icon;

//       return (
//         <button
//           key={item.id}
//           className={`menu-item ${
//             item.id === "admin-panel" ? "admin-item" : ""
//           }`}
//           data-tooltip={item.label}
//           title={item.label}
//           onClick={() => handleNavigation(item.path)}
//           aria-label={item.label}
//         >
//           <IconComponent />
//           <span>{item.label}</span>
//         </button>
//       );
//     },
//     [handleNavigation]
//   );

//   // Get current menu items
//   const menuItems = getMenuItems();

//   // Fallback user data if not loaded
//   const currentUser = userData || {
//     name: "Loading...",
//     email: "...",
//     role: "user" as const,
//   };

//   // Mobile sidebar component
//   if (isMobile) {
//     return (
//       <>
//         {/* Mobile Navigation Bar */}
//         <div className="mobile-navbar">
//           <button
//             className="hamburger-btn"
//             onClick={toggleSidebar}
//             aria-label={mobileOpen ? "Close menu" : "Open menu"}
//           >
//             {mobileOpen ? <FaTimes /> : <FaBars />}
//           </button>
//           <div className="mobile-logo">
//             SmartRFP
//             {userData?.role === "admin" && (
//               <span
//                 style={{
//                   fontSize: "0.7rem",
//                   color: "#60a5fa",
//                   marginLeft: "0.5rem",
//                   opacity: 0.8,
//                 }}
//               >
//                 ADMIN
//               </span>
//             )}
//           </div>
//         </div>

//         {/* Mobile Sidebar */}
//         {mobileOpen && (
//           <>
//             <div
//               className="mobile-overlay"
//               onClick={closeMobileSidebar}
//               aria-hidden="true"
//             />
//             <div className="sidebar mobile-sidebar open">
//               <div className="sidebar-top">
//                 <div className="logo">
//                   SmartRFP
//                   {userData?.role === "admin" && (
//                     <span
//                       style={{
//                         fontSize: "0.8rem",
//                         color: "#60a5fa",
//                         display: "block",
//                         marginTop: "0.25rem",
//                         opacity: 0.8,
//                       }}
//                     >
//                       Admin Portal
//                     </span>
//                   )}
//                 </div>
//                 <nav className="menu" role="navigation">
//                   {menuItems.map(renderMenuItem)}
//                 </nav>
//               </div>

//               <div className="sidebar-bottom">
//                 <div className="profile">
//                   <div className="profile-section">
//                     <div className="profile-icon">
//                       <FaUser />
//                     </div>
//                     <div className="user-info">
//                       <div className="name">
//                         {currentUser.name}
//                         {userData?.role === "admin" && (
//                           <span
//                             style={{
//                               fontSize: "0.7rem",
//                               color: "#60a5fa",
//                               marginLeft: "0.5rem",
//                             }}
//                           >
//                             (Admin)
//                           </span>
//                         )}
//                       </div>
//                       <div className="email">{currentUser.email}</div>
//                     </div>
//                   </div>
//                   <button
//                     className="logout"
//                     onClick={handleLogout}
//                     aria-label="Logout"
//                   >
//                     <FaSignOutAlt />
//                     <span>Logout</span>
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </>
//         )}
//       </>
//     );
//   }

//   // Desktop sidebar
//   return (
//     <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
//       <div className="sidebar-top">
//         <button
//           className="collapse-btn"
//           onClick={toggleSidebar}
//           title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
//           aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
//         >
//           {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
//         </button>

//         <div className="logo">
//           SmartRFP
//           {userData?.role === "admin" && !collapsed && (
//             <span
//               style={{
//                 fontSize: "0.75rem",
//                 color: "#60a5fa",
//                 display: "block",
//                 marginTop: "0.25rem",
//                 opacity: 0.8,
//               }}
//             >
//               Admin Portal
//             </span>
//           )}
//         </div>

//         <nav className="menu" role="navigation">
//           {menuItems.map(renderMenuItem)}
//         </nav>
//       </div>

//       <div className="sidebar-bottom">
//         <div className="profile">
//           <div className="profile-section">
//             <div className="profile-icon">
//               <FaUser />
//             </div>
//             <div className="user-info">
//               <div className="name">
//                 {currentUser.name}
//                 {userData?.role === "admin" && !collapsed && (
//                   <span
//                     style={{
//                       fontSize: "0.7rem",
//                       color: "#60a5fa",
//                       marginLeft: "0.5rem",
//                     }}
//                   >
//                     (Admin)
//                   </span>
//                 )}
//               </div>
//               <div className="email">{currentUser.email}</div>
//             </div>
//           </div>
//           <button
//             className="logout"
//             data-tooltip="Logout"
//             title="Logout"
//             onClick={handleLogout}
//             aria-label="Logout"
//           >
//             <FaSignOutAlt />
//             <span>Logout</span>
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Sidebar;
