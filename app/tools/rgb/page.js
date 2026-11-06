import RgbClient from '@/app/components/rgb/RgbClient';
import { buildPageMetadata } from '@/lib/seo/metadata';

export const metadata = buildPageMetadata({
  title: 'Minecraft RGB Gradient Text — Chat Colors & MiniMessage',
  description:
    'Free Minecraft RGB gradient text generator. Live preview, draggable color stops, bold/italic/underline, and copy-ready output for &#RRGGBB, §x, MiniMessage, and JSON chat formats.',
  path: '/tools/rgb',
  keywords: [
    'minecraft rgb text',
    'minecraft gradient text',
    'rgbirdflop',
    'minimessage gradient',
    'minecraft chat colors',
    'hex color minecraft',
    'paper json text component',
  ],
});

export default function RgbPage() {
  return <RgbClient />;
}
