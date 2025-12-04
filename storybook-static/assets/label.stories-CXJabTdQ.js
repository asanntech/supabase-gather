import{j as e}from"./jsx-runtime-Dg5ontpF.js";import{r as c}from"./iframe-C0moAmFQ.js";import{P as m}from"./index-CqTJiuxk.js";import{c as p}from"./index-B_jtOnfb.js";import{c as u}from"./utils-CDN07tui.js";import"./preload-helper-PPVm8Dsz.js";import"./index-CF0hAQ6f.js";import"./index-BxU64hHK.js";var b="Label",n=c.forwardRef((a,d)=>e.jsx(m.label,{...a,ref:d,onMouseDown:r=>{r.target.closest("button, input, select, textarea")||(a.onMouseDown?.(r),!r.defaultPrevented&&r.detail>1&&r.preventDefault())}}));n.displayName=b;var f=n;const x=p("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70");function s({className:a,...d}){return e.jsx(f,{className:u(x(),a),...d})}s.__docgenInfo={description:"",methods:[],displayName:"Label"};const D={title:"shared/ui/Label",component:s,parameters:{layout:"centered"},tags:["autodocs"]},i={args:{children:"Email address"}},t={render:()=>e.jsxs("div",{className:"space-y-2",children:[e.jsx(s,{htmlFor:"email",children:"Email address"}),e.jsx("input",{id:"email",type:"email",placeholder:"Enter your email",className:"flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"})]})},o={render:()=>e.jsxs(s,{children:["Password ",e.jsx("span",{className:"text-destructive",children:"*"})]})},l={render:()=>e.jsxs("div",{className:"space-y-2",children:[e.jsx(s,{htmlFor:"disabled-input",className:"peer-disabled:cursor-not-allowed peer-disabled:opacity-70",children:"Disabled field"}),e.jsx("input",{id:"disabled-input",type:"text",disabled:!0,placeholder:"This field is disabled",className:"flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 peer"})]})};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    children: 'Email address'
  }
}`,...i.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  render: () => <div className="space-y-2">
      <Label htmlFor="email">Email address</Label>
      <input id="email" type="email" placeholder="Enter your email" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" />
    </div>
}`,...t.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  render: () => <Label>
      Password <span className="text-destructive">*</span>
    </Label>
}`,...o.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: () => <div className="space-y-2">
      <Label htmlFor="disabled-input" className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        Disabled field
      </Label>
      <input id="disabled-input" type="text" disabled placeholder="This field is disabled" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 peer" />
    </div>
}`,...l.parameters?.docs?.source}}};const P=["Default","WithInput","Required","Disabled"];export{i as Default,l as Disabled,o as Required,t as WithInput,P as __namedExportsOrder,D as default};
