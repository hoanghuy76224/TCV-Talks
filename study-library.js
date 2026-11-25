window.createStudyLibrary = function createStudyLibrary({ app, state, save, award, escape, say, schedule, grade, feedback, signedIn }) {
  const { grammar, vocabulary } = window.DINO_STUDY_CONTENT;
  const levels = ["A1","A2","B1","B2","C1","C2"];
  const difficulty = ["Nhận biết","Điền từ","Vận dụng"];
  const wordList = vocabulary.flatMap(lesson => lesson.cards.map(([word, meaning, example], index) => ({
    id: lesson.id + ":" + index, word, meaning, example
  })));
  const words = new Map(wordList.map(card => [card.id, card]));
  const filters = { level:"", kind:"", query:"" };
  const writingTasks = [
    { title:"Xin đổi lịch họp", context:"Một cuộc họp trùng với lịch tiếp khách.", instruction:"Viết 3–4 câu xin đổi giờ. Nêu lý do, đề xuất giờ mới và nhờ người nhận xác nhận." },
    { title:"Cập nhật tiến độ", context:"Báo cáo tuần đã gần xong nhưng đang chờ số liệu bán hàng.", instruction:"Viết 3–4 câu cho quản lý. Nêu phần đã hoàn thành, việc còn chờ và thời điểm bạn sẽ cập nhật." },
    { title:"Phản hồi khiếu nại", context:"Khách báo bị tính phí hai lần.", instruction:"Viết 3–4 câu xác nhận vấn đề, nêu bước kiểm tra và hẹn thời điểm phản hồi." }
  ];
  const link = '<a class="study-back" href="#study">← Kho bài học</a>';
  const pathways = [
    ["grammar","Ngữ pháp theo cấp","Xem quy tắc, ví dụ và luyện tập qua ba mức."],
    ["vocabulary","Từ vựng theo cấp","Chọn nhóm từ phù hợp với trình độ A1–C2."],
    ["topics","Từ vựng theo chủ đề","Học từ theo tình huống bạn muốn sử dụng."]
  ];
  const selectOptions = (items, selected) => items.map(([value,label]) =>
    `<option value="${escape(value)}"${value===selected?" selected":""}>${escape(label)}</option>`).join("");
  const normalize = value => value.trim().toLowerCase().replace(/[’‘]/g,"'").replace(/[.?!]+$/,"").replace(/\s+/g," ");
  const due = (now=Date.now()) => Object.keys(state().cards).filter(id => words.has(id) && Date.parse(state().cards[id].due)<=now);
  const listen = value => `<button class="study-listen" type="button" aria-label="Nghe ${escape(value)}" data-study-listen="${escape(value)}">Nghe</button>`;
  function wireAudio(){
    for(const button of app.querySelectorAll("[data-study-listen]"))button.onclick=()=>say(button.dataset.studyListen);
  }

  function modeLinks(active){
    return `<nav class="study-modes" aria-label="Cách học">${pathways.map(([mode,title])=>
      `<a href="#study-${mode}"${mode===active?' aria-current="page"':""}>${title}</a>`).join("")}</nav>`;
  }

  function lessonTile(lesson, mode){
    const saved=state();
    const isGrammar=mode==="grammar";
    const savedCards=isGrammar?0:lesson.cards.filter((_,index)=>saved.cards[lesson.id+":"+index]).length;
    const stars=saved.stars[lesson.id]||0;
    const done=isGrammar?stars>0:Boolean(saved.vocabDone?.[lesson.id]);
    const detail=isGrammar?(stars?`${stars}/3 sao`:"Ví dụ và ba mức luyện"):
      `${savedCards}/${lesson.cards.length} thẻ đã lưu`;
    return `<a class="study-tile" href="#study-lesson-${lesson.id}">
      <span class="study-tile-type">${lesson.level} · ${isGrammar?"Ngữ pháp":"Từ vựng"}</span>
      <strong>${escape(lesson.title)}</strong><span>${detail}${done?" · Đã hoàn thành":""}</span>
    </a>`;
  }

  function pathway(mode, level){
    const isGrammar=mode==="grammar", data=isGrammar?grammar:vocabulary, saved=state();
    const [,title,description]=pathways.find(([id])=>id===mode);
    const heading=level?title+" "+level:title;
    const completed=lesson=>Boolean(isGrammar?saved.stars[lesson.id]:saved.vocabDone?.[lesson.id]);
    const lessons=level?data.filter(lesson=>lesson.level===level):data;
    const next=level&&lessons.find(lesson=>!completed(lesson));
    const levelTiles=levels.map(cefr=>{
      const list=data.filter(lesson=>lesson.level===cefr), done=list.filter(completed).length;
      return `<a class="study-tile study-level-tile" href="#study-${mode}-${cefr.toLowerCase()}">
        <strong>${cefr}</strong><span>${done}/${list.length} bài đã hoàn thành</span>
        <progress aria-label="Tiến độ ${cefr}" value="${done}" max="${list.length}"></progress>
      </a>`;
    }).join("");
    app.innerHTML=`<div class="study-page">${link}${modeLinks(mode)}
      <section class="study-intro"><div><h1>${heading}</h1><p>${description}</p></div>
        ${isGrammar&&!level?'<a class="btn" href="#placement">Kiểm tra trình độ</a>':""}
        ${level?`<a class="btn" href="#study-${mode}">Đổi cấp</a>`:""}</section>
      ${next?`<a class="btn pri study-continue" href="#study-lesson-${next.id}">Học tiếp · ${escape(next.title)}</a>`:""}
      <div class="study-grid">${mode!=="topics"&&!level?levelTiles:lessons.map(lesson=>lessonTile(lesson,mode)).join("")}</div>
    </div>`;
  }

  function catalog(){
    const saved=state();
    const search=filters.query.toLocaleLowerCase("vi");
    const matches=lesson=>(!filters.level||lesson.level===filters.level)&&
      (!search||lesson.title.toLocaleLowerCase("vi").includes(search)||
        (lesson.cards||[]).some(card=>card.slice(0,2).some(text=>text.toLocaleLowerCase("vi").includes(search))));
    const rows=[
      ...grammar.filter(matches).filter(()=>filters.kind!=="vocabulary").map(lesson=>[lesson,"Ngữ pháp",saved.stars[lesson.id]?`${saved.stars[lesson.id]}/3 sao`:"Ví dụ và 3 mức luyện"]),
      ...vocabulary.filter(matches).filter(()=>filters.kind!=="grammar").map(lesson=>[lesson,"Từ vựng",`${lesson.cards.length} thẻ có ví dụ`])
    ];
    app.innerHTML=`<div class="study-page">${modeLinks("")}
      <section class="study-intro"><div><h1>Kho bài học</h1><p>Ngữ pháp và từ vựng tiếng Anh trong tình huống công sở, từ A1 đến C2.</p></div>
      <div class="study-actions"><a class="btn" href="#study-review">Ôn từ${due().length?` · ${due().length}`:""}</a><a class="btn" href="#study-tools">Công cụ</a></div></section>
      <form id="study-filters" class="study-filters">
        <label>Nội dung<select name="kind">${selectOptions([["","Tất cả"],["grammar","Ngữ pháp"],["vocabulary","Từ vựng"]],filters.kind)}</select></label>
        <label>Trình độ<select name="level">${selectOptions([["","Tất cả"],...levels.map(level=>[level,level])],filters.level)}</select></label>
        <label>Tìm bài hoặc từ vựng<input name="query" type="search" value="${escape(filters.query)}" placeholder="Ví dụ: lịch hẹn"></label>
        <button class="pri" type="submit">Tìm bài</button>
      </form>
      <div class="study-grid">${rows.map(([lesson,kind,meta])=>`<a class="study-tile" href="#study-lesson-${lesson.id}">
        <span class="study-tile-type">${lesson.level} · ${kind}</span><strong>${escape(lesson.title)}</strong><span>${meta}</span>
      </a>`).join("")}</div>
      ${rows.length?"":'<p class="box">Chưa tìm thấy bài phù hợp. Thử đổi bộ lọc hoặc từ khóa.</p>'}
    </div>`;
    const form=app.querySelector("#study-filters");
    form.onsubmit=event=>{
      event.preventDefault();
      for(const key of Object.keys(filters))filters[key]=form.elements[key].value.trim().slice(0,100);
      catalog();
      app.querySelector("[name=query]").focus();
    };
  }

  function grammarLesson(lesson){
    app.innerHTML=`<div class="study-page">${link}<section class="study-intro"><div><p class="study-tile-type">${lesson.level} · Ngữ pháp</p><h1>${escape(lesson.title)}</h1></div></section>
      <section class="box"><h2>Cách dùng</h2><p>${escape(lesson.rule)}</p>
        <ul class="study-examples">${lesson.examples.map(([en,vi])=>`<li><div><strong lang="en">${escape(en)}</strong><br><span class="sm">${escape(vi)}</span></div>${listen(en)}</li>`).join("")}</ul>
        <p><strong>Lỗi thường gặp.</strong> ${escape(lesson.trap)}</p>
      </section>
      <form id="study-start-quiz" class="box"><h2>Luyện tập</h2><p>${state().stars[lesson.id]? `Kết quả cao nhất: ${state().stars[lesson.id]}/3 sao.`:"Chọn dạng bài phù hợp để bắt đầu."}</p>
        <label>Mức luyện <select name="difficulty">${selectOptions(difficulty.map((label,i)=>[String(i),label]),"0")}</select></label>
        <button type="submit" class="pri">Làm bài</button>
      </form></div>`;
    wireAudio();
    app.querySelector("#study-start-quiz").onsubmit=event=>{
      event.preventDefault();
      showQuiz(lesson,Number(event.currentTarget.elements.difficulty.value),0,0);
    };
  }

  function showQuiz(lesson, tier, index, correct){
    const questions=lesson.quiz[tier];
    if(index===questions.length){
      const saved=state(), previous=saved.stars[lesson.id]||0;
      const stars=correct===questions.length?tier+1:0;
      if(stars>previous){
        saved.stars[lesson.id]=stars;
        award((stars-previous)*5);
      }
      app.innerHTML=`<div class="study-page">${link}<section class="box" aria-labelledby="study-quiz-result">
        <h1 id="study-quiz-result">Kết quả bài luyện</h1><p>${escape(lesson.title)} · ${difficulty[tier]}</p>
        <p><strong>${correct}/${questions.length} câu đúng</strong>${stars?` · Hoàn thành mức này, ${stars} sao`:" · Xem lại lý thuyết rồi thử lại."}</p>
        <button id="study-quiz-back">Về bài học</button>
      </section></div>`;
      app.querySelector("#study-quiz-back").onclick=()=>grammarLesson(lesson);
      return;
    }
    const [prompt, answer, distractors, explanation]=questions[index];
    const options=distractors.slice();
    if(options.length)options.splice((index+1)%3,0,answer);
    app.innerHTML=`<div class="study-page">${link}<section class="box">
      <p class="study-tile-type">${difficulty[tier]} · Câu ${index+1}/${questions.length}</p><h1>${escape(lesson.title)}</h1>
      <form id="study-question"><fieldset><legend>${escape(prompt)}</legend>
        ${options.length?options.map((option,i)=>`<label><input type="radio" name="option" value="${i}" required> ${escape(option)}</label>`).join(""):'<label>Câu trả lời <input name="answer" required autocomplete="off" maxlength="200"></label>'}
      </fieldset><button class="pri" type="submit">Kiểm tra</button><p id="study-explanation" role="status"></p>
      <button type="button" id="study-next-question" hidden>${index===questions.length-1?"Xem kết quả":"Câu tiếp theo"}</button></form></section></div>`;
    const form=app.querySelector("#study-question");
    form.onsubmit=event=>{
      event.preventDefault();
      const value=options.length?options[Number(form.elements.option.value)]:form.elements.answer.value;
      const passed=normalize(value||"")===normalize(answer);
      app.querySelector("#study-explanation").textContent=(passed?"Đúng. ":"Đáp án: "+answer+". ")+explanation;
      form.querySelector("fieldset").disabled=true;
      form.querySelector("[type=submit]").disabled=true;
      const next=app.querySelector("#study-next-question");
      next.hidden=false;
      next.onclick=()=>showQuiz(lesson,tier,index+1,correct+Number(passed));
      next.focus();
    };
  }

  function vocabularyLesson(lesson){
    const cards=wordList.filter(card=>card.id.startsWith(lesson.id+":"));
    app.innerHTML=`<div class="study-page">${link}<section class="study-intro"><div>
      <p class="study-tile-type">${lesson.level} · Từ vựng</p><h1>${escape(lesson.title)}</h1><p>${escape(lesson.details)}</p></div><a class="btn" href="#study-review">Mở bộ thẻ ôn</a></section>
      <div class="study-grid">${cards.map(card=>`<article class="study-tile"><h2 lang="en">${escape(card.word)}</h2>
        <span>${escape(card.meaning)}</span><p lang="en">${escape(card.example)}</p>
        <div class="study-actions">${listen(card.word)}<button type="button" data-study-add="${card.id}" ${state().cards[card.id]?"disabled":""}>${state().cards[card.id]?"Đã lưu":"Lưu để ôn"}</button></div></article>`).join("")}</div>
      <div class="study-actions"><button class="pri" id="study-vocabulary-quiz">Kiểm tra từ đã học</button>${state().vocabDone?.[lesson.id]?'<span class="sm">Đã hoàn thành bài từ vựng</span>':""}</div></div>`;
    wireAudio();
    app.querySelector("#study-vocabulary-quiz").onclick=()=>vocabularyQuiz(lesson,cards,0,0);
    for(const button of app.querySelectorAll("[data-study-add]"))button.onclick=()=>{
      state().cards[button.dataset.studyAdd]??={due:new Date().toISOString()};
      save();
      button.disabled=true;
      button.textContent="Đã lưu";
    };
  }

  function vocabularyQuiz(lesson,cards,index,correct){
    if(index===cards.length){
      const saved=state(), completed=correct>=Math.ceil(cards.length*.8);
      if(completed&&!saved.vocabDone?.[lesson.id]){
        (saved.vocabDone??={})[lesson.id]=true;
        award(10);
      }
      app.innerHTML=`<div class="study-page">${link}<section class="box">
        <h1>Kết quả từ vựng</h1><p><strong>${correct}/${cards.length} câu đúng</strong>${completed?" · Đã hoàn thành bài":" · Ôn lại các từ rồi thử tiếp."}</p>
        <div class="study-actions"><button id="study-quiz-return" type="button">Về bộ từ</button><a class="btn" href="#study-review">Ôn thẻ đã lưu</a></div>
      </section></div>`;
      app.querySelector("#study-quiz-return").onclick=()=>vocabularyLesson(lesson);
      return;
    }
    const card=cards[index], options=cards.filter(item=>item!==card).slice(0,2);
    options.splice(index%3,0,card);
    app.innerHTML=`<div class="study-page">${link}<section class="box"><p class="study-tile-type">${escape(lesson.title)} · Câu ${index+1}/${cards.length}</p><h1>Chọn nghĩa của từ</h1>
      <form id="study-vocab-question"><fieldset><legend lang="en">${escape(card.word)}</legend>
        ${options.map((item,i)=>`<label><input type="radio" name="meaning" value="${i}" required> ${escape(item.meaning)}</label>`).join("")}
      </fieldset><button class="pri" type="submit">Kiểm tra</button><p role="status" id="study-vocab-feedback"></p>
      <button type="button" id="study-vocab-next" hidden>${index+1===cards.length?"Xem kết quả":"Câu tiếp theo"}</button></form>
    </section></div>`;
    const form=app.querySelector("#study-vocab-question");
    form.onsubmit=event=>{
      event.preventDefault();
      const passed=options[Number(form.elements.meaning.value)]===card;
      app.querySelector("#study-vocab-feedback").textContent=(passed?"Đúng. ":"Đáp án: ")+card.meaning+". "+card.example;
      form.querySelector("fieldset").disabled=true;
      form.querySelector("[type=submit]").disabled=true;
      const next=app.querySelector("#study-vocab-next");
      next.hidden=false;
      next.onclick=()=>vocabularyQuiz(lesson,cards,index+1,correct+Number(passed));
      next.focus();
    };
  }

  function review(){
    const pending=due();
    const card=words.get(pending[0]);
    app.innerHTML=`<div class="study-page">${link}<section class="study-intro"><div><h1>Ôn từ vựng</h1>
      <p>${pending.length?`Còn ${pending.length} từ đến hạn.`:Object.keys(state().cards).length?"Bạn đã ôn hết số thẻ đến hạn.":"Chưa có thẻ. Mở một bài từ vựng và lưu từ muốn ôn."}</p></div></section>
      ${card?`<section class="box"><h2 lang="en">${escape(card.word)}</h2>${listen(card.word)}
        <details id="study-reveal"><summary>Xem nghĩa và ví dụ</summary><p>${escape(card.meaning)}</p><p lang="en">${escape(card.example)}</p>
        <div class="study-actions"><button type="button" data-study-rating="Again">Chưa nhớ</button><button type="button" data-study-rating="Hard">Hơi khó</button><button type="button" data-study-rating="Good">Nhớ rồi</button></div></details></section>`:'<a class="btn pri" href="#study">Tìm bài từ vựng</a>'}</div>`;
    wireAudio();
    for(const button of app.querySelectorAll("[data-study-rating]"))button.onclick=()=>{
      state().cards[card.id]=schedule(state().cards[card.id],button.dataset.studyRating);
      save();
      review();
    };
  }

  function tools(){
    app.innerHTML=`<div class="study-page">${link}<section class="study-intro"><div><h1>Công cụ luyện tập</h1><p>Áp dụng những gì đã học vào một tình huống thực tế.</p></div></section>
      <div class="study-grid"><a class="study-tile" href="#study-writing"><strong>Luyện viết công sở</strong><span>Viết email hoặc tin nhắn và nhận góp ý theo câu.</span></a>
      <a class="study-tile" href="#study"><strong>Tra từ trong kho bài</strong><span>Tìm từ, xem nghĩa, nghe phát âm và lưu để ôn.</span></a>
      <a class="study-tile" href="#${signedIn()?"chat":"access"}"><strong>Luyện hội thoại</strong><span>Đóng vai trong tình huống công việc.</span></a></div></div>`;
  }

  function writing(){
    if(!signedIn()){
      app.innerHTML=`<div class="study-page">${link}<section class="box"><h1>Luyện viết công sở</h1><p>Mở hồ sơ để nhận góp ý và lưu bài viết.</p><a class="btn pri" href="#access">Mở hồ sơ</a></section></div>`;
      return;
    }
    const saved=state();
    const savedIndex=saved.writing?.index;
    const initial=Number.isInteger(savedIndex)&&writingTasks[savedIndex]?savedIndex:0;
    app.innerHTML=`<div class="study-page">${link}<section class="study-intro"><div><h1>Luyện viết công sở</h1><p>Chọn một tình huống rồi viết câu trả lời bằng tiếng Anh.</p></div></section>
      <form id="study-writing-form" class="box">
        <label>Tình huống <select name="topic">${selectOptions(writingTasks.map((task,i)=>[String(i),task.title]),String(initial))}</select></label>
        <p id="study-writing-task"></p>
        <label>Bài viết <textarea name="draft" rows="6" maxlength="1800" required>${escape(saved.writing?.text||"")}</textarea></label>
        <button class="pri" type="submit">Nhận góp ý</button>
      </form><section id="study-writing-result" aria-live="polite"></section></div>`;
    const form=app.querySelector("#study-writing-form"), result=app.querySelector("#study-writing-result");
    const topic=()=>writingTasks[Number(form.elements.topic.value)];
    const updateTask=()=>{app.querySelector("#study-writing-task").textContent=topic().context+" "+topic().instruction};
    form.elements.topic.onchange=()=>{updateTask();result.replaceChildren()};
    updateTask();
    form.onsubmit=async event=>{
      event.preventDefault();
      const text=form.elements.draft.value.trim();
      if(!text)return;
      saved.writing={index:Number(form.elements.topic.value),text};
      save();
      const button=form.querySelector("[type=submit]"), selected=topic();
      button.disabled=true;
      result.textContent="Đang nhận góp ý…";
      try{
        const report=await grade({context:selected.context,instruction:selected.instruction,text});
        if(result.isConnected&&state()===saved&&topic()===selected&&form.elements.draft.value.trim()===text){
          result.innerHTML='<div class="box">'+feedback(report)+'</div>';
        }else if(result.isConnected)result.replaceChildren();
      }catch{
        if(result.isConnected)result.textContent="Chưa nhận được góp ý. Bài viết đã được lưu để bạn thử lại.";
      }finally{button.disabled=false}
    };
  }

  function render(route){
    if(route==="study")catalog();
    else if(route==="study-topics")pathway("topics");
    else if(/^study-(grammar|vocabulary)(-[abc][12])?$/.test(route)){
      const [,mode,level]=route.split("-");
      pathway(mode,level?.toUpperCase());
    }
    else if(route==="study-review")review();
    else if(route==="study-tools")tools();
    else if(route==="study-writing")writing();
    else if(route.startsWith("study-lesson-")){
      const id=route.slice("study-lesson-".length);
      const lesson=grammar.find(item=>item.id===id);
      const pack=vocabulary.find(item=>item.id===id);
      if(lesson)grammarLesson(lesson);
      else if(pack)vocabularyLesson(pack);
      else catalog();
    }else return false;
    return true;
  }
  return { render, due };
};
