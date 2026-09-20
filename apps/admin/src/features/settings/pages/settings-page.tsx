import {
  Button,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  ConfirmDialog,
  ErrorState,
  Radio,
  RadioGroup,
  Skeleton,
  toast,
} from '@shalgam/ui'
import { useQueryClient } from '@tanstack/react-query'
import { RotateCcw } from 'lucide-react'
import { useState } from 'react'

import { useUiStore } from '../../../app/store/ui-store'
import { PageHeader } from '../../../components/page-header'
import { resetDemoData } from '../../../lib/demo'
import { useStoreSettings } from '../api/queries'
import { SettingsForm } from '../components/settings-form'

function AppearanceCard() {
  const theme = useUiStore((state) => state.theme)
  const setTheme = useUiStore((state) => state.setTheme)
  const collapsed = useUiStore((state) => state.sidebarCollapsed)
  const setCollapsed = useUiStore((state) => state.setSidebarCollapsed)
  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>Stored on this device only.</CardDescription>
      </CardHeader>
      <div className="mt-4 space-y-4">
        <RadioGroup
          aria-label="Theme"
          orientation="horizontal"
          value={theme}
          onValueChange={(value) => setTheme(value === 'dark' ? 'dark' : 'light')}
        >
          <Radio value="light" label="Light" />
          <Radio value="dark" label="Dark" />
        </RadioGroup>
        <RadioGroup
          aria-label="Sidebar"
          orientation="horizontal"
          value={collapsed ? 'rail' : 'full'}
          onValueChange={(value) => setCollapsed(value === 'rail')}
        >
          <Radio value="full" label="Full sidebar" />
          <Radio value="rail" label="Icon rail" />
        </RadioGroup>
      </div>
    </Card>
  )
}

function DemoDataCard() {
  const queryClient = useQueryClient()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [resetting, setResetting] = useState(false)
  return (
    <Card>
      <CardHeader>
        <CardTitle>Demo data</CardTitle>
        <CardDescription>
          This build runs against an in-browser mock API. Resetting re-seeds orders, stock and
          customers.
        </CardDescription>
      </CardHeader>
      <div className="mt-4">
        <Button
          variant="danger-outline"
          leadingIcon={<RotateCcw />}
          onClick={() => setConfirmOpen(true)}
        >
          Reset demo data
        </Button>
      </div>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        tone="danger"
        title="Reset all demo data?"
        description="Every change you made in this session is discarded and the database is re-seeded."
        confirmLabel="Reset data"
        loading={resetting}
        onConfirm={async () => {
          setResetting(true)
          try {
            resetDemoData()
            await queryClient.resetQueries()
            toast.success('Demo data reset', 'Fresh orders, stock and customers are loaded.')
            setConfirmOpen(false)
          } finally {
            setResetting(false)
          }
        }}
      />
    </Card>
  )
}

export function SettingsPage() {
  const { data: settings, isPending, isError, refetch, dataUpdatedAt } = useStoreSettings()
  return (
    <>
      <PageHeader
        title="Settings"
        description="Store details, fees, notifications and the pincodes Shalgam serves."
      />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <div>
          {isError ? (
            <ErrorState onRetry={() => void refetch()} />
          ) : isPending ? (
            <div className="space-y-4" aria-busy>
              <Skeleton className="h-40 rounded-xl" />
              <Skeleton className="h-56 rounded-xl" />
            </div>
          ) : (
            <SettingsForm key={dataUpdatedAt} settings={settings} />
          )}
        </div>
        <div className="space-y-4">
          <AppearanceCard />
          <DemoDataCard />
        </div>
      </div>
    </>
  )
}

export const route = {
  Component: SettingsPage,
  handle: { title: 'Settings' },
}
