// Optional accounts via Supabase Auth: sign in, sign up, password reset, and progress sync.
// The app works fully without an account; signing in only adds sync across devices.
(function () {
  const A = { enabled: false, client: null, user: null, syncedAt: null, pending: null };
  window.TRA_AUTH = A;
  const PROVIDERS = [['google', 'Google'], ['github', 'GitHub']];
  const appUrl = () => `${location.origin}/app`;
  const el = id => document.getElementById(id);
  const say = (id, text, ok = false) => { const n = el(id); if (n) { n.textContent = text; n.className = ok ? 'auth-msg ok' : 'auth-msg'; } };
  const busy = (form, on) => form && form.querySelectorAll('button,input').forEach(x => { x.disabled = on; });
  // Generic wording so the form does not reveal which emails have accounts.
  const GENERIC = 'If that account exists, check your email for the next step.';

  function header() {
    const slot = el('accountSlot');
    if (!slot) return;
    if (!A.enabled) { slot.innerHTML = '<span class="local-label" title="Accounts are off on this server">Local only</span>'; return; }
    slot.innerHTML = A.user
      ? `<a class="button secondary small" href="#account">${esc(A.user.email || 'Account')}</a>`
      : '<a class="button secondary small" href="#login">Sign in</a>';
  }

  // ---- Market API: send the session token so the server can check access to keyed data sources.
  const baseFetch = window.fetch.bind(window);
  window.fetch = async (input, init = {}) => {
    const url = typeof input === 'string' ? input : input?.url || '';
    if (A.client && url.startsWith('/api/market')) {
      const { data } = await A.client.auth.getSession();
      const token = data?.session?.access_token;
      if (token) init = { ...init, headers: { ...(init.headers || {}), Authorization: `Bearer ${token}` } };
    }
    return baseFetch(input, init);
  };

  // ---- Progress sync (user_state table, owner-only by RLS).
  function cleanRemote(row) {
    // Remote data is untrusted input: same migration and validation as a backup file.
    const o = AcademyMath.migrateBackup({ version: row.version, data: row.state });
    if (!AcademyMath.validateBackup(o)) throw new Error('Saved progress failed validation');
    return AcademyMath.loadState({ getItem: () => JSON.stringify(o.data) }, KEY, initial);
  }
  const isFresh = s => !(s.read?.length || s.mastered?.length || s.journal?.length || s.paperTrades?.length || s.notes && Object.keys(s.notes).length);

  async function pull() {
    const { data, error } = await A.client.from('user_state').select('state,version,updated_at').eq('user_id', A.user.id).maybeSingle();
    if (error) throw error;
    if (!data) return push();
    if (JSON.stringify(data.state) === JSON.stringify(state)) { A.syncedAt = data.updated_at; return; }
    if (isFresh(state) || confirm('Your account has saved progress from another device. Load it here? Choose Cancel to keep this device\'s progress and upload it instead.')) {
      state = cleanRemote(data); save(); route(); A.syncedAt = data.updated_at; toast('Loaded your saved progress');
    } else await push();
  }
  async function push() {
    if (!A.user) return;
    const { data, error } = await A.client.from('user_state')
      .upsert({ user_id: A.user.id, state, version: AcademyMath.BACKUP_VERSION }, { onConflict: 'user_id' }).select('updated_at').single();
    if (error) throw error;
    A.syncedAt = data.updated_at;
  }
  window.TRA_onSave = () => {
    if (!A.user) return;
    clearTimeout(A.pending);
    A.pending = setTimeout(() => push().catch(() => toast('Progress saved on this device; account sync failed')), 2000);
  };

  // ---- Views
  const shell = (title, lede, body) => {
    app.innerHTML = `<div class="auth-wrap"><div class="card auth-card"><div class="eyebrow">Your account</div><h1>${title}</h1><p class="muted">${lede}</p>${body}</div></div>`;
  };
  const off = () => shell('Accounts are off', 'This server has no Supabase project configured, so everything stays in this browser. The app works fully without an account.', '<a class="button" href="#home">Go to the app</a>');
  const providerButtons = () => `<div class="auth-providers">${PROVIDERS.map(([id, name]) => `<button type="button" class="button secondary" onclick="TRA_AUTH.oauth('${id}')">Continue with ${name}</button>`).join('')}</div><div class="auth-or"><span>or</span></div>`;
  const pw = (id, label, auto) => `<label for="${id}">${label}</label><div class="pw-row"><input id="${id}" type="password" autocomplete="${auto}" minlength="10" required><button type="button" class="button secondary small" aria-controls="${id}" aria-pressed="false" onclick="TRA_AUTH.toggle('${id}',this)">Show</button></div>`;

  const views = {
    login() {
      if (!A.enabled) return off();
      if (A.user) return views.account();
      shell('Sign in', 'Sign in to sync your progress across devices.', `${providerButtons()}
        <form id="loginForm" class="auth-form" onsubmit="event.preventDefault();TRA_AUTH.signIn(this)" novalidate>
          <label for="authEmail">Email</label><input id="authEmail" type="email" autocomplete="email" required>
          ${pw('authPassword', 'Password', 'current-password')}
          <button class="button" type="submit">Sign in</button><p id="authMsg" class="auth-msg" role="status" aria-live="polite"></p>
        </form><p class="muted small"><a href="#reset">Forgot your password?</a> · New here? <a href="#signup">Create an account</a></p>`);
    },
    signup() {
      if (!A.enabled) return off();
      shell('Create an account', 'Free. Your progress syncs across devices. No broker, no real money.', `${providerButtons()}
        <form id="signupForm" class="auth-form" onsubmit="event.preventDefault();TRA_AUTH.signUp(this)" novalidate>
          <label for="authEmail">Email</label><input id="authEmail" type="email" autocomplete="email" required>
          ${pw('authPassword', 'Password (10+ characters, upper and lower case, a number)', 'new-password')}
          <button class="button" type="submit">Create account</button><p id="authMsg" class="auth-msg" role="status" aria-live="polite"></p>
        </form><p class="muted small">Already have an account? <a href="#login">Sign in</a></p>`);
    },
    reset() {
      if (!A.enabled) return off();
      shell('Reset your password', 'Enter your email and we will send a reset link.', `
        <form class="auth-form" onsubmit="event.preventDefault();TRA_AUTH.sendReset(this)" novalidate>
          <label for="authEmail">Email</label><input id="authEmail" type="email" autocomplete="email" required>
          <button class="button" type="submit">Send reset link</button><p id="authMsg" class="auth-msg" role="status" aria-live="polite"></p>
        </form><p class="muted small"><a href="#login">Back to sign in</a></p>`);
    },
    'new-password'() {
      if (!A.enabled) return off();
      shell('Choose a new password', 'You followed a reset link. Set a new password to finish.', `
        <form class="auth-form" onsubmit="event.preventDefault();TRA_AUTH.setPassword(this)" novalidate>
          ${pw('authPassword', 'New password', 'new-password')}
          <button class="button" type="submit">Save password</button><p id="authMsg" class="auth-msg" role="status" aria-live="polite"></p>
        </form>`);
    },
    account() {
      if (!A.enabled) return off();
      if (!A.user) return views.login();
      shell('Your account', `Signed in as ${esc(A.user.email || '')}.`, `
        <dl class="kv small"><dt>Progress sync</dt><dd>${A.syncedAt ? 'Synced ' + esc(new Date(A.syncedAt).toLocaleString()) : 'Not synced yet'}</dd></dl>
        <div class="actions"><button class="button secondary" onclick="TRA_AUTH.syncNow()">Sync now</button><button class="button" onclick="TRA_AUTH.signOut()">Sign out</button></div>
        <p class="muted small">Signing out keeps your progress on this device. To remove it from this browser, use Data &amp; settings.</p>`);
    }
  };
  window.AuthViews = views;

  // ---- Actions
  const validEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const strong = v => v.length >= 10 && /[a-z]/.test(v) && /[A-Z]/.test(v) && /\d/.test(v);
  A.toggle = (id, btn) => { const i = el(id); const show = i.type === 'password'; i.type = show ? 'text' : 'password'; btn.textContent = show ? 'Hide' : 'Show'; btn.setAttribute('aria-pressed', String(show)); };
  A.oauth = async provider => { const { error } = await A.client.auth.signInWithOAuth({ provider, options: { redirectTo: appUrl() } }); if (error) say('authMsg', 'Could not start sign-in. Try again.'); };
  A.signIn = async form => {
    const email = el('authEmail').value.trim(), password = el('authPassword').value;
    if (!validEmail(email) || !password) return say('authMsg', 'Enter your email and password.');
    busy(form, true); say('authMsg', 'Signing in…', true);
    const { error } = await A.client.auth.signInWithPassword({ email, password });
    busy(form, false);
    if (error) return say('authMsg', error.status === 429 ? 'Too many attempts. Wait a minute and try again.' : !error.status || /fetch/i.test(error.name || '') ? 'Could not reach the sign-in service. Check your connection and try again.' : 'Email or password is incorrect, or the email is not confirmed yet.');
    location.hash = '#home';
  };
  A.signUp = async form => {
    const email = el('authEmail').value.trim(), password = el('authPassword').value;
    if (!validEmail(email)) return say('authMsg', 'Enter a valid email address.');
    if (!strong(password)) return say('authMsg', 'Use at least 10 characters with upper and lower case letters and a number.');
    busy(form, true); say('authMsg', 'Creating your account…', true);
    const { error } = await A.client.auth.signUp({ email, password, options: { emailRedirectTo: appUrl() } });
    busy(form, false);
    if (error && error.status === 429) return say('authMsg', 'Too many attempts. Wait a minute and try again.');
    say('authMsg', 'Check your email to confirm your account, then sign in.', true);
  };
  A.sendReset = async form => {
    const email = el('authEmail').value.trim();
    if (!validEmail(email)) return say('authMsg', 'Enter a valid email address.');
    busy(form, true);
    await A.client.auth.resetPasswordForEmail(email, { redirectTo: appUrl() });
    busy(form, false); say('authMsg', GENERIC, true);
  };
  A.setPassword = async form => {
    const password = el('authPassword').value;
    if (!strong(password)) return say('authMsg', 'Use at least 10 characters with upper and lower case letters and a number.');
    busy(form, true);
    const { error } = await A.client.auth.updateUser({ password });
    busy(form, false);
    if (error) return say('authMsg', 'Could not update the password. Request a new reset link.');
    say('authMsg', 'Password updated. You are signed in.', true); setTimeout(() => { location.hash = '#home'; }, 1200);
  };
  A.signOut = async () => { await A.client.auth.signOut(); location.hash = '#home'; };
  A.syncNow = () => pull().then(() => { toast('Progress synced'); route(); }).catch(() => toast('Sync failed. Your progress is still saved on this device.'));

  // ---- Start
  A.ready = (async () => {
    try {
      const cfg = await (await baseFetch('/api/config', { cache: 'no-store' })).json();
      if (!cfg.auth || !window.supabase?.createClient) return;
      A.enabled = true;
      A.client = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseKey, { auth: { flowType: 'pkce', persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
      A.client.auth.onAuthStateChange((event, session) => {
        A.user = session?.user || null; header();
        if (event === 'PASSWORD_RECOVERY') location.hash = '#new-password';
        if (event === 'SIGNED_IN') pull().catch(() => toast('Signed in. Account sync is unavailable right now.'));
        if (event === 'SIGNED_OUT') A.syncedAt = null;
      });
      const { data } = await A.client.auth.getSession();
      A.user = data?.session?.user || null;
    } catch { A.enabled = false; } finally {
      header();
      // The first route ran before this script loaded; redraw if the URL points at an account page.
      if (Object.hasOwn(views, location.hash.slice(1).split('/')[0])) route();
    }
  })();
})();
