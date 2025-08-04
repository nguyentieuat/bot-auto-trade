import React from "react";

const BotInvestmentHistoryTable = ({ investments }) => {
  return (
    <div className="card p-3 shadow-sm">
      <table className="table table-bordered table-hover">
        <thead>
          <tr>
            <th>STT</th>
            <th>Số vốn</th>
            <th>Ngày đặt lệnh</th>
            <th>Ngày Confirm</th>
            <th>Ngày chạy</th>
            <th>Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          {investments.map((inv, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td className="text-success">{inv.capital_amount}</td>
              <td>{formatDate(inv.created_at)}</td>
              <td>{formatDate(inv.confirmed_at)}</td>
              <td>{formatDate(inv.start_at)}</td>
              <td>
                <span className={`badge bg-${getStatusColor(inv.status)}`}>
                  {inv.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const formatDate = (date) => {
  return date ? new Date(date).toLocaleDateString() : "";
};

const getStatusColor = (status) => {
  switch (status) {
    case "pending":
      return "secondary";
    case "running":
      return "primary";
    case "completed":
      return "success";
    default:
      return "dark";
  }
};

export default BotInvestmentHistoryTable;
