/** JANNATUL BAQI — NEW ISOLATED LOCATION DATABASE
 * 2026-10-03
 * This file is intentionally independent.
 * It does NOT modify Index.html, Code.gs, LocationData.gs, login, dashboard or media.
 *
 * New normalized sheet:
 * LOCATION_DB_NEW
 * Columns:
 * Division | District | Upazila/Thana | Union | Ward | Post Office | Post Code | Village
 *
 * First build imports only the existing LOCATION_MASTER data into a clean,
 * normalized database. The old LOCATION_MASTER is never deleted or modified.
 */

const NEW_LOCATION_DB_SHEET_ = 'LOCATION_DB_NEW';
const NEW_LOCATION_DB_HEADERS_ = [
  'Division','District','Upazila/Thana','Union',
  'Ward','Post Office','Post Code','Village'
];

function buildNewLocationDatabase_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const old = ss.getSheetByName(SHEETS.LOCATION_MASTER);
  if (!old) throw new Error('পুরনো LOCATION_MASTER শিট পাওয়া যায়নি।');

  let sh = ss.getSheetByName(NEW_LOCATION_DB_SHEET_);
  if (!sh) sh = ss.insertSheet(NEW_LOCATION_DB_SHEET_);

  sh.clearContents();
  sh.getRange(1,1,1,NEW_LOCATION_DB_HEADERS_.length)
    .setValues([NEW_LOCATION_DB_HEADERS_]);

  const last = old.getLastRow();
  if (last < 2) return {
    ok:false, count:0,
    message:'পুরনো LOCATION_MASTER-এ কোনো ডাটা নেই।'
  };

  const src = old.getRange(2,1,last-1,7).getValues();
  const seen = new Set();
  const out = [];

  src.forEach(r => {
    const division = String(r[0] || '').trim();
    const district = String(r[1] || '').trim();
    const upazila  = String(r[2] || '').trim();
    const union    = String(r[3] || '').trim();
    const ward     = String(r[4] || '').trim();
    // পুরোনো LOCATION_MASTER-এর 6th column = Post Office, 7th column = Village.
    // নতুন ডাটাবেজে Post Code-এর জন্য আলাদা কলাম রাখা হচ্ছে; পুরোনো ডাটাবেজে
    // Post Code না থাকায় এখানে সেটি খালি থাকবে।
    const post     = String(r[5] || '').trim();
    const postcode = '';
    const village  = String(r[6] || '').trim();

    if (!division && !district && !upazila && !union &&
        !ward && !post && !postcode && !village) return;

    const key = [
      division,district,upazila,union,ward,post,postcode,village
    ].join('|');

    if (!seen.has(key)) {
      seen.add(key);
      out.push([division,district,upazila,union,ward,post,postcode,village]);
    }
  });

  if (out.length) {
    for (let i=0; i<out.length; i+=5000) {
      const n=Math.min(5000,out.length-i);
      sh.getRange(i+2,1,n,8).setValues(out.slice(i,i+n));
    }
  }

  sh.setFrozenRows(1);
  sh.autoResizeColumns(1,8);

  return {
    ok:true,
    count:out.length,
    sheet:NEW_LOCATION_DB_SHEET_,
    message:out.length+'টি ইউনিক লোকেশন রেকর্ড নতুন ডাটাবেজে তৈরি হয়েছে।'
  };
}

function getNewLocationDatabase_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(NEW_LOCATION_DB_SHEET_);
  if (!sh || sh.getLastRow() < 2) return [];

  return sh.getRange(2,1,sh.getLastRow()-1,8).getValues()
    .filter(r => r.some(v => String(v || '').trim() !== ''));
}

function getNewLocationOptions_(division,district,upazila,union,ward,post) {
  const rows = getNewLocationDatabase_();
  const D=String(division||'').trim();
  const DS=String(district||'').trim();
  const U=String(upazila||'').trim();
  const UN=String(union||'').trim();
  const W=String(ward||'').trim();
  const P=String(post||'').trim();

  const unique = values => [...new Set(values.filter(v=>String(v).trim()!=='').map(v=>String(v).trim()))];

  const districts = unique(rows.filter(r=>!D || r[0]===D).map(r=>r[1]));
  const upazilas  = unique(rows.filter(r=>(!D || r[0]===D)&&(!DS || r[1]===DS)).map(r=>r[2]));
  const unions    = unique(rows.filter(r=>(!D || r[0]===D)&&(!DS || r[1]===DS)&&(!U || r[2]===U)).map(r=>r[3]));
  const wards     = unique(rows.filter(r=>(!D || r[0]===D)&&(!DS || r[1]===DS)&&(!U || r[2]===U)&&(!UN || r[3]===UN)).map(r=>r[4]));
  const posts     = unique(rows.filter(r=>(!D || r[0]===D)&&(!DS || r[1]===DS)&&(!U || r[2]===U)).map(r=>r[5]));
  const postcodes = unique(rows.filter(r=>(!D || r[0]===D)&&(!DS || r[1]===DS)&&(!U || r[2]===U)&&(!UN || r[3]===UN)&&(!W || r[4]===W)&&(!P || r[5]===P)).map(r=>r[6]));
  const villages = unique(rows.filter(r=>(!D || r[0]===D)&&(!DS || r[1]===DS)&&(!U || r[2]===U)&&(!UN || r[3]===UN)&&(!W || r[4]===W)&&(!P || r[5]===P)).map(r=>r[7]));

  return {
    divisions: unique(rows.map(r=>r[0])),
    districts,
    upazilas,
    unions,
    wards,
    postOffices:posts,
    postCodes:postcodes,
    villages
  };
}
