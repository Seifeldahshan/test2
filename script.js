// Cosmos Interactive Engine
document.addEventListener('DOMContentLoaded', () => {

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

  // 7. Lightbox Image Modal
  const imageModal = document.getElementById('image-modal');
  const closeImageModal = document.getElementById('close-image-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxMeta = document.getElementById('lightbox-desc');

  const inspectButtons = document.querySelectorAll('.card-inspect-btn');

  inspectButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = btn.closest('.feature-card');
      const img = card.querySelector('img');
      const label = card.querySelector('.card-label')?.textContent;
      const meta = card.querySelector('.card-meta')?.textContent;

      if (lightboxImg && img) lightboxImg.src = img.src;
      if (lightboxTitle && label) lightboxTitle.textContent = label;
      if (lightboxMeta && meta) lightboxMeta.textContent = meta;

      imageModal?.classList.add('active');
    });
  });

  closeImageModal?.addEventListener('click', () => {
    imageModal?.classList.remove('active');
  });

  imageModal?.addEventListener('click', (e) => {
    if (e.target === imageModal) imageModal.classList.remove('active');
  });

  // 8. Dynamic Polaroid Tile Pinning (+ Pin New Tile)
  const btnAddTile = document.getElementById('btn-add-tile');
  const heroCollage = document.getElementById('orbit-container');
  const sampleImages = [
    'https://images.unsplash.com/photo-1579783901586-d88ce727fa24?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1543857778-c4a1a3e0b2eb?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1515405295579-ba7b45403062?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=400&q=80'
  ];

  btnAddTile?.addEventListener('click', () => {
    if (!heroCollage) return;
    const randomImg = sampleImages[Math.floor(Math.random() * sampleImages.length)];
    const randomTop = Math.floor(Math.random() * 60) + 10;
    const randomLeft = Math.floor(Math.random() * 80) + 10;
    const randomRot = Math.floor(Math.random() * 16) - 8;

    const newTile = document.createElement('div');
    newTile.className = 'floating-tile';
    newTile.dataset.speed = (Math.random() * 0.08 - 0.04).toFixed(2);
    newTile.style.top = `${randomTop}%`;
    newTile.style.left = `${randomLeft}%`;
    newTile.style.transform = `rotate(${randomRot}deg)`;

    newTile.innerHTML = `
      <img src="${randomImg}" alt="Pinned Polaroid">
      <div class="tile-pin"></div>
    `;

    heroCollage.appendChild(newTile);
  });

  // Reset Collage Grid button
  const btnResetCollage = document.getElementById('btn-reset-collage');
  btnResetCollage?.addEventListener('click', () => {
    window.location.reload();
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
    toast.style.zIndex = '3000';
    toast.style.transition = 'all 0.3s ease';
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  };

  // Prevent action on Request a Meeting button
  document.getElementById('btn-hero-primary')?.addEventListener('click', (e) => {
    e.preventDefault();
  });
  document.getElementById('btn-request-demo')?.addEventListener('click', (e) => {
    e.preventDefault();
  });

});
