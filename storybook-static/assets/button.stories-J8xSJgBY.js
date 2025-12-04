import{j as v}from"./jsx-runtime-Dg5ontpF.js";import{S as f}from"./index-BxU64hHK.js";import{c as y}from"./index-B_jtOnfb.js";import{c as b}from"./utils-CDN07tui.js";import"./iframe-C0moAmFQ.js";import"./preload-helper-PPVm8Dsz.js";const B=y("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",{variants:{variant:{default:"bg-primary text-primary-foreground shadow hover:bg-primary/90",destructive:"bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",outline:"border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",secondary:"bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",ghost:"hover:bg-accent hover:text-accent-foreground",link:"text-primary underline-offset-4 hover:underline"},size:{default:"h-9 px-4 py-2",sm:"h-8 rounded-md px-3 text-xs",lg:"h-10 rounded-md px-8",icon:"h-9 w-9"}},defaultVariants:{variant:"default",size:"default"}});function d({className:u,variant:l,size:m,asChild:p=!1,...g}){const h=p?f:"button";return v.jsx(h,{className:b(B({variant:l,size:m,className:u})),...g})}d.__docgenInfo={description:"",methods:[],displayName:"Button",props:{asChild:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}}},composes:["VariantProps"]};const j={title:"shared/ui/Button",component:d,parameters:{layout:"centered"},tags:["autodocs"],argTypes:{variant:{control:{type:"select"},options:["default","destructive","outline","secondary","ghost","link"]},size:{control:{type:"select"},options:["default","sm","lg","icon"]},asChild:{control:{type:"boolean"}}}},e={args:{children:"Button"}},r={args:{variant:"secondary",children:"Button"}},t={args:{variant:"destructive",children:"Button"}},s={args:{variant:"outline",children:"Button"}},n={args:{variant:"ghost",children:"Button"}},o={args:{variant:"link",children:"Button"}},a={args:{size:"sm",children:"Button"}},c={args:{size:"lg",children:"Button"}},i={args:{size:"icon",children:"🔍"}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  args: {
    children: 'Button'
  }
}`,...e.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    variant: 'secondary',
    children: 'Button'
  }
}`,...r.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    variant: 'destructive',
    children: 'Button'
  }
}`,...t.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    variant: 'outline',
    children: 'Button'
  }
}`,...s.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    variant: 'ghost',
    children: 'Button'
  }
}`,...n.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    variant: 'link',
    children: 'Button'
  }
}`,...o.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'sm',
    children: 'Button'
  }
}`,...a.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'lg',
    children: 'Button'
  }
}`,...c.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'icon',
    children: '🔍'
  }
}`,...i.parameters?.docs?.source}}};const D=["Default","Secondary","Destructive","Outline","Ghost","Link","Small","Large","Icon"];export{e as Default,t as Destructive,n as Ghost,i as Icon,c as Large,o as Link,s as Outline,r as Secondary,a as Small,D as __namedExportsOrder,j as default};
