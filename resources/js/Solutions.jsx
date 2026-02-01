import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { gsap } from 'gsap';
import 'animate.css';

const Solutions = () => {
  React.useEffect(() => {
    gsap.from(".solutions-content, .solutions-graphics, .solutions-stories, .solutions-cta, .testimonial, .team-member", {
      opacity: 0, y: 50, duration: 1.5, stagger: 0.3
    });
    gsap.to(".testimonial", {
      scale: 1.05,
      duration: 0.5,
      ease: "power2.inOut",
      paused: false,
      repeat: -1,
      yoyo: true,
    });
  }, []);

  return (
    <div>
      <Navbar />
      <section className="solutions" style={{ 
        backgroundImage: "url('/images/solutions-bg.jpg')", 
        backgroundSize: 'cover', 
        color: '#fff', 
        padding: '100px 20px', 
        boxShadow: 'inset 0 0 30px rgba(0,0,0,0.5)' 
      }}>
        <div className="solutions-container" style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ fontSize: '3.2em', margin: '40px 0', fontWeight: 'bold' }}>Innovative Solutions Tailored for You</h1>
          <div className="solutions-content" style={{ display: 'flex', flexDirection: 'column', gap: '40px', color: '#e0e0e0' }}>
            <div>
              <h2 style={{ fontSize: '2.4em', color: '#1e3a8a' }}>Enhanced Patient Care</h2>
              <p style={{ fontSize: '1.4em' }}>Strengthen patient relationships with personalized care and efficient data management.</p>
            </div>
            <div>
              <h2 style={{ fontSize: '2.4em', color: '#1e3a8a' }}>Operations Optimization</h2>
              <p style={{ fontSize: '1.4em' }}>Maximize operational efficiency with real-time tracking and smart automation.</p>
            </div>
            <div>
              <h2 style={{ fontSize: '2.4em', color: '#1e3a8a' }}>Secure Data Solutions</h2>
              <p style={{ fontSize: '1.4em' }}>Maintain data security and compliance with top-tier encryption protocols.</p>
            </div>
          </div>
          <div className="solutions-graphics" style={{ margin: '80px 0' }}>
            <img src="/images/solutions-graphic.png" alt="Solutions Graphic" style={{ width: '100%', maxWidth: '600px', borderRadius: '10px', boxShadow: '0 5px 15px rgba(0,0,0,0.5)' }} />
          </div>
          <div className="solutions-stories" style={{ backgroundColor: '#e3f2fd', padding: '40px', borderRadius: '10px', boxShadow: '0 5px 15px rgba(0,0,0,0.3)', color: '#333' }}>
            <h2 style={{ fontSize: '2.4em', textAlign: 'center' }}>Customer Success Stories</h2>
            <div className="story" style={{ marginTop: '20px' }}>
              <h3 style={{ fontSize: '1.8em', color: '#1e3a8a' }}>Industry Leading Innovation</h3>
              <p style={{ fontSize: '1.4em', color: '#555' }}>"Our clinic's efficiency improved by 40% thanks to Maboresho's solutions." - Clinic Administrator</p>
            </div>
          </div>
          {/* Testimonials Section */}
          <section style={{ padding: '80px 20px', backgroundColor: '#f9fafb', textAlign: 'center' }}>
            <h2 style={{ fontSize: '3em', marginBottom: '40px' }}>Our Clients Love Us</h2>
            <div className="testimonial" style={{ margin: '20px auto', maxWidth: '800px', padding: '30px', backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 5px 15px rgba(0,0,0,0.2)' }}>
              <blockquote>"The comprehensive solutions provided have set new standards in our productivity levels." - Alex Johnson</blockquote>
            </div>
            <div className="testimonial" style={{ margin: '20px auto', maxWidth: '800px', padding: '30px', backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 5px 15px rgba(0,0,0,0.2)' }}>
              <blockquote>"Unmatched innovation and great support for seamless transitions." - Dr. Linda Carl</blockquote>
            </div>
          </section>
          {/* Team Section */}
          <section style={{ padding: '80px 20px', backgroundColor: '#1e3a8a', color: '#fff', textAlign: 'center' }}>
            <h2 style={{ fontSize: '3em', marginBottom: '40px' }}>Meet the Innovators</h2>
            <div className="team-member" style={{ display: 'inline-block', width: '300px', margin: '20px', backgroundColor: '#fff', color: '#333', padding: '20px', borderRadius: '10px', boxShadow: '0 5px 15px rgba(0,0,0,0.3)' }}>
              <img src="/images/team-member.jpg" alt="Team Member" style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '10px' }} />
              <h3>Jessica Parker</h3>
              <p>Head of Innovation</p>
            </div>
            <div className="team-member" style={{ display: 'inline-block', width: '300px', margin: '20px', backgroundColor: '#fff', color: '#333', padding: '20px', borderRadius: '10px', boxShadow: '0 5px 15px rgba(0,0,0,0.3)' }}>
              <img src="/images/team-member2.jpg" alt="Team Member" style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '10px' }} />
              <h3>Henry Smith</h3>
              <p>Lead Developer</p>
            </div>
          </section>
          <div className="solutions-cta" style={{ textAlign: 'center', margin: '80px 0' }}>
            <button onClick={() => window.location.href='/learn-more'} style={{ 
              padding: '15px 30px', 
              fontSize: '1.4em', 
              backgroundColor: '#1e40af', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '5px', 
              cursor: 'pointer', 
              transition: 'background-color 0.3s ease-in-out' 
            }}>Explore Our Solutions</button>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Solutions;
