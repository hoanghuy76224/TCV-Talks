const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root=path.join(__dirname,"..");
const source=name=>fs.readFileSync(path.join(root,name),"utf8");

const content=vm.createContext({window:{}});
for(const name of ["study-content.js","study-grammar-bank.js","study-vocabulary-bank.js"])vm.runInContext(source(name),content);
const {grammar,vocabulary}=content.window.DINO_STUDY_CONTENT;
assert.equal(grammar.length,101);
assert.equal(vocabulary.length,250);
assert.equal(new Set([...grammar,...vocabulary].map(lesson=>lesson.id)).size,351);
for(const lesson of grammar){
  assert.ok(lesson.examples.length && lesson.rule && lesson.quiz.length===3);
  for(const tier of lesson.quiz)for(const [prompt,answer,options] of tier){
    assert.ok(prompt&&answer && !options.includes(answer));
  }
}
for(const pack of vocabulary){
  assert.ok(pack.cards.length>=3 && pack.cards.every(([word,meaning])=>word&&meaning));
  assert.equal(new Set(pack.cards.map(card=>card[1])).size,pack.cards.length);
}

async function workerTest(){
  const essay="The table shows a rise in bicycle travel, from ten percent to twenty percent.";
  const notes={task:"Nêu đúng xu hướng.",coherence:"Các ý nối rõ.",lexical:"Dùng từ đúng.",grammar:"Câu rõ nghĩa."};
  let sawImage=false, requests=0, geminiUnavailable=false, accountChecks=0;
  const report={scores:{task:6,coherence:6,lexical:7,grammar:7},comments:notes,
    corrections:[{quote:"bicycle travel",revision:"travel by bicycle",reason:"Tự nhiên hơn."},
      {quote:"not present",revision:"bad",reason:"bad"}],
    rewrite:essay,chartNotes:"Tỷ lệ đi xe đạp tăng từ 10% lên 20%."};
  const context=vm.createContext({
    Request,Response,URL,AbortSignal,TransformStream,crypto,TextEncoder,Uint8Array,atob,
    async fetch(url,options){
      if(url.startsWith("https://api.groq.com/")){
        assert.match(JSON.parse(options.body).messages[0].content,/Bicycles: 10% in 2010 and 20% in 2020/);
        return Response.json({choices:[{message:{content:JSON.stringify(report)}}]});
      }
      assert.match(url,/generativelanguage\.googleapis\.com/);
      if(geminiUnavailable)return Response.json({error:{message:"Provider unavailable"}},{status:503});
      const parts=JSON.parse(options.body).contents[0].parts;
      if(parts[1]){assert.equal(parts[1].inlineData.mimeType,"image/png");sawImage=true}
      requests++;
      return Response.json({candidates:[{finishReason:"STOP",content:{parts:[{text:JSON.stringify(report)}]}}]});
    }
  });
  vm.runInContext(source("ai-worker/worker.js").replace("export default {","globalThis.router = {"),context);
  const env={GEMINI_KEY:"test",GROQ_RATE_LIMIT:{limit:async({key})=>{
    assert.equal(key,"ielts:qa_test");accountChecks++;return {success:true};
  }},DB:{prepare:()=>({bind:()=>({first:async()=>({expires:Date.now()+10000})})})}};
  const request=body=>context.router.fetch(new Request("https://worker.example/writing/ielts",{
    method:"POST",headers:{Origin:"https://tcv-talks.pages.dev","Content-Type":"application/json"},body:JSON.stringify(body)
  }),env,{});
  const input={id:"qa_test",token:"a".repeat(64),question:"Summarise the main features and make comparisons.",essay};
  assert.equal((await request({...input,task:1})).status,400);
  assert.equal((await request({...input,task:2,token:"invalid"})).status,401);
  const image={mime:"image/png",data:"iVBORw0KGgoAAAANSUhEUg=="};
  const first=await request({...input,task:1,image});
  assert.equal(first.status,200);
  assert.ok(sawImage);
  const result=await first.json();
  assert.equal(result.band,6.5);
  assert.equal(result.corrections.length,1);
  assert.equal((await request({...input,task:2})).status,200);
  assert.equal(requests,2);
  geminiUnavailable=true;
  env.GROQ_API_KEY="test";
  env.AI={run:async(model,body)=>{
    assert.equal(model,"@cf/moondream/moondream3.1-9B-A2B");
    assert.equal(body.image,"data:image/png;base64,"+image.data);
    assert.equal(body.task,"query");
    return {answer:"Bicycles: 10% in 2010 and 20% in 2020."};
  }};
  const fallback=await request({...input,task:1,image});
  assert.equal(fallback.status,200);
  assert.equal((await fallback.json()).band,6.5);
  assert.equal(accountChecks,3);
}
workerTest().then(()=>console.log("PASS: 101 complete grammar lessons, 250 vocabulary packs, IELTS validation, image input, criterion scores and evidence-based corrections."))
  .catch(error=>{console.error(error);process.exitCode=1});
