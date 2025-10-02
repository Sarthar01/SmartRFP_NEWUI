# SmartRFP Frontend

**AI-Powered Request for Proposal (RFP) Processing System - Frontend**

SmartRFP is a production-ready, multi-tenant platform that automatically extracts requirements from RFP documents using LLaMA 3 AI, featuring real-time processing with queue management and comprehensive role-based access control. This repository contains the frontend application built with React, TypeScript, and Vite.

## 🚀 Features

- ✅ **Modern React Application** - Built with React 19 and TypeScript
- ✅ **Material UI Components** - Sleek and responsive design with RUI v7
- ✅ **Role-Based Access Control** - Different interfaces for SuperAdmin, Admin, and Users
- ✅ **Responsive Design** - Works on desktop and mobile devices

## 🏗️ Project Structure

```
smartrfpv3/
├── src/                        # Source code
│   ├── assets/                # Static assets
│   ├── components/            # Reusable UI components
│   │   └── NavBar.tsx        # Navigation component
│   ├── pages/                 # Application pages
│   │   ├── Home.tsx          # Landing page
│   │   ├── About.tsx         # About page
│   │   ├── Contact.tsx       # Contact page
│   │   ├── Login.tsx         # Authentication page
│   │   ├── SuperAdmin.tsx    # SuperAdmin interface
│   │   └── SuperAdminDashboard.tsx # Dashboard for SuperAdmin
│   ├── style/                 # CSS styles
│   ├── App.tsx               # Main application component
│   ├── main.tsx              # Application entry point
│   └── type.d.ts             # TypeScript declarations
├── public/                    # Public assets
├── index.html                 # HTML entry point
└── package.json               # Dependencies and scripts
```

## 🛠️ Tech Stack

| Component            | Technology    | Version | Purpose                  |
| -------------------- | ------------- | ------- | ------------------------ |
| **Framework**  | React         | 19.1.0  | UI library               |
| **Build Tool** | Vite          | 7.0.4   | Development & build tool |
| **Language**   | TypeScript    | 5.8.3   | Type-safe JavaScript     |
| **UI Library** | Radix UI     | 7.2.0   | Component library        |
| **Routing**    | React Router  | 7.6.3   | Application routing      |
| **Animations** | Framer Motion | 12.23.3 | UI animations            |
| **Icons**      | Lucide React  | 0.525.0 | Modern icon set          |

## 📋 Prerequisites

- Node.js 18.0+ (LTS recommended)
- npm or yarn package manager
- Backend services running (see backend documentation)

## 🚀 Getting Started

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd smartrfpv3

# Install dependencies
npm install
```

### Available Scripts

In the project directory, you can run:

#### `npm run dev`

Runs the app in development mode.
Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

The page will reload if you make edits.
You will also see any lint errors in the console.

#### `npm run build`

Builds the app for production to the `dist` folder.
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.
Your app is ready to be deployed!

#### `npm run lint`

Lints the project using ESLint.

#### `npm run preview`

Serves the production build locally for preview.

1**🎯 Quick Test:** After starting the development server, visit http://localhost:5173 to access the SmartRFP frontend interface.

**🔧 Need Help?** Check the troubleshooting section above or contact the development team.
