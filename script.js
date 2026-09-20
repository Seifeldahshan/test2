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
    gsap.set('.hero-content .eyebrow-label', { y: 20, opacity: 0 });
    gsap.set('.hero-headline-masked .mask-inner', { yPercent: 100 });
    gsap.set('.hero-subtext', { y: 24, opacity: 0 });
    gsap.set('.hero-content .button-row', { scale: 0.95, opacity: 0 });
    gsap.set('.hero-image', { scale: 1.05, opacity: 0 });

    const masterTL = gsap.timeline();

    // PHASE 1 — CENTERED BRAND REVEAL IN PRELOADER
    masterTL.to('.preloader-brand', {
      opacity: 1,
      scale: 1,
      duration: 1.1,
      ease: 'power2.out'
    }, 0.2);

    // Brief hold in center
    masterTL.to({}, { duration: 0.6 });

    // PHASE 2 — EXIT WIPE
    masterTL.to('.preloader-content', {
      opacity: 0,
      y: -24,
      duration: 0.4,
      ease: 'power2.inOut'
    });

    // Panel 1 translating up
    masterTL.to('.preloader-panel-1', {
      yPercent: -100,
      duration: 1.0,
      ease: 'power4.inOut'
    }, '-=0.1');

    // Panel 2 translating up (staggered behind panel 1)
    masterTL.to('.preloader-panel-2', {
      yPercent: -100,
      duration: 1.0,
      ease: 'power4.inOut'
    }, '-=0.9');

    // PHASE 3 — HERO REVEAL CASCADE (Overlaps tail of phase 2)
    // 1. Navigation bar
    masterTL.to('#main-nav', {
      y: 0,
      opacity: 1,
      duration: 0.9,
      ease: 'power3.out'
    }, '-=0.7');

    // 2. Eyebrow badge label
    masterTL.to('.hero-content .eyebrow-label', {
      y: 0,
      opacity: 1,
      duration: 0.8,
      ease: 'power3.out'
    }, '-=0.75');

    // 3. Headline masked lines (translateY(100%) -> 0 per line from behind hard edge)
    masterTL.to('.hero-headline-masked .mask-inner', {
      yPercent: 0,
      duration: 1.1,
      stagger: 0.12,
      ease: 'power4.out'
    }, '-=0.65');

    // 4. Subheading
    masterTL.to('.hero-subtext', {
      y: 0,
      opacity: 1,
      duration: 0.9,
      ease: 'power3.out'
    }, '-=0.8');

    // 5. CTA button(s) opacity + scale(0.95 -> 1)
    masterTL.to('.hero-content .button-row', {
      scale: 1,
      opacity: 1,
      duration: 0.8,
      ease: 'power3.out'
    }, '-=0.7');

    // 6. Hero visual (scale 1.05 -> 1 & opacity) + float handoff
    masterTL.to('.hero-image', {
      scale: 1,
      opacity: 1,
      duration: 1.2,
      ease: 'power4.out',
      onComplete: () => {
        gsap.to('.hero-image img', {
          y: 6,
          duration: 4.5,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true
        });
      }
    }, '-=0.9');

    // Clean up preloader overlay & start Lenis smooth scroll
    masterTL.add(() => {
      if (preloaderEl) {
        preloaderEl.style.display = 'none';
        preloaderEl.style.pointerEvents = 'none';
      }
      document.body.classList.remove('is-loading');
      if (lenis) lenis.start();
    }, '-=1.0');
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
    gsap.utils.toArray('.filter-header, .studio-card').forEach((el) => {
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

  // EXACT Solutions Portfolio Detailed Data Repository
  const exactSolutionsData = {
    "1": {
      title: "Enterprise Integration & Middleware",
      categoryBadge: "INTEGRATION & MIDDLEWARE",
      overview: "EXACT connects applications, data, APIs, legacy platforms, and event-driven services across on-premises, cloud, and hybrid environments.",
      image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80",
      technologies: ["IBM CP4I", "IBM App Connect", "IBM API Connect", "IBM MQ", "IBM Event Streams", "IBM Aspera", "IBM DataPower", "WebSphere", "Java Spring Boot"],
      features: [
        "Assessment, requirements, ROI, and architecture definition",
        "Installation, HA configuration, and performance tuning",
        "API development, security, testing, and lifecycle governance",
        "Controlled migration, upgrades, and 24/7 go-live support"
      ],
      impact: "Eliminate data silos, reduce integration latency, and build a resilient event-driven architecture."
    },
    "2": {
      title: "API Management & Digital Connectivity",
      categoryBadge: "API & DIGITAL CONNECTIVITY",
      overview: "EXACT helps organizations expose, secure, govern, and manage APIs for digital channels, partner connectivity, application modernization, and ecosystem integration.",
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
      technologies: ["REST APIs", "SOAP", "GraphQL", "API Manager", "Cloud Manager", "Developer Portal", "OAuth 2.0 / mTLS"],
      features: [
        "REST, SOAP, and GraphQL API development & security routing",
        "API gateway security, transformation, enrichment, and logging",
        "API lifecycle management using API Manager and Cloud Manager",
        "Developer Portal configuration, subscription, and app registration",
        "On-premises, containerized, cloud, and managed deployment support"
      ],
      impact: "Accelerate partner integration and protect digital assets with zero-trust API gateway security."
    },
    "3": {
      title: "Java Spring Application Services",
      categoryBadge: "APPLICATION DEVELOPMENT",
      overview: "EXACT develops and modernizes enterprise applications and integration services using Java and the Spring ecosystem.",
      image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
      technologies: ["Spring Core", "Spring Boot", "Spring Security", "Spring Data JPA", "RESTful APIs", "Microservices Architecture"],
      features: [
        "Spring Core architecture and high-performance design",
        "Spring Boot microservices applications and REST APIs",
        "Spring Security implementation and OAuth2 protection",
        "Spring Data JPA, database integration, and performance tuning",
        "Integration with enterprise platforms, APIs, databases, and messaging"
      ],
      impact: "Deliver scalable, cloud-ready Java microservices with built-in security and high throughput."
    },
    "4": {
      title: "Information Integration & Data Governance",
      categoryBadge: "DATA & GOVERNANCE",
      overview: "EXACT helps organizations establish consistent, governed, and reliable information across operational, transactional, and analytical environments.",
      image: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=1200&q=80",
      technologies: ["IBM InfoSphere MDM", "Master Data Management", "Data Stewardship", "Data Governance", "Consolidation Tools"],
      features: [
        "Master data assessment and governance framework definition",
        "Data integration, quality, ownership, and consistency rules",
        "IBM InfoSphere Master Data Management implementation",
        "Unified views of customers, products, suppliers, locations, and accounts"
      ],
      impact: "Establish a unified master data foundation that eliminates duplicate records and ensures compliance."
    },
    "5": {
      title: "Business Process Transformation & Automation",
      categoryBadge: "PROCESS & AUTOMATION",
      overview: "EXACT improves and automates business processes to reduce manual effort, improve control, accelerate turnaround time, and increase visibility.",
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
      technologies: ["IBM BAW", "IBM ODM", "Robotic Process Automation", "Decision Modeling", "KPI Monitoring"],
      features: [
        "Process assessment, mapping, redesign, and optimization",
        "IBM Business Automation Workflow (BAW) implementation",
        "IBM Operational Decision Manager (ODM) business-rule governance",
        "Workflow integration with core enterprise applications, APIs, and data",
        "Robotic Process Automation (RPA) for repetitive, rule-based tasks"
      ],
      impact: "Reduce operational turnaround times by up to 70% while ensuring 100% process rule compliance."
    },
    "6": {
      title: "Information Management, Data Platforms & AI",
      categoryBadge: "AI & ENTERPRISE DATA",
      overview: "EXACT helps organizations turn enterprise data into usable information and AI-enabled business value.",
      image: "https://images.unsplash.com/photo-1535378917042-10a22c95931a?auto=format&fit=crop&w=1200&q=80",
      technologies: ["IBM Cloud Pak for Data", "watsonx.ai", "Java Spring AI", "Big Data Lakes", "Data Warehousing"],
      features: [
        "Enterprise data warehouse and data repository services",
        "Data integration, preparation, and automated pipeline setup",
        "IBM Cloud Pak for Data enablement and governance",
        "AI and analytics use-case assessment and operationalization",
        "IBM watsonx.ai and Java Spring AI solution integration"
      ],
      impact: "Empower enterprise decision-makers with real-time analytics and enterprise-ready generative AI."
    },
    "7": {
      title: "Predictive & Advanced Analytics",
      categoryBadge: "ADVANCED ANALYTICS",
      overview: "EXACT uses statistical analysis, machine learning, and advanced analytics to support evidence-based decisions.",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
      technologies: ["IBM SPSS Modeler", "Machine Learning", "Statistical Modeling", "Executive Dashboards", "Prescriptive AI"],
      features: [
        "Predictive analytics use-case identification and scoping",
        "IBM SPSS Modeler services and machine learning algorithms",
        "Statistical, machine learning, and AI model training",
        "Model deployment into live business operations and workflows",
        "Diagnostic, predictive, and prescriptive management dashboards"
      ],
      impact: "Transform historical enterprise data into accurate forecasts and proactive risk alerts."
    },
    "8": {
      title: "Enterprise Application Infrastructure",
      categoryBadge: "INFRASTRUCTURE & MIDDLEWARE",
      overview: "EXACT provides infrastructure and middleware services for secure, stable, and high-performing enterprise application environments.",
      image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1200&q=80",
      technologies: ["IBM WebSphere", "LDAP", "Enterprise Architecture", "High Availability Clustering", "Performance Diagnostics"],
      features: [
        "Enterprise and solution architecture design",
        "Application server and middleware installation and hardening",
        "Database, LDAP, security, clustering, and HA configuration",
        "Performance tuning, diagnostics, and bottleneck troubleshooting",
        "Migration, upgrades, patching, and controlled production go-live"
      ],
      impact: "Ensure 99.99% infrastructure availability for mission-critical application workloads."
    },
    "9": {
      title: "Cloud & Hybrid Infrastructure Services",
      categoryBadge: "CLOUD & HYBRID",
      overview: "EXACT supports customers from cloud readiness assessment through migration, deployment, optimization, and operations.",
      image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
      technologies: ["Hybrid Architecture", "Red Hat OpenShift", "IaaS / PaaS / SaaS", "Workload Migration", "Cloud Security"],
      features: [
        "Cloud readiness and workload risk assessment",
        "On-premises, cloud, and hybrid architecture design",
        "IaaS, PaaS, and SaaS implementation support",
        "Application and workload migration to cloud environments",
        "Security, connectivity, integration, and post-migration optimization"
      ],
      impact: "Achieve smooth cloud adoption with zero workload interruption and optimized resource usage."
    },
    "10": {
      title: "Professional Training & Knowledge Transfer",
      categoryBadge: "PROFESSIONAL ENABLEMENT",
      overview: "EXACT provides practical technical training aligned with customer platforms, project requirements, and operational responsibilities.",
      image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80",
      technologies: ["Instructor-Led Training", "Hands-on Labs", "Admin & Dev Enablement", "Handover Documentation"],
      features: [
        "Instructor-led training and hands-on technical labs",
        "Administrator, developer, architect, and operations enablement",
        "Customized workshops tailored to customer stack",
        "Operational handover and comprehensive documentation",
        "Knowledge transfer for integration, middleware, data, AI, and cloud"
      ],
      impact: "Ensure your internal engineering team is fully equipped to maintain and extend your solution."
    }
  };

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
        if (filterValue === 'all' || categories.includes(filterValue)) {
          card.style.display = 'flex';
          if (typeof gsap !== 'undefined') {
            gsap.fromTo(card, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.4 });
          }
        } else {
          card.style.display = 'none';
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
      const meta = card.querySelector('.card-meta')?.textContent.toLowerCase() || '';
      if (label.includes(query) || meta.includes(query)) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
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

  document.getElementById('btn-add-tile')?.addEventListener('click', () => {
    showToast('Consultation request initiated. Our architecture team will be in touch.');
  });

  document.getElementById('btn-request-demo')?.addEventListener('click', (e) => {
    e.preventDefault();
    showToast('Demo request logged for EXACT Digital Platform.');
  });

});
