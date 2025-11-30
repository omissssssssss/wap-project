const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { Sequelize, DataTypes } = require("sequelize");

const app = express();
const PORT = 5001;

// --- Middleware ---
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


const users = [
  { username: "aini", password: "12345" },
  { username: "john", password: "password" },
  { username: "jane", password: "abc123" },
];

// Endpoint login
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (user) {
    res.status(200).json({ username: user.username });
  } else {
    res.status(401).json({ message: "Username atau password salah" });
  }
});



// --- Multer setup (upload image) ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "./uploads";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// --- Sequelize + MySQL connection ---
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    port: process.env.DB_PORT || 3306,
    logging: false,
  }
);



// --- Models ---
const Product = sequelize.define("Product", {
  sku: { type: DataTypes.STRING, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  category: { type: DataTypes.STRING, allowNull: false },
  price: { type: DataTypes.FLOAT, allowNull: false },
  stock: { type: DataTypes.INTEGER, allowNull: false },
  description: { type: DataTypes.TEXT },
  variants: { type: DataTypes.TEXT },
  image: { type: DataTypes.STRING },
});

const Customer = sequelize.define("Customer", {
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false },
  phone: { type: DataTypes.STRING, allowNull: false },
  address: { type: DataTypes.TEXT },
  province: { type: DataTypes.STRING, allowNull: false },
  city: { type: DataTypes.STRING, allowNull: false },
  customerType: { type: DataTypes.STRING },
  notes: { type: DataTypes.TEXT },
  image: { type: DataTypes.STRING },
});

const Order = sequelize.define("Order", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  customerId: { type: DataTypes.INTEGER, allowNull: false },
  productId: { type: DataTypes.INTEGER, allowNull: false },
  qty: { type: DataTypes.INTEGER, allowNull: false },
  price: { type: DataTypes.FLOAT, allowNull: false },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  status: { type: DataTypes.STRING, allowNull: false, defaultValue: "Pending" },
});

// --- Relations ---
Order.belongsTo(Customer, { foreignKey: "customerId", as: "customerData" });
Order.belongsTo(Product, { foreignKey: "productId", as: "productData" });

// --- Sync database ---
sequelize.sync().then(() => console.log("Database synced"));

// ===================== ROUTES =====================

// --- PRODUCTS ---
app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.findAll();
    const data = products.map(p => ({
      ...p.dataValues,
      variants: p.variants ? p.variants.split(",") : []
    }));
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/products", upload.single("image"), async (req, res) => {
  try {
    const { sku, name, category, price, stock, description, variants } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;
    const variantsStr = Array.isArray(variants) ? variants.join(",") : variants || "";

    const product = await Product.create({
      sku, name, category, price, stock, description, variants: variantsStr, image
    });

    res.json({ ...product.dataValues, variants: variantsStr.split(",") });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/products/:id", upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    const { sku, name, category, price, stock, description, variants } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : product.image;
    const variantsStr = Array.isArray(variants) ? variants.join(",") : variants || "";

    await product.update({ sku, name, category, price, stock, description, variants: variantsStr, image });
    res.json({ ...product.dataValues, variants: variantsStr.split(",") });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Product.destroy({ where: { id } });
    res.json({ deleted: !!deleted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- CUSTOMERS ---
app.get("/api/customers", async (req, res) => {
  try {
    const customers = await Customer.findAll();
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/customers", upload.single("image"), async (req, res) => {
  try {
    const { name, email, phone, address, province, city, customerType, notes } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const customer = await Customer.create({
      name, email, phone, address, province, city, customerType, notes, image
    });

    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/customers/:id", upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await Customer.findByPk(id);
    if (!customer) return res.status(404).json({ error: "Customer not found" });

    const { name, email, phone, address, province, city, customerType, notes } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : customer.image;

    await customer.update({ name, email, phone, address, province, city, customerType, notes, image });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/customers/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Customer.destroy({ where: { id } });
    res.json({ deleted: !!deleted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } 
});

// --- ORDERS ---
// ===================== ORDERS FINAL =====================

// --- GET all orders ---
app.get("/api/orders", async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        { model: Customer, as: "customerData", attributes: ["id", "name"] },
        { model: Product, as: "productData", attributes: ["id", "name", "price"] },
      ],
      order: [["id", "ASC"]],
    });

    const data = orders.map(o => ({
      id: o.id,
      customerId: o.customerId,
      customer: o.customerData?.name || "Unknown",
      productId: o.productId,
      product: o.productData?.name || "Unknown",
      qty: o.qty,
      price: o.price,
      date: o.date,
      status: o.status,
    }));

    res.json(data);
  } catch (err) {
    console.error("ERROR GET /orders:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// --- POST add order ---
app.post("/api/orders", async (req, res) => {
  try {
    console.log("POST /orders payload:", req.body);

    let { customerId, productId, qty, date, status } = req.body;

    customerId = Number(customerId);
    productId = Number(productId);
    qty = Number(qty || 1); // default qty = 1

    // Validasi foreign key
    const customer = await Customer.findByPk(customerId);
    if (!customer) return res.status(400).json({ error: "Customer not found" });

    const product = await Product.findByPk(productId);
    if (!product) return res.status(400).json({ error: "Product not found" });

    const price = product.price * qty;

    const order = await Order.create({ customerId, productId, qty, price, date, status: status || "Pending" });

    res.json({
      id: order.id,
      customerId,
      customer: customer.name,
      productId,
      product: product.name,
      qty,
      price,
      date,
      status: order.status,
    });
  } catch (err) {
    console.error("ERROR POST /orders:", err);
    res.status(500).json({ error: "Failed to create order" });
  }
});

// --- PUT update order ---
app.put("/api/orders/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findByPk(id);
    if (!order) return res.status(404).json({ error: "Order not found" });

    let { customerId, productId, qty, date, status } = req.body;

    customerId = Number(customerId);
    productId = Number(productId);
    qty = Number(qty || 1);

    const customer = await Customer.findByPk(customerId);
    if (!customer) return res.status(400).json({ error: "Customer not found" });

    const product = await Product.findByPk(productId);
    if (!product) return res.status(400).json({ error: "Product not found" });

    const price = product.price * qty;

    await order.update({ customerId, productId, qty, price, date, status: status || order.status });

    res.json({
      id: order.id,
      customerId,
      customer: customer.name,
      productId,
      product: product.name,
      qty,
      price,
      date,
      status: order.status,
    });
  } catch (err) {
    console.error("ERROR PUT /orders:", err);
    res.status(500).json({ error: "Failed to update order" });
  }
});

// --- DELETE order ---
app.delete("/api/orders/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Order.destroy({ where: { id } });
    res.json({ deleted: !!deleted });
  } catch (err) {
    console.error("ERROR DELETE /orders:", err);
    res.status(500).json({ error: "Failed to delete order" });
  }
});

app.get("/", (req, res) => {
  res.send("Server is running");
});


// --- Start server ---
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
