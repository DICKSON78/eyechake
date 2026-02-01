import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { gsap } from 'gsap';

const CaseStudies = () => {
  React.useEffect(() => {
    gsap.from(".case-study", {
      opacity: 0, y: 50, duration: 1,
      scrollTrigger: {
        trigger: ".case-study",
        start: "top 75%",
        end: "bottom 25%",
        toggleActions: "play none none none",
      },
    });
  }, []);

  return (
    <div>
      <Navbar />
      <section className="case-studies">
        {/* Large Hospital */}
        <div className="case-study">
          <img src="/images/large-hospital.jpg" alt="Large Hospital" />
          <h2>Large Hospital Implementation</h2>
          <p>Implemented for 5000+ patients with outstanding results.</p>
          <ul>
            <li>Reduced patient waiting time by 30%.</li>
            <li>Improved patient satisfaction scores significantly.</li>
          </ul>
        </div>
        {/* Medium Clinic */}
        <div className="case-study">
          <img src="/images/medium-clinic.jpg" alt="Medium Clinic" />
          <h2>Medium Clinic Transformation</h2>
          <p>Discover how a mid-sized clinic enhanced their operations and patient engagement.</p>
          <ul>
            <li>Automated scheduling and billing processes.</li>
            <li>Increased clinic revenue by 20% within the first year.</li>
          </ul>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default CaseStudies;
