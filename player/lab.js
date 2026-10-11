// Interactive check tied to the learning goal: implicit invocation happens when a request matches the
// skill's description (official docs); otherwise call it explicitly with $skill-name.
(function(){
 const KEYS={yes:'會自動觸發',no:'不會觸發'};
 const DESC='name: handout-format\ndescription: 把課程講義整理成課堂版（標題、學習目標、練習題）。\n             使用者要「整理講義」時使用。';
 const TASKS=[
  {q:'「幫我把第 5 週的講義整理成上課用的版本。」',a:'yes',why:'需求和 description 的「整理講義、課堂版」相符，Codex 會選用這個 Skill。'},
  {q:'「修好這個 repo 的 CI 錯誤。」',a:'no',why:'跟講義無關，description 不相符；這比較像 gh-fix-ci 的工作。'},
  {q:'「把這份 Markdown 筆記排成有學習目標和練習題的講義。」',a:'yes',why:'雖然沒說「整理講義」四個字，但內容符合 description 寫的用途（學習目標、練習題）。'},
  {q:'「幫我算全班的期末總成績。」',a:'no',why:'description 沒提到成績計算，不會觸發；想確定用哪個 Skill 時，直接輸入 $ 點名最可靠。'}];
 const lab=document.getElementById('lab');if(!lab)return;
 let h='<h2>互動練習：這句需求會不會自動觸發 Skill？</h2><p class="fine">Codex 用 description 判斷是否隱含呼叫。讀下面的 SKILL.md 開頭，再判斷每句需求；每題可重選。</p><pre class="lab-desc">'+DESC.replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]))+'</pre><div class="lab-grid">';
 TASKS.forEach((t,i)=>{h+=`<div class="lab-card"><p><strong>${i+1}.</strong> ${t.q}</p><div class="choices" role="group" aria-label="第 ${i+1} 題選項">`+
  Object.entries(KEYS).map(([k,l])=>`<button type="button" data-i="${i}" data-k="${k}" aria-pressed="false">${l}</button>`).join('')+`</div><p class="feedback" id="fb${i}" aria-live="polite"></p></div>`});
 lab.innerHTML=h+'</div>';
 lab.addEventListener('click',e=>{const b=e.target.closest('button[data-i]');if(!b)return;const i=+b.dataset.i,t=TASKS[i],fb=document.getElementById('fb'+i);
  lab.querySelectorAll(`button[data-i="${i}"]`).forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
  const ok=b.dataset.k===t.a;fb.className='feedback '+(ok?'ok':'bad');fb.textContent=ok?'正確！'+t.why:'再想想：比對一下 description 寫的用途。'});
 window.labInfo={keys:Object.keys(KEYS),answers:TASKS.map(t=>t.a)};
})();
// Second check tied to the comparison scene: which extension point fits each need (official customization overview).
(function(){
 const KEYS={agents:'AGENTS.md',skill:'Skill',mcp:'MCP',plugin:'Plugin'};
 const TASKS=[
  {q:'這個專案一律用 pnpm，不要用 npm。',a:'agents',why:'每次都要遵守的專案規則，放 AGENTS.md，開始工作前就會先讀。'},
  {q:'每週把講義整理成固定格式，還要跑檢查腳本。',a:'skill',why:'某一類任務的可重複做法，寫成 Skill，用到才載入。'},
  {q:'讓 Codex 能查詢學校的課程資料庫。',a:'mcp',why:'連接外部系統要用 MCP。'},
  {q:'把三個 Skill 和一個資料庫連線一起分享給全系老師。',a:'plugin',why:'要分享、要把 Skill 和 MCP 打包在一起，就做成 Plugin。'}];
 const lab=document.getElementById('lab');if(!lab)return;
 const box=document.createElement('div');let h='<h2 style="margin-top:22px">互動練習二：這個需求該放哪一層？</h2><p class="fine">依官方 Customization overview 的分工作答。</p><div class="lab-grid">';
 TASKS.forEach((t,i)=>{h+=`<div class="lab-card"><p><strong>${i+1}.</strong> ${t.q}</p><div class="choices" role="group" aria-label="練習二第 ${i+1} 題選項">`+
  Object.entries(KEYS).map(([k,l])=>`<button type="button" data-j="${i}" data-k="${k}" aria-pressed="false">${l}</button>`).join('')+`</div><p class="feedback" id="fl${i}" aria-live="polite"></p></div>`});
 box.innerHTML=h+'</div>';lab.append(box);
 box.addEventListener('click',e=>{const b=e.target.closest('button[data-j]');if(!b)return;const i=+b.dataset.j,t=TASKS[i],fb=document.getElementById('fl'+i);
  box.querySelectorAll(`button[data-j="${i}"]`).forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
  const ok=b.dataset.k===t.a;fb.className='feedback '+(ok?'ok':'bad');fb.textContent=ok?'正確！'+t.why:'再想想：這件事是規則、流程、連外部，還是要分享？'});
})();
