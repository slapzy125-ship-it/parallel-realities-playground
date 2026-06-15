import { createFileRoute } from '@tanstack/react-router'
import WhatIf from '@/pages/WhatIf'

export const Route = createFileRoute('/whatif')({
  component: WhatIf,
})
