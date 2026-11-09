/* White Lightning: browser-native Outlook / Explorer drop adapter. No plugins or network calls. */
(function(root,make){
  const api=make();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.WLDrop=api;
})(typeof window!=='undefined'?window:null,function(){
  'use strict';
  function transferFiles(data){
    if(!data)return [];
    const existing=Array.from(data.files||[]).filter(f=>f&&typeof f.arrayBuffer==='function');
    if(existing.length)return existing;
    const alternatives=[];
    for(const item of Array.from(data.items||[])){
      if(item?.kind!=='file'||typeof item.getAsFile!=='function')continue;
      try{const file=item.getAsFile();if(file&&typeof file.arrayBuffer==='function')alternatives.push(file);}catch{}
    }
    return alternatives;
  }
  function safeText(data,format){try{return String(data?.getData?.(format)||'').trim();}catch{return '';}}
  function mailLikeText(text){
    if(!text||text.length<90||text.length>2*1024*1024)return false;
    const s=text.replace(/\r\n?/g,'\n');
    const trimmed=s.trim();
    if(/^(?:https?:\/\/|outlook:|mailto:|file:\/\/|www\.)\S*$/i.test(trimmed))return false;
    const lines=s.split('\n').map(x=>x.trim()).filter(Boolean);
    if(lines.length<3)return false;
    const hasFrom=/^(?:Von|From|Absender)\s*:/im.test(s);
    const hasSubject=/^(?:Betreff|Subject)\s*:/im.test(s);
    const hasDate=/^(?:Gesendet|Sent|Date|Datum)\s*:/im.test(s);
    if((hasFrom&&hasSubject)||(hasSubject&&hasDate)||(hasFrom&&hasDate))return true;
    // HTML/Outlook sometimes provides actual mail paragraphs without headers.
    // A long multiline body can be retained but must be explicitly marked as a metadata-free text fallback.
    return s.length>=300&&lines.length>=5&&lines.some(l=>l.length>=60);
  }
  function assessDrop(data){
    const files=transferFiles(data);
    if(files.length)return {kind:'files',files};
    const text=safeText(data,'text/plain');
    if(mailLikeText(text))return {kind:'text',text};
    const types=Array.from(data?.types||[]).map(x=>String(x)).slice(0,12);
    return {kind:'unavailable',types,hasLink:types.includes('text/uri-list')||/^(?:https?:|outlook:|mailto:)/i.test(text)};
  }
  return {transferFiles,mailLikeText,assessDrop};
});