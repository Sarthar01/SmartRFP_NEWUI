import React, { useState, useEffect } from "react";
import Sidebar from "../components/sidebar";
import "../style/Dashboard.css";
import {
  FaFileAlt,
  FaBullseye,
  FaDollarSign,
  FaChevronLeft,
  FaChevronRight,
  FaMagic,
  FaChartLine,
} from "react-icons/fa";
import axios from "axios";

// Axios instance
const api = axios.create({
  baseURL:
    `${import.meta.env.VITE_API_URL?.replace(/\/$/, "") || ""}/v1`,
  headers: {
    "Content-Type": "application/json",
  },
});

const Dashboard: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [organizationStats, setOrganizationStats] = useState<any>(null);
  const [rfpStats, setRfpStats] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [queueStats, setQueueStats] = useState<any>(null);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Navigate calendar months
  const navigateMonth = (direction: "prev" | "next") => {
    const newMonth = new Date(currentMonth);
    if (direction === "prev") newMonth.setMonth(newMonth.getMonth() - 1);
    else newMonth.setMonth(newMonth.getMonth() + 1);
    setCurrentMonth(newMonth);
  };

  // Get days for calendar grid
  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const today = new Date();

    for (let i = 0; i < 42; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);

      const isCurrentMonth = currentDate.getMonth() === month;
      const isToday = currentDate.toDateString() === today.toDateString();
      const hasEvent = projects.some(
        (project) =>
          new Date(project.created_at).toDateString() ===
          currentDate.toDateString()
      );

      days.push({ date: currentDate, isCurrentMonth, isToday, hasEvent });
    }

    return days;
  };

  // Upcoming events (next 4)
  const getUpcomingEvents = () => {
    const today = new Date();
    return projects
      .filter((project) => new Date(project.created_at) >= today)
      .sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )
      .slice(0, 4);
  };

  const formatEventDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return "TODAY";
    else if (date.toDateString() === tomorrow.toDateString()) return "TOMORROW";
    else
      return (
        date.getDate().toString().padStart(2, "0") +
        "\n" +
        date.toLocaleDateString("en", { month: "short" }).toUpperCase()
      );
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");

        // Organization stats
        const orgResponse = await api.get("/admin/organization/stats", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrganizationStats(orgResponse.data);

        // RFP stats
        const rfpResponse = await api.get(
          "/rfp-projects/stats/organization",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setRfpStats(rfpResponse.data);

        // Projects for calendar & recent activity
        const projectsResponse = await api.get("/rfp-projects/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProjects(projectsResponse.data.projects || []);

        // AI queue stats for Box8
        const queueResponse = await api.get("/rfp-projects/queue/overview", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setQueueStats(queueResponse.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchDashboardData();
  }, []);

  // Helper to calculate win rate %
  const calculateWinRate = () => {
    if (!rfpStats) return 0;
    return Math.round(
      ((rfpStats.completed_projects || 0) /
        (rfpStats.total_projects || 1)) *
        100
    );
  };

  // Helper for chart scaling
  const getMaxChartValue = () => {
    if (!rfpStats?.monthly) return 1;
    return Math.max(
      ...rfpStats.monthly.map((m: any) => Math.max(m.proposals, m.wins))
    );
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-content">
        <div className="container1">
          <main className="dashboard-main">
            <h1 className="dashboard-title">DASHBOARD</h1>

            {/* Stat Boxes */}
            <div className="horizontal-containers">
              <div className="stat-box">
                <div className="stat-info">
                  <p className="stat-title">Proposals Generated</p>
                  <h2 className="stat-value">{rfpStats?.total_projects || 0}</h2>
                  <p className="stat-change">
                    <span
                      className={
                        rfpStats?.growth_percentage >= 0 ? "positive" : "negative"
                      }
                    >
                      {rfpStats?.growth_percentage ?? 0}%
                    </span>{" "}
                    from last month
                  </p>
                </div>
                <div className="stat-icon">
                  <FaFileAlt />
                </div>
              </div>

              <div className="stat-box">
                <div className="stat-info">
                  <p className="stat-title">Win Rate</p>
                  <h2 className="stat-value">{calculateWinRate()}%</h2>
                  <p className="stat-change">
                    <span
                      className={rfpStats?.winrate_change >= 0 ? "positive" : "negative"}
                    >
                      {rfpStats?.winrate_change ?? 0}%
                    </span>{" "}
                    from last month
                  </p>
                </div>
                <div className="stat-icon green">
                  <FaBullseye />
                </div>
              </div>

              <div className="stat-box">
                <div className="stat-info">
                  <p className="stat-title">Active Projects</p>
                  <h2 className="stat-value">
                    {organizationStats?.active_rfp_projects || 0}
                  </h2>
                  <p className="stat-change">
                    <span className="positive">
                      {organizationStats?.total_rfp_projects
                        ? Math.round(
                            (organizationStats.active_rfp_projects /
                              organizationStats.total_rfp_projects) *
                              100
                          )
                        : 0}
                      %
                    </span>{" "}
                    active
                  </p>
                </div>
                <div className="stat-icon orange">
                  <FaDollarSign />
                </div>
              </div>
            </div>

            {/* Chart & Cards */}
            <div className="chart-calendar-container">
              <div className="chart-section">
                {/* Chart Box */}
                <div className="chart-container">
                  <div className="chart-header">
                    <div className="chart-title-section">
                      <h2 className="chart-title">Proposal Performance</h2>
                      <p className="chart-subtitle">Monthly win rate and proposal volume</p>
                    </div>
                  </div>
                  <div className="chart-content">
                    <div className="chart-placeholder">
                      <div className="chart-bars">
                        {rfpStats?.monthly?.map((m: any, i: number) => (
                          <div key={i} className="chart-month">
                            <div className="bars">
                              <div
                                className="bar proposals"
                                style={{
                                  height: `${(m.proposals / getMaxChartValue()) *
                                    100}px`,
                                }}
                              ></div>
                              <div
                                className="bar wins"
                                style={{
                                  height: `${(m.wins / getMaxChartValue()) * 100}px`,
                                }}
                              ></div>
                            </div>
                            <div className="month-label">{m.month}</div>
                            <div className="win-rate">{m.winrate}%</div>
                          </div>
                        ))}
                      </div>
                      <div className="chart-legend">
                        <div className="legend-item">
                          <div className="legend-color proposals"></div>
                          <span>Proposals Generated</span>
                        </div>
                        <div className="legend-item">
                          <div className="legend-color wins"></div>
                          <span>Proposals Won</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cards Box */}
                <div className="box7-container">
                  {/* Knowledge Base Upload */}
                  <div className="proposal-generation-card">
                    <div className="proposal-card-icon">
                      <FaMagic />
                    </div>
                    <div className="proposal-card-content">
                      <h3 className="proposal-card-title">Knowledge Base</h3>
                      <p className="proposal-card-description">
                        Upload an RFP and Response to your knowledge base
                      </p>
                      <button
                        className="proposal-card-btn"
                        onClick={() => alert("Hook API to upload")}
                      >
                        Upload
                      </button>
                    </div>
                  </div>

                  {/* Upload RFP */}
                  <div className="upload-rfp-card">
                    <div className="upload-icon">
                      <FaFileAlt />
                    </div>
                    <div className="upload-content">
                      <h3 className="upload-title">Upload RFP Files</h3>
                      <p className="upload-description">
                        Drag & Drop or browse to upload RFP files
                      </p>
                      <button
                        className="proposal-card-btn1"
                        onClick={() => alert("Hook API to upload RFP")}
                      >
                        Upload
                      </button>
                    </div>
                  </div>

                  {/* Analytics */}
                  <div className="analytics-card">
                    <div className="analytics-icon">
                      <FaChartLine />
                    </div>
                    <div className="analytics-content">
                      <h3 className="analytics-title">View Analytics</h3>
                      <p className="analytics-description">
                        Track your proposal performance and win rates
                      </p>
                      <button className="analytics-btn">
                        View Reports
                      </button>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="recent-activity-content">
                  <h2>Recent Activity</h2>
                  {projects.length === 0 ? (
                    <>
                      <div className="activity-empty-icon">
                        <FaFileAlt />
                      </div>
                      <h3 className="activity-empty-title">No proposals yet</h3>
                      <p className="activity-empty-description">
                        Generate your first proposal to see activity here
                      </p>
                      <button className="generate-proposal-btn">
                        Generate Your First Proposal
                      </button>
                    </>
                  ) : (
                    projects.slice(0, 5).map((p, idx) => (
                      <div key={idx} className="activity-item">
                        <FaFileAlt className="activity-icon" />
                        <div className="activity-details">
                          <h4 className="activity-title">
                            {p.title || "Untitled Proposal"}
                          </h4>
                          <p className="activity-description">
                            {p.description
                              ? p.description.length > 100
                                ? p.description.slice(0, 100) + "..."
                                : p.description
                              : "No description available"}
                          </p>
                          <div className="activity-meta">
                            <span className="activity-time">
                              {p.created_at
                                ? new Date(p.created_at).toLocaleDateString()
                                : "No date"}
                            </span>
                            {p.status && (
                              <span
                                className={`activity-status status-${p.status.toLowerCase()}`}
                              >
                                {p.status}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Right Section - Calendar & Box8 */}
              <div className="calendar-section">
                {/* Calendar */}
                <div className="calendar-container">
                  <div className="calendar-header">
                    <h2 className="calendar-title">Important Dates</h2>
                    <p className="calendar-subtitle">
                      Upcoming proposals and deadlines
                    </p>
                  </div>
                  <div className="calendar-content">
                    <div className="calendar-nav">
                      <button
                        className="calendar-nav-btn"
                        onClick={() => navigateMonth("prev")}
                      >
                        <FaChevronLeft />
                      </button>
                      <div className="calendar-current-month">
                        {monthNames[currentMonth.getMonth()]}{" "}
                        {currentMonth.getFullYear()}
                      </div>
                      <button
                        className="calendar-nav-btn"
                        onClick={() => navigateMonth("next")}
                      >
                        <FaChevronRight />
                      </button>
                    </div>

                    <div className="calendar-grid">
                      {dayNames.map((day) => (
                        <div key={day} className="calendar-day-header">
                          {day}
                        </div>
                      ))}
                      {getDaysInMonth().map((day, index) => (
                        <div
                          key={index}
                          className={`calendar-day ${
                            !day.isCurrentMonth ? "other-month" : ""
                          } ${day.isToday ? "today" : ""} ${
                            day.hasEvent ? "has-event" : ""
                          }`}
                        >
                          {day.date.getDate()}
                        </div>
                      ))}
                    </div>

                    <div className="upcoming-events">
                      <h3 className="upcoming-events-title">Upcoming Events</h3>
                      {getUpcomingEvents().map((event, idx) => (
                        <div key={idx} className="event-item">
                          <div className="event-date">
                            {formatEventDate(new Date(event.created_at))}
                          </div>
                          <div className="event-details">
                            <h4 className="event-title">
                              {event.title || "Untitled Project"}
                            </h4>
                            <p className="event-description">
                              {event.client_name || "No client"}
                            </p>
                            {event.deadline && (
                              <span className="event-time">
                                {new Date(event.deadline).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Box8 - AI Queue */}
                <div className="box8-container">
                  <div className="box8-content">
                    <h3 className="box8-title">AI Queue Overview</h3>
                    {queueStats ? (
                      <p>
                        {queueStats.pending || 0} proposals pending AI
                        processing
                      </p>
                    ) : (
                      <p>Loading queue stats...</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
