import React, { useState, useEffect, useRef } from 'react';
import BlurText from './BlurText';
import CountUp from './CountUp';
import DarkVeil from './DarkVeil';
import GradientText from './GradientText';
import Loading from './Loading';
import '../styles.css';

const handleAnimationComplete = () => {
  console.log('Animation completed!');
};

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [navOpen, setNavOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const headerRef = useRef(null);
  const navRef = useRef(null);
  const navToggleRef = useRef(null);

  // Navigation toggle
  const toggleNav = () => {
    setNavOpen(prev => {
      const newState = !prev;
      document.body.style.overflow = newState ? 'hidden' : '';
      if (navToggleRef.current) {
        navToggleRef.current.setAttribute('aria-expanded', String(newState));
      }
      return newState;
    });
  };

  // Smooth scroll for internal links
  const handleLinkClick = (e, targetId) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (navOpen) {
        setNavOpen(false);
        document.body.style.overflow = '';
      }
    }
  };


  // Smooth snap scroll - UX optimized (desktop only)
  useEffect(() => {
    let isScrolling = false;
    let scrollAccumulator = 0;
    let scrollTimeout = null;
    const SCROLL_THRESHOLD = 50; // Minimum scroll amount to trigger snap
    const SCROLL_RESET_TIME = 300; // Time to reset accumulator

    const handleWheel = (e) => {
      // Prevent scroll when modal is open
      if (activeModal) {
        e.preventDefault();
        return;
      }
      // Disable snap scroll on mobile (max-width: 800px)
      if (window.innerWidth <= 800) {
        return; // Allow normal scroll on mobile
      }
      if (isScrolling) {
        e.preventDefault();
        return;
      }

      const sections = Array.from(document.querySelectorAll('.snap-section'));
      if (sections.length === 0) return;

      const windowHeight = window.innerHeight;
      const currentScroll = window.pageYOffset;
      const viewportCenter = currentScroll + windowHeight / 2;
      
      // Find current section based on viewport center
      let currentSectionIndex = 0;
      let minDistance = Infinity;

      sections.forEach((section, index) => {
        const rect = section.getBoundingClientRect();
        const sectionCenter = rect.top + currentScroll + rect.height / 2;
        const distance = Math.abs(viewportCenter - sectionCenter);

        if (distance < minDistance) {
          minDistance = distance;
          currentSectionIndex = index;
        }
      });

      const isFirstSection = currentSectionIndex === 0;
      const isLastSection = currentSectionIndex === sections.length - 1;
      const scrollingUp = e.deltaY < 0;
      const scrollingDown = e.deltaY > 0;

      // Allow free scroll to see navbar (first section, scrolling up)
      if (isFirstSection && scrollingUp && currentScroll > 0) {
        // Allow normal scroll to see navbar
        return; // Don't prevent default, allow scroll
      }

      // Allow free scroll to see footer (last section, scrolling down)
      if (isLastSection && scrollingDown) {
        const footer = document.querySelector('.site-footer');
        if (footer) {
          const maxScroll = document.documentElement.scrollHeight - windowHeight;
          
          // If we can still scroll to see footer, allow it
          if (currentScroll < maxScroll - 50) {
            return; // Don't prevent default, allow scroll
          }
        }
      }

      // If scrolling up from footer area, go to pricing section
      // This must happen before normal snap scroll logic
      if (scrollingUp) {
        const footer = document.querySelector('.site-footer');
        const pricingSection = document.getElementById('pricing');
        
        if (footer && pricingSection) {
          const footerRect = footer.getBoundingClientRect();
          const pricingRect = pricingSection.getBoundingClientRect();
          
          // Check if we're in footer area (footer is significantly visible)
          // Footer is considered "active" if its top is in the lower half of viewport
          const isInFooter = footerRect.top < windowHeight * 0.7 && footerRect.bottom > windowHeight * 0.3;
          
          // Only redirect to pricing if we're in footer area
          if (isInFooter) {
            e.preventDefault();
            isScrolling = true;
            scrollAccumulator = 0; // Reset accumulator
            
            pricingSection.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'start' 
            });
            setTimeout(() => {
              isScrolling = false;
            }, 800);
            return;
          }
        }
      }

      // For other cases, use snap scroll
      e.preventDefault();

      // Accumulate scroll delta
      scrollAccumulator += Math.abs(e.deltaY);

      // Clear reset timeout
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }

      // Reset accumulator after inactivity
      scrollTimeout = setTimeout(() => {
        scrollAccumulator = 0;
      }, SCROLL_RESET_TIME);

      // Only trigger snap if scroll amount exceeds threshold
      if (scrollAccumulator < SCROLL_THRESHOLD) {
        return;
      }

      // Determine scroll direction
      let targetSectionIndex = currentSectionIndex;
      
      if (scrollingDown && currentSectionIndex < sections.length - 1) {
        // Scroll down - go to next section
        targetSectionIndex = currentSectionIndex + 1;
      } else if (scrollingUp && currentSectionIndex > 0) {
        // Scroll up - go to previous section
        targetSectionIndex = currentSectionIndex - 1;
      }

      // Only scroll if target is different
      if (targetSectionIndex !== currentSectionIndex) {
        isScrolling = true;
        scrollAccumulator = 0; // Reset accumulator

        const targetSection = sections[targetSectionIndex];
        if (targetSection) {
          // Smooth scroll to target section
          targetSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
          
          // Allow next scroll after animation completes
          setTimeout(() => {
            isScrolling = false;
          }, 800); // Match smooth scroll duration
        } else {
          isScrolling = false;
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      window.removeEventListener('wheel', handleWheel);
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
    };
  }, [activeModal]);

  // Header scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const scrollThreshold = 50;
      const currentScroll = window.pageYOffset;
      
      if (headerRef.current) {
        const headerWrapper = headerRef.current.querySelector('.header-wrapper');
        if (headerWrapper) {
          if (currentScroll > scrollThreshold) {
            headerWrapper.style.boxShadow = '0 8px 40px rgba(0, 0, 0, 0.35)';
            headerWrapper.style.borderColor = 'rgba(255, 255, 255, 0.2)';
          } else {
            headerWrapper.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.3)';
            headerWrapper.style.borderColor = 'rgba(255, 255, 255, 0.15)';
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close nav on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (navRef.current && navToggleRef.current) {
        const clickedInsideNav = navRef.current.contains(e.target);
        const clickedToggle = navToggleRef.current.contains(e.target);
        if (!clickedInsideNav && !clickedToggle && navOpen) {
          setNavOpen(false);
          document.body.style.overflow = '';
        }
      }
    };

    if (navOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [navOpen]);

  // Loading screen
  useEffect(() => {
    if (isLoading) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isLoading]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (navOpen) {
          setNavOpen(false);
          document.body.style.overflow = '';
          document.documentElement.style.overflow = '';
        }
        if (activeModal) {
          setActiveModal(null);
          document.body.style.overflow = '';
          document.documentElement.style.overflow = '';
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [navOpen, activeModal]);

  // Modal functions
  const openModal = (modalId) => {
    if (activeModal) {
      setActiveModal(null);
    }
    setActiveModal(modalId);
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setActiveModal(null);
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
  };

  // Button ripple effect
  const handleButtonClick = (e) => {
    const button = e.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple');
    
    button.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  };

  return (
    <>
      {isLoading && <Loading onComplete={() => setIsLoading(false)} />}
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1, pointerEvents: 'none', overflow: 'hidden' }}>
        <DarkVeil />
      </div>
      <header ref={headerRef} className="site-header">
        <div className="header-wrapper">
          <div className="container header-inner">
          <a className="brand" href="#hero" aria-label="NIQ anasayfa" onClick={(e) => handleLinkClick(e, 'hero')}>
            <img src="/WhatsApp_Image_2025-12-22_at_14.49.40-removebg-preview.png" alt="NIQ logo" className="brand-logo" loading="lazy" />
          </a>
          <button 
            ref={navToggleRef}
            className="nav-toggle" 
            aria-expanded={navOpen} 
            aria-controls="primary-nav" 
            aria-label="Menüyü aç"
            onClick={toggleNav}
          >
            <span className="nav-toggle-bar"></span>
            <span className="nav-toggle-bar"></span>
            <span className="nav-toggle-bar"></span>
          </button>
          <nav id="primary-nav" ref={navRef} className={`nav ${navOpen ? 'open' : ''}`}>
            <a href="#about" onClick={(e) => handleLinkClick(e, 'about')}>Hakkında</a>
            <a href="#features" onClick={(e) => handleLinkClick(e, 'features')}>Özellikler</a>
            <a href="#pricing" onClick={(e) => handleLinkClick(e, 'pricing')}>Paketler</a>
          </nav>
        </div>
        </div>
      </header>

      <main>
        <section id="hero" className="hero snap-section">
          <div className="container hero-grid">
            <div className="hero-copy">
              <h1 className="h1-title">
                <GradientText 
                  text="Doğal dille verinizi yönetin, sonuçları anında görün" 
                  gradient="default" 
                  animate={true}
                  className="hero-gradient-text"
                />
              </h1>
              <p className="lede">
                <BlurText
                  text="NIQ Desktop, teknik bariyer olmadan veritabanınızla konuşmanızı sağlar; doğal dildeki talepleri güvenli sorgulara dönüştürür ve sonuçları anlaşılır görünümlere taşır."
                  delay={600}
                  animateBy="words"
                  direction="top"
                  onAnimationComplete={handleAnimationComplete}
                  className="hero-blur"
                />
              </p>
              <div className="hero-cta">
                <a className="btn primary large" href="https://github.com/cenkergultekin/berkay-sql-project/releases/tag/v1.2" aria-label="Windows için NIQ'u indirin" target="_blank" rel="noopener noreferrer" onClick={handleButtonClick}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" preserveAspectRatio="xMidYMid meet">
                    <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z"/>
                  </svg>
                  <span>Windows İçin İndir</span>
                </a>
                <a className="btn ghost large" href="#about" aria-label="Daha fazla bilgi edinin" onClick={(e) => handleLinkClick(e, 'about')}>
                  Daha Fazla Bilgi
                </a>
              </div>
            </div>
            <div className="hero-visual">
              <div className="card">
                <div className="card-header">
                  Canlı görünüm
                </div>
                <div className="card-body">
                  <div className="stat">
                    <span className="label">
                      İşlenen sorgu
                    </span>
                    <span className="value">10.000+</span>
                  </div>
                  <div className="stat">
                    <span className="label">
                      Zaman kazancı
                    </span>
                    <span className="value">2.5 <span className="unit">saat/gün</span></span>
                  </div>
                  <div className="stat accent">
                    <span className="label">
                      Verimlilik artışı
                    </span>
                    <span className="value">↑ %85</span>
                  </div>
                  <div className="stat">
                    <span className="label">
                      Aktif kullanıcı
                    </span>
                    <span className="value">1000+</span>
                  </div>
                  <div className="stat">
                    <span className="label">
                      Ortalama yanıt
                    </span>
                    <span className="value">1.2 sn</span>
                  </div>
                  <div className="stat">
                    <span className="label">
                      Başarı oranı
                    </span>
                    <span className="value">↑ %69</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="section full-height snap-section about-section">
          <div className="container about-container">
            <div className="about-left">
              <p className="eyebrow">
                NIQ Hakkında
              </p>
              <h2>
                Veri yönetiminde yeni nesil yaklaşım
              </h2>
              <p className="about-description">
                NIQ Desktop, teknik bariyer olmadan veritabanınızla konuşmanızı sağlar. Doğal dildeki talepleri güvenli sorgulara dönüştürür ve sonuçları anlaşılır görünümlere taşır.
              </p>
              
              <div className="about-metrics-grid">
                <div className="metric-box">
                  <div className="metric-value">
                    <CountUp from={0} to={1000} duration={4} separator="." direction="up" className="count-up-text" />+
                  </div>
                  <div className="metric-label">
                    Aktif kullanıcı
                  </div>
                  <div className="metric-sub">
                    Kullanıcı
                  </div>
                </div>
                <div className="metric-box">
                  <div className="metric-value">
                    <CountUp from={0} to={2} duration={4} separator="" direction="up" className="count-up-text" />.<CountUp from={0} to={5} duration={4} separator="" direction="up" className="count-up-text" />
                  </div>
                  <div className="metric-label">
                    Zaman kazancı
                  </div>
                  <div className="metric-sub">
                    Saat/Gün
                  </div>
                </div>
                <div className="metric-box">
                  <div className="metric-value">
                    %<CountUp from={0} to={85} duration={4} separator="" direction="up" className="count-up-text" />
                  </div>
                  <div className="metric-label">
                    Verimlilik artışı
                  </div>
                  <div className="metric-sub">
                    Artış
                  </div>
                </div>
              </div>
            </div>

            <div className="about-right">
              <div className="workflow-container">
                <h3 className="workflow-title">
                  Veri akışı nasıl işler?
                </h3>
                <div className="workflow-steps">
                  <div className="workflow-step">
                    <div className="workflow-number">01</div>
                    <div className="workflow-content">
                      <h4>
                        Bağlan
                      </h4>
                      <p>
                        Veritabanını ekle, roller ve bağlantı güvenliğini tanımla.
                      </p>
                    </div>
                  </div>
                  <div className="workflow-step">
                    <div className="workflow-number">02</div>
                    <div className="workflow-content">
                      <h4>
                        Sorgula
                      </h4>
                      <p>
                        Doğal dilde isteğini yaz, NIQ sorguya çevirip çalıştırsın.
                      </p>
                    </div>
                  </div>
                  <div className="workflow-step">
                    <div className="workflow-number">03</div>
                    <div className="workflow-content">
                      <h4>
                        Görselleştir
                      </h4>
                      <p>
                        Sonuçları tablo veya grafik görünümünde kaydet ve paylaş.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="section full-height snap-section features-testimonials-section">
          <div className="features-testimonials-wrapper">
            <div className="features-half">
              <div className="section-head">
                <p className="eyebrow">
                  Özellikler
                </p>
                <h2>
                  <BlurText
                    text="Güçlü yetenekler"
                    delay={0}
                    animateBy="words"
                    direction="top"
                    onAnimationComplete={handleAnimationComplete}
                    className="feature-item"
                  />
                </h2>
              </div>
              <div className="feature-list">
                <article className="feature-card">
                  <div className="feature-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"></rect><path d="M3 9h18M9 21V9"></path></svg>
                  </div>
                  <div className="feature-content">
                    <h3>
                      <BlurText
                        text="Anlık Kontrol Paneli"
                        delay={200}
                        animateBy="words"
                        direction="left"
                        onAnimationComplete={handleAnimationComplete}
                        className="feature-item"
                      />
                    </h3>
                    <p>
                      Sorgu durumunu, çıktılarını ve uyarıları tek bakışta görün.
                    </p>
                  </div>
                </article>
                <article className="feature-card">
                  <div className="feature-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                  </div>
                  <div className="feature-content">
                    <h3>
                      <BlurText
                        text="Doğal Dilden SQL'e"
                        delay={600}
                        animateBy="words"
                        direction="left"
                        onAnimationComplete={handleAnimationComplete}
                        className="feature-item"
                      />
                    </h3>
                    <p>
                      İş ihtiyacınızı yazın, NIQ otomatik olarak MSSQL sorgusuna çevirsin.
                    </p>
                  </div>
                </article>
                <article className="feature-card">
                  <div className="feature-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18"></path><path d="m19 9-5 5-4-4-3 3"></path></svg>
                  </div>
                  <div className="feature-content">
                    <h3>
                      <BlurText
                        text="Canlı Grafikler"
                        delay={1000}
                        animateBy="words"
                        direction="left"
                        onAnimationComplete={handleAnimationComplete}
                        className="feature-item"
                      />
                    </h3>
                    <p>
                      Sonuçları tablo veya grafik olarak görün ve kolayca paylaşın.
                    </p>
                  </div>
                </article>
                <article className="feature-card">
                  <div className="feature-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                  </div>
                  <div className="feature-content">
                    <h3>
                      <BlurText
                        text="Güvenlik ve Kayıt"
                        delay={1400}
                        animateBy="words"
                        direction="left"
                        onAnimationComplete={handleAnimationComplete}
                        className="feature-item"
                      />
                    </h3>
                    <p>
                      Rol bazlı erişim, loglama ve denetim iziyle iç denetime hazır.
                    </p>
                  </div>
                </article>
                <article className="feature-card">
                  <div className="feature-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path></svg>
                  </div>
                  <div className="feature-content">
                    <h3>
                      <BlurText
                        text="Zamanlanmış Sorgular"
                        delay={1800}
                        animateBy="words"
                        direction="left"
                        onAnimationComplete={handleAnimationComplete}
                        className="feature-item"
                      />
                    </h3>
                    <p>
                      Rutin raporlarınızı otomatik çalıştırın ve sonuçları zamanında alın.
                    </p>
                  </div>
                </article>
              </div>
            </div>
            <div className="testimonials-half">
              <div className="section-head">
                <p className="eyebrow">
                  Kullanıcı Deneyimleri
                </p>
                <h2>
                  Müşteri görüşleri
                </h2>
              </div>
              <div className="testimonial-scroll">
                <div className="testimonial-track">
                  {[
                    { text: "Veri ekiplerinin kurulum süresi %60 kısaldı, hata sayısı dramatik azaldı. Artık SQL yazmadan sorgu çalıştırabiliyoruz.", name: "Ayşe Kaya", role: "Veri Operasyonları Müdürü", avatar: "AK" },
                    { text: "NIQ'un otomasyonları sayesinde SLA hedeflerini aşarak teslim ediyoruz. Ekip verimliliği %80 arttı.", name: "Baran Tunç", role: "Ürün Yöneticisi", avatar: "BT" },
                    { text: "Denetim izi ve erişim kontrolü güven ekibimizi oldukça rahatlattı. ISO 27001 uyumlu yapısı kurumsal ihtiyaçlarımızı karşılıyor.", name: "Cemre Demir", role: "Güvenlik Mimarı", avatar: "CD" },
                    { text: "Doğal dil arayüzüyle teknik olmayan ekipler de veriye erişiyor. Bu gerçek bir oyun değiştirici.", name: "Deniz Sarı", role: "Operasyon Yöneticisi", avatar: "DS" },
                    { text: "Grafik özetleri toplantılarda direkt kullanıyoruz, hazırlık süresi %70 kısaldı. Raporlama artık çok kolay.", name: "Elif Mert", role: "İş Analisti", avatar: "EM" },
                    { text: "Loglama ve denetim izi güven ekibimizin onayını hızlandırdı. Sistem şeffaflığı mükemmel seviyede.", name: "Fırat Levent", role: "BT Güvenlik Sorumlusu", avatar: "FL" }
                  ].map((testimonial, idx) => (
                    <React.Fragment key={idx}>
                      <blockquote className="testimonial">
                        <p>
                          {testimonial.text}
                        </p>
                        <footer>
                          <div className="avatar">{testimonial.avatar}</div>
                          <div>
                            <div className="name">
                              {testimonial.name}
                            </div>
                            <div className="role">
                              {testimonial.role}
                            </div>
                          </div>
                        </footer>
                      </blockquote>
                    </React.Fragment>
                  ))}
                  {/* Duplicate for seamless loop */}
                  {[
                    { text: "Veri ekiplerinin kurulum süresi %60 kısaldı, hata sayısı dramatik azaldı. Artık SQL yazmadan sorgu çalıştırabiliyoruz.", name: "Ayşe Kaya", role: "Veri Operasyonları Müdürü", avatar: "AK" },
                    { text: "NIQ'un otomasyonları sayesinde SLA hedeflerini aşarak teslim ediyoruz. Ekip verimliliği %80 arttı.", name: "Baran Tunç", role: "Ürün Yöneticisi", avatar: "BT" },
                    { text: "Denetim izi ve erişim kontrolü güven ekibimizi oldukça rahatlattı. ISO 27001 uyumlu yapısı kurumsal ihtiyaçlarımızı karşılıyor.", name: "Cemre Demir", role: "Güvenlik Mimarı", avatar: "CD" },
                    { text: "Doğal dil arayüzüyle teknik olmayan ekipler de veriye erişiyor. Bu gerçek bir oyun değiştirici.", name: "Deniz Sarı", role: "Operasyon Yöneticisi", avatar: "DS" },
                    { text: "Grafik özetleri toplantılarda direkt kullanıyoruz, hazırlık süresi %70 kısaldı. Raporlama artık çok kolay.", name: "Elif Mert", role: "İş Analisti", avatar: "EM" },
                    { text: "Loglama ve denetim izi güven ekibimizin onayını hızlandırdı. Sistem şeffaflığı mükemmel seviyede.", name: "Fırat Levent", role: "BT Güvenlik Sorumlusu", avatar: "FL" }
                  ].map((testimonial, idx) => (
                    <React.Fragment key={`dup-${idx}`}>
                      <blockquote className="testimonial">
                        <p>
                          {testimonial.text}
                        </p>
                        <footer>
                          <div className="avatar">{testimonial.avatar}</div>
                          <div>
                            <div className="name">
                              {testimonial.name}
                            </div>
                            <div className="role">
                              {testimonial.role}
                            </div>
                          </div>
                        </footer>
                      </blockquote>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="section full-height snap-section pricing-section">
          <div className="container">
            <div className="section-head center">
              <p className="eyebrow">
                Paketler
              </p>
              <h2>
                İhtiyacınıza Uygun Seçenekler
              </h2>
              <p>
                Her ölçekte işletme için esnek paketler. Fiyat ve özellikler müşteri gereksinimlerine göre özelleştirilebilir.
              </p>
            </div>
            <div className="pricing-grid">
              <article className="pricing-card">
                <h3>
                  Starter
                </h3>
                <div className="price">$0.99</div>
                <ul className="pricing-list">
                  <li>
                    1.000 sorgu hakkı
                  </li>
                  <li>
                    Tek zeka katmanı
                  </li>
                </ul>
                <button type="button" className="btn ghost block" onClick={handleButtonClick}>
                  <span>Talep et</span>
                </button>
              </article>
              <article className="pricing-card featured">
                <div className="badge">
                  Önerilen
                </div>
                <h3>
                  <GradientText text="Plus" gradient="purple-blue" animate={true} />
                </h3>
                <div className="price">$4.99</div>
                <ul className="pricing-list">
                  <li>
                    5.000 sorgu hakkı
                  </li>
                  <li>
                    Çift katlı zeka katmanı
                  </li>
                  <li>
                    Sorguları grafiklerle gösterme
                  </li>
                </ul>
                <button type="button" className="btn primary block" onClick={handleButtonClick}>
                  <span>Talep et</span>
                </button>
              </article>
              <article className="pricing-card">
                <h3>
                  Pro
                </h3>
                <div className="price">$9.99</div>
                <ul className="pricing-list">
                  <li>
                    10.000 sorgu hakkı
                  </li>
                  <li>
                    Yüksek zeka katmanı
                  </li>
                  <li>
                    Sorguları grafiklerle gösterme
                  </li>
                  <li>
                    Zamanlanmış sorgu
                  </li>
                  <li>
                    Öncelikli destek
                  </li>
                </ul>
                <button type="button" className="btn ghost block" onClick={handleButtonClick}>
                  <span>Talep et</span>
                </button>
              </article>
            </div>
          </div>
        </section>

        <footer className="site-footer">
          <div className="container footer-content">
            <div className="footer-main">
              <div className="footer-brand-section">
                <div className="brand-mark">NIQ</div>
                <p className="footer-tagline">
                  Veriyi stratejik aksiyona dönüştüren akıllı asistan.
                </p>
              </div>
              <div className="footer-links-group">
                <div className="footer-column">
                  <h4>
                    Ürün
                  </h4>
                  <ul className="footer-links">
                    <li><a href="#about" onClick={(e) => handleLinkClick(e, 'about')}>Hakkında</a></li>
                    <li><a href="#features" onClick={(e) => handleLinkClick(e, 'features')}>Özellikler</a></li>
                    <li><a href="#pricing" onClick={(e) => handleLinkClick(e, 'pricing')}>Paketler</a></li>
                  </ul>
                </div>
                <div className="footer-column">
                  <h4>
                    Kaynaklar
                  </h4>
                  <ul className="footer-links">
                    <li><a href="https://github.com/cenkergultekin/berkay-sql-project/releases/tag/v1.2" target="_blank" rel="noopener noreferrer">İndir</a></li>
                    <li><a href="#" id="documentation-link" onClick={(e) => { e.preventDefault(); openModal('documentation-modal'); }}>Dokümantasyon</a></li>
                    <li><a href="#" id="support-link" onClick={(e) => { e.preventDefault(); openModal('support-modal'); }}>Destek</a></li>
                  </ul>
                </div>
                <div className="footer-column">
                  <h4>
                    Şirket
                  </h4>
                  <ul className="footer-links">
                    <li><a href="#" id="contact-link" onClick={(e) => { e.preventDefault(); openModal('contact-modal'); }}>İletişim</a></li>
                    <li><a href="#" id="privacy-link" onClick={(e) => { e.preventDefault(); openModal('privacy-modal'); }}>Gizlilik Politikası</a></li>
                    <li><a href="#" id="terms-link" onClick={(e) => { e.preventDefault(); openModal('terms-modal'); }}>Kullanım Koşulları</a></li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="footer-bottom">
              <p>
                © 2025 NIQ. Tüm hakları saklıdır.
              </p>
            </div>
          </div>
        </footer>
      </main>

      {/* Contact Modal */}
      <div id="contact-modal" className={`modal ${activeModal === 'contact-modal' ? 'active' : ''}`} aria-hidden={activeModal !== 'contact-modal'} role="dialog" aria-labelledby="contact-modal-title">
        <div className="modal-overlay" onClick={closeModal}></div>
        <div className="modal-content">
          <button className="modal-close" aria-label="Modal'ı kapat" onClick={closeModal}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          <div className="modal-header">
            <h2 id="contact-modal-title">
              NIQ Developers
            </h2>
          </div>
          <div className="modal-body">
            <div className="contact-item">
              <div className="contact-name">
                Cenker Gültekin
              </div>
              <a href="mailto:cenkergultekin@niq.com" className="contact-email">cenkergultekin@niq.com</a>
            </div>
            <div className="contact-item">
              <div className="contact-name">
                Berkay Demircanlı
              </div>
              <a href="mailto:berkaydemircanli@niq.com" className="contact-email">berkaydemircanli@niq.com</a>
            </div>
          </div>
        </div>
      </div>

      {/* Documentation Modal */}
      <div id="documentation-modal" className={`modal ${activeModal === 'documentation-modal' ? 'active' : ''}`} aria-hidden={activeModal !== 'documentation-modal'} role="dialog" aria-labelledby="documentation-modal-title">
        <div className="modal-overlay" onClick={closeModal}></div>
        <div className="modal-content">
          <button className="modal-close" aria-label="Modal'ı kapat" onClick={closeModal}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          <div className="modal-header">
            <h2 id="documentation-modal-title">
              Dokümantasyon
            </h2>
          </div>
          <div className="modal-body">
            <div className="modal-text-content">
              <h3>
                Başlangıç
              </h3>
              <p>
                NIQ Desktop'u kullanmaya başlamak için aşağıdaki adımları takip edin:
              </p>
              <ul className="modal-list">
                <li>
                  Uygulamayı indirin ve kurun
                </li>
                <li>
                  Veritabanı bağlantınızı yapılandırın
                </li>
                <li>
                  İlk sorgunuzu doğal dilde yazın
                </li>
              </ul>
              
              <h3>
                Özellikler
              </h3>
              <ul className="modal-list">
                <li>
                  <strong>Doğal Dil İşleme:</strong>{' '}
                  Türkçe ve İngilizce sorgu desteği
                </li>
                <li>
                  <strong>Grafik Görselleştirme:</strong>{' '}
                  Sonuçları görsel olarak analiz edin
                </li>
                <li>
                  <strong>Zamanlanmış Sorgular:</strong>{' '}
                  Rutin raporlarınızı otomatikleştirin
                </li>
                <li>
                  <strong>Güvenlik:</strong>{' '}
                  Rol bazlı erişim kontrolü ve denetim izi
                </li>
              </ul>

              <h3>
                API Dokümantasyonu
              </h3>
              <p>
                Detaylı API dokümantasyonu için GitHub deposunu ziyaret edin veya geliştirici ekibiyle iletişime geçin.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Support Modal */}
      <div id="support-modal" className={`modal ${activeModal === 'support-modal' ? 'active' : ''}`} aria-hidden={activeModal !== 'support-modal'} role="dialog" aria-labelledby="support-modal-title">
        <div className="modal-overlay" onClick={closeModal}></div>
        <div className="modal-content">
          <button className="modal-close" aria-label="Modal'ı kapat" onClick={closeModal}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          <div className="modal-header">
            <h2 id="support-modal-title">
              Destek
            </h2>
          </div>
          <div className="modal-body">
            <div className="modal-text-content">
              <h3>
                Yardıma mı ihtiyacınız var?
              </h3>
              <p>
                NIQ Desktop ile ilgili sorularınız veya sorunlarınız için bizimle iletişime geçebilirsiniz.
              </p>
              
              <div className="support-section">
                <h4>
                  E-posta Desteği
                </h4>
                <p>
                  Teknik destek için e-posta gönderin:
                </p>
                <a href="mailto:support@niq.com" className="contact-email">support@niq.com</a>
              </div>

              <div className="support-section">
                <h4>
                  Geliştirici Ekibi
                </h4>
                <p>
                  Doğrudan geliştirici ekibiyle iletişime geçin:
                </p>
                <div className="contact-item">
                  <div className="contact-name">
                    Cenker Gültekin
                  </div>
                  <a href="mailto:cenkergultekin@niq.com" className="contact-email">cenkergultekin@niq.com</a>
                </div>
                <div className="contact-item">
                  <div className="contact-name">
                    Berkay Demircanlı
                  </div>
                  <a href="mailto:berkaydemircanli@niq.com" className="contact-email">berkaydemircanli@niq.com</a>
                </div>
              </div>

              <div className="support-section">
                <h4>
                  Sık Sorulan Sorular
                </h4>
                <p>
                  Yaygın sorunlar ve çözümleri için dokümantasyonu inceleyin.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Policy Modal */}
      <div id="privacy-modal" className={`modal ${activeModal === 'privacy-modal' ? 'active' : ''}`} aria-hidden={activeModal !== 'privacy-modal'} role="dialog" aria-labelledby="privacy-modal-title">
        <div className="modal-overlay" onClick={closeModal}></div>
        <div className="modal-content">
          <button className="modal-close" aria-label="Modal'ı kapat" onClick={closeModal}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          <div className="modal-header">
            <h2 id="privacy-modal-title">
              Gizlilik Politikası
            </h2>
          </div>
          <div className="modal-body">
            <div className="modal-text-content">
              <p>
                <strong>Son Güncelleme:</strong>{' '}
                <BlurText
                  text="Aralık 2025"
                  delay={150}
                  animateBy="words"
                  direction="top"
                  onAnimationComplete={handleAnimationComplete}
                />
              </p>
              
              <h3>
                <BlurText
                  text="Veri Toplama"
                  delay={300}
                  animateBy="words"
                  direction="top"
                  onAnimationComplete={handleAnimationComplete}
                />
              </h3>
              <p>
                <BlurText
                  text="NIQ Desktop, kullanıcı deneyimini iyileştirmek ve hizmet kalitesini artırmak için sınırlı veri toplar. Toplanan veriler şunları içerir:"
                  delay={450}
                  animateBy="words"
                  direction="top"
                  onAnimationComplete={handleAnimationComplete}
                />
              </p>
              <ul className="modal-list">
                <li>
                  <BlurText
                    text="Uygulama kullanım istatistikleri"
                    delay={600}
                    animateBy="words"
                    direction="left"
                    onAnimationComplete={handleAnimationComplete}
                  />
                </li>
                <li>
                  <BlurText
                    text="Hata raporları ve log kayıtları"
                    delay={700}
                    animateBy="words"
                    direction="left"
                    onAnimationComplete={handleAnimationComplete}
                  />
                </li>
                <li>
                  <BlurText
                    text="Bağlantı bilgileri (yerel olarak saklanır)"
                    delay={800}
                    animateBy="words"
                    direction="left"
                    onAnimationComplete={handleAnimationComplete}
                  />
                </li>
              </ul>

              <h3>
                <BlurText
                  text="Veri Güvenliği"
                  delay={900}
                  animateBy="words"
                  direction="top"
                  onAnimationComplete={handleAnimationComplete}
                />
              </h3>
              <p>
                <BlurText
                  text="Veritabanı bağlantı bilgileriniz ve sorgu sonuçlarınız yerel cihazınızda saklanır. Hiçbir veri sunucularımıza gönderilmez veya üçüncü taraflarla paylaşılmaz."
                  delay={1000}
                  animateBy="words"
                  direction="top"
                  onAnimationComplete={handleAnimationComplete}
                />
              </p>

              <h3>
                <BlurText
                  text="Loglama ve Denetim"
                  delay={1100}
                  animateBy="words"
                  direction="top"
                  onAnimationComplete={handleAnimationComplete}
                />
              </h3>
              <p>
                <BlurText
                  text="Güvenlik ve denetim amaçlı olarak, sorgu geçmişi ve kullanıcı aktiviteleri yerel olarak loglanır. Bu loglar yalnızca iç denetim amaçlı kullanılır."
                  delay={1200}
                  animateBy="words"
                  direction="top"
                  onAnimationComplete={handleAnimationComplete}
                />
              </p>

              <h3>
                <BlurText
                  text="Çerezler"
                  delay={1300}
                  animateBy="words"
                  direction="top"
                  onAnimationComplete={handleAnimationComplete}
                />
              </h3>
              <p>
                <BlurText
                  text="NIQ Desktop, temel işlevsellik için gerekli çerezleri kullanır. Üçüncü taraf çerezler kullanılmamaktadır."
                  delay={1400}
                  animateBy="words"
                  direction="top"
                  onAnimationComplete={handleAnimationComplete}
                />
              </p>

              <h3>
                <BlurText
                  text="Haklarınız"
                  delay={1500}
                  animateBy="words"
                  direction="top"
                  onAnimationComplete={handleAnimationComplete}
                />
              </h3>
              <p>
                <BlurText
                  text="Kişisel verilerinize erişim, düzeltme ve silme haklarınız bulunmaktadır. Bu haklarınızı kullanmak için bizimle iletişime geçebilirsiniz."
                  delay={1600}
                  animateBy="words"
                  direction="top"
                  onAnimationComplete={handleAnimationComplete}
                />
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Terms of Service Modal */}
      <div id="terms-modal" className={`modal ${activeModal === 'terms-modal' ? 'active' : ''}`} aria-hidden={activeModal !== 'terms-modal'} role="dialog" aria-labelledby="terms-modal-title">
        <div className="modal-overlay" onClick={closeModal}></div>
        <div className="modal-content">
          <button className="modal-close" aria-label="Modal'ı kapat" onClick={closeModal}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          <div className="modal-header">
            <h2 id="terms-modal-title">
              Kullanım Koşulları
            </h2>
          </div>
          <div className="modal-body">
            <div className="modal-text-content">
              <p>
                <strong>Son Güncelleme:</strong>{' '}
                <BlurText
                  text="Aralık 2025"
                  delay={150}
                  animateBy="words"
                  direction="top"
                  onAnimationComplete={handleAnimationComplete}
                />
              </p>
              
              <h3>
                <BlurText
                  text="Kabul ve Kullanım"
                  delay={300}
                  animateBy="words"
                  direction="top"
                  onAnimationComplete={handleAnimationComplete}
                />
              </h3>
              <p>
                <BlurText
                  text="NIQ Desktop'u kullanarak, bu kullanım koşullarını kabul etmiş sayılırsınız. Uygulamayı yalnızca yasal amaçlar için kullanmalısınız."
                  delay={450}
                  animateBy="words"
                  direction="top"
                  onAnimationComplete={handleAnimationComplete}
                />
              </p>

              <h3>
                <BlurText
                  text="Lisans"
                  delay={600}
                  animateBy="words"
                  direction="top"
                  onAnimationComplete={handleAnimationComplete}
                />
              </h3>
              <p>
                <BlurText
                  text="NIQ Desktop, lisanslı bir yazılımdır. Yazılımı kopyalama, dağıtma veya tersine mühendislik yapma hakkınız bulunmamaktadır."
                  delay={750}
                  animateBy="words"
                  direction="top"
                  onAnimationComplete={handleAnimationComplete}
                />
              </p>

              <h3>
                <BlurText
                  text="Sorumluluk Reddi"
                  delay={900}
                  animateBy="words"
                  direction="top"
                  onAnimationComplete={handleAnimationComplete}
                />
              </h3>
              <p>
                <BlurText
                  text="NIQ Desktop, veritabanı sorgularınızın doğruluğunu garanti etmez. Sorgu sonuçlarını kullanmadan önce doğrulamak kullanıcının sorumluluğundadır."
                  delay={1050}
                  animateBy="words"
                  direction="top"
                  onAnimationComplete={handleAnimationComplete}
                />
              </p>

              <h3>
                <BlurText
                  text="Kullanıcı Sorumlulukları"
                  delay={1200}
                  animateBy="words"
                  direction="top"
                  onAnimationComplete={handleAnimationComplete}
                />
              </h3>
              <ul className="modal-list">
                <li>
                  <BlurText
                    text="Veritabanı erişim bilgilerinizi güvenli tutmak"
                    delay={1350}
                    animateBy="words"
                    direction="left"
                    onAnimationComplete={handleAnimationComplete}
                  />
                </li>
                <li>
                  <BlurText
                    text="Yalnızca yetkili olduğunuz verilere erişmek"
                    delay={1450}
                    animateBy="words"
                    direction="left"
                    onAnimationComplete={handleAnimationComplete}
                  />
                </li>
                <li>
                  <BlurText
                    text="Uygulamayı kötüye kullanmamak"
                    delay={1550}
                    animateBy="words"
                    direction="left"
                    onAnimationComplete={handleAnimationComplete}
                  />
                </li>
                <li>
                  <BlurText
                    text="Yasalara ve kurumsal politikalarınıza uymak"
                    delay={1650}
                    animateBy="words"
                    direction="left"
                    onAnimationComplete={handleAnimationComplete}
                  />
                </li>
              </ul>

              <h3>
                <BlurText
                  text="Hizmet Kesintileri"
                  delay={1750}
                  animateBy="words"
                  direction="top"
                  onAnimationComplete={handleAnimationComplete}
                />
              </h3>
              <p>
                <BlurText
                  text="NIQ Desktop, bakım veya güncelleme amaçlı olarak geçici olarak kesintiye uğrayabilir. Bu durumlarda önceden bildirim yapılacaktır."
                  delay={1900}
                  animateBy="words"
                  direction="top"
                  onAnimationComplete={handleAnimationComplete}
                />
              </p>

              <h3>
                <BlurText
                  text="Değişiklikler"
                  delay={2050}
                  animateBy="words"
                  direction="top"
                  onAnimationComplete={handleAnimationComplete}
                />
              </h3>
              <p>
                <BlurText
                  text="Bu kullanım koşulları, önceden haber vermeksizin değiştirilebilir. Değişiklikler uygulama içinde bildirilecektir."
                  delay={2200}
                  animateBy="words"
                  direction="top"
                  onAnimationComplete={handleAnimationComplete}
                />
              </p>

              <h3>
                <BlurText
                  text="İletişim"
                  delay={2350}
                  animateBy="words"
                  direction="top"
                  onAnimationComplete={handleAnimationComplete}
                />
              </h3>
              <p>
                <BlurText
                  text="Kullanım koşulları hakkında sorularınız için bizimle iletişime geçebilirsiniz."
                  delay={2500}
                  animateBy="words"
                  direction="top"
                  onAnimationComplete={handleAnimationComplete}
                />
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;

