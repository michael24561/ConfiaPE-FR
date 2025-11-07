'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CalificacionesPage() {
  const [trabajoId, setTrabajoId] = useState('');
  const [puntuacion, setPuntuacion] = useState(0);
  const [comentario, setComentario] = useState('');
  const [fotos, setFotos] = useState<string[]>([]);
  const [esPublico, setEsPublico] = useState(true);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/calificaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trabajoId,
          puntuacion,
          comentario,
          fotos,
          esPublico
        })
      });

      if (response.ok) {
        alert('Calificación enviada!');
        router.push('/cliente/historial');
      } else {
        throw new Error('Error al enviar calificación');
      }
    } catch (error) {
      console.error(error);
      alert('Error al enviar calificación');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const readers = files.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (event) => resolve(event.target?.result as string);
          reader.readAsDataURL(file);
        });
      });

      Promise.all(readers).then(results => {
        setFotos(prev => [...prev, ...results]);
      });
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Calificar Servicio</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">ID del Trabajo</label>
          <input
            type="text"
            value={trabajoId}
            onChange={(e) => setTrabajoId(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block mb-1">Puntuación (1-5 estrellas)</label>
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                type="button"
                onClick={() => setPuntuacion(star)}
                className={`text-2xl ${puntuacion >= star ? 'text-yellow-400' : 'text-gray-300'}`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block mb-1">Comentario</label>
          <textarea
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            className="w-full p-2 border rounded"
            rows={3}
          />
        </div>

        <div>
          <label className="block mb-1">Fotos del trabajo (opcional)</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="w-full p-2 border rounded"
          />
          <div className="mt-2 grid grid-cols-3 gap-2">
            {fotos.map((foto, index) => (
              <img 
                key={index} 
                src={foto} 
                alt={`Foto ${index}`}
                className="w-full h-24 object-cover rounded"
              />
            ))}
          </div>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="esPublico"
            checked={esPublico}
            onChange={(e) => setEsPublico(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="esPublico">Hacer pública esta reseña</label>
        </div>

        <button
          type="submit"
          disabled={loading || puntuacion === 0}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Enviando...' : 'Enviar Calificación'}
        </button>
      </form>
    </div>
  );
}
