/* ===== Pattern cheat sheet view (data: CHEAT from practice.js) ===== */
var CS={q:"",f:"all"};
function mdInline(s){var out=[],re=/(\*[^*]+\*|`[^`]+`)/g,p=0,m;s=String(s);
 while((m=re.exec(s))){out.push(s.slice(p,m.index));var t=m[0];out.push(t[0]==="*"?h("em",{},t.slice(1,-1)):h("code",{},t.slice(1,-1)));p=m.index+t.length;}
 out.push(s.slice(p));return out;}
function cheatFilters(){return [["all","All"],["identity","Identity"],["storage","Storage"],["compute","Compute"],["network","Networking"],["monitor","Monitoring"],["constraints","Constraint phrases"],["traps","Traps checklist"]];}
function cheatSecKey(s){return s.dom||(/Constraint/.test(s.title)?"constraints":/trap/i.test(s.title)?"traps":"intro");}
function renderCheatList(box){
 box.textContent="";var q=CS.q.trim().toLowerCase(),shown=0;
 CHEAT.forEach(function(s){var key=cheatSecKey(s);if(key==="intro")return;if(CS.f!=="all"&&CS.f!==key)return;
  var rows=s.rows.filter(function(r){return !q||r.join(" ").toLowerCase().indexOf(q)>=0;});
  var items=s.ul.filter(function(x){return !q||x.toLowerCase().indexOf(q)>=0;});
  if(q&&!rows.length&&!items.length)return;shown+=rows.length+items.length;
  var sec=h("section",{class:"cs-sec"},h("div",{class:"sechead"},h("h2",{},s.title),
    s.dom?h("button",{class:"btn sm",onclick:function(){startPxDomain(s.dom,s.title);}},"Practice these questions →"):null));
  s.paras.forEach(function(p){sec.append(h("p",{class:"muted",style:"margin:0;max-width:72ch"},mdInline(p)));});
  if(s.head&&rows.length)sec.append(h("div",{class:"cs-tbl"},h("table",{},h("thead",{},h("tr",{},s.head.map(function(c){return h("th",{},c);}))),
    h("tbody",{},rows.map(function(r){return h("tr",{},r.map(function(c,i){return h("td",{"data-label":s.head[i]||""},mdInline(c));}));})))));
  if(items.length)sec.append(h("ul",{class:"cs-traps"},items.map(function(x){return h("li",{},mdInline(x));})));
  box.append(sec);});
 if(!shown)box.append(h("div",{class:"panel empty"},"No patterns match “"+CS.q+"”. Try a shorter word, like lock, SAS or peering."));
}
function startPxDomain(dom,title){var items=PX_ORDER.map(findQ).filter(function(q){return q&&domOf(q.l)===dom;});
 if(!items.length){toast("No practice questions for this domain");return;}
 startQuiz({title:title+" · "+items.length+" practice questions",items:items,mode:"study",kind:"practice",from:"cheat"});}
function viewCheat(m){
 var intro=CHEAT.find(function(s){return cheatSecKey(s)==="intro";});
 var list=h("div",{class:"cs-list"});
 var inp=h("input",{id:"cs-q",type:"search",placeholder:"Filter patterns: lock, SAS, peering, vault…","aria-label":"Filter patterns",value:CS.q,autocomplete:"off",
  oninput:function(e){CS.q=e.target.value;renderCheatList(list);}});
 m.append(h("div",{class:"eyebrow"},"Exam patterns"),h("h1",{style:"margin:4px 0 10px"},"Pattern cheat sheet"),
  intro?h("div",{class:"panel cs-intro"},h("div",{},intro.paras[0]?h("p",{style:"margin:0 0 8px"},mdInline(intro.paras[0])):null,
    h("ol",{},intro.ol.map(function(x){return h("li",{},mdInline(x));})),intro.paras.slice(1).map(function(p){return h("p",{class:"muted",style:"margin:8px 0 0;font-size:13.5px"},mdInline(p));}))):null,
  h("div",{class:"cs-tools"},h("div",{class:"searchbox"},(function(){var i=svgIcon(IC.mag,20);i.setAttribute("class","mag");return i;})(),inp),
   h("div",{class:"suggest"},cheatFilters().map(function(f){return h("button",{class:CS.f===f[0]?"on":"",onclick:function(){CS.f=f[0];render();}},f[1]);}))),
  list);
 renderCheatList(list);
}
