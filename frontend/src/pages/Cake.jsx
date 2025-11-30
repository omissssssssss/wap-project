import { useState, useEffect, useMemo } from "react";
import axios from "axios";

export default function Cake() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    id: null,
    sku: "",
    name: "",
    category: "",
    price: "",
    stock: "",
    description: "",
    variants: "",
    image: null,
    imageURL: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [modalImage, setModalImage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [bgPosition, setBgPosition] = useState(0);

  // Animate gradient
  useEffect(() => {
    const interval = setInterval(() => {
      setBgPosition((prev) => (prev + 1) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Fetch products from server
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:5001/api/products");
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image" && files.length > 0) {
      const file = files[0];
      setForm((prev) => ({ ...prev, image: file, imageURL: URL.createObjectURL(file) }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async () => {
    if (!form.sku || !form.name || !form.category || !form.price || !form.stock) {
      return alert("Please fill required fields!");
    }

    const variantsArray = form.variants.split(",").map((v) => v.trim()).filter(v => v);

    const formData = new FormData();
    formData.append("sku", form.sku);
    formData.append("name", form.name);
    formData.append("category", form.category);
    formData.append("price", form.price);
    formData.append("stock", form.stock);
    formData.append("description", form.description);
    formData.append("variants", variantsArray.join(","));
    if (form.image) formData.append("image", form.image);

    try {
      if (isEditing) {
        await axios.put(`http://localhost:5001/api/products/${form.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await axios.post("http://localhost:5001/api/products", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      setForm({ id: null, sku: "", name: "", category: "", price: "", stock: "", description: "", variants: "", image: null, imageURL: "" });
      setIsEditing(false);
      fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (product) => {
    setForm({
      ...product,
      variants: product.variants.join(", "),
      image: null,
      imageURL: product.image || "",
    });
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this product?")) {
      try {
        await axios.delete(`http://localhost:5001/api/products/${id}`);
        fetchProducts();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const openModal = (url) => {
    setModalImage(url);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setTimeout(() => setModalImage(null), 300);
  };

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  return (
    <div style={{
      padding: "2rem",
      fontFamily: "'Poppins', sans-serif",
      minHeight: "100vh",
      background: `linear-gradient(${bgPosition}deg, #ff99cc, #ff66aa, #ffcce6, #ffb6c1)`,
      backgroundSize: "400% 400%",
      transition: "background 0.5s",
      borderRadius: "1rem",
    }}>
      <h2 style={{
        textAlign: "center",
        fontFamily: "'Playfair Display', serif",
        fontSize: "2rem",
        color: "#fff",
        marginBottom: "1.5rem",
        fontWeight: 700
      }}>
        Products Management
      </h2>

      {/* Form */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", justifyContent: "center", marginBottom: "1.5rem" }}>
        <input type="text" name="sku" placeholder="SKU" value={form.sku} onChange={handleChange} style={inputStyle} />
        <input type="text" name="name" placeholder="Product Name" value={form.name} onChange={handleChange} style={inputStyle} />
        <input type="text" name="category" placeholder="Category" value={form.category} onChange={handleChange} style={inputStyle} />
        <input type="number" name="price" placeholder="Price" value={form.price} onChange={handleChange} style={inputStyle} />
        <input type="number" name="stock" placeholder="Stock" value={form.stock} onChange={handleChange} style={inputStyle} />
        <input type="text" name="variants" placeholder="Variants (comma separated)" value={form.variants} onChange={handleChange} style={inputStyle} />
        <input type="text" name="description" placeholder="Description" value={form.description} onChange={handleChange} style={inputStyle} />
        <input type="file" name="image" accept="image/*" onChange={handleChange} style={inputStyle} />
        <button onClick={handleSave} style={pinkButton}>{isEditing ? "Update" : "Add"}</button>
        {isEditing && <button onClick={() => { setForm({ id: null, sku: "", name: "", category: "", price: "", stock: "", description: "", variants: "", image: null, imageURL: "" }); setIsEditing(false); }} style={{ ...pinkButton, background: "#aaa" }}>Cancel</button>}
      </div>

      {/* Search */}
      <div style={{ marginBottom: "1rem", display: "flex", justifyContent: "flex-end" }}>
        <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} style={{ padding: "0.5rem", borderRadius: "6px", border: "1px solid #ccc", width: "200px" }} />
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: "8px", overflow: "hidden" }}>
          <thead style={{ background: "#ff66aa", color: "#fff" }}>
            <tr>
              <th>ID</th>
              <th>SKU</th>
              <th>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Variants</th>
              <th>Description</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedProducts.map(product => (
              <tr key={product.id} style={{ borderBottom: "1px solid #f0cce1" }}>
                <td style={tdCenter}>{product.id}</td>
                <td style={tdCenter}>{product.sku}</td>
                <td style={tdCenter}>
                  {product.image && <img src={`http://localhost:5001${product.image}`} alt={product.name} style={{ width: "60px", borderRadius: "6px", cursor: "pointer" }} onClick={() => openModal(`http://localhost:5001${product.image}`)} />}
                </td>
                <td>{product.name}</td>
                <td>{product.category}</td>
                <td>Rp {Number(product.price).toLocaleString()}</td>
                <td style={{ textAlign: "center" }}>
                  <span style={{ padding: "0.2rem 0.4rem", borderRadius: "4px", background: product.stock > 0 ? "#ffb6c1" : "#ff4d6d", color: "#fff", fontWeight: 600, fontSize: "0.8rem" }}>
                    {product.stock > 0 ? product.stock : "Out"}
                  </span>
                </td>
                <td>{product.variants.map(v => <span key={v} style={{ background: "#ffd6e8", color: "#ff4d85", padding: "0.2rem 0.4rem", borderRadius: "4px", marginRight: "0.2rem", fontSize: "0.8rem" }}>{v}</span>)}</td>
                <td>{product.description}</td>
                <td style={{ display: "flex", gap: "0.3rem", justifyContent: "center" }}>
                  <button onClick={() => handleEdit(product)} style={{ ...pinkButton, background: "#ff66aa", padding: "0.3rem 0.5rem", fontSize: "0.8rem" }}>Edit</button>
                  <button onClick={() => handleDelete(product.id)} style={{ ...pinkButton, background: "#ff3366", padding: "0.3rem 0.5rem", fontSize: "0.8rem" }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ marginTop: "1rem", display: "flex", justifyContent: "center", gap: "0.5rem" }}>
          {Array.from({ length: totalPages }, (_, i) => (
            <button key={i} onClick={() => setCurrentPage(i + 1)} style={{ padding: "0.3rem 0.6rem", borderRadius: "6px", border: currentPage === i + 1 ? "2px solid #ff6699" : "1px solid #ccc", cursor: "pointer", background: "#fff" }}>
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalImage && (
        <div onClick={closeModal} style={{
          position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
          background: "rgba(255, 204, 229,0.95)", display: "flex", justifyContent: "center", alignItems: "center",
          zIndex: 1000, cursor: "pointer", opacity: showModal ? 1 : 0, transition: "opacity 0.3s"
        }}>
          <img src={modalImage} alt="Full" style={{ maxHeight: showModal ? "90%" : "0", maxWidth: showModal ? "90%" : "0", borderRadius: "8px", transition: "all 0.3s" }} />
        </div>
      )}
    </div>
  );
}

// Styles
const inputStyle = { padding: "0.5rem", borderRadius: "6px", border: "1px solid #ccc", flex: "1 1 180px" };
const pinkButton = { padding: "0.5rem 0.8rem", background: "#ff6699", color: "#fff", border:"none", borderRadius: "6px", cursor: "pointer", fontWeight: 600 };
const tdCenter = { textAlign: "center", padding: "0.5rem" };
