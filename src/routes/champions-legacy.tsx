import { createFileRoute } from '@tanstack/react-router'
import ChampionsLegacy from '@/pages/ChampionsLegacy'

export const Route = createFileRoute('/champions-legacy')({
  component: ChampionsLegacy,
})
