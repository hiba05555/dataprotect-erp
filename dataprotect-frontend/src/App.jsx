import { useState, useEffect, useRef } from "react";

// ─── THEME ───────────────────────────────────────────────────────────────────
const T = {
  red: "#CC0000", darkred: "#990000", lightred: "#FF1A1A",
  navy: "#061E29", teal: "#1E5F74", sage: "#4E8A8A",
  dark: "#0A0A0A", dark2: "#111", dark3: "#1A1A1A",
  white: "#FFFFFF", light: "#F5F5F7", gray: "#888", lightgray: "#E5E5E5",
  success: "#1D9E75", warning: "#BA7517", danger: "#CC0000",
};

// ─── GLOBAL STYLES ───────────────────────────────────────────────────────────
const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body, #root { height: 100%; font-family: 'Inter', sans-serif; }
    body { background: ${T.dark}; color: ${T.white}; overflow: hidden; }
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(204,0,0,0.3); border-radius: 2px; }
    input, button { font-family: 'Inter', sans-serif; }
    @keyframes pulse { 0%,100%{opacity:.3;transform:scale(1)} 50%{opacity:.7;transform:scale(1.05)} }
    @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.2} }
    @keyframes fadeIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
    @keyframes slideIn { from{opacity:0;transform:translateX(-20px)} to{opacity:1;transform:translateX(0)} }
    @keyframes countUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
    @keyframes scan { 0%,100%{opacity:.2} 50%{opacity:.7} }
    @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
    @keyframes barGrow { from{width:0} to{width:var(--w)} }
    @keyframes glow { 0%{box-shadow:0 0 5px rgba(204,0,0,.3)} 100%{box-shadow:0 0 20px rgba(204,0,0,.6)} }
  `}</style>
);

// ─── PASSWORD STRENGTH ───────────────────────────────────────────────────────
function PasswordStrength({ password }) {
  if (!password) return null;
  const checks = [
    { label: '8+ caractères', ok: password.length >= 8 },
    { label: 'Majuscule', ok: /[A-Z]/.test(password) },
    { label: 'Minuscule', ok: /[a-z]/.test(password) },
    { label: 'Chiffre', ok: /[0-9]/.test(password) },
    { label: 'Caractère spécial', ok: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) },
  ];
  const score = checks.filter(c => c.ok).length;
  const levels = ['', 'Très faible', 'Faible', 'Moyen', 'Fort', 'Très fort'];
  const colors = ['', T.red, T.red, T.warning, T.success, T.success];
  return (
    <div style={{ marginTop:8, marginBottom:4 }}>
      <div style={{ display:'flex', gap:4, marginBottom:6 }}>
        {[1,2,3,4,5].map(i => (
          <div key={i} style={{ flex:1, height:4, borderRadius:2, background: i <= score ? colors[score] : '#e0e0e0', transition:'background .3s' }} />
        ))}
      </div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ fontSize:10, color: colors[score], fontWeight:500 }}>{levels[score]}</div>
        <div style={{ display:'flex', gap:8 }}>
          {checks.map(c => (
            <span key={c.label} style={{ fontSize:9, color: c.ok ? T.success : '#ccc', display:'flex', alignItems:'center', gap:2 }}>
              {c.ok ? '✓' : '○'} {c.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── ANIMATED COUNTER ────────────────────────────────────────────────────────
function AnimCounter({ to, duration = 1200, suffix = "" }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = to / (duration / 16);
    const t = setInterval(() => {
      start = Math.min(start + step, to);
      setVal(Math.round(start));
      if (start >= to) clearInterval(t);
    }, 16);
    return () => clearInterval(t);
  }, [to]);
  return <>{val.toLocaleString()}{suffix}</>;
}

// ─── LOGIN PAGE ───────────────────────────────────────────────────────────────
function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [remember, setRemember] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) { setError("Veuillez remplir tous les champs"); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || "Erreur de connexion");
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("mustChangePw", data.mustChangePassword ? "true" : "false");
      onLogin(data.user, data.token, data.mustChangePassword);
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  return (
    <div style={{ display:"flex", height:"100vh", position:"relative", overflow:"hidden", background: T.dark }}>
      {/* Fond animé gauche */}
      <div style={{ position:"absolute", inset:0, overflow:"hidden", zIndex:0 }}>
        {[{w:500,h:500,t:-150,l:-150,d:0},{w:300,h:300,t:50,l:60,d:1},{w:160,h:160,t:130,l:140,d:2}].map((c,i)=>(
          <div key={i} style={{ position:"absolute", width:c.w, height:c.h, top:c.t, left:c.l, borderRadius:"50%", border:`1px solid rgba(204,0,0,${0.1+i*0.05})`, animation:`pulse ${4+i}s ease-in-out infinite`, animationDelay:`${c.d}s` }} />
        ))}
        {[[180,80],[80,190],[300,320],[60,360],[320,60]].map(([t,l],i)=>(
          <div key={i} style={{ position:"absolute", top:t, left:l, width:i%2===0?5:3, height:i%2===0?5:3, borderRadius:"50%", background:`rgba(204,0,0,${0.4+i*0.1})`, animation:`blink ${1.5+i*0.4}s infinite`, animationDelay:`${i*0.3}s` }} />
        ))}
      </div>

      {/* Partie gauche — Branding */}
      <div style={{ width:"46%", display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center", padding:"40px", position:"relative", zIndex:1 }}>
        <div style={{ width:110, height:110, borderRadius:"50%", border:`1.5px solid rgba(204,0,0,0.35)`, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:28, animation:"pulse 3s ease-in-out infinite", position:"relative" }}>
          <div style={{ width:86, height:86, borderRadius:"50%", background:"rgba(255,255,255,0.04)", border:`1px solid rgba(204,0,0,0.25)`, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(204,0,0,0.85)" strokeWidth="1.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
        </div>

        <div style={{ fontFamily:"'Rajdhani',sans-serif", marginBottom:8, textAlign:"center" }}>
          <span style={{ fontSize:32, fontWeight:700, color:T.red, letterSpacing:2 }}>DATA</span>
          <span style={{ fontSize:32, fontWeight:700, color:T.white, letterSpacing:2 }}>PROTECT</span>
        </div>
        <div style={{ fontSize:12, color:"rgba(255,255,255,0.4)", letterSpacing:"0.05em", marginBottom:36 }}>
          Security is our <span style={{ color:"rgba(204,0,0,0.8)" }}>commitment</span>
        </div>

        {[0,1,2].map(i=>(
          <div key={i} style={{ height:1, width:`${140-i*20}px`, marginBottom:8, background:`linear-gradient(90deg,transparent,rgba(204,0,0,${0.3+i*0.1}),transparent)`, animation:`scan ${2+i*0.4}s ease-in-out infinite`, animationDelay:`${i*0.3}s` }} />
        ))}

        <div style={{ marginTop:28, background:"rgba(204,0,0,0.08)", border:"0.5px solid rgba(204,0,0,0.25)", borderRadius:20, padding:"6px 16px", fontSize:10, color:"rgba(255,255,255,0.45)", display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:6, height:6, borderRadius:"50%", background:"#1D9E75", animation:"blink 1.5s infinite" }} />
          Système opérationnel — Connexion sécurisée
        </div>

        <div style={{ marginTop:32, display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
          {[["247","Utilisateurs actifs"],["99.9%","Disponibilité"],["AES-256","Chiffrement"],["JWT","Authentification"]].map(([v,l])=>(
            <div key={l} style={{ background:"rgba(255,255,255,0.03)", border:"0.5px solid rgba(255,255,255,0.06)", borderRadius:10, padding:"10px 12px", textAlign:"center" }}>
              <div style={{ fontSize:14, fontWeight:600, color:T.red, fontFamily:"'Rajdhani',sans-serif" }}>{v}</div>
              <div style={{ fontSize:9, color:"rgba(255,255,255,0.35)", marginTop:2 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Card Login */}
      <div style={{ position:"absolute", right:0, top:0, bottom:0, width:"54%", background:T.white, borderRadius:"0", display:"flex", flexDirection:"column", justifyContent:"center", padding:"44px 52px", boxShadow:"-30px 0 80px rgba(0,0,0,0.6)", animation:"slideIn .5s ease" }}>
        <div style={{ width:60, height:60, borderRadius:"50%", background:"#f0f0f0", border:"2px solid #e0e0e0", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:24 }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.5">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
        </div>

        <div style={{ fontSize:26, fontWeight:500, color:T.dark, marginBottom:4 }}>Bon retour <span style={{color:T.red}}>.</span></div>
        <div style={{ fontSize:12, color:T.gray, marginBottom:32, lineHeight:1.6 }}>Connectez-vous à votre espace de travail sécurisé</div>

        {[
          { label:"Identifiant", type:"email", val:email, set:setEmail, ph:"votre.email@dataprotect.ma",
            icon:<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>, icon2:<circle cx="12" cy="7" r="4"/> },
          { label:"Mot de passe", type:"password", val:password, set:setPassword, ph:"••••••••",
            icon:<rect x="3" y="11" width="18" height="11" rx="2"/>, icon2:<path d="M7 11V7a5 5 0 0 1 10 0v4"/> },
        ].map(f => (
          <div key={f.label} style={{ marginBottom:16 }}>
            <label style={{ display:"block", fontSize:10, fontWeight:600, color:"#555", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.07em" }}>{f.label}</label>
            <div style={{ display:"flex", alignItems:"center", border:"1px solid #e0e0e0", borderRadius:10, background:"#fafafa", transition:"all .2s", overflow:"hidden" }}
              onFocus={e=>e.currentTarget.style.borderColor=T.red}
              onBlur={e=>e.currentTarget.style.borderColor="#e0e0e0"}>
              <div style={{ padding:"0 12px", color:"#bbb" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {f.icon}{f.icon2}
                </svg>
              </div>
              <input type={f.type} value={f.val} onChange={e=>f.set(e.target.value)}
                placeholder={f.ph} onKeyDown={e=>e.key==="Enter"&&handleLogin()}
                style={{ flex:1, padding:"12px 12px 12px 0", border:"none", background:"transparent", fontSize:13, color:T.dark, outline:"none" }} />
            </div>
          </div>
        ))}

        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
          <label style={{ display:"flex", alignItems:"center", gap:6, fontSize:11, color:T.gray, cursor:"pointer" }}>
            <input type="checkbox" checked={remember} onChange={e=>setRemember(e.target.checked)} style={{ accentColor:T.red }} />
            Se souvenir de moi
          </label>
          <span style={{ fontSize:11, color:T.red, cursor:"pointer" }}>Mot de passe oublié ?</span>
        </div>

        {error && <div style={{ background:"#fff0f0", border:"0.5px solid rgba(204,0,0,0.3)", borderRadius:8, padding:"10px 14px", fontSize:12, color:T.red, marginBottom:16 }}>{error}</div>}

        <button onClick={handleLogin} disabled={loading}
          style={{ width:"100%", padding:14, background:loading?"#999":T.red, color:T.white, border:"none", borderRadius:10, fontSize:14, fontWeight:600, fontFamily:"'Rajdhani',sans-serif", letterSpacing:"0.1em", cursor:loading?"not-allowed":"pointer", transition:"all .2s" }}>
          {loading ? "CONNEXION..." : "LOGIN"}
        </button>

        <div style={{ display:"flex", justifyContent:"center", gap:6, marginTop:20 }}>
          {[true,false,false].map((a,i)=>(
            <div key={i} style={{ height:6, width:a?18:6, borderRadius:3, background:a?T.red:"#e0e0e0", transition:"all .3s" }} />
          ))}
        </div>

        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10, marginTop:16, fontSize:10, color:"#bbb" }}>
          {["DataProtect © 2026","Chiffré AES-256","JWT Sécurisé"].map((t,i)=>(
            <span key={i} style={{ display:"flex", alignItems:"center", gap:8 }}>
              {i>0 && <span style={{ width:3, height:3, borderRadius:"50%", background:"#ddd", display:"inline-block" }} />}
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── SIDEBAR ─────────────────────────────────────────────────────────────────
const MENU = {
  admin: [
    { id:"dashboard", label:"Dashboard", icon:"grid" },
    { id:"hr", label:"Ressources Humaines", icon:"users", badge:12 },
    { id:"it", label:"Informatique", icon:"monitor", badge:5 },
    { id:"finance", label:"Finance", icon:"dollar" },
    { id:"operations", label:"Opérations", icon:"box" },
    { id:"users", label:"Utilisateurs", icon:"user-plus" },
  ],
  employee: [
    { id:"home", label:"Accueil", icon:"home" },
    { id:"tickets", label:"Mes tickets", icon:"help-circle", badge:2 },
    { id:"leave", label:"Congés", icon:"calendar" },
    { id:"profile", label:"Mon profil", icon:"user" },
  ],
};

function Icon({ name, size=16, color="currentColor" }) {
  const icons = {
    grid: <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></>,
    users: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
    monitor: <><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></>,
    dollar: <><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></>,
    box: <><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></>,
    "user-plus": <><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></>,
    home: <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>,
    "help-circle": <><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></>,
    calendar: <><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>,
    user: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
    bell: <><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></>,
    logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>,
    plus: <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
    check: <polyline points="20 6 9 13.5 4 8.5"/>,
    clock: <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
    "trending-up": <><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></>,
    "alert-circle": <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>,
    search: <><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>,
    menu: <><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {icons[name]}
    </svg>
  );
}




function Sidebar({ user, active, setActive, onLogout, collapsed, setCollapsed }) {
  const role = user?.role === "admin" ? "admin" : "employee";
  const menu = MENU[role];
  return (
    <div style={{ width:collapsed?64:220, background:T.navy, display:"flex", flexDirection:"column", borderRight:`0.5px solid rgba(255,255,255,0.06)`, flexShrink:0, transition:"width .25s ease", overflow:"hidden" }}>
      {/* Logo + hamburger */}
      <div style={{ padding:"16px 14px", borderBottom:"0.5px solid rgba(255,255,255,0.06)", display:"flex", alignItems:"center", justifyContent:"space-between", minHeight:56 }}>
        {!collapsed && (
          <div style={{ fontFamily:"'Rajdhani',sans-serif", fontSize:15, fontWeight:700, letterSpacing:1, whiteSpace:"nowrap" }}>
            <span style={{ color:T.red }}>DATA</span><span style={{ color:T.white }}>PROTECT</span>
          </div>
        )}
        <button onClick={()=>setCollapsed(!collapsed)}
          style={{ background:"transparent", border:"none", cursor:"pointer", padding:4, display:"flex", alignItems:"center", justifyContent:"center", color:"rgba(255,255,255,0.5)", marginLeft:collapsed?"auto":0, flexShrink:0 }}>
          <Icon name="menu" size={18} color="rgba(255,255,255,0.5)"/>
        </button>
      </div>
      {!collapsed && (
        <div style={{ padding:"6px 18px 4px", fontSize:9, fontWeight:500, color:"rgba(255,255,255,0.3)", textTransform:"uppercase", letterSpacing:"0.08em", marginTop:8 }}>
          {role === "admin" ? "Administration" : "Portail Employé"}
        </div>
      )}

      {/* Nav */}
      <nav style={{ flex:1, padding:"8px 0", overflowY:"auto" }}>
        {menu.map(item => (
          <div key={item.id} onClick={()=>setActive(item.id)}
            title={collapsed ? item.label : ""}
            style={{ display:"flex", alignItems:"center", gap:collapsed?0:10, padding:collapsed?"10px 0":"10px 18px", justifyContent:collapsed?"center":"flex-start", fontSize:12, color:active===item.id?"#fff":"rgba(255,255,255,0.5)", background:active===item.id?"rgba(204,0,0,0.12)":"transparent", borderLeft:`3px solid ${active===item.id?T.red:"transparent"}`, cursor:"pointer", transition:"all .15s", position:"relative" }}>
            <Icon name={item.icon} size={15} color={active===item.id?T.red:"rgba(255,255,255,0.4)"} />
            {!collapsed && item.label}
            {!collapsed && item.badge && <span style={{ marginLeft:"auto", background:T.red, color:"#fff", fontSize:9, padding:"2px 6px", borderRadius:10 }}>{item.badge}</span>}
            {collapsed && item.badge && <span style={{ position:"absolute", top:6, right:8, width:8, height:8, borderRadius:"50%", background:T.red }} />}
          </div>
        ))}
      </nav>

      {/* User bottom */}
      <div style={{ padding:"14px", borderTop:"0.5px solid rgba(255,255,255,0.06)" }}>
        {!collapsed && (
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
            <div style={{ width:30, height:30, borderRadius:"50%", background:T.red, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:600, color:"#fff", flexShrink:0 }}>
              {user?.username?.[0]?.toUpperCase() || "U"}
            </div>
            <div style={{ minWidth:0 }}>
              <div style={{ fontSize:11, fontWeight:500, color:"#fff", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user?.username}</div>
              <div style={{ fontSize:9, color:"rgba(255,255,255,0.35)" }}>{user?.department}</div>
            </div>
          </div>
        )}
        <button onClick={onLogout}
          title={collapsed?"Déconnexion":""}
          style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:collapsed?"center":"flex-start", gap:8, padding:"7px 10px", background:"rgba(204,0,0,0.1)", border:"0.5px solid rgba(204,0,0,0.2)", borderRadius:8, color:"rgba(255,255,255,0.5)", fontSize:11, cursor:"pointer" }}>
          <Icon name="logout" size={13} color="rgba(204,0,0,0.6)" />
          {!collapsed && "Déconnexion"}
        </button>
      </div>
    </div>
  );
}

// ─── TOPBAR ──────────────────────────────────────────────────────────────────
function Topbar({ title, user }) {
  return (
    <div style={{ background:T.white, padding:"0 24px", height:56, display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:"0.5px solid #e8e8e8", flexShrink:0 }}>
      <div style={{ fontSize:15, fontWeight:500, color:T.navy }}>{title}</div>
      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
        <div style={{ position:"relative", cursor:"pointer" }}>
          <Icon name="bell" size={18} color={T.gray} />
          <div style={{ position:"absolute", top:0, right:0, width:7, height:7, borderRadius:"50%", background:T.red, border:"1.5px solid #fff" }} />
        </div>
        <div style={{ width:32, height:32, borderRadius:"50%", background:T.red, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:600, color:"#fff" }}>
          {user?.username?.[0]?.toUpperCase() || "U"}
        </div>
      </div>
    </div>
  );
}

// ─── STAT CARD ───────────────────────────────────────────────────────────────
function StatCard({ label, value, trend, trendUp, icon, color, delay=0 }) {
  return (
    <div style={{ background:T.white, borderRadius:12, padding:18, border:`0.5px solid #ebebeb`, animation:`fadeIn .5s ease ${delay}s both`, transition:"transform .2s", cursor:"default" }}
      onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"}
      onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
        <div style={{ width:36, height:36, borderRadius:10, background:`${color}15`, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <Icon name={icon} size={17} color={color} />
        </div>
        {trend && <span style={{ fontSize:10, fontWeight:500, padding:"3px 8px", borderRadius:20, background:trendUp?"#e1f5ee":"#fff0f0", color:trendUp?T.success:T.danger }}>{trend}</span>}
      </div>
      <div style={{ fontSize:26, fontWeight:600, color:T.navy, fontFamily:"'Rajdhani',sans-serif" }}>
        <AnimCounter to={typeof value==="number"?value:0} />
        {typeof value==="string" && value}
      </div>
      <div style={{ fontSize:11, color:T.gray, marginTop:4 }}>{label}</div>
    </div>
  );
}

// ─── ADMIN DASHBOARD ─────────────────────────────────────────────────────────
function AdminDashboard() {
  const stats = [
    { label:"Employés actifs", value:247, trend:"+8%", trendUp:true, icon:"users", color:T.teal, delay:0 },
    { label:"Tickets ouverts", value:18, trend:"+3", trendUp:false, icon:"help-circle", color:T.red, delay:.1 },
    { label:"Budget restant (k MAD)", value:342, trend:"-2%", trendUp:false, icon:"dollar", color:T.warning, delay:.2 },
    { label:"Projets actifs", value:12, trend:"+12%", trendUp:true, icon:"box", color:T.success, delay:.3 },
  ];
  const bars = [["HR",75,T.teal],["Finance",55,T.red],["IT",88,T.sage],["Ops",62,T.warning],["Admin",40,T.gray]];
  const recent = [
    { user:"Hiba C.", action:"Ticket créé", dept:"IT", time:"Il y a 5 min", status:"open" },
    { user:"Ahmed M.", action:"Congé approuvé", dept:"HR", time:"Il y a 23 min", status:"done" },
    { user:"Sara B.", action:"Facture soumise", dept:"Finance", time:"Il y a 1h", status:"pending" },
    { user:"Karim D.", action:"Compte créé", dept:"IT", time:"Il y a 2h", status:"done" },
    { user:"Leila N.", action:"Rapport généré", dept:"Finance", time:"Il y a 3h", status:"done" },
  ];
  return (
    <div style={{ padding:24, overflowY:"auto", height:"100%", background:"#f5f5f7" }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:20 }}>
        {stats.map(s=><StatCard key={s.label} {...s} />)}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1.6fr 1fr", gap:14, marginBottom:20 }}>
        <div style={{ background:T.white, borderRadius:12, padding:18, border:"0.5px solid #ebebeb" }}>
          <div style={{ fontSize:12, fontWeight:500, color:T.navy, marginBottom:16 }}>Activité par département</div>
          <div style={{ display:"flex", alignItems:"flex-end", gap:12, height:100 }}>
            {bars.map(([l,v,c])=>(
              <div key={l} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
                <div style={{ width:"100%", borderRadius:"4px 4px 0 0", background:c, opacity:.85, transition:"height 1s ease", height:`${v}%` }} />
                <div style={{ fontSize:9, color:T.gray }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ background:T.white, borderRadius:12, padding:18, border:"0.5px solid #ebebeb" }}>
          <div style={{ fontSize:12, fontWeight:500, color:T.navy, marginBottom:16 }}>Statut des tickets</div>
          {[["Ouverts",35,T.red],["En cours",45,T.teal],["Résolus",20,T.success]].map(([l,v,c])=>(
            <div key={l} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
              <div style={{ width:8, height:8, borderRadius:"50%", background:c, flexShrink:0 }} />
              <div style={{ fontSize:11, color:T.gray, flex:1 }}>{l}</div>
              <div style={{ flex:2, height:6, borderRadius:3, background:"#f0f0f0", overflow:"hidden" }}>
                <div style={{ height:"100%", borderRadius:3, background:c, width:`${v}%`, transition:"width 1s ease" }} />
              </div>
              <div style={{ fontSize:11, fontWeight:500, color:T.navy, width:28, textAlign:"right" }}>{v}%</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ background:T.white, borderRadius:12, border:"0.5px solid #ebebeb", overflow:"hidden" }}>
        <div style={{ padding:"14px 18px", borderBottom:"0.5px solid #f0f0f0", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ fontSize:12, fontWeight:500, color:T.navy }}>Activité récente</div>
        </div>
        {recent.map((r,i)=>(
          <div key={i} style={{ display:"flex", alignItems:"center", padding:"12px 18px", borderBottom:"0.5px solid #f9f9f9", gap:12, animation:`fadeIn .3s ease ${i*.08}s both` }}>
            <div style={{ width:32, height:32, borderRadius:"50%", background:`${T.red}15`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:600, color:T.red, flexShrink:0 }}>
              {r.user[0]}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:12, color:T.navy, fontWeight:500 }}>{r.user} <span style={{ fontWeight:400, color:T.gray }}>— {r.action}</span></div>
              <div style={{ fontSize:10, color:T.gray, marginTop:2 }}>{r.dept} · {r.time}</div>
            </div>
            <span style={{ fontSize:10, padding:"3px 10px", borderRadius:20, fontWeight:500,
              background:r.status==="open"?"#fff0f0":r.status==="done"?"#e1f5ee":"#faeeda",
              color:r.status==="open"?T.red:r.status==="done"?T.success:T.warning }}>
              {r.status==="open"?"Ouvert":r.status==="done"?"Fait":"En cours"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── HR MODULE ───────────────────────────────────────────────────────────────
function HRModule({ token }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ first_name:"", last_name:"", email:"", department:"", position:"", hire_date:"" });

  useEffect(()=>{ fetchEmployees(); }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const r = await fetch("http://localhost/api/hr/employees", { headers:{ Authorization:`Bearer ${token}` } });
      const d = await r.json();
      setEmployees(d.data || []);
    } catch {}
    setLoading(false);
  };

  const createEmployee = async () => {
    if (!form.first_name || !form.email || !form.hire_date) return;
    await fetch("http://localhost/api/hr/employees", {
      method:"POST", headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token}` },
      body: JSON.stringify(form)
    });
    setShowForm(false); setForm({ first_name:"", last_name:"", email:"", department:"", position:"", hire_date:"" });
    fetchEmployees();
  };

  return (
    <div style={{ padding:24, overflowY:"auto", height:"100%", background:"#f5f5f7" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <div>
          <div style={{ fontSize:16, fontWeight:500, color:T.navy }}>Ressources Humaines</div>
          <div style={{ fontSize:11, color:T.gray, marginTop:2 }}>{employees.length} employé(s) enregistré(s)</div>
        </div>
        <button onClick={()=>setShowForm(!showForm)} style={{ display:"flex", alignItems:"center", gap:6, padding:"9px 16px", background:T.red, color:"#fff", border:"none", borderRadius:8, fontSize:12, fontWeight:500, cursor:"pointer" }}>
          <Icon name="plus" size={14} color="#fff" /> Nouvel employé
        </button>
      </div>

      {showForm && (
        <div style={{ background:T.white, borderRadius:12, padding:20, marginBottom:20, border:`0.5px solid rgba(204,0,0,0.2)`, animation:"fadeIn .3s ease" }}>
          <div style={{ fontSize:13, fontWeight:500, color:T.navy, marginBottom:16 }}>Ajouter un employé</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            {[["Prénom","first_name","text"],["Nom","last_name","text"],["Email","email","email"],["Département","department","text"],["Poste","position","text"],["Date d'embauche","hire_date","date"]].map(([l,k,t])=>(
              <div key={k}>
                <label style={{ display:"block", fontSize:10, fontWeight:600, color:"#555", marginBottom:5, textTransform:"uppercase", letterSpacing:"0.06em" }}>{l}</label>
                <input type={t} value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})}
                  style={{ width:"100%", padding:"10px 12px", border:"1px solid #e0e0e0", borderRadius:8, fontSize:12, outline:"none", background:"#fafafa" }} />
              </div>
            ))}
          </div>
          <div style={{ display:"flex", gap:8, marginTop:16 }}>
            <button onClick={createEmployee} style={{ padding:"9px 20px", background:T.red, color:"#fff", border:"none", borderRadius:8, fontSize:12, fontWeight:500, cursor:"pointer" }}>Créer</button>
            <button onClick={()=>setShowForm(false)} style={{ padding:"9px 20px", background:"#f0f0f0", color:T.gray, border:"none", borderRadius:8, fontSize:12, cursor:"pointer" }}>Annuler</button>
          </div>
        </div>
      )}

      <div style={{ background:T.white, borderRadius:12, border:"0.5px solid #ebebeb", overflow:"hidden" }}>
        <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr", padding:"12px 18px", background:T.navy, gap:8 }}>
          {["Employé","Département","Poste","Statut"].map(h=><div key={h} style={{ fontSize:10, fontWeight:500, color:"rgba(255,255,255,0.6)", textTransform:"uppercase", letterSpacing:"0.06em" }}>{h}</div>)}
        </div>
        {loading ? (
          <div style={{ padding:40, textAlign:"center", color:T.gray, fontSize:12 }}>Chargement...</div>
        ) : employees.length === 0 ? (
          <div style={{ padding:40, textAlign:"center", color:T.gray, fontSize:12 }}>Aucun employé. Ajoutez le premier !</div>
        ) : employees.map((e,i)=>(
          <div key={i} style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr", padding:"14px 18px", gap:8, borderBottom:"0.5px solid #f5f5f5", animation:`fadeIn .3s ease ${i*.05}s both` }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:30, height:30, borderRadius:"50%", background:`${T.red}15`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:600, color:T.red, flexShrink:0 }}>
                {e.first_name?.[0]}{e.last_name?.[0]}
              </div>
              <div>
                <div style={{ fontSize:12, fontWeight:500, color:T.navy }}>{e.first_name} {e.last_name}</div>
                <div style={{ fontSize:10, color:T.gray }}>{e.email}</div>
              </div>
            </div>
            <div style={{ fontSize:12, color:T.gray, display:"flex", alignItems:"center" }}>{e.department||"—"}</div>
            <div style={{ fontSize:12, color:T.gray, display:"flex", alignItems:"center" }}>{e.position||"—"}</div>
            <div style={{ display:"flex", alignItems:"center" }}>
              <span style={{ fontSize:10, padding:"3px 10px", borderRadius:20, background:e.status==="active"?"#e1f5ee":"#f0f0f0", color:e.status==="active"?T.success:T.gray, fontWeight:500 }}>
                {e.status==="active"?"Actif":"Inactif"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── IT MODULE ───────────────────────────────────────────────────────────────
function ITModule({ token, user }) {
  const [tickets, setTickets] = useState([]);
  const [myTickets, setMyTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title:"", description:"", priority:"medium", category:"general" });
  const isIT = user?.department === "IT" || user?.role === "admin";

  useEffect(()=>{ fetchTickets(); }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      if (isIT) {
        const r = await fetch("http://localhost/api/it/helpdesk", { headers:{ Authorization:`Bearer ${token}` } });
        const d = await r.json();
        setTickets(d.data || []);
      }
      const r2 = await fetch("http://localhost/api/it/helpdesk/my-tickets", { headers:{ Authorization:`Bearer ${token}` } });
      const d2 = await r2.json();
      setMyTickets(d2.data || []);
    } catch {}
    setLoading(false);
  };

  const createTicket = async () => {
    if (!form.title || !form.description) return;
    await fetch("http://localhost/api/it/helpdesk", {
      method:"POST", headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token}` },
      body: JSON.stringify(form)
    });
    setShowForm(false); setForm({ title:"", description:"", priority:"medium", category:"general" });
    fetchTickets();
  };

  const statusColor = s => s==="open"?T.red:s==="in_progress"?T.warning:s==="resolved"?T.success:T.gray;
  const statusLabel = s => s==="open"?"Ouvert":s==="in_progress"?"En cours":s==="resolved"?"Résolu":"Inconnu";

  const displayTickets = isIT ? tickets : myTickets;

  return (
    <div style={{ padding:24, overflowY:"auto", height:"100%", background:"#f5f5f7" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <div>
          <div style={{ fontSize:16, fontWeight:500, color:T.navy }}>Helpdesk IT</div>
          <div style={{ fontSize:11, color:T.gray, marginTop:2 }}>{isIT ? `${tickets.length} ticket(s) total` : `${myTickets.length} mes ticket(s)`}</div>
        </div>
        <button onClick={()=>setShowForm(!showForm)} style={{ display:"flex", alignItems:"center", gap:6, padding:"9px 16px", background:T.red, color:"#fff", border:"none", borderRadius:8, fontSize:12, fontWeight:500, cursor:"pointer" }}>
          <Icon name="plus" size={14} color="#fff" /> Nouveau ticket
        </button>
      </div>

      {showForm && (
        <div style={{ background:T.white, borderRadius:12, padding:20, marginBottom:20, border:`0.5px solid rgba(204,0,0,0.2)`, animation:"fadeIn .3s ease" }}>
          <div style={{ fontSize:13, fontWeight:500, color:T.navy, marginBottom:16 }}>Créer un ticket support</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
            {[["Priorité","priority","select",["low","medium","high","critical"]],["Catégorie","category","select",["general","hardware","software","network","access"]]].map(([l,k,t,opts])=>(
              <div key={k}>
                <label style={{ display:"block", fontSize:10, fontWeight:600, color:"#555", marginBottom:5, textTransform:"uppercase", letterSpacing:"0.06em" }}>{l}</label>
                <select value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})} style={{ width:"100%", padding:"10px 12px", border:"1px solid #e0e0e0", borderRadius:8, fontSize:12, outline:"none", background:"#fafafa" }}>
                  {opts.map(o=><option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            ))}
          </div>
          <div style={{ marginBottom:12 }}>
            <label style={{ display:"block", fontSize:10, fontWeight:600, color:"#555", marginBottom:5, textTransform:"uppercase", letterSpacing:"0.06em" }}>Titre</label>
            <input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} style={{ width:"100%", padding:"10px 12px", border:"1px solid #e0e0e0", borderRadius:8, fontSize:12, outline:"none", background:"#fafafa" }} placeholder="Décrivez brièvement le problème" />
          </div>
          <div style={{ marginBottom:16 }}>
            <label style={{ display:"block", fontSize:10, fontWeight:600, color:"#555", marginBottom:5, textTransform:"uppercase", letterSpacing:"0.06em" }}>Description</label>
            <textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} rows={3} style={{ width:"100%", padding:"10px 12px", border:"1px solid #e0e0e0", borderRadius:8, fontSize:12, outline:"none", background:"#fafafa", resize:"vertical" }} placeholder="Détails du problème..." />
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={createTicket} style={{ padding:"9px 20px", background:T.red, color:"#fff", border:"none", borderRadius:8, fontSize:12, fontWeight:500, cursor:"pointer" }}>Créer le ticket</button>
            <button onClick={()=>setShowForm(false)} style={{ padding:"9px 20px", background:"#f0f0f0", color:T.gray, border:"none", borderRadius:8, fontSize:12, cursor:"pointer" }}>Annuler</button>
          </div>
        </div>
      )}

      <div style={{ background:T.white, borderRadius:12, border:"0.5px solid #ebebeb", overflow:"hidden" }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 2fr 1fr 1fr 1fr", padding:"12px 18px", background:T.navy, gap:8 }}>
          {["N°","Titre","Priorité","Catégorie","Statut"].map(h=><div key={h} style={{ fontSize:10, fontWeight:500, color:"rgba(255,255,255,0.6)", textTransform:"uppercase", letterSpacing:"0.06em" }}>{h}</div>)}
        </div>
        {loading ? <div style={{ padding:40, textAlign:"center", color:T.gray, fontSize:12 }}>Chargement...</div>
        : displayTickets.length===0 ? <div style={{ padding:40, textAlign:"center", color:T.gray, fontSize:12 }}>Aucun ticket. Créez le premier !</div>
        : displayTickets.map((t,i)=>(
          <div key={i} style={{ display:"grid", gridTemplateColumns:"1fr 2fr 1fr 1fr 1fr", padding:"12px 18px", gap:8, borderBottom:"0.5px solid #f5f5f5", animation:`fadeIn .3s ease ${i*.05}s both` }}>
            <div style={{ fontSize:10, color:T.red, fontWeight:500, display:"flex", alignItems:"center" }}>{t.ticket_number}</div>
            <div style={{ fontSize:12, color:T.navy, display:"flex", alignItems:"center", fontWeight:500 }}>{t.title}</div>
            <div style={{ display:"flex", alignItems:"center" }}>
              <span style={{ fontSize:10, padding:"3px 8px", borderRadius:20, background:t.priority==="high"||t.priority==="critical"?"#fff0f0":t.priority==="medium"?"#faeeda":"#f0f8f0", color:t.priority==="high"||t.priority==="critical"?T.red:t.priority==="medium"?T.warning:T.success, fontWeight:500 }}>{t.priority}</span>
            </div>
            <div style={{ fontSize:11, color:T.gray, display:"flex", alignItems:"center" }}>{t.category}</div>
            <div style={{ display:"flex", alignItems:"center" }}>
              <span style={{ fontSize:10, padding:"3px 10px", borderRadius:20, background:`${statusColor(t.status)}15`, color:statusColor(t.status), fontWeight:500 }}>{statusLabel(t.status)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── FINANCE MODULE ───────────────────────────────────────────────────────────
function FinanceModule({ token }) {
  const stats = [
    { label:"Budget total (k MAD)", value:500, icon:"dollar", color:T.teal },
    { label:"Dépenses (k MAD)", value:158, icon:"trending-up", color:T.red },
    { label:"Factures en attente", value:7, icon:"alert-circle", color:T.warning },
    { label:"Paiements effectués", value:43, icon:"check", color:T.success },
  ];
  return (
    <div style={{ padding:24, overflowY:"auto", height:"100%", background:"#f5f5f7" }}>
      <div style={{ fontSize:16, fontWeight:500, color:T.navy, marginBottom:20 }}>Finance</div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:20 }}>
        {stats.map((s,i)=><StatCard key={s.label} {...s} delay={i*.1} />)}
      </div>
      <div style={{ background:T.white, borderRadius:12, padding:20, border:"0.5px solid #ebebeb" }}>
        <div style={{ fontSize:13, fontWeight:500, color:T.navy, marginBottom:16 }}>Répartition du budget</div>
        {[["RH",45,T.teal],["IT",20,T.red],["Opérations",25,T.warning],["Administration",10,T.sage]].map(([l,v,c])=>(
          <div key={l} style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
            <div style={{ width:80, fontSize:12, color:T.gray }}>{l}</div>
            <div style={{ flex:1, height:8, background:"#f0f0f0", borderRadius:4, overflow:"hidden" }}>
              <div style={{ height:"100%", background:c, borderRadius:4, width:`${v}%`, transition:"width 1s ease" }} />
            </div>
            <div style={{ fontSize:12, fontWeight:500, color:T.navy, width:35, textAlign:"right" }}>{v}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── OPS MODULE ──────────────────────────────────────────────────────────────
function OpsModule({ token }) {
  const projects = [
    { name:"Migration Cloud", status:"En cours", progress:65, team:8 },
    { name:"Audit Sécurité", status:"Planifié", progress:20, team:3 },
    { name:"ERP Phase 2", status:"En cours", progress:40, team:12 },
    { name:"Formation DevOps", status:"Terminé", progress:100, team:5 },
  ];
  return (
    <div style={{ padding:24, overflowY:"auto", height:"100%", background:"#f5f5f7" }}>
      <div style={{ fontSize:16, fontWeight:500, color:T.navy, marginBottom:20 }}>Opérations</div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
        {projects.map((p,i)=>(
          <div key={i} style={{ background:T.white, borderRadius:12, padding:18, border:"0.5px solid #ebebeb", animation:`fadeIn .4s ease ${i*.1}s both` }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
              <div style={{ fontSize:13, fontWeight:500, color:T.navy }}>{p.name}</div>
              <span style={{ fontSize:10, padding:"3px 10px", borderRadius:20, fontWeight:500,
                background:p.status==="Terminé"?"#e1f5ee":p.status==="En cours"?"#e1f0f5":"#faeeda",
                color:p.status==="Terminé"?T.success:p.status==="En cours"?T.teal:T.warning }}>{p.status}</span>
            </div>
            <div style={{ fontSize:11, color:T.gray, marginBottom:10 }}>{p.team} membres</div>
            <div style={{ height:6, background:"#f0f0f0", borderRadius:3, overflow:"hidden" }}>
              <div style={{ height:"100%", background:p.progress===100?T.success:T.teal, borderRadius:3, width:`${p.progress}%`, transition:"width 1s ease" }} />
            </div>
            <div style={{ fontSize:10, color:T.gray, marginTop:5, textAlign:"right" }}>{p.progress}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── USERS MODULE ─────────────────────────────────────────────────────────────


// Composant input stable, défini en dehors de UsersModule (à placer avant dans le fichier)
const StableInput = ({ label, name, type = "text", value, onChange, options, error, onBlur, placeholder }) => (
  <div>
    <label style={{ display: "block", fontSize: 10, fontWeight: 600, color: "#555", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>
      {label}
    </label>
    {options ? (
      <select
        value={value}
        onChange={onChange}
        style={{ width: "100%", padding: "10px 12px", border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 12, outline: "none", background: "#fafafa" }}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    ) : (
      <input
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        style={{
          width: "100%",
          padding: "10px 12px",
          border: `1px solid ${error ? "#CC0000" : "#e0e0e0"}`,
          borderRadius: 8,
          fontSize: 12,
          outline: "none",
          background: "#fafafa"
        }}
      />
    )}
  </div>
);

function UsersModule({ token }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [showPwForm, setShowPwForm] = useState(null);
  const [msg, setMsg] = useState("");
  // Formulaire sans champ password — MDP auto-généré par le backend
  const [form, setForm] = useState({ username:"", email:"", role:"employee", department:"", job_title:"" });
  const [createdUser, setCreatedUser] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const r = await fetch("http://localhost/api/auth/users", { headers:{ Authorization:`Bearer ${token}` } });
      const d = await r.json();
      setUsers(d.data || []);
    } catch {}
    setLoading(false);
  };

  useEffect(()=>{ fetchUsers(); },[]);

  const showMsg = (m) => { setMsg(m); setTimeout(()=>setMsg(""),4000); };

  // Création — le backend génère automatiquement le mot de passe temporaire
  const createUser = async () => {
    if (!form.username || !form.email || !form.department) {
      showMsg("❌ Nom d'utilisateur, email et département sont requis");
      return;
    }
    // Validation email basique côté client
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      showMsg("❌ Format d'email invalide");
      return;
    }
    try {
      const r = await fetch("http://localhost/api/auth/admin/create", {
        method:"POST",
        headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const d = await r.json();
      if (!r.ok) { showMsg("❌ " + (d.message || "Erreur")); return; }

      setCreatedUser({
        username:     d.data.username,
        email:        d.data.email,
        tempPassword: d.tempPassword,
        role:         d.data.role,
        department:   d.data.department,
        emailSent:    d.emailSent,
        emailMessage: d.emailMessage,
      });

      setShowForm(false);
      setForm({ username:"", email:"", role:"employee", department:"", job_title:"" });
      fetchUsers();
    } catch { showMsg("❌ Erreur réseau"); }
  };

  const toggleUser = async (id, isActive) => {
    try {
      const r = await fetch(`http://localhost/api/auth/${id}/${isActive ? "deactivate" : "activate"}`, {
        method:"POST", headers:{ Authorization:`Bearer ${token}` },
      });
      const d = await r.json();
      if (!r.ok) { showMsg("❌ " + (d.message || "Erreur")); return; }
      showMsg(isActive ? "✅ Compte désactivé" : "✅ Compte activé");
      fetchUsers();
    } catch {}
  };

  // Réinitialisation — le backend génère un nouveau MDP temporaire
  const resetPassword = async (id) => {
    try {
      const r = await fetch(`http://localhost/api/auth/${id}/reset-password`, {
        method:"POST", headers:{ Authorization:`Bearer ${token}` },
      });
      const d = await r.json();
      if (!r.ok) { showMsg("❌ " + (d.message || "Erreur")); return; }
      showMsg(`✅ Nouveau MDP temporaire : ${d.tempPassword}`);
      setShowPwForm(null);
    } catch {}
  };

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const matchSearch = !q || u.username?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.department?.toLowerCase().includes(q);
    const matchRole = filterRole === "all" || u.role === filterRole;
    return matchSearch && matchRole;
  });

  return (
    <div style={{padding:24,overflowY:"auto",height:"100%",background:"#f5f5f7"}}>

      {/* Carte credentials créés */}
      {createdUser && (
        <div style={{background:"#fff",borderRadius:12,padding:20,marginBottom:20,border:`1px solid ${createdUser.emailSent?"#1D9E75":"#BA7517"}`,animation:"fadeIn .4s ease"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:36,height:36,borderRadius:10,background:createdUser.emailSent?"#e1f5ee":"#faeeda",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <span style={{fontSize:18}}>{createdUser.emailSent?"✅":"⚠️"}</span>
              </div>
              <div>
                <div style={{fontSize:14,fontWeight:600,color:"#061E29"}}>Compte créé avec succès !</div>
                <div style={{fontSize:11,color:createdUser.emailSent?"#1D9E75":"#BA7517"}}>{createdUser.emailMessage}</div>
              </div>
            </div>
            <button onClick={()=>setCreatedUser(null)} style={{background:"#f0f0f0",border:"none",borderRadius:6,padding:"4px 10px",fontSize:11,cursor:"pointer",color:"#888"}}>Fermer</button>
          </div>
          <div style={{background:"#f9f9f9",borderRadius:10,padding:16,borderLeft:"3px solid #CC0000"}}>
            <div style={{fontSize:11,fontWeight:600,color:"#888",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:12}}>
              {createdUser.emailSent ? "Identifiants envoyés par email" : "⚠️ Communiquez ces identifiants manuellement à l'employé"}
            </div>
            {[
              ["Email",          createdUser.email],
              ["Nom d'utilisateur", createdUser.username],
              ["Mot de passe temporaire", createdUser.tempPassword || "(envoyé par email)"],
              ["Rôle",           createdUser.role],
              ["Département",    createdUser.department||"—"],
            ].map(([l,v])=>(
              <div key={l} style={{display:"flex",alignItems:"center",marginBottom:8,gap:12}}>
                <div style={{fontSize:11,color:"#888",width:180,flexShrink:0}}>{l}</div>
                <div style={{fontSize:12,fontWeight:600,color:"#061E29",fontFamily:"monospace",background:"#fff",padding:"4px 10px",borderRadius:6,border:"0.5px solid #e0e0e0",flex:1}}>{v}</div>
              </div>
            ))}
            <div style={{marginTop:10,padding:10,background:"#fff8e1",borderRadius:8,fontSize:11,color:"#7a5c00"}}>
              🔒 L'employé devra changer ce mot de passe à la première connexion.
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
        <div>
          <div style={{fontSize:16,fontWeight:500,color:"#061E29"}}>Gestion des comptes</div>
          <div style={{fontSize:11,color:"#888",marginTop:2}}>{users.length} compte(s) système</div>
        </div>
        <button onClick={()=>setShowForm(!showForm)}
          style={{display:"flex",alignItems:"center",gap:6,padding:"9px 16px",background:"#CC0000",color:"#fff",border:"none",borderRadius:8,fontSize:12,fontWeight:500,cursor:"pointer"}}>
          <Icon name="plus" size={14} color="#fff"/> Nouveau compte
        </button>
      </div>

      {/* Message flash */}
      {msg && <div style={{background:msg.startsWith("✅")?"#e1f5ee":"#fff0f0",border:`0.5px solid ${msg.startsWith("✅")?"#1D9E75":"#CC0000"}`,borderRadius:8,padding:"10px 14px",fontSize:12,color:msg.startsWith("✅")?"#1D9E75":"#CC0000",marginBottom:16,animation:"fadeIn .3s ease",wordBreak:"break-all"}}>{msg}</div>}

      {/* Formulaire création — sans champ password */}
      {showForm && (
        <div style={{background:"#fff",borderRadius:12,padding:20,marginBottom:20,border:"0.5px solid rgba(204,0,0,0.2)",animation:"fadeIn .3s ease"}}>
          <div style={{fontSize:13,fontWeight:500,color:"#061E29",marginBottom:4}}>Créer un compte utilisateur</div>
          <div style={{fontSize:11,color:"#888",marginBottom:16}}>Le mot de passe temporaire sera généré automatiquement et envoyé par email.</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
            <StableInput label="Nom d'utilisateur *" name="username" value={form.username}
              onChange={e=>setForm({...form,username:e.target.value})} />
            <StableInput label="Email professionnel *" name="email" type="email" value={form.email}
              onChange={e=>setForm({...form,email:e.target.value})} placeholder="nom@domaine.com" />
            <StableInput label="Département *" name="department" value={form.department}
              onChange={e=>setForm({...form,department:e.target.value})} />
            <StableInput label="Titre du poste" name="job_title" value={form.job_title}
              onChange={e=>setForm({...form,job_title:e.target.value})}
              placeholder="Ex: Manager RH, Analyste Finance..." />
            <StableInput label="Rôle" name="role" value={form.role}
              onChange={e=>setForm({...form,role:e.target.value})}
              options={[
                {value:"employee",    label:"Employé"},
                {value:"hr",          label:"RH"},
                {value:"finance",     label:"Finance"},
                {value:"it",          label:"IT"},
                {value:"operations",  label:"Opérations"},
                {value:"admin",       label:"Admin"},
              ]}
            />
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={createUser}
              style={{padding:"9px 20px",background:"#CC0000",color:"#fff",border:"none",borderRadius:8,fontSize:12,fontWeight:500,cursor:"pointer"}}>
              Créer le compte
            </button>
            <button onClick={()=>setShowForm(false)}
              style={{padding:"9px 20px",background:"#f0f0f0",color:"#888",border:"none",borderRadius:8,fontSize:12,cursor:"pointer"}}>
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Filtres */}
      <div style={{display:"flex",gap:10,marginBottom:16}}>
        <div style={{flex:1,display:"flex",alignItems:"center",gap:8,background:"#fff",border:"0.5px solid #e0e0e0",borderRadius:8,padding:"8px 12px"}}>
          <Icon name="search" size={14} color="#888"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher un utilisateur..."
            style={{border:"none",outline:"none",fontSize:12,flex:1,background:"transparent",color:"#061E29"}}/>
        </div>
        <select value={filterRole} onChange={e=>setFilterRole(e.target.value)}
          style={{padding:"8px 12px",border:"0.5px solid #e0e0e0",borderRadius:8,fontSize:12,outline:"none",background:"#fff",color:"#061E29"}}>
          <option value="all">Tous les rôles</option>
          <option value="admin">Admin</option>
          <option value="employee">Employé</option>
          <option value="hr">RH</option>
          <option value="finance">Finance</option>
          <option value="it">IT</option>
          <option value="operations">Opérations</option>
        </select>
      </div>

      {/* Table */}
      <div style={{background:"#fff",borderRadius:12,border:"0.5px solid #ebebeb",overflow:"hidden"}}>
        <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr",padding:"12px 18px",background:"#061E29",gap:8}}>
          {["Utilisateur","Département","Rôle","Statut","Actions"].map(h=>(
            <div key={h} style={{fontSize:10,fontWeight:500,color:"rgba(255,255,255,0.6)",textTransform:"uppercase",letterSpacing:"0.06em"}}>{h}</div>
          ))}
        </div>
        {loading ? <div style={{padding:40,textAlign:"center",color:"#888",fontSize:12}}>Chargement...</div>
        : filtered.length===0 ? <div style={{padding:40,textAlign:"center",color:"#888",fontSize:12}}>Aucun utilisateur trouvé.</div>
        : filtered.map((u,i)=>(
          <div key={i}>
            <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr",padding:"12px 18px",gap:8,borderBottom:"0.5px solid #f5f5f5",alignItems:"center"}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:32,height:32,borderRadius:"50%",background:u.is_active?"#CC000015":"#f0f0f0",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:600,color:u.is_active?"#CC0000":"#888",flexShrink:0}}>
                  {u.username?.[0]?.toUpperCase()}
                </div>
                <div>
                  <div style={{fontSize:12,fontWeight:500,color:"#061E29"}}>{u.username}</div>
                  <div style={{fontSize:10,color:"#888"}}>{u.email}</div>
                </div>
              </div>
              <div>
                <div style={{fontSize:12,fontWeight:500,color:"#061E29"}}>{u.job_title||"—"}</div>
                <div style={{fontSize:9,color:"#888"}}>{u.department}</div>
              </div>
              <div>
                <span style={{fontSize:10,padding:"3px 8px",borderRadius:20,background:"#1E5F7415",color:"#1E5F74",fontWeight:500}}>{u.role}</span>
              </div>
              <div>
                <span style={{fontSize:10,padding:"3px 10px",borderRadius:20,background:u.is_active?"#e1f5ee":"#f0f0f0",color:u.is_active?"#1D9E75":"#888",fontWeight:500}}>
                  {u.is_active?"Actif":"Inactif"}
                </span>
              </div>
              <div style={{display:"flex",gap:6}}>
                <button
                  onClick={()=>toggleUser(u.user_id, u.is_active)}
                  disabled={u.role==="admin"}
                  title={u.role==="admin"?"Impossible de désactiver un administrateur":""}
                  style={{padding:"5px 10px",background:u.role==="admin"?"#f0f0f0":u.is_active?"#fff0f0":"#e1f5ee",color:u.role==="admin"?"#ccc":u.is_active?"#CC0000":"#1D9E75",border:`0.5px solid ${u.role==="admin"?"#e0e0e0":u.is_active?"rgba(204,0,0,0.2)":"rgba(29,158,117,0.2)"}`,borderRadius:6,fontSize:10,cursor:u.role==="admin"?"not-allowed":"pointer",fontWeight:500,opacity:u.role==="admin"?0.5:1}}>
                  {u.is_active?"Désactiver":"Activer"}
                </button>
                <button onClick={()=>setShowPwForm(showPwForm===u.user_id?null:u.user_id)}
                  style={{padding:"5px 10px",background:"#f5f5f7",color:"#888",border:"0.5px solid #e0e0e0",borderRadius:6,fontSize:10,cursor:"pointer"}}>
                  Réinit. MDP
                </button>
              </div>
            </div>
            {showPwForm===u.user_id && (
              <div style={{padding:"12px 18px",background:"#fff8e1",borderBottom:"0.5px solid #f0f0f0",display:"flex",alignItems:"center",gap:12}}>
                <div style={{fontSize:12,color:"#7a5c00",flex:1}}>
                  ⚠️ Un nouveau mot de passe temporaire sera généré et affiché ici. L'employé devra le changer à sa prochaine connexion.
                </div>
                <button onClick={()=>resetPassword(u.user_id)}
                  style={{padding:"8px 16px",background:"#CC0000",color:"#fff",border:"none",borderRadius:8,fontSize:12,cursor:"pointer",fontWeight:500,flexShrink:0}}>
                  Générer nouveau MDP
                </button>
                <button onClick={()=>setShowPwForm(null)}
                  style={{padding:"8px 14px",background:"#f0f0f0",color:"#888",border:"none",borderRadius:8,fontSize:12,cursor:"pointer",flexShrink:0}}>
                  Annuler
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── EMPLOYEE HOME ────────────────────────────────────────────────────────────
function EmployeeHome({ user }) {
  return (
    <div style={{ padding:24, overflowY:"auto", height:"100%", background:"#f5f5f7" }}>
      <div style={{ background:T.navy, borderRadius:14, padding:"20px 24px", marginBottom:20, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div>
          <div style={{ fontSize:18, fontWeight:500, color:T.white }}>Bonjour, {user?.username} 👋</div>
          <div style={{ fontSize:12, color:"rgba(255,255,255,0.45)", marginTop:4 }}>{user?.department} · {new Date().toLocaleDateString("fr-FR",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</div>
        </div>
        <div style={{ background:"rgba(255,255,255,0.08)", borderRadius:10, padding:"8px 16px", fontSize:11, color:"rgba(255,255,255,0.6)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}><div style={{ width:6, height:6, borderRadius:"50%", background:T.success }} />En ligne</div>
        </div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
        {[["Mes tickets","2 ouverts","help-circle",T.red],["Congés","8j restants","calendar",T.teal],["Mon équipe","12 membres","users",T.sage],["Documents","5 fichiers","box",T.warning]].map(([t,s,ic,c])=>(
          <div key={t} style={{ background:T.white, borderRadius:12, padding:16, border:"0.5px solid #ebebeb", cursor:"pointer", textAlign:"center", transition:"transform .2s" }}
            onMouseEnter={e=>e.currentTarget.style.transform="translateY(-3px)"}
            onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
            <div style={{ width:40, height:40, borderRadius:12, background:`${c}12`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 10px" }}><Icon name={ic} size={18} color={c} /></div>
            <div style={{ fontSize:12, fontWeight:500, color:T.navy }}>{t}</div>
            <div style={{ fontSize:10, color:T.gray, marginTop:3 }}>{s}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── LEAVE MODULE ─────────────────────────────────────────────────────────────
function LeaveModule({ token, user }) {
  const [leaves, setLeaves] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ employee_id:"", leave_type:"annual", start_date:"", end_date:"", reason:"" });

  useEffect(()=>{
    if (user?.id) {
      setForm(f=>({...f, employee_id: user.id}));
      fetch(`http://localhost/api/hr/leave/my-requests`, { headers:{ Authorization:`Bearer ${token}` } })
        .then(r=>r.json()).then(d=>setLeaves(d.data||[])).catch(()=>{});
    }
  },[user]);

  const submitLeave = async () => {
    if (!form.start_date || !form.end_date) return;
    await fetch("http://localhost/api/hr/leave/", {
      method:"POST", headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token}` },
      body: JSON.stringify(form)
    });
    setShowForm(false);
    if (user?.id) {
      fetch(`http://localhost/api/hr/leave/my-requests`, { headers:{ Authorization:`Bearer ${token}` } })
        .then(r=>r.json()).then(d=>setLeaves(d.data||[])).catch(()=>{});
    }
  };

  const statusColor = s => s==="approved"?T.success:s==="pending"?T.warning:T.danger;
  const statusLabel = s => s==="approved"?"Approuvé":s==="pending"?"En attente":"Rejeté";

  return (
    <div style={{ padding:24, overflowY:"auto", height:"100%", background:"#f5f5f7" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <div>
          <div style={{ fontSize:16, fontWeight:500, color:T.navy }}>Mes demandes de congé</div>
          <div style={{ fontSize:11, color:T.gray, marginTop:2 }}>{leaves.length} demande(s)</div>
        </div>
        <button onClick={()=>setShowForm(!showForm)} style={{ display:"flex", alignItems:"center", gap:6, padding:"9px 16px", background:T.red, color:"#fff", border:"none", borderRadius:8, fontSize:12, fontWeight:500, cursor:"pointer" }}>
          <Icon name="plus" size={14} color="#fff" /> Nouvelle demande
        </button>
      </div>

      {showForm && (
        <div style={{ background:T.white, borderRadius:12, padding:20, marginBottom:20, border:`0.5px solid rgba(204,0,0,0.2)`, animation:"fadeIn .3s ease" }}>
          <div style={{ fontSize:13, fontWeight:500, color:T.navy, marginBottom:16 }}>Demande de congé</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
            {[["Type de congé","leave_type","select",["annual","sick","personal","maternity","paternity"]],].map(([l,k,t,opts])=>(
              <div key={k}>
                <label style={{ display:"block", fontSize:10, fontWeight:600, color:"#555", marginBottom:5, textTransform:"uppercase", letterSpacing:"0.06em" }}>{l}</label>
                <select value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})} style={{ width:"100%", padding:"10px 12px", border:"1px solid #e0e0e0", borderRadius:8, fontSize:12, outline:"none", background:"#fafafa" }}>
                  {opts.map(o=><option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            ))}
            {[["Date début","start_date","date"],["Date fin","end_date","date"]].map(([l,k,t])=>(
              <div key={k}>
                <label style={{ display:"block", fontSize:10, fontWeight:600, color:"#555", marginBottom:5, textTransform:"uppercase", letterSpacing:"0.06em" }}>{l}</label>
                <input type={t} value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})} style={{ width:"100%", padding:"10px 12px", border:"1px solid #e0e0e0", borderRadius:8, fontSize:12, outline:"none", background:"#fafafa" }} />
              </div>
            ))}
          </div>
          <div style={{ marginBottom:16 }}>
            <label style={{ display:"block", fontSize:10, fontWeight:600, color:"#555", marginBottom:5, textTransform:"uppercase", letterSpacing:"0.06em" }}>Motif</label>
            <textarea value={form.reason} onChange={e=>setForm({...form,reason:e.target.value})} rows={2} style={{ width:"100%", padding:"10px 12px", border:"1px solid #e0e0e0", borderRadius:8, fontSize:12, outline:"none", background:"#fafafa", resize:"vertical" }} placeholder="Motif de la demande..." />
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={submitLeave} style={{ padding:"9px 20px", background:T.red, color:"#fff", border:"none", borderRadius:8, fontSize:12, fontWeight:500, cursor:"pointer" }}>Soumettre</button>
            <button onClick={()=>setShowForm(false)} style={{ padding:"9px 20px", background:"#f0f0f0", color:T.gray, border:"none", borderRadius:8, fontSize:12, cursor:"pointer" }}>Annuler</button>
          </div>
        </div>
      )}

      <div style={{ background:T.white, borderRadius:12, border:"0.5px solid #ebebeb", overflow:"hidden" }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr 1fr", padding:"12px 18px", background:T.navy, gap:8 }}>
          {["Type","Début","Fin","Jours","Statut"].map(h=><div key={h} style={{ fontSize:10, fontWeight:500, color:"rgba(255,255,255,0.6)", textTransform:"uppercase", letterSpacing:"0.06em" }}>{h}</div>)}
        </div>
        {leaves.length===0 ? <div style={{ padding:40, textAlign:"center", color:T.gray, fontSize:12 }}>Aucune demande. Créez votre première demande !</div>
        : leaves.map((l,i)=>(
          <div key={i} style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr 1fr", padding:"12px 18px", gap:8, borderBottom:"0.5px solid #f5f5f5" }}>
            <div style={{ fontSize:12, color:T.navy, fontWeight:500, display:"flex", alignItems:"center" }}>{l.leave_type}</div>
            <div style={{ fontSize:11, color:T.gray, display:"flex", alignItems:"center" }}>{l.start_date?.slice(0,10)}</div>
            <div style={{ fontSize:11, color:T.gray, display:"flex", alignItems:"center" }}>{l.end_date?.slice(0,10)}</div>
            <div style={{ fontSize:11, color:T.gray, display:"flex", alignItems:"center" }}>{l.total_days}j</div>
            <div style={{ display:"flex", alignItems:"center" }}>
              <span style={{ fontSize:10, padding:"3px 10px", borderRadius:20, background:`${statusColor(l.status)}15`, color:statusColor(l.status), fontWeight:500 }}>{statusLabel(l.status)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── PROFILE MODULE ───────────────────────────────────────────────────────────
function ProfileModule({ user }) {
  return (
    <div style={{ padding:24, overflowY:"auto", height:"100%", background:"#f5f5f7" }}>
      <div style={{ fontSize:16, fontWeight:500, color:T.navy, marginBottom:20 }}>Mon profil</div>
      <div style={{ background:T.white, borderRadius:12, padding:28, border:"0.5px solid #ebebeb", maxWidth:500 }}>
        <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:24, paddingBottom:24, borderBottom:"0.5px solid #f0f0f0" }}>
          <div style={{ width:60, height:60, borderRadius:"50%", background:T.red, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, fontWeight:600, color:"#fff" }}>{user?.username?.[0]?.toUpperCase()}</div>
          <div>
            <div style={{ fontSize:16, fontWeight:500, color:T.navy }}>{user?.username}</div>
            <div style={{ fontSize:12, color:T.gray, marginTop:3 }}>{user?.email}</div>
            <div style={{ marginTop:6 }}><span style={{ fontSize:10, padding:"3px 10px", borderRadius:20, background:"#e1f5ee", color:T.success, fontWeight:500 }}>Actif</span></div>
          </div>
        </div>
        {[["Rôle",user?.role],["Département",user?.department],["ID",user?.id]].map(([l,v])=>(
          <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"12px 0", borderBottom:"0.5px solid #f9f9f9" }}>
            <div style={{ fontSize:12, color:T.gray }}>{l}</div>
            <div style={{ fontSize:12, fontWeight:500, color:T.navy }}>{v||"—"}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── CHANGE PASSWORD SCREEN (première connexion) ──────────────────────────────
function ChangePasswordScreen({ user, token, onSuccess }) {
  const [current, setCurrent] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const checks = [
    { label:"8+ caractères", ok: newPw.length >= 8 },
    { label:"Majuscule", ok: /[A-Z]/.test(newPw) },
    { label:"Minuscule", ok: /[a-z]/.test(newPw) },
    { label:"Chiffre", ok: /[0-9]/.test(newPw) },
    { label:"Spécial", ok: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPw) },
  ];
  const score = checks.filter(c => c.ok).length;
  const colors = ["","#CC0000","#CC0000","#BA7517","#1D9E75","#1D9E75"];
  const labels = ["","Très faible","Faible","Moyen","Fort","Très fort"];

  const handleChange = async () => {
    if (!current || !newPw || !confirm) { setError("Tous les champs sont requis"); return; }
    if (newPw !== confirm) { setError("Les mots de passe ne correspondent pas"); return; }
    if (score < 4) { setError("Mot de passe trop faible"); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch("http://localhost/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ current_password: current, new_password: newPw }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");
      onSuccess();
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  return (
    <div style={{ display:"flex", height:"100vh", alignItems:"center", justifyContent:"center", background:T.dark, position:"relative", overflow:"hidden" }}>
      {[{w:400,h:400,t:-120,l:-120},{w:200,h:200,t:60,l:50}].map((c,i)=>(
        <div key={i} style={{ position:"absolute", width:c.w, height:c.h, top:c.t, left:c.l, borderRadius:"50%", border:"1px solid rgba(204,0,0,0.1)", animation:`pulse ${4+i}s ease-in-out infinite` }} />
      ))}
      <div style={{ background:T.white, borderRadius:16, padding:"40px 44px", width:480, position:"relative", zIndex:1, boxShadow:"0 20px 60px rgba(0,0,0,0.5)", animation:"slideIn .4s ease" }}>
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <div style={{ width:56, height:56, borderRadius:"50%", background:"#fff0f0", border:`2px solid ${T.red}`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={T.red} strokeWidth="1.8">
              <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <div style={{ fontFamily:"'Rajdhani',sans-serif", fontSize:20, fontWeight:700, color:T.navy }}>Changement de mot de passe requis</div>
          <div style={{ fontSize:12, color:T.gray, marginTop:6, lineHeight:1.6 }}>
            Bienvenue <strong>{user?.username}</strong> ! Pour votre sécurité,<br/>vous devez changer votre mot de passe temporaire.
          </div>
        </div>

        <div style={{ background:"#fff8e1", border:"1px solid #ffc107", borderRadius:8, padding:"10px 14px", fontSize:11, color:"#7a5c00", marginBottom:20 }}>
          ⚠️ Ce mot de passe temporaire doit être changé avant de continuer.
        </div>

        {[
          ["Mot de passe temporaire (actuel)", current, setCurrent],
          ["Nouveau mot de passe", newPw, setNewPw],
          ["Confirmer le nouveau mot de passe", confirm, setConfirm],
        ].map(([label, val, setter]) => (
          <div key={label} style={{ marginBottom:14 }}>
            <label style={{ display:"block", fontSize:10, fontWeight:600, color:"#555", marginBottom:5, textTransform:"uppercase", letterSpacing:"0.06em" }}>{label}</label>
            <input type="password" value={val} onChange={e => setter(e.target.value)}
              style={{ width:"100%", padding:"11px 12px", border:`1px solid ${label.includes("Confirmer") && confirm && newPw !== confirm ? T.red : "#e0e0e0"}`, borderRadius:8, fontSize:13, outline:"none", background:"#fafafa" }} />
          </div>
        ))}

        {newPw && (
          <div style={{ marginBottom:16 }}>
            <div style={{ display:"flex", gap:4, marginBottom:6 }}>
              {[1,2,3,4,5].map(i => <div key={i} style={{ flex:1, height:4, borderRadius:2, background: i<=score ? colors[score] : "#e0e0e0", transition:"background .3s" }} />)}
            </div>
            <div style={{ display:"flex", justifyContent:"space-between" }}>
              <span style={{ fontSize:10, color:colors[score], fontWeight:500 }}>{labels[score]}</span>
              <div style={{ display:"flex", gap:8 }}>
                {checks.map(c => <span key={c.label} style={{ fontSize:9, color: c.ok ? T.success : "#ccc" }}>{c.ok?"✓":"○"} {c.label}</span>)}
              </div>
            </div>
          </div>
        )}

        {error && <div style={{ background:"#fff0f0", border:`0.5px solid rgba(204,0,0,0.3)`, borderRadius:8, padding:"10px 14px", fontSize:12, color:T.red, marginBottom:14 }}>{error}</div>}

        <button onClick={handleChange} disabled={loading}
          style={{ width:"100%", padding:13, background: score>=4 && newPw===confirm && newPw ? T.red : "#ccc", color:"#fff", border:"none", borderRadius:10, fontSize:14, fontWeight:600, fontFamily:"'Rajdhani',sans-serif", letterSpacing:"0.05em", cursor: score>=4 ? "pointer" : "not-allowed", transition:"all .2s" }}>
          {loading ? "Changement en cours..." : "Confirmer le nouveau mot de passe"}
        </button>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [active, setActive] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [mustChangePw, setMustChangePw] = useState(false);

  useEffect(()=>{
    const u = localStorage.getItem("user");
    const t = localStorage.getItem("token");
    const mcp = localStorage.getItem("mustChangePw");
    if (u && t) { setUser(JSON.parse(u)); setToken(t); setMustChangePw(mcp === "true"); }
  },[]);

  useEffect(()=>{
    if (user) setActive(user.role==="admin" ? "dashboard" : "home");
  },[user]);

  const handleLogin = (u, t, mustChange) => {
    setUser(u); setToken(t); setMustChangePw(!!mustChange);
  };

  const handleLogout = () => {
    setUser(null); setToken(null); setMustChangePw(false);
    localStorage.clear();
  };

  const handlePasswordChanged = () => {
    setMustChangePw(false);
    localStorage.setItem("mustChangePw", "false");
  };

  const titles = { dashboard:"Vue d'ensemble", hr:"Ressources Humaines", it:"Helpdesk IT", finance:"Finance", operations:"Opérations", users:"Utilisateurs", home:"Accueil", tickets:"Mes tickets", leave:"Congés", profile:"Mon profil" };

  const isAdmin = user?.role === "admin";

  const renderContent = () => {
    switch(active) {
      case "dashboard": return isAdmin ? <AdminDashboard /> : <EmployeeHome user={user} />;
      case "hr": return isAdmin ? <HRModule token={token} /> : <EmployeeHome user={user} />;
      case "it": case "tickets": return <ITModule token={token} user={user} />;
      case "finance": return isAdmin ? <FinanceModule token={token} /> : <EmployeeHome user={user} />;
      case "operations": return isAdmin ? <OpsModule token={token} /> : <EmployeeHome user={user} />;
      case "users": return isAdmin ? <UsersModule token={token} /> : <EmployeeHome user={user} />;
      case "home": return <EmployeeHome user={user} />;
      case "leave": return <LeaveModule token={token} user={user} />;
      case "profile": return <ProfileModule user={user} />;
      default: return isAdmin ? <AdminDashboard /> : <EmployeeHome user={user} />;
    }
  };

  if (!user) return (<><GlobalStyle /><LoginPage onLogin={handleLogin} /></>);

  if (mustChangePw) return (
    <>
      <GlobalStyle />
      <ChangePasswordScreen user={user} token={token} onSuccess={handlePasswordChanged} />
    </>
  );

  return (
    <>
      <GlobalStyle />
      <div style={{ display:"flex", height:"100vh", overflow:"hidden" }}>
        <Sidebar user={user} active={active} setActive={setActive} onLogout={handleLogout} collapsed={collapsed} setCollapsed={setCollapsed} />
        <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
          <Topbar title={titles[active]||""} user={user} />
          <div style={{ flex:1, overflow:"hidden" }}>{renderContent()}</div>
        </div>
      </div>
    </>
  );
}