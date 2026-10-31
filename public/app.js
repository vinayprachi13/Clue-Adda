const socket=io();const $=id=>document.getElementById(id);let state=null;let lastGuessId=null;let lastWinId=null;let selectedCategory='bollywood';let selectedSubcategory='random';let catalog={categories:[],subcategories:[]};let soundEnabled=false;let audioCtx=null;let auth=JSON.parse(localStorage.getItem('clue-adda-session')||'null');
const toast=message=>{const el=$('toast');el.textContent=message;el.style.display='block';setTimeout(()=>el.style.display='none',3500)};
const request=(event,payload={})=>new Promise(resolve=>socket.emit(event,payload,resolve));
function popup(emoji,title,body,actions=[]){$('modalEmoji').textContent=emoji;$('modalTitle').textContent=title;$('modalBody').textContent=body;const area=$('modalActions');area.replaceChildren();for(const action of actions){const btn=document.createElement('button');btn.textContent=action.label;if(action.danger)btn.className='danger-action';btn.onclick=action.run;area.appendChild(btn)}if(!actions.length){const btn=document.createElement('button');btn.textContent='Got it!';btn.onclick=()=>{$('eventModal').hidden=true};area.appendChild(btn)}$('eventModal').hidden=false}
async function restartFromPopup(){if(!confirm('Play again with a new randomized board? The overall score will be preserved.'))return;const r=await request('newBoard',{categoryId:state.categoryId,difficulty:state.difficulty,keepSub:true});if(!r.ok)toast(r.error);else $('eventModal').hidden=true} 
function themePopup(){ $('eventModal').hidden=true; const el=$('themeSwitcher');if(el){el.querySelector('select')?.focus();}}
async function endFromPopup(){if(!confirm('End the game for everyone?'))return;const r=await request('endGame');if(!r.ok)toast(r.error);else resetSession()}
async function exitFromPopup(){const r=await request('leave');if(!r.ok)toast(r.error);else resetSession()}

$('modalClose').onclick=()=>{$('eventModal').hidden=true};
function show(state){
 if(state.lastGuess&&state.lastGuess.id!==lastGuessId){
   if(lastGuessId!==null&&state.lastGuess.color!=='X'&&['R','B'].includes(state.lastGuess.color)&&state.lastGuess.color!==state.lastGuess.guessingTeam){
     const beneficiary=state.lastGuess.color==='R'?'Red':'Blue';
     popup(({bollywood:'🎬',nostalgia:'🎮',halloween:'👻',diwali:'🪔',thanksgiving:'🍁',christmas:'🎁',newyear:'✨'})[state.categoryId]||'✦','Wrong team!',`${state.lastGuess.player} picked ${state.lastGuess.word} and gifted Team ${beneficiary} a card!`);playSound('lose');
   }
   lastGuessId=state.lastGuess.id;
 }
 const winId=state.ended?state.boardId:null;
 if(winId&&lastWinId!==winId){lastWinId=winId;const winner=state.winner==='R'?'Red':'Blue';const loser=state.winner==='R'?'Blue':'Red';const assassin=state.endReason==='assassin';const themes={bollywood:['🎬','Blockbuster victory!','Plot twist!'],nostalgia:['🎮','Level complete!','Game over!'],halloween:['👻','Bhoot-iful victory!','The Bhoot strikes!'],diwali:['🪔','Diwali dhamaka!','The diya flickers!'],thanksgiving:['🍁','A feast of clues!','The turkey escaped!'],christmas:['🎁','Holiday magic!','A lump of coal!'],newyear:['✨','Happy clue year!','Countdown catastrophe!']};const theme=themes[state.categoryId]||themes.bollywood;const title=assassin?theme[2]:theme[1];const body=assassin?`The Assassin ended this board! Team ${winner} wins. Score: Red ${state.score.R} : ${state.score.B} Blue.`:`Team ${winner} wins! Score: Red ${state.score.R} : ${state.score.B} Blue.`;const actions=state.isHost?[{label:'Play Again — New Board',run:restartFromPopup},{label:'Change Theme / Difficulty',run:themePopup},{label:'End Game',run:endFromPopup,danger:true}]:[{label:'View Board',run:()=>{$('eventModal').hidden=true}}];popup(theme[0],title,body,actions);playSound(assassin?'lose':'win');}
if(state.isHost&&!window.__hostSoundInitialized){window.__hostSoundInitialized=true;soundEnabled=true;$('muteToggle').textContent='Sound: On';} $('landing').hidden=true;$('game').hidden=false;$('codeText').textContent=state.code;$('roleText').textContent=state.isHost?'TV HOST':state.role==='spy'?`${state.team==='R'?'RED':'BLUE'} SPYMASTER — SECRET`:`${state.team==='R'?'RED':'BLUE'} PLAYER`;
 const identity=$('identity');identity.hidden=false;identity.className='identity '+(state.isHost?'host-identity':state.team==='R'?'red-identity':'blue-identity');identity.textContent=state.isHost?'📺 TV HOST · PUBLIC BOARD':`${state.name} · TEAM ${state.team==='R'?'RED':'BLUE'} · ${state.role==='spy'?'SPYMASTER':'PLAYER'}`;
 $('roundNum').textContent=`${state.category.toUpperCase()} · ${state.difficulty.toUpperCase()} · RANDOM BOARD`;document.documentElement.style.setProperty('--festival',catalog.categories.find(c=>c.id===state.categoryId)?.color||'#EFC278');$('roundTitle').textContent=state.title;$('subtitle').textContent=state.subtitle;
 $('score').textContent=`RED ${state.score.R}  :  ${state.score.B} BLUE`;$('redLeft').textContent=state.counts.R;$('blueLeft').textContent=state.counts.B;
 $('clueBanner').textContent=state.ended?'Round complete':state.clue?`TEAM ${state.turn==='R'?'RED':'BLUE'} · ${state.clue.word.toUpperCase()} — ${state.clue.count} · ${state.guessesLeft} guesses left`:`TEAM ${state.turn==='R'?'RED':'BLUE'} · ${state.started?'Spymaster: give your clue':'Waiting for host to start'}`;
 $('turnText').textContent=`${state.turn==='R'?'RED':'BLUE'} TURN`;
 let notice=state.ended?`Round over! ${state.winner==='R'?'Team Red':'Team Blue'} wins!`:!state.started?'Waiting for host to start the round':state.clue?`${state.turn==='R'?'Red':'Blue'} clue: ${state.clue.word} — ${state.clue.count} · ${state.guessesLeft} guesses left`:`${state.turn==='R'?'Red':'Blue'} spymaster: give your clue`;

 $('notice').textContent=notice;
 $('board').replaceChildren(...state.cards.map((card,index)=>{const b=document.createElement('button');b.className='card'+(card.revealed?' revealed '+card.color:'')+(state.role==='spy'?' secret':'');b.textContent=card.word;
 if(card.color==='X'&&(state.role==='spy'||card.revealed)){b.classList.add('assassin-card');b.replaceChildren();const skull=document.createElement('span');skull.className='assassin-skull';skull.textContent='☠';skull.setAttribute('aria-hidden','true');const word=document.createElement('span');word.textContent=card.word;const tag=document.createElement('span');tag.className='assassin-label';tag.textContent='ASSASSIN';b.append(skull,word,tag);b.setAttribute('aria-label',card.word+' — Assassin card');}
 if(state.role==='spy'&&card.color)b.style.setProperty('--secret',({R:'#b95163',B:'#4b78b9',N:'#a99d94',X:'#19131c'})[card.color]);
 const canGuess=state.role==='player'&&state.team===state.turn&&state.started&&!state.ended&&!!state.clue&&!card.revealed;
 b.disabled=!canGuess;if(canGuess){b.classList.add('guessable');b.onclick=async()=>{if(!confirm(`Reveal ${card.word}? This guess is final.`))return;const res=await request('guess',{index});if(!res.ok)toast(res.error)}};
 return b;}));
 const controls=$('controls');controls.replaceChildren();const add=(label,fn)=>{const b=document.createElement('button');b.textContent=label;b.onclick=fn;controls.appendChild(b)};
 if(state.isHost){
 if(state.ended){add('Play Again — New Board',restartFromPopup);add('Change Theme / Difficulty',themePopup);}
 if(!state.started)add('Start Game',async()=>{const r=await request('start');if(!r.ok)toast(r.error);else playSound('start')});
 const selector=document.createElement('div');selector.className='round-picker';selector.id='themeSwitcher';if(state.ended||!state.started){
 const h=document.createElement('h3');h.textContent='Next Board — Category → Subcategory → Difficulty';
 const cat=document.createElement('select');cat.setAttribute('aria-label','Category');for(const c of catalog.categories){const opt=document.createElement('option');opt.value=c.id;opt.textContent=c.name;cat.appendChild(opt)}cat.value=state.categoryId;
 const sub=document.createElement('select');sub.setAttribute('aria-label','Subcategory');
 function fillSubs(){sub.replaceChildren();const any=document.createElement('option');any.value='random';any.textContent='Surprise Me — Random';sub.appendChild(any);for(const item of catalog.subcategories.filter(x=>x.categoryId===cat.value)){const o=document.createElement('option');o.value=item.id;o.textContent=item.title;sub.appendChild(o)}sub.value=cat.value===state.categoryId?state.subcategoryId:'random'}
 cat.onchange=()=>{fillSubs()};fillSubs();
 const dif=document.createElement('select');dif.setAttribute('aria-label','Difficulty');for(const d of ['Easy','Medium','Hard']){const opt=document.createElement('option');opt.textContent=d;dif.appendChild(opt)}dif.value=state.difficulty;
 const btn=document.createElement('button');btn.textContent='Generate New Board';btn.onclick=async()=>{if(!confirm('Generate a new board? Overall score and players will stay.'))return;const r=await request('newBoard',{categoryId:cat.value,subcategoryId:sub.value,difficulty:dif.value});if(!r.ok)toast(r.error)};
 selector.append(h,cat,sub,dif,btn);controls.appendChild(selector)}
 $('hostHelp').hidden=false;$('qr').src='/api/qr/'+state.code;$('inviteUrl').value=`${location.origin}/?room=${state.code}`;}
 else $('hostHelp').hidden=true;
 if((state.isHost||(state.role==='spy'&&state.turn===state.team))&&state.started&&!state.ended&&!state.clue){const form=document.createElement('form');const input=document.createElement('input');input.placeholder='One-word clue';input.required=true;input.maxLength=40;const select=document.createElement('select');for(let i=1;i<=9;i++){const o=document.createElement('option');o.value=i;o.textContent=i;select.appendChild(o)}const submit=document.createElement('button');submit.textContent=state.isHost?'Set clue on TV':'Send clue';form.append(input,select,submit);form.onsubmit=async e=>{e.preventDefault();const r=await request('clue',{word:input.value,count:Number(select.value)});if(!r.ok)toast(r.error)};controls.appendChild(form)}
 add(state.isHost?'End game for everyone':'Exit game',async()=>{const isHost=state.isHost;if(!confirm(isHost?'End the game for everyone? All players will be disconnected.':'Exit this game room?'))return;const r=await request(isHost?'endGame':'leave');if(!r.ok)toast(r.error);else resetSession()});
 if(state.role==='player'&&state.started&&!state.ended&&state.turn===state.team&&state.clue)add('End guessing / pass',async()=>{const r=await request('pass');if(!r.ok)toast(r.error)});
 const people=$('people');people.replaceChildren();const heading=document.createElement('h3');heading.textContent='Who’s playing?';people.appendChild(heading);const grid=document.createElement('div');grid.className='roster';for(const team of ['R','B']){const col=document.createElement('div');col.className='roster-col '+(team==='R'?'roster-red':'roster-blue');const title=document.createElement('h4');title.textContent=team==='R'?'TEAM RED':'TEAM BLUE';col.appendChild(title);const list=document.createElement('table');const tbody=document.createElement('tbody');for(const player of state.players.filter(p=>p.team===team)){const tr=document.createElement('tr');const name=document.createElement('td');name.textContent=player.name+(player.connected?'':' (offline)');const role=document.createElement('td');role.textContent=player.role==='spy'?'Spymaster':'Player';tr.append(name,role);tbody.appendChild(tr)}if(!tbody.children.length){const tr=document.createElement('tr');const td=document.createElement('td');td.textContent='No players yet';td.colSpan=2;tr.appendChild(td);tbody.appendChild(tr)}list.appendChild(tbody);col.appendChild(list);grid.appendChild(col)}people.appendChild(grid);
}
socket.on('state',s=>{if(state&&s.boardId!==state.boardId){lastGuessId=null;lastWinId=null}if(!state&&s.lastGuess)lastGuessId=s.lastGuess.id;state=s;show(s)});socket.on('replaced',()=>toast('This session was opened on another device.'));
socket.on('connect',async()=>{if(auth){const r=await request('resume',auth);if(!r.ok){localStorage.removeItem('clue-adda-session');auth=null;toast('Session expired. Please join again.')}}});

// Category cards, keyword search, and optional subcategory descriptions.
async function loadCatalog(){try{const r=await fetch('/api/categories');catalog=await r.json();renderCategories()}catch(e){toast('Could not load categories. Refresh the page.')}}
function fuzzyMatch(word,query){if(word.startsWith(query)||word.includes(query))return true;if(query.length<4)return false;let prev=Array.from({length:query.length+1},(_,i)=>i);for(const ch of word){const next=[prev[0]+1];for(let j=1;j<=query.length;j++)next[j]=Math.min(next[j-1]+1,prev[j]+1,prev[j-1]+(ch===query[j-1]?0:1));prev=next;}return prev[query.length]<=1;}
function updateSubcategories(){
 const sel=$('createSubcategory');const previous=selectedSubcategory;sel.replaceChildren();
 const random=document.createElement('option');random.value='random';random.textContent='Surprise Me — Random';sel.appendChild(random);
 const subs=catalog.subcategories.filter(x=>x.categoryId===selectedCategory);
 for(const item of subs){const option=document.createElement('option');option.value=item.id;option.textContent=item.title;sel.appendChild(option)}
 selectedSubcategory=subs.some(x=>x.id===previous)?previous:'random';sel.value=selectedSubcategory;
 updateSubDescription();
}
function updateSubDescription(){const s=catalog.subcategories.find(x=>x.id===selectedSubcategory);$('subcategoryDescription').textContent=s?s.subtitle:'Clue Adda will randomly choose one of the five subcategories.'}
$('createSubcategory').addEventListener('change',e=>{selectedSubcategory=e.target.value;updateSubDescription()});
function renderCategories(){const q=$('categorySearch').value.toLowerCase().trim();const container=$('categoryCards');container.replaceChildren();const terms=q.split(/\s+/).filter(Boolean);for(const c of catalog.categories){const subs=catalog.subcategories.filter(s=>s.categoryId===c.id);const text=[c.name,c.keywords,...subs.flatMap(s=>[s.title,s.subtitle])].join(' ').toLowerCase();if(!terms.every(t=>text.includes(t)||text.split(/\W+/).some(w=>fuzzyMatch(w,t))))continue;const b=document.createElement('button');b.type='button';b.className='category-option'+(selectedCategory===c.id?' selected':'');b.style.setProperty('--category',c.color);const icon=document.createElement('span');icon.className='category-icon';icon.textContent=({bollywood:'▣',nostalgia:'✦',halloween:'☾',diwali:'✺',thanksgiving:'❧',christmas:'✳',newyear:'✧'})[c.id]||'✦';const label=document.createElement('strong');label.textContent=c.name;const sub=document.createElement('small');sub.textContent='5 subcategories';b.append(icon,label,sub);b.onclick=()=>{selectedCategory=c.id;selectedSubcategory='random';renderCategories()};container.appendChild(b)}if(!container.children.length){container.textContent='No themes found. Try another keyword.';}const chosen=catalog.categories.find(c=>c.id===selectedCategory);const subs=catalog.subcategories.filter(s=>s.categoryId===selectedCategory);$('themeDetails').replaceChildren();if(chosen){const details=document.createElement('details');const summary=document.createElement('summary');summary.textContent=`Explore ${chosen.name}: 5 subcategories`;details.appendChild(summary);for(const s of subs){const p=document.createElement('p');const strong=document.createElement('strong');strong.textContent=s.title+' — ';p.append(strong,document.createTextNode(s.subtitle));details.appendChild(p)}$('themeDetails').appendChild(details)}updateSubcategories()}
$('categorySearch').addEventListener('input',renderCategories);loadCatalog();
$('create').onclick=async()=>{const r=await request('create',{categoryId:selectedCategory,subcategoryId:selectedSubcategory,difficulty:$('createDifficulty').value});if(r.ok){auth={code:r.code,token:r.token};localStorage.setItem('clue-adda-session',JSON.stringify(auth));}else toast(r.error)};
$('joinForm').onsubmit=async e=>{e.preventDefault();const r=await request('join',{code:$('roomCode').value,name:$('name').value,team:document.querySelector('input[name="team"]:checked').value,role:$('role').value});if(r.ok){$('joinError').hidden=true;auth={code:r.code,token:r.token};localStorage.setItem('clue-adda-session',JSON.stringify(auth))}else{const error=$('joinError');error.textContent=r.error;error.hidden=false;error.scrollIntoView({behavior:'smooth',block:'nearest'});}};
$('copy').onclick=async()=>{const url=`${location.origin}/?room=${state.code}`;try{await navigator.clipboard.writeText(url);toast('Invite link copied!')}catch{toast(url)}};
const params=new URLSearchParams(location.search);const invitedCode=params.get('room');if(invitedCode){$('roomCode').value=invitedCode;$('createOptions').hidden=true;$('joinSeparator').hidden=true;$('landingTitle').textContent='Join the Room';$('landingIntro').textContent='You’ve been invited to play Clue Adda!';$('joinInviteText').hidden=false;}

function resetSession(){auth=null;state=null;lastGuessId=null;lastWinId=null;localStorage.removeItem('clue-adda-session');$('game').hidden=true;$('landing').hidden=false;$('eventModal').hidden=true;history.replaceState({},'',location.pathname);$('createOptions').hidden=false;$('joinSeparator').hidden=false;$('landingTitle').textContent='Welcome to Clue Adda';$('landingIntro').textContent='Host on a TV. Join from your phones. Keep spymaster secrets private.';$('joinInviteText').hidden=true;$('roomCode').value='';$('joinError').hidden=true}
socket.on('roomClosed',()=>{resetSession();toast('The host ended the game. Thanks for playing!')});

$('copyInviteUrl').onclick=async()=>{const url=$('inviteUrl').value;try{await navigator.clipboard.writeText(url);toast('Game link copied!')}catch{$('inviteUrl').select();toast('Select and copy the link shown below the QR code.')}};

for(const el of $('joinForm').querySelectorAll('input,select'))el.addEventListener('change',()=>{$('joinError').hidden=true});

// Version 8: role-specific instructions. Open and close without changing game state.
let rulesReturnFocus=null;
function showRules(tab){
 rulesReturnFocus=document.activeElement;
 $('rulesPlayer').hidden=tab==='spy';$('rulesSpy').hidden=tab!=='spy';
 $('rulesPlayerTab').setAttribute('aria-selected',String(tab!=='spy'));
 $('rulesSpyTab').setAttribute('aria-selected',String(tab==='spy'));
 $('rulesScreen').hidden=false;document.body.classList.add('rules-open');
 $('rulesScreen').scrollTop=0;$('backToScreen').focus();
}
function closeRules(){
 $('rulesScreen').hidden=true;document.body.classList.remove('rules-open');
 if(rulesReturnFocus&&rulesReturnFocus.isConnected)rulesReturnFocus.focus();
}
$('howToPlayLanding').onclick=()=>showRules('player');
$('howToPlayGame').onclick=()=>showRules(state?.role==='spy'?'spy':'player');
$('rulesPlayerTab').onclick=()=>showRules('player');
$('rulesSpyTab').onclick=()=>showRules('spy');
$('backToScreen').onclick=closeRules;
$('backToScreenBottom').onclick=closeRules;
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('rulesScreen').hidden)closeRules()});

// Per-device sound controls; browsers require a user gesture to unlock audio.
function playSound(kind){if(!soundEnabled)return;try{audioCtx??=new (window.AudioContext||window.webkitAudioContext)();audioCtx.resume();const vol=Number($('volumeControl').value)/100;const notes=kind==='win'?[523,659,784]:kind==='lose'?[392,311,220]:[440,554];notes.forEach((hz,i)=>{const osc=audioCtx.createOscillator(),gain=audioCtx.createGain();osc.type=kind==='lose'?'triangle':'sine';osc.frequency.value=hz;gain.gain.setValueAtTime(0.0001,audioCtx.currentTime+i*.14);gain.gain.exponentialRampToValueAtTime(Math.max(.001,vol*.11),audioCtx.currentTime+i*.14+.02);gain.gain.exponentialRampToValueAtTime(.0001,audioCtx.currentTime+i*.14+.23);osc.connect(gain).connect(audioCtx.destination);osc.start(audioCtx.currentTime+i*.14);osc.stop(audioCtx.currentTime+i*.14+.24)})}catch{}}
$('muteToggle').onclick=()=>{soundEnabled=!soundEnabled;$('muteToggle').textContent='Sound: '+(soundEnabled?'On':'Off');if(soundEnabled)playSound('start')};
$('motionControl').onchange=()=>document.body.dataset.motion=$('motionControl').value.toLowerCase();
if(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches){$('motionControl').value='Reduced';document.body.dataset.motion='reduced';}
