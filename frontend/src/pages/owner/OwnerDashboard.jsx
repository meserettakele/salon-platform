// src/pages/owner/OwnerDashboard.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiCalendar,
  FiClock,
  FiCheckCircle,
  FiUsers,
  FiScissors,
  FiPlus,
  FiDollarSign,
  FiCheck,
  FiX,
  FiChevronRight,
  FiRefreshCw,
  FiTrendingUp,
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import api from "../../services/api";

export const OwnerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [salon, setSalon] = useState(null);
  const [stats, setStats] = useState({
    todayBookings: 0,
    pendingRequests: 0,
    confirmedBookings: 0,
    completedBookings: 0,
    totalEmployees: 0,
    totalServices: 0,
  });

  const [pendingRequestsList, setPendingRequestsList] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [recentNotifications, setRecentNotifications] = useState([]);

  const fetchDashboardData = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);

      const [salonRes, bookingsRes, employeesRes, servicesRes, notifsRes, txnRes] =
        await Promise.all([
          api.get("/owner/salon").catch(() => ({ data: null })),
          api.get("/owner/bookings").catch(() => ({ data: null })),
          api.get("/owner/employees").catch(() => ({ data: null })),
          api.get("/owner/services").catch(() => ({ data: null })),
          api.get("/notifications").catch(() => ({ data: null })),
          api.get("/owner/transactions").catch(() => ({ data: null })),
        ]);

      const salonData = salonRes?.data?.data || salonRes?.data || null;
      setSalon(salonData);

      const bookingsList = Array.isArray(bookingsRes?.data)
        ? bookingsRes.data
        : bookingsRes?.data?.data || [];

      const employeesList = Array.isArray(employeesRes?.data)
        ? employeesRes.data
        : employeesRes?.data?.data || [];

      const servicesList = Array.isArray(servicesRes?.data)
        ? servicesRes.data
        : servicesRes?.data?.data || [];

      const notifsList = Array.isArray(notifsRes?.data)
        ? notifsRes.data
        : notifsRes?.data?.notifications || notifsRes?.data?.data || [];

      // Compute statistics
      // Compute statistics
      const today = new Date();

      const todayCount = bookingsList.filter((b) => {
        if (!b.appointmentDate) return false;

        const bookingDate = new Date(b.appointmentDate);

        return (
          bookingDate.getFullYear() === today.getFullYear() &&
          bookingDate.getMonth() === today.getMonth() &&
          bookingDate.getDate() === today.getDate()
        );
      }).length;

      const pending = bookingsList.filter(
        (b) => (b.bookingStatus || b.status || "").toUpperCase() === "PENDING",
      );

      const confirmed = bookingsList.filter(
        (b) =>
          (b.bookingStatus || b.status || "").toUpperCase() === "CONFIRMED" ||
          (b.bookingStatus || b.status || "").toUpperCase() === "ACCEPTED",
      );

      const completed = bookingsList.filter(
        (b) =>
          (b.bookingStatus || b.status || "").toUpperCase() === "COMPLETED",
      );

      // Payment waiting list: CONFIRMED or ACCEPTED with payment status PENDING_VERIFICATION
      const waitingPayment = bookingsList.filter((b) => {
        const pStatus = (b.paymentStatus || "").toUpperCase();
        return pStatus === "PENDING_VERIFICATION";
      });

      setStats({
        todayBookings: todayCount,
        pendingRequests: pending.length,
        confirmedBookings: confirmed.length,
        completedBookings: completed.length,
        totalEmployees: employeesList.length,
        totalServices: servicesList.length,
      });

      setPendingRequestsList(pending);

      // Recent Transactions
      const txnList = txnRes?.data?.transactions || txnRes?.data?.data || [];
      setRecentTransactions(txnList.slice(0, 6));

      setRecentNotifications(notifsList.slice(0, 5));
    } catch (err) {
      console.error("Error fetching owner dashboard data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleAction = async (bookingId, action) => {
    try {
      await api.patch(`/owner/bookings/${bookingId}/${action}`);
      fetchDashboardData(true);
    } catch (err) {
      alert(err?.response?.data?.message || `Failed to ${action} booking`);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const currentDateString = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  if (loading) return <Loader />;

  return (
    <div
      style={{
        padding: "16px 20px 48px",
        maxWidth: "1280px",
        margin: "0 auto",
      }}
    >
      {/* 1. WELCOME HERO SECTION */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
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
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "6px",
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "4px 10px",
                  borderRadius: "20px",
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  color: "#ffffff",
                  fontSize: "0.75rem",
                  fontWeight: "600",
                }}
              >
                🏪 {salon?.name || user?.salonName || "My Beauty Salon"}
              </span>
              <span
                style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.8)" }}
              >
                • {currentDateString}
              </span>
            </div>

            <h1
              style={{
                fontSize: "1.85rem",
                fontWeight: "800",
                letterSpacing: "-0.02em",
                margin: 0,
                color: "#ffffff",
                fontFamily: "Manrope, sans-serif",
              }}
            >
              {getGreeting()}, {user?.fullName || "Salon Owner"} 👋
            </h1>
            <p
              style={{
                fontSize: "0.9rem",
                color: "rgba(255,255,255,0.85)",
                marginTop: "6px",
                margin: "6px 0 0 0",
              }}
            >
              Welcome to your salon management overview. Here are your
              appointments and service status for today.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              onClick={() => fetchDashboardData(true)}
              disabled={refreshing}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 16px",
                borderRadius: "12px",
                backgroundColor: "rgba(255, 255, 255, 0.15)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255, 255, 255, 0.25)",
                color: "#ffffff",
                fontSize: "0.85rem",
                fontWeight: "600",
                cursor: refreshing ? "not-allowed" : "pointer",
              }}
            >
              <FiRefreshCw
                style={{
                  animation: refreshing ? "spin 1s linear infinite" : "none",
                }}
              />
              {refreshing ? "Refreshing..." : "Sync Stream"}
            </button>
          </div>
        </div>
      </motion.div>

      {/* 2. STATISTICS CARDS GRID (6 CARDS) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
          gap: "16px",
          marginBottom: "28px",
        }}
      >
        <Card style={statCardStyle}>
          <div style={statIconBox("#eff6ff", "#2563eb")}>
            <FiCalendar />
          </div>
          <span style={statLabelStyle}>Today's Bookings</span>
          <h3 style={{ ...statValueStyle, color: "#2563eb" }}>
            {stats.todayBookings}
          </h3>
        </Card>

        <Card style={statCardStyle}>
          <div style={statIconBox("#fffbe6", "#d97706")}>
            <FiClock />
          </div>
          <span style={statLabelStyle}>Pending Requests</span>
          <h3 style={{ ...statValueStyle, color: "#d97706" }}>
            {stats.pendingRequests}
          </h3>
        </Card>

        <Card style={statCardStyle}>
          <div style={statIconBox("#f3e8ff", "#9333ea")}>
            <FiCheckCircle />
          </div>
          <span style={statLabelStyle}>Confirmed</span>
          <h3 style={{ ...statValueStyle, color: "#9333ea" }}>
            {stats.confirmedBookings}
          </h3>
        </Card>

        <Card style={statCardStyle}>
          <div style={statIconBox("#ecfdf5", "#059669")}>
            <FiCheckCircle />
          </div>
          <span style={statLabelStyle}>Completed</span>
          <h3 style={{ ...statValueStyle, color: "#059669" }}>
            {stats.completedBookings}
          </h3>
        </Card>

        <Card style={statCardStyle}>
          <div style={statIconBox("#fce7f3", "#e91e63")}>
            <FiUsers />
          </div>
          <span style={statLabelStyle}>Total Employees</span>
          <h3 style={{ ...statValueStyle, color: "#e91e63" }}>
            {stats.totalEmployees}
          </h3>
        </Card>

        <Card style={statCardStyle}>
          <div style={statIconBox("#f3f4f6", "#374151")}>
            <FiScissors />
          </div>
          <span style={statLabelStyle}>Total Services</span>
          <h3 style={{ ...statValueStyle, color: "#374151" }}>
            {stats.totalServices}
          </h3>
        </Card>
      </div>

      {/* 3. QUICK ACTIONS BAR */}
      <Card style={{ padding: "20px", marginBottom: "28px" }}>
        <h3
          style={{
            fontSize: "0.95rem",
            fontWeight: "700",
            color: "#111827",
            margin: "0 0 14px 0",
          }}
        >
          Quick Actions
        </h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
          <Button
            onClick={() => navigate("/owner/employees")}
            variant="secondary"
          >
            <FiPlus /> Add Employee
          </Button>
          <Button
            onClick={() => navigate("/owner/services")}
            variant="secondary"
          >
            <FiPlus /> Add Service
          </Button>
          <Button onClick={() => navigate("/owner/salon")} variant="secondary">
            🏪 Edit Salon
          </Button>
          <Button onClick={() => navigate("/owner/bookings")}>
            📅 View All Bookings
          </Button>
        </div>
      </Card>

      {/* 4. RECENT BOOKING REQUESTS & PAYMENT WAITING LIST (2 COLUMNS) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(460px, 1fr))",
          gap: "24px",
          marginBottom: "28px",
        }}
      >
        {/* RECENT BOOKING REQUESTS */}
        <Card padding="0" style={{ overflow: "hidden" }}>
          <div style={tableHeaderContainer}>
            <div>
              <h3
                style={{
                  fontSize: "1.05rem",
                  fontWeight: "700",
                  color: "#111827",
                  margin: 0,
                }}
              >
                Recent Booking Requests
              </h3>
              <p
                style={{
                  fontSize: "0.8rem",
                  color: "#6b7280",
                  margin: "2px 0 0 0",
                }}
              >
                Bookings awaiting your acceptance or rejection
              </p>
            </div>
            <Button
              onClick={() => navigate("/owner/bookings")}
              variant="text"
              style={{ fontSize: "0.8rem", color: "#e91e63" }}
            >
              View All <FiChevronRight />
            </Button>
          </div>

          {pendingRequestsList.length === 0 ? (
            <div style={emptyContainer}>
              <FiCheckCircle
                style={{
                  fontSize: "2rem",
                  color: "#10b981",
                  marginBottom: "8px",
                }}
              />
              <p style={{ margin: 0, fontSize: "0.85rem", color: "#6b7280" }}>
                No pending requests. All requests responded to!
              </p>
            </div>
          ) : (
            <div style={{ maxHeight: "360px", overflowY: "auto" }}>
              {pendingRequestsList.map((req) => {
                const customerName =
                  req.customer?.fullName || req.customerName || "Customer";
                const serviceName =
                  req.service?.name || req.serviceName || "Service";
                const employeeName =
                  req.employee?.name || req.employeeName || "Any Staff";
                const dateStr = req.appointmentDate
                  ? req.appointmentDate.split("T")[0]
                  : req.date || "Today";
                const timeStr = req.appointmentTime || req.time || "TBD";

                return (
                  <div key={req.id} style={tableRowStyle}>
                    <div>
                      <strong
                        style={{
                          fontSize: "0.88rem",
                          color: "#111827",
                          display: "block",
                        }}
                      >
                        {customerName}
                      </strong>
                      <span style={{ fontSize: "0.78rem", color: "#6b7280" }}>
                        {serviceName} • {employeeName}
                      </span>
                      <span
                        style={{
                          fontSize: "0.72rem",
                          color: "#9ca3af",
                          display: "block",
                          marginTop: "2px",
                        }}
                      >
                        📅 {dateStr} at {timeStr}
                      </span>
                    </div>

                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        onClick={() => handleAction(req.id, "accept")}
                        style={{
                          padding: "6px 12px",
                          backgroundColor: "#10b981",
                          color: "#ffffff",
                          borderRadius: "8px",
                          border: "none",
                          fontSize: "0.75rem",
                          fontWeight: "700",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <FiCheck /> Accept
                      </button>
                      <button
                        onClick={() => handleAction(req.id, "reject")}
                        style={{
                          padding: "6px 12px",
                          backgroundColor: "#ef4444",
                          color: "#ffffff",
                          borderRadius: "8px",
                          border: "none",
                          fontSize: "0.75rem",
                          fontWeight: "700",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <FiX /> Reject
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* RECENT TRANSACTIONS */}
        <Card padding="0" style={{ overflow: "hidden" }}>
          <div style={tableHeaderContainer}>
            <div>
              <h3
                style={{
                  fontSize: "1.05rem",
                  fontWeight: "700",
                  color: "#111827",
                  margin: 0,
                }}
              >
                Recent Transactions
              </h3>
              <p
                style={{
                  fontSize: "0.8rem",
                  color: "#6b7280",
                  margin: "2px 0 0 0",
                }}
              >
                Latest payment activity in your salon
              </p>
            </div>
            <span
              style={{
                fontSize: "0.75rem",
                padding: "4px 10px",
                background: "linear-gradient(135deg, #e91e63, #c2185b)",
                color: "#fff",
                borderRadius: "10px",
                fontWeight: "700",
              }}
            >
              {recentTransactions.length} Records
            </span>
          </div>

          {recentTransactions.length === 0 ? (
            <div style={emptyContainer}>
              <FiTrendingUp
                style={{
                  fontSize: "2rem",
                  color: "#9ca3af",
                  marginBottom: "8px",
                }}
              />
              <p style={{ margin: 0, fontSize: "0.85rem", color: "#6b7280" }}>
                No transactions recorded yet.
              </p>
            </div>
          ) : (
            <div style={{ maxHeight: "360px", overflowY: "auto" }}>
              {recentTransactions.map((txn) => {
                const customerName =
                  txn.customer?.fullName || "Customer";
                const serviceName =
                  txn.service?.name || "Service";
                const employeeName =
                  txn.employee?.name || null;
                const dateStr = txn.appointmentDate
                  ? new Date(txn.appointmentDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  : "—";
                const amount = txn.payment?.amount
                  ? `$${Number(txn.payment.amount).toFixed(2)}`
                  : "—";
                const pStatus = (txn.payment?.paymentStatus || txn.bookingStatus || "").toUpperCase();
                const isPaid = pStatus === "PAID" || pStatus === "COMPLETED";
                const isPending = pStatus === "PENDING" || pStatus === "PENDING_VERIFICATION";

                return (
                  <div key={txn.id} style={tableRowStyle}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "50%",
                          background: isPaid
                            ? "linear-gradient(135deg, #d1fae5, #a7f3d0)"
                            : isPending
                            ? "linear-gradient(135deg, #fef3c7, #fde68a)"
                            : "linear-gradient(135deg, #fee2e2, #fca5a5)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <FiDollarSign
                          style={{
                            color: isPaid ? "#059669" : isPending ? "#d97706" : "#dc2626",
                            fontSize: "1rem",
                          }}
                        />
                      </div>
                      <div>
                        <strong
                          style={{
                            fontSize: "0.88rem",
                            color: "#111827",
                            display: "block",
                          }}
                        >
                          {customerName}
                        </strong>
                        <span style={{ fontSize: "0.76rem", color: "#6b7280" }}>
                          {serviceName}{employeeName ? ` • ${employeeName}` : ""} • {dateStr}
                        </span>
                      </div>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <strong
                        style={{
                          display: "block",
                          fontSize: "0.92rem",
                          color: isPaid ? "#059669" : "#374151",
                          fontWeight: "700",
                        }}
                      >
                        {amount}
                      </strong>
                      <span
                        style={{
                          padding: "3px 8px",
                          borderRadius: "8px",
                          fontSize: "0.68rem",
                          fontWeight: "700",
                          backgroundColor: isPaid
                            ? "#dcfce7"
                            : isPending
                            ? "#fef3c7"
                            : "#fee2e2",
                          color: isPaid ? "#15803d" : isPending ? "#b45309" : "#b91c1c",
                        }}
                      >
                        {isPaid ? "PAID" : isPending ? "PENDING" : pStatus || "UNKNOWN"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

const statCardStyle = {
  padding: "16px",
  borderRadius: "14px",
  backgroundColor: "#ffffff",
  border: "1px solid #f3f4f6",
};

const statIconBox = (bgColor, textColor) => ({
  width: "36px",
  height: "36px",
  borderRadius: "10px",
  backgroundColor: bgColor,
  color: textColor,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "1.1rem",
  marginBottom: "10px",
});

const statLabelStyle = {
  fontSize: "0.75rem",
  fontWeight: "600",
  color: "#6b7280",
  display: "block",
};

const statValueStyle = {
  fontSize: "1.5rem",
  fontWeight: "800",
  margin: "2px 0 0 0",
  fontFamily: "Manrope, sans-serif",
};

const tableHeaderContainer = {
  padding: "16px 20px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  borderBottom: "1px solid #f3f4f6",
  backgroundColor: "#ffffff",
};

const tableRowStyle = {
  padding: "14px 20px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  borderBottom: "1px solid #f8fafc",
};

const emptyContainer = {
  padding: "36px 20px",
  textAlign: "center",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
};

export default OwnerDashboard;
