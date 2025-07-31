import React from 'react';

const BacktestStatsCard = ({ stats }) => {
    const {
        profit_per_year,
        return_pct,
        sharpe_ratio,
        max_drawdown,
        hitrate,
    } = stats || {};

    // Helper: return value if valid, else empty string
    const displayValue = (value) => {
        const num = Number(value);
        if (value === null || value === undefined || isNaN(num)) {
            return '';
        }
        return value;
    };

    return (
        <div className="bg-dark text-white rounded-3 shadow p-3">
            <h2 className="text-xl font-semibold mb-4">📊 Performance Stats</h2>
            <div className="space-y-2 text-sm">
                <div><span className="font-medium">📈 Profit/year:</span> {displayValue(profit_per_year)}</div>
                <div><span className="font-medium">💹 Return:</span> {displayValue(return_pct)}</div>
                <div><span className="font-medium">📊 Sharpe Ratio:</span> {displayValue(sharpe_ratio)}</div>
                <div><span className="font-medium">📉 Max Drawdown:</span> {displayValue(max_drawdown)}</div>
                <div><span className="font-medium">🎯 Hitrate:</span> {displayValue(hitrate)}</div>
            </div>
        </div>
    );
};

export default BacktestStatsCard;
