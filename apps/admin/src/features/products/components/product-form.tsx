import { isApiError } from '@shalgam/api-client'
import type { Product } from '@shalgam/types'
import {
  Button,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  Checkbox,
  FormDescription,
  FormField,
  FormLabel,
  FormMessage,
  Input,
  ProductImage,
  Radio,
  RadioGroup,
  Select,
  Textarea,
} from '@shalgam/ui'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm, useWatch } from 'react-hook-form'

import { useAllCategories } from '../../categories/api/queries'
import { useCreateProduct, useUpdateProduct } from '../api/queries'
import {
  formValuesToProductInput,
  PRODUCT_TAG_LABELS,
  PRODUCT_TAG_VALUES,
  productDefaults,
  type ProductFormValues,
  productSchema,
  productToFormValues,
} from '../schemas/product-schema'

export interface ProductFormProps {
  /** When provided the form edits this product; otherwise it creates one. */
  product?: Product
  onSaved: (product: Product) => void
  onCancel?: () => void
}

/** React Hook Form + Zod product form. Server-side validation errors map back onto fields. */
export function ProductForm({ product, onSaved, onCancel }: ProductFormProps) {
  const create = useCreateProduct()
  const update = useUpdateProduct()
  const { data: categories } = useAllCategories()
  const isSubmitting = create.isPending || update.isPending

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: product ? productToFormValues(product) : productDefaults,
    mode: 'onTouched',
  })
  const { register, handleSubmit, control, setError, setValue, formState } = form
  const { errors } = formState

  const categoryId = useWatch({ control, name: 'categoryId' })
  const imageUrl = useWatch({ control, name: 'imageUrl' })
  const parentOptions = (categories ?? [])
    .filter((category) => category.parentId === null)
    .sort((a, b) => a.position - b.position)
    .map((category) => ({ value: category.id, label: category.name }))
  const subcategoryOptions = (categories ?? [])
    .filter((category) => category.parentId === categoryId)
    .sort((a, b) => a.position - b.position)
    .map((category) => ({ value: category.id, label: category.name }))

  const onSubmit = handleSubmit(async (values) => {
    const input = formValuesToProductInput(values)
    try {
      const saved = product
        ? await update.mutateAsync({ id: product.id, input })
        : await create.mutateAsync(input)
      onSaved(saved)
    } catch (error) {
      if (isApiError(error) && error.details) {
        for (const [field, messages] of Object.entries(error.details)) {
          setError(field as keyof ProductFormValues, { type: 'server', message: messages[0] })
        }
      }
    }
  })

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start"
    >
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Basics</CardTitle>
            <CardDescription>What shoppers see first on the storefront.</CardDescription>
          </CardHeader>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <FormField name="name" invalid={!!errors.name} className="sm:col-span-2">
              <FormLabel required>Product name</FormLabel>
              <Input placeholder="Amul Taaza Toned Milk" {...register('name')} />
              <FormMessage>{errors.name?.message}</FormMessage>
            </FormField>
            <FormField name="brand" invalid={!!errors.brand}>
              <FormLabel required>Brand</FormLabel>
              <Input placeholder="Amul" {...register('brand')} />
              <FormMessage>{errors.brand?.message}</FormMessage>
            </FormField>
            <FormField name="unit" invalid={!!errors.unit}>
              <FormLabel required>Pack size</FormLabel>
              <Input placeholder="500 ml" {...register('unit')} />
              <FormDescription>Shown next to the price, e.g. 500 g, 1 L, 6 pcs.</FormDescription>
              <FormMessage>{errors.unit?.message}</FormMessage>
            </FormField>
            <FormField name="categoryId" invalid={!!errors.categoryId}>
              <FormLabel required>Category</FormLabel>
              <Controller
                control={control}
                name="categoryId"
                render={({ field }) => (
                  <Select
                    aria-label="Category"
                    options={parentOptions}
                    value={field.value || null}
                    placeholder="Choose a category"
                    invalid={!!errors.categoryId}
                    onValueChange={(value) => {
                      field.onChange(value ?? '')
                      setValue('subcategoryId', '', { shouldValidate: formState.isSubmitted })
                    }}
                  />
                )}
              />
              <FormMessage>{errors.categoryId?.message}</FormMessage>
            </FormField>
            <FormField name="subcategoryId" invalid={!!errors.subcategoryId}>
              <FormLabel required>Subcategory</FormLabel>
              <Controller
                control={control}
                name="subcategoryId"
                render={({ field }) => (
                  <Select
                    aria-label="Subcategory"
                    options={subcategoryOptions}
                    value={field.value || null}
                    placeholder={categoryId ? 'Choose a subcategory' : 'Pick a category first'}
                    disabled={!categoryId}
                    invalid={!!errors.subcategoryId}
                    onValueChange={(value) => field.onChange(value ?? '')}
                  />
                )}
              />
              <FormMessage>{errors.subcategoryId?.message}</FormMessage>
            </FormField>
            <FormField name="description" invalid={!!errors.description} className="sm:col-span-2">
              <FormLabel optional>Description</FormLabel>
              <Textarea rows={3} {...register('description')} />
              <FormMessage>{errors.description?.message}</FormMessage>
            </FormField>
            <FormField name="highlights" invalid={!!errors.highlights} className="sm:col-span-2">
              <FormLabel optional>Highlights</FormLabel>
              <Textarea
                rows={3}
                placeholder={'Farm fresh\nNo preservatives'}
                {...register('highlights')}
              />
              <FormDescription>One highlight per line.</FormDescription>
              <FormMessage>{errors.highlights?.message}</FormMessage>
            </FormField>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pricing & stock</CardTitle>
            <CardDescription>Selling price must not exceed MRP.</CardDescription>
          </CardHeader>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <FormField name="price" invalid={!!errors.price}>
              <FormLabel required>Selling price</FormLabel>
              <Input
                type="number"
                inputMode="decimal"
                step="0.5"
                min={0}
                prefix="₹"
                {...register('price', { valueAsNumber: true })}
              />
              <FormMessage>{errors.price?.message}</FormMessage>
            </FormField>
            <FormField name="mrp" invalid={!!errors.mrp}>
              <FormLabel required>MRP</FormLabel>
              <Input
                type="number"
                inputMode="decimal"
                step="0.5"
                min={0}
                prefix="₹"
                {...register('mrp', { valueAsNumber: true })}
              />
              <FormMessage>{errors.mrp?.message}</FormMessage>
            </FormField>
            <FormField name="stock" invalid={!!errors.stock}>
              <FormLabel required>Stock on hand</FormLabel>
              <Input
                type="number"
                inputMode="numeric"
                step={1}
                min={0}
                {...register('stock', { valueAsNumber: true })}
              />
              <FormMessage>{errors.stock?.message}</FormMessage>
            </FormField>
            <FormField name="maxPerOrder" invalid={!!errors.maxPerOrder}>
              <FormLabel required>Max per order</FormLabel>
              <Input
                type="number"
                inputMode="numeric"
                step={1}
                min={1}
                max={50}
                {...register('maxPerOrder', { valueAsNumber: true })}
              />
              <FormMessage>{errors.maxPerOrder?.message}</FormMessage>
            </FormField>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <FormField name="shelfLife" invalid={!!errors.shelfLife}>
              <FormLabel optional>Shelf life</FormLabel>
              <Input placeholder="3 days" {...register('shelfLife')} />
              <FormMessage>{errors.shelfLife?.message}</FormMessage>
            </FormField>
            <FormField name="countryOfOrigin" invalid={!!errors.countryOfOrigin}>
              <FormLabel required>Country of origin</FormLabel>
              <Input {...register('countryOfOrigin')} />
              <FormMessage>{errors.countryOfOrigin?.message}</FormMessage>
            </FormField>
            <FormField
              name="storageInstructions"
              invalid={!!errors.storageInstructions}
              className="sm:col-span-2"
            >
              <FormLabel optional>Storage instructions</FormLabel>
              <Input
                placeholder="Keep refrigerated below 4°C"
                {...register('storageInstructions')}
              />
              <FormMessage>{errors.storageInstructions?.message}</FormMessage>
            </FormField>
            <fieldset className="sm:col-span-2">
              <legend className="mb-2 text-sm font-medium text-text">Tags</legend>
              <Controller
                control={control}
                name="tags"
                render={({ field }) => (
                  <div className="grid gap-2 sm:grid-cols-3">
                    {PRODUCT_TAG_VALUES.map((tag) => (
                      <Checkbox
                        key={tag}
                        label={PRODUCT_TAG_LABELS[tag]}
                        checked={field.value.includes(tag)}
                        onCheckedChange={(checked) =>
                          field.onChange(
                            checked
                              ? [...field.value, tag]
                              : field.value.filter((item) => item !== tag),
                          )
                        }
                      />
                    ))}
                  </div>
                )}
              />
            </fieldset>
          </div>
        </Card>
      </div>

      <div className="space-y-4 lg:sticky lg:top-20">
        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <FormField name="status" invalid={!!errors.status} className="mt-3">
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <RadioGroup
                  aria-label="Product status"
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <Radio
                    value="active"
                    label="Active"
                    description="Visible and purchasable on the storefront."
                  />
                  <Radio
                    value="draft"
                    label="Draft"
                    description="Hidden while you finish the listing."
                  />
                  <Radio
                    value="archived"
                    label="Archived"
                    description="Retired; kept for order history."
                  />
                </RadioGroup>
              )}
            />
          </FormField>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Image</CardTitle>
          </CardHeader>
          <div className="mt-3 space-y-3">
            <ProductImage
              src={imageUrl}
              alt={product?.name ?? 'Product image preview'}
              ratio="4/3"
              rounded="lg"
            />
            <FormField name="imageUrl" invalid={!!errors.imageUrl}>
              <FormLabel optional>Image URL</FormLabel>
              <Input type="url" placeholder="https://…" {...register('imageUrl')} />
              <FormMessage>{errors.imageUrl?.message}</FormMessage>
            </FormField>
          </div>
        </Card>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end lg:flex-col-reverse">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </Button>
          )}
          <Button type="submit" loading={isSubmitting} loadingText="Saving…">
            {product ? 'Save changes' : 'Create product'}
          </Button>
        </div>
      </div>
    </form>
  )
}
