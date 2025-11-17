
import { Star } from 'lucide-react';
import Image from 'next/image';
import { Calificacion } from '@/lib/calificacionApi';

interface ReviewListWithPaginationProps {
  reviews: Calificacion[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  loading: boolean;
}

const ReviewItem = ({ review }: { review: Calificacion }) => (
  <div className="border-b border-slate-200/80 pb-6 last:border-b-0 last:pb-0">
    <div className="flex items-center gap-3 mb-2">
      <div className="relative w-10 h-10 rounded-full bg-slate-200">
        {review.user?.avatarUrl && (
          <Image
            src={review.user.avatarUrl}
            alt={review.user.nombre}
            fill
            className="object-cover rounded-full"
            unoptimized
          />
        )}
      </div>
      <div>
        <p className="font-semibold text-slate-800">{review.user.nombre}</p>
        <p className="text-xs text-slate-400">
          {new Date(review.fechaCreacion).toLocaleDateString('es-PE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>
    </div>
    <div className="flex items-center gap-1 mb-2">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-5 h-5 ${
            i < review.puntuacion ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'
          }`}
        />
      ))}
    </div>
    <p className="text-slate-600">{review.comentario}</p>
    {review.fotos && review.fotos.length > 0 && (
      <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
        {review.fotos.map((foto, index) => (
          <a key={index} href={foto} target="_blank" rel="noopener noreferrer">
            <Image
              src={foto}
              alt={`Foto ${index + 1} de la reseña`}
              width={100}
              height={100}
              className="object-cover rounded-md aspect-square"
              unoptimized
            />
          </a>
        ))}
      </div>
    )}
  </div>
);

const PaginationControls = ({ currentPage, totalPages, onPageChange }: { currentPage: number, totalPages: number, onPageChange: (page: number) => void }) => {
    if (totalPages <= 1) return null;

    const handlePrev = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    };

    return (
        <div className="flex justify-center items-center gap-4 mt-8">
            <button
                onClick={handlePrev}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Anterior
            </button>
            <span className="text-slate-600 font-medium">
                Página {currentPage} de {totalPages}
            </span>
            <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Siguiente
            </button>
        </div>
    );
};


export default function ReviewListWithPagination({
  reviews,
  currentPage,
  totalPages,
  onPageChange,
  loading,
}: ReviewListWithPaginationProps) {
  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-slate-200"></div>
              <div className="w-1/3 h-4 bg-slate-200 rounded"></div>
            </div>
            <div className="h-4 w-1/4 bg-slate-200 rounded mb-2"></div>
            <div className="h-12 w-full bg-slate-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return <p className="text-slate-500 text-center py-10">Este técnico aún no tiene reseñas.</p>;
  }

  return (
    <div>
      <div className="space-y-6">
        {reviews.map((review) => (
          <ReviewItem key={review.id} review={review} />
        ))}
      </div>
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
}
