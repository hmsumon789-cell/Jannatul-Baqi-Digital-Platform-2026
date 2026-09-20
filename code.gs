/**
 * JANNATUL BAQI MOHILA MADRASA & EATIMKHANA
 * DIGITAL PLATFORM 2026
 * NEW BUILD — Code.gs
 *
 * This build is written from the supplied requirements document.
 * It does not depend on previous project/library code.
 */

const APP = {
  nameBn: 'জান্নাতুল বাক্বী মহিলা মাদ্রাসা ও এতিমখানা',
  nameAr: 'المدرسة الجنة البافية للبنات ودارالايتام',
  nameEn: 'Jannatul Baky Mohila Madrasha & Eatimkhana',
  address: 'উপজেলা মডেল টাউন কোনাখোলা, কেরাণীগঞ্জ, ঢাকা-১৩১০',
  hotline1: '01823316630',
  hotline2: '01717339288',
  email1: 'hmsumon789@gmail.com',
  email2: 'jannatubakymrs@gmail.com',
  timezone: Session.getScriptTimeZone() || 'Asia/Dhaka',
  otpMinutes: 5
};

const SHEETS = {
  ADMINS:'ADMINS', STUDENTS:'STUDENTS', TEACHERS:'TEACHERS', DONORS:'DONORS',
  ADMISSIONS:'ADMISSIONS', EXAM_REG:'EXAM_REG', PAYMENTS:'PAYMENTS',
  EXPENSES:'EXPENSES', RESULTS:'RESULTS', NOTICES:'NOTICES', ATTENDANCE:'ATTENDANCE',
  MEDIA:'MEDIA', FILES:'FILES', SMS_QUEUE:'SMS_QUEUE', CONTACTS:'CONTACTS',
  CONFIG:'CONFIG', AUDIT:'AUDIT', OTP_LOG:'OTP_LOG', EXECUTIVES:'EXECUTIVES',
  ADVISERS:'ADVISERS', FOUNDERS:'FOUNDERS', LOCATION_MASTER:'LOCATION_MASTER',
  MADRASAS:'MADRASAS', SALARY:'SALARY', CERTIFICATES:'CERTIFICATES',
  ID_CARDS:'ID_CARDS', ADMIT_CARDS:'ADMIT_CARDS', RECEIPTS:'RECEIPTS'
};

const HEADERS = {
  ADMINS:['Serial','AdminID','NameBN','NameAR','NameEN','Username','PasswordHash','Email','Mobile','WhatsApp','Address','Photo','BirthReg','NID','ApprovalID','Role','Status','CreatedAt','Password','Permissions','ApprovedBy','ApprovedAt'],
  STUDENTS:['Serial','StudentID','FormID','MobileID','EmailID','NameBN','NameAR','NameEN','FatherBN','FatherAR','FatherEN','MotherBN','MotherAR','MotherEN','DOB','Gender','Class','Department','Branch','Residence','Mobile','WhatsApp','Email','Address','Photo','BirthReg','NID','Documents','CreatedAt'],
  TEACHERS:['Serial','TeacherID','NameBN','NameAR','NameEN','FatherBN','FatherAR','FatherEN','Mobile','WhatsApp','Email','Department','Branch','Gender','Address','Photo','BirthReg','NID','Documents','CreatedAt'],
  DONORS:['Serial','DonorID','NameBN','NameAR','NameEN','Mobile','WhatsApp','Email','Address','Amount','Fund','Photo','CreatedAt'],
  ADMISSIONS:['Serial','AdmissionID','StudentID','Session','Class','Branch','Status','FormData','CreatedAt'],
  EXAM_REG:['Serial','ExamRegID','StudentID','Exam','Class','Branch','Status','FormData','CreatedAt'],
  PAYMENTS:['Serial','PaymentID','StudentID','Name','Month','Category','Amount','Method','Reference','Date','Note','CreatedAt'],
  EXPENSES:['Serial','ExpenseID','Category','Amount','Method','Date','Note','CreatedAt'],
  RESULTS:['Serial','ResultID','StudentID','Name','Class','Exam','SubjectData','Total','GPA','Grade','Published','Date','CreatedAt'],
  NOTICES:['Serial','NoticeID','TitleBN','TitleAR','TitleEN','BodyBN','BodyAR','BodyEN','Date','Status','CreatedAt'],
  ATTENDANCE:['Serial','AttendanceID','StudentID','Date','Status','Class','Branch','Note','CreatedAt'],
  MEDIA:['Serial','MediaID','Type','Name','DataURL','MimeType','Size','Sort','Status','CreatedAt'],
  FILES:['Serial','FileID','Name','Type','MimeType','DataURL','Size','Folder','Status','CreatedAt'],
  SMS_QUEUE:['Serial','QueueID','Mobile','Message','Status','Provider','SentAt','CreatedAt'],
  CONTACTS:['Serial','ContactID','Name','Mobile','WhatsApp','Email','Role','Note','CreatedAt'],
  CONFIG:['Key','Value','UpdatedAt'],
  AUDIT:['Serial','Time','Username','Action','Target','Details'],
  OTP_LOG:['Serial','Time','Username','Channel','CodeHash','ExpiresAt','Status'],
  EXECUTIVES:['Serial','MemberID','NameBN','NameAR','NameEN','Role','Mobile','Email','Photo'],
  ADVISERS:['Serial','MemberID','NameBN','NameAR','NameEN','Role','Mobile','Email','Photo'],
  FOUNDERS:['Serial','MemberID','NameBN','NameAR','NameEN','Role','Mobile','Email','Photo'],
  LOCATION_MASTER:['Division','District','Upazila','Union','Ward','Post','Village'],
  MADRASAS:['Serial','MadrasaID','GenderType','Name','FoundedYear','Founder','Muhtamim','Address','Mobile','StaffCount','StudentCount','Level','Status','CreatedAt','Username','Password','PasswordHash','ActiveDepartments','OtherDepartment','Ownership','ApprovedBy','ApprovedAt','Permissions'],
  SALARY:['Serial','SalaryID','EmployeeID','Name','Month','Amount','Method','Date','Note','CreatedAt'],
  CERTIFICATES:['Serial','CertificateID','StudentID','Type','IssueDate','Data'],
  ID_CARDS:['Serial','CardID','StudentID','IssueDate','Data'],
  ADMIT_CARDS:['Serial','AdmitID','StudentID','Exam','IssueDate','Data'],
  RECEIPTS:['Serial','ReceiptID','RefID','Type','Amount','Date','Data']
};

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle(APP.nameEn + ' | Digital Platform 2026')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function setupSystem() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  Object.keys(SHEETS).forEach(k => ensureSheet_(ss, SHEETS[k], HEADERS[SHEETS[k]] || ['Value']));
  seedConfig_(ss);
  seedAdmin_(ss);
  seedPeople_(ss);
  seedLocation_(ss);
  return {ok:true, message:'System setup complete'};
}

function seedConfig_(ss) {
  const sh = ss.getSheetByName(SHEETS.CONFIG);
  const values = [
    ['INSTITUTION_BN',APP.nameBn,now_()],
    ['INSTITUTION_AR',APP.nameAr,now_()],
    ['INSTITUTION_EN',APP.nameEn,now_()],
    ['ADDRESS',APP.address,now_()],
    ['HOTLINE1',APP.hotline1,now_()],
    ['HOTLINE2',APP.hotline2,now_()],
    ['EMAIL1',APP.email1,now_()],
    ['EMAIL2',APP.email2,now_()],
    ['SMS_API_URL','',now_()],
    ['SMS_API_TOKEN','',now_()],
    ['LOGO_DATA','',now_()],
    ['RUNNING_NEWS','জান্নাতুল বাক্বী মহিলা মাদ্রাসা ও এতিমখানার ডিজিটাল প্লাটফর্মে আপনাকে স্বাগতম',now_()]
  ];
  if (sh.getLastRow() <= 1) sh.getRange(2,1,values.length,3).setValues(values);
}

function seedAdmin_(ss) {
  const sh = ss.getSheetByName(SHEETS.ADMINS);
  if (sh.getLastRow() > 1) return;
  sh.appendRow([1,'M-1/0001','Super Admin','','','superadmin',hash_('admin1234'),APP.email1,APP.hotline1,APP.hotline1,APP.address,'','','','M-1/0001','SUPER_ADMIN','ACTIVE',now_()]);
  log_('SYSTEM','setup','ADMINS','Initial super admin created');
}

function seedPeople_(ss) {
  const f = ss.getSheetByName(SHEETS.FOUNDERS);
  if (f.getLastRow() <= 1) {
    [
      ['F-001','হাফেজ মাওলানা মু. আতিকুক রহমান (ফরিদপুরী)','','','প্রতিষ্ঠাতা'],
      ['F-002','হাফেজ মাওলানা হেদায়েত উল্লাহ (মানিকগঞ্জি)','','','প্রতিষ্ঠাতা'],
      ['F-003','আলেমা মোসা: মুসলিমা আক্তার শাহিনুর','','','প্রতিষ্ঠাতা'],
      ['F-004','আলেমা মোসা: তাসলিমা আক্তার','','','প্রতিষ্ঠাতা']
    ].forEach(x=>f.appendRow([x[0],x[1],x[1],x[1],x[4],'','','','']));
  }
  const a = ss.getSheetByName(SHEETS.ADVISERS);
  if (a.getLastRow() <= 1) {
    [
      'মুজাহিদে মিল্লাত আলহাজ্ব হাফেজ মাওলানা আল্লামা মুফতি ফজলুল হক আমিনি দা:বা:',
      'নিরব বযুর্গ আলহাজ হযরত মাওলানা আব্দুর রব(মদিনা হুজুর)',
      'আলহাজ্ব হযরত মাওলানা আব্দুল গফুর (ফরিদপুরী)',
      'আলহাজ্ব হাফেজ হযরত মাওলানা সানাউল্লাহ সাহেব'
    ].forEach((n,i)=>a.appendRow(['A-00'+(i+1),n,n,n,'উপদেষ্টা','','','','']));
  }
}

function seedLocation_(ss) {
  installLocationRegistry_(ss);
}

function login(username,password) {
  try {
    setupSystem();
    username = String(username || '').trim();
    password = String(password || '');
    if (!username || !password) return {ok:false,message:'ইউজার নেম ও পাসওয়ার্ড দিন।'};
    const row = findAdminLogin_(username);
    if (!row) return {ok:false,message:'ইউজার নেম পাওয়া যায়নি।'};
    if (String(row.status).toUpperCase() !== 'ACTIVE') return {ok:false,message:'এই অ্যাডমিন একাউন্ট সক্রিয় নয়। Super Admin অনুমোদন প্রয়োজন।'};
    if (row.passwordHash !== hash_(password)) return {ok:false,message:'পাসওয়ার্ড সঠিক নয়।'};

    // বিদ্যমান Super Admin-এর জন্য OTP অপরিবর্তিত থাকবে।
    const full = findBy_(SHEETS.ADMINS,'Username',username) || {};
    const role = String(full.Role || '').toUpperCase().replace(/\s+/g,'_');
    if (role === 'SUPER_ADMIN' || role === 'SUPERADMIN') {
      const otp = generateOtp_();
      const otpHash = hash_(otp);
      const expires = new Date(Date.now()+APP.otpMinutes*60000);
      append_(SHEETS.OTP_LOG,[null,now_(),username,'EMAIL',otpHash,expires,'SENT']);
      sendOtpEmail_(row.email || APP.email1,otp,username);
      const token = Utilities.getUuid();
      CacheService.getScriptCache().put('OTP:'+token, JSON.stringify({username,otpHash,expires:expires.getTime()}), APP.otpMinutes*60);
      return {ok:true,requiresOtp:true,token:String(token),message:'OTP ইমেইলে পাঠানো হয়েছে।',emailMask:maskEmail_(row.email || APP.email1)};
    }

    // Super Admin অনুমোদিত নতুন Admin-দের জন্য OTP ছাড়া সরাসরি Session।
    return createDirectSession_(username,'admin');
  } catch(e) {
    return {ok:false,message:'সার্ভার ত্রুটি: '+e.message};
  }
}
function verifyLoginOtp(token,username,code) {
  try {
    const raw = CacheService.getScriptCache().get('OTP:'+token);
    if (!raw) return {ok:false,message:'OTP-এর সময় শেষ হয়েছে। আবার লগইন করুন।'};
    const d = JSON.parse(raw);
    if (d.username !== username || Date.now() > d.expires) return {ok:false,message:'OTP অবৈধ বা মেয়াদ শেষ।'};
    if (hash_(String(code).replace(/\D/g,'')) !== d.otpHash) return {ok:false,message:'OTP সঠিক নয়।'};
    const session = Utilities.getUuid();
    CacheService.getScriptCache().put('SESSION:'+session, JSON.stringify({username,accountType:'admin',at:Date.now()}), 21600);
    CacheService.getScriptCache().remove('OTP:'+token);
    log_(username,'login','SESSION','Login successful');
    return {ok:true,token:session,user:getAdminSafe_(username)};
  } catch(e) {
    return {ok:false,message:e.message};
  }
}

function requestOtp(username) {
  const row=findBy_(SHEETS.ADMINS,'Username',String(username||'').trim());
  if(!row) return {ok:false,message:'ইউজার নেম পাওয়া যায়নি।'};
  const otp=generateOtp_(), expires=new Date(Date.now()+APP.otpMinutes*60000);
  append_(SHEETS.OTP_LOG,[null,now_(),username,'EMAIL',hash_(otp),expires,'RESENT']);
  sendOtpEmail_(row.Email||APP.email1,otp,username);
  return {ok:true,message:'নতুন OTP পাঠানো হয়েছে।'};
}


function registerNewAdmin(data){
  setupSystem();
  data=data||{};
  const name=String(data.name||'').trim(), mobile=String(data.mobile||'').trim(), username=String(data.username||'').trim(), password=String(data.password||''), address=String(data.address||'').trim(), photo=String(data.photo||'');
  if(!name||!mobile||!username||!password||!address||!photo) return {ok:false,message:'নাম, ঠিকানা, ফটো, মোবাইল, Username ও Password বাধ্যতামূলক।'};
  if(findBy_(SHEETS.ADMINS,'Username',username)) return {ok:false,message:'এই Username আগে থেকেই আছে।'};
  const sh=SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.ADMINS), n=nextSerial_(sh), id='M-1/'+String(n).padStart(4,'0');
  sh.appendRow([n,id,name,'','',username,hash_(password),'',mobile,'',address,photo,'','',id,'ADMIN','PENDING',now_(),password,'','','']);
  log_('PUBLIC','register','ADMIN',id);
  return {ok:true,adminId:id,message:'নতুন অ্যাডমিন নিবন্ধন হয়েছে। অনুমোদনের পর Username + Password দিয়ে OTP ছাড়া লগইন করতে পারবেন।'};
}

function registerMadrasa(data){
  setupSystem();
  data=data||{};
  const name=String(data.name||'').trim(), year=String(data.foundedYear||'').trim(), username=String(data.username||'').trim(), password=String(data.password||''), address=String(data.address||'').trim();
  if(!name||!year||!username||!password||!address) return {ok:false,message:'মাদ্রাসার নাম, প্রতিষ্ঠা সন, ঠিকানা, Username ও Password বাধ্যতামূলক।'};
  if(findBy_(SHEETS.MADRASAS,'Username',username)||findBy_(SHEETS.ADMINS,'Username',username)) return {ok:false,message:'এই Username আগে থেকেই ব্যবহার হচ্ছে।'};
  const sh=SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.MADRASAS), n=nextSerial_(sh), id='MR-'+String(n).padStart(4,'0');
  const deps=Array.isArray(data.departments)?data.departments.filter(Boolean).join(', '):String(data.departments||'');
  sh.appendRow([n,id,'',name,year,'','',''+address,String(data.mobile||''),Number(data.staffCount)||0,Number(data.studentCount)||0,'','PENDING',now_(),username,password,hash_(password),deps,String(data.otherDepartment||''),String(data.ownership||''),'','', '']);
  log_('PUBLIC','register','MADRASA',id);
  return {ok:true,madrasaId:id,message:'নতুন মাদ্রাসা নিবন্ধন হয়েছে। প্রশাসন/সুপার অ্যাডমিন অনুমোদনের পর Username + Password দিয়ে OTP ছাড়া লগইন করতে পারবেন।'};
}

function loginNewAdmin(username,password){
  setupSystem(); username=String(username||'').trim(); password=String(password||'');
  const row=findBy_(SHEETS.ADMINS,'Username',username);
  if(!row) return {ok:false,message:'এই Admin Username পাওয়া যায়নি।'};
  if(String(row.Status||'').toUpperCase()!=='ACTIVE') return {ok:false,message:'এই Admin একাউন্ট এখন '+String(row.Status||'PENDING')+'। Super Admin অনুমোদন প্রয়োজন।'};
  if(String(row.PasswordHash||'')!==hash_(password)) return {ok:false,message:'Password সঠিক নয়।'};
  return createDirectSession_(username,'admin');
}

function loginMadrasa(username,password){
  setupSystem(); username=String(username||'').trim(); password=String(password||'');
  const row=findBy_(SHEETS.MADRASAS,'Username',username);
  if(!row) return {ok:false,message:'এই Madrasa Username পাওয়া যায়নি।'};
  if(String(row.Status||'').toUpperCase()!=='ACTIVE') return {ok:false,message:'এই মাদ্রাসা একাউন্ট এখন '+String(row.Status||'PENDING')+'। Super Admin অনুমোদন প্রয়োজন।'};
  if(String(row.PasswordHash||'')!==hash_(password)) return {ok:false,message:'Password সঠিক নয়।'};
  return createDirectSession_(username,'madrasa');
}

function createDirectSession_(username,type){
  const session=Utilities.getUuid();
  CacheService.getScriptCache().put('SESSION:'+session,JSON.stringify({username:String(username),accountType:type,at:Date.now()}),21600);
  const user=type==='admin'?getAdminSafe_(username):findBy_(SHEETS.MADRASAS,'Username',username)||{};
  return {ok:true,token:session,user:user,message:'লগইন সফল হয়েছে।'};
}

function getModulesForSession_(token){
  const s = auth_(token);
  // Role check is intentionally first so Super Admin always receives the
  // complete feature list even if the ADMIN row has incomplete Permissions.
  if(s.accountType !== 'madrasa'){
    const a = findBy_(SHEETS.ADMINS,'Username',s.username)||{};
    const role = String(a.Role||'').toUpperCase().replace(/\\s+/g,'_');
    if(role==='SUPER_ADMIN' || role==='SUPERADMIN') return getModules_();
  }
  const all = getModules_();
  if(s.accountType==='madrasa'){
    const m=findBy_(SHEETS.MADRASAS,'Username',s.username)||{};
    const allowed=String(m.Permissions||'').split(',').map(x=>x.trim()).filter(Boolean);
    return all.filter(x=>allowed.includes(x[0]) || x[0]==='institution' || x[0]==='help');
  }
  const a=findBy_(SHEETS.ADMINS,'Username',s.username)||{};
  const allowed=String(a.Permissions||'').split(',').map(x=>x.trim()).filter(Boolean);
  return all.filter(x=>allowed.includes(x[0]) || x[0]==='institution' || x[0]==='help');
}
function getModuleList(token,key){
  auth_(token);
  const map={
    students:[SHEETS.STUDENTS,'student'],
    teachers:[SHEETS.TEACHERS,'teacher'],
    exams:[SHEETS.EXAM_REG,'exam'],
    admins:[SHEETS.ADMINS,'admin'],
    madrasas:[SHEETS.MADRASAS,'madrasa']
  };
  const item=map[String(key||'')];
  if(!item) return {ok:false,message:'তালিকা ফিচার পাওয়া যায়নি।'};
  requireFeature_(token,item[1]);
  return {ok:true,key:String(key),rows:listRows_(item[0],token,5000)};
}

function isSuperAdmin_(token){
  const s=auth_(token), a=findBy_(SHEETS.ADMINS,'Username',s.username)||{};
  return String(a.Role||'').toUpperCase()==='SUPER_ADMIN' || String(a.Role||'').toUpperCase()==='SUPERADMIN';
}
function requireFeature_(token,feature){
  const s=auth_(token); const a=findBy_(SHEETS.ADMINS,'Username',s.username)||{};
  const role=String(a.Role||'').toUpperCase(); if(role==='SUPER_ADMIN'||role==='SUPERADMIN') return true;
  const source=s.accountType==='madrasa'?findBy_(SHEETS.MADRASAS,'Username',s.username):a;
  const allowed=String(source.Permissions||'').split(',').map(x=>x.trim());
  if(!allowed.includes(feature)) throw new Error('এই ফিচারে আপনার অনুমোদন নেই।');
  return true;
}

function getAccountControlData(token){
  if(!isSuperAdmin_(token)) return {ok:false,message:'শুধু Super Admin অনুমোদন ও পারমিশন পরিবর্তন করতে পারবেন।'};
  return {ok:true,admins:listRows_(SHEETS.ADMINS,token,500),madrasas:listRows_(SHEETS.MADRASAS,token,500),modules:getModules_()};
}
function approveAccount(token,type,id,status,permissions){
  try{
    const s=auth_(token);
    const actor=String(s.username||'');
    const a=findBy_(SHEETS.ADMINS,'Username',actor)||{};
    const role=String(a.Role||'').toUpperCase().replace(/\s+/g,'_');
    if(role!=='SUPER_ADMIN' && role!=='SUPERADMIN') return {ok:false,message:'শুধু Super Admin অনুমোদন করতে পারবেন।'};

    type=String(type||'').toLowerCase();
    id=String(id||'').trim();
    if(type!=='admin' && type!=='madrasa') return {ok:false,message:'Account type সঠিক নয়।'};
    if(!id) return {ok:false,message:'Account ID পাওয়া যায়নি।'};

    const ss=SpreadsheetApp.getActiveSpreadsheet();
    const sheetName=type==='admin'?SHEETS.ADMINS:SHEETS.MADRASAS;
    const key=type==='admin'?'AdminID':'MadrasaID';
    const required=HEADERS[sheetName]||[];
    const sh=ensureSheet_(ss,sheetName,required);
    const vals=sh.getDataRange().getValues();
    if(!vals.length) return {ok:false,message:'Account sheet পাওয়া যায়নি।'};
    const h=vals[0].map(x=>String(x).trim());
    const keyCol=h.indexOf(key);
    if(keyCol<0) return {ok:false,message:key+' কলাম পাওয়া যায়নি। setupSystem আবার চালান।'};

    let rowIndex=-1;
    for(let i=1;i<vals.length;i++){
      if(String(vals[i][keyCol]).trim()===id){rowIndex=i+1;break;}
    }
    if(rowIndex<2) return {ok:false,message:'Account পাওয়া যায়নি: '+id};

    const safePermissions=Array.isArray(permissions)?permissions.map(x=>String(x).trim()).filter(Boolean):String(permissions||'').split(',').map(x=>x.trim()).filter(Boolean);
    const finalStatus=String(status||'ACTIVE').toUpperCase();
    const statusCol=h.indexOf('Status');
    const permCol=h.indexOf('Permissions');
    const byCol=h.indexOf('ApprovedBy');
    const atCol=h.indexOf('ApprovedAt');

    if(statusCol>=0) sh.getRange(rowIndex,statusCol+1).setValue(finalStatus);
    if(permCol>=0) sh.getRange(rowIndex,permCol+1).setValue(safePermissions.join(','));
    if(byCol>=0) sh.getRange(rowIndex,byCol+1).setValue(actor);
    if(atCol>=0) sh.getRange(rowIndex,atCol+1).setValue(now_());
    SpreadsheetApp.flush();
    log_(actor,'approve',type,id+' | '+finalStatus+' | '+safePermissions.join(','));
    return {ok:true,message:'✅ অনুমোদন সফল হয়েছে। '+id+' এখন '+finalStatus+' এবং নির্বাচিত Permission সংরক্ষিত হয়েছে।',id:id,status:finalStatus,permissions:safePermissions};
  }catch(e){
    return {ok:false,message:'Approval সার্ভার ত্রুটি: '+(e&&e.message?e.message:e)};
  }
}

function approveAccountDirect(token,type,id,status,permissions){
  return approveAccount(token,type,id,status,permissions);
}
function setAccountStatus(token,type,id,status){
  if(!isSuperAdmin_(token)) return {ok:false,message:'শুধু Super Admin status পরিবর্তন করতে পারবেন।'};
  const sheet=type==='admin'?SHEETS.ADMINS:SHEETS.MADRASAS, key=type==='admin'?'AdminID':'MadrasaID', sh=SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheet), vals=sh.getDataRange().getValues(), h=vals[0], idx=vals.findIndex((r,i)=>i>0&&String(r[h.indexOf(key)])===String(id));
  if(idx<1) return {ok:false,message:'Account পাওয়া যায়নি।'};
  sh.getRange(idx+1,h.indexOf('Status')+1).setValue(status); log_(sessionUser_(token),'status',type,id+' => '+status); return {ok:true,message:'Account status '+status+' করা হয়েছে।'};
}
function resetAccountPassword(token,type,id,newPassword){
  if(!isSuperAdmin_(token)) return {ok:false,message:'শুধু Super Admin Password reset করতে পারবেন।'};
  newPassword=String(newPassword||''); if(newPassword.length<4)return {ok:false,message:'Password কমপক্ষে ৪ অক্ষরের দিন।'};
  const sheet=type==='admin'?SHEETS.ADMINS:SHEETS.MADRASAS, key=type==='admin'?'AdminID':'MadrasaID', sh=SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheet), vals=sh.getDataRange().getValues(), h=vals[0], idx=vals.findIndex((r,i)=>i>0&&String(r[h.indexOf(key)])===String(id));
  if(idx<1)return {ok:false,message:'Account পাওয়া যায়নি।'};
  const hi=h.indexOf('PasswordHash'), pi=h.indexOf('Password'); if(hi>=0)sh.getRange(idx+1,hi+1).setValue(hash_(newPassword)); if(pi>=0)sh.getRange(idx+1,pi+1).setValue(newPassword);
  log_(sessionUser_(token),'password_reset',type,id); return {ok:true,message:'Password reset হয়েছে।'};
}

function logout(token) {
  if(token) CacheService.getScriptCache().remove('SESSION:'+token);
  return {ok:true};
}

function getBootstrap(token) {
  auth_(token);
  // Dashboard bootstrap must never lose the Feature buttons because one
  // optional dashboard component (stats/media/notices) failed.
  const modules = getModulesForSession_(token);
  let stats = {income:0,expense:0,cash:0,due:0,students:0,teachers:0,executives:0,femaleMadrasa:0,maleMadrasa:0,attendanceToday:{present:0,absent:0}};
  let media = [];
  let notices = [];
  try { stats = getStats(token); } catch(e) {}
  try { media = listMedia(token); } catch(e) {}
  try { notices = listRows_(SHEETS.NOTICES,token,20); } catch(e) {}
  return {
    ok:true, institution:APP,
    stats, media, notices,
    modules,
    classes:getClasses_()
  };
}

function getStats(token) {
  auth_(token);
  const income=sumCol_(SHEETS.PAYMENTS,'Amount');
  const expense=sumCol_(SHEETS.EXPENSES,'Amount');
  const students=countData_(SHEETS.STUDENTS);
  const teachers=countData_(SHEETS.TEACHERS);
  const executives=countData_(SHEETS.EXECUTIVES);
  const female=countMadrasa_('মহিলা'), male=countMadrasa_('পুরুষ');
  return {income,expense,cash:income-expense,due:0,students,teachers,executives,femaleMadrasa:female,maleMadrasa:male,attendanceToday:attendanceToday_()};
}

function searchAll(token,signal,query) {
  auth_(token);
  signal=String(signal||'').trim().toLowerCase();
  query=String(query||'').trim();
  if(!query) return {ok:false,message:'সার্চ আইডি দিন।'};
  const map={
    std:SHEETS.STUDENTS,thr:SHEETS.TEACHERS,olp:SHEETS.PAYMENTS,mrs:SHEETS.RESULTS,rjt:SHEETS.RESULTS,
    adm:SHEETS.ADMINS,npn:SHEETS.EXAM_REG,npt:SHEETS.STUDENTS,nmt:SHEETS.STUDENTS,ofd:SHEETS.RESULTS,
    cft:SHEETS.CERTIFICATES,idc:SHEETS.ID_CARDS,adc:SHEETS.ADMIT_CARDS,rct:SHEETS.RECEIPTS,tcp:SHEETS.STUDENTS,sjs:SHEETS.STUDENTS
  };
  const sheet=map[signal];
  if(!sheet) return {ok:false,message:'সংকেত সঠিক নয়।'};
  const rows=listRows_(sheet,token,5000);
  const q=query.toLowerCase();
  const matches=rows.filter(r=>Object.keys(r).some(k=>String(r[k]??'').toLowerCase().includes(q))).slice(0,100);
  return {ok:true,signal,query,matches,count:matches.length};
}

function saveRecord(token,sheetName,data) {
  auth_(token);
  const featureMap={STUDENTS:'student',TEACHERS:'teacher',DONORS:'donor',PAYMENTS:'payment',EXPENSES:'finance',RESULTS:'result',EXAM_REG:'exam',ATTENDANCE:'attendance',NOTICES:'notice',SALARY:'salary',CERTIFICATES:'certificate',ID_CARDS:'idcard',ADMIT_CARDS:'admit',RECEIPTS:'receipt',ADMISSIONS:'admission'}; if(featureMap[sheetName]) requireFeature_(token,featureMap[sheetName]);
  if(!HEADERS[sheetName]) throw new Error('Invalid sheet');
  const sh=SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  const headers=HEADERS[sheetName];
  const row=headers.map(h=>data[h] ?? '');
  row[0]=nextSerial_(sh);
  if(headers.includes('CreatedAt')) row[headers.indexOf('CreatedAt')]=now_();
  if(headers.includes('StudentID') && !data.StudentID && sheetName==='STUDENTS') {
    const s=nextSerial_(sh); row[1]=String(s).padStart(3,'0'); row[2]='F-'+String(s).padStart(4,'0'); row[3]=data.Mobile||''; row[4]=data.Email||'';
  }
  sh.appendRow(row);
  log_(sessionUser_(token),'create',sheetName,JSON.stringify(data).slice(0,1000));
  return {ok:true,row:objectFrom_(headers,row)};
}

function updateRecord(token,sheetName,serial,data) {
  auth_(token); const featureMap={STUDENTS:'student',TEACHERS:'teacher',DONORS:'donor',PAYMENTS:'payment',EXPENSES:'finance',RESULTS:'result',EXAM_REG:'exam',ATTENDANCE:'attendance',NOTICES:'notice',SALARY:'salary',CERTIFICATES:'certificate',ID_CARDS:'idcard',ADMIT_CARDS:'admit',RECEIPTS:'receipt',ADMISSIONS:'admission'}; if(featureMap[sheetName]) requireFeature_(token,featureMap[sheetName]);
  const sh=SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  const values=sh.getDataRange().getValues();
  if(values.length<2) throw new Error('No data');
  const headers=values[0];
  const idx=values.findIndex((r,i)=>i>0 && String(r[0])===String(serial));
  if(idx<1) throw new Error('Record not found');
  headers.forEach((h,j)=>{if(Object.prototype.hasOwnProperty.call(data,h)) sh.getRange(idx+1,j+1).setValue(data[h]);});
  log_(sessionUser_(token),'update',sheetName,String(serial));
  return {ok:true};
}

function deleteRecord(token,sheetName,serial) {
  auth_(token); const featureMap={STUDENTS:'student',TEACHERS:'teacher',DONORS:'donor',PAYMENTS:'payment',EXPENSES:'finance',RESULTS:'result',EXAM_REG:'exam',ATTENDANCE:'attendance',NOTICES:'notice',SALARY:'salary',CERTIFICATES:'certificate',ID_CARDS:'idcard',ADMIT_CARDS:'admit',RECEIPTS:'receipt',ADMISSIONS:'admission'}; if(featureMap[sheetName]) requireFeature_(token,featureMap[sheetName]);
  const sh=SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  const vals=sh.getRange(2,1,Math.max(1,sh.getLastRow()-1),1).getValues();
  const idx=vals.findIndex(r=>String(r[0])===String(serial));
  if(idx<0) throw new Error('Record not found');
  sh.deleteRow(idx+2);
  return {ok:true};
}

function createAdmin(token,data) {
  auth_(token); requireFeature_(token,'admin');
  if(!data.NameBN || !data.Username || !data.Password || !data.Mobile || !data.Photo || !data.Address)
    return {ok:false,message:'নাম, ইউজার নেম, পাসওয়ার্ড, মোবাইল, ছবি ও ঠিকানা বাধ্যতামূলক।'};
  if(findBy_(SHEETS.ADMINS,'Username',data.Username)) return {ok:false,message:'এই ইউজার নেম আগে থেকেই আছে।'};
  const sh=SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.ADMINS);
  const n=nextSerial_(sh);
  const id='M-1/'+String(n).padStart(4,'0');
  sh.appendRow([n,id,data.NameBN||'',data.NameAR||'',data.NameEN||'',data.Username,hash_(data.Password),data.Email||'',data.Mobile,data.WhatsApp||'',data.Address,data.Photo,data.BirthReg||'',data.NID||'',data.ApprovalID||'',data.Role||'ADMIN','ACTIVE',now_(),data.Password,'','','']);
  log_(sessionUser_(token),'create','ADMIN',id);
  return {ok:true,adminId:id};
}

function sendQuickService(token,data) {
  // Sends directly to the configured institutional help address.
  auth_(token);
  const subject='Digital Platform Quick Service';
  const body='Name: '+(data.name||'')+'\nMobile: '+(data.mobile||'')+'\n\n'+(data.message||'');
  MailApp.sendEmail(APP.email1,subject,body,{replyTo:data.email||APP.email1});
  append_(SHEETS.CONTACTS,[nextSerial_(SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.CONTACTS)),'C-'+Date.now(),data.name||'',data.mobile||'',data.whatsapp||'',data.email||'','QUICK_SERVICE',data.message||'',now_()]);
  return {ok:true,message:'মেসেজ পাঠানো হয়েছে।'};
}

function getMediaRules_(){
  return {video:{maxMB:50,maxCount:50},audio:{maxMB:50,maxCount:50},image:{maxMB:20,maxCount:100}};
}
function mediaDriveFolder_(){
  const name='Jannatul Baqi Digital Platform - Media 2026';
  const it=DriveApp.getFoldersByName(name);
  return it.hasNext()?it.next():DriveApp.createFolder(name);
}
function mediaDriveUrl_(fileId){ return 'https://drive.google.com/uc?export=download&id='+encodeURIComponent(fileId); }
function mediaTempFolder_(){
  const name='Jannatul Baqi Digital Platform - Media Upload Temp 2026';
  const it=DriveApp.getFoldersByName(name);
  return it.hasNext()?it.next():DriveApp.createFolder(name);
}
function startMediaUpload(token,meta){
  auth_(token); requireFeature_(token,'gallery');
  meta=meta||{};
  const type=String(meta.type||'').toLowerCase(), rules=getMediaRules_()[type];
  if(!rules)return {ok:false,message:'মিডিয়া টাইপ সঠিক নয়।'};
  const size=Number(meta.size||0);
  if(size<=0||size>rules.maxMB*1024*1024)return {ok:false,message:type==='image'?'ফটোর সর্বোচ্চ সীমা 20 MB।':'ভিডিও/অডিওর সর্বোচ্চ সীমা 50 MB।'};
  const sh=SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.MEDIA);
  const rows=listRows_(SHEETS.MEDIA,token,1000).filter(x=>String(x.Status).toUpperCase()==='ACTIVE'&&String(x.Type).toLowerCase()===type);
  if(rows.length>=rules.maxCount)return {ok:false,message:type==='image'?'সর্বোচ্চ 100টি ফটো রাখা যাবে।':'সর্বোচ্চ 50টি '+(type==='video'?'ভিডিও':'অডিও')+' রাখা যাবে।'};
  const uploadId=Utilities.getUuid();
  const folder=mediaTempFolder_();
  folder.createFile(Utilities.newBlob(JSON.stringify({uploadId,type,name:String(meta.name||'media'),mimeType:String(meta.mimeType||'application/octet-stream'),size:size,created:Date.now()}),'application/json','META-'+uploadId+'.json'));
  return {ok:true,uploadId:uploadId};
}
function uploadMediaChunk(token,uploadId,index,base64){
  auth_(token); requireFeature_(token,'gallery');
  uploadId=String(uploadId||''); index=Number(index);
  if(!uploadId||!isFinite(index)||index<0)return {ok:false,message:'Chunk তথ্য সঠিক নয়।'};
  const raw=String(base64||''); if(!raw)return {ok:false,message:'Chunk ডাটা পাওয়া যায়নি।'};
  const folder=mediaTempFolder_();
  folder.createFile(Utilities.newBlob(Utilities.base64Decode(raw),'application/octet-stream','CHUNK-'+uploadId+'-'+String(index).padStart(6,'0')));
  return {ok:true,index:index};
}
function finishMediaUpload(token,uploadId){
  auth_(token); requireFeature_(token,'gallery');
  uploadId=String(uploadId||''); if(!uploadId)return {ok:false,message:'Upload ID পাওয়া যায়নি।'};
  const folder=mediaTempFolder_(), files=folder.getFiles(), chunks=[], metas=[];
  while(files.hasNext()){
    const f=files.next(), n=f.getName();
    if(n==='META-'+uploadId+'.json')metas.push(f);
    else if(n.indexOf('CHUNK-'+uploadId+'-')===0)chunks.push(f);
  }
  if(!metas.length||!chunks.length)return {ok:false,message:'আপলোডের অংশগুলো সম্পূর্ণ পাওয়া যায়নি।'};
  let meta;
  try{meta=JSON.parse(metas[0].getBlob().getDataAsString());}catch(e){return {ok:false,message:'Upload metadata নষ্ট হয়েছে।'};}
  const type=String(meta.type||'').toLowerCase(),rules=getMediaRules_()[type];
  if(!rules)return {ok:false,message:'মিডিয়া টাইপ সঠিক নয়।'};
  chunks.sort((a,b)=>a.getName().localeCompare(b.getName()));
  let total=0,bytes=[];
  chunks.forEach(function(f){const b=f.getBlob().getBytes();total+=b.length;bytes=bytes.concat(b);});
  if(total!==Number(meta.size||0))return {ok:false,message:'ফাইলের আকার মিলছে না। '+total+' / '+meta.size};
  if(total>rules.maxMB*1024*1024)return {ok:false,message:'ফাইলের আকার অনুমোদিত সীমার বেশি।'};
  const sh=SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.MEDIA);
  const rows=listRows_(SHEETS.MEDIA,token,1000).filter(x=>String(x.Status).toUpperCase()==='ACTIVE'&&String(x.Type).toLowerCase()===type);
  if(rows.length>=rules.maxCount)return {ok:false,message:type==='image'?'সর্বোচ্চ 100টি ফটো রাখা যাবে।':'সর্বোচ্চ 50টি '+(type==='video'?'ভিডিও':'অডিও')+' রাখা যাবে।'};
  const file=mediaDriveFolder_().createFile(Utilities.newBlob(bytes,meta.mimeType||'application/octet-stream',meta.name||('media-'+Date.now())));
  try{file.setSharing(DriveApp.Access.ANYONE_WITH_LINK,DriveApp.Permission.VIEW);}catch(e){}
  const serial=nextSerial_(sh),mediaId='MED-'+Date.now();
  sh.appendRow([serial,mediaId,type,meta.name||'','DRIVE:'+file.getId(),meta.mimeType||'',total,0,'ACTIVE',now_()]);
  chunks.forEach(function(f){try{f.setTrashed(true);}catch(e){}}); metas.forEach(function(f){try{f.setTrashed(true);}catch(e){}});
  return {ok:true,serial:serial,mediaId:mediaId};
}
function saveMediaForm(form){
  const token=String(form&&form.token||'');
  auth_(token); requireFeature_(token,'gallery');
  const blob=form&&form.mediaFile;
  if(!blob || typeof blob.getBytes!=='function') return {ok:false,message:'ফাইল পাওয়া যায়নি।'};
  const mime=String(blob.getContentType()||'application/octet-stream');
  const type=String(form.type||'').toLowerCase();
  const rules=getMediaRules_()[type];
  if(!rules)return {ok:false,message:'মিডিয়া টাইপ সঠিক নয়।'};
  const size=Number(blob.getBytes().length||0);
  if(size<=0)return {ok:false,message:'ফাইল খালি।'};
  if(size>rules.maxMB*1024*1024)return {ok:false,message:type==='image'?'ফটোর সর্বোচ্চ সীমা 20 MB।':'ভিডিও/অডিওর সর্বোচ্চ সীমা 50 MB।'};
  const sh=SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.MEDIA);
  const rows=listRows_(SHEETS.MEDIA,token,1000).filter(x=>String(x.Status).toUpperCase()==='ACTIVE'&&String(x.Type).toLowerCase()===type);
  if(rows.length>=rules.maxCount)return {ok:false,message:type==='image'?'সর্বোচ্চ 100টি ফটো রাখা যাবে।':'সর্বোচ্চ 50টি '+(type==='video'?'ভিডিও':'অডিও')+' রাখা যাবে।'};
  const name=String(blob.getName()||('media-'+Date.now()));
  const file=mediaDriveFolder_().createFile(blob.setName(name));
  try{file.setSharing(DriveApp.Access.ANYONE_WITH_LINK,DriveApp.Permission.VIEW);}catch(e){}
  const serial=nextSerial_(sh),mediaId='MED-'+Date.now();
  sh.appendRow([serial,mediaId,type,name,'DRIVE:'+file.getId(),mime,size,0,'ACTIVE',now_()]);
  return {ok:true,serial:serial,mediaId:mediaId};
}
function saveMedia(token,item) {
  auth_(token); requireFeature_(token,'gallery');
  if(!item || !item.dataUrl) return {ok:false,message:'ফাইল পাওয়া যায়নি।'};
  const type=String(item.type||'').toLowerCase(), rules=getMediaRules_()[type];
  if(!rules) return {ok:false,message:'শুধু ফটো, ভিডিও বা অডিও ফাইল অনুমোদিত।'};
  const size=Number(item.size||0);
  if(size>rules.maxMB*1024*1024) return {ok:false,message:type==='image'?'ফটোর সর্বোচ্চ সীমা 20 MB।':'ভিডিও/অডিওর সর্বোচ্চ সীমা 50 MB।'};
  const sh=SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.MEDIA);
  const rows=listRows_(SHEETS.MEDIA,token,1000).filter(x=>String(x.Status).toUpperCase()==='ACTIVE'&&String(x.Type).toLowerCase()===type);
  if(rows.length>=rules.maxCount) return {ok:false,message:type==='image'?'সর্বোচ্চ 100টি ফটো রাখা যাবে।':'সর্বোচ্চ 50টি '+(type==='video'?'ভিডিও':'অডিও')+' রাখা যাবে।'};
  const raw=String(item.dataUrl).split(',')[1]||''; if(!raw)return {ok:false,message:'ফাইল ডাটা পাওয়া যায়নি।'};
  const blob=Utilities.newBlob(Utilities.base64Decode(raw),item.mimeType||'application/octet-stream',item.name||('media-'+Date.now()));
  const file=mediaDriveFolder_().createFile(blob);
  try{file.setSharing(DriveApp.Access.ANYONE_WITH_LINK,DriveApp.Permission.VIEW);}catch(e){}
  const serial=nextSerial_(sh), mediaId='MED-'+Date.now();
  sh.appendRow([serial,mediaId,type,item.name||'','DRIVE:'+file.getId(),item.mimeType||'',size,item.sort||0,'ACTIVE',now_()]);
  return {ok:true,serial:serial,mediaId:mediaId};
}
function listMedia(token) {
  auth_(token);
  return listRows_(SHEETS.MEDIA,token,1000).filter(x=>String(x.Status).toUpperCase()==='ACTIVE').map(function(x){
    if(String(x.DataURL||'').indexOf('DRIVE:')===0){const id=String(x.DataURL).slice(6);x.DataURL=mediaDriveUrl_(id);x.DriveFileId=id;}
    return x;
  });
}
function deleteMedia(token,serial) {
  auth_(token); requireFeature_(token,'gallery');
  const sh=SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.MEDIA), last=sh.getLastRow();
  if(last<2)return {ok:false,message:'মিডিয়া পাওয়া যায়নি।'};
  const vals=sh.getRange(2,1,last-1,10).getValues(), idx=vals.findIndex(function(r){return String(r[0])===String(serial);});
  if(idx<0)return {ok:false,message:'মিডিয়া পাওয়া যায়নি।'};
  const dataUrl=String(vals[idx][4]||'');
  if(dataUrl.indexOf('DRIVE:')===0){try{DriveApp.getFileById(dataUrl.slice(6)).setTrashed(true);}catch(e){}}
  sh.deleteRow(idx+2); return {ok:true};
}

function uploadFile(token,item) {
  auth_(token); requireFeature_(token,'files');
  const sh=SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.FILES);
  sh.appendRow([nextSerial_(sh),'FIL-'+Date.now(),item.name||'',item.type||'',item.mimeType||'',item.dataUrl||'',item.size||0,item.folder||'GENERAL','ACTIVE',now_()]);
  return {ok:true};
}

function getSheetData(token,sheetName,limit) {
  auth_(token); if(!isSuperAdmin_(token)) requireFeature_(token,'excel');
  return {ok:true,headers:HEADERS[sheetName],rows:listRows_(sheetName,token,limit||1000)};
}

function getLocations() {
  const sh=SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.LOCATION_MASTER);
  if(!sh) return [];
  const v=sh.getDataRange().getValues();
  if(v.length<2) return [];
  return v.slice(1).filter(r=>r.join('')!=='').map(r=>({division:r[0],district:r[1],upazila:r[2],union:r[3],ward:r[4],post:r[5],village:r[6]}));
}

function getRunningNews_(){ const sh=SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.CONFIG); if(!sh||sh.getLastRow()<2)return 'জান্নাতুল বাক্বী মহিলা মাদ্রাসা ও এতিমখানার ডিজিটাল প্লাটফর্মে আপনাকে স্বাগতম'; const v=sh.getDataRange().getValues(); for(let i=1;i<v.length;i++){ if(String(v[i][0])==='RUNNING_NEWS') return String(v[i][1]||''); } return 'জান্নাতুল বাক্বী মহিলা মাদ্রাসা ও এতিমখানার ডিজিটাল প্লাটফর্মে আপনাকে স্বাগতম'; }
function setRunningNews(token,text){ if(!isSuperAdmin_(token)) return {ok:false,message:'শুধু Super Admin চলমান নিউজ পরিবর্তন করতে পারবেন।'}; text=String(text||'').trim(); if(!text)return {ok:false,message:'নিউজ লিখুন।'}; const sh=SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.CONFIG), v=sh.getDataRange().getValues(), idx=v.findIndex((r,i)=>i>0&&String(r[0])==='RUNNING_NEWS'); if(idx<1) sh.appendRow(['RUNNING_NEWS',text,now_()]); else {sh.getRange(idx+1,2).setValue(text);sh.getRange(idx+1,3).setValue(now_());} log_(sessionUser_(token),'update','RUNNING_NEWS',text); return {ok:true,message:'চলমান নিউজ আপডেট হয়েছে।'}; }
function getPublicConfig() {
  return {ok:true,institution:APP,classes:getClasses_(),signals:getSignals_(),runningNews:getRunningNews_()};
}

/* ---------- helpers ---------- */

function ensureSheet_(ss,name,headers) {
  let sh=ss.getSheetByName(name);
  if(!sh) sh=ss.insertSheet(name);
  if(sh.getLastRow()===0){ sh.getRange(1,1,1,headers.length).setValues([headers]); }
  else {
    const last=Math.max(1,sh.getLastColumn());
    const existing=sh.getRange(1,1,1,last).getValues()[0].map(x=>String(x).trim());
    headers.forEach(h=>{
      if(existing.indexOf(h)<0){
        const col=sh.getLastColumn()+1;
        sh.getRange(1,col).setValue(h);
        existing.push(h);
      }
    });
  }
  sh.setFrozenRows(1);
  return sh;
}

function append_(name,row){ SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name).appendRow(row); }
function now_(){ return Utilities.formatDate(new Date(),APP.timezone,'yyyy-MM-dd HH:mm:ss'); }
function generateOtp_(){ return String(Math.floor(100000+Math.random()*900000)); }
function hash_(s){ return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,String(s),Utilities.Charset.UTF_8).map(b=>('0'+(b&255).toString(16)).slice(-2)).join(''); }
function maskEmail_(e){ const p=String(e).split('@'); return p.length<2?'':p[0].slice(0,2)+'***@'+p[1]; }
function sendOtpEmail_(to,otp,user){ MailApp.sendEmail(to,'Login OTP | Jannatul Baqi Digital Platform','Your login OTP is: '+otp+'\nUser: '+user+'\nValid for '+APP.otpMinutes+' minutes.'); }
function findAdminLogin_(username){
  const sh=SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.ADMINS);
  if(!sh || sh.getLastRow()<2) return null;
  const v=sh.getDataRange().getValues(), h=v[0].map(x=>String(x).trim());
  const idx={}; h.forEach((x,i)=>idx[x.toLowerCase().replace(/[^a-z0-9]/g,'')]=i);
  const ui=idx.username;
  const pi=idx.passwordhash || idx.password_hash;
  const si=idx.status;
  const ei=idx.email;
  if(ui==null || pi==null) return null;
  for(let i=1;i<v.length;i++){
    if(String(v[i][ui]).trim().toLowerCase()===String(username).trim().toLowerCase()){
      return {
        status: si==null?'ACTIVE':String(v[i][si]||'ACTIVE'),
        passwordHash:String(v[i][pi]||''),
        email: ei==null?'':String(v[i][ei]||'')
      };
    }
  }
  return null;
}

function findBy_(sheet,key,value){
  const sh=SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheet); if(!sh||sh.getLastRow()<2)return null;
  const v=sh.getDataRange().getValues(), h=v[0], j=h.indexOf(key); if(j<0)return null;
  for(let i=1;i<v.length;i++) if(String(v[i][j]).trim()===String(value).trim()) return objectFrom_(h,v[i]);
  return null;
}
function listRows_(sheet,token,limit){
  if(token) auth_(token);
  const sh=SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheet); if(!sh||sh.getLastRow()<2)return [];
  const v=sh.getDataRange().getValues(), h=v[0];
  return v.slice(1,Math.min(v.length,(limit||1000)+1)).map(r=>objectFrom_(h,r));
}
function objectFrom_(h,r){ const o={}; h.forEach((x,i)=>o[x]=r[i] instanceof Date?Utilities.formatDate(r[i],APP.timezone,'yyyy-MM-dd HH:mm:ss'):r[i]); return o; }
function nextSerial_(sh){ return Math.max(0,sh.getLastRow()); }
function countData_(s){ const sh=SpreadsheetApp.getActiveSpreadsheet().getSheetByName(s); return sh?Math.max(0,sh.getLastRow()-1):0; }
function sumCol_(s,key){ const sh=SpreadsheetApp.getActiveSpreadsheet().getSheetByName(s); if(!sh||sh.getLastRow()<2)return 0; const h=sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0],j=h.indexOf(key); if(j<0)return 0; return sh.getRange(2,j+1,sh.getLastRow()-1,1).getValues().reduce((a,r)=>a+(Number(r[0])||0),0); }
function countMadrasa_(g){ const sh=SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.MADRASAS); if(!sh||sh.getLastRow()<2)return 0; return sh.getRange(2,3,sh.getLastRow()-1,1).getValues().filter(r=>String(r[0])===g).length; }
function attendanceToday_(){ const sh=SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.ATTENDANCE); if(!sh||sh.getLastRow()<2)return {present:0,absent:0}; const h=sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0],d=h.indexOf('Date'),s=h.indexOf('Status'),today=Utilities.formatDate(new Date(),APP.timezone,'yyyy-MM-dd'); let p=0,a=0; sh.getDataRange().getValues().slice(1).forEach(r=>{if(String(r[d]).slice(0,10)===today){if(String(r[s]).toLowerCase().includes('present'))p++;if(String(r[s]).toLowerCase().includes('absent'))a++;}}); return {present:p,absent:a};}
function auth_(token){ const raw=CacheService.getScriptCache().get('SESSION:'+token); if(!raw)throw new Error('SESSION_EXPIRED'); return JSON.parse(raw); }
function sessionUser_(token){ return auth_(token).username; }
function getAdminSafe_(u){ const x=findBy_(SHEETS.ADMINS,'Username',u)||{}; delete x.PasswordHash; return x; }
function log_(u,a,t,d){ const sh=SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.AUDIT); if(sh)sh.appendRow([nextSerial_(sh),now_(),u,a,t,d]); }

function getClasses_(){
  return ['প্লে শ্রেনি','শিশু শ্রেনি','আউয়াল জামাত','ছানী জামাত','ছালেছ জামাত','রাবে জামাত','পঞ্চম জামাত','মিজান জামাত','নাহবেমীর জামাত','কুদুরী জামাত','শরহে বেকায়া জামাত','হেদায়া জামাত','মিশকাত জামাত','দাওরায়ে হাদিস (মাস্টার্স-তাকমিল)'];
}
function getSignals_(){
  return [
    ['std','ছাত্র/ছাত্রী প্রোফাইল'],['thr','শিক্ষক/শিক্ষিকা'],['olp','অনলাইন পেমেন্ট'],['mrs','মার্কশিট'],['rjt','রেজাল্ট'],
    ['adm','নতুন অ্যাডমিন তালিকা'],['npn','নতুন পরীক্ষার্থী নিবন্ধন'],['npt','নিবন্ধনকৃত পুরুষ মাদ্রাসা'],
    ['nmt','নিবন্ধনকৃত মহিলা মাদ্রাসা'],['ofd','অনলাইন/মোবাইল ফলাফল'],['cft','সার্টিফিকেট/সনদপত্র'],
    ['idc','আইডি কার্ড'],['adc','এডমিট কার্ড'],['rct','রিসিট'],['tcp','টিসি/ছাড়পত্র'],['sjs','শ্রেনি/ক্লাশ-জামাত']
  ];
}
function getModules_(){
  return [
    ['institution','প্রতিষ্ঠান পরিচিতি'],['student','ছাত্র/ছাত্রী অ্যাড করুন'],['teacher','শিক্ষক/শিক্ষিকা অ্যাড করুন'],['donor','দাতা সদস্য অ্যাড করুন'],
    ['exam','পরীক্ষার্থী নিবন্ধন করুন'],['fees','বেতন-ফি আদায়'],['salary','বেতন প্রদান'],['notice','অল নোটিশ'],['report','অল রিপোর্ট'],
    ['finance','আয়+ব্যয়'],['marks','মার্কশিট'],['idcard','আইডি কার্ড'],['admit','অ্যাডমিট কার্ড'],['entry','প্রবেশ পত্র'],
    ['result','রেজাল্ট কার্ড'],['contact','কন্টাক্ট ম্যানেজ'],['tc','টিসি/ছাড়পত্র'],['admin','নতুন অ্যাডমিন একাউন্ট'],
    ['madrasa','নতুন মাদ্রাসা নিবন্ধন'],['admission','অনলাইন ভর্তি'],['payment','অনলাইন পেমেন্ট'],['attendance','ডিজিটাল হাজিরা'],
    ['gallery','ফটো গ্যালারি'],['files','অল ডকুমেন্টস/ফাইল'],['excel','Excel শীট'],['sms','SMS পোর্টাল'],
    ['students','ছাত্র/ছাত্রী তালিকা'],['teachers','শিক্ষক/শিক্ষিকা তালিকা'],['exams','পরীক্ষার্থী তালিকা'],['admins','অ্যাডমিন তালিকা'],['madrasas','নতুন নিবন্ধনকৃত মাদ্রাসার তালিকা'],['certificate','সার্টিফিকেট'],
    ['receipt','মানিরিসিট'],['accountControl','অনুমোদন + ফিচার পারমিশন'],['maleMadrasa','নিবন্ধনকৃত পুরুষ মাদ্রাসা'],['femaleMadrasa','নিবন্ধনকৃত মহিলা মাদ্রাসা'],['help','পরামর্শ+যোগ+অভিযোগ']
  ];
}