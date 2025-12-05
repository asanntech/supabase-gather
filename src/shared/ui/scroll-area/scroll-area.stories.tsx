import React from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs'
import { ScrollArea } from './scroll-area'
import { Separator } from '../separator'

const meta = {
  title: 'shared/ui/ScrollArea',
  component: ScrollArea,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ScrollArea>

export default meta
type Story = StoryObj<typeof meta>

const tags = Array.from({ length: 50 }).map(
  (_, i, a) => `v1.2.0-beta.${a.length - i}`
)

export const Default: Story = {
  render: () => (
    <ScrollArea className="h-72 w-48 rounded-md border">
      <div className="p-4">
        <h4 className="mb-4 text-sm font-medium leading-none">Tags</h4>
        {tags.map(tag => (
          <React.Fragment key={tag}>
            <div className="text-sm">{tag}</div>
            <Separator className="my-2" />
          </React.Fragment>
        ))}
      </div>
    </ScrollArea>
  ),
}

export const HorizontalScrolling: Story = {
  render: () => (
    <ScrollArea className="w-96 whitespace-nowrap rounded-md border">
      <div className="flex w-max space-x-4 p-4">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="w-32 shrink-0">
            <div className="aspect-square w-full rounded-md bg-secondary" />
            <div className="mt-2 space-y-1">
              <p className="text-sm font-medium">Item {i + 1}</p>
              <p className="text-xs text-muted-foreground">Description text</p>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
}
