import { Button, Container, EmptyState } from '@shalgam/ui'
import { House, Search } from 'lucide-react'
import { Link } from 'react-router'

export function NotFoundPage() {
  return (
    <Container className="py-16">
      <EmptyState
        size="lg"
        icon={<Search />}
        title="Page not found"
        description="The page you're looking for doesn't exist. Let's get you back to fresh groceries."
        action={
          <Button render={<Link to="/" />} leadingIcon={<House />}>
            Back to home
          </Button>
        }
      />
    </Container>
  )
}

export const route = { Component: NotFoundPage }
