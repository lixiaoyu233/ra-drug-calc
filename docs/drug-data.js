const drugDB = {
  '甲氨蝶呤':{cat:'csDMARDs',spec:'2.5mg',unit:'片',freq:'QW',dose:'4',note:'常用剂量 7.5-15mg/周（3-6片/周），每周固定一天服用'},
  '来氟米特':{cat:'csDMARDs',spec:'10mg',unit:'片',freq:'QD',dose:'1',note:'常用剂量 10-20mg/日（1-2片/日）'},
  '羟氯喹':{cat:'csDMARDs',spec:'0.1g',unit:'片',freq:'QD',dose:'2',note:'常用剂量 0.2-0.4g/日（2-4片/日）'},
  '艾拉莫德':{cat:'csDMARDs',spec:'25mg',unit:'片',freq:'BID',dose:'1',note:'常用剂量 25mg/次 BID（1片/次，每日2次）'},
  '柳氮磺胺嘧啶':{cat:'csDMARDs',spec:'0.25g',unit:'片',freq:'BID',dose:'2',note:'常用剂量 0.5-0.75g/次 BID/TID（2-3片/次），建议饭后服用'},
  '托法替布':{cat:'tsDMARDs',spec:'5mg',unit:'片',freq:'BID',dose:'1',note:'常用剂量 5mg/次 BID（每日2次，每次1片）'},
  '巴瑞替尼':{cat:'tsDMARDs',spec:'2mg',unit:'片',freq:'QD',dose:'1',note:'常用剂量 2-4mg/日 QD（每日1次，1-2片），老年人减量'},
  '乌帕替尼':{cat:'tsDMARDs',spec:'15mg',unit:'片',freq:'QD',dose:'1',note:'常用剂量 15mg/日 QD（每日1次，1片缓释片）'},
  '依那西普':{cat:'bDMARDs',spec:'25mg',unit:'支',freq:'BIW',dose:'1',note:'常用剂量 25mg/次 BIW（每周2次），皮下注射'},
  '益赛普/强克':{cat:'bDMARDs',spec:'25mg',unit:'支',freq:'BIW',dose:'1',note:'益赛普/强克 25mg/次 BIW（每周2次），皮下注射'},
  '英夫利西单抗':{cat:'bDMARDs',spec:'100mg',unit:'支',freq:'Q8W',dose:'3',note:'按体重3-5mg/kg，IV，第0/2/6周诱导，后Q8W维持'},
  '戈利木单抗':{cat:'bDMARDs',spec:'50mg',unit:'支',freq:'QM',dose:'1',note:'50mg/月 QM（每月1次），皮下注射'},
  '赛妥珠单抗':{cat:'bDMARDs',spec:'200mg',unit:'支',freq:'Q2W',dose:'1',note:'200mg/次 Q2W（每2周1次）或400mg/月，皮下注射'},
  '托珠单抗':{cat:'bDMARDs',spec:'162mg',unit:'支',freq:'QW',dose:'1',note:'162mg/次 QW（每周1次），皮下注射'},
  '阿巴西普':{cat:'bDMARDs',spec:'125mg',unit:'支',freq:'QW',dose:'1',note:'125mg/次 QW（每周1次），皮下注射'},
  '利妥昔单抗':{cat:'bDMARDs',spec:'100mg',unit:'支',freq:'Q6M',dose:'10',note:'1000mg IV ×2次（间隔2周），每6-12月重复'}
}
const catOrder=['csDMARDs','tsDMARDs','bDMARDs']
const catLabel={'csDMARDs':'csDMARDs（传统合成）','tsDMARDs':'tsDMARDs（靶向合成）','bDMARDs':'bDMARDs（生物制剂）'}
const freqOpts=[
  {val:'QD',label:'QD（每日1次）'},{val:'BID',label:'BID（每日2次）'},{val:'TID',label:'TID（每日3次）'},
  {val:'QW',label:'QW（每周1次）'},{val:'BIW',label:'BIW（每周2次）'},{val:'Q2W',label:'Q2W（每2周1次）'},
  {val:'QOD',label:'QOD（隔日1次）'},{val:'QM',label:'QM（每月1次）'},{val:'Q8W',label:'Q8W（每8周1次）'},{val:'Q6M',label:'Q6M（每6月1次）'}
]
const freqTimes={QD:1,BID:2,TID:3,QW:1/7,BIW:2/7,Q2W:1/14,QOD:.5,QM:1/30,Q8W:1/56,Q6M:1/182.5}

function parseDate(s){if(!s)return new Date();const p=s.split('-');return new Date(+p[0],+p[1]-1,+p[2])}
function fmtDate(d){const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),dd=String(d.getDate()).padStart(2,'0');return y+'-'+m+'-'+dd}
function addDays(d,n){const r=new Date(d);r.setDate(r.getDate()+n);return r}
function diffDays(a,b){const t1=new Date(a.getFullYear(),a.getMonth(),a.getDate()),t2=new Date(b.getFullYear(),b.getMonth(),b.getDate());return Math.round((t2-t1)/864e5)}
function todayStr(){return fmtDate(new Date())}

function batchDays(f){return{QW:7,BIW:7,Q2W:14,QM:30,Q8W:56,Q6M:182.5}[f]||0}
function batchPills(f,d){return f==='QW'?+d:f==='BIW'?+d*2:0}
function calcSupply(qty,dose,freq){
  const bd=batchDays(freq)
  if(bd){const pb=batchPills(freq,dose)||+dose;const fb=Math.floor(+qty/pb);return{ds:fb*bd,dd:pb/bd}}
  const dd=+dose*freqTimes[freq];return{ds:Math.floor(+qty/dd),dd}
}

function calcPillsNeeded(targetRemain,freqVal,dosePerTime,dailyDose){
  const bd=batchDays(freqVal)
  if(bd){const pb=batchPills(freqVal,+dosePerTime)||+dosePerTime;return Math.ceil(targetRemain/bd)*pb}
  return Math.ceil(dailyDose*targetRemain)
}

function calcRecordRemainingDays(prescList){
  if(!prescList||prescList.length===0)return-1
  const sorted=[...prescList].sort((a,b)=>a.prescDate.localeCompare(b.prescDate))
  let p=+sorted[0].totalQty,d=sorted[0].dailyDose,l=parseDate(sorted[0].prescDate)
  for(let i=1;i<sorted.length;i++){
    const c=parseDate(sorted[i].prescDate),e=diffDays(l,c),n=e*d
    if(n>p){p=0}else{p-=n}
    p+=+sorted[i].totalQty;d=sorted[i].dailyDose;l=c
  }
  return Math.max(0,Math.floor(p/d))
}
