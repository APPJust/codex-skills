// Scene renderers for "Codex Skills". Each returns SVG markup for the 1728x610 visual area as a pure
// function of (scene, time, variant). Main style: paper collage (index cards, kraft, tape, stamps);
// auxiliary: vector-rebuilt Codex UI. Custom geometry goes to B for the automated overlap check
// (same overlapGroup = intentional layering).
const C={ink:'#26221d',sub:'#5b5146',muted:'#958878',paper:'#fffdf7',paper2:'#f6f0e2',line:'#e1d7c5',kraft:'#c8a476',kraftD:'#a9875a',kraftL:'#dcc29b',
 stamp:'#c23b2c',teal:'#16707a',tealL:'#d6ecec',sticky:'#f6d35b',stickyD:'#e2b93a',pen:'#2a4f9e',green:'#2b7d4f',greenL:'#dcefe2',marker:'#ffe680',term:'#22262e',tape:'#efe2b8'};
const clamp=x=>Math.min(1,Math.max(0,x)),lerp=(a,b,u)=>a+(b-a)*u;
const E={out:x=>1-Math.pow(1-clamp(x),3),inout:x=>{x=clamp(x);return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2},back:x=>{x=clamp(x);const c=1.5;return 1+(c+1)*Math.pow(x-1,3)+c*Math.pow(x-1,2)}};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function attrs(a){return Object.entries(a).filter(([,v])=>v!==undefined&&v!==null).map(([k,v])=>k+'="'+esc(v)+'"').join(' ')}
const S={rect:a=>'<rect '+attrs(a)+'/>',text:(x,y,s,a={})=>'<text '+attrs({x,y,...a})+'>'+esc(s)+'</text>',g:(a,inner)=>'<g '+attrs(a)+'>'+inner+'</g>',path:a=>'<path '+attrs(a)+'/>',circle:a=>'<circle '+attrs(a)+'/>',line:a=>'<line '+attrs(a)+'/>',poly:(pts,a)=>'<polygon '+attrs({points:pts.map(p=>p[0].toFixed(1)+','+p[1].toFixed(1)).join(' '),...a})+'/>'};
function phaser(scene,t){const map={};for(const p of scene.phases)map[p.name]=p;return n=>{const p=map[n];if(!p)return 0;return clamp((t-p.start)/(p.end-p.start))}}
const tw=(s,size)=>[...String(s)].reduce((w,ch)=>w+(/[　-鿿＀-￯]/.test(ch)?size:size*.56),0);
const fit=(s,maxW,size)=>Math.min(size,size*maxW/Math.max(1,tw(s,size)));
const isEn=v=>String(v).startsWith('en');
const pick=(v,zh,en)=>isEn(v)?en:zh;
const fade=(u,inner,dy=10)=>u<=0?'':S.g({opacity:clamp(u).toFixed(3),transform:`translate(0 ${((1-E.out(u))*dy).toFixed(1)})`},inner);
const rot=(deg,cx,cy,inner)=>S.g({transform:`rotate(${deg} ${cx} ${cy})`},inner);
const drop=(u,cx,cy,deg,inner,dy=-40)=>{if(u<=0)return '';const k=E.back(u);return S.g({opacity:clamp(u*2.5).toFixed(3),transform:`translate(0 ${((1-E.out(u))*dy).toFixed(1)}) rotate(${(deg*(1-k)*3).toFixed(2)} ${cx} ${cy})`},inner)};
function wrap(s,maxW,size){const out=[];let cur='';const toks=String(s).match(/[A-Za-z0-9@&.'’\-\/+_$:%]+|\s+|./g)||[];
 for(const tk of toks){if(tk.trim()===''&&!cur)continue;if(tw(cur+tk,size)>maxW&&cur){out.push(cur.trim());cur=tk.trim()===''?'':tk}else cur+=tk}if(cur.trim())out.push(cur.trim());return out}
function para(x,y,s,maxW,size,a={},lh=1.32){return wrap(s,maxW,size).map((ln,i)=>S.text(x,y+i*size*lh,ln,{'font-size':size,...a})).join('')}

// ── paper primitives ──
// deterministic jitter so torn edges stay identical on every frame
const rnd=seed=>{let s=seed*9301+49297;return()=>{s=(s*9301+49297)%233280;return s/233280}};
function torn(x,y,w,h,seed,a={}){const r=rnd(seed),pts=[];const n=Math.max(6,Math.round(w/26));
 for(let i=0;i<=n;i++)pts.push([x+w*i/n,y+(r()-.5)*5]);for(let i=n;i>=0;i--)pts.push([x+w*i/n,y+h+(r()-.5)*5]);return S.poly(pts,a)}
const shadow=(x,y,w,h,o={})=>S.rect({x:x+(o.dx??7),y:y+(o.dy??9),width:w,height:h,rx:o.rx??3,fill:'#26221d',opacity:o.op??.13});
function card(x,y,w,h,o={}){return shadow(x,y,w,h,o)+S.rect({x,y,width:w,height:h,rx:o.rx??4,fill:o.fill||C.paper,stroke:o.stroke||'#d8ccb6','stroke-width':1.5})}
function tape(cx,cy,w,deg=0,h=30){return rot(deg,cx,cy,S.rect({x:cx-w/2,y:cy-h/2,width:w,height:h,fill:C.tape,opacity:.82})+S.rect({x:cx-w/2,y:cy-h/2,width:w,height:3,fill:'#fff',opacity:.35}))}
function clip(x,y,s=1,color='#8c8c94'){return S.path({d:`M${x} ${y+40*s} V${y+8*s} Q${x} ${y} ${x+7*s} ${y} Q${x+14*s} ${y} ${x+14*s} ${y+8*s} V${y+34*s} Q${x+14*s} ${y+38*s} ${x+10*s} ${y+38*s} Q${x+6*s} ${y+38*s} ${x+6*s} ${y+34*s} V${y+12*s}`,fill:'none',stroke:color,'stroke-width':3*s,'stroke-linecap':'round'})}
function stamp(cx,cy,s,size,deg=-6,color=C.stamp){const w=tw(s,size)+34,h=size+22;return rot(deg,cx,cy,S.rect({x:cx-w/2,y:cy-h/2,width:w,height:h,rx:6,fill:'none',stroke:color,'stroke-width':3.5,opacity:.9})+S.text(cx,cy+size*.36,s,{'font-size':size,'font-weight':800,fill:color,'text-anchor':'middle','letter-spacing':1,opacity:.9}))}
function sticky(x,y,w,h,deg,inner){return rot(deg,x+w/2,y+h/2,S.rect({x:x+6,y:y+10,width:w,height:h,fill:'#26221d',opacity:.12})+S.rect({x,y,width:w,height:h,fill:C.sticky})+S.path({d:`M${x} ${y+h-26} L${x+26} ${y+h} L${x} ${y+h} Z`,fill:C.stickyD})+inner)}
// envelope whose content (sheet / terminal) slides out between the opened flap (behind) and the pocket (front)
function envelope(x,y,w,h,flapU,label,size,content=''){
 const open=E.inout(flapU),tip=lerp(y+h*.55,y-h*.5,open),flap=S.poly([[x,y],[x+w,y],[x+w/2,tip]],{fill:open>.5?C.kraftD:C.kraftL,stroke:C.kraftD,'stroke-width':2});
 return shadow(x,y,w,h)+(open>.5?flap:'')+content+S.rect({x,y,width:w,height:h,rx:3,fill:C.kraft})+
  S.path({d:`M${x} ${y+h} L${x+w/2} ${y+h*.48} L${x+w} ${y+h}`,fill:'none',stroke:C.kraftD,'stroke-width':2})+
  (open>.5?S.rect({x,y,width:w,height:3,fill:C.kraftD}):flap)+
  S.rect({x:x+18,y:y+h-52,width:w-36,height:38,rx:3,fill:C.paper,opacity:.94})+S.text(x+w/2,y+h-26,label,{'font-size':fit(label,w-56,size),'font-weight':700,fill:C.ink,'text-anchor':'middle'})}

// ── scene: progressive disclosure (sample) ──
const SKILLS=[
 {name:'pdf',zh:'讀取、建立 PDF 檔案',en:'Read and create PDF files'},
 {name:'handout-format',zh:'把講義整理成課堂版',en:'Format lecture notes into class handouts'},
 {name:'gh-fix-ci',zh:'修復 GitHub CI 失敗',en:'Fix failing GitHub CI checks'},
 {name:'grade-report',zh:'產生成績報告',en:'Generate grade reports'}];
function disclose(scene,t,B,v){
 const ph=phaser(scene,t),intro=ph('intro'),box=ph('box'),match=ph('match'),open=ph('open'),deep=ph('deep');
 const appear=Math.max(intro,box>0?1:0);
 let s='',L='';
 // the skill list as a recipe-card box: centred while it is the only thing on screen, slides left when the task arrives
 const BX=30,BW=540,top0=120,step=64,boxTop=376,boxBot=560,CW=500,CX=BX+20,DX=420*(1-E.inout(clamp(match/.3)));
 const label=pick(v,'Codex 一開始看到的清單','What Codex sees at first');
 L+=fade(appear,S.rect({x:BX+8,y:30,width:tw(label,28)+40,height:50,fill:C.paper2,stroke:'#d8ccb6'})+tape(BX+18,34,64,-14,22)+S.text(BX+28,64,label,{'font-size':28,'font-weight':800,fill:C.ink}));
 const liftU=E.inout(clamp(open/.8));
 SKILLS.forEach((k,i)=>{
  const u=clamp((box-.04-i*.16)/.3),y=top0+i*step;
  if(i===1&&liftU>0)return;
  const dim=i!==1&&open>0?.55:1;
  L+=fade(u,S.g({opacity:dim},card(CX,y,CW,boxBot-y-10,{dx:0,dy:-5,op:.08})+
   S.text(CX+22,y+30,k.name,{'font-size':26,'font-weight':800,fill:i===1&&match>0?C.teal:C.ink})+
   (i===1&&match>0?S.rect({x:CX+18,y:y+38,width:(tw(pick(v,k.zh,k.en),21)+8)*E.out(clamp((match-.15)/.5)),height:24,fill:C.marker,opacity:.9}):'')+
   S.text(CX+22,y+56,pick(v,k.zh,k.en),{'font-size':21,fill:C.sub})),-24);
 });
 // box front (kraft) with a stamp once the others are left unread
 L+=fade(appear,S.poly([[BX,boxTop],[BX+BW,boxTop],[BX+BW-14,boxBot],[BX+14,boxBot]],{fill:C.kraft,stroke:C.kraftD,'stroke-width':2})+
  S.rect({x:BX+BW/2-110,y:boxTop+30,width:220,height:46,rx:3,fill:C.paper,opacity:.92})+S.text(BX+BW/2,boxTop+62,'Skills',{'font-size':28,'font-weight':800,fill:C.ink,'text-anchor':'middle'})+
  S.text(BX+BW/2,boxTop+120,pick(v,'每張只露出：名稱＋描述','Only name + description show'),{'font-size':24,'font-weight':600,fill:'#3d3024','text-anchor':'middle'}),0);
 if(open>.35)L+=fade(clamp((open-.35)/.3),stamp(BX+BW/2,boxTop+160,pick(v,'其他 Skill：未載入','Others: not loaded'),24,-4),0);
 s+=DX>.5?S.g({transform:`translate(${DX.toFixed(1)} 0)`},L):L;
 B.push({id:'skill-box',x:BX+DX,y:30,width:BW,height:boxBot-30,overlapGroup:'box'});
 // task sticky note (top right)
 const SX=1290,SY=8,SW=410,SH=132;
 if(match>0||open>0){
  const task=pick(v,'把第 3 週講義整理成課堂版','Format the week-3 notes into a class handout'),tsz=isEn(v)?26:fit(task,SW-44,29);
  s+=drop(clamp(match/.35),SX+SW/2,SY+SH/2,-2,sticky(SX,SY,SW,SH,-2,S.text(SX+22,SY+36,pick(v,'任務','Task'),{'font-size':22,'font-weight':800,fill:C.stamp})+para(SX+22,SY+76,task,SW-44,tsz,{'font-weight':700,fill:C.ink})),-6);
  B.push({id:'task-note',x:SX-6,y:SY-4,width:SW+16,height:SH+20});
  // pencil arrow from the task to the matching description
  const au=clamp((match-.3)/.55)*(1-clamp(open/.25));
  if(au>0){const d=`M${SX-10} ${SY+80} C ${1050} ${SY+100}, ${820} ${top0+step+10}, ${CX+CW+12} ${top0+step+44}`,len=900;
   s+=S.path({d,fill:'none',stroke:C.stamp,'stroke-width':4,'stroke-dasharray':`${len}`,'stroke-dashoffset':(len*(1-E.out(au))).toFixed(1),'stroke-linecap':'round'});
   if(au>.85)s+=S.poly([[CX+CW+8,top0+step+44],[CX+CW+28,top0+step+32],[CX+CW+26,top0+step+56]],{fill:C.stamp,opacity:clamp((au-.85)/.15)});
   s+=fade(clamp((au-.5)/.4),S.text(930,SY+150,pick(v,'符合描述！','Matches!'),{'font-size':30,'font-weight':800,fill:C.stamp,'text-anchor':'middle'}),0);
  }
 }
 // the matched card lifts out and unfolds into SKILL.md
 const OX=620,OY=20,OW=600,OH=500;
 if(liftU>0){
  const k=SKILLS[1],a=E.inout(clamp(liftU/.4)),b=E.inout(clamp((liftU-.3)/.7));
  const y0=top0+step,x=lerp(CX,OX,b),y=lerp(lerp(y0,40,a),OY,b),w=lerp(CW,OW,b),h=lerp(boxBot-10-y0,OH,b);
  let body=card(x,y,w,h,{dx:10,dy:12,op:.16})+clip(x+w-56,y-14,1.1);
  const cu=clamp((liftU-.7)/.3);
  const fo=1-clamp(b/.45);
  if(fo>0)body+=S.g({opacity:fo.toFixed(3)},S.text(x+22,y+30,k.name,{'font-size':26,'font-weight':800,fill:C.teal})+S.text(x+22,y+56,pick(v,k.zh,k.en),{'font-size':21,fill:C.sub}));
  if(cu>0){
   const P=OX+30,mw=OW-60,lh=34;let yy=OY+48,inner='';
   inner+=S.text(P,yy,'SKILL.md',{'font-size':28,'font-weight':800,fill:C.teal});inner+=S.rect({x:P,y:yy+12,width:mw,height:2,fill:C.line});yy+=50;
   const mono={fill:C.sub,'font-size':22};
   inner+=S.text(P,yy,'---',mono);yy+=lh;
   inner+=S.text(P,yy,'name: handout-format',{...mono,fill:C.ink,'font-weight':700});yy+=lh;
   const desc=pick(v,'description: 把課程講義整理成課堂版（標題、學習目標、練習題）。使用者要「整理講義」時使用。','description: Turns lecture notes into class handouts (title, goals, exercises). Use when asked to format a handout.');
   const dl=wrap(desc,mw,22);disclose.desc=[yy-26,yy-26+dl.length*lh+4];dl.forEach((ln,i)=>{inner+=S.rect({x:P-4,y:yy-22+i*lh,width:tw(ln,22)+8,height:30,fill:C.marker,opacity:.55})+S.text(P,yy+i*lh,ln,{...mono,fill:C.ink})});yy+=dl.length*lh;
   inner+=S.text(P,yy,'---',mono);yy+=lh+8;
   inner+=S.text(P,yy,pick(v,'# 步驟','# Steps'),{'font-size':24,'font-weight':800,fill:C.ink});yy+=lh+4;
   const steps=pick(v,['1. 讀取講義 Markdown','2. 依 references/格式規範.md 排版','3. 執行 scripts/check.py 檢查'],['1. Read the lecture Markdown','2. Lay out per references/style-guide.md','3. Run scripts/check.py to verify']);
   const stepY=[];steps.forEach((st,i)=>{stepY.push(yy);inner+=S.text(P,yy,st,{'font-size':fit(st,mw,23),fill:C.ink});yy+=lh+2});
   body+=S.g({opacity:cu.toFixed(3)},inner);
   disclose.stepY=stepY;
  }
  s+=S.g({},body);
  B.push({id:'skill-md',x,y:y-16,width:w+12,height:h+28,overlapGroup:'box'});
 }
 // envelopes: references and scripts, opened only when needed
 const EX=1262,EW=430,EH=112,E1=228,E2=440;
 if(deep>0){
  const e1=clamp(deep/.35),e2=clamp((deep-.3)/.35),sheet=E.out(clamp((deep-.14)/.3)),term=E.out(clamp((deep-.44)/.3));
  const l1=pick(v,'references/格式規範.md','references/style-guide.md'),l2='scripts/check.py';
  // a rule sheet slides up out of envelope 1, a terminal strip out of envelope 2
  const rule=pick(v,'標題 40 字內、每節 1 個練習','Title ≤ 40 chars, 1 exercise/section');
  let g1='';if(sheet>0){const sy=lerp(E1+30,E1-58,sheet);g1+=card(EX+34,sy,EW-68,100,{dx:4,dy:4,op:.1})+S.text(EX+56,sy+36,rule,{'font-size':fit(rule,EW-112,22),'font-weight':600,fill:C.ink})}
  const tipDim=1-.6*E.out(ph('tip')*3);
  if(tipDim<1)s+='<g opacity="'+tipDim.toFixed(3)+'">';
  s+=fade(e1,envelope(EX,E1,EW,EH,clamp((deep-.05)/.2),l1,24,g1),-20);
  let g2='';if(term>0){const ty=lerp(E2+30,E2-86,term);g2+=S.rect({x:EX+30,y:ty,width:EW-60,height:100,rx:8,fill:C.term})+S.text(EX+50,ty+34,'$ python scripts/check.py',{'font-size':20,fill:'#cfd6e4'})+S.text(EX+50,ty+68,pick(v,'✓ 格式檢查通過','✓ Format check passed'),{'font-size':22,'font-weight':700,fill:'#7fd69a'})}
  s+=fade(e2,envelope(EX,E2,EW,EH,clamp((deep-.35)/.2),l2,24,g2),-20);
  B.push({id:'env-refs',x:EX,y:E1-60,width:EW+8,height:EH+70,overlapGroup:'env1'});
  B.push({id:'env-scripts',x:EX,y:E2-88,width:EW+8,height:EH+98,overlapGroup:'env2'});
  // dashed links from the SKILL.md steps to the envelopes
  const sy=disclose.stepY;if(sy&&liftU>=1){const lu=E.out(clamp((deep-.08)/.3));
   s+=S.path({d:`M${OX+OW+6} ${sy[1]-8} L${EX-4} ${E1+EH/2}`,stroke:C.pen,'stroke-width':3,'stroke-dasharray':'8 7',fill:'none',opacity:lu.toFixed(3)});
   s+=S.path({d:`M${OX+OW+6} ${sy[2]-8} L${EX-4} ${E2+EH/2}`,stroke:C.pen,'stroke-width':3,'stroke-dasharray':'8 7',fill:'none',opacity:clamp((deep-.38)/.2).toFixed(3)})}
  if(tipDim<1)s+='</g>';
 }
 // tip: the description is what Codex matches on — circle it and pin a how-to-write note over the box
 const tip=ph('tip');
 if(tip>0&&disclose.desc){const [d0,d1]=disclose.desc,u=E.out(clamp(tip/.25));
  s+=S.rect({x:OX+18,y:d0+1,width:OW-36,height:d1-d0+2,rx:10,fill:'none',stroke:C.stamp,'stroke-width':4,'stroke-dasharray':`${(2*(OW-36+d1-d0+12)*u).toFixed(0)} 4000`});
  const TX=40,TY=150,TW=500,TH=300,lines=pick(v,['① 做什麼','② 什麼時候用','③ 關鍵字放前面'],['① What it does','② When to use it','③ Trigger words up front']);
  s+=drop(clamp((tip-.05)/.25),TX+TW/2,TY+TH/2,2,rot(2,TX+TW/2,TY+TH/2,shadow(TX,TY,TW,TH,{op:.18})+S.rect({x:TX,y:TY,width:TW,height:TH,fill:'#f8c9c0'})+tape(TX+TW/2,TY+4,120,-3,26)+
   S.text(TX+30,TY+64,pick(v,'description 怎麼寫','Writing a description'),{'font-size':fit(pick(v,'description 怎麼寫','Writing a description'),TW-60,34),'font-weight':800,fill:C.ink})+
   lines.map((l,i)=>fade(clamp((tip-.2-i*.18)/.2),S.text(TX+40,TY+128+i*54,l,{'font-size':32,'font-weight':700,fill:C.ink}),0)).join('')),-10);
  B.push({id:'tip-note',x:TX-10,y:TY-20,width:TW+30,height:TH+40,overlapGroup:'box'});
 }
 // context meter: how much has actually been loaded (illustrative)
 const ml=pick(v,'已載入脈絡（示意）','Context used (illus.)'),MX=640,MY=572,mbx=MX+tw(ml,22)+20,mbw=1700-260-mbx;
 const lvl=lerp(lerp(lerp(0,.05,E.out(box)),.38,E.out(open)),.72,E.out(deep));
 const read=ph('saved')>0?pick(v,'其餘留給講義','rest: your notes'):deep>0?pick(v,'＋參考資料／腳本','+ refs / scripts'):open>0?'+ SKILL.md':pick(v,'名稱＋描述 ≤2%','metadata ≤2%');
 s+=fade(appear,S.text(MX,MY+20,ml,{'font-size':22,'font-weight':700,fill:C.sub})+S.rect({x:mbx,y:MY,width:mbw,height:28,rx:4,fill:C.paper,stroke:'#cbbda6','stroke-width':1.5})+
  S.rect({x:mbx,y:MY,width:Math.max(0,mbw*lvl),height:28,rx:4,fill:C.teal,opacity:.85})+
  [.05,.38,.72].map(p=>S.rect({x:mbx+mbw*p-1,y:MY-4,width:2,height:36,fill:'#26221d44'})).join('')+
  S.text(mbx+mbw+20,MY+22,read,{'font-size':22,'font-weight':800,fill:C.teal}),0);
 B.push({id:'context-meter',x:MX,y:MY-6,width:1700-MX,height:40});
 // saved: the unread skills leave the rest of the context free for the actual work
 const sv=ph('saved');
 if(sv>0){const x0=mbx+mbw*.72,x1=mbx+mbw,u=E.out(clamp(sv/.3));
  s+=S.rect({x:x0,y:MY,width:(x1-x0)*u,height:28,rx:4,fill:C.green,opacity:(.55*u).toFixed(3)})+S.rect({x:mbx+mbw+14,y:MY-4,width:tw(read,22)+12,height:36,rx:6,fill:C.greenL,opacity:u.toFixed(3)})+S.text(mbx+mbw+20,MY+22,read,{'font-size':22,'font-weight':800,fill:C.green})}
 // cap: circle the "≤2%" readout in red pen while it is being explained
 const cap=ph('cap')*(1-clamp(match/.2));
 if(cap>0){const cx=mbx+mbw+20+tw(read,22)/2,u=E.out(clamp(cap/.3));
  s+=S.path({d:`M${cx-tw(read,22)/2-14} ${MY+14} a${tw(read,22)/2+16} 24 0 1 1 0 1`,fill:'none',stroke:C.stamp,'stroke-width':3.5,opacity:u.toFixed(3)});
  s+=fade(u,S.text(cx,MY-30,pick(v,'清單上限','list cap'),{'font-size':24,'font-weight':800,fill:C.stamp,'text-anchor':'middle'}),0)}
 return s;
}

// ── shared pieces for the remaining scenes ──
const typed=(s,u)=>[...String(s)].slice(0,Math.round([...String(s)].length*clamp(u))).join('');
const any=(...xs)=>Math.max(...xs);
function noteCard(x,y,w,h,o,inner){return card(x,y,w,h,o)+inner}
function codeLines(x,y,lines,size,lh,a={}){return lines.map((l,i)=>S.text(x,y+i*lh,l,{'font-size':size,fill:C.ink,...a,...(l.startsWith('#')?{fill:C.muted}:{})})).join('')}
// vector-rebuilt app window (not a screenshot): title bar, narrow sidebar, chat area
function appWin(x,y,w,h,v,active){
 const SB=190,items=pick(v,['新對話','Skills','Plugins','設定'],['New chat','Skills','Plugins','Settings']);
 let s=shadow(x,y,w,h,{op:.16})+S.rect({x,y,width:w,height:h,rx:12,fill:'#fbfaf7',stroke:'#cfc5b3','stroke-width':1.5})+
  S.path({d:`M${x} ${y+42} V${y+12} Q${x} ${y} ${x+12} ${y} H${x+w-12} Q${x+w} ${y} ${x+w} ${y+12} V${y+42} Z`,fill:'#ebe5d8'})+
  [0,1,2].map(i=>S.circle({cx:x+22+i*20,cy:y+21,r:6,fill:['#e0796f','#e7b85a','#7cc28b'][i]})).join('')+
  S.text(x+w/2,y+28,'Codex',{'font-size':20,'font-weight':700,fill:C.sub,'text-anchor':'middle'})+
  S.text(x+w-16,y+28,pick(v,'介面示意','UI mock-up'),{'font-size':16,fill:C.muted,'text-anchor':'end'})+
  S.rect({x,y:y+42,width:SB,height:h-42,fill:'#f3eee4'});
 items.forEach((it,i)=>{const on=it===active||(i===1&&active==='Skills');s+=(on?S.rect({x:x+10,y:y+60+i*48,width:SB-20,height:38,rx:8,fill:C.tealL}):'')+S.text(x+26,y+86+i*48,it,{'font-size':20,'font-weight':on?800:500,fill:on?C.teal:C.sub})});
 return s;
}
function bubble(x,y,w,lines,size,who,u=1){if(u<=0)return '';const h=lines.length*size*1.4+24,fill=who==='me'?C.tealL:'#ffffff',st=who==='me'?'#b9dcdc':'#ddd3c2';
 return fade(u,S.rect({x,y,width:w,height:h,rx:14,fill,stroke:st,'stroke-width':1.5})+lines.map((l,i)=>S.text(x+18,y+12+size*1.05+i*size*1.4,l,{'font-size':fit(l,w-36,size),fill:C.ink,'font-weight':i===0&&who!=='me'?600:400})).join(''),8)}
function composer(x,y,w,text,caret,v,ph='') {
 return S.rect({x,y,width:w,height:52,rx:26,fill:'#fff',stroke:'#cbbfa9','stroke-width':2})+
  (text?S.text(x+24,y+34,text,{'font-size':24,fill:C.ink,'font-weight':600}):S.text(x+24,y+34,ph,{'font-size':22,fill:C.muted}))+
  (caret?S.rect({x:x+24+tw(text,24)+3,y:y+13,width:2.5,height:26,fill:C.ink}):'')+
  S.circle({cx:x+w-28,cy:y+26,r:17,fill:C.ink})+S.path({d:`M${x+w-28} ${y+35} V${y+18} M${x+w-35} ${y+24} L${x+w-28} ${y+17} L${x+w-21} ${y+24}`,stroke:'#fff','stroke-width':2.5,fill:'none'})}
function menu(x,y,w,rows,hi,u){if(u<=0)return '';const h=rows.length*54+16;
 return fade(u,shadow(x,y,w,h,{op:.14})+S.rect({x,y,width:w,height:h,rx:12,fill:'#fff',stroke:'#cbbfa9','stroke-width':1.5})+
  rows.map((r,i)=>(i===hi?S.rect({x:x+8,y:y+8+i*54,width:w-16,height:50,rx:8,fill:C.tealL}):'')+S.text(x+22,y+40+i*54,r[0],{'font-size':23,'font-weight':800,fill:i===hi?C.teal:C.ink})+S.text(x+w-18,y+40+i*54,r[1],{'font-size':fit(r[1],w-tw(r[0],23)-60,19),fill:C.sub,'text-anchor':'end'})).join(''),-8)}
function chip(x,y,s,color=C.teal,size=22){const w=tw(s,size)+30;return S.rect({x,y,width:w,height:size+18,rx:(size+18)/2,fill:color})+S.text(x+15,y+size*.95+4,s,{'font-size':size,'font-weight':700,fill:'#fff'})}
// demo-case tracker: problem → process → result → limit
function caseStrip(v,active){const L=pick(v,['問題','過程','結果','限制'],['Problem','Process','Result','Limit']);let s=S.text(0,30,pick(v,'示範案例','Demo case'),{'font-size':22,'font-weight':800,fill:C.stamp});
 let x=tw(pick(v,'示範案例','Demo case'),22)+24;L.forEach((l,i)=>{const on=i===active,done=i<active,w=tw(l,22)+40;
  s+=S.rect({x,y:4,width:w,height:36,rx:18,fill:on?C.stamp:done?'#ecd9c6':C.paper,stroke:on?C.stamp:'#cdbfa8','stroke-width':1.5})+S.text(x+w/2,29,l,{'font-size':22,'font-weight':on?800:600,fill:on?'#fff':done?C.sub:C.muted,'text-anchor':'middle'});
  x+=w;if(i<3){s+=S.text(x+10,30,'→',{'font-size':22,fill:C.muted});x+=40}});return s}

// ── scene 1: origin ──
function origin(scene,t,B,v){
 const ph=phaser(scene,t),hook=ph('hook'),cardU=ph('card'),an=ph('anthropic'),st=ph('standard'),la=ph('launch'),g1=ph('grow1'),g2=ph('grow2');
 let s='';
 // repeated prompts as sticky notes, then folded into one card
 const notes=pick(v,['講義用這個格式…','記得檢查標題長度…','最後跑 check.py…'],['Use this handout format…','Check the title length…','Run check.py at the end…']);
 const NP=[[440,50,-4],[880,150,3],[1300,60,-2]],fold=E.inout(cardU);
 if(fold<1){notes.forEach((n,i)=>{const u=clamp((hook-.05-i*.22)/.25),[nx,ny,deg]=NP[i],x=lerp(nx,60,fold),y=lerp(ny,60,fold),k=lerp(1,.3,fold);
   s+=S.g({opacity:(1-fold).toFixed(3)},drop(u,x+200,y+100,deg,S.g({transform:`translate(${x} ${y}) scale(${k}) translate(${-x} ${-y})`},sticky(x,y,400,200,deg,S.text(x+28,y+48,pick(v,`第 ${i+1} 次`,`Time ${i+1}`),{'font-size':26,'font-weight':800,fill:C.stamp})+para(x+28,y+108,n,344,isEn(v)?30:34,{'font-weight':700,fill:C.ink})))))});
  if(hook>.75)s+=S.g({opacity:(1-fold).toFixed(3)},fade(clamp((hook-.75)/.15),stamp(1080,440,pick(v,'又要重講一次？','Explaining it again?'),40,-5),0));
  B.push({id:'notes',x:420,y:30,width:1300,height:440,overlapGroup:'fold'});
 }
 // the single skill card (stays at top-left for the rest of the scene)
 if(cardU>0){const u=E.back(clamp((cardU-.25)/.5)),x=30,y=20,w=380,h=300;
  s+=S.g({opacity:clamp((cardU-.2)/.3).toFixed(3),transform:`translate(${x+w/2} ${y+h/2}) scale(${(.6+.4*u).toFixed(3)}) translate(${-x-w/2} ${-y-h/2})`},
   card(x,y,w,h,{op:.16})+tape(x+w/2,y+4,110,-2,26)+S.text(x+28,y+64,'SKILL.md',{'font-size':34,'font-weight':800,fill:C.teal})+S.rect({x:x+28,y:y+80,width:w-56,height:2,fill:C.line})+
   notes.map((n,i)=>S.text(x+28,y+126+i*44,(i+1)+'. '+n.replace('…',''),{'font-size':fit((i+1)+'. '+n,w-56,24),fill:C.ink})).join('')+
   stamp(x+w-110,y+h-42,pick(v,'寫一次','Write once'),26,-6));
  B.push({id:'skill-card',x:x-10,y:y-10,width:w+30,height:h+30,overlapGroup:'fold'});
 }
 // newspaper-clipping timeline along the bottom
 const CL=[{d:'2025-10',zh:'Claude 推出 Agent Skills',en:'Claude introduces Agent Skills',u:an},
  {d:'2025-12-18',zh:'公布為開放標準',en:'Published as an open standard',u:st},
  {d:'2025-12-19',zh:'Codex 加入 Agent skills',en:'Codex adds Agent skills',u:la,key:true},
  {d:'2026-01',zh:'自訂提示淘汰，改用 Skill',en:'Custom prompts → skills',u:g1},
  {d:'2026-02',zh:'Codex App 主要功能',en:'Key feature of the Codex app',u:g2}];
 const TY=372,CW=318,GAP=(1728-5*CW)/4;
 if(an>0||st>0||la>0){s+=fade(clamp(an/.2),S.rect({x:0,y:TY,width:1728,height:4,fill:C.kraftD}),0)}
 CL.forEach((c,i)=>{if(c.u<=0)return;const x=i*(CW+GAP),y=TY+22,h=200,deg=[-1.5,1,0,-1,1.5][i];
  s+=drop(clamp(c.u/.3),x+CW/2,y+h/2,deg,rot(deg,x+CW/2,y+h/2,shadow(x,y,CW,h)+torn(x,y,CW,h,i+3,{fill:c.key?'#fff6e8':C.paper,stroke:c.key?C.stamp:'#d8ccb6','stroke-width':c.key?3:1.5})+
   S.circle({cx:x+CW/2,cy:y-10,r:9,fill:C.stamp})+S.text(x+24,y+56,c.d,{'font-size':36,'font-weight':800,fill:c.key?C.stamp:C.ink})+para(x+24,y+106,pick(v,c.zh,c.en),CW-48,isEn(v)?25:27,{'font-weight':600,fill:C.sub})),-30);
  B.push({id:'clip-'+i,x,y:y-22,width:CW,height:h+31});
 });
 // the focus headline (upper right) enlarges whichever milestone is being narrated; the key date then stays
 const HX=450,HY=10,HW=1260,HH=320;
 const focus=la>0?2:st>0?1:an>0?0:-1;
 if(focus>=0){const c=CL[focus],u=E.out(clamp(c.u/.25));const big=focus===2;
  s+=fade(u,shadow(HX,HY,HW,HH,{op:.12})+torn(HX,HY,HW,HH,11,{fill:C.paper,stroke:'#d8ccb6','stroke-width':1.5})+
   S.text(HX+40,HY+(big?120:110),c.d,{'font-size':big?100:84,'font-weight':800,fill:big?C.stamp:C.ink,'letter-spacing':2})+
   S.text(HX+40,HY+(big?190:185),pick(v,c.zh,c.en),{'font-size':fit(pick(v,c.zh,c.en),HW-80,44),'font-weight':800,fill:C.ink})+
   (big?S.text(HX+40,HY+260,pick(v,'CLI・IDE 擴充｜$skill-name 呼叫｜內建 $skill-creator、$skill-installer','CLI · IDE extension | $skill-name | built-in $skill-creator, $skill-installer'),{'font-size':fit(pick(v,'CLI・IDE 擴充｜$skill-name 呼叫｜內建 $skill-creator、$skill-installer','CLI · IDE extension | $skill-name | built-in $skill-creator, $skill-installer'),HW-80,28),fill:C.sub,'font-weight':600}):
    S.text(HX+40,HY+255,focus===0?'Anthropic':'agentskills.io',{'font-size':28,fill:C.muted,'font-weight':600}))+
   (big?stamp(HX+HW-170,HY+90,pick(v,'起源','Origin'),40,-8):''),0);
  B.push({id:'headline',x:HX,y:HY,width:HW+10,height:HH+12});
 }
 return s;
}

// ── scene 2: anatomy (exploded folder) ──
function anatomy(scene,t,B,v){
 const ph=phaser(scene,t),fo=ph('folder'),md=ph('skillmd'),fr=ph('front'),bo=ph('body'),op=ph('optional'),sc=ph('scripts'),rf=ph('refs'),as=ph('assets'),ym=ph('yaml');
 let s='';
 // kraft folder
 const FX=20,FY=120,FW=400,FH=380;
 s+=fade(clamp(fo/.3),shadow(FX,FY,FW,FH)+S.path({d:`M${FX} ${FY+30} V${FY} H${FX+160} L${FX+190} ${FY+30} H${FX+FW} V${FY+FH} H${FX} Z`,fill:C.kraftD})+
  S.rect({x:FX+30,y:FY+40,width:FW-60,height:FH-80,fill:C.paper,opacity:.9})+
  S.poly([[FX,FY+110],[FX+FW,FY+110],[FX+FW-14,FY+FH],[FX+14,FY+FH]],{fill:C.kraft,stroke:C.kraftD,'stroke-width':2})+
  S.rect({x:FX+60,y:FY+170,width:FW-120,height:58,rx:4,fill:C.paper})+S.text(FX+FW/2,FY+209,'handout-format/',{'font-size':30,'font-weight':800,fill:C.ink,'text-anchor':'middle'})+
  S.text(FX+FW/2,FY+290,pick(v,'一個 Skill ＝ 一個資料夾','One skill = one folder'),{'font-size':fit(pick(v,'一個 Skill ＝ 一個資料夾','One skill = one folder'),FW-40,28),'font-weight':700,fill:'#3d3024','text-anchor':'middle'}),-20);
 B.push({id:'folder',x:FX,y:FY,width:FW+8,height:FH+10});
 // SKILL.md, exploded out of the folder
 const MX=470,MY=6,MW=620,MH=520;
 if(md>0){const u=E.out(clamp(md/.4)),x=lerp(FX+120,MX,u),y=lerp(FY+100,MY,u),k=lerp(.35,1,u);
  let inner=card(MX,MY,MW,MH,{op:.16})+S.text(MX+32,MY+58,'SKILL.md',{'font-size':38,'font-weight':800,fill:C.teal})+stamp(MX+MW-110,MY+44,pick(v,'必要','Required'),26,-6)+S.rect({x:MX+32,y:MY+76,width:MW-64,height:2,fill:C.line});
  const P=MX+32,lh=40;let yy=MY+124;
  const fm=isEn(v)?[['---'],['name: handout-format','name'],['description: Turns lecture notes into','desc'],['  class handouts. Use when asked','desc'],['  to format a handout.','desc'],['---']]:[['---'],['name: handout-format','name'],['description: 把講義整理成課堂版。','desc'],['  使用者要「整理講義」時使用。','desc'],['---']];
  const fu=E.out(clamp(fr/.3));
  fm.forEach(([l,k2])=>{const hl=k2&&fu>0,fs=fit(l,MW-64,25);inner+=(hl?S.rect({x:P-4,y:yy-28,width:(tw(l,fs)+8)*fu,height:36,fill:C.marker,opacity:.8}):'')+S.text(P,yy,l,{'font-size':fs,fill:k2?C.ink:C.muted,'font-weight':k2==='name'?700:400});yy+=lh});
  yy+=10;const bu=E.out(clamp(bo/.3));
  inner+=S.text(P,yy,pick(v,'# 步驟','# Steps'),{'font-size':27,'font-weight':800,fill:C.ink});yy+=lh+4;
  const steps=pick(v,[['1. 輸入：講義 Markdown','in'],['2. 依規範排版、加練習題','do'],['3. 輸出：課堂版講義','out']],[['1. Input: lecture Markdown','in'],['2. Lay out per guide, add exercises','do'],['3. Output: class handout','out']]);
  const tags=pick(v,{in:'輸入',do:'做法',out:'輸出'},{in:'in',do:'do',out:'out'});
  steps.forEach(([l,k2],i)=>{const uu=E.out(clamp((bo-.15-i*.15)/.25));inner+=(uu>0?S.rect({x:P-4,y:yy-28,width:(tw(l,fit(l,MW-160,25))+8)*uu,height:36,fill:'#cfe6e6',opacity:.9}):'')+S.text(P,yy,l,{'font-size':fit(l,MW-160,25),fill:C.ink});
   if(uu>0)inner+=fade(uu,S.text(MX+MW-36,yy,tags[k2],{'font-size':22,'font-weight':800,fill:C.teal,'text-anchor':'end'}),0);yy+=lh});
  // margin annotations for the two front-matter fields
  if(fu>0)inner+=fade(fu,S.text(MX+MW-36,MY+164,pick(v,'← 名稱','← name'),{'font-size':22,'font-weight':800,fill:C.stamp,'text-anchor':'end'})+
   S.text(MX+MW-36,MY+(isEn(v)?330:290),pick(v,'↑ 做什麼＋什麼時候用','↑ what + when'),{'font-size':23,'font-weight':800,fill:C.stamp,'text-anchor':'end'}),0);
  s+=S.g({opacity:clamp(md*3).toFixed(3),transform:`translate(${x} ${y}) scale(${k.toFixed(3)}) translate(${-MX} ${-MY})`},inner);
  B.push({id:'skill-md',x:MX,y:MY-4,width:MW+12,height:MH+12});
  if(u>.9)s+=S.path({d:`M${FX+FW+4} ${FY+200} L${MX-6} ${MY+300}`,stroke:C.pen,'stroke-width':3,'stroke-dasharray':'8 7',fill:'none'});
 }
 // optional parts
 const OX=1130,OW=590,OH=132,parts=[
  {k:'scripts/',zh:'可以執行的程式',en:'Code that can run',u:sc,ic:'$ _'},
  {k:'references/',zh:'參考文件',en:'Reference documents',u:rf,ic:'≡'},
  {k:'assets/',zh:'範本、素材',en:'Templates, resources',u:as,ic:'▢'},
  {k:'agents/openai.yaml',zh:'顯示名稱・呼叫政策・工具相依',en:'Display name · invocation policy · tools',u:ym,ic:'⚙'}];
 if(op>0||sc>0){parts.forEach((p,i)=>{const y=6+i*(OH+14);
   s+=fade(clamp(op/.3+(sc>0?1:0)),S.rect({x:OX,y,width:OW,height:OH,rx:6,fill:'none',stroke:'#b9ab93','stroke-width':2,'stroke-dasharray':'10 8'})+(p.u<=0?S.text(OX+OW/2,y+OH/2+10,pick(v,'選用','optional'),{'font-size':26,fill:C.muted,'text-anchor':'middle','font-weight':600}):''),0);
   if(p.u>0){const deg=[-.4,.4,-.3,.3][i];s+=drop(clamp(p.u/.35),OX+OW/2,y+OH/2,deg,rot(deg,OX+OW/2,y+OH/2,card(OX,y,OW,OH,{op:.14})+
    S.rect({x:OX+20,y:y+22,width:88,height:88,rx:10,fill:i===3?C.kraftL:i===0?C.term:C.tealL})+S.text(OX+64,y+78,p.ic,{'font-size':i===0?30:38,'font-weight':800,fill:i===0?'#7fd69a':C.ink,'text-anchor':'middle'})+
    S.text(OX+130,y+56,p.k,{'font-size':fit(p.k,OW-260,30),'font-weight':800,fill:C.ink})+S.text(OX+130,y+100,pick(v,p.zh,p.en),{'font-size':fit(pick(v,p.zh,p.en),OW-150,24),fill:C.sub})+
    S.text(OX+OW-20,y+40,pick(v,'選用','optional'),{'font-size':20,'font-weight':800,fill:C.muted,'text-anchor':'end'})),-8)}
   B.push({id:'opt-'+i,x:OX,y,width:OW,height:OH+8});
  });
  if(op>0)s+=fade(clamp(op/.3),S.path({d:`M${MX+MW+16} ${300} L${OX-8} ${300}`,stroke:C.pen,'stroke-width':3,'stroke-dasharray':'8 7',fill:'none'}),0);
 }
 // official best practice ribbon under the folder and SKILL.md
 const be=ph('best');
 if(be>0){const y=548,txt=pick(v,'官方建議：一個 Skill 只做一件事｜能用文字說清楚，就先不寫腳本','Docs: one skill, one job | if words can explain it, skip the scripts');
  s+=fade(E.out(clamp(be/.25)),S.rect({x:0,y,width:1100,height:54,rx:8,fill:C.greenL,stroke:'#a9d3b6'})+S.text(550,y+37,txt,{'font-size':fit(txt,1060,27),'font-weight':800,fill:C.green,'text-anchor':'middle'}),8);
  B.push({id:'best',x:0,y,width:1100,height:56})}
 return s;
}

// ── scene 4: comparison ──
function compare(scene,t,B,v){
 const ph=phaser(scene,t),intro=ph('intro'),rule=ph('rule');
 const cols=[
  {k:'agents',name:'AGENTS.md',color:C.pen,tag:pick(v,'規則','Rules'),rows:pick(v,['每次開始前都先讀','專案規則與慣例','每次都要遵守的規定'],['Read before every session','Project rules, conventions','Rules always followed'])},
  {k:'skill',name:'Skill',color:C.teal,tag:pick(v,'流程','Workflows'),rows:pick(v,['先看描述，用到才載入','步驟＋腳本＋參考資料','某一類任務的做法'],['Description first, rest on use','Steps + scripts + references','How to do a kind of task'])},
  {k:'mcp',name:'MCP',color:'#b36b12',tag:pick(v,'連外部','Outside'),rows:pick(v,['需要時呼叫外部工具','連到外部系統的連線','資料庫、雲端、內部工具'],['Calls outside tools on demand','Connections to other systems','Databases, cloud, internal tools'])},
  {k:'plugin',name:'Plugin',color:C.stamp,tag:pick(v,'分享','Sharing'),rows:pick(v,['安裝後提供內含功能','Skills＋MCP＋hooks','分享給整個團隊'],['Provides its contents once installed','Skills + MCP + hooks','Sharing with the whole team'])}];
 const labels=pick(v,['載入時機','放什麼','適合'],['Loads','Holds','Best for']);
 const W=408,G=(1728-4*W)/3,H=500,Y0=12;let s='';
 cols.forEach((c,i)=>{const x=i*(W+G),u=ph(c.k),shown=u>0||cols.slice(i+1).some(n=>ph(n.k)>0)||rule>0,active=u>0&&u<1&&!cols.slice(i+1).some(n=>ph(n.k)>0);
  const lift=Y0+(active?-10:0),deal=clamp((intro-i*.12)/.3);
  if(deal<=0&&!shown)return;
  let inner=card(x,lift,W,H,{op:active?.22:.12,dy:active?16:9})+S.rect({x,y:lift,width:W,height:86,rx:4,fill:c.color})+S.text(x+28,58+lift,c.name,{'font-size':40,'font-weight':800,fill:'#fff'});
  labels.forEach((l,r)=>{const y=146+r*126+lift,ru=shown?E.out(clamp((u-.05-r*.22)/.25)+(cols.slice(i+1).some(n=>ph(n.k)>0)||rule>0?1:0)):0;
   inner+=S.text(x+28,y-22,l,{'font-size':21,'font-weight':700,fill:C.muted})+S.rect({x:x+28,y:y-12,width:W-56,height:1.5,fill:C.line});
   inner+=ru>0?fade(ru,para(x+28,y+34,c.rows[r],W-56,isEn(v)?25:29,{'font-weight':700,fill:C.ink}),6):S.text(x+28,y+34,'？',{'font-size':30,fill:'#d6cbb8','font-weight':800})});
  s+=fade(Math.max(deal,shown?1:0),inner,20);
  if(rule>0)s+=fade(clamp((rule-.1-i*.15)/.25),stamp(x+W/2,Y0+H+48,c.tag,30,[-4,3,-3,4][i],c.color),0);
  B.push({id:'col-'+i,x,y:Y0-10,width:W,height:H+26});
 });
 return s;
}

// ── scene 5: create ──
function create(scene,t,B,v){
 const ph=phaser(scene,t),ask=ph('ask'),cr=ph('creator'),q=ph('questions'),re=ph('result'),ma=ph('manual'),rc=ph('record'),wh=ph('where'),de=ph('detect');
 const clip2=ma>0||rc>0||wh>0||de>0;let s=caseStrip(v,ask>0&&cr<=0?0:1);
 B.push({id:'case-strip',x:0,y:0,width:900,height:44});
 const out=clip2?E.inout(clamp(ma/.15)):0;
 if(out<1){let g='';const WX=0,WY=62,WW=1080,WH=538;
  g+=appWin(WX,WY,WW,WH,v,'New');
  const CX=WX+214,CWd=WW-240;
  // chat content
  if(cr>0){const sent=cr>.7;
   if(!sent){g+=composer(CX,WY+WH-70,CWd,typed('$skill-creator',cr/.45),Math.floor(t*2)%2===0,v);
    g+=menu(CX,WY+WH-70-140,560,[['$skill-creator',pick(v,'建立新 Skill','Create a skill')],['$skill-installer',pick(v,'安裝 Skill','Install a skill')]],0,clamp((cr-.1)/.2)*(cr<.7?1:0))}
   else g+=composer(CX,WY+WH-70,CWd,'',false,v,pick(v,'輸入訊息…','Message…'));
   if(sent)g+=bubble(CX+CWd-420,WY+70,420,['$skill-creator'],24,'me',clamp((cr-.7)/.2));
  }else g+=composer(CX,WY+WH-70,CWd,'',false,v,pick(v,'輸入訊息…','Message…'));
  const qa=1-.8*E.out(clamp(ph('installer')/.2));if(q>0){g+='<g opacity="'+qa.toFixed(3)+'">';const qs=pick(v,['1. 這個 Skill 要做什麼？','2. 什麼時候該觸發？','3. 需要腳本嗎？（預設：只有指示）'],['1. What should the skill do?','2. When should it trigger?','3. Does it need scripts? (default: no)']);
   g+=bubble(CX,WY+150,620,[pick(v,'skill-creator 想知道：','skill-creator asks:'),...qs.filter((_,i)=>q>.12+i*.18)],24,'codex',clamp(q/.15));
   if(q>.78&&qa>.25)g+=bubble(CX+CWd-470,WY+360,470,pick(v,['整理講義成課堂版；','說「整理講義」時；不用腳本'],['Format notes into handouts;','when asked to; no scripts']),23,'me',clamp((q-.78)/.15));
   g+='</g>'}
  const ins=ph('installer');
  if(ins>0){const u=clamp((ins-.25)/.4);
   g+=S.rect({x:CX-4,y:WY+WH-80,width:CWd+8,height:72,fill:'#fbfaf7'})+composer(CX,WY+WH-70,CWd,typed('$skill-installer',u),u<1&&Math.floor(t*2)%2===0,v);
   g+=menu(CX,WY+WH-70-140,560,[['$skill-creator',pick(v,'建立新 Skill','Create a skill')],['$skill-installer',pick(v,'安裝 Skill','Install a skill')]],1,clamp((ins-.2)/.2))}
  if(re>0)g+=fade(clamp(re/.2),chip(CX,WY+76,pick(v,'✓ 已建立 handout-format','✓ Created handout-format'),C.green,22),0);
  s+=S.g({opacity:(1-out).toFixed(3),transform:`translate(${(-120*out).toFixed(1)} 0)`},g);
  B.push({id:'app',x:WX,y:WY,width:WW+10,height:WH+8});
  // task sticky (problem) and the created folder tree (result)
  const SX=1130,SY=70,SW=580,SH=170;
  if(ask>0||cr>0){s+=S.g({opacity:(1-out).toFixed(3)},drop(clamp(ask/.3)+(cr>0?1:0),SX+SW/2,SY+SH/2,2,sticky(SX,SY,SW,SH,2,S.text(SX+24,SY+42,pick(v,'需求','Need'),{'font-size':24,'font-weight':800,fill:C.stamp})+para(SX+24,SY+92,pick(v,'把講義整理成固定格式的課堂版','Turn lecture notes into class handouts with a fixed format'),SW-48,isEn(v)?30:34,{'font-weight':800,fill:C.ink})),-6));
   B.push({id:'need',x:SX-8,y:SY-10,width:SW+20,height:SH+26})}
  if(re>0){const TX=1130,TY=290,TW=580,TH=290,u=E.out(clamp(re/.3));
   s+=S.g({opacity:(1-out).toFixed(3)},fade(u,card(TX,TY,TW,TH,{op:.15})+tape(TX+TW/2,TY+4,120,2,26)+
    S.text(TX+30,TY+70,'handout-format/',{'font-size':34,'font-weight':800,fill:C.ink})+S.text(TX+70,TY+130,'└ SKILL.md',{'font-size':32,'font-weight':700,fill:C.teal})+
    S.text(TX+30,TY+200,pick(v,'name・description・步驟已填好','name · description · steps filled in'),{'font-size':fit(pick(v,'name・description・步驟已填好','name · description · steps filled in'),TW-60,26),fill:C.sub})+
    stamp(TX+TW-120,TY+TH-40,pick(v,'已建立','Created'),30,-6,C.green),-12));
   B.push({id:'tree',x:TX,y:TY-16,width:TW+12,height:TH+26})}
 }
 if(clip2){const inU=E.out(clamp((ma-.15)/.2));
  // three ways to create
  const M=[{n:'①',h:'$skill-creator',b:pick(v,'回答三個問題，自動產生','Answer three questions; it drafts the skill'),u:1},
   {n:'②',h:pick(v,'手動建立','By hand'),b:pick(v,'資料夾＋SKILL.md：name、description、步驟','Folder + SKILL.md: name, description, steps'),u:clamp((ma-.25)/.3)},
   {n:'③',h:'Record & Replay',b:pick(v,'macOS｜示範一次 → 起草 Skill','macOS | demonstrate once → draft skill'),u:rc}];
  M.forEach((m,i)=>{if(m.u<=0||inU<=0)return;const x=i*584,y=62,w=560,h=226;
   s+=fade(Math.min(inU,clamp(m.u/.3)),card(x,y,w,h,{op:.14})+S.text(x+28,y+62,m.n,{'font-size':40,'font-weight':800,fill:C.stamp})+S.text(x+86,y+62,m.h,{'font-size':fit(m.h,w-120,34),'font-weight':800,fill:C.ink})+
    para(x+28,y+122,m.b,w-56,isEn(v)?26:28,{fill:C.sub,'font-weight':600})+(i===2?S.circle({cx:x+w-46,cy:y+50,r:16,fill:C.stamp,opacity:.5+.5*Math.abs(Math.sin(t*3))}):'')+
    (i===1?S.text(x+28,y+200,'my-skill/ └ SKILL.md',{'font-size':22,fill:C.teal,'font-weight':700}):''),-14);
   B.push({id:'way-'+i,x,y,width:w,height:h+10})});
  // where it lives
  if(wh>0){const L=[{h:pick(v,'專案','Project'),p:'<repo>/.agents/skills/',b:pick(v,'只有這個專案能用','Only this project'),c:C.teal,u:clamp((wh-.15)/.3)},
    {h:pick(v,'個人','Personal'),p:'~/.agents/skills/',b:pick(v,'每個專案都能用','Every project'),c:C.pen,u:clamp((wh-.55)/.3)}];
   L.forEach((l,i)=>{if(l.u<=0)return;const x=i*888,y=318,w=840,h=200;
    s+=fade(l.u,card(x,y,w,h,{op:.14})+S.rect({x,y,width:14,height:h,fill:l.c})+S.text(x+40,y+56,l.h,{'font-size':32,'font-weight':800,fill:l.c})+
     S.rect({x:x+40,y:y+78,width:w-80,height:52,rx:6,fill:C.term})+S.text(x+60,y+113,l.p,{'font-size':28,fill:'#e8e2d4','font-weight':600})+
     S.text(x+40,y+178,'→ '+l.b,{'font-size':30,'font-weight':800,fill:C.ink}),-14);
    B.push({id:'loc-'+i,x,y,width:w,height:h+10})})}
  if(de>0){const y=548,u=E.out(clamp(de/.3)),txt=pick(v,'Codex 自動偵測新 Skill；沒出現 → 重新啟動 Codex','Codex detects new skills; not showing? → restart Codex');
   s+=fade(u,S.rect({x:0,y,width:1728,height:54,rx:8,fill:C.greenL,stroke:'#a9d3b6'})+S.text(864,y+37,txt,{'font-size':fit(txt,1680,28),'font-weight':800,fill:C.green,'text-anchor':'middle'}),8);
   B.push({id:'detect',x:0,y,width:1728,height:56})}
 }
 return s;
}

// ── scene 6: invoke ──
function invoke(scene,t,B,v){
 const ph=phaser(scene,t),tw2=ph('twoways'),ex=ph('explicit'),al=ph('alt'),im=ph('implicit'),co=ph('control'),di=ph('disable'),re=ph('result'),li=ph('limit');
 const clip2=co>0||di>0||re>0||li>0;
 let s=caseStrip(v,li>0?3:re>0?2:1);B.push({id:'case-strip',x:0,y:0,width:900,height:44});
 const PW=846,PY=62,PH=538,RX=882;
 if(!clip2||co<.15){const out=clip2?E.inout(co/.15):0;let g='';
  [[0,pick(v,'① 明確呼叫','① Explicit'),C.stamp],[RX,pick(v,'② 隱含呼叫','② Implicit'),C.teal]].forEach(([x,h,c],i)=>{
   g+=fade(clamp((tw2-i*.2)/.3)+(ex>0?1:0),card(x,PY,PW,PH,{op:.12})+S.rect({x,y:PY,width:PW,height:64,rx:4,fill:c})+S.text(x+26,PY+44,h,{'font-size':32,'font-weight':800,fill:'#fff'}),-12)});
  // explicit: type $ → pick → send
  const L=26,CWd=PW-52,cy=PY+PH-74;
  if(ex>0){const pickU=clamp((ex-.15)/.35),sent=ex>.75;
   const txt=sent?'':ex<.15?typed('$',ex/.1):pickU<1?'$':'$handout-format '+typed(pick(v,'整理第 5 週講義','format week-5 notes'),(ex-.5)/.25);
   g+=composer(L,cy,CWd,txt,!sent&&Math.floor(t*2)%2===0,v,pick(v,'輸入訊息…','Message…'));
   if(ex>.12&&pickU<1)g+=menu(L,cy-230,520,[['handout-format',pick(v,'講義整理','Handouts')],['pdf','PDF'],['gh-fix-ci','CI']],pickU>.5?0:-1,clamp((ex-.12)/.1));
   if(sent){g+=bubble(L+CWd-560,PY+90,560,['$handout-format '+pick(v,'整理第 5 週講義','format week-5 notes')],24,'me',clamp((ex-.75)/.15));
    g+=fade(clamp((ex-.85)/.12),chip(L,PY+170,pick(v,'✓ 使用 handout-format','✓ Using handout-format'),C.green),0)}
  }else g+=composer(L,cy,CWd,'',false,v,pick(v,'輸入訊息…','Message…'));
  if(al>0){g+=fade(clamp(al/.25),S.rect({x:L,y:PY+240,width:CWd,height:56,rx:8,fill:C.paper2,stroke:'#d8ccb6'})+S.text(L+20,PY+277,pick(v,'App：@ 選單也能插入 Skill','App: the @ menu inserts a skill too'),{'font-size':26,'font-weight':700,fill:C.ink}),6);
   g+=fade(clamp((al-.45)/.25),S.rect({x:L,y:PY+306,width:CWd,height:56,rx:8,fill:C.paper2,stroke:'#d8ccb6'})+S.text(L+20,PY+343,pick(v,'CLI／IDE 擴充：/skills','CLI / IDE extension: /skills'),{'font-size':26,'font-weight':700,fill:C.ink}),6)}
  // implicit: plain request → description match → auto pick
  const R=RX+26,RW=PW-52;
  g+=composer(R,cy,RW,'',false,v,pick(v,'輸入訊息…','Message…'));
  if(im>0){const req=pick(v,'幫我把第 5 週講義整理成課堂版','Format the week-5 notes into a class handout');
   g+=bubble(R+RW-640,PY+90,640,[req],isEn(v)?22:25,'me',clamp((im-.15)/.2));
   const du=E.out(clamp((im-.4)/.25));
   if(du>0){const y=PY+190,dsc=pick(v,'把講義整理成課堂版','Format lecture notes into class handouts');
    g+=fade(du,card(R,y,RW,130,{op:.1})+S.text(R+22,y+44,'handout-format',{'font-size':28,'font-weight':800,fill:C.teal})+S.rect({x:R+18,y:y+64,width:tw(dsc,25)+10,height:36,fill:C.marker})+S.text(R+22,y+92,dsc,{'font-size':25,fill:C.ink}),8);
    g+=fade(clamp((im-.6)/.2),S.text(R+RW-20,y+44,pick(v,'description 相符 ✓','description matches ✓'),{'font-size':24,'font-weight':800,fill:C.stamp,'text-anchor':'end'}),0)}
   if(im>.78)g+=fade(clamp((im-.78)/.15),chip(R,PY+345,pick(v,'✓ 自動選用 handout-format','✓ Picked handout-format'),C.green),0);
  }
  // page: the Skills page in the sidebar lists skills from every project (overlay, intentional layering)
  const pg=ph('page');
  if(pg>0){const x=260,y=250,w=1210,h=350,rows=[['handout-format',pick(v,'課程講義','Course notes')],['grade-report',pick(v,'成績系統','Grading')],['gh-fix-ci',pick(v,'個人','Personal')],['pdf',pick(v,'個人','Personal')]];
   let p=appWin(x,y,w,h,v,'Skills')+S.text(x+220,y+86,'Skills',{'font-size':30,'font-weight':800,fill:C.ink});
   rows.forEach((r,i)=>{const yy=y+120+i*54;p+=S.rect({x:x+220,y:yy,width:w-250,height:46,rx:8,fill:i===0?C.tealL:'#fff',stroke:'#e1d7c5'})+S.text(x+240,yy+31,r[0],{'font-size':23,'font-weight':800,fill:i===0?C.teal:C.ink})+S.text(x+w-50,yy+31,r[1],{'font-size':21,fill:C.sub,'text-anchor':'end'})});
   g+=S.rect({x:0,y:56,width:1728,height:554,fill:'#efe7d6',opacity:(.7*E.out(clamp(pg/.2))).toFixed(3)})+drop(clamp(pg/.25),x+w/2,y+h/2,0,p,30);
   B.push({id:'skills-page',x,y,width:w+10,height:h,overlapGroup:'inv'})}
  s+=S.g({opacity:(1-out).toFixed(3)},g);
  B.push({id:'panel-explicit',x:0,y:PY,width:PW,height:PH+8,overlapGroup:'inv'},{id:'panel-implicit',x:RX,y:PY,width:PW,height:PH+8,overlapGroup:'inv'});
 }
 if(clip2){const inU=E.out(clamp((co-.15)/.2));
  // control: two config snippets
  const snip=(x,y,w,h,file,lines,label,u,c)=>u<=0?'':fade(u,card(x,y,w,h,{op:.14})+S.rect({x,y,width:w,height:50,rx:4,fill:C.term})+S.text(x+22,y+34,file,{'font-size':24,'font-weight':700,fill:'#e8e2d4'})+
   codeLines(x+28,y+98,lines,27,40,{'font-weight':600})+S.text(x+28,y+h-24,label,{'font-size':fit(label,w-56,26),'font-weight':800,fill:c}),-12);
  s+=snip(0,62,PW,250,'agents/openai.yaml',['policy:','  allow_implicit_invocation: false'],pick(v,'→ 只能用 $ 明確呼叫','→ explicit $ only'),Math.min(inU,clamp((co-.3)/.3)+(di>0?1:0)),C.stamp);
  s+=snip(0,334,PW,266,'~/.codex/config.toml',['[[skills.config]]','path = ".../handout-format/SKILL.md"','enabled = false'],pick(v,'→ 整個停用（改完重啟 Codex）','→ disabled (restart Codex)'),clamp(di/.3),C.stamp);
  if(inU>0)B.push({id:'yaml',x:0,y:62,width:PW,height:260});if(di>0)B.push({id:'toml',x:0,y:334,width:PW,height:274});
  // result: the formatted handout
  if(re>0){const x=RX,y=62,w=PW,h=330,u=E.out(clamp(re/.3));
   s+=fade(u,card(x,y,w,h,{op:.14})+tape(x+w/2,y+4,130,-2,26)+S.text(x+30,y+64,pick(v,'第 5 週｜課堂講義','Week 5 | Class handout'),{'font-size':34,'font-weight':800,fill:C.ink})+
    [pick(v,'學習目標','Learning goals'),pick(v,'重點整理','Key points'),pick(v,'練習題','Exercises')].map((l,i)=>S.text(x+30,y+122+i*46,'■ '+l,{'font-size':26,fill:C.sub,'font-weight':600})).join('')+
    S.rect({x:x+30,y:y+256,width:400,height:46,rx:6,fill:C.term})+S.text(x+46,y+287,pick(v,'✓ check.py 通過','✓ check.py passed'),{'font-size':24,'font-weight':700,fill:'#7fd69a'})+
    (re>.5?stamp(x+w-170,y+250,pick(v,'下週不用重講','No re-explaining'),28,-7,C.green):''),-14);
   B.push({id:'result',x,y,width:w,height:h+10})}
  if(li>0){const x=RX,y=414,w=PW,h=186,u=E.out(clamp(li/.25));
   s+=fade(u,S.rect({x:x+6,y:y+8,width:w,height:h,fill:'#26221d',opacity:.12})+S.rect({x,y,width:w,height:h,fill:'#f8c9c0'})+
    S.text(x+28,y+50,pick(v,'注意：限制','Limit'),{'font-size':30,'font-weight':800,fill:C.stamp})+
    S.text(x+28,y+102,pick(v,'描述太模糊 → 不觸發，或觸發錯的 Skill','Vague description → no trigger, or the wrong skill'),{'font-size':fit(pick(v,'描述太模糊 → 不觸發，或觸發錯的 Skill','Vague description → no trigger, or the wrong skill'),w-56,28),'font-weight':700,fill:C.ink})+
    fade(clamp((li-.6)/.2),S.text(x+28,y+152,pick(v,'不確定 → 用 $ 直接點名','Not sure → name it with $'),{'font-size':30,'font-weight':800,fill:C.green}),0),8);
   B.push({id:'limit',x,y,width:w,height:h+8})}
 }
 return s;
}

// ── scene 7: outlook ──
function outlook(scene,t,B,v){
 const ph=phaser(scene,t);let s='';
 const COLS=[{h:pick(v,'已公布','Announced'),c:C.green,u:ph('announced')+ph('a1')},{h:pick(v,'趨勢（推測）','Trend (inference)'),c:C.pen,u:ph('trend')},{h:pick(v,'未解問題','Open problems'),c:C.stamp,u:ph('open')+ph('o1')}];
 const W=556,G=(1728-3*W)/2;
 COLS.forEach((c,i)=>{const later=COLS.slice(i+1).some(n=>n.u>0);if(c.u<=0&&!later)return;const x=i*(W+G);
  s+=fade(later?1:clamp(c.u/.25),stamp(x+W/2,34,c.h,34,[-3,2,-2][i],c.c),0);B.push({id:'head-'+i,x,y:0,width:W,height:70})});
 const N=[
  {col:0,y:84,h:150,d:'2026-05-21',zh:'團隊可發佈含 Skill 的外掛',en:'Teams can share plugins with skills',u:ph('a1')},
  {col:0,y:252,h:150,d:'2026-08-11',zh:'可從 Claude Code、Cursor 匯入 Skill',en:'Import skills from Claude Code, Cursor',u:ph('a2')},
  {col:0,y:420,h:150,d:'2026-09-11',zh:'Quick Chat 輸入 $ 選 Skill',en:'Type $ in Quick Chat to pick a skill',u:ph('a3')},
  {col:1,y:84,h:250,d:'',zh:'同一份 SKILL.md，在越來越多工具之間通用',en:'The same SKILL.md works across more and more tools',u:clamp((ph('trend')-.3)/.7)+(ph('open')>0?1:0),foot:pick(v,'依據：開放標準 agentskills.io','Basis: the agentskills.io open standard')},
  {col:2,y:84,h:200,d:'',zh:'Skill 太多 → 描述被縮短、甚至略過',en:'Many skills → descriptions shortened or skipped',u:ph('o1')},
  {col:2,y:304,h:230,d:'',zh:'第三方 Skill 可能含腳本 → 安裝前先讀過',en:'Third-party skills may contain scripts → read before installing',u:ph('o2'),foot:pick(v,'（本片建議）','(our advice)')}];
 const fills=[C.sticky,'#cfe0f5','#f8c9c0'];
 N.forEach((n,i)=>{const u=n.u;if(u<=0)return;
  const x=n.col*(W+G)+10,w=W-20,deg=[-1.5,1,-1,1.2,-1.2,1][i];
  s+=drop(clamp(u/.3),x+w/2,n.y+n.h/2,deg,rot(deg,x+w/2,n.y+n.h/2,S.rect({x:x+6,y:n.y+9,width:w,height:n.h,fill:'#26221d',opacity:.12})+S.rect({x,y:n.y,width:w,height:n.h,fill:fills[n.col]})+tape(x+w/2,n.y+2,90,deg*-2,22)+
   (n.d?S.text(x+24,n.y+50,n.d,{'font-size':28,'font-weight':800,fill:COLS[n.col].c}):'')+para(x+24,n.y+(n.d?98:62),pick(v,n.zh,n.en),w-48,isEn(v)?27:30,{'font-weight':700,fill:C.ink})+
   (n.foot?S.text(x+24,n.y+n.h-22,n.foot,{'font-size':21,fill:C.sub,'font-weight':600}):'')),-20);
  B.push({id:'note-'+i,x,y:n.y-6,width:w,height:n.h+10});
 });
 return s;
}

// ── scene 8: recap ──
function recap(scene,t,B,v){
 const ph=phaser(scene,t),x=264,y=8,w=1200,h=592;let s='';
 s+=fade(clamp(ph('r0')/.3)+(ph('r1')>0?1:0),card(x,y,w,h,{op:.16})+tape(x+80,y+6,130,-8,28)+tape(x+w-80,y+6,130,8,28)+S.rect({x:x+50,y:y+20,width:3,height:h-40,fill:'#c23b2c33'})+
  S.text(x+90,y+84,pick(v,'重點回顧','Recap'),{'font-size':44,'font-weight':800,fill:C.ink}),-14);
 const L=[[pick(v,'Skill ＝ 含 SKILL.md 的資料夾','Skill = a folder with a SKILL.md'),'r1'],[pick(v,'先看描述 → 需要時才載入','Description first → load when needed'),'r2'],[pick(v,'建立：$skill-creator｜呼叫：$ 或描述','Build: $skill-creator | Call: $ or description'),'r3']];
 L.forEach(([l,p],i)=>{const u=ph(p)+(L.slice(i+1).some(([,q])=>ph(q)>0)||ph('r4')>0?1:0);if(u<=0)return;const yy=y+170+i*96;
  s+=fade(clamp(u/.25),S.rect({x:x+90,y:yy-34,width:40,height:40,rx:6,fill:'none',stroke:C.ink,'stroke-width':3})+S.path({d:`M${x+96} ${yy-14} L${x+108} ${yy-2} L${x+128} ${yy-30}`,stroke:C.green,'stroke-width':5,fill:'none'})+
   S.text(x+156,yy,l,{'font-size':fit(l,w-220,38),'font-weight':700,fill:C.ink}),0)});
 const r4=ph('r4');if(r4>0){const msg=pick(v,'重複的流程 → 寫成一張卡','Repeated routine → write it on a card');
  s+=fade(clamp(r4/.25),S.rect({x:x+90,y:y+418,width:w-180,height:84,rx:8,fill:C.marker,opacity:.75})+S.text(x+w/2,y+474,msg,{'font-size':fit(msg,w-220,46),'font-weight':800,fill:C.stamp,'text-anchor':'middle'}),8)}
 const r5=ph('r5');if(r5>0)s+=fade(clamp(r5/.25),stamp(x+w/2,y+548,pick(v,'同一件事講到第 3 遍 → 寫成 Skill','Explaining it a 3rd time? → write a skill'),30,-2,C.teal),0);
 B.push({id:'recap-card',x,y,width:w+10,height:h});
 return s;
}

function title(scene,t){return S.text(864,300,scene.title||'',{'font-size':60,'font-weight':800,fill:C.ink,'text-anchor':'middle'})}
const SCENES={origin,anatomy,disclose,compare,create,invoke,outlook,recap,title};
