// ── TAB SWITCHING ──
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', function () {
    const target = this.dataset.tab;
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    this.classList.add('active');
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.getElementById('tab-' + target).classList.add('active');
    document.getElementById('empty-state').style.display = 'flex';
    document.querySelectorAll('.results-block').forEach(r => r.classList.remove('visible'));
  });
});

// ── SHOW RESULTS ──
function showResults(type) {
  document.getElementById('empty-state').style.display = 'none';
  document.querySelectorAll('.results-block').forEach(r => r.classList.remove('visible'));
  document.getElementById('results-' + type).classList.add('visible');
  currentResultType = type;
  falsePositiveActive = false;
}

// ── ADVANCED OPTIONS ACCORDION ──
function toggleAdvanced(tab) {
  document.getElementById('adv-body-' + tab).classList.toggle('open');
  document.getElementById('chevron-' + tab).classList.toggle('open');
}

// ── STATE ──
let currentResultType = null;
let falsePositiveActive = false;

// ── EXPORTER PDF ──
function exportPDF() {
  window.print();
}

// ── COPIER LE RAPPORT ──
function copyReport() {
  if (!currentResultType) return;

  const reports = {
    email: `RAPPORT D'ANALYSE PHISHING — Safran Electronics & Defense
Analyste : Thomas Gaudin · SOC Fougères
Date : 29/06/2026 à 14:37
Type : Email

SCORE DE RISQUE : 73/100 — Risque ÉLEVÉ

INDICATEURS DÉTECTÉS
• Domaine expéditeur suspect (Critique) — update-secure.com ≠ safran-group.com
• URL de redirection externe (Critique) — safran-rh-portail.update-secure.com
• Urgence artificielle (Élevé) — "expire dans 24h", "accès révoqué"
• Domaine enregistré récemment (Élevé) — 12 jours
• SPF softfail (Modéré)
• DKIM absent (Modéré)
• Usurpation de marque (Élevé)

DOMAINE EXPÉDITEUR
• Domaine : update-secure.com
• Registrar : Namecheap, Inc.
• Création : 17/06/2026 (12 jours)
• IP : 185.220.101.47 — NL — Signalée AbuseIPDB

AUTHENTIFICATION
• SPF : Softfail (~all)
• DKIM : Absent
• DMARC : Absent
• Return-Path : Incohérent
• Reply-To : Domaine différent`,

    url: `RAPPORT D'ANALYSE PHISHING — Safran Electronics & Defense
Analyste : Thomas Gaudin · SOC Fougères
Date : 29/06/2026 à 14:39
Type : URL

SCORE DE RISQUE : 81/100 — Risque CRITIQUE

URL ANALYSÉE : http://safran-rh-portail.update-secure.com/login?token=a7f93k

INDICATEURS DÉTECTÉS
• Domaine non légitime (Critique) — update-secure.com ≠ safran-group.com
• Page de login clonée (Critique) — Formulaire POST vers collect.update-secure.com
• 3 redirections successives (Élevé)
• Token en paramètre GET (Modéré) — suivi de clic potentiel
• IP hébergeur signalée (Élevé) — AbuseIPDB score 94/100

CHAÎNE DE REDIRECTIONS
1. http://safran-rh-portail.update-secure.com/login?token=a7f93k → 301
2. https://cdn.update-secure.com/rh/init → 302
3. https://safran-rh-portail.update-secure.com/auth/login → 200 (page finale)

CERTIFICAT TLS
• Émetteur : Let's Encrypt R10
• CN : *.update-secure.com
• Évaluation : Valide mais suspect`,

    headers: `RAPPORT D'ANALYSE PHISHING — Safran Electronics & Defense
Analyste : Thomas Gaudin · SOC Fougères
Date : 29/06/2026 à 14:40
Type : En-têtes email

SCORE DE RISQUE : 68/100 — Risque ÉLEVÉ

AUTHENTIFICATION
• SPF : Softfail — v=spf1 include:_spf.update-secure.com ~all
• DKIM : Absent
• DMARC : Absent
• From vs Return-Path : Incohérent (Critique)
• Reply-To : recovery@update-secure.com ≠ expéditeur
• IP d'envoi : 185.220.101.47 — NL — Signalée

EN-TÊTES ANALYSÉS
• From : it-support@safran-group.update-secure.com — Suspect
• Return-Path : bounce@update-secure.com — Incohérent
• Reply-To : recovery@update-secure.com — Suspect
• X-Mailer : PHPMailer 6.8.0
• Message-ID : 20260629091430.1a2b3c@update-secure.com — Suspect`
  };

  const text = reports[currentResultType];
  if (!text) return;

  navigator.clipboard.writeText(text).then(() => {
    showToast('Rapport copié dans le presse-papier');
  }).catch(() => {
    // Fallback pour les navigateurs sans clipboard API
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showToast('Rapport copié dans le presse-papier');
  });
}

// ── MARQUER FAUX POSITIF ──
function markFalsePositive() {
  if (!currentResultType) return;

  const block = document.getElementById('results-' + currentResultType);
  if (!block) return;

  falsePositiveActive = !falsePositiveActive;

  const scoreNum = block.querySelector('.risk-number');
  const verdict = block.querySelector('.risk-verdict');
  const desc = block.querySelector('.risk-desc');
  const btn = block.querySelector('.btn-danger');
  const segments = block.querySelectorAll('.bar-seg');
  const cursor = block.querySelector('.bar-cursor');

  if (falsePositiveActive) {
    // Passer en faux positif — tout en vert
    scoreNum.style.color = 'var(--risk-low)';
    verdict.style.color = 'var(--risk-low)';
    verdict.textContent = 'FAUX POSITIF';
    desc.textContent = 'Cet élément a été marqué comme faux positif par Thomas Gaudin. Aucune action requise.';
    segments.forEach(s => {
      s.className = 'bar-seg';
      s.classList.add('empty');
    });
    // Juste 3 segments verts pour symboliser un score bas
    for (let i = 0; i < 3; i++) segments[i].classList.replace('empty', 'filled-low');
    if (cursor) { cursor.style.left = '15%'; cursor.style.background = 'var(--risk-low)'; }
    if (btn) btn.textContent = 'Annuler faux positif';
    showToast('Marqué comme faux positif');
  } else {
    // Restaurer l'état original
    location.reload();
  }
}

// ── IMPORTER .EML ──
function importEml() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.eml,.msg,.txt';
  input.onchange = function (e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (ev) {
      const content = ev.target.result;
      parseEml(content, file.name);
    };
    reader.readAsText(file);
  };
  input.click();
}

function parseEml(content, filename) {
  // Extraction basique des champs email
  const lines = content.split('\n');
  let subject = '', from = '', body = '', inBody = false;

  for (const line of lines) {
    if (line.trim() === '' && !inBody && from) { inBody = true; continue; }
    if (!inBody) {
      if (line.toLowerCase().startsWith('subject:')) subject = line.slice(8).trim();
      if (line.toLowerCase().startsWith('from:')) from = line.slice(5).trim();
    } else {
      body += line + '\n';
    }
  }

  // Pré-remplir les champs
  if (subject) document.getElementById('email-subject').value = subject;
  if (from) document.getElementById('email-sender').value = from;
  if (body.trim()) document.getElementById('email-body').value = body.trim();

  // Activer l'onglet email si pas déjà actif
  document.querySelector('[data-tab="email"]').click();

  showToast(`Fichier "${filename}" chargé`);
}

// ── TOAST NOTIFICATION ──
function showToast(message) {
  // Supprimer un toast existant
  const existing = document.getElementById('toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'toast';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    background: #1a1a1a;
    color: #fff;
    padding: 10px 20px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 600;
    z-index: 9999;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    animation: fadeInUp 0.2s ease;
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2800);
}

// ── CSS PRINT ──
// Injecté dynamiquement pour ne pas polluer style.css
const printStyle = document.createElement('style');
printStyle.textContent = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateX(-50%) translateY(8px); }
    to   { opacity: 1; transform: translateX(-50%) translateY(0); }
  }

  @media print {
    header, .breadcrumb, .panel-left, .panel-footer,
    .action-row, .advanced-toggle, .advanced-body { display: none !important; }
    main { display: block !important; }
    .panel-right { padding: 0 !important; overflow: visible !important; }
    .results-block { display: flex !important; }
    .score-card, .detail-card, .excerpt-card { break-inside: avoid; }
    body { background: white !important; font-size: 11px; }
    .risk-number { font-size: 36px !important; }
  }
`;
document.head.appendChild(printStyle);

