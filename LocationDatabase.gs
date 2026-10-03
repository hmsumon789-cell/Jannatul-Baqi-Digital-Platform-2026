/** JANNATUL BAQI — LOCATION DATABASE EXTENSION
 * 2026-10-03
 * Adds a cached Bangladesh postal-office/postcode database to LOCATION_MASTER.
 * Existing Division/District/Upazila/Union/Ward data is preserved.
 * Postal source: BD API v1.2 (no API key).
 */
const LOCATION_POSTAL_DB_VERSION_ = 'bdapi-v1.2-2026-10-03';
const LOCATION_POSTAL_DB_URL_ = 'https://bdapis.com/api/v1.2/postOffice';

function syncPostalDatabase_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(SHEETS.LOCATION_MASTER);
  if (!sh) throw new Error('LOCATION_MASTER শিট পাওয়া যায়নি।');

  const cfg = ss.getSheetByName(SHEETS.CONFIG);
  let current = '';
  if (cfg && cfg.getLastRow() >= 2) {
    const v = cfg.getDataRange().getValues();
    for (let i=1;i<v.length;i++) if (String(v[i][0]) === 'LOCATION_POSTAL_DB_VERSION') current=String(v[i][1]||'');
  }
  if (current === LOCATION_POSTAL_DB_VERSION_) return {ok:true,updated:false,message:'ডাকঘর ডাটাবেস আগে থেকেই আপডেট আছে।'};

  const res = UrlFetchApp.fetch(LOCATION_POSTAL_DB_URL_, {
    method:'get', muteHttpExceptions:true, headers:{Accept:'application/json'}
  });
  if (res.getResponseCode() !== 200) throw new Error('ডাকঘর ডাটাবেস লোড হয়নি: HTTP '+res.getResponseCode());
  const body = JSON.parse(res.getContentText());
  const rows = Array.isArray(body) ? body : (body.data || body.postOffice || body.postOffices || []);
  if (!rows.length) throw new Error('ডাকঘর ডাটাবেসে কোনো রেকর্ড পাওয়া যায়নি।');

  const last = Math.max(1, sh.getLastRow());
  const existing = last > 1 ? sh.getRange(2,1,last-1,7).getValues() : [];
  const keep = existing.filter(r => String(r[5]||'').trim() !== '');
  const out = rows.map(r => [
    String(r.divisionbn || r.division || ''),
    String(r.districtbn || r.district || ''),
    String(r.upazillabn || r.upazilla || r.upazila || ''),
    '', '', 
    String(r.postOfficebn || r.postOffice || r.post || ''),
    String(r.postCodebn || r.postCode || r.postcode || '')
  ]).filter(r => r[5]);

  const seen = {};
  const merged = keep.concat(out).filter(r => {
    const k = [r[0],r[1],r[2],r[5],r[6]].join('|');
    if (seen[k]) return false;
    seen[k]=true; return true;
  });

  if (last > 1) sh.getRange(2,1,last-1,7).clearContent();
  for (let i=0;i<merged.length;i+=5000) {
    const n=Math.min(5000,merged.length-i);
    sh.getRange(i+2,1,n,7).setValues(merged.slice(i,i+n));
  }

  if (cfg) {
    const v=cfg.getDataRange().getValues();
    let found=false;
    for(let i=1;i<v.length;i++) if(String(v[i][0])==='LOCATION_POSTAL_DB_VERSION'){
      cfg.getRange(i+1,2).setValue(LOCATION_POSTAL_DB_VERSION_);
      cfg.getRange(i+1,3).setValue(now_());
      found=true; break;
    }
    if(!found) cfg.appendRow(['LOCATION_POSTAL_DB_VERSION',LOCATION_POSTAL_DB_VERSION_,now_()]);
  }
  return {ok:true,updated:true,count:out.length,message:out.length+'টি ডাকঘর/পোস্টকোড ডাটাবেসে যোগ হয়েছে।'};
}