export default function Footer() {
  return (
    <footer
      style={{
        width: "100%",
        padding: "1rem 2rem",
        background: "#f0f0f0",
        color: "#333",
        textAlign: "center",
        fontFamily: "'Poppins', sans-serif",
        boxShadow: "0 -2px 6px rgba(0,0,0,0.05)",
        position: "relative",
        bottom: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "clamp(0.8rem, 1vw, 1rem)", // responsive font
      }}
    >
      <span>© {new Date().getFullYear()} Cake Shop. All rights reserved.</span>
    </footer>
  );
}
