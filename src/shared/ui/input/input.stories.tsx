import type { Meta, StoryObj } from '@storybook/nextjs'
import { Input } from './input'

const meta = {
  title: 'shared/ui/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: { type: 'select' },
      options: ['text', 'email', 'password', 'number', 'tel', 'url'],
    },
  },
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    placeholder: 'Enter text here...',
  },
}

export const WithValue: Story = {
  args: {
    value: 'Sample text',
    placeholder: 'Enter text here...',
  },
}

export const Email: Story = {
  args: {
    type: 'email',
    placeholder: 'Enter your email...',
  },
}

export const Password: Story = {
  args: {
    type: 'password',
    placeholder: 'Enter your password...',
  },
}

export const Disabled: Story = {
  args: {
    placeholder: 'Disabled input',
    disabled: true,
  },
}

export const WithError: Story = {
  args: {
    placeholder: 'Enter text here...',
    className: 'border-destructive',
  },
}

export const File: Story = {
  args: {
    type: 'file',
  },
}
