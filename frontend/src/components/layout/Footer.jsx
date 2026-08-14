import React from "react";

export const Footer = () => {
  return (
    <footer
      style={{
        background: "linear-gradient(135deg,#fff8f5,#fff1f6)",
        color: "#3b2f33",
        padding: "60px 5% 25px",
        marginTop: "auto",
        borderTop: "1px solid #f3d7df",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
          gap: "40px",
          maxWidth: "1200px",
          margin: "auto",
        }}
      >
        <div>
          <h2
            style={{
              color: "#e91e63",
              fontSize: "1.8rem",
              marginBottom: "15px",
              fontFamily: "Manrope",
            }}
          >
            Veloura
          </h2>

          <p
            style={{
              lineHeight: "1.8",
              color: "#6b5b61",
            }}
          >
            Your premium destination to discover beauty salons, explore
            services, and book appointments effortlessly.
          </p>
        </div>

        <div>
          <h3
            style={{
              marginBottom: "15px",
              color: "#3b2f33",
            }}
          >
            Quick Links
          </h3>

          <p>Home</p>
          <p>Explore Salons</p>
          <p>Book Appointment</p>
        </div>

        <div>
          <h3
            style={{
              marginBottom: "15px",
              color: "#3b2f33",
            }}
          >
            Contact
          </h3>

          <p>📍 Addis Ababa, Ethiopia</p>
          <p>✉️ mesi@gmail.com</p>
          <p>☎️ +251 920 573 291</p>
        </div>
      </div>

      <div
        style={{
          marginTop: "40px",
          paddingTop: "20px",
          borderTop: "1px solid #efd5dc",
          textAlign: "center",
          color: "#8a7a80",
          fontSize: "0.85rem",
        }}
      >
        © {new Date().getFullYear()} Veloura. All rights reserved.
      </div>
    </footer>
  );
};
