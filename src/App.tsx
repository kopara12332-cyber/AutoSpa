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

const createCustomIcon = (isPromoted: boolean) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div class="marker-pin ${isPromoted ? 'promoted' : ''}">
        <div class="marker-icon-inner">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36]
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
    <div className="flex flex-col h-screen max-w-lg mx-auto bg-violet-50 text-slate-900 font-sans shadow-xl relative overflow-hidden">
      {/* App Header (Turbo Sunset Style) */}
      <header className="bg-sunset-gradient text-white p-4 shadow-lg z-20 flex flex-col gap-4">
        <div className="flex justify-between items-center px-2">
          <div className="flex items-center gap-3" onClick={() => setActiveView('map')} style={{ cursor: 'pointer' }}>
             <div className="bg-orange-500 p-2 rounded-xl shadow-lg transform -rotate-3">
               <Car className="w-6 h-6 text-white" />
             </div>
             <h1 className="text-2xl font-black tracking-tighter italic uppercase tracking-widest">AutoSpa</h1>
          </div>
          <div className="flex gap-1">
            <button className="p-2 hover:bg-white/20 rounded-full transition-colors">
              <Search className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-white/20 rounded-full transition-colors">
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
          <div className="h-full relative modern-map">
            <MapContainer center={mapCenter} zoom={13} scrollWheelZoom={true} className="h-full w-full" zoomControl={false}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapUpdater center={mapCenter} />
              {filteredWashes.map((wash) => (
                <Marker 
                  key={wash.id} 
                  position={[wash.lat, wash.lng]}
                  icon={createCustomIcon(!!wash.isPromoted)}
                  eventHandlers={{
                    click: () => handleMarkerClick(wash),
                  }}
                >
                  <Popup>
                    <div className="p-1 text-slate-900">
                      <h3 className="font-bold text-sm text-violet-900">{wash.name}</h3>
                      <p className="text-[10px] text-slate-500 mb-1">{wash.address}</p>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span className="text-xs font-bold text-violet-700">{wash.rating}</span>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>

             <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur p-3 rounded-xl shadow-turbo text-xs text-violet-900 border border-violet-100 z-[1000] font-medium">
               Znajdź myjnię w okolicy. <span className="text-orange-500 font-bold">Żółte punkty</span> to gorące promocje!
             </div>
          </div>
        )}

        {activeView === 'list' && (
          <div className="p-4 space-y-4 bg-violet-50">
            {filteredWashes.map(wash => (
              <CarWashCard key={wash.id} wash={wash} onClick={() => handleWashClick(wash)} />
            ))}
          </div>
        )}

        {activeView === 'detail' && selectedWash && (
          <div className="bg-white min-h-full">
            <div className="relative h-48 bg-violet-900">
               <div className="absolute inset-0 bg-gradient-to-t from-violet-950 to-transparent"></div>
               <button 
                 onClick={() => setActiveView('map')}
                 className="absolute top-4 left-4 p-2 bg-white/20 hover:bg-white/40 rounded-full text-white backdrop-blur border border-white/20"
               >
                 <Navigation className="w-5 h-5 rotate-180" />
               </button>
               <div className="absolute bottom-4 left-4 right-4 text-white">
                 <h2 className="text-2xl font-black italic uppercase tracking-tighter">{selectedWash.name}</h2>
                 <p className="text-sm opacity-80 text-orange-200">{selectedWash.address}</p>
               </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex justify-between items-center">
                 <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                    <span className="font-black text-xl text-violet-900">{selectedWash.rating}</span>
                    <span className="text-slate-400 text-sm">(124 głosy)</span>
                 </div>
                 <span className="px-3 py-1 bg-violet-100 text-violet-700 border border-violet-200 rounded-full text-xs font-black uppercase italic tracking-widest">
                   {selectedWash.type}
                 </span>
              </div>

              {selectedWash.isPromoted && (
                <div className="bg-orange-50 border-2 border-orange-200 p-4 rounded-2xl flex items-start gap-3 shadow-sm transform -rotate-1">
                  <TrendingDown className="w-6 h-6 text-orange-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-black text-orange-900 uppercase italic text-sm">Turbo Promocja!</h4>
                    <p className="text-orange-700 text-sm font-medium">{selectedWash.promotionText}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                 <StatusCard 
                   icon={<List className="w-5 h-5" />} 
                   label="Kolejka" 
                   value={selectedWash.queueStatus} 
                   color={selectedWash.queueStatus === 'brak' ? 'text-emerald-600' : selectedWash.queueStatus === 'mała' ? 'text-orange-500' : 'text-rose-600'}
                 />
                 <StatusCard 
                   icon={<AlertCircle className="w-5 h-5" />} 
                   label="Automat" 
                   value={selectedWash.isMachineWorking ? 'Działa' : 'Awaria'} 
                   color={selectedWash.isMachineWorking ? 'text-emerald-600' : 'text-rose-600'}
                 />
              </div>

              <div className="space-y-3">
                <h3 className="font-black text-violet-900 text-xs uppercase tracking-[0.2em]">Status "na żywo"</h3>
                <div className="flex gap-2">
                   <button className="flex-1 py-3 bg-violet-50 text-violet-700 border-2 border-violet-100 rounded-2xl text-xs font-black uppercase hover:bg-violet-100 transition-all active:scale-95">
                     Brak
                   </button>
                   <button className="flex-1 py-3 bg-violet-50 text-violet-700 border-2 border-violet-100 rounded-2xl text-xs font-black uppercase hover:bg-violet-100 transition-all active:scale-95">
                     Mała
                   </button>
                   <button className="flex-1 py-3 bg-violet-50 text-violet-700 border-2 border-violet-100 rounded-2xl text-xs font-black uppercase hover:bg-violet-100 transition-all active:scale-95">
                     Duża
                   </button>
                </div>
              </div>

              <button className="w-full py-4 bg-orange-gradient text-white rounded-2xl font-black text-lg shadow-lg shadow-orange-200 hover:scale-[1.02] active:scale-95 uppercase italic tracking-[0.1em] transition-all">
                Nawiguj Teraz
              </button>
            </div>
          </div>
        )}

        {activeView === 'b2b' && (
          <div className="p-6 space-y-6 bg-violet-50 min-h-full font-medium">
            <div className="text-center space-y-2">
              <div className="bg-orange-500 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto shadow-xl transform rotate-3">
                <Store className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-black text-violet-950 uppercase italic tracking-tighter mt-4">Strefa Turbo</h2>
              <p className="text-violet-600 text-sm">Podkręć obroty swojej myjni.</p>
            </div>

            <div className="bg-white p-5 rounded-3xl shadow-turbo border border-violet-100 space-y-4">
               <h3 className="font-black flex items-center gap-2 text-violet-900 text-xs uppercase tracking-widest">
                 <TrendingDown className="w-5 h-5 text-orange-500" /> Aktywne Promocje
               </h3>
               <div className="p-4 bg-violet-50 rounded-2xl border-2 border-dashed border-violet-200 text-center">
                 <p className="text-sm text-violet-400 mb-2 font-bold italic">Brak paliwa? Dodaj promocję!</p>
                 <button className="text-orange-600 text-xs font-black uppercase tracking-widest hover:text-orange-700 transition-colors">+ Nowa Promocja</button>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="bg-white p-4 rounded-3xl border border-violet-100 shadow-sm">
                  <p className="text-[10px] text-violet-400 font-black uppercase tracking-widest">Zasięg</p>
                  <p className="text-2xl font-black text-violet-900">1,248</p>
               </div>
               <div className="bg-white p-4 rounded-3xl border border-violet-100 shadow-sm">
                  <p className="text-[10px] text-violet-400 font-black uppercase tracking-widest">Kliki</p>
                  <p className="text-2xl font-black text-violet-900">342</p>
               </div>
            </div>

            <button className="w-full py-4 bg-violet-900 text-white rounded-2xl font-black uppercase italic tracking-widest shadow-xl shadow-violet-200 hover:bg-violet-950 transition-all active:scale-95">
              Wykup Wyróżnienie
            </button>
          </div>
        )}
      </main>

      {/* Bottom Navigation (Turbo Sunset Style) */}
      <nav className="bg-white border-t border-violet-100 p-2 flex justify-around items-center z-30 shadow-[0_-4px_20px_rgba(76,29,149,0.05)]">
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
        "px-4 py-2 rounded-xl text-[10px] font-black uppercase italic tracking-widest transition-all duration-300 border-2",
        active 
          ? "bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-200 scale-105" 
          : "bg-white/10 text-white border-white/20 hover:border-white/50"
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
        "flex flex-col items-center gap-1 p-2 px-4 transition-all duration-300 rounded-2xl relative",
        active ? "text-orange-600 bg-orange-50" : "text-violet-300 hover:text-violet-500 hover:bg-violet-50"
      )}
    >
      <div className={cn("transition-transform", active && "scale-110")}>
        {icon}
      </div>
      <span className="text-[9px] font-black uppercase tracking-[0.1em]">
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
        "bg-white p-4 rounded-3xl shadow-sm border border-violet-100 flex gap-4 items-center active:scale-[0.98] transition-all cursor-pointer hover:shadow-turbo",
        wash.isPromoted && "border-orange-200 bg-orange-50/20"
      )}
    >
      <div className={cn(
        "w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm transform rotate-2",
        wash.isPromoted ? "bg-orange-100 text-orange-600" : "bg-violet-100 text-violet-600"
      )}>
        <Car className="w-7 h-7" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <h3 className="font-black text-violet-950 truncate italic uppercase tracking-tighter">{wash.name}</h3>
          <div className="flex items-center gap-1 bg-violet-50 px-1.5 py-0.5 rounded-lg border border-violet-100">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span className="text-[10px] font-black text-violet-700">{wash.rating}</span>
          </div>
        </div>
        <p className="text-[10px] text-violet-400 truncate mb-2 font-medium">{wash.address}</p>
        <div className="flex gap-2">
          <span className={cn(
            "text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider border-2",
            wash.queueStatus === 'brak' ? "bg-emerald-50 text-emerald-700 border-emerald-100" : wash.queueStatus === 'mała' ? "bg-orange-50 text-orange-700 border-orange-100" : "bg-rose-50 text-rose-700 border-rose-100"
          )}>
            {wash.queueStatus}
          </span>
          {wash.isPromoted && (
            <span className="text-[9px] font-black px-2 py-0.5 rounded-full uppercase bg-orange-500 text-white shadow-md italic tracking-widest">
              HOT
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusCard({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string, color: string }) {
  return (
    <div className="bg-violet-50/50 p-4 rounded-2xl border border-violet-100 shadow-inner">
      <div className="flex items-center gap-2 text-violet-400 mb-1">
        {icon}
        <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
      </div>
      <p className={cn("text-sm font-black uppercase italic tracking-tighter", color)}>{value}</p>
    </div>
  );
}

export default App;
