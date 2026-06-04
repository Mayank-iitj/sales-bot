import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Rocket, Bot, TrendingUp, Brain, Zap, RefreshCw, BarChart3, Link2, Shield 
} from 'lucide-react';
import '../landing.css';

const iconMap = {
  Rocket,
  Bot,
  TrendingUp,
  Brain,
  Zap,
  RefreshCw,
  BarChart3,
  Link2,
  Shield,
};

/* ─── Intersection Observer hook for scroll animations ─── */
function useInView(options = {}) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.unobserve(el); } },
      { threshold: 0.15, ...options }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return [ref, isVisible];
}

function FadeIn({ children, className = '', stagger = false, ...props }) {
  const [ref, visible] = useInView();
  const cls = stagger ? 'lp-stagger' : 'lp-fade-in';
  return (
    <div ref={ref} className={`${cls} ${visible ? 'visible' : ''} ${className}`} {...props}>
      {children}
    </div>
  );
}

/* ─── Logo marquee data ─── */
const logoNames = [
  '◆ Stripe', '◈ Notion', '✦ Linear', '◉ Vercel', '⬡ Figma',
  '◆ Slack', '◈ Shopify', '✦ Webflow', '◉ Datadog', '⬡ Amplitude',
  '◆ HubSpot', '◈ Zendesk',
];

/* ─── Process steps ─── */
const processSteps = [
  { iconName: 'Rocket', number: 'Step 01', title: 'Subscribe', desc: 'Choose the plan that suits your team. Get instant access to VelocityHQ\'s full AI-powered CRM suite.' },
  { iconName: 'Bot', number: 'Step 02', title: 'Connect', desc: 'Set up your pipeline, import your leads, and let our AI start scoring and prioritizing deals automatically.' },
  { iconName: 'TrendingUp', number: 'Step 03', title: 'Close deals', desc: 'Watch your close rates soar with AI insights, automated follow-ups, and real-time pipeline intelligence.' },
];

/* ─── Feature cards ─── */
const features = [
  { iconName: 'Brain', title: 'AI Deal Scoring', desc: '94% accurate predictions. Know which deals to prioritize before your competitors do.' },
  { iconName: 'Zap', title: 'Lightning Fast', desc: 'Real-time pipeline updates. No more stale CRM data slowing down your team.' },
  { iconName: 'RefreshCw', title: 'Pause Anytime', desc: 'Flexible plans that scale with you. Pause or cancel with zero friction.' },
  { iconName: 'BarChart3', title: 'Revenue Intelligence', desc: 'Deep analytics and forecasting that turns your pipeline into a predictable revenue machine.' },
  { iconName: 'Link2', title: 'Integrations', desc: 'Salesforce, Slack, HubSpot, and 50+ more. Works where your team already lives.' },
  { iconName: 'Shield', title: 'Enterprise Security', desc: 'SOC 2, GDPR, SSO, and role-based access. Your data is locked down tight.' },
];

/* ─── Pricing ─── */
const plans = [
  {
    name: 'Starter',
    desc: 'For small teams getting started with AI-powered sales.',
    price: '$49',
    period: '/month',
    features: ['5 team seats', '500 contacts', 'Basic pipeline', 'Email sequences', 'Slack integration', 'Standard support'],
    featured: false,
  },
  {
    name: 'Pro',
    desc: 'Our most popular plan. Built for scaling revenue teams.',
    price: '$149',
    period: '/month',
    features: ['25 team seats', 'Unlimited contacts', 'AI deal scoring', 'Pipeline forecasting', 'All integrations', 'Priority support'],
    featured: true,
  },
  {
    name: 'Enterprise',
    desc: 'For large organizations needing custom solutions.',
    price: 'Custom',
    period: '',
    features: ['Unlimited seats', 'Dedicated CSM', 'Custom AI models', 'Advanced analytics', 'SSO & SAML', 'SLA guarantee'],
    featured: false,
  },
];

/* ─── FAQ ─── */
const faqs = [
  { q: 'How does the AI deal scoring work?', a: 'Our AI analyzes 50+ signals per deal — including email engagement, meeting frequency, stakeholder involvement, and historical patterns — to predict close probability with 94% accuracy. It continuously learns from your team\'s wins and losses.' },
  { q: 'Can I migrate from Salesforce or HubSpot?', a: 'Absolutely. We offer white-glove migration from all major CRMs. Most teams are fully migrated within 48 hours with zero data loss. We also support running VelocityHQ alongside your existing CRM during transition.' },
  { q: 'What happens if I need to pause my subscription?', a: 'You can pause anytime directly from your dashboard. Your data, configurations, and AI models are preserved. When you\'re ready to resume, everything picks up right where you left off — no setup required.' },
  { q: 'Is there a free trial available?', a: 'Yes! We offer a 14-day free trial of our Pro plan with full access to all features including AI deal scoring, pipeline forecasting, and all integrations. No credit card required to start.' },
  { q: 'How is VelocityHQ different from other CRMs?', a: 'While traditional CRMs are glorified databases, VelocityHQ is an AI-native revenue intelligence platform. Our AI doesn\'t just store data — it actively helps your team prioritize, forecast, and close deals faster. Teams see a 40% reduction in deal cycle time on average.' },
];

/* ─── Testimonials ─── */
const testimonials = [
  { name: 'Sarah Chen', role: 'VP of Sales, TechCorp', text: 'VelocityHQ transformed our sales process. The AI deal scoring alone paid for itself in the first month — we closed 40% more deals in Q1.', stars: 5 },
  { name: 'Marcus Rivera', role: 'CRO, ScaleUp Inc', text: 'We switched from Salesforce and never looked back. The pipeline intelligence is years ahead of anything else on the market.', stars: 5 },
];

/* ════════════════════════════════
   LANDING PAGE COMPONENT
   ════════════════════════════════ */
export default function LandingPage({ onEnterApp }) {
  const [openFaq, setOpenFaq] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const isAnimating = useRef(false);
  const touchStartY = useRef(0);

  const totalSlides = 9;
  const slideLabels = [
    'Hero',
    'Mockup',
    'Social Proof',
    'Process',
    'Features',
    'AI-Native',
    'Pricing',
    'FAQ',
    'Get Started'
  ];

  // Screen size listener
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Standard scroll listener (only active on mobile view)
  useEffect(() => {
    if (!isMobile) return;
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobile]);

  const containerRef = useRef(null);

  // Wheel and swipe interaction interceptors (non-passive)
  useEffect(() => {
    if (isMobile) return;
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e) => {
      e.preventDefault();
      if (isAnimating.current) return;

      const delta = e.deltaY;
      if (Math.abs(delta) < 30) return;

      isAnimating.current = true;
      if (delta > 0) {
        setCurrentIndex((prev) => (prev + 1) % totalSlides);
      } else {
        setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
      }

      setTimeout(() => {
        isAnimating.current = false;
      }, 1200);
    };

    const handleTouchStart = (e) => {
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e) => {
      if (isAnimating.current) return;
      const touchEndY = e.touches[0].clientY;
      const diffY = touchStartY.current - touchEndY;

      if (Math.abs(diffY) > 50) {
        e.preventDefault();
        isAnimating.current = true;
        if (diffY > 0) {
          setCurrentIndex((prev) => (prev + 1) % totalSlides);
        } else {
          setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
        }
        setTimeout(() => {
          isAnimating.current = false;
        }, 1200);
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isMobile, totalSlides]);

  // Keyboard navigation arrow keys listener
  useEffect(() => {
    if (isMobile) return;
    const handleKeyDown = (e) => {
      if (isAnimating.current) return;
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || (e.key === ' ' && !e.shiftKey)) {
        e.preventDefault();
        isAnimating.current = true;
        setCurrentIndex((prev) => (prev + 1) % totalSlides);
        setTimeout(() => {
          isAnimating.current = false;
        }, 1200);
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp' || (e.key === ' ' && e.shiftKey)) {
        e.preventDefault();
        isAnimating.current = true;
        setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
        setTimeout(() => {
          isAnimating.current = false;
        }, 1200);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobile, totalSlides]);

  return (
    <div 
      ref={containerRef}
      className={`landing-page ${isMobile ? 'mobile-flow' : ''}`}
    >
      {/* ─── Navigation ─── */}
      <nav className="lp-nav" style={{ boxShadow: (scrolled || currentIndex > 0) ? '0 8px 32px rgba(0,0,0,0.4)' : 'none' }}>
        <div className="lp-nav-logo">
          Velocity<span>HQ</span>
        </div>
        <ul className="lp-nav-links">
          <li><a href="#features" onClick={(e) => { e.preventDefault(); if (!isMobile) setCurrentIndex(4); else document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); }}>Features</a></li>
          <li><a href="#process" onClick={(e) => { e.preventDefault(); if (!isMobile) setCurrentIndex(3); else document.getElementById('process')?.scrollIntoView({ behavior: 'smooth' }); }}>Process</a></li>
          <li><a href="#pricing" onClick={(e) => { e.preventDefault(); if (!isMobile) setCurrentIndex(6); else document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }); }}>Pricing</a></li>
          <li><a href="#faq" onClick={(e) => { e.preventDefault(); if (!isMobile) setCurrentIndex(7); else document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' }); }}>FAQ</a></li>
        </ul>
        <button className="lp-nav-cta" onClick={onEnterApp}>Launch App →</button>
      </nav>

      {/* Slide dots indicator on the right edge */}
      {!isMobile && (
        <div className="lp-scroll-dots">
          {Array.from({ length: totalSlides }).map((_, idx) => (
            <div
              key={idx}
              className={`lp-scroll-dot ${currentIndex === idx ? 'active' : ''}`}
              onClick={() => setCurrentIndex(idx)}
            >
              <div className="lp-scroll-dot-tooltip">{slideLabels[idx]}</div>
            </div>
          ))}
        </div>
      )}

      {/* Main container with transition */}
      <div 
        className={isMobile ? 'landing-page-mobile-wrapper' : 'landing-page-inner'}
        style={isMobile ? {} : { transform: `translateY(-${currentIndex * 100}vh)` }}
      >
        {/* Slide 1: Hero */}
        <section id="hero" className={`lp-hero ${isMobile ? '' : 'lp-slide'}`}>
          <div className="lp-badge">
            <span className="dot" />
            Trusted by 2,400+ revenue teams
          </div>
          <h1 className="lp-heading-xl">
            The AI-powered CRM<br />that <em>closes deals.</em>
          </h1>
          <p className="lp-subtext">
            Say goodbye to stale pipelines and guesswork. VelocityHQ combines AI deal scoring, 
            revenue intelligence, and automation to help your team close 40% faster.
          </p>
          <div className="lp-hero-buttons">
            <button className="lp-btn-primary" onClick={onEnterApp}>
              Start free trial
            </button>
            <a href="#pricing" className="lp-btn-secondary" onClick={(e) => { e.preventDefault(); if (!isMobile) setCurrentIndex(6); else document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }); }}>
              See plans
            </a>
          </div>
        </section>

        {/* Slide 2: Hero Visual Banner */}
        <div id="visual" className={`lp-hero-visual ${isMobile ? '' : 'lp-slide'}`}>
          <div className="lp-hero-banner">
            <div className="shape shape-1" />
            <div className="shape shape-2" />
            <div className="shape shape-3" />
            <div className="lp-hero-banner-inner">
              <div className="lp-hero-banner-text">VelocityHQ</div>
            </div>
          </div>
        </div>

        {/* Slide 3: Social Proof (Logo Marquee & Testimonial) */}
        <section id="social" className={`lp-social-proof ${isMobile ? '' : 'lp-slide'}`}>
          <div className="lp-logos-section" style={{ width: '100%', padding: isMobile ? '80px 20px' : '0' }}>
            <span className="lp-logos-label">Trusted by teams at leading companies</span>
            <div className="lp-logos-track">
              <div className="lp-logos-scroll">
                {[...logoNames, ...logoNames].map((name, i) => (
                  <span key={i}>{name}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="lp-testimonials" style={{ width: '100%', padding: isMobile ? '64px 20px' : '0', marginTop: isMobile ? '0' : '24px' }}>
            <FadeIn>
              <div className="lp-testimonial-card">
                <div className="lp-testimonial-content">
                  <div className="lp-testimonial-stars">
                    {Array.from({ length: testimonials[0].stars }).map((_, i) => (
                      <span key={i}>★</span>
                    ))}
                  </div>
                  <p className="lp-testimonial-text">
                    "{testimonials[0].text}"
                  </p>
                  <div className="lp-testimonial-author">
                    <span className="lp-testimonial-name">{testimonials[0].name}</span>
                    <span className="lp-testimonial-role">{testimonials[0].role}</span>
                  </div>
                </div>
                <div className="lp-testimonial-avatar">
                  <div className="lp-testimonial-avatar-initials">SC</div>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* Slide 4: Process Section */}
        <section id="process" className={`lp-process ${isMobile ? '' : 'lp-slide'}`}>
          <div className="lp-process-inner">
            <FadeIn>
              <div className="lp-section-header">
                <span className="lp-badge">Process</span>
                <h2 className="lp-heading-lg">
                  Your revenue engine, <em>effortlessly.</em>
                </h2>
                <p className="lp-subtext">
                  Get started in three simple steps. No migration headaches.
                </p>
              </div>
            </FadeIn>
            <FadeIn stagger className="lp-process-grid">
              {processSteps.map((step) => {
                const IconComponent = iconMap[step.iconName];
                return (
                  <div className="lp-process-step" key={step.number}>
                    <div className="lp-process-icon">
                      {IconComponent && <IconComponent size={28} style={{ color: 'var(--lp-accent)' }} />}
                    </div>
                    <span className="lp-process-number">{step.number}</span>
                    <h3 className="lp-heading-md">{step.title}</h3>
                    <p className="lp-subtext-sm">{step.desc}</p>
                  </div>
                );
              })}
            </FadeIn>
          </div>
        </section>

        {/* Slide 5: Features Grid */}
        <section id="features" className={`lp-features ${isMobile ? '' : 'lp-slide'}`}>
          <div className="lp-features-inner">
            <FadeIn>
              <div className="lp-section-header">
                <span className="lp-badge">Features</span>
                <h2 className="lp-heading-lg">
                  Everything you need to <em>dominate.</em>
                </h2>
                <p className="lp-subtext">
                  Built for modern revenue teams who refuse to settle for less.
                </p>
              </div>
            </FadeIn>
            <FadeIn stagger className="lp-features-grid">
              {features.map((f) => {
                const IconComponent = iconMap[f.iconName];
                return (
                  <div className="lp-feature-card" key={f.title}>
                    <div className="lp-feature-icon">
                      {IconComponent && <IconComponent size={26} style={{ color: 'var(--lp-accent)' }} />}
                    </div>
                    <h3 className="lp-heading-md">{f.title}</h3>
                    <p className="lp-subtext-sm">{f.desc}</p>
                  </div>
                );
              })}
            </FadeIn>
          </div>
        </section>

        {/* Slide 6: Benefit Cards */}
        <section id="benefits" className={`lp-benefits ${isMobile ? '' : 'lp-slide'}`}>
          <FadeIn>
            <div className="lp-benefit-card">
              <div className="lp-benefit-content">
                <span className="lp-benefit-label">✦ AI-Native</span>
                <h3 className="lp-heading-lg" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)' }}>
                  AI that actually <em>works.</em>
                </h3>
                <p className="lp-subtext-sm">
                  Our deal scoring engine analyzes 50+ signals per opportunity — email engagement, 
                  meeting patterns, stakeholder depth, and historical wins — to predict close probability with 94% accuracy.
                </p>
                <button className="lp-btn-primary" style={{ width: 'fit-content' }} onClick={onEnterApp}>
                  See it in action →
                </button>
              </div>
              <div className="lp-benefit-visual">
                <div className="lp-benefit-visual-inner">
                  <Brain size={64} style={{ color: 'var(--lp-accent)' }} />
                </div>
              </div>
            </div>
          </FadeIn>
          <FadeIn>
            <div className="lp-testimonial-card" style={{ marginTop: 0 }}>
              <div className="lp-testimonial-content">
                <div className="lp-testimonial-stars">
                  {Array.from({ length: testimonials[1].stars }).map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                </div>
                <p className="lp-testimonial-text">
                  "{testimonials[1].text}"
                </p>
                <div className="lp-testimonial-author">
                  <span className="lp-testimonial-name">{testimonials[1].name}</span>
                  <span className="lp-testimonial-role">{testimonials[1].role}</span>
                </div>
              </div>
              <div className="lp-testimonial-avatar">
                <div className="lp-testimonial-avatar-initials">MR</div>
              </div>
            </div>
          </FadeIn>
        </section>

        {/* Slide 7: Pricing */}
        <section id="pricing" className={`lp-pricing ${isMobile ? '' : 'lp-slide'}`}>
          <div className="lp-pricing-inner">
            <FadeIn>
              <div className="lp-section-header">
                <span className="lp-badge">Pricing</span>
                <h2 className="lp-heading-lg">
                  Pricing that's so <em>simple.</em>
                </h2>
                <p className="lp-subtext">
                  No hidden fees, no contracts. Start free and scale when you're ready.
                </p>
              </div>
            </FadeIn>
            <FadeIn stagger className="lp-pricing-cards">
              {plans.map((plan) => (
                <div className={`lp-price-card ${plan.featured ? 'featured' : ''}`} key={plan.name}>
                  {plan.featured && (
                    <span className="lp-badge" style={{ alignSelf: 'flex-start', fontSize: '0.7rem', padding: '4px 12px' }}>
                      <span className="dot" /> Most Popular
                    </span>
                  )}
                  <div className="lp-price-card-header">
                    <span className="lp-price-card-name">{plan.name}</span>
                    <span className="lp-price-card-desc">{plan.desc}</span>
                  </div>
                  <div className="lp-price-amount">
                    <span className="amount">{plan.price}</span>
                    <span className="period">{plan.period}</span>
                  </div>
                  <ul className="lp-price-features">
                    {plan.features.map((f) => (
                      <li key={f}><span className="check">✦</span> {f}</li>
                    ))}
                  </ul>
                  <button
                    className={plan.featured ? 'lp-btn-primary lp-price-btn' : 'lp-btn-secondary lp-price-btn'}
                    onClick={onEnterApp}
                  >
                    {plan.name === 'Enterprise' ? 'Contact sales' : 'Start free trial'}
                  </button>
                </div>
              ))}
            </FadeIn>
          </div>
        </section>

        {/* Slide 8: FAQ */}
        <section id="faq" className={`lp-faq ${isMobile ? '' : 'lp-slide'}`}>
          <div className="lp-faq-inner">
            <FadeIn>
              <div className="lp-section-header">
                <span className="lp-badge">FAQ</span>
                <h2 className="lp-heading-lg">
                  Questions? <em>Answered.</em>
                </h2>
              </div>
            </FadeIn>
            <div className="lp-faq-list">
              {faqs.map((faq, i) => (
                <div
                  className={`lp-faq-item ${openFaq === i ? 'open' : ''}`}
                  key={i}
                >
                  <button
                    className="lp-faq-question"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  >
                    {faq.q}
                    <span className="lp-faq-icon">+</span>
                  </button>
                  <div className="lp-faq-answer">
                    <p>{faq.a}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Slide 9: Final CTA & Footer combined */}
        <section id="footer" className={`lp-footer-slide ${isMobile ? '' : 'lp-slide'}`}>
          <div className="lp-cta" style={{ width: '100%', padding: 0 }}>
            <div className="lp-cta-inner">
              <span className="lp-badge">
                <span className="dot" /> Limited spots available
              </span>
              <h2 className="lp-heading-lg" style={isMobile ? {} : { fontSize: '2.5rem' }}>
                Ready to close deals <em>faster?</em>
              </h2>
              <p className="lp-subtext" style={{ textAlign: 'center', margin: '0 auto', fontSize: isMobile ? '1.125rem' : '0.95rem' }}>
                Join 2,400+ revenue teams using VelocityHQ to crush their quotas. 
                Start your free 14-day trial today.
              </p>
              <div className="lp-hero-buttons">
                <button className="lp-btn-primary" onClick={onEnterApp}>
                  Start free trial →
                </button>
                <a href="#pricing" className="lp-btn-secondary" onClick={(e) => { e.preventDefault(); if (!isMobile) setCurrentIndex(6); else document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }); }}>
                  See plans
                </a>
              </div>
            </div>
          </div>

          <footer className="lp-footer" style={{ width: '100%', padding: isMobile ? '64px 20px' : '24px 0 0' }}>
            <div className="lp-footer-inner">
              <div className="lp-footer-brand">
                <div className="lp-footer-logo">Velocity<span>HQ</span></div>
                <p className="lp-footer-tagline">
                  The AI-powered CRM that helps modern revenue teams close deals faster, 
                  forecast accurately, and scale confidently.
                </p>
              </div>
              <div className="lp-footer-cols">
                <div className="lp-footer-col">
                  <h4>Product</h4>
                  <ul>
                    <li><a href="#features" onClick={(e) => { e.preventDefault(); if (!isMobile) setCurrentIndex(4); else document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); }}>Features</a></li>
                    <li><a href="#pricing" onClick={(e) => { e.preventDefault(); if (!isMobile) setCurrentIndex(6); else document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }); }}>Pricing</a></li>
                    <li><a href="#process" onClick={(e) => { e.preventDefault(); if (!isMobile) setCurrentIndex(3); else document.getElementById('process')?.scrollIntoView({ behavior: 'smooth' }); }}>How it works</a></li>
                    <li><a href="#faq" onClick={(e) => { e.preventDefault(); if (!isMobile) setCurrentIndex(7); else document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' }); }}>FAQ</a></li>
                  </ul>
                </div>
                <div className="lp-footer-col">
                  <h4>Company</h4>
                  <ul>
                    <li><a href="#">About</a></li>
                    <li><a href="#">Blog</a></li>
                    <li><a href="#">Careers</a></li>
                    <li><a href="#">Contact</a></li>
                  </ul>
                </div>
                <div className="lp-footer-col">
                  <h4>Legal</h4>
                  <ul>
                    <li><a href="#">Privacy</a></li>
                    <li><a href="#">Terms</a></li>
                    <li><a href="#">Security</a></li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="lp-footer-bottom">
              <span>© 2026 VelocityHQ. All rights reserved.</span>
              <div style={{ display: 'flex', gap: 16 }}>
                <a href="#">Twitter</a>
                <a href="#">LinkedIn</a>
                <a href="#">GitHub</a>
              </div>
            </div>
          </footer>
        </section>
      </div>
    </div>
  );
}

