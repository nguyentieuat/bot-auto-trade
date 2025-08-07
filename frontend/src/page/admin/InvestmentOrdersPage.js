import React, { useEffect, useState } from 'react';
import axios from 'axios';

const backendUrl = process.env.REACT_APP_API_URL;

const InvestmentOrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [usernameFilter, setUsernameFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('pending');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loadingOrderId, setLoadingOrderId] = useState(null); // NEW

    const token = localStorage.getItem('token');

    const fetchOrders = async () => {
        try {
            const res = await axios.get(`${backendUrl}/api/admin/investment-orders`, {
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                params: {
                    page,
                    username: usernameFilter,
                    status: statusFilter,
                    limit: 10
                }
            });
            setOrders(res.data.data);
            setTotalPages(res.data.totalPages);
        } catch (err) {
            console.error('Lỗi khi lấy danh sách lệnh đầu tư:', err);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [page, usernameFilter, statusFilter]);

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1); // Triggers useEffect
    };

    const handleAction = async (id, action) => {
        try {
            setLoadingOrderId(id); // NEW: show loading indicator
            await axios.post(`${backendUrl}/api/admin/investment-orders/${id}`, 
                { action }, 
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            await fetchOrders(); // Refresh data
        } catch (error) {
            console.error(`Lỗi khi thực hiện hành động ${action}:`, error);
        } finally {
            setLoadingOrderId(null); // Reset loading
        }
    };

    return (
        <div className="container">
            <h3>Investment Orders</h3>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="row g-3 align-items-end mb-4">
                <div className="col-md-4">
                    <label className="form-label">Username</label>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search by username"
                        value={usernameFilter}
                        onChange={(e) => setUsernameFilter(e.target.value)}
                    />
                </div>

                <div className="col-md-4">
                    <label className="form-label">Status</label>
                    <select
                        className="form-select"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="rejected">Rejected</option>
                        <option value="starting">Starting</option>
                    </select>
                </div>

                <div className="col-md-2">
                    <button type="submit" className="btn btn-primary w-100">
                        Search
                    </button>
                </div>
            </form>

            {/* Table */}
            <table className="table table-bordered">
                <thead>
                    <tr>
                        <th>Username</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Created At</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.length > 0 ? (
                        orders.map((order) => (
                            <tr key={order.id}>
                                <td>{order.username}</td>
                                <td>{order.capital_amount}</td>
                                <td>{order.status}</td>
                                <td>{new Date(order.created_at).toLocaleString()}</td>
                                <td>
                                    {order.status === 'pending' && (
                                        <>
                                            <button
                                                className="btn btn-success btn-sm me-2"
                                                onClick={() => handleAction(order.id, 'confirm')}
                                                disabled={loadingOrderId === order.id}
                                            >
                                                {loadingOrderId === order.id ? 'Processing...' : 'Confirm'}
                                            </button>
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() => handleAction(order.id, 'reject')}
                                                disabled={loadingOrderId === order.id}
                                            >
                                                {loadingOrderId === order.id ? 'Processing...' : 'Reject'}
                                            </button>
                                        </>
                                    )}

                                    {order.status === 'confirmed' && order.start_at == null && (
                                        <>
                                            <button
                                                className="btn btn-warning btn-sm me-2"
                                                onClick={() => handleAction(order.id, 'start')}
                                                disabled={loadingOrderId === order.id}
                                            >
                                                {loadingOrderId === order.id ? 'Starting...' : 'Start'}
                                            </button>
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() => handleAction(order.id, 'reject')}
                                                disabled={loadingOrderId === order.id}
                                            >
                                                {loadingOrderId === order.id ? 'Processing...' : 'Reject'}
                                            </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr><td colSpan="5">No orders found.</td></tr>
                    )}
                </tbody>
            </table>

            {/* Pagination */}
            <div className="pagination mt-3">
                {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((num) => (
                    <button
                        key={num}
                        onClick={() => setPage(num)}
                        className={`btn btn-sm me-2 ${num === page ? 'btn-primary' : 'btn-outline-primary'}`}
                    >
                        {num}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default InvestmentOrdersPage;
