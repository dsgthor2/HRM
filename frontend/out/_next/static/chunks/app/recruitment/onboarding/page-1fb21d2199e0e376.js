(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[1939],{17874:function(e,t,a){Promise.resolve().then(a.bind(a,37291))},37291:function(e,t,a){"use strict";a.r(t),a.d(t,{default:function(){return h}});var s=a(3827),n=a(30394),l=a(64090),c=a(10826),i=a(97404),r=a(70094),d=a(57976);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let o=(0,a(87461).Z)("Circle",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}]]);var u=a(50489);function h(){let[e,t]=(0,l.useState)([]),[a,h]=(0,l.useState)(""),[x,m]=(0,l.useState)([]),[y,p]=(0,l.useState)("");(0,l.useEffect)(()=>{c.Z.get("/employees").then(e=>t(e.data)).catch(()=>{})},[]);let f=e=>{h(e),e?c.Z.get("/onboarding/".concat(e)).then(e=>m(e.data)).catch(()=>{}):m([])},k=async()=>{a&&(await c.Z.post("/onboarding/init/".concat(a)),f(a))},v=async e=>{await c.Z.put("/onboarding/".concat(e.id),{completed:!e.completed}),f(a)},g=async()=>{y.trim()&&a&&(await c.Z.post("/onboarding",{employeeId:a,taskName:y,dueDate:new Date(Date.now()+6048e5)}),p(""),f(a))},j=async e=>{await c.Z.delete("/onboarding/".concat(e)),f(a)},b=x.filter(e=>e.completed).length,Z=x.length?Math.round(b/x.length*100):0,N=e.find(e=>e.id===a);return(0,s.jsxs)(n.Z,{title:"Onboarding",children:[(0,s.jsxs)("div",{className:"mb-5",children:[(0,s.jsx)("h2",{className:"page-title",children:"Employee Onboarding"}),(0,s.jsx)("p",{className:"page-sub",children:"Track new hire onboarding checklist"})]}),(0,s.jsxs)("div",{className:"grid grid-cols-1 lg:grid-cols-3 gap-5",children:[(0,s.jsxs)("div",{className:"space-y-4",children:[(0,s.jsxs)("div",{className:"card",children:[(0,s.jsx)("label",{className:"label",children:"Select Employee"}),(0,s.jsxs)("select",{className:"select",value:a,onChange:e=>f(e.target.value),children:[(0,s.jsx)("option",{value:"",children:"Choose employee"}),e.map(e=>(0,s.jsx)("option",{value:e.id,children:e.name},e.id))]}),N&&(0,s.jsx)("div",{className:"mt-4 p-3 bg-cream rounded-xl",children:(0,s.jsxs)("div",{className:"flex items-center gap-3",children:[(0,s.jsx)("div",{className:"w-10 h-10 rounded-full bg-navy text-white flex items-center justify-center font-bold",children:N.name[0]}),(0,s.jsxs)("div",{children:[(0,s.jsx)("div",{className:"font-semibold text-navy text-sm",children:N.name}),(0,s.jsx)("div",{className:"text-xs text-slate-400",children:N.designation}),(0,s.jsxs)("div",{className:"text-xs text-slate-400",children:["Joined: ",new Date(N.joinDate).toLocaleDateString("en-IN")]})]})]})})]}),a&&(0,s.jsx)("div",{className:"card",children:0===x.length?(0,s.jsxs)("div",{className:"text-center py-4",children:[(0,s.jsx)("p",{className:"text-sm text-slate-400 mb-3",children:"No tasks yet"}),(0,s.jsxs)("button",{onClick:k,className:"btn-primary w-full flex items-center justify-center gap-2",children:[(0,s.jsx)(i.Z,{size:15})," Initialize Default Tasks"]})]}):(0,s.jsxs)(s.Fragment,{children:[(0,s.jsxs)("div",{className:"mb-4",children:[(0,s.jsxs)("div",{className:"flex items-center justify-between mb-1.5",children:[(0,s.jsx)("span",{className:"text-xs font-semibold text-slate-500",children:"Overall Progress"}),(0,s.jsxs)("span",{className:"text-xs font-bold text-navy",children:[b,"/",x.length]})]}),(0,s.jsx)("div",{className:"h-2.5 bg-cream-dark rounded-full overflow-hidden",children:(0,s.jsx)("div",{className:"h-full bg-navy rounded-full transition-all duration-500",style:{width:"".concat(Z,"%")}})}),(0,s.jsx)("div",{className:"text-center mt-1.5",children:(0,s.jsxs)("span",{className:"text-sm font-black ".concat(100===Z?"text-emerald-600":"text-navy"),children:[Z,"% ",100===Z?"✅ Complete!":"complete"]})})]}),(0,s.jsxs)("button",{onClick:k,className:"btn-ghost w-full btn-sm",children:[(0,s.jsx)(i.Z,{size:13})," Reset to Defaults"]})]})}),a&&(0,s.jsxs)("div",{className:"card",children:[(0,s.jsx)("label",{className:"label",children:"Add Custom Task"}),(0,s.jsxs)("div",{className:"flex gap-2",children:[(0,s.jsx)("input",{className:"input",placeholder:"Task name...",value:y,onChange:e=>p(e.target.value),onKeyDown:e=>"Enter"===e.key&&g()}),(0,s.jsx)("button",{className:"btn-primary px-3",onClick:g,children:(0,s.jsx)(r.Z,{size:15})})]})]})]}),(0,s.jsx)("div",{className:"col-span-2",children:a?0===x.length?(0,s.jsx)("div",{className:"card flex flex-col items-center justify-center h-64 text-slate-400",children:(0,s.jsx)("p",{className:"text-sm",children:'Click "Initialize Default Tasks" to get started'})}):(0,s.jsxs)("div",{className:"card",children:[(0,s.jsxs)("h3",{className:"font-bold text-navy mb-4 flex items-center gap-2",children:["Onboarding Checklist",(0,s.jsxs)("span",{className:"badge badge-navy text-xs",children:[x.length," tasks"]})]}),(0,s.jsx)("div",{className:"space-y-2",children:x.map(e=>(0,s.jsxs)("div",{className:"flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all cursor-pointer group\n                      ".concat(e.completed?"bg-emerald-50 border-emerald-200":"bg-cream border-transparent hover:border-cream-border"),onClick:()=>v(e),children:[(0,s.jsx)("div",{className:"flex-shrink-0",children:e.completed?(0,s.jsx)(d.Z,{size:20,className:"text-emerald-600"}):(0,s.jsx)(o,{size:20,className:"text-slate-300 group-hover:text-slate-400"})}),(0,s.jsx)("span",{className:"flex-1 text-sm font-medium ".concat(e.completed?"line-through text-slate-400":"text-navy"),children:e.taskName}),e.completedAt&&(0,s.jsxs)("span",{className:"text-[10px] text-emerald-600 font-semibold flex-shrink-0",children:["✓ ",new Date(e.completedAt).toLocaleDateString("en-IN")]}),e.dueDate&&!e.completed&&(0,s.jsxs)("span",{className:"text-[10px] text-slate-400 flex-shrink-0",children:["Due: ",new Date(e.dueDate).toLocaleDateString("en-IN")]}),(0,s.jsx)("button",{onClick:t=>{t.stopPropagation(),j(e.id)},className:"opacity-0 group-hover:opacity-100 btn-icon text-red-400 hover:bg-red-50 ml-1 flex-shrink-0",title:"Remove task",children:(0,s.jsx)(u.Z,{size:13})})]},e.id))})]}):(0,s.jsxs)("div",{className:"card flex flex-col items-center justify-center h-64 text-slate-400",children:[(0,s.jsx)(d.Z,{size:48,className:"mb-3 opacity-20"}),(0,s.jsx)("p",{className:"text-sm",children:"Select an employee to manage onboarding"})]})})]})]})}},43345:function(e,t,a){"use strict";a.d(t,{Z:function(){return s}});/**
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
 */let s=(0,a(87461).Z)("MonitorSmartphone",[["path",{d:"M18 8V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h8",key:"10dyio"}],["path",{d:"M10 19v-3.96 3.15",key:"1irgej"}],["path",{d:"M7 19h5",key:"qswx4l"}],["rect",{width:"6",height:"10",x:"16",y:"12",rx:"2",key:"1egngj"}]])},70094:function(e,t,a){"use strict";a.d(t,{Z:function(){return s}});/**
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
 */let s=(0,a(87461).Z)("ShieldCheck",[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]])},77326:function(e,t,a){"use strict";a.d(t,{Z:function(){return s}});/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=(0,a(87461).Z)("Shield",[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}]])},50489:function(e,t,a){"use strict";a.d(t,{Z:function(){return s}});/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=(0,a(87461).Z)("Trash2",[["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6",key:"4alrt4"}],["path",{d:"M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2",key:"v07s0e"}],["line",{x1:"10",x2:"10",y1:"11",y2:"17",key:"1uufr5"}],["line",{x1:"14",x2:"14",y1:"11",y2:"17",key:"xtxkd"}]])},63854:function(e,t,a){"use strict";a.d(t,{Z:function(){return s}});/**
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
 */let s=(0,a(87461).Z)("X",[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]])},97404:function(e,t,a){"use strict";a.d(t,{Z:function(){return s}});/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=(0,a(87461).Z)("Zap",[["polygon",{points:"13 2 3 14 12 14 11 22 21 10 12 10 13 2",key:"45s27k"}]])},47907:function(e,t,a){"use strict";var s=a(15313);a.o(s,"usePathname")&&a.d(t,{usePathname:function(){return s.usePathname}}),a.o(s,"useRouter")&&a.d(t,{useRouter:function(){return s.useRouter}}),a.o(s,"useSearchParams")&&a.d(t,{useSearchParams:function(){return s.useSearchParams}})}},function(e){e.O(0,[9546,958,394,2971,5468,1744],function(){return e(e.s=17874)}),_N_E=e.O()}]);