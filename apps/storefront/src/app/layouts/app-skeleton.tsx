import { Container, Skeleton } from '@shalgam/ui'

/** Shown while the first route module loads, so the shell appears before any data. */
export function AppSkeleton() {
  return (
    <div className="min-h-dvh bg-background" aria-busy aria-label="Loading Shalgam">
      <div className="h-14 bg-primary sm:h-16" />
      <Container className="space-y-6 py-6">
        <Skeleton className="h-44 rounded-2xl" />
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="aspect-[4/5] rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="aspect-[3/4] rounded-xl" />
          ))}
        </div>
      </Container>
    </div>
  )
}
