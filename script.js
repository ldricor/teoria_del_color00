/* ===== ROUTER Y FUNCIONES GLOBALES ===== */
const PAGES = ['home', 'principios', 'contraste', 'buenos', 'malos', 'ecommerce', 'comparador', 'marca', 'reglas'];
let currentPage = null;
let contrastReady = false;
let comparatorReady = false;

function navigate(pageId) {
  if (!PAGES.includes(pageId)) pageId = 'home';
  if (pageId === currentPage) return;
  if (currentPage) {
    const old = document.getElementById('page-' + currentPage);
    if (old) {
      old.classList.add('exit');
      setTimeout(() => {
        old.style.display = 'none';
        old.classList.remove('exit', 'active');
      }, 260);
    }
  }
  const next = document.getElementById('page-' + pageId);
  if (next) {
    next.style.display = 'flex';
    requestAnimationFrame(() => next.classList.add('active'));
    next.scrollTop = 0; // reiniciar scroll al inicio
  }
  currentPage = pageId;
  history.replaceState(null, '', '#' + pageId);
  document.querySelectorAll('.nav-link, .mob-link').forEach(link => {
    link.classList.toggle('nav-active', link.dataset.page === pageId);
  });
  document.getElementById('mobile-menu').classList.remove('open');

  // Inicializar módulos según página
  if (pageId === 'principios') initPrincipiosModules();
  if (pageId === 'contraste') {
    initContrastTool();
    initContrastDemo();
  }
  if (pageId === 'buenos') initHierarchyExtra();
  if (pageId === 'ecommerce') initEcommerceCTA();
  if (pageId === 'marca') initPsychoModule();
  if (pageId === 'comparador') initComparator();
}

document.querySelectorAll('.nav-link, .mob-link').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    navigate(link.dataset.page);
  });
});
window.addEventListener('hashchange', () => {
  navigate(location.hash.replace('#', '') || 'home');
});
navigate(location.hash.replace('#', '') || 'home');

function toggleMobileMenu() {
  document.getElementById('mobile-menu').classList.toggle('open');
}

/* ===== PRINCIPIOS: MÓDULOS INTERACTIVOS ===== */
function initPrincipiosModules() {
  // 1. Modelos RGB/HEX/HSL con demo que cambia de color
  const r = document.getElementById('mod-r');
  const g = document.getElementById('mod-g');
  const b = document.getElementById('mod-b');
  const preview = document.getElementById('mod-preview');
  const rgbSpan = document.getElementById('mod-rgb');
  const hexSpan = document.getElementById('mod-hex');
  const hslSpan = document.getElementById('mod-hsl');
  const demoArea = document.getElementById('mod-demo-area');
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
  }
  if(r && g && b) {
    r.addEventListener('input', updateRGB);
    g.addEventListener('input', updateRGB);
    b.addEventListener('input', updateRGB);
    updateRGB();
  }

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

  // 3. Armonías: generador de paleta y al hacer clic en un color, aplicarlo al demo
  const baseColor = document.getElementById('harmony-base');
  const harmonyType = document.getElementById('harmony-type');
  const paletteDiv = document.getElementById('harmony-palette');
  const harmonyDemoArea = document.getElementById('harmony-demo-area');
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
        if(harmonyDemoArea) {
          harmonyDemoArea.style.backgroundColor = col;
          // también cambiar color de los botones del demo para que contraste
          let btns = harmonyDemoArea.querySelectorAll('.demo-btn');
          btns.forEach(btn => btn.style.backgroundColor = col);
        }
      });
      paletteDiv.appendChild(swatch);
    });
  }
  if(baseColor && harmonyType) {
    baseColor.addEventListener('input', updateHarmony);
    harmonyType.addEventListener('change', updateHarmony);
    updateHarmony();
  }

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
  function updateRule() {
    let bg = rule60.value, sec = rule30.value, acc = rule10.value;
    if(ruleBody) ruleBody.style.backgroundColor = bg;
    if(ruleHeader) ruleHeader.style.backgroundColor = sec;
    if(ruleCta) ruleCta.style.backgroundColor = acc;
  }
  if(rule60 && rule30 && rule10) {
    rule60.addEventListener('input', updateRule);
    rule30.addEventListener('input', updateRule);
    rule10.addEventListener('input', updateRule);
    updateRule();
  }
}

/* ===== CONTRASTE ===== */
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
  let ratioEl=document.getElementById('ratio-num');
  ratioEl.style.color = ratio>=7?'#22c55e': ratio>=4.5?'#4ade80': ratio>=3?'#f59e0b':'#ef4444';
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
  const demoDiv = document.getElementById('contraste-demo-area');
  if(bgPicker && textPicker && demoDiv) {
    function syncDemo() { demoDiv.style.backgroundColor = bgPicker.value; demoDiv.style.color = textPicker.value; }
    bgPicker.addEventListener('input', syncDemo);
    textPicker.addEventListener('input', syncDemo);
    syncDemo();
  }
}

/* ===== BUENOS USOS: demo extra jerarquía ===== */
function initHierarchyExtra() {
  const pri = document.getElementById('hierarchy-pri');
  const sec = document.getElementById('hierarchy-sec');
  const textPri = document.getElementById('hierarchy-text-pri');
  const mainBtn = document.getElementById('hierarchy-test-btn');
  const secBtn = document.getElementById('hierarchy-test-sec');
  if(pri && sec && textPri && mainBtn && secBtn) {
    function update() {
      mainBtn.style.backgroundColor = pri.value;
      mainBtn.style.color = textPri.value;
      secBtn.style.backgroundColor = sec.value;
    }
    pri.addEventListener('input', update);
    sec.addEventListener('input', update);
    textPri.addEventListener('input', update);
    update();
  }
}

/* ===== E-COMMERCE CTA ===== */
function initEcommerceCTA() {
  const ctaColor = document.getElementById('ecom-cta-color');
  const ctaText = document.getElementById('ecom-cta-text');
  const ctaBtn = document.getElementById('ecom-cta-btn');
  if(ctaColor && ctaText && ctaBtn) {
    function update() { ctaBtn.style.backgroundColor = ctaColor.value; ctaBtn.style.color = ctaText.value; }
    ctaColor.addEventListener('input', update);
    ctaText.addEventListener('input', update);
    update();
  }
}

/* ===== MARCA: psicología ===== */
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

/* ===== COMPARADOR (scenarios) ===== */
const scenarios = {
  ecommerce: { bad: `<div style="background:#ff6600;padding:14px;border-radius:8px;"><div style="color:#ff0000;">¡OFERTA!</div><button style="background:#00ff00;color:#ff0000;">Comprar</button></div>`, good: `<div style="background:#0f172a;padding:14px;"><div style="color:#f97316;">Oferta</div><button style="background:#f97316;">Comprar</button></div>`, explanation: `Ejemplo de e-commerce.` },
  dashboard: { bad: `<div>Dashboard malo</div>`, good: `<div>Dashboard bueno</div>`, explanation: `Ejemplo de dashboard.` },
  login: { bad: `<div>Login malo</div>`, good: `<div>Login bueno</div>`, explanation: `Ejemplo de login.` },
  alerts: { bad: `<div>Alertas malas</div>`, good: `<div>Alertas buenas</div>`, explanation: `Ejemplo de alertas.` }
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
