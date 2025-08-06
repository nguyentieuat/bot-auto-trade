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
            <h2 className="text-xl font-semibold mb-4">📊 Performance Stats</h2>
            <div className="space-y-2 text-sm">
                {rows.map(({ label, value }) => (
                    <div key={label} className="grid grid-cols-3">
                        <span className="text-left font-medium col-span-1">{label}:</span>
                        <span className="text-center col-span-2">{value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BacktestStatsCard;
