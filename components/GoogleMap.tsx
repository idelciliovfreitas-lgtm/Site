
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Loader2, LocateFixed, ExternalLink, Navigation, Plus, Minus } from 'lucide-react';

interface MapProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  interactive?: boolean;
  onLocationSelect?: (lat: number, lng: number) => void;
  className?: string;
  markers?: Array<{ lat: number; lng: number; title?: string; id?: number; price?: number }>;
  isExpanded?: boolean;
}

const GoogleMap: React.FC<MapProps> = ({
  center = { lat: -4.7833, lng: -39.6667 }, // Madalena, CE
  zoom = 15,
  interactive = true,
  onLocationSelect,
  className = "h-64",
  markers = [],
  isExpanded = false
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const selectionMarkerRef = useRef<L.Marker | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const openInExternalMap = () => {
    const currentCenter = mapInstanceRef.current?.getCenter() || center;
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${currentCenter.lat},${currentCenter.lng}`, '_blank');
  };

  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();

  useEffect(() => {
    if (!mapRef.current) return;

    const map = L.map(mapRef.current, {
      center: [center.lat, center.lng],
      zoom: zoom,
      zoomControl: false, 
      attributionControl: false,
      scrollWheelZoom: interactive,
      dragging: interactive,
      touchZoom: interactive,
      doubleClickZoom: interactive,
      boxZoom: interactive
    });

    // Usando estilo de Satélite/Híbrido se possível, ou HOT para contraste
    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    if (interactive) {
      map.on('click', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        if (onLocationSelect) {
          onLocationSelect(lat, lng);
          updateSelectionPin(lat, lng, map);
        }
      });
    }

    mapInstanceRef.current = map;
    markersLayerRef.current = L.layerGroup().addTo(map);
    setIsInitializing(false);

    setTimeout(() => map.invalidateSize(), 300);

    return () => {
      map.remove();
    };
  }, []);

  useEffect(() => {
    if (mapInstanceRef.current) {
      setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 500);
    }
  }, [isExpanded, className]);

  const updateSelectionPin = (lat: number, lng: number, map: L.Map) => {
    if (selectionMarkerRef.current) {
      selectionMarkerRef.current.setLatLng([lat, lng]);
    } else {
      selectionMarkerRef.current = L.marker([lat, lng], {
        icon: L.divIcon({
          className: 'selection-pin',
          html: `<div class="w-8 h-8 bg-primary-600 rounded-full border-4 border-white shadow-2xl flex items-center justify-center animate-bounce">
                  <div class="w-2 h-2 bg-white rounded-full"></div>
                </div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 32]
        })
      }).addTo(map);
    }
  };

  useEffect(() => {
    if (mapInstanceRef.current && center) {
      mapInstanceRef.current.setView([center.lat, center.lng], mapInstanceRef.current.getZoom());
      if (onLocationSelect) {
        updateSelectionPin(center.lat, center.lng, mapInstanceRef.current);
      }
    }
  }, [center.lat, center.lng]);

  useEffect(() => {
    if (!markersLayerRef.current || !mapInstanceRef.current) return;
    
    markersLayerRef.current.clearLayers();
    if (markers.length === 0) return;

    const bounds = L.latLngBounds([]);
    
    markers.forEach(m => {
      const markerPos = L.latLng(m.lat, m.lng);
      bounds.extend(markerPos);

      const formattedPrice = m.price 
        ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(m.price)
        : 'Sob consulta';

      const marker = L.marker(markerPos, {
        icon: L.divIcon({
          className: 'property-pin-custom',
          html: `<div class="relative flex flex-col items-center group">
                  <div class="bg-white px-2 py-1 rounded-lg shadow-xl border border-slate-100 mb-1 transition-all group-hover:scale-110 whitespace-nowrap">
                    <span class="text-[9px] font-black text-slate-900">${formattedPrice}</span>
                  </div>
                  <div class="w-10 h-10 bg-gold-500 rounded-full shadow-2xl border-4 border-white flex items-center justify-center text-white transition-all transform group-hover:bg-primary-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                  </div>
                  <div class="w-3 h-3 bg-white rotate-45 -mt-1.5 shadow-lg"></div>
                </div>`,
          iconSize: [60, 60],
          iconAnchor: [30, 45]
        })
      });

      if (m.title) {
        marker.bindPopup(`
          <div class="p-4 min-w-[200px]">
            <p class="text-[9px] font-black text-gold-600 uppercase tracking-widest mb-1">Imóvel Madalena</p>
            <h4 class="text-sm font-black text-slate-900 mb-3 leading-tight">${m.title}</h4>
            <div class="grid grid-cols-2 gap-2">
              <button onclick="window.location.hash='/property/${m.id}'" class="bg-primary-600 text-white py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-primary-700">Ver</button>
              <button onclick="window.open('https://www.google.com/maps/dir/?api=1&destination=${m.lat},${m.lng}', '_blank')" class="bg-slate-100 text-slate-600 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1">Rota</button>
            </div>
          </div>
        `, { closeButton: false, className: 'custom-leaflet-popup' });
      }

      marker.addTo(markersLayerRef.current!);
    });

    if (markers.length > 1 && !onLocationSelect) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [markers]);

  const handleUserLocate = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.locate({ setView: true, maxZoom: 16 });
  };

  return (
    <div className={`relative w-full overflow-hidden bg-slate-200 transition-all duration-500 ${className}`}>
      {isInitializing && (
        <div className="absolute inset-0 z-[500] bg-slate-50 flex flex-col items-center justify-center text-slate-400 gap-3">
          <Loader2 size={32} className="animate-spin text-gold-500" />
          <span className="text-[10px] font-black uppercase tracking-widest">Iniciando GPS...</span>
        </div>
      )}
      
      {/* Controles de Navegação (Topo Esquerdo) */}
      <div className="absolute top-8 left-8 z-20 flex flex-col gap-4">
         <button 
           type="button"
           onClick={handleUserLocate}
           className="bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-slate-100 text-slate-600 hover:text-primary-600 transition-all active:scale-95 group/locate"
           title="Minha Localização"
         >
           <LocateFixed size={22} />
         </button>
         <button 
           type="button"
           onClick={openInExternalMap}
           className="bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-slate-100 text-slate-600 hover:text-primary-600 transition-all active:scale-95 group/external"
           title="Ver no Google Maps"
         >
           <ExternalLink size={22} />
         </button>
      </div>

      {/* Controles de Zoom (Baixo Direito) */}
      <div className="absolute bottom-12 right-8 z-20 flex flex-col gap-2">
         <button 
           type="button"
           onClick={handleZoomIn}
           className="bg-white/95 backdrop-blur-md p-3.5 rounded-xl shadow-2xl border border-slate-100 text-slate-600 hover:text-primary-600 transition-all active:scale-90"
         >
           <Plus size={20} />
         </button>
         <button 
           type="button"
           onClick={handleZoomOut}
           className="bg-white/95 backdrop-blur-md p-3.5 rounded-xl shadow-2xl border border-slate-100 text-slate-600 hover:text-primary-600 transition-all active:scale-90"
         >
           <Minus size={20} />
         </button>
      </div>

      {/* Badge de Dados Cartográficos (Central Inferior) */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
        <div className="bg-white/95 backdrop-blur-md px-6 py-2.5 rounded-full shadow-2xl border border-white/50 flex items-center gap-3">
           <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
           <span className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-700">Dados Cartográficos Reais</span>
        </div>
      </div>

      <div ref={mapRef} className="w-full h-full z-10 cursor-grab active:cursor-grabbing" />

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-leaflet-popup .leaflet-popup-content-wrapper { border-radius: 24px; padding: 0; overflow: hidden; box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1); }
        .custom-leaflet-popup .leaflet-popup-content { margin: 0; }
        .leaflet-div-icon { background: transparent; border: none; }
      `}} />
    </div>
  );
};

export default GoogleMap;
