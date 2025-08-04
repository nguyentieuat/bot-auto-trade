import React, { useEffect, useState } from "react";
import CapitalDistributionChart from "./CapitalDistributionChart";
import DashboardInvestForm from "./DashboardInvestForm";
import BotInvestmentHistoryTable from "./BotInvestmentHistoryTable";
const backendUrl = process.env.REACT_APP_API_URL;

const DashboardInvestSection = ({ user }) => {
  const [botData, setBotData] = useState([]);
  const [investmentHistory, setInvestmentHistory] = useState([]);

  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);

  const username = user.username;
  const token = localStorage.getItem('token');



  const fetchInvestments = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/investment-orders/${username}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        }
      });

      if (!res.ok) {
        throw new Error("Lỗi khi gọi API: " + res.status);
      }

      const data = await res.json();
      setInvestments(data);
    } catch (err) {
      console.error("Lỗi khi fetch dữ liệu:", err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (!username) return;
    fetchInvestments();
  }, [username]);

  const mockBots = [
    { id: 1, name: "Bot Alpha", capital: 500 },
    { id: 2, name: "Bot Beta", capital: 300 },
    { id: 3, name: "Bot Gamma", capital: 200 }
  ];

  const mockHistory = [
    {
      id: 1,
      botName: "Bot Alpha",
      amount: 200,
      status: "Running",
      investedAt: "2025-07-10"
    },
    {
      id: 2,
      botName: "Bot Beta",
      amount: 300,
      status: "Pending",
      investedAt: "2025-07-15"
    },
    {
      id: 3,
      botName: "Bot Gamma",
      amount: 100,
      status: "Completed",
      investedAt: "2025-07-20"
    }
  ];

  useEffect(() => {
    setBotData(mockBots);
    setInvestmentHistory(mockHistory);
  }, []);

  return (
    <div className="container mt-4">
      <h4 className="mb-3 text-primary text-start w-100">Phân Bổ Vốn Theo Bot</h4>

      <div className="row">
        {/* Chart - 60% width */}
        <div className="col-md-7">
          <CapitalDistributionChart bots={botData} />
          <p className="text-muted mt-2">Đơn vị: x1000đ</p>
        </div>

        {/* Form - 40% width */}
        <div className="col-md-5">
          <DashboardInvestForm
            bots={botData}
            username={user.username}
            onSuccess={(newData) => {
              setInvestmentHistory(prev => [newData, ...prev]);
              fetchInvestments()
            }}
          />
        </div>
      </div>

      <h5 className="text-primary mt-5 text-start w-100">Lịch Sử Đầu Tư</h5>
      {loading ? (
        <div className="d-flex align-items-center text-muted">
          <div className="spinner-border spinner-border-sm me-2" role="status"></div>
          Đang tải dữ liệu đầu tư...
        </div>
      ) : (
        <BotInvestmentHistoryTable investments={investments} />
      )}
    </div>
  );

};

export default DashboardInvestSection;
