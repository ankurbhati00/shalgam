import { Button, Container, EmptyState } from '@shalgam/ui'
import { House, SearchX } from 'lucide-react'
import { Link } from 'react-router'

export function NotFoundPage() {
  return (
    <Container className="py-16">
      <EmptyState
        size="lg"
        icon={<SearchX />}
        title="Page not found"
        description="The page you're looking for doesn't exist. Check the address or head back to the dashboard."
        action={
          <Button render={<Link to="/" />} leadingIcon={<House />}>
            Back to dashboard
          </Button>
        }
      />
    </Container>
  )
}
