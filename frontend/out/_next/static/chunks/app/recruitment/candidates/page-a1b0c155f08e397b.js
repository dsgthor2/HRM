(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[382],{45271:function(e,t,a){Promise.resolve().then(a.bind(a,61589))},61589:function(e,t,a){"use strict";a.r(t),a.d(t,{default:function(){return m}});var s=a(3827),n=a(30394),l=a(64090),i=a(10826),c=a(70094),r=a(85497),d=a(37841),o=a(77731),h=a(52235);let u=["APPLIED","SCREENING","INTERVIEW","OFFER_SENT","OFFER_ACCEPTED","ONBOARDING","HIRED","REJECTED"],x={APPLIED:"badge-gray",SCREENING:"badge-yellow",INTERVIEW:"badge-blue",OFFER_SENT:"badge-navy",OFFER_ACCEPTED:"badge-amber",ONBOARDING:"badge-blue",HIRED:"badge-green",REJECTED:"badge-red"},p={name:"",email:"",phone:"",position:"",department:"",stage:"APPLIED",expectedCTC:"",notes:"",interviewDate:""};function m(){let[e,t]=(0,l.useState)([]),[a,m]=(0,l.useState)(""),[y,v]=(0,l.useState)(""),[g,b]=(0,l.useState)(!1),[f,j]=(0,l.useState)({...p}),[N,k]=(0,l.useState)(!1),[C,Z]=(0,l.useState)(null),[w,E]=(0,l.useState)(null),M=()=>{let e=new URLSearchParams;a&&e.set("stage",a),y&&e.set("search",y),i.Z.get("/candidates?".concat(e)).then(e=>t(e.data)).catch(()=>{})};(0,l.useEffect)(()=>{M()},[a,y]);let D=async e=>{e.preventDefault(),k(!0);try{let e={...f};e.expectedCTC&&(e.expectedCTC=parseFloat(e.expectedCTC)||0),w?await i.Z.put("/candidates/".concat(w),e):await i.Z.post("/candidates",e),b(!1),E(null),j({...p}),M()}catch(e){var t,a;alert((null===(a=e.response)||void 0===a?void 0:null===(t=a.data)||void 0===t?void 0:t.error)||"Failed to save candidate")}finally{k(!1)}},S=e=>{j({name:e.name,email:e.email||"",phone:e.phone||"",position:e.designation||e.position||"",department:e.department||"",stage:e.stage,expectedCTC:e.expectedCTC||"",notes:e.notes||"",interviewDate:e.interviewDate?new Date(e.interviewDate).toISOString().split("T")[0]:""}),E(e.id),b(!0)},T=async(e,t)=>{await i.Z.put("/candidates/".concat(e,"/stage"),{stage:t}),M()},R=async e=>{if(confirm("Convert this candidate to an employee?")){Z(e);try{let t=await i.Z.post("/candidates/".concat(e,"/hire"));alert("✅ Employee created! ID: ".concat(t.data.employee.employeeId)),M()}catch(l){var t,a,s,n;let e=(null===(a=l.response)||void 0===a?void 0:null===(t=a.data)||void 0===t?void 0:t.message)||(null===(n=l.response)||void 0===n?void 0:null===(s=n.data)||void 0===s?void 0:s.error)||l.message||"Hiring failed";alert("❌ ".concat(e))}finally{Z(null)}}},z=async e=>{confirm("Delete this candidate?")&&(await i.Z.delete("/candidates/".concat(e)),M())},I=(e,t)=>j(a=>({...a,[e]:t})),P=u.reduce((t,a)=>(t[a]=e.filter(e=>e.stage===a).length,t),{}),H=a?e:e.filter(e=>"HIRED"!==e.stage&&"REJECTED"!==e.stage);return(0,s.jsxs)(n.Z,{title:"Candidates",children:[(0,s.jsxs)("div",{className:"flex flex-wrap items-start justify-between gap-4 mb-5",children:[(0,s.jsxs)("div",{children:[(0,s.jsx)("h2",{className:"page-title",children:"Recruitment Pipeline"}),(0,s.jsxs)("p",{className:"page-sub",children:[H.length," active candidates total"]})]}),(0,s.jsx)("div",{className:"flex items-center gap-3",children:(0,s.jsxs)("button",{className:"flex items-center gap-1.5 px-4 py-2 rounded-xl bg-navy text-white font-semibold text-sm hover:bg-navy/90 shadow-md transition-all",onClick:()=>{j({...p}),E(null),b(!0)},children:[(0,s.jsx)(c.Z,{size:16}),(0,s.jsx)("span",{children:"Add Candidate"})]})})]}),(0,s.jsxs)("div",{className:"flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide",children:[(0,s.jsx)("button",{onClick:()=>m(""),className:"px-4 py-2 rounded-xl text-xs font-bold transition-all border-2 ".concat(a?"border-slate-100 bg-white text-slate-500 hover:border-slate-200":"border-navy bg-navy text-white"),children:"All Active"}),u.map(e=>(0,s.jsxs)("button",{onClick:()=>m(e),className:"px-4 py-2 rounded-xl text-xs font-bold transition-all border-2 whitespace-nowrap flex items-center gap-2 ".concat(a===e?"border-navy bg-navy text-white":"border-slate-100 bg-white text-slate-500 hover:border-slate-200"),children:[e.replace("_"," "),(0,s.jsx)("span",{className:"px-1.5 py-0.5 rounded-full text-[9px] ".concat(a===e?"bg-white/20 text-white":"bg-slate-100 text-slate-400"),children:P[e]||0})]},e))]}),(0,s.jsx)("div",{className:"card mb-6",children:(0,s.jsx)("div",{className:"flex items-center gap-3 px-4 py-3",children:(0,s.jsx)("input",{className:"flex-1 bg-transparent border-none text-sm focus:ring-0 placeholder:text-slate-300",placeholder:"Search candidates by name, email or position...",value:y,onChange:e=>v(e.target.value)})})}),(0,s.jsx)("div",{className:"card overflow-hidden",children:(0,s.jsxs)("table",{className:"table",children:[(0,s.jsx)("thead",{children:(0,s.jsxs)("tr",{children:[(0,s.jsx)("th",{className:"th",children:"Candidate"}),(0,s.jsx)("th",{className:"th",children:"Position"}),(0,s.jsx)("th",{className:"th",children:"Department"}),(0,s.jsx)("th",{className:"th",children:"Expected CTC"}),(0,s.jsx)("th",{className:"th",children:"Status"}),(0,s.jsx)("th",{className:"th",children:"Workflow"}),(0,s.jsx)("th",{className:"th",children:"Actions"})]})}),(0,s.jsx)("tbody",{children:0===H.length?(0,s.jsx)("tr",{children:(0,s.jsx)("td",{colSpan:7,className:"td text-center py-10 text-slate-400",children:"No candidates found"})}):H.map(e=>{var t;return(0,s.jsxs)("tr",{className:"tr",children:[(0,s.jsx)("td",{className:"td",children:(0,s.jsxs)("div",{className:"flex items-center gap-3",children:[(0,s.jsx)("div",{className:"w-9 h-9 rounded-full bg-navy/10 text-navy flex items-center justify-center font-bold text-sm",children:null===(t=e.name.replace(/^(Mr\.|Ms\.|Mrs\.|Dr\.|Mr|Ms|Mrs|Dr) /i,"")[0])||void 0===t?void 0:t.toUpperCase()}),(0,s.jsxs)("div",{children:[(0,s.jsx)("div",{className:"font-semibold",children:e.name.replace(/^(Mr\.|Ms\.|Mrs\.|Dr\.|Mr|Ms|Mrs|Dr) /i,"")}),(0,s.jsx)("div",{className:"text-xs text-slate-400",children:e.email})]})]})}),(0,s.jsx)("td",{className:"td",children:e.position}),(0,s.jsx)("td",{className:"td text-slate-500",children:e.department||"—"}),(0,s.jsx)("td",{className:"td",children:e.expectedCTC?"₹".concat(Number(e.expectedCTC).toLocaleString("en-IN")):"—"}),(0,s.jsx)("td",{className:"td",children:(0,s.jsx)("span",{className:"badge ".concat(x[e.stage]),children:e.stage.replace("_"," ")})}),(0,s.jsx)("td",{className:"td",children:(0,s.jsx)("select",{className:"select !w-32 text-xs",value:e.stage,onChange:t=>T(e.id,t.target.value),children:u.map(e=>(0,s.jsx)("option",{value:e,children:e.replace("_"," ")},e))})}),(0,s.jsx)("td",{className:"td",children:(0,s.jsxs)("div",{className:"flex gap-1",children:[["OFFER_SENT","OFFER_ACCEPTED","ONBOARDING"].includes(e.stage)&&(0,s.jsxs)("button",{onClick:()=>R(e.id),disabled:C===e.id,className:"btn-success btn-sm flex items-center gap-1",title:"Convert to Employee",children:[(0,s.jsx)(r.Z,{size:13})," Hire"]}),(0,s.jsx)("button",{onClick:()=>S(e),className:"btn-icon text-emerald-400 hover:bg-emerald-50",title:"Preview Candidate",children:(0,s.jsx)(d.Z,{size:14})}),(0,s.jsx)("button",{onClick:()=>S(e),className:"btn-icon text-blue-400 hover:bg-blue-50",title:"Edit Details",children:(0,s.jsx)(o.Z,{size:14})}),(0,s.jsx)("button",{onClick:()=>z(e.id),className:"btn-icon text-red-400 hover:bg-red-50",title:"Delete",children:(0,s.jsx)(h.Z,{size:14})})]})})]},e.id)})})]})}),g&&(0,s.jsx)("div",{className:"modal-overlay",onClick:e=>e.target===e.currentTarget&&b(!1),children:(0,s.jsxs)("div",{className:"modal-box max-w-lg slide-in",children:[(0,s.jsxs)("div",{className:"flex items-center justify-between px-6 py-4 border-b border-cream-dark sticky top-0 bg-white rounded-t-2xl",children:[(0,s.jsx)("h3",{className:"font-bold text-navy",children:w?"Edit Candidate":"Add Candidate"}),(0,s.jsx)("button",{onClick:()=>b(!1),className:"btn-icon",children:(0,s.jsx)(h.Z,{size:18})})]}),(0,s.jsxs)("form",{onSubmit:D,className:"p-6 space-y-4",children:[(0,s.jsxs)("div",{className:"grid grid-cols-2 gap-4",children:[(0,s.jsxs)("div",{className:"col-span-2",children:[(0,s.jsx)("label",{className:"label",children:"Full Name *"}),(0,s.jsx)("input",{className:"input",required:!0,value:f.name,onChange:e=>I("name",e.target.value)})]}),(0,s.jsxs)("div",{children:[(0,s.jsx)("label",{className:"label",children:"Email *"}),(0,s.jsx)("input",{className:"input",type:"email",required:!0,value:f.email,onChange:e=>I("email",e.target.value)})]}),(0,s.jsxs)("div",{children:[(0,s.jsx)("label",{className:"label",children:"Phone"}),(0,s.jsx)("input",{className:"input",value:f.phone,onChange:e=>I("phone",e.target.value)})]}),(0,s.jsxs)("div",{children:[(0,s.jsx)("label",{className:"label",children:"Position Applied *"}),(0,s.jsx)("input",{className:"input",required:!0,value:f.position,onChange:e=>I("position",e.target.value)})]}),(0,s.jsxs)("div",{children:[(0,s.jsx)("label",{className:"label",children:"Department"}),(0,s.jsx)("input",{className:"input",value:f.department,onChange:e=>I("department",e.target.value)})]}),(0,s.jsxs)("div",{children:[(0,s.jsx)("label",{className:"label",children:"Expected CTC (₹/year)"}),(0,s.jsx)("input",{className:"input",type:"number",value:f.expectedCTC,onChange:e=>I("expectedCTC",e.target.value)})]}),(0,s.jsxs)("div",{children:[(0,s.jsx)("label",{className:"label",children:"Interview Date"}),(0,s.jsx)("input",{className:"input",type:"date",value:f.interviewDate,onChange:e=>I("interviewDate",e.target.value)})]}),(0,s.jsxs)("div",{children:[(0,s.jsx)("label",{className:"label",children:"Current Stage"}),(0,s.jsx)("select",{className:"select",value:f.stage,onChange:e=>I("stage",e.target.value),children:u.map(e=>(0,s.jsx)("option",{value:e,children:e.replace("_"," ")},e))})]}),(0,s.jsxs)("div",{className:"col-span-2",children:[(0,s.jsx)("label",{className:"label",children:"Notes"}),(0,s.jsx)("textarea",{className:"textarea",rows:2,value:f.notes,onChange:e=>I("notes",e.target.value)})]})]}),(0,s.jsxs)("div",{className:"flex gap-3 pt-2",children:[(0,s.jsx)("button",{type:"submit",className:"btn-primary flex-1",disabled:N,children:N?"Saving...":w?"Update Candidate":"Add Candidate"}),(0,s.jsx)("button",{type:"button",className:"btn-ghost flex-1",onClick:()=>b(!1),children:"Cancel"})]}),w&&(0,s.jsx)("p",{className:"text-[10px] text-slate-400 text-center italic",children:"Updating these details will allow you to fix conflicting emails before hiring."})]})]})})]})}},43345:function(e,t,a){"use strict";a.d(t,{Z:function(){return s}});/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=(0,a(87461).Z)("Bell",[["path",{d:"M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9",key:"1qo2s2"}],["path",{d:"M10.3 21a1.94 1.94 0 0 0 3.4 0",key:"qgo35s"}]])},93151:function(e,t,a){"use strict";a.d(t,{Z:function(){return s}});/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=(0,a(87461).Z)("Briefcase",[["rect",{width:"20",height:"14",x:"2",y:"7",rx:"2",ry:"2",key:"eto64e"}],["path",{d:"M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16",key:"zwj3tp"}]])},71107:function(e,t,a){"use strict";a.d(t,{Z:function(){return s}});/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=(0,a(87461).Z)("CalendarX2",[["path",{d:"M8 2v4",key:"1cmpym"}],["path",{d:"M16 2v4",key:"4m81vk"}],["path",{d:"M21 13V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8",key:"3spt84"}],["path",{d:"M3 10h18",key:"8toen8"}],["path",{d:"m17 22 5-5",key:"1k6ppv"}],["path",{d:"m17 17 5 5",key:"p7ous7"}]])},23441:function(e,t,a){"use strict";a.d(t,{Z:function(){return s}});/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=(0,a(87461).Z)("ChevronDown",[["path",{d:"m6 9 6 6 6-6",key:"qrunsl"}]])},37805:function(e,t,a){"use strict";a.d(t,{Z:function(){return s}});/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=(0,a(87461).Z)("ChevronRight",[["path",{d:"m9 18 6-6-6-6",key:"mthhwq"}]])},26490:function(e,t,a){"use strict";a.d(t,{Z:function(){return s}});/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=(0,a(87461).Z)("Clock",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["polyline",{points:"12 6 12 12 16 14",key:"68esgv"}]])},37841:function(e,t,a){"use strict";a.d(t,{Z:function(){return s}});/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=(0,a(87461).Z)("Eye",[["path",{d:"M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z",key:"rwhkz3"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]])},69475:function(e,t,a){"use strict";a.d(t,{Z:function(){return s}});/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=(0,a(87461).Z)("FileText",[["path",{d:"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z",key:"1rqfz7"}],["path",{d:"M14 2v4a2 2 0 0 0 2 2h4",key:"tnqrlb"}],["path",{d:"M10 9H8",key:"b1mrlr"}],["path",{d:"M16 13H8",key:"t4e002"}],["path",{d:"M16 17H8",key:"z1uh3a"}]])},35005:function(e,t,a){"use strict";a.d(t,{Z:function(){return s}});/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=(0,a(87461).Z)("Home",[["path",{d:"m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",key:"y5dka4"}],["polyline",{points:"9 22 9 12 15 12 15 22",key:"e2us08"}]])},5423:function(e,t,a){"use strict";a.d(t,{Z:function(){return s}});/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=(0,a(87461).Z)("LayoutDashboard",[["rect",{width:"7",height:"9",x:"3",y:"3",rx:"1",key:"10lvy0"}],["rect",{width:"7",height:"5",x:"14",y:"3",rx:"1",key:"16une8"}],["rect",{width:"7",height:"9",x:"14",y:"12",rx:"1",key:"1hutg5"}],["rect",{width:"7",height:"5",x:"3",y:"16",rx:"1",key:"ldoo1y"}]])},81049:function(e,t,a){"use strict";a.d(t,{Z:function(){return s}});/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=(0,a(87461).Z)("LogOut",[["path",{d:"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4",key:"1uf3rs"}],["polyline",{points:"16 17 21 12 16 7",key:"1gabdz"}],["line",{x1:"21",x2:"9",y1:"12",y2:"12",key:"1uyos4"}]])},79744:function(e,t,a){"use strict";a.d(t,{Z:function(){return s}});/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=(0,a(87461).Z)("Menu",[["line",{x1:"4",x2:"20",y1:"12",y2:"12",key:"1e0a9i"}],["line",{x1:"4",x2:"20",y1:"6",y2:"6",key:"1owob3"}],["line",{x1:"4",x2:"20",y1:"18",y2:"18",key:"yk5zj1"}]])},23808:function(e,t,a){"use strict";a.d(t,{Z:function(){return s}});/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=(0,a(87461).Z)("MonitorSmartphone",[["path",{d:"M18 8V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h8",key:"10dyio"}],["path",{d:"M10 19v-3.96 3.15",key:"1irgej"}],["path",{d:"M7 19h5",key:"qswx4l"}],["rect",{width:"6",height:"10",x:"16",y:"12",rx:"2",key:"1egngj"}]])},77731:function(e,t,a){"use strict";a.d(t,{Z:function(){return s}});/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=(0,a(87461).Z)("Pencil",[["path",{d:"M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z",key:"5qss01"}],["path",{d:"m15 5 4 4",key:"1mk7zo"}]])},70094:function(e,t,a){"use strict";a.d(t,{Z:function(){return s}});/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=(0,a(87461).Z)("Plus",[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"M12 5v14",key:"s699le"}]])},29910:function(e,t,a){"use strict";a.d(t,{Z:function(){return s}});/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=(0,a(87461).Z)("Settings",[["path",{d:"M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z",key:"1qme2f"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]])},63236:function(e,t,a){"use strict";a.d(t,{Z:function(){return s}});/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=(0,a(87461).Z)("ShieldCheck",[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]])},85497:function(e,t,a){"use strict";a.d(t,{Z:function(){return s}});/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=(0,a(87461).Z)("UserCheck",[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}],["polyline",{points:"16 11 18 13 22 9",key:"1pwet4"}]])},63854:function(e,t,a){"use strict";a.d(t,{Z:function(){return s}});/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=(0,a(87461).Z)("UserPlus",[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}],["line",{x1:"19",x2:"19",y1:"8",y2:"14",key:"1bvyxn"}],["line",{x1:"22",x2:"16",y1:"11",y2:"11",key:"1shjgl"}]])},34059:function(e,t,a){"use strict";a.d(t,{Z:function(){return s}});/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=(0,a(87461).Z)("Users",[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}],["path",{d:"M22 21v-2a4 4 0 0 0-3-3.87",key:"kshegd"}],["path",{d:"M16 3.13a4 4 0 0 1 0 7.75",key:"1da9ce"}]])},71483:function(e,t,a){"use strict";a.d(t,{Z:function(){return s}});/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=(0,a(87461).Z)("XCircle",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m15 9-6 6",key:"1uzhvr"}],["path",{d:"m9 9 6 6",key:"z0biqf"}]])},52235:function(e,t,a){"use strict";a.d(t,{Z:function(){return s}});/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=(0,a(87461).Z)("X",[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]])}},function(e){e.O(0,[2029,852,394,2971,5468,1744],function(){return e(e.s=45271)}),_N_E=e.O()}]);