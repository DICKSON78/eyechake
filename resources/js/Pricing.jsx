import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { gsap } from 'gsap';
import 'animate.css';

const Pricing = () => {
  React.useEffect(() => {
    gsap.from(".pricing-tier", {
      opacity: 0, y: 50, duration: 1,
      stagger: 0.3,
      scrollTrigger: {
        trigger: ".pricing-tier",
        start: "top 80%",
        toggleActions: "play none none none",
      },
    });
  }, []);

  return (
    <div>
      <Navbar />
      <section className="pricing-table" style={{ 
        backgroundImage: "url('/images/pricing-bg.jpg')", 
        backgroundSize: 'cover', 
        color: '#fff', 
        padding: '80px 20px', 
        boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)' 
      }}>
        <h2 style={{ fontSize: '3em', textAlign: 'center', marginBottom: '40px' }}>Our Pricing Plans</h2>
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '40px' }}>
          {/* Starter Plan */}
          <div className="pricing-tier" style={{ 
            backgroundColor: '#fff', 
            color: '#333', 
            padding: '20px', 
            borderRadius: '10px', 
            boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)', 
            width: '300px', 
            textAlign: 'center' 
          }}>
            <img src="/images/starter-plan.jpg" alt="Starter Plan" style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '10px 10px 0 0' }} />
            <h2>Starter</h2>
            <p>$99/month</p>
            <ul style={{listStyleType: 'none', padding: 0}}>
              <li>Up to 500 patients</li>
              <li>Basic features</li>
              <li>Email support</li>
            </ul>
          </div>
          {/* Professional Plan */}
          <div className="pricing-tier" style={{ 
            backgroundColor: '#fff', 
            color: '#333', 
            padding: '20px', 
            borderRadius: '10px', 
            boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)', 
            width: '300px', 
            textAlign: 'center' 
          }}>
            <img src="/images/professional-plan.jpg" alt="Professional Plan" style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '10px 10px 0 0' }} />
            <h2>Professional</h2>
            <p>$299/month</p>
            <ul style={{listStyleType: 'none', padding: 0}}>
              <li>Up to 2000 patients</li>
              <li>Advanced analytics</li>
              <li>Priority support</li>
              <li>API access</li>
            </ul>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Pricing;
