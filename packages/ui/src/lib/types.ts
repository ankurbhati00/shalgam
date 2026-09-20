import type { ComponentPropsWithoutRef, ElementType } from 'react'

/** Props for a native element minus the ones a component controls itself. */
export type NativeProps<T extends ElementType, Omitted extends string = never> = Omit<
  ComponentPropsWithoutRef<T>,
  Omitted
>

export type Size = 'sm' | 'md' | 'lg'

export type Tone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'info'
