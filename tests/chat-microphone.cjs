const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");

const wav = Buffer.alloc(46);
wav.write("RIFF");
wav.writeUInt32LE(38,4);
wav.write("WAVEfmt ",8);
wav.writeUInt32LE(16,16);
wav.writeUInt16LE(1,20);
wav.writeUInt16LE(1,22);
wav.writeUInt32LE(16000,24);
wav.writeUInt32LE(32000,28);
wav.writeUInt16LE(2,32);
wav.writeUInt16LE(16,34);
wav.write("data",36);
wav.writeUInt32LE(2,40);
wav.writeInt16LE(1000,44);
const voice = wav.toString("base64");
let upstreamStatus = 200;
let requested = 0;
const context = vm.createContext({
  Request,Response,URL,Blob,Uint8Array,FormData,AbortSignal,TextDecoder,atob,
  async fetch(url,options) {
    assert.equal(url,"https://api.groq.com/openai/v1/audio/transcriptions");
    assert.equal(options.body.get("model"),"whisper-large-v3-turbo");
    assert.deepEqual(Buffer.from(await options.body.get("file").arrayBuffer()),wav);
    requested++;
    return Response.json(upstreamStatus===200?{text:" Full test transcript. "}:{error:"unavailable"},{status:upstreamStatus});
  }
});
const source=fs.readFileSync(path.join(__dirname,"../ai-worker/worker.js"),"utf8");
vm.runInContext(source.replace("export default {","globalThis.router = {"),context);
const env={GROQ_API_KEY:"test",GROQ_RATE_LIMIT:{limit:async({key})=>({success:key==="stt:test"})}};
function submit(audio) {
  return context.router.fetch(new Request("https://worker.local/transcribe",{
    method:"POST",headers:{"Origin":"https://hoctienganh.khunglongcon.com","CF-Connecting-IP":"test"},body:JSON.stringify({audio})
  }),env,{});
}
async function test(){
  const first=await submit(voice);
  assert.equal(first.status,200);
  assert.equal(first.headers.get("X-STT-Provider"),"groq");
  assert.deepEqual(await first.json(),{text:"Full test transcript."});
  assert.equal((await submit(voice.slice(0,24))).status,400);
  assert.equal(requested,1);
  upstreamStatus=429;
  env.AI={run:async(_name,body)=>{
    assert.equal(body.audio,voice);
    return {text:"Second provider recognized speech."};
  }};
  const second=await submit(voice);
  assert.equal(second.status,200);
  assert.equal(second.headers.get("X-STT-Provider"),"cloudflare");
  assert.deepEqual(await second.json(),{text:"Second provider recognized speech."});
  env.GROQ_RATE_LIMIT.limit=async()=>({success:false});
  const limited=await submit(voice);
  assert.equal(limited.status,429);
  assert.equal(requested,2);
  console.log("PASS: spoken transcript, invalid WAV, provider failover and microphone rate limit.");
}
test().catch(error=>{console.error(error);process.exitCode=1});
