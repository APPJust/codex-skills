// Every visible state is a pure function of frame, variant and explicit interaction state.
// Each variant (zh-TW / en-US narration) carries its own scene timing, mix and subtitle cues.
const $=id=>document.getElementById(id),params=new URLSearchParams(location.search);
const exporting=params.get('export')==='1';if(exporting)document.body.classList.add('export');
const projectUrl=new URL(params.get('project')||'../project.json',location.href);
let project,frame=0,variant=params.get('variant')||params.get('locale')||'zh-TW',playing=false,captionOn=true,last=0,audio=new Audio(),audioReady=false,customBounds=[];
const SECTION_LABEL={origin:'01 · 起源 ORIGIN',principle:'02 · 原理 PRINCIPLE',comparison:'03 · 比較 COMPARISON',application:'04 · 應用 APPLICATION',outlook:'05 · 展望 OUTLOOK',credit:''};
function scale(){if(!project)return;const sh=$('shell'),cs=getComputedStyle(sh),avail=sh.clientWidth-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight),s=exporting?1:Math.min(1,avail/project.width);$('stage').style.transform='scale('+s+')';$('viewport').style.width=project.width*s+'px';$('viewport').style.height=project.height*s+'px'}
function scenes(){return project.variants[variant].scenes||project.scenes}
function currentScene(t){return scenes().find(s=>t>=s.start&&t<s.end)||scenes().at(-1)}
function setAudio(){audio.pause();const mix=project.variants[variant].mix;audioReady=!!mix;if(mix)audio.src=new URL(mix,projectUrl).href;else audio.removeAttribute('src');audio.load()}
function chapters(){const select=$('chapters');select.replaceChildren();for(const s of scenes()){const o=document.createElement('option');o.value=s.start;o.textContent=(s.chapter||s.title||s.screen);select.append(o)}}
function variants(){const select=$('locale');select.replaceChildren();for(const [k,v] of Object.entries(project.variants)){const o=document.createElement('option');o.value=k;o.textContent=v.label||k;select.append(o)}select.value=variant}
async function loadFonts(){for(const a of project.font_assets||[]){const face=new FontFace(a.family,'url('+JSON.stringify(new URL(a.url,projectUrl).href)+')',a.descriptors||{});try{document.fonts.add(await face.load())}catch{throw Error('Required font could not load: '+a.family)}}await document.fonts.ready}
function draw(){const t=frame/project.fps,s=currentScene(t),credit=s.section==='credit';
 $('eyebrow').textContent=SECTION_LABEL[s.section]||'';
 $('heading').innerHTML='';$('heading').append(s.title||'');if(s.title_en){const e=document.createElement('span');e.className='en';e.textContent=s.title_en;$('heading').append(e)}
 $('subheading').textContent=s.screen||'';
 for(const id of ['eyebrow','heading','subheading','visual'])$(id).style.display=credit?'none':'block';
 $('credit').style.display=credit?'flex':'none';
 if(credit){const u=Math.min(1,(t-s.start)/.6);$('credit').style.opacity=u;$('credit').style.transform='translateY('+(1-u)*24+'px)'}
 customBounds=[];if(!credit){const fn=SCENES[s.kind]||SCENES.title;$('art').innerHTML=fn(s,t,customBounds,variant)}
 const tin=Math.min(1,Math.max(0,(t-s.start)/.4)),ein=1-Math.pow(1-tin,3);
 for(const id of ['eyebrow','heading','subheading'])$(id).style.opacity=s.start===0?1:ein;
 $('visual').style.transform=s.start===0?'none':'translateY('+(1-ein)*18+'px)';
 const cue=project.variants[variant].subtitles.cues.find(c=>t>=c.start&&t<c.end);
 $('caption').style.display=cue&&captionOn&&!credit?'flex':'none';$('caption1').textContent=cue?.text[0]||'';$('caption2').textContent=cue?.text[1]||'';
 $('progress-mark').style.width=100*t/project.duration+'%';$('seek').value=frame;
 $('time').textContent=fmt(t)+' / '+fmt(project.duration);$('chapters').value=s.start;
}
const fmt=t=>Math.floor(t/60)+':'+String(Math.floor(t%60)).padStart(2,'0');
async function seekToFrame(n,v=variant){if(!project.variants[v])throw Error('Unknown variant');if(v!==variant){variant=v;$('locale').value=variant;setAudio();chapters()}frame=Math.max(0,Math.min(Math.round(project.duration*project.fps)-1,Math.round(n)));draw();if(!exporting&&audioReady&&Math.abs(audio.currentTime-frame/project.fps)>.15)audio.currentTime=frame/project.fps;return frame}
function pause(){playing=false;audio.pause();$('play').textContent='播放'}
async function play(){if(frame>=project.duration*project.fps-1)await seekToFrame(0);playing=true;last=performance.now();$('play').textContent='暫停';if(audioReady){audio.currentTime=frame/project.fps;try{await audio.play()}catch{pause();return}}requestAnimationFrame(tick)}
function tick(now){if(!playing)return;const next=audioReady?Math.floor(audio.currentTime*project.fps):frame+(now-last)*project.fps/1000;last=now;if(next>=project.duration*project.fps){seekToFrame(project.duration*project.fps-1);pause();return}frame=next;draw();requestAnimationFrame(tick)}
audio.addEventListener('ended',()=>{if(playing){seekToFrame(project.duration*project.fps-1);pause()}});
window.lesson={ready:async()=>{await loaded;await document.fonts.ready},seekToFrame,getProject:()=>project,
 bounds:()=>{if($('visual').style.display==='none')return [];const v=$('visual').getBoundingClientRect(),st=$('stage').getBoundingClientRect(),k=st.width/project.width,ox=(v.x-st.x)/k,oy=(v.y-st.y)/k;return customBounds.map(b=>({...b,x:b.x+ox,y:b.y+oy,container:'visual'}))}};
const loaded=(async()=>{const res=await fetch(projectUrl);if(!res.ok)throw Error('Cannot load project.json');project=await res.json();if(!project.variants[variant])variant=Object.keys(project.variants)[0];
 await loadFonts();$('stage').style.width=project.width+'px';$('stage').style.height=project.height+'px';$('checked').textContent=project.checked_at||'';if(project.title)$('pageTitle').textContent=project.title;
 $('seek').max=Math.round(project.duration*project.fps)-1;variants();chapters();setAudio();scale();await seekToFrame(0);window.dispatchEvent(new Event('lesson-ready'))})();
$('play').onclick=()=>playing?pause():play();
$('replay').onclick=async()=>{pause();await seekToFrame(0);await play()};
$('seek').oninput=()=>{pause();seekToFrame(Number($('seek').value))};
$('locale').onchange=()=>{const was=playing;pause();seekToFrame(frame,$('locale').value).then(()=>{if(was)play()})};
$('chapters').onchange=()=>{pause();seekToFrame(Number($('chapters').value)*project.fps)};
$('captions').onclick=()=>{captionOn=!captionOn;$('captions').textContent=captionOn?'字幕開啟':'字幕關閉';$('captions').setAttribute('aria-pressed',String(captionOn));draw()};
document.addEventListener('keydown',e=>{if(e.target.closest('input,select,button'))return;if(e.code==='Space'){e.preventDefault();playing?pause():play()}});
window.addEventListener('resize',scale);
