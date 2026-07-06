// Password gate for Cobs on Tour. Light protection: keeps out casual visitors and
// crawlers. The password is stored only as a SHA-256 hash; entry is remembered per browser.
(function () {
  var KEY = 'cob-gate-v1';
  var HASH = '24ab3e4a84f66a352b1fda0d5198e12f4fa17294a4ec5105578c613aa4ecc0c5';

  try {
    if (localStorage.getItem(KEY) === HASH) return; // already unlocked on this browser
  } catch (e) { /* storage blocked — show the gate every time */ }

  // hide the page before first paint; the gate overlay carries its own visibility
  document.documentElement.style.visibility = 'hidden';

  function sha256Hex(text) {
    return crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)).then(function (buf) {
      return Array.from(new Uint8Array(buf)).map(function (b) { return b.toString(16).padStart(2, '0'); }).join('');
    });
  }

  function buildGate() {
    var gate = document.createElement('div');
    gate.id = 'cobGate';
    gate.style.cssText =
      'position:fixed;inset:0;z-index:99999;visibility:visible;display:flex;align-items:center;justify-content:center;' +
      'background:#f6f2ea;font-family:"Instrument Sans",system-ui,sans-serif;color:#2b2620;';
    gate.innerHTML =
      '<div style="max-width:340px;width:90%;text-align:center;">' +
      '<div style="height:8px;background:linear-gradient(180deg,#a4212e 0 62%,#c99a2e 62% 100%);margin-bottom:2rem;"></div>' +
      '<div style="font-family:\'Big Shoulders Display\',sans-serif;font-weight:800;font-size:3.2rem;line-height:.9;text-transform:uppercase;">Cobs<br>on Tour</div>' +
      '<p style="font-size:.85rem;color:#6b6156;margin:1rem 0 1.2rem;">Friends only — enter the password.</p>' +
      '<form id="cobGateForm" style="display:flex;gap:.4rem;">' +
      '<input id="cobGatePw" type="password" autocomplete="off" placeholder="Password" style="flex:1;padding:.6rem .7rem;border:1px solid rgba(43,38,32,.35);border-radius:2px;font-size:1rem;background:#fff;">' +
      '<button type="submit" style="font-family:\'Big Shoulders Display\',sans-serif;font-weight:700;text-transform:uppercase;letter-spacing:.08em;background:#a4212e;color:#f6f2ea;border:none;border-radius:2px;padding:.6rem 1rem;cursor:pointer;">Enter</button>' +
      '</form>' +
      '<p id="cobGateErr" style="font-size:.8rem;color:#a4212e;font-weight:600;min-height:1.2em;margin:.7rem 0 0;"></p>' +
      '</div>';
    document.documentElement.appendChild(gate);

    var form = gate.querySelector('#cobGateForm');
    var input = gate.querySelector('#cobGatePw');
    var err = gate.querySelector('#cobGateErr');
    input.focus();

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      sha256Hex(input.value.trim()).then(function (hex) {
        if (hex === HASH) {
          try { localStorage.setItem(KEY, HASH); } catch (e2) { /* session-only unlock */ }
          gate.remove();
          document.documentElement.style.visibility = '';
        } else {
          err.textContent = 'Not it — ask the group chat.';
          input.value = '';
          input.focus();
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildGate);
  } else {
    buildGate();
  }
})();
