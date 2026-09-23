let deferredInstall=null;
const A=document.getElementById("app"),T=document.getElementById("title"),toastEl=document.getElementById("toast");
const defaults={name:"FOX OS Sandbox",owner:"Foxbin",version:"0.3.0",accent:"#0796e6",target:"BONELAB",files:{
"Main.cs":`using BoneLib;

namespace FOXOS {
    public class Main {
        public void Start() {
            // FOX OS entry point
        }
    }
}
`}};
let state=JSON.parse(localStorage.getItem("foxos_v03")||"null")||{
  project:defaults, view:"home", file:"Main.cs", builds:[], history:[], bookmarks:["https://github.com/foxbin8766-oss/FoxOSC"], settings:{accent:"#0796e6",compact:false}
};
if(!state.project.files) state.project=defaults;
let view=state.view||"home", file=state.file||"Main.cs";
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function save(){state.view=view;state.file=file;localStorage.setItem("foxos_v03",JSON.stringify(state));document.documentElement.style.setProperty("--accent",state.settings.accent||"#0796e6")}
function toast(msg){toastEl.textContent=msg;toastEl.classList.add("show");clearTimeout(window._toast);window._toast=setTimeout(()=>toastEl.classList.remove("show"),2200)}
function go(v){view=v;render()}
function setTitle(){T.textContent=view==="sim"?"Simulator":view==="logs"?"Build / Logs":view[0].toUpperCase()+view.slice(1)}
function projectCount(){return Object.keys(state.project.files).length}
function render(){
  save(); setTitle();
  document.querySelectorAll("nav button").forEach(x=>x.classList.toggle("active",x.dataset.v===view));
  let h="";
  if(view==="home") h=home();
  else if(view==="projects") h=projects();
  else if(view==="code") h=code();
  else if(view==="circuits") h=circuits();
  else if(view==="sim") h=simulator();
  else if(view==="systems") h=systems();
  else if(view==="browser") h=browser();
  else if(view==="logs") h=logs();
  else if(view==="docs") h=docs();
  else if(view==="settings") h=settings();
  A.innerHTML=h;
  bind();
}
function home(){
 const last=state.builds.at(-1);
 return `<div class="profile"><img class="avatar" src="fox-os-logo.png"><div><h1>Welcome back, ${esc(state.project.owner||"Foxbin")}</h1><p class="muted">FOX OS Chromebook Developer Companion</p></div></div>
 <div class="grid three" style="margin-top:18px">
  <div class="card"><div class="stat">${projectCount()}</div><div class="statlabel">Project files</div></div>
  <div class="card"><div class="stat">${state.builds.length}</div><div class="statlabel">Build runs</div></div>
  <div class="card"><div class="stat">${state.history.length}</div><div class="statlabel">Recent actions</div></div>
 </div>
 <div class="grid" style="margin-top:12px">
  <div class="card"><div class="rowline"><h2>Current project</h2><span class="badge">${esc(state.project.target)}</span></div><p><b>${esc(state.project.name)}</b> <span class="muted">v${esc(state.project.version)}</span></p><p class="muted">${projectCount()} files • local workspace</p><button class="primary" onclick="go('code')">Open project</button> <button onclick="go('projects')">Project manager</button></div>
  <div class="card"><h2>Quick actions</h2><button onclick="newProject()">New project</button> <button onclick="go('circuits')">Open Circuits</button> <button onclick="go('sim')">Launch Simulator</button> <button onclick="go('logs')">Build</button></div>
  <div class="card"><h2>FOX OS status</h2><p><span class="badge ok">READY</span> Local workspace</p><p><span class="badge ok">READY</span> PWA offline shell</p><p><span class="badge warn">PROTOTYPE</span> DLL compiler connection</p></div>
  <div class="card"><h2>Last build</h2><p class="muted">${last?esc(last.time):"No builds yet"}</p><p>${last?esc(last.result):"Run a prototype build to create a build record."}</p><button onclick="go('logs')">Open build center</button></div>
 </div>`;
}
function projects(){
 return `<div class="rowline"><div><h1>Projects</h1><p class="muted">Manage local FOX OS workspaces.</p></div><div><button onclick="newProject()">New project</button> <button onclick="importP()">Import</button> <button onclick="exportP()">Export</button></div></div>
 <div class="list" style="margin-top:14px"><div class="row"><span><b>${esc(state.project.name)}</b><br><span class="muted">${projectCount()} files • BONELAB • v${esc(state.project.version)}</span></span><span><button onclick="go('code')">Open</button> <button onclick="renameProject()">Rename</button></span></div></div>
 <div class="grid" style="margin-top:12px"><div class="card"><h2>Project settings</h2><div class="setting"><span>Target</span><b>${esc(state.project.target)}</b></div><div class="setting"><span>Owner</span><b>${esc(state.project.owner)}</b></div><div class="setting"><span>Version</span><b>${esc(state.project.version)}</b></div></div><div class="card"><h2>Workspace tools</h2><button onclick="duplicateProject()">Duplicate project</button> <button onclick="resetProject()">Reset sandbox</button></div></div>`;
}
function code(){
 const files=Object.keys(state.project.files);
 if(!state.project.files[file]) file=files[0]||"Main.cs";
 return `<div class="split"><div class="files">${files.map(x=>`<button class="${x===file?"active":""}" onclick="sel('${esc(x)}')">${esc(x)}</button>`).join("")}<button onclick="addFile()">＋ New file</button><button onclick="deleteFile()">Delete selected</button></div><div class="editor"><small><span>${esc(file)}</span><span>${esc(state.project.name)} • auto-save</span></small><textarea id="ed" spellcheck="false">${esc(state.project.files[file]||"")}</textarea></div></div>`;
}
function circuits(){
 return `<div class="rowline"><div><h1>FOX Circuits</h1><p class="muted">Interactive circuit sandbox. Drag chips, add nodes and run the prototype.</p></div><div><button onclick="addChip('Event')">+ Event</button><button onclick="addChip('Logic')">+ Logic</button><button onclick="runCircuit()">Run</button></div></div>
 <div id="circuit" class="circuit" style="margin-top:12px">
  <div class="chip" data-x="40" data-y="45" style="left:40px;top:45px">On Start</div>
  <div class="chip" data-x="270" data-y="145" style="left:270px;top:145px">Add Number</div>
  <div class="chip" data-x="500" data-y="260" style="left:500px;top:260px">Set Property</div>
 </div>
 <p class="tiny">Prototype only: circuit state is not yet compiled into BONELAB code.</p>`;
}
function simulator(){
 return `<h1>FOX OS Simulator</h1><p class="muted">Desktop preview of the in-game FOX OS interface.</p>
 <div class="sim"><div class="simbar"><b>FOX OS</b><span class="badge ok">SIMULATED</span></div><p class="muted">Home • ${esc(state.project.name)}</p>
 <div class="apps">${["Projects","Code","Circuits","Systems","Settings","Console"].map(x=>`<button onclick="simOpen('${x}')">${x}</button>`).join("")}</div>
 <div class="appwindow" id="simWindow"><b>FOX OS Home</b><p class="muted">This is a desktop approximation of the eventual BONELAB wrist interface.</p><p><span class="badge">Target: BONELAB</span> <span class="badge">Mode: ${esc(state.project.target)}</span></p></div></div>`;
}
function systems(){
 const rows=[["BoneLib","BONELAB core utilities","Planned"],["WristHub SDK","WristHub app integration","SDK available"],["LabFusion","Multiplayer layer","Planned"],["BoneAI","Structured game actions","Reference"],["MelonLoader / LemonLoader","Mod loading","Target"]];
 return `<h1>Systems</h1><p class="muted">Integration registry for FOX OS development.</p><input class="search" id="systemSearch" placeholder="Search systems..."><table><thead><tr><th>System</th><th>Purpose</th><th>State</th></tr></thead><tbody id="systemRows">${rows.map(r=>`<tr><td><b>${r[0]}</b></td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join("")}</tbody></table>`;
}
function browser(){
 const first=state.bookmarks[0]||"https://github.com/foxbin8766-oss/FoxOSC";
 return `<div class="browser"><div class="toolbar"><button onclick="browserBack()">‹</button><button onclick="browserForward()">›</button><button onclick="reload()">↻</button><input class="url" id="url" value="${esc(first)}" onkeydown="if(event.key==='Enter')nav()"><button onclick="nav()">Go</button><button onclick="bookmark()">☆</button><button onclick="chrome()">Chrome</button></div><iframe class="frame" id="frame" src="${esc(first)}"></iframe></div>`;
}
function logs(){
 return `<div class="rowline"><div><h1>Build / Logs</h1><p class="muted">Local prototype build center.</p></div><button class="primary" onclick="build()">Run build</button></div>
 <div class="log" id="log" style="margin-top:12px">FOX OS Development Console
----------------------------
Target: BONELAB code mod
Project: ${esc(state.project.name)}
Ready.</div>
 <div class="card" style="margin-top:12px"><h2>Build history</h2>${state.builds.length?state.builds.slice().reverse().map(b=>`<div class="row"><span>${esc(b.time)}</span><span>${esc(b.result)}</span></div>`).join(""):"<p class='muted'>No build history yet.</p>"}</div>`;
}
function docs(){
 return `<h1>FOX Docs</h1><p class="muted">Local reference and project notes.</p><div class="grid">
 <div class="card"><h2>FOX OS architecture</h2><p>Chromebook companion → project/code/circuit tooling → eventual BONELAB FOX OS code mod.</p></div>
 <div class="card"><h2>Integration notes</h2><p>Keep BoneLib, WristHub, LabFusion and loader-specific code behind clear adapters so the in-game mod remains portable.</p></div>
 <div class="card"><h2>Code templates</h2><button onclick="insertTemplate('BoneLib')">BoneLib entry</button> <button onclick="insertTemplate('WristHub')">WristHub app</button> <button onclick="insertTemplate('Event')">Event handler</button></div>
 <div class="card"><h2>Keyboard shortcuts</h2><p><kbd>Ctrl/Cmd + K</kbd> command palette</p><p><kbd>Ctrl/Cmd + S</kbd> save workspace</p><p><kbd>Ctrl/Cmd + B</kbd> build prototype</p></div>
 </div>`;
}
function settings(){
 return `<h1>Settings</h1><p class="muted">Personalize the companion without changing the BONELAB mod.</p>
 <div class="grid"><div class="card"><h2>Developer profile</h2>
 <div class="setting"><span>Display name</span><input id="owner" type="text" value="${esc(state.project.owner)}"></div>
 <div class="setting"><span>Accent color</span><input id="accent" type="color" value="${state.settings.accent||"#0796e6"}"></div>
 <div class="setting"><span>Compact interface</span><input id="compact" type="checkbox" ${state.settings.compact?"checked":""}></div>
 <button onclick="saveSettings()">Save settings</button></div>
 <div class="card"><h2>Data</h2><p class="muted">Everything here is stored locally in your browser/app.</p><button onclick="exportP()">Export workspace</button> <button onclick="importP()">Import workspace</button><button onclick="clearData()">Reset local data</button></div></div>`;
}
function bind(){
 if(view==="code"){const e=document.getElementById("ed");if(e)e.oninput=()=>{state.project.files[file]=e.value;save()}}
 if(view==="systems"){const s=document.getElementById("systemSearch");if(s)s.oninput=()=>{document.querySelectorAll("#systemRows tr").forEach(r=>r.style.display=r.textContent.toLowerCase().includes(s.value.toLowerCase())?"":"none")}}
 if(view==="circuits")enableChips();
}
function sel(x){file=x;render()}
function newProject(){const n=prompt("Project name","My FOX OS Mod");if(n){state.project={...defaults,name:n,files:{"Main.cs":"// FOX OS entry point\n"}};file="Main.cs";toast("Project created");go("code")}}
function renameProject(){const n=prompt("Project name",state.project.name);if(n){state.project.name=n;save();render()}}
function addFile(){const n=prompt("File name","App.cs");if(n&&!state.project.files[n]){state.project.files[n]="";file=n;save();render()}}
function deleteFile(){const files=Object.keys(state.project.files);if(files.length<=1){toast("Keep at least one file");return}if(confirm("Delete "+file+"?")){delete state.project.files[file];file=Object.keys(state.project.files)[0];save();render()}}
function duplicateProject(){state.project={...structuredClone(state.project),name:state.project.name+" Copy"};save();toast("Project duplicated");render()}
function resetProject(){if(confirm("Reset the sandbox project?")){state.project=structuredClone(defaults);file="Main.cs";state.builds=[];save();render()}}
function exportP(){const blob=new Blob([JSON.stringify(state.project,null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=(state.project.name||"foxos-project").replace(/[^a-z0-9_-]/gi,"_")+".json";a.click();URL.revokeObjectURL(a.href);toast("Project exported")}
function importP(){const input=document.createElement("input");input.type="file";input.accept=".json,application/json";input.onchange=()=>{const f=input.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const p=JSON.parse(r.result);if(!p.files)throw 0;state.project={...defaults,...p};file=Object.keys(state.project.files)[0];save();toast("Project imported");render()}catch{toast("Invalid FOX OS project file")}};r.readAsText(f)};input.click()}
function saveSettings(){state.project.owner=document.getElementById("owner").value||"Foxbin";state.settings.accent=document.getElementById("accent").value;state.settings.compact=document.getElementById("compact").checked;save();toast("Settings saved");render()}
function clearData(){if(confirm("Reset all FOX OS companion data?")){localStorage.removeItem("foxos_v03");location.reload()}}
function build(){go("logs");setTimeout(()=>{const box=document.getElementById("log");if(!box)return;const lines=["> fox build","✓ Project loaded","✓ Source files found","✓ BONELAB target selected","✓ Local validation passed","! DLL compilation connection is still a prototype","✓ Prototype build complete."];box.textContent+=`\n\n${lines.join("\n")}`;const result="Prototype build complete";state.builds.push({time:new Date().toLocaleString(),result});save();render();toast("Build complete")},80)}
function addChip(kind){const c=document.getElementById("circuit");if(!c)return;const el=document.createElement("div");el.className="chip";el.textContent=kind;el.style.left=(50+Math.random()*450)+"px";el.style.top=(40+Math.random()*280)+"px";c.appendChild(el);enableChip(el);toast(kind+" chip added")}
function enableChips(){document.querySelectorAll(".chip").forEach(enableChip)}
function enableChip(el){if(el.dataset.bound)return;el.dataset.bound="1";el.onpointerdown=e=>{e.preventDefault();const r=el.parentElement.getBoundingClientRect(),ox=e.clientX-el.offsetLeft,oy=e.clientY-el.offsetTop;el.setPointerCapture(e.pointerId);el.onpointermove=ev=>{el.style.left=Math.max(0,Math.min(r.width-el.offsetWidth,ev.clientX-r.left-ox))+"px";el.style.top=Math.max(0,Math.min(r.height-el.offsetHeight,ev.clientY-r.top-oy))+"px"};el.onpointerup=()=>{el.onpointermove=null}}}
function runCircuit(){toast("Circuit prototype executed");state.history.push("Circuit run");save()}
function simOpen(x){document.getElementById("simWindow").innerHTML=`<b>FOX OS ${esc(x)}</b><p class="muted">Simulator panel opened. This UI is a desktop preview of the future in-game app.</p><button onclick="toast('${x} action ready')">Test action</button>`}
function insertTemplate(type){const templates={BoneLib:`using BoneLib;\n\npublic void Start() {\n    // FOX OS startup code\n}\n`,WristHub:`// WristHub app template\npublic void InitializeApp() {\n    // Connect app UI here\n}\n`,Event:`// BONELAB event handler\nvoid OnEvent() {\n    // Handle event\n}\n`};state.project.files[file]=(state.project.files[file]||"")+"\n"+templates[type];save();go("code");toast(type+" template inserted")}
function nav(){let u=document.getElementById("url").value.trim();if(!/^https?:\/\//i.test(u))u="https://www.google.com/search?q="+encodeURIComponent(u);document.getElementById("frame").src=u;document.getElementById("url").value=u;state.history.push("Browser: "+u);save()}
function reload(){const f=document.getElementById("frame");f.src=f.src}
function chrome(){window.open(document.getElementById("url").value,"_blank")}
function bookmark(){const u=document.getElementById("url").value;if(u&&!state.bookmarks.includes(u)){state.bookmarks.push(u);save();toast("Bookmark saved")}else toast("Already bookmarked")}
function browserBack(){try{document.getElementById("frame").contentWindow.history.back()}catch{}}
function browserForward(){try{document.getElementById("frame").contentWindow.history.forward()}catch{}}
function simOpenApp(x){simOpen(x)}
function paletteOpen(){document.getElementById("palette").classList.remove("hidden");const i=document.getElementById("paletteInput");i.value="";paletteRender();i.focus()}
const commands=[["Go Home","home"],["Open Projects","projects"],["Open Code","code"],["Open Circuits","circuits"],["Launch Simulator","sim"],["Open Systems","systems"],["Open Browser","browser"],["Open Build Center","logs"],["Open Docs","docs"],["Open Settings","settings"],["New Project","new"]];
let pi=0;
function paletteRender(){const q=document.getElementById("paletteInput").value.toLowerCase();const list=commands.filter(x=>x[0].toLowerCase().includes(q));pi=Math.min(pi,list.length-1);document.getElementById("paletteResults").innerHTML=list.map((x,i)=>`<div class="palette-item ${i===pi?"active":""}" data-cmd="${x[1]}">${x[0]}</div>`).join("");document.querySelectorAll(".palette-item").forEach((e,i)=>e.onclick=()=>runCommand(e.dataset.cmd))}
function runCommand(c){document.getElementById("palette").classList.add("hidden");if(c==="new")newProject();else go(c)}
document.getElementById("commandBtn").onclick=paletteOpen;
document.getElementById("paletteInput").oninput=paletteRender;
document.getElementById("palette").onclick=e=>{if(e.target.id==="palette")e.currentTarget.classList.add("hidden")};
document.addEventListener("keydown",e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="k"){e.preventDefault();paletteOpen()}if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="s"){e.preventDefault();save();toast("Workspace saved")}if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="b"){e.preventDefault();build()}if(e.key==="Escape")document.getElementById("palette").classList.add("hidden")});
document.querySelectorAll("nav button").forEach(b=>b.onclick=()=>go(b.dataset.v));
document.getElementById("new").onclick=newProject;
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredInstall=e;const b=document.getElementById("installBtn");if(b){b.hidden=false;b.onclick=async()=>{deferredInstall.prompt();await deferredInstall.userChoice;deferredInstall=null;b.hidden=true}}});
window.addEventListener("appinstalled",()=>toast("FOX OS installed"));
window.addEventListener("load",()=>{const b=document.getElementById("installBtn");if(b&&window.matchMedia("(display-mode: standalone)").matches)b.hidden=true;});
render();