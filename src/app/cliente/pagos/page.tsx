'use client';

export const dynamic = 'force-dynamic';

export default function PagosPage() {
  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Página de Pagos</h1>
      <p className="text-gray-600 mb-4">
        Esta página está en desarrollo. Por favor, utiliza los botones de pago en la sección de trabajos.
      </p>
      <a
        href="/cliente/trabajos"
        className="inline-block bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
      >
        Ir a Mis Trabajos
      </a>
    </div>
  );
}
