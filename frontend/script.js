// Supabase configuration
const SUPABASE_URL = "https://ewhjwjtlonapmtvggpok.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_SEhtdPU0dfVLZuOf5dK59w_YTAPj3uE";

const { createClient } = supabase;
const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
let currentSession = null;

// Cleanup corrupted cache on initialization
function cleanupCache() {
  if (typeof window !== "undefined") {
    try {
      // Clear localStorage
      const lsKeys = Object.keys(localStorage);
      lsKeys.forEach((key) => {
        if (key.startsWith("sb-") || key.includes("supabase")) {
          localStorage.removeItem(key);
        }
      });

      // Clear sessionStorage
      const ssKeys = Object.keys(sessionStorage);
      ssKeys.forEach((key) => {
        if (key.startsWith("sb-") || key.includes("supabase")) {
          sessionStorage.removeItem(key);
        }
      });

      // Clear IndexedDB
      if (window.indexedDB) {
        indexedDB
          .databases?.()
          .then((dbs) => {
            dbs.forEach((db) => {
              if (db.name.includes("supabase") || db.name.includes("sb")) {
                indexedDB.deleteDatabase(db.name);
              }
            });
          })
          .catch(() => {});
      }
    } catch (e) {
      console.error("Cache cleanup error:", e);
    }
  }
}

// Authentication functions
async function login() {
  clearErrors();
  const { data, error } = await sb.auth.signInWithPassword({
    email: document.getElementById("email").value,
    password: document.getElementById("password").value,
  });
  if (error) {
    document.getElementById("authError").textContent = error.message;
    return;
  }
  clearInputs();
  showApp(data.session);
}

async function register() {
  clearErrors();
  const { data, error } = await sb.auth.signUp({
    email: document.getElementById("email").value,
    password: document.getElementById("password").value,
  });
  if (error) {
    document.getElementById("authError").textContent = error.message;
    return;
  }
  clearInputs();
  if (data.session) {
    showApp(data.session);
  } else {
    document.getElementById("authError").style.color = "#3ECF8E";
    document.getElementById("authError").textContent =
      "Registration successful! Please check your email to confirm your account.";
  }
}

async function loginWithGitHub() {
  const { error } = await sb.auth.signInWithOAuth({
    provider: "github",
    options: { redirectTo: window.location.href },
  });
  if (error) alert(error.message);
}

async function loginWithGoogle() {
  const { error } = await sb.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: window.location.href },
  });
  if (error) alert(error.message);
}

async function logout() {
  await sb.auth.signOut();
  currentSession = null;
  clearInputs();
  cleanupCache();
  document.getElementById("loginSection").style.display = "block";
  document.getElementById("appSection").style.display = "none";
}

// UI functions
function showApp(session) {
  currentSession = session;
  document.getElementById("loginSection").style.display = "none";
  document.getElementById("appSection").style.display = "block";
  document.getElementById("userEmail").textContent =
    session.user.email || session.user.id;

  // Get provider from identities array (most recent login)
  let provider = "email";
  if (session.user.identities && session.user.identities.length > 0) {
    const githubIdentity = session.user.identities.find(
      (id) => id.provider === "github",
    );
    if (githubIdentity) {
      provider = "github";
    } else if (session.user.identities[0]) {
      provider = session.user.identities[0].provider || "email";
    }
  }

  document.getElementById("userProvider").textContent = provider;
  document.getElementById("jwtToken").textContent = session.access_token;
  
  // Load notes
  listNotes();
}

function copyToken() {
  navigator.clipboard.writeText(currentSession.access_token);
  const msg = document.getElementById("copyMsg");
  msg.style.display = "block";
  setTimeout(() => (msg.style.display = "none"), 2000);
}

function clearErrors() {
  document.getElementById("authError").textContent = "";
  document.getElementById("authError").style.color = "#e53e3e";
}

// Clear input fields
function clearInputs() {
  document.getElementById("email").value = "";
  document.getElementById("password").value = "";
}

// Clear note form
function clearNoteForm() {
  document.getElementById("noteTitle").value = "";
  document.getElementById("noteContent").value = "";
  document.getElementById("noteError").textContent = "";
  document.getElementById("noteSuccess").style.display = "none";
}

// Notes CRUD operations
async function createNote() {
  const title = document.getElementById("noteTitle").value.trim();
  const content = document.getElementById("noteContent").value.trim();

  if (!title) {
    document.getElementById("noteError").textContent = "Title is required!";
    return;
  }

  try {
    const { error } = await sb.from("notes").insert({
      title,
      content,
      user_id: currentSession.user.id,
    });

    if (error) {
      document.getElementById("noteError").textContent = error.message;
      return;
    }

    clearNoteForm();
    document.getElementById("noteSuccess").style.display = "block";
    setTimeout(() => {
      document.getElementById("noteSuccess").style.display = "none";
      listNotes();
    }, 1500);
  } catch (error) {
    document.getElementById("noteError").textContent = error.message;
  }
}

async function listNotes() {
  const container = document.getElementById("notesList");
  container.innerHTML = '<div class="loading">Loading notes...</div>';

  try {
    const { data, error } = await sb
      .from("notes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      container.innerHTML = `<p class="error">Error loading notes: ${error.message}</p>`;
      return;
    }

    if (!data || data.length === 0) {
      container.innerHTML =
        '<p style="color: #999;">No notes yet. Create your first note!</p>';
      return;
    }

    container.innerHTML = data
      .map(
        (note) => `
      <div class="note-item">
        <h4>${escapeHtml(note.title)}</h4>
        <p>${escapeHtml(note.content || "(no content)")}</p>
        <div class="meta">Created: ${new Date(note.created_at).toLocaleDateString()}</div>
        <div class="note-actions">
          <button class="btn-purple btn-small" onclick="editNote('${note.id}', '${escapeHtml(note.title).replace(/'/g, "\\'")}', '${escapeHtml(note.content || "").replace(/'/g, "\\'")}')" >Edit</button>
          <button class="btn-red btn-small" onclick="deleteNote('${note.id}')">Delete</button>
        </div>
      </div>
    `,
      )
      .join("");
  } catch (error) {
    container.innerHTML = `<p class="error">Error: ${error.message}</p>`;
  }
}

async function editNote(id, title, content) {
  const newTitle = prompt("Edit note title:", title);
  if (newTitle === null) return;

  const newContent = prompt("Edit note content:", content);
  if (newContent === null) return;

  try {
    const { error } = await sb
      .from("notes")
      .update({
        title: newTitle || title,
        content: newContent || content,
      })
      .eq("id", id);

    if (error) {
      alert("Error updating note: " + error.message);
      return;
    }

    listNotes();
  } catch (error) {
    alert("Error: " + error.message);
  }
}

async function deleteNote(id) {
  if (!confirm("Are you sure you want to delete this note?")) return;

  try {
    const { error } = await sb.from("notes").delete().eq("id", id);

    if (error) {
      alert("Error deleting note: " + error.message);
      return;
    }

    listNotes();
  } catch (error) {
    alert("Error: " + error.message);
  }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

// Initialize app
function initializeApp() {
  cleanupCache();

  sb.auth.onAuthStateChange((event, session) => {
    if (session && !currentSession) showApp(session);
  });

  sb.auth.getSession().then(({ data: { session } }) => {
    if (session) showApp(session);
  });
}

// Start app on page load
window.addEventListener("DOMContentLoaded", initializeApp);
