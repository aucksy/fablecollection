// AETHER series baked art + previews (Horizon, Ember).
import { art, preview, txt, T, COMPS, F } from './lib.mjs';

// ============================== 03·A HORIZON ==============================
{
  const DIR = 'Aether-Horizon';

  // Sun sprite (fixed warm colours — themes tint the TIME, not the sun)
  art(DIR, 'sun', 72, 72, `
    <defs><radialGradient id="sg"><stop offset=".12" stop-color="rgba(255,190,90,.55)"/><stop offset=".35" stop-color="rgba(255,190,90,.2)"/><stop offset="1" stop-color="rgba(255,190,90,0)"/></radialGradient></defs>
    <circle cx="36" cy="36" r="34" fill="url(#sg)"/>
    <circle cx="36" cy="36" r="10" fill="#FFE2A0"/>`);
  // Moon sprite (pale)
  art(DIR, 'moon', 72, 72, `
    <defs><radialGradient id="mg"><stop offset=".12" stop-color="rgba(200,215,255,.35)"/><stop offset=".4" stop-color="rgba(200,215,255,.12)"/><stop offset="1" stop-color="rgba(200,215,255,0)"/></radialGradient></defs>
    <circle cx="36" cy="36" r="34" fill="url(#mg)"/>
    <circle cx="36" cy="36" r="10" fill="#E3EAF5"/>`);
  // AOD outline disc
  art(DIR, 'disc_aod', 20, 20, `<circle cx="10" cy="10" r="6.5" fill="none" stroke="rgba(227,234,245,.55)" stroke-width="1"/>`);

  // Preview at 10:08 → day segment (07:30–17:00): p=(10.133-5.9)/14.6=0.29
  const p = (10 + 8 / 60 - 5.9) / 14.6;
  const sx = 150 - 112 * Math.cos(Math.PI * p), sy = 190 - 112 * Math.sin(Math.PI * p);
  preview(DIR, `
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#2E5A9E"/><stop offset=".55" stop-color="#6E9BCF"/><stop offset="1" stop-color="#BCD3E8"/>
      </linearGradient>
      <radialGradient id="pg"><stop offset=".12" stop-color="rgba(255,190,90,.55)"/><stop offset=".35" stop-color="rgba(255,190,90,.2)"/><stop offset="1" stop-color="rgba(255,190,90,0)"/></radialGradient>
    </defs>
    <rect width="300" height="300" fill="url(#sky)"/>
    <path d="M 38 190 A 112 112 0 0 1 262 190" fill="none" stroke="rgba(255,255,255,.22)" stroke-width="1" stroke-dasharray="2 5"/>
    <circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="34" fill="url(#pg)"/>
    <circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="10" fill="#FFE2A0"/>
    <rect x="0" y="204" width="300" height="96" fill="#1B2733"/>
    <rect x="0" y="204" width="300" height="1" fill="rgba(255,255,255,.3)"/>
    ${txt(34, 193, '5:54', { size: 9, family: F.mono, weight: 500, fill: 'rgba(255,255,255,.55)', anchor: 'start' })}
    ${txt(266, 193, COMPS.SUNSET.value, { size: 9, family: F.mono, weight: 500, fill: 'rgba(255,255,255,.55)', anchor: 'end' })}
    ${txt(150, 249, `${T.hh}:${T.mm}`, { size: 56, family: F.barlow, weight: 600, fill: '#FFFFFF' })}
    ${txt(150, 275, T.dateLine, { size: 9, family: F.archivo, weight: 600, fill: 'rgba(255,255,255,.5)', ls: 3 })}
    ${txt(150, 43, COMPS.STEPS.value, { size: 21, family: F.barlow, weight: 600, fill: 'rgba(255,255,255,.92)' })}
    ${txt(150, 54, COMPS.STEPS.label, { size: 7.5, family: F.archivo, weight: 600, fill: 'rgba(255,255,255,.55)', ls: 2 })}
  `);
}

// =============================== 03·C EMBER ===============================
{
  const DIR = 'Aether-Ember';
  const A = '#FF9D5C';

  // Glow pool: white radial ellipse (tinted accent at runtime, alpha baked 40%)
  art(DIR, 'glow', 300, 130, `
    <defs><radialGradient id="g" cx=".5" cy="1" r="1"><stop offset="0" stop-color="rgba(255,255,255,.40)"/><stop offset=".45" stop-color="rgba(255,255,255,.18)"/><stop offset=".7" stop-color="rgba(255,255,255,.05)"/><stop offset="1" stop-color="rgba(255,255,255,0)"/></radialGradient></defs>
    <ellipse cx="150" cy="130" rx="150" ry="130" fill="url(#g)"/>`);

  preview(DIR, `
    <defs>
      <radialGradient id="bg" cx=".5" cy=".88" r="1">
        <stop offset="0" stop-color="#1C0E06"/><stop offset=".55" stop-color="#0A0605"/><stop offset="1" stop-color="#060404"/>
      </radialGradient>
      <radialGradient id="pool" cx=".5" cy="1" r="1">
        <stop offset="0" stop-color="rgba(255,157,92,.4)"/><stop offset=".45" stop-color="rgba(255,157,92,.18)"/><stop offset="1" stop-color="rgba(255,157,92,0)"/>
      </radialGradient>
    </defs>
    <rect width="300" height="300" fill="url(#bg)"/>
    <ellipse cx="150" cy="300" rx="150" ry="130" fill="url(#pool)"/>
    ${txt(150, 136, `${T.hh}:${T.mm}`, { size: 68, family: F.barlow, weight: 700, fill: '#F5E6CE' })}
    ${txt(150, 167, T.dateLine, { size: 9, family: F.archivo, weight: 600, fill: 'rgba(245,230,206,.4)', ls: 3 })}
    ${txt(108, 257, COMPS.HR.value, { size: 18, family: F.barlow, weight: 600, fill: '#F5E6CE' })}
    ${txt(108, 267, COMPS.HR.label, { size: 7, family: F.archivo, weight: 600, fill: A, ls: 1.5 })}
    ${txt(192, 257, COMPS.STEPS.value, { size: 18, family: F.barlow, weight: 600, fill: '#F5E6CE' })}
    ${txt(192, 267, COMPS.STEPS.label, { size: 7, family: F.archivo, weight: 600, fill: 'rgba(245,230,206,.4)', ls: 1.5 })}
  `);
}

console.log('AETHER assets done.');
