import React, { useEffect, useState } from 'react';
import axios from 'axios';
const backendUrl = process.env.REACT_APP_API_URL;

const GuestJoinRequestList = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const limit = 10;

    useEffect(() => {
        const fetchRequests = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`${backendUrl}/admin/guest-join-requests`, {
                    params: { page, limit },
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });

                setRequests(res.data.data);
                setTotalPages(res.data.totalPages);
            } catch (err) {
                console.error('Failed to fetch requests:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchRequests();
    }, [page]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
        }
    };

    if (loading) return <p>Đang tải...</p>;

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Danh sách đăng ký khách</h2>

            {requests.length === 0 ? (
                <p>Không có yêu cầu nào.</p>
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="table table-bordered">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="p-2 border">Họ tên</th>
                                    <th className="p-2 border">SĐT</th>
                                    <th className="p-2 border">Email</th>
                                    <th className="p-2 border">Gói</th>
                                    <th className="p-2 border">Thời gian</th>
                                    <th className="p-2 border">Bot</th>
                                    <th className="p-2 border">Ghi chú</th>
                                    <th className="p-2 border">Ngày đăng ký</th>
                                </tr>
                            </thead>
                            <tbody>
                                {requests.map((r) => (
                                    <tr key={r.id} className="hover:bg-gray-50">
                                        <td className="p-2 border">{r.full_name}</td>
                                        <td className="p-2 border">{r.phone}</td>
                                        <td className="p-2 border">{r.email}</td>
                                        <td className="p-2 border">{r.package_name || '-'}</td>
                                        <td className="p-2 border">{r.duration_months} tháng</td>
                                        <td className="p-2 border">
                                            {(Array.isArray(r.selected_bot_names) && r.selected_bot_names.length > 0)
                                                ? r.selected_bot_names.join(', ')
                                                : '-'}
                                        </td>
                                        <td className="p-2 border">{r.note || '-'}</td>
                                        <td className="p-2 border">
                                            {new Date(r.submitted_at).toLocaleString('vi-VN')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="mt-4 d-flex justify-content-center">
                        <button
                            className="btn btn-outline-primary mx-1"
                            onClick={() => handlePageChange(page - 1)}
                            disabled={page === 1}
                        >
                            ← Trước
                        </button>
                        <span className="mx-2 align-self-center">
                            Trang {page} / {totalPages}
                        </span>
                        <button
                            className="btn btn-outline-primary mx-1"
                            onClick={() => handlePageChange(page + 1)}
                            disabled={page === totalPages}
                        >
                            Sau →
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default GuestJoinRequestList;
