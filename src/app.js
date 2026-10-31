/* ===== App ===== */
const $=s=>document.querySelector(s);
function h(tag,props,...kids){const e=document.createElement(tag);
 if(props)for(const k in props){const v=props[k];if(v==null||v===false)continue;
  if(k.startsWith("on")&&typeof v==="function")e.addEventListener(k.slice(2),v);
  else if(k==="class")e.className=v;else if(k==="style")e.style.cssText=v;else if(k==="value")e.value=v;else if(k==="checked")e.checked=!!v;else e.setAttribute(k,v===true?"":v);}
 for(const c of kids.flat(9)){if(c==null||c===false)continue;e.appendChild(typeof c==="object"?c:document.createTextNode(String(c)));}
 return e;}
const svgIcon=(d,s=18)=>{const e=document.createElementNS(SVGNS,"svg");e.setAttribute("width",s);e.setAttribute("height",s);e.setAttribute("viewBox","0 0 24 24");e.setAttribute("fill","none");e.setAttribute("stroke","currentColor");e.setAttribute("stroke-width","2");e.setAttribute("stroke-linecap","round");e.setAttribute("stroke-linejoin","round");e.innerHTML=d;return e;};
const IC={play:'<path d="M7 4.5v15l12-7.5z" fill="currentColor" stroke="none"/>',pause:'<path d="M7 5v14M17 5v14" stroke-width="3"/>',prev:'<path d="M18 5L9 12l9 7zM6 5v14"/>',next:'<path d="M6 5l9 7-9 7zM18 5v14"/>',replay:'<path d="M4 12a8 8 0 108-8H7M7 1v3.5h3.5"/>',mag:'<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',spark:'<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6"/>',flag:'<path d="M5 21V4h11l-2 4 2 4H5"/>',up:'<path d="M12 19V5M5 12l7-7 7 7"/>',down:'<path d="M12 5v14M5 12l7 7 7-7"/>',x:'<path d="M6 6l12 12M18 6L6 18"/>',plus:'<path d="M12 5v14M5 12h14"/>'};
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const now=()=>Date.now();const DAY=864e5;
function toast(msg){const t=h("div",{class:"toast",role:"status"},msg);document.body.appendChild(t);setTimeout(()=>t.remove(),2800);}

/* ----- State & persistence ----- */
const LS_KEY="az104coach.v1";
let S={v:1,updatedAt:0,watched:{},att:{},srs:{},cards:{},history:[],session:{lessons:[],start:0},settings:{voice:true,rate:1}};
let GEN={};
try{const raw=localStorage.getItem(LS_KEY);if(raw){const o=JSON.parse(raw);if(o&&o.S)S=Object.assign(S,o.S);if(o&&o.GEN)GEN=o.GEN;}}catch(e){}
let DB=null,UID=null,AI=null,saveT=null;
function save(){S.updatedAt=now();try{localStorage.setItem(LS_KEY,JSON.stringify({S,GEN}));}catch(e){}
 clearTimeout(saveT);saveT=setTimeout(()=>{if(DB&&UID)DB.doc("data/users/"+UID+"/state").set({blob:JSON.stringify(S),updatedAt:S.updatedAt}).catch(()=>{});},1500);}
function saveGen(slug){save();if(DB&&UID)DB.doc("data/users/"+UID+"/g_"+slug).set({blob:JSON.stringify(GEN[slug]),updatedAt:now()}).catch(()=>{});}
async function boot(){
 if(!window.claude||!window.claude.use)return;
 claude.use("sample").then(s=>{AI=s;rerenderSoft();}).catch(()=>{});
 try{const [db,user]=await Promise.all([claude.use("db"),claude.use("user")]);
  if(!db||!user)return;const id=await user.id();if(!id)return;DB=db;UID=id;
  const snap=await db.doc("data/users/"+id+"/state").get();
  if(snap.exists){const d=snap.data();if(d&&d.updatedAt>S.updatedAt){try{S=Object.assign(S,JSON.parse(d.blob));}catch(e){}}}
  else if(S.updatedAt)save();
  const col=await db.collection("data/users/"+id).get();
  col.docs.forEach(doc=>{if(doc.id.startsWith("g_")){try{const L=JSON.parse(doc.data().blob);if(L&&L.id)GEN[L.id]=L;}catch(e){}}});
  try{localStorage.setItem(LS_KEY,JSON.stringify({S,GEN}));}catch(e){}
  rerenderSoft();
 }catch(e){}
}
function rerenderSoft(){if(VIEW.name==="home"||VIEW.name==="review")render();else if(VIEW.name==="player")updateAskVisibility();}

/* ----- Lookup helpers ----- */
const allLessons=()=>Object.assign({},GEN,LESSONS);
const getLesson=id=>LESSONS[id]||GEN[id];
function allQuestions(){const out=QUESTIONS.slice();for(const k in GEN)(GEN[k].questions||[]).forEach(q=>out.push(q));return out;}
const findQ=id=>allQuestions().find(q=>q.id===id);
const qsFor=lid=>allQuestions().filter(q=>q.l===lid);
const groupOf=lid=>GROUPS.find(g=>g.lessons.includes(lid));
function lessonReady(lid){const qs=qsFor(lid);const w=S.watched[lid]?1:0;
 const tried=qs.filter(q=>S.att[q.id]&&S.att[q.id].length);
 const acc=tried.length?tried.reduce((a,q)=>{const r=S.att[q.id].slice(-3);return a+r.reduce((x,y)=>x+y,0)/r.length;},0)/tried.length:0;
 const cov=Math.min(1,tried.length/Math.max(3,Math.ceil(qs.length*.6)));
 return Math.round(100*(.2*w+.8*acc*cov));}
const NET=GROUPS.flatMap(g=>g.lessons);
const domLessons=d=>GROUPS.filter(g=>g.domain===d).flatMap(g=>g.lessons);
const domOf=l=>{const g=groupOf(l);return g?g.domain:(GEN[l]&&GEN[l].domain)||null;};
const domainReady=d=>{const ls=domLessons(d);return ls.length?Math.round(ls.reduce((a,l)=>a+lessonReady(l),0)/ls.length):0;};
const WMID={identity:22.5,storage:17.5,compute:22.5,network:17.5,monitor:12.5};
const examReady=()=>{let t=0,w=0;DOMAINS.forEach(d=>{const p=d.built?domainReady(d.id):genReady(d.id);t+=p*WMID[d.id];w+=WMID[d.id];});return Math.round(t/w);};
const DCASE={network:"fabrikam",identity:"northwind",compute:"tailwind",storage:"litware",monitor:"adatum"},DSER={network:"s1",identity:"s2",compute:"s3",storage:"s4",monitor:"s5"};
const band=p=>p>=75?["Exam-ready","ok"]:p>=50?["Getting there","warn"]:["Not ready yet","bad"];
const dueList=()=>Object.keys(S.srs).filter(id=>S.srs[id].due<=now()&&findQ(id));

/* ----- Grading & SRS ----- */
const BOX=[0,1,3,7,16,35];
function grade(q,r){if(r==null)return 0;
 if(q.t==="mc")return r===q.a?1:0;
 if(q.t==="ms"){const a=new Set(q.a),s=new Set(r);return a.size===s.size&&[...a].every(x=>s.has(x))?1:0;}
 if(q.t==="yn")return r===q.a?1:0;
 if(q.t==="hot"){const ok=q.parts.filter((p,i)=>r[i]===p.a).length;return ok/q.parts.length;}
 if(q.t==="order"){return r.length===q.items.length&&r.every((x,i)=>x===q.items[i])?1:0;}
 return 0;}
function record(q,score){if(!q||String(q.id).startsWith("ai-"))return;const c=score>=1?1:0;
 S.att[q.id]=(S.att[q.id]||[]).concat(c).slice(-5);
 if(!c)S.srs[q.id]={b:0,due:now()+10*60e3};
 else if(S.srs[q.id]){const b=S.srs[q.id].b+1;if(b>=BOX.length)delete S.srs[q.id];else S.srs[q.id]={b,due:now()+BOX[b]*DAY};}
}
const answered=(q,r)=>{if(r==null)return false;if(q.t==="ms")return r.length>0;if(q.t==="hot")return r.every(x=>x!=null);if(q.t==="order")return r.length>0;return true;};

/* ----- Router ----- */
let VIEW={name:"home",arg:null};let PLAYER=null;
function go(name,arg){if(PLAYER){PLAYER.kill();PLAYER=null;}if(QUIZ&&QUIZ.timer){clearInterval(QUIZ.timer);}
 VIEW={name,arg};render();window.scrollTo(0,0);}
function render(){
 const m=$("#main");m.textContent="";
 document.querySelectorAll("nav.tabs button").forEach(b=>b.setAttribute("aria-current",b.dataset.v===({player:"home",gen:"home",results:VIEW.arg&&VIEW.arg.from||"home",quiz:QUIZ&&QUIZ.from||"home"}[VIEW.name]||VIEW.name)?"page":"false"));
 const n=dueList().length;const bd=$("#dueBadge");bd.textContent=n;bd.hidden=!n;
 ({home:viewHome,player:viewPlayer,quiz:viewQuiz,results:viewResults,review:viewReview,cards:viewCards,mock:viewMock,gen:viewGen,cheat:viewCheat})[VIEW.name](m,VIEW.arg);
}

/* ----- Home ----- */
const SUGGEST=["RBAC scope","Azure Policy effects","resource locks","dynamic groups","NSG priority","private endpoint","peering transitive","health probe","storage redundancy"];
function viewHome(m){
 const dr=examReady(),[bl,bc]=band(dr),watched=NET.filter(l=>S.watched[l]).length,due=dueList().length;
 const res=h("div",{class:"results panel",hidden:true});
 const inp=h("input",{id:"q",type:"search",placeholder:"Search a topic: RBAC scope, Azure Policy, NSG priority…","aria-label":"Search a topic",autocomplete:"off",
  oninput:e=>showResults(e.target.value,res),onkeydown:e=>{if(e.key==="Enter"){const f=res.querySelector("button");if(f)f.click();}}});
 m.append(
  h("div",{class:"hero"},
   h("div",{class:"hero-main"},
    h("div",{class:"eyebrow"},"AZ-104 · Microsoft Azure Administrator"),
    h("h1",{},"Watch how Azure works. Then prove you know why."),
    h("p",{class:"muted",style:"margin:0;max-width:60ch"},"Short captioned animations for each exam skill, quick checks after every lesson, and an exam-style quiz when you finish a session. Search anything. If there's no lesson yet, Claude animates one for you."),
    h("div",{class:"searchbox"},(()=>{const i=svgIcon(IC.mag,20);i.setAttribute("class","mag");return i;})(),inp),
    res,
    h("div",{class:"suggest"},SUGGEST.map(s=>h("button",{onclick:()=>{inp.value=s;showResults(s,res);inp.focus();}},s)))),
   h("div",{class:"panel ready"},
    h("div",{class:"eyebrow"},"Whole-exam readiness"),
    h("div",{style:"display:flex;align-items:flex-end;gap:12px;flex-wrap:wrap"},h("div",{class:"big"},dr+"%"),h("span",{class:"chip "+bc,style:"margin-bottom:6px"},bl)),
    h("div",{class:"meter"},h("i",{style:"width:"+dr+"%"})),
    h("div",{class:"row"},h("span",{class:"muted"},"Lessons watched"),h("b",{class:"mono"},watched+" / "+NET.length)),
    DOMAINS.filter(d=>d.built).map(d=>h("div",{class:"row"},h("span",{class:"muted"},d.name.replace(/^(Implement and manage|Manage|Deploy and manage|Monitor and maintain) /,"").replace(/^./,c=>c.toUpperCase())),h("b",{class:"mono"},domainReady(d.id)+"%"))),
    h("div",{class:"row"},h("span",{class:"muted"},"Questions in bank"),h("b",{class:"mono"},String(QUESTIONS.length))),
    h("div",{class:"row"},h("span",{class:"muted"},"Due for review"),due?h("button",{class:"btn sm",onclick:()=>startReview()},"Review "+due):h("b",{class:"mono"},"0")),
    h("div",{class:"row"},h("span",{class:"muted"},"Mock exam"),h("button",{class:"btn sm",onclick:()=>go("mock")},"Open")),
    h("p",{class:"muted",style:"font-size:12.5px;margin:auto 0 0"},"Each lesson's score blends watching it (20%) with your recent accuracy on its questions (80%). Domains are weighted like the real exam."))),
 );
 if(S.session.lessons.length){const n=S.session.lessons.length;const qn=Math.min(15,Math.max(10,n*4));
  m.append(h("div",{class:"panel sessionbar"},h("div",{},h("b",{},"This session: "+n+" lesson"+(n>1?"s":"")+" watched"),h("div",{class:"muted",style:"font-size:13.5px"},S.session.lessons.map(id=>(getLesson(id)||{}).title).filter(Boolean).join(" · "))),
   h("div",{style:"display:flex;gap:8px;flex-wrap:wrap"},h("button",{class:"btn ghost sm",onclick:()=>{S.session={lessons:[],start:0};save();render();}},"Clear"),h("button",{class:"btn primary",onclick:startSessionQuiz},"Finish session · "+qn+" questions"))));}
 // domain map
 m.append(h("div",{class:"section"},h("div",{class:"sechead"},h("h2",{},"Exam coverage map"),h("span",{class:"muted",style:"font-size:13.5px"},"Weights from Microsoft's AZ-104 skills outline")),
  h("div",{class:"panel domains"},DOMAINS.map(d=>{const p=d.built?domainReady(d.id):genReady(d.id);const gn=Object.values(GEN).filter(g=>g.domain===d.id).length;
   return h("div",{class:"domain"+(d.built?" on":"")},h("div",{class:"nm"},d.name),h("div",{class:"w"},d.weight),h("div",{class:"meter"},h("i",{style:"width:"+p+"%"})),
    h("div",{class:"st"},d.built?h("span",{class:"chip acc"},domLessons(d.id).length+" lessons"):gn?h("span",{class:"chip warn"},gn+" generated"):h("span",{class:"chip"},"Search to generate")));}))));
 // lessons
 DOMAINS.filter(d=>d.built).forEach(d=>{const sec=h("div",{class:"section"},h("div",{class:"sechead"},h("h2",{},d.name),h("span",{class:"muted",style:"font-size:13.5px"},d.weight+" of the exam · "+domainReady(d.id)+"% ready")));
  GROUPS.filter(g=>g.domain===d.id).forEach(g=>sec.append(h("div",{class:"group"},h("h3",{},g.name),h("div",{class:"cards"},g.lessons.map(l=>lessonCard(LESSONS[l]))))));
  m.append(sec);});
 const gens=Object.values(GEN);
 if(gens.length)m.append(h("div",{class:"section"},h("div",{class:"sechead"},h("h2",{},"Your generated lessons"),h("span",{class:"muted",style:"font-size:13.5px"},"Written by Claude. Check facts against Microsoft Learn")),h("div",{class:"cards"},gens.map(lessonCard))));
 m.append(h("div",{class:"section"},h("h2",{},"Exam pattern tools"),h("div",{class:"res"},
  h("button",{class:"panel tool",onclick:()=>go("cheat")},h("b",{},"Pattern cheat sheet →"),h("span",{},CHEAT.reduce((n,x)=>n+x.rows.length,0)+" “when you see… the answer is usually…” rules, constraint phrases and a traps checklist")),
  h("button",{class:"panel tool",onclick:()=>startPractice("study")},h("b",{},"100-question practice exam →"),h("span",{},"Scenario questions with the signal phrases highlighted after you answer")),
  h("button",{class:"panel tool",onclick:()=>startPractice("exam")},h("b",{},"Timed practice exam →"),h("span",{},"All 100 questions in exam mode · 100 minutes")))));
 m.append(h("div",{class:"section"},h("h2",{},"Official practice and study resources"),h("div",{class:"res"},
  [["Official study guide","Microsoft's current skills measured for AZ-104","https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/az-104"],
   ["Free practice assessment","Microsoft's own 50-question practice test","https://learn.microsoft.com/en-us/credentials/certifications/azure-administrator/practice/assessment?assessment-type=practice&assessmentId=21"],
   ["Exam sandbox","Try the real exam interface and question types","https://aka.ms/examdemo"],
   ["John Savill's AZ-104 cram","Free video cram often recommended by people who passed","https://www.youtube.com/@NTFAQGuy"]].map(([t,d,u])=>h("a",{class:"panel",href:u,target:"_blank",rel:"noopener"},h("b",{},t+" ↗"),h("span",{},d)))),
  h("p",{class:"muted",style:"font-size:13.5px;margin:0"},"Avoid exam \"dump\" sites. Using them breaks Microsoft's exam agreement and their answers are often wrong. Every question here is original and written to the exam's formats.")));
 setTimeout(()=>inp.focus({preventScroll:true}),0);
}
function genReady(dom){const g=Object.values(GEN).filter(x=>x.domain===dom);if(!g.length)return 0;return Math.round(g.reduce((a,l)=>a+lessonReady(l.id),0)/g.length*Math.min(1,g.length/8));}
function lessonCard(L){const r=lessonReady(L.id),w=S.watched[L.id];
 const st=r>=75?h("span",{class:"chip ok"},r+"% ready"):w?h("span",{class:"chip acc"},"Watched · "+r+"%"):h("span",{class:"chip"},"New");
 return h("button",{class:"lcard",onclick:()=>go("player",L.id)},h("div",{class:"t"},L.title),h("div",{class:"thumb"},h("i",{style:"width:"+r+"%"})),
  h("div",{class:"meta"},h("span",{class:"muted mono",style:"font-size:12px"},(L.scenes||[]).length+" scenes · ~"+(L.mins||2)+" min"),st));}
function searchLessons(q){q=q.toLowerCase().trim();if(!q)return [];const terms=q.split(/\s+/).filter(t=>t.length>1);
 const out=[];for(const L of Object.values(allLessons())){let s=0;const title=L.title.toLowerCase(),kw=(L.keywords||[]).join(" ").toLowerCase(),body=(L.scenes||[]).map(x=>x.say).join(" ").toLowerCase();
  if(title.includes(q))s+=10;if(kw.includes(q))s+=8;
  for(const t of terms){if(title.includes(t))s+=3;if(kw.includes(t))s+=2;if(body.includes(t))s+=.5;}
  if(s>=2)out.push([s,L]);}
 return out.sort((a,b)=>b[0]-a[0]).slice(0,5).map(x=>x[1]);}
function showResults(q,box){box.textContent="";if(!q.trim()){box.hidden=true;return;}box.hidden=false;
 const hits=searchLessons(q);
 hits.forEach(L=>box.append(h("button",{onclick:()=>go("player",L.id)},h("span",{},h("b",{},L.title),h("span",{class:"muted",style:"font-size:13px;display:block"},LESSONS[L.id]?(groupOf(L.id)||{}).name:"Generated lesson")),h("span",{class:"chip"},"Play"))));
 if(!hits.length)box.append(h("div",{class:"muted",style:"padding:8px 12px;font-size:14px"},"No built-in lesson matches yet."));
 if(AI)box.append(h("button",{class:"gen",onclick:()=>go("gen",q.trim())},h("span",{},"Create an animated lesson on “"+q.trim()+"” with Claude"),svgIcon(IC.spark)));
 else box.append(h("div",{class:"muted",style:"padding:8px 12px;font-size:13px;border-top:1px dashed var(--line)"},"New lessons on any topic can be generated when this page is open in Claude."));
}

/* ----- Player ----- */
let askBox=null;
function viewPlayer(m,id){
 const L=getLesson(id);if(!L){go("home");return;}
 const svg=document.createElementNS(SVGNS,"svg");svg.setAttribute("class","stage");svg.setAttribute("role","img");svg.setAttribute("aria-label","Animated diagram: "+L.title);
 const cap=h("div",{class:"caption","aria-live":"polite"},h("span",{class:"sn"},"1/"+L.scenes.length),h("span",{},L.scenes[0].say));
 const segs=h("div",{class:"segs"},L.scenes.map((s,i)=>h("button",{"aria-label":"Scene "+(i+1),onclick:()=>{PLAYER.go(i,true);}})));
 const playBtn=h("button",{class:"ctl play","aria-label":"Play",onclick:()=>{if(PLAYER.playing)PLAYER.pause();else PLAYER.play();}},svgIcon(IC.play));
 const setPlayIcon=p=>{playBtn.textContent="";playBtn.append(svgIcon(p?IC.pause:IC.play));playBtn.setAttribute("aria-label",p?"Pause":"Play");};
 const rateSel=h("select",{id:"rate","aria-label":"Speed",onchange:e=>{S.settings.rate=+e.target.value;PLAYER.rate=S.settings.rate;save();}},[.8,1,1.2,1.4].map(r=>h("option",{value:r,selected:S.settings.rate===r?true:null},r+"×")));
 const check=h("div",{class:"panel full",style:"padding:16px 18px",id:"check"});
 const dl=domLessons(domOf(id));const idx=dl.indexOf(id);const nextId=idx>=0&&idx<dl.length-1?dl[idx+1]:null;
 const g=groupOf(id);
 m.append(
  h("div",{class:"crumb"},h("button",{class:"btn ghost sm",onclick:()=>go("home")},"← All lessons"),h("span",{class:"chip"},g?g.name:"Generated by Claude")),
  h("div",{class:"playerhead"},h("h1",{},L.title),h("div",{style:"display:flex;gap:8px;flex-wrap:wrap"},h("span",{class:"chip"},"~"+(L.mins||2)+" min"),S.watched[id]?h("span",{class:"chip ok"},"Watched"):null,h("span",{class:"chip acc"},lessonReady(id)+"% ready"))),
  h("div",{class:"panel stagewrap"},svg,cap,
   h("div",{class:"controls"},h("button",{class:"ctl","aria-label":"Previous scene",onclick:()=>PLAYER.go(PLAYER.i-1,PLAYER.playing)},svgIcon(IC.prev)),playBtn,
    h("button",{class:"ctl","aria-label":"Next scene",onclick:()=>PLAYER.go(PLAYER.i+1,PLAYER.playing)},svgIcon(IC.next)),segs,rateSel,
    h("button",{class:"ctl","aria-label":"Full screen",title:"Full screen",onclick:e=>{const w=e.currentTarget.closest(".stagewrap");try{document.fullscreenElement?document.exitFullscreen():w.requestFullscreen().catch(()=>toast("Full screen isn't available here. Try turning your phone sideways."));}catch(x){toast("Full screen isn't available here.");}}},svgIcon('<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>')))),
  h("div",{class:"notes"},
   check,
   h("div",{class:"panel"},h("div",{class:"eyebrow"},"Key takeaways"),h("ul",{},(L.takeaways||[]).map(t=>h("li",{},t)))),
   h("div",{class:"panel"},h("div",{class:"eyebrow"},"Exam traps"),h("ul",{class:"trap"},(L.traps||[]).map(t=>h("li",{},t))),L.mnemonic?h("div",{class:"mn"},h("b",{},"Remember it: "),L.mnemonic):null),
   h("div",{class:"panel"},h("div",{class:"eyebrow"},"5-minute mini-lab"),h("p",{style:"margin:8px 0 10px"},L.lab||""),h("p",{class:"muted",style:"font-size:13px;margin:0"},"Use a free Azure account or a Microsoft Learn sandbox. Delete resources when you're done.")),
   h("div",{class:"panel"},h("div",{class:"eyebrow"},"Open-book practice"),h("p",{style:"margin:8px 0 10px"},"Microsoft Learn is available during the exam. Practice finding this page fast:"),L.ref?h("a",{href:L.ref,target:"_blank",rel:"noopener"},L.ref.replace("https://learn.microsoft.com/en-us",""),"  ↗"):null),
   askPanel(L),
   h("div",{class:"full",style:"display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap"},h("button",{class:"btn",onclick:()=>go("home")},"Back to lessons"),
    nextId?h("button",{class:"btn primary",onclick:()=>go("player",nextId)},"Next: "+LESSONS[nextId].title+" →"):h("button",{class:"btn primary",onclick:startSessionQuiz,disabled:!S.session.lessons.length&&!S.watched[id]},"Finish session quiz →")))
 );
 renderCheckIntro(check,L);
 const stage=new Stage(svg);
 PLAYER=new Player(stage,L,{
  onScene:(i,s,est,auto)=>{cap.children[0].textContent=(i+1)+"/"+L.scenes.length;cap.children[1].textContent=s.say;
   [...segs.children].forEach((b,k)=>{b.className="";void b.offsetWidth;b.className=k<i?"done":k===i?"cur"+(auto?"":" paused"):"";b.style.setProperty("--d",(est+1)+"s");});
   setPlayIcon(auto);},
  onPause:i=>{setPlayIcon(false);const b=segs.children[i];if(b)b.className="cur paused";},
  onEnd:()=>{setPlayIcon(false);[...segs.children].forEach(b=>b.className="done");cap.children[0].textContent="Done";cap.children[1].textContent="Lesson complete. Try the quick check below, or press play to watch again.";
   const first=!S.watched[id];S.watched[id]=now();if(!S.session.lessons.includes(id))S.session.lessons.push(id);if(!S.session.start)S.session.start=now();save();
   if(first)toast("Added to this session");startCheck(check,L);check.scrollIntoView({behavior:"smooth",block:"center"});}
 });
 PLAYER.rate=S.settings.rate||1;
 PLAYER.go(0,false);
}
document.addEventListener("keydown",e=>{if(VIEW.name!=="player"||!PLAYER)return;const t=e.target.tagName;if(t==="INPUT"||t==="TEXTAREA"||t==="SELECT"||t==="BUTTON"&&e.key===" ")return;
 if(e.key===" "){e.preventDefault();PLAYER.playing?PLAYER.pause():PLAYER.play();}
 if(e.key==="ArrowRight")PLAYER.go(PLAYER.i+1,PLAYER.playing);if(e.key==="ArrowLeft")PLAYER.go(PLAYER.i-1,PLAYER.playing);});

function checkPool(L){return qsFor(L.id).filter(q=>!q.case&&!q.series);}
function renderCheckIntro(box,L){box.textContent="";const n=Math.min(2,checkPool(L).length);
 box.append(h("div",{style:"display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap"},
  h("div",{},h("div",{class:"eyebrow"},"Quick check"),h("div",{style:"margin-top:4px"},n?n+" exam-style questions unlock when the lesson ends.":"No questions for this lesson yet.")),
  n?h("button",{class:"btn sm",onclick:()=>startCheck(box,L)},"Skip to quick check"):null));}
function startCheck(box,L){const pool=checkPool(L);if(!pool.length)return;
 const pick=shuffle(pool).sort((a,b)=>(lastScore(a)-lastScore(b))).slice(0,2);
 const q=newQuiz({title:"Quick check",items:pick,mode:"study",inline:true,from:"home"});
 q.onDone=()=>{box.textContent="";const sc=q.items.map(it=>q.scores[it.id]||0);const ok=sc.filter(x=>x>=1).length;
  box.append(h("div",{style:"display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap"},h("div",{},h("div",{class:"eyebrow"},"Quick check"),h("b",{},ok+" of "+sc.length+" correct"),ok<sc.length?h("div",{class:"muted",style:"font-size:13.5px"},"Missed questions come back in Review."):null),
   h("button",{class:"btn sm",onclick:()=>startCheck(box,L)},"Two more")));};
 renderQuizInto(box,q);}
const lastScore=q=>{const a=S.att[q.id];return a&&a.length?a[a.length-1]+.01*a.length:-1;};

function askPanel(L){
 const out=h("div",{class:"answer"});const ta=h("textarea",{id:"ask",placeholder:"e.g. Why does an NVA need IP forwarding if the route already points to it?"});
 let ctl=null;const btn=h("button",{class:"btn sm primary",onclick:async()=>{
  const q=ta.value.trim();if(!q||!AI)return;if(ctl){ctl.abort();return;}
  ctl=new AbortController();btn.textContent="Stop";out.textContent="Thinking…";
  const ctx=L.title+"\nNarration: "+L.scenes.map(s=>s.say).join(" ")+"\nTakeaways: "+(L.takeaways||[]).join(" ");
  try{await AI("You are a concise Azure tutor helping someone pass AZ-104 (Microsoft Azure Administrator). Lesson context:\n"+ctx+"\n\nQuestion: "+q+"\n\nAnswer in under 160 words of plain text (no markdown headings). Be accurate to current Azure behavior. If it relates to an exam trap, say so in one line at the end.",
    {signal:ctl.signal,cache:false,onText:({text})=>{out.textContent=text;}});}
  catch(e){if(e.code!=="cancelled")out.textContent=e.code==="not_granted"?"Claude access wasn't allowed for this page.":e.code==="rate_limited"?"Too many requests right now. Try again in a minute.":"Couldn't get an answer. Try again.";}
  ctl=null;btn.textContent="Ask Claude";}},"Ask Claude");
 askBox=h("div",{class:"panel full ask",style:"padding:16px 18px",hidden:!AI},h("div",{class:"eyebrow"},"Still confused? Ask about this lesson"),h("div",{style:"display:flex;flex-direction:column;gap:8px;margin-top:8px"},ta,h("div",{},btn)),out);
 return askBox;}
function updateAskVisibility(){if(askBox)askBox.hidden=!AI;}

/* ----- Quiz engine ----- */
let QUIZ=null;
function newQuiz(o){return Object.assign({i:0,answers:{},checked:{},flags:{},scores:{},pools:{},start:now(),mode:"study",limit:0,from:"home"},o);}
function startQuiz(o){QUIZ=newQuiz(o);if(QUIZ.limit){QUIZ.end=now()+QUIZ.limit*1000;}go("quiz");}
function viewQuiz(m){const q=QUIZ;if(!q){go("home");return;}
 const timerEl=h("span",{class:"timer"});
 m.append(h("div",{class:"qtop"},h("div",{},h("div",{class:"eyebrow"},q.mode==="exam"?"Exam mode · no feedback until you submit":"Study mode · feedback after each answer"),h("h1",{style:"font-size:26px"},q.title)),
  h("div",{style:"display:flex;gap:10px;align-items:center"},q.limit?timerEl:null,h("button",{class:"btn sm ghost",onclick:()=>{if(q.mode==="exam"&&!q.confirmQuit){q.confirmQuit=true;toast("Press Quit again to leave. Progress in this quiz is lost.");return;}go(q.from||"home");}},"Quit"))));
 const box=h("div",{});m.append(box);renderQuizInto(box,q);
 if(q.limit){const tick=()=>{const left=Math.max(0,q.end-now());const mm=Math.floor(left/60e3),ss=Math.floor(left%60e3/1e3);timerEl.textContent=mm+":"+String(ss).padStart(2,"0");timerEl.classList.toggle("low",left<5*60e3);
   if(left<=0){clearInterval(q.timer);toast("Time's up");finishQuiz(q);}};tick();q.timer=setInterval(tick,1000);}
}
function renderQuizInto(box,q){
 box.textContent="";
 if(q.reviewing){return renderReviewGrid(box,q);}
 const it=q.items[q.i];const total=q.items.length;
 if(!q.inline)box.append(h("div",{class:"qprog"},q.items.map((x,k)=>{const r=q.answers[x.id];let c="";if(k===q.i)c+=" cur";
   if(q.mode==="study"&&q.checked[x.id])c+=q.scores[x.id]>=1?" right":" wrong";else if(answered(x,r))c+=" ans";if(q.flags[x.id])c+=" flag";
   return h("button",{class:c.trim(),"aria-label":"Question "+(k+1),onclick:()=>{q.i=k;renderQuizInto(box,q);}},String(k+1));})));
 const show=q.mode==="study"&&q.checked[it.id];
 const card=h("div",{class:q.inline?"":"panel qcard",style:q.inline?"display:flex;flex-direction:column;gap:14px;margin-top:12px":null});
 card.append(h("div",{class:"qmeta"},h("span",{class:"chip"},"Q"+(q.i+1)+" of "+total),h("span",{class:"chip acc"},typeLabel(it)),getLesson(it.l)?h("span",{class:"chip"},getLesson(it.l).title):null,
  q.mode==="exam"?h("button",{class:"btn sm ghost",style:"margin-left:auto",onclick:()=>{q.flags[it.id]=!q.flags[it.id];renderQuizInto(box,q);}},svgIcon(IC.flag,14),q.flags[it.id]?"Flagged":"Flag for review"):null));
 if(it.case&&CASES[it.case])card.append(h("details",{class:"case",open:true},h("summary",{},"Case study: "+CASES[it.case].title),h("div",{},CASES[it.case].text)));
 if(it.series&&SERIES[it.series])card.append(h("div",{class:"series"},SERIES[it.series]));
 card.append(stemNode(it,show));if(it.tb)card.append(qTable(it.tb));
 if(it.code)card.append(h("pre",{class:"code"},it.code));
 card.append(renderAnswer(it,q,show,()=>renderQuizInto(box,q)));
 if(show)card.append(feedback(it,q.scores[it.id]));
 const r=q.answers[it.id];const last=q.i===total-1;
 const nav=h("div",{class:"qnav"});
 nav.append(q.inline||q.i===0?h("span"):h("button",{class:"btn",onclick:()=>{q.i--;renderQuizInto(box,q);}},"← Back"));
 if(q.mode==="study"&&!show)nav.append(h("button",{class:"btn primary",disabled:!answered(it,r),onclick:()=>{const sc=grade(it,r);q.scores[it.id]=sc;q.checked[it.id]=true;record(it,sc);save();renderQuizInto(box,q);}},"Check answer"));
 else if(!last)nav.append(h("button",{class:"btn primary",onclick:()=>{q.i++;renderQuizInto(box,q);}},"Next →"));
 else nav.append(h("button",{class:"btn primary",onclick:()=>{if(q.mode==="exam"){q.reviewing=true;renderQuizInto(box,q);}else finishQuiz(q);}},q.mode==="exam"?"Review & submit":q.inline?"Done":"See results →"));
 card.append(nav);box.append(card);
}
function typeLabel(q){if(q.t==="ms")return "Select "+(q.pick||(q.a||[]).length);return {mc:"Single answer",yn:"Yes / No",hot:"Hotspot",order:"Arrange in order"}[q.t]||q.t;}
function renderAnswer(it,q,show,rerender){
 const r=q.answers[it.id];const set=v=>{q.answers[it.id]=v;rerender();};
 if(it.t==="mc"||it.t==="ms"){const multi=it.t==="ms";
  return h("div",{class:"opts",role:multi?"group":"radiogroup"},it.o.map((o,k)=>{const sel=multi?(r||[]).includes(k):r===k;let c="opt"+(sel?" sel":"");
   const isA=multi?it.a.includes(k):it.a===k;if(show){if(isA)c="opt right";else if(sel)c="opt wrong";}
   const why=show&&it.w&&it.w[k]&&(sel||isA)?h("span",{class:"why"},it.w[k]):null;
   return h("label",{class:c},h("input",{type:multi?"checkbox":"radio",name:"q-"+it.id,checked:sel,disabled:show,onchange:()=>{if(multi){const a=new Set(r||[]);a.has(k)?a.delete(k):a.add(k);set([...a].sort());}else set(k);}}),
    h("span",{},o,why));}));}
 if(it.t==="yn"){return h("div",{},h("p",{style:"margin:0 0 10px;font-weight:600"},markText(it.sol,show?it.k:null)),h("div",{class:"opts"},[[true,"Yes"],[false,"No"]].map(([v,t])=>{const sel=r===v;let c="opt"+(sel?" sel":"");if(show){if(it.a===v)c="opt right";else if(sel)c="opt wrong";}
   return h("label",{class:c},h("input",{type:"radio",name:"q-"+it.id,checked:sel,disabled:show,onchange:()=>set(v)}),h("span",{},t));})));}
 if(it.t==="hot"){const cur=r||it.parts.map(()=>null);
  return h("div",{class:"hot"},it.parts.map((p,k)=>{const sel=h("select",{id:"hs-"+it.id+"-"+k,disabled:show,class:show?(cur[k]===p.a?"right":"wrong"):"",onchange:e=>{const a=cur.slice();a[k]=e.target.value===""?null:+e.target.value;set(a);}},
    h("option",{value:""},"Select…"),p.o.map((o,j)=>h("option",{value:j,selected:cur[k]===j?true:null},o)));
   return h("label",{for:"hs-"+it.id+"-"+k},h("span",{},p.p,show&&cur[k]!==p.a?h("span",{class:"why",style:"display:block;font-size:13px;color:var(--ok)"},"Answer: "+p.o[p.a]):null),sel);}));}
 if(it.t==="order"){if(!q.pools[it.id])q.pools[it.id]=shuffle(it.items.concat(it.extra||[]));const ans=r||[];const pool=q.pools[it.id].filter(x=>!ans.includes(x));
  const mv=(k,d)=>{const a=ans.slice();const t=a[k+d];if(t==null)return;a[k+d]=a[k];a[k]=t;set(a);};
  return h("div",{},h("div",{class:"order"},
   h("div",{},h("div",{class:"eyebrow",style:"margin-bottom:6px"},"Actions"),h("div",{class:"col"},pool.length?pool.map(x=>h("div",{class:"item"},h("span",{},x),show?null:h("button",{"aria-label":"Add to answer",onclick:()=>set(ans.concat(x))},svgIcon(IC.plus,14)))):h("span",{class:"muted",style:"font-size:13px"},"All actions placed."))),
   h("div",{},h("div",{class:"eyebrow",style:"margin-bottom:6px"},"Answer area (in order)"),h("div",{class:"col"},ans.length?ans.map((x,k)=>h("div",{class:"item"+(show?(it.items[k]===x?" right":" wrong"):"")},h("span",{},(k+1)+". "+x),
     show?null:[h("button",{"aria-label":"Move up",onclick:()=>mv(k,-1)},svgIcon(IC.up,14)),h("button",{"aria-label":"Move down",onclick:()=>mv(k,1)},svgIcon(IC.down,14)),h("button",{"aria-label":"Remove",onclick:()=>set(ans.filter(y=>y!==x))},svgIcon(IC.x,14))])):h("span",{class:"muted",style:"font-size:13px"},"Add actions with +, then order them.")))),
   show?h("ol",{style:"margin:12px 0 0;font-size:14px"},h("b",{style:"margin-left:-18px;display:block"},"Correct order:"),it.items.map(x=>h("li",{},x))):null);}
 return h("div",{},"Unsupported question type");
}
function markText(text,keys){text=String(text||"");if(!keys||!keys.length)return text;const low=text.toLowerCase(),r=[];
 keys.forEach(k=>{const kl=String(k).toLowerCase();if(!kl)return;let i=low.indexOf(kl);while(i>-1){r.push([i,i+kl.length]);i=low.indexOf(kl,i+kl.length);}});
 if(!r.length)return text;r.sort((a,b)=>a[0]-b[0]);const mg=[r[0].slice()];r.slice(1).forEach(x=>{const l=mg[mg.length-1];if(x[0]<=l[1])l[1]=Math.max(l[1],x[1]);else mg.push(x.slice());});
 const out=[];let p=0;mg.forEach(([a,b])=>{out.push(text.slice(p,a),h("mark",{class:"sig"},text.slice(a,b)));p=b;});out.push(text.slice(p));return out;}
function stemNode(it,show){return h("div",{class:"qstem"},markText(it.s,show?it.k:null));}
function qTable(tb){return h("div",{class:"qtbl"},h("table",{},h("thead",{},h("tr",{},tb.c.map(c=>h("th",{},c)))),h("tbody",{},tb.r.map(r=>h("tr",{},r.map(c=>h("td",{},c)))))));}
function feedback(it,sc){const ok=sc>=1;
 return h("div",{class:"fb "+(ok?"ok":"bad")},h("b",{},ok?"Correct":sc>0?"Partly correct ("+Math.round(sc*100)+"%)":"Not quite"),it.e,
  it.k&&it.k.length?h("div",{class:"sigs"},h("span",{class:"eyebrow"},"Signal phrases"),it.k.map(k=>h("mark",{class:"sig"},k))):null,
  getLesson(it.l)&&getLesson(it.l).ref?h("div",{style:"margin-top:6px;font-size:13px"},h("a",{href:getLesson(it.l).ref,target:"_blank",rel:"noopener"},"Microsoft Learn reference ↗")):null);}
function renderReviewGrid(box,q){const un=q.items.filter(x=>!answered(x,q.answers[x.id])).length,fl=q.items.filter(x=>q.flags[x.id]).length;
 box.append(h("div",{class:"panel qcard"},h("h2",{},"Review your answers"),h("p",{class:"muted",style:"margin:0"},un+" unanswered · "+fl+" flagged. Select a number to go back."),
  h("div",{class:"qprog"},q.items.map((x,k)=>h("button",{class:(answered(x,q.answers[x.id])?"ans":"")+(q.flags[x.id]?" flag":""),onclick:()=>{q.reviewing=false;q.i=k;renderQuizInto(box,q);}},String(k+1)))),
  h("div",{class:"qnav"},h("button",{class:"btn",onclick:()=>{q.reviewing=false;renderQuizInto(box,q);}},"← Back to questions"),h("button",{class:"btn primary",onclick:()=>finishQuiz(q)},"Submit exam"))));}
function finishQuiz(q){if(q.timer)clearInterval(q.timer);
 q.items.forEach(it=>{if(!q.checked[it.id]){const sc=grade(it,q.answers[it.id]);q.scores[it.id]=sc;if(!q.inline||true)record(it,sc);q.checked[it.id]=true;}});
 if(q.inline){save();q.onDone&&q.onDone();return;}
 const pts=q.items.reduce((a,it)=>a+(q.scores[it.id]||0),0);const pct=Math.round(100*pts/q.items.length);
 S.history.unshift({t:now(),title:q.title,kind:q.kind||"quiz",pct,n:q.items.length});S.history=S.history.slice(0,40);
 if(q.kind==="session")S.session={lessons:[],start:0};
 save();go("results",{q,pct,from:q.from});}

/* ----- Quiz builders ----- */
function singles(pool){return pool.filter(q=>!q.case&&!q.series);}
function startSessionQuiz(){
 const ls=S.session.lessons.length?S.session.lessons:NET.filter(l=>S.watched[l]);
 if(!ls.length){toast("Watch a lesson first");return;}
 const n=Math.min(15,Math.max(10,ls.length*4));let picked=[];
 const fromLessons=singles(allQuestions().filter(q=>ls.includes(q.l))).sort((a,b)=>lastScore(a)-lastScore(b)+(Math.random()-.5)*.6);
 picked=fromLessons.slice(0,Math.max(0,n-3));
 dueList().map(findQ).filter(q=>q&&!q.case&&!q.series&&!picked.includes(q)).slice(0,3).forEach(q=>picked.push(q));
 Object.keys(SERIES).forEach(sid=>{const sq=QUESTIONS.filter(q=>q.series===sid);if(sq.length&&ls.includes(sq[0].l)&&picked.length<=n-sq.length)picked=picked.concat(sq);});
 const fill=shuffle(singles(QUESTIONS).filter(q=>!picked.includes(q)));while(picked.length<n&&fill.length)picked.push(fill.pop());
 const ser=picked.filter(q=>q.series),rest=shuffle(picked.filter(q=>!q.series));
 startQuiz({title:"Session quiz · "+picked.length+" questions",items:rest.concat(ser),mode:"study",kind:"session",from:"home"});}
function startReview(){const d=dueList().map(findQ).filter(Boolean).slice(0,20);if(!d.length){toast("Nothing due. Nice work.");return;}
 startQuiz({title:"Review · "+d.length+" due",items:shuffle(d),mode:"study",kind:"review",from:"review"});}
function startMock(dom){
 const built=DOMAINS.filter(d=>d.built).map(d=>d.id);const full=!dom;
 const doms=full?built:[dom];
 const cid=full?DCASE[built[Math.floor(Math.random()*built.length)]]:DCASE[dom];
 const sid=full?DSER[built[Math.floor(Math.random()*built.length)]]:DSER[dom];
 const caseQs=QUESTIONS.filter(q=>q.case===cid),ser=QUESTIONS.filter(q=>q.series===sid);
 const target=(full?50:25)-caseQs.length-ser.length;
 const pool=shuffle(singles(QUESTIONS).filter(q=>doms.includes(domOf(q.l))));const picked=[];
 doms.flatMap(domLessons).forEach(l=>{const q=pool.find(x=>x.l===l&&!picked.includes(x));if(q&&picked.length<target)picked.push(q);});
 for(const q of pool){if(picked.length>=target)break;if(!picked.includes(q))picked.push(q);}
 const title=full?"Full mock exam":({identity:"Identity & governance",storage:"Storage",compute:"Compute",network:"Networking",monitor:"Monitoring"}[dom]+" mock exam");
 startQuiz({title,items:shuffle(picked).concat(ser,caseQs),mode:"exam",limit:(full?100:40)*60,kind:"mock",from:"mock"});}

/* ----- Results ----- */
function viewResults(m,arg){if(!arg){go("home");return;}const {q,pct}=arg;
 const scaled=Math.round(pct*10);const pass=pct>=70;
 const by={};q.items.forEach(it=>{const k=it.l;by[k]=by[k]||[0,0];by[k][0]+=q.scores[it.id]||0;by[k][1]++;});
 const missed=q.items.filter(it=>(q.scores[it.id]||0)<1);
 m.append(h("div",{class:"eyebrow"},"Results"),h("h1",{style:"margin:4px 0 16px"},q.title),
  h("div",{class:"panel score"},h("div",{},h("div",{class:"big"},pct+"%"),h("div",{class:"muted mono",style:"font-size:13px"},"≈ "+scaled+" / 1000 · pass line 700"),h("span",{class:"chip "+(pass?"ok":"bad"),style:"margin-top:8px"},pass?"Above the pass line":"Below the pass line")),
   h("div",{class:"bars"},Object.entries(by).map(([l,[s,n]])=>{const p=Math.round(100*s/n);return h("div",{class:"r"},h("span",{},(getLesson(l)||{title:l}).title),h("div",{class:"meter"},h("i",{style:"width:"+p+"%;background:"+(p>=70?"var(--ok)":p>=50?"var(--signal)":"var(--bad)")})),h("span",{},p+"%"));}))),
  h("p",{class:"muted",style:"font-size:13px"},"The scaled score is a rough estimate. Microsoft doesn't publish how raw scores convert to the 1000-point scale."),
  h("div",{style:"display:flex;gap:10px;flex-wrap:wrap;margin:16px 0 24px"},
   missed.length?h("button",{class:"btn primary",onclick:()=>startQuiz({title:"Retry missed · "+missed.length,items:shuffle(missed),mode:"study",kind:"retry",from:arg.from})},"Retry "+missed.length+" missed"):null,
   AI?h("button",{class:"btn",onclick:()=>genQuestions(Object.keys(by),arg.from)},svgIcon(IC.spark,16),"5 fresh questions from Claude"):null,
   h("button",{class:"btn",onclick:()=>go(arg.from||"home")},"Done")),
  h("h2",{style:"margin-bottom:10px"},"Every question, explained"),
  h("div",{class:"rev"},q.items.map((it,k)=>{const sc=q.scores[it.id]||0;
   return h("details",{open:sc<1?true:null},h("summary",{},h("span",{class:"chip "+(sc>=1?"ok":"bad")},sc>=1?"✓":"✕"),h("span",{style:"flex:1;min-width:0"},(k+1)+". "+(it.t==="yn"?it.sol:it.s.split("\n")[0]))),
    h("div",{class:"body"},it.case?h("div",{class:"muted",style:"font-size:13px"},"Case study: "+CASES[it.case].title):null,it.src==="px"?stemNode(it,true):null,it.tb?qTable(it.tb):null,renderAnswer(it,q,true,()=>{}),feedback(it,sc)));})));}

async function genQuestions(lessonIds,from){
 const titles=lessonIds.map(l=>(getLesson(l)||{}).title).filter(Boolean);toast("Claude is writing 5 questions…");
 try{const arr=await AI.json("Write 5 NEW, original multiple-choice questions in the style of the Microsoft AZ-104 exam, scenario-based, covering: "+titles.join(", ")+". Use current Azure behavior (Basic public IP and Basic load balancer are retired). Mix single-answer and 'select two'.\nReply with ONLY a JSON array of objects: {\"t\":\"mc\"|\"ms\",\"s\":stem,\"o\":[4 options],\"a\":index or [two indexes] for ms,\"e\":explanation (2 sentences),\"w\":[why each option is wrong, \"\" for correct ones],\"topic\":one of "+JSON.stringify(titles)+"}",{modelTier:"default"});
  const qs=(Array.isArray(arr)?arr:[]).map((x,i)=>cleanQ(x,"ai-"+now()+"-"+i,lessonIds[titles.indexOf(x.topic)]||lessonIds[0])).filter(Boolean);
  if(!qs.length)throw {code:"invalid_json"};
  startQuiz({title:"Fresh questions from Claude",items:qs,mode:"study",kind:"ai",from:from||"home"});
 }catch(e){toast(e&&e.code==="not_granted"?"Claude access wasn't allowed for this page.":"Couldn't generate questions. Try again.");}}
function cleanQ(x,id,l){if(!x||typeof x!=="object")return null;const o=Array.isArray(x.o)?x.o.slice(0,6).map(String):[];if(o.length<2||!x.s)return null;
 const t=x.t==="ms"?"ms":"mc";let a=x.a;if(t==="ms"){a=(Array.isArray(a)?a:[a]).map(Number).filter(n=>n>=0&&n<o.length);if(a.length<1)return null;}else{a=Number(Array.isArray(a)?a[0]:a);if(!(a>=0&&a<o.length))return null;}
 return {id,l,t,s:String(x.s).slice(0,900),o,a,pick:t==="ms"?a.length:undefined,e:String(x.e||"").slice(0,700),w:Array.isArray(x.w)?x.w.slice(0,o.length).map(String):[]};}

/* ----- Review hub ----- */
function viewReview(m){const due=dueList();const weak=NET.map(l=>[l,lessonReady(l)]).sort((a,b)=>a[1]-b[1]).slice(0,4);
 const inQ=Object.keys(S.srs).filter(findQ).length;
 m.append(h("div",{class:"eyebrow"},"Spaced repetition"),h("h1",{style:"margin:4px 0 8px"},"Review"),
  h("p",{class:"muted",style:"margin:0 0 18px;max-width:62ch"},"Questions you miss come back after 10 minutes, then 1, 3, 7, 16 and 35 days as you get them right. Five correct in a row and they graduate."),
  h("div",{class:"panel",style:"padding:20px;display:flex;justify-content:space-between;align-items:center;gap:14px;flex-wrap:wrap"},
   h("div",{},h("div",{class:"big",style:"font:750 40px/1 var(--f-display)"},String(due.length)),h("div",{class:"muted"},"due now · "+inQ+" in your review queue")),
   h("button",{class:"btn primary",disabled:!due.length,onclick:startReview},due.length?"Start review":"Nothing due")),
  h("div",{class:"section"},h("h2",{},"Weakest lessons"),h("div",{class:"cards"},weak.map(([l])=>lessonCard(LESSONS[l])))),
  h("div",{class:"section"},h("h2",{},"History"),S.history.length?h("div",{class:"panel domains"},S.history.slice(0,12).map(x=>h("div",{class:"domain",style:"grid-template-columns:minmax(0,1fr) 90px 160px 60px"},h("div",{},x.title),h("div",{class:"w"},new Date(x.t).toLocaleDateString()),h("div",{class:"meter"},h("i",{style:"width:"+x.pct+"%"})),h("div",{class:"w"},x.pct+"%")))):h("div",{class:"panel empty"},"Finish a session quiz or mock exam and your scores appear here.")));}

/* ----- Flashcards ----- */
let FC={i:0,flip:false,filter:"due"};
function cardDeck(){const all=CARDS.map((c,i)=>Object.assign({id:"c"+i},c));
 if(FC.filter==="all")return all;if(FC.filter==="due")return all.filter(c=>!S.cards[c.id]||S.cards[c.id].due<=now());return all.filter(c=>c.l===FC.filter);}
function viewCards(m){const deck=cardDeck();if(FC.i>=deck.length)FC.i=0;const c=deck[FC.i];
 const sel=h("select",{id:"fcf","aria-label":"Deck",style:"font:14px var(--f-body);padding:7px 10px;border-radius:8px;border:1px solid var(--line);background:var(--surface);color:var(--ink)",onchange:e=>{FC.filter=e.target.value;FC.i=0;FC.flip=false;render();}},
  h("option",{value:"due",selected:FC.filter==="due"?true:null},"Due cards"),h("option",{value:"all",selected:FC.filter==="all"?true:null},"All "+CARDS.length+" cards"),GROUPS.map(g=>h("optgroup",{label:g.name},g.lessons.map(l=>h("option",{value:l,selected:FC.filter===l?true:null},LESSONS[l].title)))));
 m.append(h("div",{class:"sechead",style:"margin-bottom:18px"},h("div",{},h("div",{class:"eyebrow"},"Exam-trap flashcards"),h("h1",{style:"margin-top:4px"},"Flashcards")),sel));
 if(!c){m.append(h("div",{class:"panel empty"},"No cards due. Pick \"All cards\" to keep practicing."));return;}
 const card=h("div",{class:"card"+(FC.flip?" flip":""),tabindex:"0",role:"button","aria-label":"Flip card",onclick:()=>{FC.flip=!FC.flip;card.classList.toggle("flip",FC.flip);},onkeydown:e=>{if(e.key===" "||e.key==="Enter"){e.preventDefault();card.click();}}},
  h("div",{class:"face"},h("div",{class:"eyebrow"},LESSONS[c.l]?LESSONS[c.l].title:""),h("p",{},c.f),h("span",{class:"muted",style:"font-size:13px"},"Tap to flip")),
  h("div",{class:"face back"},h("div",{class:"eyebrow"},"Answer"),h("p",{},c.b)));
 const rate=ok=>{const cur=S.cards[c.id]||{b:0};const b=ok?Math.min(cur.b+1,BOX.length-1):0;S.cards[c.id]={b,due:now()+(ok?BOX[b]*DAY:60e3)};save();FC.flip=false;if(FC.filter!=="due")FC.i++;render();};
 m.append(h("div",{class:"flash"},card),h("p",{class:"muted center",style:"font-size:13px"},(FC.i+1)+" of "+deck.length),
  h("div",{class:"center",style:"margin-top:8px"},h("button",{class:"btn",onclick:()=>rate(false)},"Again"),h("button",{class:"btn primary",onclick:()=>rate(true)},"Got it")));}

/* ----- Mock ----- */
function startPractice(mode){const items=PX_ORDER.map(findQ).filter(Boolean);
 startQuiz({title:"AZ-104 practice exam · 100 questions",items,mode,limit:mode==="exam"?100*60:0,kind:mode==="exam"?"mock":"practice",from:"mock"});}
function viewMock(m){const best=S.history.filter(x=>x.kind==="mock");const built=DOMAINS.filter(d=>d.built);
 const opt=(t,d,btn,fn,primary)=>h("div",{class:"panel",style:"padding:16px 18px;display:flex;flex-direction:column;gap:8px"},h("h3",{},t),h("p",{class:"muted",style:"margin:0;font-size:14px"},d),h("div",{style:"margin-top:auto;padding-top:6px"},h("button",{class:"btn"+(primary?" primary":""),onclick:fn},btn)));
 m.append(h("div",{class:"eyebrow"},"Timed practice"),h("h1",{style:"margin:4px 0 10px"},"Mock exams"),
  h("p",{class:"muted",style:"margin:0 0 16px;max-width:64ch"},"Exam mode: no feedback until you submit, flag questions to revisit, one case study and one Yes/No series in every mock. Pass line shown at 70% (≈ 700)."),
  h("div",{class:"panel pxcard"},h("div",{},h("div",{class:"eyebrow"},"Practice exam · 100 scenario questions"),h("h2",{style:"margin:4px 0 6px"},"AZ-104 practice exam"),
    h("p",{class:"muted",style:"margin:0;max-width:62ch;font-size:14.5px"},"The full 100-question set, weighted like the real exam. Every answer explains the signal phrases that point to it, highlighted right in the question.")),
   h("div",{style:"display:flex;gap:8px;flex-wrap:wrap"},h("button",{class:"btn primary",onclick:()=>startPractice("exam")},"Exam mode · 100 min"),h("button",{class:"btn",onclick:()=>startPractice("study")},"Study mode"),h("button",{class:"btn ghost",onclick:()=>go("cheat")},"Cheat sheet →"))),
  h("div",{class:"cards"},
   opt("Full mock exam","50 questions · 100 minutes across all "+built.length+" built domains. Closest to the real thing.","Start full mock",()=>startMock(null),true),
   built.map(d=>opt(d.name,"25 questions · 40 minutes · "+domLessons(d.id).length+" lessons","Start",()=>startMock(d.id)))),
  h("div",{class:"notes"},
   h("div",{class:"panel full"},h("div",{class:"eyebrow"},"The real AZ-104"),h("ul",{},h("li",{},"Roughly 40–60 questions in about 100 minutes"),h("li",{},"Passing score is 700 out of 1000"),h("li",{},"Yes/No series questions can't be revisited once answered"),h("li",{},"Microsoft Learn is available during the exam, so practice looking things up quickly")),
    h("a",{href:"https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/az-104",target:"_blank",rel:"noopener",style:"display:inline-block;margin-top:12px"},"Check the official study guide for the latest details ↗"))),
  best.length?h("div",{class:"section"},h("h2",{},"Past attempts"),h("div",{class:"panel domains"},best.slice(0,8).map(x=>h("div",{class:"domain",style:"grid-template-columns:minmax(0,1fr) 160px 60px"},h("div",{},x.title+" · "+new Date(x.t).toLocaleDateString()),h("div",{class:"meter"},h("i",{style:"width:"+x.pct+"%;background:"+(x.pct>=70?"var(--ok)":"var(--signal)")})),h("div",{class:"w"},x.pct+"%"))))):null);}

/* ----- Generate lesson with Claude ----- */
const GEN_SPEC=`Canvas: 960 x 540 (x right, y down). Each scene = {"say": caption shown under the animation (max 32 words, plain English), "ops": [...]}.
Ops (applied in order, animated):
- {"op":"box","id":"x","k":KIND,"x":n,"y":n,"label":"short","sub":"optional detail","w":n,"h":n}  KIND for containers: vnet, subnet, group, tenant, mg, sub, rg (draw them first, large, e.g. 300x200). KIND for nodes: vm, internet, nsg, lb, storage, sql, dns, bastion, user, users, nva, gw, pe, ip, route, watcher, onprem, app, nat, role, policy, lock, tag, budget, license, advisor, device, mail, key, folder, cube, mgmt (nodes default 150x56, omit w/h; give w up to 300 for long labels).
- {"op":"link","id":"l1","from":"id","to":"id","label":"optional","style":""|"peer"|"dash"|"ok"|"bad"}
- {"op":"packet","path":["id1","id2",...],"label":"optional e.g. 443","tone":"ok"|"bad"|"signal","blocked":true|false}  (blocked shows traffic being denied)
- {"op":"note","id":"n1","x":n,"y":n,"text":"line1\\nline2","tone":"accent"|"ok"|"bad"}  (max ~48 chars per line)
- {"op":"table","id":"t1","x":n,"y":n,"title":"optional","rows":[["Header","Header"],["cell","cell"]]}  (max 6 rows, 4 cols, short cells)
- {"op":"hlrow","id":"t1","row":n,"tone":"ok"|"bad"|"accent"}, {"op":"hl","id":"x"} (pulse), {"op":"set","id":"x","label":"..","sub":".."}, {"op":"mark","id":"x","tone":"bad"|"ok"|null}, {"op":"del","id":"x"}, {"op":"clear"}
Layout rules: keep everything inside the canvas; nodes must not overlap each other or labels; place nodes inside their containers with 25px padding; containers' label sits in their top-left 30px; leave a column (e.g. x 600-940) for tables and notes; use del or clear to keep the stage tidy.`;
let GENCTL=null;
function slugify(s){return "g-"+s.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,40);}
function viewGen(m,topic){
 const slug=slugify(topic);if(GEN[slug]){go("player",slug);return;}
 const status=h("p",{class:"muted"},"Claude is planning the scenes, narration and exam questions. This usually takes 30–90 seconds.");
 const stop=h("button",{class:"btn",onclick:()=>{GENCTL&&GENCTL.abort();go("home");}},"Cancel");
 m.append(h("div",{class:"crumb"},h("button",{class:"btn ghost sm",onclick:()=>{GENCTL&&GENCTL.abort();go("home");}},"← All lessons")),
  h("div",{class:"panel",style:"padding:28px;display:flex;flex-direction:column;gap:14px;max-width:720px"},h("div",{class:"eyebrow"},"New lesson"),h("h1",{},topic),h("div",{style:"display:flex;gap:10px;align-items:center"},h("span",{class:"spin"}),h("b",{},"Writing your animated lesson…")),status,h("div",{},stop)));
 if(!AI){status.textContent="Generating lessons needs this page to be open in Claude.";return;}
 GENCTL=new AbortController();let chars=0;
 const prompt=`You write short animated lessons for an AZ-104 (Microsoft Azure Administrator) study app. Topic requested by the learner: "${topic}".
If the topic isn't related to Azure administration, pick the closest AZ-104 topic and say so in the first scene.
Be accurate to current Azure behavior (e.g. Basic SKU public IPs and Basic Load Balancer were retired 30 Sept 2025). Use original wording.

${GEN_SPEC}

Reply with ONLY one JSON object:
{"title": short lesson title,
 "domain": one of "identity","storage","compute","network","monitor",
 "keywords": [6-10 search keywords],
 "scenes": [6-8 scenes],
 "takeaways": [3-5 exam-relevant facts],
 "traps": [2-3 common exam traps],
 "mnemonic": one memorable line,
 "lab": a 5-minute hands-on task in the Azure portal,
 "ref": the most relevant https://learn.microsoft.com/en-us/azure/... URL,
 "questions": [4 exam-style questions, each {"t":"mc"|"ms","s":scenario stem,"o":[4 options],"a":index (mc) or [indexes] (ms),"e":explanation,"w":[why each option is wrong or "" if correct]}]}`;
 AI.json(prompt,{signal:GENCTL.signal,modelTier:"complex",onText:({text})=>{chars=text.length;status.textContent="Writing… "+Math.round(chars/1000*10)/10+"k characters so far.";}})
  .then(raw=>{const L=cleanLesson(raw,slug,topic);if(!L)throw {code:"invalid_json"};GEN[slug]=L;saveGen(slug);toast("Lesson ready");go("player",slug);})
  .catch(e=>{if(e&&e.code==="cancelled")return;
   status.textContent=e&&e.code==="not_granted"?"Claude access wasn't allowed for this page, so lessons can't be generated.":e&&e.code==="rate_limited"?"Claude is busy right now. Try again in a minute.":"The lesson came back in a shape the player can't use. Try again, or rephrase the topic.";
   stop.textContent="Back";});
}
function cleanLesson(r,slug,topic){if(!r||typeof r!=="object"||!Array.isArray(r.scenes))return null;
 const str=(v,n)=>String(v==null?"":v).slice(0,n);
 const scenes=r.scenes.slice(0,10).map(s=>({say:str(s&&s.say,320),ops:(Array.isArray(s&&s.ops)?s.ops:[]).filter(o=>o&&OPS.includes(o.op)).slice(0,14).map(o=>{const c={op:o.op};
   ["id","k","label","sub","text","title","from","to","style","tone"].forEach(k=>{if(o[k]!=null)c[k]=str(o[k],k==="text"?300:80);});
   ["x","y","w","h","row"].forEach(k=>{if(o[k]!=null)c[k]=Number(o[k]);});
   if(o.blocked)c.blocked=true;if(Array.isArray(o.path))c.path=o.path.slice(0,6).map(x=>str(x,40));if(Array.isArray(o.rows))c.rows=o.rows.slice(0,7).map(rw=>(Array.isArray(rw)?rw:[rw]).slice(0,4).map(x=>str(x,48)));return c;})})).filter(s=>s.say);
 if(scenes.length<2)return null;
 const ref=/^https:\/\/learn\.microsoft\.com\//.test(r.ref||"")?str(r.ref,300):"https://learn.microsoft.com/en-us/azure/";
 const dom=["identity","storage","compute","network","monitor"].includes(r.domain)?r.domain:"network";
 const L={id:slug,title:str(r.title||topic,70),domain:dom,mins:Math.max(1,Math.round(scenes.length*.35)),keywords:(Array.isArray(r.keywords)?r.keywords:[]).slice(0,12).map(x=>str(x,40)).concat([topic.toLowerCase()]),
  scenes,takeaways:(r.takeaways||[]).slice(0,6).map(x=>str(x,240)),traps:(r.traps||[]).slice(0,4).map(x=>str(x,240)),mnemonic:str(r.mnemonic,200),lab:str(r.lab,400),ref,generated:true};
 L.questions=(Array.isArray(r.questions)?r.questions:[]).slice(0,6).map((q,i)=>cleanQ(q,slug+"-q"+i,slug)).filter(Boolean);
 return L;}

/* ----- Boot ----- */
document.querySelectorAll("nav.tabs button").forEach(b=>b.addEventListener("click",()=>go(b.dataset.v)));
$("#brand").addEventListener("click",()=>go("home"));
render();boot();
