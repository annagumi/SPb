/* ============================================================
   Конфигурация цен (формулы)
   ============================================================
   Измените значения здесь, чтобы обновить расчеты на сайте.
   Все значения в рублях.
   ============================================================ */

const RATES = {
  'Свадьба': {
    base: 31900,
    label: 'от'
  },
  'Корпоратив': {
    basePerHour: 15000,
    perPerson: 500,
    minPrice: 8000
  },
  'День рождения': {
    basePerHour: 10000,
    perPerson: 300,
    minPrice: 5000
  },
  'Мафия': {
    basePerHour: 5000,
    perPerson: 400,
    minPrice: 4000
  },
  'Бункер': {
    basePerHour: 5000,
    perPerson: 400,
    minPrice: 4000
  },
  'Квиз': {
    basePerHour: 6000,
    perPerson: 450,
    minPrice: 5000
  },
  'Угадай мелодии': {
    basePerHour: 4000,
    perPerson: 300,
    minPrice: 3000
  },
  'Челлендж-вечеринки': {
    basePerHour: 5000,
    perPerson: 350,
    minPrice: 4000
  },
  'Трэш-коробки': {
    basePerHour: 3000,
    perPerson: 250,
    minPrice: 2500
  },
  'Другое': {
    basePerHour: 6000,
    perPerson: 400,
    minPrice: 5000,
    label: 'от'
  }
};

const EXTRAS = {
  'Диджей': 5000,
  'Колонка': 2000,
  'Микрофон': 1000
};

// Дополнительная наценка за выезд в область / дальше 30 минут от метро
const LO_MULTIPLIER_DISTANCE = 30; // минут
const LO_MULTIPLIER_PERCENT = 0.15; // +15%

/* ============================================================
   DOM Elements
   ============================================================ */
const form = document.getElementById('calc-form');
const priceValueEl = document.getElementById('price-value');
const priceNoteEl = document.getElementById('price-note');

/* ============================================================
   Логика калькулятора
   ============================================================ */
function calculatePrice() {
  const eventType = document.getElementById('event-type').value;
  const duration = parseInt(document.getElementById('duration').value) || 0;
  const distance = parseInt(document.getElementById('distance').value) || 0;
  const audienceCount = parseInt(document.getElementById('audience-to').value) || 0;
  
  let price = 0;
  let prefix = '≈';
  
  if (!eventType || !duration || !audienceCount) {
    priceValueEl.textContent = '≈ 0 ₽';
    return;
  }
  
  // Свадьбы используем статические пакеты или базовый расчет
  if (eventType === 'Свадьба') {
    prefix = 'от';
    price = RATES['Свадьба'].base;
  } else {
    const rate = RATES[eventType] || RATES['Другое'];
    prefix = rate.label || '≈';
    
    if (rate.basePerHour) {
      const basePart = rate.basePerHour * duration;
      const audiencePart = audienceCount * rate.perPerson;
      price = basePart + audiencePart;
      
      const min = rate.minPrice || 0;
      if (price < min) price = min;
    } else {
      price = rate.base || 0;
    }
  }
  
  // Дополнительные услуги
  if (document.getElementById('extra-dj').checked) {
    price += EXTRAS['Диджей'] * duration;
  }
  if (document.getElementById('extra-speaker').checked) {
    price += EXTRAS['Колонка'] * duration;
  }
  if (document.getElementById('extra-mic').checked) {
    price += EXTRAS['Микрофон'] * duration;
  }
  
  // ЛО / удаленность
  if (distance > LO_MULTIPLIER_DISTANCE) {
    price = Math.round(price * (1 + LO_MULTIPLIER_PERCENT));
  }
  
  // Округление до сотен
  price = Math.round(price / 100) * 100;
  
  priceValueEl.textContent = `${prefix} ${price.toLocaleString('ru-RU')} ₽`;
}

/* ============================================================
   Обработчики калькулятора
   ============================================================ */
if (form) {
  form.addEventListener('input', calculatePrice);
  form.addEventListener('change', calculatePrice);
  
}

/* ============================================================
   Нижняя навигация: активный раздел по скроллу
   ============================================================ */
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section[id]');

function updateActiveNav() {
  let current = '';
  const scrollPos = window.scrollY + 120;
  
  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;
    if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
      current = section.getAttribute('id');
    }
  });
  
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('data-section') === current) {
      link.classList.add('active');
    }
  });
}

window.addEventListener('scroll', updateActiveNav, { passive: true });

// Smooth scroll с учетом fixed nav
navLinks.forEach(link => {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    const targetId = this.getAttribute('data-section');
    const target = document.getElementById(targetId);
    if (target) {
      const navHeight = window.innerWidth >= 768 ? 96 : 80;
      const targetPosition = target.offsetTop - navHeight;
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  });
});

/* ============================================================
   Fade-in анимации (Intersection Observer)
   ============================================================ */
const fadeEls = document.querySelectorAll('.fade-in');

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });
  
  fadeEls.forEach(el => observer.observe(el));
} else {
  // Fallback: показать все сразу
  fadeEls.forEach(el => el.classList.add('visible'));
}

// Инициализация
calculatePrice();
updateActiveNav();
