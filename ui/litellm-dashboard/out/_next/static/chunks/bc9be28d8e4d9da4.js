(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,233525,(e,t,r)=>{"use strict";Object.defineProperty(r,"__esModule",{value:!0}),Object.defineProperty(r,"warnOnce",{enumerable:!0,get:function(){return a}});let a=e=>{}},653496,e=>{"use strict";var t=e.i(721369);e.s(["Tabs",()=>t.default])},475254,e=>{"use strict";var t=e.i(271645);let r=e=>{let t=e.replace(/^([A-Z])|[\s-_]+(\w)/g,(e,t,r)=>r?r.toUpperCase():t.toLowerCase());return t.charAt(0).toUpperCase()+t.slice(1)},a=(...e)=>e.filter((e,t,r)=>!!e&&""!==e.trim()&&r.indexOf(e)===t).join(" ").trim();var i={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};let n=(0,t.forwardRef)(({color:e="currentColor",size:r=24,strokeWidth:n=2,absoluteStrokeWidth:o,className:l="",children:s,iconNode:d,...c},p)=>(0,t.createElement)("svg",{ref:p,...i,width:r,height:r,stroke:e,strokeWidth:o?24*Number(n)/Number(r):n,className:a("lucide",l),...!s&&!(e=>{for(let t in e)if(t.startsWith("aria-")||"role"===t||"title"===t)return!0})(c)&&{"aria-hidden":"true"},...c},[...d.map(([e,r])=>(0,t.createElement)(e,r)),...Array.isArray(s)?s:[s]])),o=(e,i)=>{let o=(0,t.forwardRef)(({className:o,...l},s)=>(0,t.createElement)(n,{ref:s,iconNode:i,className:a(`lucide-${r(e).replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase()}`,`lucide-${e}`,o),...l}));return o.displayName=r(e),o};e.s(["default",()=>o],475254)},599724,936325,e=>{"use strict";var t=e.i(95779),r=e.i(444755),a=e.i(673706),i=e.i(271645);let n=i.default.forwardRef((e,n)=>{let{color:o,className:l,children:s}=e;return i.default.createElement("p",{ref:n,className:(0,r.tremorTwMerge)("text-tremor-default",o?(0,a.getColorClassNames)(o,t.colorPalette.text).textColor:(0,r.tremorTwMerge)("text-tremor-content","dark:text-dark-tremor-content"),l)},s)});n.displayName="Text",e.s(["default",()=>n],936325),e.s(["Text",()=>n],599724)},304967,e=>{"use strict";var t=e.i(290571),r=e.i(271645),a=e.i(480731),i=e.i(95779),n=e.i(444755),o=e.i(673706);let l=(0,o.makeClassName)("Card"),s=r.default.forwardRef((e,s)=>{let{decoration:d="",decorationColor:c,children:p,className:m}=e,u=(0,t.__rest)(e,["decoration","decorationColor","children","className"]);return r.default.createElement("div",Object.assign({ref:s,className:(0,n.tremorTwMerge)(l("root"),"relative w-full text-left ring-1 rounded-tremor-default p-6","bg-tremor-background ring-tremor-ring shadow-tremor-card","dark:bg-dark-tremor-background dark:ring-dark-tremor-ring dark:shadow-dark-tremor-card",c?(0,o.getColorClassNames)(c,i.colorPalette.border).borderColor:"border-tremor-brand dark:border-dark-tremor-brand",(e=>{if(!e)return"";switch(e){case a.HorizontalPositions.Left:return"border-l-4";case a.VerticalPositions.Top:return"border-t-4";case a.HorizontalPositions.Right:return"border-r-4";case a.VerticalPositions.Bottom:return"border-b-4";default:return""}})(d),m)},u),p)});s.displayName="Card",e.s(["Card",()=>s],304967)},994388,e=>{"use strict";var t=e.i(290571),r=e.i(829087),a=e.i(271645);let i=["preEnter","entering","entered","preExit","exiting","exited","unmounted"],n=e=>({_s:e,status:i[e],isEnter:e<3,isMounted:6!==e,isResolved:2===e||e>4}),o=e=>e?6:5,l=(e,t,r,a,i)=>{clearTimeout(a.current);let o=n(e);t(o),r.current=o,i&&i({current:o})};var s=e.i(480731),d=e.i(444755),c=e.i(673706);let p=e=>{var r=(0,t.__rest)(e,[]);return a.default.createElement("svg",Object.assign({},r,{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"currentColor"}),a.default.createElement("path",{fill:"none",d:"M0 0h24v24H0z"}),a.default.createElement("path",{d:"M18.364 5.636L16.95 7.05A7 7 0 1 0 19 12h2a9 9 0 1 1-2.636-6.364z"}))};var m=e.i(95779);let u={xs:{height:"h-4",width:"w-4"},sm:{height:"h-5",width:"w-5"},md:{height:"h-5",width:"w-5"},lg:{height:"h-6",width:"w-6"},xl:{height:"h-6",width:"w-6"}},g=(e,t)=>{switch(e){case"primary":return{textColor:t?(0,c.getColorClassNames)("white").textColor:"text-tremor-brand-inverted dark:text-dark-tremor-brand-inverted",hoverTextColor:t?(0,c.getColorClassNames)("white").textColor:"text-tremor-brand-inverted dark:text-dark-tremor-brand-inverted",bgColor:t?(0,c.getColorClassNames)(t,m.colorPalette.background).bgColor:"bg-tremor-brand dark:bg-dark-tremor-brand",hoverBgColor:t?(0,c.getColorClassNames)(t,m.colorPalette.darkBackground).hoverBgColor:"hover:bg-tremor-brand-emphasis dark:hover:bg-dark-tremor-brand-emphasis",borderColor:t?(0,c.getColorClassNames)(t,m.colorPalette.border).borderColor:"border-tremor-brand dark:border-dark-tremor-brand",hoverBorderColor:t?(0,c.getColorClassNames)(t,m.colorPalette.darkBorder).hoverBorderColor:"hover:border-tremor-brand-emphasis dark:hover:border-dark-tremor-brand-emphasis"};case"secondary":return{textColor:t?(0,c.getColorClassNames)(t,m.colorPalette.text).textColor:"text-tremor-brand dark:text-dark-tremor-brand",hoverTextColor:t?(0,c.getColorClassNames)(t,m.colorPalette.text).textColor:"hover:text-tremor-brand-emphasis dark:hover:text-dark-tremor-brand-emphasis",bgColor:(0,c.getColorClassNames)("transparent").bgColor,hoverBgColor:t?(0,d.tremorTwMerge)((0,c.getColorClassNames)(t,m.colorPalette.background).hoverBgColor,"hover:bg-opacity-20 dark:hover:bg-opacity-20"):"hover:bg-tremor-brand-faint dark:hover:bg-dark-tremor-brand-faint",borderColor:t?(0,c.getColorClassNames)(t,m.colorPalette.border).borderColor:"border-tremor-brand dark:border-dark-tremor-brand"};case"light":return{textColor:t?(0,c.getColorClassNames)(t,m.colorPalette.text).textColor:"text-tremor-brand dark:text-dark-tremor-brand",hoverTextColor:t?(0,c.getColorClassNames)(t,m.colorPalette.darkText).hoverTextColor:"hover:text-tremor-brand-emphasis dark:hover:text-dark-tremor-brand-emphasis",bgColor:(0,c.getColorClassNames)("transparent").bgColor,borderColor:"",hoverBorderColor:""}}},f=(0,c.makeClassName)("Button"),h=({loading:e,iconSize:t,iconPosition:r,Icon:i,needMargin:n,transitionStatus:o})=>{let l=n?r===s.HorizontalPositions.Left?(0,d.tremorTwMerge)("-ml-1","mr-1.5"):(0,d.tremorTwMerge)("-mr-1","ml-1.5"):"",c=(0,d.tremorTwMerge)("w-0 h-0"),m={default:c,entering:c,entered:t,exiting:t,exited:c};return e?a.default.createElement(p,{className:(0,d.tremorTwMerge)(f("icon"),"animate-spin shrink-0",l,m.default,m[o]),style:{transition:"width 150ms"}}):a.default.createElement(i,{className:(0,d.tremorTwMerge)(f("icon"),"shrink-0",t,l)})},b=a.default.forwardRef((e,i)=>{let{icon:p,iconPosition:m=s.HorizontalPositions.Left,size:b=s.Sizes.SM,color:_,variant:x="primary",disabled:y,loading:w=!1,loadingText:v,children:I,tooltip:C,className:k}=e,S=(0,t.__rest)(e,["icon","iconPosition","size","color","variant","disabled","loading","loadingText","children","tooltip","className"]),$=w||y,A=void 0!==p||w,E=w&&v,O=!(!I&&!E),N=(0,d.tremorTwMerge)(u[b].height,u[b].width),j="light"!==x?(0,d.tremorTwMerge)("rounded-tremor-default border","shadow-tremor-input","dark:shadow-dark-tremor-input"):"",T=g(x,_),M=("light"!==x?{xs:{paddingX:"px-2.5",paddingY:"py-1.5",fontSize:"text-xs"},sm:{paddingX:"px-4",paddingY:"py-2",fontSize:"text-sm"},md:{paddingX:"px-4",paddingY:"py-2",fontSize:"text-md"},lg:{paddingX:"px-4",paddingY:"py-2.5",fontSize:"text-lg"},xl:{paddingX:"px-4",paddingY:"py-3",fontSize:"text-xl"}}:{xs:{paddingX:"",paddingY:"",fontSize:"text-xs"},sm:{paddingX:"",paddingY:"",fontSize:"text-sm"},md:{paddingX:"",paddingY:"",fontSize:"text-md"},lg:{paddingX:"",paddingY:"",fontSize:"text-lg"},xl:{paddingX:"",paddingY:"",fontSize:"text-xl"}})[b],{tooltipProps:P,getReferenceProps:z}=(0,r.useTooltip)(300),[R,L]=(({enter:e=!0,exit:t=!0,preEnter:r,preExit:i,timeout:s,initialEntered:d,mountOnEnter:c,unmountOnExit:p,onStateChange:m}={})=>{let[u,g]=(0,a.useState)(()=>n(d?2:o(c))),f=(0,a.useRef)(u),h=(0,a.useRef)(0),[b,_]="object"==typeof s?[s.enter,s.exit]:[s,s],x=(0,a.useCallback)(()=>{let e=((e,t)=>{switch(e){case 1:case 0:return 2;case 4:case 3:return o(t)}})(f.current._s,p);e&&l(e,g,f,h,m)},[m,p]);return[u,(0,a.useCallback)(a=>{let n=e=>{switch(l(e,g,f,h,m),e){case 1:b>=0&&(h.current=((...e)=>setTimeout(...e))(x,b));break;case 4:_>=0&&(h.current=((...e)=>setTimeout(...e))(x,_));break;case 0:case 3:h.current=((...e)=>setTimeout(...e))(()=>{isNaN(document.body.offsetTop)||n(e+1)},0)}},s=f.current.isEnter;"boolean"!=typeof a&&(a=!s),a?s||n(e?+!r:2):s&&n(t?i?3:4:o(p))},[x,m,e,t,r,i,b,_,p]),x]})({timeout:50});return(0,a.useEffect)(()=>{L(w)},[w]),a.default.createElement("button",Object.assign({ref:(0,c.mergeRefs)([i,P.refs.setReference]),className:(0,d.tremorTwMerge)(f("root"),"shrink-0 inline-flex justify-center items-center group font-medium outline-none",j,M.paddingX,M.paddingY,M.fontSize,T.textColor,T.bgColor,T.borderColor,T.hoverBorderColor,$?"opacity-50 cursor-not-allowed":(0,d.tremorTwMerge)(g(x,_).hoverTextColor,g(x,_).hoverBgColor,g(x,_).hoverBorderColor),k),disabled:$},z,S),a.default.createElement(r.default,Object.assign({text:C},P)),A&&m!==s.HorizontalPositions.Right?a.default.createElement(h,{loading:w,iconSize:N,iconPosition:m,Icon:p,transitionStatus:R.status,needMargin:O}):null,E||I?a.default.createElement("span",{className:(0,d.tremorTwMerge)(f("text"),"text-tremor-default whitespace-nowrap")},E?v:I):null,A&&m===s.HorizontalPositions.Right?a.default.createElement(h,{loading:w,iconSize:N,iconPosition:m,Icon:p,transitionStatus:R.status,needMargin:O}):null)});b.displayName="Button",e.s(["Button",()=>b],994388)},629569,e=>{"use strict";var t=e.i(290571),r=e.i(95779),a=e.i(444755),i=e.i(673706),n=e.i(271645);let o=n.default.forwardRef((e,o)=>{let{color:l,children:s,className:d}=e,c=(0,t.__rest)(e,["color","children","className"]);return n.default.createElement("p",Object.assign({ref:o,className:(0,a.tremorTwMerge)("font-medium text-tremor-title",l?(0,i.getColorClassNames)(l,r.colorPalette.darkText).textColor:"text-tremor-content-strong dark:text-dark-tremor-content-strong",d)},c),s)});o.displayName="Title",e.s(["Title",()=>o],629569)},790848,e=>{"use strict";e.i(247167);var t=e.i(271645),r=e.i(739295),a=e.i(343794),i=e.i(931067),n=e.i(211577),o=e.i(392221),l=e.i(703923),s=e.i(914949),d=e.i(404948),c=["prefixCls","className","checked","defaultChecked","disabled","loadingIcon","checkedChildren","unCheckedChildren","onClick","onChange","onKeyDown"],p=t.forwardRef(function(e,r){var p,m=e.prefixCls,u=void 0===m?"rc-switch":m,g=e.className,f=e.checked,h=e.defaultChecked,b=e.disabled,_=e.loadingIcon,x=e.checkedChildren,y=e.unCheckedChildren,w=e.onClick,v=e.onChange,I=e.onKeyDown,C=(0,l.default)(e,c),k=(0,s.default)(!1,{value:f,defaultValue:h}),S=(0,o.default)(k,2),$=S[0],A=S[1];function E(e,t){var r=$;return b||(A(r=e),null==v||v(r,t)),r}var O=(0,a.default)(u,g,(p={},(0,n.default)(p,"".concat(u,"-checked"),$),(0,n.default)(p,"".concat(u,"-disabled"),b),p));return t.createElement("button",(0,i.default)({},C,{type:"button",role:"switch","aria-checked":$,disabled:b,className:O,ref:r,onKeyDown:function(e){e.which===d.default.LEFT?E(!1,e):e.which===d.default.RIGHT&&E(!0,e),null==I||I(e)},onClick:function(e){var t=E(!$,e);null==w||w(t,e)}}),_,t.createElement("span",{className:"".concat(u,"-inner")},t.createElement("span",{className:"".concat(u,"-inner-checked")},x),t.createElement("span",{className:"".concat(u,"-inner-unchecked")},y)))});p.displayName="Switch";var m=e.i(121872),u=e.i(242064),g=e.i(937328),f=e.i(517455);e.i(296059);var h=e.i(915654);e.i(262370);var b=e.i(135551),_=e.i(183293),x=e.i(246422),y=e.i(838378);let w=(0,x.genStyleHooks)("Switch",e=>{let t=(0,y.mergeToken)(e,{switchDuration:e.motionDurationMid,switchColor:e.colorPrimary,switchDisabledOpacity:e.opacityLoading,switchLoadingIconSize:e.calc(e.fontSizeIcon).mul(.75).equal(),switchLoadingIconColor:`rgba(0, 0, 0, ${e.opacityLoading})`,switchHandleActiveInset:"-30%"});return[(e=>{let{componentCls:t,trackHeight:r,trackMinWidth:a}=e;return{[t]:Object.assign(Object.assign(Object.assign(Object.assign({},(0,_.resetComponent)(e)),{position:"relative",display:"inline-block",boxSizing:"border-box",minWidth:a,height:r,lineHeight:(0,h.unit)(r),verticalAlign:"middle",background:e.colorTextQuaternary,border:"0",borderRadius:100,cursor:"pointer",transition:`all ${e.motionDurationMid}`,userSelect:"none",[`&:hover:not(${t}-disabled)`]:{background:e.colorTextTertiary}}),(0,_.genFocusStyle)(e)),{[`&${t}-checked`]:{background:e.switchColor,[`&:hover:not(${t}-disabled)`]:{background:e.colorPrimaryHover}},[`&${t}-loading, &${t}-disabled`]:{cursor:"not-allowed",opacity:e.switchDisabledOpacity,"*":{boxShadow:"none",cursor:"not-allowed"}},[`&${t}-rtl`]:{direction:"rtl"}})}})(t),(e=>{let{componentCls:t,trackHeight:r,trackPadding:a,innerMinMargin:i,innerMaxMargin:n,handleSize:o,calc:l}=e,s=`${t}-inner`,d=(0,h.unit)(l(o).add(l(a).mul(2)).equal()),c=(0,h.unit)(l(n).mul(2).equal());return{[t]:{[s]:{display:"block",overflow:"hidden",borderRadius:100,height:"100%",paddingInlineStart:n,paddingInlineEnd:i,transition:`padding-inline-start ${e.switchDuration} ease-in-out, padding-inline-end ${e.switchDuration} ease-in-out`,[`${s}-checked, ${s}-unchecked`]:{display:"block",color:e.colorTextLightSolid,fontSize:e.fontSizeSM,transition:`margin-inline-start ${e.switchDuration} ease-in-out, margin-inline-end ${e.switchDuration} ease-in-out`,pointerEvents:"none",minHeight:r},[`${s}-checked`]:{marginInlineStart:`calc(-100% + ${d} - ${c})`,marginInlineEnd:`calc(100% - ${d} + ${c})`},[`${s}-unchecked`]:{marginTop:l(r).mul(-1).equal(),marginInlineStart:0,marginInlineEnd:0}},[`&${t}-checked ${s}`]:{paddingInlineStart:i,paddingInlineEnd:n,[`${s}-checked`]:{marginInlineStart:0,marginInlineEnd:0},[`${s}-unchecked`]:{marginInlineStart:`calc(100% - ${d} + ${c})`,marginInlineEnd:`calc(-100% + ${d} - ${c})`}},[`&:not(${t}-disabled):active`]:{[`&:not(${t}-checked) ${s}`]:{[`${s}-unchecked`]:{marginInlineStart:l(a).mul(2).equal(),marginInlineEnd:l(a).mul(-1).mul(2).equal()}},[`&${t}-checked ${s}`]:{[`${s}-checked`]:{marginInlineStart:l(a).mul(-1).mul(2).equal(),marginInlineEnd:l(a).mul(2).equal()}}}}}})(t),(e=>{let{componentCls:t,trackPadding:r,handleBg:a,handleShadow:i,handleSize:n,calc:o}=e,l=`${t}-handle`;return{[t]:{[l]:{position:"absolute",top:r,insetInlineStart:r,width:n,height:n,transition:`all ${e.switchDuration} ease-in-out`,"&::before":{position:"absolute",top:0,insetInlineEnd:0,bottom:0,insetInlineStart:0,backgroundColor:a,borderRadius:o(n).div(2).equal(),boxShadow:i,transition:`all ${e.switchDuration} ease-in-out`,content:'""'}},[`&${t}-checked ${l}`]:{insetInlineStart:`calc(100% - ${(0,h.unit)(o(n).add(r).equal())})`},[`&:not(${t}-disabled):active`]:{[`${l}::before`]:{insetInlineEnd:e.switchHandleActiveInset,insetInlineStart:0},[`&${t}-checked ${l}::before`]:{insetInlineEnd:0,insetInlineStart:e.switchHandleActiveInset}}}}})(t),(e=>{let{componentCls:t,handleSize:r,calc:a}=e;return{[t]:{[`${t}-loading-icon${e.iconCls}`]:{position:"relative",top:a(a(r).sub(e.fontSize)).div(2).equal(),color:e.switchLoadingIconColor,verticalAlign:"top"},[`&${t}-checked ${t}-loading-icon`]:{color:e.switchColor}}}})(t),(e=>{let{componentCls:t,trackHeightSM:r,trackPadding:a,trackMinWidthSM:i,innerMinMarginSM:n,innerMaxMarginSM:o,handleSizeSM:l,calc:s}=e,d=`${t}-inner`,c=(0,h.unit)(s(l).add(s(a).mul(2)).equal()),p=(0,h.unit)(s(o).mul(2).equal());return{[t]:{[`&${t}-small`]:{minWidth:i,height:r,lineHeight:(0,h.unit)(r),[`${t}-inner`]:{paddingInlineStart:o,paddingInlineEnd:n,[`${d}-checked, ${d}-unchecked`]:{minHeight:r},[`${d}-checked`]:{marginInlineStart:`calc(-100% + ${c} - ${p})`,marginInlineEnd:`calc(100% - ${c} + ${p})`},[`${d}-unchecked`]:{marginTop:s(r).mul(-1).equal(),marginInlineStart:0,marginInlineEnd:0}},[`${t}-handle`]:{width:l,height:l},[`${t}-loading-icon`]:{top:s(s(l).sub(e.switchLoadingIconSize)).div(2).equal(),fontSize:e.switchLoadingIconSize},[`&${t}-checked`]:{[`${t}-inner`]:{paddingInlineStart:n,paddingInlineEnd:o,[`${d}-checked`]:{marginInlineStart:0,marginInlineEnd:0},[`${d}-unchecked`]:{marginInlineStart:`calc(100% - ${c} + ${p})`,marginInlineEnd:`calc(-100% + ${c} - ${p})`}},[`${t}-handle`]:{insetInlineStart:`calc(100% - ${(0,h.unit)(s(l).add(a).equal())})`}},[`&:not(${t}-disabled):active`]:{[`&:not(${t}-checked) ${d}`]:{[`${d}-unchecked`]:{marginInlineStart:s(e.marginXXS).div(2).equal(),marginInlineEnd:s(e.marginXXS).mul(-1).div(2).equal()}},[`&${t}-checked ${d}`]:{[`${d}-checked`]:{marginInlineStart:s(e.marginXXS).mul(-1).div(2).equal(),marginInlineEnd:s(e.marginXXS).div(2).equal()}}}}}}})(t)]},e=>{let{fontSize:t,lineHeight:r,controlHeight:a,colorWhite:i}=e,n=t*r,o=a/2,l=n-4,s=o-4;return{trackHeight:n,trackHeightSM:o,trackMinWidth:2*l+8,trackMinWidthSM:2*s+4,trackPadding:2,handleBg:i,handleSize:l,handleSizeSM:s,handleShadow:`0 2px 4px 0 ${new b.FastColor("#00230b").setA(.2).toRgbString()}`,innerMinMargin:l/2,innerMaxMargin:l+2+4,innerMinMarginSM:s/2,innerMaxMarginSM:s+2+4}});var v=function(e,t){var r={};for(var a in e)Object.prototype.hasOwnProperty.call(e,a)&&0>t.indexOf(a)&&(r[a]=e[a]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols)for(var i=0,a=Object.getOwnPropertySymbols(e);i<a.length;i++)0>t.indexOf(a[i])&&Object.prototype.propertyIsEnumerable.call(e,a[i])&&(r[a[i]]=e[a[i]]);return r};let I=t.forwardRef((e,i)=>{let{prefixCls:n,size:o,disabled:l,loading:d,className:c,rootClassName:h,style:b,checked:_,value:x,defaultChecked:y,defaultValue:I,onChange:C}=e,k=v(e,["prefixCls","size","disabled","loading","className","rootClassName","style","checked","value","defaultChecked","defaultValue","onChange"]),[S,$]=(0,s.default)(!1,{value:null!=_?_:x,defaultValue:null!=y?y:I}),{getPrefixCls:A,direction:E,switch:O}=t.useContext(u.ConfigContext),N=t.useContext(g.default),j=(null!=l?l:N)||d,T=A("switch",n),M=t.createElement("div",{className:`${T}-handle`},d&&t.createElement(r.default,{className:`${T}-loading-icon`})),[P,z,R]=w(T),L=(0,f.default)(o),D=(0,a.default)(null==O?void 0:O.className,{[`${T}-small`]:"small"===L,[`${T}-loading`]:d,[`${T}-rtl`]:"rtl"===E},c,h,z,R),G=Object.assign(Object.assign({},null==O?void 0:O.style),b);return P(t.createElement(m.default,{component:"Switch",disabled:j},t.createElement(p,Object.assign({},k,{checked:S,onChange:(...e)=>{$(e[0]),null==C||C.apply(void 0,e)},prefixCls:T,className:D,style:G,disabled:j,ref:i,loadingIcon:M}))))});I.__ANT_SWITCH=!0,e.s(["Switch",0,I],790848)},38243,908286,e=>{"use strict";e.i(247167);var t=e.i(271645),r=e.i(343794),a=e.i(876556);function i(e){return["small","middle","large"].includes(e)}function n(e){return!!e&&"number"==typeof e&&!Number.isNaN(e)}e.s(["isPresetSize",()=>i,"isValidGapNumber",()=>n],908286);var o=e.i(242064),l=e.i(249616),s=e.i(372409),d=e.i(246422);let c=(0,d.genStyleHooks)(["Space","Addon"],e=>[(e=>{let{componentCls:t,borderRadius:r,paddingSM:a,colorBorder:i,paddingXS:n,fontSizeLG:o,fontSizeSM:l,borderRadiusLG:d,borderRadiusSM:c,colorBgContainerDisabled:p,lineWidth:m}=e;return{[t]:[{display:"inline-flex",alignItems:"center",gap:0,paddingInline:a,margin:0,background:p,borderWidth:m,borderStyle:"solid",borderColor:i,borderRadius:r,"&-large":{fontSize:o,borderRadius:d},"&-small":{paddingInline:n,borderRadius:c,fontSize:l},"&-compact-last-item":{borderEndStartRadius:0,borderStartStartRadius:0},"&-compact-first-item":{borderEndEndRadius:0,borderStartEndRadius:0},"&-compact-item:not(:first-child):not(:last-child)":{borderRadius:0},"&-compact-item:not(:last-child)":{borderInlineEndWidth:0}},(0,s.genCompactItemStyle)(e,{focus:!1})]}})(e)]);var p=function(e,t){var r={};for(var a in e)Object.prototype.hasOwnProperty.call(e,a)&&0>t.indexOf(a)&&(r[a]=e[a]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols)for(var i=0,a=Object.getOwnPropertySymbols(e);i<a.length;i++)0>t.indexOf(a[i])&&Object.prototype.propertyIsEnumerable.call(e,a[i])&&(r[a[i]]=e[a[i]]);return r};let m=t.default.forwardRef((e,a)=>{let{className:i,children:n,style:s,prefixCls:d}=e,m=p(e,["className","children","style","prefixCls"]),{getPrefixCls:u,direction:g}=t.default.useContext(o.ConfigContext),f=u("space-addon",d),[h,b,_]=c(f),{compactItemClassnames:x,compactSize:y}=(0,l.useCompactItemContext)(f,g),w=(0,r.default)(f,b,x,_,{[`${f}-${y}`]:y},i);return h(t.default.createElement("div",Object.assign({ref:a,className:w,style:s},m),n))}),u=t.default.createContext({latestIndex:0}),g=u.Provider,f=({className:e,index:r,children:a,split:i,style:n})=>{let{latestIndex:o}=t.useContext(u);return null==a?null:t.createElement(t.Fragment,null,t.createElement("div",{className:e,style:n},a),r<o&&i&&t.createElement("span",{className:`${e}-split`},i))};var h=e.i(838378);let b=(0,d.genStyleHooks)("Space",e=>{let t=(0,h.mergeToken)(e,{spaceGapSmallSize:e.paddingXS,spaceGapMiddleSize:e.padding,spaceGapLargeSize:e.paddingLG});return[(e=>{let{componentCls:t,antCls:r}=e;return{[t]:{display:"inline-flex","&-rtl":{direction:"rtl"},"&-vertical":{flexDirection:"column"},"&-align":{flexDirection:"column","&-center":{alignItems:"center"},"&-start":{alignItems:"flex-start"},"&-end":{alignItems:"flex-end"},"&-baseline":{alignItems:"baseline"}},[`${t}-item:empty`]:{display:"none"},[`${t}-item > ${r}-badge-not-a-wrapper:only-child`]:{display:"block"}}}})(t),(e=>{let{componentCls:t}=e;return{[t]:{"&-gap-row-small":{rowGap:e.spaceGapSmallSize},"&-gap-row-middle":{rowGap:e.spaceGapMiddleSize},"&-gap-row-large":{rowGap:e.spaceGapLargeSize},"&-gap-col-small":{columnGap:e.spaceGapSmallSize},"&-gap-col-middle":{columnGap:e.spaceGapMiddleSize},"&-gap-col-large":{columnGap:e.spaceGapLargeSize}}}})(t)]},()=>({}),{resetStyle:!1});var _=function(e,t){var r={};for(var a in e)Object.prototype.hasOwnProperty.call(e,a)&&0>t.indexOf(a)&&(r[a]=e[a]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols)for(var i=0,a=Object.getOwnPropertySymbols(e);i<a.length;i++)0>t.indexOf(a[i])&&Object.prototype.propertyIsEnumerable.call(e,a[i])&&(r[a[i]]=e[a[i]]);return r};let x=t.forwardRef((e,l)=>{var s;let{getPrefixCls:d,direction:c,size:p,className:m,style:u,classNames:h,styles:x}=(0,o.useComponentConfig)("space"),{size:y=null!=p?p:"small",align:w,className:v,rootClassName:I,children:C,direction:k="horizontal",prefixCls:S,split:$,style:A,wrap:E=!1,classNames:O,styles:N}=e,j=_(e,["size","align","className","rootClassName","children","direction","prefixCls","split","style","wrap","classNames","styles"]),[T,M]=Array.isArray(y)?y:[y,y],P=i(M),z=i(T),R=n(M),L=n(T),D=(0,a.default)(C,{keepEmpty:!0}),G=void 0===w&&"horizontal"===k?"center":w,H=d("space",S),[B,V,q]=b(H),F=(0,r.default)(H,m,V,`${H}-${k}`,{[`${H}-rtl`]:"rtl"===c,[`${H}-align-${G}`]:G,[`${H}-gap-row-${M}`]:P,[`${H}-gap-col-${T}`]:z},v,I,q),W=(0,r.default)(`${H}-item`,null!=(s=null==O?void 0:O.item)?s:h.item),X=Object.assign(Object.assign({},x.item),null==N?void 0:N.item),Y=D.map((e,r)=>{let a=(null==e?void 0:e.key)||`${W}-${r}`;return t.createElement(f,{className:W,key:a,index:r,split:$,style:X},e)}),U=t.useMemo(()=>({latestIndex:D.reduce((e,t,r)=>null!=t?r:e,0)}),[D]);if(0===D.length)return null;let J={};return E&&(J.flexWrap="wrap"),!z&&L&&(J.columnGap=T),!P&&R&&(J.rowGap=M),B(t.createElement("div",Object.assign({ref:l,className:F,style:Object.assign(Object.assign(Object.assign({},J),u),A)},j),t.createElement(g,{value:U},Y)))});x.Compact=l.default,x.Addon=m,e.s(["default",0,x],38243)},770914,e=>{"use strict";var t=e.i(38243);e.s(["Space",()=>t.default])},991124,e=>{"use strict";let t=(0,e.i(475254).default)("copy",[["rect",{width:"14",height:"14",x:"8",y:"8",rx:"2",ry:"2",key:"17jyea"}],["path",{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",key:"zix9uf"}]]);e.s(["default",()=>t])},190272,785913,e=>{"use strict";var t,r,a=((t={}).AUDIO_SPEECH="audio_speech",t.AUDIO_TRANSCRIPTION="audio_transcription",t.IMAGE_GENERATION="image_generation",t.VIDEO_GENERATION="video_generation",t.CHAT="chat",t.RESPONSES="responses",t.IMAGE_EDITS="image_edits",t.ANTHROPIC_MESSAGES="anthropic_messages",t.EMBEDDING="embedding",t),i=((r={}).IMAGE="image",r.VIDEO="video",r.CHAT="chat",r.RESPONSES="responses",r.IMAGE_EDITS="image_edits",r.ANTHROPIC_MESSAGES="anthropic_messages",r.EMBEDDINGS="embeddings",r.SPEECH="speech",r.TRANSCRIPTION="transcription",r.A2A_AGENTS="a2a_agents",r.MCP="mcp",r);let n={image_generation:"image",video_generation:"video",chat:"chat",responses:"responses",image_edits:"image_edits",anthropic_messages:"anthropic_messages",audio_speech:"speech",audio_transcription:"transcription",embedding:"embeddings"};e.s(["EndpointType",()=>i,"getEndpointType",0,e=>{if(console.log("getEndpointType:",e),Object.values(a).includes(e)){let t=n[e];return console.log("endpointType:",t),t}return"chat"}],785913),e.s(["generateCodeSnippet",0,e=>{let t,{apiKeySource:r,accessToken:a,apiKey:n,inputMessage:o,chatHistory:l,selectedTags:s,selectedVectorStores:d,selectedGuardrails:c,selectedPolicies:p,selectedMCPServers:m,mcpServers:u,mcpServerToolRestrictions:g,selectedVoice:f,endpointType:h,selectedModel:b,selectedSdk:_,proxySettings:x}=e,y="session"===r?a:n,w=window.location.origin,v=x?.LITELLM_UI_API_DOC_BASE_URL;v&&v.trim()?w=v:x?.PROXY_BASE_URL&&(w=x.PROXY_BASE_URL);let I=o||"Your prompt here",C=I.replace(/\\/g,"\\\\").replace(/"/g,'\\"').replace(/\n/g,"\\n"),k=l.filter(e=>!e.isImage).map(({role:e,content:t})=>({role:e,content:t})),S={};s.length>0&&(S.tags=s),d.length>0&&(S.vector_stores=d),c.length>0&&(S.guardrails=c),p.length>0&&(S.policies=p);let $=b||"your-model-name",A="azure"===_?`import openai

client = openai.AzureOpenAI(
	api_key="${y||"YOUR_LITELLM_API_KEY"}",
	azure_endpoint="${w}",
	api_version="2024-02-01"
)`:`import openai

client = openai.OpenAI(
	api_key="${y||"YOUR_LITELLM_API_KEY"}",
	base_url="${w}"
)`;switch(h){case i.CHAT:{let e=Object.keys(S).length>0,r="";if(e){let e=JSON.stringify({metadata:S},null,2).split("\n").map(e=>" ".repeat(4)+e).join("\n").trim();r=`,
    extra_body=${e}`}let a=k.length>0?k:[{role:"user",content:I}];t=`
import base64

# Helper function to encode images to base64
def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

# Example with text only
response = client.chat.completions.create(
    model="${$}",
    messages=${JSON.stringify(a,null,4)}${r}
)

print(response)

# Example with image or PDF (uncomment and provide file path to use)
# base64_file = encode_image("path/to/your/file.jpg")  # or .pdf
# response_with_file = client.chat.completions.create(
#     model="${$}",
#     messages=[
#         {
#             "role": "user",
#             "content": [
#                 {
#                     "type": "text",
#                     "text": "${C}"
#                 },
#                 {
#                     "type": "image_url",
#                     "image_url": {
#                         "url": f"data:image/jpeg;base64,{base64_file}"  # or data:application/pdf;base64,{base64_file}
#                     }
#                 }
#             ]
#         }
#     ]${r}
# )
# print(response_with_file)
`;break}case i.RESPONSES:{let e=Object.keys(S).length>0,r="";if(e){let e=JSON.stringify({metadata:S},null,2).split("\n").map(e=>" ".repeat(4)+e).join("\n").trim();r=`,
    extra_body=${e}`}let a=k.length>0?k:[{role:"user",content:I}];t=`
import base64

# Helper function to encode images to base64
def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

# Example with text only
response = client.responses.create(
    model="${$}",
    input=${JSON.stringify(a,null,4)}${r}
)

print(response.output_text)

# Example with image or PDF (uncomment and provide file path to use)
# base64_file = encode_image("path/to/your/file.jpg")  # or .pdf
# response_with_file = client.responses.create(
#     model="${$}",
#     input=[
#         {
#             "role": "user",
#             "content": [
#                 {"type": "input_text", "text": "${C}"},
#                 {
#                     "type": "input_image",
#                     "image_url": f"data:image/jpeg;base64,{base64_file}",  # or data:application/pdf;base64,{base64_file}
#                 },
#             ],
#         }
#     ]${r}
# )
# print(response_with_file.output_text)
`;break}case i.IMAGE:t="azure"===_?`
# NOTE: The Azure SDK does not have a direct equivalent to the multi-modal 'responses.create' method shown for OpenAI.
# This snippet uses 'client.images.generate' and will create a new image based on your prompt.
# It does not use the uploaded image, as 'client.images.generate' does not support image inputs in this context.
import os
import requests
import json
import time
from PIL import Image

result = client.images.generate(
	model="${$}",
	prompt="${o}",
	n=1
)

json_response = json.loads(result.model_dump_json())

# Set the directory for the stored image
image_dir = os.path.join(os.curdir, 'images')

# If the directory doesn't exist, create it
if not os.path.isdir(image_dir):
	os.mkdir(image_dir)

# Initialize the image path
image_filename = f"generated_image_{int(time.time())}.png"
image_path = os.path.join(image_dir, image_filename)

try:
	# Retrieve the generated image
	if json_response.get("data") && len(json_response["data"]) > 0 && json_response["data"][0].get("url"):
			image_url = json_response["data"][0]["url"]
			generated_image = requests.get(image_url).content
			with open(image_path, "wb") as image_file:
					image_file.write(generated_image)

			print(f"Image saved to {image_path}")
			# Display the image
			image = Image.open(image_path)
			image.show()
	else:
			print("Could not find image URL in response.")
			print("Full response:", json_response)
except Exception as e:
	print(f"An error occurred: {e}")
	print("Full response:", json_response)
`:`
import base64
import os
import time
import json
from PIL import Image
import requests

# Helper function to encode images to base64
def encode_image(image_path):
	with open(image_path, "rb") as image_file:
			return base64.b64encode(image_file.read()).decode('utf-8')

# Helper function to create a file (simplified for this example)
def create_file(image_path):
	# In a real implementation, this would upload the file to OpenAI
	# For this example, we'll just return a placeholder ID
	return f"file_{os.path.basename(image_path).replace('.', '_')}"

# The prompt entered by the user
prompt = "${C}"

# Encode images to base64
base64_image1 = encode_image("body-lotion.png")
base64_image2 = encode_image("soap.png")

# Create file IDs
file_id1 = create_file("body-lotion.png")
file_id2 = create_file("incense-kit.png")

response = client.responses.create(
	model="${$}",
	input=[
			{
					"role": "user",
					"content": [
							{"type": "input_text", "text": prompt},
							{
									"type": "input_image",
									"image_url": f"data:image/jpeg;base64,{base64_image1}",
							},
							{
									"type": "input_image",
									"image_url": f"data:image/jpeg;base64,{base64_image2}",
							},
							{
									"type": "input_image",
									"file_id": file_id1,
							},
							{
									"type": "input_image",
									"file_id": file_id2,
							}
					],
			}
	],
	tools=[{"type": "image_generation"}],
)

# Process the response
image_generation_calls = [
	output
	for output in response.output
	if output.type == "image_generation_call"
]

image_data = [output.result for output in image_generation_calls]

if image_data:
	image_base64 = image_data[0]
	image_filename = f"edited_image_{int(time.time())}.png"
	with open(image_filename, "wb") as f:
			f.write(base64.b64decode(image_base64))
	print(f"Image saved to {image_filename}")
else:
	# If no image is generated, there might be a text response with an explanation
	text_response = [output.text for output in response.output if hasattr(output, 'text')]
	if text_response:
			print("No image generated. Model response:")
			print("\\n".join(text_response))
	else:
			print("No image data found in response.")
	print("Full response for debugging:")
	print(response)
`;break;case i.IMAGE_EDITS:t="azure"===_?`
import base64
import os
import time
import json
from PIL import Image
import requests

# Helper function to encode images to base64
def encode_image(image_path):
	with open(image_path, "rb") as image_file:
			return base64.b64encode(image_file.read()).decode('utf-8')

# The prompt entered by the user
prompt = "${C}"

# Encode images to base64
base64_image1 = encode_image("body-lotion.png")
base64_image2 = encode_image("soap.png")

# Create file IDs
file_id1 = create_file("body-lotion.png")
file_id2 = create_file("incense-kit.png")

response = client.responses.create(
	model="${$}",
	input=[
			{
					"role": "user",
					"content": [
							{"type": "input_text", "text": prompt},
							{
									"type": "input_image",
									"image_url": f"data:image/jpeg;base64,{base64_image1}",
							},
							{
									"type": "input_image",
									"image_url": f"data:image/jpeg;base64,{base64_image2}",
							},
							{
									"type": "input_image",
									"file_id": file_id1,
							},
							{
									"type": "input_image",
									"file_id": file_id2,
							}
					],
			}
	],
	tools=[{"type": "image_generation"}],
)

# Process the response
image_generation_calls = [
	output
	for output in response.output
	if output.type == "image_generation_call"
]

image_data = [output.result for output in image_generation_calls]

if image_data:
	image_base64 = image_data[0]
	image_filename = f"edited_image_{int(time.time())}.png"
	with open(image_filename, "wb") as f:
			f.write(base64.b64decode(image_base64))
	print(f"Image saved to {image_filename}")
else:
	# If no image is generated, there might be a text response with an explanation
	text_response = [output.text for output in response.output if hasattr(output, 'text')]
	if text_response:
			print("No image generated. Model response:")
			print("\\n".join(text_response))
	else:
			print("No image data found in response.")
	print("Full response for debugging:")
	print(response)
`:`
import base64
import os
import time

# Helper function to encode images to base64
def encode_image(image_path):
	with open(image_path, "rb") as image_file:
			return base64.b64encode(image_file.read()).decode('utf-8')

# Helper function to create a file (simplified for this example)
def create_file(image_path):
	# In a real implementation, this would upload the file to OpenAI
	# For this example, we'll just return a placeholder ID
	return f"file_{os.path.basename(image_path).replace('.', '_')}"

# The prompt entered by the user
prompt = "${C}"

# Encode images to base64
base64_image1 = encode_image("body-lotion.png")
base64_image2 = encode_image("soap.png")

# Create file IDs
file_id1 = create_file("body-lotion.png")
file_id2 = create_file("incense-kit.png")

response = client.responses.create(
	model="${$}",
	input=[
			{
					"role": "user",
					"content": [
							{"type": "input_text", "text": prompt},
							{
									"type": "input_image",
									"image_url": f"data:image/jpeg;base64,{base64_image1}",
							},
							{
									"type": "input_image",
									"image_url": f"data:image/jpeg;base64,{base64_image2}",
							},
							{
									"type": "input_image",
									"file_id": file_id1,
							},
							{
									"type": "input_image",
									"file_id": file_id2,
							}
					],
			}
	],
	tools=[{"type": "image_generation"}],
)

# Process the response
image_generation_calls = [
	output
	for output in response.output
	if output.type == "image_generation_call"
]

image_data = [output.result for output in image_generation_calls]

if image_data:
	image_base64 = image_data[0]
	image_filename = f"edited_image_{int(time.time())}.png"
	with open(image_filename, "wb") as f:
			f.write(base64.b64decode(image_base64))
	print(f"Image saved to {image_filename}")
else:
	# If no image is generated, there might be a text response with an explanation
	text_response = [output.text for output in response.output if hasattr(output, 'text')]
	if text_response:
			print("No image generated. Model response:")
			print("\\n".join(text_response))
	else:
			print("No image data found in response.")
	print("Full response for debugging:")
	print(response)
`;break;case i.EMBEDDINGS:t=`
response = client.embeddings.create(
	input="${o||"Your string here"}",
	model="${$}",
	encoding_format="base64" # or "float"
)

print(response.data[0].embedding)
`;break;case i.TRANSCRIPTION:t=`
# Open the audio file
audio_file = open("path/to/your/audio/file.mp3", "rb")

# Make the transcription request
response = client.audio.transcriptions.create(
	model="${$}",
	file=audio_file${o?`,
	prompt="${o.replace(/"/g,'\\"')}"`:""}
)

print(response.text)
`;break;case i.SPEECH:t=`
# Make the text-to-speech request
response = client.audio.speech.create(
	model="${$}",
	input="${o||"Your text to convert to speech here"}",
	voice="${f}"  # Options: alloy, ash, ballad, coral, echo, fable, nova, onyx, sage, shimmer
)

# Save the audio to a file
output_filename = "output_speech.mp3"
response.stream_to_file(output_filename)
print(f"Audio saved to {output_filename}")

# Optional: Customize response format and speed
# response = client.audio.speech.create(
#     model="${$}",
#     input="${o||"Your text to convert to speech here"}",
#     voice="alloy",
#     response_format="mp3",  # Options: mp3, opus, aac, flac, wav, pcm
#     speed=1.0  # Range: 0.25 to 4.0
# )
# response.stream_to_file("output_speech.mp3")
`;break;default:t="\n# Code generation for this endpoint is not implemented yet."}return`${A}
${t}`}],190272)},928685,e=>{"use strict";var t=e.i(38953);e.s(["SearchOutlined",()=>t.default])},209261,e=>{"use strict";e.s(["extractCategories",0,e=>{let t=new Set;return e.forEach(e=>{e.category&&""!==e.category.trim()&&t.add(e.category)}),["All",...Array.from(t).sort(),"Other"]},"filterPluginsByCategory",0,(e,t)=>"All"===t?e:"Other"===t?e.filter(e=>!e.category||""===e.category.trim()):e.filter(e=>e.category===t),"filterPluginsBySearch",0,(e,t)=>{if(!t||""===t.trim())return e;let r=t.toLowerCase().trim();return e.filter(e=>{let t=e.name.toLowerCase().includes(r),a=e.description?.toLowerCase().includes(r)||!1,i=e.keywords?.some(e=>e.toLowerCase().includes(r))||!1;return t||a||i})},"formatDateString",0,e=>{if(!e)return"N/A";try{return new Date(e).toLocaleDateString("en-US",{year:"numeric",month:"short",day:"numeric"})}catch(e){return"Invalid date"}},"formatInstallCommand",0,e=>"github"===e.source.source&&e.source.repo?`/plugin marketplace add ${e.source.repo}`:"url"===e.source.source&&e.source.url?`/plugin marketplace add ${e.source.url}`:`/plugin marketplace add ${e.name}`,"getCategoryBadgeColor",0,e=>{if(!e)return"gray";let t=e.toLowerCase();if(t.includes("development")||t.includes("dev"))return"blue";if(t.includes("productivity")||t.includes("workflow"))return"green";if(t.includes("learning")||t.includes("education"))return"purple";if(t.includes("security")||t.includes("safety"))return"red";if(t.includes("data")||t.includes("analytics"))return"orange";else if(t.includes("integration")||t.includes("api"))return"yellow";return"gray"},"getSourceDisplayText",0,e=>"github"===e.source&&e.repo?`GitHub: ${e.repo}`:"url"===e.source&&e.url?e.url:"Unknown source","getSourceLink",0,e=>"github"===e.source&&e.repo?`https://github.com/${e.repo}`:"url"===e.source&&e.url?e.url:null,"isValidEmail",0,e=>!e||/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e),"isValidSemanticVersion",0,e=>!e||/^\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?(\+[a-zA-Z0-9.-]+)?$/.test(e),"isValidUrl",0,e=>{if(!e)return!0;try{return new URL(e),!0}catch{return!1}},"parseKeywords",0,e=>e&&""!==e.trim()?e.split(",").map(e=>e.trim()).filter(e=>""!==e):[],"validatePluginName",0,e=>!!e&&""!==e.trim()&&/^[a-z0-9-]+$/.test(e)])},434626,e=>{"use strict";var t=e.i(271645);let r=t.forwardRef(function(e,r){return t.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:2,stroke:"currentColor","aria-hidden":"true",ref:r},e),t.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"}))});e.s(["ExternalLinkIcon",0,r],434626)},916925,e=>{"use strict";var t,r=((t={}).A2A_Agent="A2A Agent",t.AIML="AI/ML API",t.Bedrock="Amazon Bedrock",t.Anthropic="Anthropic",t.AssemblyAI="AssemblyAI",t.SageMaker="AWS SageMaker",t.Azure="Azure",t.Azure_AI_Studio="Azure AI Foundry (Studio)",t.Cerebras="Cerebras",t.Cohere="Cohere",t.Dashscope="Dashscope",t.Databricks="Databricks (Qwen API)",t.DeepInfra="DeepInfra",t.Deepgram="Deepgram",t.Deepseek="Deepseek",t.ElevenLabs="ElevenLabs",t.FalAI="Fal AI",t.FireworksAI="Fireworks AI",t.Google_AI_Studio="Google AI Studio",t.GradientAI="GradientAI",t.Groq="Groq",t.Hosted_Vllm="vllm",t.Infinity="Infinity",t.JinaAI="Jina AI",t.MiniMax="MiniMax",t.MistralAI="Mistral AI",t.Ollama="Ollama",t.OpenAI="OpenAI",t.OpenAI_Compatible="OpenAI-Compatible Endpoints (Together AI, etc.)",t.OpenAI_Text="OpenAI Text Completion",t.OpenAI_Text_Compatible="OpenAI-Compatible Text Completion Models (Together AI, etc.)",t.Openrouter="Openrouter",t.Oracle="Oracle Cloud Infrastructure (OCI)",t.Perplexity="Perplexity",t.RunwayML="RunwayML",t.Sambanova="Sambanova",t.Snowflake="Snowflake",t.TogetherAI="TogetherAI",t.Triton="Triton",t.Vertex_AI="Vertex AI (Anthropic, Gemini, etc.)",t.VolcEngine="VolcEngine",t.Voyage="Voyage AI",t.xAI="xAI",t.SAP="SAP Generative AI Hub",t.Watsonx="Watsonx",t);let a={A2A_Agent:"a2a_agent",AIML:"aiml",OpenAI:"openai",OpenAI_Text:"text-completion-openai",Azure:"azure",Azure_AI_Studio:"azure_ai",Anthropic:"anthropic",Google_AI_Studio:"gemini",Bedrock:"bedrock",Groq:"groq",MiniMax:"minimax",MistralAI:"mistral",Cohere:"cohere",OpenAI_Compatible:"openai",OpenAI_Text_Compatible:"text-completion-openai",Vertex_AI:"vertex_ai",Databricks:"databricks",Dashscope:"dashscope",xAI:"xai",Deepseek:"deepseek",Ollama:"ollama",AssemblyAI:"assemblyai",Cerebras:"cerebras",Sambanova:"sambanova",Perplexity:"perplexity",RunwayML:"runwayml",TogetherAI:"together_ai",Openrouter:"openrouter",Oracle:"oci",Snowflake:"snowflake",FireworksAI:"fireworks_ai",GradientAI:"gradient_ai",Triton:"triton",Deepgram:"deepgram",ElevenLabs:"elevenlabs",FalAI:"fal_ai",SageMaker:"sagemaker_chat",Voyage:"voyage",JinaAI:"jina_ai",VolcEngine:"volcengine",DeepInfra:"deepinfra",Hosted_Vllm:"hosted_vllm",Infinity:"infinity",SAP:"sap",Watsonx:"watsonx"},i="../ui/assets/logos/",n={"A2A Agent":`${i}a2a_agent.png`,"AI/ML API":`${i}aiml_api.svg`,Anthropic:`${i}anthropic.svg`,AssemblyAI:`${i}assemblyai_small.png`,Azure:`${i}microsoft_azure.svg`,"Azure AI Foundry (Studio)":`${i}microsoft_azure.svg`,"Amazon Bedrock":`${i}bedrock.svg`,"AWS SageMaker":`${i}bedrock.svg`,Cerebras:`${i}cerebras.svg`,Cohere:`${i}cohere.svg`,"Databricks (Qwen API)":`${i}databricks.svg`,Dashscope:`${i}dashscope.svg`,Deepseek:`${i}deepseek.svg`,"Fireworks AI":`${i}fireworks.svg`,Groq:`${i}groq.svg`,"Google AI Studio":`${i}google.svg`,vllm:`${i}vllm.png`,Infinity:`${i}infinity.png`,MiniMax:`${i}minimax.svg`,"Mistral AI":`${i}mistral.svg`,Ollama:`${i}ollama.svg`,OpenAI:`${i}openai_small.svg`,"OpenAI Text Completion":`${i}openai_small.svg`,"OpenAI-Compatible Text Completion Models (Together AI, etc.)":`${i}openai_small.svg`,"OpenAI-Compatible Endpoints (Together AI, etc.)":`${i}openai_small.svg`,Openrouter:`${i}openrouter.svg`,"Oracle Cloud Infrastructure (OCI)":`${i}oracle.svg`,Perplexity:`${i}perplexity-ai.svg`,RunwayML:`${i}runwayml.png`,Sambanova:`${i}sambanova.svg`,Snowflake:`${i}snowflake.svg`,TogetherAI:`${i}togetherai.svg`,"Vertex AI (Anthropic, Gemini, etc.)":`${i}google.svg`,xAI:`${i}xai.svg`,GradientAI:`${i}gradientai.svg`,Triton:`${i}nvidia_triton.png`,Deepgram:`${i}deepgram.png`,ElevenLabs:`${i}elevenlabs.png`,"Fal AI":`${i}fal_ai.jpg`,"Voyage AI":`${i}voyage.webp`,"Jina AI":`${i}jina.png`,VolcEngine:`${i}volcengine.png`,DeepInfra:`${i}deepinfra.png`,"SAP Generative AI Hub":`${i}sap.png`};e.s(["Providers",()=>r,"getPlaceholder",0,e=>{if("AI/ML API"===e)return"aiml/flux-pro/v1.1";if("Vertex AI (Anthropic, Gemini, etc.)"===e)return"gemini-pro";if("Anthropic"==e)return"claude-3-opus";if("Amazon Bedrock"==e)return"claude-3-opus";if("AWS SageMaker"==e)return"sagemaker/jumpstart-dft-meta-textgeneration-llama-2-7b";else if("Google AI Studio"==e)return"gemini-pro";else if("Azure AI Foundry (Studio)"==e)return"azure_ai/command-r-plus";else if("Azure"==e)return"my-deployment";else if("Oracle Cloud Infrastructure (OCI)"==e)return"oci/xai.grok-4";else if("Snowflake"==e)return"snowflake/mistral-7b";else if("Voyage AI"==e)return"voyage/";else if("Jina AI"==e)return"jina_ai/";else if("VolcEngine"==e)return"volcengine/<any-model-on-volcengine>";else if("DeepInfra"==e)return"deepinfra/<any-model-on-deepinfra>";else if("Fal AI"==e)return"fal_ai/fal-ai/flux-pro/v1.1-ultra";else if("RunwayML"==e)return"runwayml/gen4_turbo";else if("Watsonx"===e)return"watsonx/ibm/granite-3-3-8b-instruct";else return"gpt-3.5-turbo"},"getProviderLogoAndName",0,e=>{if(!e)return{logo:"",displayName:"-"};if("gemini"===e.toLowerCase()){let e="Google AI Studio";return{logo:n[e],displayName:e}}let t=Object.keys(a).find(t=>a[t].toLowerCase()===e.toLowerCase());if(!t)return{logo:"",displayName:e};let i=r[t];return{logo:n[i],displayName:i}},"getProviderModels",0,(e,t)=>{console.log(`Provider key: ${e}`);let r=a[e];console.log(`Provider mapped to: ${r}`);let i=[];return e&&"object"==typeof t&&(Object.entries(t).forEach(([e,t])=>{if(null!==t&&"object"==typeof t&&"litellm_provider"in t){let a=t.litellm_provider;(a===r||"string"==typeof a&&a.includes(r))&&i.push(e)}}),"Cohere"==e&&(console.log("Adding cohere chat models"),Object.entries(t).forEach(([e,t])=>{null!==t&&"object"==typeof t&&"litellm_provider"in t&&"cohere_chat"===t.litellm_provider&&i.push(e)})),"AWS SageMaker"==e&&(console.log("Adding sagemaker chat models"),Object.entries(t).forEach(([e,t])=>{null!==t&&"object"==typeof t&&"litellm_provider"in t&&"sagemaker_chat"===t.litellm_provider&&i.push(e)}))),i},"providerLogoMap",0,n,"provider_map",0,a])},166406,e=>{"use strict";var t=e.i(190144);e.s(["CopyOutlined",()=>t.default])},94629,e=>{"use strict";var t=e.i(271645);let r=t.forwardRef(function(e,r){return t.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:2,stroke:"currentColor","aria-hidden":"true",ref:r},e),t.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"}))});e.s(["SwitchVerticalIcon",0,r],94629)},798496,e=>{"use strict";var t=e.i(843476),r=e.i(152990),a=e.i(682830),i=e.i(271645),n=e.i(269200),o=e.i(427612),l=e.i(64848),s=e.i(942232),d=e.i(496020),c=e.i(977572),p=e.i(94629),m=e.i(360820),u=e.i(871943);function g({data:e=[],columns:g,isLoading:f=!1,defaultSorting:h=[],pagination:b,onPaginationChange:_,enablePagination:x=!1}){let[y,w]=i.default.useState(h),[v]=i.default.useState("onChange"),[I,C]=i.default.useState({}),[k,S]=i.default.useState({}),$=(0,r.useReactTable)({data:e,columns:g,state:{sorting:y,columnSizing:I,columnVisibility:k,...x&&b?{pagination:b}:{}},columnResizeMode:v,onSortingChange:w,onColumnSizingChange:C,onColumnVisibilityChange:S,...x&&_?{onPaginationChange:_}:{},getCoreRowModel:(0,a.getCoreRowModel)(),getSortedRowModel:(0,a.getSortedRowModel)(),...x?{getPaginationRowModel:(0,a.getPaginationRowModel)()}:{},enableSorting:!0,enableColumnResizing:!0,defaultColumn:{minSize:40,maxSize:500}});return(0,t.jsx)("div",{className:"rounded-lg custom-border relative",children:(0,t.jsx)("div",{className:"overflow-x-auto",children:(0,t.jsx)("div",{className:"relative min-w-full",children:(0,t.jsxs)(n.Table,{className:"[&_td]:py-2 [&_th]:py-2",style:{width:$.getTotalSize(),minWidth:"100%",tableLayout:"fixed"},children:[(0,t.jsx)(o.TableHead,{children:$.getHeaderGroups().map(e=>(0,t.jsx)(d.TableRow,{children:e.headers.map(e=>(0,t.jsxs)(l.TableHeaderCell,{className:`py-1 h-8 relative ${"actions"===e.id?"sticky right-0 bg-white shadow-[-4px_0_8px_-6px_rgba(0,0,0,0.1)] w-[120px] ml-8":""} ${e.column.columnDef.meta?.className||""}`,style:{width:"actions"===e.id?120:e.getSize(),position:"actions"===e.id?"sticky":"relative",right:"actions"===e.id?0:"auto"},onClick:e.column.getCanSort()?e.column.getToggleSortingHandler():void 0,children:[(0,t.jsxs)("div",{className:"flex items-center justify-between gap-2",children:[(0,t.jsx)("div",{className:"flex items-center",children:e.isPlaceholder?null:(0,r.flexRender)(e.column.columnDef.header,e.getContext())}),"actions"!==e.id&&e.column.getCanSort()&&(0,t.jsx)("div",{className:"w-4",children:e.column.getIsSorted()?({asc:(0,t.jsx)(m.ChevronUpIcon,{className:"h-4 w-4 text-blue-500"}),desc:(0,t.jsx)(u.ChevronDownIcon,{className:"h-4 w-4 text-blue-500"})})[e.column.getIsSorted()]:(0,t.jsx)(p.SwitchVerticalIcon,{className:"h-4 w-4 text-gray-400"})})]}),e.column.getCanResize()&&(0,t.jsx)("div",{onMouseDown:e.getResizeHandler(),onTouchStart:e.getResizeHandler(),className:`absolute right-0 top-0 h-full w-2 cursor-col-resize select-none touch-none ${e.column.getIsResizing()?"bg-blue-500":"hover:bg-blue-200"}`})]},e.id))},e.id))}),(0,t.jsx)(s.TableBody,{children:f?(0,t.jsx)(d.TableRow,{children:(0,t.jsx)(c.TableCell,{colSpan:g.length,className:"h-8 text-center",children:(0,t.jsx)("div",{className:"text-center text-gray-500",children:(0,t.jsx)("p",{children:"🚅 Loading models..."})})})}):$.getRowModel().rows.length>0?$.getRowModel().rows.map(e=>(0,t.jsx)(d.TableRow,{children:e.getVisibleCells().map(e=>(0,t.jsx)(c.TableCell,{className:`py-0.5 overflow-hidden ${"actions"===e.column.id?"sticky right-0 bg-white shadow-[-4px_0_8px_-6px_rgba(0,0,0,0.1)] w-[120px] ml-8":""} ${e.column.columnDef.meta?.className||""}`,style:{width:"actions"===e.column.id?120:e.column.getSize(),position:"actions"===e.column.id?"sticky":"relative",right:"actions"===e.column.id?0:"auto"},children:(0,r.flexRender)(e.column.columnDef.cell,e.getContext())},e.id))},e.id)):(0,t.jsx)(d.TableRow,{children:(0,t.jsx)(c.TableCell,{colSpan:g.length,className:"h-8 text-center",children:(0,t.jsx)("div",{className:"text-center text-gray-500",children:(0,t.jsx)("p",{children:"No models found"})})})})})]})})})})}e.s(["ModelDataTable",()=>g])},560280,e=>{"use strict";var t=e.i(843476),r=e.i(271645),a=e.i(618566),i=e.i(976883);function n(){let e=(0,a.useSearchParams)().get("key"),[n,o]=(0,r.useState)(null);return(0,r.useEffect)(()=>{e&&o(e)},[e]),(0,t.jsx)(i.default,{accessToken:n})}function o(){return(0,t.jsx)(r.Suspense,{fallback:(0,t.jsx)("div",{className:"flex items-center justify-center min-h-screen",children:"Loading..."}),children:(0,t.jsx)(n,{})})}e.s(["default",()=>o])}]);