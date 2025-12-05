import{j as e}from"./jsx-runtime-Dg5ontpF.js";import{r as h}from"./iframe-C0moAmFQ.js";import{P as v}from"./index-CqTJiuxk.js";import{c as N}from"./utils-CDN07tui.js";import"./preload-helper-PPVm8Dsz.js";import"./index-CF0hAQ6f.js";import"./index-BxU64hHK.js";var f="Separator",l="horizontal",g=["horizontal","vertical"],p=h.forwardRef((r,a)=>{const{decorative:d,orientation:s=l,...x}=r,m=j(s)?s:l,u=d?{role:"none"}:{"aria-orientation":m==="vertical"?m:void 0,role:"separator"};return e.jsx(v.div,{"data-orientation":m,...u,...x,ref:a})});p.displayName=f;function j(r){return g.includes(r)}var b=p;function t({className:r,orientation:a="horizontal",decorative:d=!0,...s}){return e.jsx(b,{decorative:d,orientation:a,className:N("shrink-0 bg-border",a==="horizontal"?"h-[1px] w-full":"h-full w-[1px]",r),...s})}t.__docgenInfo={description:"",methods:[],displayName:"Separator",props:{orientation:{defaultValue:{value:"'horizontal'",computed:!1},required:!1},decorative:{defaultValue:{value:"true",computed:!1},required:!1}}};const w={title:"shared/ui/Separator",component:t,parameters:{layout:"centered"},tags:["autodocs"],argTypes:{orientation:{control:{type:"select"},options:["horizontal","vertical"]},decorative:{control:{type:"boolean"}}}},o={args:{}},n={render:()=>e.jsxs("div",{className:"w-64 space-y-4",children:[e.jsxs("div",{children:[e.jsx("h3",{className:"text-lg font-semibold",children:"Section 1"}),e.jsx("p",{className:"text-sm text-muted-foreground",children:"This is the first section."})]}),e.jsx(t,{}),e.jsxs("div",{children:[e.jsx("h3",{className:"text-lg font-semibold",children:"Section 2"}),e.jsx("p",{className:"text-sm text-muted-foreground",children:"This is the second section."})]})]})},i={render:()=>e.jsxs("div",{className:"flex h-20 items-center space-x-4",children:[e.jsxs("div",{className:"text-center",children:[e.jsx("p",{className:"text-sm font-medium",children:"Item 1"}),e.jsx("p",{className:"text-xs text-muted-foreground",children:"Description"})]}),e.jsx(t,{orientation:"vertical"}),e.jsxs("div",{className:"text-center",children:[e.jsx("p",{className:"text-sm font-medium",children:"Item 2"}),e.jsx("p",{className:"text-xs text-muted-foreground",children:"Description"})]}),e.jsx(t,{orientation:"vertical"}),e.jsxs("div",{className:"text-center",children:[e.jsx("p",{className:"text-sm font-medium",children:"Item 3"}),e.jsx("p",{className:"text-xs text-muted-foreground",children:"Description"})]})]})},c={render:()=>e.jsx("div",{className:"w-64",children:e.jsxs("nav",{className:"space-y-2",children:[e.jsx("a",{href:"#",className:"block px-3 py-2 rounded-md hover:bg-muted",children:"Home"}),e.jsx("a",{href:"#",className:"block px-3 py-2 rounded-md hover:bg-muted",children:"About"}),e.jsx(t,{className:"my-2"}),e.jsx("a",{href:"#",className:"block px-3 py-2 rounded-md hover:bg-muted",children:"Contact"}),e.jsx("a",{href:"#",className:"block px-3 py-2 rounded-md hover:bg-muted",children:"Support"})]})})};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {}
}`,...o.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  render: () => <div className="w-64 space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Section 1</h3>
        <p className="text-sm text-muted-foreground">
          This is the first section.
        </p>
      </div>
      <Separator />
      <div>
        <h3 className="text-lg font-semibold">Section 2</h3>
        <p className="text-sm text-muted-foreground">
          This is the second section.
        </p>
      </div>
    </div>
}`,...n.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex h-20 items-center space-x-4">
      <div className="text-center">
        <p className="text-sm font-medium">Item 1</p>
        <p className="text-xs text-muted-foreground">Description</p>
      </div>
      <Separator orientation="vertical" />
      <div className="text-center">
        <p className="text-sm font-medium">Item 2</p>
        <p className="text-xs text-muted-foreground">Description</p>
      </div>
      <Separator orientation="vertical" />
      <div className="text-center">
        <p className="text-sm font-medium">Item 3</p>
        <p className="text-xs text-muted-foreground">Description</p>
      </div>
    </div>
}`,...i.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  render: () => <div className="w-64">
      <nav className="space-y-2">
        <a href="#" className="block px-3 py-2 rounded-md hover:bg-muted">
          Home
        </a>
        <a href="#" className="block px-3 py-2 rounded-md hover:bg-muted">
          About
        </a>
        <Separator className="my-2" />
        <a href="#" className="block px-3 py-2 rounded-md hover:bg-muted">
          Contact
        </a>
        <a href="#" className="block px-3 py-2 rounded-md hover:bg-muted">
          Support
        </a>
      </nav>
    </div>
}`,...c.parameters?.docs?.source}}};const E=["Default","Horizontal","Vertical","InNavigation"];export{o as Default,n as Horizontal,c as InNavigation,i as Vertical,E as __namedExportsOrder,w as default};
