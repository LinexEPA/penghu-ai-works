export async function getConfig(){const r=await fetch('/api/public-config',{cache:'no-store'});if(!r.ok)throw new Error('無法讀取課程設定');return r.json()}
export function qs(name){return new URLSearchParams(location.search).get(name)||''}
export function fmtBytes(n){if(n<1024*1024)return `${(n/1024).toFixed(0)} KB`;return `${(n/1024/1024).toFixed(1)} MB`}
export function esc(s=''){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
export function toast(el,msg,type='error'){el.className=type;el.textContent=msg;el.classList.remove('hidden')}
