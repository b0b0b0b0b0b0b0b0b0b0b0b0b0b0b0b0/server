import PingClient from '@/app/components/ping/PingClient';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { buildServerSharePreview } from '@/lib/tools/ping/sharePreview';

const baseMetadata = buildPageMetadata({
  title: 'Minecraft Server Ping — Online Status, Players & Skins',
  description:
    'Check any Minecraft server online: players, version, MOTD with colors, Java and Bedrock. Look up player skins in 3D. Free, no registration.',
  path: '/tools/ping',
  keywords: [
    'minecraft server ping',
    'minecraft server status',
    'проверить сервер майнкрафт',
    'пинг сервера minecraft',
    'minecraft skin viewer',
    'bedrock server status',
  ],
});

export async function generateMetadata({ searchParams }) {
  const params = await searchParams;
  const raw = Array.isArray(params?.s) ? params.s[0] : params?.s;
  const address = typeof raw === 'string' ? raw.trim().slice(0, 255) : '';
  if (!address) return baseMetadata;
  const preview = await buildServerSharePreview(address);
  if (!preview) return baseMetadata;
  const url = `${baseMetadata.alternates.canonical}?s=${encodeURIComponent(preview.host)}`;
  const image = { url: preview.image, width: 1200, height: 630, alt: preview.title, type: 'image/png' };
  return {
    ...baseMetadata,
    title: preview.title,
    description: preview.description,
    openGraph: {
      ...baseMetadata.openGraph,
      url,
      title: preview.title,
      description: preview.description,
      locale: 'ru_RU',
      images: [image],
    },
    twitter: {
      card: 'summary_large_image',
      title: preview.title,
      description: preview.description,
      images: [preview.image],
    },
  };
}

export default function PingPage() {
  return <PingClient />;
}
