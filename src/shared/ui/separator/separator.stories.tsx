import type { Meta, StoryObj } from '@storybook/react'
import { Separator } from './separator'

const meta = {
  title: 'shared/ui/Separator',
  component: Separator,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: { type: 'select' },
      options: ['horizontal', 'vertical'],
    },
    decorative: {
      control: { type: 'boolean' },
    },
  },
} satisfies Meta<typeof Separator>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
}

export const Horizontal: Story = {
  render: () => (
    <div className="w-64 space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Section 1</h3>
        <p className="text-sm text-muted-foreground">This is the first section.</p>
      </div>
      <Separator />
      <div>
        <h3 className="text-lg font-semibold">Section 2</h3>
        <p className="text-sm text-muted-foreground">This is the second section.</p>
      </div>
    </div>
  ),
}

export const Vertical: Story = {
  render: () => (
    <div className="flex h-20 items-center space-x-4">
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
  ),
}

export const InNavigation: Story = {
  render: () => (
    <div className="w-64">
      <nav className="space-y-2">
        <a href="#" className="block px-3 py-2 rounded-md hover:bg-muted">Home</a>
        <a href="#" className="block px-3 py-2 rounded-md hover:bg-muted">About</a>
        <Separator className="my-2" />
        <a href="#" className="block px-3 py-2 rounded-md hover:bg-muted">Contact</a>
        <a href="#" className="block px-3 py-2 rounded-md hover:bg-muted">Support</a>
      </nav>
    </div>
  ),
}