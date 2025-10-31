

//  

// Show colored badges for status (active, inactive, pending, approved).

// For recent requests in Overview, add request date column → easier tracking.

// For Admin Users, show subscription tier badge.

// Add a search/filter bar in Admin Users list (by company/email).

// In Super Admins, mark Master Admin visually (e.g., crown icon).

//last used code +++++++++++++++++++++++++)))))))))))))____________(*&^%*&^%*&^R*)$(*#_)(@+_)@+)(#()*#)

// src/pages/SuperAdminDashboard.tsx
import React, { useState, useEffect } from 'react';
import '../style/SuperAdminDashboard.css';
import axios from 'axios';

// ---------------------- Helpers & Types ----------------------
interface Organization {
  id: number;
  name: string;
  subscription: 'Standard' | 'Premium' | 'Enterprise';
  userCount: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  company: string;
  orgId: number | null;
  role: string;
  status: "active" | "inactive";
  joined: string;
}
interface AccessRequestType {
  id: number;
  fullName: string;
  organizationName: string;
  email: string;
  status: 'pending' | 'approved' | 'denied';
  requestDate: string;
}

interface AdminUser {
  id: number;
  name: string;
  email: string;
  company: string;
  subscription_tier: 'Standard' | 'Premium' | 'Enterprise';
  totalAllowed: number;
  remaining: number;
  orgId: number | null;
  role: string;
  status: 'active' | 'inactive';
  joined: string;
}

interface SuperAdminUser {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  isMasterAdmin?: boolean;
  isActive?: boolean;
}

interface NewAdminForm {
  name: string;
  email: string;
  company: string;
  subscription: 'Standard' | 'Premium' | 'Enterprise';
  totalAllowed: number;
}

interface NewSuperAdminForm {
  name: string;
  email: string;
  password: string;
}



// Extract array from many possible response shapes (paginated, nested, etc.)
function extractListFromResponse(data: any): any[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.results)) return data.results;
  if (Array.isArray(data.data)) return data.data;
  if (Array.isArray(data.users)) return data.users;
  if (Array.isArray(data.items)) return data.items;
  // check for first array property
  for (const k of Object.keys(data)) {
    if (Array.isArray((data as any)[k])) return (data as any)[k];
  }
  return [];
}

// map API subscription tier to UI subscription label
function mapSubscriptionTier(t?: string) {
  if (!t) return 'Standard';
  const normalized = t.trim().toLowerCase();
  if (normalized === 'free') return 'Standard';
  if (normalized === 'plus') return 'Premium';
  if (normalized === 'enterprise') return 'Enterprise';
  // if already Standard/Premium/Enterprise, pass through
  if (['standard', 'premium', 'enterprise'].includes(normalized)) {
    return normalized[0].toUpperCase() + normalized.slice(1);
  }
  return 'Standard';
}

// map an API user object to AdminUser (defensive)
const mapApiUserToAdmin = (apiUser: any): AdminUser => {
  return {
    id: apiUser.id,
    name: apiUser.full_name || apiUser.name || "Unknown",
    email: apiUser.email || "N/A",
    company: apiUser.organization_name || apiUser.org?.name || "N/A",
    subscription_tier: apiUser.subscription_tier || "Standard",
    totalAllowed: apiUser.max_users || 30,
    remaining: apiUser.remaining_users ?? apiUser.max_users ?? 30,
    orgId: apiUser.organization_id ?? null,
    role: apiUser.role ?? "admin",
    status: apiUser.is_active ? "active" : "inactive",
    joined: apiUser.created_at ? new Date(apiUser.created_at).toLocaleDateString() : "N/A",
  };
};

function mapApiOrgToOrganization(item: any): Organization {
  return {
    id: item.id ?? item.organization_id ?? Date.now(),
    name: item.name ?? item.organization_name ?? item.org_id ?? 'Unknown',
    subscription: mapSubscriptionTier(item.subscription_tier) as
      | 'Standard'
      | 'Premium'
      | 'Enterprise',
    userCount: item.user_count ?? item.users_count ?? item.max_users ?? 0,
    status: item.is_active === false ? 'inactive' : 'active',
    createdAt: item.created_at ?? item.createdAt ?? new Date().toISOString(),
  };
}

function mapApiAccessRequest(item: any): AccessRequestType {
  return {
    id: item.id ?? Date.now(),
    fullName: item.full_name ?? item.fullName ?? item.name ?? item.email ?? '',
    organizationName:
      item.organization_name ?? item.processed_org_id ?? item.organization ?? '',
    email: item.email ?? '',
    status: (item.status ?? 'pending') as 'pending' | 'approved' | 'denied',
    requestDate: item.created_at ?? item.requestDate ?? '',
  };
}

function mapApiSuperAdmin(item: any): SuperAdminUser {
  return {
    id: item.id ?? Date.now(),
    name: item.full_name ?? item.fullName ?? item.name ?? item.email ?? '',
    email: item.email ?? '',
    createdAt: item.created_at ? new Date(item.created_at).toLocaleDateString() : new Date().toLocaleDateString(),
  };
}

// --------------- axios instance (kept local to this file for clarity) ---------------
const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL?.replace(/\/$/, '') || ''}/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    if (!config.headers) config.headers = {} as typeof config.headers;
    config.headers.Authorization = `Bearer ${token}`;
  }
  // log outgoing request (safe)
  console.debug('[API REQUEST]', `${config.method?.toUpperCase()} ${config.url}`, {
    headers: config.headers,
    params: config.params,
    data: config.data,
  });
  return config;
});

api.interceptors.response.use(
  (response) => {
    // log response
    try {
      console.debug(
        `[API RESPONSE] ${response.config.method?.toUpperCase()} ${response.config.url}`,
        JSON.parse(JSON.stringify(response.data))
      );
    } catch (e) {
      console.debug('[API RESPONSE] (raw)', response.data);
    }
    return response;
  },
  (error) => {
    console.error('[API ERROR]', error?.response?.status, error?.response?.data);
    if (error.response?.status === 401) {
      // redirect to login if unauthorized
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
const SkeletonCard: React.FC = () => {
  return (
    <div className="admin-card skeleton-card">
      <div className="skeleton skeleton-title" />
      <div className="skeleton skeleton-line" />
      <div className="skeleton skeleton-badge" />
      <div className="skeleton skeleton-line" />
      <div className="skeleton skeleton-badge" />
    </div>
  );
};


// -------------------- SuperAdminHeader --------------------
const SuperAdminHeader: React.FC<{ activeTab: string; onTabChange: (tab: string) => void }> = ({
  activeTab,
  onTabChange,
}) => {
  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
  };

  return (
    <header className="super-admin-header">
      <div className="header-container">
        <div className="logo-section">
          <div className="logo-icon">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M16 4L24 12L16 20L8 12L16 4Z" fill="url(#logoGradient)" />
              <path d="M16 12L24 20L16 28L8 20L16 12Z" fill="url(#logoGradient)" opacity="0.7" />
              <defs>
                <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8B5CF6" />
                  <stop offset="100%" stopColor="#C084FC" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1 className="logo-text">SuperAdmin</h1>
        </div>

        <nav className="nav-menu">
          <button className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => onTabChange('overview')}>
            Overview
          </button>
            <button className={`nav-item ${activeTab === 'User' ? 'active' : ''}`} onClick={() => onTabChange('Users')}>
            User
          </button>
          
          <button className={`nav-item ${activeTab === 'adminUsers' ? 'active' : ''}`} onClick={() => onTabChange('adminUsers')}>
            Admin Users
          </button>
          <button className={`nav-item ${activeTab === 'superAdmin' ? 'active' : ''}`} onClick={() => onTabChange('superAdmin')}>
            Super Admin
          </button>
          <button className={`nav-item ${activeTab === 'Access Request' ? 'active' : ''}`} onClick={() => onTabChange('Access Request')}>
            Access Request
          </button>
          <button className={`nav-item ${activeTab === 'Organizations' ? 'active' : ''}`} onClick={() => onTabChange('Organizations')}>
            Organizations
          </button>
        </nav>

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
};

// -------------------- Overview --------------------
const Overview: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]); // store recent requests
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Run all API calls in parallel
        const [statsRes, orgsRes, usersRes, reqsRes] = await Promise.all([
          api.get('/superadmin/stats').catch(() => ({ data: {} })),
          api.get('/superadmin/organizations').catch(() => ({ data: [] })),
          api.get('/superadmin/users').catch(() => ({ data: [] })),
          api.get('/superadmin/access-requests').catch(() => ({ data: [] })),
        ]);

        // Base stats
        const baseStats = statsRes.data || {};

        // Organizations
        const orgs = orgsRes.data || [];
        const activeOrganizations = orgs.filter((o: any) => o.is_active).length;

        // Users
        const users = usersRes.data || [];
        const activeUsers = users.filter((user: any) => user.is_active).length;
        const totalSuperadmins = users.filter((u: any) => u.role === 'superadmin').length;

        // Pending requests
const requests = reqsRes.data || [];
const pendingRequests = requests.filter((r: any) => r.status === 'pending').length;

// Map & normalize API response
const normalized = requests.slice(0, 5).map(mapApiAccessRequest);
setRequests(normalized);


// Save stats
setStats({
  total_organizations: baseStats.total_organizations ?? orgs.length,
  total_users: baseStats.total_users ?? users.length,
  active_organizations: activeOrganizations,
  active_users: activeUsers,
  total_superadmins: totalSuperadmins,
  pending_access_requests: pendingRequests,                          
});

        // Save top 5 recent requests
        
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError('Failed to fetch statistics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
  return (
    <div className="organizations-container">
      <div className="page-header">
        <h2 className="page-title">Overview</h2>
      </div>
      <div className="admin-users-grid">
        {[...Array(6)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}
  if (error) return <div className="error">{error}</div>;
  if (!stats) return <div>No statistics available</div>;

  return (
    <div className="overview-container">
      <h2 className="page-title">Dashboard Overview</h2>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card"><h3>Total Organizations</h3><p>{stats.total_organizations ?? '-'}</p></div>
        <div className="stat-card"><h3>Active Organizations</h3><p>{stats.active_organizations ?? '-'}</p></div>
        <div className="stat-card"><h3>Total Users</h3><p>{stats.total_users ?? '-'}</p></div>
        <div className="stat-card"><h3>Active Users</h3><p>{stats.active_users ?? '-'}</p></div>
        <div className="stat-card"><h3>Total SuperAdmins</h3><p>{stats.total_superadmins ?? '-'}</p></div>
        <div className="stat-card"><h3>Pending Access Requests</h3><p>{stats.pending_access_requests ?? '-'}</p></div>
      </div>

      {/* Recent Requests */}
      <div className="recent-requests">
        <h3>Recent Access Requests</h3>
        {requests.length === 0 ? (
          <p className="empty">No recent requests</p>
        ) : (
          <table className="requests-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Organization</th>
               
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
  {requests.map((req, index) => (
    <tr key={index}>
      <td>{req.fullName}</td>
      <td>{req.email}</td>
      <td>{req.organizationName}</td>
      <td className={`status ${req.status}`}>{req.status}</td>
      

    </tr>
  ))}
</tbody>

          </table>
        )}
      </div>
    </div>
  );
};

// -------------------- Users --------------------









const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [revokedUsers, setRevokedUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showRevoked, setShowRevoked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch users and organizations
        const [usersRes, orgsRes, revokedRes] = await Promise.all([
          api.get("/superadmin/users"),
          api.get("/superadmin/organizations"),
          api.get("/superadmin/revoked-users"),
        ]);

        const orgMap: Record<number, any> = {};
        orgsRes.data.forEach((o: any) => (orgMap[o.id] = o));

        const normalUsers: User[] = usersRes.data
          .filter((u: any) => u.role.toLowerCase() === "user" && u.is_active)
          .map((u: any) => ({
            id: u.id,
            name: u.full_name,
            email: u.email,
            company: u.organization?.name || "N/A",
            orgId: u.organization_id || null,
            role: u.role,
            status: "active",
            joined: u.created_at
              ? new Date(u.created_at).toLocaleDateString()
              : "N/A",
          }));

        const revoked: User[] = revokedRes.data
          .filter((u: any) => u.role.toLowerCase() === "user")
          .map((u: any) => ({
            id: u.id,
            name: u.full_name,
            email: u.email,
            company: u.organization?.name || "N/A",
            orgId: u.organization_id || null,
            role: u.role,
            status: "inactive",
            joined: u.created_at
              ? new Date(u.created_at).toLocaleDateString()
              : "N/A",
          }));

        setUsers(normalUsers);
        setRevokedUsers(revoked);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch users");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (isLoading) {
  return (
    <div className="organizations-container">
      <div className="page-header">
        <h2 className="page-title">Users</h2>
      </div>
      <div className="admin-users-grid">
        {[...Array(6)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="users-container">
      {/* Page Header */}
      <div className="page-header">
        <h2 className="page-title">Users ({users.length})</h2>
        {revokedUsers.length > 0 && (
          <button
            className="revoked-btn"
            onClick={() => setShowRevoked((prev) => !prev)}
          >
            {showRevoked
              ? "Hide Revoked Users"
              : `Show Revoked Users (${revokedUsers.length})`}
          </button>
        )}
      </div>

      {/* Active Users Grid */}
      <div className="admin-users-grid">
        {users.map((user) => (
          <div key={user.id} className="admin-card">
            <div className="admin-info">
              <h4>{user.name}</h4>
              <p className='admin-email'>{user.email}</p>
              <p className='admin-company'>{user.company}</p>
              <p className={`status-badge ${user.status.toLowerCase()}`}>{user.status}</p>
              <p className='admin-email'>Joined: {user.joined}</p>
            </div>
            <div className="admin-actions">
              <button className="view-btn" onClick={() => setSelectedUser(user)}>View Details</button>
            </div>
          </div>
        ))}
      </div>

      {/* Revoked Users Section */}
      {revokedUsers.length > 0 && (
        <div className={`revoked-container ${showRevoked ? "revoked-show" : ""}`}>
          <h3 className="revoked-title">
            Revoked Users ({revokedUsers.length})
          </h3>
          {revokedUsers.length === 0 ? (
            <p>No revoked users</p>
          ) : (
            <div className="revoked-grid">
              {revokedUsers.map((user) => (
                <div key={user.id} className="revoked-card">
                  <div className="revoked-avatar">{user.name.charAt(0)}</div>
                  <div className="revoked-info">
                    <h4>{user.name}</h4>
                    <p>{user.email}</p>
                    <p>{user.company}</p>
                    <p className="revoked-status">Status: {user.status}</p>
                    <p>Joined: {user.joined}</p>
                  </div>
                  <div className="user-actions">
                    <button onClick={() => setSelectedUser(user)}>
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* User Details Modal */}
      {selectedUser && (
        <div className="modal-overlay">
          <div className="modal">
            <button className="modal-close" onClick={() => setSelectedUser(null)}>
              X
            </button>
            <h3>User Details</h3>
            <p>
              <strong>Name:</strong> {selectedUser.name}
            </p>
            <p>
              <strong>Email:</strong> {selectedUser.email}
            </p>
            <p>
              <strong>Role:</strong> {selectedUser.role}
            </p>
            <p>
              <strong>Company:</strong> {selectedUser.company}
            </p>
            <p>
              <strong>Status:</strong> {selectedUser.status}
            </p>
            <p>
              <strong>Joined:</strong> {selectedUser.joined}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};










// -------------------- AdminUsers --------------------
const AdminUsers: React.FC = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [newAdminForm, setNewAdminForm] = useState<NewAdminForm>({ name: '', email: '', company: '', subscription: 'Standard', totalAllowed: 30 });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUser  | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>(""); 
  const [showRevoked, setShowRevoked] = useState(false);
  const [revokedUsers, setRevokedUsers] = useState<AdminUser[]>([]);

  useEffect(() => {
    const fetchAdminUsers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const usersRes = await api.get('/superadmin/users');
        const users = usersRes.data;
        const orgsRes = await api.get('/superadmin/organizations');
        const orgs = orgsRes.data;
        const revokedRes = await api.get('/superadmin/revoked-users');
        

        const orgMap: Record<number, any> = {};
        orgs.forEach((o: any) => { orgMap[o.id] = o; });

        const admins = users.filter((u: any) => u.role === 'admin');

        const mapped: AdminUser[] = admins.map((a: any) => ({
          id: a.id,
          name: a.full_name,
          email: a.email,
          company: orgMap[a.organization_id]?.name || "N/A",
          orgId: a.organization_id || null,
          role: a.role,
          status: a.is_active ? 'active' : 'inactive',
          joined: a.created_at ? new Date(a.created_at).toLocaleDateString() : "N/A",
          subscription_tier: orgMap[a.organization_id]?.subscription_tier || "Standard" // <-- Add subscription tier
        }));
        const revoked: AdminUser[] = revokedRes.data
  .filter((u: any) => u.role.toLowerCase() === "admin")
  .map((u: any) => ({
    id: u.id,
    name: u.full_name,
    email: u.email,
    company: u.organization?.name || "N/A",
    orgId: u.organization_id || null,
    role: u.role,
    status: "inactive",
    joined: u.created_at ? new Date(u.created_at).toLocaleDateString() : "N/A",
    subscription_tier: "Standard", 
    totalAllowed: 30,               
    remaining: 0                    
  }));

setRevokedUsers(revoked);



        setAdminUsers(mapped);
      } catch (err) {
        console.error("Error fetching admin users:", err);
        setError("Failed to fetch admin users");
      } finally {
        setIsLoading(false);
      }
    };
    fetchAdminUsers();
  }, []);

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        email: newAdminForm.email,
        full_name: newAdminForm.name,
        organization_name: newAdminForm.company,
      };
      const response = await api.post('/superadmin/invite-admin-new-organization', payload);
      const created = extractListFromResponse(response.data)[0] ?? response.data;
      const mapped = mapApiUserToAdmin(created);
      setAdminUsers((prev) => [...prev, mapped]);
      setNewAdminForm({ name: '', email: '', company: '', subscription: 'Standard', totalAllowed: 30 });
      setShowCreateForm(false);
    } catch (err) {
      console.error('Error creating admin user:', err);
      const fallback: AdminUser = {
        id: Date.now(),
        name: newAdminForm.name,
        email: newAdminForm.email,
        company: newAdminForm.company,
        subscription_tier: newAdminForm.subscription,
        totalAllowed: newAdminForm.totalAllowed,
        remaining: newAdminForm.totalAllowed,
        orgId: null,
        role: "admin",
        status: "active",
        joined: new Date().toLocaleDateString(),
      };
      setAdminUsers((prev) => [...prev, fallback]);
      setShowCreateForm(false);
    }
  };

  const handleDeleteAdmin = async (id: number) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await api.post(`/superadmin/revoke-admin-access/${id}`);
      setAdminUsers((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error('Error revoking admin access:', err);
      alert('Failed to revoke admin access. See console for details.');
    }
  };

  if (isLoading) {
    return (
      <div className="organizations-container">
        <div className="page-header">
          <h2 className="page-title">Admin Users</h2>
        </div>
        <div className="admin-users-grid">
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }
  if (error) return <div className="error">{error}</div>;

  // Filter admins by search term (company or email)
  // Filter admins by search term (company, email, or name)
const filteredAdmins = adminUsers.filter(admin =>
  admin.company.toLowerCase().includes(searchTerm.trim().toLowerCase()) ||
  admin.email.toLowerCase().includes(searchTerm.trim().toLowerCase()) ||
  admin.name.toLowerCase().includes(searchTerm.trim().toLowerCase())
);


  return (
    <div className="admin-users-container">
      <div className="page-header">
        <h2 className="page-title">Admin Users ({filteredAdmins.length})</h2>
      
        <div className="search-container">
  <input
    type="text"
    placeholder="Search by name, company, or email..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="admin-search-input"
  />
  {searchTerm && (
    <button className="clear-search-btn" onClick={() => setSearchTerm("")}>×</button>
  )}
</div>
{revokedUsers.length > 0 && (
          <button
            className="create-btn"
            onClick={() => setShowRevoked((prev) => !prev)}
          >
            {showRevoked
              ? "Hide Revoked Users"
              : `Show Revoked Users (${revokedUsers.length})`}
          </button>
        )}
        <button className="create-btn" onClick={() => setShowCreateForm(true)}>Create Admin User</button>
      </div>

      <div className="admin-users-grid">
        {filteredAdmins.map((admin) => (
          <div key={admin.id} className="admin-card">
            <div className="admin-info">
              <h4>{admin.name}</h4>
              <p className='admin-email'>{admin.email}</p>
              <p className='admin-company'>{admin.company}</p>
              <p className={`subscription-badge ${admin.subscription_tier?.toLowerCase()}`}>
                {admin.subscription_tier}
              </p>
              <p className='admin-email'>Status: {admin.status}</p>
              <p className='admin-email'>Joined: {admin.joined}</p>
            </div>

            <div className="admin-actions">
              <button className="view-btn" onClick={() => setSelectedUser(admin)}>View Details</button>
              <button className="delete-btn" onClick={() => handleDeleteAdmin(admin.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for details */}
      {selectedUser && (
        <div className="modal-overlay">
          <div className="modal">
            <button className="close-btn" onClick={() => setSelectedUser(null)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <h3>Admin Details</h3>
            <p><strong>Name:</strong> {selectedUser.name}</p>
            <p><strong>Email:</strong> {selectedUser.email}</p>
            <p><strong>Role:</strong> {selectedUser.role}</p>
            <p><strong>Organization:</strong> {selectedUser.company}</p>
            <p><strong>Org ID:</strong> {selectedUser.orgId ?? "N/A"}</p>
            <p><strong>Status:</strong> <span className={`status-badge ${selectedUser.status}`}>{selectedUser.status}</span></p>
            <p><strong>Joined:</strong> {selectedUser.joined}</p>
            <p><strong>Subscription:</strong> {selectedUser.subscription_tier}</p>
            <div className="modal-actions">
              <button className="delete-btn" onClick={() => handleDeleteAdmin(selectedUser.id)}>Revoke Access</button>
              <button className="close-btn" onClick={() => setSelectedUser(null)}></button>
            </div>
          </div>
        </div>
      )}

      {/* Create admin modal */}
      {showCreateForm && (
        <div className="modal-overlay" onClick={() => setShowCreateForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowCreateForm(false)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <h3>Create New Admin User</h3>
            <form onSubmit={handleCreateAdmin}>
              <div className='form-group'>
                <input placeholder="Name" value={newAdminForm.name} onChange={(e) => setNewAdminForm({ ...newAdminForm, name: e.target.value })} required />
                <input placeholder="Email" value={newAdminForm.email} onChange={(e) => setNewAdminForm({ ...newAdminForm, email: e.target.value })} required />
                <input placeholder="Company" value={newAdminForm.company} onChange={(e) => setNewAdminForm({ ...newAdminForm, company: e.target.value })} required />
                <select className={`subscription ${newAdminForm.subscription.toLowerCase()}`}
                  value={newAdminForm.subscription}
                  onChange={(e) => {
                    const subscription = e.target.value as 'Standard' | 'Premium' | 'Enterprise';
                    const totalAllowed = subscription === 'Standard' ? 30 : subscription === 'Premium' ? 50 : 100;
                    setNewAdminForm({ ...newAdminForm, subscription, totalAllowed });
                  }}
                >
                  <option value="Standard">Standard</option>
                  <option value="Premium">Premium</option>
                  <option value="Enterprise">Enterprise</option>
                </select>
                <div className="form-actions">
                  <button type="button" className="cancel-btn" onClick={() => setShowCreateForm(false)}>Cancel</button>
                  <button type="submit" className="submit-btn">Create Admin</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
      {revokedUsers.length > 0 && (
        <div className={`revoked-container ${showRevoked ? "revoked-show" : ""}`}>
          <h3 className="revoked-title">
            Revoked Users ({revokedUsers.length})
          </h3>
          {revokedUsers.length === 0 ? (
            <p>No revoked users</p>
          ) : (
            <div className="revoked-grid">
              {revokedUsers.map((user) => (
                <div key={user.id} className="revoked-card">
                  <div className="revoked-avatar">{user.name.charAt(0)}</div>
                  <div className="revoked-info">
                    <h4>{user.name}</h4>
                    <p>{user.email}</p>
                    <p>{user.company}</p>
                    <p className="revoked-status">Status: {user.status}</p>
                    <p>Joined: {user.joined}</p>
                  </div>
                  <div className="user-actions">
                    <button onClick={() => setSelectedUser(user)}>
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};


  // -------------------- SuperAdmin (manage superadmins) --------------------
  const SuperAdmin: React.FC = () => {
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [superAdmins, setSuperAdmins] = useState<SuperAdminUser[]>([]);
    const [newSuperAdminForm, setNewSuperAdminForm] = useState<NewSuperAdminForm>({ name: '', email: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedUser, setSelectedUser] = useState<SuperAdminUser | null>(null);
    const [revokedSuperAdmins, setRevokedSuperAdmins] = useState<SuperAdminUser[]>([]);
    const [showRevoked, setShowRevoked] = useState(false);


    useEffect(() => {
      const fetchSuperAdmins = async () => {
        setIsLoading(true);
        setError(null);
        try {
          // Get master superadmin info
          const masterInfo = await api.get('/superadmin/master-superadmin-info');
          const masterAdminId = masterInfo.data.is_current_user_master;

          // Get all superadmins
          const response = await api.get('/superadmin/superadmins');
          const list = extractListFromResponse(response.data);
          const mapped = list.map(admin => ({
            ...mapApiSuperAdmin(admin),
            isMasterAdmin: admin.id === masterAdminId
          }));
          setSuperAdmins(mapped);
        const revokedRes = await api.get('/superadmin/revoked-superadmins');
const revokedList = extractListFromResponse(revokedRes.data);
const revokedMapped = revokedList.map((admin: any) => ({
  ...mapApiSuperAdmin(admin),
  isActive: false
}));
setRevokedSuperAdmins(revokedMapped);

        } catch (err) {
          console.error('Error fetching super admins:', err);
          setError('Failed to fetch super admins');
        } finally {
          setIsLoading(false);
        }
      };
      fetchSuperAdmins();
    }, []);



    const handleCreateSuperAdmin = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        const payload = { email: newSuperAdminForm.email, full_name: newSuperAdminForm.name };
        console.debug('POST /superadmin/invite-superadmin payload:', payload);
        const response = await api.post('/superadmin/invite-superadmin', payload);
        console.debug('invite-superadmin response:', JSON.stringify(response.data, null, 2));
        const created = response.data.user ?? extractListFromResponse(response.data)[0] ?? response.data;
        const mapped = mapApiSuperAdmin(created);
        setSuperAdmins((prev) => [...prev, mapped]);
        setNewSuperAdminForm({ name: '', email: '', password: '' });
        setShowCreateForm(false);
        
      } catch (err) {
        console.error('Error creating super admin:', err);
        alert('Failed to create super admin. See console.');
      }
    };

    const handleRevokeSuperAdmin = async (id: number) => {
      if (superAdmins.length <= 1) {
        alert('Cannot revoke the last super admin!');
        return;
      }
      
      if (!window.confirm('Are you sure you want to revoke this super admin\'s access?')) {
        return;
      }

      try {
        await api.post(`/superadmin/revoke-superadmin/${id}`);
        setSuperAdmins(prev => prev.filter(admin => admin.id !== id));
        if (selectedUser?.id === id) {
          setSelectedUser(null); // Close modal if open
        }
      } catch (err) {
        console.error('Error revoking super admin access:', err);
        alert('Failed to revoke super admin access. Please try again.');
      }
    };
    if (isLoading) {
  return (
    <div className="organizations-container">
      <div className="page-header">
        <h2 className="page-title">Super Admins</h2>
      </div>
      <div className="admin-users-grid">
        {[...Array(6)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}
    if (error) return <div className="error">{error}</div>;

    return (
      <div className="super-admin-container">
        <div className="page-header">
          <h2 className="page-title">Super Admins ({superAdmins.length})</h2>
          <div className='header-actions'>
          <button className="create-btn" onClick={() => setShowCreateForm(true)}>
            Create Super Admin
          </button>
          <button
  className="create-btn"
  onClick={() => setShowRevoked(prev => !prev)}
>
  {showRevoked ? "Hide Revoked Super Admins" : "Revoked Super Admins"}
</button>
</div>
        </div>

        <div className="admin-users-grid">
          {superAdmins.map((superAdmin) => (
            <div key={superAdmin.id} className="admin-card">
              <div className="admin-info">
                <h4>{superAdmin.name}</h4>
                <p className='admin-email'>{superAdmin.email}</p>
                <p className='admin-email'>Role: Super Admin</p>
                <p className='admin-email'>Created: {superAdmin.createdAt}</p>
              </div>
              
              <div className="admin-actions">
                <button
                  className="view-btn"
                  onClick={() => setSelectedUser(superAdmin)}
                >
                  View Details
                </button>
                <button 
                  className="delete-btn" 
                  onClick={() => handleRevokeSuperAdmin(superAdmin.id)}
                  disabled={superAdmins.length <= 1}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
           
          {showRevoked && (
  <div
    id="revoked-superadmins"
    className={`revoked-container ${showRevoked ? 'revoked-show' : ''}`}
  >
    <h3 className="revoked-title">Revoked Super Admins ({revokedSuperAdmins.length})</h3>
    <div className="revoked-grid">
      {revokedSuperAdmins.map(admin => (
        <div key={admin.id} className="revoked-card">
          <div className="revoked-avatar">R</div>
          <div className="revoked-info">
            <h4>{admin.name}</h4>
            <p>{admin.email}</p>
            <p className="revoked-status">Revoked</p>
          </div>
        </div>
      ))}
    </div>
  </div>
)}



        {/* View Details Modal */}
        {selectedUser && (
          <div className="modal-overlay">
            <div className="modal">
              <button className="close-btn" onClick={() => setSelectedUser(null)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
              <h3>Super Admin Details</h3>
              <p><strong>Name:</strong> {selectedUser.name}</p>
              <p><strong>Email:</strong> {selectedUser.email}</p>
              <p><strong>Role:</strong> Super Admin</p>
              <p><strong>Created At:</strong> {selectedUser.createdAt}</p>

              <div className="modal-actions">
                <button 
                  className="delete-btn" 
                  onClick={() => handleRevokeSuperAdmin(selectedUser.id)}
                  disabled={superAdmins.length <= 1}
                >
                  Revoke Access
                </button>
              
              </div>
            </div>
          </div>
        )}

      {/* Create Form Modal */}
      {showCreateForm && (
        <div className="modal-overlay">
          <div className="modal">
            <button className="close-btn" onClick={() => setShowCreateForm(false)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <h3>Create New Super Admin</h3>
            <form onSubmit={handleCreateSuperAdmin}>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  placeholder="Enter name"
                  value={newSuperAdminForm.name}
                  onChange={(e) => setNewSuperAdminForm({...newSuperAdminForm, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="Enter email"
                  value={newSuperAdminForm.email}
                  onChange={(e) => setNewSuperAdminForm({...newSuperAdminForm, email: e.target.value})}
                  required
                />
              </div>
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Create Super Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )};

  // -------------------- AccessRequest --------------------
  const AccessRequest: React.FC = () => {
    const [accessRequests, setAccessRequests] = useState<AccessRequestType[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);


    useEffect(() => {
      const fetchAccessRequests = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const response = await api.get('/superadmin/access-requests');
          const list = extractListFromResponse(response.data);
          setAccessRequests(list.map(mapApiAccessRequest));
        } catch (err) {
          console.error('Error fetching access requests:', err);
          setError('Failed to fetch access requests');
        } finally {
          setIsLoading(false);
        }
      };
      fetchAccessRequests();
    }, []);

    const handleRequestAction = async (id: number, action: 'approve' | 'deny') => {
      if (!window.confirm(`Are you sure you want to ${action} this request?`)) return;
      try {
        const payload = { action, review_notes: action === 'approve' ? 'Approved' : 'Denied' };
        await api.post(`/superadmin/access-requests/${id}/review`, payload);
        setAccessRequests((prev) => 
          prev.map((req) => 
            req.id === id ? { ...req, status: action === 'approve' ? 'approved' : 'denied' } : req
          )
        );
      } catch (err) {
        console.error('Error updating access request:', err);
        alert('Failed to update access request');
      }
    };
    if (isLoading) {
  return (
    <div className="organizations-container">
      <div className="page-header">
        <h2 className="page-title">Access Requests</h2>
      </div>
      <div className="admin-users-grid">
        {[...Array(6)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}
    if (error) return <div className="error">{error}</div>;

    return (
      <div className="access-requests-container">
        <div className="page-header">
          <h2 className="page-title">Access Requests ({accessRequests.length})</h2>
        </div>
        
        <div className="admin-users-grid"> {/* Using same grid as admin cards */}
          {accessRequests.map((request) => (
            <div key={request.id} className="admin-card"> {/* Using admin-card class for consistency */}
              <div className="admin-info">
                <h4>{request.fullName}</h4>
                <p className="admin-email">{request.email}</p>
                <p className="admin-company">{request.organizationName}</p>
                <p className="admin-email">Requested: {new Date(request.requestDate).toLocaleDateString()}</p>
                <div className="detail-item">
                  <span className="detail-label">Status</span>
                  <span className={`status-badge ${request.status}`}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                </div>
              </div>
              
              {request.status === 'pending' && (
                <div className="admin-actions">
                  <button
                    className="view-btn"
                    onClick={() => handleRequestAction(request.id, 'approve')}
                  >
                    Approve
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleRequestAction(request.id, 'deny')}
                  >
                    Deny
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // -------------------- Organizations --------------------
  const Organizations: React.FC = () => {
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
const [newSubscription, setNewSubscription] = useState<'free' | 'plus' | 'enterprise'>('free');
const [newMaxUsers, setNewMaxUsers] = useState<number | undefined>(undefined);
const [inviteOrg, setInviteOrg] = useState<Organization | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteFullName, setInviteFullName] = useState("");


    useEffect(() => {
      const fetchOrganizations = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const response = await api.get('/superadmin/organizations');
          const list = extractListFromResponse(response.data);
          const mapped = list.map(mapApiOrgToOrganization);
          setOrganizations(mapped);
        } catch (err) {
          console.error('Error fetching organizations:', err);
          setError('Failed to fetch organizations');
        } finally {
          setIsLoading(false);
        }
      };
      fetchOrganizations();
    }, []);

    
    // For sending to API
const frontendToApiSubscriptionMap: Record<Organization['subscription'], 'free' | 'plus' | 'enterprise'> = {
  Standard: 'free',
  Premium: 'plus',
  Enterprise: 'enterprise'
};

// For updating frontend state
const apiToFrontendSubscriptionMap: Record<'free' | 'plus' | 'enterprise', Organization['subscription']> = {
  free: 'Standard',
  plus: 'Premium',
  enterprise: 'Enterprise'
};


const handleSubscriptionUpdate = async () => {
  if (!editingOrg) return;

  try {
    await api.patch(
      `/superadmin/organizations/${editingOrg.id}/subscription`,
      {}, // empty body
      {
        params: {
          subscription_tier: newSubscription, // free | plus | enterprise
          ...(newMaxUsers && newMaxUsers > 0 ? { max_users: newMaxUsers } : {}),
        },
      }
    );

    // Update frontend state
    setOrganizations((orgs) =>
      orgs.map((org) =>
        org.id === editingOrg.id
          ? {
              ...org,
              subscription: apiToFrontendSubscriptionMap[newSubscription],
              userCount: newMaxUsers ?? org.userCount,
            }
          : org
      )
    );

    setEditingOrg(null);
    alert("Subscription updated successfully");
  } catch (err: any) {
    console.error("Error updating subscription:", err.response?.data || err);
    alert(err.response?.data?.detail || "Failed to update subscription. Please check your input.");
  }
};
const handleInviteAdmin = async () => {
    if (!inviteOrg || !inviteEmail || !inviteFullName) {
      alert("Please fill all fields");
      return;
    }

    try {
      const response = await api.post(
        "/superadmin/invite-organization-admin",
        {
          email: inviteEmail,
          full_name: inviteFullName,
          organization_id: inviteOrg.id,
        }
      );

      alert(
        `Admin invited successfully! Temp Password: ${response.data.temporary_password}`
      );
      setInviteOrg(null);
      setInviteEmail("");
      setInviteFullName("");
    } catch (err: any) {
      console.error("Error inviting admin:", err.response?.data || err);
      alert(err.response?.data?.detail || "Failed to invite admin");
    }
  };






    if (isLoading) {
  return (
    <div className="organizations-container">
      <div className="page-header">
        <h2 className="page-title">Organizations</h2>
      </div>
      <div className="admin-users-grid">
        {[...Array(6)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}
    if (error) return <div className="error">{error}</div>;
    return (
      <div className="organizations-container">
        <div className="page-header">
          <h2 className="page-title">Organizations ({organizations.length})</h2>
        </div>

        <div className="admin-users-grid">
          {organizations.map((org) => (
            <div key={org.id} className="admin-card">
              <div className="admin-info">
                <h4>{org.name}</h4>
                <p className="admin-email">Created: {new Date(org.createdAt).toLocaleDateString()}</p>
                
                <div className="detail-item">
                  <span className="detail-label">Subscription</span>
                  <span className={`subscription-badge ${org.subscription.toLowerCase()}`}>
                    {org.subscription}
                  </span>
                </div>
                
                <div className="detail-item">
                  <span className="detail-label">Users</span>
                  <span className="detail-value">{org.userCount}</span>
                </div>
                
                <div className="detail-item">
                  <span className="detail-label">Status</span>
                  <span className={`status-badge ${org.status}`}>
                    {org.status}
                  </span>
                </div>
              </div>

              <div className="admin-actions">
                
  <button
                className="invite-btn"
                onClick={() => {
                  setInviteOrg(org);
                }}
              >
                Invite Admin
              </button>
  <button className="edit-btn" onClick={() => {
  setEditingOrg(org);
  setNewSubscription(frontendToApiSubscriptionMap[org.subscription] as 'free' | 'plus' | 'enterprise');

  setNewMaxUsers(org.userCount);
}}>
  Edit Subscription
</button>
</div>
            </div>
          ))}
        </div>
        {editingOrg && (
    <div className="organizations-modal">
      <div className="organizations-modal-content">
        <h3>Edit Subscription for {editingOrg.name}</h3>

        <label>
          Subscription Tier:
          <select
            value={newSubscription}
            onChange={(e) =>
              setNewSubscription(e.target.value as 'free' | 'plus' | 'enterprise')
            }
          >
            <option value="free" style={{ color: "black" }}>Free</option>
<option value="plus" style={{ color: "black" }}>Plus</option>
<option value="enterprise" style={{ color: "black" }}>Enterprise</option>

          </select>
        </label>

        <label>
  Max Users:
  <input
    type="number"
    value={newMaxUsers ?? ""}
    onChange={(e) =>
      setNewMaxUsers(e.target.value ? Number(e.target.value) : undefined)
    }
    min={1}
    placeholder="Leave blank for default"
  />
</label>


        <div className="organizations-modal-actions">
          <button className="organizations-save-btn" onClick={handleSubscriptionUpdate}>
            Save
          </button>
          <button className="organizations-cancel-btn" onClick={() => setEditingOrg(null)}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )}
  {inviteOrg && (
        <div className="organizations-modal">
          <div className="organizations-modal-content">
            <h3>Invite Admin for {inviteOrg.name}</h3>

            <label>
              Full Name:
              <input
                type="text"
                value={inviteFullName}
                onChange={(e) => setInviteFullName(e.target.value)}
              />
            </label>

            <label>
              Email:
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </label>

            <div className="organizations-modal-actions">
              <button
                className="organizations-save-btn"
                onClick={handleInviteAdmin}
              >
                Invite
              </button>
              <button
                className="organizations-cancel-btn"
                onClick={() => setInviteOrg(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
   
      </div>
    );
  };

  // -------------------- Main Dashboard --------------------
  const SuperAdminDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState('overview');

    const renderContent = () => {
      switch (activeTab) {
        case 'overview':
          return <Overview />;
          case 'Users':
          return <Users />;
        case 'adminUsers':
          return <AdminUsers />;
        case 'superAdmin':
          return <SuperAdmin />;
        case 'Access Request':
          return <AccessRequest />;
        case 'Organizations':
          return <Organizations />;
        
        default:
          return <Overview />;
      }
    };

    return (
      <div className="super-admin-dashboard">
        <SuperAdminHeader activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="dashboard-content">{renderContent()}</main>
      </div>
    );
  };

export default SuperAdminDashboard;






// import React, { useState, useEffect } from 'react';
// import '../style/SuperAdminDashboard.css';

// // Types
// interface AdminUser {
//   id: number;
//   name: string;
//   email: string;
//   company: string;
//   subscription: 'Standard' | 'Premium' | 'Enterprise';
//   totalAllowed: number;
//   remaining: number;
// }

// interface SuperAdminUser {
//   id: number;
//   name: string;
//   email: string;
//   createdAt: string;
// }

// interface NewAdminForm {
//   name: string;
//   email: string;
//   company: string;
//   subscription: 'Standard' | 'Premium' | 'Enterprise';
//   totalAllowed: number;
// }

// interface NewSuperAdminForm {
//   name: string;
//   email: string;
//   password: string;
// }

// // SuperAdminHeader Component
// const SuperAdminHeader: React.FC<{ activeTab: string; onTabChange: (tab: string) => void }> = ({ activeTab, onTabChange }) => {
//   const handleLogout = () => {
//     if (window.confirm('Are you sure you want to logout?')) {
//       // Handle logout logic here
//       window.location.href = '/';
//     }
//   };

//   return (
//     <header className="super-admin-header">
//       <div className="header-container">
//         <div className="logo-section">
//           <div className="logo-icon">
//             <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
//               <path d="M16 4L24 12L16 20L8 12L16 4Z" fill="url(#logoGradient)" />
//               <path d="M16 12L24 20L16 28L8 20L16 12Z" fill="url(#logoGradient)" opacity="0.7" />
//               <defs>
//                 <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
//                   <stop offset="0%" stopColor="#8B5CF6" />
//                   <stop offset="100%" stopColor="#C084FC" />
//                 </linearGradient>
//               </defs>
//             </svg>
//           </div>
//           <h1 className="logo-text">SuperAdmin</h1>
//         </div>
        
//         <nav className="nav-menu">
//           <button 
//             className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
//             onClick={() => onTabChange('overview')}
//           >
//             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//               <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" />
//               <polyline points="9,22 9,12 15,12 15,22" />
//             </svg>
//             Overview
//           </button>
          
//           <button 
//             className={`nav-item ${activeTab === 'adminUsers' ? 'active' : ''}`}
//             onClick={() => onTabChange('adminUsers')}
//           >
//             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//               <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" />
//               <circle cx="9" cy="7" r="4" />
//               <path d="M23 21V19C23 17.9391 22.5786 16.9217 21.8284 16.1716C21.0783 15.4214 20.0609 15 19 15C17.9391 15 16.9217 15.4214 16.1716 16.1716C15.4214 16.9217 15 17.9391 15 19V21" />
//               <circle cx="19" cy="7" r="4" />
//             </svg>
//             Admin Users
//           </button>
          
//           <button 
//             className={`nav-item ${activeTab === 'superAdmin' ? 'active' : ''}`}
//             onClick={() => onTabChange('superAdmin')}
//           >
//             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//               <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
//             </svg>
//             Super Admin
//           </button>
//           <button 
//             className={`nav-item ${activeTab === 'Active' ? 'active' : ''}`}
//             onClick={() => onTabChange('Access Request')}
//           >
//             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//               <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
//             </svg>
//             Access Request
//           </button>
//           <button 
//             className={`nav-item ${activeTab === 'organization' ? 'active' : ''}`}
//             onClick={() => onTabChange('Organizations')}
//           >
//             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//               <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
//             </svg>
//             Organizations
//           </button>
//         </nav>
        
//         <button className="logout-btn" onClick={handleLogout}>
//           <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//             <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" />
//             <polyline points="16,17 21,12 16,7" />
//             <line x1="21" y1="12" x2="9" y2="12" />
//           </svg>
//           Logout
//         </button>
//       </div>
//     </header>
//   );
// };

// // Overview Component
// const Overview: React.FC = () => {
//   const companyData = [
//     { name: 'TechCorp Inc.', users: 45, admins: 3, employees: 42 },
//     { name: 'InnovateLabs', users: 32, admins: 2, employees: 30 },
//     { name: 'DataSoft Solutions', users: 67, admins: 4, employees: 63 },
//     { name: 'CloudTech Systems', users: 23, admins: 2, employees: 21 },
//   ];

//   const totalUsers = companyData.reduce((sum, company) => sum + company.users, 0);
//   const totalAdmins = companyData.reduce((sum, company) => sum + company.admins, 0);
//   const totalEmployees = companyData.reduce((sum, company) => sum + company.employees, 0);

//   return (
//     <div className="overview-container">
//       <h2 className="page-title">Dashboard Overview</h2>
      
//       <div className="stats-grid">
//         <div className="stat-card">
//           <div className="stat-icon">
//             <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//               <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" />
//               <circle cx="9" cy="7" r="4" />
//               <path d="M23 21V19C23 17.9391 22.5786 16.9217 21.8284 16.1716C21.0783 15.4214 20.0609 15 19 15C17.9391 15 16.9217 15.4214 16.1716 16.1716C15.4214 16.9217 15 17.9391 15 19V21" />
//               <circle cx="19" cy="7" r="4" />
//             </svg>
//           </div>
//           <div className="stat-content">
//             <h3>Total Users</h3>
//             <p className="stat-number">{totalUsers}</p>
//           </div>
//         </div>
        
//         <div className="stat-card">
//           <div className="stat-icon">
//             <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//               <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
//             </svg>
//           </div>
//           <div className="stat-content">
//             <h3>Admin Users</h3>
//             <p className="stat-number">{totalAdmins}</p>
//           </div>
//         </div>
        
//         <div className="stat-card">
//           <div className="stat-icon">
//             <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//               <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" />
//               <circle cx="12" cy="7" r="4" />
//             </svg>
//           </div>
//           <div className="stat-content">
//             <h3>Employees</h3>
//             <p className="stat-number">{totalEmployees}</p>
//           </div>
//         </div>
//       </div>
      
//       <div className="companies-section">
//         <h3>Companies Overview</h3>
//         <div className="companies-grid">
//           {companyData.map((company, index) => (
//             <div key={index} className="company-card">
//               <div className="company-header">
//                 <h4>{company.name}</h4>
//                 <span className="user-count">{company.users} users</span>
//               </div>
//               <div className="company-stats">
//                 <div className="company-stat">
//                   <span className="stat-label">Admins</span>
//                   <span className="stat-value">{company.admins}</span>
//                 </div>
//                 <div className="company-stat">
//                   <span className="stat-label">Employees</span>
//                   <span className="stat-value">{company.employees}</span>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// // AdminUsers Component
// const AdminUsers: React.FC = () => {
//   const [showCreateForm, setShowCreateForm] = useState(false);
//   const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);

//   useEffect(() => {
//     fetchAdminUsers();
//   }, []);

//   const fetchAdminUsers = () => {
//     try {
//       const storedAdmins = localStorage.getItem('adminUsers');
//       if (storedAdmins) {
//         setAdminUsers(JSON.parse(storedAdmins));
//       } else {
//         const initialAdminUsers: AdminUser[] = [
//           { id: 1, name: 'John Doe', email: 'john.doe@example.com', company: 'TechCorp Inc.', subscription: 'Premium', totalAllowed: 50, remaining: 45 },
//           { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com', company: 'InnovateLabs', subscription: 'Standard', totalAllowed: 30, remaining: 28 },
//           { id: 3, name: 'Peter Jones', email: 'peter.jones@example.com', company: 'DataSoft Solutions', subscription: 'Enterprise', totalAllowed: 100, remaining: 90 },
//         ];
//         setAdminUsers(initialAdminUsers);
//         localStorage.setItem('adminUsers', JSON.stringify(initialAdminUsers));
//       }
//     } catch (error) {
//       console.error('Error fetching admin users:', error);
//     }
//   };

//   const [newAdminForm, setNewAdminForm] = useState<NewAdminForm>({
//     name: '',
//     email: '',
//     company: '',
//     subscription: 'Standard',
//     totalAllowed: 30
//   });

//   const handleDeleteAdmin = async (id: number) => {
//     if (window.confirm('Are you sure you want to delete this admin user?')) {
//       try {
//         // Simulate API call
//         // await axios.delete(`/api/adminusers/${id}`); // Adjust API endpoint as needed
//         const updatedAdmins = adminUsers.filter(admin => admin.id !== id);
//         setAdminUsers(updatedAdmins);
//         localStorage.setItem('adminUsers', JSON.stringify(updatedAdmins));
//       } catch (error) {
//         console.error('Error deleting admin user:', error);
//       }
//     }
//   };

//   const handleCreateAdmin = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       const newAdmin: AdminUser = {
//         id: Date.now(), // This should ideally be generated by the backend
//         ...newAdminForm,
//         remaining: newAdminForm.totalAllowed
//       };
//       // Simulate API call
//       // await axios.post('/api/adminusers', newAdmin); // Adjust API endpoint as needed
//       const updatedAdmins = [...adminUsers, newAdmin];
//       setAdminUsers(updatedAdmins);
//       localStorage.setItem('adminUsers', JSON.stringify(updatedAdmins));
//       setNewAdminForm({
//         name: '',
//         email: '',
//         company: '',
//         subscription: 'Standard',
//         totalAllowed: 30
//       });
//       setShowCreateForm(false);
//     } catch (error) {
//       console.error('Error creating admin user:', error);
//     }
//   };

//   return (
//     <div className="admin-users-container">
//       <div className="page-header">
//         <h2 className="page-title">Admin Users ({adminUsers.length})</h2>
//         <button 
//           className="create-btn"
//           onClick={() => setShowCreateForm(true)}
//         >
//           <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//             <circle cx="12" cy="12" r="10" />
//             <line x1="12" y1="8" x2="12" y2="16" />
//             <line x1="8" y1="12" x2="16" y2="12" />
//           </svg>
//           Create Admin User
//         </button>
//       </div>
      
//       <div className="admin-users-grid">
//         {adminUsers.map((admin) => (
//           <div key={admin.id} className="admin-card">
//             <div className="admin-avatar">
//               <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                 <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" />
//                 <circle cx="12" cy="7" r="4" />
//               </svg>
//             </div>
//             <div className="admin-info">
//               <h4>{admin.name}</h4>
//               <p className="admin-email">{admin.email}</p>
//               <p className="admin-company">{admin.company}</p>
//             </div>
//             <div className="admin-details">
//               <div className="detail-item">
//                 <span className="detail-label">Subscription</span>
//                 <span className={`subscription-badge ${admin.subscription.toLowerCase()}`}>
//                   {admin.subscription}
//                 </span>
//               </div>
//               <div className="detail-item">
//                 <span className="detail-label">Total Allowed</span>
//                 <span className="detail-value">{admin.totalAllowed}</span>
//               </div>
//               <div className="detail-item">
//                 <span className="detail-label">Remaining</span>
//                 <span className="detail-value remaining">{admin.remaining}</span>
//               </div>
//             </div>
//             <div className="admin-actions">
//               <button 
//                 className="delete-btn"
//                 onClick={() => handleDeleteAdmin(admin.id)}
//               >
//                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                   <polyline points="3,6 5,6 21,6" />
//                   <path d="M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6" />
//                 </svg>
//                 Delete
//               </button>
//             </div>
//           </div>
//         ))}
//       </div>
      
//       {showCreateForm && (
//         <div className="modal-overlay" onClick={() => setShowCreateForm(false)}>
//           <div className="modal-content" onClick={(e) => e.stopPropagation()}>
//             <h3>Create New Admin User</h3>
//             <form className="create-form" onSubmit={handleCreateAdmin}>
//               <div className="form-group">
//                 <label>Name</label>
//                 <input 
//                   type="text" 
//                   placeholder="Enter admin name" 
//                   value={newAdminForm.name}
//                   onChange={(e) => setNewAdminForm({...newAdminForm, name: e.target.value})}
//                   required
//                 />
//               </div>
//               <div className="form-group">
//                 <label>Email</label>
//                 <input 
//                   type="email" 
//                   placeholder="Enter admin email" 
//                   value={newAdminForm.email}
//                   onChange={(e) => setNewAdminForm({...newAdminForm, email: e.target.value})}
//                   required
//                 />
//               </div>
//               <div className="form-group">
//                 <label>Company</label>
//                 <input 
//                   type="text" 
//                   placeholder="Enter company name" 
//                   value={newAdminForm.company}
//                   onChange={(e) => setNewAdminForm({...newAdminForm, company: e.target.value})}
//                   required
//                 />
//               </div>
//               <div className="form-group">
//                 <label>Subscription</label>
//                 <select 
//                   value={newAdminForm.subscription}
//                   onChange={(e) => {
//                     const subscription = e.target.value as 'Standard' | 'Premium' | 'Enterprise';
//                     const totalAllowed = subscription === 'Standard' ? 30 : subscription === 'Premium' ? 50 : 100;
//                     setNewAdminForm({...newAdminForm, subscription, totalAllowed});
//                   }}
//                 >
//                   <option value="Standard">Standard (30 users)</option>
//                   <option value="Premium">Premium (50 users)</option>
//                   <option value="Enterprise">Enterprise (100 users)</option>
//                 </select>
//               </div>
//               <div className="form-actions">
//                 <button type="button" className="cancel-btn" onClick={() => setShowCreateForm(false)}>
//                   Cancel
//                 </button>
//                 <button type="submit" className="submit-btn">
//                   Create Admin
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// // SuperAdmin Component
// const SuperAdmin: React.FC = () => {
//   const [showCreateForm, setShowCreateForm] = useState(false);
//   const [superAdmins, setSuperAdmins] = useState<SuperAdminUser[]>([]);

//   useEffect(() => {
//     fetchSuperAdmins();
//   }, []);

//   const fetchSuperAdmins = () => {
//     try {
//       const storedSuperAdmins = localStorage.getItem('superAdmins');
//       if (storedSuperAdmins) {
//         setSuperAdmins(JSON.parse(storedSuperAdmins));
//       } else {
//         const initialSuperAdmins: SuperAdminUser[] = [
//           { id: 1, name: 'Super Admin One', email: 'superadmin1@example.com', createdAt: '2023-01-01' },
//           { id: 2, name: 'Super Admin Two', email: 'superadmin2@example.com', createdAt: '2023-02-15' },
//         ];
//         setSuperAdmins(initialSuperAdmins);
//         localStorage.setItem('superAdmins', JSON.stringify(initialSuperAdmins));
//       }
//     } catch (error) {
//       console.error('Error fetching super admins:', error);
//     }
//   };

//   const [newSuperAdminForm, setNewSuperAdminForm] = useState<NewSuperAdminForm>({
//     name: '',
//     email: '',
//     password: ''
//   });

//   const handleDeleteSuperAdmin = async (id: number) => {
//     if (superAdmins.length <= 1) {
//       alert('Cannot delete the last super admin!');
//       return;
//     }
//     if (window.confirm('Are you sure you want to delete this super admin?')) {
//       try {
//         // Simulate API call
//         // await axios.delete(`/api/superadmins/${id}`); // Adjust API endpoint as needed
//         const updatedSuperAdmins = superAdmins.filter(superAdmin => superAdmin.id !== id);
//         setSuperAdmins(updatedSuperAdmins);
//         localStorage.setItem('superAdmins', JSON.stringify(updatedSuperAdmins));
//       } catch (error) {
//         console.error('Error deleting super admin:', error);
//       }
//     }
//   };

//   const handleCreateSuperAdmin = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       const newSuperAdmin: SuperAdminUser = {
//         id: Date.now(), // This should ideally be generated by the backend
//         name: newSuperAdminForm.name,
//         email: newSuperAdminForm.email,
//         createdAt: new Date().toISOString().split('T')[0]
//       };
//       // Simulate API call
//       // await axios.post('/api/superadmins', newSuperAdmin); // Adjust API endpoint as needed
//       const updatedSuperAdmins = [...superAdmins, newSuperAdmin];
//       setSuperAdmins(updatedSuperAdmins);
//       localStorage.setItem('superAdmins', JSON.stringify(updatedSuperAdmins));
//       setNewSuperAdminForm({ name: '', email: '', password: '' });
//       setShowCreateForm(false);
//     } catch (error) {
//       console.error('Error creating super admin:', error);
//     }
//   };

//   return (
//     <div className="super-admin-container">
//       <div className="page-header">
//         <h2 className="page-title">Super Admins ({superAdmins.length})</h2>
//         <button 
//           className="create-btn"
//           onClick={() => setShowCreateForm(true)}
//         >
//           <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//             <circle cx="12" cy="12" r="10" />
//             <line x1="12" y1="8" x2="12" y2="16" />
//             <line x1="8" y1="12" x2="16" y2="12" />
//           </svg>
//           Create New Super Admin
//         </button>
//       </div>
      
//       <div className="superadmins-grid">
//         {superAdmins.map((superAdmin) => (
//           <div key={superAdmin.id} className="super-admin-card">
//             <div className="super-admin-avatar">
//               <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                 <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
//               </svg>
//             </div>
//             <div className="super-admin-info">
//               <h4>{superAdmin.name}</h4>
//               <p className="super-admin-email">{superAdmin.email}</p>
//               <p className="super-admin-date">Created: {superAdmin.createdAt}</p>
//             </div>
//             <div className="super-admin-actions">
//               <button 
//                 className="delete-btn"
//                 onClick={() => handleDeleteSuperAdmin(superAdmin.id)}
//                 disabled={superAdmins.length <= 1}
//               >
//                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                   <polyline points="3,6 5,6 21,6" />
//                   <path d="M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6" />
//                 </svg>
//                 Delete
//               </button>
//             </div>
//           </div>
//         ))}
//       </div>
      
//       {showCreateForm && (
//         <div className="modal-overlay" onClick={() => setShowCreateForm(false)}>
//           <div className="modal-content" onClick={(e) => e.stopPropagation()}>
//             <h3>Create New Super Admin</h3>
//             <form className="create-form" onSubmit={handleCreateSuperAdmin}>
//               <div className="form-group">
//                 <label>Name</label>
//                 <input 
//                   type="text" 
//                   placeholder="Enter super admin name" 
//                   value={newSuperAdminForm.name}
//                   onChange={(e) => setNewSuperAdminForm({...newSuperAdminForm, name: e.target.value})}
//                   required
//                 />
//               </div>
//               <div className="form-group">
//                 <label>Email</label>
//                 <input 
//                   type="email" 
//                   placeholder="Enter super admin email" 
//                   value={newSuperAdminForm.email}
//                   onChange={(e) => setNewSuperAdminForm({...newSuperAdminForm, email: e.target.value})}
//                   required
//                 />
//               </div>
//               <div className="form-group">
//                 <label>Password</label>
//                 <input 
//                   type="password" 
//                   placeholder="Enter password" 
//                   value={newSuperAdminForm.password}
//                   onChange={(e) => setNewSuperAdminForm({...newSuperAdminForm, password: e.target.value})}
//                   required
//                   minLength={8}
//                 />
//               </div>
//               <div className="form-actions">
//                 <button type="button" className="cancel-btn" onClick={() => setShowCreateForm(false)}>
//                   Cancel
//                 </button>
//                 <button type="submit" className="submit-btn">
//                   Create Super Admin
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// // Main Dashboard Component
// const SuperAdminDashboard: React.FC = () => {
//   const [activeTab, setActiveTab] = useState('overview');

//   const renderContent = () => {
//     switch (activeTab) {
//       case 'overview':
//         return <Overview />;
//       case 'adminUsers':
//         return <AdminUsers />;
//       case 'superAdmin':
//         return <SuperAdmin />;
//       default:
//         return <Overview />;
//     }
//   };

//   return (
//     <div className="super-admin-dashboard">
//       <SuperAdminHeader activeTab={activeTab} onTabChange={setActiveTab} />
//       <main className="dashboard-content">
//         {renderContent()}
//       </main>
//     </div>
//   );
// };

// export default SuperAdminDashboard;