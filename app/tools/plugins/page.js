import PluginsClient from '@/app/components/plugins/PluginsClient';
import { buildPageMetadata } from '@/lib/seo/metadata';

export const metadata = buildPageMetadata({
  title: 'Minecraft Plugin Updates — Track Modrinth & Spigot Versions',
  description:
    'Free Minecraft plugin update tracker for server admins. Monitor Modrinth and SpigotMC plugins, compare installed versions, filter outdated jars, and export your server plugin list.',
  path: '/tools/plugins',
  keywords: [
    'minecraft plugin updates',
    'modrinth plugin tracker',
    'spigot plugin updater',
    'paper plugin versions',
    'minecraft server plugins',
    'plugin version checker',
  ],
});

export default function PluginsPage() {
  return <PluginsClient />;
}
