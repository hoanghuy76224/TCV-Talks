// Cache the lesson shell for offline revisits. Profile/API/audio responses stay out of this cache.
const SHELL_CACHE="tcv-shell-v1";
self.addEventListener("install",event=>{
  event.waitUntil(caches.open(SHELL_CACHE).then(cache=>cache.add(new Request("/",{cache:"reload"}))).then(()=>self.skipWaiting()));
});
self.addEventListener("activate",event=>event.waitUntil(self.clients.claim()));
self.addEventListener("fetch",event=>{
  const request=event.request,url=new URL(request.url);
  if(request.method!=="GET"||url.origin!==self.location.origin)return;
  if(request.mode==="navigate"&&(url.pathname==="/"||url.pathname==="/index.html")){
    event.respondWith((async()=>{
      const cache=await caches.open(SHELL_CACHE);
      try{
        const response=await fetch(request);
        if(response.ok)await cache.put("/",response.clone());
        if(response.status>=500){const saved=await cache.match("/");if(saved)return saved}
        return response;
      }catch{
        const saved=await cache.match("/");
        return saved||new Response("Bạn đang mất mạng. Mở TCV Talks một lần khi có mạng để lưu bài học trên thiết bị.",{status:503,headers:{"Content-Type":"text/plain; charset=utf-8"}});
      }
    })());
  }
  if(url.pathname==="/cmu.json"){
    event.respondWith((async()=>{
      const cache=await caches.open(SHELL_CACHE),saved=await cache.match("/cmu.json");
      if(saved)return saved;
      const response=await fetch(request);
      if(response.ok)await cache.put("/cmu.json",response.clone());
      return response;
    })());
  }
});
