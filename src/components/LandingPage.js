import React from 'react';
import './LandingPage.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import 'animate.css';

gsap.registerPlugin(ScrollTrigger);

const LandingPage = () => {
  React.useEffect(() => {
    gsap.from(".hero-content h1, .hero-content p, .hero-content button", {
      opacity: 0, y: 20, stagger: 0.3, duration: 1,
      scrollTrigger: {
        trigger: ".hero-content",
        start: "top 85%",
      },
    });
    gsap.from(".feature-item", {
      opacity: 0, y: 20, stagger: 0.2, duration: 1,
      scrollTrigger: {
        trigger: ".features",
        start: "top 75%",
      },
    });
  }, []);

  return (
    <div className="landing-page">
      <header className="hero">
        <div className="hero-content animate__animated animate__fadeIn">
          <h1>Welcome to EyeChake</h1>
          <p>Your gateway to exceptional eye care solutions.</p>
          <button onClick={() => window.location.href='/appointment'}>Get Started</button>
        </div>
      </header>
      <section className="features">
        <h2>Our Features</h2>
        <div className="feature-list">
          {featuresData.map((feature, index) => (
            <div className="feature-item" key={index}>
              <img src={feature.image} alt={feature.title} />
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="testimonials">
        <h2>What Our Clients Say</h2>
        <div className="testimonial">
          <blockquote>"EyeChake revolutionized our practice, improving our patient engagement by 50%." - Dr. Smith</blockquote>
        </div>
        <div className="testimonial">
          <blockquote>"The ease of scheduling and management has been a game changer." - Clinic Admin</blockquote>
        </div>
      </section>
      <footer className="footer">
        <p>© 2025 EyeChake. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

const featuresData = [
  {
    image: '/images/patient-management.jpg',
    title: 'Digital Registration & Records',
    description: 'Efficiently manage all patient registrations and records digitally.',
  },
  {
    image: '/images/appointment-scheduling.jpg',
    title: 'Appointment Scheduling',
    description: 'Reduce wait times with our intelligent scheduling system.',
  },
  {
    image: '/images/treatment-history.jpg',
    title: 'Treatment History Tracking',
    description: 'Track treatment history with detailed logs for each patient.',
  }
];

export default LandingPage;
