import PingClient from '@/app/components/ping/PingClient';
import { buildPingMetadata } from '@/lib/tools/ping/pageMetadata';

export async function generateMetadata({ searchParams }) {
  const params = await searchParams;
  const raw = Array.isArray(params?.s) ? params.s[0] : params?.s;
  return buildPingMetadata(raw);
}

export default function PingPage() {
  return <PingClient />;
}
