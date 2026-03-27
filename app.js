/* ═══════════════════════════════════════════
   HACs — Flight Data Engine
   ═══════════════════════════════════════════ */

// ── Airlines that operate from FBM ──
const AIRLINES = [
  { code: 'ET', name: 'Ethiopian Airlines', flag: '🇪🇹' },
  { code: 'KQ', name: 'Kenya Airways',      flag: '🇰🇪' },
  { code: 'SA', name: 'South African',       flag: '🇿🇦' },
  { code: 'WB', name: 'RwandAir',            flag: '🇷🇼' },
  { code: '8Z', name: 'Congo Airways',       flag: '🇨🇩' },
  { code: 'TC', name: 'Air Tanzania',        flag: '🇹🇿' },
];

// ── Route data with realistic durations and base fares ──
const ROUTES = [
  { code: 'DXB', city: 'Dubai',          country: 'UAE',          flag: '🇦🇪', airlines: ['ET','KQ'],    durationMin: 480, baseFare: 520,  gradient: 'linear-gradient(135deg,#f5af19,#f12711)' },
  { code: 'BOM', city: 'Mumbai',         country: 'India',        flag: '🇮🇳', airlines: ['ET'],         durationMin: 620, baseFare: 580,  gradient: 'linear-gradient(135deg,#11998e,#38ef7d)' },
  { code: 'KHI', city: 'Karachi',        country: 'Pakistan',     flag: '🇵🇰', airlines: ['ET','KQ'],    durationMin: 660, baseFare: 610,  gradient: 'linear-gradient(135deg,#0f2027,#2c5364)' },
  { code: 'CPT', city: 'Cape Town',      country: 'South Africa', flag: '🇿🇦', airlines: ['SA'],         durationMin: 340, baseFare: 380,  gradient: 'linear-gradient(135deg,#667eea,#764ba2)' },
  { code: 'JNB', city: 'Johannesburg',   country: 'South Africa', flag: '🇿🇦', airlines: ['SA'],         durationMin: 250, baseFare: 310,  gradient: 'linear-gradient(135deg,#fc5c7d,#6a82fb)' },
  { code: 'NBO', city: 'Nairobi',        country: 'Kenya',        flag: '🇰🇪', airlines: ['KQ'],         durationMin: 220, baseFare: 270,  gradient: 'linear-gradient(135deg,#f093fb,#f5576c)' },
  { code: 'ADD', city: 'Addis Ababa',    country: 'Ethiopia',     flag: '🇪🇹', airlines: ['ET'],         durationMin: 260, baseFare: 290,  gradient: 'linear-gradient(135deg,#4facfe,#00f2fe)' },
  { code: 'KGL', city: 'Kigali',         country: 'Rwanda',       flag: '🇷🇼', airlines: ['WB'],         durationMin: 130, baseFare: 210,  gradient: 'linear-gradient(135deg,#43e97b,#38f9d7)' },
  { code: 'DAR', city: 'Dar es Salaam',  country: 'Tanzania',     flag: '🇹🇿', airlines: ['TC','KQ'],    durationMin: 200, baseFare: 250,  gradient: 'linear-gradient(135deg,#fa709a,#fee140)' },
];

const STATUSES = [
  { label: 'On Time',   cls: 'status--ontime',    weight: 5 },
  { label: 'Scheduled', cls: 'status--scheduled',  weight: 3 },
  { label: 'Boarding',  cls: 'status--boarding',   weight: 1 },
  { label: 'Delayed',   cls: 'status--delayed',    weight: 1 },
];

// ── Helpers ──
function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick(arr) { return arr[rand(0, arr.length - 1)]; }
function pickWeighted(items) {
  const total = items.reduce((s, i) => s + i.weight, 0);
  let r = Math.random() * total;
  for (const item of items) { r -= item.weight; if (r <= 0) return item; }
  return items[0];
}
function pad(n) { return String(n).padStart(2, '0'); }
function formatTime(date) { return pad(date.getHours()) + ':' + pad(date.getMinutes()); }
function formatDate(date) {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return date.getDate() + ' ' + months[date.getMonth()] + ' ' + date.getFullYear();
}
function formatDuration(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h + 'h ' + pad(m) + 'm';
}

// ── Generate 5 upcoming flights ──
function generateFlights() {
  const flights = [];
  const now = new Date();
  const usedRoutes = new Set();

  for (let i = 0; i < 5; i++) {
    let route;
    do { route = pick(ROUTES); } while (usedRoutes.has(route.code) && usedRoutes.size < ROUTES.length);
    usedRoutes.add(route.code);

    const airlineCode = pick(route.airlines);
    const airline = AIRLINES.find(a => a.code === airlineCode) || pick(AIRLINES);

    const depOffset = rand(15 + i * 50, 60 + i * 90); // minutes from now, spread out
    const dep = new Date(now.getTime() + depOffset * 60000);
    const arr = new Date(dep.getTime() + (route.durationMin + rand(-15, 15)) * 60000);

    const status = i === 0 ? STATUSES[2] : pickWeighted(STATUSES); // first flight is "Boarding"
    const flightNum = airline.code + rand(100, 999);
    const gate = String.fromCharCode(65 + rand(0, 3)) + rand(1, 18);

    flights.push({ airline, flightNum, route, dep, arr, status, gate });
  }

  flights.sort((a, b) => a.dep - b.dep);
  return flights;
}

// ── Generate fare data for destinations ──
function generateFares() {
  return ROUTES.map(route => {
    const airlineCode = pick(route.airlines);
    const airline = AIRLINES.find(a => a.code === airlineCode) || pick(AIRLINES);
    const variation = rand(-50, 80);
    const price = route.baseFare + variation;
    const depDate = new Date();
    depDate.setDate(depDate.getDate() + rand(2, 21));

    return { ...route, airline, price, depDate };
  }).sort((a, b) => a.price - b.price);
}

// ── Render Skeletons ──
function renderFlightSkeletons() {
  const board = document.getElementById('flightBoard');
  board.innerHTML = '';
  for (let i = 0; i < 5; i++) {
    const el = document.createElement('div');
    el.className = 'skeleton-row';
    el.innerHTML = `
      <div><div class="skeleton skeleton--text"></div><div class="skeleton skeleton--text-sm"></div></div>
      <div><div class="skeleton skeleton--text"></div><div class="skeleton skeleton--text-sm"></div></div>
      <div><div class="skeleton skeleton--text"></div><div class="skeleton skeleton--text-sm"></div></div>
      <div><div class="skeleton skeleton--text"></div><div class="skeleton skeleton--text-sm"></div></div>
      <div><div class="skeleton skeleton--badge"></div></div>`;
    board.appendChild(el);
  }
}

function renderDestSkeletons() {
  const grid = document.getElementById('destGrid');
  grid.innerHTML = '';
  for (let i = 0; i < 6; i++) {
    const el = document.createElement('div');
    el.className = 'skeleton-dest';
    el.innerHTML = `
      <div style="display:flex;justify-content:space-between;margin-bottom:20px">
        <div class="skeleton" style="width:48px;height:48px;border-radius:12px"></div>
        <div class="skeleton" style="width:80px;height:28px;border-radius:6px"></div>
      </div>
      <div class="skeleton skeleton--text" style="width:60%;height:22px;margin-bottom:8px"></div>
      <div class="skeleton skeleton--text-sm" style="width:40%"></div>
      <div style="margin-top:24px;padding-top:20px;border-top:1px solid rgba(255,255,255,0.05)">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div><div class="skeleton skeleton--text-sm" style="width:50%"></div><div class="skeleton skeleton--text" style="margin-top:6px"></div></div>
          <div><div class="skeleton skeleton--text-sm" style="width:50%"></div><div class="skeleton skeleton--text" style="margin-top:6px"></div></div>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:20px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.05)">
          <div class="skeleton" style="width:100px;height:32px;border-radius:6px"></div>
          <div class="skeleton" style="width:90px;height:36px;border-radius:50px"></div>
        </div>
      </div>`;
    grid.appendChild(el);
  }
}

// ── Render Flights ──
function renderFlights(flights) {
  const board = document.getElementById('flightBoard');
  board.innerHTML = `
    <div class="flight-header">
      <span>Airline / Flight</span>
      <span>Destination</span>
      <span>Departure</span>
      <span>Arrival (est.)</span>
      <span>Status</span>
    </div>`;

  flights.forEach(f => {
    const row = document.createElement('div');
    row.className = 'flight-row';
    row.innerHTML = `
      <div class="flight-row__airline">
        <span class="flight-row__airline-flag">${f.airline.flag}</span>
        <div>
          <div class="flight-row__code">${f.flightNum}</div>
          <div class="flight-row__name">${f.airline.name}</div>
        </div>
      </div>
      <div class="flight-row__dest">
        <div class="flight-row__city">${f.route.city}</div>
        <div class="flight-row__iata">FBM → ${f.route.code}</div>
      </div>
      <div class="flight-row__time">
        <div class="flight-row__time-val">${formatTime(f.dep)}</div>
        <div class="flight-row__time-label">${formatDate(f.dep)}</div>
      </div>
      <div class="flight-row__time">
        <div class="flight-row__time-val">${formatTime(f.arr)}</div>
        <div class="flight-row__time-label">${formatDate(f.arr)}</div>
      </div>
      <div class="flight-row__status ${f.status.cls}">${f.status.label}</div>`;
    board.appendChild(row);
  });

  document.getElementById('flightStatus').textContent = `Showing ${flights.length} upcoming departures`;
  document.getElementById('lastUpdated').textContent = 'Updated ' + formatTime(new Date());
}

// ── Render Fares ──
function renderFares(fares) {
  const grid = document.getElementById('destGrid');
  grid.innerHTML = '';

  fares.forEach((f, i) => {
    const card = document.createElement('div');
    card.className = 'dest-card';
    card.style.animationDelay = (i * 0.08) + 's';
    card.innerHTML = `
      <div class="dest-card__header">
        <span class="dest-card__flag">${f.flag}</span>
        <span class="dest-card__route">FBM → ${f.code}</span>
      </div>
      <div class="dest-card__city">${f.city}</div>
      <div class="dest-card__country">${f.country}</div>
      <div class="dest-card__details">
        <div>
          <div class="dest-card__detail-label">Airline</div>
          <div class="dest-card__detail-value">${f.airline.flag} ${f.airline.name}</div>
        </div>
        <div>
          <div class="dest-card__detail-label">Duration</div>
          <div class="dest-card__detail-value">${formatDuration(f.durationMin)}</div>
        </div>
        <div>
          <div class="dest-card__detail-label">Next Departure</div>
          <div class="dest-card__detail-value">${formatDate(f.depDate)}</div>
        </div>
        <div>
          <div class="dest-card__detail-label">Class</div>
          <div class="dest-card__detail-value">Economy</div>
        </div>
        <div class="dest-card__price">
          <div>
            <div class="dest-card__price-label">Starting from</div>
            <div class="dest-card__price-val"><span>USD </span>$${f.price}</div>
          </div>
          <a href="#contact" class="btn btn--primary dest-card__book">Book Now</a>
        </div>
      </div>`;
    grid.appendChild(card);
  });
}

// ── Load Data with loading state ──
async function loadFlights() {
  renderFlightSkeletons();
  document.getElementById('flightStatus').textContent = 'Fetching flight data…';

  await new Promise(r => setTimeout(r, rand(800, 1800)));

  const flights = generateFlights();
  renderFlights(flights);
}

async function loadFares() {
  renderDestSkeletons();
  await new Promise(r => setTimeout(r, rand(1000, 2200)));
  const fares = generateFares();
  renderFares(fares);
}

// ── Navigation ──
function initNav() {
  const nav = document.getElementById('nav');
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  });

  toggle.addEventListener('click', () => {
    links.classList.toggle('open');
    toggle.classList.toggle('active');
  });

  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      links.classList.remove('open');
      toggle.classList.remove('active');
    });
  });
}

// ── Scroll Reveal ──
function initReveal() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}

// ── Refresh Button ──
function initRefresh() {
  const btn = document.getElementById('refreshFlights');
  btn.addEventListener('click', async () => {
    btn.classList.add('spinning');
    await loadFlights();
    await loadFares();
    setTimeout(() => btn.classList.remove('spinning'), 500);
  });
}

// ── Contact Form ──
function initForm() {
  const form = document.getElementById('contactForm');
  const btn = document.getElementById('submitInquiry');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    btn.textContent = '✓ Inquiry Sent!';
    btn.style.background = '#06d6a0';
    btn.style.borderColor = '#06d6a0';
    setTimeout(() => {
      btn.textContent = 'Send Inquiry';
      btn.style.background = '';
      btn.style.borderColor = '';
      form.reset();
    }, 3000);
  });
}

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initReveal();
  initRefresh();
  initForm();
  loadFlights();
  loadFares();
});
