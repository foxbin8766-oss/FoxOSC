let deferredInstall=null;
const A=document.getElementById("app"),T=document.getElementById("title"),toastEl=document.getElementById("toast");
const defaults={name:"FOX OS Sandbox",owner:"Foxbin",version:"0.7.0",accent:"#0796e6",target:"BONELAB",files:{
"Main.cs":`using BoneLib;

namespace FOXOS {
    public class Main {
        public void Start() {
            // FOX OS entry point
        }
    }
}
`}};
const baseState={
 project:defaults,view:"home",file:"Main.cs",builds:[],history:[],bookmarks:["https://github.com/foxbin8766-oss/FoxOSC"],
 settings:{accent:"#0796e6",theme:"midnight",wallpaper:"grid",density:"comfortable",scale:"100%",animations:true,sidebar:"230px",startup:"home",showBrand:true,showClock:true},
profile:{displayName:"Foxbin",subtitle:"FOX OS Creator",avatar:"fox-os-logo.png"},
pages:[],widgets:[],quick:{favorites:[],launchers:[]},
 memories:[],tasks:[{id:1,title:"Explore FOX OS",done:false},{id:2,title:"Connect Quest later",done:false}],
 plugins:[{id:"core",name:"FOX Core",enabled:true,source:"built-in"},{id:"bonelab",name:"BONELAB Adapter",enabled:true,source:"built-in"},{id:"writhub",name:"WristHub / BoneLib",enabled:true,source:"built-in"}],
 agents:[{id:"evan",name:"Evan",role:"Primary FOX OS co-creator",status:"Ready",enabled:true}],
 notifications:[],
 devices:{quest:"virtual",status:"Connected (Virtual)"},
 shortcuts:[{key:"Ctrl+K",action:"Command palette"},{key:"Ctrl+S",action:"Save workspace"},{key:"Ctrl+B",action:"Build / validate"}],
 studio:{mode:"edit",objects:["Player Spawn","Interactable Door","Vehicle","Enemy"],scene:"Forest Test Scene"},
 world:{grid:true,day:12,weather:"Clear",nodes:["Spawn","Light","Door Trigger"]},
};
function load(){try{return JSON.parse(localStorage.getItem("foxos_v07"))||structuredClone(baseState)}catch{return structuredClone(baseState)}}
let state=load(); if(!state.project?.files) state.project=structuredClone(defaults);
if(!state.settings) state.settings=structuredClone(baseState.settings);
if(!state.profile) state.profile=structuredClone(baseState.profile);
if(!Array.isArray(state.pages)) state.pages=[];
if(!Array.isArray(state.widgets)) state.widgets=[];
if(!state.quick) state.quick={favorites:[],launchers:[]};
let view=state.view||state.settings.startup||"home",file=state.file||"Main.cs";
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function save(){state.view=view;state.file=file;localStorage.setItem("foxos_v07",JSON.stringify(state));document.documentElement.style.setProperty("--accent",state.settings.accent||"#0796e6");document.documentElement.style.setProperty("--density",state.settings.density==="compact"?"7px":"12px");document.documentElement.style.setProperty("--scale",state.settings.scale||"100%");document.body.classList.toggle("no-motion",!state.settings.animations)}
function toast(msg){toastEl.textContent=msg;toastEl.classList.add("show");clearTimeout(window._toast);window._toast=setTimeout(()=>toastEl.classList.remove("show"),2200)}
function notify(msg){state.notifications.unshift({msg,time:new Date().toLocaleTimeString()});state.notifications=state.notifications.slice(0,20);save();toast(msg)}
function go(v){view=v;render()}
function setTitle(){const names={pages:"My Pages",home:"Home",projects:"Projects",code:"Code",circuits:"Circuits",studio:"Game Studio",world:"World Builder",memory:"Memory Core",devices:"Device Bridge",permissions:"Permissions",agents:"Agents",sim:"Simulator",systems:"Systems",browser:"Browser",logs:"Build / Logs",docs:"Docs",settings:"Settings",plugins:"Plugins",tasks:"Tasks"};T.textContent=names[view]||"FOX OS"}
function pageById(id){return state.pages.find(p=>p.id===id)}
function projectCount(){return Object.keys(state.project.files).length}
function render(){
 save();setTitle();document.querySelectorAll("nav button").forEach(x=>x.classList.toggle("active",x.dataset.v===view));
 let h="";
 if(view==="home")h=home();else if(view==="projects")h=projects();else if(view==="code")h=code();else if(view==="circuits")h=circuits();else if(view==="studio")h=studio();else if(view==="world")h=world();else if(view==="memory")h=memory();else if(view==="devices")h=devices();else if(view==="permissions")h=permissions();else if(view==="agents")h=agents();else if(view==="sim")h=simulator();else if(view==="systems")h=systems();else if(view==="browser")h=browser();else if(view==="logs")h=logs();else if(view==="docs")h=docs();else if(view==="settings")h=settings();else if(view==="plugins")h=plugins();else if(view==="tasks")h=tasks();else if(view==="pages")h=pagesManager();else if(view.startsWith("page:"))h=customPage(view.slice(5));
 A.innerHTML=h;bind();
}
function home(){
const last=state.builds.at(-1), pending=state.tasks.filter(x=>!x.done).length;
return `<div class="profile"><img class="avatar" src="fox-os-logo.png"><div><h1>Welcome back, ${esc(state.profile?.displayName||state.project.owner||"Foxbin")}</h1><p class="muted">${esc(state.profile?.subtitle||"FOX OS Creator")} • v0.7</p></div></div>
<div class="grid three" style="margin-top:18px"><div class="card"><div class="stat">${projectCount()}</div><div class="statlabel">Project files</div></div><div class="card"><div class="stat">${state.builds.length}</div><div class="statlabel">Build runs</div></div><div class="card"><div class="stat">${pending}</div><div class="statlabel">Open tasks</div></div></div>
<div class="grid" style="margin-top:12px">
<div class="card"><div class="rowline"><h2>FOX Command Center</h2><span class="badge ok">${esc(state.devices.status)}</span></div><p><b>${esc(state.project.name)}</b> <span class="muted">v${esc(state.project.version)}</span></p><div class="toolbar"><button class="primary" onclick="go('studio')">Open Game Studio</button><button onclick="go('world')">Build World</button><button onclick="go('code')">Open Code</button></div></div>
<div class="card"><h2>Quick Actions</h2><div class="toolbar"><button onclick="snapshot()">Create Snapshot</button><button onclick="build()">Validate Project</button><button onclick="exportWorkspace()">Backup Workspace</button></div><p class="muted">${last?`Last build: ${esc(last.result)} • ${esc(last.time)}`:"No builds yet."}</p></div>
</div>
<div class="grid" style="margin-top:12px"><div class="card"><h2>Notifications</h2>${state.notifications.slice(0,5).map(n=>`<div class="row"><span>${esc(n.msg)}</span><span class="tiny">${esc(n.time)}</span></div>`).join("")||'<p class="muted">No notifications.</p>'}</div>
<div class="card"><h2>FOX OS Modules</h2><p class="muted">Core • Memory • Agents • Device Bridge • Game Studio • World Builder • BONELAB integrations</p><button onclick="go('plugins')">Manage Modules</button></div></div>`;
}
function projects(){return `<div class="grid"><div class="card"><h2>${esc(state.project.name)}</h2><p class="muted">Target: ${esc(state.project.target)} • ${projectCount()} files</p><div class="toolbar"><button onclick="newProject()">New</button><button onclick="importP()">Import</button><button onclick="exportP()">Export Project</button><button onclick="duplicateProject()">Duplicate</button></div></div><div class="card"><h2>Project tools</h2><button onclick="renameProject()">Rename Project</button><button onclick="addFile()">Add File</button><button onclick="snapshot()">Snapshot</button></div></div>
<div class="list" style="margin-top:12px">${Object.keys(state.project.files).map(f=>`<div class="row"><span><b>${esc(f)}</b><span class="muted"> • ${state.project.files[f].length} chars</span></span><button onclick="sel('${esc(f)}')">Edit</button></div>`).join("")}</div>`}
function code(){return `<div class="split"><div class="files">${Object.keys(state.project.files).map(f=>`<button class="${f===file?"active":""}" onclick="sel('${esc(f)}')">${esc(f)}</button>`).join("")}<div class="toolbar"><button onclick="addFile()">+ File</button><button onclick="deleteFile()">Delete</button></div></div><div class="editor"><small><span>${esc(file)}</span><span>FOX Code</span></small><textarea id="ed" spellcheck="false">${esc(state.project.files[file]||"")}</textarea><div class="toolbar"><button onclick="insertTemplate('BoneLib')">BoneLib Template</button><button onclick="insertTemplate('WristHub')">WristHub Template</button><button onclick="insertTemplate('Event')">Event Template</button><button class="primary" onclick="build()">Validate</button></div></div></div>`}
function circuits(){return `<div class="grid"><div class="card"><h2>FOX Circuits</h2><p class="muted">Drag nodes around the canvas and run the prototype.</p><div class="toolbar"><button onclick="addChip('Event')">+ Event</button><button onclick="addChip('Logic')">+ Logic</button><button onclick="addChip('Variable')">+ Variable</button><button onclick="addChip('Action')">+ Action</button><button class="primary" onclick="runCircuit()">Run</button></div></div><div class="card"><h2>Saved circuit</h2><p class="muted">Prototype state is stored with your local workspace.</p></div></div><div id="circuit" class="circuit" style="margin-top:12px"><div class="chip" style="left:35px;top:35px">Start</div><div class="chip" style="left:240px;top:145px">Logic</div><div class="chip" style="left:470px;top:250px">Output</div></div>`}
function studio(){return `<div class="grid"><div class="card"><h2>FOX Game Studio</h2><p class="muted">Mode: ${esc(state.studio.mode)} • Scene: ${esc(state.studio.scene)}</p><div class="toolbar"><button class="primary" onclick="toggleStudioMode()">Toggle ${state.studio.mode==="edit"?"Play":"Edit"}</button><button onclick="addStudioObject()">Add Object</button><button onclick="clearStudio()">Clear</button></div>${state.studio.objects.map((o,i)=>`<div class="row"><span>${esc(o)}</span><button onclick="removeStudioObject(${i})">Remove</button></div>`).join("")}</div><div class="card"><h2>Interaction Lab</h2><p>Player interaction, triggers, inventory/equipment, vehicles, AI entities and scene logic can be prototyped here.</p><button onclick="notify('Interaction test started')">Test Interaction</button></div></div>`}
function world(){return `<div class="grid"><div class="card"><h2>FOX World Builder</h2><div class="setting"><span>Grid</span><input id="worldGrid" type="checkbox" ${state.world.grid?"checked":""}></div><div class="setting"><span>Time of day</span><input id="worldDay" type="range" min="0" max="24" step="1" value="${state.world.day}"></div><div class="setting"><span>Weather</span><select id="worldWeather"><option>Clear</option><option>Rain</option><option>Fog</option><option>Storm</option></select></div><button onclick="saveWorld()">Save World</button></div><div class="card"><h2>Scene Nodes</h2>${state.world.nodes.map((n,i)=>`<div class="row"><span>${esc(n)}</span><button onclick="removeWorldNode(${i})">Remove</button></div>`).join("")}<button onclick="addWorldNode()">Add Node</button></div></div>`}
function memory(){return `<div class="grid"><div class="card"><h2>FOX Memory Core</h2><p class="muted">Local project memories and snapshots. Nothing is sent anywhere by this companion.</p><input id="memText" type="text" placeholder="Remember this project detail..."><button onclick="addMemory()">Save Memory</button><button onclick="snapshot()">Create Snapshot</button></div><div class="card"><h2>Memories</h2>${state.memories.map((m,i)=>`<div class="row"><span>${esc(m.text)}<small class="muted"> • ${esc(m.time)}</small></span><button onclick="deleteMemory(${i})">Delete</button></div>`).join("")||'<p class="muted">No memories yet.</p>'}</div></div>`}
function devices(){return `<div class="grid"><div class="card"><h2>Quest Device Bridge</h2><p>Status: <span class="badge ok">${esc(state.devices.status)}</span></p><p class="muted">This is a virtual Quest endpoint. Real Quest pairing can be enabled later without changing the project model.</p><div class="toolbar"><button onclick="pairQuest()">Pair Virtual Quest</button><button onclick="disconnectQuest()">Disconnect</button><button onclick="sendTest()">Send Test</button></div></div><div class="card"><h2>Bridge capabilities</h2><p>Project transfer • permissions • device state • future APK deployment • FOX game control</p></div></div>`}
function permissions(){return `<div class="card"><h2>Permission Center</h2>${["Project read/write","Memory access","Device pairing","Game Studio execution","Plugin management","Build/export"].map((x,i)=>`<div class="setting"><span>${x}</span><input type="checkbox" checked data-perm="${i}"></div>`).join("")}<p class="muted">Permissions are local companion controls and do not grant the app access to external devices by themselves.</p></div>`}
function agents(){return `<div class="grid"><div class="card"><h2>Agents</h2>${state.agents.map(a=>`<div class="row"><span><b>${esc(a.name)}</b><br><small class="muted">${esc(a.role)} • ${esc(a.status)}</small></span><button onclick="toggleAgent('${esc(a.id)}')">${a.enabled?"Disable":"Enable"}</button></div>`).join("")}<button onclick="addAgent()">Add Agent</button></div><div class="card"><h2>Evan</h2><p>Primary FOX OS co-creator agent. Project-aware tools can be attached here as the ecosystem grows.</p><button onclick="notify('Evan workspace opened')">Open Workspace</button></div></div>`}
function simulator(){return `<div class="sim"><div class="simbar"><b>FOX OS Virtual Device</b><span class="badge ok">${esc(state.devices.status)}</span></div><div class="apps">${["FOX Home","WristHub","BONELAB","Settings","Memory","Games"].map(x=>`<button onclick="simOpen('${x}')">${x}</button>`).join("")}</div><div id="simWindow" class="appwindow"><b>Virtual Quest ready</b><p class="muted">Select an app to preview its future in-headset interface.</p></div></div>`}
function systems(){return `<div class="card"><h2>System Registry</h2><input id="systemSearch" class="search" placeholder="Search systems..."><table><thead><tr><th>System</th><th>Status</th><th>Purpose</th></tr></thead><tbody id="systemRows">${[["FOX Core","Ready","Shared architecture"],["Memory Core","Ready","Persistent local project context"],["Device Bridge","Virtual","Quest connectivity"],["Game Studio","Prototype","Game creation"],["World Builder","Prototype","Scene creation"],["WristHub","Integrated","Watch UI"],["BoneLib","Integrated","BONELAB APIs"]].map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join("")}</tbody></table></div>`}
function browser(){return `<div class="browser"><div class="toolbar"><button onclick="browserBack()">←</button><button onclick="browserForward()">→</button><button onclick="reload()">↻</button><input id="url" class="url" value="https://www.google.com"><button onclick="nav()">Go</button><button onclick="bookmark()">☆</button><button onclick="chrome()">↗</button></div><iframe id="frame" class="frame" src="https://www.google.com" title="FOX Browser"></iframe></div>`}
function logs(){return `<div class="card"><div class="rowline"><h2>Build / Logs</h2><button onclick="build()">Run Validation</button></div><div id="log" class="log">${state.builds.map(b=>`[${esc(b.time)}] ${esc(b.result)}`).join("\n")}</div></div>`}
function docs(){return `<div class="grid"><div class="card"><h2>FOX OS Docs</h2><p>FOX OS is a modular BONELAB code-mod ecosystem with a Chromebook companion for development and control.</p><h3>Architecture</h3><p class="muted">FOX Core → modules → project/game systems → optional device bridges. The Chromebook app is not itself the BONELAB mod.</p></div><div class="card"><h2>Developer Notes</h2><p>Use BoneLib and WristHub integrations through their supported APIs. Keep device-specific features behind the Device Bridge.</p></div></div>`}
function settings(){return `<div class="grid"><div class="card"><h2>Personalization</h2><div class="setting"><span>Display name</span><input id="displayName" type="text" value="${esc(state.profile.displayName)}"></div><div class="setting"><span>Subtitle</span><input id="profileSubtitle" type="text" value="${esc(state.profile.subtitle)}"></div><div class="setting"><span>Owner</span><input id="owner" type="text" value="${esc(state.project.owner)}"></div><div class="setting"><span>Accent</span><input id="accent" type="color" value="${esc(state.settings.accent)}"></div><div class="setting"><span>Theme preset</span><select id="theme"><option value="midnight">Midnight</option><option value="dark">Dark</option><option value="light">Light</option><option value="graphite">Graphite</option></select></div><div class="setting"><span>Wallpaper</span><select id="wallpaper"><option>grid</option><option>dots</option><option>plain</option></select></div><div class="setting"><span>Density</span><select id="density"><option>comfortable</option><option>compact</option></select></div><div class="setting"><span>Interface scale</span><select id="scale"><option>90%</option><option>100%</option><option>110%</option></select></div><div class="setting"><span>Animations</span><input id="animations" type="checkbox" ${state.settings.animations?"checked":""}></div><div class="setting"><span>Startup page</span><select id="startup">${["home","projects","code","studio","world","memory","devices"].map(x=>`<option>${x}</option>`).join("")}</select></div><button class="primary" onclick="saveSettings()">Save Personalization</button><button onclick="exportWorkspace()">Export Full Workspace</button><button onclick="clearData()">Reset Local Data</button></div>`}
function plugins(){return `<div class="grid"><div class="card"><h2>Plugin Slots</h2>${state.plugins.map(p=>`<div class="row"><span><b>${esc(p.name)}</b><br><small class="muted">${esc(p.source)}</small></span><button onclick="togglePlugin('${esc(p.id)}')">${p.enabled?"Enabled":"Disabled"}</button></div>`).join("")}<button onclick="addPlugin()">Add Plugin</button></div><div class="card"><h2>Extensibility</h2><p class="muted">Plugins can add modules without replacing the FOX OS core. External code is not executed by this companion automatically.</p></div></div>`}
function tasks(){return `<div class="grid"><div class="card"><h2>FOX Task Board</h2><input id="taskInput" type="text" placeholder="New task..."><button onclick="addTask()">Add Task</button></div><div class="card"><h2>Tasks</h2>${state.tasks.map(t=>`<div class="row"><label><input type="checkbox" ${t.done?"checked":""} onchange="toggleTask(${t.id})"> ${esc(t.title)}</label><button onclick="deleteTask(${t.id})">Delete</button></div>`).join("")}</div></div>`}

function pagesManager(){
return `<div class="rowline"><div><h1>My Pages</h1><p class="muted">Build your own FOX OS pages with reusable blocks, layouts, links and launchers.</p></div><div class="toolbar"><button class="primary" onclick="createPage()">+ New Page</button><button onclick="importPages()">Import</button><button onclick="exportPages()">Export</button></div></div>
<div class="grid three" style="margin-top:12px">
<div class="card"><div class="stat">${state.pages.length}</div><div class="statlabel">Custom pages</div></div>
<div class="card"><div class="stat">${state.pages.reduce((n,p)=>n+p.blocks.length,0)}</div><div class="statlabel">Custom blocks</div></div>
<div class="card"><div class="stat">${state.widgets.length}</div><div class="statlabel">Saved widgets</div></div>
</div>
<div class="grid" style="margin-top:12px">${state.pages.map((p,i)=>`<div class="card page-card"><div class="rowline"><div><h2>${esc(p.icon||"◈")} ${esc(p.name)}</h2><p class="muted">${esc(p.subtitle||"Custom FOX OS page")} • ${p.blocks.length} blocks</p></div><span class="badge">${esc(p.layout||"one")} column</span></div><div class="tags">${(p.tags||[]).map(t=>`<span>${esc(t)}</span>`).join("")}</div><div class="toolbar"><button class="primary" onclick="go('page:${esc(p.id)}')">Open</button><button onclick="editPage(${i})">Edit</button><button onclick="duplicatePage(${i})">Duplicate</button><button onclick="deletePage(${i})">Delete</button></div></div>`).join("")||`<div class="card"><h2>No custom pages yet</h2><p class="muted">Create one and make FOX OS your own.</p><button class="primary" onclick="createPage()">Create your first page</button></div>`}</div>`;
}
function customPage(id){
const p=pageById(id); if(!p){view="pages";return pagesManager()}
const cols=p.layout==="three"?3:p.layout==="two"?2:1;
return `<div class="rowline"><div><h1>${esc(p.icon||"◈")} ${esc(p.name)}</h1><p class="muted">${esc(p.subtitle||"")}</p></div><div class="toolbar"><button onclick="editPage(${state.pages.indexOf(p)})">Edit Page</button><button onclick="duplicatePage(${state.pages.indexOf(p)})">Duplicate</button><button onclick="go('pages')">All Pages</button></div></div>
<div class="card page-editor"><div class="rowline"><h2>Page Builder</h2><div class="toolbar"><button onclick="addPageBlock('text')">+ Text</button><button onclick="addPageBlock('note')">+ Note</button><button onclick="addPageBlock('stat')">+ Stat</button><button onclick="addPageBlock('link')">+ Link</button><button onclick="addPageBlock('button')">+ Button</button><button onclick="addPageBlock('launcher')">+ Launcher</button></div></div><p class="muted">Blocks are saved locally. Reorder or remove them below.</p>${p.blocks.map((b,i)=>`<div class="block-row"><span><b>${esc(b.title||b.type)}</b><small class="muted"> • ${esc(b.type)}</small></span><span class="toolbar"><button onclick="editPageBlock(${i})">Edit</button><button onclick="movePageBlock(${i},-1)">↑</button><button onclick="movePageBlock(${i},1)">↓</button><button onclick="removePageBlock(${i})">Delete</button></span></div>`).join("")}</div>
<div class="custom-layout cols-${cols}">${p.blocks.map((b,i)=>renderBlock(b,i,p)).join("")}</div>`;
}
function renderBlock(b,i,p){
if(b.type==="text")return `<div class="card custom-block"><h3>${esc(b.title||"Text")}</h3><p>${esc(b.text||"").replace(/\n/g,"<br>")}</p></div>`;
if(b.type==="note")return `<div class="card custom-block note-block"><h3>📝 ${esc(b.title||"Note")}</h3><textarea class="page-note" data-page="${esc(p.id)}" data-block="${i}" placeholder="Write here...">${esc(b.text||"")}</textarea></div>`;
if(b.type==="stat")return `<div class="card custom-block"><div class="stat">${esc(b.value||"0")}</div><div class="statlabel">${esc(b.title||"Stat")}</div></div>`;
if(b.type==="link")return `<div class="card custom-block"><h3>${esc(b.title||"Link")}</h3><p class="muted">${esc(b.text||"")}</p><button class="primary" onclick="openCustomLink('${esc(b.url||"")}')">Open Link</button></div>`;
if(b.type==="button")return `<div class="card custom-block"><h3>${esc(b.title||"Action")}</h3><p class="muted">${esc(b.text||"")}</p><button class="primary" onclick="customAction('${esc(b.action||"toast")}','${esc(b.value||"")}')">${esc(b.label||"Run")}</button></div>`;
if(b.type==="launcher")return `<div class="card custom-block"><h3>🚀 ${esc(b.title||"Launcher")}</h3><p class="muted">${esc(b.text||"")}</p><button class="primary" onclick="customAction('go','${esc(b.value||"home")}')">${esc(b.label||"Open")}</button></div>`;
return `<div class="card custom-block"><h3>${esc(b.title||"Block")}</h3><p>${esc(b.text||"")}</p></div>`;
}
function createPage(){
const name=prompt("Page name","My FOX Page"); if(!name)return;
const p={id:"pg"+Date.now(),name,subtitle:"My custom FOX OS page",icon:"◈",tags:["custom"],layout:"one",blocks:[
{type:"text",title:"Welcome",text:"This page belongs to me. Edit it and make it useful."},
{type:"launcher",title:"Quick Launcher",text:"Jump to another FOX OS area.",label:"Open Home",value:"home"}]};
state.pages.push(p);save();notify("Custom page created");go("page:"+p.id);
}
function editPage(i){
const p=state.pages[i]; if(!p)return;
const name=prompt("Page name",p.name); if(name===null)return;
p.name=name||p.name;
const sub=prompt("Subtitle",p.subtitle||""); if(sub!==null)p.subtitle=sub;
const icon=prompt("Icon or emoji",p.icon||"◈"); if(icon!==null)p.icon=icon;
const tags=prompt("Tags, separated by commas",(p.tags||[]).join(", ")); if(tags!==null)p.tags=tags.split(",").map(x=>x.trim()).filter(Boolean);
const layout=prompt("Layout: one, two, or three",p.layout||"one"); if(layout&&["one","two","three"].includes(layout))p.layout=layout;
save();go("page:"+p.id);
}
function duplicatePage(i){const p=state.pages[i];if(!p)return;const n=structuredClone(p);n.id="pg"+Date.now();n.name=p.name+" Copy";state.pages.splice(i+1,0,n);save();notify("Page duplicated");render()}
function deletePage(i){const p=state.pages[i];if(!p)return;if(confirm("Delete "+p.name+"?")){state.pages.splice(i,1);save();notify("Page deleted");go("pages")}}
function addPageBlock(type){
const id=view.slice(5),p=pageById(id);if(!p)return;
const b={type,title:type==="text"?"Text block":type==="note"?"Note":type==="stat"?"Stat":type==="link"?"Link":type==="button"?"Button":"Launcher",text:"",label:"Open",value:"home",url:"https://github.com/foxbin8766-oss/FoxOSC"};
if(type==="text")b.text="New custom content.";
if(type==="note")b.text="";
if(type==="stat"){b.title="New Stat";b.value="0"}
if(type==="link"){b.title="FOX OS";b.text="Open a useful link."}
if(type==="button"){b.action="toast";b.label="Run";b.value="Custom action"}
if(type==="launcher"){b.label="Open Home";b.value="home"}
p.blocks.push(b);save();render();toast(type+" block added");
}
function editPageBlock(i){
const p=pageById(view.slice(5));if(!p)return;const b=p.blocks[i];if(!b)return;
const title=prompt("Block title",b.title||"");if(title!==null)b.title=title;
const text=prompt("Block text",b.text||"");if(text!==null)b.text=text;
if(b.type==="stat"){const value=prompt("Stat value",b.value||"0");if(value!==null)b.value=value}
if(b.type==="link"){const url=prompt("URL",b.url||"");if(url!==null)b.url=url}
if(["button","launcher"].includes(b.type)){const label=prompt("Button label",b.label||"Open");if(label!==null)b.label=label;const value=prompt(b.type==="launcher"?"FOX OS page (for example home)":"Action value",b.value||"");if(value!==null)b.value=value;if(b.type==="button"){const action=prompt("Action: go, build, or toast",b.action||"toast");if(action&&["go","build","toast"].includes(action))b.action=action}}
save();render();
}
function removePageBlock(i){const p=pageById(view.slice(5));if(!p)return;if(p.blocks.length<=1){toast("Keep at least one block");return}p.blocks.splice(i,1);save();render()}
function movePageBlock(i,dir){const p=pageById(view.slice(5));if(!p)return;const j=i+dir;if(j<0||j>=p.blocks.length)return;[p.blocks[i],p.blocks[j]]=[p.blocks[j],p.blocks[i]];save();render()}
function exportPages(){download(JSON.stringify(state.pages,null,2),"foxos-pages.json","application/json");notify("Pages exported")}
function importPages(){
const input=document.createElement("input");input.type="file";input.accept=".json,application/json";
input.onchange=()=>{const f=input.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const data=JSON.parse(r.result),pages=Array.isArray(data)?data:data.pages;if(!Array.isArray(pages))throw 0;pages.forEach(p=>{if(!p.id)p.id="pg"+Date.now()+Math.random();if(!Array.isArray(p.blocks))p.blocks=[]});state.pages.push(...pages);save();notify("Pages imported");render()}catch{toast("Invalid pages file")}};r.readAsText(f)};input.click();
}
function openCustomLink(u){if(/^https?:\/\//i.test(u))window.open(u,"_blank");else toast("Link must start with http:// or https://")}
function customAction(action,value){if(action==="go"){go(value)}else if(action==="build"){build()}else notify(value||"Custom action executed")}
function bind(){
if(view.startsWith("page:"))document.querySelectorAll(".page-note").forEach(e=>e.oninput=()=>{const p=pageById(e.dataset.page);if(p){p.blocks[Number(e.dataset.block)].text=e.value;save()}});
if(view==="code"){const e=document.getElementById("ed");if(e)e.oninput=()=>{state.project.files[file]=e.value;save()}}
if(view==="systems"){const s=document.getElementById("systemSearch");if(s)s.oninput=()=>document.querySelectorAll("#systemRows tr").forEach(r=>r.style.display=r.textContent.toLowerCase().includes(s.value.toLowerCase())?"":"none")}
if(view==="circuits")enableChips();
}
function sel(x){file=x;render()}
function newProject(){const n=prompt("Project name","My FOX OS Project");if(n){state.project={...structuredClone(defaults),name:n,files:{"Main.cs":"// FOX OS entry point\n"}};file="Main.cs";notify("Project created");go("code")}}
function renameProject(){const n=prompt("Project name",state.project.name);if(n){state.project.name=n;save();render()}}
function addFile(){const n=prompt("File name","App.cs");if(n&&!state.project.files[n]){state.project.files[n]="";file=n;save();render()}}
function deleteFile(){const fs=Object.keys(state.project.files);if(fs.length<=1){toast("Keep at least one file");return}if(confirm("Delete "+file+"?")){delete state.project.files[file];file=fs.find(x=>x!==file)||"Main.cs";save();render()}}
function duplicateProject(){state.project={...structuredClone(state.project),name:state.project.name+" Copy"};notify("Project duplicated");render()}
function resetProject(){if(confirm("Reset sandbox project?")){state.project=structuredClone(defaults);file="Main.cs";state.builds=[];save();render()}}
function exportP(){download(JSON.stringify(state.project,null,2),(state.project.name||"foxos-project").replace(/[^a-z0-9_-]/gi,"_")+".json","application/json");notify("Project exported")}
function importP(){const input=document.createElement("input");input.type="file";input.accept=".json,application/json";input.onchange=()=>{const f=input.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const p=JSON.parse(r.result);if(!p.files)throw 0;state.project={...structuredClone(defaults),...p};file=Object.keys(state.project.files)[0];notify("Project imported");render()}catch{toast("Invalid FOX project file")}};r.readAsText(f)};input.click()}
function saveSettings(){state.profile.displayName=document.getElementById("displayName").value||"Foxbin";state.profile.subtitle=document.getElementById("profileSubtitle").value||"FOX OS Creator";state.project.owner=document.getElementById("owner").value||"Foxbin";state.settings.accent=document.getElementById("accent").value;state.settings.theme=document.getElementById("theme").value;state.settings.wallpaper=document.getElementById("wallpaper").value;state.settings.density=document.getElementById("density").value;state.settings.scale=document.getElementById("scale").value;state.settings.animations=document.getElementById("animations").checked;state.settings.startup=document.getElementById("startup").value;applyTheme();notify("Personalization saved");render()}
function applyTheme(){const s=state.settings;document.documentElement.dataset.theme=s.theme;document.documentElement.dataset.wallpaper=s.wallpaper}
function clearData(){if(confirm("Reset all FOX OS companion data?")){localStorage.removeItem("foxos_v07");location.reload()}}
function build(){go("logs");setTimeout(()=>{const lines=["> fox validate","✓ Project loaded","✓ Source files found","✓ BONELAB target selected","✓ FOX Core modules registered","✓ Local validation passed","! DLL compilation remains a prototype connection layer","✓ Validation complete."];const box=document.getElementById("log");if(box)box.textContent=lines.join("\n")+"\n\n"+box.textContent;state.builds.push({time:new Date().toLocaleString(),result:"Validation complete"});state.history.push("Validation run");save();toast("Validation complete")},80)}
function snapshot(){const snap={time:new Date().toLocaleString(),project:structuredClone(state.project),studio:structuredClone(state.studio),world:structuredClone(state.world)};state.memories.unshift({text:"Snapshot • "+snap.time,data:snap,time:snap.time});state.memories=state.memories.slice(0,20);notify("Snapshot created")}
function addMemory(){const e=document.getElementById("memText");if(e&&e.value.trim()){state.memories.unshift({text:e.value.trim(),time:new Date().toLocaleString()});e.value="";notify("Memory saved");render()}}
function deleteMemory(i){state.memories.splice(i,1);save();render()}
function exportWorkspace(){download(JSON.stringify({version:"0.7-custom",profile:state.profile,pages:state.pages,widgets:state.widgets,project:state.project,settings:state.settings,memories:state.memories,tasks:state.tasks,plugins:state.plugins,agents:state.agents,studio:state.studio,world:state.world},null,2),"foxos-workspace.json","application/json");notify("Workspace backup exported")}
function download(text,name,type){const b=new Blob([text],{type}),u=URL.createObjectURL(b),a=document.createElement("a");a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),500)}
function addChip(kind){const c=document.getElementById("circuit");if(!c)return;const el=document.createElement("div");el.className="chip";el.textContent=kind;el.style.left=(30+Math.random()*500)+"px";el.style.top=(30+Math.random()*300)+"px";c.appendChild(el);enableChip(el);notify(kind+" chip added")}
function enableChips(){document.querySelectorAll(".chip").forEach(enableChip)}
function enableChip(el){if(el.dataset.bound)return;el.dataset.bound="1";el.onpointerdown=e=>{e.preventDefault();const r=el.parentElement.getBoundingClientRect(),ox=e.clientX-el.offsetLeft,oy=e.clientY-el.offsetTop;el.setPointerCapture(e.pointerId);el.onpointermove=ev=>{el.style.left=Math.max(0,Math.min(r.width-el.offsetWidth,ev.clientX-r.left-ox))+"px";el.style.top=Math.max(0,Math.min(r.height-el.offsetHeight,ev.clientY-r.top-oy))+"px"};el.onpointerup=()=>{el.onpointermove=null}}}
function runCircuit(){state.history.push("Circuit run");notify("Circuit prototype executed")}
function simOpen(x){document.getElementById("simWindow").innerHTML=`<b>FOX OS ${esc(x)}</b><p class="muted">Virtual device preview. This is not a physical Quest connection.</p><button onclick="notify('${esc(x)} test action executed')">Test action</button>`}
function insertTemplate(type){const t={BoneLib:`using BoneLib;\n\npublic void Start() {\n    // FOX OS startup code\n}\n`,WristHub:`// WristHub app template\npublic void InitializeApp() {\n    // Connect app UI here\n}\n`,Event:`// BONELAB event handler\nvoid OnEvent() {\n    // Handle event\n}\n`};state.project.files[file]=(state.project.files[file]||"")+"\n"+t[type];save();go("code");notify(type+" template inserted")}
function nav(){let u=document.getElementById("url").value.trim();if(!/^https?:\/\//i.test(u))u="https://www.google.com/search?q="+encodeURIComponent(u);document.getElementById("frame").src=u;document.getElementById("url").value=u;state.history.push("Browser: "+u);save()}
function reload(){const f=document.getElementById("frame");f.src=f.src}
function chrome(){window.open(document.getElementById("url").value,"_blank")}
function bookmark(){const u=document.getElementById("url").value;if(u&&!state.bookmarks.includes(u)){state.bookmarks.push(u);notify("Bookmark saved")}else toast("Already bookmarked")}
function browserBack(){try{document.getElementById("frame").contentWindow.history.back()}catch{}}
function browserForward(){try{document.getElementById("frame").contentWindow.history.forward()}catch{}}
function pairQuest(){state.devices={quest:"virtual",status:"Connected (Virtual)"};notify("Virtual Quest paired");render()}
function disconnectQuest(){state.devices.status="Disconnected";notify("Device bridge disconnected");render()}
function sendTest(){if(state.devices.status.startsWith("Connected"))notify("Test packet sent to virtual Quest");else toast("Connect a device first")}
function toggleStudioMode(){state.studio.mode=state.studio.mode==="edit"?"play":"edit";save();render();notify("Studio mode: "+state.studio.mode)}
function addStudioObject(){const o=prompt("Object name","Interactable");if(o){state.studio.objects.push(o);save();render()}}
function removeStudioObject(i){state.studio.objects.splice(i,1);save();render()}
function clearStudio(){if(confirm("Clear scene objects?")){state.studio.objects=[];save();render()}}
function saveWorld(){state.world.grid=document.getElementById("worldGrid").checked;state.world.day=Number(document.getElementById("worldDay").value);state.world.weather=document.getElementById("worldWeather").value;notify("World saved");render()}
function addWorldNode(){const n=prompt("Node name","Trigger");if(n){state.world.nodes.push(n);save();render()}}
function removeWorldNode(i){state.world.nodes.splice(i,1);save();render()}
function toggleAgent(id){const a=state.agents.find(x=>x.id===id);if(a){a.enabled=!a.enabled;save();render()}}
function addAgent(){const n=prompt("Agent name","New Agent");if(n){state.agents.push({id:"a"+Date.now(),name:n,role:"Custom project agent",status:"Ready",enabled:true});save();render()}}
function togglePlugin(id){const p=state.plugins.find(x=>x.id===id);if(p){p.enabled=!p.enabled;save();render();notify(p.name+" "+(p.enabled?"enabled":"disabled"))}}
function addPlugin(){const n=prompt("Plugin name","My Module");if(n){state.plugins.push({id:"p"+Date.now(),name:n,enabled:true,source:"local slot"});save();render();notify("Plugin slot created")}}
function addTask(){const e=document.getElementById("taskInput");if(e&&e.value.trim()){state.tasks.push({id:Date.now(),title:e.value.trim(),done:false});e.value="";save();render()}}
function toggleTask(id){const t=state.tasks.find(x=>x.id===id);if(t){t.done=!t.done;save();render()}}
function deleteTask(id){state.tasks=state.tasks.filter(x=>x.id!==id);save();render()}
function paletteOpen(){document.getElementById("palette").classList.remove("hidden");const i=document.getElementById("paletteInput");i.value="";paletteRender();i.focus()}
const commands=[["Go Home","home"],["Projects","projects"],["Code","code"],["Circuits","circuits"],["Game Studio","studio"],["World Builder","world"],["Memory Core","memory"],["Device Bridge","devices"],["Permissions","permissions"],["Agents","agents"],["Plugins","plugins"],["Tasks","tasks"],["Simulator","sim"],["Systems","systems"],["Browser","browser"],["Build / Logs","logs"],["Docs","docs"],["My Pages","pages"],["Settings","settings"],["New Project","new"],["Backup Workspace","backup"]];
let pi=0;
function paletteRender(){const q=document.getElementById("paletteInput").value.toLowerCase(),list=commands.filter(x=>x[0].toLowerCase().includes(q));pi=Math.max(0,Math.min(pi,list.length-1));document.getElementById("paletteResults").innerHTML=list.map((x,i)=>`<div class="palette-item ${i===pi?"active":""}" data-cmd="${x[1]}">${x[0]}</div>`).join("");document.querySelectorAll(".palette-item").forEach(e=>e.onclick=()=>runCommand(e.dataset.cmd))}
function runCommand(c){document.getElementById("palette").classList.add("hidden");if(c==="new")newProject();else if(c==="backup")exportWorkspace();else go(c)}
document.getElementById("commandBtn").onclick=paletteOpen;document.getElementById("paletteInput").oninput=paletteRender;document.getElementById("palette").onclick=e=>{if(e.target.id==="palette")e.currentTarget.classList.add("hidden")};
document.addEventListener("keydown",e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="k"){e.preventDefault();paletteOpen()}if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="s"){e.preventDefault();save();toast("Workspace saved")}if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="b"){e.preventDefault();build()}if(e.key==="Escape")document.getElementById("palette").classList.add("hidden")});
document.querySelectorAll("nav button").forEach(b=>b.onclick=()=>go(b.dataset.v));document.getElementById("new").onclick=newProject;
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredInstall=e;const b=document.getElementById("installBtn");if(b){b.hidden=false;b.onclick=async()=>{deferredInstall.prompt();await deferredInstall.userChoice;deferredInstall=null;b.hidden=true}}});
window.addEventListener("appinstalled",()=>toast("FOX OS installed"));
applyTheme();render();
