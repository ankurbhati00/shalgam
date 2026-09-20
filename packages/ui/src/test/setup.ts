import '@testing-library/jest-dom/vitest'

import { cleanup, configure } from '@testing-library/react'
import { afterEach } from 'vitest'

configure({ asyncUtilTimeout: 5000 })

// Vitest runs without globals, so Testing Library cannot register its own cleanup.
afterEach(() => cleanup())
