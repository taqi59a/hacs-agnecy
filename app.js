/* ═══════════════════════════════════════════
   HACs L.A — Flight Engine + Bilingual i18n
   AeroAPI live data via backend • UTC→CAT display
   ═══════════════════════════════════════════ */

// ── Config ──
const AUTO_REFRESH_INTERVAL = 120; // seconds
const FLIGHTS_API_ENDPOINT = '/api/flights';
const CONFIGURE_API_ENDPOINT = '/api/configure';

// ── Current language (default: English) ──
let currentLang = localStorage.getItem('hacsLang') || 'en';

// ── Active flight tab ──
let activeTab = 'departures'; // 'departures' | 'arrivals'

// ═══════════════════════════════════
//  TRANSLATIONS
// ═══════════════════════════════════
const TRANSLATIONS = {
  en: {
    // Nav
    nav_about: 'About Us',
    nav_flights: 'Flights',
    nav_destinations: 'Destinations',
    nav_services: 'Services',
    nav_contact: 'Contact',
    nav_book: 'Book Now',
    // Hero
    hero_badge: '✈ Your Trusted Travel Partner in DRC',
    hero_title: 'Travel the World with<br><span class="gradient-text">HACs L.A</span>',
    hero_subtitle: 'Handling Aviation & Cargo Services — We find you the best fares, handle your cargo, and make your travel seamless from Lubumbashi to the world.',
    hero_cta_flights: 'View Flight Schedule',
    hero_cta_quote: 'Get a Free Quote',
    stat_destinations: 'Destinations',
    stat_airlines: 'Partner Airlines',
    stat_support: 'Support',
    // About
    about_title: 'About <span class="gradient-text">HACs L.A</span>',
    about_lead: 'HACs L.A (Handling Aviation & Cargo Services) is a professional travel agency based in Lubumbashi, Democratic Republic of Congo. We specialize in flight bookings, cargo handling, and comprehensive travel solutions.',
    about_desc: 'Founded with a mission to make air travel accessible and affordable for everyone in the DRC, we work with major airlines including Ethiopian Airlines, Kenya Airways, South African Airways, RwandAir, and more. Whether you\'re traveling for business, family visits, or leisure — we guarantee the best prices and personalized service.',
    about_hl1_title: 'Licensed Travel Agency',
    about_hl1_desc: 'Fully licensed and registered in the DRC',
    about_hl2_title: 'Multi-Airline Partner',
    about_hl2_desc: 'Direct partnerships with 6+ major airlines',
    about_hl3_title: 'Cargo & Freight',
    about_hl3_desc: 'Professional cargo handling worldwide',
    about_card1_title: 'Global Network',
    about_card1_desc: 'Africa, Middle East, Asia',
    about_card2_title: 'Best Prices',
    about_card2_desc: 'Guaranteed lowest fares',
    about_card3_title: 'Personal Service',
    about_card3_desc: 'Dedicated travel advisors',
    // Flights
    flights_title: 'Live Flights — <span class="gradient-text">Lubumbashi (FBM)</span>',
    flights_sub: 'Real-time departures & arrivals at Lubumbashi International Airport',
    flights_refresh: 'Refresh',
    flights_configure: 'Configure',
    flights_tab_dep: 'Departures',
    flights_tab_arr: 'Arrivals',
    flights_loading: 'Loading flights…',
    flights_note: 'Times shown in CAT (UTC+2). Powered by AeroAPI — actual times may vary.',
    flights_header_airline: 'Airline / Flight',
    flights_header_airport: 'Airport',
    flights_header_dep: 'Departure (CAT)',
    flights_header_arr: 'Arrival (CAT)',
    flights_header_status: 'Status',
    flights_upcoming: 'upcoming departures',
    flights_upcoming_arr: 'expected arrivals',
    flights_fetching: 'Fetching live data…',
    flights_autorefresh: 'Auto-refresh in',
    flights_updated: 'Updated',
    // Configure modal
    cfg_title: 'Configure AeroAPI',
    cfg_subtitle: 'Enter your FlightAware AeroAPI key to enable live flight data',
    cfg_key_label: 'AeroAPI Key',
    cfg_key_placeholder: 'Paste your AeroAPI key here…',
    cfg_status_ok: '● Live data active',
    cfg_status_none: '● No key — showing schedule',
    cfg_save: 'Save & Connect',
    cfg_cancel: 'Cancel',
    cfg_get_key: 'Get a free AeroAPI key →',
    cfg_saving: 'Connecting…',
    cfg_success: '✓ Connected — refreshing data',
    cfg_error: 'Could not save key. Check server.',
    // Destinations
    dest_title: 'Best Fares to Top <span class="gradient-text">Destinations</span>',
    dest_sub: 'Starting prices in USD — contact us for exact quotes & booking',
    dest_airline: 'Airline',
    dest_duration: 'Duration',
    dest_next: 'Next Departure',
    dest_class: 'Class',
    dest_economy: 'Economy',
    dest_from: 'Starting from',
    dest_book: 'Book Now',
    // Services
    services_title: 'Why Choose <span class="gradient-text">HACs L.A</span>?',
    services_sub: 'Complete aviation and travel solutions for individuals and businesses',
    svc1_title: 'Best Price Guarantee',
    svc1_desc: 'We compare fares across all airlines to get you the cheapest possible price for every route.',
    svc2_title: 'Global Connections',
    svc2_desc: 'Flights to Dubai, Mumbai, Karachi, Cape Town, Johannesburg, Nairobi, Addis Ababa & more.',
    svc3_title: 'Cargo & Freight',
    svc3_desc: 'Professional handling of aviation cargo with tracking and secure delivery worldwide.',
    svc4_title: '24/7 Support',
    svc4_desc: 'Round-the-clock assistance for bookings, changes, and travel queries. Always here for you.',
    svc5_title: 'Multi-Airline Booking',
    svc5_desc: 'Ethiopian Airlines, Kenya Airways, South African Airways, RwandAir & more — all in one place.',
    svc6_title: 'Corporate Travel',
    svc6_desc: 'Tailored solutions for businesses — group bookings, corporate rates, and dedicated account management.',
    // CTA
    cta_title: 'Ready to fly?',
    cta_sub: 'Contact us now for the best possible fares from Lubumbashi and beyond',
    cta_btn: 'Get a Quote',
    // Contact
    contact_title: 'Book Your <span class="gradient-text">Flight</span>',
    contact_sub: 'Reach us anytime — we\'re always happy to help',
    contact_phone_title: 'Call or WhatsApp',
    contact_email_title: 'Email Us',
    contact_office_title: 'Visit Our Office',
    form_title: 'Quick Inquiry',
    form_name: 'Your Name',
    form_phone: 'Phone / WhatsApp',
    form_dest_placeholder: 'Where do you want to go?',
    form_dest_other: 'Other',
    form_pax: 'Passengers',
    form_notes: 'Any special requests...',
    form_submit: 'Send Inquiry',
    // Footer
    footer_desc: 'Handling Aviation & Cargo Services — Your gateway from Lubumbashi to the world.',
    footer_quick: 'Quick Links',
    footer_topdest: 'Top Destinations',
    footer_contact: 'Contact',
    footer_rights: 'All rights reserved.',
    // Misc
    wa_tooltip: 'Chat with us!',
  },
  fr: {
    // Nav
    nav_about: 'À Propos',
    nav_flights: 'Vols',
    nav_destinations: 'Destinations',
    nav_services: 'Services',
    nav_contact: 'Contact',
    nav_book: 'Réserver',
    // Hero
    hero_badge: '✈ Votre Partenaire de Voyage de Confiance en RDC',
    hero_title: 'Voyagez à travers le monde avec<br><span class="gradient-text">HACs L.A</span>',
    hero_subtitle: 'Handling Aviation & Cargo Services — Nous trouvons les meilleurs tarifs, gérons votre fret et facilitons vos voyages de Lubumbashi vers le monde entier.',
    hero_cta_flights: 'Voir les Horaires de Vols',
    hero_cta_quote: 'Devis Gratuit',
    stat_destinations: 'Destinations',
    stat_airlines: 'Compagnies Partenaires',
    stat_support: 'Assistance',
    // About
    about_title: 'À Propos de <span class="gradient-text">HACs L.A</span>',
    about_lead: 'HACs L.A (Handling Aviation & Cargo Services) est une agence de voyage professionnelle basée à Lubumbashi, République Démocratique du Congo. Nous sommes spécialisés dans la réservation de vols, la manutention de fret et les solutions de voyage complètes.',
    about_desc: 'Fondée avec la mission de rendre le transport aérien accessible et abordable pour tous en RDC, nous travaillons avec les grandes compagnies aériennes dont Ethiopian Airlines, Kenya Airways, South African Airways, RwandAir et bien d\'autres. Que vous voyagiez pour affaires, visites familiales ou loisirs — nous garantissons les meilleurs prix et un service personnalisé.',
    about_hl1_title: 'Agence de Voyage Agréée',
    about_hl1_desc: 'Entièrement licenciée et enregistrée en RDC',
    about_hl2_title: 'Partenaire Multi-Compagnies',
    about_hl2_desc: 'Partenariats directs avec 6+ compagnies majeures',
    about_hl3_title: 'Cargo & Fret',
    about_hl3_desc: 'Manutention professionnelle de fret dans le monde entier',
    about_card1_title: 'Réseau Mondial',
    about_card1_desc: 'Afrique, Moyen-Orient, Asie',
    about_card2_title: 'Meilleurs Prix',
    about_card2_desc: 'Tarifs les plus bas garantis',
    about_card3_title: 'Service Personnel',
    about_card3_desc: 'Conseillers de voyage dédiés',
    // Flights
    flights_title: 'Vols en Direct — <span class="gradient-text">Lubumbashi (FBM)</span>',
    flights_sub: 'Départs et arrivées en temps réel à l\'Aéroport International de Lubumbashi',
    flights_refresh: 'Actualiser',
    flights_configure: 'Configurer',
    flights_tab_dep: 'Départs',
    flights_tab_arr: 'Arrivées',
    flights_loading: 'Chargement des vols…',
    flights_note: 'Heures affichées en CAT (UTC+2). Données AeroAPI — les horaires réels peuvent varier.',
    flights_header_airline: 'Compagnie / Vol',
    flights_header_airport: 'Aéroport',
    flights_header_dep: 'Départ (CAT)',
    flights_header_arr: 'Arrivée (CAT)',
    flights_header_status: 'Statut',
    flights_upcoming: 'prochains départs',
    flights_upcoming_arr: 'arrivées prévues',
    flights_fetching: 'Récupération des données…',
    flights_autorefresh: 'Actualisation dans',
    flights_updated: 'Mis à jour',
    // Configure modal
    cfg_title: 'Configurer AeroAPI',
    cfg_subtitle: 'Entrez votre clé AeroAPI FlightAware pour activer les données de vol en direct',
    cfg_key_label: 'Clé AeroAPI',
    cfg_key_placeholder: 'Collez votre clé AeroAPI ici…',
    cfg_status_ok: '● Données en direct actives',
    cfg_status_none: '● Aucune clé — affichage des horaires',
    cfg_save: 'Enregistrer & Connecter',
    cfg_cancel: 'Annuler',
    cfg_get_key: 'Obtenir une clé AeroAPI gratuite →',
    cfg_saving: 'Connexion…',
    cfg_success: '✓ Connecté — actualisation des données',
    cfg_error: 'Impossible d\'enregistrer la clé. Vérifiez le serveur.',
    // Destinations
    dest_title: 'Meilleurs Tarifs vers les <span class="gradient-text">Destinations</span> Populaires',
    dest_sub: 'Prix de départ en USD — contactez-nous pour un devis exact et une réservation',
    dest_airline: 'Compagnie',
    dest_duration: 'Durée',
    dest_next: 'Prochain Départ',
    dest_class: 'Classe',
    dest_economy: 'Économique',
    dest_from: 'À partir de',
    dest_book: 'Réserver',
    // Services
    services_title: 'Pourquoi Choisir <span class="gradient-text">HACs L.A</span> ?',
    services_sub: 'Solutions complètes d\'aviation et de voyage pour particuliers et entreprises',
    svc1_title: 'Garantie Meilleur Prix',
    svc1_desc: 'Nous comparons les tarifs de toutes les compagnies pour vous obtenir le prix le plus bas possible.',
    svc2_title: 'Connexions Mondiales',
    svc2_desc: 'Vols vers Dubaï, Mumbai, Karachi, Le Cap, Johannesburg, Nairobi, Addis-Abeba et plus.',
    svc3_title: 'Cargo & Fret',
    svc3_desc: 'Gestion professionnelle du fret aérien avec suivi et livraison sécurisée dans le monde entier.',
    svc4_title: 'Assistance 24/7',
    svc4_desc: 'Assistance disponible jour et nuit pour les réservations, modifications et demandes de voyage.',
    svc5_title: 'Réservation Multi-Compagnies',
    svc5_desc: 'Ethiopian Airlines, Kenya Airways, South African Airways, RwandAir et plus — tout en un seul endroit.',
    svc6_title: 'Voyages d\'Affaires',
    svc6_desc: 'Solutions sur mesure pour les entreprises — réservations de groupe, tarifs corporate et gestion de compte dédiée.',
    // CTA
    cta_title: 'Prêt à voyager ?',
    cta_sub: 'Contactez-nous maintenant pour les meilleurs tarifs depuis Lubumbashi et au-delà',
    cta_btn: 'Demander un Devis',
    // Contact
    contact_title: 'Réservez Votre <span class="gradient-text">Vol</span>',
    contact_sub: 'Contactez-nous à tout moment — nous sommes toujours à votre écoute',
    contact_phone_title: 'Appelez ou WhatsApp',
    contact_email_title: 'Envoyez-nous un Email',
    contact_office_title: 'Visitez Notre Bureau',
    form_title: 'Demande Rapide',
    form_name: 'Votre Nom',
    form_phone: 'Téléphone / WhatsApp',
    form_dest_placeholder: 'Où souhaitez-vous aller ?',
    form_dest_other: 'Autre',
    form_pax: 'Passagers',
    form_notes: 'Demandes spéciales...',
    form_submit: 'Envoyer la Demande',
    // Footer
    footer_desc: 'Handling Aviation & Cargo Services — Votre passerelle de Lubumbashi vers le monde.',
    footer_quick: 'Liens Rapides',
    footer_topdest: 'Destinations Populaires',
    footer_contact: 'Contact',
    footer_rights: 'Tous droits réservés.',
    // Misc
    wa_tooltip: 'Discutez avec nous !',
  }
};

function t(key) {
  return TRANSLATIONS[currentLang]?.[key] || TRANSLATIONS.en[key] || key;
}

// ═══════════════════════════════════
//  i18n ENGINE
// ═══════════════════════════════════
function applyTranslations() {
  // Text content
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const val = t(key);
    if (val) el.textContent = val;
  });
  // HTML content (for elements with spans inside)
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const key = el.getAttribute('data-i18n-html');
    const val = t(key);
    if (val) el.innerHTML = val;
  });
  // Placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    const val = t(key);
    if (val) el.placeholder = val;
  });
  // Update lang attribute
  document.documentElement.lang = currentLang;
  // Update lang toggle button
  const flag = document.getElementById('langFlag');
  const label = document.getElementById('langLabel');
  if (flag) flag.textContent = currentLang === 'en' ? '🇬🇧' : '🇫🇷';
  if (label) label.textContent = currentLang === 'en' ? 'EN' : 'FR';
}

function toggleLanguage() {
  currentLang = currentLang === 'en' ? 'fr' : 'en';
  localStorage.setItem('hacsLang', currentLang);
  applyTranslations();
  // Re-render dynamic content
  renderFlights(lastAllFlights);
  renderFares(lastFaresData);
}

// ═══════════════════════════════════
//  AIRLINES & ROUTES (for fare cards)
// ═══════════════════════════════════
const AIRLINES = [
  { code: 'ET', name: 'Ethiopian Airlines', flag: '🇪🇹' },
  { code: 'KQ', name: 'Kenya Airways',      flag: '🇰🇪' },
  { code: 'SA', name: 'South African Airways', flag: '🇿🇦' },
  { code: 'WB', name: 'RwandAir',           flag: '🇷🇼' },
  { code: '8Z', name: 'Congo Airways',      flag: '🇨🇩' },
  { code: 'TC', name: 'Air Tanzania',       flag: '🇹🇿' },
];

// ── Route data for destination cards ──
const ROUTES = [
  { code: 'DXB', city: 'Dubai',          country: 'UAE',          flag: '🇦🇪', airlines: ['ET','KQ'],    durationMin: 480, baseFare: 520 },
  { code: 'BOM', city: 'Mumbai',         country: 'India',        flag: '🇮🇳', airlines: ['ET'],         durationMin: 620, baseFare: 580 },
  { code: 'KHI', city: 'Karachi',        country: 'Pakistan',     flag: '🇵🇰', airlines: ['ET','KQ'],    durationMin: 660, baseFare: 610 },
  { code: 'CPT', city: 'Cape Town',      country: 'South Africa', flag: '🇿🇦', airlines: ['SA'],         durationMin: 340, baseFare: 380 },
  { code: 'JNB', city: 'Johannesburg',   country: 'South Africa', flag: '🇿🇦', airlines: ['SA'],         durationMin: 250, baseFare: 310 },
  { code: 'NBO', city: 'Nairobi',        country: 'Kenya',        flag: '🇰🇪', airlines: ['KQ'],         durationMin: 225, baseFare: 270 },
  { code: 'ADD', city: 'Addis Ababa',    country: 'Ethiopia',     flag: '🇪🇹', airlines: ['ET'],         durationMin: 270, baseFare: 290 },
  { code: 'KGL', city: 'Kigali',         country: 'Rwanda',       flag: '🇷🇼', airlines: ['WB'],         durationMin: 135, baseFare: 210 },
  { code: 'DAR', city: 'Dar es Salaam',  country: 'Tanzania',     flag: '🇹🇿', airlines: ['TC','KQ'],    durationMin: 205, baseFare: 250 },
  { code: 'FIH', city: 'Kinshasa',       country: 'DRC',          flag: '🇨🇩', airlines: ['8Z'],         durationMin: 180, baseFare: 190 },
];

// ═══════════════════════════════════
//  TIMEZONE: UTC → FBM Local (CAT, UTC+2)
// ═══════════════════════════════════
const FBM_UTC_OFFSET = 2; // Central Africa Time = UTC+2

/**
 * Convert a UTC ISO 8601 string to a Date object
 * adjusted for Lubumbashi local display (CAT, UTC+2).
 */
function utcToFBMLocal(isoString) {
  if (!isoString) return null;
  const utc = new Date(isoString);
  // Shift by UTC+2 hours for display purposes
  return new Date(utc.getTime() + FBM_UTC_OFFSET * 60 * 60 * 1000);
}

// ── Helpers ──
function pad(n) { return String(n).padStart(2, '0'); }
function formatTime(date) {
  if (!date || isNaN(date.getTime())) return '--:--';
  return pad(date.getUTCHours()) + ':' + pad(date.getUTCMinutes());
}
function formatDate(date) {
  if (!date || isNaN(date.getTime())) return '';
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return date.getUTCDate() + ' ' + months[date.getUTCMonth()] + ' ' + date.getUTCFullYear();
}
function formatDuration(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h + 'h ' + pad(m) + 'm';
}
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// ── Data source tracking ──
let lastDataSource = 'none'; // 'api' | 'fallback' | 'error'
let lastWarning = '';

// ═══════════════════════════════════
//  CLIENT-SIDE FALLBACK SCHEDULE
//  Used when the backend is unreachable
// ═══════════════════════════════════
const FBM_FALLBACK_DEPARTURES = [
  { flightNum: 'ET 865', airline: 'ET', dest: 'ADD', depLocal: '05:45', durationMin: 270, days: [1,3,5,7] },
  { flightNum: 'ET 866', airline: 'ET', dest: 'ADD', depLocal: '22:30', durationMin: 265, days: [2,4,6]   },
  { flightNum: 'KQ 457', airline: 'KQ', dest: 'NBO', depLocal: '11:20', durationMin: 225, days: [1,2,4,5,7] },
  { flightNum: 'SA 047', airline: 'SA', dest: 'JNB', depLocal: '08:15', durationMin: 250, days: [1,3,5,7] },
  { flightNum: 'SA 049', airline: 'SA', dest: 'CPT', depLocal: '07:50', durationMin: 340, days: [2,6]     },
  { flightNum: 'WB 205', airline: 'WB', dest: 'KGL', depLocal: '14:30', durationMin: 135, days: [1,3,5]   },
  { flightNum: 'TC 312', airline: 'TC', dest: 'DAR', depLocal: '09:40', durationMin: 205, days: [2,4,6]   },
  { flightNum: 'ET 343', airline: 'ET', dest: 'DXB', depLocal: '23:15', durationMin: 480, days: [1,3,5,7] },
  { flightNum: 'ET 609', airline: 'ET', dest: 'BOM', depLocal: '05:45', durationMin: 620, days: [2,4,6]   },
  { flightNum: 'KQ 310', airline: 'KQ', dest: 'KHI', depLocal: '11:20', durationMin: 660, days: [1,4,7]   },
  { flightNum: '8Z 102', airline: '8Z', dest: 'FIH', depLocal: '06:30', durationMin: 180, days: [1,2,3,4,5,6,7] },
];

const FBM_FALLBACK_ARRIVALS = [
  { flightNum: 'ET 866', airline: 'ET', orig: 'ADD', arrLocal: '21:40', durationMin: 270, days: [2,4,6]    },
  { flightNum: 'KQ 458', airline: 'KQ', orig: 'NBO', arrLocal: '13:35', durationMin: 225, days: [1,2,4,5,7] },
  { flightNum: 'SA 048', airline: 'SA', orig: 'JNB', arrLocal: '10:20', durationMin: 250, days: [1,3,5,7]  },
  { flightNum: 'SA 050', airline: 'SA', orig: 'CPT', arrLocal: '14:25', durationMin: 340, days: [2,6]      },
  { flightNum: 'WB 206', airline: 'WB', orig: 'KGL', arrLocal: '16:45', durationMin: 135, days: [1,3,5]    },
  { flightNum: 'TC 313', airline: 'TC', orig: 'DAR', arrLocal: '11:50', durationMin: 205, days: [2,4,6]    },
  { flightNum: 'ET 344', airline: 'ET', orig: 'DXB', arrLocal: '09:00', durationMin: 480, days: [1,3,5,7]  },
  { flightNum: 'ET 865', airline: 'ET', orig: 'ADD', arrLocal: '09:50', durationMin: 270, days: [1,3,5,7]  },
  { flightNum: '8Z 101', airline: '8Z', orig: 'FIH', arrLocal: '05:10', durationMin: 180, days: [1,2,3,4,5,6,7] },
];

const DEST_META = {
  ADD: { city: 'Addis Ababa',   country: 'Ethiopia',     flag: '🇪🇹' },
  NBO: { city: 'Nairobi',       country: 'Kenya',        flag: '🇰🇪' },
  JNB: { city: 'Johannesburg',  country: 'South Africa', flag: '🇿🇦' },
  CPT: { city: 'Cape Town',     country: 'South Africa', flag: '🇿🇦' },
  KGL: { city: 'Kigali',        country: 'Rwanda',       flag: '🇷🇼' },
  DAR: { city: 'Dar es Salaam', country: 'Tanzania',     flag: '🇹🇿' },
  FIH: { city: 'Kinshasa',      country: 'DRC',          flag: '🇨🇩' },
  DXB: { city: 'Dubai',         country: 'UAE',          flag: '🇦🇪' },
  BOM: { city: 'Mumbai',        country: 'India',        flag: '🇮🇳' },
  KHI: { city: 'Karachi',       country: 'Pakistan',     flag: '🇵🇰' },
};

function generateClientFallbackFlights(type) {
  const schedule = type === 'arrival' ? FBM_FALLBACK_ARRIVALS : FBM_FALLBACK_DEPARTURES;
  const now = new Date();
  const flights = [];

  for (let dayOffset = 0; dayOffset < 3 && flights.length < 10; dayOffset++) {
    const checkDate = new Date(now);
    checkDate.setDate(checkDate.getDate() + dayOffset);
    const dayOfWeek = checkDate.getDay() || 7;

    for (const sched of schedule) {
      if (!sched.days.includes(dayOfWeek)) continue;

      const timeStr = type === 'arrival' ? sched.arrLocal : sched.depLocal;
      const [hh, mm] = timeStr.split(':').map(Number);
      // CAT (UTC+2) → UTC: subtract 2 hours
      const pivotUTC = new Date(Date.UTC(
        checkDate.getFullYear(), checkDate.getMonth(), checkDate.getDate(),
        hh - 2, mm, 0
      ));

      if (pivotUTC.getTime() < now.getTime() - 30 * 60000) continue;

      const depUTC = type === 'arrival'
        ? new Date(pivotUTC.getTime() - sched.durationMin * 60000)
        : pivotUTC;
      const arrUTC = type === 'arrival'
        ? pivotUTC
        : new Date(pivotUTC.getTime() + sched.durationMin * 60000);

      const airlineMeta = AIRLINES.find(a => a.code === sched.airline) || { code: sched.airline, name: sched.airline, flag: '✈️' };
      const aptCode = type === 'arrival' ? sched.orig : sched.dest;
      const destMeta = DEST_META[aptCode] || {};

      const minsUntilPivot = (pivotUTC.getTime() - now.getTime()) / 60000;
      let status;
      if (minsUntilPivot < 0)    status = type === 'arrival' ? 'landed' : 'departed';
      else if (minsUntilPivot <= 30) status = type === 'arrival' ? 'approaching' : 'boarding';
      else status = 'scheduled';

      flights.push({
        type,
        airline: { iata: sched.airline, icao: '', name: airlineMeta.name, flag: airlineMeta.flag },
        flightNumber: sched.flightNum,
        airport: { iata: aptCode, city: destMeta.city || aptCode, country: destMeta.country || '', flag: destMeta.flag || '🌍' },
        departure: { scheduledUTC: depUTC.toISOString(), estimatedUTC: null },
        arrival:   { scheduledUTC: arrUTC.toISOString(), estimatedUTC: null },
        status,
        aircraft: '',
        gate: '',
      });

      if (flights.length >= 10) break;
    }
  }

  flights.sort((a, b) => new Date(a.departure.scheduledUTC) - new Date(b.departure.scheduledUTC));
  return flights.slice(0, 10);
}

// ═══════════════════════════════════
//  FETCH FLIGHTS FROM BACKEND
// ═══════════════════════════════════
async function fetchFlightsFromBackend() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    const resp = await fetch(FLIGHTS_API_ENDPOINT, { signal: controller.signal });
    clearTimeout(timeout);

    if (!resp.ok) {
      throw new Error(`Server responded ${resp.status}`);
    }

    const json = await resp.json();

    if (!json.success) {
      throw new Error('Server returned error');
    }

    lastDataSource = json.source || 'aeroapi';
    lastWarning = json.warning || '';

    return {
      departures: json.departures || [],
      arrivals:   json.arrivals   || [],
    };
  } catch (err) {
    clearTimeout(timeout);
    console.warn('[flights] Backend unreachable, using client-side schedule:', err.message);
    lastDataSource = 'fallback';
    lastWarning = 'Live data unavailable — showing published schedule';
    return {
      departures: generateClientFallbackFlights('departure'),
      arrivals:   generateClientFallbackFlights('arrival'),
    };
  }
}

// ═══════════════════════════════════
//  FARE GENERATOR
// ═══════════════════════════════════
function generateFares() {
  return ROUTES.map(route => {
    const airlineCode = pick(route.airlines);
    const airline = AIRLINES.find(a => a.code === airlineCode) || { code: airlineCode, name: airlineCode, flag: '✈️' };
    // Small price variation for realism
    const variation = Math.floor(Math.random() * 60) - 20;
    const price = route.baseFare + variation;
    // Find next departure date for this route
    const now = new Date();
    let depDate = new Date(now);
    depDate.setDate(depDate.getDate() + 2 + Math.floor(Math.random() * 14));
    return { ...route, airline, price, depDate };
  }).sort((a, b) => a.price - b.price);
}

// ═══════════════════════════════════
//  RENDER FUNCTIONS
// ═══════════════════════════════════
let lastAllFlights = { departures: [], arrivals: [] };
let lastFaresData = [];

function renderFlightSkeletons() {
  const board = document.getElementById('flightBoard');
  board.innerHTML = '';
  for (let i = 0; i < 6; i++) {
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
      <div style="display:flex;justify-content:space-between;margin-bottom:16px">
        <div class="skeleton" style="width:40px;height:40px;border-radius:10px"></div>
        <div class="skeleton" style="width:72px;height:24px;border-radius:6px"></div>
      </div>
      <div class="skeleton skeleton--text" style="width:60%;height:18px;margin-bottom:6px"></div>
      <div class="skeleton skeleton--text-sm" style="width:40%"></div>`;
    grid.appendChild(el);
  }
}

function renderFlights(allData) {
  if (!allData) return;
  lastAllFlights = allData;
  renderFlightsForTab(activeTab);
}

function renderFlightsForTab(tab) {
  activeTab = tab;
  const flights = lastAllFlights[tab] || [];

  // Update tab active state
  document.querySelectorAll('.flight-tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });

  if (!flights.length) {
    renderFlightError();
    return;
  }

  const isArr = tab === 'arrivals';
  const board = document.getElementById('flightBoard');
  board.innerHTML = `
    <div class="flight-header">
      <span>${t('flights_header_airline')}</span>
      <span>${t('flights_header_airport')}</span>
      <span>${isArr ? t('flights_header_arr') : t('flights_header_dep')}</span>
      <span>${isArr ? t('flights_header_dep') : t('flights_header_arr')}</span>
      <span>${t('flights_header_status')}</span>
    </div>`;

  flights.forEach((f, i) => {
    // Convert UTC timestamps to Lubumbashi local (CAT, UTC+2) for display
    const depLocal = utcToFBMLocal(f.departure.estimatedUTC || f.departure.scheduledUTC);
    const arrLocal = utcToFBMLocal(f.arrival.estimatedUTC  || f.arrival.scheduledUTC);

    // For arrivals the "primary" time shown first is the arrival time
    const primaryLocal   = isArr ? arrLocal : depLocal;
    const secondaryLocal = isArr ? depLocal : arrLocal;

    const statusMap = {
      'scheduled':   { label: 'Scheduled',   cls: 'status--scheduled' },
      'on-time':     { label: 'On Time',      cls: 'status--ontime'    },
      'boarding':    { label: 'Boarding',     cls: 'status--boarding'  },
      'departed':    { label: 'Departed',     cls: 'status--scheduled' },
      'delayed':     { label: 'Delayed',      cls: 'status--delayed'   },
      'cancelled':   { label: 'Cancelled',    cls: 'status--delayed'   },
      'landed':      { label: 'Landed',       cls: 'status--ontime'    },
      'approaching': { label: 'Approaching',  cls: 'status--boarding'  },
    };
    const st = statusMap[f.status] || statusMap['scheduled'];

    const hasEstimate = (isArr ? f.arrival.estimatedUTC : f.departure.estimatedUTC);

    // Direction badge
    const dirBadge = isArr
      ? `<span class="flight-dir flight-dir--arr">▼ ARR</span>`
      : `<span class="flight-dir flight-dir--dep">▲ DEP</span>`;

    const aptInfo = f.airport || f.destination || {};
    const gateInfo = f.gate ? `<div class="flight-row__gate">Gate ${f.gate}</div>` : '';

    const row = document.createElement('div');
    row.className = 'flight-row';
    row.style.animationDelay = (i * 0.05) + 's';
    row.innerHTML = `
      <div class="flight-row__airline">
        <span class="flight-row__airline-flag">${f.airline.flag}</span>
        <div>
          <div class="flight-row__code">${dirBadge} ${f.flightNumber}</div>
          <div class="flight-row__name">${f.airline.name}</div>
        </div>
      </div>
      <div class="flight-row__dest">
        <div class="flight-row__city">${aptInfo.city || aptInfo.iata || '—'}</div>
        <div class="flight-row__iata">${isArr ? (aptInfo.iata || '') + ' → FBM' : 'FBM → ' + (aptInfo.iata || '')}</div>
        ${gateInfo}
      </div>
      <div class="flight-row__time">
        <div class="flight-row__time-val">${formatTime(primaryLocal)}${hasEstimate ? ' *' : ''}</div>
        <div class="flight-row__time-label">${formatDate(primaryLocal)} CAT</div>
      </div>
      <div class="flight-row__time">
        <div class="flight-row__time-val">${formatTime(secondaryLocal)}</div>
        <div class="flight-row__time-label">${formatDate(secondaryLocal)}</div>
      </div>
      <div class="flight-row__status ${st.cls}">${st.label}</div>`;
    board.appendChild(row);
  });

  const countKey = isArr ? 'flights_upcoming_arr' : 'flights_upcoming';
  document.getElementById('flightStatus').textContent = `${flights.length} ${t(countKey)}`;
  const nowCAT = utcToFBMLocal(new Date().toISOString());
  document.getElementById('lastUpdated').textContent = t('flights_updated') + ' ' + formatTime(nowCAT) + ' CAT';
  updateDataSourceBadge();
}

function renderFlightError() {
  const board = document.getElementById('flightBoard');
  board.innerHTML = `
    <div class="flights__error">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.5">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <p>${currentLang === 'fr' ? 'Données de vol indisponibles' : 'Flight data unavailable'}</p>
      <p style="opacity:0.6;font-size:0.85rem">${currentLang === 'fr' ? 'Réessayez dans quelques instants' : 'Please try again shortly'}</p>
    </div>`;
  document.getElementById('flightStatus').textContent = currentLang === 'fr' ? 'Hors ligne' : 'Offline';
  updateDataSourceBadge();
}

function updateDataSourceBadge() {
  const el = document.getElementById('dataSourceBadge');
  if (!el) return;

  const badges = {
    fr24:     { text: '● LIVE', cls: 'data-badge--live' },
    aeroapi:  { text: '● LIVE', cls: 'data-badge--live' },
    api:      { text: '● LIVE', cls: 'data-badge--live' },
    fallback: { text: '● SCHEDULE', cls: 'data-badge--fallback' },
    error:    { text: '● OFFLINE', cls: 'data-badge--error' },
    none:     { text: '', cls: '' },
  };
  const b = badges[lastDataSource] || badges.none;
  el.textContent = b.text;
  el.className = 'data-source-badge ' + b.cls;
  el.title = lastWarning || '';
}

function renderFares(fares) {
  if (!fares || !fares.length) return;
  lastFaresData = fares;

  const grid = document.getElementById('destGrid');
  grid.innerHTML = '';

  fares.forEach((f, i) => {
    const card = document.createElement('div');
    card.className = 'dest-card';
    card.style.animationDelay = (i * 0.06) + 's';
    card.innerHTML = `
      <div class="dest-card__header">
        <span class="dest-card__flag">${f.flag}</span>
        <span class="dest-card__route">FBM → ${f.code}</span>
      </div>
      <div class="dest-card__city">${f.city}</div>
      <div class="dest-card__country">${f.country}</div>
      <div class="dest-card__details">
        <div>
          <div class="dest-card__detail-label">${t('dest_airline')}</div>
          <div class="dest-card__detail-value">${f.airline.flag} ${f.airline.name}</div>
        </div>
        <div>
          <div class="dest-card__detail-label">${t('dest_duration')}</div>
          <div class="dest-card__detail-value">${formatDuration(f.durationMin)}</div>
        </div>
        <div>
          <div class="dest-card__detail-label">${t('dest_next')}</div>
          <div class="dest-card__detail-value">${formatDate(f.depDate)}</div>
        </div>
        <div>
          <div class="dest-card__detail-label">${t('dest_class')}</div>
          <div class="dest-card__detail-value">${t('dest_economy')}</div>
        </div>
        <div class="dest-card__price">
          <div>
            <div class="dest-card__price-label">${t('dest_from')}</div>
            <div class="dest-card__price-val"><span>USD </span>$${f.price}</div>
          </div>
          <a href="#contact" class="btn btn--primary dest-card__book">${t('dest_book')}</a>
        </div>
      </div>`;
    grid.appendChild(card);
  });
}

// ═══════════════════════════════════
//  DATA LOADING
// ═══════════════════════════════════
async function loadFlights() {
  renderFlightSkeletons();
  document.getElementById('flightStatus').textContent = t('flights_fetching');

  const allData = await fetchFlightsFromBackend();
  renderFlights(allData);
}

async function loadFares() {
  renderDestSkeletons();
  await new Promise(r => setTimeout(r, 300));
  renderFares(generateFares());
}

async function refreshAll() {
  await Promise.all([loadFlights(), loadFares()]);
}

// ═══════════════════════════════════
//  AUTO-REFRESH
// ═══════════════════════════════════
let countdownTimer = null;

function startAutoRefresh() {
  clearInterval(countdownTimer);

  let remaining = AUTO_REFRESH_INTERVAL;
  const bar = document.getElementById('autoRefreshBar');
  const countdown = document.getElementById('refreshCountdown');

  if (bar) {
    bar.style.transition = 'none';
    bar.style.width = '0%';
    bar.offsetHeight; // Force reflow
    bar.style.transition = 'width 1s linear';
  }

  function updateCountdown() {
    if (countdown) {
      countdown.textContent = `${t('flights_autorefresh')} ${remaining}s`;
    }
    if (bar) {
      const pct = ((AUTO_REFRESH_INTERVAL - remaining) / AUTO_REFRESH_INTERVAL) * 100;
      bar.style.width = pct + '%';
    }
    remaining--;

    if (remaining < 0) {
      clearInterval(countdownTimer);
      doAutoRefresh();
    }
  }

  updateCountdown();
  countdownTimer = setInterval(updateCountdown, 1000);
}

async function doAutoRefresh() {
  await refreshAll();
  startAutoRefresh();
}

// ═══════════════════════════════════
//  NAVIGATION
// ═══════════════════════════════════
function initNav() {
  const nav = document.getElementById('nav');
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        nav.classList.toggle('scrolled', window.scrollY > 40);
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

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

  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target) && links.classList.contains('open')) {
      links.classList.remove('open');
      toggle.classList.remove('active');
    }
  });
}

// ═══════════════════════════════════
//  SCROLL REVEAL
// ═══════════════════════════════════
function initReveal() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}

// ═══════════════════════════════════
//  CONFIGURE MODAL
// ═══════════════════════════════════
function openConfigureModal() {
  const modal = document.getElementById('configureModal');
  if (!modal) return;
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  // Pre-fill saved key from localStorage (display only — not the real key)
  const keyInput = document.getElementById('aeroApiKeyInput');
  if (keyInput) keyInput.value = '';
  // Check current status
  fetch('/api/health').then(r => r.json()).then(data => {
    const statusEl = document.getElementById('cfgStatusText');
    if (statusEl) {
      statusEl.textContent = data.keyConfigured ? t('cfg_status_ok') : t('cfg_status_none');
      statusEl.className   = 'cfg-status ' + (data.keyConfigured ? 'cfg-status--ok' : 'cfg-status--none');
    }
  }).catch(() => {});
}

function closeConfigureModal() {
  const modal = document.getElementById('configureModal');
  if (!modal) return;
  modal.classList.remove('open');
  document.body.style.overflow = '';
}

async function saveAeroApiKey() {
  const keyInput = document.getElementById('aeroApiKeyInput');
  const saveBtn  = document.getElementById('cfgSaveBtn');
  const feedback = document.getElementById('cfgFeedback');
  if (!keyInput || !saveBtn) return;

  const key = keyInput.value.trim();
  saveBtn.textContent = t('cfg_saving');
  saveBtn.disabled = true;
  if (feedback) feedback.textContent = '';

  try {
    const resp = await fetch(CONFIGURE_API_ENDPOINT, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ aeroApiKey: key }),
    });
    const data = await resp.json();

    if (data.success) {
      if (feedback) {
        feedback.textContent = t('cfg_success');
        feedback.className = 'cfg-feedback cfg-feedback--ok';
      }
      // Close modal after 1.2s then refresh
      setTimeout(() => {
        closeConfigureModal();
        refreshAll().then(() => startAutoRefresh());
      }, 1200);
    } else {
      throw new Error(data.error || 'Save failed');
    }
  } catch (err) {
    if (feedback) {
      feedback.textContent = t('cfg_error');
      feedback.className = 'cfg-feedback cfg-feedback--err';
    }
    saveBtn.disabled = false;
    saveBtn.textContent = t('cfg_save');
  }
}

function initConfigureModal() {
  const openBtn  = document.getElementById('openConfigure');
  const closeBtn = document.getElementById('cfgCloseBtn');
  const cancelBtn = document.getElementById('cfgCancelBtn');
  const saveBtn  = document.getElementById('cfgSaveBtn');
  const overlay  = document.getElementById('configureModal');

  if (openBtn)   openBtn.addEventListener('click', openConfigureModal);
  if (closeBtn)  closeBtn.addEventListener('click', closeConfigureModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeConfigureModal);
  if (saveBtn)   saveBtn.addEventListener('click', saveAeroApiKey);

  // Close on overlay click
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeConfigureModal();
    });
  }

  // Enter key submits
  const keyInput = document.getElementById('aeroApiKeyInput');
  if (keyInput) {
    keyInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') saveAeroApiKey();
    });
  }
}

// ═══════════════════════════════════
//  FLIGHT TABS
// ═══════════════════════════════════
function initFlightTabs() {
  document.querySelectorAll('.flight-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      renderFlightsForTab(btn.dataset.tab);
    });
  });
}
function initRefresh() {
  const btn = document.getElementById('refreshFlights');
  btn.addEventListener('click', async () => {
    btn.classList.add('spinning');
    await refreshAll();
    startAutoRefresh();
    setTimeout(() => btn.classList.remove('spinning'), 600);
  });
}

// ═══════════════════════════════════
//  CONTACT FORM → WHATSAPP
// ═══════════════════════════════════
function initForm() {
  const form = document.getElementById('contactForm');
  const btn = document.getElementById('submitInquiry');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = form.querySelector('input[type="text"]').value.trim();
    const phone = form.querySelector('input[type="tel"]').value.trim();
    const dest = form.querySelector('select').value;
    const date = form.querySelector('input[type="date"]').value;
    const pax = form.querySelector('input[type="number"]').value;
    const notes = form.querySelector('textarea').value.trim();

    const msg = currentLang === 'fr'
      ? `Bonjour HACs L.A ! Je souhaite réserver un vol.\n\n*Nom:* ${name}\n*Tél:* ${phone}\n*Destination:* ${dest}\n*Date:* ${date}\n*Passagers:* ${pax}${notes ? '\n*Notes:* ' + notes : ''}`
      : `Hi HACs L.A! I'd like to book a flight.\n\n*Name:* ${name}\n*Phone:* ${phone}\n*Destination:* ${dest}\n*Date:* ${date}\n*Passengers:* ${pax}${notes ? '\n*Notes:* ' + notes : ''}`;

    const waURL = 'https://wa.me/243854833307?text=' + encodeURIComponent(msg);

    btn.textContent = currentLang === 'fr' ? '✓ Ouverture WhatsApp…' : '✓ Opening WhatsApp…';
    btn.style.background = '#25d366';
    btn.style.borderColor = '#25d366';
    btn.style.color = '#fff';

    window.open(waURL, '_blank', 'noopener');

    setTimeout(() => {
      btn.textContent = t('form_submit');
      btn.style.background = '';
      btn.style.borderColor = '';
      btn.style.color = '';
      form.reset();
    }, 3000);
  });
}

// ═══════════════════════════════════
//  SMOOTH SCROLL
// ═══════════════════════════════════
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

// ═══════════════════════════════════
//  LANGUAGE TOGGLE
// ═══════════════════════════════════
function initLangToggle() {
  const btn = document.getElementById('langToggle');
  btn.addEventListener('click', toggleLanguage);
}

// ═══════════════════════════════════
//  INIT
// ═══════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  // Apply saved language
  applyTranslations();

  initNav();
  initReveal();
  initRefresh();
  initFlightTabs();
  initConfigureModal();
  initForm();
  initSmoothScroll();
  initLangToggle();

  // Load data
  refreshAll().then(() => {
    startAutoRefresh();
  });
});