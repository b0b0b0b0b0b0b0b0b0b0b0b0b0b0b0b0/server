import AccountPanel from '@/components/mpa/AccountPanel'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Аккаунт', robots: { index: false, follow: false } }

export default function Page() {
  return (
    <div className="mpa-auto">
      <AccountPanel />
    </div>
  )
}
