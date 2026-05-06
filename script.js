/* ===== SCRIPT ORIGINAL (Router + Contraste + Comparador + etc.) ===== */
const PAGES = ['home','principios','contraste','buenos','malos','ecommerce','comparador','marca','reglas'];
let currentPage = null;
let contrastReady = false;
let comparatorReady = false;
let barsAnimated = false;

/* ===== ROUTER ===== */
function navigate(pageId) {
  if (!PAGES.includes(pageId)) pageId = 'home';
  if (pageId === currentPage) return;
  if (currentPage) {
    const old = document.getElementById('page-' + currentPage);
    if (old) { old.classList.add('exit'); setTimeout(() => { old.style.display = 'none'; old.classList.remove('exit', 'active'); }, 260); }
  }
  const next = document.getElementById('page-' + pageId);
  if (next) { next.style.display = 'flex'; requestAnimationFrame(() => next.classList.add('active')); next.scrollTop = 0; }
  currentPage = pageId;
  history.replaceState(null, '', '#' + pageId);
  document.querySelectorAll('.nav-link, .mob-link').forEach(link => { link.classList.toggle('nav-active', link.dataset.page === pageId); });
  document.getElementById('mobile-menu').classList.remove('open');
  
  // Inicializar módulos según la página
  if (pageId === 'principios') setTimeout(initPrincipiosInteractive, 50);
  if (pageId === 'contraste') { initContrastTool(); initContrasteInteractive(); }
  if (pageId === 'buenos') setTimeout(initHierarchyInteractive, 50);
  if (pageId === 'ecommerce') setTimeout(initEcommerceInteractive, 50);
  if (pageId === 'marca') setTimeout(initPsicologiaInteractive, 50);
  if (pageId === 'comparador') initComparator();
}

document.querySelectorAll('.nav-link, .mob-link').forEach(link => {
  link.addEventListener('click', e => { e.preventDefault(); navigate(link.dataset.page); });
});
window.addEventListener('hashchange', () => { navigate(location.hash.replace('#', '') || 'home'); });
navigate(location.hash.replace('#', '') || 'home');

function toggleMobileMenu() { document.getElementById('mobile-menu').classList.toggle('open'); }

/* ===== CONTRASTE TOOL ORIGINAL ===== */
function hexToRgb(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  return { r: parseInt(hex.substring(0, 2), 16), g: parseInt(hex.substring(2, 4), 16), b: parseInt(hex.substring(4, 6), 16) };
}
function relativeLuminance(rgb) {
  const toLinear = c => { let s = c / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); };
  return 0.2126 * toLinear(rgb.r) + 0.7152 * toLinear(rgb.g) + 0.0722 * toLinear(rgb.b);
}
function getContrastRatio(hex1, hex2) {
  let l1 = relativeLuminance(hexToRgb(hex1)), l2 = relativeLuminance(hexToRgb(hex2));
  let lighter = Math.max(l1, l2), darker = Math.min(l1, l2);
  return ((lighter + 0.05) / (darker + 0.05)).toFixed(2);
}
function updateContrastTool() {
  const bg = document.getElementById('bg-color').value, text = document.getElementById('text-color').value;
  document.getElementById('bg-hex').textContent = bg; document.getElementById('text-hex').textContent = text;
  const preview = document.getElementById('preview-box'); preview.style.backgroundColor = bg; preview.style.color = text;
  const ratio = parseFloat(getContrastRatio(bg, text));
  document.getElementById('ratio-num').textContent = ratio.toFixed(2);
  const checks = { 'badge-aa-normal': 4.5, 'badge-aa-large': 3.0, 'badge-aaa-normal': 7.0, 'badge-aaa-large': 4.5 };
  Object.entries(checks).forEach(([id, min]) => {
    let badge = document.getElementById(id); if (!badge) return;
    let pass = ratio >= min;
    badge.classList.toggle('pass', pass); badge.classList.toggle('fail', !pass);
    badge.querySelector('.badge-status').textContent = pass ? '✓ Pasa' : '✗ Falla';
  });
  let ratioEl = document.getElementById('ratio-num');
  ratioEl.style.color = ratio >= 7 ? '#22c55e' : ratio >= 4.5 ? '#4ade80' : ratio >= 3 ? '#f59e0b' : '#ef4444';
}
function setPreset(bg, text) { document.getElementById('bg-color').value = bg; document.getElementById('text-color').value = text; updateContrastTool(); }
function initContrastTool() {
  if (contrastReady) return;
  contrastReady = true;
  document.getElementById('bg-color').addEventListener('input', updateContrastTool);
  document.getElementById('text-color').addEventListener('input', updateContrastTool);
  updateContrastTool();
}

/* ===== COMPARATOR ORIGINAL ===== */
const scenarios = {
  ecommerce: {
    bad: `<div style="background:#ff6600;padding:14px;border-radius:8px;"><div style="color:#ff0000;font-weight:900;">¡OFERTA!</div><div style="background:#00ff00;color:#ff0000;padding:8px;">COMPRAR</div></div>`,
    good: `<div style="background:#0f172a;padding:14px;border-radius:8px;"><div style="color:#f97316;">Oferta</div><button style="background:#f97316;color:#fff;border:none;padding:8px 16px;border-radius:40px;">Comprar</button></div>`,
    explanation: `<strong>E-commerce:</strong> El diseño incorrecto usa colores saturados y poco contraste. El correcto usa un solo acento y buena legibilidad.`
  },
  dashboard: {
    bad: `<div style="background:#f0f0f0;padding:14px;"><div style="color:#aaaaaa;">Usuarios: 2.4K</div><div style="color:#bbbbbb;">Conversión: 87%</div><p style="color:#ef4444;">❌ Contraste bajo</p></div>`,
    good: `<div style="background:#0f172a;padding:14px;"><div style="color:#60a5fa;">Usuarios: 2.4K</div><div style="color:#4ade80;">Conversión: 87% ↑</div><p style="color:#22c55e;">✓ Accesible</p></div>`,
    explanation: `<strong>Dashboard:</strong> El incorrecto usa grises muy claros; el correcto modo oscuro con buen contraste.`
  },
  login: {
    bad: `<div style="background:linear-gradient(135deg,#ff0080,#ff8c00);padding:20px;"><input placeholder="Email" style="background:#ff4500;color:#ffff00;"><button style="background:#00ff00;color:#ff0000;">ENTRAR</button><p style="color:#000080;">❌ Desconfianza</p></div>`,
    good: `<div style="background:#fff;padding:20px;border-radius:8px;"><input type="email" placeholder="usuario@ejemplo.com" style="width:100%;padding:10px;margin-bottom:10px;"><button style="background:#4f46e5;color:#fff;width:100%;padding:10px;border:none;border-radius:8px;">Iniciar Sesión</button><p style="color:#22c55e;">✓ Confiable</p></div>`,
    explanation: `<strong>Login:</strong> El incorrecto usa colores estridentes; el correcto es limpio y profesional.`
  },
  alerts: {
    bad: `<div style="background:#ff0000;color:#fff;padding:10px;">Pago exitoso (rojo)</div><div style="background:#00cc00;color:#fff;">Error (verde)</div><p style="color:#f87171;">❌ Semántica invertida</p>`,
    good: `<div style="background:#f0fdf4;border-left:4px solid #22c55e;padding:10px;">✅ Pago exitoso</div><div style="background:#fef2f2;border-left:4px solid #ef4444;padding:10px;">❌ Error</div><p style="color:#4ade80;">✓ Semántica correcta</p>`,
    explanation: `<strong>Alertas:</strong> El incorrecto usa rojo para éxito y verde para error. El correcto respeta las convenciones.`
  }
};
function setScenario(key) {
  document.querySelectorAll('.scenario-tab').forEach(t => t.classList.remove('active'));
  let tab = document.getElementById('tab-' + key); if (tab) tab.classList.add('active');
  document.getElementById('panel-bad').innerHTML = scenarios[key].bad;
  document.getElementById('panel-good').innerHTML = scenarios[key].good;
  document.getElementById('scenario-explanation').innerHTML = scenarios[key].explanation;
}
function initComparator() {
  if (comparatorReady) return;
  comparatorReady = true;
  setScenario('ecommerce');
}

/* ===== MÓDULOS INTERACTIVOS ADICIONALES ===== */

// 1. Principios: Modelos de color + círculo cromático + armonías
function initPrincipiosInteractive() {
  // Sliders RGB
  const r = document.getElementById('demo-r');
  const g = document.getElementById('demo-g');
  const b = document.getElementById('demo-b');
  const colorBox = document.getElementById('demo-color-box');
  const rgbSpan = document.getElementById('demo-rgb');
  const hexSpan = document.getElementById('demo-hex');
  const hslSpan = document.getElementById('demo-hsl');
  const liveDemo = document.getElementById('live-demo-card');

  function rgbToHex(r, g, b) { return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1); }
  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) h = s = 0;
    else {
      let d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return `hsl(${Math.round(h * 360)}°, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
  }
  function updateRGB() {
    let red = parseInt(r.value), green = parseInt(g.value), blue = parseInt(b.value);
    let bg = `rgb(${red},${green},${blue})`;
    colorBox.style.backgroundColor = bg;
    rgbSpan.textContent = bg;
    hexSpan.textContent = rgbToHex(red, green, blue);
    hslSpan.textContent = rgbToHsl(red, green, blue);
    if (liveDemo) liveDemo.style.backgroundColor = bg;
  }
  if (r && g && b) {
    r.addEventListener('input', updateRGB);
    g.addEventListener('input', updateRGB);
    b.addEventListener('input', updateRGB);
    updateRGB();
  }

  // Círculo cromático
  const wheel = document.getElementById('color-wheel');
  if (wheel && wheel.children.length === 0) {
    const hues = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
    hues.forEach(h => {
      const div = document.createElement('div');
      div.className = 'wheel-color';
      div.style.backgroundColor = `hsl(${h},100%,50%)`;
      div.setAttribute('data-hue', h);
      div.addEventListener('click', () => {
        let hueColor = `hsl(${h},100%,50%)`;
        if (liveDemo) liveDemo.style.backgroundColor = hueColor;
        // sincronizar color base
        let [r, g, b] = hslToRgb(h / 360, 1, 0.5);
        document.getElementById('harmony-base-color').value = rgbToHex(r, g, b);
        updateHarmonyDemo();
      });
      wheel.appendChild(div);
    });
  }

  // Funciones auxiliares para armonías
  function hexToRgb(hex) {
    let r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b];
  }
  function rgbToHslArray(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) h = s = 0;
    else {
      let d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return [h, s, l];
  }
  function hslToRgb(h, s, l) {
    let r, g, b;
    if (s === 0) r = g = b = l;
    else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1; if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };
      let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      let p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }

  function updateHarmonyDemo() {
    let baseHex = document.getElementById('harmony-base-color').value;
    let type = document.getElementById('harmony-type-select').value;
    let [r0, g0, b0] = hexToRgb(baseHex);
    let [h, s, l] = rgbToHslArray(r0, g0, b0);
    let colors = [];
    if (type === 'mono') {
      for (let i = 0; i < 4; i++) {
        let newL = Math.min(0.9, Math.max(0.1, l + (i - 1.5) * 0.15));
        let [rr, gg, bb] = hslToRgb(h, s, newL);
        colors.push(`rgb(${rr},${gg},${bb})`);
      }
    } else if (type === 'comp') {
      let h2 = (h + 0.5) % 1;
      let [rr, gg, bb] = hslToRgb(h2, s, l);
      colors.push(`rgb(${r0},${g0},${b0})`, `rgb(${rr},${gg},${bb})`);
    } else if (type === 'analoga') {
      let h1 = (h + 0.1) % 1, h2 = (h - 0.1 + 1) % 1;
      let [r1, g1, b1] = hslToRgb(h1, s, l);
      let [r2, g2, b2] = hslToRgb(h2, s, l);
      colors.push(`rgb(${r0},${g0},${b0})`, `rgb(${r1},${g1},${b1})`, `rgb(${r2},${g2},${b2})`);
    } else if (type === 'triadica') {
      let h2 = (h + 1 / 3) % 1, h3 = (h + 2 / 3) % 1;
      let [r1, g1, b1] = hslToRgb(h2, s, l);
      let [r2, g2, b2] = hslToRgb(h3, s, l);
      colors.push(`rgb(${r0},${g0},${b0})`, `rgb(${r1},${g1},${b1})`, `rgb(${r2},${g2},${b2})`);
    }
    const container = document.getElementById('harmony-palette-demo');
    if (container) {
      container.innerHTML = '';
      colors.forEach(col => {
        let chip = document.createElement('div');
        chip.className = 'harmony-swatch-demo';
        chip.style.backgroundColor = col;
        chip.addEventListener('click', () => {
          if (liveDemo) liveDemo.style.backgroundColor = col;
        });
        container.appendChild(chip);
      });
    }
  }

  const baseColorPicker = document.getElementById('harmony-base-color');
  const harmonySelect = document.getElementById('harmony-type-select');
  if (baseColorPicker && harmonySelect) {
    baseColorPicker.addEventListener('input', updateHarmonyDemo);
    harmonySelect.addEventListener('change', updateHarmonyDemo);
    updateHarmonyDemo();
  }
}

// 2. Contraste: demo sincronizado
function initContrasteInteractive() {
  const bgPicker = document.getElementById('bg-color');
  const textPicker = document.getElementById('text-color');
  const demoDiv = document.getElementById('contraste-demo');
  if (bgPicker && textPicker && demoDiv) {
    function syncContrastDemo() {
      demoDiv.style.backgroundColor = bgPicker.value;
      demoDiv.style.color = textPicker.value;
      const btn = demoDiv.querySelector('button');
      if (btn) btn.style.color = textPicker.value;
      const input = demoDiv.querySelector('input');
      if (input) { input.style.backgroundColor = bgPicker.value; input.style.color = textPicker.value; }
    }
    bgPicker.addEventListener('input', syncContrastDemo);
    textPicker.addEventListener('input', syncContrastDemo);
    syncContrastDemo();
  }
}

// 3. Buenos usos: jerarquía interactiva
function initHierarchyInteractive() {
  const primary = document.getElementById('hierarchy-primary-color');
  const secondary = document.getElementById('hierarchy-secondary-color');
  const textColor = document.getElementById('hierarchy-text-color');
  const mainBtn = document.getElementById('hierarchy-main-btn');
  const secBtn = document.getElementById('hierarchy-sec-btn');
  if (primary && secondary && textColor && mainBtn && secBtn) {
    function updateHierarchy() {
      mainBtn.style.backgroundColor = primary.value;
      mainBtn.style.color = textColor.value;
      secBtn.style.backgroundColor = secondary.value;
    }
    primary.addEventListener('input', updateHierarchy);
    secondary.addEventListener('input', updateHierarchy);
    textColor.addEventListener('input', updateHierarchy);
    updateHierarchy();
  }
}

// 4. E-commerce: CTA interactivo
function initEcommerceInteractive() {
  const ctaColor = document.getElementById('cta-demo-color');
  const ctaText = document.getElementById('cta-demo-text');
  const ctaBtn = document.getElementById('cta-demo-button');
  if (ctaColor && ctaText && ctaBtn) {
    function updateCTA() {
      ctaBtn.style.backgroundColor = ctaColor.value;
      ctaBtn.style.color = ctaText.value;
    }
    ctaColor.addEventListener('input', updateCTA);
    ctaText.addEventListener('input', updateCTA);
    updateCTA();
  }
}

// 5. Marca: psicología interactiva
function initPsicologiaInteractive() {
  const grid = document.getElementById('psycho-grid-demo');
  const msgDiv = document.getElementById('psycho-message-demo');
  if (grid && grid.children.length === 0) {
    const colores = [
      { name: 'Rojo', hex: '#ef4444', msg: '🔴 Rojo: alerta, error, urgencia. En China: buena suerte.' },
      { name: 'Verde', hex: '#22c55e', msg: '🟢 Verde: éxito, confirmación, naturaleza. En algunos mercados asiáticos puede significar pérdida.' },
      { name: 'Azul', hex: '#3b82f6', msg: '🔵 Azul: confianza, seguridad, profesionalismo. Muy usado en bancos y tecnología.' },
      { name: 'Amarillo', hex: '#facc15', msg: '🟡 Amarillo: advertencia, optimismo. Puede fatigar visualmente en exceso.' },
      { name: 'Naranja', hex: '#f97316', msg: '🟠 Naranja: energía, acción, creatividad. Ideal para CTAs.' },
      { name: 'Morado', hex: '#a855f7', msg: '🟣 Morado: lujo, creatividad, misterio. Marcas premium.' },
      { name: 'Negro', hex: '#111111', msg: '⚫ Negro: elegancia, poder, sofisticación. No usar #000000 puro en interfaces.' },
      { name: 'Blanco', hex: '#ffffff', msg: '⚪ Blanco: pureza, limpieza, minimalismo. Base para modo claro.' }
    ];
    colores.forEach(c => {
      const chip = document.createElement('div');
      chip.className = 'psycho-chip-demo';
      chip.style.backgroundColor = c.hex;
      if (c.name === 'Blanco') chip.style.border = '1px solid #aaa';
      chip.addEventListener('click', () => { if (msgDiv) msgDiv.innerHTML = c.msg; });
      grid.appendChild(chip);
    });
  }
}

// Inicializaciones si ya estamos en la página correcta al cargar
setTimeout(() => {
  let page = location.hash.replace('#', '') || 'home';
  if (page === 'principios') initPrincipiosInteractive();
  if (page === 'contraste') initContrasteInteractive();
  if (page === 'buenos') initHierarchyInteractive();
  if (page === 'ecommerce') initEcommerceInteractive();
  if (page === 'marca') initPsicologiaInteractive();
}, 100);
