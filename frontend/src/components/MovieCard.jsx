import { PlayCircle } from 'lucide-react';

const MovieCard = ({ title, image, tag, type, isComingSoon }) => {
  // Màu nhãn tuổi: T18 Đỏ, T16 Cam, T13 Vàng/Xanh
  const getTagColor = (tag) => {
    if (tag === 'T18') return 'bg-red-600';
    if (tag === 'T16') return 'bg-orange-500';
    return 'bg-yellow-500';
  };

  return (
    <div className="group relative flex flex-col h-full">
      {/* POSTER IMAGE */}
      <div className="relative overflow-hidden rounded-lg shadow-lg cursor-pointer aspect-[2/3]">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        
        {/* Nhãn 2D/3D & Tuổi (Overlay góc trái) */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
           <span className="bg-white text-black text-[10px] font-bold px-1.5 py-0.5 rounded border border-gray-300 shadow-sm">
              {type || '2D'}
          </span>
          <span className={`${getTagColor(tag)} text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm`}>
              {tag}
          </span>
        </div>

        {/* Overlay Đen khi Hover (Chỉ hiện nút cho phim đang chiếu) */}
        {!isComingSoon && (
             <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-3">
                <button className="bg-cine-yellow text-black font-bold px-6 py-2 rounded uppercase text-sm hover:scale-105 transition">
                    MUA VÉ
                </button>
                <button className="flex items-center gap-2 text-white font-bold uppercase text-sm hover:text-cine-yellow transition">
                    <PlayCircle size={20}/> Xem Trailer
                </button>
            </div>
        )}
      </div>

      {/* TÊN PHIM & BUTTON (Cho phần Phim Sắp Chiếu - giống ảnh 9A8B...) */}
      <div className="mt-3 text-center">
        <h3 className="text-white font-bold text-sm md:text-base truncate uppercase mb-2 group-hover:text-cine-yellow transition">{title}</h3>
        
        {isComingSoon ? (
            <div className="flex justify-between items-center gap-2 mt-2">
                <button className="flex items-center gap-1 text-gray-300 text-xs hover:text-white underline">
                    <PlayCircle size={14}/> Xem Trailer
                </button>
                <button className="bg-cine-yellow text-black font-bold px-4 py-1.5 rounded text-xs uppercase hover:bg-yellow-400 w-full">
                    ĐẶT VÉ
                </button>
            </div>
        ) : null}
      </div>
    </div>
  );
};

export default MovieCard;