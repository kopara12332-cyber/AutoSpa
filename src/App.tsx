import React, { useState, useMemo, useEffect } from 'react';
import { Map as MapIcon, List, Search, Filter, Car, Star, Navigation, AlertCircle, TrendingDown, Store } from 'lucide-react';
import { mockCarWashes } from './data';
import type { CarWash, CarWashType } from './data';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Leaflet icon fix
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom Marker Function
const createCustomIcon = (wash: CarWash) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div class="marker-label ${wash.isPromoted ? 'promoted' : ''}">
        ${wash.isPromoted ? '🔥 PROMO' : wash.rating + ' ⭐'}
      </div>
      <div class="marker-pin ${wash.isPromoted ? 'promoted' : ''}">
        <div class="marker-icon-inner">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-car"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>
        </div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
  });
};

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Map Updater Component to center map on selection
function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

type View = 'map' | 'list' | 'b2b' | 'detail';

function App() {
  const [activeView, setActiveView] = useState<View>('map');
  const [selectedType, setSelectedType] = useState<CarWashType | 'all'>('all');
  const [selectedWash, setSelectedWash] = useState<CarWash | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([52.2297, 21.0122]);

  const filteredWashes = useMemo(() => {
    if (selectedType === 'all') return mockCarWashes;
    return mockCarWashes.filter(w => w.type === selectedType);
  }, [selectedType]);

  const handleWashClick = (wash: CarWash) => {
    setSelectedWash(wash);
    setMapCenter([wash.lat, wash.lng]);
    setActiveView('detail');
  };

  const handleMarkerClick = (wash: CarWash) => {
    setSelectedWash(wash);
    setActiveView('detail');
  };

  return (
    <div className="flex flex-col h-screen max-w-lg mx-auto bg-slate-50 text-slate-900 font-sans shadow-xl relative overflow-hidden">
      {/* App Header (Clean Web App Style) */}
      <header className="bg-blue-600 text-white p-4 shadow-lg z-20 flex flex-col gap-4">
        <div className="flex justify-between items-center px-2">
          <div className="flex items-center gap-3" onClick={() => setActiveView('map')} style={{ cursor: 'pointer' }}>
             <div className="bg-white/20 p-2 rounded-xl">
               <Car className="w-6 h-6" />
             </div>
             <h1 className="text-xl font-bold tracking-tight">AutoSpa</h1>
          </div>
          <div className="flex gap-1">
            <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <Search className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {activeView !== 'b2b' && activeView !== 'detail' && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide no-scrollbar px-2">
            <FilterChip active={selectedType === 'all'} onClick={() => setSelectedType('all')} label="Wszystkie" />
            <FilterChip active={selectedType === 'bezdotykowa'} onClick={() => setSelectedType('bezdotykowa')} label="Bezdotykowa" />
            <FilterChip active={selectedType === 'reczna'} onClick={() => setSelectedType('reczna')} label="Ręczna" />
            <FilterChip active={selectedType === 'szczotki'} onClick={() => setSelectedType('szczotki')} label="Szczotki" />
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-y-auto">
        {activeView === 'map' && (
          <div className="h-full relative modern-map bg-slate-50">
            <MapContainer center={mapCenter} zoom={13} scrollWheelZoom={true} className="h-full w-full" zoomControl={false}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
              />
              <MapUpdater center={mapCenter} />
              {filteredWashes.map((wash) => (
                <Marker 
                  key={wash.id} 
                  position={[wash.lat, wash.lng]}
                  icon={createCustomIcon(wash)}
                  eventHandlers={{
                    click: () => handleMarkerClick(wash),
                  }}
                >
                  <Popup>
                    <div className="p-1">
                      <h3 className="font-bold text-sm">{wash.name}</h3>
                      <p className="text-xs text-slate-500 mb-1">{wash.address}</p>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span className="text-xs font-bold">{wash.rating}</span>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>

             <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur p-3 rounded-xl shadow-lg text-sm text-slate-600 border border-slate-200 z-[1000]">
               Przesuwaj mapę, aby znaleźć myjnie w okolicy. Kliknij marker, aby zobaczyć szczegóły.
             </div>
          </div>
        )}

        {activeView === 'list' && (
          <div className="p-4 space-y-4">
            {filteredWashes.map(wash => (
              <CarWashCard key={wash.id} wash={wash} onClick={() => handleWashClick(wash)} />
            ))}
          </div>
        )}

        {activeView === 'detail' && selectedWash && (
          <div className="bg-white min-h-full">
            <div className="relative h-48 bg-slate-800">
               <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
               <button 
                 onClick={() => setActiveView('map')}
                 className="absolute top-4 left-4 p-2 bg-white/20 hover:bg-white/40 rounded-full text-white backdrop-blur"
               >
                 <Navigation className="w-5 h-5 rotate-180" />
               </button>
               <div className="absolute bottom-4 left-4 right-4 text-white">
                 <h2 className="text-2xl font-bold">{selectedWash.name}</h2>
                 <p className="text-sm opacity-90">{selectedWash.address}</p>
               </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex justify-between items-center">
                 <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                    <span className="font-bold text-lg">{selectedWash.rating}</span>
                    <span className="text-slate-400 text-sm">(124 oceny)</span>
                 </div>
                 <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider">
                   {selectedWash.type}
                 </span>
              </div>

              {selectedWash.isPromoted && (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3">
                  <TrendingDown className="w-6 h-6 text-amber-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-amber-900">Oferta specjalna!</h4>
                    <p className="text-amber-700 text-sm">{selectedWash.promotionText}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                 <StatusCard 
                   icon={<List className="w-5 h-5" />} 
                   label="Kolejka" 
                   value={selectedWash.queueStatus} 
                   color={selectedWash.queueStatus === 'brak' ? 'text-emerald-600' : selectedWash.queueStatus === 'mała' ? 'text-amber-600' : 'text-rose-600'}
                 />
                 <StatusCard 
                   icon={<AlertCircle className="w-5 h-5" />} 
                   label="Automat" 
                   value={selectedWash.isMachineWorking ? 'Działa' : 'Awaria'} 
                   color={selectedWash.isMachineWorking ? 'text-emerald-600' : 'text-rose-600'}
                 />
              </div>

              <div className="space-y-3">
                <h3 className="font-bold text-slate-700">Zgłoś status "na żywo"</h3>
                <div className="flex gap-2">
                   <button className="flex-1 py-3 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl text-sm font-medium hover:bg-emerald-100 transition-colors">
                     Brak kolejki
                   </button>
                   <button className="flex-1 py-3 bg-amber-50 text-amber-700 border border-amber-100 rounded-xl text-sm font-medium hover:bg-amber-100 transition-colors">
                     Mała kolejka
                   </button>
                   <button className="flex-1 py-3 bg-rose-50 text-rose-700 border border-rose-100 rounded-xl text-sm font-medium hover:bg-rose-100 transition-colors">
                     Duża kolejka
                   </button>
                </div>
              </div>

              <button className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:bg-blue-700 transition-colors active:scale-95">
                Nawiguj do myjni
              </button>
            </div>
          </div>
        )}

        {activeView === 'b2b' && (
          <div className="p-6 space-y-6">
            <div className="text-center space-y-2">
              <Store className="w-16 h-16 text-blue-600 mx-auto" />
              <h2 className="text-2xl font-bold">Strefa Właściciela</h2>
              <p className="text-slate-500">Zarządzaj swoją myjnią i przyciągnij klientów.</p>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-4">
               <h3 className="font-bold flex items-center gap-2">
                 <TrendingDown className="w-5 h-5 text-amber-500" /> Twoje Promocje
               </h3>
               <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-center">
                 <p className="text-sm text-slate-500 mb-2">Brak aktywnych promocji</p>
                 <button className="text-blue-600 text-sm font-bold">+ Dodaj nową promocję</button>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                  <p className="text-xs text-blue-600 font-bold uppercase">Wyświetlenia</p>
                  <p className="text-2xl font-bold text-blue-900">1,248</p>
               </div>
               <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                  <p className="text-xs text-emerald-600 font-bold uppercase">Nawigacje</p>
                  <p className="text-2xl font-bold text-emerald-900">342</p>
               </div>
            </div>

            <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold">
              Wykup wyróżnienie na mapie
            </button>
          </div>
        )}
      </main>

      {/* Bottom Navigation (Clean Web App Style) */}
      <nav className="bg-white border-t border-slate-200 p-2 flex justify-around items-center z-30 shadow-md">
        <NavButton 
          active={activeView === 'map'} 
          onClick={() => setActiveView('map')} 
          icon={<MapIcon className="w-6 h-6" />} 
          label="Mapa" 
        />
        <NavButton 
          active={activeView === 'list'} 
          onClick={() => setActiveView('list')} 
          icon={<List className="w-6 h-6" />} 
          label="Lista" 
        />
        <NavButton 
          active={activeView === 'b2b'} 
          onClick={() => setActiveView('b2b')} 
          icon={<Store className="w-6 h-6" />} 
          label="Biznes" 
        />
      </nav>
    </div>
  );
}

function FilterChip({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 border",
        active 
          ? "bg-white text-blue-600 border-white shadow-sm" 
          : "bg-blue-500/20 text-blue-50 border-transparent hover:bg-blue-500/30"
      )}
    >
      {label}
    </button>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 p-2 px-4 transition-all duration-200 rounded-xl relative",
        active ? "text-blue-600 bg-blue-50" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
      )}
    >
      <div className={cn("transition-transform", active && "scale-110")}>
        {icon}
      </div>
      <span className="text-[10px] font-bold uppercase tracking-tight">
        {label}
      </span>
    </button>
  );
}

function CarWashCard({ wash, onClick }: { wash: CarWash, onClick: () => void }) {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex gap-4 items-center active:scale-[0.98] transition-transform cursor-pointer",
        wash.isPromoted && "border-amber-200 ring-1 ring-amber-100"
      )}
    >
      <div className={cn(
        "w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0",
        wash.isPromoted ? "bg-amber-100 text-amber-600" : "bg-blue-50 text-blue-600"
      )}>
        <Car className="w-8 h-8" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-slate-800 truncate">{wash.name}</h3>
          <div className="flex items-center gap-1 bg-amber-50 px-1.5 py-0.5 rounded-lg">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span className="text-xs font-bold text-amber-700">{wash.rating}</span>
          </div>
        </div>
        <p className="text-xs text-slate-500 truncate mb-2">{wash.address}</p>
        <div className="flex gap-2">
          <span className={cn(
            "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase",
            wash.queueStatus === 'brak' ? "bg-emerald-100 text-emerald-700" : wash.queueStatus === 'mała' ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"
          )}>
            Kolejka: {wash.queueStatus}
          </span>
          {wash.isPromoted && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-amber-500 text-white">
              Promocja
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusCard({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string, color: string }) {
  return (
    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
      <div className="flex items-center gap-2 text-slate-400 mb-1">
        {icon}
        <span className="text-[10px] font-bold uppercase">{label}</span>
      </div>
      <p className={cn("text-lg font-bold", color)}>{value}</p>
    </div>
  );
}

export default App;
