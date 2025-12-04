import{j as e}from"./jsx-runtime-Dg5ontpF.js";import{c as u}from"./index-B_jtOnfb.js";import{c as l}from"./utils-CDN07tui.js";import"./iframe-C0moAmFQ.js";import"./preload-helper-PPVm8Dsz.js";const p=u("relative w-full rounded-lg border px-4 py-3 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground [&>svg~*]:pl-7",{variants:{variant:{default:"bg-background text-foreground",destructive:"border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive"}},defaultVariants:{variant:"default"}});function s({className:r,variant:t,...d}){return e.jsx("div",{role:"alert",className:l(p({variant:t}),r),...d})}function c({className:r,...t}){return e.jsx("h5",{className:l("mb-1 font-medium leading-none tracking-tight",r),...t})}function o({className:r,...t}){return e.jsx("div",{className:l("text-sm [&_p]:leading-relaxed",r),...t})}s.__docgenInfo={description:"",methods:[],displayName:"Alert"};c.__docgenInfo={description:"",methods:[],displayName:"AlertTitle"};o.__docgenInfo={description:"",methods:[],displayName:"AlertDescription"};const x={title:"shared/ui/Alert",component:s,parameters:{layout:"centered"},tags:["autodocs"],argTypes:{variant:{control:{type:"select"},options:["default","destructive"]}}},a={render:()=>e.jsxs(s,{children:[e.jsx(c,{children:"Info"}),e.jsx(o,{children:"This is a default alert message."})]})},i={render:()=>e.jsxs(s,{variant:"destructive",children:[e.jsx(c,{children:"Error"}),e.jsx(o,{children:"This is an error alert message."})]})},n={render:()=>e.jsx(s,{children:e.jsx(o,{children:"This is an alert without a title."})})};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  render: () => <Alert>
      <AlertTitle>Info</AlertTitle>
      <AlertDescription>This is a default alert message.</AlertDescription>
    </Alert>
}`,...a.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  render: () => <Alert variant="destructive">
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>This is an error alert message.</AlertDescription>
    </Alert>
}`,...i.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  render: () => <Alert>
      <AlertDescription>This is an alert without a title.</AlertDescription>
    </Alert>
}`,...n.parameters?.docs?.source}}};const A=["Default","Destructive","WithoutTitle"];export{a as Default,i as Destructive,n as WithoutTitle,A as __namedExportsOrder,x as default};
