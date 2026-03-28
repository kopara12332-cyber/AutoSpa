import React, { useState, useMemo, useEffect } from 'react';
import { Map as MapIcon, List, Search, Filter, Car, Star, Navigation, AlertCircle, TrendingDown, Store, Droplets, Sparkles, HandMetal } from 'lucide-react';
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

const createCustomIcon = (type: CarWashType, isPromoted: boolean) => {
  const getIcon = () => {
    switch (type) {
      case 'bezdotykowa':
        return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>`;
      case 'reczna':
        return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v5"/><path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v10"/><path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.8-6.6-2.7L2 14l1.5-1.5c.9-.9 2.2-1.2 3.5-.8L10 13"/></svg>`;
      case 'autodetailing':
        return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="m5 3 1 1"/><path d="m19 21 1 1"/><path d="m5 21 1-1"/><path d="m19 3 1-1"/></svg>`;
      default:
        return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>`;
    }
  };

  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div class="marker-pin ${type} ${isPromoted ? 'promoted' : ''}">
        <div class="marker-icon-inner">
          ${getIcon()}
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
    <div className="flex flex-col h-screen max-w-lg mx-auto bg-black text-white font-sans shadow-xl relative overflow-hidden">
      {/* App Header (Midnight Gold Style) */}
      <header className="bg-gold-gradient text-white p-4 shadow-lg z-20 flex flex-col gap-4 border-b border-white/10">
        <div className="flex justify-between items-center px-2">
          <div className="flex items-center gap-3" onClick={() => setActiveView('map')} style={{ cursor: 'pointer' }}>
             <div className="bg-luxury-gold p-2 rounded-xl shadow-lg transform -rotate-3">
               <Car className="w-6 h-6 text-black" />
             </div>
             <h1 className="text-2xl font-black tracking-tighter italic uppercase tracking-widest text-gold">AutoSpa</h1>
          </div>
          <div className="flex gap-1">
            <button className="p-2 hover:bg-white/10 rounded-full transition-colors text-gold">
              <Search className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-white/10 rounded-full transition-colors text-gold">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {activeView !== 'b2b' && activeView !== 'detail' && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide no-scrollbar px-2">
            <FilterChip active={selectedType === 'all'} onClick={() => setSelectedType('all')} label="Wszystkie" />
            <FilterChip active={selectedType === 'bezdotykowa'} onClick={() => setSelectedType('bezdotykowa')} label="Bezdotykowa" />
            <FilterChip active={selectedType === 'reczna'} onClick={() => setSelectedType('reczna')} label="Ręczna" />
            <FilterChip active={selectedType === 'autodetailing'} onClick={() => setSelectedType('autodetailing')} label="Autodetailing" />
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
                  icon={createCustomIcon(wash.type, !!wash.isPromoted)}
                  eventHandlers={{
                    click: () => handleMarkerClick(wash),
                  }}
                >
                  <Popup>
                    <div className="p-1 text-white bg-black">
                      <h3 className="font-bold text-sm text-gold">{wash.name}</h3>
                      <p className="text-[10px] text-gray-400 mb-1">{wash.address}</p>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-gold text-gold" />
                        <span className="text-xs font-bold text-gold">{wash.rating}</span>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        )}

        {activeView === 'list' && (
          <div className="p-4 space-y-4 bg-black">
            {filteredWashes.map(wash => (
              <CarWashCard key={wash.id} wash={wash} onClick={() => handleWashClick(wash)} />
            ))}
          </div>
        )}

        {activeView === 'detail' && selectedWash && (
          <div className="bg-black min-h-full">
            <div className="relative h-48 bg-zinc-900">
               <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
               <button 
                 onClick={() => setActiveView('map')}
                 className="absolute top-4 left-4 p-2 bg-black/40 hover:bg-black/60 rounded-full text-white backdrop-blur border border-white/20"
               >
                 <Navigation className="w-5 h-5 rotate-180" />
               </button>
               <div className="absolute bottom-4 left-4 right-4 text-white">
                 <h2 className="text-2xl font-black italic uppercase tracking-tighter text-gold">{selectedWash.name}</h2>
                 <p className="text-sm opacity-80 text-gray-300">{selectedWash.address}</p>
               </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex justify-between items-center">
                 <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 fill-gold text-gold" />
                    <span className="font-black text-xl text-gold">{selectedWash.rating}</span>
                    <span className="text-gray-500 text-sm">(124 głosy)</span>
                 </div>
                 <span className="px-3 py-1 bg-zinc-900 text-gold border border-gold/50 rounded-full text-xs font-black uppercase italic tracking-widest">
                   {selectedWash.type}
                 </span>
              </div>

              {selectedWash.isPromoted && (
                <div className="bg-zinc-900 border-2 border-gold/30 p-4 rounded-2xl flex items-start gap-3 shadow-gold transform -rotate-1">
                  <TrendingDown className="w-6 h-6 text-gold flex-shrink-0" />
                  <div>
                    <h4 className="font-black text-gold uppercase italic text-sm">Złota Promocja!</h4>
                    <p className="text-gray-300 text-sm font-medium">{selectedWash.promotionText}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                 <StatusCard 
                   icon={<List className="w-5 h-5" />} 
                   label="Kolejka" 
                   value={selectedWash.queueStatus} 
                   color={selectedWash.queueStatus === 'brak' ? 'text-emerald-500' : selectedWash.queueStatus === 'mała' ? 'text-gold' : 'text-rose-500'}
                 />
                 <StatusCard 
                   icon={<AlertCircle className="w-5 h-5" />} 
                   label="Automat" 
                   value={selectedWash.isMachineWorking ? 'Działa' : 'Awaria'} 
                   color={selectedWash.isMachineWorking ? 'text-emerald-500' : 'text-rose-500'}
                 />
              </div>

              <div className="space-y-3">
                <h3 className="font-black text-gold text-xs uppercase tracking-[0.2em]">Status "na żywo"</h3>
                <div className="flex gap-2">
                   <button className="flex-1 py-3 bg-zinc-900 text-white border-2 border-zinc-800 rounded-2xl text-xs font-black uppercase hover:border-gold transition-all active:scale-95">
                     Brak
                   </button>
                   <button className="flex-1 py-3 bg-zinc-900 text-white border-2 border-zinc-800 rounded-2xl text-xs font-black uppercase hover:border-gold transition-all active:scale-95">
                     Mała
                   </button>
                   <button className="flex-1 py-3 bg-zinc-900 text-white border-2 border-zinc-800 rounded-2xl text-xs font-black uppercase hover:border-gold transition-all active:scale-95">
                     Duża
                   </button>
                </div>
              </div>

              <button className="w-full py-4 bg-luxury-gold text-black rounded-2xl font-black text-lg shadow-lg shadow-gold/20 hover:scale-[1.02] active:scale-95 uppercase italic tracking-[0.1em] transition-all">
                Nawiguj Teraz
              </button>
            </div>
          </div>
        )}

        {activeView === 'b2b' && (
          <div className="p-6 space-y-6 bg-black min-h-full font-medium">
            <div className="text-center space-y-2">
              <div className="bg-luxury-gold w-20 h-20 rounded-3xl flex items-center justify-center mx-auto shadow-xl transform rotate-3">
                <Store className="w-10 h-10 text-black" />
              </div>
              <h2 className="text-2xl font-black text-gold uppercase italic tracking-tighter mt-4">Strefa Premium</h2>
              <p className="text-gray-400 text-sm">Podkręć prestiż swojej myjni.</p>
            </div>

            <div className="bg-zinc-900 p-5 rounded-3xl shadow-gold border border-white/10 space-y-4">
               <h3 className="font-black flex items-center gap-2 text-gold text-xs uppercase tracking-widest">
                 <TrendingDown className="w-5 h-5 text-gold" /> Aktywne Promocje
               </h3>
               <div className="p-4 bg-black/40 rounded-2xl border-2 border-dashed border-zinc-800 text-center">
                 <p className="text-sm text-gray-500 mb-2 font-bold italic">Brak paliwa? Dodaj promocję!</p>
                 <button className="text-gold text-xs font-black uppercase tracking-widest hover:text-white transition-colors">+ Nowa Promocja</button>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="bg-zinc-900 p-4 rounded-3xl border border-white/10 shadow-sm">
                  <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Zasięg</p>
                  <p className="text-2xl font-black text-gold">1,248</p>
               </div>
               <div className="bg-zinc-900 p-4 rounded-3xl border border-white/10 shadow-sm">
                  <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Kliki</p>
                  <p className="text-2xl font-black text-gold">342</p>
               </div>
            </div>

            <button className="w-full py-4 bg-zinc-900 text-gold border border-gold/50 rounded-2xl font-black uppercase italic tracking-widest shadow-xl hover:bg-zinc-800 transition-all active:scale-95">
              Wykup Wyróżnienie
            </button>
          </div>
        )}
      </main>

      {/* Bottom Navigation (Midnight Gold Style) */}
      <nav className="bg-black border-t border-white/10 p-2 flex justify-around items-center z-30 shadow-[0_-4px_20px_rgba(212,175,55,0.05)]">
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
          ? "bg-luxury-gold text-black border-gold shadow-lg shadow-gold/20 scale-105" 
          : "bg-white/5 text-gray-400 border-white/10 hover:border-gold/50 hover:text-gold"
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
        active ? "text-gold bg-gold/10" : "text-gray-500 hover:text-gold hover:bg-white/5"
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
        "bg-zinc-900 p-4 rounded-3xl shadow-sm border border-white/10 flex gap-4 items-center active:scale-[0.98] transition-all cursor-pointer hover:shadow-gold hover:border-gold/30",
        wash.isPromoted && "border-gold/50 bg-gold/5"
      )}
    >
      <div className={cn(
        "w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm transform rotate-2",
        wash.isPromoted ? "bg-luxury-gold text-black" : "bg-black text-gold border border-gold/30"
      )}>
        <Car className="w-7 h-7" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <h3 className="font-black text-white truncate italic uppercase tracking-tighter">{wash.name}</h3>
          <div className="flex items-center gap-1 bg-black px-1.5 py-0.5 rounded-lg border border-gold/20">
            <Star className="w-3 h-3 fill-gold text-gold" />
            <span className="text-[10px] font-black text-gold">{wash.rating}</span>
          </div>
        </div>
        <p className="text-[10px] text-gray-500 truncate mb-2 font-medium">{wash.address}</p>
        <div className="flex gap-2">
          <span className={cn(
            "text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider border-2",
            wash.queueStatus === 'brak' ? "bg-emerald-950/30 text-emerald-500 border-emerald-900" : wash.queueStatus === 'mała' ? "bg-gold/10 text-gold border-gold/30" : "bg-rose-950/30 text-rose-500 border-rose-900"
          )}>
            {wash.queueStatus}
          </span>
          {wash.isPromoted && (
            <span className="text-[9px] font-black px-2 py-0.5 rounded-full uppercase bg-luxury-gold text-black shadow-md italic tracking-widest">
              PREMIUM
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusCard({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string, color: string }) {
  return (
    <div className="bg-black/40 p-4 rounded-2xl border border-white/10 shadow-inner">
      <div className="flex items-center gap-2 text-gray-500 mb-1">
        {icon}
        <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
      </div>
      <p className={cn("text-sm font-black uppercase italic tracking-tighter", color)}>{value}</p>
    </div>
  );
}

export default App;
