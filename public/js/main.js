/* ===== NAVBAR SCROLL ===== */
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 40) navbar.classList.add('scrolled');
  else navbar.classList.remove('scrolled');
});

/* ===== MOBILE MENU ===== */
const hamburger = document.querySelector('.hamburger');
const mobileMenu = document.querySelector('.mobile-menu');
if (hamburger && mobileMenu) {
  const setMenuOpen = (open) => {
    hamburger.classList.toggle('open', open);
    mobileMenu.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', String(open));
  };
  hamburger.addEventListener('click', () => {
    setMenuOpen(!mobileMenu.classList.contains('open'));
  });
  document.querySelectorAll('.mobile-menu a').forEach((link) => {
    link.addEventListener('click', () => setMenuOpen(false));
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
      setMenuOpen(false);
      hamburger.focus();
    }
  });
}

/* ===== TOAST NOTIFICATION ===== */
function showToast(message, type = 'success') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.setAttribute('role', type === 'error' ? 'alert' : 'status');
  const icon = document.createElement('span');
  icon.className = 'toast-icon';
  icon.textContent = type === 'success' ? '✅' : '❌';
  const text = document.createElement('span');
  text.textContent = message;
  toast.append(icon, text);
  document.body.appendChild(toast);
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });
  });
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}

/* ===== FORM VALIDATION ===== */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function fieldLabel(field) {
  const label = document.querySelector(`label[for="${field.id}"]`);
  return label ? label.firstChild.textContent.trim().toLowerCase() : 'this field';
}

function setFieldError(field, message) {
  const errorId = `${field.id}-error`;
  let error = document.getElementById(errorId);
  if (!message) {
    field.removeAttribute('aria-invalid');
    field.removeAttribute('aria-describedby');
    if (error) error.remove();
    return;
  }
  if (!error) {
    error = document.createElement('p');
    error.className = 'field-error';
    error.id = errorId;
    field.insertAdjacentElement('afterend', error);
  }
  error.textContent = message;
  field.setAttribute('aria-invalid', 'true');
  field.setAttribute('aria-describedby', errorId);
}

function checkField(field) {
  const value = field.value.trim();
  if (field.required && !value && field.type !== 'checkbox') {
    return field.tagName === 'SELECT'
      ? 'Please choose an option.'
      : `Please enter ${fieldLabel(field)}.`;
  }
  if (field.type === 'email' && value && !EMAIL_RE.test(value)) {
    return 'Please enter a valid email address.';
  }
  if (field.type === 'tel' && value) {
    const digits = value.replace(/\D/g, '');
    if (!/^\+?[\d\s\-()]+$/.test(value) || digits.length < 9 || digits.length > 15) {
      return 'Please enter a valid phone number.';
    }
  }
  if (field.type === 'checkbox' && field.required && !field.checked) {
    return 'Please tick this box to continue.';
  }
  return '';
}

function validateForm(form) {
  let firstInvalid = null;
  form.querySelectorAll('input, select, textarea').forEach((field) => {
    if (!field.id || field.type === 'hidden' || field.closest('[hidden]')) return;
    const message = checkField(field);
    setFieldError(field, message);
    if (message && !firstInvalid) firstInvalid = field;
  });
  if (firstInvalid) firstInvalid.focus();
  return !firstInvalid;
}

/* ===== FORMS ===== */
function setupForm(formId, busyText, successMessage) {
  const form = document.getElementById(formId);
  if (!form) return;
  form.addEventListener('input', (e) => {
    if (e.target.getAttribute('aria-invalid')) setFieldError(e.target, checkField(e.target));
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateForm(form)) {
      showToast('Please correct the highlighted fields.', 'error');
      return;
    }
    const btn = form.querySelector('.form-submit');
    const originalText = btn.textContent;
    btn.textContent = busyText;
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = originalText;
      btn.disabled = false;
      form.reset();
      showToast(successMessage, 'success');
    }, 1600);
  });
}

setupForm(
  'contactForm',
  '⏳ Sending...',
  'Thank you! Your message has been received. We will contact you shortly.'
);
setupForm(
  'appointmentForm',
  '⏳ Booking...',
  'Appointment request received! We will confirm your booking shortly.'
);

/* ===== SCROLL REVEAL ===== */
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealElements = reduceMotion
  ? []
  : document.querySelectorAll(
      '.service-card, .value-card, .why-feature, .contact-card, .service-item, .credential'
    );
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, i * 60);
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

revealElements.forEach((el) => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
  revealObserver.observe(el);
});

/* ===== SMOOTH SCROLL FOR ANCHOR LINKS ===== */
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    }
  });
});

/* ===== COUNTER ANIMATION ===== */
function animateCounter(el, target, suffix = '') {
  let current = 0;
  const increment = target / 50;
  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    el.textContent = Math.floor(current) + suffix;
  }, 30);
}
const statsObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.stat-num').forEach((stat) => {
          const text = stat.textContent;
          const num = parseInt(text);
          const suffix = text.replace(/[0-9]/g, '');
          if (!isNaN(num)) animateCounter(stat, num, suffix);
        });
        statsObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.5 }
);
const statsEl = document.querySelector('.hero-stats');
if (statsEl && !reduceMotion) statsObserver.observe(statsEl);
