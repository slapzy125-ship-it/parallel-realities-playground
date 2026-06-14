import { createFileRoute } from '@tanstack/react-router'
import ChampionsLegacyHub from '@/pages/ChampionsLegacyHub'

export const Route = createFileRoute('/champions-legacy_/hub')({
  component: ChampionsLegacyHub,
})
