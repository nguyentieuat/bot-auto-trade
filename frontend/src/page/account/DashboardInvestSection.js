import React, { useEffect, useState } from "react";
import CapitalDistributionChart from "./CapitalDistributionChart";
import DashboardInvestForm from "./DashboardInvestForm";
import BotInvestmentHistoryTable from "./BotInvestmentHistoryTable";
import GainChart from "../bot_chart/GainChart";

const backendUrl = process.env.REACT_APP_API_URL;

const DashboardInvestSection = ({ user }) => {
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
      const [resInvestments, resSummary, resProfits] = await Promise.all([
        fetch(`${backendUrl}/api/investment-orders/${username}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${backendUrl}/api/investment-summary/${username}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${backendUrl}/api/user-profits/${username}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
      ]);

      if (!resInvestments.ok || !resSummary.ok || !resProfits.ok) {
        throw new Error("Có lỗi xảy ra khi tải dữ liệu");
      }

      const investmentsData = await resInvestments.json();
      const summaryData = await resSummary.json();
      const profitsData = await resProfits.json();

      setInvestments(investmentsData);
      setInvestmentSummary(summaryData);
      setUserProfits(profitsData.data || []);
    } catch (err) {
      console.error("Lỗi khi fetch dữ liệu:", err);
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
      <div className="text-center my-5">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-3 text-muted">Đang tải dữ liệu đầu tư...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger mt-4" role="alert">
        {error}
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h4 className="mb-3 text-primary text-start w-100">Phân Bổ Vốn Theo Trạng Thái</h4>

      <div className="row">
        {/* Chart - 60% width */}
        <div className="col-md-7">
          <CapitalDistributionChart investmentSummary={investmentSummary} />
          <p className="text-muted mt-2">Đơn vị: x1000đ</p>
        </div>

        {/* Form - 40% width */}
        <div className="col-md-5">
          <DashboardInvestForm
            username={user.username}
            onSuccess={(newData) => {
              setInvestments((prev) => [newData, ...prev]);
              fetchData(); // refresh lại dữ liệu khi thêm mới
            }}
          />
        </div>
      </div>

      <div className="row mt-5">
        <h4 className="text-info mb-3">Biểu đồ tăng trưởng</h4>
        <GainChart data={userProfits} mode={
          userProfits.length >= 1000
            ? 'year'
            : userProfits.length >= 100
              ? 'month'
              : 'day'
        } />
      </div>

      <h5 className="text-primary mt-5 text-start w-100">Lịch Sử Đầu Tư</h5>
      {investments.length > 0 ? (
        <BotInvestmentHistoryTable investments={investments} />
      ) : (
        <p className="text-muted">Không có lịch sử đầu tư.</p>
      )}
    </div>
  );
};

export default DashboardInvestSection;
