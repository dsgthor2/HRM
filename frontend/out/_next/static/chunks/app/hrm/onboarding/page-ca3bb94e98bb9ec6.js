(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[9756],{50007:function(e,t,a){Promise.resolve().then(a.bind(a,67253))},67253:function(e,t,a){"use strict";a.r(t),a.d(t,{default:function(){return Z}});var s=a(3827),r=a(30394),n=a(64090),l=a(10826),i=a(34059),d=a(26490),c=a(85497),o=a(18025),u=a(93151),h=a(80559),x=a(90684),p=a(97307),m=a(69475),f=a(57976),y=a(8792),b=a(47907),g=a(75504);let k={OFFER_ACCEPTED:"Offer Accepted",ONBOARDING:"Onboarding",HIRED:"Hired",CONVERTED:"Converted"},v={OFFER_ACCEPTED:"bg-amber-100 text-amber-700 border-amber-200",ONBOARDING:"bg-blue-100 text-blue-700 border-blue-200",HIRED:"bg-emerald-100 text-emerald-700 border-emerald-200",CONVERTED:"bg-purple-100 text-purple-700 border-purple-200"};function j(){let[e,t]=(0,n.useState)([]),[a,j]=(0,n.useState)(!0),[Z,N]=(0,n.useState)(""),[w,M]=(0,n.useState)(null),C=(0,b.useSearchParams)().get("candidate"),E=async()=>{try{let e=(await l.Z.get("/candidates")).data||[],a=e.filter(e=>"OFFER_SENT"===e.stage||"OFFER_ACCEPTED"===e.stage||"ONBOARDING"===e.stage||"HIRED"===e.stage);t(a.length>0?a:e)}catch(e){console.error("Failed to load onboarding candidates",e)}finally{j(!1)}},O=async e=>{if(confirm("Confirm conversion to employee? This will create an employee record.")){M(e);try{let t=await l.Z.post("/candidates/".concat(e,"/hire"));alert("✅ Successfully converted! Employee ID: ".concat(t.data.employee.employeeId)),await E(),window.location.href="/hrm/employees?view=".concat(t.data.employee.id)}catch(s){var t,a;let e=(null===(a=s.response)||void 0===a?void 0:null===(t=a.data)||void 0===t?void 0:t.message)||s.message||"Conversion failed";alert("❌ ".concat(e))}finally{M(null)}}};(0,n.useEffect)(()=>{E()},[]);let D=e.filter(e=>{let t=!C||e.id===C,a=!Z||(e.name||"").toLowerCase().includes(Z.toLowerCase())||(e.designation||e.position||"").toLowerCase().includes(Z.toLowerCase());return t&&a}),z=[{label:"Ready to Onboard",value:e.filter(e=>"OFFER_ACCEPTED"===e.stage).length,color:"text-amber-600",bg:"bg-amber-50 border-amber-100"},{label:"In Progress",value:e.filter(e=>"ONBOARDING"===e.stage).length,color:"text-blue-600",bg:"bg-blue-50 border-blue-100"},{label:"Completed",value:e.filter(e=>"HIRED"===e.stage||"CONVERTED"===e.stage).length,color:"text-emerald-600",bg:"bg-emerald-50 border-emerald-100"},{label:"Total",value:e.length,color:"text-purple-600",bg:"bg-purple-50 border-purple-100"}];return a?(0,s.jsx)(r.Z,{title:"Onboarding",children:(0,s.jsx)("div",{className:"flex items-center justify-center min-h-[400px]",children:(0,s.jsx)("div",{className:"w-8 h-8 border-4 border-blue-500/30 border-t-blue-600 rounded-full animate-spin"})})}):(0,s.jsx)(r.Z,{title:"Onboarding",children:(0,s.jsxs)("div",{className:"space-y-6",children:[(0,s.jsxs)("div",{className:"flex items-center justify-between",children:[(0,s.jsxs)("div",{children:[(0,s.jsx)("h1",{className:"text-2xl font-black text-slate-800",children:"Onboarding"}),(0,s.jsx)("p",{className:"text-sm text-slate-500 mt-1",children:"Manage new hire onboarding processes"})]}),(0,s.jsxs)(y.default,{href:"/hrm/employees",className:"flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-sm",children:[(0,s.jsx)(i.Z,{size:16})," Add New Employee"]})]}),(0,s.jsx)("div",{className:"grid grid-cols-2 md:grid-cols-4 gap-4",children:z.map((e,t)=>(0,s.jsxs)("div",{className:(0,g.Z)("rounded-2xl border p-5 flex flex-col items-center justify-center text-center",e.bg),children:[(0,s.jsx)("span",{className:(0,g.Z)("text-3xl font-black",e.color),children:e.value}),(0,s.jsx)("span",{className:"text-xs font-bold text-slate-500 uppercase mt-1 tracking-widest",children:e.label})]},t))}),(0,s.jsxs)("div",{className:"bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden",children:[(0,s.jsx)("div",{className:"p-6 border-b border-slate-100",children:(0,s.jsxs)("div",{className:"flex items-center gap-4",children:[(0,s.jsxs)("div",{className:"relative flex-1",children:[(0,s.jsx)(i.Z,{size:16,className:"absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"}),(0,s.jsx)("input",{className:"w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none",placeholder:"Search by name or designation...",value:Z,onChange:e=>N(e.target.value)})]}),C&&(0,s.jsxs)(y.default,{href:"/hrm/onboarding",className:"px-4 py-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-xs font-bold hover:bg-amber-100 transition-all flex items-center gap-2",children:[(0,s.jsx)(d.Z,{size:14})," Showing Target Only",(0,s.jsx)("span",{className:"opacity-50 font-normal underline ml-1",children:"Clear"})]})]})}),(0,s.jsx)("div",{className:"divide-y divide-slate-100",children:0===D.length?(0,s.jsxs)("div",{className:"p-12 text-center",children:[(0,s.jsx)("div",{className:"w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4",children:(0,s.jsx)(c.Z,{size:28,className:"text-blue-400"})}),(0,s.jsx)("h3",{className:"font-black text-slate-700 text-lg mb-1",children:"No candidates ready to onboard"}),(0,s.jsx)("p",{className:"text-sm text-slate-400",children:"Candidates who have accepted offers will appear here."}),(0,s.jsxs)(y.default,{href:"/hrm/employees",className:"inline-flex items-center gap-2 mt-5 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all",children:["Add Candidate ",(0,s.jsx)(o.Z,{size:14})]})]}):D.map(e=>(0,s.jsxs)("div",{className:"p-5 flex items-center justify-between hover:bg-slate-50 transition-colors",children:[(0,s.jsxs)("div",{className:"flex items-center gap-4",children:[(0,s.jsx)("div",{className:"w-11 h-11 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-sm shrink-0",children:(e.name.replace(/^(Mr\.|Ms\.|Mrs\.|Dr\.|Mr|Ms|Mrs|Dr) /i,"")||"?")[0].toUpperCase()}),(0,s.jsxs)("div",{children:[(0,s.jsx)("div",{className:"font-black text-slate-800 text-sm",children:e.name.replace(/^(Mr\.|Ms\.|Mrs\.|Dr\.|Mr|Ms|Mrs|Dr) /i,"")}),(0,s.jsxs)("div",{className:"text-[11px] text-slate-500 flex items-center gap-3 mt-0.5 flex-wrap",children:[(e.designation||e.position)&&(0,s.jsxs)("span",{className:"flex items-center gap-1",children:[(0,s.jsx)(u.Z,{size:10}),e.designation||e.position]}),e.department&&(0,s.jsxs)("span",{className:"flex items-center gap-1",children:[(0,s.jsx)(h.Z,{size:10}),e.department]}),e.email&&(0,s.jsxs)("span",{className:"flex items-center gap-1",children:[(0,s.jsx)(x.Z,{size:10}),e.email]}),e.joiningDate&&(0,s.jsxs)("span",{className:"flex items-center gap-1",children:[(0,s.jsx)(p.Z,{size:10}),"Joining:"," ",new Date(e.joiningDate).toLocaleDateString("en-IN")]})]})]})]}),(0,s.jsxs)("div",{className:"flex items-center gap-3",children:[e.stage&&(0,s.jsx)("span",{className:(0,g.Z)("text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg border",v[e.stage]||"bg-slate-100 text-slate-600 border-slate-200"),children:k[e.stage]||e.stage}),(0,s.jsxs)(y.default,{href:"/hrm/emp-documents/offer-letter?type=OFFER&targetId=".concat(e.id,"&targetType=CANDIDATE"),className:"flex items-center gap-1.5 px-3 py-2 border border-blue-200 text-blue-600 rounded-lg text-[11px] font-bold hover:bg-blue-50 transition-all",children:[(0,s.jsx)(m.Z,{size:12})," Offer Letter"]}),(0,s.jsxs)("button",{onClick:()=>O(e.id),disabled:w===e.id,className:"flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg text-[11px] font-bold hover:bg-blue-700 transition-all disabled:opacity-50",children:[w===e.id?(0,s.jsx)("div",{className:"w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"}):(0,s.jsx)(f.Z,{size:12}),"Convert to Employee"]})]})]},e.id))})]}),(0,s.jsxs)("div",{className:"bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg",children:[(0,s.jsx)("h3",{className:"font-black text-lg mb-4",children:"Onboarding Checklist"}),(0,s.jsx)("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-4",children:[{step:"01",title:"Send Offer Letter",desc:"Generate and share the official offer letter with the candidate.",icon:(0,s.jsx)(m.Z,{size:20})},{step:"02",title:"Collect Documents",desc:"Gather necessary documents: ID proof, address proof, certificates.",icon:(0,s.jsx)(f.Z,{size:20})},{step:"03",title:"Convert to Employee",desc:"Once all docs are verified, convert the candidate to an employee.",icon:(0,s.jsx)(c.Z,{size:20})}].map((e,t)=>(0,s.jsxs)("div",{className:"bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20",children:[(0,s.jsxs)("div",{className:"flex items-center gap-3 mb-2",children:[(0,s.jsx)("div",{className:"w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center",children:e.icon}),(0,s.jsxs)("span",{className:"text-xs font-bold text-blue-200 uppercase tracking-widest",children:["Step ",e.step]})]}),(0,s.jsx)("div",{className:"font-black text-white text-sm",children:e.title}),(0,s.jsx)("div",{className:"text-xs text-blue-200 mt-1 leading-relaxed",children:e.desc})]},t))})]})]})})}function Z(){return(0,s.jsx)(n.Suspense,{fallback:(0,s.jsx)("div",{children:"Loading..."}),children:(0,s.jsx)(j,{})})}},18025:function(e,t,a){"use strict";a.d(t,{Z:function(){return s}});/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=(0,a(87461).Z)("ArrowRight",[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"m12 5 7 7-7 7",key:"xquz4c"}]])},43345:function(e,t,a){"use strict";a.d(t,{Z:function(){return s}});/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=(0,a(87461).Z)("Bell",[["path",{d:"M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9",key:"1qo2s2"}],["path",{d:"M10.3 21a1.94 1.94 0 0 0 3.4 0",key:"qgo35s"}]])},93151:function(e,t,a){"use strict";a.d(t,{Z:function(){return s}});/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=(0,a(87461).Z)("Briefcase",[["rect",{width:"20",height:"14",x:"2",y:"7",rx:"2",ry:"2",key:"eto64e"}],["path",{d:"M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16",key:"zwj3tp"}]])},80559:function(e,t,a){"use strict";a.d(t,{Z:function(){return s}});/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=(0,a(87461).Z)("Building2",[["path",{d:"M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z",key:"1b4qmf"}],["path",{d:"M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2",key:"i71pzd"}],["path",{d:"M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2",key:"10jefs"}],["path",{d:"M10 6h4",key:"1itunk"}],["path",{d:"M10 10h4",key:"tcdvrf"}],["path",{d:"M10 14h4",key:"kelpxr"}],["path",{d:"M10 18h4",key:"1ulq68"}]])},71107:function(e,t,a){"use strict";a.d(t,{Z:function(){return s}});/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=(0,a(87461).Z)("CalendarX2",[["path",{d:"M8 2v4",key:"1cmpym"}],["path",{d:"M16 2v4",key:"4m81vk"}],["path",{d:"M21 13V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8",key:"3spt84"}],["path",{d:"M3 10h18",key:"8toen8"}],["path",{d:"m17 22 5-5",key:"1k6ppv"}],["path",{d:"m17 17 5 5",key:"p7ous7"}]])},97307:function(e,t,a){"use strict";a.d(t,{Z:function(){return s}});/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=(0,a(87461).Z)("Calendar",[["path",{d:"M8 2v4",key:"1cmpym"}],["path",{d:"M16 2v4",key:"4m81vk"}],["rect",{width:"18",height:"18",x:"3",y:"4",rx:"2",key:"1hopcy"}],["path",{d:"M3 10h18",key:"8toen8"}]])},23441:function(e,t,a){"use strict";a.d(t,{Z:function(){return s}});/**
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
 */let s=(0,a(87461).Z)("Clock",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["polyline",{points:"12 6 12 12 16 14",key:"68esgv"}]])},69475:function(e,t,a){"use strict";a.d(t,{Z:function(){return s}});/**
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
 */let s=(0,a(87461).Z)("MonitorSmartphone",[["path",{d:"M18 8V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h8",key:"10dyio"}],["path",{d:"M10 19v-3.96 3.15",key:"1irgej"}],["path",{d:"M7 19h5",key:"qswx4l"}],["rect",{width:"6",height:"10",x:"16",y:"12",rx:"2",key:"1egngj"}]])},29910:function(e,t,a){"use strict";a.d(t,{Z:function(){return s}});/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=(0,a(87461).Z)("Settings",[["path",{d:"M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z",key:"1qme2f"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]])},63236:function(e,t,a){"use strict";a.d(t,{Z:function(){return s}});/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=(0,a(87461).Z)("ShieldCheck",[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]])},77326:function(e,t,a){"use strict";a.d(t,{Z:function(){return s}});/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=(0,a(87461).Z)("Shield",[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}]])},85497:function(e,t,a){"use strict";a.d(t,{Z:function(){return s}});/**
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
 */let s=(0,a(87461).Z)("X",[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]])},47907:function(e,t,a){"use strict";var s=a(15313);a.o(s,"usePathname")&&a.d(t,{usePathname:function(){return s.usePathname}}),a.o(s,"useRouter")&&a.d(t,{useRouter:function(){return s.useRouter}}),a.o(s,"useSearchParams")&&a.d(t,{useSearchParams:function(){return s.useSearchParams}})}},function(e){e.O(0,[9546,958,394,2971,5468,1744],function(){return e(e.s=50007)}),_N_E=e.O()}]);