import React from 'react';

const BacktestStatsCard = ({ stats }) => {
    const {
        profit_per_year,
        return_pct,
        sharpe_ratio,
        max_drawdown,
        hitrate,
    } = stats || {};

    const displayValue = (value) => {
        const num = Number(value);
        if (value === null || value === undefined || isNaN(num)) {
            return '';
        }
        return value;
    };

    const rows = [
        { label: '📈 Profit/year', value: displayValue(profit_per_year) },
        { label: '💹 Return', value: displayValue(return_pct) },
        { label: '📊 Sharpe Ratio', value: displayValue(sharpe_ratio) },
        { label: '📉 Max Drawdown', value: displayValue(max_drawdown) },
        { label: '🎯 Hitrate', value: displayValue(hitrate) },
    ];

    return (
        <div className="bg-dark text-white rounded-3 shadow p-3">
            <h2 className="text-xl fw-semibold mb-4">📊 Performance Stats</h2>
            <div className="mb-2 small">
                {rows.map(({ label, value }) => (
                    <div key={label} className="row mb-1 text-start">
                        <div className="col-8 fw-medium">{label}:</div>
                        <div className="col-4">{value}</div>
                    </div>
                ))}
            </div>
        </div>


    );
};

export default BacktestStatsCard;
