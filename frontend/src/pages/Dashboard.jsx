import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Container, Row, Col, Card, Table, Badge } from "react-bootstrap";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Pie } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  useEffect(() => {
    axios.get("http://localhost:5001/api/products").then(res => setProducts(res.data));
    axios.get("http://localhost:5001/api/customers").then(res => setCustomers(res.data));
    axios.get("http://localhost:5001/api/orders").then(res => setOrders(res.data));
  }, []);

  // ==== Filter Orders for Table ====
  const filteredOrders = useMemo(() => {
    return orders
      .filter(o =>
        o.customer?.toLowerCase().includes(search.toLowerCase())
      )
      .filter(o =>
        filterStatus === "All" ? true : o.status === filterStatus
      )
      .slice(-5)
      .reverse();
  }, [orders, search, filterStatus]);

  // ===== Chart Orders by Month =====
  const orderByMonth = useMemo(() => {
    const counts = new Array(12).fill(0);
    orders.forEach(o => counts[new Date(o.date).getMonth()]++);

    return {
      labels: ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"],
      datasets: [
        {
          label: "Order per Bulan",
          data: counts,
          borderColor: "#ff4fa3",
          backgroundColor: "rgba(255, 79, 163, 0.25)",
          borderWidth: 4,
          tension: 0.4,
          pointRadius: 6,
          pointBackgroundColor: "#ff7dbc",
          pointBorderColor: "#fff",
          fill: true,
        },
      ],
    };
  }, [orders]);

  // ===== Chart Category Count =====
  const categoryCount = useMemo(() => {
    const count = {};
    products.forEach(p => count[p.category] = (count[p.category] || 0) + 1);

    return {
      labels: Object.keys(count),
      datasets: [
        {
          label: "Kategori Produk",
          data: Object.values(count),
          backgroundColor: [
            "#ff7cbc", "#ffb3d1", "#845ec2", "#6989ff",
            "#fdbf5e", "#75d6a3", "#ff5177", "#ffd6e4"
          ],
          borderColor: "#fff",
          borderWidth: 3,
        },
      ],
    };
  }, [products]);

  const badgeStatus = (status) => (
    <Badge
      bg={status === "Completed" ? "success" :
          status === "Pending" ? "warning" :
          "secondary"}
      className="px-3 py-2 rounded-pill fw-semibold"
      style={{ fontSize: "0.75rem" }}
    >
      {status}
    </Badge>
  );

  return (
    <Container
      fluid
      className="py-4"
      style={{
        background: "linear-gradient(160deg, #ffe2f0, #ffffff)",
        minHeight: "100vh"
      }}
    >

      {/* ===== Stats ===== */}
      <Row className="mb-4">
        {[
          { label: "Total Produk", value: products.length, color: "#ff4fa3" },
          { label: "Total Customer", value: customers.length, color: "#5A67FF" },
          { label: "Total Orders", value: orders.length, color: "#FF8A00" }
        ].map((stat, i) => (
          <Col md={4} key={i}>
            <Card className="stat-card shadow-sm">
              <Card.Body className="text-center py-4">
                <h6 className="fw-bold text-muted">{stat.label}</h6>
                <h1
                  className="fw-bold"
                  style={{ color: stat.color, fontSize: "2.7rem" }}
                >
                  {stat.value}
                </h1>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* ===== Charts ===== */}
      <Row className="mb-4">
        <Col md={6}>
          <Card className="glass-card shadow">
            <Card.Header className="fw-bold border-0 bg-white">
              💖 Order per Bulan
            </Card.Header>
            <Card.Body><Line data={orderByMonth} /></Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="glass-card shadow">
            <Card.Header className="fw-bold border-0 bg-white">
              🍰 Kategori Produk
            </Card.Header>
            <Card.Body><Pie data={categoryCount} /></Card.Body>
          </Card>
        </Col>
      </Row>

      {/* ===== Latest Orders ===== */}
      {/* ===== Latest Orders ===== */}
<Row>
  <Col>
    <Card className="glass-card shadow">
      <Card.Header className="fw-bold border-0 bg-white">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <span>🛍️ Order Terbaru</span>

          {/* 🔍 Search + Filter UI */}
          <div className="d-flex gap-2">
            <input
              type="text"
              placeholder="Cari customer..."
              className="form-control form-control-sm"
              style={{ width: "160px" }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              className="form-select form-select-sm"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="Canceled">Canceled</option>
            </select>
          </div>
        </div>
      </Card.Header>

      <Card.Body className="p-0">
        <Table hover responsive className="align-middle mb-0">
          <thead>
            <tr style={{ background: "#ffe9f3", textAlign: "center" }}>
              <th style={{ textAlign: "left", paddingLeft: "18px" }}>Customer</th>
              <th>Produk</th>
              <th style={{ width: "70px" }}>Qty</th>
              <th style={{ width: "110px" }}>Status</th>
            </tr>
          </thead>

          <tbody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((o, i) => (
                <tr key={i} className="table-row-hover">
                  <td className="fw-semibold" style={{ textAlign: "left", paddingLeft: "18px" }}>
                    {o.customer}
                  </td>
                  <td className="fw-bold" style={{ color: "#ff4fa3" }}>
                    {o.product}
                  </td>
                  <td className="text-center">{o.qty}</td>
                  <td className="text-center">{badgeStatus(o.status)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center text-muted py-4">
                  Tidak ada order ditemukan
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  </Col>
</Row>


      {/* Global CSS */}
      <style>{`
        .stat-card {
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.75);
          backdrop-filter: blur(12px);
          transition: .3s;
        }
        .stat-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 12px 26px rgba(255, 105, 180, 0.25);
        }

        .glass-card {
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.6);
          border: none;
          backdrop-filter: blur(18px);
          transition: .3s;
        }
        .glass-card:hover {
          transform: scale(1.02);
        }

        .table-row-hover:hover {
          background-color: #ffe3ef !important;
          cursor: pointer;
        }
        
        .table th, .table td {
          horizontal-align: middle;
          height: 56px;
        }

        .table thead th {
          font-size: 0.85rem;
          font-weight: 700;
        }

      `}</style>

    </Container>
  );
}
