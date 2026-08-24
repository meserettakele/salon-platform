// src/pages/admin/SystemReport.jsx
import React, { useState, useEffect } from "react";
import api from "../../services/api";

// Centralized UI Components
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";
import { useDateTime } from "../../context/DateTimeContext";

const SystemReport = () => {
  const { formatDate } = useDateTime();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Aggregated Report State
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalBookings: 0,
    totalCustomers: 0,
    totalSalons: 0,
  });

  const [chartsData, setChartsData] = useState({
    monthlyBookings: [],
    revenueByMonth: [],
    popularServices: [],
    topPerformingSalons: [],
  });

  const [tablesData, setTablesData] = useState({
    top5Salons: [],
    top5Services: [],
    newestCustomers: [],
  });

  // Helper to safely unpack nested API arrays (e.g., res.data, res.data.data, res.data.rows)
  const extractArray = (rawData) => {
    if (Array.isArray(rawData)) return rawData;
    if (Array.isArray(rawData?.data)) return rawData.data;
    if (Array.isArray(rawData?.rows)) return rawData.rows;
    return [];
  };

  const fetchReportData = async (isMounted = { current: true }) => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all required data in parallel
      const [salonsRes, bookingsRes, usersRes] = await Promise.allSettled([
        api.get("/admin/salons"),
        api.get("/admin/bookings"),
        api.get("/admin/users"),
      ]);

      if (!isMounted.current) return;

      const salons =
        salonsRes.status === "fulfilled"
          ? extractArray(salonsRes.value.data)
          : [];
      const bookings =
        bookingsRes.status === "fulfilled"
          ? extractArray(bookingsRes.value.data)
          : [];
      const users =
        usersRes.status === "fulfilled"
          ? extractArray(usersRes.value.data)
          : [];

      // Debug log (Inspect in browser console F12 if numbers seem off)
      console.log("📊 Raw Users Payload:", users);

      // Filter customers matching your Sequelize User model: role ENUM ('CUSTOMER')
      const customers = users.filter((u) => {
        const userRole = String(u.role || "").toUpperCase();
        return userRole === "CUSTOMER";
      });

      // If /admin/users only returns customers by default, fallback to users.length
      const totalCustomersCount =
        customers.length > 0 ? customers.length : users.length;

      // Single-pass Aggregation over Bookings
      let totalRevenue = 0;
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const monthlyBookingCounts = Array(12).fill(0);
      const monthlyRevenue = Array(12).fill(0);
      const serviceMap = {};
      const salonMap = {};

      bookings.forEach((b) => {
        // bookedPrice is the correct field name on the Appointment model
        // service?.price is the fallback if bookedPrice is not present
        const val =
          Number(b.bookedPrice || b.service?.price || b.totalPrice || b.price || 0) || 0;

        const pStatus = String(
          b.paymentStatus || b.payment_status || "",
        ).toUpperCase();
        // PAID = paid explicitly. Also count COMPLETED bookings as revenue earned.
        const isPaid = ["PAID", "COMPLETED", "SUCCESS"].includes(pStatus);
        // Also treat COMPLETED bookings (even UNPAID status) as earned revenue for reporting
        const bookingDone = String(b.bookingStatus || "").toUpperCase() === "COMPLETED";

        // 1. Total Revenue — use bookedPrice when booking is paid or completed
        if (isPaid || bookingDone) {
          totalRevenue += val;
        }

        // 2. Monthly Trend Calculations
        const rawDate = b.createdAt || b.bookingDate || b.date;
        if (rawDate) {
          const mIndex = new Date(rawDate).getMonth();
          if (mIndex >= 0 && mIndex < 12) {
            monthlyBookingCounts[mIndex] += 1;
            if (isPaid || bookingDone) {
              monthlyRevenue[mIndex] += val;
            }
          }
        }

        // 3. Popular Services Aggregation (API returns lowercase 'service' association)
        const serviceName =
          b.service?.name ||
          b.Service?.name ||
          b.serviceName ||
          "General Service";
        serviceMap[serviceName] = (serviceMap[serviceName] || 0) + 1;

        // 4. Top Performing Salons Aggregation (API returns lowercase 'salon' association)
        const salonName =
          b.salon?.name || b.Salon?.name || b.salonName || "Salon Partner";
        if (!salonMap[salonName]) {
          salonMap[salonName] = { name: salonName, bookings: 0, revenue: 0 };
        }
        salonMap[salonName].bookings += 1;
        if (isPaid || bookingDone) {
          salonMap[salonName].revenue += val;
        }
      });

      const popularServices = Object.entries(serviceMap)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      const salonPerformanceList = Object.values(salonMap)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      // Sort Newest Customers (Matches `fullName` from your Sequelize User model)
      const targetCustomerList = customers.length > 0 ? customers : users;
      const newestCustomers = targetCustomerList
        .slice()
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        .slice(0, 5);

      setStats({
        totalRevenue,
        totalBookings: bookings.length,
        totalCustomers: totalCustomersCount,
        totalSalons: salons.length,
      });

      setChartsData({
        monthlyBookings: months.map((m, i) => ({
          month: m,
          value: monthlyBookingCounts[i],
        })),
        revenueByMonth: months.map((m, i) => ({
          month: m,
          value: monthlyRevenue[i],
        })),
        popularServices,
        topPerformingSalons: salonPerformanceList,
      });

      setTablesData({
        top5Salons: salonPerformanceList,
        top5Services: popularServices,
        newestCustomers,
      });
    } catch (err) {
      console.error("❌ System Report Error:", err);
      if (isMounted.current) {
        setError("Failed to generate platform report. Please refresh.");
      }
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  useEffect(() => {
    const isMounted = { current: true };
    fetchReportData(isMounted);

    return () => {
      isMounted.current = false;
    };
  }, []);

  if (loading) return <Loader />;

  return (
    <div
      style={{
        padding: "16px",
        maxWidth: "1280px",
        margin: "0 auto",
        boxSizing: "border-box",
      }}
    >
      {/* PAGE HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "1.75rem",
              fontWeight: "700",
              color: "var(--color-dark)",
              margin: 0,
            }}
          >
            📊 System & Business Reports
          </h1>
          <p
            style={{ fontSize: "0.875rem", color: "var(--color-muted)", marginTop: "4px" }}
          >
            Real-time business statistics, monthly revenue growth, and platform
            performance.
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <Button variant="secondary" onClick={() => fetchReportData()}>
            🔄 Refresh
          </Button>
          <Button onClick={() => window.print()}>🖨️ Print / Export</Button>
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      {/* 1. CARDS SECTION */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
          marginBottom: "28px",
        }}
      >
        <KpiCard
          title="Total Revenue"
          value={`${stats.totalRevenue.toLocaleString()} ETB`}
          icon="💰"
          color="#10b981"
          bgColor="#ecfdf5"
        />
        <KpiCard
          title="Total Bookings"
          value={stats.totalBookings.toLocaleString()}
          icon="📅"
          color="#3b82f6"
          bgColor="#eff6ff"
        />
        <KpiCard
          title="Total Customers"
          value={stats.totalCustomers.toLocaleString()}
          icon="👥"
          color="#8b5cf6"
          bgColor="#f5f3ff"
        />
        <KpiCard
          title="Total Salons"
          value={stats.totalSalons.toLocaleString()}
          icon="🏪"
          color="#ec4899"
          bgColor="#fdf2f8"
        />
      </div>

      {/* 2. CHARTS SECTION */}
      <h2
        style={{
          fontSize: "1.2rem",
          fontWeight: "700",
          color: "var(--color-dark)",
          marginBottom: "16px",
        }}
      >
        📈 Performance Analytics
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "20px",
          marginBottom: "28px",
        }}
      >
        <Card style={{ padding: "20px" }}>
          <h3
            style={{ margin: "0 0 16px 0", fontSize: "1rem", color: "var(--color-dark)" }}
          >
            Monthly Bookings
          </h3>
          <BarChartData
            data={chartsData.monthlyBookings}
            dataKey="value"
            labelKey="month"
            color="#3b82f6"
          />
        </Card>

        <Card style={{ padding: "20px" }}>
          <h3
            style={{ margin: "0 0 16px 0", fontSize: "1rem", color: "var(--color-dark)" }}
          >
            Revenue by Month (ETB)
          </h3>
          <BarChartData
            data={chartsData.revenueByMonth}
            dataKey="value"
            labelKey="month"
            color="#10b981"
            isCurrency
          />
        </Card>

        <Card style={{ padding: "20px" }}>
          <h3
            style={{ margin: "0 0 16px 0", fontSize: "1rem", color: "var(--color-dark)" }}
          >
            Most Popular Services
          </h3>
          <HorizontalList
            data={chartsData.popularServices}
            valueKey="count"
            labelKey="name"
            color="#8b5cf6"
            unit="Bookings"
          />
        </Card>

        <Card style={{ padding: "20px" }}>
          <h3
            style={{ margin: "0 0 16px 0", fontSize: "1rem", color: "var(--color-dark)" }}
          >
            Top-Performing Salons
          </h3>
          <HorizontalList
            data={chartsData.topPerformingSalons}
            valueKey="revenue"
            labelKey="name"
            color="#ec4899"
            isCurrency
          />
        </Card>
      </div>

      {/* 3. TABLES SECTION */}
      <h2
        style={{
          fontSize: "1.2rem",
          fontWeight: "700",
          color: "var(--color-dark)",
          marginBottom: "16px",
        }}
      >
        📋 Summary Breakdown
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "20px",
        }}
      >
        {/* Top 5 Salons Table */}
        <Card padding="0" style={{ overflow: "hidden" }}>
          <div
            style={{
              padding: "14px 16px",
              backgroundColor: "var(--color-card-subtle)",
              borderBottom: "1px solid var(--color-border)",
              fontWeight: "700",
              color: "var(--color-dark)",
            }}
          >
            🏆 Top 5 Salons
          </div>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "0.875rem",
            }}
          >
            <thead>
              <tr
                style={{
                  borderBottom: "1px solid var(--color-border)",
                  textAlign: "left",
                  color: "var(--color-muted)",
                }}
              >
                <th style={{ padding: "10px 16px" }}>Salon</th>
                <th style={{ padding: "10px 16px", textAlign: "center" }}>
                  Bookings
                </th>
                <th style={{ padding: "10px 16px", textAlign: "right" }}>
                  Revenue
                </th>
              </tr>
            </thead>
            <tbody>
              {tablesData.top5Salons.length === 0 ? (
                <tr>
                  <td
                    colSpan="3"
                    style={{
                      padding: "16px",
                      textAlign: "center",
                      color: "#9ca3af",
                    }}
                  >
                    No salon data available
                  </td>
                </tr>
              ) : (
                tablesData.top5Salons.map((s, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td
                      style={{
                        padding: "10px 16px",
                        fontWeight: "600",
                        color: "#111827",
                      }}
                    >
                      {s.name}
                    </td>
                    <td
                      style={{
                        padding: "10px 16px",
                        textAlign: "center",
                        color: "#4b5563",
                      }}
                    >
                      {s.bookings}
                    </td>
                    <td
                      style={{
                        padding: "10px 16px",
                        textAlign: "right",
                        color: "#059669",
                        fontWeight: "600",
                      }}
                    >
                      {s.revenue.toLocaleString()} ETB
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Card>

        {/* Top 5 Services Table */}
        <Card padding="0" style={{ overflow: "hidden" }}>
          <div
            style={{
              padding: "14px 16px",
              backgroundColor: "#f9fafb",
              borderBottom: "1px solid #e5e7eb",
              fontWeight: "700",
              color: "#111827",
            }}
          >
            ✂️ Top 5 Services
          </div>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "0.875rem",
            }}
          >
            <thead>
              <tr
                style={{
                  borderBottom: "1px solid #e5e7eb",
                  textAlign: "left",
                  color: "#6b7280",
                }}
              >
                <th style={{ padding: "10px 16px" }}>Service</th>
                <th style={{ padding: "10px 16px", textAlign: "right" }}>
                  Total Bookings
                </th>
              </tr>
            </thead>
            <tbody>
              {tablesData.top5Services.length === 0 ? (
                <tr>
                  <td
                    colSpan="2"
                    style={{
                      padding: "16px",
                      textAlign: "center",
                      color: "#9ca3af",
                    }}
                  >
                    No service data available
                  </td>
                </tr>
              ) : (
                tablesData.top5Services.map((srv, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td
                      style={{
                        padding: "10px 16px",
                        fontWeight: "600",
                        color: "#111827",
                      }}
                    >
                      {srv.name}
                    </td>
                    <td
                      style={{
                        padding: "10px 16px",
                        textAlign: "right",
                        color: "#2563eb",
                        fontWeight: "600",
                      }}
                    >
                      {srv.count}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Card>

        {/* Newest Customers Table */}
        <Card padding="0" style={{ overflow: "hidden" }}>
          <div
            style={{
              padding: "14px 16px",
              backgroundColor: "#f9fafb",
              borderBottom: "1px solid #e5e7eb",
              fontWeight: "700",
              color: "#111827",
            }}
          >
            👤 Newest Customers
          </div>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "0.875rem",
            }}
          >
            <thead>
              <tr
                style={{
                  borderBottom: "1px solid #e5e7eb",
                  textAlign: "left",
                  color: "#6b7280",
                }}
              >
                <th style={{ padding: "10px 16px" }}>Full Name</th>
                <th style={{ padding: "10px 16px", textAlign: "right" }}>
                  Joined Date
                </th>
              </tr>
            </thead>
            <tbody>
              {tablesData.newestCustomers.length === 0 ? (
                <tr>
                  <td
                    colSpan="2"
                    style={{
                      padding: "16px",
                      textAlign: "center",
                      color: "#9ca3af",
                    }}
                  >
                    No customer data available
                  </td>
                </tr>
              ) : (
                tablesData.newestCustomers.map((c, i) => (
                  <tr
                    key={c.id || i}
                    style={{ borderBottom: "1px solid #f3f4f6" }}
                  >
                    <td
                      style={{
                        padding: "10px 16px",
                        fontWeight: "600",
                        color: "#111827",
                      }}
                    >
                      {c.fullName || c.email}
                    </td>
                    <td
                      style={{
                        padding: "10px 16px",
                        textAlign: "right",
                        color: "#6b7280",
                      }}
                    >
                      {c.createdAt
                        ? formatDate(c.createdAt)
                        : "Recent"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
};

// Sub-components
const KpiCard = ({ title, value, icon, color, bgColor }) => (
  <Card style={{ padding: "18px", backgroundColor: "#fff" }}>
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div>
        <div
          style={{ fontSize: "0.8rem", fontWeight: "600", color: "#6b7280" }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: "1.5rem",
            fontWeight: "700",
            color: "var(--color-dark)",
            marginTop: "4px",
          }}
        >
          {value}
        </div>
      </div>
      <div
        style={{
          width: "42px",
          height: "42px",
          borderRadius: "10px",
          backgroundColor: bgColor,
          color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.2rem",
        }}
      >
        {icon}
      </div>
    </div>
  </Card>
);

const BarChartData = ({ data, dataKey, labelKey, color, isCurrency }) => {
  const values = data.map((d) => Number(d[dataKey]) || 0);
  const maxVal = Math.max(...values, 1);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        height: "160px",
        gap: "6px",
        paddingTop: "20px",
      }}
    >
      {data.map((item, idx) => {
        const val = Number(item[dataKey]) || 0;
        const pct = (val / maxVal) * 100;
        return (
          <div
            key={idx}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              height: "100%",
            }}
          >
            <div
              style={{
                flex: 1,
                width: "100%",
                display: "flex",
                alignItems: "flex-end",
              }}
            >
              <div
                title={`${item[labelKey]}: ${val.toLocaleString()} ${isCurrency ? "ETB" : ""}`}
                style={{
                  width: "100%",
                  height: `${Math.max(pct, 4)}%`,
                  backgroundColor: color,
                  borderRadius: "3px 3px 0 0",
                  transition: "height 0.3s ease",
                }}
              />
            </div>
            <span
              style={{
                fontSize: "0.65rem",
                color: "var(--color-muted)",
                marginTop: "6px",
              }}
            >
              {item[labelKey]}
            </span>
          </div>
        );
      })}
    </div>
  );
};

const HorizontalList = ({
  data,
  valueKey,
  labelKey,
  color,
  isCurrency,
  unit,
}) => {
  const values = data.map((d) => Number(d[valueKey]) || 0);
  const maxVal = Math.max(...values, 1);

  if (data.length === 0) {
    return (
      <div style={{ color: "var(--color-muted-light)", fontSize: "0.85rem" }}>
        No data recorded yet.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {data.map((item, idx) => {
        const val = Number(item[valueKey]) || 0;
        const pct = (val / maxVal) * 100;
        return (
          <div key={idx}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "0.8rem",
                marginBottom: "4px",
              }}
            >
              <span style={{ fontWeight: "600", color: "var(--color-dark)" }}>
                {item[labelKey]}
              </span>
              <span style={{ fontWeight: "700", color: "var(--color-dark)" }}>
                {isCurrency
                  ? `${val.toLocaleString()} ETB`
                  : `${val} ${unit || ""}`}
              </span>
            </div>
            <div
              style={{
                height: "6px",
                width: "100%",
                backgroundColor: "var(--color-card-subtle)",
                borderRadius: "3px",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${pct}%`,
                  backgroundColor: color,
                  borderRadius: "3px",
                  transition: "width 0.3s ease",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SystemReport;
