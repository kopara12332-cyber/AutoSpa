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
    <div className="flex flex-col h-screen max-w-lg mx-auto bg-[#0d0221] text-slate-100 font-sans shadow-xl relative overflow-hidden">
      {/* App Header (Synthwave Style) */}
      <header className="bg-[#1a0b2e] text-white p-4 shadow-[0_0_20px_rgba(255,0,255,0.3)] z-20 flex flex-col gap-4 border-b border-[#ff00ff]/30">
        <div className="flex justify-between items-center px-2">
          <div className="flex items-center gap-3" onClick={() => setActiveView('map')} style={{ cursor: 'pointer' }}>
             <div className="bg-[#ff00ff]/20 p-2 rounded-xl shadow-[0_0_10px_#ff00ff]">
               <Car className="w-6 h-6 text-[#ff00ff]" />
             </div>
             <h1 className="text-xl font-bold tracking-tighter italic uppercase text-neon-pink">AutoSpa</h1>
          </div>
          <div className="flex gap-1">
            <button className="p-2 hover:bg-[#ff00ff]/20 rounded-full transition-colors text-[#ff00ff]">
              <Search className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-[#00ffff]/20 rounded-full transition-colors text-[#00ffff]">
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
      <main className="flex-1 relative overflow-y-auto bg-synth-dark">
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
                  <Popup className="synth-popup">
                    <div className="p-1 bg-[#1a0b2e] text-white rounded-lg">
                      <h3 className="font-bold text-sm text-[#ff00ff]">{wash.name}</h3>
                      <p className="text-[10px] opacity-70 mb-1">{wash.address}</p>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-[#00ffff] text-[#00ffff]" />
                        <span className="text-xs font-bold text-[#00ffff]">{wash.rating}</span>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>

             <div className="absolute bottom-4 left-4 right-4 bg-[#1a0b2e]/90 backdrop-blur p-3 rounded-xl shadow-[0_0_15px_rgba(255,0,255,0.2)] text-xs text-[#00ffff] border border-[#ff00ff]/30 z-[1000]">
               Przesuwaj mapę w neonowym świetle. Myjnie z promocją pulsują na błękitno.
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
          <div className="bg-[#0d0221] min-h-full">
            <div className="relative h-48 bg-[#1a0b2e]">
               <div className="absolute inset-0 bg-gradient-to-t from-[#0d0221] to-transparent"></div>
               <button 
                 onClick={() => setActiveView('map')}
                 className="absolute top-4 left-4 p-2 bg-[#ff00ff]/20 hover:bg-[#ff00ff]/40 rounded-full text-[#ff00ff] backdrop-blur border border-[#ff00ff]/30"
               >
                 <Navigation className="w-5 h-5 rotate-180" />
               </button>
               <div className="absolute bottom-4 left-4 right-4 text-white">
                 <h2 className="text-2xl font-bold italic uppercase tracking-tighter text-neon-pink">{selectedWash.name}</h2>
                 <p className="text-sm opacity-70 text-[#00ffff]">{selectedWash.address}</p>
               </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex justify-between items-center">
                 <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 fill-[#00ffff] text-[#00ffff]" />
                    <span className="font-bold text-lg text-[#00ffff]">{selectedWash.rating}</span>
                    <span className="text-slate-400 text-sm">(124 oceny)</span>
                 </div>
                 <span className="px-3 py-1 bg-[#ff00ff]/10 text-[#ff00ff] border border-[#ff00ff]/30 rounded-full text-xs font-bold uppercase tracking-widest">
                   {selectedWash.type}
                 </span>
              </div>

              {selectedWash.isPromoted && (
                <div className="bg-[#00ffff]/5 border border-[#00ffff]/30 p-4 rounded-xl flex items-start gap-3 shadow-[0_0_15px_rgba(0,255,255,0.1)]">
                  <TrendingDown className="w-6 h-6 text-[#00ffff] flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-[#00ffff] uppercase italic tracking-tight">Neonowa Promocja!</h4>
                    <p className="text-[#00ffff]/80 text-sm">{selectedWash.promotionText}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                 <StatusCard 
                   icon={<List className="w-5 h-5" />} 
                   label="Kolejka" 
                   value={selectedWash.queueStatus} 
                   color={selectedWash.queueStatus === 'brak' ? 'text-emerald-400' : selectedWash.queueStatus === 'mała' ? 'text-amber-400' : 'text-rose-500'}
                 />
                 <StatusCard 
                   icon={<AlertCircle className="w-5 h-5" />} 
                   label="Automat" 
                   value={selectedWash.isMachineWorking ? 'Działa' : 'Awaria'} 
                   color={selectedWash.isMachineWorking ? 'text-emerald-400' : 'text-rose-500'}
                 />
              </div>

              <div className="space-y-3">
                <h3 className="font-bold text-slate-300 uppercase text-xs tracking-widest">Zgłoś status "na żywo"</h3>
                <div className="flex gap-2">
                   <button className="flex-1 py-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-xl text-[10px] font-bold uppercase tracking-tighter hover:bg-emerald-500/20 transition-colors">
                     Brak
                   </button>
                   <button className="flex-1 py-3 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-xl text-[10px] font-bold uppercase tracking-tighter hover:bg-amber-500/20 transition-colors">
                     Mała
                   </button>
                   <button className="flex-1 py-3 bg-rose-500/10 text-rose-500 border border-rose-500/30 rounded-xl text-[10px] font-bold uppercase tracking-tighter hover:bg-rose-500/20 transition-colors">
                     Duża
                   </button>
                </div>
              </div>

              <button className="w-full py-4 bg-gradient-to-r from-[#ff00ff] to-[#7000ff] text-white rounded-2xl font-bold text-lg shadow-[0_0_20px_rgba(255,0,255,0.4)] hover:scale-[1.02] transition-transform active:scale-95 uppercase italic tracking-widest">
                Nawiguj Teraz
              </button>
            </div>
          </div>
        )}

        {activeView === 'b2b' && (
          <div className="p-6 space-y-6">
            <div className="text-center space-y-2">
              <div className="bg-[#00ffff]/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-[0_0_20px_#00ffff]">
                <Store className="w-10 h-10 text-[#00ffff]" />
              </div>
              <h2 className="text-2xl font-bold uppercase italic text-neon-cyan">Strefa Biznesu</h2>
              <p className="text-[#00ffff]/60 text-sm">Rozświetl swój biznes neonami AutoSpa.</p>
            </div>

            <div className="bg-[#1a0b2e] p-5 rounded-2xl shadow-lg border border-[#ff00ff]/20 space-y-4">
               <h3 className="font-bold flex items-center gap-2 text-[#ff00ff] uppercase text-xs tracking-widest">
                 <TrendingDown className="w-5 h-5" /> Aktywne Promocje
               </h3>
               <div className="p-4 bg-[#0d0221] rounded-xl border border-dashed border-[#ff00ff]/30 text-center">
                 <p className="text-xs opacity-50 mb-2">Ciemno tutaj... dodaj blasku!</p>
                 <button className="text-[#00ffff] text-xs font-bold uppercase tracking-widest underline decoration-[#00ffff]/30 underline-offset-4">+ Dodaj nową promocję</button>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="bg-[#ff00ff]/5 p-4 rounded-2xl border border-[#ff00ff]/20">
                  <p className="text-[10px] text-[#ff00ff] font-bold uppercase tracking-widest opacity-70">Zasięg</p>
                  <p className="text-2xl font-bold text-[#ff00ff]">1,248</p>
               </div>
               <div className="bg-[#00ffff]/5 p-4 rounded-2xl border border-[#00ffff]/20">
                  <p className="text-[10px] text-[#00ffff] font-bold uppercase tracking-widest opacity-70">Konwersja</p>
                  <p className="text-2xl font-bold text-[#00ffff]">342</p>
               </div>
            </div>

            <button className="w-full py-4 border-2 border-[#00ffff] text-[#00ffff] bg-transparent rounded-2xl font-bold uppercase italic tracking-widest shadow-[0_0_15px_rgba(0,255,255,0.2)] hover:bg-[#00ffff]/10 transition-colors">
              Wykup Wyróżnienie
            </button>
          </div>
        )}
      </main>

      {/* Bottom Navigation (Synthwave Style) */}
      <nav className="bg-[#1a0b2e] border-t border-[#ff00ff]/30 p-2 flex justify-around items-center z-30 shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
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
        "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all duration-300 border",
        active 
          ? "bg-[#ff00ff] text-white border-[#ff00ff] shadow-[0_0_15px_#ff00ff] scale-105" 
          : "bg-[#1a0b2e] text-[#ff00ff]/60 border-[#ff00ff]/20 hover:border-[#ff00ff]/50"
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
        "flex flex-col items-center gap-1 p-2 px-4 transition-all duration-300 rounded-xl relative",
        active ? "text-[#00ffff]" : "text-[#ff00ff]/40 hover:text-[#ff00ff]/70"
      )}
    >
      {active && (
        <div className="absolute inset-0 bg-[#00ffff]/10 blur-md rounded-xl"></div>
      )}
      <div className={cn("transition-transform", active && "scale-110")}>
        {icon}
      </div>
      <span className="text-[9px] font-bold uppercase tracking-[0.2em]">
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
        "bg-[#1a0b2e] p-4 rounded-2xl shadow-lg border border-[#ff00ff]/10 flex gap-4 items-center active:scale-[0.98] transition-all cursor-pointer hover:border-[#ff00ff]/40 hover:shadow-[0_0_15px_rgba(255,0,255,0.1)]",
        wash.isPromoted && "border-[#00ffff]/30 shadow-[0_0_10px_rgba(0,255,255,0.1)]"
      )}
    >
      <div className={cn(
        "w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 border",
        wash.isPromoted ? "bg-[#00ffff]/10 border-[#00ffff]/30 text-[#00ffff]" : "bg-[#ff00ff]/10 border-[#ff00ff]/30 text-[#ff00ff]"
      )}>
        <Car className="w-7 h-7" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-white truncate italic uppercase tracking-tighter">{wash.name}</h3>
          <div className="flex items-center gap-1 bg-[#0d0221] px-1.5 py-0.5 rounded-lg border border-[#00ffff]/20">
            <Star className="w-3 h-3 fill-[#00ffff] text-[#00ffff]" />
            <span className="text-[10px] font-bold text-[#00ffff]">{wash.rating}</span>
          </div>
        </div>
        <p className="text-[10px] text-slate-400 truncate mb-2 opacity-70">{wash.address}</p>
        <div className="flex gap-2">
          <span className={cn(
            "text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest border",
            wash.queueStatus === 'brak' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : wash.queueStatus === 'mała' ? "bg-amber-500/10 text-amber-400 border-amber-500/30" : "bg-rose-500/10 text-rose-500 border-rose-500/30"
          )}>
            {wash.queueStatus}
          </span>
          {wash.isPromoted && (
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase bg-[#00ffff] text-[#0d0221] shadow-[0_0_10px_#00ffff]">
              PROMO
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusCard({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string, color: string }) {
  return (
    <div className="bg-[#1a0b2e] p-4 rounded-2xl border border-[#ff00ff]/10 shadow-inner">
      <div className="flex items-center gap-2 text-[#ff00ff]/40 mb-1">
        {icon}
        <span className="text-[9px] font-bold uppercase tracking-widest">{label}</span>
      </div>
      <p className={cn("text-sm font-bold uppercase italic tracking-tight", color)}>{value}</p>
    </div>
  );

export default App;
