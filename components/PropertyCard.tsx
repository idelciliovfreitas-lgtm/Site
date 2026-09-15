
import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Bed, Bath, Expand, Eye, Sparkles, TrendingUp, HandCoins, Key } from 'lucide-react';
import { Property } from '../types';

interface PropertyCardProps {
  property: Property;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const isTrending = property.views > 50;

  return (
    <div className="bg-white rounded-[32px] shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 border border-slate-100 overflow-hidden group flex flex-col h-full">
      {/* Image Container */}
      <div className="relative h-64 overflow-hidden">
        <img 
          src={property.images[0]} 
          alt={property.title} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        
        {/* Badges Premium */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <span className={`backdrop-blur-md text-white text-[9px] px-3 py-1.5 rounded-full font-black uppercase tracking-[0.2em] shadow-xl flex items-center gap-1.5 border border-white/10 ${
            property.transactionType === 'venda' ? 'bg-primary-600/90' : 'bg-gold-500/90'
          }`}>
            {property.transactionType === 'venda' ? <HandCoins size={10} /> : <Key size={10} />}
            {property.transactionType}
          </span>
          {property.isFeatured && (
            <span className="bg-gold-500 backdrop-blur-md text-white text-[9px] px-3 py-1.5 rounded-full font-black uppercase tracking-[0.2em] shadow-xl flex items-center gap-1.5 border border-white/10">
              <Sparkles size={10} /> Destaque
            </span>
          )}
        </div>

        {/* Overlay no Hover */}
        <div className="absolute inset-0 bg-primary-600/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
           <Link 
            to={`/property/${property.id}`}
            className="bg-white text-primary-600 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gold-500 hover:text-white transition-all scale-90 group-hover:scale-100 shadow-xl"
          >
            Explorar Ativo
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col">
        <div className="mb-4">
           <h3 className="text-lg font-black text-slate-900 line-clamp-1 group-hover:text-gold-600 transition-colors tracking-tight">
             {property.title}
           </h3>
           <div className="flex items-center text-slate-400 text-xs mt-1.5 font-bold uppercase tracking-tight">
             <MapPin size={12} className="mr-1 text-gold-500" />
             <span className="truncate">{property.location}</span>
           </div>
        </div>

        <div className="flex items-center gap-4 py-4 border-y border-slate-50 mb-5">
           {property.type !== 'Terreno' && property.type !== 'Comercial' && (
             <>
               <div className="flex flex-col items-center gap-1">
                 <span className="text-[10px] text-slate-300 font-black uppercase tracking-tighter">Quartos</span>
                 <div className="flex items-center gap-1.5 text-slate-700 font-black">
                    <Bed size={14} className="text-slate-400" />
                    <span>{property.bedrooms || 0}</span>
                 </div>
               </div>
               <div className="h-6 w-[1px] bg-slate-100"></div>
             </>
           )}
           <div className="flex flex-col items-center gap-1">
             <span className="text-[10px] text-slate-300 font-black uppercase tracking-tighter">Área</span>
             <div className="flex items-center gap-1.5 text-slate-700 font-black">
                <Expand size={14} className="text-slate-400" />
                <span>{property.area}m²</span>
             </div>
           </div>
           
           <div className="ml-auto px-2 py-1 bg-slate-50 text-slate-400 rounded-lg flex items-center gap-1 text-[9px] font-black uppercase">
              <Eye size={10} />
              <span>{property.views}</span>
           </div>
        </div>

        {/* Price & Action */}
        <div className="flex items-center justify-between mt-auto">
          <div>
             <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-1">
               {property.transactionType === 'venda' ? 'Investimento' : 'Aluguel Mensal'}
             </span>
             <span className="text-2xl font-black text-primary-600 tracking-tighter">
               {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(property.price)}
               {property.transactionType === 'aluguel' && <span className="text-sm">/mês</span>}
             </span>
          </div>
          <Link 
            to={`/property/${property.id}`} 
            className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-primary-600 hover:text-white transition-all shadow-sm"
          >
            <Expand size={20} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
