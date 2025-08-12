import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
const backendUrl = process.env.REACT_APP_API_URL;

const JoinForm = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const [maxBotsAllowed, setMaxBotsAllowed] = useState(0);
  const [error, setError] = useState('');
  const [availableBots, setAvailableBots] = useState([]);
  const [packages, setPackages] = useState([]);
  const [timeDuration, setTimeDuration] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userCapital, setUserCapital] = useState(0.0);
  const [estimatedPrice, setEstimatedPrice] = useState(null);
  const [botsWithPrice, setBotsWithPrice] = useState(null);

  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    selectedPackageId: '',
    selectedPackageName: '',
    selectedBotIds: [],
    selectedDuration: 1,
  });

  // Kiểm tra đăng nhập
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const user = JSON.parse(userStr);
        const res = await fetch(`${backendUrl}/users/${user.username}/info`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!res.ok) throw new Error("Không thể tải thông tin người dùng.");

        const data = await res.json();
        setUserCapital(parseFloat(data.total_capital || 0));
      } catch (err) {
        console.error("Lỗi khi fetch user info:", err);
      }
    };

    if (!token || !userStr) {
      setIsAuthenticated(false);
    } else {
      setIsAuthenticated(true);
      fetchUserInfo();
    }
  }, []);

  // Fetch bots từ API
  useEffect(() => {
    const fetchFormInfo = async () => {
      try {
        const responseBots = await axios.get(`${backendUrl}/bots/active`);
        setAvailableBots(responseBots.data || []);

        const responsePackages = await axios.get(`${backendUrl}/packages`);
        setPackages(responsePackages.data || []);

        const responseTime = await axios.get(`${backendUrl}/time-discounts`);
        setTimeDuration(responseTime.data || []);

      } catch (err) {
        console.error('Lỗi khi tải danh sách bot:', err);
      }
    };

    fetchFormInfo();
  }, []);


  // Cập nhật số bot được phép chọn theo gói
  useEffect(() => {
    if (!formData.selectedPackageId || packages.length === 0) return;

    const selectedPkg = packages.find(pkg => pkg.id === parseInt(formData.selectedPackageId));
    const allowed = selectedPkg?.max_bots || 0;

    setMaxBotsAllowed(allowed);

    if (formData.selectedBotIds.length > allowed) {
      setFormData(prev => ({
        ...prev,
        selectedBotIds: [],
      }));
    }
  }, [formData.selectedPackageId, packages]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchEstimatedPrice = async () => {
      const {
        selectedPackageName,
        selectedDuration,
        selectedBotIds,
      } = formData;

      if (
        !selectedPackageName ||
        !selectedDuration ||
        selectedBotIds.length === 0
      ) {
        setEstimatedPrice(null); // Reset nếu thiếu thông tin
        return;
      }

      try {
        const token = localStorage.getItem('token');
        const response = await axios.post(
          `${backendUrl}/subscriptions/calculate-price`,
          {
            package_name: selectedPackageName,
            months: selectedDuration,
            selectedBotIds: selectedBotIds,
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        setEstimatedPrice(response.data.total_price);
        setBotsWithPrice(response.data.bots);
      } catch (err) {
        console.error('Lỗi khi tính giá:', err);
        setEstimatedPrice(null);
      }
    };

    fetchEstimatedPrice();
  }, [
    formData.selectedPackageName,
    formData.selectedDuration,
    formData.selectedBotIds,
  ]);

  // Thay đổi input
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Nếu đang thay đổi gói dịch vụ
    if (name === 'selectedPackageId') {
      const selectedPkg = packages.find(pkg => pkg.id === parseInt(value));
      setFormData(prev => ({
        ...prev,
        selectedPackageId: value,
        selectedPackageName: selectedPkg?.name || '',
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    setError('');
  };

  // Chọn bot
  const toggleBotSelection = (botId) => {
    setFormData(prev => {
      const alreadySelected = prev.selectedBotIds.includes(botId);
      const updated = alreadySelected
        ? prev.selectedBotIds.filter(id => id !== botId)
        : [...prev.selectedBotIds, botId];

      if (updated.length > maxBotsAllowed) {
        setError(`Bạn chỉ được chọn tối đa ${maxBotsAllowed} bot cho gói này.`);
        return prev;
      }

      return { ...prev, selectedBotIds: updated };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const {
      name,
      phone,
      email,
      selectedPackageId,
      selectedPackageName,
      selectedDuration,
      selectedBotIds,
    } = formData;

    // 1. Kiểm tra form có đầy đủ chưa
    if (
      !selectedPackageId ||
      !selectedPackageName ||
      !selectedDuration ||
      selectedBotIds.length === 0
    ) {
      setError('Vui lòng chọn gói, thời gian và ít nhất 1 bot.');
      return;
    }

    // 2. Kiểm tra số dư nếu đã đăng nhập
    if (isAuthenticated && estimatedPrice !== null && estimatedPrice > userCapital) {

      setError("⚠️ Số dư của bạn không đủ để thanh toán gói này.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (isAuthenticated) {
        // Gọi API xác nhận subscription
        await axios.post(`${backendUrl}/confirm-subscription`, {
          package_name: selectedPackageName,
          months: selectedDuration,
          botsWithPrice: botsWithPrice,
        }, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        alert("✅ Đăng ký thành công!");
        navigate('/');
      } else {
        // Guest đăng ký
        await axios.post(`${backendUrl}/guest-join`, {
          full_name: name,
          phone,
          email,
          package_id: parseInt(selectedPackageId),
          package_name: selectedPackageName,
          duration_months: Number(selectedDuration),
          selected_bot_ids: selectedBotIds,
        });

        alert(`✅ Cảm ơn ${name}, chúng tôi sẽ liên hệ sớm!`);
        navigate('/');
      }

    } catch (err) {
      console.error('Lỗi khi gửi đăng ký:', err);
      setError('Đã xảy ra lỗi khi gửi thông tin, vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };



  return (
    <div className="container py-5 text-light">
      <h2 className="mb-4">🎯 Đăng ký gói sử dụng</h2>

      <form onSubmit={handleSubmit} className="bg-dark p-4 rounded-4 shadow text-start">

        {/* THÔNG TIN CÁ NHÂN */}
        {!isAuthenticated && (<fieldset className="mb-4">
          <legend className="text-info">👤 Thông tin cá nhân</legend>

          <div className="mb-3">
            <label className="form-label">Họ và tên</label>
            <input
              type="text"
              name="name"
              className="form-control"
              placeholder="Nhập tên đầy đủ"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Số điện thoại</label>
            <input
              type="tel"
              name="phone"
              className="form-control"
              placeholder="Số điện thoại (Zalo nếu có)"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              className="form-control"
              placeholder="Email để nhận thông tin gói"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
        </fieldset>)}

        {/* GÓI DỊCH VỤ */}
        <fieldset className="mb-4">
          <legend className="text-info">📦 Gói dịch vụ</legend>

          <div className="mb-3">
            <label className="form-label">Chọn gói</label>
            <select
              name="selectedPackageId"
              className="form-select"
              value={formData.selectedPackageId}
              onChange={handleChange}
              required
            >
              <option value="">-- Chọn gói --</option>
              {packages.map(pkg => (
                <option key={pkg.id} value={pkg.id}>
                  {pkg.name} (Tối đa {pkg.max_bots} bot)
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Chọn thời gian (tháng)</label>
            <select
              name="selectedDuration"
              className="form-select"
              value={formData.selectedDuration}
              onChange={handleChange}
              required
            >
              {timeDuration.map(month => (
                <option key={month.months} value={month.months}>{month.months} tháng</option>
              ))}
            </select>
          </div>
        </fieldset>

        {/* DANH SÁCH BOT */}
        <fieldset className="mb-4">
          <legend className="text-info">🤖 Lựa chọn bot</legend>

          <div className="row">
            {availableBots.map(bot => (
              <div key={bot.id} className="col-md-4">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={formData.selectedBotIds.includes(bot.id)}
                    onChange={() => toggleBotSelection(bot.id)}
                    id={`bot-${bot.id}`}
                    disabled={
                      maxBotsAllowed > 0 &&
                      !formData.selectedBotIds.includes(bot.id) &&
                      formData.selectedBotIds.length >= maxBotsAllowed
                    }
                  />
                  <label className="form-check-label" htmlFor={`bot-${bot.id}`}>
                    {bot.name}
                  </label>
                </div>
              </div>
            ))}
          </div>
        </fieldset>

        {/* Hiển thị lỗi nếu có */}
        {error && <div className="alert alert-danger">{error}</div>}

        {estimatedPrice !== null && (
          <div className="alert alert-success mt-3">
            💰 Ước tính chi phí: <strong>{estimatedPrice.toLocaleString()} VND</strong>
          </div>
        )}

        {/* Nút submit */}
        <div className="d-flex justify-content-between">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Đang gửi...
              </>
            ) : 'Đăng ký ngay'}
          </button>
          <button
            type="button"
            className="btn btn-outline-light"
            onClick={() => navigate('/')}
          >
            ⬅ Về trang chủ
          </button>
        </div>
      </form>
    </div>
  );
};

export default JoinForm;
