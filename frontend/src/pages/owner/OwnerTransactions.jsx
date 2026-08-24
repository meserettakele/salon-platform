import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";

const OwnerTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    todayRevenue: 0,
    monthlyRevenue: 0,
    pendingCount: 0,
    pendingAmount: 0,
    totalPaidCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const fetchTransactions = async () => {
    try {
      const response = await api.get("/owner/transactions");
      console.log("response.data:", response.data);
      console.log("response.data.data:", response.data.data);
      setTransactions(response.data.transactions || []);

      setSummary(
        response.data.summary || {
          totalRevenue: 0,
          todayRevenue: 0,
          monthlyRevenue: 0,
          pendingCount: 0,
          pendingAmount: 0,
          totalPaidCount: 0,
        },
      );
    } catch (error) {
      console.error(
        "Error fetching transactions:",
        error.response?.data || error.message,
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((item) => {
      const paymentStatus = item.payment?.paymentStatus || "";

      const matchesFilter = filter === "ALL" || paymentStatus === filter;

      const searchText = search.toLowerCase();

      const matchesSearch =
        !searchText ||
        item.customer?.fullName?.toLowerCase().includes(searchText) ||
        item.customer?.phone?.toLowerCase().includes(searchText) ||
        item.service?.name?.toLowerCase().includes(searchText) ||
        item.payment?.transactionId?.toLowerCase().includes(searchText);

      return matchesFilter && matchesSearch;
    });
  }, [transactions, filter, search]);

  const formatAmount = (amount) => {
    return `${Number(amount || 0).toLocaleString()} ETB`;
  };

  const formatDateTime = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleString();
  };

  const getStatusStyle = (status) => {
    if (status === "PAID") {
      return {
        background: "rgba(34, 197, 94, 0.12)",
        color: "#16a34a",
      };
    }

    if (status === "PENDING") {
      return {
        background: "rgba(234, 179, 8, 0.14)",
        color: "#ca8a04",
      };
    }

    if (status === "FAILED") {
      return {
        background: "rgba(239, 68, 68, 0.12)",
        color: "#dc2626",
      };
    }

    return {
      background: "rgba(107, 114, 128, 0.12)",
      color: "var(--color-muted)",
    };
  };

  const cardStyle = {
    flex: "1 1 220px",
    minWidth: "220px",
    padding: "22px",
    borderRadius: "18px",
    background: "var(--color-card)",
    border: "1px solid var(--color-border)",
    boxShadow: "var(--shadow-sm)",
  };

  const filterButtonStyle = (active) => ({
    padding: "9px 17px",
    borderRadius: "10px",
    border: active ? "1px solid var(--color-primary)" : "1px solid var(--color-border)",
    background: active ? "var(--color-primary)" : "var(--color-card)",
    color: active ? "#fff" : "var(--color-muted)",
    cursor: "pointer",
    fontWeight: "600",
  });

  if (loading) {
    return (
      <div
        style={{
          padding: "40px",
          textAlign: "center",
          color: "var(--color-muted)",
        }}
      >
        Loading transactions...{" "}
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "24px",
        minHeight: "100%",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <h1
          style={{
            margin: 0,
            fontSize: "28px",
            fontWeight: "700",
            color: "var(--color-dark)",
          }}
        >
          💳 Transactions & Revenue{" "}
        </h1>

        <p
          style={{
            marginTop: "8px",
            color: "#6b7280",
          }}
        >
          Track your salon earnings and payment activity.
        </p>
      </div>

      {/* KPI Cards */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "18px",
          marginBottom: "28px",
        }}
      >
        <div style={cardStyle}>
          <div style={{ fontSize: "28px", marginBottom: "10px" }}>💰</div>
          <div style={{ color: "var(--color-muted)", fontSize: "14px" }}>
            Total Revenue
          </div>
          <div
            style={{
              marginTop: "7px",
              fontSize: "24px",
              fontWeight: "700",
              color: "var(--color-dark)",
            }}
          >
            {formatAmount(summary.totalRevenue)}
          </div>
          <div
            style={{
              marginTop: "5px",
              fontSize: "12px",
              color: "var(--color-muted)",
            }}
          >
            {summary.totalPaidCount} paid transactions
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ fontSize: "28px", marginBottom: "10px" }}>📅</div>
          <div style={{ color: "var(--color-muted)", fontSize: "14px" }}>
            Today's Revenue
          </div>
          <div
            style={{
              marginTop: "7px",
              fontSize: "24px",
              fontWeight: "700",
              color: "var(--color-dark)",
            }}
          >
            {formatAmount(summary.todayRevenue)}
          </div>
          <div
            style={{
              marginTop: "5px",
              fontSize: "12px",
              color: "var(--color-muted)",
            }}
          >
            Paid earnings today
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ fontSize: "28px", marginBottom: "10px" }}>📊</div>
          <div style={{ color: "var(--color-muted)", fontSize: "14px" }}>
            Monthly Revenue
          </div>
          <div
            style={{
              marginTop: "7px",
              fontSize: "24px",
              fontWeight: "700",
              color: "var(--color-dark)",
            }}
          >
            {formatAmount(summary.monthlyRevenue)}
          </div>
          <div
            style={{
              marginTop: "5px",
              fontSize: "12px",
              color: "var(--color-muted)",
            }}
          >
            Current month earnings
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ fontSize: "28px", marginBottom: "10px" }}>⏳</div>
          <div style={{ color: "var(--color-muted)", fontSize: "14px" }}>
            Pending Payments
          </div>
          <div
            style={{
              marginTop: "7px",
              fontSize: "24px",
              fontWeight: "700",
              color: "#ca8a04",
            }}
          >
            {formatAmount(summary.pendingAmount)}
          </div>
          <div
            style={{
              marginTop: "5px",
              fontSize: "12px",
              color: "var(--color-muted)",
            }}
          >
            {summary.pendingCount} pending payments
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "14px",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
          }}
        >
          {["ALL", "PAID", "PENDING", "FAILED"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              style={filterButtonStyle(filter === status)}
            >
              {status === "ALL"
                ? "All"
                : status.charAt(0) + status.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Search customer, phone, service, transaction ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "min(100%, 360px)",
            padding: "11px 14px",
            borderRadius: "10px",
            border: "1px solid var(--color-border)",
            outline: "none",
            background: "var(--color-card)",
            color: "var(--color-dark)",
            fontSize: "14px",
          }}
        />
      </div>

      {/* Transactions Table */}
      <div
        style={{
          overflowX: "auto",
          borderRadius: "18px",
          background: "var(--color-card)",
          border: "1px solid var(--color-border)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <table
          style={{
            width: "100%",
            minWidth: "1100px",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr
              style={{
                borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
                textAlign: "left",
              }}
            >
              <th style={{ padding: "16px" }}>Customer</th>
              <th style={{ padding: "16px" }}>Service & Staff</th>
              <th style={{ padding: "16px" }}>Amount & Method</th>
              <th style={{ padding: "16px" }}>Date & Time</th>
              <th style={{ padding: "16px" }}>Transaction Reference</th>
              <th style={{ padding: "16px" }}>Status</th>
            </tr>
          </thead>

          <tbody>
            {filteredTransactions.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  style={{
                    padding: "40px",
                    textAlign: "center",
                    color: "#6b7280",
                  }}
                >
                  No transactions found.
                </td>
              </tr>
            ) : (
              filteredTransactions.map((item) => {
                const payment = item.payment;
                const customer = item.customer;
                const service = item.service;
                const employee = item.employee;

                const status = payment?.paymentStatus || "UNKNOWN";

                return (
                  <tr
                    key={item.id}
                    style={{
                      borderBottom: "1px solid var(--color-border)",
                    }}
                  >
                    <td style={{ padding: "16px" }}>
                      <div
                        style={{
                          fontWeight: "600",
                          color: "var(--color-dark)",
                        }}
                      >
                        {customer?.fullName || "Customer"}
                      </div>

                      <div
                        style={{
                          marginTop: "4px",
                          fontSize: "13px",
                          color: "var(--color-muted)",
                        }}
                      >
                        {customer?.phone || "No phone"}
                      </div>

                      <div
                        style={{
                          marginTop: "2px",
                          fontSize: "13px",
                          color: "var(--color-muted-light)",
                        }}
                      >
                        {customer?.email || "No email"}
                      </div>
                    </td>

                    <td style={{ padding: "16px" }}>
                      <div
                        style={{
                          fontWeight: "600",
                          color: "var(--color-dark)",
                        }}
                      >
                        {service?.name || "Service"}
                      </div>

                      <div
                        style={{
                          marginTop: "5px",
                          fontSize: "13px",
                          color: "var(--color-muted)",
                        }}
                      >
                        Staff: {employee?.name || "Not assigned"}
                      </div>
                    </td>

                    <td style={{ padding: "16px" }}>
                      <div
                        style={{
                          fontWeight: "700",
                          color: "var(--color-dark)",
                        }}
                      >
                        {formatAmount(payment?.amount)}
                      </div>

                      <div
                        style={{
                          marginTop: "5px",
                          fontSize: "13px",
                          color: "var(--color-muted)",
                        }}
                      >
                        {payment?.paymentMethod || "—"}
                      </div>
                    </td>

                    <td style={{ padding: "16px" }}>
                      <div
                        style={{
                          fontSize: "14px",
                          color: "var(--color-dark)",
                        }}
                      >
                        {formatDateTime(payment?.createdAt)}
                      </div>
                    </td>

                    <td style={{ padding: "16px" }}>
                      <span
                        style={{
                          fontSize: "13px",
                          color: "var(--color-muted)",
                          wordBreak: "break-word",
                        }}
                      >
                        {payment?.transactionId || "No reference"}
                      </span>
                    </td>

                    <td style={{ padding: "16px" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "6px 10px",
                          borderRadius: "999px",
                          fontSize: "12px",
                          fontWeight: "700",
                          ...getStatusStyle(status),
                        }}
                      >
                        {status}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OwnerTransactions;
