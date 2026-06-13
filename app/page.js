import HomeClient from '@/app/components/HomeClient';
import { buildPageMetadata } from '@/lib/seo/metadata';

export const metadata = buildPageMetadata({
  title: 'MTools — Free Minecraft Server Tools & JVM Flags Generator',
  description:
    'MTools (MST) on modrinth.black — free Minecraft server utilities. Generate Aikar JVM flags, Paper and Purpur startup scripts, Velocity proxy configs, and RAM overhead calculations.',
  path: '/',
});

export default function HomePage() {
  return <HomeClient />;
}
