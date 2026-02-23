(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,280898,e=>{"use strict";e.i(247167);var t=e.i(271645),i=e.i(121229),n=e.i(864517),o=e.i(343794),a=e.i(931067),r=e.i(209428),l=e.i(211577),s=e.i(703923),c=e.i(404948),d=["className","prefixCls","style","active","status","iconPrefix","icon","wrapperStyle","stepNumber","disabled","description","title","subTitle","progressDot","stepIcon","tailContent","icons","stepIndex","onStepClick","onClick","render"];function p(e){return"string"==typeof e}let m=function(e){var i,n,m,g,u,f=e.className,h=e.prefixCls,b=e.style,$=e.active,_=e.status,v=e.iconPrefix,I=e.icon,S=(e.wrapperStyle,e.stepNumber),y=e.disabled,x=e.description,w=e.title,A=e.subTitle,C=e.progressDot,k=e.stepIcon,E=e.tailContent,O=e.icons,T=e.stepIndex,j=e.onStepClick,M=e.onClick,z=e.render,N=(0,s.default)(e,d),D={};j&&!y&&(D.role="button",D.tabIndex=0,D.onClick=function(e){null==M||M(e),j(T)},D.onKeyDown=function(e){var t=e.which;(t===c.default.ENTER||t===c.default.SPACE)&&j(T)});var P=_||"wait",q=(0,o.default)("".concat(h,"-item"),"".concat(h,"-item-").concat(P),f,(u={},(0,l.default)(u,"".concat(h,"-item-custom"),I),(0,l.default)(u,"".concat(h,"-item-active"),$),(0,l.default)(u,"".concat(h,"-item-disabled"),!0===y),u)),H=(0,r.default)({},b),R=t.createElement("div",(0,a.default)({},N,{className:q,style:H}),t.createElement("div",(0,a.default)({onClick:M},D,{className:"".concat(h,"-item-container")}),t.createElement("div",{className:"".concat(h,"-item-tail")},E),t.createElement("div",{className:"".concat(h,"-item-icon")},(m=(0,o.default)("".concat(h,"-icon"),"".concat(v,"icon"),(i={},(0,l.default)(i,"".concat(v,"icon-").concat(I),I&&p(I)),(0,l.default)(i,"".concat(v,"icon-check"),!I&&"finish"===_&&(O&&!O.finish||!O)),(0,l.default)(i,"".concat(v,"icon-cross"),!I&&"error"===_&&(O&&!O.error||!O)),i)),g=t.createElement("span",{className:"".concat(h,"-icon-dot")}),n=C?"function"==typeof C?t.createElement("span",{className:"".concat(h,"-icon")},C(g,{index:S-1,status:_,title:w,description:x})):t.createElement("span",{className:"".concat(h,"-icon")},g):I&&!p(I)?t.createElement("span",{className:"".concat(h,"-icon")},I):O&&O.finish&&"finish"===_?t.createElement("span",{className:"".concat(h,"-icon")},O.finish):O&&O.error&&"error"===_?t.createElement("span",{className:"".concat(h,"-icon")},O.error):I||"finish"===_||"error"===_?t.createElement("span",{className:m}):t.createElement("span",{className:"".concat(h,"-icon")},S),k&&(n=k({index:S-1,status:_,title:w,description:x,node:n})),n)),t.createElement("div",{className:"".concat(h,"-item-content")},t.createElement("div",{className:"".concat(h,"-item-title")},w,A&&t.createElement("div",{title:"string"==typeof A?A:void 0,className:"".concat(h,"-item-subtitle")},A)),x&&t.createElement("div",{className:"".concat(h,"-item-description")},x))));return z&&(R=z(R)||null),R};var g=["prefixCls","style","className","children","direction","type","labelPlacement","iconPrefix","status","size","current","progressDot","stepIcon","initial","icons","onChange","itemRender","items"];function u(e){var i,n=e.prefixCls,c=void 0===n?"rc-steps":n,d=e.style,p=void 0===d?{}:d,u=e.className,f=(e.children,e.direction),h=e.type,b=void 0===h?"default":h,$=e.labelPlacement,_=e.iconPrefix,v=void 0===_?"rc":_,I=e.status,S=void 0===I?"process":I,y=e.size,x=e.current,w=void 0===x?0:x,A=e.progressDot,C=e.stepIcon,k=e.initial,E=void 0===k?0:k,O=e.icons,T=e.onChange,j=e.itemRender,M=e.items,z=(0,s.default)(e,g),N="inline"===b,D=N||void 0!==A&&A,P=N||void 0===f?"horizontal":f,q=N?void 0:y,H=(0,o.default)(c,"".concat(c,"-").concat(P),u,(i={},(0,l.default)(i,"".concat(c,"-").concat(q),q),(0,l.default)(i,"".concat(c,"-label-").concat(D?"vertical":void 0===$?"horizontal":$),"horizontal"===P),(0,l.default)(i,"".concat(c,"-dot"),!!D),(0,l.default)(i,"".concat(c,"-navigation"),"navigation"===b),(0,l.default)(i,"".concat(c,"-inline"),N),i)),R=function(e){T&&w!==e&&T(e)};return t.default.createElement("div",(0,a.default)({className:H,style:p},z),(void 0===M?[]:M).filter(function(e){return e}).map(function(e,i){var n=(0,r.default)({},e),o=E+i;return"error"===S&&i===w-1&&(n.className="".concat(c,"-next-error")),n.status||(o===w?n.status=S:o<w?n.status="finish":n.status="wait"),N&&(n.icon=void 0,n.subTitle=void 0),!n.render&&j&&(n.render=function(e){return j(n,e)}),t.default.createElement(m,(0,a.default)({},n,{active:o===w,stepNumber:o+1,stepIndex:o,key:o,prefixCls:c,iconPrefix:v,wrapperStyle:p,progressDot:D,stepIcon:C,icons:O,onStepClick:T&&R}))}))}u.Step=m;var f=e.i(242064),h=e.i(517455),b=e.i(150073),$=e.i(309821),_=e.i(491816);e.i(296059);var v=e.i(915654),I=e.i(183293),S=e.i(246422),y=e.i(838378);let x=(e,t)=>{let i=`${t.componentCls}-item`,n=`${e}IconColor`,o=`${e}TitleColor`,a=`${e}DescriptionColor`,r=`${e}TailColor`,l=`${e}IconBgColor`,s=`${e}IconBorderColor`,c=`${e}DotColor`;return{[`${i}-${e} ${i}-icon`]:{backgroundColor:t[l],borderColor:t[s],[`> ${t.componentCls}-icon`]:{color:t[n],[`${t.componentCls}-icon-dot`]:{background:t[c]}}},[`${i}-${e}${i}-custom ${i}-icon`]:{[`> ${t.componentCls}-icon`]:{color:t[c]}},[`${i}-${e} > ${i}-container > ${i}-content > ${i}-title`]:{color:t[o],"&::after":{backgroundColor:t[r]}},[`${i}-${e} > ${i}-container > ${i}-content > ${i}-description`]:{color:t[a]},[`${i}-${e} > ${i}-container > ${i}-tail::after`]:{backgroundColor:t[r]}}},w=(0,S.genStyleHooks)("Steps",e=>{let{colorTextDisabled:t,controlHeightLG:i,colorTextLightSolid:n,colorText:o,colorPrimary:a,colorTextDescription:r,colorTextQuaternary:l,colorError:s,colorBorderSecondary:c,colorSplit:d}=e;return(e=>{let{componentCls:t}=e;return{[t]:Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({},(0,I.resetComponent)(e)),{display:"flex",width:"100%",fontSize:0,textAlign:"initial"}),(e=>{let{componentCls:t,motionDurationSlow:i}=e,n=`${t}-item`,o=`${n}-icon`;return Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({[n]:{position:"relative",display:"inline-block",flex:1,overflow:"hidden",verticalAlign:"top","&:last-child":{flex:"none",[`> ${n}-container > ${n}-tail, > ${n}-container >  ${n}-content > ${n}-title::after`]:{display:"none"}}},[`${n}-container`]:{outline:"none",[`&:focus-visible ${o}`]:(0,I.genFocusOutline)(e)},[`${o}, ${n}-content`]:{display:"inline-block",verticalAlign:"top"},[o]:{width:e.iconSize,height:e.iconSize,marginTop:0,marginBottom:0,marginInlineStart:0,marginInlineEnd:e.marginXS,fontSize:e.iconFontSize,fontFamily:e.fontFamily,lineHeight:(0,v.unit)(e.iconSize),textAlign:"center",borderRadius:e.iconSize,border:`${(0,v.unit)(e.lineWidth)} ${e.lineType} transparent`,transition:`background-color ${i}, border-color ${i}`,[`${t}-icon`]:{position:"relative",top:e.iconTop,color:e.colorPrimary,lineHeight:1}},[`${n}-tail`]:{position:"absolute",top:e.calc(e.iconSize).div(2).equal(),insetInlineStart:0,width:"100%","&::after":{display:"inline-block",width:"100%",height:e.lineWidth,background:e.colorSplit,borderRadius:e.lineWidth,transition:`background ${i}`,content:'""'}},[`${n}-title`]:{position:"relative",display:"inline-block",paddingInlineEnd:e.padding,color:e.colorText,fontSize:e.fontSizeLG,lineHeight:(0,v.unit)(e.titleLineHeight),"&::after":{position:"absolute",top:e.calc(e.titleLineHeight).div(2).equal(),insetInlineStart:"100%",display:"block",width:9999,height:e.lineWidth,background:e.processTailColor,content:'""'}},[`${n}-subtitle`]:{display:"inline",marginInlineStart:e.marginXS,color:e.colorTextDescription,fontWeight:"normal",fontSize:e.fontSize},[`${n}-description`]:{color:e.colorTextDescription,fontSize:e.fontSize}},x("wait",e)),x("process",e)),{[`${n}-process > ${n}-container > ${n}-title`]:{fontWeight:e.fontWeightStrong}}),x("finish",e)),x("error",e)),{[`${n}${t}-next-error > ${t}-item-title::after`]:{background:e.colorError},[`${n}-disabled`]:{cursor:"not-allowed"}})})(e)),(e=>{let{componentCls:t,motionDurationSlow:i}=e;return{[`& ${t}-item`]:{[`&:not(${t}-item-active)`]:{[`& > ${t}-item-container[role='button']`]:{cursor:"pointer",[`${t}-item`]:{[`&-title, &-subtitle, &-description, &-icon ${t}-icon`]:{transition:`color ${i}`}},"&:hover":{[`${t}-item`]:{"&-title, &-subtitle, &-description":{color:e.colorPrimary}}}},[`&:not(${t}-item-process)`]:{[`& > ${t}-item-container[role='button']:hover`]:{[`${t}-item`]:{"&-icon":{borderColor:e.colorPrimary,[`${t}-icon`]:{color:e.colorPrimary}}}}}}},[`&${t}-horizontal:not(${t}-label-vertical)`]:{[`${t}-item`]:{paddingInlineStart:e.padding,whiteSpace:"nowrap","&:first-child":{paddingInlineStart:0},[`&:last-child ${t}-item-title`]:{paddingInlineEnd:0},"&-tail":{display:"none"},"&-description":{maxWidth:e.descriptionMaxWidth,whiteSpace:"normal"}}}}})(e)),(e=>{let{componentCls:t,customIconTop:i,customIconSize:n,customIconFontSize:o}=e;return{[`${t}-item-custom`]:{[`> ${t}-item-container > ${t}-item-icon`]:{height:"auto",background:"none",border:0,[`> ${t}-icon`]:{top:i,width:n,height:n,fontSize:o,lineHeight:(0,v.unit)(n)}}},[`&:not(${t}-vertical)`]:{[`${t}-item-custom`]:{[`${t}-item-icon`]:{width:"auto",background:"none"}}}}})(e)),(e=>{let{componentCls:t,iconSizeSM:i,fontSizeSM:n,fontSize:o,colorTextDescription:a}=e;return{[`&${t}-small`]:{[`&${t}-horizontal:not(${t}-label-vertical) ${t}-item`]:{paddingInlineStart:e.paddingSM,"&:first-child":{paddingInlineStart:0}},[`${t}-item-icon`]:{width:i,height:i,marginTop:0,marginBottom:0,marginInline:`0 ${(0,v.unit)(e.marginXS)}`,fontSize:n,lineHeight:(0,v.unit)(i),textAlign:"center",borderRadius:i},[`${t}-item-title`]:{paddingInlineEnd:e.paddingSM,fontSize:o,lineHeight:(0,v.unit)(i),"&::after":{top:e.calc(i).div(2).equal()}},[`${t}-item-description`]:{color:a,fontSize:o},[`${t}-item-tail`]:{top:e.calc(i).div(2).sub(e.paddingXXS).equal()},[`${t}-item-custom ${t}-item-icon`]:{width:"inherit",height:"inherit",lineHeight:"inherit",background:"none",border:0,borderRadius:0,[`> ${t}-icon`]:{fontSize:i,lineHeight:(0,v.unit)(i),transform:"none"}}}}})(e)),(e=>{let{componentCls:t,iconSizeSM:i,iconSize:n}=e;return{[`&${t}-vertical`]:{display:"flex",flexDirection:"column",[`> ${t}-item`]:{display:"block",flex:"1 0 auto",paddingInlineStart:0,overflow:"visible",[`${t}-item-icon`]:{float:"left",marginInlineEnd:e.margin},[`${t}-item-content`]:{display:"block",minHeight:e.calc(e.controlHeight).mul(1.5).equal(),overflow:"hidden"},[`${t}-item-title`]:{lineHeight:(0,v.unit)(n)},[`${t}-item-description`]:{paddingBottom:e.paddingSM}},[`> ${t}-item > ${t}-item-container > ${t}-item-tail`]:{position:"absolute",top:0,insetInlineStart:e.calc(n).div(2).sub(e.lineWidth).equal(),width:e.lineWidth,height:"100%",padding:`${(0,v.unit)(e.calc(e.marginXXS).mul(1.5).add(n).equal())} 0 ${(0,v.unit)(e.calc(e.marginXXS).mul(1.5).equal())}`,"&::after":{width:e.lineWidth,height:"100%"}},[`> ${t}-item:not(:last-child) > ${t}-item-container > ${t}-item-tail`]:{display:"block"},[` > ${t}-item > ${t}-item-container > ${t}-item-content > ${t}-item-title`]:{"&::after":{display:"none"}},[`&${t}-small ${t}-item-container`]:{[`${t}-item-tail`]:{position:"absolute",top:0,insetInlineStart:e.calc(i).div(2).sub(e.lineWidth).equal(),padding:`${(0,v.unit)(e.calc(e.marginXXS).mul(1.5).add(i).equal())} 0 ${(0,v.unit)(e.calc(e.marginXXS).mul(1.5).equal())}`},[`${t}-item-title`]:{lineHeight:(0,v.unit)(i)}}}}})(e)),(e=>{let{componentCls:t}=e,i=`${t}-item`;return{[`${t}-horizontal`]:{[`${i}-tail`]:{transform:"translateY(-50%)"}}}})(e)),(e=>{let{componentCls:t,iconSize:i,lineHeight:n,iconSizeSM:o}=e;return{[`&${t}-label-vertical`]:{[`${t}-item`]:{overflow:"visible","&-tail":{marginInlineStart:e.calc(i).div(2).add(e.controlHeightLG).equal(),padding:`0 ${(0,v.unit)(e.paddingLG)}`},"&-content":{display:"block",width:e.calc(i).div(2).add(e.controlHeightLG).mul(2).equal(),marginTop:e.marginSM,textAlign:"center"},"&-icon":{display:"inline-block",marginInlineStart:e.controlHeightLG},"&-title":{paddingInlineEnd:0,paddingInlineStart:0,"&::after":{display:"none"}},"&-subtitle":{display:"block",marginBottom:e.marginXXS,marginInlineStart:0,lineHeight:n}},[`&${t}-small:not(${t}-dot)`]:{[`${t}-item`]:{"&-icon":{marginInlineStart:e.calc(i).sub(o).div(2).add(e.controlHeightLG).equal()}}}}}})(e)),(e=>{let{componentCls:t,descriptionMaxWidth:i,lineHeight:n,dotCurrentSize:o,dotSize:a,motionDurationSlow:r}=e;return{[`&${t}-dot, &${t}-dot${t}-small`]:{[`${t}-item`]:{"&-title":{lineHeight:n},"&-tail":{top:e.calc(e.dotSize).sub(e.calc(e.lineWidth).mul(3).equal()).div(2).equal(),width:"100%",marginTop:0,marginBottom:0,marginInline:`${(0,v.unit)(e.calc(i).div(2).equal())} 0`,padding:0,"&::after":{width:`calc(100% - ${(0,v.unit)(e.calc(e.marginSM).mul(2).equal())})`,height:e.calc(e.lineWidth).mul(3).equal(),marginInlineStart:e.marginSM}},"&-icon":{width:a,height:a,marginInlineStart:e.calc(e.descriptionMaxWidth).sub(a).div(2).equal(),paddingInlineEnd:0,lineHeight:(0,v.unit)(a),background:"transparent",border:0,[`${t}-icon-dot`]:{position:"relative",float:"left",width:"100%",height:"100%",borderRadius:100,transition:`all ${r}`,"&::after":{position:"absolute",top:e.calc(e.marginSM).mul(-1).equal(),insetInlineStart:e.calc(a).sub(e.calc(e.controlHeightLG).mul(1.5).equal()).div(2).equal(),width:e.calc(e.controlHeightLG).mul(1.5).equal(),height:e.controlHeight,background:"transparent",content:'""'}}},"&-content":{width:i},[`&-process ${t}-item-icon`]:{position:"relative",top:e.calc(a).sub(o).div(2).equal(),width:o,height:o,lineHeight:(0,v.unit)(o),background:"none",marginInlineStart:e.calc(e.descriptionMaxWidth).sub(o).div(2).equal()},[`&-process ${t}-icon`]:{[`&:first-child ${t}-icon-dot`]:{insetInlineStart:0}}}},[`&${t}-vertical${t}-dot`]:{[`${t}-item-icon`]:{marginTop:e.calc(e.controlHeight).sub(a).div(2).equal(),marginInlineStart:0,background:"none"},[`${t}-item-process ${t}-item-icon`]:{marginTop:e.calc(e.controlHeight).sub(o).div(2).equal(),top:0,insetInlineStart:e.calc(a).sub(o).div(2).equal(),marginInlineStart:0},[`${t}-item > ${t}-item-container > ${t}-item-tail`]:{top:e.calc(e.controlHeight).sub(a).div(2).equal(),insetInlineStart:0,margin:0,padding:`${(0,v.unit)(e.calc(a).add(e.paddingXS).equal())} 0 ${(0,v.unit)(e.paddingXS)}`,"&::after":{marginInlineStart:e.calc(a).sub(e.lineWidth).div(2).equal()}},[`&${t}-small`]:{[`${t}-item-icon`]:{marginTop:e.calc(e.controlHeightSM).sub(a).div(2).equal()},[`${t}-item-process ${t}-item-icon`]:{marginTop:e.calc(e.controlHeightSM).sub(o).div(2).equal()},[`${t}-item > ${t}-item-container > ${t}-item-tail`]:{top:e.calc(e.controlHeightSM).sub(a).div(2).equal()}},[`${t}-item:first-child ${t}-icon-dot`]:{insetInlineStart:0},[`${t}-item-content`]:{width:"inherit"}}}})(e)),(e=>{let{componentCls:t,navContentMaxWidth:i,navArrowColor:n,stepsNavActiveColor:o,motionDurationSlow:a}=e;return{[`&${t}-navigation`]:{paddingTop:e.paddingSM,[`&${t}-small`]:{[`${t}-item`]:{"&-container":{marginInlineStart:e.calc(e.marginSM).mul(-1).equal()}}},[`${t}-item`]:{overflow:"visible",textAlign:"center","&-container":{display:"inline-block",height:"100%",marginInlineStart:e.calc(e.margin).mul(-1).equal(),paddingBottom:e.paddingSM,textAlign:"start",transition:`opacity ${a}`,[`${t}-item-content`]:{maxWidth:i},[`${t}-item-title`]:Object.assign(Object.assign({maxWidth:"100%",paddingInlineEnd:0},I.textEllipsis),{"&::after":{display:"none"}})},[`&:not(${t}-item-active)`]:{[`${t}-item-container[role='button']`]:{cursor:"pointer","&:hover":{opacity:.85}}},"&:last-child":{flex:1,"&::after":{display:"none"}},"&::after":{position:"absolute",top:`calc(50% - ${(0,v.unit)(e.calc(e.paddingSM).div(2).equal())})`,insetInlineStart:"100%",display:"inline-block",width:e.fontSizeIcon,height:e.fontSizeIcon,borderTop:`${(0,v.unit)(e.lineWidth)} ${e.lineType} ${n}`,borderBottom:"none",borderInlineStart:"none",borderInlineEnd:`${(0,v.unit)(e.lineWidth)} ${e.lineType} ${n}`,transform:"translateY(-50%) translateX(-50%) rotate(45deg)",content:'""'},"&::before":{position:"absolute",bottom:0,insetInlineStart:"50%",display:"inline-block",width:0,height:e.lineWidthBold,backgroundColor:o,transition:`width ${a}, inset-inline-start ${a}`,transitionTimingFunction:"ease-out",content:'""'}},[`${t}-item${t}-item-active::before`]:{insetInlineStart:0,width:"100%"}},[`&${t}-navigation${t}-vertical`]:{[`> ${t}-item`]:{marginInlineEnd:0,"&::before":{display:"none"},[`&${t}-item-active::before`]:{top:0,insetInlineEnd:0,insetInlineStart:"unset",display:"block",width:e.calc(e.lineWidth).mul(3).equal(),height:`calc(100% - ${(0,v.unit)(e.marginLG)})`},"&::after":{position:"relative",insetInlineStart:"50%",display:"block",width:e.calc(e.controlHeight).mul(.25).equal(),height:e.calc(e.controlHeight).mul(.25).equal(),marginBottom:e.marginXS,textAlign:"center",transform:"translateY(-50%) translateX(-50%) rotate(135deg)"},"&:last-child":{"&::after":{display:"none"}},[`> ${t}-item-container > ${t}-item-tail`]:{visibility:"hidden"}}},[`&${t}-navigation${t}-horizontal`]:{[`> ${t}-item > ${t}-item-container > ${t}-item-tail`]:{visibility:"hidden"}}}})(e)),(e=>{let{componentCls:t}=e;return{[`&${t}-rtl`]:{direction:"rtl",[`${t}-item`]:{"&-subtitle":{float:"left"}},[`&${t}-navigation`]:{[`${t}-item::after`]:{transform:"rotate(-45deg)"}},[`&${t}-vertical`]:{[`> ${t}-item`]:{"&::after":{transform:"rotate(225deg)"},[`${t}-item-icon`]:{float:"right"}}},[`&${t}-dot`]:{[`${t}-item-icon ${t}-icon-dot, &${t}-small ${t}-item-icon ${t}-icon-dot`]:{float:"right"}}}}})(e)),(e=>{let{antCls:t,componentCls:i,iconSize:n,iconSizeSM:o,processIconColor:a,marginXXS:r,lineWidthBold:l,lineWidth:s,paddingXXS:c}=e,d=e.calc(n).add(e.calc(l).mul(4).equal()).equal(),p=e.calc(o).add(e.calc(e.lineWidth).mul(4).equal()).equal();return{[`&${i}-with-progress`]:{[`${i}-item`]:{paddingTop:c,[`&-process ${i}-item-container ${i}-item-icon ${i}-icon`]:{color:a}},[`&${i}-vertical > ${i}-item `]:{paddingInlineStart:c,[`> ${i}-item-container > ${i}-item-tail`]:{top:r,insetInlineStart:e.calc(n).div(2).sub(s).add(c).equal()}},[`&, &${i}-small`]:{[`&${i}-horizontal ${i}-item:first-child`]:{paddingBottom:c,paddingInlineStart:c}},[`&${i}-small${i}-vertical > ${i}-item > ${i}-item-container > ${i}-item-tail`]:{insetInlineStart:e.calc(o).div(2).sub(s).add(c).equal()},[`&${i}-label-vertical ${i}-item ${i}-item-tail`]:{top:e.calc(n).div(2).add(c).equal()},[`${i}-item-icon`]:{position:"relative",[`${t}-progress`]:{position:"absolute",insetInlineStart:"50%",top:"50%",transform:"translate(-50%, -50%)","&-inner":{width:`${(0,v.unit)(d)} !important`,height:`${(0,v.unit)(d)} !important`}}},[`&${i}-small`]:{[`&${i}-label-vertical ${i}-item ${i}-item-tail`]:{top:e.calc(o).div(2).add(c).equal()},[`${i}-item-icon ${t}-progress-inner`]:{width:`${(0,v.unit)(p)} !important`,height:`${(0,v.unit)(p)} !important`}}}}})(e)),(e=>{let{componentCls:t,inlineDotSize:i,inlineTitleColor:n,inlineTailColor:o}=e,a=e.calc(e.paddingXS).add(e.lineWidth).equal(),r={[`${t}-item-container ${t}-item-content ${t}-item-title`]:{color:n}};return{[`&${t}-inline`]:{width:"auto",display:"inline-flex",[`${t}-item`]:{flex:"none","&-container":{padding:`${(0,v.unit)(a)} ${(0,v.unit)(e.paddingXXS)} 0`,margin:`0 ${(0,v.unit)(e.calc(e.marginXXS).div(2).equal())}`,borderRadius:e.borderRadiusSM,cursor:"pointer",transition:`background-color ${e.motionDurationMid}`,"&:hover":{background:e.controlItemBgHover},"&[role='button']:hover":{opacity:1}},"&-icon":{width:i,height:i,marginInlineStart:`calc(50% - ${(0,v.unit)(e.calc(i).div(2).equal())})`,[`> ${t}-icon`]:{top:0},[`${t}-icon-dot`]:{borderRadius:e.calc(e.fontSizeSM).div(4).equal(),"&::after":{display:"none"}}},"&-content":{width:"auto",marginTop:e.calc(e.marginXS).sub(e.lineWidth).equal()},"&-title":{color:n,fontSize:e.fontSizeSM,lineHeight:e.lineHeightSM,fontWeight:"normal",marginBottom:e.calc(e.marginXXS).div(2).equal()},"&-description":{display:"none"},"&-tail":{marginInlineStart:0,top:e.calc(i).div(2).add(a).equal(),transform:"translateY(-50%)","&:after":{width:"100%",height:e.lineWidth,borderRadius:0,marginInlineStart:0,background:o}},[`&:first-child ${t}-item-tail`]:{width:"50%",marginInlineStart:"50%"},[`&:last-child ${t}-item-tail`]:{display:"block",width:"50%"},"&-wait":Object.assign({[`${t}-item-icon ${t}-icon ${t}-icon-dot`]:{backgroundColor:e.colorBorderBg,border:`${(0,v.unit)(e.lineWidth)} ${e.lineType} ${o}`}},r),"&-finish":Object.assign({[`${t}-item-tail::after`]:{backgroundColor:o},[`${t}-item-icon ${t}-icon ${t}-icon-dot`]:{backgroundColor:o,border:`${(0,v.unit)(e.lineWidth)} ${e.lineType} ${o}`}},r),"&-error":r,"&-active, &-process":Object.assign({[`${t}-item-icon`]:{width:i,height:i,marginInlineStart:`calc(50% - ${(0,v.unit)(e.calc(i).div(2).equal())})`,top:0}},r),[`&:not(${t}-item-active) > ${t}-item-container[role='button']:hover`]:{[`${t}-item-title`]:{color:n}}}}}})(e))}})((0,y.mergeToken)(e,{processIconColor:n,processTitleColor:o,processDescriptionColor:o,processIconBgColor:a,processIconBorderColor:a,processDotColor:a,processTailColor:d,waitTitleColor:r,waitDescriptionColor:r,waitTailColor:d,waitDotColor:t,finishIconColor:a,finishTitleColor:o,finishDescriptionColor:r,finishTailColor:a,finishDotColor:a,errorIconColor:n,errorTitleColor:s,errorDescriptionColor:s,errorTailColor:d,errorIconBgColor:s,errorIconBorderColor:s,errorDotColor:s,stepsNavActiveColor:a,stepsProgressSize:i,inlineDotSize:6,inlineTitleColor:l,inlineTailColor:c}))},e=>({titleLineHeight:e.controlHeight,customIconSize:e.controlHeight,customIconTop:0,customIconFontSize:e.controlHeightSM,iconSize:e.controlHeight,iconTop:-.5,iconFontSize:e.fontSize,iconSizeSM:e.fontSizeHeading3,dotSize:e.controlHeight/4,dotCurrentSize:e.controlHeightLG/4,navArrowColor:e.colorTextDisabled,navContentMaxWidth:"unset",descriptionMaxWidth:140,waitIconColor:e.wireframe?e.colorTextDisabled:e.colorTextLabel,waitIconBgColor:e.wireframe?e.colorBgContainer:e.colorFillContent,waitIconBorderColor:e.wireframe?e.colorTextDisabled:"transparent",finishIconBgColor:e.wireframe?e.colorBgContainer:e.controlItemBgActive,finishIconBorderColor:e.wireframe?e.colorPrimary:e.controlItemBgActive}));var A=e.i(876556),C=function(e,t){var i={};for(var n in e)Object.prototype.hasOwnProperty.call(e,n)&&0>t.indexOf(n)&&(i[n]=e[n]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols)for(var o=0,n=Object.getOwnPropertySymbols(e);o<n.length;o++)0>t.indexOf(n[o])&&Object.prototype.propertyIsEnumerable.call(e,n[o])&&(i[n[o]]=e[n[o]]);return i};let k=e=>{var a,r;let{percent:l,size:s,className:c,rootClassName:d,direction:p,items:m,responsive:g=!0,current:v=0,children:I,style:S}=e,y=C(e,["percent","size","className","rootClassName","direction","items","responsive","current","children","style"]),{xs:x}=(0,b.default)(g),{getPrefixCls:k,direction:E,className:O,style:T}=(0,f.useComponentConfig)("steps"),j=t.useMemo(()=>g&&x?"vertical":p,[g,x,p]),M=(0,h.default)(s),z=k("steps",e.prefixCls),[N,D,P]=w(z),q="inline"===e.type,H=k("",e.iconPrefix),R=(a=m,r=I,a?a:(0,A.default)(r).map(e=>{if(t.isValidElement(e)){let{props:t}=e;return Object.assign({},t)}return null}).filter(e=>e)),L=q?void 0:l,B=Object.assign(Object.assign({},T),S),G=(0,o.default)(O,{[`${z}-rtl`]:"rtl"===E,[`${z}-with-progress`]:void 0!==L},c,d,D,P),W={finish:t.createElement(i.default,{className:`${z}-finish-icon`}),error:t.createElement(n.default,{className:`${z}-error-icon`})};return N(t.createElement(u,Object.assign({icons:W},y,{style:B,current:v,size:M,items:R,itemRender:q?(e,i)=>e.description?t.createElement(_.default,{title:e.description},i):i:void 0,stepIcon:({node:e,status:i})=>"process"===i&&void 0!==L?t.createElement("div",{className:`${z}-progress-icon`},t.createElement($.default,{type:"circle",percent:L,size:"small"===M?32:40,strokeWidth:4,format:()=>null}),e):e,direction:j,prefixCls:z,iconPrefix:H,className:G})))};k.Step=u.Step,e.s(["Steps",0,k],280898)},190272,785913,e=>{"use strict";var t,i,n=((t={}).AUDIO_SPEECH="audio_speech",t.AUDIO_TRANSCRIPTION="audio_transcription",t.IMAGE_GENERATION="image_generation",t.VIDEO_GENERATION="video_generation",t.CHAT="chat",t.RESPONSES="responses",t.IMAGE_EDITS="image_edits",t.ANTHROPIC_MESSAGES="anthropic_messages",t.EMBEDDING="embedding",t),o=((i={}).IMAGE="image",i.VIDEO="video",i.CHAT="chat",i.RESPONSES="responses",i.IMAGE_EDITS="image_edits",i.ANTHROPIC_MESSAGES="anthropic_messages",i.EMBEDDINGS="embeddings",i.SPEECH="speech",i.TRANSCRIPTION="transcription",i.A2A_AGENTS="a2a_agents",i.MCP="mcp",i);let a={image_generation:"image",video_generation:"video",chat:"chat",responses:"responses",image_edits:"image_edits",anthropic_messages:"anthropic_messages",audio_speech:"speech",audio_transcription:"transcription",embedding:"embeddings"};e.s(["EndpointType",()=>o,"getEndpointType",0,e=>{if(console.log("getEndpointType:",e),Object.values(n).includes(e)){let t=a[e];return console.log("endpointType:",t),t}return"chat"}],785913),e.s(["generateCodeSnippet",0,e=>{let t,{apiKeySource:i,accessToken:n,apiKey:a,inputMessage:r,chatHistory:l,selectedTags:s,selectedVectorStores:c,selectedGuardrails:d,selectedPolicies:p,selectedMCPServers:m,mcpServers:g,mcpServerToolRestrictions:u,selectedVoice:f,endpointType:h,selectedModel:b,selectedSdk:$,proxySettings:_}=e,v="session"===i?n:a,I=window.location.origin,S=_?.LITELLM_UI_API_DOC_BASE_URL;S&&S.trim()?I=S:_?.PROXY_BASE_URL&&(I=_.PROXY_BASE_URL);let y=r||"Your prompt here",x=y.replace(/\\/g,"\\\\").replace(/"/g,'\\"').replace(/\n/g,"\\n"),w=l.filter(e=>!e.isImage).map(({role:e,content:t})=>({role:e,content:t})),A={};s.length>0&&(A.tags=s),c.length>0&&(A.vector_stores=c),d.length>0&&(A.guardrails=d),p.length>0&&(A.policies=p);let C=b||"your-model-name",k="azure"===$?`import openai

client = openai.AzureOpenAI(
	api_key="${v||"YOUR_LITELLM_API_KEY"}",
	azure_endpoint="${I}",
	api_version="2024-02-01"
)`:`import openai

client = openai.OpenAI(
	api_key="${v||"YOUR_LITELLM_API_KEY"}",
	base_url="${I}"
)`;switch(h){case o.CHAT:{let e=Object.keys(A).length>0,i="";if(e){let e=JSON.stringify({metadata:A},null,2).split("\n").map(e=>" ".repeat(4)+e).join("\n").trim();i=`,
    extra_body=${e}`}let n=w.length>0?w:[{role:"user",content:y}];t=`
import base64

# Helper function to encode images to base64
def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

# Example with text only
response = client.chat.completions.create(
    model="${C}",
    messages=${JSON.stringify(n,null,4)}${i}
)

print(response)

# Example with image or PDF (uncomment and provide file path to use)
# base64_file = encode_image("path/to/your/file.jpg")  # or .pdf
# response_with_file = client.chat.completions.create(
#     model="${C}",
#     messages=[
#         {
#             "role": "user",
#             "content": [
#                 {
#                     "type": "text",
#                     "text": "${x}"
#                 },
#                 {
#                     "type": "image_url",
#                     "image_url": {
#                         "url": f"data:image/jpeg;base64,{base64_file}"  # or data:application/pdf;base64,{base64_file}
#                     }
#                 }
#             ]
#         }
#     ]${i}
# )
# print(response_with_file)
`;break}case o.RESPONSES:{let e=Object.keys(A).length>0,i="";if(e){let e=JSON.stringify({metadata:A},null,2).split("\n").map(e=>" ".repeat(4)+e).join("\n").trim();i=`,
    extra_body=${e}`}let n=w.length>0?w:[{role:"user",content:y}];t=`
import base64

# Helper function to encode images to base64
def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

# Example with text only
response = client.responses.create(
    model="${C}",
    input=${JSON.stringify(n,null,4)}${i}
)

print(response.output_text)

# Example with image or PDF (uncomment and provide file path to use)
# base64_file = encode_image("path/to/your/file.jpg")  # or .pdf
# response_with_file = client.responses.create(
#     model="${C}",
#     input=[
#         {
#             "role": "user",
#             "content": [
#                 {"type": "input_text", "text": "${x}"},
#                 {
#                     "type": "input_image",
#                     "image_url": f"data:image/jpeg;base64,{base64_file}",  # or data:application/pdf;base64,{base64_file}
#                 },
#             ],
#         }
#     ]${i}
# )
# print(response_with_file.output_text)
`;break}case o.IMAGE:t="azure"===$?`
# NOTE: The Azure SDK does not have a direct equivalent to the multi-modal 'responses.create' method shown for OpenAI.
# This snippet uses 'client.images.generate' and will create a new image based on your prompt.
# It does not use the uploaded image, as 'client.images.generate' does not support image inputs in this context.
import os
import requests
import json
import time
from PIL import Image

result = client.images.generate(
	model="${C}",
	prompt="${r}",
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
prompt = "${x}"

# Encode images to base64
base64_image1 = encode_image("body-lotion.png")
base64_image2 = encode_image("soap.png")

# Create file IDs
file_id1 = create_file("body-lotion.png")
file_id2 = create_file("incense-kit.png")

response = client.responses.create(
	model="${C}",
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
`;break;case o.IMAGE_EDITS:t="azure"===$?`
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
prompt = "${x}"

# Encode images to base64
base64_image1 = encode_image("body-lotion.png")
base64_image2 = encode_image("soap.png")

# Create file IDs
file_id1 = create_file("body-lotion.png")
file_id2 = create_file("incense-kit.png")

response = client.responses.create(
	model="${C}",
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
prompt = "${x}"

# Encode images to base64
base64_image1 = encode_image("body-lotion.png")
base64_image2 = encode_image("soap.png")

# Create file IDs
file_id1 = create_file("body-lotion.png")
file_id2 = create_file("incense-kit.png")

response = client.responses.create(
	model="${C}",
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
`;break;case o.EMBEDDINGS:t=`
response = client.embeddings.create(
	input="${r||"Your string here"}",
	model="${C}",
	encoding_format="base64" # or "float"
)

print(response.data[0].embedding)
`;break;case o.TRANSCRIPTION:t=`
# Open the audio file
audio_file = open("path/to/your/audio/file.mp3", "rb")

# Make the transcription request
response = client.audio.transcriptions.create(
	model="${C}",
	file=audio_file${r?`,
	prompt="${r.replace(/"/g,'\\"')}"`:""}
)

print(response.text)
`;break;case o.SPEECH:t=`
# Make the text-to-speech request
response = client.audio.speech.create(
	model="${C}",
	input="${r||"Your text to convert to speech here"}",
	voice="${f}"  # Options: alloy, ash, ballad, coral, echo, fable, nova, onyx, sage, shimmer
)

# Save the audio to a file
output_filename = "output_speech.mp3"
response.stream_to_file(output_filename)
print(f"Audio saved to {output_filename}")

# Optional: Customize response format and speed
# response = client.audio.speech.create(
#     model="${C}",
#     input="${r||"Your text to convert to speech here"}",
#     voice="alloy",
#     response_format="mp3",  # Options: mp3, opus, aac, flac, wav, pcm
#     speed=1.0  # Range: 0.25 to 4.0
# )
# response.stream_to_file("output_speech.mp3")
`;break;default:t="\n# Code generation for this endpoint is not implemented yet."}return`${k}
${t}`}],190272)},928685,e=>{"use strict";var t=e.i(38953);e.s(["SearchOutlined",()=>t.default])},209261,e=>{"use strict";e.s(["extractCategories",0,e=>{let t=new Set;return e.forEach(e=>{e.category&&""!==e.category.trim()&&t.add(e.category)}),["All",...Array.from(t).sort(),"Other"]},"filterPluginsByCategory",0,(e,t)=>"All"===t?e:"Other"===t?e.filter(e=>!e.category||""===e.category.trim()):e.filter(e=>e.category===t),"filterPluginsBySearch",0,(e,t)=>{if(!t||""===t.trim())return e;let i=t.toLowerCase().trim();return e.filter(e=>{let t=e.name.toLowerCase().includes(i),n=e.description?.toLowerCase().includes(i)||!1,o=e.keywords?.some(e=>e.toLowerCase().includes(i))||!1;return t||n||o})},"formatDateString",0,e=>{if(!e)return"N/A";try{return new Date(e).toLocaleDateString("en-US",{year:"numeric",month:"short",day:"numeric"})}catch(e){return"Invalid date"}},"formatInstallCommand",0,e=>"github"===e.source.source&&e.source.repo?`/plugin marketplace add ${e.source.repo}`:"url"===e.source.source&&e.source.url?`/plugin marketplace add ${e.source.url}`:`/plugin marketplace add ${e.name}`,"getCategoryBadgeColor",0,e=>{if(!e)return"gray";let t=e.toLowerCase();if(t.includes("development")||t.includes("dev"))return"blue";if(t.includes("productivity")||t.includes("workflow"))return"green";if(t.includes("learning")||t.includes("education"))return"purple";if(t.includes("security")||t.includes("safety"))return"red";if(t.includes("data")||t.includes("analytics"))return"orange";else if(t.includes("integration")||t.includes("api"))return"yellow";return"gray"},"getSourceDisplayText",0,e=>"github"===e.source&&e.repo?`GitHub: ${e.repo}`:"url"===e.source&&e.url?e.url:"Unknown source","getSourceLink",0,e=>"github"===e.source&&e.repo?`https://github.com/${e.repo}`:"url"===e.source&&e.url?e.url:null,"isValidEmail",0,e=>!e||/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e),"isValidSemanticVersion",0,e=>!e||/^\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?(\+[a-zA-Z0-9.-]+)?$/.test(e),"isValidUrl",0,e=>{if(!e)return!0;try{return new URL(e),!0}catch{return!1}},"parseKeywords",0,e=>e&&""!==e.trim()?e.split(",").map(e=>e.trim()).filter(e=>""!==e):[],"validatePluginName",0,e=>!!e&&""!==e.trim()&&/^[a-z0-9-]+$/.test(e)])},916925,e=>{"use strict";var t,i=((t={}).A2A_Agent="A2A Agent",t.AIML="AI/ML API",t.Bedrock="Amazon Bedrock",t.Anthropic="Anthropic",t.AssemblyAI="AssemblyAI",t.SageMaker="AWS SageMaker",t.Azure="Azure",t.Azure_AI_Studio="Azure AI Foundry (Studio)",t.Cerebras="Cerebras",t.Cohere="Cohere",t.Dashscope="Dashscope",t.Databricks="Databricks (Qwen API)",t.DeepInfra="DeepInfra",t.Deepgram="Deepgram",t.Deepseek="Deepseek",t.ElevenLabs="ElevenLabs",t.FalAI="Fal AI",t.FireworksAI="Fireworks AI",t.Google_AI_Studio="Google AI Studio",t.GradientAI="GradientAI",t.Groq="Groq",t.Hosted_Vllm="vllm",t.Infinity="Infinity",t.JinaAI="Jina AI",t.MiniMax="MiniMax",t.MistralAI="Mistral AI",t.Ollama="Ollama",t.OpenAI="OpenAI",t.OpenAI_Compatible="OpenAI-Compatible Endpoints (Together AI, etc.)",t.OpenAI_Text="OpenAI Text Completion",t.OpenAI_Text_Compatible="OpenAI-Compatible Text Completion Models (Together AI, etc.)",t.Openrouter="Openrouter",t.Oracle="Oracle Cloud Infrastructure (OCI)",t.Perplexity="Perplexity",t.RunwayML="RunwayML",t.Sambanova="Sambanova",t.Snowflake="Snowflake",t.TogetherAI="TogetherAI",t.Triton="Triton",t.Vertex_AI="Vertex AI (Anthropic, Gemini, etc.)",t.VolcEngine="VolcEngine",t.Voyage="Voyage AI",t.xAI="xAI",t.SAP="SAP Generative AI Hub",t.Watsonx="Watsonx",t);let n={A2A_Agent:"a2a_agent",AIML:"aiml",OpenAI:"openai",OpenAI_Text:"text-completion-openai",Azure:"azure",Azure_AI_Studio:"azure_ai",Anthropic:"anthropic",Google_AI_Studio:"gemini",Bedrock:"bedrock",Groq:"groq",MiniMax:"minimax",MistralAI:"mistral",Cohere:"cohere",OpenAI_Compatible:"openai",OpenAI_Text_Compatible:"text-completion-openai",Vertex_AI:"vertex_ai",Databricks:"databricks",Dashscope:"dashscope",xAI:"xai",Deepseek:"deepseek",Ollama:"ollama",AssemblyAI:"assemblyai",Cerebras:"cerebras",Sambanova:"sambanova",Perplexity:"perplexity",RunwayML:"runwayml",TogetherAI:"together_ai",Openrouter:"openrouter",Oracle:"oci",Snowflake:"snowflake",FireworksAI:"fireworks_ai",GradientAI:"gradient_ai",Triton:"triton",Deepgram:"deepgram",ElevenLabs:"elevenlabs",FalAI:"fal_ai",SageMaker:"sagemaker_chat",Voyage:"voyage",JinaAI:"jina_ai",VolcEngine:"volcengine",DeepInfra:"deepinfra",Hosted_Vllm:"hosted_vllm",Infinity:"infinity",SAP:"sap",Watsonx:"watsonx"},o="../ui/assets/logos/",a={"A2A Agent":`${o}a2a_agent.png`,"AI/ML API":`${o}aiml_api.svg`,Anthropic:`${o}anthropic.svg`,AssemblyAI:`${o}assemblyai_small.png`,Azure:`${o}microsoft_azure.svg`,"Azure AI Foundry (Studio)":`${o}microsoft_azure.svg`,"Amazon Bedrock":`${o}bedrock.svg`,"AWS SageMaker":`${o}bedrock.svg`,Cerebras:`${o}cerebras.svg`,Cohere:`${o}cohere.svg`,"Databricks (Qwen API)":`${o}databricks.svg`,Dashscope:`${o}dashscope.svg`,Deepseek:`${o}deepseek.svg`,"Fireworks AI":`${o}fireworks.svg`,Groq:`${o}groq.svg`,"Google AI Studio":`${o}google.svg`,vllm:`${o}vllm.png`,Infinity:`${o}infinity.png`,MiniMax:`${o}minimax.svg`,"Mistral AI":`${o}mistral.svg`,Ollama:`${o}ollama.svg`,OpenAI:`${o}openai_small.svg`,"OpenAI Text Completion":`${o}openai_small.svg`,"OpenAI-Compatible Text Completion Models (Together AI, etc.)":`${o}openai_small.svg`,"OpenAI-Compatible Endpoints (Together AI, etc.)":`${o}openai_small.svg`,Openrouter:`${o}openrouter.svg`,"Oracle Cloud Infrastructure (OCI)":`${o}oracle.svg`,Perplexity:`${o}perplexity-ai.svg`,RunwayML:`${o}runwayml.png`,Sambanova:`${o}sambanova.svg`,Snowflake:`${o}snowflake.svg`,TogetherAI:`${o}togetherai.svg`,"Vertex AI (Anthropic, Gemini, etc.)":`${o}google.svg`,xAI:`${o}xai.svg`,GradientAI:`${o}gradientai.svg`,Triton:`${o}nvidia_triton.png`,Deepgram:`${o}deepgram.png`,ElevenLabs:`${o}elevenlabs.png`,"Fal AI":`${o}fal_ai.jpg`,"Voyage AI":`${o}voyage.webp`,"Jina AI":`${o}jina.png`,VolcEngine:`${o}volcengine.png`,DeepInfra:`${o}deepinfra.png`,"SAP Generative AI Hub":`${o}sap.png`};e.s(["Providers",()=>i,"getPlaceholder",0,e=>{if("AI/ML API"===e)return"aiml/flux-pro/v1.1";if("Vertex AI (Anthropic, Gemini, etc.)"===e)return"gemini-pro";if("Anthropic"==e)return"claude-3-opus";if("Amazon Bedrock"==e)return"claude-3-opus";if("AWS SageMaker"==e)return"sagemaker/jumpstart-dft-meta-textgeneration-llama-2-7b";else if("Google AI Studio"==e)return"gemini-pro";else if("Azure AI Foundry (Studio)"==e)return"azure_ai/command-r-plus";else if("Azure"==e)return"my-deployment";else if("Oracle Cloud Infrastructure (OCI)"==e)return"oci/xai.grok-4";else if("Snowflake"==e)return"snowflake/mistral-7b";else if("Voyage AI"==e)return"voyage/";else if("Jina AI"==e)return"jina_ai/";else if("VolcEngine"==e)return"volcengine/<any-model-on-volcengine>";else if("DeepInfra"==e)return"deepinfra/<any-model-on-deepinfra>";else if("Fal AI"==e)return"fal_ai/fal-ai/flux-pro/v1.1-ultra";else if("RunwayML"==e)return"runwayml/gen4_turbo";else if("Watsonx"===e)return"watsonx/ibm/granite-3-3-8b-instruct";else return"gpt-3.5-turbo"},"getProviderLogoAndName",0,e=>{if(!e)return{logo:"",displayName:"-"};if("gemini"===e.toLowerCase()){let e="Google AI Studio";return{logo:a[e],displayName:e}}let t=Object.keys(n).find(t=>n[t].toLowerCase()===e.toLowerCase());if(!t)return{logo:"",displayName:e};let o=i[t];return{logo:a[o],displayName:o}},"getProviderModels",0,(e,t)=>{console.log(`Provider key: ${e}`);let i=n[e];console.log(`Provider mapped to: ${i}`);let o=[];return e&&"object"==typeof t&&(Object.entries(t).forEach(([e,t])=>{if(null!==t&&"object"==typeof t&&"litellm_provider"in t){let n=t.litellm_provider;(n===i||"string"==typeof n&&n.includes(i))&&o.push(e)}}),"Cohere"==e&&(console.log("Adding cohere chat models"),Object.entries(t).forEach(([e,t])=>{null!==t&&"object"==typeof t&&"litellm_provider"in t&&"cohere_chat"===t.litellm_provider&&o.push(e)})),"AWS SageMaker"==e&&(console.log("Adding sagemaker chat models"),Object.entries(t).forEach(([e,t])=>{null!==t&&"object"==typeof t&&"litellm_provider"in t&&"sagemaker_chat"===t.litellm_provider&&o.push(e)}))),o},"providerLogoMap",0,a,"provider_map",0,n])},166406,e=>{"use strict";var t=e.i(190144);e.s(["CopyOutlined",()=>t.default])},94629,e=>{"use strict";var t=e.i(271645);let i=t.forwardRef(function(e,i){return t.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:2,stroke:"currentColor","aria-hidden":"true",ref:i},e),t.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"}))});e.s(["SwitchVerticalIcon",0,i],94629)},798496,e=>{"use strict";var t=e.i(843476),i=e.i(152990),n=e.i(682830),o=e.i(271645),a=e.i(269200),r=e.i(427612),l=e.i(64848),s=e.i(942232),c=e.i(496020),d=e.i(977572),p=e.i(94629),m=e.i(360820),g=e.i(871943);function u({data:e=[],columns:u,isLoading:f=!1,defaultSorting:h=[],pagination:b,onPaginationChange:$,enablePagination:_=!1}){let[v,I]=o.default.useState(h),[S]=o.default.useState("onChange"),[y,x]=o.default.useState({}),[w,A]=o.default.useState({}),C=(0,i.useReactTable)({data:e,columns:u,state:{sorting:v,columnSizing:y,columnVisibility:w,..._&&b?{pagination:b}:{}},columnResizeMode:S,onSortingChange:I,onColumnSizingChange:x,onColumnVisibilityChange:A,..._&&$?{onPaginationChange:$}:{},getCoreRowModel:(0,n.getCoreRowModel)(),getSortedRowModel:(0,n.getSortedRowModel)(),..._?{getPaginationRowModel:(0,n.getPaginationRowModel)()}:{},enableSorting:!0,enableColumnResizing:!0,defaultColumn:{minSize:40,maxSize:500}});return(0,t.jsx)("div",{className:"rounded-lg custom-border relative",children:(0,t.jsx)("div",{className:"overflow-x-auto",children:(0,t.jsx)("div",{className:"relative min-w-full",children:(0,t.jsxs)(a.Table,{className:"[&_td]:py-2 [&_th]:py-2",style:{width:C.getTotalSize(),minWidth:"100%",tableLayout:"fixed"},children:[(0,t.jsx)(r.TableHead,{children:C.getHeaderGroups().map(e=>(0,t.jsx)(c.TableRow,{children:e.headers.map(e=>(0,t.jsxs)(l.TableHeaderCell,{className:`py-1 h-8 relative ${"actions"===e.id?"sticky right-0 bg-white shadow-[-4px_0_8px_-6px_rgba(0,0,0,0.1)] w-[120px] ml-8":""} ${e.column.columnDef.meta?.className||""}`,style:{width:"actions"===e.id?120:e.getSize(),position:"actions"===e.id?"sticky":"relative",right:"actions"===e.id?0:"auto"},onClick:e.column.getCanSort()?e.column.getToggleSortingHandler():void 0,children:[(0,t.jsxs)("div",{className:"flex items-center justify-between gap-2",children:[(0,t.jsx)("div",{className:"flex items-center",children:e.isPlaceholder?null:(0,i.flexRender)(e.column.columnDef.header,e.getContext())}),"actions"!==e.id&&e.column.getCanSort()&&(0,t.jsx)("div",{className:"w-4",children:e.column.getIsSorted()?({asc:(0,t.jsx)(m.ChevronUpIcon,{className:"h-4 w-4 text-blue-500"}),desc:(0,t.jsx)(g.ChevronDownIcon,{className:"h-4 w-4 text-blue-500"})})[e.column.getIsSorted()]:(0,t.jsx)(p.SwitchVerticalIcon,{className:"h-4 w-4 text-gray-400"})})]}),e.column.getCanResize()&&(0,t.jsx)("div",{onMouseDown:e.getResizeHandler(),onTouchStart:e.getResizeHandler(),className:`absolute right-0 top-0 h-full w-2 cursor-col-resize select-none touch-none ${e.column.getIsResizing()?"bg-blue-500":"hover:bg-blue-200"}`})]},e.id))},e.id))}),(0,t.jsx)(s.TableBody,{children:f?(0,t.jsx)(c.TableRow,{children:(0,t.jsx)(d.TableCell,{colSpan:u.length,className:"h-8 text-center",children:(0,t.jsx)("div",{className:"text-center text-gray-500",children:(0,t.jsx)("p",{children:"🚅 Loading models..."})})})}):C.getRowModel().rows.length>0?C.getRowModel().rows.map(e=>(0,t.jsx)(c.TableRow,{children:e.getVisibleCells().map(e=>(0,t.jsx)(d.TableCell,{className:`py-0.5 overflow-hidden ${"actions"===e.column.id?"sticky right-0 bg-white shadow-[-4px_0_8px_-6px_rgba(0,0,0,0.1)] w-[120px] ml-8":""} ${e.column.columnDef.meta?.className||""}`,style:{width:"actions"===e.column.id?120:e.column.getSize(),position:"actions"===e.column.id?"sticky":"relative",right:"actions"===e.column.id?0:"auto"},children:(0,i.flexRender)(e.column.columnDef.cell,e.getContext())},e.id))},e.id)):(0,t.jsx)(c.TableRow,{children:(0,t.jsx)(d.TableCell,{colSpan:u.length,className:"h-8 text-center",children:(0,t.jsx)("div",{className:"text-center text-gray-500",children:(0,t.jsx)("p",{children:"No models found"})})})})})]})})})})}e.s(["ModelDataTable",()=>u])}]);