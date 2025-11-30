import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Dashboard from "./pages/Dashboard";
import Cake from "./pages/Cake"; // halaman CRUD cake
import Customers from "./pages/Customers";
import Orders from "./pages/Orders";


export default function App() {
  const [user, setUser] = useState(() => localStorage.getItem("user"));
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const handleLogin = (username) => {
    localStorage.setItem("user", username);
    setUser(username);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!user) return <Login onLogin={handleLogin} />;

  const isMobile = windowWidth <= 768;

  return (
    <Router>
      <div
        style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          minHeight: "100vh",
          fontFamily: "'Poppins', sans-serif",
        }}
      >
        <Sidebar user={user} onLogout={handleLogout} />

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            marginLeft: isMobile ? 0 : undefined,
            transition: "all 0.3s ease",
          }}
        >
          <Header user={user} />

          <main
            style={{
              flex: 1,
              padding: isMobile ? "1rem" : "2rem",
              background: "#f7f7f7",
              transition: "all 0.3s ease",
              minHeight: "calc(100vh - 120px)", // adjust for header+footer
            }}
          >
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/cake" element={<Cake />} /> {/* Cake CRUD */}
              <Route path="/customers" element={<Customers />} /> {/* Cake CRUD */}
              <Route path="/orders" element={<Orders />} />
              {/* <Route path="/settings" element={<Settings />} /> */}
            </Routes>
          </main>

          <Footer />
        </div>
      </div>
    </Router>
  );
}
