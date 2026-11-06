import React, { useState } from 'react';
import { PolicyLayout } from './PolicyLayout';
import { useToast } from '../../components/ToastContext';

export const ContactPage: React.FC = () => {
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [topic, setTopic] = useState('commission');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      showToast('Please fill in your name, email, and inquiry details.');
      return;
    }

    setIsSubmitting(true);
    // Simulate sending message
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      showToast('Shukriya. Your message has been received by our Srinagar atelier concierge.');
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
    }, 600);
  };

  return (
    <PolicyLayout
      idx="04"
      category="Contact & Atelier"
      title="Connect with our Srinagar atelier."
      subtitle="Whether commissioning a bespoke bridal pashmina, requesting an heirloom consultation, or scheduling a visit to our workshop, our concierge is at your service."
    >
      <div className="contact-wrapper">
        {/* Left Column: Direct Atelier Information */}
        <div className="contact-info-col">
          <div className="contact-card">
            <h3>Srinagar Atelier &amp; Workshop</h3>
            <p className="contact-address">
              Crafts of Cashmere House<br />
              Old City Atelier, Boulevard Road<br />
              Opposite Ghat 7, Dal Lake<br />
              Srinagar, Jammu &amp; Kashmir 190001, India
            </p>
            <p className="contact-hours">
              <strong>Atelier Hours:</strong><br />
              Monday – Saturday: 10:00 AM – 6:30 PM IST<br />
              Sunday: By Private Appointment
            </p>
          </div>

          <div className="contact-card">
            <h3>Direct Concierge Lines</h3>
            <div className="contact-channels">
              <div className="channel-item">
                <span className="channel-label">Client Concierge</span>
                <a href="mailto:concierge@craftsofcashmere.com" className="channel-link">
                  concierge@craftsofcashmere.com
                </a>
              </div>
              <div className="channel-item">
                <span className="channel-label">WhatsApp Concierge</span>
                <a
                  href="https://wa.me/919419012345"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="channel-link"
                >
                  +91 94190 12345 (Instant Chat)
                </a>
              </div>
              <div className="channel-item">
                <span className="channel-label">Telephone</span>
                <a href="tel:+911942458891" className="channel-link">
                  +91 (0) 194 245 8891
                </a>
              </div>
              <div className="channel-item">
                <span className="channel-label">Bespoke &amp; Gifting</span>
                <a href="mailto:bespoke@craftsofcashmere.com" className="channel-link">
                  bespoke@craftsofcashmere.com
                </a>
              </div>
            </div>
          </div>

          <div className="contact-card highlight">
            <h3>Visiting the Ateliers</h3>
            <p>
              We welcome patrons, textile historians, and design collectors to witness our master woodcarvers and pit-loom weavers in person. Please notify us 48 hours in advance so our senior curator can host you.
            </p>
          </div>
        </div>

        {/* Right Column: Interactive Inquiry Form */}
        <div className="contact-form-col">
          <div className="contact-form-card">
            <h3>Send an Inquiry</h3>
            <p className="contact-form-desc">
              Share details regarding your heirloom inquiry, bespoke sizing, or order support. We respond within 12 business hours.
            </p>

            {submitted ? (
              <div className="contact-success-box">
                <div className="contact-success-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <h4>Message Received</h4>
                <p>
                  Thank you for writing to Crafts of Cashmere. Our atelier concierge in Srinagar will review your request and get back to you promptly.
                </p>
                <button
                  type="button"
                  className="policy-btn primary"
                  onClick={() => setSubmitted(false)}
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form className="policy-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="cName">Your Name *</label>
                  <input
                    id="cName"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rohini Mehta"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="cEmail">Email Address *</label>
                    <input
                      id="cEmail"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. rohini@example.com"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="cPhone">Phone / WhatsApp</label>
                    <input
                      id="cPhone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +91 98765 43210"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="cTopic">Nature of Inquiry</label>
                  <select
                    id="cTopic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  >
                    <option value="commission">Bespoke Loom Commission / Bridal Trousseau</option>
                    <option value="order">Order Status &amp; Delivery Tracking</option>
                    <option value="sizing">Heirloom Sizing &amp; Material Consultation</option>
                    <option value="visit">Atelier Visit &amp; Private Viewing Appointment</option>
                    <option value="press">Press, Museum &amp; Architectural Inquiries</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="cMessage">Your Message *</label>
                  <textarea
                    id="cMessage"
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us about the craft, piece, or custom dimensions you are looking for…"
                  />
                </div>

                <button
                  type="submit"
                  className="policy-btn primary submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Transmitting…' : 'Send to Srinagar Atelier'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </PolicyLayout>
  );
};

