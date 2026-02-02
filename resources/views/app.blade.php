<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <!-- Primary Meta Tags -->
    <title>SIKAF Eye Care - Best Eye Care Clinic in Tanzania | Comprehensive Eye Examinations</title>
    <meta name="title" content="SIKAF Eye Care - Best Eye Care Clinic in Tanzania | Comprehensive Eye Examinations">
    <meta name="description" content="SIKAF Eye Care is the leading eye care clinic in Dar es Salaam, Tanzania. We offer comprehensive eye examinations, diagnosis & treatment of eye disorders, spectacles dispensing, contact lens fitting, and community eye outreach programs. Book your appointment today!">
    <meta name="keywords" content="SIKAF Eye Care, eye care Tanzania, optometrist Dar es Salaam, eye examination, eye clinic, contact lens fitting, spectacles Tanzania, eye treatment, eye doctor Tanzania, vision care, ophthalmologist Dar es Salaam, eye surgery Tanzania, eye care clinic Dar es Salaam, SIKAF, sikafeyecare">
    <meta name="author" content="SIKAF Eye Care">
    <meta name="application-name" content="SIKAF Eye Care">
    <meta name="author" content="SIKAF Eye Care">
    <meta name="robots" content="index, follow">
    <meta name="language" content="English">
    <meta name="revisit-after" content="7 days">
    <meta name="theme-color" content="#667eea">

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="{{ \Illuminate\Support\Facades\URL::to('/') }}">
    <meta property="og:title" content="SIKAF Eye Care - Best Eye Care Clinic in Tanzania">
    <meta property="og:description" content="Leading eye care clinic in Dar es Salaam, Tanzania. Comprehensive eye examinations, diagnosis & treatment, spectacles dispensing, and contact lens fitting. Book your appointment today!">
    <meta property="og:image" content="{{ \Illuminate\Support\Facades\URL::to('/') }}/logo.png">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:site_name" content="SIKAF Eye Care">
    <meta property="og:locale" content="en_US">

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="{{ \Illuminate\Support\Facades\URL::to('/') }}">
    <meta name="twitter:title" content="SIKAF Eye Care - Best Eye Care Clinic in Tanzania">
    <meta name="twitter:description" content="Leading eye care clinic in Dar es Salaam, Tanzania. Comprehensive eye examinations, diagnosis & treatment, spectacles dispensing, and contact lens fitting.">
    <meta name="twitter:image" content="{{ \Illuminate\Support\Facades\URL::to('/') }}/logo.png">

    <!-- Geo Tags -->
    <meta name="geo.region" content="TZ-26">
    <meta name="geo.placename" content="Dar es Salaam">
    <meta name="geo.position" content="-6.7924;39.2083">
    <meta name="ICBM" content="-6.7924, 39.2083">

    <!-- Business Information -->
    <meta name="contact" content="info@sikafeyecare.co.tz">
    <meta name="phone" content="+255 676 506 323">
    <meta name="address" content="Gerezani - Kamata traffic light near traffic post, Dar es Salaam, Tanzania">

    <!-- Canonical URL -->
    <link rel="canonical" href="{{ \Illuminate\Support\Facades\URL::to('/') }}">

    <!-- Structured Data (JSON-LD) for LocalBusiness -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "@id": "{{ \Illuminate\Support\Facades\URL::to('/') }}",
      "name": "SIKAF Eye Care",
      "description": "Leading eye care clinic in Dar es Salaam, Tanzania. Comprehensive eye examinations, diagnosis & treatment, spectacles dispensing, and contact lens fitting.",
      "url": "{{ \Illuminate\Support\Facades\URL::to('/') }}",
      "telephone": "+255676506323",
      "email": "info@sikafeyecare.co.tz",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Gerezani - Kamata traffic light near traffic post",
        "addressLocality": "Dar es Salaam",
        "addressCountry": "TZ"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": "-6.7924",
        "longitude": "39.2083"
      },
      "openingHoursSpecification": [
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
          "opens": "08:00",
          "closes": "17:00"
        }
      ],
      "image": "{{ \Illuminate\Support\Facades\URL::to('/') }}/logo.png",
      "priceRange": "$$",
      "areaServed": {
        "@type": "City",
        "name": "Dar es Salaam"
      },
      "service": [
        "Eye Examinations",
        "Eye Disorder Treatment",
        "Spectacles Dispensing",
        "Contact Lens Fitting",
        "Community Eye Outreach"
      ]
    }
    </script>

    <!-- Favicon -->
    <link rel="icon" type="image/x-icon" href="{{ \Illuminate\Support\Facades\URL::to('/') }}/favicon.ico">
    <link rel="icon" type="image/png" href="{{ asset('logo.png') }}">
    <link rel="apple-touch-icon" href="{{ asset('logo.png') }}">

    <!-- Fonts -->
    <link href="{{ asset('css/fonts.css') }}" rel="stylesheet">

    <!-- Preconnect for Performance -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

    @php
        $isLocal = false;
        try {
            $isLocal = app()->environment('local');
        } catch (\Throwable $e) {
            // If environment check fails, default to production
            $isLocal = false;
        }
    @endphp
    @if($isLocal)
    @viteReactRefresh
    @vite(['resources/js/app.jsx'])
    @else
        @php
            $manifestPath = null;
            $manifest = null;
            $appJs = null;
            $appCss = null;
            
            try {
                $manifestPath = public_path('build/manifest.json');
                
                if ($manifestPath && file_exists($manifestPath) && is_readable($manifestPath)) {
                    $manifestContent = @file_get_contents($manifestPath);
                    if ($manifestContent !== false) {
                        $manifest = @json_decode($manifestContent, true);
                        if ($manifest && is_array($manifest) && isset($manifest['resources/js/app.jsx'])) {
                            $appJs = $manifest['resources/js/app.jsx']['file'] ?? null;
                            $appCss = isset($manifest['resources/js/app.jsx']['css']) && !empty($manifest['resources/js/app.jsx']['css']) 
                                ? $manifest['resources/js/app.jsx']['css'][0] 
                                : null;
                        }
                    }
                }
            } catch (\Throwable $e) {
                // Silently handle all errors - will fall back to error message
                // Don't use Log facade as it might not be initialized
            }
        @endphp
        @if($appCss)
            <link rel="stylesheet" href="{{ asset('build/' . $appCss) }}">
        @endif
        @if($appJs)
            <script type="module" src="{{ asset('build/' . $appJs) }}"></script>
        @else
            {{-- Fallback: If manifest not found, show error message --}}
            <script>
                console.error('Production build not found! Please run: npm run build');
                document.getElementById('root').innerHTML = '<h1>Production Build Required</h1><p>Please run <code>npm run build</code> and upload the <code>public/build/</code> directory to the server.</p>';
            </script>
        @endif
    @endif
    <style>
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        .loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: linear-gradient(135deg, #E8F4F8 0%, #F0E8FF 100%);
            font-family: 'Montserrat', sans-serif;
            animation: fadeIn 0.5s ease-in;
        }
        .loading-logo {
            height: 80px;
            width: auto;
            margin-bottom: 30px;
            animation: fadeIn 0.8s ease-in;
        }
        .loading-spinner {
            width: 50px;
            height: 50px;
            border: 5px solid rgba(102, 126, 234, 0.2);
            border-top-color: #667eea;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 25px;
        }
        .loading-title {
            font-size: 1.75rem;
            font-weight: 700;
            color: #1C1C1C;
            margin-bottom: 12px;
            text-align: center;
            animation: fadeIn 1s ease-in;
        }
        .loading-subtitle {
            font-size: 1rem;
            color: #4A4A4A;
            text-align: center;
            line-height: 1.6;
            max-width: 500px;
            padding: 0 20px;
            animation: fadeIn 1.2s ease-in, pulse 2s ease-in-out infinite 1.5s;
        }
        .loading-dots {
            display: inline-block;
            margin-left: 5px;
        }
        .loading-dots span {
            display: inline-block;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background-color: #667eea;
            margin: 0 2px;
            animation: pulse 1.4s ease-in-out infinite;
        }
        .loading-dots span:nth-child(1) { animation-delay: 0s; }
        .loading-dots span:nth-child(2) { animation-delay: 0.2s; }
        .loading-dots span:nth-child(3) { animation-delay: 0.4s; }
        .noscript-message {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-align: center;
            padding: 20px;
            font-family: 'Montserrat', sans-serif;
        }
        .noscript-message h1 {
            font-size: 2rem;
            margin-bottom: 1rem;
        }
        .noscript-message p {
            font-size: 1.1rem;
        }
    </style>
</head>
<body>
<noscript>
    <div class="noscript-message">
        <div>
            <h1>JavaScript Required</h1>
            <p>Please enable JavaScript to access SIKAF Eye Care website.</p>
        </div>
    </div>
</noscript>
<div id="root">
    <div class="loading-container">
        <div style="text-align: center; padding: 40px 20px; max-width: 600px;">
            <img src="/logo.png" alt="SIKAF Eye Care" class="loading-logo" onerror="this.style.display='none'">
            <div class="loading-spinner"></div>
            <h1 class="loading-title">SIKAF Eye Care</h1>
            <p class="loading-subtitle">
                Loading your eye care experience<span class="loading-dots"><span></span><span></span><span></span></span>
            </p>
        </div>
    </div>
</div>
</body>
</html>
