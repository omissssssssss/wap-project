import { useState, useMemo, useEffect } from "react";
import axios from "axios";

// Provinces data
const provinces = [
  { name: "Nanggroe Aceh Darussalam", cities: ["Banda Aceh", "Lhokseumawe", "Langsa", "Sabang"] },
  { name: "Sumatera Utara", cities: ["Medan", "Binjai", "Pematang Siantar", "Tebing Tinggi"] },
  { name: "Sumatera Selatan", cities: ["Palembang", "Prabumulih", "Lubuk Linggau", "Pagar Alam"] },
  { name: "Sumatera Barat", cities: ["Padang", "Bukittinggi", "Payakumbuh", "Pariaman"] },
  { name: "Bengkulu", cities: ["Bengkulu", "Curup", "Rejang Lebong"] },
  { name: "DKI Jakarta", cities: ["Jakarta Pusat", "Jakarta Utara", "Jakarta Barat", "Jakarta Selatan", "Jakarta Timur"] },
  { name: "Jawa Barat", cities: ["Bandung", "Bekasi", "Bogor", "Depok", "Cimahi"] },
  { name: "Jawa Tengah", cities: ["Semarang", "Solo", "Magelang", "Pekalongan"] },
  { name: "DI Yogyakarta", cities: ["Yogyakarta", "Sleman", "Bantul", "Kulon Progo", "Gunungkidul"] },
  { name: "Jawa Timur", cities: ["Surabaya", "Malang", "Sidoarjo", "Mojokerto"] },
  { name: "Bali", cities: ["Denpasar", "Ubud", "Kuta", "Singaraja"] },
];

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({
    id: null,
    name: "",
    email: "",
    phone: "",
    address: "",
    province: "",
    city: "",
    customerType: "",
    notes: "",
    image: null,
    imageURL: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [modalImage, setModalImage] = useState(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 5;

  // --- Load data awal dari server ---
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await axios.get("http://localhost:5001/api/customers");
      const dataWithURL = res.data.map(c => ({
        ...c,
        imageURL: c.image ? `http://localhost:5001${c.image}` : "",
      }));
      setCustomers(dataWithURL);
    } catch (err) {
      console.error(err);
    }
  };

  // Handle inputs
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image" && files?.length > 0) {
      const file = files[0];
      setForm(prev => ({ ...prev, image: file, imageURL: URL.createObjectURL(file) }));
    } else if (name === "province") {
      setForm(prev => ({ ...prev, province: value, city: "" }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  // Save customer (POST / PUT)
  const handleSave = async () => {
    if (!form.name || !form.email || !form.phone || !form.province || !form.city) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key === "image" && value) formData.append(key, value);
        else if (key !== "imageURL") formData.append(key, value);
      });

      if (isEditing) {
        await axios.put(`http://localhost:5001/api/customers/${form.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setIsEditing(false);
      } else {
        await axios.post("http://localhost:5001/api/customers", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      setForm({
        id: null,
        name: "", email: "", phone: "",
        address: "", province: "", city: "",
        customerType: "", notes: "",
        image: null, imageURL: ""
      });

      fetchCustomers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (c) => {
    setForm(c);
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this customer?")) {
      try {
        await axios.delete(`http://localhost:5001/api/customers/${id}`);
        fetchCustomers();
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Search + pagination
  const filteredCustomers = useMemo(() => {
    return customers.filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
    );
  }, [customers, search]);

  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCustomers.slice(start, start + itemsPerPage);
  }, [filteredCustomers, currentPage]);

  const currentCities = provinces.find(p => p.name === form.province)?.cities || [];

  return (
    <div style={pageStyle}>
      
      {/* Animated Gradient */}
      <style>{`
        @keyframes moveGradient {
          0% { transform: translate(0,0) scale(1); }
          50% { transform: translate(80px,-60px) scale(1.3); }
          100% { transform: translate(-60px,60px) scale(1.15); }
        }
      `}</style>

      <div style={gradientLayer}></div>

      <h2 style={titleStyle}>💗 Customers Management 💗</h2>

      {/* Form */}
      <div style={cardStyle}>
        <div style={formGrid}>
          <input style={inputStyle} placeholder="Name" name="name" value={form.name} onChange={handleChange} />
          <input style={inputStyle} placeholder="Email" name="email" value={form.email} onChange={handleChange} />
          <input style={inputStyle} placeholder="Phone" name="phone" value={form.phone} onChange={handleChange} />
          <input style={inputStyle} placeholder="Address" name="address" value={form.address} onChange={handleChange} />

          <select name="province" style={inputStyle} onChange={handleChange} value={form.province}>
            <option value="">Select Province</option>
            {provinces.map(p => <option key={p.name}>{p.name}</option>)}
          </select>

          <select name="city" style={inputStyle} onChange={handleChange} value={form.city}>
            <option value="">Select City</option>
            {currentCities.map(c => <option key={c}>{c}</option>)}
          </select>

          <input style={inputStyle} name="customerType" placeholder="Customer Type" value={form.customerType} onChange={handleChange} />
          <input style={inputStyle} name="notes" placeholder="Notes" value={form.notes} onChange={handleChange} />

          <input type="file" name="image" accept="image/*" onChange={handleChange} style={inputStyle} />
        </div>

        <button onClick={handleSave} style={buttonPrimary}>
          {isEditing ? "Update Customer" : "Add Customer"}
        </button>
      </div>

      {/* Search */}
      <div style={{ margin: "1rem 0", textAlign: "right" }}>
        <input 
          style={searchInput}
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div style={cardStyle}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Img</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Province</th>
              <th>City</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {paginatedCustomers.map(c => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>
                  {c.imageURL && (
                    <img 
                      src={c.imageURL} 
                      style={{ width: 50, borderRadius: 10, cursor: "pointer" }}
                      onClick={() => setModalImage(c.imageURL)}
                    />
                  )}
                </td>
                <td>{c.name}</td>
                <td>{c.email}</td>
                <td>{c.phone}</td>
                <td>{c.province}</td>
                <td>{c.city}</td>
                <td>
                  <button onClick={() => handleEdit(c)} style={buttonSmall}>Edit</button>
                  <button onClick={() => handleDelete(c.id)} style={buttonDanger}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Popup Image */}
      {modalImage && (
        <div style={modalBg} onClick={() => setModalImage(null)}>
          <img src={modalImage} style={modalImg} />
        </div>
      )}
    </div>
  );
}

/* ======== FINAL PREMIUM STYLES ======== */
const pageStyle = {
  position: "relative",
  padding: "2rem",
  minHeight: "100vh",
  fontFamily: "Poppins, sans-serif",
  overflow: "hidden",
};

const gradientLayer = {
  position: "absolute",
  top: "-40%",
  left: "-30%",
  width: "200%",
  height: "200%",
  background: "radial-gradient(circle at center, #ffb7ef, #ff8cd9, #ff5bb9, #ff2e8f)",
  filter: "blur(150px)",
  animation: "moveGradient 14s infinite alternate ease-in-out",
  zIndex: -1,
};

const titleStyle = {
  textAlign: "center",
  fontSize: "2.3rem",
  fontWeight: 800,
  color: "#ff1e78",
  marginBottom: "2rem",
};

const cardStyle = {
  background: "rgba(255,255,255,0.65)",
  backdropFilter: "blur(14px)",
  borderRadius: "18px",
  padding: "1.8rem",
  boxShadow: "0 8px 28px rgba(255,90,160,0.25)",
  marginBottom: "1.5rem",
};

const formGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
  gap: "1.1rem",
};

const inputStyle = {
  padding: "0.7rem 1rem",
  borderRadius: "12px",
  border: "1px solid #ffb7dc",
  background: "rgba(255,240,248,0.8)",
  outline: "none",
};

const buttonPrimary = {
  marginTop: "1.2rem",
  padding: "0.75rem",
  borderRadius: "14px",
  border: "none",
  cursor: "pointer",
  background: "linear-gradient(120deg, #ff4fa7, #ff86c8)",
  color: "white",
  fontWeight: 700,
};

const searchInput = {
  padding: "0.7rem 1rem",
  borderRadius: "12px",
  width: "230px",
  border: "1px solid #ffb7dc",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
};

const buttonSmall = {
  padding: "0.35rem 0.6rem",
  borderRadius: "10px",
  background: "#ff4fa7",
  color: "white",
  border: "none",
  marginRight: "0.3rem",
};

const buttonDanger = {
  padding: "0.35rem 0.6rem",
  borderRadius: "10px",
  background: "#ff1f7a",
  color: "white",
  border: "none",
};
const modalBg = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  background: "rgba(0,0,0,0.55)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999,              // ✨ paling penting, biar di atas sidebar
  padding: "20px",
  backdropFilter: "blur(6px)",
  cursor: "pointer",
};

const modalImg = {
  maxWidth: "90%",
  maxHeight: "90%",
  borderRadius: "16px",
  boxShadow: "0 8px 40px rgba(255,0,130,0.5)",
  objectFit: "contain",       // ✨ supaya gambar tidak terpotong
};
