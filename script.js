/* ===== SCRIPT.JS — Router + Lógica de módulos interactivos ===== */

const PAGES = ['home','principios','contraste','buenos','malos','ecommerce','comparador','marca','reglas'];
let currentPage = null;
let contrastReady = false;
let comparatorReady = false;

/* ===== ROUTER (original, sin romper) ===== */
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
  
  // Inicializar módulos según la página cargada
  if (pageId === 'principios') initPrincipiosModules();
  if (pageId === 'contraste') { initContrastTool(); initContrastDemo(); }
  if (pageId === 'buenos') initHierarchyModule();
  if (pageId === 'ecommerce') initEcommerceCTA();
  if (pageId === 'marca') initPsychoModule();
  if (pageId === 'comparador') initComparator();
}

document.querySelectorAll('.nav-link, .mob-link').forEach(link => {
  link.addEventListener('click', e => { e.preventDefault(); navigate(link.dataset.page); });
});
window.addEventListener('hashchange', () => { navigate(location.hash.replace('#', '') || 'home'); });
navigate(location.hash.replace('#', '') || 'home');

function toggleMobileMenu() { document.getElementById('mobile-menu').classList.toggle('open'); }

/* ===== MÓDULOS PRINCIPIOS (mejorados: botones y cajas cambian con armonía y modelos) ===== */
function initPrincipiosModules() {
  // 1. Modelos RGB/HEX/HSL
  const r = document.getElementById('mod-r');
  const g = document.getElementById('mod-g');
  const b = document.getElementById('mod-b');
  const preview = document.getElementById('mod-preview');
  const rgbSpan = document.getElementById('mod-rgb');
  const hexSpan = document.getElementById('mod-hex');
  const hslSpan = document.getElementById('mod-hsl');
  const demoArea = document.getElementById('mod-demo-area');
  const demoBtns = demoArea ? demoArea.querySelectorAll('.demo-btn') : [];
  const demoInputs = demoArea ? demoArea.querySelectorAll('.demo-input') : [];
  const demoText = document.getElementById('mod-demo-text');
  
  function rgbToHex(r,g,b) { return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1); }
  function rgbToHsl(r,g,b) {
    r/=255; g/=255; b/=255;
    let max = Math.max(r,g,b), min = Math.min(r,g,b);
    let h,s,l = (max+min)/2;
    if(max===min) h=s=0;
    else {
      let d = max-min;
      s = l>0.5 ? d/(2-max-min) : d/(max+min);
      switch(max) {
        case r: h=(g-b)/d+(g<b?6:0); break;
        case g: h=(b-r)/d+2; break;
        case b: h=(r-g)/d+4; break;
      }
      h/=6;
    }
    return `hsl(${Math.round(h*360)}°, ${Math.round(s*100)}%, ${Math.round(l*100)}%)`;
  }
  function updateRGB() {
    let red = parseInt(r.value), green = parseInt(g.value), blue = parseInt(b.value);
    let bgColor = `rgb(${red},${green},${blue})`;
    preview.style.backgroundColor = bgColor;
    if(demoArea) demoArea.style.backgroundColor = bgColor;
    rgbSpan.textContent = `rgb(${red},${green},${blue})`;
    hexSpan.textContent = rgbToHex(red,green,blue);
    hslSpan.textContent = rgbToHsl(red,green,blue);
    // Cambiar color de botones e inputs
    const textColor = (red*0.299 + green*0.587 + blue*0.114) > 186 ? '#000000' : '#ffffff';
    demoBtns.forEach(btn => { btn.style.backgroundColor = bgColor; btn.style.color = textColor; });
    demoInputs.forEach(inp => { inp.style.backgroundColor = bgColor; inp.style.color = textColor; });
    if(demoText) { demoText.style.backgroundColor = bgColor; demoText.style.color = textColor; demoText.style.padding = '4px 8px'; demoText.style.borderRadius = '8px'; }
  }
  if(r && g && b) { r.addEventListener('input', updateRGB); g.addEventListener('input', updateRGB); b.addEventListener('input', updateRGB); updateRGB(); }

  // 2. Círculo cromático
  const circleDiv = document.getElementById('chromatic-circle');
  if(circleDiv && circleDiv.children.length === 0) {
    const hues = [0,30,60,90,120,150,180,210,240,270,300,330];
    hues.forEach(h => {
      const swatch = document.createElement('div');
      swatch.className = 'circle-hue';
      swatch.style.backgroundColor = `hsl(${h},100%,50%)`;
      swatch.setAttribute('data-hue', h);
      swatch.addEventListener('click', () => {
        document.getElementById('harmony-base').value = `hsl(${h},100%,50%)`;
        updateHarmony();
      });
      circleDiv.appendChild(swatch);
    });
  }
  
  // 3. Armonías con actualización de demo elements
  const baseColor = document.getElementById('harmony-base');
  const harmonyType = document.getElementById('harmony-type');
  const paletteDiv = document.getElementById('harmony-palette');
  const harmonyDemoArea = document.getElementById('harmony-demo-area');
  const harmonyBtns = harmonyDemoArea ? harmonyDemoArea.querySelectorAll('.demo-btn') : [];
  const harmonyInputs = harmonyDemoArea ? harmonyDemoArea.querySelectorAll('.demo-input') : [];
  const harmonyText = document.getElementById('harmony-demo-text');
  
  function hexToRgb(hex) {
    let r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
    return [r,g,b];
  }
  function rgbToHslArray(r,g,b) {
    r/=255; g/=255; b/=255;
    let max = Math.max(r,g,b), min = Math.min(r,g,b);
    let h,s,l = (max+min)/2;
    if(max===min) h=s=0;
    else {
      let d = max-min;
      s = l>0.5 ? d/(2-max-min) : d/(max+min);
      switch(max) {
        case r: h=(g-b)/d+(g<b?6:0); break;
        case g: h=(b-r)/d+2; break;
        case b: h=(r-g)/d+4; break;
      }
      h/=6;
    }
    return [h,s,l];
  }
  function hslToRgb(h,s,l) {
    let r,g,b;
    if(s===0) r=g=b=l;
    else {
      const hue2rgb = (p,q,t) => {
        if(t<0) t+=1; if(t>1) t-=1;
        if(t<1/6) return p+(q-p)*6*t;
        if(t<1/2) return q;
        if(t<2/3) return p+(q-p)*(2/3-t)*6;
        return p;
      };
      let q = l<0.5 ? l*(1+s) : l+s-l*s;
      let p = 2*l - q;
      r = hue2rgb(p,q,h+1/3);
      g = hue2rgb(p,q,h);
      b = hue2rgb(p,q,h-1/3);
    }
    return [Math.round(r*255), Math.round(g*255), Math.round(b*255)];
  }
  function updateHarmony() {
    let hex = baseColor.value;
    let [r0,g0,b0] = hexToRgb(hex);
    let [h,s,l] = rgbToHslArray(r0,g0,b0);
    let colors = [];
    let type = harmonyType.value;
    if(type === 'mono') {
      for(let i=0; i<4; i++) {
        let newL = Math.min(0.9, Math.max(0.1, l + (i-1.5)*0.15));
        let [rr,gg,bb] = hslToRgb(h,s,newL);
        colors.push(`rgb(${rr},${gg},${bb})`);
      }
    } else if(type === 'comp') {
      let h2 = (h+0.5)%1;
      let [rr,gg,bb] = hslToRgb(h2,s,l);
      colors.push(`rgb(${r0},${g0},${b0})`, `rgb(${rr},${gg},${bb})`);
    } else if(type === 'analoga') {
      let h1 = (h+0.1)%1, h2 = (h-0.1+1)%1;
      let [r1,g1,b1] = hslToRgb(h1,s,l);
      let [r2,g2,b2] = hslToRgb(h2,s,l);
      colors.push(`rgb(${r0},${g0},${b0})`, `rgb(${r1},${g1},${b1})`, `rgb(${r2},${g2},${b2})`);
    } else if(type === 'triadica') {
      let h2 = (h+1/3)%1, h3 = (h+2/3)%1;
      let [r1,g1,b1] = hslToRgb(h2,s,l);
      let [r2,g2,b2] = hslToRgb(h3,s,l);
      colors.push(`rgb(${r0},${g0},${b0})`, `rgb(${r1},${g1},${b1})`, `rgb(${r2},${g2},${b2})`);
    }
    paletteDiv.innerHTML = '';
    colors.forEach(col => {
      let swatch = document.createElement('div');
      swatch.className = 'harmony-swatch';
      swatch.style.backgroundColor = col;
      swatch.addEventListener('click', () => {
        if(harmonyDemoArea) harmonyDemoArea.style.backgroundColor = col;
        // Aplicar color a botones e inputs
        let rgb = col.match(/\d+/g);
        if(rgb && rgb.length>=3) {
          let red = parseInt(rgb[0]), green = parseInt(rgb[1]), blue = parseInt(rgb[2]);
          let textColor = (red*0.299 + green*0.587 + blue*0.114) > 186 ? '#000000' : '#ffffff';
          harmonyBtns.forEach(btn => { btn.style.backgroundColor = col; btn.style.color = textColor; });
          harmonyInputs.forEach(inp => { inp.style.backgroundColor = col; inp.style.color = textColor; });
          if(harmonyText) { harmonyText.style.backgroundColor = col; harmonyText.style.color = textColor; }
        }
      });
      paletteDiv.appendChild(swatch);
    });
    if(colors[0] && harmonyDemoArea) {
      harmonyDemoArea.style.backgroundColor = colors[0];
      let rgb = colors[0].match(/\d+/g);
      if(rgb && rgb.length>=3) {
        let red = parseInt(rgb[0]), green = parseInt(rgb[1]), blue = parseInt(rgb[2]);
        let textColor = (red*0.299 + green*0.587 + blue*0.114) > 186 ? '#000000' : '#ffffff';
        harmonyBtns.forEach(btn => { btn.style.backgroundColor = colors[0]; btn.style.color = textColor; });
        harmonyInputs.forEach(inp => { inp.style.backgroundColor = colors[0]; inp.style.color = textColor; });
        if(harmonyText) { harmonyText.style.backgroundColor = colors[0]; harmonyText.style.color = textColor; }
      }
    }
  }
  if(baseColor && harmonyType) { baseColor.addEventListener('input', updateHarmony); harmonyType.addEventListener('change', updateHarmony); updateHarmony(); }

  // 4. Daltonismo
  const daltonFilter = document.getElementById('dalton-filter');
  const daltonDemo = document.getElementById('dalton-demo-area');
  if(daltonFilter && daltonDemo) {
    if(!document.getElementById('dalton-filters')) {
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("style", "position:absolute; width:0; height:0");
      svg.setAttribute("id", "dalton-filters");
      svg.innerHTML = `<filter id="protanopia"><feColorMatrix type="matrix" values="0.567,0.433,0,0,0  0.558,0.442,0,0,0  0,0.242,0.758,0,0  0,0,0,1,0"/></filter>
                       <filter id="deuteranopia"><feColorMatrix type="matrix" values="0.625,0.375,0,0,0  0.7,0.3,0,0,0  0,0.3,0.7,0,0  0,0,0,1,0"/></filter>
                       <filter id="tritanopia"><feColorMatrix type="matrix" values="0.95,0.05,0,0,0  0,0.433,0.567,0,0  0,0.475,0.525,0,0  0,0,0,1,0"/></filter>`;
      document.body.appendChild(svg);
    }
    daltonFilter.addEventListener('change', (e) => {
      let val = e.target.value;
      if(val === 'none') daltonDemo.style.filter = 'none';
      else daltonDemo.style.filter = `url(#${val})`;
    });
  }

  // 5. Regla 60-30-10
  const rule60 = document.getElementById('rule60');
  const rule30 = document.getElementById('rule30');
  const rule10 = document.getElementById('rule10');
  const ruleHeader = document.querySelector('#rule-demo-area .rule-header');
  const ruleBody = document.querySelector('#rule-demo-area .rule-body');
  const ruleCta = document.querySelector('#rule-demo-area .rule-cta');
  const ruleBtns = document.querySelectorAll('#rule-demo-area .demo-btn');
  const ruleInputs = document.querySelectorAll('#rule-demo-area .demo-input');
  function updateRule() {
    let bg = rule60.value, sec = rule30.value, acc = rule10.value;
    if(ruleBody) ruleBody.style.backgroundColor = bg;
    if(ruleHeader) ruleHeader.style.backgroundColor = sec;
    if(ruleCta) ruleCta.style.backgroundColor = acc;
    // Aplicar a botones extra
    ruleBtns.forEach(btn => { btn.style.backgroundColor = acc; });
    ruleInputs.forEach(inp => { inp.style.backgroundColor = bg; });
  }
  if(rule60 && rule30 && rule10) { rule60.addEventListener('input', updateRule); rule30.addEventListener('input', updateRule); rule10.addEventListener('input', updateRule); updateRule(); }
}

/* ===== CONTRASTE TOOL ORIGINAL ===== */
function hexToRgb(hex) {
  hex = hex.replace('#', '');
  if(hex.length===3) hex = hex.split('').map(c=>c+c).join('');
  return { r: parseInt(hex.substring(0,2),16), g: parseInt(hex.substring(2,4),16), b: parseInt(hex.substring(4,6),16) };
}
function relativeLuminance(rgb) {
  const toLinear = c => { let s=c/255; return s<=0.03928 ? s/12.92 : Math.pow((s+0.055)/1.055,2.4); };
  return 0.2126*toLinear(rgb.r) + 0.7152*toLinear(rgb.g) + 0.0722*toLinear(rgb.b);
}
function getContrastRatio(hex1, hex2) {
  let l1=relativeLuminance(hexToRgb(hex1)), l2=relativeLuminance(hexToRgb(hex2));
  let lighter=Math.max(l1,l2), darker=Math.min(l1,l2);
  return ((lighter+0.05)/(darker+0.05)).toFixed(2);
}
function updateContrastTool() {
  const bg=document.getElementById('bg-color').value, text=document.getElementById('text-color').value;
  document.getElementById('bg-hex').textContent=bg; document.getElementById('text-hex').textContent=text;
  const preview=document.getElementById('preview-box'); preview.style.backgroundColor=bg; preview.style.color=text;
  const ratio=parseFloat(getContrastRatio(bg,text));
  document.getElementById('ratio-num').textContent=ratio.toFixed(2);
  const checks={'badge-aa-normal':4.5,'badge-aa-large':3.0,'badge-aaa-normal':7.0,'badge-aaa-large':4.5};
  Object.entries(checks).forEach(([id,min])=>{
    let badge=document.getElementById(id); if(!badge) return;
    let pass=ratio>=min;
    badge.classList.toggle('pass',pass); badge.classList.toggle('fail',!pass);
    badge.querySelector('.badge-status').textContent=pass?'✓ Pasa':'✗ Falla';
  });
  document.getElementById('ratio-num').style.color = ratio>=7?'#22c55e': ratio>=4.5?'#4ade80': ratio>=3?'#f59e0b':'#ef4444';
}
function setPreset(bg,text) { document.getElementById('bg-color').value=bg; document.getElementById('text-color').value=text; updateContrastTool(); }
function initContrastTool() {
  if(contrastReady) return;
  contrastReady=true;
  document.getElementById('bg-color').addEventListener('input', updateContrastTool);
  document.getElementById('text-color').addEventListener('input', updateContrastTool);
  updateContrastTool();
}
function initContrastDemo() {
  const bgPicker = document.getElementById('bg-color');
  const textPicker = document.getElementById('text-color');
  const demoDiv = document.getElementById('contrast-demo-elements');
  if(bgPicker && textPicker && demoDiv) {
    function syncDemo() { demoDiv.style.backgroundColor = bgPicker.value; demoDiv.style.color = textPicker.value; }
    bgPicker.addEventListener('input', syncDemo);
    textPicker.addEventListener('input', syncDemo);
    syncDemo();
  }
}

/* ===== JERARQUÍA INTERACTIVA (BUENOS USOS) ===== */
function initHierarchyModule() {
  const primaryColor = document.getElementById('hierarchy-primary');
  const secondaryColor = document.getElementById('hierarchy-secondary');
  const ghostColor = document.getElementById('hierarchy-ghost');
  const btnPrimary = document.getElementById('hierarchy-btn-primary');
  const btnSecondary = document.getElementById('hierarchy-btn-secondary');
  const btnGhost = document.getElementById('hierarchy-btn-ghost');
  const extraBtn1 = document.getElementById('hierarchy-extra-btn1');
  const extraBtn2 = document.getElementById('hierarchy-extra-btn2');
  function updateHierarchy() {
    if(btnPrimary) btnPrimary.style.backgroundColor = primaryColor.value;
    if(btnSecondary) btnSecondary.style.backgroundColor = secondaryColor.value;
    if(btnGhost) { btnGhost.style.backgroundColor = 'transparent'; btnGhost.style.border = `1px solid ${ghostColor.value}`; btnGhost.style.color = ghostColor.value; }
    if(extraBtn1) extraBtn1.style.backgroundColor = primaryColor.value;
    if(extraBtn2) extraBtn2.style.backgroundColor = secondaryColor.value;
  }
  if(primaryColor && secondaryColor && ghostColor) {
    primaryColor.addEventListener('input', updateHierarchy);
    secondaryColor.addEventListener('input', updateHierarchy);
    ghostColor.addEventListener('input', updateHierarchy);
    updateHierarchy();
  }
}

/* ===== E-COMMERCE CTA ===== */
function initEcommerceCTA() {
  const ctaColor = document.getElementById('cta-color');
  const ctaTextColor = document.getElementById('cta-text-color');
  const ctaBtn = document.getElementById('demo-cta-btn');
  if(ctaColor && ctaTextColor && ctaBtn) {
    function updateCTA() { ctaBtn.style.backgroundColor = ctaColor.value; ctaBtn.style.color = ctaTextColor.value; }
    ctaColor.addEventListener('input', updateCTA);
    ctaTextColor.addEventListener('input', updateCTA);
    updateCTA();
  }
}

/* ===== PSICOLOGÍA (MARCA) ===== */
function initPsychoModule() {
  const psychoGrid = document.getElementById('psycho-colors');
  const psychoMsg = document.getElementById('psycho-message');
  if(psychoGrid && psychoGrid.children.length === 0) {
    const colors = [
      { name: 'Rojo', hex: '#ef4444', msg: '🔴 Rojo: alerta, error, pasión. En China: buena suerte.' },
      { name: 'Verde', hex: '#22c55e', msg: '🟢 Verde: éxito, confirmación, naturaleza.' },
      { name: 'Azul', hex: '#3b82f6', msg: '🔵 Azul: confianza, seguridad, profesionalismo.' },
      { name: 'Amarillo', hex: '#facc15', msg: '🟡 Amarillo: advertencia, optimismo. Alta luminosidad.' },
      { name: 'Naranja', hex: '#f97316', msg: '🟠 Naranja: energía, acción, creatividad.' },
      { name: 'Morado', hex: '#a855f7', msg: '🟣 Morado: lujo, creatividad, misterio.' },
      { name: 'Negro', hex: '#111111', msg: '⚫ Negro: elegancia, poder, sofisticación.' },
      { name: 'Blanco', hex: '#ffffff', msg: '⚪ Blanco: pureza, limpieza, minimalismo.' }
    ];
    colors.forEach(c => {
      const chip = document.createElement('div');
      chip.className = 'psycho-chip';
      chip.style.backgroundColor = c.hex;
      chip.style.border = c.name === 'Blanco' ? '1px solid #aaa' : 'none';
      chip.addEventListener('click', () => { if(psychoMsg) psychoMsg.innerHTML = c.msg; });
      psychoGrid.appendChild(chip);
    });
  }
}

/* ===== COMPARATOR ORIGINAL ===== */
const scenarios = {
  ecommerce: { bad: `<div style="background:#ff6600;padding:14px;border-radius:8px;margin-bottom:8px;"><div style="color:#ff0000;font-size:0.9rem;font-weight:800;">¡¡OFERTA ESPECIAL!!</div><div style="color:#ffff00;font-size:1.2rem;font-weight:900;">Laptop Gaming</div><div style="color:#00ff00;font-size:0.8rem;">Ahorra $500 hoy solamente</div><div style="background:#ff00ff;color:#00ffff;padding:8px 14px;border-radius:6px;display:inline-block;">COMPRAR AHORA</div></div><div style="display:flex;gap:6px;flex-wrap:wrap;"><span style="background:#ff0000;color:#ffff00;padding:4px 10px;border-radius:20px;">NUEVO</span><span style="background:#00cc00;color:#ff00ff;padding:4px 10px;border-radius:20px;">POPULAR</span><span style="background:#0000ff;color:#ff8800;padding:4px 10px;border-radius:20px;">TOP VENTAS</span></div><p style="color:#f87171;font-size:0.7rem;">❌ Demasiados colores, legibilidad baja</p>`,
    good: `<div style="background:#0f172a;padding:14px;border-radius:8px;"><div style="background:#f97316;color:#fff;display:inline-block;padding:3px 8px;border-radius:20px;margin-bottom:8px;">Oferta 48h</div><div style="color:#f1f5f9;font-size:1.1rem;font-weight:800;">Laptop Gaming Pro</div><div style="color:#94a3b8;font-size:0.8rem;">Ahorra $500</div><div><span style="color:#fff;font-size:1.3rem;font-weight:900;">$899</span><span style="color:#64748b;text-decoration:line-through;">$1,399</span></div><button style="background:#f97316;color:#fff;border:none;padding:10px;border-radius:8px;width:100%;">Agregar al Carrito</button></div><p style="color:#4ade80;font-size:0.7rem;">✓ Un solo acento, jerarquía clara</p>`,
    explanation: `<strong>E-commerce:</strong> El diseño incorrecto usa múltiples colores saturados creando caos. El correcto usa paleta oscura con único acento.`
  },
  dashboard: { bad: `<div style="background:#ffffff;padding:14px;"><div style="color:#aaaaaa;">Dashboard</div><div><div style="background:#f0f0f0;padding:10px;"><div style="color:#cccccc;">2.4K</div><div style="color:#dddddd;">Usuarios</div></div><div style="background:#f5f5f5;padding:10px;"><div style="color:#c8c8c8;">87%</div><div style="color:#d5d5d5;">Conversión</div></div></div><p style="color:#ef4444;">❌ Contraste bajo, ilegible</p></div>`,
    good: `<div style="background:#0f172a;padding:14px;"><div style="color:#f1f5f9;">Dashboard</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;"><div style="background:#1e293b;padding:10px;"><div style="color:#60a5fa;">2.4K</div><div style="color:#94a3b8;">Usuarios</div><div style="color:#4ade80;">↑ 12%</div></div><div style="background:#1e293b;padding:10px;"><div style="color:#a78bfa;">87%</div><div style="color:#94a3b8;">Conversión</div><div style="color:#f87171;">↓ 2.1%</div></div></div><p style="color:#4ade80;">✓ Contraste excelente</p></div>`,
    explanation: `<strong>Dashboard:</strong> El mal diseño usa grises claros sobre blanco (ratio 1.5:1). El correcto usa modo oscuro con buena legibilidad.`
  },
  login: { bad: `<div style="background:linear-gradient(135deg,#FF0080,#FF8C00);padding:20px;"><div style="color:#FF00FF;">Iniciar Sesión</div><input placeholder="Correo" readonly style="background:#FF4500;color:#FFFF00;"><input placeholder="Contraseña" readonly style="background:#8B00FF;color:#00FFFF;"><button style="background:#00FF00;color:#FF0000;">ENTRAR</button><p style="color:#000080;">❌ Sobrecarga de colores</p></div>`,
    good: `<div style="background:#fff;padding:20px;border-radius:12px;"><div style="color:#0f172a;font-size:1.1rem;">Bienvenido</div><input value="usuario@ejemplo.com" readonly style="background:#f8fafc;border:1px solid #e2e8f0;"><input value="●●●●●●" readonly style="background:#f8fafc;border:1px solid #e2e8f0;"><button style="background:#4f46e5;color:#fff;border:none;padding:11px;">Iniciar Sesión</button><p style="color:#22c55e;">✓ Limpio y funcional</p></div>`,
    explanation: `<strong>Login:</strong> El diseño incorrecto genera desconfianza. El correcto es neutro y profesional.`
  },
  alerts: { bad: `<div><div style="background:#ff0000;color:#fff;">Tu pago fue procesado exitosamente</div><div style="background:#00cc00;color:#fff;">Error: correo ya registrado</div><div style="background:#0000ff;color:#0000cc;">Info disponible</div><p style="color:#f87171;">❌ Semántica invertida</p></div>`,
    good: `<div><div style="background:#f0fdf4;border:1px solid #bbf7d0;padding:12px;"><span style="color:#16a34a;">✓</span> Pago Exitoso</div><div style="background:#fef2f2;border:1px solid #fecaca;padding:12px;"><span style="color:#dc2626;">✕</span> Error de Validación</div><div style="background:#fffbeb;border:1px solid #fde68a;padding:12px;"><span style="color:#d97706;">⚠</span> Advertencia</div><p style="color:#4ade80;">✓ Semántica correcta</p></div>`,
    explanation: `<strong>Alertas:</strong> El diseño incorrecto invierte significados (verde para error). El correcto sigue convenciones universales.`
  }
};
function setScenario(key) {
  document.querySelectorAll('.scenario-tab').forEach(t=>t.classList.remove('active'));
  let tab=document.getElementById('tab-'+key); if(tab) tab.classList.add('active');
  document.getElementById('panel-bad').innerHTML=scenarios[key].bad;
  document.getElementById('panel-good').innerHTML=scenarios[key].good;
  document.getElementById('scenario-explanation').innerHTML=scenarios[key].explanation;
}
function initComparator() {
  if(comparatorReady) return;
  comparatorReady=true;
  setScenario('ecommerce');
}
