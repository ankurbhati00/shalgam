import type { Category } from '@shalgam/types'
import {
  Badge,
  Button,
  Card,
  ConfirmDialog,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  EmptyState,
  ErrorState,
  IconButton,
  Skeleton,
  Switch,
  Text,
} from '@shalgam/ui'
import { countLabel } from '@shalgam/utils'
import { Ellipsis, Pencil, Plus, Tags, Trash } from 'lucide-react'
import { useState } from 'react'

import { PageHeader } from '../../../components/page-header'
import {
  buildCategoryTree,
  type CategoryTree,
  useAllCategories,
  useDeleteCategory,
  useUpdateCategory,
} from '../api/queries'
import { CategoryDialog, TintSwatch } from '../components/category-dialog'

type DialogState =
  | { mode: 'closed' }
  | { mode: 'create'; parentId: string | null }
  | { mode: 'edit'; category: Category }

function CategoryMenu({
  category,
  onEdit,
  onAddChild,
  onDelete,
}: {
  category: Category
  onEdit: () => void
  onAddChild?: () => void
  onDelete: () => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <IconButton
            aria-label={`Actions for ${category.name}`}
            icon={<Ellipsis />}
            size="sm"
            variant="ghost"
          />
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuItem icon={<Pencil />} onClick={onEdit}>
          Edit
        </DropdownMenuItem>
        {onAddChild && (
          <DropdownMenuItem icon={<Plus />} onClick={onAddChild}>
            Add subcategory
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem icon={<Trash />} tone="danger" onClick={onDelete}>
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function CategoryGroup({
  tree,
  onEdit,
  onAddChild,
  onDelete,
}: {
  tree: CategoryTree
  onEdit: (category: Category) => void
  onAddChild: (parentId: string) => void
  onDelete: (category: Category) => void
}) {
  const update = useUpdateCategory()
  const toggle = (category: Category, isActive: boolean) =>
    update.mutate({ id: category.id, input: { isActive } })
  const { parent, children } = tree
  return (
    <Card padding="none" className="overflow-hidden">
      <div className="flex flex-wrap items-center gap-3 px-4 py-3 sm:px-5">
        <TintSwatch tint={parent.tint} className="size-6" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-semibold text-text">{parent.name}</h2>
            <Badge size="sm">{countLabel(parent.productCount, 'product')}</Badge>
            {!parent.isActive && (
              <Badge size="sm" tone="warning">
                Hidden
              </Badge>
            )}
          </div>
          {parent.description && (
            <Text size="xs" tone="muted" lines={1}>
              {parent.description}
            </Text>
          )}
        </div>
        <Switch
          aria-label={`${parent.name} visible to shoppers`}
          size="sm"
          checked={parent.isActive}
          onCheckedChange={(checked) => toggle(parent, checked)}
        />
        <CategoryMenu
          category={parent}
          onEdit={() => onEdit(parent)}
          onAddChild={() => onAddChild(parent.id)}
          onDelete={() => onDelete(parent)}
        />
      </div>
      {children.length > 0 ? (
        <ul className="divide-y divide-border-subtle border-t border-border-subtle bg-surface-subtle/60">
          {children.map((child) => (
            <li key={child.id} className="flex items-center gap-3 py-2 pr-4 pl-4 sm:pr-5 sm:pl-14">
              <span className="min-w-0 flex-1 truncate text-sm text-text">{child.name}</span>
              <span className="text-xs text-text-muted tabular">
                {countLabel(child.productCount, 'product')}
              </span>
              {!child.isActive && (
                <Badge size="sm" tone="warning">
                  Hidden
                </Badge>
              )}
              <Switch
                aria-label={`${child.name} visible to shoppers`}
                size="sm"
                checked={child.isActive}
                onCheckedChange={(checked) => toggle(child, checked)}
              />
              <CategoryMenu
                category={child}
                onEdit={() => onEdit(child)}
                onDelete={() => onDelete(child)}
              />
            </li>
          ))}
        </ul>
      ) : (
        <div className="border-t border-border-subtle px-4 py-2 sm:pl-14">
          <Button
            variant="link"
            size="sm"
            leadingIcon={<Plus />}
            onClick={() => onAddChild(parent.id)}
          >
            Add a subcategory
          </Button>
        </div>
      )}
    </Card>
  )
}

export function CategoriesPage() {
  const { data, isPending, isError, refetch } = useAllCategories()
  const remove = useDeleteCategory()
  const [dialog, setDialog] = useState<DialogState>({ mode: 'closed' })
  const [pendingDelete, setPendingDelete] = useState<Category | null>(null)
  const tree = data ? buildCategoryTree(data) : []
  const parents = tree.map((group) => group.parent)

  return (
    <>
      <PageHeader
        title="Categories"
        description="Top-level categories and their subcategories, as shoppers browse them."
        actions={
          <Button
            leadingIcon={<Plus />}
            onClick={() => setDialog({ mode: 'create', parentId: null })}
          >
            New category
          </Button>
        }
      />
      {isError ? (
        <ErrorState onRetry={() => void refetch()} />
      ) : isPending ? (
        <div className="space-y-3" aria-busy>
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : tree.length === 0 ? (
        <EmptyState
          icon={<Tags />}
          title="No categories yet"
          description="Create a top-level category to start organising the catalog."
        />
      ) : (
        <div className="space-y-3">
          {tree.map((group) => (
            <CategoryGroup
              key={group.parent.id}
              tree={group}
              onEdit={(category) => setDialog({ mode: 'edit', category })}
              onAddChild={(parentId) => setDialog({ mode: 'create', parentId })}
              onDelete={setPendingDelete}
            />
          ))}
        </div>
      )}
      <CategoryDialog
        open={dialog.mode !== 'closed'}
        onOpenChange={(open) => {
          if (!open) setDialog({ mode: 'closed' })
        }}
        category={dialog.mode === 'edit' ? dialog.category : undefined}
        parentId={dialog.mode === 'create' ? dialog.parentId : undefined}
        parents={parents}
      />
      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null)
        }}
        tone="danger"
        title={`Delete ${pendingDelete?.name ?? 'category'}?`}
        description={
          pendingDelete && pendingDelete.productCount > 0
            ? `This category still has ${countLabel(pendingDelete.productCount, 'product')}. The API will refuse until they are moved.`
            : 'Subcategories are deleted with it. This cannot be undone.'
        }
        confirmLabel="Delete category"
        loading={remove.isPending}
        onConfirm={async () => {
          if (!pendingDelete) return
          try {
            await remove.mutateAsync(pendingDelete.id)
            setPendingDelete(null)
          } catch {
            // The hook toasts the server message (e.g. "This category still has products.").
          }
        }}
      />
    </>
  )
}

export const route = {
  Component: CategoriesPage,
  handle: { title: 'Categories' },
}
