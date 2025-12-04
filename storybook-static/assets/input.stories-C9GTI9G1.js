import{j as i}from"./jsx-runtime-Dg5ontpF.js";import{c as m}from"./utils-CDN07tui.js";import"./iframe-C0moAmFQ.js";import"./preload-helper-PPVm8Dsz.js";function l({className:c,type:p,...d}){return i.jsx("input",{type:p,className:m("flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",c),...d})}l.__docgenInfo={description:"",methods:[],displayName:"Input"};const x={title:"shared/ui/Input",component:l,parameters:{layout:"centered"},tags:["autodocs"],argTypes:{type:{control:{type:"select"},options:["text","email","password","number","tel","url"]}}},e={args:{placeholder:"Enter text here..."}},r={args:{value:"Sample text",placeholder:"Enter text here..."}},a={args:{type:"email",placeholder:"Enter your email..."}},s={args:{type:"password",placeholder:"Enter your password..."}},t={args:{placeholder:"Disabled input",disabled:!0}},o={args:{placeholder:"Enter text here...",className:"border-destructive"}},n={args:{type:"file"}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  args: {
    placeholder: 'Enter text here...'
  }
}`,...e.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    value: 'Sample text',
    placeholder: 'Enter text here...'
  }
}`,...r.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    type: 'email',
    placeholder: 'Enter your email...'
  }
}`,...a.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    type: 'password',
    placeholder: 'Enter your password...'
  }
}`,...s.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    placeholder: 'Disabled input',
    disabled: true
  }
}`,...t.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    placeholder: 'Enter text here...',
    className: 'border-destructive'
  }
}`,...o.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    type: 'file'
  }
}`,...n.parameters?.docs?.source}}};const b=["Default","WithValue","Email","Password","Disabled","WithError","File"];export{e as Default,t as Disabled,a as Email,n as File,s as Password,o as WithError,r as WithValue,b as __namedExportsOrder,x as default};
