/**** CONFIG: same origin avoids port/CORS mismatches ****/
const API_BASE = "http://localhost:5001"; // <-- YOUR CORRECT URL

/**** FETCH WRAPPER (single, with JWT) ****/
function getToken() { return localStorage.getItem('jwt'); }
function setToken(t) { localStorage.setItem('jwt', t); updateNav(); }
function clearToken() { localStorage.removeItem('jwt'); updateNav(); }

async function api(urlPath, opts = {}) {
  const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${urlPath}`, { ...opts, headers });
  const txt = await res.text();
  let data = null;
  try { data = txt ? JSON.parse(txt) : null; } catch { data = { message: txt }; }
  if (!res.ok) throw new Error((data && (data.message || data.msg)) || `HTTP ${res.status}`);
  return data;
}

/**** DOM ****/
const msgEl = document.getElementById('msg');
const navAuth = document.getElementById('nav-auth');
const navProfile = document.getElementById('nav-profile');
const navIngredients = document.getElementById('nav-ingredients');
const navRecipes = document.getElementById('nav-recipes');
const logoutBtn = document.getElementById('logoutBtn');

const authSection = document.getElementById('authSection');
const profileSection = document.getElementById('profileSection');
const ingredientsSection = document.getElementById('ingredientsSection');
const recipesSection = document.getElementById('recipesSection');

const registerForm = document.getElementById('registerForm');
const regUsername = document.getElementById('regUsername');
const regEmail = document.getElementById('regEmail');
const regPassword = document.getElementById('regPassword');

const loginForm = document.getElementById('loginForm');
const logEmail = document.getElementById('logEmail');
const logPassword = document.getElementById('logPassword');

const profileForm = document.getElementById('profileForm');
const dietaryPreferences = document.getElementById('dietaryPreferences');
const allergies = document.getElementById('allergies');
const profileData = document.getElementById('profileData');

const ingredientForm = document.getElementById('ingredientForm');
const ingName = document.getElementById('ingName');
const ingQty = document.getElementById('ingQty');
const ingUnit = document.getElementById('ingUnit');
const ingredientsList = document.getElementById('ingredientsList');

const recipeForm = document.getElementById('recipeForm');
const recTitle = document.getElementById('recTitle');
const recIngredients = document.getElementById('recIngredients');
const recInstructions = document.getElementById('recInstructions');
const recPrep = document.getElementById('recPrep');
const recCook = document.getElementById('recCook');
const recServings = document.getElementById('recServings');
const recipesList = document.getElementById('recipesList');

/* NEW: Generate Recipe DOM */
const genRecipeBtn = document.getElementById('genRecipeBtn');
const genRecipeResult = document.getElementById('genRecipeResult');

/**** UI HELPERS ****/
function show(sectionId) {
  [authSection, profileSection, ingredientsSection, recipesSection].forEach(s => s.classList.add('hidden'));
  document.getElementById(sectionId).classList.remove('hidden');
}
function showMsg(text, type = 'success') {
  msgEl.className = `msg ${type}`;
  msgEl.textContent = text || '';
}
function updateNav() {
  const authed = !!getToken();
  navProfile.classList.toggle('hidden', !authed);
  navIngredients.classList.toggle('hidden', !authed);
  navRecipes.classList.toggle('hidden', !authed);
  logoutBtn.classList.toggle('hidden', !authed);
}

/**** AUTH ****/
registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    const payload = { username: regUsername.value.trim(), email: regEmail.value.trim(), password: regPassword.value };
    const res = await api('/api/auth/register', { method: 'POST', body: JSON.stringify(payload) });
    if (!res || !res.token) throw new Error('No token returned from server');
    setToken(res.token);
    showMsg('Registered & logged in!', 'success');
    show('profileSection');
    await loadProfile();
  } catch (err) { showMsg(err.message, 'error'); }
});

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    const payload = { email: logEmail.value.trim(), password: logPassword.value };
    const res = await api('/api/auth/login', { method: 'POST', body: JSON.stringify(payload) });
    if (!res || !res.token) throw new Error('No token returned from server');
    setToken(res.token);
    show('profileSection');
    await loadProfile();
  } catch (err) { showMsg(err.message, 'error'); }
});

logoutBtn.addEventListener('click', () => {
  clearToken();
  show('authSection');
  showMsg('Logged out', 'success');
});

/**** PROFILE ****/
navProfile.addEventListener('click', async () => { show('profileSection'); await loadProfile(); });

async function loadProfile() {
  try {
    const user = await api('/api/auth/profile');
    profileData.innerHTML = `
      <div><strong>Username:</strong> ${user.username}</div>
      <div><strong>Email:</strong> ${user.email}</div>
      <div class="meta"><strong>Dietary:</strong> ${(user.dietaryPreferences || []).join(', ') || '—'}</div>
      <div class="meta"><strong>Allergies:</strong> ${(user.allergies || []).join(', ') || '—'}</div>
    `;
    dietaryPreferences.value = (user.dietaryPreferences || []).join(', ');
    allergies.value = (user.allergies || []).join(', ');
  } catch (err) { showMsg(err.message, 'error'); }
}

profileForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    const prefs = dietaryPreferences.value.split(',').map(s => s.trim()).filter(Boolean);
    const alls  = allergies.value.split(',').map(s => s.trim()).filter(Boolean);
    await api('/api/auth/profile', { method: 'PUT', body: JSON.stringify({ dietaryPreferences: prefs, allergies: alls }) });
    showMsg('Preferences saved', 'success');
    await loadProfile();
  } catch (err) { showMsg(err.message, 'error'); }
});

/**** INGREDIENTS ****/
navIngredients.addEventListener('click', async () => {
  show('ingredientsSection');
  genRecipeResult.classList.add('hidden'); // clear previous result view
  genRecipeResult.innerHTML = '';
  await refreshIngredients();
});

ingredientForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    const body = { name: ingName.value.trim(), quantity: ingQty.value.trim(), unit: ingUnit.value.trim() };
    await api('/api/ingredients', { method: 'POST', body: JSON.stringify(body) });
    ingName.value = ''; ingQty.value = ''; ingUnit.value = '';
    await refreshIngredients();
    showMsg('Ingredient added', 'success');
  } catch (err) { showMsg(err.message, 'error'); }
});

async function refreshIngredients() {
  try {
    const list = await api('/api/ingredients');
    ingredientsList.innerHTML = '';
    for (const item of list) {
      const li = document.createElement('li');
      li.className = 'item';
      li.innerHTML = `
        <div>
          <div><strong>${item.name}</strong></div>
          <div class="meta">${item.quantity || ''} ${item.unit || ''}</div>
        </div>
        <div>
          <button data-id="${item._id}" class="editIng">Edit</button>
          <button data-id="${item._id}" class="delIng btn-danger">Delete</button>
        </div>`;
      ingredientsList.appendChild(li);
    }
    ingredientsList.querySelectorAll('.delIng').forEach(btn => {
      btn.addEventListener('click', async () => {
        try { await api(`/api/ingredients/${btn.dataset.id}`, { method: 'DELETE' }); await refreshIngredients(); showMsg('Ingredient deleted', 'success'); }
        catch (err) { showMsg(err.message, 'error'); }
      });
    });
    ingredientsList.querySelectorAll('.editIng').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        const name = prompt('New name?'); if (name === null) return;
        const quantity = prompt('New quantity? (optional)'); if (quantity === null) return;
        const unit = prompt('New unit? (optional)'); if (unit === null) return;
        try { await api(`/api/ingredients/${id}`, { method: 'PUT', body: JSON.stringify({ name, quantity, unit }) }); await refreshIngredients(); showMsg('Ingredient updated', 'success'); }
        catch (err) { showMsg(err.message, 'error'); }
      });
    });
  } catch (err) { showMsg(err.message, 'error'); }
}

/**** RECIPES ****/
navRecipes.addEventListener('click', async () => { show('recipesSection'); await refreshRecipes(); });

recipeForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    let ingredients = [];
    const raw = recIngredients.value.trim();
    if (raw) { try { ingredients = JSON.parse(raw); } catch { throw new Error('Ingredients must be valid JSON (e.g. [{"name":"...","quantity":"2","unit":"pieces"}])'); } }
    const body = { title: recTitle.value.trim(), ingredients, instructions: recInstructions.value, prepTime: recPrep.value.trim(), cookTime: recCook.value.trim(), servings: recServings.value ? Number(recServings.value) : undefined };
    await api('/api/recipes', { method: 'POST', body: JSON.stringify(body) });
    recTitle.value = ''; recIngredients.value = ''; recInstructions.value = ''; recPrep.value = ''; recCook.value = ''; recServings.value = '';
    await refreshRecipes();
    showMsg('Recipe saved', 'success');
  } catch (err) { showMsg(err.message, 'error'); }
});

async function refreshRecipes() {
  try {
    const list = await api('/api/recipes');
    recipesList.innerHTML = '';
    for (const r of list) {
      const li = document.createElement('li'); li.className = 'item';
      li.innerHTML = `
        <div>
          <div><strong>${r.title}</strong></div>
          <div class="meta">${r.prepTime || ''} ${r.cookTime ? '• ' + r.cookTime : ''} ${r.servings ? '• serves ' + r.servings : ''}</div>
        </div>
        <div>
          <button data-id="${r._id}" class="viewRec">View</button>
          <button data-id="${r._id}" class="delRec btn-danger">Delete</button>
        </div>`;
      recipesList.appendChild(li);
    }
    recipesList.querySelectorAll('.viewRec').forEach(btn => {
      btn.addEventListener('click', async () => {
        try {
          const r = await api(`/api/recipes/${btn.dataset.id}`);
          alert(`Title: ${r.title}\n\nIngredients:\n` + (r.ingredients || []).map(i => `- ${i.quantity || ''} ${i.unit || ''} ${i.name}`).join('\n') + `\n\nInstructions:\n${r.instructions}`);
        } catch (err) { showMsg(err.message, 'error'); }
      });
    });
    recipesList.querySelectorAll('.delRec').forEach(btn => {
      btn.addEventListener('click', async () => {
        try { await api(`/api/recipes/${btn.dataset.id}`, { method: 'DELETE' }); await refreshRecipes(); showMsg('Recipe deleted', 'success'); }
        catch (err) { showMsg(err.message, 'error'); }
      });
    });
  } catch (err) { showMsg(err.message, 'error'); }
}

/**** ✨ NEW: Generate Recipe feature ****/

// Build an array of human-readable ingredient strings like "2 cups rice"
async function gatherIngredientStrings() {
  const items = await api('/api/ingredients'); // [{name, quantity, unit}, ...]
  return items.map(it => {
    const qty = (it.quantity || '').toString().trim();
    const unit = (it.unit || '').toString().trim();
    const parts = [qty, unit, it.name].filter(Boolean);
    return parts.join(' ').replace(/\s+/g, ' ').trim();
  });
}

// Load user prefs
async function loadPrefs() {
  const user = await api('/api/auth/profile');
  return {
    dietaryPreferences: Array.isArray(user.dietaryPreferences) ? user.dietaryPreferences : [],
    allergies: Array.isArray(user.allergies) ? user.allergies : [],
  };
}

// Parse the LLM text into fields; if parsing fails we return null to render <pre>
function parseRecipeText(text) {
  if (!text) return null;
  const grab = (label) => {
    const regex = new RegExp(`^${label}\\s*:(.*)$`, 'mi');
    const m = text.match(regex);
    return m ? m[1].trim() : '';
  };
  // Try to extract blocks
  const title = grab('Title');
  const prep = grab('Prep Time');
  const cook = grab('Cook Time');
  const servings = grab('Servings');

  // Ingredients & Instructions can be multi-line blocks following their labels
  const block = (label) => {
    const re = new RegExp(`${label}\\s*:\\s*([\\s\\S]*?)(?=^\\w[\\w\\s]*:\\s*|\\s*$)`, 'mi');
    const m = text.match(re);
    return m ? m[1].trim() : '';
  };
  const ingBlock = block('Ingredients');
  const insBlock = block('Instructions');

  // Heuristics to turn blocks into arrays
  const ingredients = ingBlock
    ? ingBlock.split(/\r?\n/).map(l => l.replace(/^\s*[-*\d.)\s]+/, '').trim()).filter(Boolean)
    : [];
  const instructions = insBlock
    ? insBlock.split(/\r?\n/).map(l => l.replace(/^\s*[-*\d.)\s]+/, '').trim()).filter(Boolean)
    : [];

  const hasCore = title || ingredients.length || instructions.length;
  if (!hasCore) return null;

  return { title, prepTime: prep, cookTime: cook, servings, ingredients, instructions };
}

function renderRecipeCard(parsed, raw) {
  genRecipeResult.classList.remove('hidden');
  if (!parsed) {
    genRecipeResult.innerHTML = `
      <h3 style="margin:0 0 8px;">Generated Recipe</h3>
      <pre style="white-space:pre-wrap;">${(raw || '').trim()}</pre>
    `;
    return;
  }
  const { title, prepTime, cookTime, servings, ingredients, instructions } = parsed;
  genRecipeResult.innerHTML = `
    <div style="background:#0b1220; border:1px solid #334155; border-radius:12px; padding:16px;">
      <h3 style="margin:0 0 6px;">${title || 'Generated Recipe'}</h3>
      <div class="meta">
        ${prepTime ? `Prep: ${prepTime}` : ''} ${cookTime ? `• Cook: ${cookTime}` : ''} ${servings ? `• Servings: ${servings}` : ''}
      </div>
      ${ingredients?.length ? `
        <h4 style="margin:12px 0 6px;">Ingredients</h4>
        <ul style="margin:0; padding-left:18px;">
          ${ingredients.map(i => `<li>${i}</li>`).join('')}
        </ul>` : ''
      }
      ${instructions?.length ? `
        <h4 style="margin:12px 0 6px;">Instructions</h4>
        <ol style="margin:0; padding-left:18px;">
          ${instructions.map(i => `<li>${i}</li>`).join('')}
        </ol>` : ''
      }
    </div>
  `;
}

async function handleGenerateRecipe() {
  try {
    genRecipeBtn.disabled = true;
    genRecipeBtn.textContent = 'Generating...';
    showMsg('', 'success');

    const [ingredientStrings, prefs] = await Promise.all([
      gatherIngredientStrings(),
      loadPrefs(),
    ]);

    if (!ingredientStrings.length) {
      throw new Error('Add some ingredients first.');
    }

    const payload = {
      ingredients: ingredientStrings, // array of strings for your server's prompt join(", ")
      dietaryPreferences: prefs.dietaryPreferences,
      allergies: prefs.allergies,
    };

    const data = await api('/api/ai/generate-recipe', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    const text = data?.result || '';
    const parsed = parseRecipeText(text);
    renderRecipeCard(parsed, text);
    showMsg('Recipe generated!', 'success');
  } catch (err) {
    renderRecipeCard(null, '');
    genRecipeResult.classList.add('hidden');
    showMsg(err.message, 'error');
  } finally {
    genRecipeBtn.disabled = false;
    genRecipeBtn.textContent = 'Generate Recipe';
  }
}

if (genRecipeBtn) {
  genRecipeBtn.addEventListener('click', handleGenerateRecipe);
}

/**** NAV ****/
navAuth.addEventListener('click', () => show('authSection'));

/**** INIT ****/
(function init() {
  console.log('script.js loaded, API_BASE =', API_BASE);
  updateNav();
  fetch(`${API_BASE}/health`).then(r => r.json()).then(
    () => showMsg('Connected to server', 'success'),
    () => showMsg('Cannot reach server. Check port & server.js', 'error')
  );
  if (getToken()) { show('profileSection'); loadProfile(); }
  else { show('authSection'); }
})();
