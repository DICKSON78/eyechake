import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Grid,
  Card,
  CardContent,
  Stack,
  Button,
  TextField,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  HelpOutline as HelpIcon,
  CalendarToday as CalendarIcon,
  Payment as PaymentIcon,
  Visibility as VisionIcon,
  ContactSupport as SupportIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

gsap.registerPlugin(ScrollTrigger);

const FAQ = () => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const heroRef = useRef(null);
  const faqRef = useRef(null);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const categories = [
    { id: 'appointments', label: 'Appointments', color: '#1976d2' },
    { id: 'insurance', label: 'Insurance & Payment', color: '#00BCD4' },
    { id: 'services', label: 'Services', color: '#42a5f5' },
    { id: 'general', label: 'General', color: '#1565c0' },
  ];

  const faqs = [
    // Appointments
    {
      category: 'appointments',
      question: 'How do I schedule an appointment?',
      answer: 'You can schedule an appointment online 24/7 through our website, or call us during business hours. Our online booking system allows you to select your preferred date and time, and you\'ll receive instant confirmation via email or SMS.',
    },
    {
      category: 'appointments',
      question: 'How often should I have an eye exam?',
      answer: 'It is recommended that adults have a comprehensive eye exam every 1-2 years, depending on age, risk factors, and whether you currently wear corrective lenses. Children should have their first eye exam at 6 months, then at age 3, and before starting school. If you have diabetes, a family history of eye disease, or other risk factors, more frequent exams may be necessary.',
    },
    {
      category: 'appointments',
      question: 'What should I bring to my appointment?',
      answer: 'Please bring your insurance card, a list of current medications, any current eyeglasses or contact lenses, and a valid ID. If this is your first visit, please arrive 15 minutes early to complete registration forms. Also bring any previous eye exam records if you have them.',
    },
    {
      category: 'appointments',
      question: 'How long does an eye exam take?',
      answer: 'A comprehensive eye exam typically takes 45-60 minutes. This includes time for dilation if needed, which may cause temporary sensitivity to light and blurred vision. Please plan accordingly and consider having someone drive you home if dilation is performed.',
    },
    {
      category: 'appointments',
      question: 'Can I reschedule or cancel my appointment?',
      answer: 'Yes, you can reschedule or cancel your appointment online up to 24 hours before your scheduled time. For cancellations within 24 hours, please call our office. We appreciate advance notice to allow other patients to use that time slot.',
    },
    {
      category: 'appointments',
      question: 'Do you offer same-day appointments?',
      answer: 'Yes, we offer same-day appointments for urgent eye care needs, subject to availability. Please call our office or check our online booking system for same-day availability. Emergency cases are always prioritized.',
    },
    {
      category: 'appointments',
      question: 'What happens if I\'m late for my appointment?',
      answer: 'If you arrive late, we will do our best to accommodate you, but your appointment time may be shortened or you may need to reschedule. We recommend arriving 10-15 minutes early to ensure you have enough time for check-in and any necessary paperwork.',
    },
    {
      category: 'appointments',
      question: 'Do I need a referral to make an appointment?',
      answer: 'No referral is needed for most appointments. You can schedule directly with us. However, if your insurance plan requires a referral, please obtain one from your primary care physician before your visit.',
    },
    {
      category: 'appointments',
      question: 'Can I bring someone with me to my appointment?',
      answer: 'Yes, you are welcome to bring a family member or friend to your appointment. This can be especially helpful if you need assistance or if dilation is performed, as you may need help with transportation.',
    },
    // Insurance & Payment
    {
      category: 'insurance',
      question: 'Do you accept insurance?',
      answer: 'Yes, we accept most major insurance plans including Medicare, Medicaid, and many private insurance providers. Please call us now to verify if your specific insurance plan is accepted. We also offer flexible payment options for patients without insurance coverage.',
    },
    {
      category: 'insurance',
      question: 'What payment methods do you accept?',
      answer: 'We accept cash, credit cards (Visa, MasterCard, American Express), debit cards, and most insurance plans. We also offer payment plans for certain services. Please discuss payment options with our staff when scheduling your appointment.',
    },
    {
      category: 'insurance',
      question: 'Do you offer payment plans?',
      answer: 'Yes, we offer flexible payment plans for eligible patients. Payment plans are available for major procedures and services. Please speak with our billing department to discuss your options and determine if you qualify for a payment plan.',
    },
    {
      category: 'insurance',
      question: 'Will my insurance cover contact lenses?',
      answer: 'Coverage for contact lenses varies by insurance plan. Some plans cover contact lenses as an alternative to glasses, while others may have specific limitations. We recommend contacting your insurance provider directly or our office to verify your specific coverage before your appointment.',
    },
    {
      category: 'insurance',
      question: 'What if I don\'t have insurance?',
      answer: 'We offer competitive self-pay rates for patients without insurance. We also provide discounts for seniors, students, and military personnel. Please contact our office to discuss pricing and payment options that work for your budget.',
    },
    {
      category: 'insurance',
      question: 'Do you accept insurance for eye exams?',
      answer: 'Yes, most insurance plans cover routine eye exams. Coverage varies by plan, so we recommend verifying your benefits before your appointment. Our staff can help you understand your coverage and any out-of-pocket costs.',
    },
    {
      category: 'insurance',
      question: 'What is the cost of an eye exam without insurance?',
      answer: 'Our self-pay rates for comprehensive eye exams are competitive and transparent. Please contact our office for current pricing. We also offer package deals for families and discounts for seniors and students.',
    },
    // Services
    {
      category: 'services',
      question: 'What services do you provide?',
      answer: 'We provide comprehensive eye care services including comprehensive eye examinations, diagnosis and treatment of eye diseases, spectacles dispensing, contact lens fitting and dispensing, and community eye outreach programs. We also offer specialized services for conditions like glaucoma, cataracts, and diabetic retinopathy.',
    },
    {
      category: 'services',
      question: 'Can I get contact lenses on the same day?',
      answer: 'If you are a new contact lens wearer, you will need a contact lens fitting appointment in addition to your eye exam. For existing contact lens wearers, we can often provide trial lenses on the same day. However, some specialty lenses may require ordering and will be available within 1-2 weeks.',
    },
    {
      category: 'services',
      question: 'Do you offer emergency eye care?',
      answer: 'Yes, we provide emergency eye care services. If you experience sudden vision loss, eye injury, severe eye pain, flashes of light, or a sudden increase in floaters, please call us immediately. For after-hours emergencies, please visit the nearest emergency room or call our emergency line.',
    },
    {
      category: 'services',
      question: 'Do you perform eye surgeries?',
      answer: 'We provide comprehensive eye examinations and can diagnose conditions that may require surgery. For surgical procedures, we work closely with qualified ophthalmologists and can provide referrals to trusted surgical specialists when needed.',
    },
    {
      category: 'services',
      question: 'What types of contact lenses do you offer?',
      answer: 'We offer a wide variety of contact lenses including daily disposables, bi-weekly, monthly, and extended wear lenses. We also provide specialty lenses for astigmatism, presbyopia, and dry eyes. Our optometrists will help you find the best option for your lifestyle and vision needs.',
    },
    {
      category: 'services',
      question: 'Do you offer pediatric eye care?',
      answer: 'Yes, we provide comprehensive eye care for children of all ages. Our team is experienced in working with children and uses child-friendly equipment and techniques. We recommend children have their first eye exam at 6 months, then at age 3, and before starting school.',
    },
    {
      category: 'services',
      question: 'Can you help with digital eye strain?',
      answer: 'Absolutely! We provide comprehensive evaluations for digital eye strain and can recommend specialized lenses, eye exercises, and lifestyle modifications to help reduce symptoms. We also offer blue light filtering options for glasses and contact lenses.',
    },
    {
      category: 'services',
      question: 'Do you offer vision therapy?',
      answer: 'Yes, we offer vision therapy services for patients with vision problems that cannot be corrected with glasses or contact lenses alone. This includes treatment for lazy eye, eye tracking problems, and convergence insufficiency.',
    },
    {
      category: 'services',
      question: 'What types of frames do you carry?',
      answer: 'We carry a wide selection of designer frames including popular brands and styles. Our optical shop features frames for all ages, face shapes, and lifestyles. Our staff can help you find the perfect frame that fits your face and personal style.',
    },
    {
      category: 'services',
      question: 'Do you offer lens coatings and treatments?',
      answer: 'Yes, we offer various lens coatings including anti-reflective coating, scratch-resistant coating, UV protection, and blue light filtering. We can customize your lenses based on your lifestyle and vision needs.',
    },
    // General
    {
      category: 'general',
      question: 'What are your office hours?',
      answer: 'Our office hours are Monday through Friday from 8:30 AM to 8:00 PM, Saturday from 9:30 AM to 7:00 PM, and Sunday from 9:30 AM to 3:30 PM. We also offer extended hours by appointment. Please check our website or call for the most current hours.',
    },
    {
      category: 'general',
      question: 'Where are you located?',
      answer: 'We are located at Gerezani - Kamata traffic light near traffic post, Dar es Salaam, Tanzania. You can find us on Google Maps by searching "SIKAF Eye Care". We have convenient parking available for our patients.',
    },
    {
      category: 'general',
      question: 'How do I contact you?',
      answer: 'You can reach us by phone at +255 676 506 323, via WhatsApp at +255 676 506 323, or email us at info@sikafeyecare.co.tz. You can also visit our website to schedule appointments online or send us a message through our contact form.',
    },
    {
      category: 'general',
      question: 'Do you have parking available?',
      answer: 'Yes, we have convenient parking available for our patients. The parking area is located near the clinic entrance. If you have any mobility concerns, please let us know when scheduling your appointment so we can assist you.',
    },
    {
      category: 'general',
      question: 'What safety measures do you have in place?',
      answer: 'We follow all recommended health and safety protocols including regular sanitization, social distancing measures, and the use of personal protective equipment. Please inform us if you have any specific health concerns.',
    },
    {
      category: 'general',
      question: 'Can I order glasses or contacts online?',
      answer: 'While we recommend in-person fittings for the best results, we do offer online ordering for contact lens refills for existing patients. For new prescriptions or glasses, we recommend visiting our office to ensure proper fitting and optimal vision correction.',
    },
    {
      category: 'general',
      question: 'What should I expect during my first visit?',
      answer: 'During your first visit, you\'ll complete registration forms, have a comprehensive eye examination, and discuss your vision needs with our optometrist. The exam typically includes vision testing, eye health evaluation, and if needed, dilation. Plan for about 60-90 minutes for your first visit.',
    },
    {
      category: 'general',
      question: 'What languages do you speak?',
      answer: 'Our staff speaks English and Swahili fluently. We can accommodate patients in both languages to ensure clear communication and understanding of your eye care needs.',
    },
    {
      category: 'general',
      question: 'Do you have wheelchair accessibility?',
      answer: 'Yes, our clinic is fully wheelchair accessible with ramps and wide doorways. We also have accessible restrooms and exam rooms. Please let us know if you need any special accommodations when scheduling your appointment.',
    },
  ];

  // Show all FAQs
  const filteredFaqs = faqs;

  useEffect(() => {
    // Hero section animation - only animate position, keep opacity at 1
    if (heroRef.current) {
      const heroElements = heroRef.current.children;
      gsap.set(heroElements, { opacity: 1 });
      gsap.from(heroElements, {
        duration: 1.2,
        y: 60,
        stagger: 0.2,
        ease: 'power3.out',
      });
    }

    // FAQ items animation - only animate position, keep opacity at 1
    if (faqRef.current) {
      const faqElements = faqRef.current.children;
      gsap.set(faqElements, { opacity: 1 });
      gsap.from(faqElements, {
        scrollTrigger: {
          trigger: faqRef.current,
          start: 'top 80%',
        },
        duration: 0.6,
        y: 20,
        stagger: 0.05,
        ease: 'power2.out',
      });
    }

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa', pt: { xs: '56px', sm: '64px' } }}>
      <Navbar />
      
      {/* Hero Section - White Background with Descriptions */}
      <Box
        ref={heroRef}
        sx={{
          bgcolor: 'white',
          color: '#212529',
          py: { xs: 5, md: 6 },
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4rem' },
                fontWeight: 800,
                mb: 3,
                color: '#1C1C1C !important',
              }}
            >
              Frequently Asked Questions
            </Typography>
            <Typography
              variant="h5"
              sx={{
                fontSize: { xs: '1.1rem', md: '1.3rem' },
                mb: 3,
                color: '#4A4A4A !important',
                lineHeight: 1.8,
                maxWidth: 900,
                mx: 'auto',
              }}
            >
              Find answers to common questions about our services and eye care
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontSize: { xs: '1rem', md: '1.1rem' },
                color: '#4A4A4A !important',
                lineHeight: 1.8,
                maxWidth: 800,
                mx: 'auto',
              }}
            >
              We understand that you may have questions about our eye care services, appointments, insurance coverage, and more. Below, you'll find comprehensive answers to the most frequently asked questions from our patients. Whether you're curious about booking an appointment, understanding our services, or learning about payment options, we've compiled detailed information to help you make informed decisions about your eye care needs.
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* FAQ Section */}
      <Box ref={faqRef} sx={{ py: { xs: 4, md: 6 }, bgcolor: '#f8f9fa' }}>
        <Container maxWidth="lg">
          {filteredFaqs.length > 0 ? (
            <>
              {filteredFaqs.map((faq, index) => {
                const categoryColor = categories.find(c => c.id === faq.category)?.color || '#667eea';
                return (
                  <Accordion
                    key={index}
                    expanded={expanded === `panel${index}`}
                    onChange={handleChange(`panel${index}`)}
                    sx={{
                      mb: 2,
                      borderRadius: '12px',
                      border: '1px solid #e0e0e0',
                      bgcolor: 'white',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                      transition: 'all 0.3s ease',
                      '&:before': {
                        display: 'none',
                      },
                      '&:hover': {
                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                        borderColor: categoryColor,
                      },
                      '&.Mui-expanded': {
                        borderColor: categoryColor,
                        boxShadow: `0 4px 20px ${categoryColor}30`,
                      },
                    }}
                  >
                    <AccordionSummary
                      expandIcon={
                        <ExpandMoreIcon 
                          sx={{ 
                            color: categoryColor,
                            fontSize: '1.5rem',
                          }} 
                        />
                      }
                      sx={{
                        px: { xs: 2, md: 3 },
                        py: 2,
                        '&:hover': {
                          backgroundColor: `${categoryColor}08`,
                        },
                        '&.Mui-expanded': {
                          backgroundColor: `${categoryColor}10`,
                        },
                      }}
                    >
                      <Stack direction="row" spacing={2} sx={{ width: '100%', alignItems: 'center' }}>
                        <Chip
                          label={categories.find(c => c.id === faq.category)?.label}
                          size="small"
                          sx={{
                            bgcolor: `${categoryColor}15`,
                            color: categoryColor,
                            fontWeight: 600,
                            fontSize: '0.7rem',
                            height: 24,
                          }}
                        />
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: 600,
                            fontSize: { xs: '1rem', md: '1.1rem' },
                            color: '#1C1C1C !important',
                            flex: 1,
                          }}
                        >
                          {faq.question}
                        </Typography>
                      </Stack>
                    </AccordionSummary>
                    <AccordionDetails sx={{ px: { xs: 2, md: 3 }, pb: 3 }}>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          lineHeight: 1.8,
                          color: '#4A4A4A !important',
                          fontSize: { xs: '0.95rem', md: '1rem' },
                        }}
                      >
                        {faq.answer}
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                );
              })}
            </>
          ) : (
            <Card
              sx={{
                p: 4,
                textAlign: 'center',
                bgcolor: 'white',
                border: '1px solid #e0e0e0',
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              }}
            >
              <Typography variant="h6" sx={{ color: '#1A4A6B !important', mb: 1 }}>
                No questions found
              </Typography>
              <Typography variant="body2" sx={{ color: '#555 !important' }}>
                Please call us now if you need assistance
              </Typography>
            </Card>
          )}
        </Container>
      </Box>

      {/* Contact CTA Section */}
      <Box
        sx={{
          py: { xs: 4, md: 6 },
          bgcolor: 'white',
        }}
      >
        <Container maxWidth="lg">
          <Card
            sx={{
              borderRadius: '16px',
              boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
              border: '1px solid #e0e0e0',
              bgcolor: 'white',
              p: { xs: 3, md: 5 },
              textAlign: 'center',
            }}
          >
            <Typography
              variant="h3"
              sx={{
                fontSize: { xs: '1.5rem', md: '2rem' },
                fontWeight: 800,
                mb: 2,
                color: '#1A4A6B',
              }}
            >
              Still Have Questions?
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontSize: '1rem',
                mb: 4,
                color: '#555',
                maxWidth: 600,
                mx: 'auto',
                lineHeight: 1.8,
              }}
            >
              Can't find the answer you're looking for? Our team is here to help. 
              Call us now and we'll respond as soon as possible.
            </Typography>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Card
                  sx={{
                    p: 2,
                    textAlign: 'center',
                    bgcolor: '#f8f9fa',
                    border: '1px solid #e0e0e0',
                    borderRadius: '12px',
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
                    },
                  }}
                >
                  <PhoneIcon sx={{ fontSize: 32, color: '#667eea', mb: 1 }} />
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#333', mb: 0.5 }}>
                    Phone
                  </Typography>
                  <Typography 
                    variant="body2" 
                    component="a"
                    href="tel:+255676506323"
                    sx={{ 
                      color: '#667eea', 
                      textDecoration: 'none',
                      '&:hover': { textDecoration: 'underline' },
                    }}
                  >
                    +255 676 506 323
                  </Typography>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Card
                  sx={{
                    p: 2,
                    textAlign: 'center',
                    bgcolor: '#f8f9fa',
                    border: '1px solid #e0e0e0',
                    borderRadius: '12px',
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
                    },
                  }}
                >
                  <EmailIcon sx={{ fontSize: 32, color: '#667eea', mb: 1 }} />
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#333', mb: 0.5 }}>
                    Email
                  </Typography>
                  <Typography 
                    variant="body2" 
                    component="a"
                    href="mailto:info@sikafeyecare.co.tz"
                    sx={{ 
                      color: '#667eea', 
                      textDecoration: 'none',
                      fontSize: '0.85rem',
                      '&:hover': { textDecoration: 'underline' },
                    }}
                  >
                    info@sikafeyecare.co.tz
                  </Typography>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Card
                  sx={{
                    p: 2,
                    textAlign: 'center',
                    bgcolor: '#f8f9fa',
                    border: '1px solid #e0e0e0',
                    borderRadius: '12px',
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
                    },
                  }}
                >
                  <LocationIcon sx={{ fontSize: 32, color: '#667eea', mb: 1 }} />
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#333', mb: 0.5 }}>
                    Location
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#555', 
                      fontSize: '0.85rem',
                    }}
                  >
                    Gerezani - Kamata
                  </Typography>
                </Card>
              </Grid>
            </Grid>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              sx={{ justifyContent: 'center', maxWidth: 500, mx: 'auto' }}
            >
              <Button
                variant="contained"
                endIcon={<ArrowForwardIcon />}
                onClick={() => navigate('/contact')}
                sx={{
                  bgcolor: '#667eea',
                  color: 'white',
                  fontWeight: 700,
                  px: 4,
                  py: 1.5,
                  borderRadius: '8px',
                  textTransform: 'none',
                  '&:hover': {
                    bgcolor: '#5568d3',
                  },
                }}
              >
                Call us now
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/appointment')}
                sx={{
                  borderColor: '#667eea',
                  color: '#667eea',
                  fontWeight: 700,
                  px: 4,
                  py: 1.5,
                  borderRadius: '8px',
                  textTransform: 'none',
                  borderWidth: 2,
                  '&:hover': {
                    borderWidth: 2,
                    bgcolor: '#667eea',
                    color: 'white',
                  },
                }}
              >
                Book Appointment
              </Button>
            </Stack>
          </Card>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
};

export default FAQ;
