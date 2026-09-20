import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Input } from '../input'
import { FormDescription, FormField, FormLabel, FormMessage } from './form-field'

describe('FormField', () => {
  it('associates label, description and error with the control', () => {
    render(
      <FormField name="pincode" invalid>
        <FormLabel required>Pincode</FormLabel>
        <Input defaultValue="5600" />
        <FormDescription>Six digits.</FormDescription>
        <FormMessage>Enter a 6-digit pincode.</FormMessage>
      </FormField>,
    )
    const input = screen.getByRole('textbox', { name: /pincode/i })
    expect(input).toHaveAttribute('aria-invalid', 'true')
    const describedBy = input.getAttribute('aria-describedby') ?? ''
    const description = screen.getByText('Six digits.')
    const message = screen.getByRole('alert')
    expect(describedBy.split(' ')).toContain(description.id)
    expect(describedBy.split(' ')).toContain(message.id)
    expect(message).toHaveTextContent('Enter a 6-digit pincode.')
  })

  it('renders no message element when there is no error', () => {
    render(
      <FormField name="name">
        <FormLabel>Name</FormLabel>
        <Input />
        <FormMessage>{undefined}</FormMessage>
      </FormField>,
    )
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /name/i })).not.toHaveAttribute('aria-invalid')
  })
})
