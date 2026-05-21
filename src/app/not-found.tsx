import Link from 'next/link';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { Coffee } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-background">
      <GlassPanel className="max-w-md w-full text-center py-12 space-y-6">
        <div className="flex justify-center">
          <Coffee className="w-20 h-20 text-primary opacity-20" />
        </div>
        <h1 className="text-4xl font-serif">404</h1>
        <p className="text-typography/60 font-medium">
          The page you are looking for has vanished like steam from a fresh brew.
        </p>
        <div className="pt-4">
          <Link href="/">
            <button className="bg-primary text-white px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform">
              Back to Home
            </button>
          </Link>
        </div>
      </GlassPanel>
    </main>
  );
}
