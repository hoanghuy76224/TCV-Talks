const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const html = fs.readFileSync(require('node:path').join(__dirname, '../index.html'), 'utf8');
for (const match of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)) {
  if (match[1].trim()) new vm.Script(match[1]);
}
const between = (start, end) => html.slice(html.indexOf(start), html.indexOf(end, html.indexOf(start)));
const context = vm.createContext({ console, Date, setTimeout, clearTimeout, AbortController });
vm.runInContext(`
  let elements = {}, awards = 0;
  let S = {}, activeLearner = {id:'regression'};
  const TRIAL_KEY='trial';
  const esc = value => String(value ?? '');
  const storageRead = () => ({courseV1:{level:'A2',work:{appointment:{step:1,word:'to'}}}});
  const storageWrite = () => {};
  const save = () => {};
  const today = () => '2026-11-25';
  const gain = points => {awards += points};
  const goalXP = () => 100;
  const queueProfileSave = () => {};
  const location = {hash:'#lesson-appointment'};
  const $ = selector => elements[selector.slice(1)];
  const app = {querySelectorAll:()=>[], append:()=>{}};
  Object.defineProperty(app,'innerHTML',{set(value){
    this.html=value; elements={};
    for(const match of value.matchAll(/id="([^"]+)"/g)) elements[match[1]]={value:'',textContent:'',disabled:false,isConnected:true,focus(){}};
  },get(){return this.html}});
  const WRITING_SKILLS={task:'',grammar:'',clarity:'',tone:''};
  const writingFeedbackHTML = () => '';
  const I={mic:''};
  const wireTextMic=()=>{};
`, context);
vm.runInContext(between('const FEEDBACK_RULES=', 'function teachingDetailsHTML'), context);
vm.runInContext(between('function explanationNeedsVietnamese(', 'function assessmentSummary'), context);
vm.runInContext(between('function voiceChunks(', 'function mobileVoice'), context);
vm.runInContext(between('function createCourse(', 'function route(){'), context);
vm.runInContext(`
  S.courseV1={level:'A2',minutes:10,goal:'Giao ti?p',current:'appointment',notes:{},errors:{},work:{appointment:{step:2,draft:'abc',choice:0,first:0}}};
  S.days={};
  course.render('lesson-appointment');
  if(!$('#course-mic')||!$('#course-mic-status'))throw Error('Lesson microphone missing');
  if(!$('#advance').disabled)throw Error('Unsubmitted restored draft unlocked completion');
  $('#advance').onclick();
  if(awards || S.courseV1.work.appointment.finished)throw Error('Unsubmitted work awarded XP');
  Object.assign(S.courseV1.work.appointment,{report:{strength:'OK',rewrite:'abc'},gradedDraft:'abc'});
  course.render('lesson-appointment');
  if($('#advance').disabled)throw Error('Graded current draft cannot complete');
  $('#course-draft').value='changed';$('#course-draft').oninput();
  if(!$('#advance').disabled || S.courseV1.work.appointment.report)throw Error('Editing did not invalidate review');
  Object.assign(S.courseV1.work.appointment,{report:{strength:'OK',rewrite:'changed'},gradedDraft:'changed'});
  course.render('lesson-appointment');$('#advance').onclick();
  if(awards!==25 || !S.courseV1.work.appointment.finished)throw Error('Valid completion failed');
  if(course.db()===storageRead().courseV1)throw Error('Profile uses guest object');
`, context);
const evaluate = code => vm.runInContext(code, context);
assert.equal(evaluate(`groundedFeedback({corrections:[{wrong:'practise',right:'practice',why:'Sai',rule:'Sai'}]},'Could we practise today?').corrections.length`), 0);
assert.equal(evaluate(`groundedFeedback({corrections:[]},'I look forward to hear from you.').corrections[0].right`), 'look forward to hearing');
assert.match(evaluate(`groundedFeedback({corrections:[{wrong:'on Friday',right:'to Friday',why:'Sai',rule:'to + ng�y'}]},'Could we move it on Friday?').corrections[0].rule`), /on \+ ng�y/);
assert.equal(evaluate(`groundedFeedback({corrections:[{wrong:'invented quote',right:'fixed',why:'Sai',rule:'Sai'}]},'A correct answer.').corrections.length`), 0);
assert.equal(evaluate(`writingResult({scores:{task:5,grammar:5,clarity:5,tone:5},strength:'D�ng',weakness:'Kh�ng c� l?i.',rewrite:'One merged sentence.',corrections:[]},'One. Two. Three. Four. Five. Six. Seven.').rewrite`), 'One. Two. Three. Four. Five. Six. Seven.');
assert.equal(evaluate(`writingResult({scores:{task:5,grammar:3,clarity:5,tone:5},strength:'Ro',weakness:'S?a',rewrite:'I look forward to hearing from you.',corrections:[]},'I look forward to hear from you.').rewrite`), 'I look forward to hearing from you.');
const text = 'A sentence that the teacher reads. '.repeat(90);
context.sample = text;
assert.equal(evaluate(`voiceChunks(sample).every(part=>part.length<=700)`), true);
assert.equal(evaluate(`voiceChunks(sample).join(' ')`), text.trim());
assert.equal(evaluate(`voiceChunks('x'.repeat(1501)).every(part=>part.length<=700)`), true);
assert.match(html, /if\(claim&&course\.hasTrial\(\)\)/);
async function audioTests(){
  const audio = vm.createContext({AbortController, Blob, URL, console});
  vm.runInContext(`
    let panel, fail=true;
    const timers=new Map();let timerId=0;
    const setTimeout=fn=>{timers.set(++timerId,fn);return timerId};
    const clearTimeout=id=>timers.delete(id);
    const node=tag=>({tag,style:{},children:[],hidden:false,isConnected:true,
      append(...items){this.children.push(...items)},setAttribute(){},pause(){},load(){},
      removeAttribute(){},remove(){this.isConnected=false},play(){return Promise.reject(Error('autoplay blocked'))}});
    const status={after(value){panel=value}};
    const document={activeElement:null,getElementById:()=>status,createElement:node};
    const voiceChoice=()=> 'auto';const exactVoiceRequired=()=>false;
    const VOICE_SPEAKERS={f:'luna'}, CFG={aiUrl:'https://example.test/'};
    const voiceStatus=()=>{};
    const readTtsCache=async()=>null,writeTtsCache=()=>{};
    const webSay=async()=>false,cloudVoiceOn=()=>true;
    const fetch=async()=>{if(fail)throw Error('unavailable');return {ok:true,blob:async()=>new Blob(['audio'],{type:'audio/mpeg'})}};
  `,audio);
  vm.runInContext(between('function voiceChunks(', 'function offerVoiceRetry'),audio);
  vm.runInContext(`const request=new AbortController();let done=mobileVoice('Hello.',1,'f',request.signal);`,audio);
  await new Promise(setImmediate);
  assert.match(vm.runInContext('panel.children[0].textContent',audio), /Chua t?i du?c gi?ng gi�o vi�n/);
  assert.equal(vm.runInContext('panel.children[2].hidden',audio),false);
  vm.runInContext('request.abort()',audio);
  await vm.runInContext('done',audio);
  assert.equal(vm.runInContext('panel.isConnected',audio),false);
  vm.runInContext(`fail=false;const request2=new AbortController();done=mobileVoice('Hello.',1,'f',request2.signal);`,audio);
  await new Promise(setImmediate);
  assert.equal(vm.runInContext('panel.children[1].hidden',audio),false);
  assert.match(vm.runInContext('panel.children[0].textContent',audio), /ch?n t? ph�t/);
  vm.runInContext('panel.children[4].onclick()',audio);
  await vm.runInContext('done',audio);
  assert.equal(vm.runInContext('timers.size',audio),0);
  console.log('PASS: syntax, restored completion gate, edited draft invalidation, XP, evidence, dialect variants, minimal rewrites, chunking, opt-in import, TTS failure recovery, autoplay controls, audio cancellation.');
}
async function micTests(){
  const mic=vm.createContext({console,AbortController,Event,Blob});
  vm.runInContext(`
    const window={addEventListener(){}};let activeLearner={id:'mic'};
    let canMedia=true,dict=null,WSR=null,rec={on:false};
    const I={mic:'mic'};const stopAudio=()=>{};const stopRec=()=>{};
    let count=0,deny=false,complete;
    const recordAudio=async(callback,signal)=>{
      count++;if(deny)throw Object.assign(Error('denied'),{name:'NotAllowedError'});
      const recorder={state:'recording',stop(){this.state='inactive';complete=callback(new Blob(['sample']))}};
      signal.addEventListener('abort',()=>{recorder.state='inactive'});
      return recorder;
    };
    const transcriptFromAudio=async()=> 'Water, please.';
    const button={isConnected:true,disabled:false,classList:{add(){},remove(){}},setAttribute(){}};
    const input={isConnected:true,value:'Hello.',maxLength:1800,events:[],dispatchEvent(event){this.events.push(event.type)}};
    const status={textContent:''};
  `,mic);
  vm.runInContext(between('let textMicSession=', 'const HWT='),mic);
  await vm.runInContext('wireTextMic(button,input,status);button.onclick()',mic);
  assert.match(vm.runInContext('button.innerHTML',mic),/D?ng ghi/);
  vm.runInContext('button.onclick()',mic);
  await vm.runInContext('complete',mic);
  assert.equal(vm.runInContext('input.value',mic),'Hello. Water, please.');
  assert.equal(vm.runInContext('input.events.join(",")',mic),'input,change');
  await vm.runInContext('button.onclick()',mic);
  assert.equal(vm.runInContext('count',mic),2);
  vm.runInContext('cancelTextMic()',mic);
  assert.match(vm.runInContext('status.textContent',mic),/Da h?y/);
  await vm.runInContext('deny=true;button.onclick()',mic);
  assert.match(vm.runInContext('status.textContent',mic),/dang b? ch?n/);
  await vm.runInContext('deny=false;canMedia=false;button.onclick()',mic);
  assert.match(vm.runInContext('status.textContent',mic),/Safari/);
  console.log('PASS: lesson mic rendering, start/stop, append transcript, input events, repeat recording, cancellation, denied permission and unsupported browser guidance.');
}
Promise.all([audioTests(),micTests()]).catch(error=>{console.error(error);process.exitCode=1});
