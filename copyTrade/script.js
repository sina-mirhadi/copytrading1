const DEMO_USER = "LM_5280";
const DEMO_PASS = "14tEj93";
const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const views = $$(".view");
const publicHeader = $("#siteHeader");
const footer = $("#siteFooter");
const nav = $("#mainNav");
const menuBtn = $("#mobileMenuBtn");
const toast = $("#toast");
let toastTimer;

function notify(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2800);
}
function loggedIn() { return sessionStorage.getItem("mn_demo_auth") === "yes"; }
function showView(id) {
  views.forEach(v => v.classList.toggle("active", v.id === id));
  const isDashboard = id === "dashboard" || id === "admin";
  publicHeader.style.display = isDashboard ? "none" : "";
  footer.style.display = isDashboard ? "none" : "";
  $$("#mainNav a").forEach(a => a.classList.toggle("active", a.dataset.nav === id));
  nav.classList.remove("open");
  menuBtn.setAttribute("aria-expanded", "false");
  window.scrollTo({top:0,behavior:"smooth"});
}
function route() {
  let id = location.hash.slice(1) || "home";
  if (id === "dashboard" && !loggedIn()) { location.hash = "login"; return; }
  if (id === "admin" && sessionStorage.getItem("mn_demo_admin") !== "yes") { location.hash = "login"; return; }
  if (id === "login" && loggedIn()) { location.hash = "dashboard"; return; }
  if (!["home","copytrade","about","faq","login","dashboard","admin"].includes(id)) id = "home";
  showView(id);
}
window.addEventListener("hashchange", route);
window.addEventListener("DOMContentLoaded", route);
menuBtn.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  menuBtn.setAttribute("aria-expanded", String(open));
});
$$("#mainNav a").forEach(a => a.addEventListener("click", () => nav.classList.remove("open")));

$("#loginForm").addEventListener("submit", e => {
  e.preventDefault();
  const u = $("#username").value.trim();
  const p = $("#password").value;
  if (u === DEMO_USER && p === DEMO_PASS) {
    sessionStorage.setItem("mn_demo_auth","yes");
    $("#loginError").textContent = "";
    e.target.reset();
    location.hash = "dashboard";
  } else {
    $("#loginError").textContent = "نام کاربری یا رمز عبور صحیح نیست.";
  }
});
$("#togglePassword").addEventListener("click", () => {
  const p = $("#password"); p.type = p.type === "password" ? "text" : "password";
});
function logout() {
  sessionStorage.removeItem("mn_demo_auth");
  sessionStorage.removeItem("mn_demo_admin");
  location.hash = "home";
  notify("از حساب کاربری خارج شدید.");
}
$("#sidebarLogout").addEventListener("click", logout);
$("#adminLogout").addEventListener("click", logout);

const panelNames = {
  overview:"داشبورد", courses:"دوره‌های من", live:"پخش زنده",
  app:"اپلیکیشن", support:"پشتیبانی", account:"حساب کاربری"
};
function openStudentPanel(name) {
  $$(".dash-panel").forEach(p => p.classList.toggle("active", p.id === `panel-${name}`));
  $$(".side-link").forEach(a => a.classList.toggle("selected", a.dataset.panel === name));
  $("#breadcrumbTitle").textContent = panelNames[name] || "داشبورد";
  $("#studentSidebar").classList.remove("open");
  window.scrollTo({top:0,behavior:"smooth"});
}
$$("[data-panel]").forEach(el => el.addEventListener("click", e => {
  e.preventDefault();
  openStudentPanel(el.dataset.panel);
}));
$("#dashMenuBtn").addEventListener("click", () => $("#studentSidebar").classList.toggle("open"));
document.addEventListener("click", e => {
  const sidebar = $("#studentSidebar");
  if (sidebar && sidebar.classList.contains("open") && !sidebar.contains(e.target) && !$("#dashMenuBtn").contains(e.target)) sidebar.classList.remove("open");
});

const now = new Date();
$("#year").textContent = now.getFullYear();
const faDate = new Intl.DateTimeFormat("fa-IR", {year:"numeric",month:"long",day:"numeric"});
$("#todayDate").textContent = faDate.format(now);
$("#welcomeDate").textContent = faDate.format(now);

const modal = $("#appModal");
function closeModal() { modal.classList.remove("open"); modal.setAttribute("aria-hidden","true"); }
function openModal() { modal.classList.add("open"); modal.setAttribute("aria-hidden","false"); }
$("#downloadAppBtn").addEventListener("click", () => { closeModal(); location.hash = "login"; });
$("#closeAppModal").addEventListener("click", closeModal);
$("#modalDone").addEventListener("click", () => { closeModal(); location.hash = "login"; });
modal.addEventListener("click", e => { if (e.target === modal) closeModal(); });
document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });

$("#chatForm").addEventListener("submit", e => {
  e.preventDefault();
  const input = $("#chatInput");
  const message = input.value.trim();
  if (!message) return;
  const bubble = document.createElement("div");
  bubble.className = "chat-bubble sent";
  const p = document.createElement("p");
  p.textContent = message;
  const time = document.createElement("small");
  time.textContent = "اکنون";
  bubble.append(p,time);
  $("#chatStream").append(bubble);
  input.value = "";
  $("#chatStream").scrollTop = $("#chatStream").scrollHeight;
});

function setAdminTab(name) {
  $$(".admin-panel").forEach(p => p.classList.toggle("active", p.id === `admin-${name}`));
  $$(".admin-tab").forEach(b => b.classList.toggle("active", b.dataset.admin === name));
  $$(".admin-sidebar [data-admin]").forEach(a => a.classList.toggle("selected", a.dataset.admin === name));
}
$$("[data-admin]").forEach(el => el.addEventListener("click", e => {
  e.preventDefault();
  setAdminTab(el.dataset.admin);
}));
$("#addUserBtn").addEventListener("click", () => notify("فرم ایجاد کاربر در نسخه متصل به سرور فعال می‌شود."));
$("#notificationBtn").addEventListener("click", () => notify("در حال حاضر اعلان جدیدی ندارید."));
$$("[data-demo-action]").forEach(btn => btn.addEventListener("click", () => notify(`${btn.dataset.demoAction}: این عملیات در نسخه نمایشی غیرفعال است.`)));

// Optional demo admin access: use ?admin-demo=1 only for preview; never use this as production authentication.
if (new URLSearchParams(location.search).get("admin-demo") === "1") {
  sessionStorage.setItem("mn_demo_admin","yes");
  sessionStorage.setItem("mn_demo_auth","yes");
  if (!location.hash) location.hash = "admin";
}
