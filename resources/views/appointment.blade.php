<head>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css" />
  <style>
    .appointment-section {
      clip-path: polygon(0 0, 100% 0, 100% 90%, 50% 100%, 0 90%);
      background: linear-gradient(135deg, #10b981, #1e40af);
      padding: 60px 0;
      margin-bottom: 30px;
    }
    .appointment-form {
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
      padding: 40px;
      background: white;
      border-radius: 15px;
      box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
    }
    .appointment-form input,
    .appointment-form textarea {
      width: 100%;
      padding: 10px;
      margin-bottom: 15px;
      border: 1px solid #ddd;
      border-radius: 5px;
      box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
      transition: border 0.3s ease;
    }
    .appointment-form input:focus,
    .appointment-form textarea:focus {
      border-color: #0ea5e9;
    }
  </style>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.7.1/gsap.min.js"></script>
</head>
<body>
  @include('navbar')
  <!-- Appointment Section -->
  <section id="appointment-section" class="appointment-section animate__animated animate__fadeIn">
    <h2 class="animate__animated animate__fadeInDown">Make an Appointment</h2>
    <form id="appointment-form" class="appointment-form animate__animated animate__fadeIn">
      <label for="name">Name:</label>
      <input type="text" id="name" name="name" required>

      <label for="email">Email:</label>
      <input type="email" id="email" name="email" required>

      <label for="phone">Phone:</label>
      <input type="tel" id="phone" name="phone" required>

      <label for="date">Preferred Date:</label>
      <input type="date" id="date" name="date" required>

      <label for="time">Preferred Time:</label>
      <input type="time" id="time" name="time" required>

      <label for="needs">Specific Needs:</label>
      <textarea id="needs" name="needs"></textarea>

      <button type="submit" class="animate__animated animate__pulse animate__infinite">Submit</button>
    </form>
  </section>

  <!-- GSAP Animations -->
  <script>
    gsap.from("#appointment-section", {
      opacity: 0,
      y: 50,
      duration: 1.5,
      scrollTrigger: {
        trigger: "#appointment-section",
        start: "top 90%",
        toggleActions: "play none none reverse"
      }
    });
  </script>
  @include('footer')
</body>
