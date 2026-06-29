// ── TAB SWITCHING ──
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', function () {
    const target = this.dataset.tab;

    // Update tab active state
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    this.classList.add('active');

    // Update tab content panels
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.getElementById('tab-' + target).classList.add('active');

    // Reset results panel when switching tabs
    document.getElementById('empty-state').style.display = 'flex';
    document.querySelectorAll('.results-block').forEach(r => r.classList.remove('visible'));
  });
});

// ── SHOW RESULTS ──
function showResults(type) {
  document.getElementById('empty-state').style.display = 'none';
  document.querySelectorAll('.results-block').forEach(r => r.classList.remove('visible'));
  document.getElementById('results-' + type).classList.add('visible');
}

// ── ADVANCED OPTIONS ACCORDION ──
function toggleAdvanced(tab) {
  document.getElementById('adv-body-' + tab).classList.toggle('open');
  document.getElementById('chevron-' + tab).classList.toggle('open');
}
