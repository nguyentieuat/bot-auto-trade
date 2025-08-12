import React, { useEffect, useState } from 'react';
import axios from 'axios';
const backendUrl = process.env.REACT_APP_API_URL;

const ITEMS_PER_PAGE = 10;

const AdminTransactions = () => {
    const [deposits, setDeposits] = useState([]);
    const [withdrawals, setWithdrawals] = useState([]);
    const [loading, setLoading] = useState(true);

    const [depositPage, setDepositPage] = useState(1);
    const [withdrawPage, setWithdrawPage] = useState(1);

    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const results = await Promise.allSettled([
                    axios.get(`${backendUrl}/admin/deposits`, { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get(`${backendUrl}/admin/withdrawals`, { headers: { Authorization: `Bearer ${token}` } })
                ]);

                // Kiểm tra từng kết quả
                if (results[0].status === 'fulfilled') {
                    setDeposits(results[0].value.data);
                } else {
                    console.error('Lỗi lấy deposits:', results[0].reason);
                    setDeposits([]); // hoặc xử lý fallback
                }

                if (results[1].status === 'fulfilled') {
                    setWithdrawals(results[1].value.data);
                } else {
                    console.error('Lỗi lấy withdrawals:', results[1].reason);
                    setWithdrawals([]); // hoặc xử lý fallback
                }
            } catch (err) {
                console.error('Lỗi không mong muốn:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [token]);


    const paginate = (data, page) => data.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    const handleApprove = async (type, id) => {
        try {
            await axios.post(`${backendUrl}/admin/${type}/${id}/approve`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Phê duyệt thành công');
            reloadData();
        } catch (err) {
            console.error(err);
            alert('Lỗi khi phê duyệt');
        }
    };

    const handleReject = async (type, id) => {
        try {
            await axios.post(`${backendUrl}/admin/${type}/${id}/reject`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Từ chối thành công');
            reloadData();
        } catch (err) {
            console.error(err);
            alert('Lỗi khi từ chối');
        }
    };

    const reloadData = async () => {
        setLoading(true);
        try {
            const [depRes, witRes] = await Promise.all([
                axios.get(`${backendUrl}/admin/deposits`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${backendUrl}/admin/withdrawals`, { headers: { Authorization: `Bearer ${token}` } })
            ]);
            setDeposits(depRes.data);
            setWithdrawals(witRes.data);
        } catch (err) {
            console.error('Lỗi reload dữ liệu:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <p>Đang tải dữ liệu...</p>;

    return (
        <div className="container mt-4">
            <h2>💰 Lệnh Nạp</h2>
            <table className="table table-striped">
                <thead>
                    <tr>
                        <th>Người dùng</th>
                        <th>Số tiền</th>
                        <th>Thời gian</th>
                        <th>Phương thức</th>
                        <th>Trạng thái</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {(paginate(deposits, depositPage) || []).map(dep => (
                        <tr key={dep.id}>
                            <td>{dep.username}</td>
                            <td>{dep.amount}</td>
                            <td>{new Date(dep.requested_at).toLocaleString()}</td>
                            <td>{dep.method}</td>
                            <td>{dep.status}</td>
                            <td>
                                {dep.status === 'pending' && (
                                    <>
                                        <button onClick={() => handleApprove('deposits', dep.id)} className="btn btn-sm btn-success me-2">Confirm</button>
                                        <button onClick={() => handleReject('deposits', dep.id)} className="btn btn-sm btn-danger">Reject</button>
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Pagination for deposit */}
            <div className="mb-5">
                {Array.from({ length: Math.ceil(deposits.length / ITEMS_PER_PAGE) }, (_, i) => (
                    <button key={i} className={`btn btn-sm ${i + 1 === depositPage ? 'btn-primary' : 'btn-outline-primary'} me-1`}
                        onClick={() => setDepositPage(i + 1)}>{i + 1}</button>
                ))}
            </div>

            <h2 className="mt-5">🏧 Lệnh Rút</h2>
            <table className="table table-striped">
                <thead>
                    <tr>
                        <th>Người dùng</th>
                        <th>Số tiền</th>
                        <th>Thời gian</th>
                        <th>Trạng thái</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {paginate(withdrawals, withdrawPage).map(wit => (
                        <tr key={wit.id}>
                            <td>{wit.username}</td>
                            <td>{wit.amount}</td>
                            <td>{new Date(wit.requested_at).toLocaleString()}</td>
                            <td>{wit.status}</td>
                            <td>
                                {wit.status === 'pending' && (
                                    <>
                                        <button onClick={() => handleApprove('withdrawals', wit.id)} className="btn btn-sm btn-success me-2">Confirm</button>
                                        <button onClick={() => handleReject('withdrawals', wit.id)} className="btn btn-sm btn-danger">Reject</button>
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Pagination for withdraw */}
            <div>
                {Array.from({ length: Math.ceil(withdrawals.length / ITEMS_PER_PAGE) }, (_, i) => (
                    <button key={i} className={`btn btn-sm ${i + 1 === withdrawPage ? 'btn-primary' : 'btn-outline-primary'} me-1`}
                        onClick={() => setWithdrawPage(i + 1)}>{i + 1}</button>
                ))}
            </div>
        </div>
    );
};

export default AdminTransactions;
