import { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Table,
  Modal,
  Pagination,
} from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';

// --- API URL ---
const API_URL = "http://localhost:5001/api";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [viewOrder, setViewOrder] = useState(null);
  const [newOrder, setNewOrder] = useState({
    customerId: "",
    productId: "",
    qty: 1,
    price: 0,
    date: "",
    status: "Pending",
  });

  // --- Fetch data on mount ---
  useEffect(() => {
    fetchOrders();
    fetchCustomers();
    fetchProducts();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/orders`);
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await fetch(`${API_URL}/customers`);
      const data = await res.json();
      setCustomers(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_URL}/products`);
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
    }
  };

  // --- Filter & paginate ---
  const filtered = orders.filter(
    (o) =>
      o.customer.toLowerCase().includes(search.toLowerCase()) &&
      (statusFilter === "all" || o.status === statusFilter)
  );

  const paginated = filtered.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  // --- Update order status inline ---
  const updateOrderStatus = async (id, status) => {
    const order = orders.find(o => o.id === id);
    try {
      await fetch(`${API_URL}/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...order, status }),
      });
      fetchOrders();
    } catch (err) {
      console.error(err);
    }
  };

  // --- Add order ---
  const addOrder = async () => {
    try {
      await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newOrder),
      });
      fetchOrders();
      setShowAddForm(false);
      setNewOrder({
        customerId: "",
        productId: "",
        qty: 1,
        price: 0,
        date: "",
        status: "Pending",
      });
    } catch (err) {
      console.error(err);
    }
  };

  // --- Update order from modal ---
  const updateOrder = async () => {
    try {
      await fetch(`${API_URL}/orders/${viewOrder.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(viewOrder),
      });
      fetchOrders();
      setViewOrder(null);
    } catch (err) {
      console.error(err);
    }
  };

  // --- Export CSV ---
  const exportToCSV = () => {
    const header = "Order ID,Customer,Product,Qty,Price,Date,Status\n";
    const rows = orders
      .map(
        (o) =>
          `${o.id},${o.customer},${o.product},${o.qty},${o.price},${o.date},${o.status}`
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "orders.csv";
    a.click();
  };

  return (
    <div style={styles.pageBackground}>
      <Container style={styles.cardContainer} className="py-4 px-4">
        <h1 style={styles.title}>💖 Orders Management ERP 💖</h1>

        {/* Toolbar */}
        <Row className="mb-3 justify-content-center g-2">
          <Col xs="auto">
            <Form.Control
              placeholder="Search customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.glassInput}
            />
          </Col>
          <Col xs="auto">
            <Form.Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={styles.glassInput}
            >
              <option value="all">All Status</option>
              <option>Pending</option>
              <option>Processing</option>
              <option>Completed</option>
              <option>Cancelled</option>
            </Form.Select>
          </Col>
          <Col xs="auto">
            <Button onClick={exportToCSV} style={styles.glassButton}>
              Export CSV
            </Button>
          </Col>
          <Col xs="auto">
            <Button onClick={() => setShowAddForm(true)} style={styles.glassButton}>
              Add Order
            </Button>
          </Col>
        </Row>

        {/* Orders Table */}
        <Table bordered hover responsive style={styles.glassTable}>
          <thead style={styles.tableHeader}>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Product</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((o) => (
              <tr key={o.id} style={styles.rowHover}>
                <td>{o.id}</td>
                <td>{o.customer}</td>
                <td>{o.product}</td>
                <td>{o.qty}</td>
                <td>Rp {o.price.toLocaleString()}</td>
                <td>{o.date}</td>
                <td>
                  <Form.Select
                    size="sm"
                    value={o.status}
                    onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                    style={styles.statusColors[o.status]}
                  >
                    <option>Pending</option>
                    <option>Processing</option>
                    <option>Completed</option>
                    <option>Cancelled</option>
                  </Form.Select>
                </td>
                <td>
                  <Button
                    size="sm"
                    onClick={() => setViewOrder(o)}
                    style={styles.glassButton}
                  >
                    View/Edit
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        {/* Pagination */}
        <div className="d-flex justify-content-center my-3">
          <Pagination>
            <Pagination.Prev
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            />
            <Pagination.Item active>{page}</Pagination.Item>
            <Pagination.Next
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            />
          </Pagination>
        </div>

        {/* Add Order Modal */}
        <Modal show={showAddForm} onHide={() => setShowAddForm(false)} centered>
          <Modal.Header closeButton style={styles.modalHeader}>
            <Modal.Title>Add New Order</Modal.Title>
          </Modal.Header>
          <Modal.Body style={styles.modalBody}>
            <Form>
              <Form.Group className="mb-2">
                <Form.Select
                  value={newOrder.customerId}
                  onChange={(e) =>
                    setNewOrder({ ...newOrder, customerId: e.target.value })
                  }
                  style={styles.glassInput}
                >
                  <option value="">Select Customer</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Select
                  value={newOrder.productId}
                  onChange={(e) => {
                    const product = products.find(p => p.id == e.target.value);
                    setNewOrder({ ...newOrder, productId: e.target.value, price: product?.price || 0 });
                  }}
                  style={styles.glassInput}
                >
                  <option value="">Select Product</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Row className="mb-2">
                <Col>
                  <Form.Control
                    type="number"
                    placeholder="Quantity"
                    value={newOrder.qty}
                    onChange={(e) =>
                      setNewOrder({ ...newOrder, qty: Number(e.target.value) })
                    }
                    style={styles.glassInput}
                  />
                </Col>
                <Col>
                  <Form.Control
                    type="number"
                    placeholder="Price"
                    value={newOrder.price}
                    onChange={(e) =>
                      setNewOrder({ ...newOrder, price: Number(e.target.value) })
                    }
                    style={styles.glassInput}
                  />
                </Col>
              </Row>
              <Form.Group className="mb-2">
                <Form.Control
                  type="date"
                  value={newOrder.date}
                  onChange={(e) =>
                    setNewOrder({ ...newOrder, date: e.target.value })
                  }
                  style={styles.glassInput}
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Select
                  value={newOrder.status}
                  onChange={(e) =>
                    setNewOrder({ ...newOrder, status: e.target.value })
                  }
                  style={styles.glassInput}
                >
                  <option>Pending</option>
                  <option>Processing</option>
                  <option>Completed</option>
                  <option>Cancelled</option>
                </Form.Select>
              </Form.Group>
              <p className="text-end fw-bold">
                Total: Rp {(newOrder.qty * newOrder.price).toLocaleString()}
              </p>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddForm(false)}>
              Cancel
            </Button>
            <Button style={styles.glassButton} onClick={addOrder}>
              Add
            </Button>
          </Modal.Footer>
        </Modal>

        {/* View/Edit Order Modal */}
        {viewOrder && (
          <Modal
            show={!!viewOrder}
            onHide={() => setViewOrder(null)}
            centered
          >
            <Modal.Header closeButton style={styles.modalHeader}>
              <Modal.Title>View/Edit Order</Modal.Title>
            </Modal.Header>
            <Modal.Body style={styles.modalBody}>
              <Form>
                <p><strong>Order ID:</strong> {viewOrder.id}</p>
                <Form.Group className="mb-2">
                  <Form.Select
                    value={viewOrder.customerId}
                    onChange={(e) =>
                      setViewOrder({ ...viewOrder, customerId: e.target.value })
                    }
                    style={styles.glassInput}
                  >
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Select
                    value={viewOrder.productId}
                    onChange={(e) => {
                      const product = products.find(p => p.id == e.target.value);
                      setViewOrder({ ...viewOrder, productId: e.target.value, price: product?.price || 0 });
                    }}
                    style={styles.glassInput}
                  >
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Row className="mb-2">
                  <Col>
                    <Form.Control
                      type="number"
                      value={viewOrder.qty}
                      onChange={(e) =>
                        setViewOrder({ ...viewOrder, qty: Number(e.target.value) })
                      }
                      style={styles.glassInput}
                    />
                  </Col>
                  <Col>
                    <Form.Control
                      type="number"
                      value={viewOrder.price}
                      onChange={(e) =>
                        setViewOrder({ ...viewOrder, price: Number(e.target.value) })
                      }
                      style={styles.glassInput}
                    />
                  </Col>
                </Row>
                <Form.Group className="mb-2">
                  <Form.Control
                    type="date"
                    value={viewOrder.date}
                    onChange={(e) =>
                      setViewOrder({ ...viewOrder, date: e.target.value })
                    }
                    style={styles.glassInput}
                  />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Select
                    value={viewOrder.status}
                    onChange={(e) =>
                      setViewOrder({ ...viewOrder, status: e.target.value })
                    }
                    style={styles.statusColors[viewOrder.status]}
                  >
                    <option>Pending</option>
                    <option>Processing</option>
                    <option>Completed</option>
                    <option>Cancelled</option>
                  </Form.Select>
                </Form.Group>
                <p className="text-end fw-bold">
                  Total: Rp {(viewOrder.qty * viewOrder.price).toLocaleString()}
                </p>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setViewOrder(null)}>
                Close
              </Button>
              <Button style={styles.glassButton} onClick={updateOrder}>
                Save
              </Button>
            </Modal.Footer>
          </Modal>
        )}
      </Container>
    </div>
  );
}

// --- CSS in JS ---
const styles = {
  pageBackground: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "2rem",
    background: "#fce4ec",
    animation: "gradient 20s ease infinite",
  },
  cardContainer: {
    width: "100%",
    maxWidth: "1100px",
    borderRadius: "30px",
    background: "linear-gradient(-45deg, #ffb6c1, #ff69b4, #ff1493, #ff69b4)",
    backgroundSize: "400% 400%",
    padding: "2rem",
    boxShadow: "0 15px 30px rgba(255,105,180,0.4)",
    animation: "gradient 15s ease infinite",
  },
  title: {
    textAlign: "center",
    marginBottom: "2rem",
    color: "#fff",
    textShadow: "2px 2px 15px rgba(0,0,0,0.4)",
  },
  glassButton: {
    background: "rgba(255,182,193,0.8)",
    border: "none",
    color: "#fff",
    fontWeight: "bold",
    boxShadow: "0 4px 15px rgba(255,105,180,0.6)",
    backdropFilter: "blur(8px)",
    borderRadius: "12px",
    transition: "0.3s",
    cursor: "pointer",
  },
  glassInput: {
    background: "rgba(255,255,255,0.4)",
    border: "none",
    borderRadius: "12px",
    color: "#333",
    backdropFilter: "blur(6px)",
  },
  glassTable: {
    background: "rgba(255,255,255,0.2)",
    borderRadius: "20px",
    backdropFilter: "blur(6px)",
    color: "#fff",
  },
  tableHeader: {
    background: "rgba(255,105,180,0.8)",
    color: "#fff",
    borderRadius: "20px",
  },
  modalHeader: {
    background: "linear-gradient(to right, #ffb6c1, #ff69b4, #ff1493)",
    color: "#fff",
    borderBottom: "none",
  },
  modalBody: {
    background: "rgba(255,182,193,0.2)",
    backdropFilter: "blur(8px)",
    borderRadius: "20px",
  },
  statusColors: {
    Completed: { backgroundColor: "#28a745", color: "#fff" },
    Pending: { backgroundColor: "#ffc107" },
    Processing: { backgroundColor: "#17a2b8", color: "#fff" },
    Cancelled: { backgroundColor: "#dc3545", color: "#fff" },
  },
  rowHover: {
    transition: "0.3s",
  },
};
