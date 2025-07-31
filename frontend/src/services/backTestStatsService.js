import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
dayjs.extend(isBetween);

/**
 * Calculates key backtesting statistics from daily gain data.
 * 
 * @param {Array} data - An array of objects with properties: date (string), gain (string), total_gain (string)
 * @returns {Object} - Contains profit_per_year, return_pct, sharpe_ratio, max_drawdown, hitrate
 */
export function calculateBacktestStats(data, cashMax = 1500) {
    if (!Array.isArray(data) || data.length === 0) return {};

    const parseNumber = (val) => {
        const num = parseFloat(val);
        return isNaN(num) ? 0 : num;
    };

    // Chuyển đổi dữ liệu sang dạng chuẩn và sort theo ngày
    const parsed = data
        .map(d => ({
            date: new Date(d.date),
            gain: parseNumber(d.gain),
            total_gain: parseNumber(d.total_gain),
        }))
        .sort((a, b) => a.date - b.date);

    // Tạo bảng tổng hợp theo ngày
    const daily = {};
    parsed.forEach(({ date, gain, total_gain }) => {
        const key = date.toISOString().split('T')[0];
        if (!daily[key]) daily[key] = { gain: 0, total_gain };
        daily[key].gain += gain;
        daily[key].total_gain = total_gain;
    });

    const days = Object.keys(daily).sort();
    const gains = days.map(d => daily[d].gain / cashMax); // Return %
    const totalGains = days.map(d => daily[d].total_gain);

    // Profit per year (tổng gain / ngày * 365)
    const avgGain = gains.reduce((sum, g) => sum + g, 0) / gains.length;
    const profit_per_year = avgGain * cashMax * 365;
    const return_pct = avgGain * 365;

    // Sharpe Ratio
    const mean = avgGain;
    const variance = gains.reduce((sum, g) => sum + Math.pow(g - mean, 2), 0) / gains.length;
    const std = Math.sqrt(variance);
    const sharpe_ratio = std === 0 ? 0 : (mean / std) * Math.sqrt(252);

    // Max Drawdown
    let peak = totalGains[0];
    let maxDrawdown = 0;
    for (let i = 1; i < totalGains.length; i++) {
        if (totalGains[i] > peak) peak = totalGains[i];
        const drawdown = totalGains[i] - peak;
        if (drawdown < maxDrawdown) maxDrawdown = drawdown;
    }

    // Hitrate
    const hitrate = parsed.filter(p => p.gain >= 0).length / parsed.length;

    return {
        profit_per_year: +profit_per_year.toFixed(2),
        return_pct: +(return_pct * 100).toFixed(2),
        sharpe_ratio: +sharpe_ratio.toFixed(4),
        max_drawdown: +maxDrawdown.toFixed(2),
        hitrate: +(hitrate * 100).toFixed(2),
    };
}


/**
 * Calculates backtest statistics for a given time window (e.g., last 3 months, 90 days, etc.).
 *
 * @param {Array} data - Array of data points with a `date` field in ISO format.
 * @param {Object} options - Options for the time filter.
 * @param {number} options.amount - Number of units (e.g., 3, 90, 1).
 * @param {string} options.unit - Time unit: 'day' | 'week' | 'month' | 'year'
 * @returns {Object|null} Backtest statistics for the filtered range, or null if invalid.
 */
export function calculateRecentStats(data, { amount = 3, unit = 'month' } = {}) {
    if (!Array.isArray(data) || data.length === 0) return null;

    const endDate = dayjs(data[data.length - 1].date);
    const startDate = endDate.subtract(amount, unit);

    const recentData = data.filter(d => {
        const dDate = dayjs(d.date);
        return dDate.isBetween(startDate, endDate, null, '[]');
    });

    return calculateBacktestStats(recentData);
}