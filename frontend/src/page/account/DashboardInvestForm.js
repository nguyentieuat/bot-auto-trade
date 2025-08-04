import React, { useState } from "react";
import axios from "axios";
import { Modal, Button } from "react-bootstrap";

const backendUrl = process.env.REACT_APP_API_URL;

const DashboardInvestForm = ({ username, onSuccess }) => {
  const [capital, setCapital] = useState("");
  const [status, setStatus] = useState("pending");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false); // modal state

  const token = localStorage.getItem("token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(
        `${backendUrl}/api/investments`,
        {
          username: username,
          capital: parseFloat(capital),
          status,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      onSuccess(res.data);

      // Reset form
      setCapital("");
      setStatus("pending");

      // Show success modal
      setShowModal(true);
    } catch (error) {
      console.error("Lỗi khi gửi yêu cầu đầu tư:", error);
      const message = error.response?.data?.message || "Đặt lệnh thất bại.";
      alert(message); // hoặc show bằng Toast, Modal...
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="card p-3 shadow-sm">
        <h5 className="text-primary">Đặt Lệnh Đầu Tư Mới</h5>
        <form onSubmit={handleSubmit}>
          <div className="mb-2">
            <label className="form-label text-start w-100">Số vốn đầu tư</label>
            <input
              type="number"
              className="form-control"
              value={capital}
              onChange={(e) => setCapital(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Đang xử lý..." : "Đặt lệnh"}
          </button>
        </form>
      </div>

      {/* Modal thông báo thành công */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Đặt lệnh thành công</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Lệnh đầu tư của bạn đã được gửi và đang chờ xác nhận từ quản trị viên.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => setShowModal(false)}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default DashboardInvestForm;
