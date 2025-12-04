import{j as e}from"./jsx-runtime-Dg5ontpF.js";import{c as s}from"./utils-CDN07tui.js";import"./iframe-C0moAmFQ.js";import"./preload-helper-PPVm8Dsz.js";function a({className:r,...n}){return e.jsx("div",{className:s("rounded-xl border bg-card text-card-foreground shadow",r),...n})}function i({className:r,...n}){return e.jsx("div",{className:s("flex flex-col space-y-1.5 p-6",r),...n})}function l({className:r,...n}){return e.jsx("div",{className:s("font-semibold leading-none tracking-tight",r),...n})}function p({className:r,...n}){return e.jsx("div",{className:s("text-sm text-muted-foreground",r),...n})}function m({className:r,...n}){return e.jsx("div",{className:s("p-6 pt-0",r),...n})}function u({className:r,...n}){return e.jsx("div",{className:s("flex items-center p-6 pt-0",r),...n})}a.__docgenInfo={description:"",methods:[],displayName:"Card"};i.__docgenInfo={description:"",methods:[],displayName:"CardHeader"};u.__docgenInfo={description:"",methods:[],displayName:"CardFooter"};l.__docgenInfo={description:"",methods:[],displayName:"CardTitle"};p.__docgenInfo={description:"",methods:[],displayName:"CardDescription"};m.__docgenInfo={description:"",methods:[],displayName:"CardContent"};const f={title:"shared/ui/Card",component:a,parameters:{layout:"centered"},tags:["autodocs"]},t={render:()=>e.jsxs(a,{className:"w-80",children:[e.jsxs(i,{children:[e.jsx(l,{children:"Card Title"}),e.jsx(p,{children:"This is a card description"})]}),e.jsx(m,{children:e.jsx("p",{children:"Card content goes here."})}),e.jsx(u,{children:e.jsx("button",{className:"px-4 py-2 bg-blue-500 text-white rounded",children:"Action"})})]})},d={render:()=>e.jsx(a,{className:"w-80",children:e.jsx(m,{className:"p-6",children:e.jsx("p",{children:"A simple card with just content."})})})},o={render:()=>e.jsxs(a,{className:"w-80",children:[e.jsxs(i,{children:[e.jsx(l,{children:"Settings"}),e.jsx(p,{children:"Manage your account preferences"})]}),e.jsx(m,{children:e.jsxs("div",{className:"space-y-2",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("span",{children:"Notifications"}),e.jsx("input",{type:"checkbox"})]}),e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("span",{children:"Dark Mode"}),e.jsx("input",{type:"checkbox"})]})]})})]})},c={render:()=>e.jsx(a,{className:"w-80",children:e.jsxs(i,{children:[e.jsx(l,{children:"Welcome"}),e.jsx(p,{children:"Get started with our platform"})]})})};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  render: () => <Card className="w-80">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>This is a card description</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card content goes here.</p>
      </CardContent>
      <CardFooter>
        <button className="px-4 py-2 bg-blue-500 text-white rounded">
          Action
        </button>
      </CardFooter>
    </Card>
}`,...t.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => <Card className="w-80">
      <CardContent className="p-6">
        <p>A simple card with just content.</p>
      </CardContent>
    </Card>
}`,...d.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  render: () => <Card className="w-80">
      <CardHeader>
        <CardTitle>Settings</CardTitle>
        <CardDescription>Manage your account preferences</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span>Notifications</span>
            <input type="checkbox" />
          </div>
          <div className="flex items-center justify-between">
            <span>Dark Mode</span>
            <input type="checkbox" />
          </div>
        </div>
      </CardContent>
    </Card>
}`,...o.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  render: () => <Card className="w-80">
      <CardHeader>
        <CardTitle>Welcome</CardTitle>
        <CardDescription>Get started with our platform</CardDescription>
      </CardHeader>
    </Card>
}`,...c.parameters?.docs?.source}}};const N=["Default","Simple","WithoutFooter","HeaderOnly"];export{t as Default,c as HeaderOnly,d as Simple,o as WithoutFooter,N as __namedExportsOrder,f as default};
