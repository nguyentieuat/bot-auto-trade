import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// JoinForm component - a simple contact/registration form
const JoinForm = () => {
  const navigate = useNavigate(); // Hook for programmatic navigation

  // State to hold form input values
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
  });

  // Update form state when input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitted data:', formData);
    alert('Thank you for registering! We will contact you shortly.');
    setFormData({ name: '', phone: '', email: '', message: '' }); // Clear form
  };

  return (
    <div className="container py-5 text-light">
      <h2 className="mb-4">Join Now</h2>

      {/* Registration form */}
      <form onSubmit={handleSubmit} className="bg-dark p-4 rounded-4 shadow text-start">
        
        {/* Name field */}
        <div className="mb-3">
          <label className="form-label text-start">Name</label>
          <input
            type="text"
            name="name"
            className="form-control"
            required
            value={formData.name}
            onChange={handleChange}
          />
        </div>

        {/* Phone field */}
        <div className="mb-3">
          <label className="form-label text-start">Phone</label>
          <input
            type="tel"
            name="phone"
            className="form-control"
            required
            value={formData.phone}
            onChange={handleChange}
          />
        </div>

        {/* Email field */}
        <div className="mb-3">
          <label className="form-label text-start">Email</label>
          <input
            type="email"
            name="email"
            className="form-control"
            required
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        {/* Message field */}
        <div className="mb-3">
          <label className="form-label text-start">Consultation Message</label>
          <textarea
            name="message"
            rows="4"
            className="form-control"
            required
            value={formData.message}
            onChange={handleChange}
          />
        </div>

        {/* Submit and back buttons */}
        <div className="d-flex justify-content-between">
          {/* Submit form */}
          <button type="submit" className="btn btn-primary">
            Submit
          </button>

          {/* Navigate back to homepage */}
          <button
            type="button"
            className="btn btn-outline-light"
            onClick={() => navigate('/')}
          >
            ⬅ Back to Home
          </button>
        </div>
      </form>
    </div>
  );
};

export default JoinForm;
