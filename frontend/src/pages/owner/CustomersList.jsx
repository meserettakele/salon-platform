// src/pages/owner/CustomersList.jsx
import { useState, useEffect, useMemo } from "react";
import { FiSearch, FiEye, FiUser, FiCalendar, FiPhone, FiMail } from "react-icons/fi";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import api from "../../services/api";

export const CustomersList = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/owner/customers");
      const list = Array.isArray(res?.data)
        ? res.data
        : res?.data?.data || res?.data?.customers || [];
      setCustomers(list);
    } catch (err) {
      console.error("Error fetching customer list:", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return customers.filter((c) => {
      const name = c.fullName || c.name || "";
      const phone = c.phone || "";
      const email = c.email || "";
      const q = search.toLowerCase();

      return (
        name.toLowerCase().includes(q) ||
        phone.includes(q) ||
        email.toLowerCase().includes(q)
      );
    });
  }, [customers, search]);

  if (loading) return <Loader />;

  return (
    <div style={{ padding: "16px 20px 48px", maxWidth: "1280px", margin: "0 auto" }}>
      {/* HEADER */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: "800", color: "#111827", margin: 0, fontFamily: "Manrope, sans-serif" }}>
          Customer Directory
        </h1>
        <p style={{ fontSize: "0.88rem", color: "#6b7280", marginTop: "4px" }}>
          Read-only list of clients who have booked appointments at your salon.
        </p>
      </div>

      {/* SEARCH BAR */}
      <Card style={{ padding: "16px 20px", marginBottom: "24px" }}>
        <div style={{ position: "relative", maxWidth: "380px" }}>
          <FiSearch style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
          <input
            type="text"
            placeholder="Search customer by name, phone or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 14px 10px 36px",
              fontSize: "0.88rem",
              borderRadius: "10px",
              border: "1px solid #e5e7eb",
            }}
          />
        </div>
      </Card>

      {/* TABLE */}
      <Card padding="0" style={{ overflow: "hidden" }}>
        {filtered.length === 0 ? (
          <div style={{ padding: "48px 20px", textAlign: "center" }}>
            <FiUser style={{ fontSize: "2.5rem", color: "#d1d5db", marginBottom: "12px" }} />
            <p style={{ margin: 0, fontSize: "0.9rem", color: "#6b7280" }}>
              No customer records found matching your search.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ backgroundColor: "#fafafa", borderBottom: "1px solid #e5e7eb" }}>
                  <th style={thStyle}>Customer Name</th>
                  <th style={thStyle}>Phone</th>
                  <th style={thStyle}>Email</th>
                  <th style={thStyle}>Total Bookings</th>
                  <th style={thStyle}>Last Visit</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => {
                  const name = c.fullName || c.name || "Customer";
                  const phone = c.phone || "N/A";
                  const email = c.email || "N/A";
                  const totalBookings = c.totalBookings ?? c.bookingCount ?? 1;
                  const lastVisit = c.lastVisit || c.updatedAt ? new Date(c.lastVisit || c.updatedAt).toLocaleDateString() : "Recent";

                  return (
                    <tr key={c.id || c.email} style={{ borderBottom: "1px solid #f3f4f6" }}>
                      <td style={tdStyle}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div
                            style={{
                              width: "36px",
                              height: "36px",
                              borderRadius: "50%",
                              backgroundColor: "#eff6ff",
                              color: "#2563eb",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: "700",
                              fontSize: "0.85rem",
                              flexShrink: 0,
                            }}
                          >
                            {name.charAt(0).toUpperCase()}
                          </div>
                          <strong style={{ color: "#111827" }}>{name}</strong>
                        </div>
                      </td>
                      <td style={tdStyle}>{phone}</td>
                      <td style={tdStyle}>{email}</td>
                      <td style={tdStyle}>
                        <span style={{ fontWeight: "800", color: "#2563eb" }}>{totalBookings}</span>
                      </td>
                      <td style={tdStyle}>{lastVisit}</td>
                      <td style={{ ...tdStyle, textAlign: "right" }}>
                        <Button
                          variant="secondary"
                          onClick={() => setSelectedCustomer(c)}
                          style={{ padding: "5px 12px", fontSize: "0.78rem" }}
                        >
                          <FiEye /> View Customer
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* READ-ONLY CUSTOMER DETAILS MODAL */}
      {selectedCustomer && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "700" }}>Customer Profile (Read-Only)</h3>
              <button onClick={() => setSelectedCustomer(null)} style={{ background: "none", border: "none", fontSize: "1.2rem", cursor: "cursor" }}>✕</button>
            </div>

            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  backgroundColor: "#eff6ff",
                  color: "#2563eb",
                  fontSize: "1.5rem",
                  fontWeight: "700",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {(selectedCustomer.fullName || selectedCustomer.name || "C").charAt(0).toUpperCase()}
              </div>
              <h4 style={{ margin: "10px 0 2px 0", fontSize: "1.1rem", fontWeight: "700" }}>
                {selectedCustomer.fullName || selectedCustomer.name}
              </h4>
              <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>Valued Customer</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.88rem", color: "#374151" }}>
              <div><strong>Phone Number:</strong> {selectedCustomer.phone || "N/A"}</div>
              <div><strong>Email Address:</strong> {selectedCustomer.email || "N/A"}</div>
              <div><strong>Total Appointments:</strong> {selectedCustomer.totalBookings ?? 1}</div>
              <div><strong>Last Salon Visit:</strong> {selectedCustomer.lastVisit || "Recent"}</div>
            </div>

            <div style={{ marginTop: "24px", textAlign: "right" }}>
              <Button onClick={() => setSelectedCustomer(null)} variant="secondary">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const thStyle = {
  padding: "12px 16px",
  color: "#4b5563",
  fontWeight: "700",
  fontSize: "0.78rem",
  textTransform: "uppercase",
};

const tdStyle = {
  padding: "14px 16px",
  color: "#111827",
};

const modalOverlay = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  backgroundColor: "rgba(0,0,0,0.4)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 2000,
  padding: "16px",
};

const modalContent = {
  backgroundColor: "#ffffff",
  borderRadius: "16px",
  padding: "24px",
  maxWidth: "440px",
  width: "100%",
  boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
};

export default CustomersList;
