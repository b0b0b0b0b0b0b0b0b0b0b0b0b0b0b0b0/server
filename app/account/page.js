import { getServerT } from '@/lib/i18n/server'
import AccountPanel from '@/components/mpa/AccountPanel'

export const dynamic = 'force-dynamic'
export async function generateMetadata() {
  const { t } = await getServerT()
  return { title: t('meta.account'), robots: { index: false, follow: false } }
}

export default function Page() {
  return (
    <div className="mpa-auto">
      <AccountPanel />
    </div>
  )
}
