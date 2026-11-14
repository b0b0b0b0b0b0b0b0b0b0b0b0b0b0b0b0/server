import PingClient from '@/app/components/ping/PingClient';
import { buildPingMetadata } from '@/lib/tools/ping/pageMetadata';

export async function generateMetadata({ params }) {
  const { address } = await params;
  let decoded = address;
  try {
    decoded = decodeURIComponent(address);
  } catch {}
  return buildPingMetadata(decoded);
}

export default function PingAddressPage() {
  return <PingClient />;
}
