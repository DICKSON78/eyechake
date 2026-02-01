<head>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css" />
  <style>
    .pricing-table {
      clip-path: polygon(0 0, 100% 0, 100% 85%, 50% 100%, 0 85%);
      background: linear-gradient(135deg, #f59e0b, #dc2626);
      padding: 50px 0;
    }
    .pricing-tier {
      margin: 20px;
      border-radius: 15px;
      box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s, box-shadow 0.3s;
    }
    .pricing-tier:hover {
      transform: translateY(-10px);
      box-shadow: 0 15px 20px rgba(0, 0, 0, 0.2);
    }
    .pricing-tier img {
      display: block;
      max-width: 100%;
      border-radius: 15px 15px 0 0;
    }
  </style>
</head>
<body>
  @include('navbar')
  <!-- Pricing Section -->
  <section id="pricing-table" class="pricing-table animate__animated animate__fadeIn">
    <!-- Starter Plan -->
    <div class="pricing-tier">
      <img src="/images/starter-plan.jpg" alt="Starter Plan">
      <h2>Starter</h2>
      <p>$99/month</p>
      <ul>
        <li>Up to 500 patients</li>
        <li>Basic features</li>
        <li>Email support</li>
      </ul>
    </div>
    <!-- Professional Plan -->
    <div class="pricing-tier">
      <img src="/images/professional-plan.jpg" alt="Professional Plan">
      <h2>Professional</h2>
      <p>$299/month</p>
      <ul>
        <li>Up to 2000 patients</li>
        <li>Advanced analytics</li>
        <li>Priority support</li>
        <li>API access</li>
      </ul>
    </div>
  </section>
  <!-- GSAP Animations -->
  <script>
    gsap.from(".pricing-tier", {
      scrollTrigger: {
        trigger: ".pricing-tier",
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
