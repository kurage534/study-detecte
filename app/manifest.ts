import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '学習管理アプリ',
    short_name: '学習管理',
    description: '毎日の学習を記録・管理するアプリ',
    start_url: '/',
    display: 'standalone',
    background_color: '#f9fafb',
    theme_color: '#6366f1',
    orientation: 'portrait',
    icons: [
      { src: '/icon.png', sizes: '32x32', type: 'image/png' },
      { src: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
