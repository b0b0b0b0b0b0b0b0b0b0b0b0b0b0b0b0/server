import FlagsClient from '@/app/components/flags/FlagsClient';
import { buildPageMetadata } from '@/lib/seo/metadata';

export const metadata = buildPageMetadata({
  title: 'Minecraft Flags Generator — Aikar JVM Flags & Startup Scripts',
  description:
    'Free Minecraft flags generator for Paper, Purpur, Velocity, and Waterfall. Build Linux, Windows, and macOS startup scripts with Aikar flags, RAM overhead calculation, auto-restart, and copy-ready JVM commands.',
  path: '/tools/flags',
  keywords: [
    'aikar flags generator',
    'paper startup script',
    'minecraft jvm arguments',
    'g1gc minecraft',
    'minecraft server ram calculator',
    'velocity flags',
    'waterfall proxy flags',
    'minecraft bash start script',
  ],
});

export default function FlagsPage() {
  return <FlagsClient />;
}
