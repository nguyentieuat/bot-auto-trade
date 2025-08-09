import React, { useEffect } from 'react';

export default function PrivacyPolicyAndTermsModal({ onClose }) {
  useEffect(() => {
    document.title = 'Chính sách & Quyền riêng tư — Dịch vụ tín hiệu';
  }, []);

  const handlePrint = () => window.print();

  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  };

  const modalStyle = {
    backgroundColor: '#fff',
    borderRadius: '8px',
    maxWidth: '900px',
    width: '90%',
    maxHeight: '90%',
    overflowY: 'auto',
    padding: '24px',
    textAlign: 'left',
    lineHeight: '1.6',
  };

  const listStyle = {
    listStyle: 'none',
    paddingLeft: 0,
    margin: 0,
  };

  const sectionStyle = {
    marginTop: '24px',
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <header style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '16px' }}>
            Chính sách & Quyền riêng tư
          </h1>
          <ul style={listStyle}>
            <li><a href="#dieu-khoan">Điều khoản dịch vụ</a></li>
            <li><a href="#kenh-tra-phi">Kênh trả phí</a></li>
            <li><a href="#tin-hieu-mien-phi">Tín hiệu miễn phí</a></li>
            <li><a href="#dich-vu-bot">Dịch vụ Bot</a></li>
            <li><a href="#quyen-rieng-tu">Quyền riêng tư</a></li>
            <li><a href="#bao-mat">Bảo mật</a></li>
            <li><a href="#lien-he">Liên hệ</a></li>
          </ul>
        </header>

        <main style={{ maxWidth: '800px', margin: '24px auto' }}>
          <section id="dieu-khoan" style={sectionStyle}>
            <h2>1. Điều khoản dịch vụ</h2>
            <p>Chúng tôi cung cấp dịch vụ tín hiệu giao dịch với mục tiêu hỗ trợ người dùng đưa ra quyết định đầu tư tốt hơn. Người dùng cần tuân thủ các quy định về sử dụng dịch vụ và không được lợi dụng dịch vụ cho mục đích gian lận hoặc trái pháp luật.</p>
          </section>

          <section id="kenh-tra-phi" style={sectionStyle}>
            <h2>2. Kênh trả phí</h2>
            <ul style={listStyle}>
              <li>Kênh VIP với tín hiệu chất lượng cao</li>
              <li>Hỗ trợ 24/7</li>
              <li>Thông tin phân tích chuyên sâu</li>
            </ul>
          </section>

          <section id="tin-hieu-mien-phi" style={sectionStyle}>
            <h2>3. Tín hiệu miễn phí</h2>
            <p>Chúng tôi cũng cung cấp một số tín hiệu miễn phí nhằm giúp người dùng trải nghiệm dịch vụ trước khi đăng ký gói trả phí.</p>
          </section>

          <section id="dich-vu-bot" style={sectionStyle}>
            <h2>4. Dịch vụ Bot</h2>
            <p>Dịch vụ Bot giúp tự động hóa giao dịch dựa trên chiến lược đã được thiết lập sẵn. Người dùng cần hiểu rõ rủi ro và tự chịu trách nhiệm với các quyết định giao dịch của mình.</p>
          </section>

          <section id="quyen-rieng-tu" style={sectionStyle}>
            <h2>5. Quyền riêng tư</h2>
            <p>Chúng tôi cam kết bảo vệ thông tin cá nhân của bạn và không chia sẻ cho bên thứ ba nếu không có sự đồng ý của bạn, trừ khi pháp luật yêu cầu.</p>
          </section>

          <section id="bao-mat" style={sectionStyle}>
            <h2>6. Bảo mật</h2>
            <p>Hệ thống của chúng tôi áp dụng các biện pháp bảo mật tiên tiến để đảm bảo an toàn dữ liệu người dùng.</p>
          </section>

          <section id="lien-he" style={sectionStyle}>
            <h2>7. Liên hệ</h2>
            <p>Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ qua email: support@dichvutin.hieu</p>
          </section>
        </main>

        <footer style={{ maxWidth: '800px', margin: '24px auto', textAlign: 'center' }}>
          <button
            onClick={handlePrint}
            style={{
              backgroundColor: '#2563eb',
              color: '#fff',
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              marginRight: '8px',
            }}
          >
            In chính sách
          </button>
          <button
            onClick={onClose}
            style={{
              backgroundColor: '#e5e7eb',
              color: '#111827',
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Đóng
          </button>
        </footer>
      </div>
    </div>
  );
}
