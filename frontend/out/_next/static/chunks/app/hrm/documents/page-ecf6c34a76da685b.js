(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[782],{88320:function(e,t,s){Promise.resolve().then(s.bind(s,50392))},50392:function(e,t,s){"use strict";s.r(t),s.d(t,{default:function(){return m}});var a=s(3827),l=s(49555),n=s(64090),c=s(10826),i=s(10632),r=s(69475),d=s(46578),o=s(37841),h=s(50489);let x=["AADHAAR","PAN","RESUME","BANK_DETAILS","OFFER_LETTER","APPOINTMENT_LETTER","PROBATION_LETTER","INCREMENT_LETTER","EXIT_LETTER","PAYSLIP","OTHER"],u={AADHAAR:"bg-blue-50 text-blue-700",PAN:"bg-amber-50 text-amber-700",RESUME:"bg-purple-50 text-purple-700",OFFER_LETTER:"bg-emerald-50 text-emerald-700",OTHER:"bg-slate-50 text-slate-600"};function m(){let[e,t]=(0,n.useState)([]),[s,m]=(0,n.useState)(""),[p,y]=(0,n.useState)([]),[f,v]=(0,n.useState)(!1),[g,j]=(0,n.useState)("OTHER"),[k,N]=(0,n.useState)("");(0,n.useEffect)(()=>{c.Z.get("/employees").then(e=>t(e.data)).catch(()=>{})},[]);let b=e=>{m(e),e?c.Z.get("/documents/".concat(e)).then(e=>y(e.data)).catch(()=>{}):y([])},Z=async e=>{var t,a,l;if(!(null===(t=e.target.files)||void 0===t?void 0:t[0])||!s)return alert("Select employee first");v(!0);let n=new FormData;n.append("file",e.target.files[0]),n.append("employeeId",s),n.append("type",g),n.append("name",k||e.target.files[0].name);try{await c.Z.post("/documents/upload",n,{headers:{"Content-Type":"multipart/form-data"}}),b(s),N(""),e.target.value=""}catch(e){alert(null===(l=e.response)||void 0===l?void 0:null===(a=l.data)||void 0===a?void 0:a.message)}finally{v(!1)}},E=async e=>{await c.Z.put("/documents/".concat(e,"/verify")),b(s)},M=async e=>{confirm("Delete document?")&&(await c.Z.delete("/documents/".concat(e)),b(s))},w=e.find(e=>e.id===s);return(0,a.jsxs)(l.Z,{title:"Documents",children:[(0,a.jsxs)("div",{className:"mb-5",children:[(0,a.jsx)("h2",{className:"page-title",children:"Employee Documents"}),(0,a.jsx)("p",{className:"page-sub",children:"Upload, verify and manage employee documents"})]}),(0,a.jsxs)("div",{className:"grid grid-cols-1 lg:grid-cols-3 gap-5",children:[(0,a.jsxs)("div",{className:"space-y-4",children:[(0,a.jsxs)("div",{className:"card",children:[(0,a.jsx)("label",{className:"label",children:"Select Employee"}),(0,a.jsxs)("select",{className:"select",value:s,onChange:e=>b(e.target.value),children:[(0,a.jsx)("option",{value:"",children:"Choose employee"}),e.map(e=>(0,a.jsx)("option",{value:e.id,children:e.name},e.id))]}),w&&(0,a.jsx)("div",{className:"mt-4 p-3 bg-cream rounded-xl",children:(0,a.jsxs)("div",{className:"flex items-center gap-3",children:[(0,a.jsx)("div",{className:"w-10 h-10 rounded-full bg-navy text-white flex items-center justify-center font-bold text-sm",children:w.name[0]}),(0,a.jsxs)("div",{children:[(0,a.jsx)("div",{className:"font-semibold text-navy text-sm",children:w.name}),(0,a.jsx)("div",{className:"text-xs text-slate-400",children:w.designation}),(0,a.jsx)("div",{className:"text-xs text-slate-400",children:w.employeeId})]})]})})]}),s&&(0,a.jsxs)("div",{className:"card",children:[(0,a.jsx)("h4",{className:"font-semibold text-navy text-sm mb-3",children:"Upload Document"}),(0,a.jsxs)("div",{className:"space-y-3",children:[(0,a.jsxs)("div",{children:[(0,a.jsx)("label",{className:"label",children:"Document Type"}),(0,a.jsx)("select",{className:"select",value:g,onChange:e=>j(e.target.value),children:x.map(e=>(0,a.jsx)("option",{value:e,children:e.replace(/_/g," ")},e))})]}),(0,a.jsxs)("div",{children:[(0,a.jsx)("label",{className:"label",children:"Document Name (optional)"}),(0,a.jsx)("input",{className:"input",placeholder:"e.g. Aadhaar Card",value:k,onChange:e=>N(e.target.value)})]}),(0,a.jsxs)("label",{className:"btn-primary w-full cursor-pointer flex items-center justify-center gap-2 ".concat(f?"opacity-60 cursor-not-allowed":""),children:[(0,a.jsx)(i.Z,{size:15}),f?"Uploading...":"Choose & Upload File",(0,a.jsx)("input",{type:"file",className:"hidden",onChange:Z,disabled:f,accept:".pdf,.jpg,.jpeg,.png,.doc,.docx"})]}),(0,a.jsx)("p",{className:"text-[10px] text-slate-400 text-center",children:"PDF, JPG, PNG, DOC up to 10MB"})]})]}),p.length>0&&(0,a.jsx)("div",{className:"card",children:(0,a.jsxs)("div",{className:"grid grid-cols-2 gap-3",children:[(0,a.jsxs)("div",{className:"text-center",children:[(0,a.jsx)("div",{className:"text-2xl font-black text-navy",children:p.length}),(0,a.jsx)("div",{className:"text-xs text-slate-400",children:"Total Docs"})]}),(0,a.jsxs)("div",{className:"text-center",children:[(0,a.jsx)("div",{className:"text-2xl font-black text-emerald-600",children:p.filter(e=>e.verified).length}),(0,a.jsx)("div",{className:"text-xs text-slate-400",children:"Verified"})]})]})})]}),(0,a.jsx)("div",{className:"col-span-2",children:s?0===p.length?(0,a.jsxs)("div",{className:"card flex flex-col items-center justify-center h-64 text-slate-400",children:[(0,a.jsx)(r.Z,{size:48,className:"mb-3 opacity-20"}),(0,a.jsx)("p",{className:"text-sm font-semibold",children:"No documents uploaded"}),(0,a.jsx)("p",{className:"text-xs mt-1",children:"Use the panel on the left to upload"})]}):(0,a.jsx)("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-3",children:p.map(e=>(0,a.jsxs)("div",{className:"card hover:shadow-md transition-all",children:[(0,a.jsxs)("div",{className:"flex items-start justify-between mb-3",children:[(0,a.jsx)("div",{className:"px-2.5 py-1 rounded-lg text-xs font-semibold ".concat(u[e.type]||u.OTHER),children:e.type.replace(/_/g," ")}),e.verified?(0,a.jsxs)("span",{className:"badge badge-green text-[10px]",children:[(0,a.jsx)(d.Z,{size:10,className:"mr-1"}),"Verified"]}):(0,a.jsx)("span",{className:"badge badge-yellow text-[10px]",children:"Pending"})]}),(0,a.jsxs)("div",{className:"flex items-center gap-2 mb-3",children:[(0,a.jsx)("div",{className:"w-10 h-10 bg-cream rounded-xl flex items-center justify-center flex-shrink-0",children:(0,a.jsx)(r.Z,{size:18,className:"text-slate-400"})}),(0,a.jsxs)("div",{className:"min-w-0",children:[(0,a.jsx)("div",{className:"text-sm font-semibold text-navy truncate",children:e.name||e.type.replace(/_/g," ")}),(0,a.jsx)("div",{className:"text-xs text-slate-400",children:new Date(e.createdAt).toLocaleDateString("en-IN")})]})]}),(0,a.jsxs)("div",{className:"flex gap-2",children:[(0,a.jsxs)("a",{href:"https://defensebluhrm.info".concat(e.fileUrl,"?token=").concat(localStorage.getItem("token")),target:"_blank",rel:"noreferrer",className:"btn-ghost btn-sm flex-1 flex items-center justify-center gap-1",children:[(0,a.jsx)(o.Z,{size:13})," View"]}),!e.verified&&(0,a.jsxs)("button",{onClick:()=>E(e.id),className:"btn-success btn-sm flex items-center gap-1",children:[(0,a.jsx)(d.Z,{size:13})," Verify"]}),(0,a.jsx)("button",{onClick:()=>M(e.id),className:"btn-icon text-red-400 hover:text-red-600 hover:bg-red-50",children:(0,a.jsx)(h.Z,{size:14})})]})]},e.id))}):(0,a.jsxs)("div",{className:"card flex flex-col items-center justify-center h-64 text-slate-400",children:[(0,a.jsx)(r.Z,{size:48,className:"mb-3 opacity-20"}),(0,a.jsx)("p",{className:"text-sm",children:"Select an employee to view documents"})]})})]})]})}},43345:function(e,t,s){"use strict";s.d(t,{Z:function(){return a}});/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let a=(0,s(87461).Z)("Bell",[["path",{d:"M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9",key:"1qo2s2"}],["path",{d:"M10.3 21a1.94 1.94 0 0 0 3.4 0",key:"qgo35s"}]])},71107:function(e,t,s){"use strict";s.d(t,{Z:function(){return a}});/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let a=(0,s(87461).Z)("CalendarX2",[["path",{d:"M8 2v4",key:"1cmpym"}],["path",{d:"M16 2v4",key:"4m81vk"}],["path",{d:"M21 13V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8",key:"3spt84"}],["path",{d:"M3 10h18",key:"8toen8"}],["path",{d:"m17 22 5-5",key:"1k6ppv"}],["path",{d:"m17 17 5 5",key:"p7ous7"}]])},46578:function(e,t,s){"use strict";s.d(t,{Z:function(){return a}});/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let a=(0,s(87461).Z)("CheckCircle",[["path",{d:"M22 11.08V12a10 10 0 1 1-5.93-9.14",key:"g774vq"}],["path",{d:"m9 11 3 3L22 4",key:"1pflzl"}]])},23441:function(e,t,s){"use strict";s.d(t,{Z:function(){return a}});/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let a=(0,s(87461).Z)("ChevronDown",[["path",{d:"m6 9 6 6 6-6",key:"qrunsl"}]])},37805:function(e,t,s){"use strict";s.d(t,{Z:function(){return a}});/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let a=(0,s(87461).Z)("ChevronRight",[["path",{d:"m9 18 6-6-6-6",key:"mthhwq"}]])},26490:function(e,t,s){"use strict";s.d(t,{Z:function(){return a}});/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let a=(0,s(87461).Z)("Clock",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["polyline",{points:"12 6 12 12 16 14",key:"68esgv"}]])},37841:function(e,t,s){"use strict";s.d(t,{Z:function(){return a}});/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let a=(0,s(87461).Z)("Eye",[["path",{d:"M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z",key:"rwhkz3"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]])},69475:function(e,t,s){"use strict";s.d(t,{Z:function(){return a}});/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let a=(0,s(87461).Z)("FileText",[["path",{d:"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z",key:"1rqfz7"}],["path",{d:"M14 2v4a2 2 0 0 0 2 2h4",key:"tnqrlb"}],["path",{d:"M10 9H8",key:"b1mrlr"}],["path",{d:"M16 13H8",key:"t4e002"}],["path",{d:"M16 17H8",key:"z1uh3a"}]])},5423:function(e,t,s){"use strict";s.d(t,{Z:function(){return a}});/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let a=(0,s(87461).Z)("LayoutDashboard",[["rect",{width:"7",height:"9",x:"3",y:"3",rx:"1",key:"10lvy0"}],["rect",{width:"7",height:"5",x:"14",y:"3",rx:"1",key:"16une8"}],["rect",{width:"7",height:"9",x:"14",y:"12",rx:"1",key:"1hutg5"}],["rect",{width:"7",height:"5",x:"3",y:"16",rx:"1",key:"ldoo1y"}]])},81049:function(e,t,s){"use strict";s.d(t,{Z:function(){return a}});/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let a=(0,s(87461).Z)("LogOut",[["path",{d:"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4",key:"1uf3rs"}],["polyline",{points:"16 17 21 12 16 7",key:"1gabdz"}],["line",{x1:"21",x2:"9",y1:"12",y2:"12",key:"1uyos4"}]])},29910:function(e,t,s){"use strict";s.d(t,{Z:function(){return a}});/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let a=(0,s(87461).Z)("Settings",[["path",{d:"M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z",key:"1qme2f"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]])},63236:function(e,t,s){"use strict";s.d(t,{Z:function(){return a}});/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let a=(0,s(87461).Z)("ShieldCheck",[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]])},50489:function(e,t,s){"use strict";s.d(t,{Z:function(){return a}});/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let a=(0,s(87461).Z)("Trash2",[["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6",key:"4alrt4"}],["path",{d:"M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2",key:"v07s0e"}],["line",{x1:"10",x2:"10",y1:"11",y2:"17",key:"1uufr5"}],["line",{x1:"14",x2:"14",y1:"11",y2:"17",key:"xtxkd"}]])},10632:function(e,t,s){"use strict";s.d(t,{Z:function(){return a}});/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let a=(0,s(87461).Z)("Upload",[["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}],["polyline",{points:"17 8 12 3 7 8",key:"t8dd8p"}],["line",{x1:"12",x2:"12",y1:"3",y2:"15",key:"widbto"}]])},63854:function(e,t,s){"use strict";s.d(t,{Z:function(){return a}});/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let a=(0,s(87461).Z)("UserPlus",[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}],["line",{x1:"19",x2:"19",y1:"8",y2:"14",key:"1bvyxn"}],["line",{x1:"22",x2:"16",y1:"11",y2:"11",key:"1shjgl"}]])},34059:function(e,t,s){"use strict";s.d(t,{Z:function(){return a}});/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let a=(0,s(87461).Z)("Users",[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}],["path",{d:"M22 21v-2a4 4 0 0 0-3-3.87",key:"kshegd"}],["path",{d:"M16 3.13a4 4 0 0 1 0 7.75",key:"1da9ce"}]])},71483:function(e,t,s){"use strict";s.d(t,{Z:function(){return a}});/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let a=(0,s(87461).Z)("XCircle",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m15 9-6 6",key:"1uzhvr"}],["path",{d:"m9 9 6 6",key:"z0biqf"}]])},52235:function(e,t,s){"use strict";s.d(t,{Z:function(){return a}});/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let a=(0,s(87461).Z)("X",[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]])}},function(e){e.O(0,[29,852,555,971,69,744],function(){return e(e.s=88320)}),_N_E=e.O()}]);