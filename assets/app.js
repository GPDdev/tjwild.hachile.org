(() => {
  const doc = document.documentElement;
  const palette = window.matchMedia('(prefers-color-scheme: dark)');
  const toggle = document.querySelector('[data-theme-toggle]');
  const stored = () => { try { return localStorage.getItem('tjwild-theme'); } catch { return null; } };
  function applyTheme(value) {
    const dark = value === 'dark' || (value !== 'light' && palette.matches);
    doc.dataset.theme = dark ? 'dark' : 'light';
    toggle.setAttribute('aria-pressed', String(dark));
    toggle.title = dark ? '切换到亮色' : '切换到暗色';
  }
  applyTheme(stored());
  toggle.addEventListener('click', () => {
    const value = doc.dataset.theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('tjwild-theme', value); } catch {}
    applyTheme(value);
  });
  palette.addEventListener('change', () => applyTheme(stored()));
  const searchLink = document.querySelector('[data-search-link]');
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      const field = document.querySelector('#query');
      if (field) { field.focus(); field.select(); }
      else location.assign(searchLink.href);
    }
  });
  const form = document.querySelector('#filters');
  if (!form) return;
  const query = form.elements.q;
  const grade = form.elements.grade;
  const cards = Array.from(document.querySelectorAll('[data-index]'));
  const count = document.querySelector('#result-count');
  const empty = document.querySelector('#empty');
  const reset = document.querySelector('#clear-filters');
  const normalize = term => term.normalize('NFKC').toLocaleLowerCase().trim();
  function apply(updateURL) {
    const terms = normalize(query.value).split(/\s+/).filter(Boolean);
    let shown = 0;
    for (const card of cards) {
      const value = normalize(card.dataset.index);
      card.hidden = !(terms.every(t => value.includes(t)) && (!grade.value || card.dataset.grade === grade.value));
      if (!card.hidden) shown++;
    }
    count.textContent = '共 ' + shown + ' 篇';
    empty.hidden = shown !== 0;
    reset.hidden = !query.value && !grade.value;
    if (updateURL) {
      const url = new URL(location.href);
      for (const [key,value] of [['q',query.value.trim()],['grade',grade.value]]) {
        if (value) url.searchParams.set(key,value); else url.searchParams.delete(key);
      }
      history.replaceState(null,'',url);
    }
  }
  function restore() {
    const params = new URLSearchParams(location.search);
    query.value = params.get('q') || '';
    grade.value = params.get('grade') || '';
    apply(false);
  }
  form.addEventListener('input', () => apply(true));
  form.addEventListener('submit', e => { e.preventDefault(); apply(true); });
  reset.addEventListener('click', () => { form.reset(); apply(true); query.focus(); });
  window.addEventListener('popstate', restore);
  restore();
  if (location.hash === '#query') query.focus();
})();
