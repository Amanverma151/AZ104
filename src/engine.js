/* ===== Stage engine: draws scenes as SVG and narrates them ===== */
const SVGNS="http://www.w3.org/2000/svg";
const KINDS={vnet:"c",subnet:"c",group:"c",vm:"cmp",internet:"net",nsg:"sec",lb:"net",storage:"dat",sql:"dat",dns:"net",bastion:"sec",user:"cmp",nva:"sec",gw:"net",pe:"net",ip:"net",route:"net",watcher:"ops",onprem:"cmp",app:"cmp",nat:"net",tenant:"c",mg:"c",sub:"c",rg:"c",users:"cmp",role:"sec",policy:"ops",lock:"sec",tag:"ops",budget:"dat",license:"dat",advisor:"ops",device:"cmp",mail:"cmp",key:"sec",folder:"net",cube:"cmp",mgmt:"net"};
const ICONS={
 vm:'<rect x="2.5" y="4" width="19" height="13" rx="2"/><path d="M8 21h8M12 17v4"/>',
 internet:'<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>',
 nsg:'<path d="M12 2.5l8 3v6c0 5-3.4 8.8-8 10-4.6-1.2-8-5-8-10v-6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
 lb:'<circle cx="5" cy="12" r="2.4"/><path d="M7.4 12H11M11 12l7-6.5M11 12h7M11 12l7 6.5"/><circle cx="19.5" cy="5" r="1.6"/><circle cx="19.5" cy="12" r="1.6"/><circle cx="19.5" cy="19" r="1.6"/>',
 storage:'<rect x="3" y="5" width="18" height="14" rx="1.5"/><path d="M3 10h18M3 14.5h18M9 5v14"/>',
 sql:'<ellipse cx="12" cy="6" rx="7" ry="2.6"/><path d="M5 6v12c0 1.5 3.1 2.6 7 2.6s7-1.1 7-2.6V6M5 12c0 1.5 3.1 2.6 7 2.6s7-1.1 7-2.6"/>',
 dns:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 9h10M7 13h6M7 17h8"/><circle cx="17" cy="13" r="1"/>',
 bastion:'<path d="M5 21V9h2V6h2.5v3h1.5V6h2v3h1.5V6H17v3h2v12z"/><path d="M10 21v-4a2 2 0 014 0v4"/>',
 user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.5 3.6-7 8-7s8 2.5 8 7"/>',
 nva:'<rect x="3" y="5" width="18" height="14" rx="1"/><path d="M3 9.7h18M3 14.3h18M9 5v4.7M15 5v4.7M6 9.7v4.6M12 9.7v4.6M18 9.7v4.6M9 14.3V19M15 14.3V19"/>',
 gw:'<path d="M12 3l9 9-9 9-9-9z"/><path d="M8 12h8M13 9l3 3-3 3"/>',
 nat:'<path d="M12 3l9 9-9 9-9-9z"/><path d="M8 12h8M13 9l3 3-3 3"/>',
 pe:'<path d="M9 2.5V7M15 2.5V7M6 7h12v4a6 6 0 01-12 0zM12 17v4.5"/>',
 ip:'<path d="M12 21.5s-7-7-7-12a7 7 0 0114 0c0 5-7 12-7 12z"/><circle cx="12" cy="9.5" r="2.5"/>',
 route:'<path d="M12 3v18M12 5h7l2 2.5-2 2.5h-7M12 12H5l-2 2.5L5 17h7"/>',
 watcher:'<path d="M2 12c3-5.5 6.5-7.5 10-7.5s7 2 10 7.5c-3 5.5-6.5 7.5-10 7.5S5 17.5 2 12z"/><circle cx="12" cy="12" r="3"/>',
 onprem:'<rect x="5" y="3" width="14" height="18" rx="1"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2"/>',
 app:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 8.5h18"/><circle cx="6" cy="6.3" r=".6"/><circle cx="8.3" cy="6.3" r=".6"/>',
 users:'<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.5 2.7-5.5 6-5.5s6 2 6 5.5"/><circle cx="17" cy="9" r="2.6"/><path d="M15.5 14.6c3 .2 5.5 2 5.5 5.4"/>',
 role:'<rect x="4" y="3" width="16" height="18" rx="2"/><circle cx="12" cy="10" r="3"/><path d="M8 17c1-2 2.4-3 4-3s3 1 4 3"/>',
 policy:'<path d="M6 3h9l4 4v14H6z"/><path d="M9 13l2 2 4-4"/>',
 lock:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/>',
 tag:'<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8" r="1.5"/>',
 budget:'<path d="M4 17a8 8 0 1116 0"/><path d="M12 17l4-5"/><path d="M3 20h18"/>',
 license:'<path d="M3 7h18v3a2 2 0 000 4v3H3v-3a2 2 0 000-4z"/><path d="M9 7v10" stroke-dasharray="2 2"/>',
 advisor:'<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 00-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0012 3z"/>',
 device:'<rect x="7" y="2.5" width="10" height="19" rx="2"/><path d="M11 18.5h2"/>',
 mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
 key:'<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M16 7l3 3"/>',
 folder:'<path d="M3 6a1 1 0 011-1h5l2 2h9a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1z"/>',
 cube:'<path d="M12 2.5l8.5 4.8v9.4L12 21.5l-8.5-4.8V7.3z"/><path d="M3.5 7.3L12 12l8.5-4.7M12 12v9.5"/>',
 mgmt:'<rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="8" y="13" width="8" height="8" rx="1.5"/>'
};
const OPS=["box","note","table","link","packet","hl","del","clear","set","mark","hlrow","move"];

function el(tag,attrs,parent){const e=document.createElementNS(SVGNS,tag);if(attrs)for(const k in attrs)e.setAttribute(k,attrs[k]);if(parent)parent.appendChild(e);return e;}
function txt(parent,x,y,s,cls,anchor){const t=el("text",{x,y,class:cls||""},parent);if(anchor)t.setAttribute("text-anchor",anchor);t.textContent=s;return t;}
const clampN=(v,lo,hi,d)=>{v=Number(v);return isFinite(v)?Math.max(lo,Math.min(hi,v)):d;};
const charW=(s,px)=>String(s).length*px;

class Stage{
 constructor(svg){this.svg=svg;svg.setAttribute("viewBox","0 0 960 540");this.reset();}
 reset(){this.svg.textContent="";this.gC=el("g",{},this.svg);this.gL=el("g",{},this.svg);this.gN=el("g",{},this.svg);this.gX=el("g",{},this.svg);this.gP=el("g",{},this.svg);this.items={};this.links={};}
 center(id){const b=this.items[id];if(!b)return null;return {x:b.x+b.w/2,y:b.y+b.h/2};}
 edge(id,tx,ty){const b=this.items[id];const c=this.center(id);const dx=tx-c.x,dy=ty-c.y;if(!dx&&!dy)return c;
   const sx=(b.w/2)/Math.abs(dx||1e-6),sy=(b.h/2)/Math.abs(dy||1e-6);const s=Math.min(sx,sy);return {x:c.x+dx*s,y:c.y+dy*s};}
 apply(op,anim,token){
  if(!op||OPS.indexOf(op.op)<0)return;
  const f=this["_"+op.op];if(f)return f.call(this,op,anim,token);
 }
 _clear(){this.reset();}
 _del(op){const it=this.items[op.id];if(it){it.g.remove();delete this.items[op.id];}
   const l=this.links[op.id];if(l){l.g.remove();delete this.links[op.id];}
   for(const k in this.links){const L=this.links[k];if(L.from===op.id||L.to===op.id){L.g.remove();delete this.links[k];}}}
 _box(op,anim){
  if(this.items[op.id])this._del({id:op.id});
  const k=KINDS[op.k]?op.k:"app";const cont=KINDS[k]==="c";
  const w=clampN(op.w,40,960,cont?300:150),h=clampN(op.h,30,540,cont?200:56);
  const x=clampN(op.x,0,960-w,0),y=clampN(op.y,0,540-h,0);
  const g=el("g",{class:(cont?"cont k-":"node k-")+k+(anim?" pop":"")},cont?this.gC:this.gN);
  el("rect",{x,y,width:w,height:h,rx:cont?14:9,class:"box"},g);
  const it={g,x,y,w,h,k,cont};
  if(cont){it.l=txt(g,x+14,y+22,op.label||"","clbl");it.s=txt(g,x+14+charW(op.label||"",7.6)+10,y+22,op.sub||"","sub");}
  else{const ic=el("g",{transform:`translate(${x+11},${y+h/2-11}) scale(.92)`,class:"ico ic-"+KINDS[k]},g);ic.innerHTML=ICONS[k]||ICONS.app;
    it.l=txt(g,x+42,y+h/2+(op.sub?-3:4),op.label||"","lbl");it.s=txt(g,x+42,y+h/2+13,op.sub||"","sub");}
  this.items[op.id]=it;
 }
 _set(op){const it=this.items[op.id];
  if(it){if(op.label!=null)it.l.textContent=op.label;if(op.sub!=null){it.s.textContent=op.sub;
    if(it.cont)it.s.setAttribute("x",it.x+14+charW(it.l.textContent,7.6)+10);
    else{it.l.setAttribute("y",it.y+it.h/2+(op.sub?-3:4));}}return;}
  const L=this.links[op.id];if(L&&op.label!=null){L.label=op.label;this._drawLink(L);}
 }
 _mark(op){const it=this.items[op.id];if(!it)return;it.g.classList.remove("mk-bad","mk-ok");if(op.tone==="bad"||op.tone==="ok")it.g.classList.add("mk-"+op.tone);}
 _hl(op,anim){const it=this.items[op.id];if(!it||!anim)return;const r=el("rect",{x:it.x-4,y:it.y-4,width:it.w+8,height:it.h+8,rx:12,class:"ring"},this.gX);setTimeout(()=>r.remove(),3300);}
 _link(op,anim){
  if(!this.items[op.from]||!this.items[op.to])return;
  if(this.links[op.id])this.links[op.id].g.remove();
  const L={from:op.from,to:op.to,label:op.label||"",style:op.style||""};L.g=el("g",{class:anim?"fade":""},this.gL);
  this.links[op.id]=L;this._drawLink(L);
 }
 _drawLink(L){
  L.g.textContent="";const a=this.center(L.from),b=this.center(L.to);
  const p1=this.edge(L.from,b.x,b.y),p2=this.edge(L.to,a.x,a.y);
  el("line",{x1:p1.x,y1:p1.y,x2:p2.x,y2:p2.y,class:"link "+L.style},L.g);
  if(L.label)txt(L.g,(p1.x+p2.x)/2,(p1.y+p2.y)/2-7,L.label,"llbl","middle");
 }
 _note(op,anim){
  if(this.items[op.id])this._del({id:op.id});
  const lines=String(op.text||"").split("\n").slice(0,6);const w=Math.max(...lines.map(l=>charW(l,7.4)))+26,h=lines.length*19+16;
  const x=clampN(op.x,0,Math.max(0,960-w),0),y=clampN(op.y,0,540-h,0);
  const g=el("g",{class:"note t-"+(op.tone||"accent")+(anim?" pop":"")},this.gX);
  el("rect",{x,y,width:w,height:h,rx:8},g);
  lines.forEach((l,i)=>{const t=txt(g,x+13,y+22+i*19,l);t.setAttribute("xml:space","preserve");t.style.whiteSpace="pre";});
  this.items[op.id]={g,x,y,w,h,k:"note",cont:false};
 }
 _table(op,anim){
  if(this.items[op.id])this._del({id:op.id});
  const rows=(Array.isArray(op.rows)?op.rows:[]).slice(0,9).map(r=>(Array.isArray(r)?r:[r]).slice(0,5).map(c=>String(c)));
  if(!rows.length)return;const nc=Math.max(...rows.map(r=>r.length));
  const cw=[];for(let c=0;c<nc;c++)cw[c]=Math.max(...rows.map(r=>charW(r[c]||"",6.7)))+20;
  let W=cw.reduce((a,b)=>a+b,0);const maxW=940;
  if(W>maxW){const s=maxW/W;for(let c=0;c<nc;c++)cw[c]*=s;W=maxW;}
  const top=op.title?20:0,rh=27,H=rows.length*rh;
  const x=clampN(op.x,0,Math.max(0,960-W),0),y=clampN(op.y,0,Math.max(0,540-H-top),0);
  const g=el("g",{class:"tbl"+(anim?" pop":"")},this.gX);
  if(op.title)txt(g,x,y+12,String(op.title).toUpperCase(),"ttl");
  el("rect",{x,y:y+top,width:W,height:H,rx:7,class:"bg"},g);
  el("rect",{x:x+1,y:y+top+1,width:W-2,height:rh-1,rx:6,class:"hd"},g);
  const hr=[];
  rows.forEach((r,i)=>{const ry=y+top+i*rh;const hrect=el("rect",{x:x+2,y:ry+2,width:W-4,height:rh-4,rx:5,class:"hr"},g);hr.push(hrect);
    let cx=x;r.forEach((c,j)=>{txt(g,cx+10,ry+18,c,i===0?"h":"");cx+=cw[j];});});
  this.items[op.id]={g,x,y,w:W,h:H+top,k:"table",cont:false,hr};
 }
 _hlrow(op){const it=this.items[op.id];if(!it||!it.hr)return;it.hr.forEach(r=>r.setAttribute("class","hr"));
   const r=it.hr[op.row|0];if(r&&op.tone)r.setAttribute("class","hr "+op.tone);}
 _move(op,anim){const it=this.items[op.id];if(!it)return;const dx=clampN(op.x,0,960-it.w,it.x)-it.x,dy=clampN(op.y,0,540-it.h,it.y)-it.y;
   if(it.x0==null){it.x0=it.x;it.y0=it.y;}it.x+=dx;it.y+=dy;it.g.setAttribute("transform",`translate(${it.x-it.x0},${it.y-it.y0})`);for(const k in this.links){const L=this.links[k];if(L.from===op.id||L.to===op.id)this._drawLink(L);}}
 _packet(op,anim,token){
  if(!anim)return;const ids=(op.path||[]).filter(id=>this.items[id]);if(ids.length<2)return;
  const pts=ids.map(id=>this.center(id));
  const color=op.tone==="bad"?"var(--bad)":op.tone==="ok"?"var(--ok)":"var(--signal)";
  const g=el("g",{class:"pk"},this.gP);const c=el("circle",{r:8,fill:color},g);const t=op.label?txt(g,0,-13,op.label,"","middle"):null;
  const segs=[];let total=0;for(let i=1;i<pts.length;i++){const d=Math.hypot(pts[i].x-pts[i-1].x,pts[i].y-pts[i-1].y);segs.push(d);total+=d;}
  let stopAt=total;if(op.blocked){stopAt=total-segs[segs.length-1]/2;}
  const dur=Math.max(900,stopAt*2.6)/(this.rate||1);
  return new Promise(res=>{const t0=performance.now();
   const step=now=>{if(token&&token.dead){g.remove();return res();}
    const k=Math.min(1,(now-t0)/dur);const e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;let d=e*stopAt,i=0;
    while(i<segs.length-1&&d>segs[i]){d-=segs[i];i++;}const a=pts[i],b=pts[i+1];const f=segs[i]?d/segs[i]:0;
    const x=a.x+(b.x-a.x)*f,y=a.y+(b.y-a.y)*f;c.setAttribute("cx",x);c.setAttribute("cy",y);if(t){t.setAttribute("x",x);t.setAttribute("y",y-13);}
    if(k<1)requestAnimationFrame(step);else{
     if(op.blocked){const xg=el("g",{class:"pop"},this.gP);el("circle",{cx:x,cy:y,r:15,fill:"var(--bad)"},xg);el("path",{d:`M${x-6} ${y-6}L${x+6} ${y+6}M${x+6} ${y-6}L${x-6} ${y+6}`,stroke:"#fff","stroke-width":3,"stroke-linecap":"round"},xg);
       setTimeout(()=>{xg.remove();g.remove();},1100);setTimeout(res,700);}
     else{c.setAttribute("r",11);setTimeout(()=>{g.remove();res();},350);}}};
   requestAnimationFrame(step);});
 }
}

/* ----- Player: runs a lesson on a Stage ----- */
class Player{
 constructor(stage,lesson,ui){this.stage=stage;this.lesson=lesson;this.ui=ui;this.i=0;this.playing=false;this.token=null;this.rate=1;}
 estimate(s){const w=String(s.say||"").split(/\s+/).length;return Math.max(4,w/3+1.5)/this.rate;}
 buildTo(i){this.stage.reset();for(let k=0;k<i;k++)for(const op of (this.lesson.scenes[k].ops||[]))this.stage.apply(op,false);}
 kill(){if(this.token)this.token.dead=true;}
 async go(i,autoplay){
  this.kill();const sc=this.lesson.scenes;if(i<0)i=0;if(i>=sc.length){this.playing=false;this.ui.onEnd();return;}
  this.i=i;this.buildTo(i);const token={dead:false};this.token=token;this.stage.rate=this.rate;
  const s=sc[i];this.ui.onScene(i,s,this.estimate(s),autoplay);
  if(!autoplay){for(const op of (s.ops||[]))if(op.op!=="packet")this.stage.apply(op,true);this.playing=false;return;}
  this.playing=true;
  const ops=(async()=>{for(const op of (s.ops||[])){if(token.dead)return;const r=this.stage.apply(op,true,token);
     if(r&&r.then)await r;else await sleep(op.op==="del"||op.op==="hlrow"||op.op==="set"||op.op==="mark"?120:380);}})();
  const t0=performance.now();
  await ops;if(token.dead)return;
  const left=this.estimate(s)*1000-(performance.now()-t0);if(left>0)await sleep(left);if(token.dead)return;await sleep(650/this.rate);if(token.dead)return;
  this.go(i+1,true);
 }
 play(){this.go(this.i>=this.lesson.scenes.length?0:this.i,true);}
 pause(){this.kill();this.playing=false;this.buildTo(this.i);for(const op of (this.lesson.scenes[this.i].ops||[]))if(op.op!=="packet")this.stage.apply(op,false);this.ui.onPause(this.i);}
}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
