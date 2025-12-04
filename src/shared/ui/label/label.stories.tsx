import React from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs'
import { Label } from './label'

const meta = {
  title: 'shared/ui/Label',
  component: Label,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Label>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'Email address',
  },
}

export const WithInput: Story = {
  render: () => (
    <div className="space-y-2">
      <Label htmlFor="email">Email address</Label>
      <input
        id="email"
        type="email"
        placeholder="Enter your email"
        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
      />
    </div>
  ),
}

export const Required: Story = {
  render: () => (
    <Label>
      Password <span className="text-destructive">*</span>
    </Label>
  ),
}

export const Disabled: Story = {
  render: () => (
    <div className="space-y-2">
      <Label
        htmlFor="disabled-input"
        className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        Disabled field
      </Label>
      <input
        id="disabled-input"
        type="text"
        disabled
        placeholder="This field is disabled"
        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 peer"
      />
    </div>
  ),
}
