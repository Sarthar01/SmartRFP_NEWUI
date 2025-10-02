{/* 
// import React, { useState, useEffect } from "react";
// import Sidebar from "../components/sidebar";
// import "../style/Dashboard.css";
// import { 
//   FaFileAlt, FaBullseye, FaDollarSign, FaChevronLeft, FaChevronRight, 
//   FaMagic, FaChartLine 
// } from "react-icons/fa";
// import axios from "axios";

// // Axios instance
// const api = axios.create({
//   baseURL: `${import.meta.env.VITE_API_URL?.replace(/\/$/, '') || ''}/v1`,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// const Dashboard: React.FC = () => {
//   const [currentMonth, setCurrentMonth] = useState(new Date());
//   const [organizationStats, setOrganizationStats] = useState<any>(null);
//   const [rfpStats, setRfpStats] = useState<any>(null);
//   const [projects, setProjects] = useState<any[]>([]);

//   const monthNames = [
//     "January", "February", "March", "April", "May", "June",
//     "July", "August", "September", "October", "November", "December"
//   ];
//   const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

//   const navigateMonth = (direction: 'prev' | 'next') => {
//     const newMonth = new Date(currentMonth);
//     if (direction === 'prev') newMonth.setMonth(newMonth.getMonth() - 1);
//     else newMonth.setMonth(newMonth.getMonth() + 1);
//     setCurrentMonth(newMonth);
//   };

//   const getDaysInMonth = () => {
//     const year = currentMonth.getFullYear();
//     const month = currentMonth.getMonth();
//     const firstDay = new Date(year, month, 1);
//     const startDate = new Date(firstDay);
//     startDate.setDate(startDate.getDate() - firstDay.getDay());

//     const days = [];
//     const today = new Date();

//     for (let i = 0; i < 42; i++) {
//       const currentDate = new Date(startDate);
//       currentDate.setDate(startDate.getDate() + i);

//       const isCurrentMonth = currentDate.getMonth() === month;
//       const isToday = currentDate.toDateString() === today.toDateString();
//       const hasEvent = projects.some(project =>
//         new Date(project.created_at).toDateString() === currentDate.toDateString()
//       );

//       days.push({ date: currentDate, isCurrentMonth, isToday, hasEvent });
//     }

//     return days;
//   };

//   const getUpcomingEvents = () => {
//     const today = new Date();
//     return projects
//       .filter(project => new Date(project.created_at) >= today)
//       .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
//       .slice(0, 4);
//   };

//   const formatEventDate = (date: Date) => {
//     const today = new Date();
//     const tomorrow = new Date(today);
//     tomorrow.setDate(tomorrow.getDate() + 1);

//     if (date.toDateString() === today.toDateString()) return "TODAY";
//     else if (date.toDateString() === tomorrow.toDateString()) return "TOMORROW";
//     else return date.getDate().toString().padStart(2, '0') + "\n" + 
//          date.toLocaleDateString('en', { month: 'short' }).toUpperCase();
//   };

//   useEffect(() => {
//     const fetchStatsAndProjects = async () => {
//       try {
//         // Organization stats
//         const orgResponse = await api.get("/admin/organization/stats", {
//           headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//         });
//         setOrganizationStats(orgResponse.data);

//         // RFP stats
//         const rfpResponse = await api.get("/rfp-projects/stats/organization", {
//           headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//         });
//         setRfpStats(rfpResponse.data);

//         // Fetch projects for upcoming events
//         const projectsResponse = await api.get("/rfp-projects/", {
//           headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//         });
//         setProjects(projectsResponse.data.projects || []);
//       } catch (error) {
//         console.error("Error fetching dashboard data:", error);
//       }
//     };

//     fetchStatsAndProjects();
//   }, []);

//   return (
//     <div className="dashboard-container">
//       <Sidebar />
//       <div className="dashboard-content">
//         <div className="container1">
//           <main className="dashboard-main">
//             <h1 className="dashboard-title">DASHBOARD</h1>

//             {/* Three horizontal white boxes */}
//             <div className="horizontal-containers">
//               <div className="stat-box">
//                 <div className="stat-info">
//                   <p className="stat-title">Proposals Generated</p>
//                   <h2 className="stat-value">{rfpStats?.total_projects || 0}</h2>
//                   <p className="stat-change">
//                     <span className={rfpStats?.growth_percentage >= 0 ? "positive" : "negative"}>
//     {rfpStats?.growth_percentage ?? 0}%
//   </span> from last month
//                   </p>
//                 </div>
//                 <div className="stat-icon">
//                   <FaFileAlt />
//                 </div>
//               </div>

//               <div className="stat-box">
//                 <div className="stat-info">
//                   <p className="stat-title">Win Rate</p>
//                   <h2 className="stat-value">
//                     {Math.round(((rfpStats?.completed_projects || 0) / (rfpStats?.total_projects || 1)) * 100)}%
//                   </h2>
//                   <p className="stat-change">
//                     <span className={rfpStats?.winrate_change >= 0 ? "positive" : "negative"}>
//     {rfpStats?.winrate_change ?? 0}%
//   </span> from last month
//                   </p>
//                 </div>
//                 <div className="stat-icon green">
//                   <FaBullseye />
//                 </div>
//               </div>

              

//               <div className="stat-box">
//                 <div className="stat-info">
//                   <p className="stat-title">Total Value Won ||Active Projects</p>
//                   <h2 className="stat-value">${organizationStats?.active_rfp_projects || 0}M</h2>
//                   <p className="stat-change">
//                     <span className="positive">+34%</span> from last month
//                   </p>
//                 </div>
//                 <div className="stat-icon orange">
//                   <FaDollarSign />
//                 </div>
//               </div>
//             </div>

//             {/* Box 4-8 container */}
//             <div className="chart-calendar-container">
//               <div className="chart-section">
//                 {/* Box 4 - Chart */}
//                 <div className="chart-container">
//                   <div className="chart-header">
//                     <div className="chart-title-section">
//                       <h2 className="chart-title">Proposal Performance</h2>
//                       <p className="chart-subtitle">Monthly win rate and proposal volume</p>
//                     </div>
//                     <button className="view-analytics-btn">View Analytics</button>
//                   </div>
//                   <div className="chart-content">
//                     <div className="chart-placeholder">
//                       <div className="chart-bars">
//                         {/* Placeholder bars - can later be dynamic based on API */}
//                         {rfpStats?.monthly?.map((m: any, i: number) => (
//   <div key={i} className="chart-month">
//     <div className="bars">
//       <div className="bar proposals" style={{height: `${m.proposals * 5}px`}}></div>
//       <div className="bar wins" style={{height: `${m.wins * 5}px`}}></div>
//     </div>
//     <div className="month-label">{m.month}</div>
//     <div className="win-rate">{m.winrate}%</div>
//   </div>
// ))}
//                       </div>
//                       <div className="chart-legend">
//                         <div className="legend-item">
//                           <div className="legend-color proposals"></div>
//                           <span>Proposals Generated</span>
//                         </div>
//                         <div className="legend-item">
//                           <div className="legend-color wins"></div>
//                           <span>Proposals Won</span>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Box 7 - Cards */}
//                 <div className="box7-container">
//                   <div className="proposal-generation-card">
//                     <div className="proposal-card-icon">
//                       <FaMagic />
//                     </div>
//                     <div className="proposal-card-content">
//                       <h3 className="proposal-card-title">Knowledge Base</h3>
//                       <p className="proposal-card-description">Upload an RFP and Response to your knowledge base</p>
//                       <button className="proposal-card-btn">Upload</button>
//                     </div>
//                   </div>

//                   <div className="upload-rfp-card">
//                     <div className="upload-icon">
//                       <FaFileAlt />
//                     </div>
//                     <div className="upload-content">
//                       <h3 className="upload-title">Upload RFP Files</h3>
//                       <p className="upload-description">Drag & Drop or browse to upload RFP files</p>
//                       <button className="proposal-card-btn1">Upload</button>
//                     </div>
//                   </div>

//                   <div className="analytics-card">
//                     <div className="analytics-icon">
//                       <FaChartLine />
//                     </div>
//                     <div className="analytics-content">
//                       <h3 className="analytics-title">View Analytics</h3>
//                       <p className="analytics-description">Track your proposal performance and win rates</p>
//                       <button className="analytics-btn">View Reports</button>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Box 6 - Recent Activity */}
//                <div className="recent-activity-content"> <h2>Recent Activity</h2>
//   {projects.length === 0 ? (
//     <>
//       <div className="activity-empty-icon"><FaFileAlt /></div>
//       <h3 className="activity-empty-title">No proposals yet</h3>
//       <p className="activity-empty-description">
//         Generate your first proposal to see activity here
//       </p>
//       <button className="generate-proposal-btn">Generate Your First Proposal</button>
//     </>
//   ) : (
//     projects.slice(0, 5).map((p, idx) => (
//       <div key={idx} className="activity-item">
//         <FaFileAlt className="activity-icon" />
//         <div className="activity-details">
//           <h4 className="activity-title">{p.title || "Untitled Proposal"}</h4>

        
//           {/* {p.client_name && (
//             <p className="activity-client">Client: {p.client_name}</p>
//           )} */}

//           {/* Description — allow up to 2 lines */}
//           <p className="activity-description">
//             {p.description
//               ? p.description.length > 100
//                 ? p.description.slice(0, 100) + "..."
//                 : p.description
//               : "No description available"}
//           </p>

//           <div className="activity-meta">
//             <span className="activity-time">
//               {p.created_at ? new Date(p.created_at).toLocaleDateString() : "No date"}
//             </span>
//             {p.status && (
//               <span className={`activity-status status-${p.status.toLowerCase()}`}>
//                 {p.status}
//               </span>
//             )}
//           </div>
//         </div>
//       </div>
//     ))
//   )}
// </div>

//               </div>

//               {/* Right Section - Calendar and Box 8 */}
//               <div className="calendar-section">
//                 {/* Box 5 - Calendar */}
//                 <div className="calendar-container">
//                   <div className="calendar-header">
//                     <h2 className="calendar-title">Important Dates</h2>
//                     <p className="calendar-subtitle">Upcoming proposals and deadlines</p>
//                   </div>
//                   <div className="calendar-content">
//                     <div className="calendar-nav">
//                       <button className="calendar-nav-btn" onClick={() => navigateMonth('prev')}>
//                         <FaChevronLeft />
//                       </button>
//                       <div className="calendar-current-month">
//                         {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
//                       </div>
//                       <button className="calendar-nav-btn" onClick={() => navigateMonth('next')}>
//                         <FaChevronRight />
//                       </button>
//                     </div>

//                     <div className="calendar-grid">
//                       {dayNames.map(day => (
//                         <div key={day} className="calendar-day-header">{day}</div>
//                       ))}
//                       {getDaysInMonth().map((day, index) => (
//                         <div key={index} className={`calendar-day ${!day.isCurrentMonth ? 'other-month' : ''} ${day.isToday ? 'today' : ''} ${day.hasEvent ? 'has-event' : ''}`}>
//                           {day.date.getDate()}
//                         </div>
//                       ))}
//                     </div>

//                     <div className="upcoming-events">
//                       <h3 className="upcoming-events-title">Upcoming Events</h3>
//                       {getUpcomingEvents().map((event, idx) => (
//                         <div key={idx} className="event-item">
//                           <div className={`event-date `}>
//                             {formatEventDate(new Date(event.created_at))}
//                           </div>
//                           <div className="event-details">
//                             <h4 className="event-title">{event.title || "Untitled Project"}</h4>
//                             <p className="event-description">{event.client_name || "No client"}</p>
// <span className="event-time">
//   {new Date(event.deadline).toLocaleDateString()}
// </span>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 </div>

//                 {/* Box 8 - Coming Soon */}
//                 <div className="box8-container">
//                   <div className="box8-content">
//                     <h3 className="box8-title">Coming Soon</h3>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </main>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard; */}



// import React from "react";
// import Sidebar from "../components/sidebar";
// import "../style/Dashboard.css";
// import { FaFileAlt, FaBullseye, FaDollarSign, FaChevronLeft, FaChevronRight, FaMagic, FaChartLine } from "react-icons/fa";
// import { useState } from "react";

// const Dashboard: React.FC = () => {
//   const [currentMonth, setCurrentMonth] = useState(new Date());
  
//   // Sample events data
//   const events = [
//     {
//       date: new Date(2025, 7, 15), // August 15, 2025
//       title: "Tech Corp Proposal Due",
//       description: "Submit final proposal for cloud infrastructure project",
//       time: "11:59 PM",
//       priority: "urgent"
//     },
//     {
//       date: new Date(2025, 7, 18), // August 18, 2025
//       title: "Client Presentation",
//       description: "Present proposal to ABC Company board",
//       time: "2:00 PM",
//       priority: "medium"
//     },
//     {
//       date: new Date(2025, 7, 22), // August 22, 2025
//       title: "Proposal Review Meeting",
//       description: "Internal review for Q4 proposals",
//       time: "10:00 AM",
//       priority: "normal"
//     },
//     {
//       date: new Date(2025, 7, 25), // August 25, 2025
//       title: "Contract Deadline",
//       description: "Final contract submission for XYZ Corp",
//       time: "5:00 PM",
//       priority: "urgent"
//     }
//   ];

//   const monthNames = [
//     "January", "February", "March", "April", "May", "June",
//     "July", "August", "September", "October", "November", "December"
//   ];

//   const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

//   const navigateMonth = (direction: 'prev' | 'next') => {
//     const newMonth = new Date(currentMonth);
//     if (direction === 'prev') {
//       newMonth.setMonth(newMonth.getMonth() - 1);
//     } else {
//       newMonth.setMonth(newMonth.getMonth() + 1);
//     }
//     setCurrentMonth(newMonth);
//   };

//   const getDaysInMonth = () => {
//     const year = currentMonth.getFullYear();
//     const month = currentMonth.getMonth();
//     const firstDay = new Date(year, month, 1);
// // Removed unused lastDay variable
//     const startDate = new Date(firstDay);
//     startDate.setDate(startDate.getDate() - firstDay.getDay());
    
//     const days = [];
//     const today = new Date();
    
//     for (let i = 0; i < 42; i++) {
//       const currentDate = new Date(startDate);
//       currentDate.setDate(startDate.getDate() + i);
      
//       const isCurrentMonth = currentDate.getMonth() === month;
//       const isToday = currentDate.toDateString() === today.toDateString();
//       const hasEvent = events.some(event => 
//         event.date.toDateString() === currentDate.toDateString()
//       );
      
//       days.push({
//         date: currentDate,
//         isCurrentMonth,
//         isToday,
//         hasEvent
//       });
//     }
    
//     return days;
//   };

//   const getUpcomingEvents = () => {
//     const today = new Date();
//     return events
//       .filter(event => event.date >= today)
//       .sort((a, b) => a.date.getTime() - b.date.getTime())
//       .slice(0, 4);
//   };

//   const formatEventDate = (date: Date) => {
//     const today = new Date();
//     const tomorrow = new Date(today);
//     tomorrow.setDate(tomorrow.getDate() + 1);
    
//     if (date.toDateString() === today.toDateString()) {
//       return "TODAY";
//     } else if (date.toDateString() === tomorrow.toDateString()) {
//       return "TOMORROW";
//     } else {
//       return date.getDate().toString().padStart(2, '0') + "\n" + 
//              date.toLocaleDateString('en', { month: 'short' }).toUpperCase();
//     }
//   };

//   return (
//     <div className="dashboard-container">
//       <Sidebar />
//       <div className="dashboard-content">
//         <div className="container1">
//           <main className="dashboard-main">
//             <h1 className="dashboard-title">DASHBOARD</h1>

//             {/* Three horizontal white boxes */}
//             <div className="horizontal-containers">
//               {/* Box 1 */}
//               <div className="stat-box">
//                 <div className="stat-info">
//                   <p className="stat-title">Proposals Generated</p>
//                   <h2 className="stat-value">0</h2>
//                   <p className="stat-change">
//                     <span className="positive">+12%</span> from last month
//                   </p>
//                 </div>
//                 <div className="stat-icon">
//                   <FaFileAlt />
//                 </div>
//               </div>

//               {/* Box 2 */}
//               <div className="stat-box">
//                 <div className="stat-info">
//                   <p className="stat-title">Win Rate</p>
//                   <h2 className="stat-value">73%</h2>
//                   <p className="stat-change">
//                     <span className="positive">+8%</span> from last month
//                   </p>
//                 </div>
//                 <div className="stat-icon green">
//                   <FaBullseye />
//                 </div>
//               </div>

//               {/* Box 3 */}
//               <div className="stat-box">
//                 <div className="stat-info">
//                   <p className="stat-title">Total Value Won</p>
//                   <h2 className="stat-value">$2.8M</h2>
//                   <p className="stat-change">
//                     <span className="positive">+34%</span> from last month
//                   </p>
//                 </div>
//                 <div className="stat-icon orange">
//                   <FaDollarSign />
//                 </div>
//               </div>
//             </div>

//             {/* Box 4, 5, 6, & 7 Container */}
//             <div className="chart-calendar-container">
//               {/* Left Section - Chart, Box 7, and Recent Activity */}
//               <div className="chart-section">
//                 {/* Box 4 - Chart Container */}
//                 <div className="chart-container">
//                   <div className="chart-header">
//                     <div className="chart-title-section">
//                       <h2 className="chart-title">Proposal Performance</h2>
//                       <p className="chart-subtitle">Monthly win rate and proposal volume</p>
//                     </div>
//                     <button className="view-analytics-btn">View Analytics</button>
//                   </div>
                  
//                   <div className="chart-content">
//                     <div className="chart-placeholder">
//                       <div className="chart-bars">
//                         <div className="chart-month">
//                           <div className="bars">
//                             <div className="bar proposals" style={{height: '60px'}}></div>
//                             <div className="bar wins" style={{height: '45px'}}></div>
//                           </div>
//                           <div className="month-label">Jan</div>
//                           <div className="win-rate">75%</div>
//                         </div>
                        
//                         <div className="chart-month">
//                           <div className="bars">
//                             <div className="bar proposals" style={{height: '80px'}}></div>
//                             <div className="bar wins" style={{height: '60px'}}></div>
//                           </div>
//                           <div className="month-label">Feb</div>
//                           <div className="win-rate">75%</div>
//                         </div>
                        
//                         <div className="chart-month">
//                           <div className="bars">
//                             <div className="bar proposals" style={{height: '70px'}}></div>
//                             <div className="bar wins" style={{height: '49px'}}></div>
//                           </div>
//                           <div className="month-label">Mar</div>
//                           <div className="win-rate">70%</div>
//                         </div>
                        
//                         <div className="chart-month">
//                           <div className="bars">
//                             <div className="bar proposals" style={{height: '100px'}}></div>
//                             <div className="bar wins" style={{height: '80px'}}></div>
//                           </div>
//                           <div className="month-label">Apr</div>
//                           <div className="win-rate">80%</div>
//                         </div>
                        
//                         <div className="chart-month">
//                           <div className="bars">
//                             <div className="bar proposals" style={{height: '120px'}}></div>
//                             <div className="bar wins" style={{height: '94px'}}></div>
//                           </div>
//                           <div className="month-label">May</div>
//                           <div className="win-rate">78%</div>
//                         </div>
                        
//                         <div className="chart-month">
//                           <div className="bars">
//                             <div className="bar proposals" style={{height: '95px'}}></div>
//                             <div className="bar wins" style={{height: '75px'}}></div>
//                           </div>
//                           <div className="month-label">Jun</div>
//                           <div className="win-rate">79%</div>
//                         </div>
//                       </div>
                      
//                       <div className="chart-legend">
//                         <div className="legend-item">
//                           <div className="legend-color proposals"></div>
//                           <span>Proposals Generated</span>
//                         </div>
//                         <div className="legend-item">
//                           <div className="legend-color wins"></div>
//                           <span>Proposals Won</span>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Box 7 - Three Horizontal Containers */}
//                 <div className="box7-container">
//                   {/* Box 7.1 - Special Gradient Card */}
//                   <div className="proposal-generation-card">
//                     <div className="proposal-card-icon">
//                       <FaMagic />
//                     </div>
//                     <div className="proposal-card-content">
//                       <h3 className="proposal-card-title">Knowledge Base</h3>
//                       <p className="proposal-card-description">
//                         Upload an RFP and Response to your knowledge base
//                       </p>
//                       <button className="proposal-card-btn">
//                         Upload
//                       </button>
//                     </div>
//                   </div>

//                   {/* Box 7.2 - Upload RFP Document */}
//                   <div className="upload-rfp-card">
//                     <div className="upload-icon">
//                       <FaFileAlt />
//                     </div>
//                     <div className="upload-content">
//                       <h3 className="upload-title">Upload RFP Files</h3>
//                       <p className="upload-description">
//                         Drag & Drop or browse to upload RFP files
//                       </p>
//                       <button className="proposal-card-btn1">
//                         Upload
//                       </button>
//                     </div>
//                   </div>

//                   {/* Box 7.3 - Analytics Card */}
//                   <div className="analytics-card">
//                     <div className="analytics-icon">
//                       <FaChartLine />
//                     </div>
//                     <div className="analytics-content">
//                       <h3 className="analytics-title">View Analytics</h3>
//                       <p className="analytics-description">
//                         Track your proposal performance and win rates
//                       </p>
//                       <button className="analytics-btn">
//                         View Reports
//                       </button>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Box 6 - Recent Activity Container */}
//                 <div className="recent-activity-container">
//                   <div className="recent-activity-header">
//                     <h2 className="recent-activity-title">Recent Activity</h2>
//                     <a href="#" className="view-all-btn">View All Proposals</a>
//                   </div>
                  
//                   <div className="recent-activity-content">
//                     <div className="activity-empty-icon">
//                       <FaFileAlt />
//                     </div>
//                     <h3 className="activity-empty-title">No proposals yet</h3>
//                     <p className="activity-empty-description">
//                       Generate your first proposal to see activity here
//                     </p>
//                     <button className="generate-proposal-btn">
//                       Generate Your First Proposal
//                     </button>
//                   </div>
//                 </div>
//               </div>

//               {/* Right Section - Calendar and Box 8 */}
//               <div className="calendar-section">
//                 {/* Box 5 - Calendar Container */}
//                 <div className="calendar-container">
//                   <div className="calendar-header">
//                     <h2 className="calendar-title">Important Dates</h2>
//                     <p className="calendar-subtitle">Upcoming proposals and deadlines</p>
//                   </div>
                  
//                   <div className="calendar-content">
//                     {/* Calendar Navigation */}
//                     <div className="calendar-nav">
//                       <button className="calendar-nav-btn" onClick={() => navigateMonth('prev')}>
//                         <FaChevronLeft />
//                       </button>
//                       <div className="calendar-current-month">
//                         {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
//                       </div>
//                       <button className="calendar-nav-btn" onClick={() => navigateMonth('next')}>
//                         <FaChevronRight />
//                       </button>
//                     </div>

//                     {/* Calendar Grid */}
//                     <div className="calendar-grid">
//                       {/* Day Headers */}
//                       {dayNames.map(day => (
//                         <div key={day} className="calendar-day-header">
//                           {day}
//                         </div>
//                       ))}
                      
//                       {/* Calendar Days */}
//                       {getDaysInMonth().map((day, index) => (
//                         <div 
//                           key={index}
//                           className={`calendar-day ${
//                             !day.isCurrentMonth ? 'other-month' : ''
//                           } ${day.isToday ? 'today' : ''} ${
//                             day.hasEvent ? 'has-event' : ''
//                           }`}
//                         >
//                           {day.date.getDate()}
//                         </div>
//                       ))}
//                     </div>

//                     {/* Upcoming Events */}
//                     <div className="upcoming-events">
//                       <h3 className="upcoming-events-title">Upcoming Events</h3>
//                       {getUpcomingEvents().map((event, index) => (
//                         <div key={index} className="event-item">
//                           <div className={`event-date ${event.priority}`}>
//                             {formatEventDate(event.date)}
//                           </div>
//                           <div className="event-details">
//                             <h4 className="event-title">{event.title}</h4>
//                             <p className="event-description">{event.description}</p>
//                             <span className="event-time">{event.time}</span>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 </div>

//                 {/* Box 8 - Coming Soon Container */}
//                 <div className="box8-container">
//                   <div className="box8-content">
//                     <h3 className="box8-title">Coming Soon</h3>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </main>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;