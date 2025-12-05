import{j as r}from"./jsx-runtime-Dg5ontpF.js";import{c as C}from"./utils-CDN07tui.js";import{r as i}from"./iframe-C0moAmFQ.js";import"./preload-helper-PPVm8Dsz.js";const L=s=>s.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),j=s=>s.replace(/^([A-Z])|[\s-_]+(\w)/g,(e,a,t)=>t?t.toUpperCase():a.toLowerCase()),f=s=>{const e=j(s);return e.charAt(0).toUpperCase()+e.slice(1)},N=(...s)=>s.filter((e,a,t)=>!!e&&e.trim()!==""&&t.indexOf(e)===a).join(" ").trim(),b=s=>{for(const e in s)if(e.startsWith("aria-")||e==="role"||e==="title")return!0};var y={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};const A=i.forwardRef(({color:s="currentColor",size:e=24,strokeWidth:a=2,absoluteStrokeWidth:t,className:x="",children:n,iconNode:v,...h},w)=>i.createElement("svg",{ref:w,...y,width:e,height:e,stroke:s,strokeWidth:t?Number(a)*24/Number(e):a,className:N("lucide",x),...!n&&!b(h)&&{"aria-hidden":"true"},...h},[...v.map(([S,z])=>i.createElement(S,z)),...Array.isArray(n)?n:[n]]));const _=(s,e)=>{const a=i.forwardRef(({className:t,...x},n)=>i.createElement(A,{ref:n,iconNode:e,className:N(`lucide-${L(f(s))}`,`lucide-${s}`,t),...x}));return a.displayName=f(s),a};const k=[["path",{d:"M21 12a9 9 0 1 1-6.219-8.56",key:"13zald"}]],E=_("loader-circle",k),I={sm:"h-4 w-4",md:"h-6 w-6",lg:"h-8 w-8"};function o({size:s="md",className:e}){return r.jsx(E,{className:C("animate-spin text-muted-foreground",I[s],e)})}o.__docgenInfo={description:"",methods:[],displayName:"LoadingSpinner",props:{size:{required:!1,tsType:{name:"union",raw:"'sm' | 'md' | 'lg'",elements:[{name:"literal",value:"'sm'"},{name:"literal",value:"'md'"},{name:"literal",value:"'lg'"}]},description:"",defaultValue:{value:"'md'",computed:!1}},className:{required:!1,tsType:{name:"string"},description:""}}};const T={title:"shared/ui/LoadingSpinner",component:o,parameters:{layout:"centered"},tags:["autodocs"],argTypes:{size:{control:{type:"select"},options:["sm","md","lg"]}}},c={args:{}},m={args:{size:"sm"}},l={args:{size:"md"}},d={args:{size:"lg"}},p={args:{className:"text-blue-500"}},u={render:()=>r.jsxs("button",{className:"inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-md disabled:opacity-50",children:[r.jsx(o,{size:"sm",className:"mr-2 text-white"}),"Loading..."]})},g={render:()=>r.jsxs("div",{className:"flex items-center gap-4",children:[r.jsxs("div",{className:"text-center",children:[r.jsx(o,{size:"sm"}),r.jsx("p",{className:"mt-2 text-xs",children:"Small"})]}),r.jsxs("div",{className:"text-center",children:[r.jsx(o,{size:"md"}),r.jsx("p",{className:"mt-2 text-xs",children:"Medium"})]}),r.jsxs("div",{className:"text-center",children:[r.jsx(o,{size:"lg"}),r.jsx("p",{className:"mt-2 text-xs",children:"Large"})]})]})};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {}
}`,...c.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'sm'
  }
}`,...m.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'md'
  }
}`,...l.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'lg'
  }
}`,...d.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    className: 'text-blue-500'
  }
}`,...p.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  render: () => <button className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-md disabled:opacity-50">
      <LoadingSpinner size="sm" className="mr-2 text-white" />
      Loading...
    </button>
}`,...u.parameters?.docs?.source}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex items-center gap-4">
      <div className="text-center">
        <LoadingSpinner size="sm" />
        <p className="mt-2 text-xs">Small</p>
      </div>
      <div className="text-center">
        <LoadingSpinner size="md" />
        <p className="mt-2 text-xs">Medium</p>
      </div>
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-2 text-xs">Large</p>
      </div>
    </div>
}`,...g.parameters?.docs?.source}}};const q=["Default","Small","Medium","Large","CustomColor","InButton","AllSizes"];export{g as AllSizes,p as CustomColor,c as Default,u as InButton,d as Large,l as Medium,m as Small,q as __namedExportsOrder,T as default};
