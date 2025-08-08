import React, { useState } from 'react';
import AdminTransactions from './AdminTransactions';
import InvestmentOrdersPage from './InvestmentOrdersPage';
import GuestJoinRequestList from './GuestJoinRequestList';
import BotSalesChart from './BotSalesChart';
import PackageSalesChart from './PackageSalesChart';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('transactions');
    const [subTab, setSubTab] = useState('package'); // sub-tab mặc định

    return (
        <div className="container mt-4">
            <h1 className="mb-4">📊 Admin Dashboard</h1>

            {/* Main Tabs */}
            <ul className="nav nav-tabs mb-4">
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === 'transactions' ? 'active' : ''}`}
                        onClick={() => setActiveTab('transactions')}
                    >
                        💸 Giao dịch (Nạp/Rút)
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === 'investments' ? 'active' : ''}`}
                        onClick={() => setActiveTab('investments')}
                    >
                        📈 Lệnh đầu tư
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === 'guestRequests' ? 'active' : ''}`}
                        onClick={() => setActiveTab('guestRequests')}
                    >
                        📝 Yêu cầu từ khách
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === 'charts' ? 'active' : ''}`}
                        onClick={() => setActiveTab('charts')}
                    >
                        📊 Biểu đồ thống kê
                    </button>
                </li>
            </ul>

            <div className="bg-dark text-light p-4 rounded shadow">
                {activeTab === 'transactions' && <AdminTransactions />}
                {activeTab === 'investments' && <InvestmentOrdersPage />}
                {activeTab === 'guestRequests' && <GuestJoinRequestList />}

                {activeTab === 'charts' && (
                    <>
                        {/* Sub-tabs for Chart */}
                        <div className="mb-4">
                            <button
                                className={`btn btn-sm mr-2 ${subTab === 'package' ? 'btn-primary' : 'btn-outline-primary'}`}
                                onClick={() => setSubTab('package')}
                            >
                                🧾 Theo gói
                            </button>
                            <button
                                className={`btn btn-sm ${subTab === 'bot' ? 'btn-primary' : 'btn-outline-primary'}`}
                                onClick={() => setSubTab('bot')}
                            >
                                🤖 Theo bot
                            </button>
                        </div>

                        {/* Render chart by sub-tab */}
                        {subTab === 'package' && <PackageSalesChart />}
                        {subTab === 'bot' && <BotSalesChart />}
                    </>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
