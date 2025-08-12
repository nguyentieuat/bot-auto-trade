import React, { useEffect, useState } from "react";
import CapitalDistributionChart from "./CapitalDistributionChart";
import DashboardInvestForm from "./DashboardInvestForm";
import BotInvestmentHistoryTable from "./BotInvestmentHistoryTable";
import GainChart from "../bot_chart/GainChart";

const backendUrl = process.env.REACT_APP_API_URL;

const DashboardInvestSection = ({ user, sidebarOpen }) => {
  const [investmentSummary, setInvestmentSummary] = useState([]);
  const [userProfits, setUserProfits] = useState([]);
  const [investments, setInvestments] = useState([]);

  const [loading, setLoading] = useState(true); // Tổng loading
  const [error, setError] = useState(null);

  const username = user?.username;
  const token = localStorage.getItem('token');

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [investmentsRes, summaryRes, profitsRes] = await Promise.allSettled([
        fetch(`${backendUrl}/investment-orders/${username}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${backendUrl}/investment-summary/${username}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${backendUrl}/user-profits/${username}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
      ]);

      // Xử lý kết quả từng API
      if (investmentsRes.status === "fulfilled" && investmentsRes.value.ok) {
        setInvestments(await investmentsRes.value.json());
      } else {
        console.warn("Lỗi lấy danh sách đầu tư");
      }

      if (summaryRes.status === "fulfilled" && summaryRes.value.ok) {
        setInvestmentSummary(await summaryRes.value.json());
      } else {
        console.warn("Lỗi lấy tóm tắt đầu tư");
      }

      if (profitsRes.status === "fulfilled" && profitsRes.value.ok) {
        const data = await profitsRes.value.json();
        setUserProfits(data.data || []);
      } else {
        console.warn("Lỗi lấy lợi nhuận người dùng");
      }
    } catch (err) {
      console.error("Lỗi fetch dữ liệu:", err);
      setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!username) return;
    fetchData();
  }, [username]);

  if (loading) {
    return (
      <div className="text-center my-5" style={{
        marginLeft:
          window.innerWidth >= 768 ? 260 : (sidebarOpen ? 260 : 0)
      }}>
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-3 text-muted">Đang tải dữ liệu đầu tư...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger mt-4" role="alert" style={{
        marginLeft:
          window.innerWidth >= 768 ? 260 : (sidebarOpen ? 260 : 0)
      }}>
        {error}
      </div>
    );
  }

  return (
    <div className="container-fluid mt-4" style={{
      marginLeft: sidebarOpen && window.innerWidth >= 768 ? 260 : 0,
      transition: 'margin-left 0.3s ease',
    }}>
      <div className="mb-5">
        <h4 className="text-warning">Phân Bổ Vốn Theo Trạng Thái</h4>
        <CapitalDistributionChart investmentSummary={investmentSummary} />
        <p className="text-muted mt-2">Đơn vị: triệu đồng</p>
      </div>

      <div className="mb-5">
        <DashboardInvestForm
          username={user.username}
          onSuccess={(newData) => {
            setInvestments((prev) => [newData, ...prev]);
            fetchData(); // refresh lại dữ liệu khi thêm mới
          }}
        />
      </div>

      <div className="mb-5">
        <h4 className="text-warning">Biểu đồ tăng trưởng</h4>
        <GainChart data={userProfits} mode={
          userProfits.length >= 1000
            ? 'year'
            : userProfits.length >= 100
              ? 'month'
              : 'day'
        } />
      </div>

      <div className="mb-5">
        <h4 className="text-warning">Lịch Sử Đầu Tư</h4>
        {investments.length > 0 ? (
          <BotInvestmentHistoryTable investments={investments} />
        ) : (
          <p className="text-muted">Không có lịch sử đầu tư.</p>
        )}
      </div>

    </div>
  );
};

export default DashboardInvestSection;
