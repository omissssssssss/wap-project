import { useState, useEffect } from "react";
import { FaTachometerAlt, FaBoxOpen, FaShoppingCart, FaCog, FaBars, FaTimes, FaUsers } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function Sidebar({ user, onLogout }) {
  const storedUser = localStorage.getItem("user");
  const [currentUser, setCurrentUser] = useState(storedUser || user);
  const [collapsed, setCollapsed] = useState(false);
  const [active, setActive] = useState("Dashboard");
  const [isMobile, setIsMobile] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) localStorage.setItem("user", currentUser);
  }, [currentUser]);

const menuItems = [
  { icon: <FaTachometerAlt />, label: "Dashboard" },
  { icon: <FaBoxOpen />, label: "Cake" }, // CRUD Cake
  { icon: <FaShoppingCart />, label: "Orders" },
  { icon:  <FaUsers />, label: "Customers" },
  { icon: <FaCog />, label: "Settings" },
];


  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      setShowSidebar(!mobile);
      if (mobile) setCollapsed(false);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const menuStyle = (isActive) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: collapsed ? "center" : "flex-start",
    padding: collapsed ? "0.9rem 0" : "0.9rem 1rem",
    borderRadius: "12px",
    marginBottom: "0.7rem",
    cursor: "pointer",
    transition: "all 0.3s ease",
    background: isActive ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.05)",
    boxShadow: isActive
      ? "0 8px 20px rgba(0,0,0,0.2), inset 0 2px 6px rgba(255,255,255,0.1)"
      : "inset 0 1px 3px rgba(0,0,0,0.05)",
    borderLeft: isActive ? "4px solid #fff" : "4px solid transparent",
  });

  const handleLogout = () => {
    localStorage.removeItem("user");
    if (onLogout) onLogout();
  };

  return (
    <>
      <style>{`
        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .sidebar-card:hover {
          transform: translateX(5px);
          box-shadow: 0 12px 25px rgba(0,0,0,0.25);
          background: rgba(255,255,255,0.15);
          transition: all 0.3s ease;
        }
        .sidebar-mobile {
          transform: translateX(-100%);
          transition: transform 0.3s ease;
        }
        .sidebar-mobile.show {
          transform: translateX(0);
        }
        .collapse-icon {
          transition: transform 0.4s ease;
        }
        .collapse-icon.rotate {
          transform: rotate(90deg);
        }
        @media (max-width: 768px) {
          .sidebar-card span {
            font-size: 0.9rem;
          }
        }
      `}</style>

      {/* Mobile Toggle Button */}
      {isMobile && (
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          style={{
            position: "fixed",
            top: "1rem",
            left: "1rem",
            zIndex: 999,
            background: "#e83e8c",
            color: "#fff",
            border: "none",
            padding: "0.65rem",
            borderRadius: "8px",
            cursor: "pointer",
            boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
            transition: "all 0.3s ease",
          }}
        >
          {showSidebar ? <FaTimes /> : <FaBars />}
        </button>
      )}

      {/* Sidebar */}
      <div
        className={isMobile ? `sidebar-mobile ${showSidebar ? "show" : ""}` : ""}
        style={{
          position: isMobile ? "fixed" : "relative",
          top: 0,
          left: 0,
          bottom: 0,
          width: collapsed && !isMobile ? "70px" : "250px",
          background: "linear-gradient(180deg, #ff7eb9, #e83e8c, #ff9fd6)",
          backgroundSize: "400% 400%",
          animation: "gradientMove 15s ease infinite",
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: collapsed && !isMobile ? "1.5rem 0.5rem" : "1.5rem 1rem",
          transition: "width 0.3s ease, transform 0.3s ease, padding 0.3s ease",
          boxShadow: "2px 0 20px rgba(0,0,0,0.2), inset 0 0 15px rgba(255,255,255,0.1)",
          zIndex: 998,
          fontFamily: "'Poppins', sans-serif",
          overflowY: "auto",
          transform: isMobile && !showSidebar ? "translateX(-100%)" : "translateX(0)",
          borderRight: "1px solid rgba(255,255,255,0.1)",
          minHeight: "100vh",
        }}
      >
        {/* Header */}
        <div
          style={{
            marginBottom: "2rem",
            fontFamily: "'Playfair Display', serif",
            fontSize: "1.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed && !isMobile ? "center" : "space-between",
            textShadow: "0 2px 6px rgba(0,0,0,0.3)",
            flexWrap: "wrap",
          }}
        >
          {!collapsed && <span>🍪 Cake Shop</span>}
          {!isMobile && (
            <FaBars
              className={`collapse-icon ${collapsed ? "rotate" : ""}`}
              style={{ cursor: "pointer", fontSize: "1.25rem" }}
              onClick={() => setCollapsed(!collapsed)}
            />
          )}
        </div>

        {/* Menu */}
        <div style={{ flex: 1, overflowY: "auto", minWidth: 0 }}>
          {menuItems.map((item) => {
            const isActive = active === item.label;
            return (
              <div
                key={item.label}
                onClick={() => {
                  setActive(item.label);
                  navigate(`/${item.label.toLowerCase()}`);
                  if (isMobile) setShowSidebar(false);
                }}
                style={menuStyle(isActive)}
                className="sidebar-card"
              >
                <span style={{ fontSize: "1.3rem" }}>{item.icon}</span>
                {!collapsed && (
                  <span style={{ marginLeft: "1rem", fontWeight: 500, letterSpacing: "0.5px" }}>
                    {item.label}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        {!collapsed && (
          <div style={{ marginTop: "2rem", minWidth: 0 }}>
            <div
              style={{
                marginBottom: "1rem",
                padding: "0.95rem",
                background: "rgba(255,255,255,0.12)",
                borderRadius: "12px",
                fontWeight: 500,
                textAlign: "center",
                boxShadow: "inset 0 3px 6px rgba(0,0,0,0.15)",
                letterSpacing: "0.5px",
                overflowWrap: "break-word",
              }}
            >
              Logged in as: <strong>{currentUser}</strong>
            </div>
            <button
              onClick={handleLogout}
              style={{
                width: "100%",
                padding: "0.8rem",
                background: "#fff",
                color: "#e83e8c",
                border: "none",
                borderRadius: "12px",
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
                letterSpacing: "0.5px",
              }}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </>
  );
}
