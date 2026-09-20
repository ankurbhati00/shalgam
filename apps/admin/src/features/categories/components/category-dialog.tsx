import { isApiError } from '@shalgam/api-client'
import type { Category, Tint } from '@shalgam/types'
import {
  Button,
  cn,
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  FormDescription,
  FormField,
  FormLabel,
  FormMessage,
  Input,
  Select,
  Switch,
  Textarea,
} from '@shalgam/ui'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'

import { useCreateCategory, useUpdateCategory } from '../api/queries'
import {
  categoryDefaults,
  type CategoryFormValues,
  categorySchema,
  categoryToFormValues,
  formValuesToCategoryInput,
  TINT_OPTIONS,
} from '../schemas/category-schema'

const TINT_CLASS: Record<Tint, string> = {
  lime: 'bg-tint-lime',
  mint: 'bg-tint-mint',
  sky: 'bg-tint-sky',
  lavender: 'bg-tint-lavender',
  peach: 'bg-tint-peach',
  butter: 'bg-tint-butter',
  rose: 'bg-tint-rose',
}

export function TintSwatch({ tint, className }: { tint: Tint; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        'inline-block size-4 shrink-0 rounded-full border border-black/10',
        TINT_CLASS[tint],
        className,
      )}
    />
  )
}

export interface CategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Edit this category; omit to create one. */
  category?: Category
  /** Preselected parent when adding a subcategory. */
  parentId?: string | null
  parents: Category[]
}

function CategoryFormBody({
  category,
  parentId,
  parents,
  onDone,
}: {
  category?: Category
  parentId?: string | null
  parents: Category[]
  onDone: () => void
}) {
  const create = useCreateCategory()
  const update = useUpdateCategory()
  const isSubmitting = create.isPending || update.isPending
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: category
      ? categoryToFormValues(category)
      : { ...categoryDefaults, parentId: parentId ?? '' },
    mode: 'onTouched',
  })
  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors },
  } = form

  const parentOptions = [
    { value: '__root', label: 'None — top-level category' },
    ...parents
      .filter((parent) => parent.id !== category?.id)
      .map((parent) => ({ value: parent.id, label: parent.name })),
  ]

  const onSubmit = handleSubmit(async (values) => {
    const input = formValuesToCategoryInput(values, category?.imageUrl ?? '')
    try {
      if (category) await update.mutateAsync({ id: category.id, input })
      else await create.mutateAsync(input)
      onDone()
    } catch (error) {
      if (isApiError(error) && error.details) {
        for (const [field, messages] of Object.entries(error.details)) {
          setError(field as keyof CategoryFormValues, { type: 'server', message: messages[0] })
        }
      }
    }
  })

  return (
    <form onSubmit={onSubmit} noValidate className="contents">
      <DialogBody className="space-y-4">
        <FormField name="name" invalid={!!errors.name}>
          <FormLabel required>Name</FormLabel>
          <Input placeholder="Fruits & Vegetables" {...register('name')} />
          <FormMessage>{errors.name?.message}</FormMessage>
        </FormField>
        <FormField name="description" invalid={!!errors.description}>
          <FormLabel optional>Description</FormLabel>
          <Textarea rows={2} {...register('description')} />
          <FormMessage>{errors.description?.message}</FormMessage>
        </FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField name="parentId" invalid={!!errors.parentId}>
            <FormLabel>Parent</FormLabel>
            <Controller
              control={control}
              name="parentId"
              render={({ field }) => (
                <Select
                  aria-label="Parent category"
                  options={parentOptions}
                  value={field.value || '__root'}
                  onValueChange={(value) =>
                    field.onChange(value && value !== '__root' ? value : '')
                  }
                />
              )}
            />
            <FormDescription>Subcategories appear as tabs under their parent.</FormDescription>
          </FormField>
          <FormField name="tint" invalid={!!errors.tint}>
            <FormLabel>Tint</FormLabel>
            <Controller
              control={control}
              name="tint"
              render={({ field }) => (
                <Select
                  aria-label="Tint"
                  options={TINT_OPTIONS.map((option) => ({
                    ...option,
                    icon: <TintSwatch tint={option.value} />,
                  }))}
                  value={field.value}
                  onValueChange={(value) => value && field.onChange(value)}
                />
              )}
            />
            <FormDescription>Background colour of the category tile.</FormDescription>
          </FormField>
        </div>
        <Controller
          control={control}
          name="isActive"
          render={({ field }) => (
            <Switch
              label="Visible to shoppers"
              description="Inactive categories are hidden from the storefront."
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
      </DialogBody>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting} loadingText="Saving…">
          {category ? 'Save changes' : 'Create category'}
        </Button>
      </DialogFooter>
    </form>
  )
}

export function CategoryDialog({
  open,
  onOpenChange,
  category,
  parentId,
  parents,
}: CategoryDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>
            {category ? `Edit ${category.name}` : parentId ? 'New subcategory' : 'New category'}
          </DialogTitle>
          <DialogDescription>
            {category
              ? 'Changes apply to the storefront immediately.'
              : 'Categories organise the catalog and the storefront navigation.'}
          </DialogDescription>
        </DialogHeader>
        {open && (
          <CategoryFormBody
            category={category}
            parentId={parentId}
            parents={parents}
            onDone={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
