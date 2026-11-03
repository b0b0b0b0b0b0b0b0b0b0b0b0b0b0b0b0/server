import AuthPanel from '@/components/mpa/AuthPanel'

export const metadata = { title: 'Вход', robots: { index: false, follow: false } }

export default function Page() {
  return (
    <div className="mpa-auto">
      <AuthPanel />
    </div>
  )
}
