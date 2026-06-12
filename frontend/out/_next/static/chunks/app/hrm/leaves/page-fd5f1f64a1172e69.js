(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[903],{69280:function(e,t,a){Promise.resolve().then(a.bind(a,10786))},10786:function(e,t,a){"use strict";a.r(t),a.d(t,{default:function(){return x}});var s=a(3827),l=a(49555),n=a(64090),c=a(10826),r=a(70094),i=a(46578),d=a(71483),o=a(52235);let h={PENDING:"badge-yellow",APPROVED:"badge-green",REJECTED:"badge-red"},u=["Annual Leave","Sick Leave","Casual Leave","Maternity Leave","Paternity Leave","LOP (Loss of Pay)","Comp Off","Other"];function x(){let[e,t]=(0,n.useState)([]),[a,x]=(0,n.useState)([]),[m,v]=(0,n.useState)(""),[p,y]=(0,n.useState)(!1),[j,f]=(0,n.useState)({employeeId:"",leaveType:"Annual Leave",fromDate:"",toDate:"",reason:""}),[b,g]=(0,n.useState)(!1),N=()=>{let e=m?"?status=".concat(m):"";c.Z.get("/leaves".concat(e)).then(e=>t(e.data)).catch(()=>{})};(0,n.useEffect)(()=>{N()},[m]),(0,n.useEffect)(()=>{c.Z.get("/employees").then(e=>x(e.data)).catch(()=>{})},[]);let k=async e=>{e.preventDefault(),g(!0);try{let e=Math.ceil((new Date(j.toDate).getTime()-new Date(j.fromDate).getTime())/864e5)+1;await c.Z.post("/leaves",{...j,days:e}),y(!1),f({employeeId:"",leaveType:"Annual Leave",fromDate:"",toDate:"",reason:""}),N()}catch(e){var t,a;alert(null===(a=e.response)||void 0===a?void 0:null===(t=a.data)||void 0===t?void 0:t.message)}finally{g(!1)}},Z=async e=>{await c.Z.put("/leaves/".concat(e,"/approve")),N()},D=async e=>{confirm("Reject this leave?")&&(await c.Z.put("/leaves/".concat(e,"/reject")),N())},C=async e=>{confirm("Delete this leave record?")&&(await c.Z.delete("/leaves/".concat(e)),N())},w=(e,t)=>f(a=>({...a,[e]:t})),M=e.filter(e=>"PENDING"===e.status).length,E=e.filter(e=>"APPROVED"===e.status).length;return(0,s.jsxs)(l.Z,{title:"Leave Management",children:[(0,s.jsxs)("div",{className:"flex flex-wrap items-start justify-between gap-4 mb-5",children:[(0,s.jsxs)("div",{children:[(0,s.jsx)("h2",{className:"page-title",children:"Leave Management"}),(0,s.jsx)("p",{className:"page-sub",children:"Manage and approve employee leave requests"})]}),(0,s.jsxs)("button",{className:"btn-primary",onClick:()=>y(!0),children:[(0,s.jsx)(r.Z,{size:16})," Add Leave"]})]}),(0,s.jsx)("div",{className:"grid grid-cols-3 gap-4 mb-5",children:[{label:"Pending Approvals",val:M,color:"bg-amber-50",tc:"text-amber-700"},{label:"Approved",val:E,color:"bg-emerald-50",tc:"text-emerald-700"},{label:"Total Records",val:e.length,color:"bg-blue-50",tc:"text-accent"}].map(e=>(0,s.jsxs)("div",{className:"card",children:[(0,s.jsx)("div",{className:"text-2xl font-black ".concat(e.tc),children:e.val}),(0,s.jsx)("div",{className:"text-xs text-slate-400 mt-0.5",children:e.label})]},e.label))}),(0,s.jsx)("div",{className:"card mb-4 flex gap-3",children:(0,s.jsxs)("select",{className:"select !w-auto",value:m,onChange:e=>v(e.target.value),children:[(0,s.jsx)("option",{value:"",children:"All Status"}),(0,s.jsx)("option",{children:"PENDING"}),(0,s.jsx)("option",{children:"APPROVED"}),(0,s.jsx)("option",{children:"REJECTED"})]})}),(0,s.jsx)("div",{className:"table-wrap",children:(0,s.jsxs)("table",{className:"w-full",children:[(0,s.jsx)("thead",{className:"table-head",children:(0,s.jsxs)("tr",{children:[(0,s.jsx)("th",{className:"th",children:"Employee"}),(0,s.jsx)("th",{className:"th",children:"Leave Type"}),(0,s.jsx)("th",{className:"th",children:"From"}),(0,s.jsx)("th",{className:"th",children:"To"}),(0,s.jsx)("th",{className:"th",children:"Days"}),(0,s.jsx)("th",{className:"th",children:"Reason"}),(0,s.jsx)("th",{className:"th",children:"Status"}),(0,s.jsx)("th",{className:"th",children:"Actions"})]})}),(0,s.jsx)("tbody",{children:0===e.length?(0,s.jsx)("tr",{children:(0,s.jsx)("td",{colSpan:8,className:"td text-center text-slate-400 py-10",children:"No leave records"})}):e.map(e=>{var t,a;return(0,s.jsxs)("tr",{className:"tr",children:[(0,s.jsxs)("td",{className:"td",children:[(0,s.jsx)("div",{className:"font-semibold",children:null===(t=e.employee)||void 0===t?void 0:t.name}),(0,s.jsx)("div",{className:"text-xs text-slate-400",children:null===(a=e.employee)||void 0===a?void 0:a.department})]}),(0,s.jsx)("td",{className:"td",children:(0,s.jsx)("span",{className:"badge badge-blue",children:e.leaveType})}),(0,s.jsx)("td",{className:"td text-xs",children:new Date(e.fromDate).toLocaleDateString("en-IN")}),(0,s.jsx)("td",{className:"td text-xs",children:new Date(e.toDate).toLocaleDateString("en-IN")}),(0,s.jsx)("td",{className:"td font-bold",children:e.days}),(0,s.jsx)("td",{className:"td text-xs text-slate-500 max-w-[140px] truncate",children:e.reason||"—"}),(0,s.jsx)("td",{className:"td",children:(0,s.jsx)("span",{className:"badge ".concat(h[e.status]),children:e.status})}),(0,s.jsx)("td",{className:"td",children:(0,s.jsxs)("div",{className:"flex gap-1",children:["PENDING"===e.status&&(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)("button",{onClick:()=>Z(e.id),className:"btn-icon text-emerald-600 hover:bg-emerald-50",title:"Approve",children:(0,s.jsx)(i.Z,{size:15})}),(0,s.jsx)("button",{onClick:()=>D(e.id),className:"btn-icon text-red-500 hover:bg-red-50",title:"Reject",children:(0,s.jsx)(d.Z,{size:15})})]}),"APPROVED"===e.status&&(0,s.jsx)("button",{onClick:()=>D(e.id),className:"btn-icon text-red-500 hover:bg-red-50",title:"Revoke & Reject",children:(0,s.jsx)(d.Z,{size:15})}),(0,s.jsx)("button",{onClick:()=>C(e.id),className:"btn-icon text-red-400 hover:bg-red-50",children:(0,s.jsx)(o.Z,{size:14})})]})})]},e.id)})})]})}),p&&(0,s.jsx)("div",{className:"modal-overlay",onClick:e=>e.target===e.currentTarget&&y(!1),children:(0,s.jsxs)("div",{className:"modal-box max-w-md slide-in",children:[(0,s.jsxs)("div",{className:"flex items-center justify-between px-6 py-4 border-b border-cream-dark sticky top-0 bg-white rounded-t-2xl",children:[(0,s.jsx)("h3",{className:"font-bold text-navy",children:"Add Leave Request"}),(0,s.jsx)("button",{onClick:()=>y(!1),className:"btn-icon",children:(0,s.jsx)(o.Z,{size:18})})]}),(0,s.jsxs)("form",{onSubmit:k,className:"p-6 space-y-4",children:[(0,s.jsxs)("div",{children:[(0,s.jsx)("label",{className:"label",children:"Employee *"}),(0,s.jsxs)("select",{className:"select",required:!0,value:j.employeeId,onChange:e=>w("employeeId",e.target.value),children:[(0,s.jsx)("option",{value:"",children:"Select employee"}),a.map(e=>(0,s.jsx)("option",{value:e.id,children:e.name},e.id))]})]}),(0,s.jsxs)("div",{children:[(0,s.jsx)("label",{className:"label",children:"Leave Type *"}),(0,s.jsx)("select",{className:"select",value:j.leaveType,onChange:e=>w("leaveType",e.target.value),children:u.map(e=>(0,s.jsx)("option",{children:e},e))})]}),(0,s.jsxs)("div",{className:"grid grid-cols-2 gap-3",children:[(0,s.jsxs)("div",{children:[(0,s.jsx)("label",{className:"label",children:"From Date *"}),(0,s.jsx)("input",{className:"input",type:"date",required:!0,value:j.fromDate,onChange:e=>w("fromDate",e.target.value)})]}),(0,s.jsxs)("div",{children:[(0,s.jsx)("label",{className:"label",children:"To Date *"}),(0,s.jsx)("input",{className:"input",type:"date",required:!0,value:j.toDate,onChange:e=>w("toDate",e.target.value)})]})]}),j.fromDate&&j.toDate&&(0,s.jsxs)("div",{className:"text-xs font-semibold text-accent p-2 bg-blue-50 rounded-lg",children:["Duration: ",Math.ceil((new Date(j.toDate).getTime()-new Date(j.fromDate).getTime())/864e5)+1," day(s)"]}),(0,s.jsxs)("div",{children:[(0,s.jsx)("label",{className:"label",children:"Reason"}),(0,s.jsx)("textarea",{className:"textarea",rows:3,value:j.reason,onChange:e=>w("reason",e.target.value),placeholder:"Reason for leave..."})]}),(0,s.jsxs)("div",{className:"flex gap-3",children:[(0,s.jsx)("button",{type:"submit",className:"btn-primary flex-1",disabled:b,children:b?"Saving...":"Submit Leave"}),(0,s.jsx)("button",{type:"button",className:"btn-ghost flex-1",onClick:()=>y(!1),children:"Cancel"})]})]})]})})]})}},43345:function(e,t,a){"use strict";a.d(t,{Z:function(){return s}});/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=(0,a(87461).Z)("Bell",[["path",{d:"M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9",key:"1qo2s2"}],["path",{d:"M10.3 21a1.94 1.94 0 0 0 3.4 0",key:"qgo35s"}]])},71107:function(e,t,a){"use strict";a.d(t,{Z:function(){return s}});/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=(0,a(87461).Z)("CalendarX2",[["path",{d:"M8 2v4",key:"1cmpym"}],["path",{d:"M16 2v4",key:"4m81vk"}],["path",{d:"M21 13V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8",key:"3spt84"}],["path",{d:"M3 10h18",key:"8toen8"}],["path",{d:"m17 22 5-5",key:"1k6ppv"}],["path",{d:"m17 17 5 5",key:"p7ous7"}]])},46578:function(e,t,a){"use strict";a.d(t,{Z:function(){return s}});/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=(0,a(87461).Z)("CheckCircle",[["path",{d:"M22 11.08V12a10 10 0 1 1-5.93-9.14",key:"g774vq"}],["path",{d:"m9 11 3 3L22 4",key:"1pflzl"}]])},23441:function(e,t,a){"use strict";a.d(t,{Z:function(){return s}});/**
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
 */let s=(0,a(87461).Z)("Clock",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["polyline",{points:"12 6 12 12 16 14",key:"68esgv"}]])},5423:function(e,t,a){"use strict";a.d(t,{Z:function(){return s}});/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=(0,a(87461).Z)("LayoutDashboard",[["rect",{width:"7",height:"9",x:"3",y:"3",rx:"1",key:"10lvy0"}],["rect",{width:"7",height:"5",x:"14",y:"3",rx:"1",key:"16une8"}],["rect",{width:"7",height:"9",x:"14",y:"12",rx:"1",key:"1hutg5"}],["rect",{width:"7",height:"5",x:"3",y:"16",rx:"1",key:"ldoo1y"}]])},81049:function(e,t,a){"use strict";a.d(t,{Z:function(){return s}});/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=(0,a(87461).Z)("LogOut",[["path",{d:"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4",key:"1uf3rs"}],["polyline",{points:"16 17 21 12 16 7",key:"1gabdz"}],["line",{x1:"21",x2:"9",y1:"12",y2:"12",key:"1uyos4"}]])},70094:function(e,t,a){"use strict";a.d(t,{Z:function(){return s}});/**
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
 */let s=(0,a(87461).Z)("ShieldCheck",[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]])},63854:function(e,t,a){"use strict";a.d(t,{Z:function(){return s}});/**
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
 */let s=(0,a(87461).Z)("X",[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]])}},function(e){e.O(0,[29,852,555,971,69,744],function(){return e(e.s=69280)}),_N_E=e.O()}]);