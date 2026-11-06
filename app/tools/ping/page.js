import PingClient from '@/app/components/ping/PingClient';
import { buildPageMetadata } from '@/lib/seo/metadata';

export const metadata = buildPageMetadata({
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

export default function PingPage() {
  return <PingClient />;
}
