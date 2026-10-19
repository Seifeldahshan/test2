// Cosmos Interactive Engine
document.addEventListener('DOMContentLoaded', () => {

  // Prevent scroll during preloader loading phase
  document.body.classList.add('is-loading');

  // Register GSAP plugins
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  // 0. Smooth Scroll Layer (Lenis) with inertia lerp
  let lenis;
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
    gsap.set('.hero-rule', { scaleX: 0, opacity: 0, transformOrigin: 'left center' });
    gsap.set('.hero-headline-masked .mask-inner', { yPercent: 100 });
    gsap.set('.hero-content .button-row', { scale: 0.95, opacity: 0 });
    gsap.set('.hero-image', { scale: 1.05, opacity: 0 });

    const masterTL = gsap.timeline({
      onComplete: () => {
        if (preloaderEl) {
          preloaderEl.classList.add('is-hidden');
          preloaderEl.style.display = 'none';
        }
        document.body.classList.remove('is-loading');
        if (lenis) lenis.start();
        if (typeof ScrollTrigger !== 'undefined') {
          ScrollTrigger.refresh();
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

    // PHASE 3 — HERO REVEAL CASCADE
    masterTL.to('#main-nav', {
      y: 0,
      opacity: 1,
      duration: 0.6,
      ease: 'power3.out'
    }, '-=0.4');

    masterTL.to('.hero-rule', {
      scaleX: 1,
      opacity: 1,
      duration: 0.5,
      ease: 'power3.out'
    }, '-=0.45');

    masterTL.to('.hero-headline-masked .mask-inner', {
      yPercent: 0,
      duration: 0.7,
      stagger: 0.08,
      ease: 'power3.out'
    }, '-=0.35');

    masterTL.to('.hero-content .button-row', {
      scale: 1,
      opacity: 1,
      duration: 0.5,
      ease: 'power3.out'
    }, '-=0.45');

    masterTL.to('.hero-image', {
      scale: 1,
      opacity: 1,
      duration: 0.7,
      ease: 'power3.out',
      onComplete: () => {
        gsap.to('.hero-image img', {
          y: 6,
          duration: 4.5,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true
        });
      }
    }, '-=0.6');
  }

  // PHASE 4 — SCROLL REVEALS (ScrollTrigger for downstream sections)
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    // Feature cards reveal on scroll
    gsap.utils.toArray('.feature-card').forEach((card) => {
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
    gsap.utils.toArray('.filter-header, .about-frame').forEach((el) => {
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

  // 1. Theme Toggle (Light Linen Canvas <-> Dark Canvas)
  const themeToggleBtn = document.getElementById('theme-toggle');
  const sunIcon = themeToggleBtn?.querySelector('.sun-icon');
  const moonIcon = themeToggleBtn?.querySelector('.moon-icon');

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

  // EXACT Solutions Portfolio Detailed Data Repository (4 Master Pillars)
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
      title: "Security, Identity & Observability",
      categoryBadge: "SECURITY & OBSERVABILITY",
      overview: "EXACT hardens the platforms it delivers — identity, access, monitoring, and the visibility teams need to run them safely.",
      image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80",
      technologies: ["Identity & Access", "OAuth 2.0 / mTLS", "Dynatrace", "IBM Security", "SIEM", "Zero Trust"],
      features: [
        "Identity, access, and privileged-control design across hybrid estates",
        "Observability for applications, APIs, and infrastructure already in production",
        "Monitoring, alerting, and response paths the operations team can actually run",
        "Security review tied to the same lifecycle as design, build, and handover"
      ],
      impact: "Production systems stay visible, controlled, and ready to operate."
    },
    "6": {
      title: "Managed Support & Enablement",
      categoryBadge: "MANAGED SUPPORT",
      overview: "EXACT stays after go-live with structured support, maintenance, and the training that lets client teams run what was built.",
      image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80",
      technologies: ["ManageEngine", "Patch Management", "Runbooks", "Knowledge Transfer", "ITSM"],
      features: [
        "Maintenance windows, patches, and operational care after go-live",
        "Runbooks and handover so ownership is clear",
        "Admin enablement and hands-on training for the teams who will run the platform",
        "A support path that matches the way the system was designed and delivered"
      ],
      impact: "The platform keeps performing with the same discipline it was delivered with."
    }
  };

  // Service slider — one card at a time, in the direction of the arrows
  const serviceTrack = document.getElementById('feature-grid');
  const scrollServices = (direction) => {
    if (!serviceTrack) return;
    const card = serviceTrack.querySelector('.feature-card');
    const gap = 22;
    const distance = (card ? card.getBoundingClientRect().width : 360) + gap;
    serviceTrack.scrollBy({ left: direction * distance, behavior: 'smooth' });
  };
  document.getElementById('services-prev')?.addEventListener('click', () => scrollServices(-1));
  document.getElementById('services-next')?.addEventListener('click', () => scrollServices(1));

  // 5. Category Filtering
  const filterPills = document.querySelectorAll('#category-filters .tag-pill');
  const featureCards = document.querySelectorAll('.feature-card');

  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      const filterValue = pill.dataset.filter;

      featureCards.forEach(card => {
        const categories = card.dataset.category || '';
        const show = filterValue === 'all' || categories.includes(filterValue);
        card.classList.toggle('is-filtered-out', !show);
        if (show && typeof gsap !== 'undefined') {
          gsap.fromTo(card, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' });
        }
      });
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

    const modalScroll = exactModal?.querySelector('.exact-modal-body');
    const modalLayout = exactModal?.querySelector('.exact-modal-layout');
    if (modalScroll) modalScroll.scrollTop = 0;
    if (modalLayout) modalLayout.scrollTop = 0;

    exactModal?.classList.add('active');
    exactModal?.setAttribute('aria-hidden', 'false');
    if (lenis) lenis.stop();
  };

  const closeSolutionModal = () => {
    exactModal?.classList.remove('active');
    exactModal?.setAttribute('aria-hidden', 'true');
    if (lenis) lenis.start();
  };

  // Attach click listener to every feature card and inspect button
  featureCards.forEach(card => {
    card.addEventListener('click', () => {
      const solutionId = card.dataset.solution;
      if (solutionId) openSolutionModal(solutionId);
    });

    const inspectBtn = card.querySelector('.card-inspect-btn');
    inspectBtn?.addEventListener('click', (e) => {
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

  if (lenis) {
    lenis.on('scroll', updateActiveSection);
  } else {
    window.addEventListener('scroll', updateActiveSection, { passive: true });
  }
  window.addEventListener('resize', updateActiveSection);
  updateActiveSection();
  if (document.fonts?.ready) {
    document.fonts.ready.then(updateActiveSection);
  }

});
