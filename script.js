/**
 * WEBLITEX (WWW.WEBLITEX.COM) — INTERACTIVE ENGINE
 * Interactive carousel, sticky nav, tabs, counters, notifications & form delivery
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Sticky Nav Shrink on Scroll (Smooth proportional scaling)
  const navContainer = document.getElementById('navContainer');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      navContainer.classList.add('scrolled');
    } else {
      navContainer.classList.remove('scrolled');
    }
  });

  // 2. Mobile Menu Toggle
  const menuToggle = document.getElementById('menuToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  const mLinks = document.querySelectorAll('.m-link');

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      menuToggle.classList.toggle('active');
      mobileMenu.classList.toggle('active');
    });

    mLinks.forEach(link => {
      link.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        mobileMenu.classList.remove('active');
      });
    });

    document.addEventListener('click', (e) => {
      if (!mobileMenu.contains(e.target) && !menuToggle.contains(e.target)) {
        menuToggle.classList.remove('active');
        mobileMenu.classList.remove('active');
      }
    });
  }

  // 3. Update Bell Dropdown
  const bellBtn = document.getElementById('bellBtn');
  const bellPanel = document.getElementById('bellPanel');

  if (bellBtn && bellPanel) {
    bellBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = bellPanel.classList.contains('active');
      if (isOpen) {
        bellPanel.classList.remove('active');
        bellBtn.classList.remove('open');
        bellBtn.setAttribute('aria-expanded', 'false');
      } else {
        bellPanel.classList.add('active');
        bellBtn.classList.add('open');
        bellBtn.setAttribute('aria-expanded', 'true');
      }
    });

    document.addEventListener('click', (e) => {
      if (!bellPanel.contains(e.target) && !bellBtn.contains(e.target)) {
        bellPanel.classList.remove('active');
        bellBtn.classList.remove('open');
        bellBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // 4. Featured Projects Carousel (Configured for 3 Projects)
  const carousel = document.getElementById('projectCarousel');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const dots = document.querySelectorAll('.carousel-dots .dot');
  const projectCards = document.querySelectorAll('.project-card');

  let currentIndex = 0;
  const totalCards = projectCards.length;

  function getMaxIndex() {
    if (window.innerWidth <= 768) {
      return totalCards - 1;
    } else if (window.innerWidth <= 968) {
      return Math.max(0, totalCards - 2);
    } else {
      return Math.max(0, totalCards - 3);
    }
  }

  function updateCarousel() {
    if (!carousel || totalCards === 0) return;
    const cardWidth = projectCards[0].offsetWidth + 30; // 15px margin left & right
    carousel.style.transform = `translateX(-${currentIndex * cardWidth}px)`;

    dots.forEach((dot, index) => {
      if (index === currentIndex) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
  }

  if (nextBtn && prevBtn) {
    nextBtn.addEventListener('click', () => {
      const maxIndex = getMaxIndex();
      if (maxIndex === 0) {
        currentIndex = (currentIndex + 1) % totalCards;
      } else {
        currentIndex = (currentIndex >= maxIndex) ? 0 : currentIndex + 1;
      }
      updateCarousel();
    });

    prevBtn.addEventListener('click', () => {
      const maxIndex = getMaxIndex();
      if (maxIndex === 0) {
        currentIndex = (currentIndex <= 0) ? totalCards - 1 : currentIndex - 1;
      } else {
        currentIndex = (currentIndex <= 0) ? maxIndex : currentIndex - 1;
      }
      updateCarousel();
    });

    dots.forEach(dot => {
      dot.addEventListener('click', () => {
        currentIndex = parseInt(dot.getAttribute('data-index'), 10) || 0;
        updateCarousel();
      });
    });

    window.addEventListener('resize', updateCarousel);
  }

  // 5. Support / Services Tabs
  const tabTriggers = document.querySelectorAll('.tab-trigger');
  const tabPanels = document.querySelectorAll('.tab-panel');

  tabTriggers.forEach(btn => {
    btn.addEventListener('click', () => {
      tabTriggers.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tabPanels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      const targetId = btn.getAttribute('data-target');
      const targetPanel = document.getElementById(targetId);
      if (targetPanel) {
        targetPanel.classList.add('active');
      }
    });
  });

  // 6. Number Counter Animation on Scroll
  const counters = document.querySelectorAll('.counter-value');
  let animated = false;

  function runCounters() {
    counters.forEach(counter => {
      const target = +counter.getAttribute('data-target');
      const duration = 1600;
      const stepTime = 25;
      const totalSteps = duration / stepTime;
      const increment = target / totalSteps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          counter.textContent = target;
          clearInterval(timer);
        } else {
          counter.textContent = Math.floor(current);
        }
      }, stepTime);
    });
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animated) {
        animated = true;
        runCounters();
      }
    });
  }, { threshold: 0.3 });

  const achievementsSec = document.querySelector('.achievements-section');
  if (achievementsSec) observer.observe(achievementsSec);

  // ============================================================
  // EMAILJS CONFIGURATION
  // (Get your free keys from: https://dashboard.emailjs.com)
  // ============================================================
  const EMAILJS_CONFIG = {
    publicKey: 'GyHOjaAwNuvjv3OQ5',     // Account -> API Keys -> Public Key
    serviceId: 'service_n4fyfmh',     // Email Services -> Service ID
    templateId: 'template_tlsr0hu',   // Email Templates -> Template ID
  };

  // Initialize EmailJS if public key is configured
  const isEmailJSConfigured = typeof emailjs !== 'undefined' && 
                              EMAILJS_CONFIG.publicKey && 
                              EMAILJS_CONFIG.publicKey !== 'YOUR_PUBLIC_KEY';

  if (isEmailJSConfigured) {
    emailjs.init({ publicKey: EMAILJS_CONFIG.publicKey });
  }

  // 7. Contact Form Direct Delivery with EmailJS & FormSubmit Fallback
  const contactForm = document.getElementById('contactForm');
  const formMessage = document.getElementById('formMessage');
  const hiddenContactIframe = document.getElementById('hidden_contact_iframe');

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = contactForm.querySelector('.submit-btn');
      const nameInput = contactForm.querySelector('#name');
      const emailInput = contactForm.querySelector('#email');
      const phoneInput = contactForm.querySelector('#phone');
      const serviceInput = contactForm.querySelector('#service');
      const messageInput = contactForm.querySelector('#message');
      const replytoInput = document.getElementById('replytoInput');
      const subjectInput = document.getElementById('subjectInput');

      const nameVal = nameInput ? nameInput.value.trim() : '';
      const emailVal = emailInput ? emailInput.value.trim() : '';
      const phoneVal = phoneInput ? phoneInput.value.trim() : '';
      const serviceVal = serviceInput ? serviceInput.value : '';
      const messageVal = messageInput ? messageInput.value.trim() : '';

      // 1. Validate required fields
      if (!nameVal || !emailVal || !messageVal) {
        formMessage.style.color = '#F87171';
        formMessage.innerHTML = '<i class="fas fa-exclamation-circle"></i> Please fill out all required fields (Name, Email, Message).';
        return;
      }

      // 2. Strict Email Format Validation
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(emailVal)) {
        formMessage.style.color = '#F87171';
        formMessage.innerHTML = '<i class="fas fa-exclamation-circle"></i> Please provide a valid email address (e.g., name@gmail.com).';
        emailInput.focus();
        return;
      }

      // 3. Map reply-to and customized subject
      const customSubject = `New Project Inquiry from ${nameVal} - Weblitex`;
      if (replytoInput) replytoInput.value = emailVal;
      if (subjectInput) subjectInput.value = customSubject;

      // 4. Update UI to sending state
      const originalBtnText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Sending...';
      submitBtn.disabled = true;
      formMessage.style.color = '#94A3B8';
      formMessage.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Sending your message to rizwanrahi286@gmail.com...';

      // 5. If EmailJS is configured, send via EmailJS!
      if (isEmailJSConfigured) {
        try {
          const templateParams = {
            name: nameVal,
            from_name: nameVal,
            email: emailVal,
            from_email: emailVal,
            reply_to: emailVal,
            phone: phoneVal || 'Not provided',
            service: serviceVal || 'General Inquiry',
            message: messageVal,
            to_email: 'rizwanrahi286@gmail.com'
          };

          await emailjs.send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.templateId, templateParams);

          formMessage.style.color = '#00D2B4';
          formMessage.innerHTML = `<i class="fas fa-check-circle"></i> Thank you, <strong>${nameVal}</strong>! Your message has been sent successfully via EmailJS.`;
          contactForm.reset();
        } catch (error) {
          console.error('EmailJS send failed:', error);
          formMessage.style.color = '#F87171';
          formMessage.innerHTML = `<i class="fas fa-exclamation-circle"></i> EmailJS Error: ${error.text || error.message || 'Failed to send'}`;
        } finally {
          submitBtn.innerHTML = originalBtnText;
          submitBtn.disabled = false;
        }
        return;
      }

      // 6. If EmailJS keys are not yet set, attempt FormSubmit or prompt for EmailJS keys
      try {
        const payload = {
          name: nameVal,
          email: emailVal,
          phone: phoneVal || 'Not provided',
          service: serviceVal || 'General Inquiry',
          message: messageVal,
          _subject: customSubject,
          _replyto: emailVal,
          _captcha: 'false',
          _template: 'table'
        };

        const response = await fetch('https://formsubmit.co/ajax/rizwanrahi286@gmail.com', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        const result = await response.json().catch(() => ({}));

        if (result.success === 'true' || result.success === true) {
          formMessage.style.color = '#00D2B4';
          formMessage.innerHTML = `<i class="fas fa-check-circle"></i> Thank you, <strong>${nameVal}</strong>! Your message has been sent successfully to Rizwan.`;
          contactForm.reset();
        } else if (result.message && result.message.toLowerCase().includes('activation')) {
          formMessage.style.color = '#FBBF24';
          formMessage.innerHTML = '<i class="fas fa-envelope-open-text"></i> <strong>Activation Zaroori Hai:</strong> Apne email <strong>rizwanrahi286@gmail.com</strong> par FormSubmit ke <u>Activate Form</u> link par click karein ya EmailJS keys enter karein!';
          contactForm.reset();
        } else if (result.message && result.message.toLowerCase().includes('web server')) {
          const mailtoFallback = `mailto:rizwanrahi286@gmail.com?subject=${encodeURIComponent(customSubject)}&body=${encodeURIComponent(`Name: ${nameVal}\nEmail: ${emailVal}\nPhone: ${phoneVal}\nService: ${serviceVal}\n\nMessage:\n${messageVal}`)}`;
          formMessage.style.color = '#FBBF24';
          formMessage.innerHTML = `<div style="line-height:1.6;margin-top:6px;">
            <i class="fas fa-info-circle"></i> EmailJS set ho chuka hai! Bas <code>script.js</code> mein apni 3 EmailJS keys enter karein.<br>
            Ya abhi direct bhejne ke liye: <a href="${mailtoFallback}" style="color:#38BDF8;font-weight:700;text-decoration:underline;">Gmail / Mail Client se send karein</a>
          </div>`;
        } else {
          formMessage.style.color = '#00D2B4';
          formMessage.innerHTML = '<i class="fas fa-check-circle"></i> Thank you! Your message has been received.';
          contactForm.reset();
        }
      } catch (err) {
        console.warn('Submission issue, attempting fallback submission:', err);
        if (hiddenContactIframe) {
          hiddenContactIframe.onload = function() {
            formMessage.style.color = '#00D2B4';
            formMessage.innerHTML = '<i class="fas fa-check-circle"></i> Message sent successfully!';
            contactForm.reset();
          };
        }
        contactForm.submit();
      } finally {
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;
      }
    });
  }

  // 8. Cookie Consent Landscape Card & Privacy Policy Modal
  const cookieConsent = document.getElementById('cookieConsent');
  const acceptCookies = document.getElementById('acceptCookies');
  const rejectCookies = document.getElementById('rejectCookies');
  const closeCookieBtn = document.getElementById('closeCookieBtn');
  const openCookieSettingsBtn = document.getElementById('openCookieSettingsBtn');

  const privacyModal = document.getElementById('privacyModal');
  const privacyModalBackdrop = document.getElementById('privacyModalBackdrop');
  const openPrivacyPolicyBtn = document.getElementById('openPrivacyPolicyBtn');
  const openPrivacyModalFromCookie = document.getElementById('openPrivacyModalFromCookie');
  const closePrivacyModalBtn = document.getElementById('closePrivacyModalBtn');
  const closePrivacyModalFooterBtn = document.getElementById('closePrivacyModalFooterBtn');

  const COOKIE_STORAGE_KEY = 'weblitex_cookie_consent_v1';
  let nagTimer = null;

  function showCookieConsent() {
    if (cookieConsent && localStorage.getItem(COOKIE_STORAGE_KEY) !== 'accepted') {
      cookieConsent.classList.add('active');
    }
  }

  function hideCookieConsent(accepted = false) {
    if (cookieConsent) cookieConsent.classList.remove('active');

    if (accepted) {
      // User explicitly accepted: persist and clear repeat timer
      localStorage.setItem(COOKIE_STORAGE_KEY, 'accepted');
      if (nagTimer) {
        clearTimeout(nagTimer);
        nagTimer = null;
      }
    } else {
      // User clicked Decline or Close: Re-prompt every 3 seconds until accepted!
      localStorage.removeItem(COOKIE_STORAGE_KEY);
      if (nagTimer) clearTimeout(nagTimer);
      nagTimer = setTimeout(() => {
        showCookieConsent();
      }, 3000);
    }
  }

  // Initial trigger after 700ms if not accepted
  if (cookieConsent && localStorage.getItem(COOKIE_STORAGE_KEY) !== 'accepted') {
    setTimeout(showCookieConsent, 700);
  }

  if (acceptCookies) acceptCookies.addEventListener('click', () => hideCookieConsent(true));
  if (rejectCookies) rejectCookies.addEventListener('click', () => hideCookieConsent(false));
  if (closeCookieBtn) closeCookieBtn.addEventListener('click', () => hideCookieConsent(false));
  if (openCookieSettingsBtn) openCookieSettingsBtn.addEventListener('click', () => showCookieConsent());

  // Privacy Policy Modal Controls
  function openPrivacyModal() {
    if (privacyModal) privacyModal.classList.add('active');
    if (privacyModalBackdrop) privacyModalBackdrop.classList.add('active');
  }

  function closePrivacyModal() {
    if (privacyModal) privacyModal.classList.remove('active');
    if (privacyModalBackdrop) privacyModalBackdrop.classList.remove('active');
  }

  if (openPrivacyPolicyBtn) openPrivacyPolicyBtn.addEventListener('click', openPrivacyModal);
  if (openPrivacyModalFromCookie) openPrivacyModalFromCookie.addEventListener('click', openPrivacyModal);
  if (closePrivacyModalBtn) closePrivacyModalBtn.addEventListener('click', closePrivacyModal);
  if (closePrivacyModalFooterBtn) closePrivacyModalFooterBtn.addEventListener('click', closePrivacyModal);
  if (privacyModalBackdrop) privacyModalBackdrop.addEventListener('click', closePrivacyModal);

  // 9. Weblitex Quantum Reticle Custom Cursor & Comet Stardust Engine
  const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || window.matchMedia('(hover: none)').matches;

  if (!isTouchDevice) {
    // 1. Create and inject cursor canvas, ring, and core dot if not present
    let canvas = document.getElementById('cursorCanvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'cursorCanvas';
      document.body.appendChild(canvas);
    }

    let ring = document.querySelector('.cursor-ring');
    if (!ring) {
      ring = document.createElement('div');
      ring.className = 'cursor-ring cursor-hidden';
      document.body.appendChild(ring);
    }

    let core = document.querySelector('.cursor-core');
    if (!core) {
      core = document.createElement('div');
      core.className = 'cursor-core cursor-hidden';
      document.body.appendChild(core);
    }

    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;
    let isVisible = false;
    let lastMouseX = -100;
    let lastMouseY = -100;

    // Particles array
    const particles = [];
    const colors = ['#00D2B4', '#06B6D4', '#38BDF8', '#FFFFFF'];

    class StardustParticle {
      constructor(x, y, vx, vy, size, color, maxLife) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.size = size;
        this.color = color;
        this.maxLife = maxLife;
        this.life = maxLife;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= 0.95;
        this.vy *= 0.95;
        this.life--;
      }

      draw(context) {
        const progress = this.life / this.maxLife;
        const currentSize = this.size * progress;
        if (currentSize <= 0.1) return;

        context.save();
        context.globalAlpha = progress * 0.85;
        context.fillStyle = this.color;
        context.shadowBlur = 8;
        context.shadowColor = this.color;
        context.beginPath();
        context.arc(this.x, this.y, currentSize, 0, Math.PI * 2);
        context.fill();
        context.restore();
      }
    }

    // Spawn movement comet particles
    function spawnCometParticle(x, y, dx, dy) {
      const angle = Math.atan2(dy, dx) + Math.PI + (Math.random() - 0.5) * 0.8;
      const speed = Math.random() * 1.5 + 0.5;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      const size = Math.random() * 2.8 + 1.2;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const maxLife = Math.floor(Math.random() * 20) + 18;
      particles.push(new StardustParticle(x, y, vx, vy, size, color, maxLife));
    }

    // Spawn explosive kinetic burst on click
    function spawnClickBurst(x, y) {
      const count = 16;
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 / count) * i + (Math.random() - 0.5) * 0.3;
        const speed = Math.random() * 3.5 + 2;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        const size = Math.random() * 3.2 + 1.5;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const maxLife = Math.floor(Math.random() * 25) + 20;
        particles.push(new StardustParticle(x, y, vx, vy, size, color, maxLife));
      }
    }

    // Mouse Move Event
    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!isVisible) {
        isVisible = true;
        ring.classList.remove('cursor-hidden');
        core.classList.remove('cursor-hidden');
        ringX = mouseX;
        ringY = mouseY;
      }

      const dx = mouseX - lastMouseX;
      const dy = mouseY - lastMouseY;
      const dist = Math.hypot(dx, dy);

      if (dist > 4) {
        spawnCometParticle(mouseX, mouseY, dx, dy);
        if (dist > 25) {
          spawnCometParticle(mouseX - dx * 0.5, mouseY - dy * 0.5, dx, dy);
        }
      }

      lastMouseX = mouseX;
      lastMouseY = mouseY;
    });

    // Mouse Down / Up Events
    window.addEventListener('mousedown', (e) => {
      ring.classList.add('cursor-down');
      core.classList.add('cursor-down');
      spawnClickBurst(e.clientX, e.clientY);
    });

    window.addEventListener('mouseup', () => {
      ring.classList.remove('cursor-down');
      core.classList.remove('cursor-down');
    });

    // Window Leave / Enter
    document.addEventListener('mouseleave', () => {
      isVisible = false;
      ring.classList.add('cursor-hidden');
      core.classList.add('cursor-hidden');
    });

    document.addEventListener('mouseenter', () => {
      isVisible = true;
      ring.classList.remove('cursor-hidden');
      core.classList.remove('cursor-hidden');
    });

    // Interactive Hover Elements Detection
    function attachHoverListeners() {
      const interactiveTargets = document.querySelectorAll(
        'a, button, input, textarea, select, [role="button"], .project-card, .tab-trigger, .dot, .carousel-btn, .UpdateBell-bell, .menu-btn, .service-pillar-card, .process-step-card'
      );

      interactiveTargets.forEach((target) => {
        target.addEventListener('mouseenter', () => {
          if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
            ring.classList.add('cursor-text');
            core.classList.add('cursor-text');
          } else {
            ring.classList.add('cursor-hover');
            core.classList.add('cursor-hover');
          }
        });

        target.addEventListener('mouseleave', () => {
          ring.classList.remove('cursor-hover');
          core.classList.remove('cursor-hover');
          ring.classList.remove('cursor-text');
          core.classList.remove('cursor-text');
        });
      });
    }

    attachHoverListeners();

    // Main 60-120fps Animation Loop
    function renderCursor() {
      // 1. Lerp smooth magnetic outer ring
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;

      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
      core.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;

      // 2. Clear canvas & update stardust particles
      ctx.clearRect(0, 0, width, height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.update();
        p.draw(ctx);
        if (p.life <= 0) {
          particles.splice(i, 1);
        }
      }

      requestAnimationFrame(renderCursor);
    }

    requestAnimationFrame(renderCursor);
  }

  // ============================================================
  // 10. Smooth Scrolling Animation & Easing Effect for All Links
  // ============================================================
  function animatedSmoothScroll(targetY, duration = 750) {
    const startY = window.pageYOffset || document.documentElement.scrollTop;
    const distance = targetY - startY;
    if (Math.abs(distance) < 5) return;

    let startTime = null;

    // Cubic easeInOut curve for a fluid, luxurious scrolling feel
    function easeInOutCubic(t, b, c, d) {
      t /= d / 2;
      if (t < 1) return (c / 2) * t * t * t + b;
      t -= 2;
      return (c / 2) * (t * t * t + 2) + b;
    }

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const currentPos = easeInOutCubic(Math.min(progress, duration), startY, distance, duration);
      window.scrollTo(0, currentPos);

      if (progress < duration) {
        requestAnimationFrame(step);
      } else {
        window.scrollTo(0, targetY);
      }
    }

    requestAnimationFrame(step);
  }

  function handleAnchorSmoothScroll(e) {
    const anchor = e.currentTarget;
    const href = anchor.getAttribute('href');
    if (!href || href === '#' || href === 'javascript:void(0)') return;

    // Determine if anchor target is on the current page
    let targetId = '';
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';

    if (href.startsWith('#')) {
      targetId = href.substring(1);
    } else if (href.includes('#')) {
      const parts = href.split('#');
      const linkPath = parts[0].split('/').pop() || 'index.html';
      if (linkPath === currentPath || (linkPath === '' && currentPath === 'index.html') || (linkPath === 'index.html' && currentPath === '')) {
        targetId = parts[1];
      }
    }

    if (targetId) {
      let targetEl = document.getElementById(targetId);
      if (!targetEl && (targetId.toLowerCase() === 'home' || targetId.toLowerCase() === 'top')) {
        targetEl = document.body;
      }

      if (targetEl) {
        e.preventDefault();

        // Close mobile drawer if active
        if (menuToggle && mobileMenu && mobileMenu.classList.contains('active')) {
          menuToggle.classList.remove('active');
          mobileMenu.classList.remove('active');
        }

        // Close update bell panel if open
        if (bellPanel && bellPanel.classList.contains('active')) {
          bellPanel.classList.remove('active');
          if (bellBtn) {
            bellBtn.classList.remove('open');
            bellBtn.setAttribute('aria-expanded', 'false');
          }
        }

        // Calculate target coordinate with sticky navbar offset + extra comfort margin
        const navEl = document.getElementById('navContainer') || document.querySelector('.navbar');
        const navOffset = navEl ? navEl.offsetHeight : 80;
        const targetRect = targetEl.getBoundingClientRect();
        const currentScrollY = window.pageYOffset || document.documentElement.scrollTop;
        const destinationY = targetId.toLowerCase() === 'home' ? 0 : Math.max(0, targetRect.top + currentScrollY - navOffset - 15);

        animatedSmoothScroll(destinationY, 700);

        // Update URL hash cleanly
        if (history.pushState) {
          history.pushState(null, null, '#' + targetId);
        }
      }
    }
  }

  // Bind smooth scrolling to all anchor links
  document.querySelectorAll('a[href*="#"]').forEach(anchor => {
    anchor.addEventListener('click', handleAnchorSmoothScroll);
  });

  // Handle direct navigation with hash on page load
  if (window.location.hash) {
    const rawHash = window.location.hash.substring(1);
    setTimeout(() => {
      const targetOnLoad = document.getElementById(rawHash);
      if (targetOnLoad) {
        const navEl = document.getElementById('navContainer') || document.querySelector('.navbar');
        const navOffset = navEl ? navEl.offsetHeight : 80;
        const currentScrollY = window.pageYOffset || document.documentElement.scrollTop;
        const destY = Math.max(0, targetOnLoad.getBoundingClientRect().top + currentScrollY - navOffset - 15);
        animatedSmoothScroll(destY, 650);
      }
    }, 150);
  }
});
