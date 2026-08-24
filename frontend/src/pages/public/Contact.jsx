// src/pages/public/Contact.jsx
import React, { useState } from "react";
import {
  FiMapPin,
  FiPhone,
  FiMail,
  FiClock,
  FiSend,
  FiCheckCircle,
  FiMessageSquare,
} from "react-icons/fi";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import api from "../../services/api";

export const Contact = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    companyName: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.phone) {
      setErrorMsg("Please fill out all required fields marked with *");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    try {
      await api.post("/notifications/contact", formData);
      setSubmitted(true);
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        companyName: "",
        message: "",
      });
    } catch (err) {
      console.error("Error sending contact message:", err);
      setErrorMsg(
        err.response?.data?.message ||
          "Failed to send your message. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };


  return (
    <div style={{ backgroundColor: "var(--color-bg-warm)", minHeight: "100vh" }}>
      {/* ─── Page Header ─── */}
      <section
        style={{
          backgroundColor: "#1f1824",
          color: "#FFFFFF",
          padding: "70px 20px 75px",
          textAlign: "center",
          backgroundImage:
            "linear-gradient(180deg, rgba(24, 18, 28, 0.9) 0%, rgba(31, 24, 36, 0.98) 100%)",
        }}
      >
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <span
            style={{
              display: "inline-block",
              padding: "6px 18px",
              borderRadius: "var(--radius-pill)",
              backgroundColor: "rgba(216, 69, 112, 0.22)",
              color: "#ff85ab",
              fontSize: "0.82rem",
              fontWeight: "700",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: "16px",
            }}
          >
            💬 Contact & Administration
          </span>
          <h1
            style={{
              fontSize: "clamp(2.2rem, 5vw, 3.4rem)",
              fontWeight: "800",
              fontFamily: "var(--font-display)",
              letterSpacing: "-0.02em",
              marginBottom: "14px",
              color: "#FFFFFF",
            }}
          >
            Get in Touch with Veloura
          </h1>
          <p
            style={{
              fontSize: "1.08rem",
              color: "rgba(255, 255, 255, 0.85)",
              lineHeight: "1.6",
              maxWidth: "600px",
              margin: "0 auto",
            }}
          >
            Reach out to our platform administration for salon partnerships, owner inquiries, or support.
          </p>
        </div>
      </section>

      {/* ─── Main Content Grid: Info & Form ─── */}
      <section style={{ maxWidth: "1180px", margin: "0 auto", padding: "60px 5% 90px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "40px",
            alignItems: "start",
          }}
        >
          {/* Left Column: Direct Contacts */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <h2
                style={{
                  fontSize: "1.8rem",
                  fontWeight: "800",
                  color: "var(--color-dark)",
                  marginBottom: "8px",
                }}
              >
                Our Contact Information
              </h2>
              <p style={{ color: "var(--color-muted)", fontSize: "0.95rem", lineHeight: "1.6" }}>
                You can reach our team directly using any of the channels below:
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Location */}
              <div
                style={{
                  padding: "20px 24px",
                  borderRadius: "var(--radius-ios)",
                  backgroundColor: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  boxShadow: "var(--shadow-xs)",
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                }}
              >
                <div
                  style={{
                    width: "46px",
                    height: "46px",
                    borderRadius: "12px",
                    backgroundColor: "var(--color-primary-light)",
                    color: "var(--color-primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <FiMapPin size={22} />
                </div>
                <div>
                  <div style={{ fontSize: "0.8rem", fontWeight: "600", color: "var(--color-muted)", textTransform: "uppercase" }}>
                    Location
                  </div>
                  <div style={{ fontSize: "1.02rem", fontWeight: "700", color: "var(--color-dark)" }}>
                    Addis Ababa, Ethiopia
                  </div>
                </div>
              </div>

              {/* Email */}
              <div
                style={{
                  padding: "20px 24px",
                  borderRadius: "var(--radius-ios)",
                  backgroundColor: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  boxShadow: "var(--shadow-xs)",
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                }}
              >
                <div
                  style={{
                    width: "46px",
                    height: "46px",
                    borderRadius: "12px",
                    backgroundColor: "rgba(16, 185, 129, 0.1)",
                    color: "#10b981",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <FiMail size={22} />
                </div>
                <div>
                  <div style={{ fontSize: "0.8rem", fontWeight: "600", color: "var(--color-muted)", textTransform: "uppercase" }}>
                    Email
                  </div>
                  <a
                    href="mailto:mesi@gmail.com"
                    style={{
                      fontSize: "1.02rem",
                      fontWeight: "700",
                      color: "var(--color-primary)",
                      textDecoration: "none",
                    }}
                  >
                    mesi@gmail.com
                  </a>
                </div>
              </div>

              {/* Phone */}
              <div
                style={{
                  padding: "20px 24px",
                  borderRadius: "var(--radius-ios)",
                  backgroundColor: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  boxShadow: "var(--shadow-xs)",
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                }}
              >
                <div
                  style={{
                    width: "46px",
                    height: "46px",
                    borderRadius: "12px",
                    backgroundColor: "var(--color-secondary-light)",
                    color: "var(--color-secondary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <FiPhone size={22} />
                </div>
                <div>
                  <div style={{ fontSize: "0.8rem", fontWeight: "600", color: "var(--color-muted)", textTransform: "uppercase" }}>
                    Phone Number
                  </div>
                  <a
                    href="tel:+251920573291"
                    style={{
                      fontSize: "1.02rem",
                      fontWeight: "700",
                      color: "var(--color-dark)",
                      textDecoration: "none",
                    }}
                  >
                    +251 920 573 291
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Message Form to Admin */}
          <div
            style={{
              backgroundColor: "var(--color-card)",
              borderRadius: "var(--radius-ios)",
              padding: "36px 32px",
              border: "1px solid var(--color-border)",
              boxShadow: "var(--shadow-md)",
            }}
          >
            <div style={{ marginBottom: "24px" }}>
              <h3
                style={{
                  fontSize: "1.35rem",
                  fontWeight: "800",
                  color: "var(--color-dark)",
                  marginBottom: "6px",
                }}
              >
                Send a Message to Admin
              </h3>
              <p style={{ color: "var(--color-muted)", fontSize: "0.88rem", lineHeight: 1.5 }}>
                If you are a salon owner wanting to partner with Veloura or have any inquiry, please fill out the details below.
              </p>
            </div>

            {errorMsg && (
              <div
                style={{
                  backgroundColor: "#FEF2F2",
                  borderLeft: "4px solid #EF4444",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  color: "#B91C1C",
                  fontSize: "0.88rem",
                  marginBottom: "16px",
                }}
              >
                {errorMsg}
              </div>
            )}

            {submitted ? (
              <div
                style={{
                  backgroundColor: "rgba(16, 185, 129, 0.08)",
                  border: "1px solid rgba(16, 185, 129, 0.25)",
                  borderRadius: "var(--radius-ui)",
                  padding: "28px 20px",
                  textAlign: "center",
                  color: "#059669",
                }}
              >
                <FiCheckCircle size={40} style={{ marginBottom: "12px" }} />
                <h4 style={{ fontSize: "1.15rem", fontWeight: "700", marginBottom: "6px" }}>
                  Message Sent Successfully!
                </h4>
                <p style={{ fontSize: "0.92rem", color: "var(--color-dark)", marginBottom: "16px" }}>
                  Thank you for reaching out. The Veloura administration team has received your message and will contact you promptly.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSubmitted(false)}
                >
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {/* Full Name * */}
                <Input
                  label="Full Name *"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="e.g. Abebe Bikila"
                  required
                />

                {/* Email Address * */}
                <Input
                  label="Email Address *"
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  required
                />

                {/* Phone Number * */}
                <Input
                  label="Phone Number *"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="0920573291"
                  required
                />

                {/* Company Name */}
                <Input
                  label="Company Name"
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="Your Company"
                />

                {/* Your Message */}
                <div>
                  <label
                    htmlFor="message"
                    style={{
                      display: "block",
                      fontSize: "0.85rem",
                      fontWeight: "600",
                      marginBottom: "6px",
                      color: "var(--color-dark)",
                    }}
                  >
                    Your Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows="4"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us about your .."
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      borderRadius: "var(--radius-ui)",
                      border: "1px solid var(--color-border)",
                      fontSize: "0.95rem",
                      fontFamily: "var(--font-sans)",
                      outline: "none",
                      backgroundColor: "var(--color-bg-warm)",
                      transition: "border-color 0.2s ease",
                      resize: "vertical",
                    }}
                  />
                </div>

                {/* Send Message Button */}
                <div style={{ marginTop: "8px" }}>
                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    loading={loading}
                    iconRight={<FiSend size={16} />}
                  >
                    Send Message
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;

