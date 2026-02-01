<head>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css" />
  <style>
    .case-studies {
      clip-path: polygon(0 0, 100% 0, 100% 85%, 50% 100%, 0 85%);
      background: linear-gradient(135deg, #10b981, #1e40af);
      padding: 50px 0;
    }
    .case-study {
      margin: 20px;
      border-radius: 15px;
      box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s, box-shadow 0.3s;
    }
    .case-study:hover {
      transform: translateY(-10px);
      box-shadow: 0 15px 20px rgba(0, 0, 0, 0.2);
    }
    .case-study img {
      display: block;
      max-width: 100%;
      border-radius: 15px 15px 0 0;
    }
  </style>
</head>
<body>
  @include('navbar')
  <!-- Case Studies Section -->
  <section id="case-studies" class="case-studies animate__animated animate__fadeIn">
    <!-- Large Hospital -->
    <div class="case-study">
      <img src="/images/large-hospital.jpg" alt="Large Hospital">
      <h2>Large Hospital Implementation</h2>
      <p>Implemented for 5000+ patients with outstanding results.</p>
      <ul>
        <li>Reduced patient waiting time by 30%.</li>
        <li>Improved patient satisfaction scores significantly.</li>
      </ul>
    </div>
    <!-- Medium Clinic -->
    <div class="case-study">
      <img src="/images/medium-clinic.jpg" alt="Medium Clinic">
      <h2>Medium Clinic Transformation</h2>
      <p>Discover how a mid-sized clinic enhanced their operations and patient engagement.</p>
      <ul>
        <li>Automated scheduling and billing processes.</li>
        <li>Increased clinic revenue by 20% within the first year.</li>
      </ul>
    </div>
  </section>
  <!-- GSAP Animations -->
  <script>
    gsap.from(".case-study", {
      scrollTrigger: {
        trigger: ".case-study",
        start: "top 75%",
        end: "bottom 25%",
        toggleActions: "play none none none"
      },
      opacity: 0,
      y: 50,
      duration: 1
    });
  </script>
  @include('footer')
</body>
