import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
//#import lazyloading

// Centralized Common UI Components
import Card from "../../components/common/card";
import Button from "../../components/common/button";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalSalons: 0,
    totalOwners: 0,
    totalBookings: 0,
    totalCustomers: 0,
    pendingApprovals: 0,
    totalRevenue: 0,
  });

  const [recentSalons, setRecentSalons] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Fetch Overview Data
  const fetchDashboardData = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      const [reportsRes, salonsRes, bookingsRes] = await Promise.all([
        api.get("/admin/reports/statistics").catch((err) => ({ error: err })),
        api.get("/admin/salons").catch((err) => ({ error: err })),
        api.get("/admin/bookings").catch((err) => ({ error: err })),
      ]);

      console.log("📊 Reports Raw Response:", reportsRes);
      console.log("🏢 Salons Raw Response:", salonsRes);
      console.log("📅 Bookings Raw Response:", bookingsRes);

      // 1. Process Metrics Data
      if (reportsRes?.data) {
        const rawPayload = reportsRes.data.data || reportsRes.data;
        const summary = rawPayload.summary || {};
        const breakdown = rawPayload.breakdown || {};

        setStats({
          totalSalons: summary.totalSalons ?? rawPayload.totalSalons ?? 0,
          totalOwners: summary.totalUsers ?? rawPayload.totalUsers ?? 0,
          totalBookings: summary.totalBookings ?? rawPayload.totalBookings ?? 0,
          totalCustomers: summary.totalUsers ?? rawPayload.totalCustomers ?? 0,
          pendingApprovals:
            breakdown.pendingSalons ?? rawPayload.pendingApprovals ?? 0,
          totalRevenue: breakdown.revenueEtb ?? rawPayload.totalRevenue ?? 0,
        });
      }

      // 2. Process Salons
      if (salonsRes?.data) {
        const salonList = Array.isArray(salonsRes.data)
          ? salonsRes.data
          : salonsRes.data.data || [];

        setRecentSalons(salonList);
      }

      // 3. Process Bookings
      if (bookingsRes?.data) {
        const bookingList = Array.isArray(bookingsRes.data)
          ? bookingsRes.data
          : bookingsRes.data.data || [];

        setRecentBookings(bookingList);
      }
    } catch (err) {
      console.error("Dashboard Fetch Error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load dashboard data.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Quick Time Greeting Helper
  const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";

    return "Good Evening";
  };

  if (loading) return <Loader />;

  return (
    <div
      style={{
        padding: "24px",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      {/* 1. HEADER / WELCOME SECTION */}
      <div
        style={{
          background:
            "linear-gradient(135deg, #e91e63 0%, #881337 60%, #4c0519 100%)",
          borderRadius: "20px",
          padding: "28px 32px",
          marginBottom: "28px",
          color: "#ffffff",
          boxShadow: "0 12px 32px -8px rgba(233,30,99,0.3)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Ambient Rose Glow */}
        <div
          style={{
            position: "absolute",
            width: "260px",
            height: "260px",
            borderRadius: "50%",
            background: "rgba(233, 30, 99, 0.35)",
            filter: "blur(70px)",
            top: "-120px",
            right: "-80px",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "1.75rem",
                fontWeight: "700",
                color: "#ffffff",
                margin: 0,
              }}
            >
              {getGreeting()}, Admin 👋
            </h1>

            <p
              style={{
                fontSize: "0.875rem",
                color: "rgba(255,255,255,0.85)",
                marginTop: "6px",
                marginBottom: 0,
              }}
            >
              Here is what's happening across your platform today.
            </p>
          </div>

          {/* REFRESH BUTTON */}
          <button
            onClick={() => fetchDashboardData(true)}
            disabled={refreshing}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 16px",
              borderRadius: "12px",
              backgroundColor: "rgba(255,255,255,0.15)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.25)",
              color: "#ffffff",
              fontSize: "0.85rem",
              fontWeight: "600",
              cursor: refreshing ? "not-allowed" : "pointer",
              opacity: refreshing ? 0.7 : 1,
            }}
          >
            <span
              style={{
                display: "inline-block",
                animation: refreshing
                  ? "adminDashboardSpin 1s linear infinite"
                  : "none",
              }}
            >
              ↻
            </span>
            {refreshing ? "Refreshing..." : "Sync Stream"}
          </button>
        </div>

        <style>
          {`
            @keyframes adminDashboardSpin {
              from {
                transform: rotate(0deg);
              }
              to {
                transform: rotate(360deg);
              }
            }
          `}
        </style>
      </div>

      {/* ERROR MESSAGE DISPLAY */}
      {error && <ErrorMessage message={error} />}

      {/* 2. STATISTICS CARDS GRID */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "16px",
          marginBottom: "32px",
        }}
      >
        <Card>
          <span style={statLabelStyle}>🏢 Total Salons</span>
          <strong style={statNumberStyle}>{stats.totalSalons}</strong>
        </Card>

        <Card>
          <span style={statLabelStyle}>👥 Platform Users</span>
          <strong style={statNumberStyle}>{stats.totalCustomers}</strong>
        </Card>

        <Card>
          <span style={statLabelStyle}>📅 Total Bookings</span>
          <strong style={statNumberStyle}>{stats.totalBookings}</strong>
        </Card>

        <Card style={{ borderLeft: "4px solid #f59e0b" }}>
          <span style={statLabelStyle}>⏳ Pending Approvals</span>
          <strong style={{ ...statNumberStyle, color: "#d97706" }}>
            {stats.pendingApprovals}
          </strong>
        </Card>

        <Card style={{ borderLeft: "4px solid #10b981" }}>
          <span style={statLabelStyle}>💰 Total Revenue</span>
          <strong style={{ ...statNumberStyle, color: "#059669" }}>
            {stats.totalRevenue
              ? `${stats.totalRevenue.toLocaleString()} ETB`
              : "0 ETB"}
          </strong>
        </Card>
      </div>

      {/* 3. QUICK ACTIONS BAR */}
      <Card style={{ marginBottom: "32px", padding: "16px 20px" }}>
        <h3
          style={{
            fontSize: "0.95rem",
            fontWeight: "600",
            color: "#374151",
            margin: "0 0 12px 0",
          }}
        >
          Quick Actions
        </h3>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <Button
            onClick={() =>
              navigate("/admin/salons", {
                state: { openModal: true },
              })
            }
          >
            ➕ Register New Salon
          </Button>

          <Button onClick={() => navigate("/admin/salons")} variant="secondary">
            🏢 View Salons
          </Button>

          <Button
            onClick={() => navigate("/admin/categories")}
            variant="secondary"
          >
            📂 Manage Categories
          </Button>

          <Button
            onClick={() => navigate("/admin/reports")}
            variant="secondary"
          >
            📊 View Reports
          </Button>
        </div>
      </Card>

      {/* 4. TABLES SECTION (2 Columns) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))",
          gap: "24px",
        }}
      >
        {/* RECENT SALON REQUESTS */}
        <Card padding="0">
          <div style={tableHeaderStyle}>
            <h3
              style={{
                fontSize: "1rem",
                fontWeight: "600",
                margin: 0,
              }}
            >
              Recent Salon Requests
            </h3>

            <Button
              onClick={() => navigate("/admin/salons")}
              variant="text"
              style={{ fontSize: "0.8rem" }}
            >
              View All
            </Button>
          </div>

          {recentSalons.length === 0 ? (
            <p style={emptyStateStyle}>No pending salon requests.</p>
          ) : (
            <table style={tableStyle}>
              <thead>
                <tr style={thGroupStyle}>
                  <th style={thStyle}>Salon</th>
                  <th style={thStyle}>Owner</th>
                  <th style={thStyle}>Status</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>Action</th>
                </tr>
              </thead>

              <tbody>
                {recentSalons.slice(0, 5).map((salon) => (
                  <tr
                    key={salon.id}
                    style={{
                      borderBottom: "1px solid #f3f4f6",
                    }}
                  >
                    <td style={tdStyle}>
                      <strong>{salon.name}</strong>
                    </td>

                    <td style={tdStyle}>
                      {salon.owner?.fullName || salon.ownerName || "N/A"}
                    </td>

                    <td style={tdStyle}>
                      <span
                        style={getStatusBadgeStyle(salon.status || "PENDING")}
                      >
                        {salon.status || "PENDING"}
                      </span>
                    </td>

                    <td
                      style={{
                        ...tdStyle,
                        textAlign: "right",
                      }}
                    >
                      <Button
                        onClick={() => navigate("/admin/salons")}
                        size="small"
                      >
                        Review
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        {/* RECENT BOOKINGS */}
        <Card padding="0">
          <div style={tableHeaderStyle}>
            <h3
              style={{
                fontSize: "1rem",
                fontWeight: "600",
                margin: 0,
              }}
            >
              Recent Bookings
            </h3>

            <Button
              onClick={() => navigate("/admin/bookings")}
              variant="text"
              style={{ fontSize: "0.8rem" }}
            >
              View All
            </Button>
          </div>

          {recentBookings.length === 0 ? (
            <p style={emptyStateStyle}>No recent bookings found.</p>
          ) : (
            <table style={tableStyle}>
              <thead>
                <tr style={thGroupStyle}>
                  <th style={thStyle}>Customer</th>
                  <th style={thStyle}>Salon</th>
                  <th style={thStyle}>Status</th>
                </tr>
              </thead>

              <tbody>
                {recentBookings.slice(0, 5).map((booking) => {
                  const status = (
                    booking.bookingStatus ||
                    booking.status ||
                    "PENDING"
                  ).toUpperCase();

                  return (
                    <tr
                      key={booking.id}
                      style={{
                        borderBottom: "1px solid #f3f4f6",
                      }}
                    >
                      <td style={tdStyle}>
                        <strong>
                          {booking.customer?.fullName ||
                            booking.customerName ||
                            "Customer"}
                        </strong>
                      </td>

                      <td style={tdStyle}>
                        {booking.salon?.name || booking.salonName || "N/A"}
                      </td>

                      <td style={tdStyle}>
                        <span style={getStatusBadgeStyle(status)}>
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </Card>
      </div>
    </div>
  );
};

// Styling Constants
const statLabelStyle = {
  fontSize: "0.8rem",
  color: "#6b7280",
  display: "block",
};

const statNumberStyle = {
  fontSize: "1.5rem",
  fontWeight: "700",
  color: "#111827",
  marginTop: "4px",
  display: "block",
};

const tableHeaderStyle = {
  padding: "16px 20px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  borderBottom: "1px solid #e5e7eb",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  textAlign: "left",
  fontSize: "0.85rem",
};

const thGroupStyle = {
  backgroundColor: "#f9fafb",
  borderBottom: "1px solid #e5e7eb",
};

const thStyle = {
  padding: "10px 16px",
  color: "#4b5563",
  fontWeight: "600",
};

const tdStyle = {
  padding: "12px 16px",
  color: "#111827",
};

const emptyStateStyle = {
  padding: "24px",
  textAlign: "center",
  color: "#9ca3af",
  margin: 0,
};

const getStatusBadgeStyle = (status) => {
  const base = {
    padding: "4px 8px",
    borderRadius: "12px",
    fontSize: "0.7rem",
    fontWeight: "600",
  };

  if (
    status === "ACCEPTED" ||
    status === "CONFIRMED" ||
    status === "ACTIVE" ||
    status === "COMPLETED"
  ) {
    return {
      ...base,
      backgroundColor: "#dcfce7",
      color: "#15803d",
    };
  }

  if (
    status === "REJECTED" ||
    status === "CANCELLED" ||
    status === "SUSPENDED"
  ) {
    return {
      ...base,
      backgroundColor: "#fee2e2",
      color: "#b91c1c",
    };
  }

  return {
    ...base,
    backgroundColor: "#fef3c7",
    color: "#b45309",
  };
};

export default AdminDashboard;
