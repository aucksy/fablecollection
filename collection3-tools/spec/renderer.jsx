/* WatchFaceRenderer v2 — shared SVG engine for the entire collection.
   Realism pass: fixed (non-themeable) hardware case, themeable in-dial flange,
   recessed machined registers, applied faceted indices, hand drop-shadows,
   bevelled LCD panels, radial brushing / sunray dial textures.
   Every layer maps to a WFF v1 mechanism: textures/bevels/shadows ship as
   pre-rendered static images; hands ship as artwork with baked shadows/lume. */

(function () {
  const TAU = Math.PI / 180;
  const AOD_INK = '#d8d4cc';
  const AOD_MUT = '#8f8877';

  /* ---- shared 1 Hz ticker ---- */
  const listeners = new Set();
  let tickerStarted = false;
  function startTicker() {
    if (tickerStarted) return;
    tickerStarted = true;
    setInterval(() => listeners.forEach((f) => f()), 1000);
  }

  function polar(cx, cy, r, deg) {
    return [cx + r * Math.sin(deg * TAU), cy - r * Math.cos(deg * TAU)];
  }
  function arcPath(cx, cy, r, a0, a1) {
    const sweep = a1 - a0;
    const [x0, y0] = polar(cx, cy, r, a0);
    const [x1, y1] = polar(cx, cy, r, a1);
    const large = Math.abs(sweep) > 180 ? 1 : 0;
    return `M ${x0} ${y0} A ${r} ${r} 0 ${large} ${sweep > 0 ? 1 : 0} ${x1} ${y1}`;
  }
  function shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    const t = amt < 0 ? 0 : 255, p = Math.abs(amt);
    r = Math.round(r + (t - r) * p);
    g = Math.round(g + (t - g) * p);
    b = Math.round(b + (t - b) * p);
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  const SIM = { battery: 68, steps: 6203, notif: 3, hr: 72, event: '12:30', sunrise: '05:41', sunset: '21:12' };

  function pad2(n) { return String(n).padStart(2, '0'); }
  function weekNr(d) {
    const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = t.getUTCDay() || 7;
    t.setUTCDate(t.getUTCDate() + 4 - dayNum);
    const yStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
    return Math.ceil((((t - yStart) / 86400000) + 1) / 7);
  }
  const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const MONS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

  function tokenText(token, d, hour12) {
    const H = d.getHours();
    const h12 = H % 12 === 0 ? 12 : H % 12;
    switch (token) {
      case 'hh': return hour12 ? pad2(h12) : pad2(H);
      case 'h': return hour12 ? String(h12) : pad2(H);
      case 'mm': return pad2(d.getMinutes());
      case 'ss': return pad2(d.getSeconds());
      case 'hmm': return (hour12 ? h12 : pad2(H)) + ':' + pad2(d.getMinutes());
      case 'ampm': return hour12 ? (H < 12 ? 'AM' : 'PM') : 'W' + pad2(weekNr(d));
      case 'ampmOnly': return hour12 ? (H < 12 ? 'AM' : 'PM') : '';
      case 'day3': return DAYS[d.getDay()];
      case 'dnum': return pad2(d.getDate());
      case 'mon3': return MONS[d.getMonth()];
      case 'weeknr': return 'W' + pad2(weekNr(d));
      case 'steps': return String(SIM.steps);
      case 'stepsK': return (SIM.steps / 1000).toFixed(1) + 'K';
      case 'batt': return SIM.battery + '%';
      case 'battN': return String(SIM.battery);
      case 'notif': return String(SIM.notif);
      case 'hr': return String(SIM.hr);
      case 'event': return SIM.event;
      case 'sunrise': return SIM.sunrise;
      case 'sunset': return SIM.sunset;
      default: return token || '';
    }
  }

  function dataFrac(data, d) {
    switch (data) {
      case 'battery': return SIM.battery / 100;
      case 'steps': return Math.min(SIM.steps / 10000, 1);
      case 'stepsDial': return (SIM.steps / 1000) % 10 / 10;
      case 'seconds': return d.getSeconds() / 60;
      case 'minutes': return (d.getMinutes() + d.getSeconds() / 60) / 60;
      case 'day': return (d.getHours() * 60 + d.getMinutes()) / 1440;
      case 'hr': return SIM.hr / 250;
      case 'notif': return Math.min(SIM.notif / 30, 1);
      default: return 0;
    }
  }

  const ICONS = {
    sun: 'M0-5.5 0-3.5M0 3.5 0 5.5M-5.5 0-3.5 0M3.5 0 5.5 0M-3.9-3.9-2.5-2.5M2.5 2.5 3.9 3.9M-3.9 3.9-2.5 2.5M2.5-2.5 3.9-3.9',
    bolt: 'M1-6-4 1H0L-1 6 4-1H0Z',
    steps: 'M-3-5C-1-5-1-1-3-1-5-1-5-5-3-5ZM3 1C5 1 5 5 3 5 1 5 1 1 3 1Z',
    bell: 'M0-5C2.5-5 3.5-3 3.5-0.5L4.5 2.5H-4.5L-3.5-0.5C-3.5-3-2.5-5 0-5ZM-1 4A1 1 0 0 0 1 4',
    moon: 'M2-5A5.5 5.5 0 1 0 5 1 4.5 4.5 0 0 1 2-5Z',
    cal: 'M-4-3H4V4H-4ZM-4-1H4M-2-5V-3M2-5V-3',
    msg: 'M-4.5-3.5H4.5V2.5H-1L-3.5 5V2.5H-4.5Z',
    hr: 'M0 4.5-4.5-0.5C-6-2.5-4.5-5-2.2-5-1-5 0-4 0-3 0-4 1-5 2.2-5 4.5-5 6-2.5 4.5-0.5Z',
  };

  /* ---- hand shapes: path generators (0,0 = pivot, -len = tip) ---- */
  function handPath(shape, len, w, tail) {
    const t = tail || 0;
    switch (shape) {
      case 'sword':
        return `M0 ${t} L${-w} ${t * 0.4} L${-w} ${-len * 0.72} L0 ${-len} L${w} ${-len * 0.72} L${w} ${t * 0.4} Z`;
      case 'arrow':
        return `M0 ${t} L${-w * 0.55} ${t} L${-w * 0.55} ${-len * 0.42} L${-w * 1.5} ${-len * 0.52} L0 ${-len} L${w * 1.5} ${-len * 0.52} L${w * 0.55} ${-len * 0.42} L${w * 0.55} ${t} Z`;
      case 'baton':
        return `M${-w} ${t} L${-w} ${-len} L${w} ${-len} L${w} ${t} Z`;
      case 'needle':
        return `M${-w * 0.5} ${t} L0 ${-len} L${w * 0.5} ${t} Z`;
      case 'dauphine':
        return `M0 ${t} L${-w} ${-len * 0.1} L0 ${-len} L${w} ${-len * 0.1} Z`;
      case 'plate2':
        return `M ${-w * 0.7} ${t} L ${-w} ${t * 0.5} L ${-w} ${-len * 0.8} L 0 ${-len} L ${w} ${-len * 0.8} L ${w} ${t * 0.5} L ${w * 0.7} ${t} Z`;
      case 'syringe':
        return `M${-w * 0.35} ${t} L${-w * 0.35} ${-len} L${w * 0.35} ${-len} L${w * 0.35} ${t} Z`;
      default:
        return `M${-w * 0.5} ${t} L0 ${-len} L${w * 0.5} ${t} Z`;
    }
  }
  /* lume slot inset for a hand */
  function lumePath(shape, len, w, tail) {
    switch (shape) {
      case 'arrow':
        return `M0 ${-len * 0.93} L${-w * 1.05} ${-len * 0.55} L0 ${-len * 0.47} L${w * 1.05} ${-len * 0.55} Z`;
      case 'sword':
        return `M${-w * 0.45} ${-len * 0.68} L${-w * 0.45} ${-len * 0.3} L${w * 0.45} ${-len * 0.3} L${w * 0.45} ${-len * 0.68} L0 ${-len * 0.8} Z`;
      case 'baton':
        return `M${-w * 0.45} ${-len * 0.9} L${-w * 0.45} ${-len * 0.4} L${w * 0.45} ${-len * 0.4} L${w * 0.45} ${-len * 0.9} Z`;
      default:
        return `M${-w * 0.3} ${-len * 0.85} L${-w * 0.3} ${-len * 0.35} L${w * 0.3} ${-len * 0.35} L${w * 0.3} ${-len * 0.85} Z`;
    }
  }

  function useNow(timeOverride, enabled) {
    const [, setN] = React.useState(0);
    React.useEffect(() => {
      if (timeOverride || !enabled) return;
      startTicker();
      const f = () => setN((n) => n + 1);
      listeners.add(f);
      return () => listeners.delete(f);
    }, [timeOverride, enabled]);
    if (timeOverride) {
      const d = new Date();
      d.setHours(timeOverride.h, timeOverride.m, timeOverride.s || 0, 0);
      return d;
    }
    return new Date();
  }

  function totalSec(d) { return d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds(); }

  let uidCounter = 0;

  function WatchFaceRenderer(props) {
    const { spec, size } = props;
    const mode = props.mode || 'active';
    const aod = mode === 'aod';
    const hour12 = props.hour12 !== false;
    const theme = spec.themes[props.theme || 0] || spec.themes[0];
    const rootRef = React.useRef(null);
    const [visible, setVisible] = React.useState(true);
    React.useEffect(() => {
      const el = rootRef.current;
      if (!el || typeof IntersectionObserver === 'undefined') return;
      const io = new IntersectionObserver((es) => setVisible(es[0].isIntersecting), { rootMargin: '200px' });
      io.observe(el);
      return () => io.disconnect();
    }, []);
    const now = useNow(props.timeOverride, visible);
    const uid = React.useMemo(() => 'wf' + (uidCounter++), []);

    const roles = aod
      ? { bg: '#000000', ink: AOD_INK, accent: AOD_INK, muted: AOD_MUT, lume: AOD_MUT }
      : theme.roles;

    function col(c, fallback) {
      if (!c) return fallback || roles.ink;
      if (c[0] === '#') return c;
      if (c.startsWith('shade:')) {
        const [, role, amt] = c.split(':');
        return shade(roles[role] || roles.ink, parseFloat(amt));
      }
      return roles[c] || fallback || roles.ink;
    }

    const C = 225;
    const layers = aod ? (spec.aodLayers || []) : spec.layers;
    const finish = aod ? 'aod' : (theme.finish || 'matte');

    const isSecLayer = (L) => (L.t === 'hand' && L.kind === 'second') || (L.t === 'arc' && L.data === 'seconds');

    /* metallic gradient ids */
    const METAL = `url(#${uid}-metal)`;
    const METALD = `url(#${uid}-metalDark)`;

    function buildEls(list, keyPrefix) {
      const els = [];
      let k = 0;
      list.forEach((L) => {
      const key = keyPrefix + (k++);
      const cx = L.cx != null ? L.cx : C;
      const cy = L.cy != null ? L.cy : C;
      if (L.hidden) return;
      switch (L.t) {
        case 'dial': {
          els.push(React.createElement('circle', { key, cx: C, cy: C, r: 225, fill: aod ? '#000' : col(L.color, roles.bg) }));
          if (!aod) {
            if (finish === 'brushRadial' || finish === 'sunray') {
              // radial brushing: fine hairlines from center to rim
              const lines = [];
              const n = finish === 'sunray' ? 72 : 120;
              for (let i = 0; i < n; i++) {
                const a = (360 * i) / n;
                const [x1, y1] = polar(C, C, 30, a);
                const [x2, y2] = polar(C, C, 225, a);
                lines.push(React.createElement('line', {
                  key: i, x1, y1, x2, y2,
                  stroke: i % 2 ? '#ffffff' : '#000000',
                  strokeWidth: finish === 'sunray' ? 3.2 : 1,
                  opacity: finish === 'sunray' ? 0.045 : 0.05,
                }));
              }
              els.push(React.createElement('g', { key: key + 'b' }, lines));
            }
            els.push(React.createElement('circle', { key: key + 'f', cx: C, cy: C, r: 225, fill: `url(#${uid}-${finish === 'brushRadial' ? 'matte' : finish})` }));
            els.push(React.createElement('circle', { key: key + 'v', cx: C, cy: C, r: 225, fill: `url(#${uid}-vig)` }));
          }
          break;
        }
        case 'flange': {
          // themeable rehaut ring INSIDE the crystal (dial artwork, not hardware)
          const r0 = L.r0 != null ? L.r0 : 225, r1 = L.r1 != null ? L.r1 : 200;
          els.push(React.createElement('g', { key }, [
            React.createElement('circle', { key: 'a', cx: C, cy: C, r: r0, fill: col(L.color, shade(roles.bg, -0.35)) }),
            React.createElement('circle', { key: 'g', cx: C, cy: C, r: r0, fill: `url(#${uid}-flange)` }),
            React.createElement('circle', { key: 'b', cx: C, cy: C, r: r1, fill: col(L.floor, roles.bg) }),
            React.createElement('circle', { key: 'sh', cx: C, cy: C, r: r1, fill: 'none', stroke: '#000', strokeWidth: 5, opacity: 0.4 }),
            React.createElement('circle', { key: 'hl', cx: C, cy: C, r: r1 - 4, fill: 'none', stroke: '#fff', strokeWidth: 1, opacity: 0.07 }),
          ]));
          break;
        }
        case 'applied': {
          // faceted metallic hour markers on/near the flange
          const items = [];
          const n = L.count || 12;
          for (let i = 0; i < n; i++) {
            if (L.skip && L.skip.includes(i)) continue;
            const a = (360 * i) / n;
            const major = i % 3 === 0;
            const w = (L.w || 7) * (major && L.majorScale ? L.majorScale : 1);
            const len = (L.len || 18) * (major && L.majorScale ? L.majorScale : 1);
            const [x, y] = polar(cx, cy, L.r, a);
            items.push(React.createElement('g', { key: i, transform: `rotate(${a} ${x} ${y})` }, [
              React.createElement('rect', { key: 's', x: x - w / 2 + 1.2, y: y - 1.2 + 1.6, width: w, height: len, fill: '#000', opacity: 0.45 }),
              React.createElement('rect', { key: 'b', x: x - w / 2, y: y - 1.2, width: w, height: len, fill: L.metal === 'dark' ? METALD : METAL }),
              React.createElement('rect', { key: 'h', x: x - w / 2, y: y - 1.2, width: w * 0.45, height: len, fill: '#fff', opacity: 0.22 }),
              L.lume ? React.createElement('rect', { key: 'l', x: x - w * 0.22, y: y + 1.2, width: w * 0.44, height: len - 4.8, fill: col('lume'), opacity: 0.95 }) : null,
            ]));
          }
          els.push(React.createElement('g', { key }, items));
          break;
        }
        case 'ring':
          els.push(React.createElement('circle', {
            key, cx, cy, r: L.r, fill: 'none', stroke: col(L.color), strokeWidth: L.w || 1, opacity: L.opacity,
            strokeDasharray: L.dash,
          }));
          break;
        case 'circle':
          els.push(React.createElement('circle', { key, cx, cy, r: L.r, fill: col(L.color), opacity: L.opacity, stroke: L.stroke ? col(L.stroke) : undefined, strokeWidth: L.sw }));
          break;
        case 'rect':
          els.push(React.createElement('rect', { key, x: L.x, y: L.y, width: L.w, height: L.h, rx: L.rx, fill: col(L.color), opacity: L.opacity, stroke: L.stroke ? col(L.stroke) : undefined, strokeWidth: L.sw }));
          break;
        case 'line':
          els.push(React.createElement('line', { key, x1: L.x1, y1: L.y1, x2: L.x2, y2: L.y2, stroke: col(L.color), strokeWidth: L.w || 1, opacity: L.opacity, strokeLinecap: L.cap || 'butt' }));
          break;
        case 'ticks': {
          const n = L.count, from = L.from || 0, span = (L.to != null ? L.to : 360 + from) - from;
          const full = L.to == null;
          const ticks = [];
          for (let i = 0; i < (full ? n : n + 1); i++) {
            if (L.skipEvery && i % L.skipEvery === 0) continue;
            if (L.onlyEvery && i % L.onlyEvery !== 0) continue;
            const a = from + (span * i) / n;
            const [x1, y1] = polar(cx, cy, L.r, a);
            const [x2, y2] = polar(cx, cy, L.r - L.len, a);
            ticks.push(React.createElement('line', { key: i, x1, y1, x2, y2, stroke: col(L.color), strokeWidth: L.w || 1, strokeLinecap: L.cap || 'butt' }));
          }
          els.push(React.createElement('g', { key, opacity: L.opacity }, ticks));
          break;
        }
        case 'dots': {
          const n = L.count, dots = [];
          for (let i = 0; i < n; i++) {
            const a = (360 * i) / n;
            if (L.skipEvery && i % L.skipEvery === 0) continue;
            const [x, y] = polar(cx, cy, L.r, a);
            dots.push(React.createElement('circle', { key: i, cx: x, cy: y, r: L.dot || 1.5, fill: col(L.color) }));
          }
          els.push(React.createElement('g', { key, opacity: L.opacity }, dots));
          break;
        }
        case 'numerals': {
          const vals = L.vals;
          const n = vals.length;
          const from = L.from || 0, span = (L.to != null ? L.to : 360 + from) - from;
          const full = L.to == null;
          const texts = vals.map((v, i) => {
            if (v === null || v === '') return null;
            const a = from + (span * i) / (full ? n : n - 1);
            const [x, y] = polar(cx, cy, L.r, a);
            return React.createElement('text', {
              key: i, x, y, fill: col(L.color), fontSize: L.size, fontFamily: L.font || spec.fontStack,
              fontWeight: L.weight || 600, textAnchor: 'middle', dominantBaseline: 'central',
            }, String(v));
          });
          els.push(React.createElement('g', { key, opacity: L.opacity }, texts));
          break;
        }
        case 'label':
        case 'text': {
          const str = L.t === 'label' ? L.text : tokenText(L.token, now, hour12);
          if (str === '') break;
          els.push(React.createElement('text', {
            key, x: L.x, y: L.y, fill: col(L.color), fontSize: L.size, fontFamily: L.font || spec.fontStack,
            fontWeight: L.weight || 500, textAnchor: L.anchor || 'middle', dominantBaseline: L.baseline || 'central',
            opacity: L.opacity, transform: L.rotate ? `rotate(${L.rotate} ${L.x} ${L.y})` : undefined,
          }, str));
          break;
        }
        case 'arc': {
          const from = L.from != null ? L.from : 0;
          const to = L.to != null ? L.to : 360;
          if (L.track) {
            els.push(React.createElement('path', {
              key: key + 't', d: arcPath(cx, cy, L.r, from, Math.min(to, from + 359.9)), fill: 'none',
              stroke: col(L.track), strokeWidth: L.w, strokeLinecap: L.cap || 'butt', opacity: L.trackOpacity != null ? L.trackOpacity : 0.35,
            }));
          }
          const frac = L.data ? dataFrac(L.data, now) : (L.value != null ? L.value : 1);
          const a1 = from + (to - from) * Math.max(0.002, Math.min(frac, 0.998));
          els.push(React.createElement('path', {
            key, d: arcPath(cx, cy, L.r, from, a1), fill: 'none',
            stroke: col(L.color), strokeWidth: L.w, strokeLinecap: L.cap || 'butt', opacity: L.opacity,
          }));
          break;
        }
        case 'plate': {
          // recessed machined register: raised rim + dark floor + concentric machining
          const rim = L.rim || 3;
          const parts = [
            React.createElement('circle', { key: 'sh', cx: cx + 1.5, cy: cy + 2.5, r: L.r + rim, fill: '#000', opacity: aod ? 0 : 0.4 }),
            React.createElement('circle', { key: 'a', cx, cy, r: L.r + rim, fill: aod ? '#111' : METAL }),
            React.createElement('circle', { key: 'b', cx, cy, r: L.r, fill: col(L.color, aod ? '#000' : shade(roles.bg, -0.4)) }),
          ];
          if (!aod) {
            parts.push(React.createElement('circle', { key: 'c', cx, cy, r: L.r, fill: `url(#${uid}-inset)` }));
            for (let ri = L.r - 6; ri > 8; ri -= 7) {
              parts.push(React.createElement('circle', { key: 'm' + ri, cx, cy, r: ri, fill: 'none', stroke: '#fff', strokeWidth: 0.5, opacity: 0.035 }));
            }
            parts.push(React.createElement('circle', { key: 'hl', cx, cy, r: L.r + rim - 0.6, fill: 'none', stroke: '#fff', strokeWidth: 0.8, opacity: 0.18 }));
          }
          els.push(React.createElement('g', { key }, parts));
          break;
        }
        case 'hand': {
          let angle = 0;
          if (L.kind === 'hour') angle = ((now.getHours() % 12) + now.getMinutes() / 60) * 30;
          else if (L.kind === 'minute') angle = (now.getMinutes() + now.getSeconds() / 60) * 6;
          else if (L.kind === 'second') angle = totalSec(now) * 6;
          else if (L.kind === 'data') {
            const f = dataFrac(L.data, now);
            angle = (L.from || 0) + ((L.to != null ? L.to : 360) - (L.from || 0)) * f;
          }
          const shape = L.shape || 'needle';
          const body = handPath(shape, L.len, L.w || 4, L.tail || 0);
          const parts = [];
          if (!aod && L.shadow !== false) {
            parts.push(React.createElement('path', { key: 'sh', d: body, fill: '#000', opacity: 0.38, transform: 'translate(2.2 3.2)' }));
          }
          parts.push(React.createElement('path', { key: 'p', d: body, fill: aod ? col(L.color) : (L.metal ? (L.metal === 'dark' ? METALD : METAL) : col(L.color)), stroke: L.stroke && !aod ? col(L.stroke) : undefined, strokeWidth: L.sw || 0 }));
          if (!aod && (L.metal || (L.w || 4) >= 4)) {
            // polished ridge down the center
            parts.push(React.createElement('path', { key: 'rg', d: handPath('needle', L.len * 0.96, (L.w || 4) * 0.32, (L.tail || 0) * 0.9), fill: '#fff', opacity: L.metal ? 0.28 : 0.12 }));
          }
          if (L.slot && !aod) {
            parts.push(React.createElement('rect', { key: 'sl', x: -(L.w || 4) * 0.42, y: -L.len * 0.76, width: (L.w || 4) * 0.84, height: L.len * 0.58, rx: (L.w || 4) * 0.42, fill: '#0a0a0b', opacity: 0.92 }));
            parts.push(React.createElement('circle', { key: 'sl2', cx: 0, cy: (L.tail || 0) * 0.55, r: (L.w || 4) * 0.3, fill: '#0a0a0b', opacity: 0.92 }));
          }
          if (L.lume && !aod) {
            parts.push(React.createElement('path', { key: 'l', d: lumePath(shape, L.len, L.w || 4, L.tail || 0), fill: col(L.lume === true ? 'lume' : L.lume) }));
          }
          const isSec = L.kind === 'second';
          els.push(React.createElement('g', {
            key,
            transform: `rotate(${angle} ${cx} ${cy})`,
            style: isSec && !props.timeOverride ? { transition: 'transform 0.98s linear' } : undefined,
          }, React.createElement('g', { transform: `translate(${cx} ${cy})` }, parts)));
          if (L.hub) {
            els.push(React.createElement('g', { key: key + 'h' }, [
              aod ? null : React.createElement('circle', { key: 's', cx: cx + 1, cy: cy + 1.6, r: L.hub, fill: '#000', opacity: 0.4 }),
              React.createElement('circle', { key: 'a', cx, cy, r: L.hub, fill: aod ? col(L.hubColor || L.color) : METAL }),
              aod ? null : React.createElement('circle', { key: 'b', cx, cy, r: L.hub * 0.45, fill: col(L.hubColor || L.color) }),
            ]));
          }
          break;
        }
        case 'panel': {
          // bevelled LCD: dark frame, recessed glass, inner shadow, glow
          const fr = 4;
          const parts = [
            React.createElement('rect', { key: 'sh', x: L.x - fr + 1.5, y: L.y - fr + 2.5, width: L.w + fr * 2, height: L.h + fr * 2, rx: (L.rx || 6) + fr, fill: '#000', opacity: aod ? 0 : 0.45 }),
            React.createElement('rect', { key: 'fr', x: L.x - fr, y: L.y - fr, width: L.w + fr * 2, height: L.h + fr * 2, rx: (L.rx || 6) + fr, fill: aod ? '#111' : METALD }),
            React.createElement('rect', { key: 'g', x: L.x, y: L.y, width: L.w, height: L.h, rx: L.rx != null ? L.rx : 6, fill: col(L.color) }),
          ];
          if (!aod) {
            parts.push(React.createElement('rect', { key: 'is', x: L.x, y: L.y, width: L.w, height: L.h, rx: L.rx != null ? L.rx : 6, fill: `url(#${uid}-lcdIn)` }));
            parts.push(React.createElement('rect', { key: 'hl', x: L.x + 1, y: L.y + 1, width: L.w - 2, height: L.h - 2, rx: (L.rx != null ? L.rx : 6) - 1, fill: 'none', stroke: '#fff', strokeWidth: 0.8, opacity: 0.14 }));
          }
          els.push(React.createElement('g', { key }, parts));
          break;
        }
        case 'icon': {
          const d = ICONS[L.name];
          if (!d) break;
          els.push(React.createElement('path', {
            key, d, transform: `translate(${L.x} ${L.y}) scale(${(L.s || 12) / 12})`,
            fill: L.filled ? col(L.color) : 'none', stroke: L.filled ? 'none' : col(L.color),
            strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round', opacity: L.opacity,
          }));
          break;
        }
        case 'poly':
          els.push(React.createElement('polygon', { key, points: L.points, fill: L.metal ? (L.metal === 'dark' ? METALD : METAL) : col(L.color), opacity: L.opacity, transform: L.transform }));
          break;
        case 'screw': {
          els.push(React.createElement('g', { key, opacity: aod ? 0 : (L.opacity || 1) }, [
            React.createElement('circle', { key: 'sh', cx: cx + 0.8, cy: cy + 1.4, r: (L.r || 5) + 0.8, fill: '#000', opacity: 0.5 }),
            React.createElement('circle', { key: 'a', cx, cy, r: L.r || 5, fill: METAL }),
            React.createElement('circle', { key: 'hl', cx, cy, r: (L.r || 5) - 0.8, fill: 'none', stroke: '#fff', strokeWidth: 0.6, opacity: 0.25 }),
            React.createElement('line', { key: 'b', x1: cx - (L.r || 5) * 0.6, y1: cy, x2: cx + (L.r || 5) * 0.6, y2: cy, stroke: '#0a0a0a', strokeWidth: 1.6, transform: `rotate(${L.a || 30} ${cx} ${cy})` }),
          ]));
          break;
        }
        case 'bridge': {
          // skeleton bridge: dark annulus sector with edge highlights
          const p = [
            arcPath(cx, cy, L.r1, L.a0, L.a1),
            `L ${polar(cx, cy, L.r0, L.a1).join(' ')}`,
            arcPath(cx, cy, L.r0, L.a1, L.a0).replace('M', 'L').replace(/^L [^A]*A/, (m) => m),
          ];
          // simpler: build a closed annulus sector path manually
          const [ox0, oy0] = polar(cx, cy, L.r1, L.a0);
          const [ox1, oy1] = polar(cx, cy, L.r1, L.a1);
          const [ix1, iy1] = polar(cx, cy, L.r0, L.a1);
          const [ix0, iy0] = polar(cx, cy, L.r0, L.a0);
          const lg1 = Math.abs(L.a1 - L.a0) > 180 ? 1 : 0;
          const d = `M ${ox0} ${oy0} A ${L.r1} ${L.r1} 0 ${lg1} 1 ${ox1} ${oy1} L ${ix1} ${iy1} A ${L.r0} ${L.r0} 0 ${lg1} 0 ${ix0} ${iy0} Z`;
          els.push(React.createElement('g', { key, opacity: aod ? 0 : 1 }, [
            React.createElement('path', { key: 'sh', d, fill: '#000', opacity: 0.5, transform: 'translate(1.5 2.5)' }),
            React.createElement('path', { key: 'b', d, fill: col(L.color, shade(roles.bg, -0.5)) }),
            React.createElement('path', { key: 'hl', d, fill: 'none', stroke: '#fff', strokeWidth: 0.7, opacity: 0.08 }),
          ]));
          break;
        }
        case 'claws': {
          // segmented faceted metal claw bezel (the reference genre signature)
          const n = L.count || 12;
          const off = L.offset || 0;
          const r0 = L.r0 || 224, r1 = L.r1 || 186;
          const rm = (r0 + r1) / 2;
          const wOut = L.wOut || 10.5, wIn = L.wIn || 6;
          const items = [];
          for (let i = 0; i < n; i++) {
            if (L.skip && L.skip.includes(i)) continue;
            const a = off + (360 * i) / n;
            const P = (r, da) => polar(cx, cy, r, a + da).join(',');
            const body = `${P(r0, -wOut)} ${P(r0, wOut)} ${P(rm, wOut * 0.8)} ${P(r1, wIn)} ${P(r1, -wIn)} ${P(rm, -wOut * 0.8)}`;
            const hi = `${P(r0, -wOut)} ${P(r0, 0)} ${P(r1, 0)} ${P(r1, -wIn)} ${P(rm, -wOut * 0.8)}`;
            const lume = `${P(r0 - 2, -2.4)} ${P(r0 - 2, 2.4)} ${P(r0 - 15, 1.7)} ${P(r0 - 15, -1.7)}`;
            items.push(React.createElement('g', { key: i }, [
              React.createElement('polygon', { key: 's', points: body, fill: '#000', opacity: 0.5, transform: 'translate(1.6 2.6)' }),
              React.createElement('polygon', { key: 'b', points: body, fill: col(L.color), stroke: '#0a0a0a', strokeWidth: 0.8 }),
              React.createElement('polygon', { key: 'h', points: hi, fill: '#fff', opacity: 0.24 }),
              React.createElement('polygon', { key: 'd', points: body, fill: '#000', opacity: 0.13 }),
              L.lume ? React.createElement('polygon', { key: 'l', points: lume, fill: col('lume') }) : null,
            ]));
          }
          els.push(React.createElement('g', { key }, items));
          break;
        }
        case 'ribbed': {
          // knurled dark ring behind the claws
          const items = [React.createElement('circle', { key: 'b', cx, cy, r: L.r, fill: 'none', stroke: col(L.color, '#101011'), strokeWidth: L.w })];
          const n = L.count || 96;
          for (let i = 0; i < n; i++) {
            const a = (360 * i) / n;
            const [x1, y1] = polar(cx, cy, L.r + L.w / 2 - 1, a);
            const [x2, y2] = polar(cx, cy, L.r - L.w / 2 + 1, a);
            items.push(React.createElement('line', { key: i, x1, y1, x2, y2, stroke: i % 2 ? '#fff' : '#000', strokeWidth: 1.1, opacity: i % 2 ? 0.05 : 0.3 }));
          }
          els.push(React.createElement('g', { key }, items));
          break;
        }
        case 'disc': {
          // round digital complication disc (swappable analog→digital, per reference v1.1.2)
          const parts = [
            React.createElement('circle', { key: 's', cx: cx + 1.5, cy: cy + 2.5, r: L.r + 2.5, fill: '#000', opacity: aod ? 0 : 0.4 }),
            React.createElement('circle', { key: 'rim', cx, cy, r: L.r + 2.5, fill: aod ? '#111' : METALD }),
            React.createElement('circle', { key: 'b', cx, cy, r: L.r, fill: col(L.color, aod ? '#000' : shade(roles.bg, -0.5)) }),
          ];
          if (!aod) {
            parts.push(React.createElement('circle', { key: 'in', cx, cy, r: L.r, fill: `url(#${uid}-inset)` }));
            parts.push(React.createElement('circle', { key: 'arc', cx, cy, r: L.r - 3, fill: 'none', stroke: col(L.ringColor || 'accent'), strokeWidth: 1.6, opacity: 0.85 }));
          }
          if (L.icon && ICONS[L.icon]) {
            parts.push(React.createElement('path', { key: 'ic', d: ICONS[L.icon], transform: `translate(${cx} ${cy - L.r * 0.5}) scale(${(L.iconS || 10) / 12})`, fill: col(L.iconColor || 'accent'), stroke: 'none' }));
          }
          if (L.small) parts.push(React.createElement('text', { key: 'sm', x: cx, y: cy - L.r * 0.42, fill: col(L.smallColor || 'accent'), fontSize: L.smallSize || 11, fontFamily: spec.fontStack, fontWeight: 700, textAnchor: 'middle', dominantBaseline: 'central' }, L.small));
          parts.push(React.createElement('text', { key: 'v', x: cx, y: cy + (L.icon || L.small ? L.r * 0.12 : 0), fill: col(L.valueColor || 'ink'), fontSize: L.valueSize || 22, fontFamily: L.font || spec.fontStack, fontWeight: 600, textAnchor: 'middle', dominantBaseline: 'central' }, L.value != null ? String(L.value) : tokenText(L.token, now, hour12)));
          if (L.label) parts.push(React.createElement('text', { key: 'lb', x: cx, y: cy + L.r * 0.52, fill: col(L.labelColor || 'muted'), fontSize: 9, fontFamily: spec.fontStack, fontWeight: 600, textAnchor: 'middle', dominantBaseline: 'central' }, L.label));
          els.push(React.createElement('g', { key }, parts));
          break;
        }
        default: break;
      }
      });
      return els;
    }

    const minuteKey = [now.getHours(), now.getMinutes(), props.theme || 0, mode, hour12 ? 1 : 0, props.showSlots ? 1 : 0, props.timeOverride ? 'o' + props.timeOverride.h + '-' + props.timeOverride.m : 'live'].join('-');
    const staticEls = React.useMemo(
      () => buildEls(layers.filter((L) => !isSecLayer(L)), 'S'),
      [minuteKey, spec] // eslint-disable-line
    );
    const els = staticEls.concat(buildEls(layers.filter(isSecLayer), 'D'));

    /* complication slot overlay */
    if (props.showSlots && !aod && spec.complications) {
      spec.complications.forEach((s, i) => {
        const g = [];
        if (s.shape === 'circle') {
          g.push(React.createElement('circle', { key: 'o', cx: s.cx, cy: s.cy, r: s.r, fill: 'rgba(96,165,250,0.12)', stroke: '#60a5fa', strokeWidth: 1.5, strokeDasharray: '5 4' }));
          g.push(React.createElement('text', { key: 't', x: s.cx, y: s.cy, fill: '#93c5fd', fontSize: 15, fontFamily: 'ui-monospace, monospace', fontWeight: 700, textAnchor: 'middle', dominantBaseline: 'central' }, s.id.split('-').pop()));
        } else {
          g.push(React.createElement('rect', { key: 'o', x: s.x, y: s.y, width: s.w, height: s.h, rx: 6, fill: 'rgba(96,165,250,0.12)', stroke: '#60a5fa', strokeWidth: 1.5, strokeDasharray: '5 4' }));
          g.push(React.createElement('text', { key: 't', x: s.x + s.w / 2, y: s.y + s.h / 2, fill: '#93c5fd', fontSize: 15, fontFamily: 'ui-monospace, monospace', fontWeight: 700, textAnchor: 'middle', dominantBaseline: 'central' }, s.id.split('-').pop()));
        }
        els.push(React.createElement('g', { key: 'slot' + i }, g));
      });
    }

    const bg = aod ? '#000' : roles.bg;

    /* ---- FIXED hardware case: never changes with theme (real hardware doesn't). ---- */
    return React.createElement('svg', {
      ref: rootRef,
      viewBox: '0 0 520 520', width: size || 300, height: size || 300,
      style: { display: 'block', borderRadius: '50%' },
    },
      React.createElement('defs', null,
        React.createElement('linearGradient', { id: uid + '-case', x1: '0', y1: '0', x2: '0.65', y2: '1' },
          React.createElement('stop', { offset: '0', stopColor: '#4a4c50' }),
          React.createElement('stop', { offset: '0.28', stopColor: '#232427' }),
          React.createElement('stop', { offset: '0.62', stopColor: '#121316' }),
          React.createElement('stop', { offset: '0.85', stopColor: '#2c2d31' }),
          React.createElement('stop', { offset: '1', stopColor: '#191a1d' })
        ),
        React.createElement('linearGradient', { id: uid + '-caseIn', x1: '0.7', y1: '1', x2: '0', y2: '0' },
          React.createElement('stop', { offset: '0', stopColor: '#3d3f43' }),
          React.createElement('stop', { offset: '0.5', stopColor: '#101114' }),
          React.createElement('stop', { offset: '1', stopColor: '#08090a' })
        ),
        React.createElement('linearGradient', { id: uid + '-metal', x1: '0', y1: '0', x2: '0.4', y2: '1' },
          React.createElement('stop', { offset: '0', stopColor: '#e8e9ea' }),
          React.createElement('stop', { offset: '0.4', stopColor: '#9a9da2' }),
          React.createElement('stop', { offset: '0.65', stopColor: '#5f6267' }),
          React.createElement('stop', { offset: '1', stopColor: '#c9cbd0' })
        ),
        React.createElement('linearGradient', { id: uid + '-metalDark', x1: '0', y1: '0', x2: '0.4', y2: '1' },
          React.createElement('stop', { offset: '0', stopColor: '#55575c' }),
          React.createElement('stop', { offset: '0.5', stopColor: '#1c1d20' }),
          React.createElement('stop', { offset: '1', stopColor: '#3a3c41' })
        ),
        React.createElement('linearGradient', { id: uid + '-flange', x1: '0', y1: '0', x2: '0.5', y2: '1' },
          React.createElement('stop', { offset: '0', stopColor: '#fff', stopOpacity: 0.12 }),
          React.createElement('stop', { offset: '0.5', stopColor: '#000', stopOpacity: 0.15 }),
          React.createElement('stop', { offset: '1', stopColor: '#fff', stopOpacity: 0.06 })
        ),
        React.createElement('radialGradient', { id: uid + '-vig' },
          React.createElement('stop', { offset: '0.6', stopColor: '#000', stopOpacity: 0 }),
          React.createElement('stop', { offset: '0.92', stopColor: '#000', stopOpacity: 0.26 }),
          React.createElement('stop', { offset: '1', stopColor: '#000', stopOpacity: 0.55 })
        ),
        React.createElement('radialGradient', { id: uid + '-matte', cx: '0.42', cy: '0.36' },
          React.createElement('stop', { offset: '0', stopColor: '#fff', stopOpacity: 0.09 }),
          React.createElement('stop', { offset: '0.7', stopColor: '#fff', stopOpacity: 0.015 }),
          React.createElement('stop', { offset: '1', stopColor: '#000', stopOpacity: 0.14 })
        ),
        React.createElement('linearGradient', { id: uid + '-brushed', x1: '0', y1: '0', x2: '1', y2: '1' },
          React.createElement('stop', { offset: '0', stopColor: '#fff', stopOpacity: 0.11 }),
          React.createElement('stop', { offset: '0.35', stopColor: '#fff', stopOpacity: 0.02 }),
          React.createElement('stop', { offset: '0.6', stopColor: '#000', stopOpacity: 0.07 }),
          React.createElement('stop', { offset: '1', stopColor: '#fff', stopOpacity: 0.08 })
        ),
        React.createElement('radialGradient', { id: uid + '-lacquer', cx: '0.36', cy: '0.28' },
          React.createElement('stop', { offset: '0', stopColor: '#fff', stopOpacity: 0.18 }),
          React.createElement('stop', { offset: '0.45', stopColor: '#fff', stopOpacity: 0.03 }),
          React.createElement('stop', { offset: '1', stopColor: '#000', stopOpacity: 0.18 })
        ),
        React.createElement('radialGradient', { id: uid + '-sunray', cx: '0.5', cy: '0.5' },
          React.createElement('stop', { offset: '0.1', stopColor: '#fff', stopOpacity: 0.13 }),
          React.createElement('stop', { offset: '0.55', stopColor: '#fff', stopOpacity: 0.02 }),
          React.createElement('stop', { offset: '1', stopColor: '#000', stopOpacity: 0.16 })
        ),
        React.createElement('radialGradient', { id: uid + '-sandblast', cx: '0.5', cy: '0.42' },
          React.createElement('stop', { offset: '0', stopColor: '#fff', stopOpacity: 0.05 }),
          React.createElement('stop', { offset: '1', stopColor: '#000', stopOpacity: 0.12 })
        ),
        React.createElement('radialGradient', { id: uid + '-inset', cx: '0.42', cy: '0.36' },
          React.createElement('stop', { offset: '0.5', stopColor: '#000', stopOpacity: 0.05 }),
          React.createElement('stop', { offset: '0.88', stopColor: '#000', stopOpacity: 0.32 }),
          React.createElement('stop', { offset: '1', stopColor: '#000', stopOpacity: 0.6 })
        ),
        React.createElement('linearGradient', { id: uid + '-lcdIn', x1: '0', y1: '0', x2: '0', y2: '1' },
          React.createElement('stop', { offset: '0', stopColor: '#000', stopOpacity: 0.3 }),
          React.createElement('stop', { offset: '0.18', stopColor: '#000', stopOpacity: 0.04 }),
          React.createElement('stop', { offset: '0.85', stopColor: '#fff', stopOpacity: 0.03 }),
          React.createElement('stop', { offset: '1', stopColor: '#fff', stopOpacity: 0.1 })
        ),
        React.createElement('radialGradient', { id: uid + '-crystal', cx: '0.5', cy: '0.5' },
          React.createElement('stop', { offset: '0.82', stopColor: '#000', stopOpacity: 0 }),
          React.createElement('stop', { offset: '0.97', stopColor: '#000', stopOpacity: 0.35 }),
          React.createElement('stop', { offset: '1', stopColor: '#000', stopOpacity: 0.6 })
        ),
        React.createElement('clipPath', { id: uid + '-clip' },
          React.createElement('circle', { cx: 260, cy: 260, r: 225 })
        )
      ),
      /* fixed hardware: brushed dark steel bezel, chamfer, black rehaut well */
      React.createElement('circle', { cx: 260, cy: 260, r: 259, fill: aod ? '#0a0a0b' : `url(#${uid}-case)` }),
      React.createElement('circle', { cx: 260, cy: 260, r: 252, fill: 'none', stroke: '#000', strokeWidth: 1.4, opacity: 0.6 }),
      React.createElement('circle', { cx: 260, cy: 260, r: 246, fill: aod ? '#060607' : `url(#${uid}-caseIn)` }),
      React.createElement('circle', { cx: 260, cy: 260, r: 246, fill: 'none', stroke: '#fff', strokeWidth: 0.8, opacity: aod ? 0 : 0.1 }),
      React.createElement('circle', { cx: 260, cy: 260, r: 233, fill: '#030304' }),
      /* face */
      React.createElement('g', { clipPath: `url(#${uid}-clip)` },
        React.createElement('g', { transform: 'translate(35 35)' },
          React.createElement('circle', { cx: 225, cy: 225, r: 225, fill: bg }),
          els
        )
      ),
      /* crystal edge shadow + glass reflections */
      React.createElement('circle', { cx: 260, cy: 260, r: 225, fill: `url(#${uid}-crystal)` }),
      aod ? null : React.createElement('ellipse', { cx: 182, cy: 145, rx: 145, ry: 88, fill: '#fff', opacity: 0.05, transform: 'rotate(-28 182 145)' }),
      aod ? null : React.createElement('path', { d: arcPath(260, 260, 236, -78, -18), fill: 'none', stroke: '#fff', strokeWidth: 5, opacity: 0.07, strokeLinecap: 'round' })
    );
  }

  WatchFaceRenderer.SIM = SIM;
  window.WatchFaceRenderer = WatchFaceRenderer;
  if (typeof module !== 'undefined') module.exports = { WatchFaceRenderer };
})();
