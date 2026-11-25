const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const html = fs.readFileSync(require('node:path').join(__dirname, '../index.html'), 'utf8').replace(/\r\n/g, '\n');
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
  S.courseV1={level:'A2',minutes:10,goal:'Giao tiếp',current:'appointment',notes:{},errors:{},work:{appointment:{step:2,draft:'abc',choice:0,first:0}}};
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
assert.match(evaluate(`groundedFeedback({corrections:[{wrong:'on Friday',right:'to Friday',why:'Sai',rule:'to + ngày'}]},'Could we move it on Friday?').corrections[0].rule`), /on \+ ngày/);
assert.equal(evaluate(`groundedFeedback({corrections:[{wrong:'invented quote',right:'fixed',why:'Sai',rule:'Sai'}]},'A correct answer.').corrections.length`), 0);
assert.equal(evaluate(`writingResult({scores:{task:5,grammar:5,clarity:5,tone:5},strength:'Đúng',weakness:'Không có lỗi.',rewrite:'One merged sentence.',corrections:[]},'One. Two. Three. Four. Five. Six. Seven.').rewrite`), 'One. Two. Three. Four. Five. Six. Seven.');
assert.equal(evaluate(`writingResult({scores:{task:5,grammar:3,clarity:5,tone:5},strength:'Rõ',weakness:'Sửa',rewrite:'I look forward to hearing from you.',corrections:[]},'I look forward to hear from you.').rewrite`), 'I look forward to hearing from you.');
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
  vm.runInContext(between('function healthyPcmVoice(', 'async function normalizeVoiceBlob'),audio);
  vm.runInContext(between('async function normalizeVoiceBlob(', 'async function readTtsCache'),audio);
  vm.runInContext(`const request=new AbortController();let done=mobileVoice('Hello.',1,'f',request.signal);`,audio);
  await new Promise(setImmediate);
  assert.match(vm.runInContext('panel.children[0].textContent',audio), /Chưa tải được giọng giáo viên/);
  assert.equal(vm.runInContext('panel.children[2].hidden',audio),false);
  vm.runInContext('request.abort()',audio);
  await vm.runInContext('done',audio);
  assert.equal(vm.runInContext('panel.isConnected',audio),false);
  vm.runInContext(`fail=false;const request2=new AbortController();done=mobileVoice('Hello.',1,'f',request2.signal);`,audio);
  await new Promise(setImmediate);
  assert.equal(vm.runInContext('panel.children[1].hidden',audio),false);
  assert.match(vm.runInContext('panel.children[0].textContent',audio), /chặn tự phát/);
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
  assert.match(vm.runInContext('button.innerHTML',mic),/Dừng ghi/);
  vm.runInContext('button.onclick()',mic);
  await vm.runInContext('complete',mic);
  assert.equal(vm.runInContext('input.value',mic),'Hello. Water, please.');
  assert.equal(vm.runInContext('input.events.join(",")',mic),'input,change');
  await vm.runInContext('button.onclick()',mic);
  assert.equal(vm.runInContext('count',mic),2);
  vm.runInContext('cancelTextMic()',mic);
  assert.match(vm.runInContext('status.textContent',mic),/Đã hủy/);
  await vm.runInContext('deny=true;button.onclick()',mic);
  assert.match(vm.runInContext('status.textContent',mic),/đang bị chặn/);
  await vm.runInContext('deny=false;canMedia=false;button.onclick()',mic);
  assert.match(vm.runInContext('status.textContent',mic),/Safari/);
  console.log('PASS: lesson mic rendering, start/stop, append transcript, input events, repeat recording, cancellation, denied permission and unsupported browser guidance.');
}
async function wavTests(){
  const wav=vm.createContext({Blob,console});
  vm.runInContext(between('function healthyPcmVoice(', 'async function normalizeVoiceBlob'),wav);
  vm.runInContext(between('async function normalizeVoiceBlob(', 'async function readTtsCache'),wav);
  // A streamed WAV includes metadata and unknown RIFF/data sizes, as returned by TTS.
  const bytes=Buffer.alloc(70);
  bytes.write('RIFF',0);bytes.writeUInt32LE(0xffffffff,4);bytes.write('WAVEfmt ',8);
  bytes.writeUInt32LE(16,16);bytes.writeUInt16LE(1,20);bytes.writeUInt16LE(1,22);
  bytes.writeUInt32LE(24000,24);bytes.writeUInt32LE(48000,28);bytes.writeUInt16LE(2,32);bytes.writeUInt16LE(16,34);
  bytes.write('LIST',36);bytes.writeUInt32LE(4,40);bytes.write('INFO',44);
  bytes.write('data',48);bytes.writeUInt32LE(0xffffffff,52);
  for(let i=56;i<bytes.length;i++)bytes[i]=i;
  wav.sample=new Blob([bytes],{type:'audio/wav'});
  const normalized=await vm.runInContext('normalizeVoiceBlob(sample)',wav);
  const output=Buffer.from(await normalized.arrayBuffer());
  assert.equal(output.length,58);
  assert.equal(output.readUInt32LE(4),output.length-8);
  assert.equal(output.readUInt32LE(40),14);
  assert.equal(output.readUInt32LE(24),24000);
  assert.deepEqual(output.subarray(44),bytes.subarray(56));
  wav.sample=normalized;
  assert.deepEqual(Buffer.from(await (await vm.runInContext('normalizeVoiceBlob(sample)',wav)).arrayBuffer()),output);
  wav.mp3=new Blob([Buffer.from('ID3audio')],{type:'audio/mpeg'});
  assert.equal(await vm.runInContext('normalizeVoiceBlob(mp3)',wav),wav.mp3);
  console.log('PASS: streaming WAV sizes, metadata removal, exact PCM preservation, idempotent normalization and MP3 passthrough.');
}
async function mp3Tests(){
  const ctx=vm.createContext({Blob,console,setTimeout,clearTimeout,DOMException});
  vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,'../vendor/lame.min.js'),'utf8'),ctx);
  vm.runInContext('const window={lamejs};',ctx);
  vm.runInContext(between('function healthyPcmVoice(', 'async function normalizeVoiceBlob'),ctx);
  vm.runInContext(between('async function normalizeVoiceBlob(', 'async function readTtsCache'),ctx);
  const pcm=Buffer.alloc(44+24000*2);
  pcm.write('RIFF',0);pcm.writeUInt32LE(pcm.length-8,4);pcm.write('WAVEfmt ',8);pcm.writeUInt32LE(16,16);
  pcm.writeUInt16LE(1,20);pcm.writeUInt16LE(1,22);pcm.writeUInt32LE(24000,24);pcm.writeUInt32LE(48000,28);
  pcm.writeUInt16LE(2,32);pcm.writeUInt16LE(16,34);pcm.write('data',36);pcm.writeUInt32LE(pcm.length-44,40);
  for(let i=0;i<24000;i++)pcm.writeInt16LE(Math.round(8000*Math.sin(2*Math.PI*440*i/24000)),44+i*2);
  ctx.wav=new Blob([pcm],{type:'audio/wav'});
  const result=await vm.runInContext('playableVoiceBlob(wav)',ctx);
  const bytes=Buffer.from(await result.arrayBuffer());
  assert.equal(result.type,'audio/mpeg');assert.ok(bytes.length>1000&&bytes.length<pcm.length);
  assert.equal(bytes[0],255);assert.equal(bytes[1]&224,224);
  ctx.mp3=result;assert.equal(await vm.runInContext('playableVoiceBlob(mp3)',ctx),result);
  ctx.cancelled={aborted:true};await assert.rejects(vm.runInContext('playableVoiceBlob(wav,cancelled)',ctx),/cancelled/);
  console.log('PASS: real MP3 encoder, valid MPEG frames, PCM-to-MP3 compression, MP3 passthrough, cancelled conversion.');
}
async function qualityTests(){
  const ctx=vm.createContext({Blob,console,Response,Request,TextEncoder,crypto:require('node:crypto').webcrypto});
  const helper=between('function healthyPcmVoice(', 'async function normalizeVoiceBlob');
  vm.runInContext(helper,ctx);
  const worker=fs.readFileSync(require('node:path').join(__dirname,'../ai-worker/worker.js'),'utf8').replace(/\r\n/g, '\n');
  assert.equal(worker.slice(worker.indexOf('function healthyPcmVoice('),worker.indexOf('async function synthesize(req')),helper.trimEnd()+'\n\n');
  const makeWav=pulse=>{
    const b=Buffer.alloc(44+24000*2);b.write('RIFF',0);b.writeUInt32LE(b.length-8,4);b.write('WAVEfmt ',8);
    b.writeUInt32LE(16,16);b.writeUInt16LE(1,20);b.writeUInt16LE(1,22);b.writeUInt32LE(24000,24);b.writeUInt32LE(48000,28);b.writeUInt16LE(2,32);b.writeUInt16LE(16,34);b.write('data',36);b.writeUInt32LE(b.length-44,40);
    for(let i=0;i<24000;i++)b.writeInt16LE(pulse&&i%1920>=32?0:Math.round(8000*Math.sin(2*Math.PI*440*i/24000)),44+i*2);
    return b.buffer.slice(b.byteOffset,b.byteOffset+b.length);
  };
  ctx.bad=makeWav(true);ctx.good=makeWav(false);
  // A mixed file has enough speech to pass a whole-file silence threshold.
  const mixed=Buffer.from(ctx.good.slice(0));
  const failed=Buffer.from(ctx.bad);
  failed.copy(mixed,44+4800*2,44+4800*2,44+18240*2);
  ctx.mixed=Uint8Array.from(mixed).buffer;
  const naturalPause=Buffer.from(ctx.good.slice(0));
  naturalPause.fill(0,44+4800*2,44+18240*2);
  ctx.pause=Uint8Array.from(naturalPause).buffer;
  ctx.truncated=ctx.good.slice(0,-2);
  ctx.encoded=new Uint8Array([0xff,0xfb,0x90,0x64]).buffer;
  assert.equal(vm.runInContext('healthyPcmVoice(bad)',ctx),false);
  assert.equal(vm.runInContext('healthyPcmVoice(good)',ctx),true);
  assert.equal(vm.runInContext('healthyPcmVoice(mixed,true)',ctx),false);
  assert.equal(vm.runInContext('healthyPcmVoice(pause,true)',ctx),true);
  assert.equal(vm.runInContext('healthyPcmVoice(truncated,true)',ctx),false);
  assert.equal(vm.runInContext('healthyPcmVoice(encoded,true)',ctx),false);
  vm.runInContext(`
    const SPEAKERS=new Set(['luna']);const caches={default:null};let errors=[];
    const out=(body,status,headers)=>new Response(JSON.stringify(body),{status,headers});
    const rememberUsage=async(env,provider,event)=>errors.push({provider,event});
    const synthesizeGoogle=async()=>null,synthesizeAzure=async()=>null;
    const synthesizeGroq=async()=>({body:bad,type:'audio/wav',provider:'groq'});
    const synthesizeGemini=async()=>({body:good,type:'audio/wav',provider:'gemini'});
  `,ctx);
  const start=worker.indexOf('async function synthesize(req'),end=worker.indexOf('async function transcribe',start);
  vm.runInContext(worker.slice(start,end),ctx);
  const response=await vm.runInContext(`synthesize(new Request('https://example.test/tts',{method:'POST',body:JSON.stringify({text:'Hello there.',speaker:'luna'})}),{GROQ_API_KEY:'test',GEMINI_KEY:'test'},{},null)`,ctx);
  assert.equal(response.status,200);assert.equal(response.headers.get('X-TTS-Provider'),'gemini');
  assert.equal(response.headers.get('Content-Type'),'audio/wav');
  assert.deepEqual(Buffer.from(await response.arrayBuffer()),Buffer.from(ctx.good));
  assert.equal(vm.runInContext('errors[0].event.snapshot.error',ctx),'invalid_audio_pulses');
  console.log('PASS: pulse-only and mixed dropouts rejected, natural pauses accepted, invalid WAV rejected, fallback WAV preserves every PCM sample.');
}
async function geminiVoiceTests(){
  const worker = fs.readFileSync(require('node:path').join(__dirname,'../ai-worker/worker.js'),'utf8');
  const source = worker.slice(worker.indexOf('const GEMINI_TTS_MODEL'),worker.indexOf('async function synthesizeGroq('))+
    worker.slice(worker.indexOf('function geminiSegments'),worker.indexOf('async function synthesize(req'));
  const text = 'Please bring the printed agenda. We will meet at three. Final reminder: take the blue folder.';
  const finalSentence = 'Final reminder: take the blue folder.';
  const pcm = Buffer.alloc(12000);
  for(let i=0;i<pcm.length/2;i++)pcm.writeInt16LE(Math.round(8000*Math.sin(i*0.11)),i*2);
  const media = (data,key='inlineData')=>({[key]:{mimeType:'audio/L16;rate=24000;channels=1',data:data.toString('base64')}});
  const generated=[], verified=[];
  const context=vm.createContext({
    AbortSignal, Response, atob, btoa, Uint8Array, DataView, text, expected:text,
    async fetch(url, options){
      const parts=JSON.parse(options.body).contents[0].parts;
      if(url.includes('preview-tts')){
        const script=parts[0].text.split('[BEGIN TRANSCRIPT]\n')[1].split('\n[END TRANSCRIPT]')[0];
        generated.push(script);
        return Response.json({candidates:[{finishReason:'STOP',content:{parts:[
          media(pcm.subarray(0,6000)),media(pcm.subarray(6000),'inline_data')
        ]}}]});
      }
      const audio=Buffer.from(parts[1].inlineData.data,'base64');
      assert.doesNotMatch(parts[0].text,/blue folder/);
      assert.deepEqual(audio.subarray(44),Buffer.concat([pcm,pcm]));
      verified.push(audio);
      return Response.json({candidates:[{finishReason:'STOP',content:{parts:[
        {text:verified.length===2?'Please bring the printed agenda. We will meet at 3. '+finalSentence:'Please bring the printed agenda. We will meet at 3.'}
      ]}}]});
    },
    rememberUsage: async()=>{}
  });
  vm.runInContext(source,context);
  const first=await vm.runInContext("synthesizeGemini({GEMINI_KEY:'test'},text,'luna')",context);
  assert.equal(first.provider,'gemini');
  assert.equal(verified.length,2);
  assert.deepEqual(generated,[text.slice(0,-finalSentence.length).trim(),finalSentence,text.slice(0,-finalSentence.length).trim(),finalSentence]);
  assert.deepEqual(Buffer.from(first.body),verified[1]);
  assert.equal(await vm.runInContext("synthesizeGemini({GEMINI_KEY:'test'},text,'luna')",context),null);
  assert.equal(verified.length,4);
  assert.equal(vm.runInContext("geminiSegments('One. One.').join('|')",context),'One.|One.');
  assert.equal(vm.runInContext("transcriptIsComplete('First sentence. One last note.','First sentence.')",context),false);
  console.log('PASS: Gemini keeps all audio parts, reads the final sentence separately, retries omitted text and rejects incomplete speech.');
}
Promise.all([audioTests(),micTests(),wavTests(),mp3Tests(),qualityTests(),geminiVoiceTests()]).catch(error=>{console.error(error);process.exitCode=1});
