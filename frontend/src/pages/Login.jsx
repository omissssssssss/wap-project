import { useState } from "react";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");

  try {
    const res = await fetch("http://localhost:5001/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (res.ok) {
      onLogin(data.username);
    } else {
      setError(data.message);
    }
  } catch (err) {
    setError("Server error");
  }
};


  const inputContainer = {
    display: "flex",
    alignItems: "center",
    position: "relative",
    marginBottom: "1.5rem",
    background: "#fff",
    borderRadius: "12px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
    transition: "all 0.3s",
  };

  const iconStyle = {
    padding: "0 0.8rem",
    fontSize: "1.3rem",
    color: "#e83e8c",
  };

  const inputStyle = {
    flex: 1,
    padding: "1rem",
    border: "none",
    outline: "none",
    fontSize: "1rem",
    fontFamily: "'Poppins', sans-serif",
    borderRadius: "12px",
  };

  const labelStyle = {
    position: "absolute",
    left: "3rem",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#aaa",
    fontSize: "0.9rem",
    pointerEvents: "none",
    transition: "0.2s",
  };

  const containerFocusStyle = {
    transform: "scale(1.02)",
    boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        padding: "1rem",
        background: "linear-gradient(135deg, #ffe6f4, #f0f0ff)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          padding: "3rem 2.5rem",
          borderRadius: "25px",
          background: "rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(15px)",
          boxShadow: "0 15px 35px rgba(0,0,0,0.2)",
          textAlign: "center",
          transition: "all 0.3s",
        }}
        onMouseOver={(e) =>
          Object.assign(e.currentTarget.style, containerFocusStyle)
        }
        onMouseOut={(e) =>
          Object.assign(e.currentTarget.style, {
            transform: "scale(1)",
            boxShadow: "0 15px 35px rgba(0,0,0,0.2)",
          })
        }
      >
        <h2
          style={{
            marginBottom: "2.5rem",
            fontFamily: "'Playfair Display', serif",
            color: "#e83e8c",
            fontSize: "2.5rem",
          }}
        >
          🍪 Cake Shop
        </h2>

        {error && (
          <div
            style={{
              color: "#e83e8c",
              marginBottom: "1.5rem",
              fontWeight: "500",
              background: "#ffe6f4",
              padding: "0.6rem 1rem",
              borderRadius: "12px",
              boxShadow: "inset 0 2px 5px rgba(0,0,0,0.05)",
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Username */}
          <div style={inputContainer}>
            <span style={iconStyle}>👤</span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Username"
              style={inputStyle}
            />
          </div>

          {/* Password */}
          <div style={inputContainer}>
            <span style={iconStyle}>🔒</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Password"
              style={inputStyle}
            />
          </div>

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "0.75rem",
              background: "linear-gradient(135deg, #e83e8c, #ff5fa8)",
              color: "#fff",
              fontWeight: "600",
              fontFamily: "'Poppins', sans-serif",
              borderRadius: "12px",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 8px 20px rgba(232,62,140,0.3)",
              transition: "all 0.3s",
              fontSize: "1rem",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.transform = "translateY(-2px)")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.transform = "translateY(0)")
            }
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
