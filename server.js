/* ═══════════════════════════════════════════
   HACs L.A — Flight Data Backend
   AeroAPI (FlightAware) — Departures & Arrivals
   Lubumbashi International (FZQA / FBM)
   ═══════════════════════════════════════════ */

require('dotenv').config();
const express = require('express');
const axios   = require('axios');
const https   = require('https');
const path    = require('path');
const fs      = require('fs');

const app      = express();
const PORT     = parseInt(process.env.PORT,      10) || 3000;
const CACHE_TTL = parseInt(process.env.CACHE_TTL, 10) || 300; // seconds

app.use(express.json());

// ── API Key (runtime-mutable) ──
let AEROAPI_KEY = process.env.AEROAPI_KEY || '';

// ── In-Memory Cache ──
const cache = {
  departures: null,
  arrivals:   null,
  timestamp:  0,
  source:     'none',
};

function isCacheValid() {
  return cache.departures !== null &&
         cache.arrivals   !== null &&
         (Date.now() - cache.timestamp) < CACHE_TTL * 1000;
}

function invalidateCache() {
  cache.departures = null;
  cache.arrivals   = null;
  cache.timestamp  = 0;
}

// ── Serve static files ──
app.use(express.static(path.join(__dirname), {
  index: 'index.html',
}));

// ── Known airlines lookup ──
const AIRLINE_META = {
  ET: { name: 'Ethiopian Airlines', flag: '🇪🇹' },
  KQ: { name: 'Kenya Airways', flag: '🇰🇪' },
  SA: { name: 'South African Airways', flag: '🇿🇦' },
  WB: { name: 'RwandAir', flag: '🇷🇼' },
  '8Z': { name: 'Congo Airways', flag: '🇨🇩' },
  TC: { name: 'Air Tanzania', flag: '🇹🇿' },
  QR: { name: 'Qatar Airways', flag: '🇶🇦' },
  EK: { name: 'Emirates', flag: '🇦🇪' },
  TK: { name: 'Turkish Airlines', flag: '🇹🇷' },
  MS: { name: 'EgyptAir', flag: '🇪🇬' },
};

// ── Airport metadata ──
const AIRPORT_META = {
  ADD: { city: 'Addis Ababa',   country: 'Ethiopia',      flag: '🇪🇹' },
  NBO: { city: 'Nairobi',       country: 'Kenya',         flag: '🇰🇪' },
  JNB: { city: 'Johannesburg',  country: 'South Africa',  flag: '🇿🇦' },
  CPT: { city: 'Cape Town',     country: 'South Africa',  flag: '🇿🇦' },
  KGL: { city: 'Kigali',        country: 'Rwanda',        flag: '🇷🇼' },
  DAR: { city: 'Dar es Salaam', country: 'Tanzania',      flag: '🇹🇿' },
  FIH: { city: 'Kinshasa',      country: 'DRC',           flag: '🇨🇩' },
  DXB: { city: 'Dubai',         country: 'UAE',           flag: '🇦🇪' },
  BOM: { city: 'Mumbai',        country: 'India',         flag: '🇮🇳' },
  KHI: { city: 'Karachi',       country: 'Pakistan',      flag: '🇵🇰' },
  DOH: { city: 'Doha',          country: 'Qatar',         flag: '🇶🇦' },
  IST: { city: 'Istanbul',      country: 'Turkey',        flag: '🇹🇷' },
  CAI: { city: 'Cairo',         country: 'Egypt',         flag: '🇪🇬' },
  FBM: { city: 'Lubumbashi',    country: 'DRC',           flag: '🇨🇩' },
};

// ══════════════════════════════════════
//  FlightRadar24 internal API fetch
// ══════════════════════════════════════

const FR24_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9',
  'Origin': 'https://www.flightradar24.com',
  'Referer': 'https://www.flightradar24.com/',
};

async function fetchFR24Schedule(airportCode) {
  const ts  = Math.floor(Date.now() / 1000);
  const url = `https://api.flightradar24.com/common/v1/airport.json` +
    `?code=${airportCode.toLowerCase()}` +
    `&plugin[]=schedule` +
    `&plugin-setting[schedule][mode]=` +
    `&plugin-setting[schedule][timestamp]=${ts}` +
    `&page=1&limit=100`;

  const response = await axios.get(url, { headers: FR24_HEADERS, timeout: 12000 });
  const schedule = response.data?.result?.response?.airport?.pluginData?.schedule;
  if (!schedule) throw new Error('FR24: unexpected response structure');
  return {
    arrivals:   schedule.arrivals?.data   || [],
    departures: schedule.departures?.data || [],
  };
}

function mapFR24Flight(record, type) {
  const f = record.flight || {};
  const airlineIata = f.airline?.code?.iata || '';
  const airlineMeta = AIRLINE_META[airlineIata] || {};

  const remoteApt  = type === 'departure' ? f.airport?.destination : f.airport?.origin;
  const remoteIata = remoteApt?.code?.iata || '';
  const remoteMeta = AIRPORT_META[remoteIata] || {};

  const toISO = (ts) => (ts && ts > 0) ? new Date(ts * 1000).toISOString() : null;

  const depSchedTS = f.time?.scheduled?.departure;
  const depEstTS   = f.time?.estimated?.departure;
  const arrSchedTS = f.time?.scheduled?.arrival;
  const arrEstTS   = f.time?.estimated?.arrival;

  let status = 'scheduled';
  const statusText = (f.status?.text || '').toLowerCase();
  if      (statusText.includes('land') || statusText.includes('arriv'))  status = 'landed';
  else if (statusText.includes('en route') || statusText.includes('airborne')) status = 'departed';
  else if (statusText.includes('cancel'))                                status = 'cancelled';
  else if (statusText.includes('delay'))                                 status = 'delayed';
  else if (statusText.includes('boarding'))                              status = 'boarding';

  return {
    type,
    airline: {
      iata: airlineIata,
      icao: f.airline?.code?.icao || '',
      name: airlineMeta.name || f.airline?.name || airlineIata || 'Unknown',
      flag: airlineMeta.flag || '✈️',
    },
    flightNumber: f.identification?.number?.default || `${airlineIata}???`,
    airport: {
      iata:    remoteIata,
      icao:    remoteApt?.code?.icao || '',
      city:    remoteMeta.city    || remoteApt?.name || remoteIata,
      country: remoteMeta.country || '',
      flag:    remoteMeta.flag    || '🌍',
    },
    departure: {
      scheduledUTC: toISO(depSchedTS),
      estimatedUTC: depEstTS && depEstTS !== depSchedTS ? toISO(depEstTS) : null,
    },
    arrival: {
      scheduledUTC: toISO(arrSchedTS),
      estimatedUTC: arrEstTS && arrEstTS !== arrSchedTS ? toISO(arrEstTS) : null,
    },
    status,
    aircraft: f.aircraft?.model?.code || '',
    gate: '',
  };
}

function processFR24Response(rawData) {
  const departures = rawData.departures
    .map(r => mapFR24Flight(r, 'departure'))
    .filter(f => f.flightNumber && f.flightNumber !== '???')
    .sort((a, b) => new Date(a.departure.scheduledUTC || 0) - new Date(b.departure.scheduledUTC || 0));

  const arrivals = rawData.arrivals
    .map(r => mapFR24Flight(r, 'arrival'))
    .filter(f => f.flightNumber && f.flightNumber !== '???')
    .sort((a, b) => new Date(a.arrival.scheduledUTC || 0) - new Date(b.arrival.scheduledUTC || 0));

  return { departures, arrivals };
}

// ══════════════════════════════════════
//  AeroAPI Fetch  (HTTPS + x-apikey)
// ══════════════════════════════════════

function aeroApiFetch(endpoint) {
  return new Promise((resolve, reject) => {
    if (!AEROAPI_KEY) return reject(new Error('AeroAPI key not configured'));

    const options = {
      hostname: 'aeroapi.flightaware.com',
      path:     `/aeroapi${endpoint}`,
      method:   'GET',
      headers: {
        'x-apikey': AEROAPI_KEY,
        'Accept':   'application/json; charset=UTF-8',
      },
      timeout: 12000,
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => {
        try {
          if (res.statusCode === 401 || res.statusCode === 403) {
            return reject(new Error(`AeroAPI auth error (${res.statusCode}) — check your API key`));
          }
          if (res.statusCode !== 200) {
            return reject(new Error(`AeroAPI HTTP ${res.statusCode}`));
          }
          resolve(JSON.parse(body));
        } catch (e) {
          reject(new Error('Invalid JSON from AeroAPI'));
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('AeroAPI timed out')); });
    req.end();
  });
}

// ══════════════════════════════════════
//  Map AeroAPI flight → Normalized format
//  type: 'departure' | 'arrival'
// ══════════════════════════════════════

function mapAeroFlight(f, type) {
  const iataIdent   = f.ident_iata || f.ident || '';
  const match       = iataIdent.match(/^([A-Z0-9]{2})\d/);
  const airlineIata = f.operator_iata || (match ? match[1] : '');
  const airlineMeta = AIRLINE_META[airlineIata] || {};

  // Remote airport: destination when departing, origin when arriving
  const remoteApt   = type === 'departure' ? f.destination : f.origin;
  const remoteIata  = remoteApt?.code_iata || '';
  const remoteMeta  = AIRPORT_META[remoteIata] || {};

  // AeroAPI times — use gate times (out/in) as primary; fall back to off/on (wheels)
  // "scheduled_out" = gate departure (pushback)   "scheduled_in" = gate arrival
  const depSched = type === 'departure'
    ? (f.scheduled_out || f.scheduled_off || null)
    : (f.scheduled_in  || f.scheduled_on  || null);
  const depEst   = type === 'departure'
    ? (f.estimated_out || f.estimated_off || null)
    : (f.estimated_in  || f.estimated_on  || null);
  const arrSched = type === 'departure'
    ? (f.scheduled_in  || f.scheduled_on  || null)
    : (f.scheduled_out || f.scheduled_off || null);
  const arrEst   = type === 'departure'
    ? (f.estimated_in  || f.estimated_on  || null)
    : (f.estimated_out || f.estimated_off || null);

  let status = 'scheduled';
  if (f.cancelled) {
    status = 'cancelled';
  } else {
    const s = (f.status || '').toLowerCase();
    if      (s.includes('landed') || s.includes('arrived'))           status = 'landed';
    else if (s.includes('en route') || s.includes('airborne'))        status = 'departed';
    else if (s.includes('delay'))                                      status = 'delayed';
    else if (s.includes('boarding'))                                   status = 'boarding';
    else if (s.includes('on time') || s.includes('scheduled'))        status = 'scheduled';
  }

  return {
    type,
    airline: {
      iata: airlineIata,
      icao: f.operator || '',
      name: airlineMeta.name || f.operator_iata || airlineIata || 'Unknown',
      flag: airlineMeta.flag || '✈️',
    },
    flightNumber: iataIdent || `${airlineIata}???`,
    airport: {
      iata:    remoteIata,
      icao:    remoteApt?.code || '',
      city:    remoteMeta.city    || remoteApt?.city    || remoteIata,
      country: remoteMeta.country || '',
      flag:    remoteMeta.flag    || '🌍',
    },
    departure: {
      scheduledUTC: depSched,
      estimatedUTC: (depEst && depEst !== depSched) ? depEst : null,
    },
    arrival: {
      scheduledUTC: arrSched,
      estimatedUTC: (arrEst && arrEst !== arrSched) ? arrEst : null,
    },
    status,
    aircraft: f.aircraft_type || '',
    gate:     type === 'departure' ? (f.gate_origin || '') : (f.gate_destination || ''),
  };
}

function processAeroResponse(data, type) {
  const list = type === 'departure' ? (data.departures || []) : (data.arrivals || []);
  return list
    .filter(f => !f.blocked && !f.position_only)
    .map(f => mapAeroFlight(f, type))
    .sort((a, b) => new Date(a.departure.scheduledUTC || 0) - new Date(b.departure.scheduledUTC || 0));
}

// ══════════════════════════════════════
//  Fallback static schedule (CAT = UTC+2)
// ══════════════════════════════════════

const FALLBACK_DEPARTURES = [
  { flightNum: 'ET 865',  airline: 'ET',  dest: 'ADD', depLocal: '05:45', durationMin: 270, days: [1,3,5,7] },
  { flightNum: 'ET 866',  airline: 'ET',  dest: 'ADD', depLocal: '22:30', durationMin: 265, days: [2,4,6]   },
  { flightNum: 'KQ 457',  airline: 'KQ',  dest: 'NBO', depLocal: '11:20', durationMin: 225, days: [1,2,4,5,7]},
  { flightNum: 'SA 047',  airline: 'SA',  dest: 'JNB', depLocal: '08:15', durationMin: 250, days: [1,3,5,7] },
  { flightNum: 'SA 049',  airline: 'SA',  dest: 'CPT', depLocal: '07:50', durationMin: 340, days: [2,6]      },
  { flightNum: 'WB 205',  airline: 'WB',  dest: 'KGL', depLocal: '14:30', durationMin: 135, days: [1,3,5]    },
  { flightNum: 'TC 312',  airline: 'TC',  dest: 'DAR', depLocal: '09:40', durationMin: 205, days: [2,4,6]    },
  { flightNum: 'ET 343',  airline: 'ET',  dest: 'DXB', depLocal: '23:15', durationMin: 480, days: [1,3,5,7] },
  { flightNum: 'ET 609',  airline: 'ET',  dest: 'BOM', depLocal: '05:45', durationMin: 620, days: [2,4,6]    },
  { flightNum: 'KQ 310',  airline: 'KQ',  dest: 'KHI', depLocal: '11:20', durationMin: 660, days: [1,4,7]    },
  { flightNum: '8Z 102',  airline: '8Z',  dest: 'FIH', depLocal: '06:30', durationMin: 180, days: [1,2,3,4,5,6,7] },
];

const FALLBACK_ARRIVALS = [
  { flightNum: 'ET 866',  airline: 'ET',  orig: 'ADD', arrLocal: '21:40', durationMin: 270, days: [2,4,6]    },
  { flightNum: 'KQ 458',  airline: 'KQ',  orig: 'NBO', arrLocal: '13:35', durationMin: 225, days: [1,2,4,5,7]},
  { flightNum: 'SA 048',  airline: 'SA',  orig: 'JNB', arrLocal: '10:20', durationMin: 250, days: [1,3,5,7]  },
  { flightNum: 'SA 050',  airline: 'SA',  orig: 'CPT', arrLocal: '14:25', durationMin: 340, days: [2,6]       },
  { flightNum: 'WB 206',  airline: 'WB',  orig: 'KGL', arrLocal: '16:45', durationMin: 135, days: [1,3,5]    },
  { flightNum: 'TC 313',  airline: 'TC',  orig: 'DAR', arrLocal: '11:50', durationMin: 205, days: [2,4,6]    },
  { flightNum: 'ET 344',  airline: 'ET',  orig: 'DXB', arrLocal: '09:00', durationMin: 480, days: [1,3,5,7]  },
  { flightNum: 'ET 865',  airline: 'ET',  orig: 'ADD', arrLocal: '09:50', durationMin: 270, days: [1,3,5,7]  },
  { flightNum: '8Z 101',  airline: '8Z',  orig: 'FIH', arrLocal: '05:10', durationMin: 180, days: [1,2,3,4,5,6,7] },
];

function buildFallbackFlights(schedule, type) {
  const now     = new Date();
  const flights = [];

  for (let offset = 0; offset < 3 && flights.length < 10; offset++) {
    const d   = new Date(now);
    d.setDate(d.getDate() + offset);
    const dow = d.getDay() || 7;

    for (const s of schedule) {
      if (!s.days.includes(dow)) continue;

      const timeStr = type === 'departure' ? s.depLocal : s.arrLocal;
      const [hh, mm] = timeStr.split(':').map(Number);
      // CAT = UTC+2, so UTC = local - 2
      const pivotUTC = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), hh - 2, mm));

      if (pivotUTC < now - 30 * 60000) continue;

      const airlineMeta = AIRLINE_META[s.airline]  || {};
      const aptCode     = type === 'departure' ? s.dest : s.orig;
      const aptMeta     = AIRPORT_META[aptCode] || {};

      const depUTC = type === 'departure' ? pivotUTC : new Date(pivotUTC.getTime() - s.durationMin * 60000);
      const arrUTC = type === 'departure' ? new Date(pivotUTC.getTime() + s.durationMin * 60000) : pivotUTC;

      const mins = (pivotUTC - now) / 60000;
      const status = mins < 0 ? 'departed' : mins <= 30 ? 'boarding' : 'scheduled';

      flights.push({
        type,
        airline:  { iata: s.airline, icao: '', name: airlineMeta.name || s.airline, flag: airlineMeta.flag || '✈️' },
        flightNumber: s.flightNum,
        airport:  { iata: aptCode, icao: '', city: aptMeta.city || aptCode, country: aptMeta.country || '', flag: aptMeta.flag || '🌍' },
        departure: { scheduledUTC: depUTC.toISOString(), estimatedUTC: null },
        arrival:   { scheduledUTC: arrUTC.toISOString(), estimatedUTC: null },
        status,
        aircraft: '',
        gate: '',
      });

      if (flights.length >= 10) break;
    }
  }

  return flights
    .sort((a, b) => new Date(a.departure.scheduledUTC) - new Date(b.departure.scheduledUTC))
    .slice(0, 10);
}

// ══════════════════════════════════════
//  GET /api/flights
// ══════════════════════════════════════

app.get('/api/flights', async (req, res) => {
  if (isCacheValid()) {
    return res.json({
      success:       true,
      source:        cache.source,
      cached:        true,
      cacheTTL:      CACHE_TTL,
      cacheAge:      Math.round((Date.now() - cache.timestamp) / 1000),
      updatedAtUTC:  new Date(cache.timestamp).toISOString(),
      departures:    cache.departures,
      arrivals:      cache.arrivals,
    });
  }

  // ── Source priority: FR24 → AeroAPI → static fallback ──

  // 1. Try FlightRadar24 internal schedule API
  try {
    const rawData    = await fetchFR24Schedule('FBM');
    const { departures, arrivals } = processFR24Response(rawData);

    cache.departures = departures;
    cache.arrivals   = arrivals;
    cache.timestamp  = Date.now();
    cache.source     = 'fr24';

    return res.json({
      success:      true,
      source:       'fr24',
      cached:       false,
      cacheTTL:     CACHE_TTL,
      cacheAge:     0,
      updatedAtUTC: new Date(cache.timestamp).toISOString(),
      departures,
      arrivals,
    });
  } catch (fr24Err) {
    console.warn('[flights] FR24 failed:', fr24Err.message, '— trying AeroAPI');
  }

  // 2. Try AeroAPI (if key is configured)
  if (AEROAPI_KEY) {
    try {
      const [depData, arrData] = await Promise.all([
        aeroApiFetch('/airports/FZQA/flights/departures'),
        aeroApiFetch('/airports/FZQA/flights/arrivals'),
      ]);

      const departures = processAeroResponse(depData, 'departure');
      const arrivals   = processAeroResponse(arrData, 'arrival');

      cache.departures = departures;
      cache.arrivals   = arrivals;
      cache.timestamp  = Date.now();
      cache.source     = 'aeroapi';

      return res.json({
        success:      true,
        source:       'aeroapi',
        cached:       false,
        cacheTTL:     CACHE_TTL,
        cacheAge:     0,
        updatedAtUTC: new Date(cache.timestamp).toISOString(),
        departures,
        arrivals,
      });
    } catch (aeroErr) {
      console.warn('[flights] AeroAPI failed:', aeroErr.message, '— using fallback');
    }
  }

  // 3. Static fallback schedule
  {
    const departures = buildFallbackFlights(FALLBACK_DEPARTURES, 'departure');
    const arrivals   = buildFallbackFlights(FALLBACK_ARRIVALS,   'arrival');

    cache.departures = departures;
    cache.arrivals   = arrivals;
    cache.timestamp  = Date.now();
    cache.source     = 'fallback';

    return res.json({
      success:      true,
      source:       'fallback',
      cached:       false,
      cacheTTL:     CACHE_TTL,
      cacheAge:     0,
      updatedAtUTC: new Date(cache.timestamp).toISOString(),
      warning:      'Live data unavailable — showing published schedule',
      departures,
      arrivals,
    });
  }
});

// ══════════════════════════════════════
//  POST /api/configure — save AeroAPI key
// ══════════════════════════════════════

app.post('/api/configure', (req, res) => {
  const { aeroApiKey } = req.body || {};

  if (typeof aeroApiKey !== 'string') {
    return res.status(400).json({ success: false, error: 'aeroApiKey must be a string' });
  }

  AEROAPI_KEY = aeroApiKey.trim();
  invalidateCache();

  // Persist to .env
  try {
    const envPath = path.join(__dirname, '.env');
    let lines = [];
    if (fs.existsSync(envPath)) {
      lines = fs.readFileSync(envPath, 'utf8')
        .split('\n')
        .filter(l => !l.startsWith('AEROAPI_KEY=') && l.trim() !== '');
    }
    lines.push(`AEROAPI_KEY=${AEROAPI_KEY}`);
    fs.writeFileSync(envPath, lines.join('\n') + '\n', 'utf8');
  } catch (e) {
    console.warn('[configure] Could not write .env:', e.message);
  }

  console.log('[configure] AeroAPI key updated, cache cleared');
  return res.json({
    success:       true,
    keyConfigured: !!AEROAPI_KEY,
    message:       AEROAPI_KEY ? 'AeroAPI key saved — live data will load on next refresh' : 'Key cleared',
  });
});

// ── Health check ──
app.get('/api/health', (req, res) => {
  res.json({
    status:        'ok',
    keyConfigured: !!AEROAPI_KEY,
    cacheValid:    isCacheValid(),
    cacheSource:   cache.source,
  });
});

// ── Start ──
app.listen(PORT, () => {
  console.log(`\n  HACs L.A Flight Server — http://localhost:${PORT}`);
  console.log(`  AeroAPI key: ${AEROAPI_KEY ? 'configured ✓' : 'NOT SET — using fallback schedule'}`);
  console.log(`  Cache TTL: ${CACHE_TTL}s\n`);
});

