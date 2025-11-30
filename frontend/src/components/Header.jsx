export default function Header({ user }) {
  return (
    <>
      {/* Keyframes animasi gradient */}
      <style>
        {`
          @keyframes gradientMove {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}
      </style>

      <header
        style={{
          width: "100%",
          padding: "1rem 2rem",
          background: "linear-gradient(135deg, #ff7eb9, #e83e8c, #ff9fd6)",
          backgroundSize: "300% 300%",
          animation: "gradientMove 10s ease infinite",
          color: "#fff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderRadius: "0 0 20px 20px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
          fontFamily: "'Poppins', sans-serif",
          transformStyle: "preserve-3d",
          perspective: "1000px",
        }}
      >
        {/* Logo */}
        <div
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "1.7rem",
            letterSpacing: "0.5px",
            textShadow: "0 2px 6px rgba(0,0,0,0.3)",
            transform: "translateZ(20px)", // memberi kesan depth
          }}
        >
          🍪 Cake Shop
        </div>

        {/* User Info */}
        <div
          style={{
            fontWeight: 500,
            fontSize: "1rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            background: "rgba(255,255,255,0.15)",
            padding: "0.5rem 1rem",
            borderRadius: "14px",
            boxShadow: "inset 0 2px 6px rgba(0,0,0,0.2), 0 4px 12px rgba(0,0,0,0.15)",
            textShadow: "0 1px 2px rgba(0,0,0,0.2)",
            transform: "translateZ(10px)", // memberi kesan depth
          }}
        >
          Hi, <strong>{user}</strong>
        </div>
      </header>
    </>
  );
}
