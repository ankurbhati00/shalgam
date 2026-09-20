import type { Meta, StoryObj } from '@storybook/react-vite'

import { Avatar } from '../avatar'
import { Badge } from '../badge'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../card'
import { Button } from '../button'
import { Container } from '../container'
import { Separator } from '../separator'
import { Skeleton, SkeletonText } from '../skeleton'
import { Spinner } from '../spinner'
import { Heading } from './heading'
import { Link } from './link'
import { Text } from './text'

const meta = {
  title: 'Components/Primitives/Text & Surfaces',
  component: Text,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Text>

export default meta
type Story = StoryObj<typeof meta>

export const TextAndHeadings: Story = {
  name: 'Text, Heading & Link',
  render: () => (
    <div className="max-w-xl space-y-4">
      <Heading level={1} size="xl">
        Fresh Vegetables
      </Heading>
      <Text tone="muted">Farm-fresh produce sourced every morning from local mandis.</Text>
      <Text size="sm" lines={2}>
        Firm, bright-red hybrid tomatoes with balanced sweetness and acidity. Ideal for curries,
        chutneys, salads and everyday sabzi. This paragraph is clamped to two lines so cards keep a
        consistent height no matter how long the copy runs.
      </Text>
      <p className="text-sm">
        Read the <Link href="/orders">delivery policy</Link> or{' '}
        <Link href="/help" tone="muted">
          contact support
        </Link>
        .
      </p>
      <Text as="time" size="xs" tone="subtle" tabular>
        18 Sep 2026, 9:41 am
      </Text>
    </div>
  ),
}

export const Badges: Story = {
  render: () => (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {(
          [
            'neutral',
            'brand',
            'success',
            'warning',
            'danger',
            'info',
            'inverse',
            'primary',
          ] as const
        ).map((tone) => (
          <Badge key={tone} tone={tone}>
            {tone}
          </Badge>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {(['neutral', 'brand', 'success', 'warning', 'danger', 'info'] as const).map((tone) => (
          <Badge key={tone} tone={tone} variant="outline" dot>
            {tone}
          </Badge>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Badge size="sm" tone="brand">
          Small
        </Badge>
        <Badge size="md" tone="brand">
          Medium
        </Badge>
        <Badge size="lg" tone="brand">
          Large
        </Badge>
      </div>
    </div>
  ),
}

export const Avatars: Story = {
  render: () => (
    <div className="flex flex-wrap items-end gap-3">
      <Avatar name="Ananya Rao" size="xs" />
      <Avatar name="Rohan Iyer" size="sm" />
      <Avatar name="Priya Sharma" size="md" />
      <Avatar name="Karthik Reddy" size="lg" />
      <Avatar name="Meera Nair" size="xl" />
      <Avatar name="Kabir Mehta" size="lg" src="https://invalid.example/avatar.png" />
    </div>
  ),
}

export const Cards: Story = {
  render: () => (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader
          actions={
            <Badge tone="success" dot>
              Active
            </Badge>
          }
        >
          <CardTitle>Outline card</CardTitle>
          <CardDescription>The default surface for content groups.</CardDescription>
        </CardHeader>
        <CardContent>
          <SkeletonText lines={3} />
        </CardContent>
        <CardFooter>
          <Button size="sm" variant="outline">
            Secondary
          </Button>
          <Button size="sm">Primary</Button>
        </CardFooter>
      </Card>
      <Card variant="elevated" interactive>
        <CardTitle>Elevated & interactive</CardTitle>
        <CardDescription>Lifts slightly on hover — use for clickable tiles.</CardDescription>
      </Card>
      <Card variant="subtle">
        <CardTitle>Subtle card</CardTitle>
        <CardDescription>Muted background for secondary information.</CardDescription>
        <Separator className="my-3" label="or" />
        <Text size="sm" tone="muted">
          Separators can carry a label.
        </Text>
      </Card>
    </div>
  ),
}

export const LoadingPrimitives: Story = {
  name: 'Skeleton & Spinner',
  render: () => (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Skeleton shape="circle" className="size-10" />
          <div className="flex-1 space-y-2">
            <Skeleton shape="text" className="w-1/2" />
            <Skeleton shape="text" className="w-1/3" />
          </div>
        </div>
        <Skeleton className="aspect-video" />
        <SkeletonText />
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <Spinner size="xs" />
        <Spinner size="sm" />
        <Spinner size="md" tone="brand" />
        <Spinner size="lg" />
        <span className="inline-flex items-center rounded-md bg-surface-inverse px-3 py-2">
          <Spinner size="sm" tone="inverse" label="Saving" />
        </span>
      </div>
    </div>
  ),
}

export const ContainerStory: Story = {
  name: 'Container',
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="space-y-3 py-4">
      {(['sm', 'md', 'lg', 'xl'] as const).map((size) => (
        <Container key={size} size={size}>
          <div className="rounded-md bg-primary-muted px-3 py-2 text-xs font-medium text-primary-strong">
            Container size=&quot;{size}&quot;
          </div>
        </Container>
      ))}
    </div>
  ),
}
