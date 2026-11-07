import { getServerT } from '@/lib/i18n/server'
import AuthPanel from '@/components/mpa/AuthPanel'

export const dynamic = 'force-dynamic'
export async function generateMetadata() {
  const { t } = await getServerT()
  return { title: t('meta.login'), robots: { index: false, follow: false } }
}

export default function Page() {
  return (
    <div className="mpa-auto">
      <AuthPanel />
    </div>
  )
}
