import React, { useEffect, useRef } from 'react';
import { Box, Container, Typography, Button, Chip, Stack, Divider } from '@mui/material';
import { ArrowBack as ArrowBackIcon, AccessTime as TimeIcon, CalendarToday as CalendarIcon } from '@mui/icons-material';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

gsap.registerPlugin(ScrollTrigger);

const BlogArticle = () => {
  const navigate = useNavigate();
  const { slug } = useParams();
  const contentRef = useRef(null);
  const heroRef = useRef(null);

  // Article data - in a real app, this would come from an API
  const articles = {
    'understanding-eye-health': {
      title: 'Understanding Eye Health: A Comprehensive Guide',
      category: 'Health Tips',
      date: 'March 15, 2025',
      readTime: '5 min read',
      image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      content: `
        <h2>Introduction to Eye Health</h2>
        <p>Maintaining optimal eye health is crucial for overall well-being and quality of life. Your eyes are complex organs that require proper care and attention throughout your lifetime. This comprehensive guide will help you understand common eye conditions, preventive measures, and treatment options available.</p>
        
        <h2>Common Eye Conditions</h2>
        <p>Several eye conditions can affect people of all ages. Understanding these conditions is the first step toward prevention and early treatment:</p>
        
        <h3>Refractive Errors</h3>
        <p>Refractive errors are the most common eye problems, including nearsightedness (myopia), farsightedness (hyperopia), astigmatism, and presbyopia. These conditions occur when the shape of the eye prevents light from focusing directly on the retina.</p>
        
        <h3>Age-Related Macular Degeneration (AMD)</h3>
        <p>AMD is a leading cause of vision loss in people over 50. It affects the macula, the central part of the retina responsible for sharp, central vision. Early detection through regular eye exams is crucial for managing this condition.</p>
        
        <h3>Glaucoma</h3>
        <p>Glaucoma is a group of eye diseases that damage the optic nerve, often due to increased pressure in the eye. It can lead to permanent vision loss if not treated early. Regular eye pressure checks are essential for early detection.</p>
        
        <h3>Cataracts</h3>
        <p>Cataracts cause clouding of the eye's natural lens, leading to blurred vision. While cataracts are common in older adults, they can be successfully treated with surgery.</p>
        
        <h2>Preventive Measures</h2>
        <p>Taking proactive steps to protect your vision is essential:</p>
        <ul>
          <li><strong>Regular Eye Exams:</strong> Schedule comprehensive eye exams every 1-2 years, or as recommended by your eye care professional.</li>
          <li><strong>Protect from UV Light:</strong> Wear sunglasses that block 100% of UVA and UVB rays when outdoors.</li>
          <li><strong>Healthy Diet:</strong> Include foods rich in vitamins A, C, and E, as well as omega-3 fatty acids and lutein.</li>
          <li><strong>Quit Smoking:</strong> Smoking increases the risk of developing cataracts, AMD, and other eye diseases.</li>
          <li><strong>Manage Chronic Conditions:</strong> Control diabetes, hypertension, and other health conditions that can affect eye health.</li>
          <li><strong>Take Breaks from Screens:</strong> Follow the 20-20-20 rule: every 20 minutes, look at something 20 feet away for 20 seconds.</li>
        </ul>
        
        <h2>Treatment Options</h2>
        <p>Modern eye care offers various treatment options depending on the condition:</p>
        <ul>
          <li><strong>Corrective Lenses:</strong> Glasses and contact lenses can correct most refractive errors.</li>
          <li><strong>Medications:</strong> Eye drops and oral medications can treat conditions like glaucoma and infections.</li>
          <li><strong>Laser Surgery:</strong> Procedures like LASIK can correct refractive errors permanently.</li>
          <li><strong>Surgical Interventions:</strong> Cataract surgery and other procedures can restore or improve vision.</li>
        </ul>
        
        <h2>When to See an Eye Care Professional</h2>
        <p>Seek immediate attention if you experience:</p>
        <ul>
          <li>Sudden vision loss or changes</li>
          <li>Eye pain or severe discomfort</li>
          <li>Flashes of light or floaters</li>
          <li>Double vision</li>
          <li>Redness, swelling, or discharge</li>
        </ul>
        
        <h2>Conclusion</h2>
        <p>Your vision is one of your most valuable assets. By understanding common eye conditions, taking preventive measures, and seeking timely professional care, you can maintain healthy vision throughout your life. Remember, early detection and treatment are key to preserving your eyesight.</p>
      `,
      color: '#667eea',
    },
    'importance-regular-eye-exams': {
      title: 'The Importance of Regular Eye Exams',
      category: 'Eye Care',
      date: 'March 10, 2025',
      readTime: '4 min read',
      image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      content: `
        <h2>Why Regular Eye Exams Matter</h2>
        <p>Regular eye examinations are one of the most important steps you can take to protect your vision and overall health. Many eye diseases develop gradually and show no symptoms in their early stages. Comprehensive eye exams can detect problems before they cause permanent vision loss.</p>
        
        <h2>What Happens During an Eye Exam?</h2>
        <p>A comprehensive eye exam involves several components:</p>
        <ul>
          <li><strong>Visual Acuity Test:</strong> Measures how well you can see at various distances</li>
          <li><strong>Refraction Assessment:</strong> Determines your prescription for glasses or contact lenses</li>
          <li><strong>Eye Muscle Test:</strong> Evaluates how well your eyes work together</li>
          <li><strong>Pupil Response:</strong> Checks how your pupils respond to light</li>
          <li><strong>Visual Field Test:</strong> Measures your peripheral vision</li>
          <li><strong>Retinal Examination:</strong> Allows the doctor to examine the back of your eye</li>
          <li><strong>Eye Pressure Test:</strong> Screens for glaucoma</li>
        </ul>
        
        <h2>Early Detection Saves Vision</h2>
        <p>Many serious eye conditions, including glaucoma, diabetic retinopathy, and age-related macular degeneration, can be detected and treated early through regular exams. Early intervention often prevents or slows vision loss.</p>
        
        <h2>How Often Should You Get an Eye Exam?</h2>
        <p>The frequency of eye exams depends on your age, risk factors, and overall health:</p>
        <ul>
          <li><strong>Children:</strong> First exam at 6 months, then at age 3, before school, and annually thereafter</li>
          <li><strong>Adults (20-39):</strong> Every 2-3 years if no risk factors</li>
          <li><strong>Adults (40-64):</strong> Every 2 years, or annually if you have risk factors</li>
          <li><strong>Adults (65+):</strong> Annually, as age increases the risk of eye diseases</li>
        </ul>
        
        <h2>Risk Factors That Require More Frequent Exams</h2>
        <p>You may need more frequent exams if you have:</p>
        <ul>
          <li>Diabetes or a family history of diabetes</li>
          <li>A family history of eye disease</li>
          <li>High blood pressure</li>
          <li>Previous eye injury or surgery</li>
          <li>Certain medications that affect vision</li>
        </ul>
        
        <h2>Conclusion</h2>
        <p>Don't wait for symptoms to appear before scheduling an eye exam. Regular comprehensive eye examinations are essential for maintaining healthy vision and detecting problems early when they're most treatable.</p>
      `,
      color: '#764ba2',
    },
    'choosing-right-eyewear': {
      title: 'Choosing the Right Eyewear for Your Lifestyle',
      category: 'Fashion',
      date: 'March 5, 2025',
      readTime: '6 min read',
      image: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      content: `
        <h2>Finding Your Perfect Pair</h2>
        <p>Selecting the right eyewear goes beyond just correcting your vision. Your glasses should complement your lifestyle, face shape, and personal style while providing optimal comfort and functionality.</p>
        
        <h2>Consider Your Face Shape</h2>
        <p>Different frame styles suit different face shapes:</p>
        <ul>
          <li><strong>Round Face:</strong> Angular or rectangular frames add definition</li>
          <li><strong>Square Face:</strong> Round or oval frames soften strong features</li>
          <li><strong>Oval Face:</strong> Most frame styles work well with oval faces</li>
          <li><strong>Heart-Shaped Face:</strong> Frames wider at the bottom balance the face</li>
        </ul>
        
        <h2>Lifestyle Considerations</h2>
        <p>Your daily activities should influence your frame choice:</p>
        <ul>
          <li><strong>Active Lifestyle:</strong> Consider durable, lightweight frames with flexible hinges</li>
          <li><strong>Professional Setting:</strong> Classic, timeless styles convey professionalism</li>
          <li><strong>Creative Fields:</strong> Bold, unique frames can express your personality</li>
          <li><strong>Outdoor Activities:</strong> Polarized lenses and UV protection are essential</li>
        </ul>
        
        <h2>Lens Options</h2>
        <p>Modern lens technology offers various options:</p>
        <ul>
          <li><strong>Anti-Reflective Coating:</strong> Reduces glare and improves appearance</li>
          <li><strong>Photochromic Lenses:</strong> Darken automatically in sunlight</li>
          <li><strong>Blue Light Filtering:</strong> Protects eyes from digital screen emissions</li>
          <li><strong>Progressive Lenses:</strong> Seamless vision correction for multiple distances</li>
        </ul>
        
        <h2>Frame Materials</h2>
        <p>Different materials offer different benefits:</p>
        <ul>
          <li><strong>Acetate:</strong> Durable, colorful, and hypoallergenic</li>
          <li><strong>Metal:</strong> Lightweight and adjustable</li>
          <li><strong>Titanium:</strong> Extremely lightweight and corrosion-resistant</li>
          <li><strong>Plastic:</strong> Affordable and available in many styles</li>
        </ul>
        
        <h2>Comfort and Fit</h2>
        <p>Proper fit is crucial for comfort and vision:</p>
        <ul>
          <li>Frames should sit comfortably on your nose without slipping</li>
          <li>Temples should rest gently on your ears</li>
          <li>Lenses should align with your pupils</li>
          <li>Frames shouldn't press against your temples or cheeks</li>
        </ul>
        
        <h2>Conclusion</h2>
        <p>Take time to try different styles and consult with your optician. The right eyewear should enhance both your vision and your confidence.</p>
      `,
      color: '#f093fb',
    },
    'digital-eye-strain': {
      title: 'Digital Eye Strain: Prevention and Relief',
      category: 'Technology',
      date: 'February 28, 2025',
      readTime: '5 min read',
      image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      content: `
        <h2>Understanding Digital Eye Strain</h2>
        <p>Digital eye strain, also known as computer vision syndrome, affects millions of people who spend extended periods looking at screens. Symptoms include eye fatigue, dryness, headaches, and blurred vision.</p>
        
        <h2>Common Symptoms</h2>
        <ul>
          <li>Eye fatigue and discomfort</li>
          <li>Dry or irritated eyes</li>
          <li>Headaches</li>
          <li>Blurred vision</li>
          <li>Neck and shoulder pain</li>
          <li>Difficulty focusing</li>
        </ul>
        
        <h2>The 20-20-20 Rule</h2>
        <p>Follow this simple rule: every 20 minutes, take a 20-second break and look at something 20 feet away. This helps reduce eye fatigue and refocuses your eyes.</p>
        
        <h2>Optimize Your Workspace</h2>
        <ul>
          <li>Position your screen 20-26 inches from your eyes</li>
          <li>Keep the top of your screen slightly below eye level</li>
          <li>Reduce glare by adjusting lighting</li>
          <li>Use an anti-glare screen filter if needed</li>
        </ul>
        
        <h2>Screen Settings</h2>
        <ul>
          <li>Adjust brightness to match your surroundings</li>
          <li>Increase text size for easier reading</li>
          <li>Use high contrast settings</li>
          <li>Enable blue light filters, especially in the evening</li>
        </ul>
        
        <h2>Eye Exercises</h2>
        <p>Simple exercises can help relieve eye strain:</p>
        <ul>
          <li><strong>Palming:</strong> Rub your hands together to warm them, then cup them over your closed eyes</li>
          <li><strong>Focus Shifting:</strong> Look at a near object, then a far object, repeating several times</li>
          <li><strong>Eye Rolling:</strong> Slowly roll your eyes in circles, both directions</li>
        </ul>
        
        <h2>When to See a Doctor</h2>
        <p>If symptoms persist despite these measures, consult an eye care professional. You may need specialized computer glasses or treatment for underlying conditions.</p>
      `,
      color: '#4facfe',
    },
    'nutrition-healthy-vision': {
      title: 'Nutrition for Healthy Vision',
      category: 'Nutrition',
      date: 'February 22, 2025',
      readTime: '7 min read',
      image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      content: `
        <h2>Foods for Eye Health</h2>
        <p>What you eat significantly impacts your eye health. Certain nutrients can help prevent age-related eye diseases and maintain optimal vision throughout your life.</p>
        
        <h2>Essential Vitamins and Nutrients</h2>
        <h3>Vitamin A</h3>
        <p>Essential for good vision, especially in low light. Found in carrots, sweet potatoes, spinach, and dairy products.</p>
        
        <h3>Vitamin C</h3>
        <p>An antioxidant that helps prevent cataracts and macular degeneration. Abundant in citrus fruits, berries, and bell peppers.</p>
        
        <h3>Vitamin E</h3>
        <p>Protects cells from damage. Found in nuts, seeds, and vegetable oils.</p>
        
        <h3>Lutein and Zeaxanthin</h3>
        <p>Carotenoids that protect the retina. Found in leafy greens, corn, and eggs.</p>
        
        <h3>Omega-3 Fatty Acids</h3>
        <p>Support retinal health and may help prevent dry eyes. Found in fatty fish, flaxseeds, and walnuts.</p>
        
        <h3>Zinc</h3>
        <p>Helps bring vitamin A from the liver to the retina. Found in oysters, beef, and beans.</p>
        
        <h2>Eye-Healthy Foods</h2>
        <ul>
          <li><strong>Leafy Greens:</strong> Spinach, kale, and collard greens are rich in lutein and zeaxanthin</li>
          <li><strong>Fish:</strong> Salmon, tuna, and sardines provide omega-3 fatty acids</li>
          <li><strong>Eggs:</strong> Contain lutein, zeaxanthin, and zinc</li>
          <li><strong>Citrus Fruits:</strong> Oranges, lemons, and grapefruits are high in vitamin C</li>
          <li><strong>Nuts and Seeds:</strong> Almonds, sunflower seeds, and peanuts provide vitamin E</li>
          <li><strong>Carrots:</strong> Rich in beta-carotene, which converts to vitamin A</li>
        </ul>
        
        <h2>Dietary Recommendations</h2>
        <p>Aim for a balanced diet that includes:</p>
        <ul>
          <li>At least 5 servings of fruits and vegetables daily</li>
          <li>Fish at least twice a week</li>
          <li>Whole grains instead of refined carbohydrates</li>
          <li>Limited processed foods and sugars</li>
        </ul>
        
        <h2>Hydration Matters</h2>
        <p>Staying hydrated helps maintain eye moisture and reduces dry eye symptoms. Aim for 8 glasses of water daily.</p>
        
        <h2>Conclusion</h2>
        <p>Incorporating eye-healthy foods into your diet is a simple yet effective way to protect your vision. Combine good nutrition with regular eye exams for optimal eye health.</p>
      `,
      color: '#43e97b',
    },
    'understanding-glaucoma': {
      title: 'Understanding Glaucoma: Early Detection Matters',
      category: 'Medical',
      date: 'February 18, 2025',
      readTime: '8 min read',
      image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      content: `
        <h2>What is Glaucoma?</h2>
        <p>Glaucoma is a group of eye diseases that damage the optic nerve, often due to increased pressure inside the eye. It's one of the leading causes of blindness worldwide, but early detection and treatment can prevent vision loss.</p>
        
        <h2>Types of Glaucoma</h2>
        <h3>Open-Angle Glaucoma</h3>
        <p>The most common form, developing slowly and often without symptoms until significant vision loss occurs. The drainage angle remains open, but fluid doesn't drain properly.</p>
        
        <h3>Angle-Closure Glaucoma</h3>
        <p>Less common but more urgent. The drainage angle becomes blocked, causing a rapid increase in eye pressure. This requires immediate medical attention.</p>
        
        <h3>Normal-Tension Glaucoma</h3>
        <p>Optic nerve damage occurs despite normal eye pressure. The exact cause is unknown, but it may be related to reduced blood flow to the optic nerve.</p>
        
        <h2>Risk Factors</h2>
        <ul>
          <li>Age over 60</li>
          <li>Family history of glaucoma</li>
          <li>African, Hispanic, or Asian ancestry</li>
          <li>High eye pressure</li>
          <li>Thin corneas</li>
          <li>Certain medical conditions (diabetes, heart disease, high blood pressure)</li>
          <li>Previous eye injury or surgery</li>
          <li>Long-term use of corticosteroid medications</li>
        </ul>
        
        <h2>Symptoms</h2>
        <p>Early-stage glaucoma typically has no symptoms. As the disease progresses, you may experience:</p>
        <ul>
          <li>Gradual loss of peripheral vision</li>
          <li>Tunnel vision in advanced stages</li>
          <li>Blurred vision</li>
          <li>Halos around lights</li>
          <li>Severe eye pain (in angle-closure glaucoma)</li>
          <li>Nausea and vomiting (in acute cases)</li>
        </ul>
        
        <h2>Diagnosis</h2>
        <p>Comprehensive eye exams can detect glaucoma early through:</p>
        <ul>
          <li>Tonometry (eye pressure measurement)</li>
          <li>Ophthalmoscopy (examining the optic nerve)</li>
          <li>Perimetry (visual field testing)</li>
          <li>Gonioscopy (examining the drainage angle)</li>
          <li>Pachymetry (measuring corneal thickness)</li>
        </ul>
        
        <h2>Treatment Options</h2>
        <h3>Medications</h3>
        <p>Eye drops are usually the first line of treatment, reducing eye pressure by either decreasing fluid production or improving drainage.</p>
        
        <h3>Laser Therapy</h3>
        <p>Laser trabeculoplasty can help improve drainage in open-angle glaucoma.</p>
        
        <h3>Surgery</h3>
        <p>Various surgical procedures can create new drainage channels or implant drainage devices.</p>
        
        <h2>Prevention and Early Detection</h2>
        <p>Since glaucoma often has no early symptoms, regular comprehensive eye exams are crucial. Early detection and treatment can prevent or slow vision loss. If you're at risk, your eye doctor may recommend more frequent exams.</p>
        
        <h2>Living with Glaucoma</h2>
        <p>With proper treatment, most people with glaucoma can maintain useful vision. Adherence to treatment and regular follow-up appointments are essential for managing the condition effectively.</p>
        
        <h2>Conclusion</h2>
        <p>Glaucoma is a serious eye condition, but early detection through regular eye exams can prevent vision loss. Don't wait for symptoms—schedule regular comprehensive eye examinations, especially if you have risk factors.</p>
      `,
      color: '#fa709a',
    },
  };

  const article = articles[slug] || articles['understanding-eye-health'];

  useEffect(() => {
    if (heroRef.current) {
      gsap.from(heroRef.current.children, {
        duration: 1,
        y: 30,
        opacity: 0,
        stagger: 0.2,
        ease: 'power3.out',
      });
    }

    if (contentRef.current) {
      gsap.from(contentRef.current.children, {
        scrollTrigger: {
          trigger: contentRef.current,
          start: 'top 80%',
        },
        duration: 0.8,
        y: 40,
        opacity: 0,
        stagger: 0.1,
        ease: 'power2.out',
      });
    }

    return () => {
      if (ScrollTrigger) {
        ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      }
    };
  }, [slug]);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#FAFAF8', position: 'relative' }}>
      <Navbar />
      
      {/* Hero Section */}
      <Box
        ref={heroRef}
        sx={{
          background: `linear-gradient(135deg, ${article.color} 0%, ${article.color}dd 100%)`,
          color: 'white',
          py: { xs: 6, md: 8 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/blog')}
            sx={{
              color: 'white',
              mb: 3,
              textTransform: 'none',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.1)',
              },
            }}
          >
            Back to Blog
          </Button>
          
          <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
            <Chip
              label={article.category}
              size="small"
              sx={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: 'white',
                fontWeight: 600,
              }}
            />
            <Chip
              icon={<TimeIcon sx={{ fontSize: '0.9rem !important', color: 'white' }} />}
              label={article.readTime}
              size="small"
              sx={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: 'white',
                fontWeight: 600,
              }}
            />
            <Chip
              icon={<CalendarIcon sx={{ fontSize: '0.9rem !important', color: 'white' }} />}
              label={article.date}
              size="small"
              sx={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: 'white',
                fontWeight: 600,
              }}
            />
          </Stack>

          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3.5rem' },
              fontWeight: 900,
              mb: 3,
              lineHeight: 1.2,
            }}
          >
            {article.title}
          </Typography>
        </Container>
      </Box>

      {/* Article Image */}
      <Box
        sx={{
          position: 'relative',
          height: { xs: 300, md: 500 },
          overflow: 'hidden',
        }}
      >
        <Box
          component="img"
          src={article.image}
          alt={article.title}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </Box>

      {/* Article Content */}
      <Box
        ref={contentRef}
        sx={{
          py: { xs: 6, md: 8 },
          bgcolor: '#FAFAF8',
        }}
      >
        <Container maxWidth="md">
          <Box
            sx={{
              bgcolor: 'white',
              p: { xs: 4, md: 6 },
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              '& h2': {
                fontSize: '1.75rem',
                fontWeight: 700,
                color: '#1C1C1C',
                mt: 4,
                mb: 2,
                '&:first-of-type': {
                  mt: 0,
                },
              },
              '& h3': {
                fontSize: '1.5rem',
                fontWeight: 600,
                color: '#1C1C1C',
                mt: 3,
                mb: 1.5,
              },
              '& p': {
                fontSize: '1rem',
                lineHeight: 1.8,
                color: '#4A4A4A',
                mb: 2,
              },
              '& ul': {
                mb: 2,
                pl: 3,
                '& li': {
                  fontSize: '1rem',
                  lineHeight: 1.8,
                  color: '#4A4A4A',
                  mb: 1,
                  '& strong': {
                    fontWeight: 600,
                    color: '#1C1C1C',
                  },
                },
              },
            }}
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </Container>
      </Box>

      <Footer />
    </Box>
  );
};

export default BlogArticle;

