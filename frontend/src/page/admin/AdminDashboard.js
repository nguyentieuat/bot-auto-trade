import React, { useState } from 'react';
import AdminTransactions from './AdminTransactions';
import InvestmentOrdersPage from './InvestmentOrdersPage';
import GuestJoinRequestList from './GuestJoinRequestList';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('transactions');

    return (
        <div className="container mt-4">
            <h1 className="mb-4">📊 Admin Dashboard</h1>

            {/* Tab Menu */}
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
            </ul>

            {/* Tab Content */}
            <div>
                {activeTab === 'transactions' && <AdminTransactions />}
                {activeTab === 'investments' && <InvestmentOrdersPage />}
                {activeTab === 'guestRequests' && <GuestJoinRequestList />}
            </div>
        </div>
    );
};

export default AdminDashboard;
