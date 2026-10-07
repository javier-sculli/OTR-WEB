// OTR — On The Rocks — main.js
'use strict';

// Case-study hero/secondary videos — arrancan muteados (autoplay lo exige),
// con un botón para activar el sonido si el visitante quiere.
document.querySelectorAll('.case-hero-mute').forEach(btn => {
  const video = btn.parentElement.querySelector('video');
  if (!video) return;
  btn.addEventListener('click', () => {
    video.muted = !video.muted;
    btn.classList.toggle('is-unmuted', !video.muted);
    btn.setAttribute('aria-label', video.muted ? 'Activar sonido' : 'Silenciar');
  });
});

document.querySelectorAll('.logo-cell').forEach((el, i) => {
  el.style.setProperty('--logo-i', String(i));
});

// Navbar: se compacta y pasa a azul 90% para que se lean las fotos debajo.
const navbar = document.getElementById('navbar');
const syncNavbarScroll = () => {
  if (!navbar) return;
  navbar.classList.toggle('is-scrolled', window.scrollY > 20);
};
window.addEventListener('scroll', syncNavbarScroll, { passive: true });
syncNavbarScroll();

// Mobile nav menu
const menuToggle = document.querySelector('.navbar-menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');

if (menuToggle && mobileMenu) {
  const onKeydown = (e) => {
    if (e.key === 'Escape') closeMobileMenu();
  };

  const onClickOutside = (e) => {
    if (!mobileMenu.contains(e.target) && !menuToggle.contains(e.target)) {
      closeMobileMenu({ focusToggle: false });
    }
  };

  function openMobileMenu() {
    mobileMenu.hidden = false;
    menuToggle.setAttribute('aria-expanded', 'true');
    menuToggle.classList.add('is-open');
    const firstLink = mobileMenu.querySelector('a');
    if (firstLink) firstLink.focus();
    document.addEventListener('keydown', onKeydown);
    document.addEventListener('click', onClickOutside, true);
  }

  function closeMobileMenu({ focusToggle = true } = {}) {
    mobileMenu.hidden = true;
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.classList.remove('is-open');
    document.removeEventListener('keydown', onKeydown);
    document.removeEventListener('click', onClickOutside, true);
    if (focusToggle) menuToggle.focus();
  }

  menuToggle.addEventListener('click', () => {
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
    if (isOpen) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  });

  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => closeMobileMenu({ focusToggle: false }));
  });
}

function toggleFaq(item) {
  const isOpen = item.classList.contains('faq-open');
  document.querySelectorAll('.faq-item.faq-open').forEach(openItem => {
    if (openItem !== item) {
      openItem.classList.remove('faq-open');
      openItem.setAttribute('aria-expanded', 'false');
    }
  });
  item.classList.toggle('faq-open', !isOpen);
  item.setAttribute('aria-expanded', String(!isOpen));
}

document.querySelectorAll('.faq-item').forEach(item => {
  item.addEventListener('click', () => toggleFaq(item));
  item.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleFaq(item);
    }
  });
});

const jumpToHash = () => {
  const id = decodeURIComponent(location.hash.replace(/^#/, ''));
  if (!id) return;
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: 'auto', block: 'start' });
};
if (location.hash) {
  window.addEventListener('load', jumpToHash);
  requestAnimationFrame(jumpToHash);
}

// Smooth scroll for nav links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// Section reveal on scroll
const revealTargets = document.querySelectorAll(
  '.section-work .work-inner, .section-portfolio .portfolio-inner, .section-service .service-inner, .section-trusted .trusted-inner, .section-faq .faq-inner, .section-contact .contact-inner'
);
revealTargets.forEach(el => el.classList.add('reveal'));

if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  revealTargets.forEach(el => io.observe(el));
} else {
  revealTargets.forEach(el => el.classList.add('is-visible'));
}

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.querySelectorAll('.hero-video, .about-hero-video').forEach((video) => {
  const tryPlay = () => {
    if (prefersReducedMotion()) return;
    const play = video.play();
    if (play && typeof play.catch === 'function') play.catch(() => {});
  };
  if (video.readyState >= 2) tryPlay();
  video.addEventListener('loadeddata', tryPlay);
  video.addEventListener('canplay', tryPlay);
});

const isMobileMotion = () => window.matchMedia('(max-width: 768px)').matches;

const getScrollY = () => {
  const vv = window.visualViewport;
  return window.scrollY
    || document.documentElement.scrollTop
    || document.body.scrollTop
    || (vv && vv.pageTop)
    || 0;
};

const getViewportBox = (el) => {
  const rect = el.getBoundingClientRect();
  const native = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
  const scrollY = getScrollY();
  if (native === 0 && scrollY > 0) {
    return { top: rect.top - scrollY, height: rect.height, bottom: rect.bottom - scrollY };
  }
  return { top: rect.top, height: rect.height, bottom: rect.bottom };
};

// Footer wordmark — wipe ligado al scroll (Wolff Olins).
// El logotipo está al fondo de la página: el reveal corre mientras entra
// por el borde inferior, no cuando cruza el tercio superior del viewport.
const supportsViewTimeline = CSS.supports && CSS.supports('animation-timeline', 'view()');
const wordmarks = document.querySelectorAll('.contact-logotype');
const updateWordmarkReveal = () => {
  if (supportsViewTimeline) return;
  const reduced = prefersReducedMotion();
  const vh = window.innerHeight;
  wordmarks.forEach(el => {
    if (reduced) {
      el.style.setProperty('--wordmark-reveal', '1');
      return;
    }
    const box = getViewportBox(el);
    const h = box.height || 124;
    const start = vh + 12;
    const end = vh - h;
    const progress = (start - box.top) / (start - end);
    el.style.setProperty('--wordmark-reveal', String(Math.min(1, Math.max(0, progress))));
  });
};

// About — pin + translateX de los 3 bloques de valores
const valuesPin = document.querySelector('.about-values-pin');
const valuesTrack = document.querySelector('.about-values-track');
const updateAboutValues = () => {
  if (!valuesPin || !valuesTrack) return;
  if (prefersReducedMotion() || isMobileMotion()) {
    valuesTrack.style.transform = '';
    return;
  }
  const box = getViewportBox(valuesPin);
  const stickyTop = 110;
  const travel = valuesPin.offsetHeight - (window.innerHeight - stickyTop);
  if (travel <= 0) {
    valuesTrack.style.transform = '';
    return;
  }
  const progress = Math.min(1, Math.max(0, (stickyTop - box.top) / travel));
  const maxX = Math.max(0, valuesTrack.scrollWidth - window.innerWidth);
  valuesTrack.style.transform = `translate3d(${-maxX * progress}px, 0, 0)`;
};

let motionTick = false;
const runMotion = () => {
  updateWordmarkReveal();
  updateAboutValues();
  motionTick = false;
};
const requestMotionTick = () => {
  if (motionTick) return;
  motionTick = true;
  requestAnimationFrame(runMotion);
};

window.addEventListener('scroll', requestMotionTick, { passive: true });
document.addEventListener('scroll', requestMotionTick, { passive: true });
window.addEventListener('resize', requestMotionTick);
if (window.visualViewport) {
  window.visualViewport.addEventListener('scroll', requestMotionTick, { passive: true });
  window.visualViewport.addEventListener('resize', requestMotionTick);
}
runMotion();

// About — typewriter de la visión (conserva .about-accent)
const visionType = document.querySelector('.about-vision-text[data-typewriter]');
if (visionType && !prefersReducedMotion()) {
  const source = visionType.cloneNode(true);
  const spoken = visionType.textContent.replace(/\s+/g, ' ').trim();
  visionType.setAttribute('aria-label', spoken);
  visionType.textContent = '';

  const parts = [];
  source.childNodes.forEach(node => {
    if (node.nodeType === Node.TEXT_NODE) {
      const value = node.textContent.replace(/\s+/g, ' ');
      if (value && value !== ' ') parts.push({ className: '', value });
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const value = node.textContent.replace(/\s+/g, ' ');
      if (value && value !== ' ') parts.push({ className: node.className || '', value });
    }
  });
  if (parts[0]) parts[0].value = parts[0].value.replace(/^\s+/, '');
  const last = parts[parts.length - 1];
  if (last) last.value = last.value.replace(/\s+$/, '');

  const caret = document.createElement('span');
  caret.className = 'about-typewriter-caret';
  caret.setAttribute('aria-hidden', 'true');
  visionType.appendChild(caret);

  let partIdx = 0;
  let charIdx = 0;
  let current = null;

  const typeNext = () => {
    if (partIdx >= parts.length) {
      caret.remove();
      return;
    }
    const part = parts[partIdx];
    if (!current) {
      if (part.className) {
        current = document.createElement('span');
        current.className = part.className;
      } else {
        current = document.createTextNode('');
      }
      visionType.insertBefore(current, caret);
    }
    const next = part.value.charAt(charIdx);
    if (current.nodeType === Node.TEXT_NODE) {
      current.textContent += next;
    } else {
      current.textContent += next;
    }
    charIdx += 1;
    if (charIdx >= part.value.length) {
      partIdx += 1;
      charIdx = 0;
      current = null;
    }
    window.setTimeout(typeNext, next === ' ' ? 8 : 18);
  };

  const startTypewriter = () => {
    if ('IntersectionObserver' in window) {
      const tio = new IntersectionObserver((entries) => {
        if (entries.some(entry => entry.isIntersecting)) {
          tio.disconnect();
          typeNext();
        }
      }, { threshold: 0.28 });
      tio.observe(visionType);
    } else {
      typeNext();
    }
  };

  startTypewriter();
}

// Portfolio page filters
const portfolioFilters = document.querySelectorAll('.portfolio-filter');
const portfolioCards = document.querySelectorAll('.pgrid-card');

if (portfolioFilters.length && portfolioCards.length) {
  const activateFilter = (btn) => {
    // Figma no tiene un pill "todos": por defecto no hay ninguno activo y se
    // ven todas las cards. Clickear un filtro ya activo lo apaga y vuelve
    // a mostrar todo; clickear otro lo activa en exclusiva.
    const alreadyActive = btn.classList.contains('is-active');

    portfolioFilters.forEach(b => {
      b.classList.remove('is-active');
      b.setAttribute('aria-pressed', 'false');
    });

    if (alreadyActive) {
      portfolioCards.forEach(card => card.classList.remove('is-hidden'));
      return;
    }

    btn.classList.add('is-active');
    btn.setAttribute('aria-pressed', 'true');

    const filter = btn.getAttribute('data-filter');
    portfolioCards.forEach(card => {
      const show = card.getAttribute('data-cat') === filter;
      card.classList.toggle('is-hidden', !show);
    });
  };

  portfolioFilters.forEach(btn => {
    btn.addEventListener('click', () => activateFilter(btn));
  });

  // Llegar desde SERVICE con ?filter=audiovisual activa esa tab directamente.
  const requestedFilter = new URLSearchParams(window.location.search).get('filter');
  if (requestedFilter) {
    const targetBtn = Array.from(portfolioFilters).find(b => b.getAttribute('data-filter') === requestedFilter);
    if (targetBtn) activateFilter(targetBtn);
  }
}

// Contact form — POST to FormSubmit (hola@ontherocks.com.ar).
// If the request fails, fall back to mailto so the visitor can still send.
function wireContactForm(contactForm) {
  if (!contactForm || contactForm.dataset.wired) return;
  contactForm.dataset.wired = 'true';

  const statusEl = contactForm.querySelector('.contact-form-status');
  const submitBtn = contactForm.querySelector('.contact-submit');
  let isSubmitting = false;

  const setStatus = (message, kind) => {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.classList.remove('is-error', 'is-success');
    if (kind) statusEl.classList.add(kind);
  };

  const openMailto = (reason, name, email, message) => {
    const subject = encodeURIComponent(`${reason} — ${name}`.trim());
    const body = encodeURIComponent(`Nombre: ${name}\nEmail: ${email}\n\n${message}`);
    window.location.href = `mailto:hola@ontherocks.com.ar?subject=${subject}&body=${body}`;
  };

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!contactForm.checkValidity()) {
      contactForm.reportValidity();
      setStatus('Revisá los campos marcados antes de enviar.', 'is-error');
      return;
    }

    isSubmitting = true;
    if (submitBtn) submitBtn.disabled = true;
    setStatus('Enviando…');

    const reason = contactForm.querySelector('input[name="reason"]:checked')?.value || '';
    const name = contactForm.querySelector('input[name="name"]')?.value.trim() || '';
    const email = contactForm.querySelector('input[name="email"]')?.value.trim() || '';
    const message = contactForm.querySelector('textarea[name="message"]')?.value.trim() || '';

    try {
      const res = await fetch('https://formsubmit.co/ajax/hola@ontherocks.com.ar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({
          name,
          email,
          message,
          motivo: reason,
          _subject: `${reason} — ${name}`.trim(),
          _template: 'table',
          _captcha: 'false'
        })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.success === 'false' || data.success === false) {
        throw new Error(data.message || 'send_failed');
      }
      contactForm.reset();
      const defaultReason = contactForm.querySelector('input[name="reason"]');
      if (defaultReason) defaultReason.checked = true;
      setStatus('Listo. Te vamos a responder a este mail en menos de 48 hs.', 'is-success');
    } catch (err) {
      openMailto(reason, name, email, message);
      setStatus('No pudimos enviarlo desde el sitio. Se abrió tu cliente de correo como alternativa. Si no pasó nada, escribinos a hola@ontherocks.com.ar.', 'is-error');
    } finally {
      isSubmitting = false;
      if (submitBtn) submitBtn.disabled = false;
    }
  });
}

wireContactForm(document.getElementById('contact-form'));

// Footer "Get in touch" → el propio footer revela el formulario a la derecha
// (panel 774px que se expande desde el borde, como en Figma). Excepto en
// /contact.html, donde el formulario completo ya está a la vista.
const footerSection = document.querySelector('.section-contact');
const contactTriggers = Array.from(document.querySelectorAll('.contact-btn'))
  .filter(btn => !document.body.classList.contains('page-contact'));

if (contactTriggers.length && footerSection) {
  const dimOverlay = document.createElement('div');
  dimOverlay.className = 'contact-dim-overlay';
  dimOverlay.setAttribute('aria-hidden', 'true');
  document.body.appendChild(dimOverlay);

  const modalPanel = document.createElement('div');
  modalPanel.className = 'contact-modal';
  modalPanel.setAttribute('role', 'dialog');
  modalPanel.setAttribute('aria-modal', 'true');
  modalPanel.setAttribute('aria-hidden', 'true');
  modalPanel.setAttribute('aria-labelledby', 'contact-modal-title');
  modalPanel.setAttribute('tabindex', '-1');
  modalPanel.innerHTML = `
    <button type="button" class="contact-modal-close">close</button>
    <div class="contact-modal-body">
      <h2 id="contact-modal-title" class="contact-modal-title">¿Tenés un proyecto en mente?</h2>
      <form class="contact-form" id="contact-modal-form" novalidate>
        <fieldset class="contact-reasons">
          <legend class="sr-only">Motivo de contacto</legend>
          <label class="contact-radio">
            <input type="radio" name="reason" value="Nuevos negocios" checked>
            <span class="contact-radio-dot" aria-hidden="true"></span>
            Nuevos negocios
          </label>
          <label class="contact-radio">
            <input type="radio" name="reason" value="Consultas de prensa">
            <span class="contact-radio-dot" aria-hidden="true"></span>
            Consultas de prensa
          </label>
          <label class="contact-radio">
            <input type="radio" name="reason" value="Todo lo demás">
            <span class="contact-radio-dot" aria-hidden="true"></span>
            Todo lo demás
          </label>
        </fieldset>

        <a href="contact.html#equipo" class="contact-jobs-link">¿Buscás oportunidades laborales?</a>

        <p class="contact-form-hint">Dejanos tus datos para que podamos contactarte. Respondemos en menos de 48 hs.</p>

        <div class="contact-form-fields">
          <div class="contact-field">
            <label for="cfm-name">Nombre y apellido</label>
            <input type="text" name="name" id="cfm-name" autocomplete="name" required>
          </div>
          <div class="contact-field">
            <label for="cfm-email">Email</label>
            <input type="email" name="email" id="cfm-email" autocomplete="email" required>
          </div>
          <div class="contact-field">
            <label for="cfm-message">Mensaje</label>
            <textarea name="message" id="cfm-message" rows="3" placeholder="Contanos sobre tu proyecto" required></textarea>
          </div>
        </div>

        <p class="contact-form-note">Al enviar, el mensaje llega a hola@ontherocks.com.ar. Respondemos en menos de 48 hs.</p>

        <button type="submit" class="contact-submit">
          Enviar
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M3 9L9 3M9 3H4.5M9 3V7.5" stroke="#15141D" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>

        <p class="contact-form-status" role="status" aria-live="polite"></p>
      </form>
    </div>
  `;
  footerSection.appendChild(modalPanel);
  wireContactForm(document.getElementById('contact-modal-form'));

  const closeBtn = modalPanel.querySelector('.contact-modal-close');
  const PANEL_MS = 550;
  let lastFocusedEl = null;
  let isOpen = false;
  let closeTimer = null;

  const onModalKeydown = (e) => {
    if (e.key === 'Escape') {
      closeContactModal();
      return;
    }
    if (e.key !== 'Tab') return;
    const focusable = modalPanel.querySelectorAll('button, a[href], input, textarea');
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  function openContactModal() {
    if (isOpen) return;
    isOpen = true;
    window.clearTimeout(closeTimer);
    lastFocusedEl = document.activeElement;
    footerSection.classList.add('is-contact-open');
    dimOverlay.setAttribute('aria-hidden', 'false');
    modalPanel.setAttribute('aria-hidden', 'false');
    dimOverlay.style.pointerEvents = 'none';
    footerSection.scrollIntoView({ behavior: 'instant', block: 'end' });
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onModalKeydown);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        dimOverlay.classList.add('is-open');
        modalPanel.classList.add('is-open');
        modalPanel.focus();
      });
    });
    window.setTimeout(() => {
      dimOverlay.style.pointerEvents = '';
    }, PANEL_MS);
  }

  function closeContactModal() {
    if (!isOpen) return;
    isOpen = false;
    dimOverlay.classList.remove('is-open');
    modalPanel.classList.remove('is-open');
    document.body.style.overflow = '';
    document.removeEventListener('keydown', onModalKeydown);
    closeTimer = window.setTimeout(() => {
      footerSection.classList.remove('is-contact-open');
      dimOverlay.setAttribute('aria-hidden', 'true');
      modalPanel.setAttribute('aria-hidden', 'true');
    }, PANEL_MS);
    if (lastFocusedEl) lastFocusedEl.focus();
  }

  contactTriggers.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openContactModal();
    });
  });

  closeBtn.addEventListener('click', closeContactModal);
  dimOverlay.addEventListener('click', closeContactModal);
}
