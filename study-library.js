window.createStudyLibrary = function createStudyLibrary({ app, state, save, award, escape, say, schedule, grade, feedback, signedIn, gradeIelts }) {
  const { grammar, vocabulary } = window.DINO_STUDY_CONTENT;
  const levels = ["A1","A2","B1","B2","C1","C2"];
  const difficulty = ["Nhận biết","Điền từ","Vận dụng"];
  const wordList = vocabulary.flatMap(lesson => lesson.cards.map(([word, meaning, example], index) => ({
    id: lesson.id + ":" + index, word, meaning, example
  })));
  const words = new Map(wordList.map(card => [card.id, card]));
  const topics = new Map();
  for (const lesson of vocabulary) {
    const id=lesson.topicId||lesson.id;
    if(!topics.has(id))topics.set(id,{title:lesson.topic||lesson.title,lessons:[]});
    topics.get(id).lessons.push(lesson);
  }
  const filters = { level:"", kind:"", query:"" };
  let visibleLessons=24;
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

  function pathway(mode, level, topicId){
    const isGrammar=mode==="grammar", data=isGrammar?grammar:vocabulary, saved=state();
    const [,title,description]=pathways.find(([id])=>id===mode);
    const selectedTopic=topics.get(topicId);
    const heading=selectedTopic?.title||(level?title+" "+level:title);
    const completed=lesson=>Boolean(isGrammar?saved.stars[lesson.id]:saved.vocabDone?.[lesson.id]);
    const lessons=selectedTopic?.lessons||(level?data.filter(lesson=>lesson.level===level):data);
    const next=level&&lessons.find(lesson=>!completed(lesson));
    const levelTiles=levels.map(cefr=>{
      const list=data.filter(lesson=>lesson.level===cefr), done=list.filter(completed).length;
      return `<a class="study-tile study-level-tile" href="#study-${mode}-${cefr.toLowerCase()}">
        <strong>${cefr}</strong><span>${done}/${list.length} bài đã hoàn thành</span>
        <progress aria-label="Tiến độ ${cefr}" value="${done}" max="${list.length}"></progress>
      </a>`;
    }).join("");
    const topicTiles=[...topics].map(([id,topic])=>{
      const done=topic.lessons.filter(completed).length;
      return `<a class="study-tile" href="#study-topic-${id}"><strong>${escape(topic.title)}</strong>
        <span>${done}/${topic.lessons.length} bài đã hoàn thành</span></a>`;
    }).join("");
    app.innerHTML=`<div class="study-page">${link}${modeLinks(mode)}
      <section class="study-intro"><div><h1>${heading}</h1><p>${description}</p></div>
        ${isGrammar&&!level?'<a class="btn" href="#placement">Kiểm tra trình độ</a>':""}
        ${level?`<a class="btn" href="#study-${mode}">Đổi cấp</a>`:""}${selectedTopic?'<a class="btn" href="#study-topics">Đổi chủ đề</a>':""}</section>
      ${next?`<a class="btn pri study-continue" href="#study-lesson-${next.id}">Học tiếp · ${escape(next.title)}</a>`:""}
      <div class="study-grid">${mode==="topics"&&!selectedTopic?topicTiles:mode!=="topics"&&!level?levelTiles:lessons.map(lesson=>lessonTile(lesson,mode)).join("")}</div>
    </div>`;
  }

  function catalog(){
    const saved=state();
    const search=filters.query.toLocaleLowerCase("vi");
    const matches=lesson=>(!filters.level||lesson.level===filters.level)&&
      (!search||lesson.title.toLocaleLowerCase("vi").includes(search)||
        (lesson.topic||"").toLocaleLowerCase("vi").includes(search)||
        (lesson.cards||[]).some(card=>card.slice(0,2).some(text=>text.toLocaleLowerCase("vi").includes(search))));
    const rows=[
      ...grammar.filter(matches).filter(()=>filters.kind!=="vocabulary").map(lesson=>[lesson,"Ngữ pháp",saved.stars[lesson.id]?`${saved.stars[lesson.id]}/3 sao`:"Ví dụ và 3 mức luyện"]),
      ...vocabulary.filter(matches).filter(()=>filters.kind!=="grammar").map(lesson=>[lesson,"Từ vựng",`${lesson.cards.length} thẻ từ`])
    ];
    app.innerHTML=`<div class="study-page">${modeLinks("")}
      <section class="study-intro"><div><h1>Kho bài học</h1><p>${grammar.length} bài ngữ pháp và ${vocabulary.length} bài từ vựng từ A1 đến C2.</p></div>
      <div class="study-actions"><a class="btn" href="#study-review">Ôn từ${due().length?` · ${due().length}`:""}</a><a class="btn" href="#study-tools">Công cụ</a></div></section>
      <form id="study-filters" class="study-filters">
        <label>Nội dung<select name="kind">${selectOptions([["","Tất cả"],["grammar","Ngữ pháp"],["vocabulary","Từ vựng"]],filters.kind)}</select></label>
        <label>Trình độ<select name="level">${selectOptions([["","Tất cả"],...levels.map(level=>[level,level])],filters.level)}</select></label>
        <label>Tìm bài hoặc từ vựng<input name="query" type="search" value="${escape(filters.query)}" placeholder="Ví dụ: lịch hẹn"></label>
        <button class="pri" type="submit">Tìm bài</button>
      </form>
      <p class="sm">Hiển thị ${Math.min(rows.length,visibleLessons)} / ${rows.length} bài.</p>
      <div class="study-grid">${rows.slice(0,visibleLessons).map(([lesson,kind,meta])=>`<a class="study-tile" href="#study-lesson-${lesson.id}">
        <span class="study-tile-type">${lesson.level} · ${kind}</span><strong>${escape(lesson.title)}</strong><span>${meta}</span>
      </a>`).join("")}</div>
      ${rows.length?"":'<p class="box">Chưa tìm thấy bài phù hợp. Thử đổi bộ lọc hoặc từ khóa.</p>'}
      ${rows.length>visibleLessons?'<button id="study-more" type="button">Xem thêm bài</button>':""}
    </div>`;
    const form=app.querySelector("#study-filters");
    form.onsubmit=event=>{
      event.preventDefault();
      for(const key of Object.keys(filters))filters[key]=form.elements[key].value.trim().slice(0,100);
      visibleLessons=24;
      catalog();
      app.querySelector("[name=query]").focus();
    };
    const more=app.querySelector("#study-more");
    if(more)more.onclick=()=>{
      const firstNew=visibleLessons;
      visibleLessons+=24;
      catalog();
      app.querySelectorAll(".study-grid a")[firstNew]?.focus();
    };
  }

  function grammarLesson(lesson){
    app.innerHTML=`<div class="study-page">${link}<section class="study-intro"><div><p class="study-tile-type">${lesson.level} · Ngữ pháp</p><h1>${escape(lesson.title)}</h1></div></section>
      <section class="box"><h2>Cách dùng</h2><p>${escape(lesson.rule)}</p>
        <ul class="study-examples">${lesson.examples.map(([en,vi])=>`<li><div><strong lang="en">${escape(en)}</strong>${vi?`<br><span class="sm">${escape(vi)}</span>`:""}</div>${listen(en)}</li>`).join("")}</ul>
        ${lesson.trap?`<p><strong>Lỗi thường gặp.</strong> ${escape(lesson.trap)}</p>`:""}
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
        <span>${escape(card.meaning)}</span>${card.example?`<p lang="en">${escape(card.example)}</p>`:""}
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
      app.querySelector("#study-vocab-feedback").textContent=(passed?"Đúng. ":"Đáp án: ")+card.meaning+"."+(card.example?" "+card.example:"");
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
        <details id="study-reveal"><summary>${card.example?"Xem nghĩa và ví dụ":"Xem nghĩa"}</summary><p>${escape(card.meaning)}</p>${card.example?`<p lang="en">${escape(card.example)}</p>`:""}
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
      <div class="study-grid"><a class="study-tile" href="#study-ielts-1"><strong>IELTS Writing Task 1</strong><span>Đối chiếu bài mô tả với biểu đồ và nhận điểm theo bốn tiêu chí.</span></a>
      <a class="study-tile" href="#study-ielts-2"><strong>IELTS Writing Task 2</strong><span>Nhận điểm ước lượng và góp ý lập luận cho bài luận.</span></a>
      <a class="study-tile" href="#study-writing"><strong>Luyện viết công sở</strong><span>Viết email hoặc tin nhắn và nhận góp ý theo câu.</span></a>
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

  function ielts(task){
    const minimum=task===1?150:250;
    const saved=state();
    const draft=saved.ielts?.[task]||{};
    const title="IELTS Academic Writing Task "+task;
    if(!signedIn()){
      app.innerHTML=`<div class="study-page">${link}<section class="box"><h1>${title}</h1><p>Mở hồ sơ để nộp bài lấy nhận xét.</p><a class="btn pri" href="#access">Mở hồ sơ</a></section></div>`;
      return;
    }
    app.innerHTML=`<div class="study-page"><a class="study-back" href="#study-tools">← Công cụ học</a>
      <section class="study-intro"><div><h1>${title}</h1><p>Mục tiêu tối thiểu ${minimum} từ. Điểm AI dùng để luyện tập.</p></div>
      <a class="btn" href="#study-ielts-${task===1?2:1}">Đổi sang Task ${task===1?2:1}</a></section>
      <form class="box" id="ielts-form">
        <label>Đề bài<textarea name="question" rows="3" maxlength="2000" required>${escape(draft.question||"")}</textarea></label>
        ${task===1?`<label>Ảnh biểu đồ (PNG, JPG, WebP; tối đa 1,5 MB)<input name="image" type="file" accept="image/png,image/jpeg,image/webp"></label>
        <label>Hoặc nhập dữ liệu biểu đồ<textarea name="chart" rows="3" maxlength="3000" placeholder="Ghi tên biểu đồ, đơn vị, năm và số liệu.">${escape(draft.chart||"")}</textarea></label>`:""}
        <label>Bài viết<textarea name="essay" rows="9" maxlength="6000" required>${escape(draft.essay||"")}</textarea></label>
        <p id="ielts-count" class="sm"></p>
        <div class="study-actions"><button class="pri" type="submit">Chấm bài</button><button type="button" id="ielts-sample">Điền đề mẫu</button></div>
      </form><div id="ielts-result" aria-live="polite"></div></div>`;
    const form=app.querySelector("#ielts-form"), result=app.querySelector("#ielts-result");
    const updateCount=()=>{
      const count=(form.elements.essay.value.match(/\p{L}[\p{L}\p{N}'’-]*|\p{N}+/gu)||[]).length;
      app.querySelector("#ielts-count").textContent=`${count} từ · Mục tiêu tối thiểu ${minimum}`;
    };
    updateCount();
    form.elements.essay.oninput=updateCount;
    app.querySelector("#ielts-sample").onclick=()=>{
      form.elements.question.value=task===1?
        "The table shows how employees at a company travelled to work in 2015 and 2025. Summarise the main features and make comparisons where relevant.":
        "Some people think employees should work from home whenever possible. Others believe offices are essential for good teamwork. Discuss both views and give your own opinion.";
      if(task===1)form.elements.chart.value="Share of employees by main travel mode (%): car 55 in 2015 and 40 in 2025; public transport 25 and 30; bicycle 10 and 20; walking 10 and 10.";
    };
    form.onsubmit=async event=>{
      event.preventDefault();
      const question=form.elements.question.value.trim(), essay=form.elements.essay.value.trim();
      const chart=form.elements.chart?.value.trim()||"", file=form.elements.image?.files[0];
      if(question.length<12||essay.length<30){result.textContent="Nhập đầy đủ đề và ít nhất vài câu trong bài viết.";return}
      if(task===1&&!file&&chart.length<12){result.textContent="Đính kèm ảnh hoặc nhập dữ liệu biểu đồ.";return}
      if(file&&(file.size>1500000||!["image/png","image/jpeg","image/webp"].includes(file.type))){
        result.textContent="Chọn ảnh PNG, JPG hoặc WebP dưới 1,5 MB.";return;
      }
      (saved.ielts??={})[task]={question,essay,chart};
      save();
      const button=form.querySelector("[type=submit]");
      button.disabled=true;
      result.textContent="Đang nhận xét bài viết…";
      try{
        const report=await gradeIelts({task,question,essay,chart,file});
        if(result.isConnected&&state()===saved)showIeltsResult(result,report,task);
      }catch(error){
        if(result.isConnected)result.textContent=error.message==="rate_limited"?"Dịch vụ đang bận. Bài đã được lưu, bạn thử lại sau ít phút.":
          error.message==="session_expired"?"Phiên đăng nhập hết hạn. Hãy mở lại hồ sơ.":"Chưa chấm được bài. Bài đã được lưu để bạn thử lại.";
      }finally{button.disabled=false}
    };
  }

  function showIeltsResult(container,report,task){
    const labels={task:task===1?"Task Achievement":"Task Response",coherence:"Coherence and Cohesion",lexical:"Lexical Resource",grammar:"Grammatical Range and Accuracy"};
    container.innerHTML=`<section class="box"><h2>Band ước lượng ${report.band.toFixed(1)}</h2>
      <div class="study-grid ielts-scores">${Object.entries(labels).map(([key,label])=>`<article class="study-tile">
        <h3>${label} · ${report.scores[key]}</h3><p>${escape(report.comments[key])}</p></article>`).join("")}</div>
      ${report.chartNotes?`<h3 class="sec-h">Đối chiếu với biểu đồ</h3><p>${escape(report.chartNotes)}</p>`:""}
      ${report.corrections.length?`<h3 class="sec-h">Chỗ cần sửa</h3><ul>${report.corrections.map(item=>`<li><s>${escape(item.quote)}</s> → <strong>${escape(item.revision)}</strong><br>${escape(item.reason)}</li>`).join("")}</ul>`:""}
      <h3 class="sec-h">Bài viết tham khảo</h3><p class="course-copy" lang="en">${escape(report.rewrite)}</p>
      <a href="https://ielts.org/take-a-test/test-types/ielts-academic-test/ielts-academic-format-writing" target="_blank" rel="noopener">Tiêu chí IELTS Academic Writing</a></section>`;
  }

  function render(route){
    if(route==="study")catalog();
    else if(route==="study-topics")pathway("topics");
    else if(route.startsWith("study-topic-"))pathway("topics",null,route.slice("study-topic-".length));
    else if(/^study-(grammar|vocabulary)(-[abc][12])?$/.test(route)){
      const [,mode,level]=route.split("-");
      pathway(mode,level?.toUpperCase());
    }
    else if(route==="study-review")review();
    else if(route==="study-tools")tools();
    else if(route==="study-writing")writing();
    else if(route==="study-ielts-1"||route==="study-ielts-2")ielts(Number(route.at(-1)));
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
