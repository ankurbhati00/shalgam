import { getErrorMessage } from '@shalgam/api-client'
import { Button, Container, EmptyState, ErrorState } from '@shalgam/ui'
import { House, RefreshCw } from 'lucide-react'
import { isRouteErrorResponse, Link, useNavigate, useRouteError } from 'react-router'

/** Catches render and loader errors for a route subtree without unmounting the shell. */
export function RouteErrorBoundary() {
  const error = useRouteError()
  const navigate = useNavigate()

  if (isRouteErrorResponse(error) && error.status === 404) {
    return (
      <Container className="py-16">
        <EmptyState
          title="We couldn't find that page"
          description="It may have moved, or the link might be wrong."
          action={
            <Button render={<Link to="/" />} leadingIcon={<House />}>
              Back to home
            </Button>
          }
        />
      </Container>
    )
  }

  return (
    <Container className="py-16">
      <ErrorState
        title="Something went wrong"
        description={getErrorMessage(error)}
        onRetry={() => navigate(0)}
      />
      <div className="mt-4 flex justify-center">
        <Button variant="ghost" render={<Link to="/" />} leadingIcon={<RefreshCw />}>
          Go to home
        </Button>
      </div>
    </Container>
  )
}
