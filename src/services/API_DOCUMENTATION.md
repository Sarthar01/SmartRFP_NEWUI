# SmartRFP Backend API Documentation

## Overview

This document provides comprehensive API documentation for the SmartRFP Backend system. The API follows RESTful principles and uses JWT authentication for protected endpoints.

## Base Configuration

- **Base URL**: `http://your-domain`
- **API Prefix**: `/api/v1`
- **Full API Base URL**: `http://your-domain/api/v1`
- **Gateway URL**: `http://your-domain` (handles routing to backend)
- **Authentication**: JWT Bearer Token
- **Content-Type**: `application/json`
- **File Uploads**: `multipart/form-data`

## Authentication Flow

### JWT Token Usage
All protected endpoints require the following header:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJhZG1pbkBhY21lLmNvbSIsInJvbGUiOiJhZG1pbiIsIm9yZ2FuaXphdGlvbl9pZCI6IjEiLCJleHAiOjE3MDUzMjk2MDB9.example-signature
```

**Note**: Replace the example token with the actual JWT token received from login.

## API Endpoints Reference

---

## 🔓 Public Endpoints (No Authentication Required)

### 1. Request Access to Platform

**Full Endpoint**: `POST http://your-domain/api/v1/public/request-access`  
**Purpose**: Allow new users to request access to the SmartRFP platform  
**Authentication**: None required

**Request Headers**:
```
Content-Type: application/json
```

**Request Payload**:
```json
{
  "full_name": "John Doe",
  "email": "john.doe@company.com",
  "phone_number": "+1234567890",
  "organization_name": "Acme Corporation"
}
```

**Response (Success - 200)**:
```json
{
  "message": "Access request submitted successfully",
  "request_id": 123,
  "status": "pending",
  "organization_id": "acme-corporation"
}
```

**Response (Error - 400)**:
```json
{
  "error": "Email already exists",
  "detail": "A request with this email already exists"
}
```

---

### 2. Public Health Check

**Full Endpoint**: `GET http://your-domain/api/v1/public/health`  
**Purpose**: Check if the API is running  
**Authentication**: None required

**Request Headers**:
```
Content-Type: application/json
```

**Response**:
```json
{
  "status": "healthy",
  "message": "SmartRFP API is running"
}
```

---

### 3. Public Information

**Full Endpoint**: `GET http://your-domain/api/v1/public/`  
**Purpose**: Get basic API information  
**Authentication**: None required

**Request Headers**:
```
Content-Type: application/json
```

**Response**:
```json
{
  "message": "Welcome to SmartRFP API",
  "documentation": "/docs",
  "request_access": "/public/request-access"
}
```

---

## 🔐 Authentication Endpoints

### 1. User Login

**Full Endpoint**: `POST http://your-domain/api/v1/auth/login`  
**Purpose**: Authenticate user and receive JWT token  
**Authentication**: None required

**Request Headers**:
```
Content-Type: application/x-www-form-urlencoded
```

**Request Payload** (Form Data):
```
username=user@company.com
password=userpassword123
```

**Response (Success - 200)**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJhZG1pbkBhY21lLmNvbSIsInJvbGUiOiJhZG1pbiIsIm9yZ2FuaXphdGlvbl9pZCI6IjEiLCJleHAiOjE3MDUzMjk2MDB9.example-signature",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "user@company.com",
    "full_name": "John Doe",
    "role": "admin",
    "organization_id": 1,
    "is_active": true,
    "must_change_password": false
  }
}
```

**Response (Error - 401)**:
```json
{
  "detail": "Incorrect email or password"
}
```

---

### 2. Get Current User Information

**Full Endpoint**: `GET http://your-domain/api/v1/auth/me`  
**Purpose**: Get authenticated user's profile information  
**Authentication**: Required

**Request Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJhZG1pbkBhY21lLmNvbSIsInJvbGUiOiJhZG1pbiIsIm9yZ2FuaXphdGlvbl9pZCI6IjEiLCJleHAiOjE3MDUzMjk2MDB9.example-signature
Content-Type: application/json
```

**Response (Success - 200)**:
```json
{
  "id": 1,
  "email": "user@company.com",
  "full_name": "John Doe",
  "phone_number": "+1234567890",
  "role": "admin",
  "organization_id": 1,
  "is_active": true,
  "must_change_password": false,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

---

### 3. Change Password

**Full Endpoint**: `POST http://your-domain/api/v1/auth/change-password`  
**Purpose**: Change current user's password  
**Authentication**: Required

**Request Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJhZG1pbkBhY21lLmNvbSIsInJvbGUiOiJhZG1pbiIsIm9yZ2FuaXphdGlvbl9pZCI6IjEiLCJleHAiOjE3MDUzMjk2MDB9.example-signature
Content-Type: application/json
```

**Request Payload**:
```json
{
  "current_password": "oldpassword123",
  "new_password": "newpassword456"
}
```

**Response (Success - 200)**:
```json
{
  "message": "Password changed successfully"
}
```

**Response (Error - 400)**:
```json
{
  "detail": "Current password is incorrect"
}
```

---

### 4. Refresh Token

**Full Endpoint**: `POST http://your-domain/api/v1/auth/refresh-token`  
**Purpose**: Get a new access token using current valid token  
**Authentication**: Required

**Request Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJhZG1pbkBhY21lLmNvbSIsInJvbGUiOiJhZG1pbiIsIm9yZ2FuaXphdGlvbl9pZCI6IjEiLCJleHAiOjE3MDUzMjk2MDB9.example-signature
Content-Type: application/json
```

**Response (Success - 200)**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJhZG1pbkBhY21lLmNvbSIsInJvbGUiOiJhZG1pbiIsIm9yZ2FuaXphdGlvbl9pZCI6IjEiLCJleHAiOjE3MDUzMzAwMDB9.new-signature",
  "token_type": "bearer"
}
```

---

## 👑 SuperAdmin Endpoints (SUPERADMIN Role Required)

### 1. Get All Access Requests

**Full Endpoint**: `GET http://your-domain/api/v1/superadmin/access-requests`  
**Purpose**: View all access requests submitted to the platform  
**Authentication**: Required (SUPERADMIN role)

**Query Parameters**:
- `status_filter` (optional): `pending`, `approved`, `denied`

**Request Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJzdXBlcmFkbWluQHNtYXJ0cmZwLmNvbSIsInJvbGUiOiJzdXBlcmFkbWluIiwib3JnYW5pemF0aW9uX2lkIjpudWxsLCJleHAiOjE3MDUzMjk2MDB9.superadmin-signature
Content-Type: application/json
```

**Response (Success - 200)**:
```json
[
  {
    "id": 1,
    "full_name": "John Doe",
    "email": "john.doe@company.com",
    "phone_number": "+1234567890",
    "organization_name": "Acme Corporation",
    "processed_org_id": "acme-corporation",
    "status": "pending",
    "reviewed_by_user_id": null,
    "review_notes": null,
    "organization_id": null,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
]
```

---

### 2. Review Access Request

**Full Endpoint**: `POST http://your-domain/api/v1/superadmin/access-requests/{request_id}/review`  
**Purpose**: Approve or deny an access request  
**Authentication**: Required (SUPERADMIN role)

**Request Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJzdXBlcmFkbWluQHNtYXJ0cmZwLmNvbSIsInJvbGUiOiJzdXBlcmFkbWluIiwib3JnYW5pemF0aW9uX2lkIjpudWxsLCJleHAiOjE3MDUzMjk2MDB9.superadmin-signature
Content-Type: application/json
```

**Request Payload**:
```json
{
  "action": "approve",
  "review_notes": "Welcome to SmartRFP!",
  "subscription_tier": "free",
  "max_users": 5
}
```

**Available Actions**: `approve`, `deny`  
**Subscription Tiers**: `free`, `plus`, `enterprise`

**Response (Success - 200)**:
```json
{
  "message": "Access request approved successfully",
  "organization_created": true,
  "admin_created": true,
  "welcome_email_sent": true
}
```

---

### 3. Get All Organizations

**Full Endpoint**: `GET http://your-domain/api/v1/superadmin/organizations`  
**Purpose**: View all organizations in the system  
**Authentication**: Required (SUPERADMIN role)

**Request Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJzdXBlcmFkbWluQHNtYXJ0cmZwLmNvbSIsInJvbGUiOiJzdXBlcmFkbWluIiwib3JnYW5pemF0aW9uX2lkIjpudWxsLCJleHAiOjE3MDUzMjk2MDB9.superadmin-signature
Content-Type: application/json
```

**Response (Success - 200)**:
```json
[
  {
    "id": 1,
    "name": "Acme Corporation",
    "org_id": "acme-corporation",
    "subscription_tier": "free",
    "is_active": true,
    "max_users": 5,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
]
```

---

### 4. Get All Users

**Full Endpoint**: `GET http://your-domain/api/v1/superadmin/users`  
**Purpose**: View all active users in the system  
**Authentication**: Required (SUPERADMIN role)

**Query Parameters**:
- `organization_id` (optional): Filter by organization ID
- `role` (optional): `superadmin`, `admin`, `user`

**Request Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJzdXBlcmFkbWluQHNtYXJ0cmZwLmNvbSIsInJvbGUiOiJzdXBlcmFkbWluIiwib3JnYW5pemF0aW9uX2lkIjpudWxsLCJleHAiOjE3MDUzMjk2MDB9.superadmin-signature
Content-Type: application/json
```

**Response (Success - 200)**:
```json
[
  {
    "id": 1,
    "email": "admin@acme.com",
    "full_name": "John Doe",
    "phone_number": "+1234567890",
    "role": "admin",
    "organization_id": 1,
    "is_active": true,
    "must_change_password": false,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
]
```

---

### 5. Get Revoked Users

**Full Endpoint**: `GET http://your-domain/api/v1/superadmin/revoked-users`  
**Purpose**: View all deactivated users  
**Authentication**: Required (SUPERADMIN role)

**Query Parameters**: Same as Get All Users

**Request Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJzdXBlcmFkbWluQHNtYXJ0cmZwLmNvbSIsInJvbGUiOiJzdXBlcmFkbWluIiwib3JnYW5pemF0aW9uX2lkIjpudWxsLCJleHAiOjE3MDUzMjk2MDB9.superadmin-signature
Content-Type: application/json
```

**Response**: Same format as Get All Users (but is_active = false)

---

### 6. Get All SuperAdmins

**Full Endpoint**: `GET http://your-domain/api/v1/superadmin/superadmins`  
**Purpose**: View all SuperAdmin users  
**Authentication**: Required (SUPERADMIN role)

**Request Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJzdXBlcmFkbWluQHNtYXJ0cmZwLmNvbSIsInJvbGUiOiJzdXBlcmFkbWluIiwib3JnYW5pemF0aW9uX2lkIjpudWxsLCJleHAiOjE3MDUzMjk2MDB9.superadmin-signature
Content-Type: application/json
```

**Response (Success - 200)**:
```json
[
  {
    "id": 1,
    "email": "superadmin@smartrfp.com",
    "full_name": "Super Admin",
    "role": "superadmin",
    "organization_id": null,
    "is_active": true,
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

---

### 7. Get Revoked SuperAdmins

**Full Endpoint**: `GET http://your-domain/api/v1/superadmin/revoked-superadmins`  
**Purpose**: View all revoked SuperAdmin users  
**Authentication**: Required (SUPERADMIN role)

**Request Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJzdXBlcmFkbWluQHNtYXJ0cmZwLmNvbSIsInJvbGUiOiJzdXBlcmFkbWluIiwib3JnYW5pemF0aW9uX2lkIjpudWxsLCJleHAiOjE3MDUzMjk2MDB9.superadmin-signature
Content-Type: application/json
```

**Response**: Same format as Get All SuperAdmins (but is_active = false)

---

### 8. Update Organization Subscription

**Full Endpoint**: `PATCH http://your-domain/api/v1/superadmin/organizations/{org_id}/subscription`  
**Purpose**: Update organization's subscription tier and limits  
**Authentication**: Required (SUPERADMIN role)

**Query Parameters**:
- `subscription_tier`: `free`, `plus`, `enterprise`
- `max_users` (optional): Maximum number of users allowed

**Request Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJzdXBlcmFkbWluQHNtYXJ0cmZwLmNvbSIsInJvbGUiOiJzdXBlcmFkbWluIiwib3JnYW5pemF0aW9uX2lkIjpudWxsLCJleHAiOjE3MDUzMjk2MDB9.superadmin-signature
Content-Type: application/json
```

**Response (Success - 200)**:
```json
{
  "message": "Organization subscription updated successfully",
  "organization": {
    "id": 1,
    "name": "Acme Corporation",
    "subscription_tier": "plus",
    "max_users": 15
  }
}
```

---

### 9. Get System Statistics

**Full Endpoint**: `GET http://your-domain/api/v1/superadmin/stats`  
**Purpose**: Get overall system statistics  
**Authentication**: Required (SUPERADMIN role)

**Request Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJzdXBlcmFkbWluQHNtYXJ0cmZwLmNvbSIsInJvbGUiOiJzdXBlcmFkbWluIiwib3JnYW5pemF0aW9uX2lkIjpudWxsLCJleHAiOjE3MDUzMjk2MDB9.superadmin-signature
Content-Type: application/json
```

**Response (Success - 200)**:
```json
{
  "total_organizations": 25,
  "active_organizations": 23,
  "total_users": 150,
  "active_users": 145,
  "total_superadmins": 3,
  "pending_access_requests": 5,
  "subscription_breakdown": {
    "free": 15,
    "plus": 7,
    "enterprise": 3
  }
}
```

---

### 10. Invite New SuperAdmin

**Full Endpoint**: `POST http://your-domain/api/v1/superadmin/invite-superadmin`  
**Purpose**: Create a new SuperAdmin user  
**Authentication**: Required (SUPERADMIN role)

**Request Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJzdXBlcmFkbWluQHNtYXJ0cmZwLmNvbSIsInJvbGUiOiJzdXBlcmFkbWluIiwib3JnYW5pemF0aW9uX2lkIjpudWxsLCJleHAiOjE3MDUzMjk2MDB9.superadmin-signature
Content-Type: application/json
```

**Request Payload**:
```json
{
  "email": "newadmin@smartrfp.com",
  "full_name": "New Super Admin"
}
```

**Response (Success - 200)**:
```json
{
  "message": "SuperAdmin invited successfully",
  "user_id": 5,
  "temporary_password": "TempPass123!",
  "invitation_email_sent": true
}
```

---

### 11. Get Master SuperAdmin Info

**Full Endpoint**: `GET http://your-domain/api/v1/superadmin/master-superadmin-info`  
**Purpose**: Get information about the master SuperAdmin  
**Authentication**: Required (SUPERADMIN role)

**Request Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJzdXBlcmFkbWluQHNtYXJ0cmZwLmNvbSIsInJvbGUiOiJzdXBlcmFkbWluIiwib3JnYW5pemF0aW9uX2lkIjpudWxsLCJleHAiOjE3MDUzMjk2MDB9.superadmin-signature
Content-Type: application/json
```

**Response (Success - 200)**:
```json
{
  "master_superadmin_id": 1,
  "master_superadmin_email": "master@smartrfp.com",
  "is_current_user_master": true
}
```

---

### 12. Revoke SuperAdmin Access

**Full Endpoint**: `POST http://your-domain/api/v1/superadmin/revoke-superadmin/{superadmin_id}`  
**Purpose**: Revoke SuperAdmin privileges (Master SuperAdmin only)  
**Authentication**: Required (Master SUPERADMIN only)

**Request Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJtYXN0ZXJAc21hcnRyZnAuY29tIiwicm9sZSI6InN1cGVyYWRtaW4iLCJvcmdhbml6YXRpb25faWQiOm51bGwsImV4cCI6MTcwNTMyOTYwMH0.master-signature
Content-Type: application/json
```

**Response (Success - 200)**:
```json
{
  "message": "SuperAdmin access revoked successfully",
  "user_id": 5,
  "revocation_email_sent": true
}
```

---

### 13. Invite Organization Admin

**Full Endpoint**: `POST http://your-domain/api/v1/superadmin/invite-organization-admin`  
**Purpose**: Create an admin for an existing organization  
**Authentication**: Required (SUPERADMIN role)

**Request Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJzdXBlcmFkbWluQHNtYXJ0cmZwLmNvbSIsInJvbGUiOiJzdXBlcmFkbWluIiwib3JnYW5pemF0aW9uX2lkIjpudWxsLCJleHAiOjE3MDUzMjk2MDB9.superadmin-signature
Content-Type: application/json
```

**Request Payload**:
```json
{
  "email": "admin@acme.com",
  "full_name": "John Admin",
  "organization_id": 1
}
```

**Response (Success - 200)**:
```json
{
  "message": "Organization admin invited successfully",
  "user_id": 10,
  "temporary_password": "TempPass456!",
  "invitation_email_sent": true
}
```

---

### 14. Invite Admin with New Organization

**Full Endpoint**: `POST http://your-domain/api/v1/superadmin/invite-admin-new-organization`  
**Purpose**: Create a new organization and its admin  
**Authentication**: Required (SUPERADMIN role)

**Request Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJzdXBlcmFkbWluQHNtYXJ0cmZwLmNvbSIsInJvbGUiOiJzdXBlcmFkbWluIiwib3JnYW5pemF0aW9uX2lkIjpudWxsLCJleHAiOjE3MDUzMjk2MDB9.superadmin-signature
Content-Type: application/json
```

**Request Payload**:
```json
{
  "email": "admin@newcompany.com",
  "full_name": "Jane Admin",
  "organization_name": "New Company LLC"
}
```

**Response (Success - 200)**:
```json
{
  "message": "Admin and organization created successfully",
  "organization_id": 5,
  "user_id": 15,
  "temporary_password": "TempPass789!",
  "invitation_email_sent": true
}
```

---

### 15. Revoke Admin Access

**Full Endpoint**: `POST http://your-domain/api/v1/superadmin/revoke-admin-access/{admin_id}`  
**Purpose**: Revoke admin access and deactivate entire organization  
**Authentication**: Required (SUPERADMIN role)

**Request Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJzdXBlcmFkbWluQHNtYXJ0cmZwLmNvbSIsInJvbGUiOiJzdXBlcmFkbWluIiwib3JnYW5pemF0aW9uX2lkIjpudWxsLCJleHAiOjE3MDUzMjk2MDB9.superadmin-signature
Content-Type: application/json
```

**Response (Success - 200)**:
```json
{
  "message": "Admin access revoked and organization deactivated",
  "admin_id": 10,
  "organization_id": 1,
  "users_deactivated": 8,
  "notification_emails_sent": true
}
```

---

## 👨‍💼 Admin Endpoints (ADMIN Role Required)

### 1. Get Organization Users

**Full Endpoint**: `GET http://your-domain/api/v1/admin/organization/users`  
**Purpose**: Get all users in the admin's organization  
**Authentication**: Required (ADMIN role)

**Request Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJhZG1pbkBhY21lLmNvbSIsInJvbGUiOiJhZG1pbiIsIm9yZ2FuaXphdGlvbl9pZCI6IjEiLCJleHAiOjE3MDUzMjk2MDB9.admin-signature
Content-Type: application/json
```

**Response (Success - 200)**:
```json
[
  {
    "id": 5,
    "email": "user@acme.com",
    "full_name": "John User",
    "phone_number": "+1234567890",
    "role": "user",
    "organization_id": 1,
    "is_active": true,
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

---

### 2. Create Organization User

**Full Endpoint**: `POST http://your-domain/api/v1/admin/organization/users`  
**Purpose**: Create a new user in the organization  
**Authentication**: Required (ADMIN role)

**Request Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJhZG1pbkBhY21lLmNvbSIsInJvbGUiOiJhZG1pbiIsIm9yZ2FuaXphdGlvbl9pZCI6IjEiLCJleHAiOjE3MDUzMjk2MDB9.admin-signature
Content-Type: application/json
```

**Request Payload**:
```json
{
  "email": "newuser@acme.com",
  "full_name": "New User",
  "phone_number": "+1234567890",
  "role": "user"
}
```

**Response (Success - 200)**:
```json
{
  "id": 20,
  "email": "newuser@acme.com",
  "full_name": "New User",
  "role": "user",
  "organization_id": 1,
  "temporary_password": "TempPass111!",
  "welcome_email_sent": true
}
```

---

### 3. Update User Role

**Full Endpoint**: `PATCH http://your-domain/api/v1/admin/organization/users/{user_id}/role`  
**Purpose**: Update a user's role within the organization  
**Authentication**: Required (ADMIN role)

**Query Parameters**:
- `new_role`: `admin`, `user` (cannot assign superadmin)

**Request Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJhZG1pbkBhY21lLmNvbSIsInJvbGUiOiJhZG1pbiIsIm9yZ2FuaXphdGlvbl9pZCI6IjEiLCJleHAiOjE3MDUzMjk2MDB9.admin-signature
Content-Type: application/json
```

**Response (Success - 200)**:
```json
{
  "message": "User role updated successfully",
  "user_id": 20,
  "new_role": "admin"
}
```

---

### 4. Deactivate User

**Full Endpoint**: `DELETE http://your-domain/api/v1/admin/organization/users/{user_id}`  
**Purpose**: Deactivate a user in the organization  
**Authentication**: Required (ADMIN role)

**Request Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJhZG1pbkBhY21lLmNvbSIsInJvbGUiOiJhZG1pbiIsIm9yZ2FuaXphdGlvbl9pZCI6IjEiLCJleHAiOjE3MDUzMjk2MDB9.admin-signature
Content-Type: application/json
```

**Response (Success - 200)**:
```json
{
  "message": "User deactivated successfully",
  "user_id": 20
}
```

---

### 5. Get Organization Statistics

**Full Endpoint**: `GET http://your-domain/api/v1/admin/organization/stats`  
**Purpose**: Get statistics for the admin's organization  
**Authentication**: Required (ADMIN role)

**Request Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJhZG1pbkBhY21lLmNvbSIsInJvbGUiOiJhZG1pbiIsIm9yZ2FuaXphdGlvbl9pZCI6IjEiLCJleHAiOjE3MDUzMjk2MDB9.admin-signature
Content-Type: application/json
```

**Response (Success - 200)**:
```json
{
  "organization_name": "Acme Corporation",
  "total_users": 8,
  "active_users": 7,
  "subscription_tier": "free",
  "max_users": 5,
  "user_limit_reached": false,
  "total_rfp_projects": 15,
  "active_rfp_projects": 12
}
```

---

## 📄 RFP Project Endpoints (ADMIN Role Required)

### 1. Create RFP Project

**Full Endpoint**: `POST http://your-domain/api/v1/rfp-projects/`  
**Purpose**: Create a new RFP project with file upload  
**Authentication**: Required (ADMIN role)

**Request Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJhZG1pbkBhY21lLmNvbSIsInJvbGUiOiJhZG1pbiIsIm9yZ2FuaXphdGlvbl9pZCI6IjEiLCJleHAiOjE3MDUzMjk2MDB9.admin-signature
Content-Type: multipart/form-data
```

**Request Payload** (Form Data):
```
title=New RFP Project
description=Project description here
file=<PDF_FILE_UPLOAD>
```

**Response (Success - 200)**:
```json
{
  "id": 1,
  "title": "New RFP Project",
  "description": "Project description here",
  "status": "draft",
  "original_filename": "rfp_document.pdf",
  "file_size": 2048576,
  "file_type": "pdf",
  "processing_progress": 0,
  "organization_id": 1,
  "organization_name": "Acme Corporation",
  "created_by_user_id": 1,
  "created_by_name": "John Admin",
  "ai_processing_complete": false,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

---

### 2. Get RFP Projects (Paginated)

**Full Endpoint**: `GET http://your-domain/api/v1/rfp-projects/`  
**Purpose**: Get paginated list of organization's RFP projects  
**Authentication**: Required (ADMIN role)

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `per_page` (optional): Items per page (default: 20, max: 100)
- `status_filter` (optional): `draft`, `processing`, `completed`, `failed`, `archived`

**Request Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJhZG1pbkBhY21lLmNvbSIsInJvbGUiOiJhZG1pbiIsIm9yZ2FuaXphdGlvbl9pZCI6IjEiLCJleHAiOjE3MDUzMjk2MDB9.admin-signature
Content-Type: application/json
```

**Response (Success - 200)**:
```json
{
  "projects": [
    {
      "id": 1,
      "title": "RFP Project 1",
      "description": "Description",
      "status": "completed",
      "processing_progress": 100,
      "organization_name": "Acme Corporation",
      "created_by_name": "John Admin",
      "ai_processing_complete": true,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 15,
  "page": 1,
  "per_page": 20,
  "total_pages": 1
}
```

---

### 3. Get RFP Project Details

**Full Endpoint**: `GET http://your-domain/api/v1/rfp-projects/{project_id}`  
**Purpose**: Get detailed information about a specific RFP project  
**Authentication**: Required (ADMIN role)

**Request Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJhZG1pbkBhY21lLmNvbSIsInJvbGUiOiJhZG1pbiIsIm9yZ2FuaXphdGlvbl9pZCI6IjEiLCJleHAiOjE3MDUzMjk2MDB9.admin-signature
Content-Type: application/json
```

**Response (Success - 200)**:
```json
{
  "id": 1,
  "title": "RFP Project 1",
  "description": "Detailed description",
  "status": "completed",
  "original_filename": "rfp_document.pdf",
  "file_size": 2048576,
  "file_type": "pdf",
  "processing_progress": 100,
  "processing_log": "Processing completed successfully",
  "task_id": "celery-task-123",
  "processing_notes": "AI processing completed",
  "processing_time_seconds": 120,
  "extracted_requirements": "Detailed requirements extracted by AI...",
  "generated_proposal": "Generated proposal content...",
  "ai_processing_complete": true,
  "organization_id": 1,
  "organization_name": "Acme Corporation",
  "created_by_user_id": 1,
  "created_by_name": "John Admin",
  "file_download_url": "https://storage.url/file.pdf?expires=3600",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z",
  "processed_at": "2024-01-15T10:32:00Z"
}
```

---

### 4. Update RFP Project

**Full Endpoint**: `PUT http://your-domain/api/v1/rfp-projects/{project_id}`  
**Purpose**: Update RFP project information  
**Authentication**: Required (ADMIN role)

**Request Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJhZG1pbkBhY21lLmNvbSIsInJvbGUiOiJhZG1pbiIsIm9yZ2FuaXphdGlvbl9pZCI6IjEiLCJleHAiOjE3MDUzMjk2MDB9.admin-signature
Content-Type: application/json
```

**Request Payload**:
```json
{
  "title": "Updated RFP Project Title",
  "description": "Updated description"
}
```

**Response (Success - 200)**:
```json
{
  "id": 1,
  "title": "Updated RFP Project Title",
  "description": "Updated description",
  "status": "draft",
  "updated_at": "2024-01-15T11:00:00Z"
}
```

---

### 5. Delete RFP Project

**Full Endpoint**: `DELETE http://your-domain/api/v1/rfp-projects/{project_id}`  
**Purpose**: Delete an RFP project and its associated files  
**Authentication**: Required (ADMIN role)

**Request Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJhZG1pbkBhY21lLmNvbSIsInJvbGUiOiJhZG1pbiIsIm9yZ2FuaXphdGlvbl9pZCI6IjEiLCJleHAiOjE3MDUzMjk2MDB9.admin-signature
Content-Type: application/json
```

**Response (Success - 200)**:
```json
{
  "message": "RFP project deleted successfully"
}
```

---

### 6. Get File Download URL

**Full Endpoint**: `GET http://your-domain/api/v1/rfp-projects/{project_id}/download`  
**Purpose**: Get presigned URL for downloading RFP file  
**Authentication**: Required (ADMIN role)

**Request Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJhZG1pbkBhY21lLmNvbSIsInJvbGUiOiJhZG1pbiIsIm9yZ2FuaXphdGlvbl9pZCI6IjEiLCJleHAiOjE3MDUzMjk2MDB9.admin-signature
Content-Type: application/json
```

**Response (Success - 200)**:
```json
{
  "download_url": "https://storage.url/file.pdf?expires=3600",
  "expires_in_minutes": 60
}
```

---

### 7. Get Organization RFP Statistics

**Full Endpoint**: `GET http://your-domain/api/v1/rfp-projects/stats/organization`  
**Purpose**: Get RFP project statistics for the organization  
**Authentication**: Required (ADMIN role)

**Request Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJhZG1pbkBhY21lLmNvbSIsInJvbGUiOiJhZG1pbiIsIm9yZ2FuaXphdGlvbl9pZCI6IjEiLCJleHAiOjE3MDUzMjk2MDB9.admin-signature
Content-Type: application/json
```

**Response (Success - 200)**:
```json
{
  "total_projects": 15,
  "draft_projects": 2,
  "processing_projects": 1,
  "completed_projects": 10,
  "failed_projects": 1,
  "archived_projects": 1,
  "total_storage_mb": 150.5,
  "recent_projects": [
    {
      "id": 1,
      "title": "Recent Project",
      "status": "completed",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

## 🤖 AI Processing Endpoints (ADMIN Role Required)

### 1. Queue RFP for AI Processing

**Full Endpoint**: `POST http://your-domain/api/v1/rfp-projects/{project_id}/process`  
**Purpose**: Queue RFP project for AI processing  
**Authentication**: Required (ADMIN role)

**Request Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJhZG1pbkBhY21lLmNvbSIsInJvbGUiOiJhZG1pbiIsIm9yZ2FuaXphdGlvbl9pZCI6IjEiLCJleHAiOjE3MDUzMjk2MDB9.admin-signature
Content-Type: application/json
```

**Response (Success - 200)**:
```json
{
  "message": "RFP queued for AI processing",
  "task_id": "celery-task-456",
  "project_id": 1,
  "status": "queued"
}
```

---

### 2. Get Processing Status

**Full Endpoint**: `GET http://your-domain/api/v1/rfp-projects/{project_id}/processing-status`  
**Purpose**: Get detailed processing status for RFP project  
**Authentication**: Required (ADMIN role)

**Request Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJhZG1pbkBhY21lLmNvbSIsInJvbGUiOiJhZG1pbiIsIm9yZ2FuaXphdGlvbl9pZCI6IjEiLCJleHAiOjE3MDUzMjk2MDB9.admin-signature
Content-Type: application/json
```

**Response (Success - 200)**:
```json
{
  "project_id": 1,
  "status": "processing",
  "progress": 75,
  "task_id": "celery-task-456",
  "processing_notes": "Extracting requirements from page 5 of 8",
  "estimated_completion": "2024-01-15T10:35:00Z",
  "started_at": "2024-01-15T10:30:00Z"
}
```

---

### 3. Cancel Processing

**Full Endpoint**: `POST http://your-domain/api/v1/rfp-projects/{project_id}/cancel-processing`  
**Purpose**: Cancel ongoing AI processing  
**Authentication**: Required (ADMIN role)

**Request Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJhZG1pbkBhY21lLmNvbSIsInJvbGUiOiJhZG1pbiIsIm9yZ2FuaXphdGlvbl9pZCI6IjEiLCJleHAiOjE3MDUzMjk2MDB9.admin-signature
Content-Type: application/json
```

**Response (Success - 200)**:
```json
{
  "message": "RFP processing cancelled successfully"
}
```

---

### 4. Retry Failed Processing

**Full Endpoint**: `POST http://your-domain/api/v1/rfp-projects/{project_id}/retry-processing`  
**Purpose**: Retry failed AI processing  
**Authentication**: Required (ADMIN role)

**Request Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJhZG1pbkBhY21lLmNvbSIsInJvbGUiOiJhZG1pbiIsIm9yZ2FuaXphdGlvbl9pZCI6IjEiLCJleHAiOjE3MDUzMjk2MDB9.admin-signature
Content-Type: application/json
```

**Response (Success - 200)**:
```json
{
  "message": "RFP processing restarted",
  "task_id": "celery-task-789",
  "project_id": 1
}
```

---

### 5. Get Queue Overview

**Full Endpoint**: `GET http://your-domain/api/v1/rfp-projects/queue/overview`  
**Purpose**: Get processing queue overview  
**Authentication**: Required (ADMIN role)

**Request Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJhZG1pbkBhY21lLmNvbSIsInJvbGUiOiJhZG1pbiIsIm9yZ2FuaXphdGlvbl9pZCI6IjEiLCJleHAiOjE3MDUzMjk2MDB9.admin-signature
Content-Type: application/json
```

**Response (Success - 200)**:
```json
{
  "active_tasks": 2,
  "pending_tasks": 5,
  "failed_tasks": 1,
  "completed_today": 10,
  "average_processing_time": 180,
  "queue_details": [
    {
      "task_id": "task-123",
      "project_id": 5,
      "status": "processing",
      "progress": 50,
      "started_at": "2024-01-15T10:25:00Z"
    }
  ]
}
```

---

## 🧪 Testing Endpoints (ADMIN Role Required)

### 1. Test LLaMA Connection

**Full Endpoint**: `POST http://your-domain/api/v1/rfp-projects/test/llama`  
**Purpose**: Test connection to LLaMA AI service  
**Authentication**: Required (ADMIN role)

**Query Parameters**:
- `message` (optional): Test message (default: "Say hello")

**Request Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJhZG1pbkBhY21lLmNvbSIsInJvbGUiOiJhZG1pbiIsIm9yZ2FuaXphdGlvbl9pZCI6IjEiLCJleHAiOjE3MDUzMjk2MDB9.admin-signature
Content-Type: application/json
```

**Response (Success - 200)**:
```json
{
  "success": true,
  "input": "Say hello",
  "llama_response": "Hello! How can I help you today?",
  "processing_time_seconds": 2.5,
  "llama_api_url": "http://45.198.59.137:11434",
  "llama_model": "llama3:latest",
  "status_code": 200
}
```

**Response (Error)**:
```json
{
  "success": false,
  "error": "Network error: Connection timeout",
  "llama_api_url": "http://45.198.59.137:11434",
  "llama_model": "llama3:latest"
}
```

---

## ❌ Common Error Responses

### Authentication Errors

**401 Unauthorized**:
```json
{
  "detail": "Could not validate credentials"
}
```

**403 Forbidden**:
```json
{
  "detail": "Insufficient permissions"
}
```

### Validation Errors

**400 Bad Request**:
```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

### Not Found Errors

**404 Not Found**:
```json
{
  "detail": "Resource not found"
}
```

### Server Errors

**500 Internal Server Error**:
```json
{
  "detail": "An unexpected error occurred"
}
```

---

## 🔧 Development Notes

### API Prefix Structure
- **Base Domain**: `http://your-domain`
- **API Prefix**: `/api/v1`
- **Full URL Example**: `http://your-domain/api/v1/auth/login`

### File Upload Requirements
- **Supported Formats**: PDF, DOC, DOCX
- **Maximum File Size**: 50MB
- **Content-Type**: `multipart/form-data`

### Pagination
- Default page size: 20 items
- Maximum page size: 100 items
- Pages are 1-indexed

### Date Formats
All dates follow ISO 8601 format: `YYYY-MM-DDTHH:MM:SSZ`

### Status Enums

**User Roles**: `superadmin`, `admin`, `user`  
**RFP Status**: `draft`, `processing`, `completed`, `failed`, `archived`  
**Request Status**: `pending`, `approved`, `denied`  
**Subscription Tiers**: `free`, `plus`, `enterprise`

---

## 🚀 Getting Started for Frontend Integration

1. **Setup Base URL**: Configure your HTTP client with the base URL including prefix
2. **Implement Authentication**: Store JWT tokens and include in headers
3. **Handle File Uploads**: Use FormData for file uploads
4. **Error Handling**: Implement proper error handling for all status codes
5. **Token Refresh**: Implement automatic token refresh logic
6. **Loading States**: Show appropriate loading states for AI processing

### Example HTTP Client Setup (JavaScript)

```javascript
const apiClient = axios.create({
  baseURL: 'http://your-domain/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Example API calls
const login = async (email, password) => {
  const formData = new FormData();
  formData.append('username', email);
  formData.append('password', password);
  
  const response = await apiClient.post('/auth/login', formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
  
  return response.data;
};

const getCurrentUser = async () => {
  const response = await apiClient.get('/auth/me');
  return response.data;
};

const createRFPProject = async (title, description, file) => {
  const formData = new FormData();
  formData.append('title', title);
  formData.append('description', description);
  formData.append('file', file);
  
  const response = await apiClient.post('/rfp-projects/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  
  return response.data;
};
```

This documentation covers all currently implemented endpoints with complete URL paths, prefixes, and bearer token examples. For the latest updates and additional endpoints, please refer to the interactive API documentation at `/docs` when running in development mode.