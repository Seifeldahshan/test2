// Cosmos Interactive Engine
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.getElementById('services-carousel-section')?.classList.remove('is-scroll-driven');
}

document.addEventListener('DOMContentLoaded', () => {

  // Prevent scroll during preloader loading phase
  document.body.classList.add('is-loading');

  // Register GSAP plugins
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  // 0. Smooth Scroll Layer (Lenis) with inertia lerp
  let lenis;
  let fitServicesStage = null;
  if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    if (typeof ScrollTrigger !== 'undefined') {
      lenis.on('scroll', ScrollTrigger.update);
    }

    // Pause scroll during preloader intro
    lenis.stop();
  }

  // AGENIO-STYLE LOADING INTRO & HERO REVEAL ENGINE
  if (typeof gsap !== 'undefined') {
    const preloaderEl = document.getElementById('preloader');

    // Set initial hidden states to prevent FOUC / flash before sequence starts
    gsap.set('#main-nav', { y: -20, opacity: 0 });
    gsap.set('.headline-line-1', { y: 25, opacity: 0 });
    gsap.set('.headline-line-2', { yPercent: 110, opacity: 0, scale: 0.96 });
    gsap.set('.headline-swoosh-accent', { scaleX: 0, transformOrigin: '50% 100%', opacity: 0 });
    gsap.set('.header-hero-cta', { y: 20, opacity: 0 });

    const masterTL = gsap.timeline({
      onComplete: () => {
        document.body.classList.remove('is-loading');
        if (lenis) lenis.start();
        if (typeof fitServicesStage === 'function') fitServicesStage();
        if (typeof ScrollTrigger !== 'undefined') {
          ScrollTrigger.refresh();
        }
        if (preloaderEl) {
          preloaderEl.classList.add('is-hidden');
          preloaderEl.style.display = 'none';
        }
      }
    });

    // PHASE 1 — CENTERED BRAND REVEAL IN PRELOADER
    masterTL.to('.preloader-brand', {
      opacity: 1,
      scale: 1,
      duration: 0.6,
      ease: 'power2.out'
    }, 0.1);

    // Brief hold in center
    masterTL.to({}, { duration: 0.25 });

    // PHASE 2 — EXIT WIPE
    masterTL.to('.preloader-content', {
      opacity: 0,
      y: -20,
      duration: 0.3,
      ease: 'power2.in'
    });

    // Panel 1 translating up
    masterTL.to('.preloader-panel-1', {
      yPercent: -100,
      duration: 0.7,
      ease: 'power3.inOut'
    }, '-=0.1');

    // Panel 2 translating up (staggered behind panel 1)
    masterTL.to('.preloader-panel-2', {
      yPercent: -100,
      duration: 0.7,
      ease: 'power3.inOut',
      onStart: () => {
        // Unlock scroll early as panel wipes away to prevent layout jump
        document.body.classList.remove('is-loading');
        if (lenis) lenis.start();
      }
    }, '-=0.55');

    // PHASE 3 — HEADER & HERO REVEAL
    masterTL.to('#main-nav', {
      y: 0,
      opacity: 1,
      duration: 0.6,
      ease: 'power3.out'
    }, '-=0.4');

    // Line 1 reveal: "Make Complexity Work."
    masterTL.to('.headline-line-1', {
      y: 0,
      opacity: 1,
      duration: 0.7,
      ease: 'power3.out'
    }, '-=0.35');

    // Subtle reveal animation for second line: "EXACTly"
    masterTL.to('.headline-line-2', {
      yPercent: 0,
      opacity: 1,
      scale: 1,
      duration: 0.95,
      ease: 'power3.out'
    }, '-=0.35');

    // Accent swoosh draws underneath EXACTly
    masterTL.to('.headline-swoosh-accent', {
      scaleX: 1,
      opacity: 1,
      duration: 0.7,
      ease: 'power2.out'
    }, '-=0.45');

    // Hero CTA button fades up
    masterTL.to('.header-hero-cta', {
      y: 0,
      opacity: 1,
      duration: 0.5,
      ease: 'power3.out'
    }, '-=0.35');
  }

  // PHASE 4 — SCROLL REVEALS (ScrollTrigger for downstream sections)
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    // Feature cards reveal on scroll (carousel cards are driven by the pinned track)
    gsap.utils.toArray('.feature-card').forEach((card) => {
      if (card.classList.contains('service-carousel-card')) return;
      gsap.fromTo(card, {
        y: 40,
        opacity: 0
      }, {
        y: 0,
        opacity: 1,
        duration: 1.0,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: card,
          start: 'top 88%',
          toggleActions: 'play none none none'
        }
      });
    });

    // Section headers reveal
    gsap.utils.toArray('.why-exact').forEach((el) => {
      gsap.fromTo(el, {
        y: 30,
        opacity: 0
      }, {
        y: 0,
        opacity: 1,
        duration: 1.0,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      });
    });
  }

  // 1. Theme Toggle & Dynamic Logo Switcher (White Mode <-> Dark Mode)
  const themeToggleBtn = document.getElementById('theme-toggle');
  const sunIcon = themeToggleBtn?.querySelector('.sun-icon');
  const moonIcon = themeToggleBtn?.querySelector('.moon-icon');

  const updateThemeLogos = () => {
    const navLogoImgs = document.querySelectorAll('.nav-logo-img');
    const footerLogoImgs = document.querySelectorAll('.footer-logo-img');

    navLogoImgs.forEach(img => {
      img.src = 'assets/exact_logo-removebg-preview.png';
    });

    footerLogoImgs.forEach(img => {
      img.src = 'assets/exact_logo-removebg-preview.png';
    });
  };

  // Sync logos on initial page load
  updateThemeLogos();

  themeToggleBtn?.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark) {
      document.documentElement.removeAttribute('data-theme');
      if (sunIcon) sunIcon.style.display = 'block';
      if (moonIcon) moonIcon.style.display = 'none';
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      if (sunIcon) sunIcon.style.display = 'none';
      if (moonIcon) moonIcon.style.display = 'block';
    }
    updateThemeLogos();
  });

  // 2. Orbiting Photo Animation Engine
  const orbitContainer = document.getElementById('orbit-container');
  const orbitCards = document.querySelectorAll('.orbit-card');

  if (orbitContainer && orbitCards.length > 0) {
    // Initialize each card's state from data attributes
    const cardStates = [];
    orbitCards.forEach((card, i) => {
      const rxPercent = parseFloat(card.dataset.orbitRx) || 40;
      const ryPercent = parseFloat(card.dataset.orbitRy) || 35;
      const angleDeg = parseFloat(card.dataset.angle) || (i * (360 / orbitCards.length));
      const speed = parseFloat(card.dataset.speed) || 0.1;
      const size = parseFloat(card.dataset.size) || 120;
      const tilt = parseFloat(card.dataset.tilt) || 0;

      card.style.width = `${size}px`;
      card.style.height = `${size}px`;

      cardStates.push({
        el: card,
        rxPercent,
        ryPercent,
        angle: angleDeg * (Math.PI / 180),
        speed: speed * 0.008, // Scale down for smooth slow movement
        size,
        tilt,
        isInner: card.classList.contains('orbit-inner'),
        isGhost: card.classList.contains('orbit-ghost'),
      });
    });

    let animationId;

    function animateOrbit() {
      const containerRect = orbitContainer.getBoundingClientRect();
      const cx = containerRect.width / 2;
      const cy = containerRect.height / 2;

      const isMobile = window.innerWidth <= 768;
      const mobileScaleFactor = isMobile ? 0.65 : 1.0;

      cardStates.forEach(state => {
        // Update angle
        state.angle += state.speed;

        // Calculate orbit radii in pixels from percentage of container
        const rx = (state.rxPercent / 100) * containerRect.width;
        const ry = (state.ryPercent / 100) * containerRect.height;

        // Elliptical position
        const x = cx + rx * Math.cos(state.angle) - state.size / 2;
        const y = cy + ry * Math.sin(state.angle) - state.size / 2;

        // Calculate opacity based on position in orbit
        const depthFactor = (Math.sin(state.angle) + 1) / 2; // 0 to 1
        let baseOpacity = state.isGhost ? 0.15 : state.isInner ? 0.35 : 0.85;
        let opacity = baseOpacity * (0.3 + 0.7 * depthFactor);

        // Scale based on depth and mobile viewport factor
        const scale = (0.7 + 0.3 * depthFactor) * mobileScaleFactor;

        // Z-index based on depth (cards in front render on top)
        const zIndex = Math.round(depthFactor * 20);

        // Apply transform with tilt and depth scale
        const tiltAngle = state.tilt * (0.5 + 0.5 * depthFactor);
        state.el.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale}) rotate(${tiltAngle}deg)`;
        state.el.style.opacity = opacity;
        state.el.style.zIndex = zIndex;
      });

      animationId = requestAnimationFrame(animateOrbit);
    }

    // Start animation
    animateOrbit();

    // Pause animation when not visible for performance
    const heroObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (!animationId) animateOrbit();
        } else {
          if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
          }
        }
      });
    }, { rootMargin: '100px 0px 100px 0px', threshold: 0.01 });

    heroObserver.observe(document.getElementById('hero'));
  }

  // 3. AI Content Overlay Interactions (Show, Blur, Hide)
  const aiOverlay = document.getElementById('ai-overlay');
  const aiButtons = aiOverlay?.querySelectorAll('.ai-btn');
  const aiTargetImage = document.querySelector('.ai-target-image');

  aiButtons?.forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;

      // Update active state among AI buttons
      aiButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      if (!aiTargetImage) return;

      if (action === 'blur') {
        aiTargetImage.classList.add('blurred');
        aiTargetImage.classList.remove('hidden-state');
      } else if (action === 'hide') {
        aiTargetImage.classList.add('hidden-state');
        aiTargetImage.classList.remove('blurred');
      } else {
        // Show
        aiTargetImage.classList.remove('blurred', 'hidden-state');
      }
    });
  });

  // 4. Viewport Triggered Full-Width Image Showcase Transition (Permanent Lock)
  const filmSection = document.getElementById('film-section');

  if (filmSection) {
    const expandObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        // Waits until ~60% of the image section is clearly visible in viewport
        if (entry.isIntersecting) {
          filmSection.classList.add('is-expanded');
          // Lock expanded state permanently so continuing scroll never shrinks it back
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      threshold: 0.6
    });

    expandObserver.observe(filmSection);
  }

  // EXACT Solutions Portfolio Detailed Data Repository
  const exactSolutionsData = {
    "1": {
      title: "Enterprise Integration & API Architecture",
      categoryBadge: "INTEGRATION & API CONNECTIVITY",
      overview: "EXACT connects applications, data, APIs, legacy platforms, and microservices across on-premises, cloud, and hybrid environments with enterprise-grade security.",
      image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80",
      technologies: ["IBM CP4I", "IBM App Connect", "IBM API Connect", "IBM MQ", "Java Spring Boot", "GraphQL / REST", "OAuth 2.0 / mTLS"],
      features: [
        "Enterprise integration assessment & event-driven architecture definition",
        "API lifecycle management, security gateways, and developer portal enablement",
        "Java Spring Boot microservices engineering and modern API routing",
        "Controlled migration, HA performance tuning, and 24/7 go-live support"
      ],
      impact: "Eliminate data silos, reduce integration latency, and protect digital assets with zero-trust API security."
    },
    "2": {
      title: "Data Platforms, Governance & AI Enablement",
      categoryBadge: "DATA PLATFORMS & ENTERPRISE AI",
      overview: "EXACT empowers enterprise decision-makers with unified master data governance, automated data pipelines, and operationalized AI solutions.",
      image: "https://images.unsplash.com/photo-1535378917042-10a22c95931a?auto=format&fit=crop&w=1200&q=80",
      technologies: ["IBM Cloud Pak for Data", "IBM InfoSphere MDM", "watsonx.ai", "Java Spring AI", "SPSS Modeler", "Data Warehousing"],
      features: [
        "Master data governance framework definition and unified data views",
        "Automated data pipeline integration, quality checks, and warehousing",
        "Generative AI operationalization using watsonx.ai and Spring AI",
        "Predictive analytics, machine learning model training, and executive dashboards"
      ],
      impact: "Transform historical enterprise data into governed, real-time insights and enterprise-ready generative AI."
    },
    "3": {
      title: "Cloud Infrastructure & Hybrid Modernization",
      categoryBadge: "CLOUD & HYBRID MODERNIZATION",
      overview: "EXACT guides enterprise workload migration, container orchestration, application server hardening, and multi-cloud infrastructure operations.",
      image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
      technologies: ["Red Hat OpenShift", "IBM WebSphere", "IaaS / PaaS / SaaS", "Workload Migration", "Dynatrace APM", "Cloud Security"],
      features: [
        "Cloud readiness, hybrid architecture risk assessment, and roadmap definition",
        "Application server installation, LDAP integration, and HA clustering",
        "Zero-downtime workload migration to Red Hat OpenShift and multi-cloud",
        "Performance tuning, bottleneck diagnostics, and automated cloud monitoring"
      ],
      impact: "Achieve smooth cloud adoption with 99.99% availability and optimized infrastructure costs."
    },
    "4": {
      title: "Business Process Transformation & Automation",
      categoryBadge: "PROCESS & AUTOMATION",
      overview: "EXACT optimizes and automates end-to-end business workflows to reduce manual effort, enforce compliance rules, and accelerate turnaround times.",
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
      technologies: ["IBM BAW", "IBM ODM", "Automation Anywhere RPA", "Decision Modeling", "Custom Enablement Labs"],
      features: [
        "Process mapping, bottleneck redesign, and operational workflow optimization",
        "IBM Business Automation Workflow (BAW) and ODM rule governance",
        "Robotic Process Automation (RPA) for repetitive, rule-based execution",
        "Hands-on technical enablement, operational handover, and admin training"
      ],
      impact: "Reduce operational turnaround times by up to 70% while ensuring 100% compliance and team enablement."
    },
    "5": {
      title: "Cybersecurity & Risk Control",
      categoryBadge: "CYBERSECURITY & RISK",
      overview: "EXACT protects integration points, identities, and hybrid platforms with controlled access, monitored exposure, and security practices that travel with the architecture.",
      image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80",
      technologies: ["OAuth 2.0 / mTLS", "API Gateways", "Identity & Access", "Cloud Security", "IBM API Connect", "Zero Trust"],
      features: [
        "Security assessment across APIs, integrations, and hybrid platforms",
        "Identity, access, and encrypted service-to-service controls",
        "Gateway policies for exposure, throttling, and threat filtering",
        "Handover of operating controls, runbooks, and response routines"
      ],
      impact: "Reduce exposed integration risk while keeping delivery moving across cloud and on-premises systems."
    },
    "6": {
      title: "Observability & Operations",
      categoryBadge: "OBSERVABILITY & OPERATIONS",
      overview: "EXACT gives operations teams a clear view of performance, availability, and handover so platforms stay measurable after go-live.",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
      technologies: ["Dynatrace APM", "IBM WebSphere", "Red Hat OpenShift", "Service Monitoring", "Runbooks", "HA Operations"],
      features: [
        "Application and infrastructure monitoring with actionable baselines",
        "Bottleneck tracing across integration, cloud, and automation flows",
        "Availability, capacity, and incident routines for hybrid estates",
        "Structured operational handover with documented ownership"
      ],
      impact: "Keep production measurable, with faster diagnosis and a clean handover into day-to-day operations."
    }
  };

  // 5. Services showcase — pinned vertical scroll drives a right-to-left card track
  const servicesSection = document.getElementById('services-carousel-section');
  const carouselTrack = document.getElementById('solutions-carousel-track');
  const carouselIndicator = document.getElementById('carousel-page-indicator');
  const filterPills = document.querySelectorAll('#category-filters .tag-pill');
  const featureCards = document.querySelectorAll('.feature-card');

  let isDown = false;
  let startX = 0;
  let startScrollLeft = 0;
  let dragDistance = 0;
  let isDraggingMoved = false;
  let lastX = 0;
  let velocity = 0;
  let momentumID = null;
  let servicesScroll = null;

  const getServiceCards = () => (
    carouselTrack ? [...carouselTrack.querySelectorAll('.service-carousel-card')] : []
  );

  const getTrackEnd = () => {
    const cards = getServiceCards();
    if (!cards.length) return 0;
    const last = cards[cards.length - 1];
    return last.offsetLeft + last.offsetWidth;
  };

  const updatePinnedIndicator = () => {
    if (!carouselTrack || !carouselIndicator || !servicesSection) return;
    const cards = getServiceCards();
    if (!cards.length) {
      carouselIndicator.textContent = '1/1';
      return;
    }
    const view = servicesSection.getBoundingClientRect();
    let best = 0;
    let bestVisible = -1;
    cards.forEach((card, index) => {
      const rect = card.getBoundingClientRect();
      const visible = Math.min(rect.right, view.right) - Math.max(rect.left, view.left);
      if (visible > bestVisible) {
        bestVisible = visible;
        best = index;
      }
    });
    carouselIndicator.textContent = `${bestVisible > 8 ? best + 1 : 1}/${cards.length}`;
  };

  const initPinnedServicesScroll = () => {
    const hero = document.getElementById('hero');
    if (!hero || !servicesSection || !carouselTrack) return null;
    if (!servicesSection.classList.contains('is-scroll-driven')) return null;
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      servicesSection.classList.remove('is-scroll-driven');
      return null;
    }

    const viewWidth = () => hero.clientWidth || window.innerWidth;
    const nav = document.getElementById('main-nav');

    const applyCardPanels = (trackX) => {
      const viewW = viewWidth();
      getServiceCards().forEach((card) => {
        const cardX = card.offsetLeft + trackX;
        const start = viewW * 0.92;
        const end = Math.min(40, viewW * 0.05);
        const t = Math.min(1, Math.max(0, (start - cardX) / Math.max(1, start - end)));
        const imagePct = 58 + 10 * t;
        card.style.gridTemplateRows = imagePct + '% ' + (100 - imagePct) + '%';
        const img = card.querySelector('.card-bg-img');
        if (img) img.style.transform = 'scale(' + (1.06 - 0.06 * t).toFixed(4) + ')';
      });
    };

    const applyTrack = () => {
      const pin = ScrollTrigger.getById('servicesPin');
      const viewW = viewWidth();
      const trackEnd = getTrackEnd();
      const startX = viewW;
      const endX = viewW - trackEnd;

      if (!pin) {
        gsap.set(carouselTrack, { x: startX, force3D: true });
        applyCardPanels(startX);
        updatePinnedIndicator();
        return;
      }

      const distance = Math.max(1, pin.end - pin.start);
      const progress = Math.min(1, Math.max(0, (pin.scroll() - pin.start) / distance));
      const x = startX + (endX - startX) * progress;
      gsap.set(carouselTrack, { x, force3D: true });
      applyCardPanels(x);

      if (nav && !document.body.classList.contains('is-loading')) {
        const navFade = Math.min(1, Math.max(0, (progress - 0.004) / 0.05));
        gsap.set(nav, { autoAlpha: 1 - navFade });
      }

      updatePinnedIndicator();
    };

    ScrollTrigger.create({
      id: 'servicesPin',
      trigger: hero,
      start: 'top top',
      end: () => '+=' + Math.max(1, getTrackEnd()),
      pin: true,
      pinSpacing: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: applyTrack,
      onRefresh: applyTrack
    });

    applyTrack();
    window.addEventListener('load', () => ScrollTrigger.refresh());

    const scrollToShift = (targetX) => {
      const pin = ScrollTrigger.getById('servicesPin');
      if (!pin) return;
      const viewW = viewWidth();
      const trackEnd = getTrackEnd();
      const startX = viewW;
      const endX = viewW - trackEnd;
      const x = Math.max(Math.min(startX, endX), Math.min(Math.max(startX, endX), targetX));
      const distance = Math.max(1, pin.end - pin.start);
      const progress = (startX - x) / Math.max(1, startX - endX);
      const top = pin.start + progress * distance;
      if (lenis) {
        lenis.scrollTo(top, { duration: 1.05, force: true });
      } else {
        window.scrollTo({ top, behavior: 'smooth' });
      }
    };

    return {
      scrollToCard(card) {
        if (!card) return;
        scrollToShift(-card.offsetLeft);
      },
      scrollToStart() {
        scrollToShift(0);
      }
    };
  };

  servicesScroll = initPinnedServicesScroll();

  const updateCarouselIndicator = () => {
    if (servicesScroll) {
      updatePinnedIndicator();
      return;
    }
    if (!carouselTrack || !carouselIndicator) return;
    const scrollLeft = carouselTrack.scrollLeft;
    const maxScroll = carouselTrack.scrollWidth - carouselTrack.clientWidth;

    if (maxScroll <= 10) {
      carouselIndicator.textContent = '1/1';
      return;
    }

    const firstCard = carouselTrack.querySelector('.service-carousel-card');
    const cardStep = firstCard ? firstCard.offsetWidth + 27 : 470;
    const totalPages = Math.max(2, Math.round(maxScroll / cardStep) + 1);
    const currentPage = Math.min(
      totalPages,
      Math.max(1, Math.round((scrollLeft / maxScroll) * (totalPages - 1)) + 1)
    );
    carouselIndicator.textContent = `${currentPage}/${totalPages}`;
  };

  if (carouselTrack && !servicesScroll) {
    carouselTrack.addEventListener('scroll', updateCarouselIndicator, { passive: true });
    window.addEventListener('resize', updateCarouselIndicator);
    setTimeout(updateCarouselIndicator, 150);

    // Mouse Drag & Hold Engine ("grab the line and go right or left")
    const onMouseDown = (e) => {
      if (e.button !== 0) return; // Only primary mouse button
      isDown = true;
      isDraggingMoved = false;
      dragDistance = 0;
      startX = e.pageX;
      lastX = e.pageX;
      startScrollLeft = carouselTrack.scrollLeft;
      velocity = 0;
      if (momentumID) cancelAnimationFrame(momentumID);

      carouselTrack.classList.add('is-dragging');
    };

    const onMouseMove = (e) => {
      if (!isDown) return;
      e.preventDefault();
      const currentX = e.pageX;
      const walk = currentX - startX;
      dragDistance = Math.abs(walk);

      velocity = currentX - lastX;
      lastX = currentX;

      if (dragDistance > 6) {
        isDraggingMoved = true;
      }

      carouselTrack.scrollLeft = startScrollLeft - walk;
    };

    const onMouseUp = () => {
      if (!isDown) return;
      isDown = false;
      carouselTrack.classList.remove('is-dragging');

      // Keep isDraggingMoved true momentarily to prevent accidental card click triggers
      if (dragDistance > 6) {
        setTimeout(() => {
          isDraggingMoved = false;
          dragDistance = 0;
        }, 80);
      } else {
        isDraggingMoved = false;
        dragDistance = 0;
      }

      // Smooth inertia momentum glide
      if (Math.abs(velocity) > 2) {
        let currentVelocity = velocity * 1.6;
        const stepMomentum = () => {
          if (Math.abs(currentVelocity) < 0.5) {
            cancelAnimationFrame(momentumID);
            return;
          }
          carouselTrack.scrollLeft -= currentVelocity;
          currentVelocity *= 0.92;
          momentumID = requestAnimationFrame(stepMomentum);
        };
        momentumID = requestAnimationFrame(stepMomentum);
      }
    };

    carouselTrack.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Prevent default drag of images/links
    carouselTrack.addEventListener('dragstart', (e) => e.preventDefault());
  } else if (carouselTrack) {
    carouselTrack.addEventListener('dragstart', (e) => e.preventDefault());
  }

  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      const filterValue = pill.dataset.filter;
      if (servicesScroll) {
        if (filterValue === 'all') {
          servicesScroll.scrollToStart();
        } else {
          const targetCard = carouselTrack?.querySelector(`[data-category="${filterValue}"]`);
          servicesScroll.scrollToCard(targetCard);
        }
        return;
      }

      if (filterValue === 'all') {
        carouselTrack?.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        const targetCard = carouselTrack?.querySelector(`[data-category="${filterValue}"]`);
        if (targetCard) {
          targetCard.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
        }
      }
    });
  });

  // 6. Global Search Filter
  const globalSearchInput = document.getElementById('global-search');
  globalSearchInput?.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();

    featureCards.forEach(card => {
      const label = card.querySelector('.card-label')?.textContent.toLowerCase() || '';
      const meta = card.querySelector('.service-blurb')?.textContent.toLowerCase() || '';
      card.classList.toggle('is-filtered-out', !(label.includes(query) || meta.includes(query)));
    });
  });

  // 7. Rich Interactive Solution Detail Modal Handler
  const exactModal = document.getElementById('exact-solution-modal');
  const closeExactModal = document.getElementById('close-exact-modal');
  const btnModalCloseAction = document.getElementById('btn-modal-close-action');
  const btnModalConsult = document.getElementById('btn-modal-consult');

  const modalCategoryBadge = document.getElementById('modal-category-badge');
  const modalTitle = document.getElementById('modal-title');
  const modalOverview = document.getElementById('modal-overview');
  const modalHeroImg = document.getElementById('modal-hero-img');
  const modalTechTags = document.getElementById('modal-tech-tags');
  const modalFeatureList = document.getElementById('modal-feature-list');
  const modalImpactText = document.getElementById('modal-impact-text');

  const openSolutionModal = (solutionId) => {
    const data = exactSolutionsData[solutionId];
    if (!data) return;

    if (modalCategoryBadge) modalCategoryBadge.textContent = data.categoryBadge;
    if (modalTitle) modalTitle.textContent = data.title;
    if (modalOverview) modalOverview.textContent = data.overview;
    if (modalHeroImg) modalHeroImg.src = data.image;
    if (modalImpactText) modalImpactText.textContent = data.impact;

    // Render Technology tags
    if (modalTechTags) {
      modalTechTags.innerHTML = data.technologies.map(t => `<span class="exact-tech-pill">${t}</span>`).join('');
    }

    // Render Capabilities list
    if (modalFeatureList) {
      modalFeatureList.innerHTML = data.features.map(f => `<li>${f}</li>`).join('');
    }

    const modalBody = exactModal?.querySelector('.exact-modal-body');
    if (modalBody) modalBody.scrollTop = 0;

    exactModal?.classList.add('active');
    exactModal?.setAttribute('aria-hidden', 'false');
    if (lenis) lenis.stop();
  };

  const closeSolutionModal = () => {
    exactModal?.classList.remove('active');
    exactModal?.setAttribute('aria-hidden', 'true');
    if (lenis) lenis.start();
  };

  // Attach click listener to every feature card and details link
  featureCards.forEach(card => {
    card.addEventListener('click', (e) => {
      // If user was holding/dragging to move the carousel, prevent opening modal
      if (isDraggingMoved || dragDistance > 6) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      const solutionId = card.dataset.solution;
      if (solutionId) openSolutionModal(solutionId);
    });

    const detailsLink = card.querySelector('.card-details-link');
    detailsLink?.addEventListener('click', (e) => {
      if (isDraggingMoved || dragDistance > 6) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      e.stopPropagation();
      const solutionId = card.dataset.solution;
      if (solutionId) openSolutionModal(solutionId);
    });
  });

  closeExactModal?.addEventListener('click', closeSolutionModal);
  btnModalCloseAction?.addEventListener('click', closeSolutionModal);

  exactModal?.addEventListener('click', (e) => {
    if (e.target === exactModal) closeSolutionModal();
  });

  // ESC key to close modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && exactModal?.classList.contains('active')) {
      closeSolutionModal();
    }
  });

  // Smooth Toast notification helper
  const showToast = (msg) => {
    const toast = document.createElement('div');
    toast.textContent = msg;
    toast.style.position = 'fixed';
    toast.style.bottom = '24px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.backgroundColor = 'var(--color-ink-black)';
    toast.style.color = 'var(--color-paper-white)';
    toast.style.padding = '12px 24px';
    toast.style.borderRadius = '9999px';
    toast.style.fontSize = '14px';
    toast.style.zIndex = '100000';
    toast.style.transition = 'all 0.3s ease';
    toast.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)';
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  };

  btnModalConsult?.addEventListener('click', () => {
    closeSolutionModal();
    showToast('Solution Brief requested! An EXACT consultant will contact you shortly.');
  });

  const requestDemo = (e) => {
    e.preventDefault();
    showToast('Demo request logged. An EXACT consultant will be in touch.');
  };

  document.getElementById('btn-request-demo')?.addEventListener('click', requestDemo);
  document.getElementById('btn-hero-demo')?.addEventListener('click', requestDemo);

  // Mark the nav link for the section currently in view
  const navLinks = Array.from(document.querySelectorAll('.nav-link'));
  const navIndicator = document.querySelector('.nav-indicator');
  const navSections = navLinks
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean)
    .sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));

  const placeIndicator = (link) => {
    if (!navIndicator || !link) {
      if (navIndicator) navIndicator.style.opacity = '0';
      return;
    }
    const parent = link.parentElement;
    const linkRect = link.getBoundingClientRect();
    const parentRect = parent.getBoundingClientRect();
    navIndicator.style.width = `${linkRect.width}px`;
    navIndicator.style.transform = `translateX(${linkRect.left - parentRect.left}px)`;
    navIndicator.style.opacity = '1';
  };

  const setActiveLink = (id) => {
    let active = null;
    navLinks.forEach((link) => {
      const match = link.getAttribute('href') === `#${id}`;
      link.classList.toggle('active', match);
      if (match) {
        link.setAttribute('aria-current', 'true');
        active = link;
      } else {
        link.removeAttribute('aria-current');
      }
    });
    placeIndicator(active);
  };

  const updateActiveSection = () => {
    const markLine = 140;
    let current = '';
    navSections.forEach((section) => {
      if (section.getBoundingClientRect().top <= markLine) {
        current = section.id;
      }
    });
    setActiveLink(current);
  };

  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      setActiveLink(target.id);
      if (lenis) {
        lenis.scrollTo(target, { offset: -110 });
      } else {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  document.getElementById('btn-hero-request-demo')?.addEventListener('click', (e) => {
    e.preventDefault();
    showToast('Demo request logged for EXACT Digital Platform.');
  });

});
