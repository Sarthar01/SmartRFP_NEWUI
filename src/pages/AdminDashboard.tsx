import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaUsers,
  FaBuilding,
  FaUserCircle,
  FaTrash,
  FaPlus,
} from "react-icons/fa";
import "../style/AdminDashboard.css";
import { useNavigate } from "react-router-dom";


// ---------------- Types ----------------
interface OrgUser {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  joined: string;
}

interface Organization {
  id: number;
  name: string;
  subscription: string;
  userCount: number;
  activeUsers: number;
  maxUsers: number;
  userLimitReached: boolean;
  totalRFP: number;
  activeRFP: number;                                 
  status: string;
}

interface Role {
  id: number;
  name: string;
  description?: string;
}

interface AdminProfile {
  id: number;
  full_name: string;
  email: string;
  role: string;
}

// ---------------- Component ----------------
const AdminDashboard: React.FC = () => {
  const [section, setSection] = useState<"overview" | "users" | "roles" | "profile">("overview");
  const [org, setOrg] = useState<Organization | null>(null);
  const [users, setUsers] = useState<OrgUser[]>([]);
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [invitePhone, setInvitePhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState(false);
  const navigate = useNavigate();

  const [roles] = useState<Role[]>([
    { id: 1, name: "user", description: "Standard user" },
    { id: 2, name: "admin", description: "Administrator" },
  ]);

  const api = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL?.replace(/\/$/, "") || ""}/v1`,
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });

  // -------- Fetch Data --------
  const fetchOrg = async () => {
    try {
      const res = await api.get("/admin/organization/stats");
      const d = res.data;
      setOrg({
        id: 1,
        name: d.organization || "Organization",
        subscription: d.subscription_tier || "Standard",
        userCount: d.total_users || 0,
        activeUsers: d.active_users || 0,
        maxUsers: d.max_users || 0,
        userLimitReached: d.user_limit_reached || false,
        totalRFP: d.total_rfp_projects || 0,
        activeRFP: d.active_rfp_projects || 0,
        status: d.user_limit_reached ? "full" : "active",
      });
    } catch (err) {
      console.error("Error fetching org stats", err);
      setError("Failed to fetch organization stats");
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get("/admin/organization/users");
      const d = res.data as any[];
      setUsers(
        d.map((u: any) => ({
          id: u.id,
          name: u.full_name || "Unknown",
          email: u.email,
          role: u.role,
          status: u.is_active ? "active" : "inactive",
          joined: u.created_at,
        }))
      );
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await api.get("/auth/me");
      setProfile(res.data);
    } catch (err) {
      console.error("Error fetching profile", err);
    }
  };

  // -------- Actions --------
  const inviteUser = async () => {
    if (!inviteEmail || !inviteName || !invitePhone) {
      setError("All fields are required");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail)) {
      setError("Invalid email address");
      return;
    }

    const phoneRegex = /^\+\d{10,15}$/;
    if (!phoneRegex.test(invitePhone)) {
      setError("Phone number must be in format +1234567890 with correct digits");
      return;
    }

    try {
      const payload = {
        email: inviteEmail.trim(),
        full_name: inviteName.trim(),
        phone_number: invitePhone.trim(),
      };

      await api.post("/admin/organization/users", payload);
      setInviteEmail("");
      setInviteName("");
      setInvitePhone("");
      setError("");
      fetchUsers();
    } catch (err: any) {
      console.error("Error inviting user", err.response?.data);
      setError(err.response?.data?.message || "Failed to invite user");
    }
  };

  const updateUserRole = async (id: number, newRole: string) => {
    try {
      await api.patch(`/admin/organization/users/${id}/role`, null, {
        params: { new_role: newRole },
      });
      setError("");
      fetchUsers();
    } catch (err: any) {
      console.error("Error updating role:", err.response?.data);
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  const deleteUser = async (id: number) => {
    if (!window.confirm("Are you sure you want to deactivate this user?")) return;

    try {
      await api.delete(`/admin/organization/users/${id}`);
      setError(""); 
      fetchUsers(); 
    } catch (err: any) {
      console.error("Error deactivating user:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Failed to deactivate user");
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchOrg(), fetchUsers(), fetchProfile()]).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading admin dashboard...</div>;

  return (
    <div className="admin-dashboard">
      {/* Navbar */}
      <header className="navbar">
        <div className="logo">Admin Panel</div>
        <nav>

    <button
      className="btn-back-navbar"
      onClick={() => navigate("/dashboard")}
    >
      ← Back to Dashboard
    </button>

  <button className={section === "overview" ? "active" : ""} onClick={() => setSection("overview")}>
    <FaBuilding /> Overview
  </button>
  <button className={section === "users" ? "active" : ""} onClick={() => setSection("users")}>
    <FaUsers /> Users
  </button>
  <button className={section === "profile" ? "active" : ""} onClick={() => setSection("profile")}>
    <FaUserCircle /> Profile
  </button>
</nav>
      </header>

      {/* Content */}
      <main className="content">
        <h1 className="dashboard-title">Admin Dashboard</h1>
        {error && <div className="error">{error}</div>}

        {/* Org Overview */}
        {section === "overview" && org && (
          <div className="card overview-card">
            <h2>Organization Overview</h2>
            <p><strong>Name:</strong> {org.name}</p>
            <p><strong>Subscription:</strong> {org.subscription}</p>
            <p><strong>Users:</strong> {org.userCount} / {org.maxUsers}</p>
            <p><strong>Active Users:</strong> {org.activeUsers}</p>
            <p><strong>User Limit Reached:</strong> 
              <span className={`status-badge ${org.userLimitReached ? 'full' : 'active'}`}>
                {org.userLimitReached ? "Yes" : "No"}
              </span>
            </p>
            <p><strong>Total RFP Projects:</strong> {org.totalRFP}</p>
            <p><strong>Active RFP Projects:</strong> {org.activeRFP}</p>
            <p><strong>Status:</strong> 
              <span className={`status-badge ${org.status}`}>{org.status}</span>
            </p>
          </div>
        )}

        {/* Users Section */}
        {section === "users" && (
          <div className="card users-card">
            <h2>Organization Users</h2>
            <div className="invite-form">
              <input type="text" placeholder="Full name" value={inviteName} onChange={(e) => { setInviteName(e.target.value); setError(""); }} />
              <input type="text" placeholder="Phone number" value={invitePhone} onChange={(e) => { setInvitePhone(e.target.value); setError(""); }} />
              <input type="email" placeholder="User email" value={inviteEmail} onChange={(e) => { setInviteEmail(e.target.value); setError(""); }} />
              <button onClick={inviteUser} className="btn-primary" disabled={inviting}><FaPlus /> Invite</button>
            </div>
            {org?.userLimitReached && <div className="warning">User limit reached! Cannot invite more users.</div>}

            <table className="user-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      <select value={u.role} onChange={(e) => updateUserRole(u.id, e.target.value)}>
                        {roles.map((r) => (
                          <option key={r.id} value={r.name}>{r.name}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <span className={`status-badge ${u.status}`}>
                        {u.status}
                      </span>
                    </td>
                    <td>{new Date(u.joined).toLocaleDateString()}</td>
                    <td>
                      <button onClick={() => deleteUser(u.id)} className="btn-danger"><FaTrash /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Profile Section */}
        {section === "profile" && profile && (
          <div className="card profile-card">
            <h2>My Profile</h2>
            <p><strong>Name:</strong> {profile.full_name}</p>
            <p><strong>Email:</strong> {profile.email}</p>
            <p><strong>Role:</strong> {profile.role}</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
