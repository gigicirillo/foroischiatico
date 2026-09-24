(() => {
  'use strict';
  const one = s => document.querySelector(s);
  const all = s => [...document.querySelectorAll(s)];
  const toggle = one('.menu-toggle');
  const menu = one('#mobile-menu');
  const closeMenu = () => {
    menu.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Apri menu');
  };
  toggle?.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    menu.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Chiudi menu' : 'Apri menu');
  });
  menu?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menu && !menu.hidden) { closeMenu(); toggle.focus(); }
  });
  if (!one('.chapter')) {
    const updateHeader = () => one('.header')?.classList.toggle('scrolled', scrollY > 30);
    addEventListener('scroll', updateHeader, {passive:true});
    updateHeader();
  }
  if (one('#year')) one('#year').textContent = new Date().getFullYear();

  // No analytics or marketing are installed. This stores the technical notice preference only.
  const key = 'foroischiatico.cookie-preference.v1';
  const banner = one('#cookie-banner');
  const dialog = one('#cookie-dialog');
  let returnFocus;
  const readPreference = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(key));
      if (saved?.version === 1 && saved.mode === 'necessary' && saved.expires > Date.now()) return true;
      localStorage.removeItem(key);
    } catch (_) { /* Storage may be blocked; the site remains usable. */ }
    return false;
  };
  const savePreference = () => {
    const expires = new Date(); expires.setMonth(expires.getMonth() + 6);
    try { localStorage.setItem(key, JSON.stringify({version:1, mode:'necessary', expires:expires.getTime()})); }
    catch (_) { /* Dismiss for this page even if browser storage is unavailable. */ }
    banner.hidden = true;
  };
  const openSettings = e => {
    returnFocus = e.currentTarget;
    one('.cookie-status').textContent = '';
    if (!dialog.open) dialog.showModal();
  };
  all('.cookie-settings').forEach(button => button.addEventListener('click', openSettings));
  all('.cookie-necessary, .cookie-close').forEach(button => button.addEventListener('click', savePreference));
  one('.dialog-close')?.addEventListener('click', () => dialog.close());
  dialog?.addEventListener('close', () => returnFocus?.focus());
  one('.cookie-save')?.addEventListener('click', () => {savePreference(); dialog.close();});
  one('.cookie-reset')?.addEventListener('click', () => {
    try {localStorage.removeItem(key);} catch (_) {}
    one('.cookie-status').textContent = 'Preferenza cancellata. Alla chiusura di questo pannello, l’avviso sarà nuovamente visibile.';
    banner.hidden = false;
  });
  if (banner) banner.hidden = readPreference();

  const form = one('#contact-form');
  if (!form) return;
  const service = new URLSearchParams(location.search).get('servizio');
  const select = one('#service-select');
  if (service && [...select.options].some(option => option.value === service)) select.value = service;
  let prepared = '';
  const preview = one('#email-preview');
  const clearPreview = () => {preview.hidden = true; prepared = ''; one('#email-open').removeAttribute('href');};
  form.addEventListener('input', clearPreview);
  form.addEventListener('change', clearPreview);
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const values = new FormData(form);
    const value = name => String(values.get(name) || '').trim();
    for (const name of ['nome','messaggio']) {
      const field = form.elements.namedItem(name);
      field.setCustomValidity(value(name) ? '' : 'Compila questo campo.');
      if (!field.reportValidity()) {field.addEventListener('input',()=>field.setCustomValidity(''),{once:true});return;}
    }
    const subject = `Richiesta informazioni — ${value('servizio')}`;
    prepared = `Buongiorno Foro Ischiatico,\n\n${value('messaggio')}\n\nNome: ${value('nome')}\nEmail per la risposta: ${value('email')}\nTelefono: ${value('telefono') || 'Non indicato'}\nStudio preferito: ${value('studio')}\nServizio: ${value('servizio')}\n\nHo preso visione dell’informativa privacy del sito.\n`;
    one('#email-preview-text').textContent = prepared;
    one('#email-open').href = `mailto:fisioena@yahoo.it?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(prepared)}`;
    one('#email-status').textContent = '';
    preview.hidden = false;
    preview.focus({preventScroll:true});
    preview.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'center'});
  });
  one('#email-copy').addEventListener('click', async () => {
    try {await navigator.clipboard.writeText(prepared);one('#email-status').textContent='Messaggio copiato. Incollalo in una nuova email indirizzata a fisioena@yahoo.it e completa l’invio.';}
    catch (_) {one('#email-status').textContent='Non è stato possibile copiare automaticamente. Seleziona il testo della richiesta e copialo manualmente.';}
  });
})();
