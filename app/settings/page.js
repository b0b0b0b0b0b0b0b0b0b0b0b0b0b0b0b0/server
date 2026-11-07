import { getServerT } from '@/lib/i18n/server'
import SettingsPage from '@/components/settings/SettingsPage'

export const dynamic = 'force-dynamic'
export async function generateMetadata() {
  const { t } = await getServerT()
  return { title: t('settings.pageTitle'), robots: { index: false, follow: false } }
}

export default function Page() {
  return (
    <SettingsPage />
  )
}
