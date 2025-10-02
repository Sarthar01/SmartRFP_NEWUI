// src/services/api2.ts
import axios from "axios";

const BASE_URL = "/api/v1/superadmin";

const token = localStorage.getItem("token"); 
const headers = {
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
};

// ---------------- Access Requests ----------------
export const getAccessRequests = (status_filter?: string) =>
  axios.get(`${BASE_URL}/access-requests`, {
    headers,
    params: { status_filter },
  });

export const reviewAccessRequest = (
  request_id: number,
  action: "approve" | "deny",
  review_notes: string,
  subscription_tier?: "free" | "plus" | "enterprise",
  max_users?: number
) =>
  axios.post(`${BASE_URL}/access-requests/${request_id}/review`, {
    action,
    review_notes,
    subscription_tier,
    max_users,
  }, { headers });

// ---------------- Organizations ----------------
export const getAllOrganizations = () =>
  axios.get(`${BASE_URL}/organizations`, { headers });

export const updateOrganizationSubscription = (
  org_id: number,
  subscription_tier: "free" | "plus" | "enterprise",
  max_users?: number
) =>
  axios.patch(
    `${BASE_URL}/organizations/${org_id}/subscription`,
    {},
    { headers, params: { subscription_tier, max_users } }
  );

// ---------------- Users ----------------
export const getAllUsers = (organization_id?: number, role?: string) =>
  axios.get(`${BASE_URL}/users`, { headers, params: { organization_id, role } });

export const getRevokedUsers = (organization_id?: number, role?: string) =>
  axios.get(`${BASE_URL}/revoked-users`, { headers, params: { organization_id, role } });

// ---------------- SuperAdmins ----------------
export const getAllSuperAdmins = () =>
  axios.get(`${BASE_URL}/superadmins`, { headers });

export const getRevokedSuperAdmins = () =>
  axios.get(`${BASE_URL}/revoked-superadmins`, { headers });

export const inviteSuperAdmin = (email: string, full_name: string) =>
  axios.post(`${BASE_URL}/invite-superadmin`, { email, full_name }, { headers });

export const revokeSuperAdmin = (superadmin_id: number) =>
  axios.post(`${BASE_URL}/revoke-superadmin/${superadmin_id}`, {}, { headers });

// ---------------- Admins ----------------
export const inviteOrganizationAdmin = (email: string, full_name: string, organization_id: number) =>
  axios.post(`${BASE_URL}/invite-organization-admin`, { email, full_name, organization_id }, { headers });

export const inviteAdminNewOrganization = (email: string, full_name: string, organization_name: string) =>
  axios.post(`${BASE_URL}/invite-admin-new-organization`, { email, full_name, organization_name }, { headers });

export const revokeAdminAccess = (admin_id: number) =>
  axios.post(`${BASE_URL}/revoke-admin-access/${admin_id}`, {}, { headers });

// ---------------- Stats ----------------
export const getSystemStats = () => axios.get(`${BASE_URL}/stats`, { headers });

// ---------------- Master SuperAdmin ----------------
export const getMasterSuperAdminInfo = () =>
  axios.get(`${BASE_URL}/master-superadmin-info`, { headers });
