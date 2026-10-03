/** JANNATUL BAQI — ISOLATED LOCATION DATABASE
 * Connects the existing location API to a separate normalized sheet.
 * Does not modify the old LOCATION_MASTER sheet.
 */
const NEW_LOCATION_DB_SHEET_='LOCATION_DB_NEW';
const NEW_LOCATION_DB_HEADERS_=['Division','District','Upazila/Thana','Union','Ward','Post Office','Post Code','Village'];

function buildNewLocationDatabase_(){
  const ss=SpreadsheetApp.getActiveSpreadsheet();
  const old=ss.getSheetByName(SHEETS.LOCATION_MASTER);
  if(!old) throw new Error('পুরনো LOCATION_MASTER শিট পাওয়া যায়নি।');
  let sh=ss.getSheetByName(NEW_LOCATION_DB_SHEET_);
  if(!sh) sh=ss.insertSheet(NEW_LOCATION_DB_SHEET_);
  sh.clearContents();
  sh.getRange(1,1,1,8).setValues([NEW_LOCATION_DB_HEADERS_]);
  const last=old.getLastRow();
  if(last<2)return {ok:false,count:0,message:'LOCATION_MASTER-এ কোনো ডাটা নেই।'};
  const src=old.getRange(2,1,last-1,7).getValues(), seen=new Set(), out=[];
  src.forEach(r=>{
    const a=String(r[0]||'').trim(),b=String(r[1]||'').trim(),c=String(r[2]||'').trim(),
          d=String(r[3]||'').trim(),e=String(r[4]||'').trim(),f=String(r[5]||'').trim(),
          g=String(r[6]||'').trim(), key=[a,b,c,d,e,f,'',g].join('|');
    if(!key.replace(/\|/g,'')||seen.has(key))return;
    seen.add(key); out.push([a,b,c,d,e,f,'',g]);
  });
  if(out.length)sh.getRange(2,1,out.length,8).setValues(out);
  sh.setFrozenRows(1); sh.autoResizeColumns(1,8);
  return {ok:true,count:out.length,sheet:NEW_LOCATION_DB_SHEET_};
}

function getNewLocationDatabase_(){
  const sh=SpreadsheetApp.getActiveSpreadsheet().getSheetByName(NEW_LOCATION_DB_SHEET_);
  if(!sh||sh.getLastRow()<2)return [];
  return sh.getRange(2,1,sh.getLastRow()-1,8).getValues().filter(r=>r.some(v=>String(v||'').trim()!==''));
}

function getNewLocationOptions_(division,district,upazila,union,ward,post){
  const rows=getNewLocationDatabase_(), D=String(division||'').trim(),DS=String(district||'').trim(),
        U=String(upazila||'').trim(),UN=String(union||'').trim(),W=String(ward||'').trim(),P=String(post||'').trim();
  const unique=a=>[...new Set(a.map(v=>String(v||'').trim()).filter(Boolean))];
  const f=(r,depth)=>(
    (!D||r[0]===D)&&(!DS||r[1]===DS)&&(!U||r[2]===U)&&(!UN||r[3]===UN)&&(!W||r[4]===W)&&(!P||r[5]===P)
  );
  return {
    divisions:unique(rows.map(r=>r[0])),
    districts:unique(rows.filter(r=>!D||r[0]===D).map(r=>r[1])),
    upazilas:unique(rows.filter(r=>(!D||r[0]===D)&&(!DS||r[1]===DS)).map(r=>r[2])),
    unions:unique(rows.filter(r=>(!D||r[0]===D)&&(!DS||r[1]===DS)&&(!U||r[2]===U)).map(r=>r[3])),
    wards:unique(rows.filter(r=>f(r)).map(r=>r[4])),
    postOffices:unique(rows.filter(r=>f(r)).map(r=>r[5])),
    postCodes:unique(rows.filter(r=>f(r)).map(r=>r[6])),
    villages:unique(rows.filter(r=>f(r)).map(r=>r[7]))
  };
}
