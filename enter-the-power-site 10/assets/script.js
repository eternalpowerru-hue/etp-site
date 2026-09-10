
  // shared consent checkbox validation
  function ensureConsentError(field){
    let err = field.nextElementSibling;
    if (!err || !err.classList.contains('consent-error')) {
      err = document.createElement('p');
      err.className = 'consent-error';
      err.innerHTML = '<span class="lang-ru">Нужно принять условия оферты и согласие на обработку данных.</span><span class="lang-en">You need to accept the offer terms and the data consent.</span>';
      field.insertAdjacentElement('afterend', err);
    }
    return err;
  }
  function setupConsentValidation(checkbox){
    if (!checkbox) return () => true;
    const field = checkbox.closest('.consent-field');
    const err = field ? ensureConsentError(field) : null;
    checkbox.addEventListener('change', () => {
      if (checkbox.checked) {
        if (field) field.classList.remove('error');
        checkbox.classList.remove('invalid');
        if (err) err.classList.remove('show');
      }
    });
    return function validate(){
      const valid = checkbox.checked;
      if (field) field.classList.toggle('error', !valid);
      checkbox.classList.toggle('invalid', !valid);
      if (err) err.classList.toggle('show', !valid);
      if (!valid) checkbox.focus();
      return valid;
    };
  }

  // header scroll state
  const header = document.getElementById('siteHeader');
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
  }, {passive:true});

  // mobile drawer
  const burger = document.getElementById('burger');
  const drawer = document.getElementById('drawer');
  burger.classList.remove('open');
  drawer.classList.remove('open');
  burger.addEventListener('click', () => {
    burger.classList.toggle('open');
    drawer.classList.toggle('open');
  });
  drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    burger.classList.remove('open');
    drawer.classList.remove('open');
  }));
  function closeDrawer(){
    burger.classList.remove('open');
    drawer.classList.remove('open');
  }
  window.addEventListener('resize', () => {
    if (window.innerWidth > 980) closeDrawer();
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDrawer();
  });

  // scroll reveal
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, {threshold:.15});
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // section glow separation on scroll
  const sectionGlowIo = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      e.target.classList.toggle('section-glow-active', e.isIntersecting);
    });
  }, {threshold:0, rootMargin:'-10% 0px -10% 0px'});
  document.querySelectorAll('body > section').forEach(sec => sectionGlowIo.observe(sec));

  // language switch (RU / EN)
  const langButtons = document.querySelectorAll('.lang-switch button');
  function setLang(lang){
    document.documentElement.dataset.lang = lang;
    document.documentElement.lang = lang;
    langButtons.forEach(b => b.classList.toggle('active', b.dataset.setLang === lang));
  }
  langButtons.forEach(b => b.addEventListener('click', () => setLang(b.dataset.setLang)));

  // videos: hover = muted autoplay preview, click = open on YouTube
  document.querySelectorAll('.video-card').forEach(card => {
    const id = card.dataset.videoId;
    const holder = card.querySelector('.video-frame');
    let iframe = null;
    const canHover = window.matchMedia('(hover: hover)').matches;

    card.addEventListener('mouseenter', () => {
      if (!id || !canHover) return;
      iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&controls=0&loop=1&playlist=${id}&modestbranding=1&playsinline=1&rel=0`;
      iframe.allow = 'autoplay; encrypted-media';
      iframe.setAttribute('title', 'preview');
      holder.appendChild(iframe);
      holder.classList.add('active');
    });
    card.addEventListener('mouseleave', () => {
      holder.classList.remove('active');
      if (iframe) { iframe.remove(); iframe = null; }
    });
    card.addEventListener('click', () => {
      const url = id ? `https://www.youtube.com/watch?v=${id}` : 'https://www.youtube.com/@Enter-the-Power';
      window.open(url, '_blank', 'noopener');
    });
  });

  // booking modal (camp page)
  const bookBtn = document.getElementById('bookTriggerBtn');
  const bookModal = document.getElementById('bookingModal');
  if (bookBtn && bookModal) {
    const closeEls = bookModal.querySelectorAll('[data-modal-close]');
    const form = document.getElementById('bookingForm');
    const formWrap = bookModal.querySelector('.modal-form-wrap');
    const successBox = bookModal.querySelector('.booking-success');

    function openModal(){
      bookModal.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    function closeModal(){
      bookModal.classList.remove('open');
      document.body.style.overflow = '';
    }
    bookBtn.addEventListener('click', openModal);
    closeEls.forEach(el => el.addEventListener('click', closeModal));
    bookModal.addEventListener('click', (e) => { if (e.target === bookModal) closeModal(); });
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && bookModal.classList.contains('open')) closeModal();
    });

    // payment method active styling
    bookModal.querySelectorAll('.pay-methods input[type="radio"]').forEach(radio => {
      radio.addEventListener('change', () => {
        bookModal.querySelectorAll('.pay-methods label').forEach(l => l.classList.remove('active'));
        radio.closest('label').classList.add('active');
      });
    });
    const firstPay = bookModal.querySelector('.pay-methods input[type="radio"]:checked');
    if (firstPay) firstPay.closest('label').classList.add('active');
    const validateCampConsent = setupConsentValidation(document.getElementById('campConsent'));
    const campPaymentUrl = 'https://yookassa.ru/my/i/aqKfBk7WXGgv/l';

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!validateCampConsent()) return;
        if (formWrap) formWrap.style.display = 'none';
        if (successBox) successBox.style.display = 'block';
        window.open(campPaymentUrl, '_blank', 'noopener');
      });
    }
  }

  // camp countdown timer
  document.querySelectorAll('.countdown[data-deadline]').forEach(el => {
    const deadline = new Date(el.dataset.deadline).getTime();
    const daysEl = el.querySelector('[data-unit="days"]');
    const hoursEl = el.querySelector('[data-unit="hours"]');
    const minutesEl = el.querySelector('[data-unit="minutes"]');
    const secondsEl = el.querySelector('[data-unit="seconds"]');
    function pad(n){ return String(n).padStart(2,'0'); }
    function tick(){
      const diff = deadline - Date.now();
      if (diff <= 0) {
        daysEl.textContent = '00'; hoursEl.textContent = '00';
        minutesEl.textContent = '00'; secondsEl.textContent = '00';
        return;
      }
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      daysEl.textContent = pad(days);
      hoursEl.textContent = pad(hours);
      minutesEl.textContent = pad(minutes);
      secondsEl.textContent = pad(seconds);
    }
    tick();
    setInterval(tick, 1000);
  });

  // shop tabs (clothes / accessories)
  document.querySelectorAll('.shop-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.shopTab;
      document.querySelectorAll('.shop-tab-btn').forEach(b => b.classList.toggle('active', b === btn));
      document.querySelectorAll('.shop-panel').forEach(panel => {
        panel.hidden = panel.dataset.shopPanel !== target;
      });
    });
  });

  // course purchase modal
  const purchaseModal = document.getElementById('purchaseModal');
  if (purchaseModal) {
    const closeEls = purchaseModal.querySelectorAll('[data-modal-close]');
    const form = document.getElementById('purchaseForm');
    const formWrap = purchaseModal.querySelector('.modal-form-wrap');
    const successBox = purchaseModal.querySelector('.booking-success');
    const selectedEl = document.getElementById('purchaseSelected');

    function openPurchaseModal(){
      purchaseModal.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    function closePurchaseModal(){
      purchaseModal.classList.remove('open');
      document.body.style.overflow = '';
    }
    let coursePaymentUrl = '';
    document.querySelectorAll('.js-buy').forEach(btn => {
      btn.addEventListener('click', () => {
        if (selectedEl) {
          const isRu = document.documentElement.dataset.lang !== 'en';
          const plan = isRu ? btn.dataset.planRu : btn.dataset.planEn;
          const price = isRu ? btn.dataset.priceRu : btn.dataset.priceEn;
          selectedEl.textContent = isRu ? `${plan} — ${price}` : `${plan} — ${price}`;
        }
        coursePaymentUrl = btn.dataset.payUrl || '';
        if (formWrap) formWrap.style.display = '';
        if (successBox) successBox.style.display = 'none';
        if (form) form.reset();
        openPurchaseModal();
      });
    });
    closeEls.forEach(el => el.addEventListener('click', closePurchaseModal));
    purchaseModal.addEventListener('click', (e) => { if (e.target === purchaseModal) closePurchaseModal(); });
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && purchaseModal.classList.contains('open')) closePurchaseModal();
    });

    purchaseModal.querySelectorAll('.pay-methods input[type="radio"]').forEach(radio => {
      radio.addEventListener('change', () => {
        purchaseModal.querySelectorAll('.pay-methods label').forEach(l => l.classList.remove('active'));
        radio.closest('label').classList.add('active');
      });
    });
    const firstPayC = purchaseModal.querySelector('.pay-methods input[type="radio"]:checked');
    if (firstPayC) firstPayC.closest('label').classList.add('active');
    const validateCourseConsent = setupConsentValidation(document.getElementById('courseConsent'));

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!validateCourseConsent()) return;
        if (formWrap) formWrap.style.display = 'none';
        if (successBox) successBox.style.display = 'block';
        if (coursePaymentUrl) window.open(coursePaymentUrl, '_blank', 'noopener');
      });
    }
  }

  // cookie consent banner
  (function(){
    const banner = document.getElementById('cookieBanner');
    if (!banner) return;
    const KEY = 'etp_cookie_consent';
    let accepted = false;
    try { accepted = localStorage.getItem(KEY) === '1'; } catch(e) {}
    if (!accepted) {
      setTimeout(() => banner.classList.add('show'), 700);
    }
    const acceptBtn = document.getElementById('cookieAccept');
    if (acceptBtn) {
      acceptBtn.addEventListener('click', () => {
        try { localStorage.setItem(KEY, '1'); } catch(e) {}
        banner.classList.remove('show');
      });
    }
  })();

  // shop accessories purchase modal
  const shopPurchaseModal = document.getElementById('shopPurchaseModal');
  if (shopPurchaseModal) {
    const closeEls = shopPurchaseModal.querySelectorAll('[data-modal-close]');
    const form = document.getElementById('shopPurchaseForm');
    const formWrap = shopPurchaseModal.querySelector('.modal-form-wrap');
    const successBox = shopPurchaseModal.querySelector('.booking-success');
    const selectedEl = document.getElementById('shopPurchaseSelected');

    function openShopModal(){
      shopPurchaseModal.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    function closeShopModal(){
      shopPurchaseModal.classList.remove('open');
      document.body.style.overflow = '';
    }
    let shopPaymentUrl = '';
    document.querySelectorAll('.js-buy-shop').forEach(btn => {
      btn.addEventListener('click', () => {
        if (selectedEl) {
          const isRu = document.documentElement.dataset.lang !== 'en';
          const item = isRu ? btn.dataset.itemRu : btn.dataset.itemEn;
          selectedEl.textContent = `${item} — ${btn.dataset.price}`;
        }
        shopPaymentUrl = btn.dataset.payUrl || '';
        if (formWrap) formWrap.style.display = '';
        if (successBox) successBox.style.display = 'none';
        if (form) form.reset();
        openShopModal();
      });
    });
    closeEls.forEach(el => el.addEventListener('click', closeShopModal));
    shopPurchaseModal.addEventListener('click', (e) => { if (e.target === shopPurchaseModal) closeShopModal(); });
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && shopPurchaseModal.classList.contains('open')) closeShopModal();
    });

    shopPurchaseModal.querySelectorAll('.pay-methods input[type="radio"]').forEach(radio => {
      radio.addEventListener('change', () => {
        shopPurchaseModal.querySelectorAll('.pay-methods label').forEach(l => l.classList.remove('active'));
        radio.closest('label').classList.add('active');
      });
    });
    const firstPayS = shopPurchaseModal.querySelector('.pay-methods input[type="radio"]:checked');
    if (firstPayS) firstPayS.closest('label').classList.add('active');
    const validateShopConsent = setupConsentValidation(document.getElementById('shopConsent'));

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!validateShopConsent()) return;
        if (formWrap) formWrap.style.display = 'none';
        if (successBox) successBox.style.display = 'block';
        if (shopPaymentUrl) window.open(shopPaymentUrl, '_blank', 'noopener');
      });
    }
  }
