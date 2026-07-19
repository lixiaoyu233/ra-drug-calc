const util = require('../../utils/date')
const pinyinPro = require('../../utils/pinyin-pro')

const drugDB = {
  '甲氨蝶呤': { cat: 'csDMARDs', spec: '2.5mg', unit: '片', freq: 'QW', dose: '4', note: '常用剂量 7.5-15mg/周（3-6片/周），每周固定一天服用' },
  '来氟米特': { cat: 'csDMARDs', spec: '10mg', unit: '片', freq: 'QD', dose: '1', note: '常用剂量 10-20mg/日（1-2片/日）' },
  '羟氯喹': { cat: 'csDMARDs', spec: '0.1g', unit: '片', freq: 'QD', dose: '2', note: '常用剂量 0.2-0.4g/日（2-4片/日）' },
  '艾拉莫德': { cat: 'csDMARDs', spec: '25mg', unit: '片', freq: 'BID', dose: '1', note: '常用剂量 25mg/次 BID（1片/次，每日2次）' },
  '柳氮磺胺嘧啶': { cat: 'csDMARDs', spec: '0.25g', unit: '片', freq: 'BID', dose: '2', note: '常用剂量 0.5-0.75g/次 BID/TID（2-3片/次），建议饭后服用' },
  '托法替布': { cat: 'tsDMARDs', spec: '5mg', unit: '片', freq: 'BID', dose: '1', note: '常用剂量 5mg/次 BID（每日2次，每次1片）' },
  '巴瑞替尼': { cat: 'tsDMARDs', spec: '2mg', unit: '片', freq: 'QD', dose: '1', note: '常用剂量 2-4mg/日 QD（每日1次，1-2片），老年人减量' },
  '乌帕替尼': { cat: 'tsDMARDs', spec: '15mg', unit: '片', freq: 'QD', dose: '1', note: '常用剂量 15mg/日 QD（每日1次，1片缓释片）' },
  '依那西普': { cat: 'bDMARDs', spec: '25mg', unit: '支', freq: 'BIW', dose: '1', note: '常用剂量 25mg/次 BIW（每周2次），皮下注射' },
  '益赛普/强克': { cat: 'bDMARDs', spec: '25mg', unit: '支', freq: 'BIW', dose: '1', note: '益赛普/强克 25mg/次 BIW（每周2次），皮下注射' },
  '英夫利西单抗': { cat: 'bDMARDs', spec: '100mg', unit: '支', freq: 'Q8W', dose: '3', note: '按体重3-5mg/kg，IV，第0/2/6周诱导，后Q8W维持' },
  '戈利木单抗': { cat: 'bDMARDs', spec: '50mg', unit: '支', freq: 'QM', dose: '1', note: '50mg/月 QM（每月1次），皮下注射' },
  '赛妥珠单抗': { cat: 'bDMARDs', spec: '200mg', unit: '支', freq: 'Q2W', dose: '1', note: '200mg/次 Q2W（每2周1次）或400mg/月，皮下注射' },
  '托珠单抗': { cat: 'bDMARDs', spec: '162mg', unit: '支', freq: 'QW', dose: '1', note: '162mg/次 QW（每周1次），皮下注射' },
  '阿巴西普': { cat: 'bDMARDs', spec: '125mg', unit: '支', freq: 'QW', dose: '1', note: '125mg/次 QW（每周1次），皮下注射' },
  '利妥昔单抗': { cat: 'bDMARDs', spec: '100mg', unit: '支', freq: 'Q6M', dose: '10', note: '1000mg IV ×2次（间隔2周），每6-12月重复' }
}

const catOrder = ['csDMARDs', 'tsDMARDs', 'bDMARDs']
const catLabel = { csDMARDs: 'csDMARDs（传统合成）', tsDMARDs: 'tsDMARDs（靶向合成）', bDMARDs: 'bDMARDs（生物制剂）' }

const freqOptions = [
  { val: 'QD', label: 'QD（每日1次）' },
  { val: 'BID', label: 'BID（每日2次）' },
  { val: 'TID', label: 'TID（每日3次）' },
  { val: 'QW', label: 'QW（每周1次）' },
  { val: 'BIW', label: 'BIW（每周2次）' },
  { val: 'Q2W', label: 'Q2W（每2周1次）' },
  { val: 'QOD', label: 'QOD（隔日1次）' },
  { val: 'QM', label: 'QM（每月1次）' },
  { val: 'Q8W', label: 'Q8W（每8周1次）' },
  { val: 'Q6M', label: 'Q6M（每6月1次）' }
]

const freqTimes = { QD: 1, BID: 2, TID: 3, QW: 1 / 7, BIW: 2 / 7, Q2W: 1 / 14, QOD: 0.5, QM: 1 / 30, Q8W: 1 / 56, Q6M: 1 / 182.5 }

function getBatchDays(freqVal) {
  return { QW: 7, BIW: 7, Q2W: 14, QM: 30, Q8W: 56, Q6M: 182.5 }[freqVal] || 0
}

function getBatchPills(freqVal, dosePerTime) {
  if (freqVal === 'QW') return dosePerTime
  if (freqVal === 'BIW') return dosePerTime * 2
  return 0
}

function calcSupply(totalQty, dosePerTime, freqVal) {
  const batchDays = getBatchDays(freqVal)
  if (batchDays) {
    const pillsPerBatch = getBatchPills(freqVal, dosePerTime) || dosePerTime
    const fullBatches = Math.floor(parseFloat(totalQty) / pillsPerBatch)
    return { daysSupply: fullBatches * batchDays, dailyDose: pillsPerBatch / batchDays }
  }
  const dailyDose = parseFloat(dosePerTime) * freqTimes[freqVal]
  return { daysSupply: Math.floor(parseFloat(totalQty) / dailyDose), dailyDose }
}

Page({
  data: {
    activeTab: 0,

    catList: catOrder.map(c => catLabel[c]),
    drugByCat: {},
    multiArray: [[], []],
    multiIndex: [0, 0],

    medName: '',
    drugUnit: '片',
    drugNote: '',

    prescDate: '',
    dosePerTime: '',
    freqVal: 'QD',
    freqLabel: 'QD（每日1次）',
    freqPickerIdx: 0,
    totalQty: '',

    freqOptions: freqOptions.map(f => f.label),

    showForm: false,

    prescList: [],
    idCounter: 0,
    gapResult: null,

    weekDays: ['日', '一', '二', '三', '四', '五', '六'],
    calTarget: 'prescDate',
    calYear: 2026, calMonth: 7, calDayRows: [], calShow: false,

    date1: '', date2: '',
    date1CalShow: false, date2CalShow: false, dateDiff: '', dateDiffA: '', dateDiffB: '',
    calcDate: '', calcOffset: '', calcUnit: '天',
    calcDirection: '往后', calcResult: '', calcDateCalShow: false,

    iconPillActive: "data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjIgMjIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDA3QUZGIiBzdHJva2Utd2lkdGg9IjEuOCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cmVjdCB4PSI3IiB5PSI2IiB3aWR0aD0iOCIgaGVpZ2h0PSIxMiIgcng9IjIiLz48cmVjdCB4PSI5IiB5PSIzIiB3aWR0aD0iNCIgaGVpZ2h0PSIzIiByeD0iLjUiLz48L3N2Zz4=",
    iconPillInactive: "data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjIgMjIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjODY4NjhiIiBzdHJva2Utd2lkdGg9IjEuOCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cmVjdCB4PSI3IiB5PSI2IiB3aWR0aD0iOCIgaGVpZ2h0PSIxMiIgcng9IjIiLz48cmVjdCB4PSI5IiB5PSIzIiB3aWR0aD0iNCIgaGVpZ2h0PSIzIiByeD0iLjUiLz48L3N2Zz4=",
    iconCalActive: "data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjIgMjIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDA3QUZGIiBzdHJva2Utd2lkdGg9IjEuOCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cmVjdCB4PSIzIiB5PSI1IiB3aWR0aD0iMTYiIGhlaWdodD0iMTQiIHJ4PSIyIi8+PHBhdGggZD0iTTcgMnY0TTE1IDJ2NE0zIDloMTYiLz48L3N2Zz4=",
    iconCalInactive: "data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjIgMjIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjODY4NjhiIiBzdHJva2Utd2lkdGg9IjEuOCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cmVjdCB4PSIzIiB5PSI1IiB3aWR0aD0iMTYiIGhlaWdodD0iMTQiIHJ4PSIyIi8+PHBhdGggZD0iTTcgMnY0TTE1IDJ2NE0zIDloMTYiLz48L3N2Zz4=",
    iconListActive: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMiAyMiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDA3QUZGIiBzdHJva2Utd2lkdGg9IjEuOCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIj48bGluZSB4MT0iNCIgeTE9IjYiIHgyPSIxOCIgeTI9IjYiLz48bGluZSB4MT0iNCIgeTE9IjExIiB4Mj0iMTgiIHkyPSIxMSIvPjxsaW5lIHgxPSI0IiB5MT0iMTYiIHgyPSIxOCIgeTI9IjE2Ii8+PC9zdmc+",
    iconListInactive: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMiAyMiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjODY4NjhiIiBzdHJva2Utd2lkdGg9IjEuOCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIj48bGluZSB4MT0iNCIgeTE9IjYiIHgyPSIxOCIgeTI9IjYiLz48bGluZSB4MT0iNCIgeTE9IjExIiB4Mj0iMTgiIHkyPSIxMSIvPjxsaW5lIHgxPSI0IiB5MT0iMTYiIHgyPSIxOCIgeTI9IjE2Ii8+PC9zdmc+",

    // Dark mode icon variants
    iconPillActiveDark: "data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjIgMjIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMEE4NEZGIiBzdHJva2Utd2lkdGg9IjEuOCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cmVjdCB4PSI3IiB5PSI2IiB3aWR0aD0iOCIgaGVpZ2h0PSIxMiIgcng9IjIiLz48cmVjdCB4PSI5IiB5PSIzIiB3aWR0aD0iNCIgaGVpZ2h0PSIzIiByeD0iLjUiLz48L3N2Zz4=",
    iconPillInactiveDark: "data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjIgMjIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjOTg5ODlEIiBzdHJva2Utd2lkdGg9IjEuOCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cmVjdCB4PSI3IiB5PSI2IiB3aWR0aD0iOCIgaGVpZ2h0PSIxMiIgcng9IjIiLz48cmVjdCB4PSI5IiB5PSIzIiB3aWR0aD0iNCIgaGVpZ2h0PSIzIiByeD0iLjUiLz48L3N2Zz4=",
    iconCalActiveDark: "data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjIgMjIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMEE4NEZGIiBzdHJva2Utd2lkdGg9IjEuOCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cmVjdCB4PSIzIiB5PSI1IiB3aWR0aD0iMTYiIGhlaWdodD0iMTQiIHJ4PSIyIi8+PHBhdGggZD0iTTcgMnY0TTE1IDJ2NE0zIDloMTYiLz48L3N2Zz4=",
    iconCalInactiveDark: "data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjIgMjIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjOTg5ODlEIiBzdHJva2Utd2lkdGg9IjEuOCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cmVjdCB4PSIzIiB5PSI1IiB3aWR0aD0iMTYiIGhlaWdodD0iMTQiIHJ4PSIyIi8+PHBhdGggZD0iTTcgMnY0TTE1IDJ2NE0zIDloMTYiLz48L3N2Zz4=",
    iconListActiveDark: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMiAyMiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMEE4NEZGIiBzdHJva2Utd2lkdGg9IjEuOCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIj48bGluZSB4MT0iNCIgeTE9IjYiIHgyPSIxOCIgeTI9IjYiLz48bGluZSB4MT0iNCIgeTE9IjExIiB4Mj0iMTgiIHkyPSIxMSIvPjxsaW5lIHgxPSI0IiB5MT0iMTYiIHgyPSIxOCIgeTI9IjE2Ii8+PC9zdmc+",
    iconListInactiveDark: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMiAyMiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjOTg5ODlEIiBzdHJva2Utd2lkdGg9IjEuOCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIj48bGluZSB4MT0iNCIgeTE9IjYiIHgyPSIxOCIgeTI9IjYiLz48bGluZSB4MT0iNCIgeTE9IjExIiB4Mj0iMTgiIHkyPSIxMSIvPjxsaW5lIHgxPSI0IiB5MT0iMTYiIHgyPSIxOCIgeTI9IjE2Ii8+PC9zdmc+",

    isDark: false,

    savedRecords: [],
    editRecordId: null,
    showSaveDialog: false,
    saveAbbr: '',
    saveAbbrError: '',
  },

  onLoad() {
    const today = new Date()
    const todayStr = util.formatDate(today)
    const y = today.getFullYear()
    const m = today.getMonth() + 1
    this.setData({
      prescDate: todayStr,
      date1: todayStr, date2: todayStr, calcDate: todayStr,
      date1Year: y, date1Month: m,
      date2Year: y, date2Month: m,
      calcDateYear: y, calcDateMonth: m
    })
    this.buildCalendar(y, m, 'cal')
    this.initDrugPicker()
    this.loadRecords()
    this.checkTheme()
  },

  checkTheme() {
    try {
      const sys = wx.getSystemInfoSync()
      this.setData({ isDark: sys.theme === 'dark' })
    } catch(e) {}
  },

  onShow() {
    this.loadRecords()
    this.checkTheme()
  },

  initDrugPicker() {
    const drugByCat = {}
    for (const [name, info] of Object.entries(drugDB)) {
      if (!drugByCat[info.cat]) drugByCat[info.cat] = []
      drugByCat[info.cat].push(name)
    }
    const firstCat = catOrder[0]
    this.setData({
      drugByCat,
      multiArray: [catOrder.map(c => catLabel[c]), drugByCat[firstCat] || []],
      multiIndex: [0, 0]
    })
  },

  switchTab(e) {
    this.setData({
      activeTab: parseInt(e.currentTarget.dataset.index),
      calShow: false,
      date1CalShow: false, date2CalShow: false, calcDateCalShow: false
    })
  },

  bindDrugPicker(e) {
    const vals = e.detail.value
    const catIdx = vals[0]
    const drugIdx = vals[1]
    const cat = catOrder[catIdx]
    const drugs = this.data.drugByCat[cat]
    if (!drugs || !drugs[drugIdx]) return
    const drug = drugs[drugIdx]
    const info = drugDB[drug]

    const hasDiffDrug = this.data.prescList.some(p => p.medName !== drug)
    let clearMsg = ''
    let newList = this.data.prescList
    let newIdCounter = this.data.idCounter
    if (hasDiffDrug && newList.length > 0) {
      newList = []
      newIdCounter = 0
      clearMsg = '已切换药物，处方列表已清空'
    }

    let freqIdx = freqOptions.findIndex(f => f.val === info.freq)
    if (freqIdx < 0) freqIdx = 0
    this.setData({
      multiIndex: vals,
      medName: drug,
      drugUnit: info.unit,
      drugNote: info.note,
      dosePerTime: info.dose,
      freqVal: info.freq,
      freqLabel: freqOptions[freqIdx].label,
      freqPickerIdx: freqIdx,
      showForm: true,
      prescList: newList,
      idCounter: newIdCounter,
      gapResult: null,
      showResult: false
    })
    if (clearMsg) wx.showToast({ title: clearMsg, icon: 'none' })
  },

  bindCategoryChange(e) {
    const col = e.detail.column
    const row = e.detail.value
    if (col === 0) {
      const cat = catOrder[row]
      const drugs = this.data.drugByCat[cat] || []
      this.setData({
        multiArray: [catOrder.map(c => catLabel[c]), drugs],
        multiIndex: [row, 0]
      })
    }
  },

  bindFreqPicker(e) {
    const idx = parseInt(e.detail.value)
    const opt = freqOptions[idx]
    this.setData({ freqPickerIdx: idx, freqVal: opt.val, freqLabel: opt.label })
  },

  bindDate(e) {
    this.setData({ [e.currentTarget.dataset.field]: e.detail.value })
  },

  bindInput(e) {
    this.setData({ [e.currentTarget.dataset.field]: e.detail.value })
  },

  /* ====== Calendar ====== */
  buildCalendar(year, month, target) {
    const firstDay = util.getFirstDayOfMonth(year, month)
    const daysInMonth = util.getMonthDays(year, month)
    const today = util.formatDate(new Date())
    const rows = []
    let row = []
    for (let i = 0; i < firstDay; i++) row.push({ day: 0, fill: true })
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      const selKey = target === 'cal' ? 'calSelDate' : target + 'Sel'
      row.push({ day: d, fill: false, isToday: dateStr === today, isSelected: this.data[selKey] === dateStr })
      if (row.length === 7) { rows.push(row); row = [] }
    }
    if (row.length > 0) { while (row.length < 7) { row.push({ day: 0, fill: true }) }; rows.push(row) }
    const key = target === 'cal' ? 'calDayRows' : target + 'DayRows'
    const yk = target === 'cal' ? 'calYear' : target + 'Year'
    const mk = target === 'cal' ? 'calMonth' : target + 'Month'
    this.setData({ [key]: rows, [yk]: year, [mk]: month })
  },

  calPrevMonth(e) { this.navCal(e, -1, 0) },
  calNextMonth(e) { this.navCal(e, 1, 0) },
  calPrevYear(e) { this.navCal(e, 0, -1) },
  calNextYear(e) { this.navCal(e, 0, 1) },

  navCal(e, mDelta, yDelta) {
    const t = e.currentTarget.dataset.target
    const yk = t === 'cal' ? 'calYear' : t + 'Year'
    const mk = t === 'cal' ? 'calMonth' : t + 'Month'
    let y = this.data[yk], m = this.data[mk]
    m += mDelta; y += yDelta
    if (m < 1) { m = 12; y-- }
    if (m > 12) { m = 1; y++ }
    this.buildCalendar(y, m, t)
  },

  calSelectDate(e) {
    const t = e.currentTarget.dataset.target
    const day = parseInt(e.currentTarget.dataset.day)
    const y = this.data[t === 'cal' ? 'calYear' : t + 'Year']
    const m = this.data[t === 'cal' ? 'calMonth' : t + 'Month']
    const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    if (t === 'cal') {
      this.setData({ [this.data.calTarget]: dateStr, calSelDate: dateStr, calShow: false })
    } else if (t === 'date1') { this.setData({ date1: dateStr, date1CalShow: false })
    } else if (t === 'date2') { this.setData({ date2: dateStr, date2CalShow: false })
    } else if (t === 'calcDate') { this.setData({ calcDate: dateStr, calcDateCalShow: false }) }
  },

  toggleCal(e) {
    const f = e.currentTarget.dataset.field
    let calShowKey, year, month
    const calFields = {
      prescDate: ['calShow', 'calYear', 'calMonth'],
      date1: ['date1CalShow', 'date1Year', 'date1Month'],
      date2: ['date2CalShow', 'date2Year', 'date2Month'],
      calcDate: ['calcDateCalShow', 'calcDateYear', 'calcDateMonth']
    }
    const cf = calFields[f]
    if (!cf) return
    calShowKey = cf[0]
    const show = !this.data[calShowKey]
    const updates = { [calShowKey]: show, calTarget: f }
    if (show) {
      const d = this.data[f] ? util.parseDate(this.data[f]) : new Date()
      const y = d.getFullYear(), m = d.getMonth() + 1
      const targetMap = { prescDate: 'cal', date1: 'date1', date2: 'date2', calcDate: 'calcDate' }
      const target = targetMap[f]
      this.buildCalendar(y, m, target)
      if (target === 'cal') { updates.calYear = y; updates.calMonth = m; updates.calSelDate = this.data[f] }
      else { updates[target + 'Year'] = y; updates[target + 'Month'] = m; updates[target + 'Sel'] = this.data[f] }
    }
    this.setData(updates)
  },

  /* ====== Prescription List ====== */
  addPrescription() {
    const d = this.data
    if (!d.medName || !d.dosePerTime || !d.totalQty) {
      wx.showToast({ title: '请先选择药物并填写信息', icon: 'none' }); return
    }
    const doseVal = parseFloat(d.dosePerTime)
    const total = parseFloat(d.totalQty)
    if (isNaN(doseVal) || doseVal <= 0) {
      wx.showToast({ title: '每次用量请输入有效数字', icon: 'none' }); return
    }
    if (isNaN(total) || total <= 0) {
      wx.showToast({ title: '总量请输入有效数字', icon: 'none' }); return
    }
    const prescDate = d.prescDate || util.formatDate(new Date())
    const { daysSupply, dailyDose } = calcSupply(total, d.dosePerTime, d.freqVal)
    if (daysSupply <= 0) { wx.showToast({ title: '药量不足以服用1天', icon: 'none' }); return }
    const start = util.parseDate(prescDate)
    const end = util.addDays(start, daysSupply - 1)
    const id = d.idCounter + 1
    const entry = { id, medName: d.medName, prescDate, dosePerTime: d.dosePerTime, unit: d.drugUnit, freqLabel: d.freqLabel, totalQty: d.totalQty, dailyDose, daysSupply, endDate: util.formatDate(end) }
    this.setData({ prescList: [...d.prescList, entry], idCounter: id, gapResult: null })
    wx.showToast({ title: '已添加第 ' + (d.prescList.length + 1) + ' 次处方', icon: 'success' })
  },

  removePrescription(e) {
    const list = this.data.prescList.filter(p => p.id !== parseInt(e.currentTarget.dataset.id))
    this.setData({ prescList: list, gapResult: null })
  },

  clearList() { this.setData({ prescList: [], idCounter: 0, gapResult: null }) },

  analyzeGaps() {
    const list = this.data.prescList
    if (list.length < 2) { wx.showToast({ title: '请至少添加 2 次处方', icon: 'none' }); return }
    const sorted = [...list].sort((a, b) => a.prescDate.localeCompare(b.prescDate))

    let remainPills = parseFloat(sorted[0].totalQty)
    let currentDose = sorted[0].dailyDose
    let lastDate = util.parseDate(sorted[0].prescDate)
    const gaps = []
    let totalGapDays = 0

    const entries = []
    const firstCumEndStr = util.formatDate(util.addDays(lastDate, Math.floor(remainPills / currentDose) - 1))
    entries.push({ ...sorted[0], cumEnd: firstCumEndStr, hasGapBefore: false, showCum: firstCumEndStr !== sorted[0].endDate })

    for (let i = 1; i < sorted.length; i++) {
      const p = sorted[i]
      const currDate = util.parseDate(p.prescDate)
      const daysElapsed = util.diffDays(lastDate, currDate)
      const needed = daysElapsed * currentDose
      let hasGap = false

      if (needed > remainPills) {
        const shortPills = needed - remainPills
        const gapDays = Math.ceil(shortPills / currentDose)
        totalGapDays += gapDays
        const ranOut = util.addDays(lastDate, Math.floor(remainPills / currentDose) - 1)
        gaps.push({
          index: i, fromDate: util.formatDate(ranOut), toDate: p.prescDate,
          gapDays: gapDays,
          fromLabel: `药吃完（${util.formatDate(ranOut)}）`,
          toLabel: `下次开药（${p.prescDate}）`
        })
        remainPills = 0
        hasGap = true
      } else {
        remainPills -= needed
      }

      remainPills += parseFloat(p.totalQty)
      currentDose = p.dailyDose
      lastDate = currDate

      const cumEndDate = util.addDays(lastDate, Math.floor(remainPills / currentDose) - 1)
      const cumEndStr = util.formatDate(cumEndDate)
      entries.push({ ...p, cumEnd: cumEndStr, hasGapBefore: hasGap, showCum: cumEndStr !== p.endDate })
    }

    const finalDate = entries[entries.length - 1].cumEnd
    const finalEnd = util.parseDate(finalDate)

    const gapIdxs = new Set(gaps.map(g => g.index))
    let contStart = entries[0].prescDate
    for (const e of entries) {
      if (e.hasGapBefore) contStart = e.prescDate
    }
    const todayDate = new Date()
    const contTotalDays = Math.max(0, util.diffDays(util.parseDate(contStart), todayDate))
    const contMonths = Math.floor(contTotalDays / 30)
    const contDays = contTotalDays % 30
    const targetDays = 90
    const targetRemain = Math.max(0, targetDays - contTotalDays)
    const contMet = contTotalDays >= targetDays

    const latest = sorted[sorted.length - 1]
    const suggestDate = util.addDays(finalEnd, -7)
    const suggestStr = util.formatDate(suggestDate)
    const todayStr = util.formatDate(new Date())
    const remainingDays = util.diffDays(new Date(), finalEnd)
    const refillUrgent = suggestStr <= todayStr
    const pillsNeeded = contMet ? 0 : this.calcPillsNeeded(targetRemain, latest.freqVal, latest.dosePerTime, latest.dailyDose)
    this.setData({
      gapResult: {
        gaps, totalGapDays, sorted: entries, count: list.length,
        finalCoverageEnd: finalDate,
        suggestRefillBy: suggestStr, remainingDays, refillUrgent,
        today: todayStr,
        latestDose: `${latest.dosePerTime}${latest.unit}/次 ${latest.freqLabel}`,
        contMonths, contDays, contStart, contMet, targetRemain,
        pillsNeeded, unit: latest.unit
      }
    })
  },

  /* ====== Records (Save/Load) ====== */
  STORAGE_KEY: 'calc_records',
  calcPillsNeeded(targetRemain, freqVal, dosePerTime, dailyDose) {
    const bd = getBatchDays(freqVal)
    if (bd) {
      const pb = getBatchPills(freqVal, +dosePerTime) || +dosePerTime
      return Math.ceil(targetRemain / bd) * pb
    }
    return Math.ceil(dailyDose * targetRemain)
  },

  loadRecords() {
    const raw = wx.getStorageSync(this.STORAGE_KEY) || []
    const now = new Date()
    const records = raw.map(r => {
      const det = this.calcRecordDetails(r.prescList)
      return {
        ...r,
        remainingDays: det.remainingDays,
        saveDateStr: util.formatDate(new Date(r.lastSaved)),
        endDate: det.endDate,
        contDays: det.contDays,
        contMet: det.contMet,
        targetRemain: det.targetRemain,
        pillsNeeded: det.pillsNeeded,
        unit: det.unit
      }
    })
    records.sort((a, b) => b.lastSaved - a.lastSaved)
    this.setData({ savedRecords: records })
  },

  calcRecordDetails(prescList) {
    if (!prescList || prescList.length === 0) return { remainingDays: -1 }
    const sorted = [...prescList].sort((a, b) => a.prescDate.localeCompare(b.prescDate))
    let remainPills = parseFloat(sorted[0].totalQty)
    let currentDose = sorted[0].dailyDose
    let lastDate = util.parseDate(sorted[0].prescDate)
    const entries = []
    const firstCumEndStr = util.formatDate(util.addDays(lastDate, Math.floor(remainPills / currentDose) - 1))
    entries.push({ prescDate: sorted[0].prescDate, cumEnd: firstCumEndStr, hasGapBefore: false })
    for (let i = 1; i < sorted.length; i++) {
      const p = sorted[i], cd = util.parseDate(p.prescDate), el = util.diffDays(lastDate, cd), need = el * currentDose
      let hasGap = false
      if (need > remainPills) { remainPills = 0; hasGap = true } else { remainPills -= need }
      remainPills += parseFloat(p.totalQty)
      currentDose = p.dailyDose; lastDate = cd
      const ce = util.formatDate(util.addDays(lastDate, Math.floor(remainPills / currentDose) - 1))
      entries.push({ prescDate: p.prescDate, cumEnd: ce, hasGapBefore: hasGap })
    }
    const finalDate = entries[entries.length - 1].cumEnd
    const finalEnd = util.parseDate(finalDate)
    const remainingDays = Math.max(0, util.diffDays(new Date(), finalEnd))
    let contStart = entries[0].prescDate
    for (const e of entries) { if (e.hasGapBefore) contStart = e.prescDate }
    const contTotalDays = Math.max(0, util.diffDays(util.parseDate(contStart), new Date()))
    const target = 90
    const targetRemain = Math.max(0, target - contTotalDays)
    const contMet = contTotalDays >= target
    const pillsNeeded = contMet ? 0 : this.calcPillsNeeded(targetRemain, sorted[sorted.length - 1].freqVal, sorted[sorted.length - 1].dosePerTime, currentDose)
    return { remainingDays, endDate: finalDate, contDays: contTotalDays, contMet, targetRemain, pillsNeeded, unit: sorted[sorted.length - 1]?.unit || '粒' }
  },

  showSaveDialog() {
    if (this.data.prescList.length === 0) { wx.showToast({ title: '暂无处方记录可保存', icon: 'none' }); return }
    const abbr = this.data.editRecordId
      ? (this.data.savedRecords.find(r => r.id === this.data.editRecordId)?.abbr || '')
      : ''
    this.setData({ showSaveDialog: true, saveAbbr: abbr, saveAbbrError: '' })
  },

  onSaveAbbrInput(e) {
    let v = e.detail.value || ''
    if (/[\u4e00-\u9fff]/.test(v)) {
      try {
        const arr = pinyinPro.pinyin(v, { toneType: 'none', type: 'array' })
        v = this.abbrFromPinyin(arr).slice(0, 4)
      } catch(e) { v = v.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase() }
    } else {
      v = v.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase()
    }
    this.setData({ saveAbbr: v, saveAbbrError: '' })
  },

  abbrFromPinyin(arr) {
    const n = arr.length
    if (n >= 4) return arr.slice(0, 4).map(s => s[0].toUpperCase()).join('')
    if (n === 3) return (arr[0][0] + arr[1][0] + arr[2].slice(0, 2)).toUpperCase()
    if (n === 2) return (arr[0].slice(0, 2) + arr[1].slice(0, 2)).toUpperCase()
    return arr[0].slice(0, 4).toUpperCase()
  },

  confirmSave() {
    const abbr = this.data.saveAbbr.trim()
    if (abbr.length !== 4) { this.setData({ saveAbbrError: '请输入4位字母' }); return }
    const d = this.data
    const record = {
      id: d.editRecordId || Date.now(),
      abbr,
      medName: d.medName,
      prescList: d.prescList.map(p => ({...p})),
      drugUnit: d.drugUnit,
      lastSaved: Date.now(),
      dosePerTime: d.dosePerTime,
      freqVal: d.freqVal,
      freqLabel: d.freqLabel
    }
    let records = wx.getStorageSync(this.STORAGE_KEY) || []
    const idx = records.findIndex(r => r.id === record.id)
    if (idx >= 0) { records[idx] = record } else { records.push(record) }
    wx.setStorageSync(this.STORAGE_KEY, records)
    this.setData({ showSaveDialog: false, editRecordId: null, saveAbbr: '' })
    this.loadRecords()
    wx.showToast({ title: idx >= 0 ? '已更新' : '已保存', icon: 'success' })
  },

  cancelSave() { this.setData({ showSaveDialog: false, editRecordId: null, saveAbbr: '' }) },

  deleteRecord(e) {
    const id = parseInt(e.currentTarget.dataset.id)
    wx.showModal({
      title: '删除记录',
      content: '确定删除此记录？',
      success: (res) => {
        if (res.confirm) {
          let records = wx.getStorageSync(this.STORAGE_KEY) || []
          records = records.filter(r => r.id !== id)
          wx.setStorageSync(this.STORAGE_KEY, records)
          this.loadRecords()
        }
      }
    })
  },

  editRecord(e) {
    const id = parseInt(e.currentTarget.dataset.id)
    const records = wx.getStorageSync(this.STORAGE_KEY) || []
    const rec = records.find(r => r.id === id)
    if (!rec) { wx.showToast({ title: '记录不存在', icon: 'none' }); return }
    this.setData({
      activeTab: 0,
      editRecordId: id,
      medName: rec.medName,
      drugUnit: rec.drugUnit,
      dosePerTime: rec.dosePerTime,
      freqVal: rec.freqVal,
      freqLabel: rec.freqLabel,
      prescList: rec.prescList.map(p => ({...p})),
      showForm: true,
      gapResult: null,
      showResult: false
    })
    const catIdx = catOrder.findIndex(c => drugDB[rec.medName]?.cat === c)
    const drugs = this.data.drugByCat[catOrder[catIdx >= 0 ? catIdx : 0]] || []
    const drugIdx = drugs.indexOf(rec.medName)
    this.setData({
      multiArray: [catOrder.map(c => catLabel[c]), drugs],
      multiIndex: [catIdx >= 0 ? catIdx : 0, drugIdx >= 0 ? drugIdx : 0]
    })
    wx.showToast({ title: '正在编辑 ' + rec.abbr, icon: 'none' })
  },

  /* ====== Single Prescription Calc ====== */
  calcPresc() {
    const d = this.data
    if (!d.medName || !d.dosePerTime || !d.totalQty) {
      wx.showToast({ title: '请填写完整信息', icon: 'none' }); return
    }
    const dose = parseFloat(d.dosePerTime)
    const total = parseFloat(d.totalQty)
    if (isNaN(dose) || isNaN(total) || dose <= 0 || total <= 0) {
      wx.showToast({ title: '用量请输入有效数字', icon: 'none' }); return
    }
    const { daysSupply, dailyDose } = calcSupply(total, d.dosePerTime, d.freqVal)
    if (daysSupply <= 0) { wx.showToast({ title: '药量不足以服用1天', icon: 'none' }); return }
    const start = util.parseDate(d.prescDate || util.formatDate(new Date()))
    const end = util.addDays(start, daysSupply - 1)
    const endStr = util.formatDate(end)

    let dailyDoseText = `${dailyDose.toFixed(2)}${d.drugUnit}`
    const info = drugDB[d.medName]
    if (info) {
      const spec = info.spec
      const mgMatch = spec.match(/([\d.]+)mg/)
      const gMatch = spec.match(/([\d.]+)g/)
      if (mgMatch) dailyDoseText += `（${(dailyDose * parseFloat(mgMatch[1])).toFixed(1)}mg）`
      else if (gMatch) dailyDoseText += `（${(dailyDose * parseFloat(gMatch[1]) * 1000).toFixed(0)}mg）`
    }

    const resultText = `💊 ${d.medName}\n📋 用法：${d.dosePerTime}${d.drugUnit}/次 ${d.freqLabel}\n📦 总量：${d.totalQty}${d.drugUnit}\n📅 开药：${d.prescDate}\n━━━━\n📌 每天：${dailyDoseText}\n📌 可服：${daysSupply}天\n📌 用完：${endStr}`

    this.setData({ dailyDose, daysSupply, endDate: endStr, totalDays: daysSupply, dailyDoseText, resultText, showResult: true })
  },

  resetPresc() {
    this.setData({
      medName: '', drugUnit: '片', drugNote: '',
      dosePerTime: '', freqVal: 'QD', freqLabel: 'QD（每日1次）', freqPickerIdx: 0,
      totalQty: '', showResult: false, showForm: false,
      multiIndex: [0, 0]
    })
    this.initDrugPicker()
  },

  /* ====== Date Diff Tab ====== */
  bindDateDiff() {
    const d = this.data
    if (!d.date1 || !d.date2) { wx.showToast({ title: '请选择两个日期', icon: 'none' }); return }
    const diff = util.diffDays(util.parseDate(d.date1), util.parseDate(d.date2))
    const [a,b]=diff<0?[d.date2,d.date1]:[d.date1,d.date2]
    this.setData({ dateDiff: diff, dateDiffA: a, dateDiffB: b })
  },

  calcDateOffset() {
    const d = this.data
    if (!d.calcDate || !d.calcOffset) { wx.showToast({ title: '请填写完整', icon: 'none' }); return }
    const offset = parseFloat(d.calcOffset)
    if (isNaN(offset)) { wx.showToast({ title: '请输入有效数字', icon: 'none' }); return }
    const dir = d.calcDirection === '往后' ? 1 : -1
    const dt = util.parseDate(d.calcDate)
    if (d.calcUnit === '月') {
      dt.setMonth(dt.getMonth() + dir * offset)
    } else {
      const days = offset * (d.calcUnit === '周' ? 7 : 1)
      dt.setDate(dt.getDate() + dir * days)
    }
    this.setData({ calcResult: util.formatDate(dt) })
  },

  bindUnitPicker(e) {
    const f = e.currentTarget.dataset.field
    const idx = parseInt(e.detail.value)
    this.setData({ [f]: ['天', '周', '月'][idx] || '天' })
  },

  setDirection(e) { this.setData({ calcDirection: e.currentTarget.dataset.val }) }
})
