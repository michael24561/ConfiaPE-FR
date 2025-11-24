import { Suspense } from 'react';
import TrabajosClientPage from '@/components/clientecomponents/TrabajosClientPage';
import { Loader2 } from 'lucide-react'; // For fallback

export default function TrabajosPage() {
  return (
    <Suspense fallback={
        <div className="flex h-screen w-full items-center justify-center bg-slate-50">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        </div>
    }>
      <TrabajosClientPage />
    </Suspense>
  );
}