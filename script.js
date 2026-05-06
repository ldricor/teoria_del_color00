/* ===== SCRIPT.JS — Hash Router + Logic ===== */

/* ============================================================
   STATE — declared before boot to avoid TDZ crashes
   ============================================================ */
const PAGES = ['home','principios','contraste','buenos','malos','ecommerce','comparador','marca','reglas'];
let currentPage    = null;
let contrastReady  = false;
let comparatorReady = false;
let barsAnimated   = false;

/* ============================================================
   COMPARATOR SCENARIOS
   (must live before the boot call so direct #comparador links work)
   ============================================================ */
const scenarios = {
  ecommerce: {
    bad: `
      <div style="background:#ff6600;padding:14px;border-radius:8px;margin-bottom:8px;">
        <div style="color:#ff0000;font-size:0.9rem;font-weight:800;margin-bottom:6px;">¡¡OFERTA ESPECIAL!!</div>
        <div style="color:#ffff00;font-size:1.2rem;font-weight:900;">Laptop Gaming</div>
        <div style="color:#00ff00;font-size:0.8rem;margin:6px 0;">Ahorra $500 hoy solamente</div>
        <div style="background:#ff00ff;color:#00ffff;padding:8px 14px;border-radius:6px;font-size:0.85rem;font-weight:800;display:inline-block;margin-top:4px;">COMPRAR AHORA</div>
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;">
        <span style="background:#ff0000;color:#ffff00;padding:4px 10px;border-radius:20px;font-size:0.7rem;font-weight:700;">NUEVO</span>
        <span style="background:#00cc00;color:#ff00ff;padding:4px 10px;border-radius:20px;font-size:0.7rem;font-weight:700;">POPULAR</span>
        <span style="background:#0000ff;color:#ff8800;padding:4px 10px;border-radius:20px;font-size:0.7rem;font-weight:700;">TOP VENTAS</span>
      </div>
      <p style="color:#f87171;font-size:0.7rem;margin-top:8px;">❌ Demasiados colores competidores, legibilidad muy baja</p>`,
    good: `
      <div style="background:#0f172a;padding:14px;border-radius:8px;margin-bottom:8px;">
        <div style="background:#f97316;color:#fff;display:inline-block;font-size:0.65rem;font-weight:800;text-transform:uppercase;letter-spacing:1px;padding:3px 8px;border-radius:20px;margin-bottom:8px;">Oferta 48h</div>
        <div style="color:#f1f5f9;font-size:1.1rem;font-weight:800;margin-bottom:4px;font-family:'Space Grotesk',sans-serif;">Laptop Gaming Pro</div>
        <div style="color:#94a3b8;font-size:0.8rem;margin-bottom:10px;">Ahorra $500 — solo hasta el domingo</div>
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
          <span style="color:#fff;font-size:1.3rem;font-weight:900;">$899</span>
          <span style="color:#64748b;text-decoration:line-through;font-size:0.9rem;">$1,399</span>
        </div>
        <button style="background:#f97316;color:#fff;border:none;padding:10px 20px;border-radius:8px;font-size:0.85rem;font-weight:700;cursor:default;font-family:inherit;width:100%;">Agregar al Carrito →</button>
      </div>
      <p style="color:#4ade80;font-size:0.7rem;">✓ Un solo acento, jerarquía clara, contraste óptimo</p>`,
    explanation: `<strong>E-commerce:</strong> El diseño incorrecto usa 6+ colores completamente saturados al mismo tiempo, creando <strong>fatiga visual y caos</strong>. El diseño correcto usa una paleta oscura neutra con <strong>un único acento (naranja)</strong> solo para el CTA. El usuario sabe inmediatamente dónde hacer clic.`
  },
  dashboard: {
    bad: `
      <div style="background:#ffffff;padding:14px;border-radius:8px;">
        <div style="color:#aaaaaa;font-size:1rem;font-weight:800;margin-bottom:10px;">Dashboard</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
          <div style="background:#f0f0f0;border-radius:6px;padding:10px;"><div style="color:#cccccc;font-size:1.5rem;font-weight:900;">2.4K</div><div style="color:#dddddd;font-size:0.7rem;">Usuarios</div></div>
          <div style="background:#f5f5f5;border-radius:6px;padding:10px;"><div style="color:#c8c8c8;font-size:1.5rem;font-weight:900;">87%</div><div style="color:#d5d5d5;font-size:0.7rem;">Conversión</div></div>
        </div>
        <p style="color:#ef4444;font-size:0.7rem;margin-top:8px;">❌ Ratio de contraste ~1.5:1, ilegible</p>
      </div>`,
    good: `
      <div style="background:#0f172a;padding:14px;border-radius:8px;">
        <div style="color:#f1f5f9;font-size:1rem;font-weight:800;margin-bottom:10px;font-family:'Space Grotesk',sans-serif;">Dashboard</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
          <div style="background:#1e293b;border:1px solid rgba(255,255,255,0.07);border-radius:6px;padding:10px;"><div style="color:#60a5fa;font-size:1.5rem;font-weight:900;font-family:'Space Grotesk',sans-serif;">2.4K</div><div style="color:#94a3b8;font-size:0.7rem;">Usuarios activos</div><div style="color:#4ade80;font-size:0.65rem;margin-top:4px;">↑ 12% vs mes anterior</div></div>
          <div style="background:#1e293b;border:1px solid rgba(255,255,255,0.07);border-radius:6px;padding:10px;"><div style="color:#a78bfa;font-size:1.5rem;font-weight:900;font-family:'Space Grotesk',sans-serif;">87%</div><div style="color:#94a3b8;font-size:0.7rem;">Conversión</div><div style="color:#f87171;font-size:0.65rem;margin-top:4px;">↓ 2.1% vs mes anterior</div></div>
        </div>
        <p style="color:#4ade80;font-size:0.7rem;margin-top:8px;">✓ Contraste excelente, color semántico en métricas</p>
      </div>`,
    explanation: `<strong>Dashboard:</strong> El problema más común es el <strong>"minimalismo inaccessible"</strong>: texto gris sobre fondo blanco con ratios de 1.5:1 (WCAG requiere 4.5:1). En el diseño correcto se usa modo oscuro con buena elevación, números en color significativo y texto secundario correctamente atenuado pero legible.`
  },
  login: {
    bad: `
      <div style="background:linear-gradient(135deg,#FF0080,#FF8C00,#FFD700);padding:20px;border-radius:8px;">
        <div style="color:#FF00FF;font-size:1rem;font-weight:900;margin-bottom:14px;">Iniciar Sesión</div>
        <input type="email" placeholder="Correo" readonly style="width:100%;padding:10px;border-radius:6px;border:3px solid #00FF00;background:#FF4500;color:#FFFF00;font-size:0.8rem;margin-bottom:8px;font-family:inherit;display:block;" />
        <input type="password" placeholder="Contraseña" readonly style="width:100%;padding:10px;border-radius:6px;border:3px solid #FF00FF;background:#8B00FF;color:#00FFFF;font-size:0.8rem;margin-bottom:12px;font-family:inherit;display:block;" />
        <button style="width:100%;padding:11px;background:#00FF00;color:#FF0000;border:none;border-radius:6px;font-weight:900;font-size:0.85rem;font-family:inherit;cursor:default;">ENTRAR</button>
        <p style="color:#000080;font-size:0.7rem;margin-top:8px;">❌ Sobrecarga de colores saturados, desconfianza inmediata</p>
      </div>`,
    good: `
      <div style="background:#fff;padding:20px;border-radius:8px;">
        <div style="margin-bottom:16px;"><div style="font-family:'Space Grotesk',sans-serif;font-size:1.1rem;font-weight:800;color:#0f172a;margin-bottom:4px;">Bienvenido de nuevo</div><div style="font-size:0.78rem;color:#64748b;">Ingresa tus credenciales para continuar</div></div>
        <div style="margin-bottom:12px;"><label style="font-size:0.75rem;font-weight:600;color:#374151;display:block;margin-bottom:5px;">Correo electrónico</label><input type="email" value="usuario@ejemplo.com" readonly style="width:100%;padding:10px 14px;border-radius:8px;border:1.5px solid #e2e8f0;background:#f8fafc;color:#0f172a;font-size:0.82rem;font-family:inherit;display:block;" /></div>
        <div style="margin-bottom:16px;"><label style="font-size:0.75rem;font-weight:600;color:#374151;display:block;margin-bottom:5px;">Contraseña</label><input type="password" value="••••••••" readonly style="width:100%;padding:10px 14px;border-radius:8px;border:1.5px solid #e2e8f0;background:#f8fafc;color:#0f172a;font-size:0.82rem;font-family:inherit;display:block;" /></div>
        <button style="width:100%;padding:11px;background:#4f46e5;color:#fff;border:none;border-radius:8px;font-weight:700;font-size:0.85rem;font-family:inherit;cursor:default;">Iniciar Sesión</button>
        <p style="color:#22c55e;font-size:0.7rem;margin-top:8px;">✓ Limpio, jerarquía clara, foco en la acción principal</p>
      </div>`,
    explanation: `<strong>Login:</strong> Un formulario de login necesita ser <strong>confiable y funcional</strong>, no vistoso. El diseño incorrecto usa colores saturados que generan desconfianza. El correcto usa fondo blanco neutro, labels grises suaves, inputs de borde sutil y <strong>un único botón de acento</strong> (índigo).`
  },
  alerts: {
    bad: `
      <div style="padding:10px;display:flex;flex-direction:column;gap:8px;">
        <div style="background:#ff0000;color:#ffffff;padding:12px;border-radius:6px;font-size:0.8rem;">Tu pago fue procesado exitosamente. ¡Gracias!</div>
        <div style="background:#00cc00;color:#ffffff;padding:12px;border-radius:6px;font-size:0.8rem;">Error: El correo electrónico ya está en uso.</div>
        <div style="background:#bbbbbb;color:#cccccc;padding:12px;border-radius:6px;font-size:0.8rem;">Advertencia: Solo quedan 3 días de prueba.</div>
        <div style="background:#0000ff;color:#0000cc;padding:12px;border-radius:6px;font-size:0.8rem;">Info: Nueva actualización disponible.</div>
        <p style="color:#f87171;font-size:0.7rem;margin-top:4px;">❌ Semántica invertida + texto ilegible (mismo color que fondo)</p>
      </div>`,
    good: `
      <div style="padding:10px;display:flex;flex-direction:column;gap:8px;">
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;padding:12px;border-radius:6px;display:flex;gap:10px;align-items:flex-start;"><span style="color:#16a34a;font-weight:900;font-size:1rem;">✓</span><div><div style="color:#166534;font-weight:700;font-size:0.8rem;margin-bottom:2px;">Pago Exitoso</div><div style="color:#15803d;font-size:0.75rem;">Tu transacción fue procesada.</div></div></div>
        <div style="background:#fef2f2;border:1px solid #fecaca;padding:12px;border-radius:6px;display:flex;gap:10px;align-items:flex-start;"><span style="color:#dc2626;font-weight:900;font-size:1rem;">✕</span><div><div style="color:#991b1b;font-weight:700;font-size:0.8rem;margin-bottom:2px;">Error de Validación</div><div style="color:#dc2626;font-size:0.75rem;">El correo ya está en uso.</div></div></div>
        <div style="background:#fffbeb;border:1px solid #fde68a;padding:12px;border-radius:6px;display:flex;gap:10px;align-items:flex-start;"><span style="color:#d97706;font-weight:900;font-size:1rem;">⚠</span><div><div style="color:#92400e;font-weight:700;font-size:0.8rem;margin-bottom:2px;">Advertencia</div><div style="color:#b45309;font-size:0.75rem;">Solo quedan 3 días de prueba.</div></div></div>
        <div style="background:#eff6ff;border:1px solid #bfdbfe;padding:12px;border-radius:6px;display:flex;gap:10px;align-items:flex-start;"><span style="color:#1d4ed8;font-weight:900;font-size:1rem;">ℹ</span><div><div style="color:#1e40af;font-weight:700;font-size:0.8rem;margin-bottom:2px;">Actualización Disponible</div><div style="color:#1d4ed8;font-size:0.75rem;">Versión v2.4 lista para instalar.</div></div></div>
        <p style="color:#4ade80;font-size:0.7rem;margin-top:4px;">✓ Semántica correcta, contraste óptimo, ícono + color + texto</p>
      </div>`,
    explanation: `<strong>Alertas:</strong> Dos problemas en el diseño incorrecto: (1) <strong>semántica invertida</strong> — rojo para éxito y verde para error, (2) <strong>texto del mismo color que el fondo</strong>. El diseño correcto sigue la convención universal y siempre combina <strong>ícono + color + texto</strong>.`
  }
};


/* ============================================================
   ROUTER
   ============================================================ */
function navigate(pageId) {
  if (!PAGES.includes(pageId)) pageId = 'home';
  if (pageId === currentPage) return;

  // Animate out current
  if (currentPage) {
    const old = document.getElementById('page-' + currentPage);
    if (old) {
      old.classList.add('exit');
      setTimeout(() => { old.style.display = 'none'; old.classList.remove('exit', 'active'); }, 260);
    }
  }

  // Animate in new
  const next = document.getElementById('page-' + pageId);
  if (next) {
    next.style.display = 'flex';
    requestAnimationFrame(() => next.classList.add('active'));
    next.scrollTop = 0;
  }

  currentPage = pageId;

  // Update URL hash without triggering hashchange
  history.replaceState(null, '', '#' + pageId);

  // Update nav active state
  document.querySelectorAll('.nav-link, .mob-link').forEach(link => {
    const lp = link.dataset.page;
    link.classList.toggle('nav-active', lp === pageId);
  });

  // Close mobile menu
  document.getElementById('mobile-menu').classList.remove('open');

  // Page-specific init
  if (pageId === 'contraste')                       initContrastTool();
  if (pageId === 'comparador')                      initComparator();
  if (pageId === 'buenos' || pageId === 'malos')    initAccessBars();
}

// Listen to nav link clicks
document.querySelectorAll('.nav-link, .mob-link').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    navigate(link.dataset.page);
  });
});

// Handle browser back/forward
window.addEventListener('hashchange', () => {
  const hash = location.hash.replace('#', '') || 'home';
  navigate(hash);
});

// Boot
const initPage = location.hash.replace('#', '') || 'home';
navigate(initPage);


/* ============================================================
   MOBILE MENU TOGGLE
   ============================================================ */
function toggleMobileMenu() {
  document.getElementById('mobile-menu').classList.toggle('open');
}


/* ============================================================
   CONTRAST RATIO CALCULATOR
   ============================================================ */
function hexToRgb(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  return {
    r: parseInt(hex.substring(0, 2), 16),
    g: parseInt(hex.substring(2, 4), 16),
    b: parseInt(hex.substring(4, 6), 16)
  };
}

function relativeLuminance(rgb) {
  const toLinear = c => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * toLinear(rgb.r) + 0.7152 * toLinear(rgb.g) + 0.0722 * toLinear(rgb.b);
}

function getContrastRatio(hex1, hex2) {
  const l1 = relativeLuminance(hexToRgb(hex1));
  const l2 = relativeLuminance(hexToRgb(hex2));
  const lighter = Math.max(l1, l2);
  const darker  = Math.min(l1, l2);
  return ((lighter + 0.05) / (darker + 0.05)).toFixed(2);
}

function updateContrastTool() {
  const bg   = document.getElementById('bg-color').value;
  const text = document.getElementById('text-color').value;

  document.getElementById('bg-hex').textContent   = bg;
  document.getElementById('text-hex').textContent = text;

  const preview = document.getElementById('preview-box');
  preview.style.backgroundColor = bg;
  preview.style.color = text;

  const ratio = parseFloat(getContrastRatio(bg, text));
  const ratioEl = document.getElementById('ratio-num');
  ratioEl.textContent = ratio.toFixed(2);

  const checks = {
    'badge-aa-normal':  4.5,
    'badge-aa-large':   3.0,
    'badge-aaa-normal': 7.0,
    'badge-aaa-large':  4.5,
  };

  Object.entries(checks).forEach(([id, min]) => {
    const badge = document.getElementById(id);
    if (!badge) return;
    const pass = ratio >= min;
    badge.classList.toggle('pass', pass);
    badge.classList.toggle('fail', !pass);
    badge.querySelector('.badge-status').textContent = pass ? '✓ Pasa' : '✗ Falla';
  });

  if (ratio >= 7)        ratioEl.style.color = '#22c55e';
  else if (ratio >= 4.5) ratioEl.style.color = '#4ade80';
  else if (ratio >= 3)   ratioEl.style.color = '#f59e0b';
  else                   ratioEl.style.color = '#ef4444';
}

function setPreset(bg, text) {
  document.getElementById('bg-color').value   = bg;
  document.getElementById('text-color').value = text;
  updateContrastTool();
}

function initContrastTool() {
  if (contrastReady) return;
  contrastReady = true;
  document.getElementById('bg-color').addEventListener('input', updateContrastTool);
  document.getElementById('text-color').addEventListener('input', updateContrastTool);
  updateContrastTool();
}


/* ============================================================
   COMPARATOR LOGIC
   ============================================================ */
function setScenario(key) {
  document.querySelectorAll('.scenario-tab').forEach(t => t.classList.remove('active'));
  const tab = document.getElementById('tab-' + key);
  if (tab) tab.classList.add('active');
  document.getElementById('panel-bad').innerHTML  = scenarios[key].bad;
  document.getElementById('panel-good').innerHTML = scenarios[key].good;
  document.getElementById('scenario-explanation').innerHTML = scenarios[key].explanation;
}

function initComparator() {
  if (comparatorReady) return;
  comparatorReady = true;
  setScenario('ecommerce');
}


/* ============================================================
   ACCESS BARS ANIMATION
   ============================================================ */
function initAccessBars() {
  if (barsAnimated) return;
  barsAnimated = true;
  setTimeout(() => {
    document.querySelectorAll('.access-fill').forEach(fill => {
      const w = fill.style.width;
      fill.style.width = '0';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => { fill.style.width = w; });
      });
    });
  }, 300);
}


/* ============================================================
   LABORATORIO INTERACTIVO (NUEVO)
   ============================================================ */

function initLaboratorio() {
  // Verificar si estamos en la página laboratorio
  const labPage = document.getElementById('page-laboratorio');
  if (!labPage) return;

  // ----- 1. MODELOS RGB/HEX/HSL -----
  const r = document.getElementById('lab-r');
  const g = document.getElementById('lab-g');
  const b = document.getElementById('lab-b');
  const preview = document.getElementById('lab-preview');
  const rgbSpan = document.getElementById('lab-rgb');
  const hexSpan = document.getElementById('lab-hex');
  const hslSpan = document.getElementById('lab-hsl');

  function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }
  function rgbToHsl(r, g, b) {
    r /= 255, g /= 255, b /= 255;
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
    preview.style.backgroundColor = `rgb(${red}, ${green}, ${blue})`;
    rgbSpan.textContent = `rgb(${red}, ${green}, ${blue})`;
    hexSpan.textContent = rgbToHex(red, green, blue);
    hslSpan.textContent = rgbToHsl(red, green, blue);
  }
  if (r && g && b) {
    r.addEventListener('input', updateRGB);
    g.addEventListener('input', updateRGB);
    b.addEventListener('input', updateRGB);
    updateRGB();
  }

  // ----- 2. CÍRCULO CROMÁTICO -----
  const circleContainer = document.getElementById('chromatic-circle');
  const circleFeedback = document.getElementById('circle-feedback');
  const selectedHueDiv = document.getElementById('selected-hue');
  if (circleContainer) {
    const hues = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
    hues.forEach(hue => {
      const swatch = document.createElement('div');
      swatch.className = 'circle-hue';
      swatch.style.backgroundColor = `hsl(${hue}, 100%, 50%)`;
      swatch.setAttribute('data-hue', hue);
      swatch.addEventListener('click', () => {
        circleFeedback.textContent = `Matiz (Hue) seleccionado: ${hue}°`;
        if (selectedHueDiv) selectedHueDiv.innerHTML = `🎨 Color HSL: hsl(${hue}°, 100%, 50%)`;
      });
      circleContainer.appendChild(swatch);
    });
  }

  // ----- 3. ARMONÍAS -----
  const baseColor = document.getElementById('harmony-base');
  const harmonyType = document.getElementById('harmony-type');
  const paletteDiv = document.getElementById('harmony-palette');

  function hexToRgb(hex) {
    let r = parseInt(hex.slice(1,3), 16), g = parseInt(hex.slice(3,5), 16), b = parseInt(hex.slice(5,7), 16);
    return [r, g, b];
  }
  function rgbToHslArray(r, g, b) {
    r /= 255, g /= 255, b /= 255;
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
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      let p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }

  function updateHarmony() {
    let hex = baseColor.value;
    let [r0, g0, b0] = hexToRgb(hex);
    let [h, s, l] = rgbToHslArray(r0, g0, b0);
    let colors = [];
    let type = harmonyType.value;
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
      let h2 = (h + 1/3) % 1, h3 = (h + 2/3) % 1;
      let [r1, g1, b1] = hslToRgb(h2, s, l);
      let [r2, g2, b2] = hslToRgb(h3, s, l);
      colors.push(`rgb(${r0},${g0},${b0})`, `rgb(${r1},${g1},${b1})`, `rgb(${r2},${g2},${b2})`);
    }
    paletteDiv.innerHTML = '';
    colors.forEach(col => {
      let swatch = document.createElement('div');
      swatch.className = 'harmony-swatch';
      swatch.style.backgroundColor = col;
      swatch.title = col;
      paletteDiv.appendChild(swatch);
    });
  }
  if (baseColor && harmonyType) {
    baseColor.addEventListener('input', updateHarmony);
    harmonyType.addEventListener('change', updateHarmony);
    updateHarmony();
  }

  // ----- 4. SIMULADOR DALTONISMO -----
  const daltonSelect = document.getElementById('dalton-filter');
  const daltonSample = document.getElementById('dalton-sample');
  if (daltonSelect && daltonSample) {
    // Inyectar filtros SVG si no existen
    if (!document.getElementById('dalton-filters')) {
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("style", "position:absolute; width:0; height:0");
      svg.setAttribute("id", "dalton-filters");
      svg.innerHTML = `
        <filter id="protanopia"><feColorMatrix type="matrix" values="0.567,0.433,0,0,0  0.558,0.442,0,0,0  0,0.242,0.758,0,0  0,0,0,1,0"/></filter>
        <filter id="deuteranopia"><feColorMatrix type="matrix" values="0.625,0.375,0,0,0  0.7,0.3,0,0,0  0,0.3,0.7,0,0  0,0,0,1,0"/></filter>
        <filter id="tritanopia"><feColorMatrix type="matrix" values="0.95,0.05,0,0,0  0,0.433,0.567,0,0  0,0.475,0.525,0,0  0,0,0,1,0"/></filter>
      `;
      document.body.appendChild(svg);
    }
    function applyFilter(type) {
      if (type === 'none') daltonSample.style.filter = 'none';
      else if (type === 'protanopia') daltonSample.style.filter = 'url(#protanopia)';
      else if (type === 'deuteranopia') daltonSample.style.filter = 'url(#deuteranopia)';
      else if (type === 'tritanopia') daltonSample.style.filter = 'url(#tritanopia)';
    }
    daltonSelect.addEventListener('change', (e) => applyFilter(e.target.value));
    applyFilter('none');
  }

  // ----- 5. PSICOLOGÍA DEL COLOR -----
  const psychoGrid = document.getElementById('psycho-grid');
  const psychoMsg = document.getElementById('psycho-message');
  const colorsPsycho = [
    { name: 'Rojo', hex: '#ef4444', text: '🔴 <strong>Rojo</strong>: alerta, error, pasión. En China: buena suerte. Ideal para botones destructivos o urgencia.' },
    { name: 'Verde', hex: '#22c55e', text: '🟢 <strong>Verde</strong>: éxito, confirmación, naturaleza. Cuidado: en algunos países asiáticos puede representar pérdida en bolsa.' },
    { name: 'Azul', hex: '#3b82f6', text: '🔵 <strong>Azul</strong>: confianza, seguridad, profesionalismo. Usado por bancos y tech. En exceso, frío.' },
    { name: 'Amarillo', hex: '#facc15', text: '🟡 <strong>Amarillo</strong>: advertencia, optimismo. Alta luminosidad; puede fatigar si se usa en exceso.' },
    { name: 'Naranja', hex: '#f97316', text: '🟠 <strong>Naranja</strong>: energía, acción, creatividad. Ideal para CTAs secundarios.' },
    { name: 'Morado', hex: '#a855f7', text: '🟣 <strong>Morado</strong>: lujo, creatividad, misterio. Marcas premium y cosméticos.' },
    { name: 'Negro', hex: '#111111', text: '⚫ <strong>Negro</strong>: elegancia, poder, sofisticación. Modo oscuro, lujo. No usar #000000 puro.' },
    { name: 'Blanco', hex: '#ffffff', text: '⚪ <strong>Blanco</strong>: pureza, limpieza, minimalismo. Base para modo claro. Puede ser estéril en exceso.' }
  ];
  if (psychoGrid) {
    colorsPsycho.forEach(c => {
      const chip = document.createElement('div');
      chip.className = 'psycho-chip';
      chip.style.backgroundColor = c.hex;
      chip.style.border = c.name === 'Blanco' ? '1px solid #aaa' : 'none';
      chip.addEventListener('click', () => {
        psychoMsg.innerHTML = c.text;
      });
      psychoGrid.appendChild(chip);
    });
  }

  // ----- 6. REGLA 60-30-10 -----
  const ruleBg = document.getElementById('rule-bg');
  const ruleSecondary = document.getElementById('rule-secondary');
  const ruleAccent = document.getElementById('rule-accent');
  const ruleDemo = document.getElementById('rule-demo');
  if (ruleBg && ruleSecondary && ruleAccent && ruleDemo) {
    function updateRuleDemo() {
      const bg = ruleBg.value;
      const secondary = ruleSecondary.value;
      const accent = ruleAccent.value;
      ruleDemo.style.setProperty('--rule-bg', bg);
      ruleDemo.style.setProperty('--rule-secondary', secondary);
      ruleDemo.style.setProperty('--rule-accent', accent);
      const header = ruleDemo.querySelector('.rule-header');
      const body = ruleDemo.querySelector('.rule-body');
      const cta = ruleDemo.querySelector('.rule-cta');
      if (header) header.style.backgroundColor = secondary;
      if (body) body.style.backgroundColor = bg;
      if (cta) cta.style.backgroundColor = accent;
    }
    ruleBg.addEventListener('input', updateRuleDemo);
    ruleSecondary.addEventListener('input', updateRuleDemo);
    ruleAccent.addEventListener('input', updateRuleDemo);
    updateRuleDemo();
  }
}

// Extender la navegación para que ejecute initLaboratorio cuando se llegue a esa página
const originalNav = window.navigate;
if (typeof originalNav === 'function') {
  window.navigate = function(pageId) {
    originalNav(pageId);
    if (pageId === 'laboratorio') {
      setTimeout(initLaboratorio, 60);
    }
  };
} else {
  window.navigate = function(pageId) {
    // fallback por si no existe (no debería ocurrir)
    if (pageId === 'laboratorio') setTimeout(initLaboratorio, 60);
  };
}

// Si la página actual es laboratorio al cargar, inicializar
if (window.location.hash === '#laboratorio') {
  setTimeout(initLaboratorio, 100);
}
