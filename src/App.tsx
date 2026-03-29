import React, { useState, useMemo, useEffect } from 'react';
import { Map as MapIcon, List, Filter, Car, Star, Navigation, AlertCircle, TrendingDown, Store, LogIn, Mail, Lock, LogOut, Plus, CheckCircle2, MapPin, Info, ShieldCheck, XCircle, Edit3, Save, CreditCard, Clock, FileText, Settings, Phone, Eye, EyeOff, Camera, Image as ImageIcon, Trash2, Hand, Sparkles, LocateFixed, Loader2, ThumbsUp, CloudSun, Sun, CloudRain, Wind, Droplets } from 'lucide-react';
import { mockCarWashes } from './data';
import type { CarWash, CarWashType } from './data';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { supabase } from './supabaseClient';
import type { User } from '@supabase/supabase-js';

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

function LocationPicker({ onLocationSelect, position }: { onLocationSelect: (lat: number, lng: number) => void, position: [number, number] }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  return position ? <Marker position={position} /> : null;
}

type View = 'map' | 'list' | 'b2b' | 'detail';

const WASH_SPECS = {
  bezdotykowa: [
    'Aktywna piana (Turbo)', 'Mycie wstępne (gorąca woda)', 'Mycie zasadnicze (mikroproszek)',
    'Spłukiwanie (woda sieciowa)', 'Woskowanie nanopolimerem / Hydrowosk', 'Nabłyszczanie (Osmoza)',
    'Mycie podwozia (automat)', 'Oprysk felg / Chemia do felg', 'Szczotka z pianą (miękka)', 
    'Usuwanie owadów (specjalny program)', 'Mycie motocykli (uchwyt)', 'Oprysk wstępny (zmiękczanie)',
    'Turbopiana (bardzo gęsta)', 'Program "Stop" (pauza)', 'Stanowisko SUV/Bus/Kamper',
    'Uchwyty na dywaniki (klamry)', 'Oświetlenie nocne LED', 'Zadaszenie stanowisk'
  ],
  reczna: [
    'Mycie ręczne (na dwa wiadra)', 'Mycie detailingowe (pędzelkowanie)', 'Mycie silnika (góra/dół)',
    'Mycie podwozia (podnośnik)', 'Osuszanie ręczne (mikrofibra)', 'Osuszanie sprężonym powietrzem',
    'Glinkowanie karoserii', 'Dekontaminacja (usuwanie smoły/asfaltu)', 'Deironizacja felg (krwawa felga)',
    'Woskowanie ręczne (twardy wosk)', 'Aplikacja wosku na mokro', 'Mycie szyb (odtłuszczanie)',
    'Odkurzanie wnętrza (bardzo dokładne)', 'Czyszczenie kokpitu i plastików', 'Pranie tapicerki (ekstrakcyjne)',
    'Czyszczenie i impregnacja skór', 'Ozonowanie wnętrza (dezynfekcja)', 'Odgrzybianie klimatyzacji',
    'Niewidzialna wycieraczka', 'Dressing opon (efekt mokrej opony)', 'Dressing plastików zewnętrznych',
    'Czyszczenie wnęk (drzwi/klapa/wlew)', 'Usuwanie sierści zwierząt', 'Przygotowanie do sprzedaży',
    'Usuwanie naklejek i reklam', 'Mycie motocykli i quadów'
  ],
  autodetailing: [
    'Korekta lakieru (One Step)', 'Korekta lakieru (Wieloetapowa)', 'Powłoka ceramiczna (lakier/felgi)',
    'Powłoka grafenowa', 'Powłoka elastomerowa', 'Folie ochronne PPF (całe/front)',
    'Zmiana koloru (folia)', 'Dechroming (czarne chromy)', 'Przyciemnianie szyb',
    'Renowacja reflektorów (polerowanie)', 'Renowacja skór (naprawa/malowanie)', 'Pełny detailing wnętrza',
    'Zabezpieczenie dachów kabrioletów', 'Polerowanie szyb (usuwanie rys)', 'Zabezpieczenie antykorozyjne',
    'Usuwanie wgnieceń (PDR)', 'Zaprawki lakiernicze', 'Czyszczenie silnika (detailing)',
    'Powłoka hydrofobowa na felgi', 'Zabezpieczenie felg (wosk/ceramika)'
  ]
};

const GLOBAL_SPECS = {
  payment: [
    'Gotówka (monety)', 'Gotówka (banknoty)', 'Karta płatnicza (terminal)',
    'Płatność zbliżeniowa (telefon)', 'Blik', 'Aplikacja mobilna (Beem/mPay)',
    'Żeton myjni', 'Karta przedpłacona / lojalnościowa', 'Faktura VAT (automat)',
    'Abonament dla firm', 'Przelew (B2B)'
  ],
  equipment: [
    'Odkurzacz (mocny)', 'Kompresor do kół (powietrze)', 'Kompresor do wody (szczeliny)',
    'Rozmieniarka pieniędzy', 'Automat do kawy / napojów', 'Automat z przekąskami',
    'Sklep z kosmetykami', 'Myjka do dywaników (automat)', 'Stół do trzepania dywaników',
    'Toaleta dla klientów', 'Wi-Fi dla klientów', 'Poczekalnia z klimatyzacją',
    'Wiadro z ciepłą wodą', 'Stanowisko do suszenia (dach)', 'Monitoring 24h',
    'Paczkomat na terenie', 'Ładowarka EV (elektryki)'
  ],
  hours: [
    '24/7 (Całodobowo)', 'Pon-Pt: 8:00-20:00', 'Pon-Sob: 9:00-18:00',
    'Codziennie: 7:00-22:00', 'Wymagana rezerwacja', 'Tylko przy dobrej pogodzie'
  ]
};

function AddWashForm({ onCancel, onSuccess, initialData, userEmail }: { onCancel: () => void, onSuccess: (wash: any) => void, initialData?: any, userEmail?: string }) {
  const [formData, setFormData] = useState(initialData || {
    name: '',
    address: '',
    type: 'bezdotykowa' as CarWashType,
    lat: 52.2297,
    lng: 21.0122,
    services: [] as string[],
    payment: [] as string[],
    equipment: [] as string[],
    openingHours: {
      is24h: true,
      weekday: { open: '08:00', close: '20:00', closed: false },
      saturday: { open: '08:00', close: '18:00', closed: false },
      sunday: { open: '10:00', close: '16:00', closed: true }
    },
    phone: '',
    isPhoneVisible: true,
    description: '',
    images: [] as string[]
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData((prev: any) => ({
            ...prev,
            images: [...prev.images, reader.result as string]
          }));
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      images: prev.images.filter((_: any, i: number) => i !== index)
    }));
  };
  const [loading, setLoading] = useState(false);

  const toggleItem = (field: 'services' | 'payment' | 'equipment', item: string) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: prev[field].includes(item)
        ? prev[field].filter((s: string) => s !== item)
        : [...prev[field], item]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let hoursParts: string[] = [];
    if (formData.openingHours.is24h) {
      hoursParts.push('24/7 (Całodobowo)');
    } else {
      const { weekday, saturday, sunday } = formData.openingHours;
      if (weekday && !weekday.closed) hoursParts.push(`Pon-Pt: ${weekday.open}-${weekday.close}`);
      else if (weekday?.closed) hoursParts.push('Pon-Pt: Zamknięte');
      
      if (saturday && !saturday.closed) hoursParts.push(`Sob: ${saturday.open}-${saturday.close}`);
      else if (saturday?.closed) hoursParts.push('Sob: Zamknięte');
      
      if (sunday && !sunday.closed) hoursParts.push(`Ndz: ${sunday.open}-${sunday.close}`);
      else if (sunday?.closed) hoursParts.push('Ndz: Zamknięte');
    }
    const hoursText = hoursParts.length > 0 ? hoursParts.join(' | ') : 'Brak danych';
    
    const newSubmission = {
      ...formData,
      hours: hoursText,
      id: initialData ? initialData.id : Math.random().toString(36).substr(2, 9),
      ownerEmail: initialData ? initialData.ownerEmail : userEmail,
      likes: initialData ? initialData.likes : 0,
      isQueue: initialData ? initialData.isQueue : false,
      queueStatus: initialData ? initialData.queueStatus : 'brak',
      isMachineWorking: initialData ? initialData.isMachineWorking : true,
      hasActiveFoam: formData.services.some((s: string) => s.toLowerCase().includes('aktywna piana')),
      isPromoted: initialData ? initialData.isPromoted : false,
      status: 'pending' as 'pending' | 'approved',
      isEdit: !!initialData
    };

    setTimeout(() => {
      onSuccess(newSubmission);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300 pb-10">
      <div className="flex items-center gap-3 border-b border-gold/20 pb-4">
        <button onClick={onCancel} className="text-gray-500 hover:text-white"><Navigation className="w-6 h-6 rotate-180" /></button>
        <h2 className="text-xl font-black text-gold uppercase italic tracking-tighter">
          {initialData ? 'Edytuj Punkt' : 'Nowa Myjnia'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          {/* Podstawowe dane */}
          <div className="space-y-4 bg-zinc-900/50 p-4 rounded-3xl border border-white/5">
            <h3 className="text-[10px] font-black text-gold uppercase tracking-[0.2em] mb-2 flex items-center gap-2"><Info className="w-3 h-3" /> Podstawowe dane</h3>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Nazwa Myjni</label>
              <input 
                required
                className="w-full bg-black border-2 border-zinc-800 rounded-2xl py-3 px-4 text-white focus:border-gold outline-none text-sm"
                placeholder="np. Golden Wash Premium"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Adres</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input 
                  required
                  className="w-full bg-black border-2 border-zinc-800 rounded-2xl py-3 pl-10 pr-4 text-white focus:border-gold outline-none text-sm"
                  placeholder="ul. Złota 44, Warszawa"
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Lokalizacja na mapie</label>
              <div className="h-48 rounded-2xl overflow-hidden border-2 border-zinc-800 relative group">
                <MapContainer center={[formData.lat, formData.lng]} zoom={13} className="h-full w-full" zoomControl={false}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <LocationPicker 
                    position={[formData.lat, formData.lng]} 
                    onLocationSelect={(lat, lng) => setFormData({...formData, lat, lng})} 
                  />
                  <MapUpdater center={[formData.lat, formData.lng]} />
                </MapContainer>
                <div className="absolute top-2 right-2 z-[1000] bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-[7px] text-gold font-black uppercase">Kliknij aby ustawić</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="bg-black/40 p-2 rounded-xl border border-white/5 flex flex-col">
                  <span className="text-[7px] text-gray-500 font-black uppercase tracking-widest">Szerokość (Lat)</span>
                  <span className="text-[10px] text-white font-mono">{formData.lat.toFixed(6)}</span>
                </div>
                <div className="bg-black/40 p-2 rounded-xl border border-white/5 flex flex-col">
                  <span className="text-[7px] text-gray-500 font-black uppercase tracking-widest">Długość (Lng)</span>
                  <span className="text-[10px] text-white font-mono">{formData.lng.toFixed(6)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Typ Usługi</label>
              <div className="grid grid-cols-3 gap-2">
                {(['bezdotykowa', 'reczna', 'autodetailing'] as CarWashType[]).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setFormData({...formData, type: t, services: []})}
                    className={cn(
                      "py-2 rounded-xl text-[8px] font-black uppercase transition-all border-2",
                      formData.type === t ? "bg-luxury-gold text-black border-gold" : "bg-black text-gray-500 border-zinc-800"
                    )}
                  >
                    {t === 'reczna' ? 'Ręczna' : t === 'bezdotykowa' ? 'Bezdotyk.' : 'Detailing'}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Numer Telefonu</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input 
                    className="w-full bg-black border-2 border-zinc-800 rounded-2xl py-3 pl-10 pr-4 text-white focus:border-gold outline-none text-sm"
                    placeholder="+48 000 000 000"
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, isPhoneVisible: !formData.isPhoneVisible})}
                  className={cn(
                    "px-4 rounded-2xl border-2 transition-all flex items-center gap-2 text-[8px] font-black uppercase",
                    formData.isPhoneVisible ? "bg-gold/20 border-gold text-gold" : "bg-zinc-900 border-zinc-800 text-gray-500"
                  )}
                >
                  {formData.isPhoneVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  {formData.isPhoneVisible ? 'Widoczny' : 'Ukryty'}
                </button>
              </div>
            </div>
          </div>

          {/* Godziny działania */}
          <div className="space-y-4 bg-zinc-900/50 p-4 rounded-3xl border border-white/5">
            <h3 className="text-[10px] font-black text-gold uppercase tracking-[0.2em] mb-2 flex items-center gap-2"><Clock className="w-3 h-3" /> Godziny działania</h3>
            
            <div className="flex items-center justify-between mb-4 bg-black/40 p-3 rounded-2xl border border-white/5">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Całodobowo (24/7)</span>
              <button
                type="button"
                onClick={() => setFormData((prev: any) => ({ ...prev, openingHours: { ...prev.openingHours, is24h: !prev.openingHours.is24h } }))}
                className={cn(
                  "w-12 h-6 rounded-full transition-all relative border-2",
                  formData.openingHours.is24h ? "bg-gold border-gold" : "bg-zinc-800 border-zinc-700"
                )}
              >
                <div className={cn(
                  "absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full transition-all shadow-sm",
                  formData.openingHours.is24h ? "right-1" : "left-1"
                )} />
              </button>
            </div>

            {!formData.openingHours.is24h && (
              <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                {/* Pon-Pt */}
                <div className="p-3 bg-black/40 rounded-2xl border border-white/5 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Poniedziałek - Piątek</span>
                    <button
                      type="button"
                      onClick={() => setFormData((prev: any) => ({ ...prev, openingHours: { ...prev.openingHours, weekday: { ...prev.openingHours.weekday!, closed: !prev.openingHours.weekday!.closed } } }))}
                      className={cn("text-[8px] font-black uppercase px-2 py-1 rounded-md border", formData.openingHours.weekday?.closed ? "bg-rose-900/20 border-rose-500 text-rose-500" : "bg-emerald-900/20 border-emerald-500 text-emerald-500")}
                    >
                      {formData.openingHours.weekday?.closed ? 'Zamknięte' : 'Otwarte'}
                    </button>
                  </div>
                  {!formData.openingHours.weekday?.closed && (
                    <div className="grid grid-cols-2 gap-4">
                      <input type="time" className="bg-black border border-zinc-800 rounded-xl py-2 px-3 text-white text-xs" value={formData.openingHours.weekday?.open} onChange={e => setFormData((prev: any) => ({ ...prev, openingHours: { ...prev.openingHours, weekday: { ...prev.openingHours.weekday!, open: e.target.value } } }))} />
                      <input type="time" className="bg-black border border-zinc-800 rounded-xl py-2 px-3 text-white text-xs" value={formData.openingHours.weekday?.close} onChange={e => setFormData((prev: any) => ({ ...prev, openingHours: { ...prev.openingHours, weekday: { ...prev.openingHours.weekday!, close: e.target.value } } }))} />
                    </div>
                  )}
                </div>

                {/* Sobota */}
                <div className="p-3 bg-black/40 rounded-2xl border border-white/5 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sobota</span>
                    <button
                      type="button"
                      onClick={() => setFormData((prev: any) => ({ ...prev, openingHours: { ...prev.openingHours, saturday: { ...prev.openingHours.saturday!, closed: !prev.openingHours.saturday!.closed } } }))}
                      className={cn("text-[8px] font-black uppercase px-2 py-1 rounded-md border", formData.openingHours.saturday?.closed ? "bg-rose-900/20 border-rose-500 text-rose-500" : "bg-emerald-900/20 border-emerald-500 text-emerald-500")}
                    >
                      {formData.openingHours.saturday?.closed ? 'Zamknięte' : 'Otwarte'}
                    </button>
                  </div>
                  {!formData.openingHours.saturday?.closed && (
                    <div className="grid grid-cols-2 gap-4">
                      <input type="time" className="bg-black border border-zinc-800 rounded-xl py-2 px-3 text-white text-xs" value={formData.openingHours.saturday?.open} onChange={e => setFormData((prev: any) => ({ ...prev, openingHours: { ...prev.openingHours, saturday: { ...prev.openingHours.saturday!, open: e.target.value } } }))} />
                      <input type="time" className="bg-black border border-zinc-800 rounded-xl py-2 px-3 text-white text-xs" value={formData.openingHours.saturday?.close} onChange={e => setFormData((prev: any) => ({ ...prev, openingHours: { ...prev.openingHours, saturday: { ...prev.openingHours.saturday!, close: e.target.value } } }))} />
                    </div>
                  )}
                </div>

                {/* Niedziela */}
                <div className="p-3 bg-black/40 rounded-2xl border border-white/5 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Niedziela</span>
                    <button
                      type="button"
                      onClick={() => setFormData((prev: any) => ({ ...prev, openingHours: { ...prev.openingHours, sunday: { ...prev.openingHours.sunday!, closed: !prev.openingHours.sunday!.closed } } }))}
                      className={cn("text-[8px] font-black uppercase px-2 py-1 rounded-md border", formData.openingHours.sunday?.closed ? "bg-rose-900/20 border-rose-500 text-rose-500" : "bg-emerald-900/20 border-emerald-500 text-emerald-500")}
                    >
                      {formData.openingHours.sunday?.closed ? 'Zamknięte' : 'Otwarte'}
                    </button>
                  </div>
                  {!formData.openingHours.sunday?.closed && (
                    <div className="grid grid-cols-2 gap-4">
                      <input type="time" className="bg-black border border-zinc-800 rounded-xl py-2 px-3 text-white text-xs" value={formData.openingHours.sunday?.open} onChange={e => setFormData((prev: any) => ({ ...prev, openingHours: { ...prev.openingHours, sunday: { ...prev.openingHours.sunday!, open: e.target.value } } }))} />
                      <input type="time" className="bg-black border border-zinc-800 rounded-xl py-2 px-3 text-white text-xs" value={formData.openingHours.sunday?.close} onChange={e => setFormData((prev: any) => ({ ...prev, openingHours: { ...prev.openingHours, sunday: { ...prev.openingHours.sunday!, close: e.target.value } } }))} />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Płatność */}
          <div className="space-y-4 bg-zinc-900/50 p-4 rounded-3xl border border-white/5">
            <h3 className="text-[10px] font-black text-gold uppercase tracking-[0.2em] mb-2 flex items-center gap-2"><CreditCard className="w-3 h-3" /> Płatność</h3>
            <div className="grid grid-cols-2 gap-2">
              {GLOBAL_SPECS.payment.map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => toggleItem('payment', p)}
                  className={cn(
                    "px-2 py-2 rounded-xl text-[8px] font-black uppercase transition-all border-2 text-left",
                    formData.payment.includes(p) ? "bg-gold/20 text-white border-gold" : "bg-black text-gray-500 border-zinc-800"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Wyposażenie */}
          <div className="space-y-4 bg-zinc-900/50 p-4 rounded-3xl border border-white/5">
            <h3 className="text-[10px] font-black text-gold uppercase tracking-[0.2em] mb-2 flex items-center gap-2"><Settings className="w-3 h-3" /> Wyposażenie</h3>
            <div className="grid grid-cols-2 gap-2">
              {GLOBAL_SPECS.equipment.map(e => (
                <button
                  key={e}
                  type="button"
                  onClick={() => toggleItem('equipment', e)}
                  className={cn(
                    "px-2 py-2 rounded-xl text-[8px] font-black uppercase transition-all border-2 text-left",
                    formData.equipment.includes(e) ? "bg-gold/20 text-white border-gold" : "bg-black text-gray-500 border-zinc-800"
                  )}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Usługi specyficzne */}
          <div className="space-y-4 bg-zinc-900/50 p-4 rounded-3xl border border-white/5">
            <h3 className="text-[10px] font-black text-gold uppercase tracking-[0.2em] mb-2 flex items-center gap-2"><Plus className="w-3 h-3" /> Usługi {formData.type}</h3>
            <div className="grid grid-cols-2 gap-2">
              {WASH_SPECS[formData.type as keyof typeof WASH_SPECS].map((service: string) => (
                <button
                  key={service}
                  type="button"
                  onClick={() => toggleItem('services', service)}
                  className={cn(
                    "flex items-center justify-between p-2 rounded-xl border-2 transition-all text-left",
                    formData.services.includes(service) ? "bg-gold/10 border-gold text-white" : "bg-black/50 border-zinc-800 text-gray-500"
                  )}
                >
                  <span className="text-[9px] font-bold leading-tight">{service}</span>
                  {formData.services.includes(service) && <CheckCircle2 className="w-3 h-3 text-gold flex-shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {/* Zdjęcia */}
          <div className="space-y-4 bg-zinc-900/50 p-4 rounded-3xl border border-white/5">
            <h3 className="text-[10px] font-black text-gold uppercase tracking-[0.2em] mb-2 flex items-center gap-2"><Camera className="w-3 h-3" /> Zdjęcia punktu</h3>
            <div className="grid grid-cols-4 gap-2">
              {formData.images.map((img: string, idx: number) => (
                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-white/10 group">
                  <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {formData.images.length < 8 && (
                <label className="aspect-square rounded-xl border-2 border-dashed border-zinc-800 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-gold transition-colors text-gray-500 hover:text-gold bg-black/20">
                  <Camera className="w-5 h-5" />
                  <span className="text-[8px] font-black uppercase tracking-widest">Dodaj</span>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                </label>
              )}
            </div>
            <p className="text-[8px] text-gray-500 uppercase font-black ml-1">Maksymalnie 8 zdjęć. Pierwsze będzie zdjęciem głównym.</p>
          </div>

          {/* Opis dodatkowy */}
          <div className="space-y-4 bg-zinc-900/50 p-4 rounded-3xl border border-white/5">
            <h3 className="text-[10px] font-black text-gold uppercase tracking-[0.2em] mb-2 flex items-center gap-2"><FileText className="w-3 h-3" /> Opis / Dodatkowe info</h3>
            <textarea 
              className="w-full bg-black border-2 border-zinc-800 rounded-2xl py-3 px-4 text-white focus:border-gold outline-none text-sm min-h-[100px] resize-none"
              placeholder="Tutaj możesz dopisać wszystko co ważne..."
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>
        </div>

        <button 
          disabled={loading}
          type="submit"
          className="w-full py-4 bg-luxury-gold text-black rounded-2xl font-black text-lg shadow-lg hover:scale-[1.02] active:scale-95 transition-all uppercase italic tracking-widest"
        >
          {loading ? 'Zapisywanie...' : 'Wyślij do akceptacji'}
        </button>
      </form>
    </div>
  );
}

function AuthUI() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'login' | 'register'>('login');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('Sprawdź e-mail, aby potwierdzić rejestrację!');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 py-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-2">
        <div className="bg-luxury-gold w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-gold/20">
          <LogIn className="w-8 h-8 text-black" />
        </div>
        <h2 className="text-2xl font-black text-gold uppercase italic tracking-tighter">
          {mode === 'login' ? 'Zaloguj się' : 'Dołącz do sieci'}
        </h2>
        <p className="text-gray-400 text-xs uppercase tracking-widest">Strefa Właściciela</p>
      </div>

      <form onSubmit={handleAuth} className="space-y-4">
        <div className="space-y-1">
          <label className="text-[10px] font-black text-gold uppercase tracking-widest ml-1">E-mail</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-900 border-2 border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-gold outline-none transition-all font-medium"
              placeholder="twoj@email.pl"
              required
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black text-gold uppercase tracking-widest ml-1">Hasło</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-900 border-2 border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-gold outline-none transition-all font-medium"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-950/30 border border-rose-900 rounded-xl flex items-center gap-2 text-rose-500 text-xs font-bold animate-shake">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        <button 
          type="submit" 
          disabled={loading}
          className="w-full py-4 bg-luxury-gold text-black rounded-2xl font-black text-lg shadow-lg shadow-gold/20 hover:scale-[1.02] active:scale-95 uppercase italic tracking-widest transition-all disabled:opacity-50"
        >
          {loading ? 'Przetwarzanie...' : mode === 'login' ? 'Wejdź do panelu' : 'Zarejestruj myjnię'}
        </button>
      </form>

      <div className="text-center">
        <button 
          onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
          className="text-gray-500 text-xs font-bold uppercase tracking-widest hover:text-gold transition-colors"
        >
          {mode === 'login' ? 'Nie masz konta? Zarejestruj się' : 'Masz już konto? Zaloguj się'}
        </button>
      </div>
    </div>
  );
}

function Onboarding({ onComplete }: { onCancel?: () => void, onComplete: () => void }) {
  const [step, setStep] = useState(0);
  
  const steps = [
    {
      title: "Witaj w AutoSpa",
      desc: "Ekskluzywna platforma łącząca pasjonatów motoryzacji z najlepszymi punktami pielęgnacji pojazdów w Twojej okolicy.",
      icon: <Sparkles className="w-12 h-12 text-gold" />,
      features: ["Selekcja punktów Premium", "Precyzyjna lokalizacja", "Intuicyjny interfejs"]
    },
    {
      title: "Kolejki pod kontrolą",
      desc: "Oszczędzaj czas dzięki autorskiemu systemowi raportowania kolejek. Dane są weryfikowane przez społeczność w oparciu o sygnał GPS.",
      icon: <Clock className="w-12 h-12 text-gold" />,
      features: ["Statusy w czasie rzeczywistym", "Weryfikacja geofencingiem", "Raporty od kierowców"]
    },
    {
      title: "Inteligentne Filtrowanie",
      desc: "Znajdź punkt idealnie dopasowany do Twoich potrzeb. Filtruj według konkretnych usług, metod płatności czy udogodnień.",
      icon: <Filter className="w-12 h-12 text-gold" />,
      features: ["Szczegółowa oferta usług", "Wszystkie metody płatności", "Wyposażenie dodatkowe"]
    },
    {
      title: "Partnerstwo Biznesowe",
      desc: "Jesteś właścicielem? Zarządzaj swoją ofertą z poziomu chmury, analizuj statystyki zasięgu i buduj prestiż swojego punktu.",
      icon: <Store className="w-12 h-12 text-gold" />,
      features: ["Pełna edycja profilu", "Analityka ruchu i kliknięć", "Wyróżnienia na mapie"]
    }
  ];

  return (
    <div className="fixed inset-0 z-[5000] bg-black flex flex-col items-center justify-center p-6 text-center overflow-hidden">
      <div className="absolute inset-0 bg-gold-gradient opacity-10" />
      
      <div className="relative z-10 w-full max-w-sm space-y-12">
        <div className="animate-in fade-in zoom-in duration-700 flex flex-col items-center">
          <div className="bg-zinc-900 p-6 rounded-[2.5rem] border border-gold/30 shadow-2xl shadow-gold/10 mb-8 transform rotate-3">
            {steps[step].icon}
          </div>
          <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-4 leading-none">
            {steps[step].title.split(' ')[0]} <span className="text-gold">{steps[step].title.split(' ')[1]}</span>
          </h2>
          <p className="text-gray-400 text-sm font-medium px-4 leading-relaxed">
            {steps[step].desc}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 px-4">
          {steps[step].features.map((f, i) => (
            <div key={i} className="flex items-center gap-3 bg-zinc-900/50 p-3 rounded-2xl border border-white/5 animate-in slide-in-from-left duration-500" style={{ animationDelay: `${i * 100}ms` }}>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">{f}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-4 px-4 pt-8">
          <button 
            onClick={() => step < steps.length - 1 ? setStep(s => s + 1) : onComplete()}
            className="w-full py-5 bg-luxury-gold text-black font-black uppercase italic rounded-2xl shadow-2xl shadow-gold/20 active:scale-95 transition-all"
          >
            {step < steps.length - 1 ? 'Dalej' : 'Zaczynamy!'}
          </button>
          
          <div className="flex justify-center gap-2">
            {steps.map((_, i) => (
              <div key={i} className={cn("h-1 rounded-full transition-all duration-500", i === step ? "w-8 bg-gold" : "w-2 bg-zinc-800")} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminLoginModal({ onLogin, onCancel }: { onLogin: () => void, onCancel: () => void }) {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login === '123' && password === '321') {
      onLogin();
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[9999] flex items-center justify-center p-6">
      <div className="bg-zinc-900 border-2 border-gold/50 w-full max-w-xs p-8 rounded-[2rem] shadow-[0_0_50px_rgba(212,175,55,0.2)] space-y-6">
        <div className="text-center space-y-2">
          <ShieldCheck className="w-12 h-12 text-gold mx-auto" />
          <h2 className="text-xl font-black text-gold uppercase italic">Panel Admina</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="text" placeholder="Login" value={login} onChange={e => setLogin(e.target.value)}
            className="w-full bg-black border border-zinc-800 p-3 rounded-xl text-white text-center outline-none focus:border-gold"
          />
          <input 
            type="password" placeholder="Hasło" value={password} onChange={e => setPassword(e.target.value)}
            className="w-full bg-black border border-zinc-800 p-3 rounded-xl text-white text-center outline-none focus:border-gold"
          />
          {error && <p className="text-rose-500 text-[10px] text-center font-bold uppercase">Błędne dane!</p>}
          <button className="w-full py-3 bg-gold text-black font-black uppercase italic rounded-xl active:scale-95 transition-all">Wejdź</button>
          <button type="button" onClick={onCancel} className="w-full text-zinc-500 text-[10px] uppercase font-bold">Anuluj</button>
        </form>
      </div>
    </div>
  );
}

function AdminPanel({ submissions, onAccept, onReject, onUpdate, onBack }: { submissions: any[], onAccept: (id: string) => void, onReject: (id: string) => void, onUpdate: (updatedWash: any) => void, onBack: () => void }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>(null);

  const startEdit = (sub: any) => {
    setEditingId(sub.id);
    setEditData({ ...sub });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(editData);
    setEditingId(null);
    setEditData(null);
  };

  const toggleItem = (field: 'services' | 'payment' | 'equipment', item: string) => {
    setEditData((prev: any) => ({
      ...prev,
      [field]: prev[field].includes(item)
        ? prev[field].filter((s: string) => s !== item)
        : [...prev[field], item]
    }));
  };

  const handleEditImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setEditData((prev: any) => ({
            ...prev,
            images: [...(prev.images || []), reader.result as string]
          }));
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeEditImage = (index: number) => {
    setEditData((prev: any) => ({
      ...prev,
      images: prev.images.filter((_: any, i: number) => i !== index)
    }));
  };

  return (
    <div className="space-y-6 py-4 animate-in fade-in duration-500 h-full flex flex-col">
      <div className="flex items-center justify-between border-b border-gold/20 pb-4 shrink-0">
        <h2 className="text-2xl font-black text-gold uppercase italic tracking-tighter">
          {editingId ? 'Edycja Punktu' : 'Zarządzanie'}
        </h2>
        <button onClick={onBack} className="p-2 bg-zinc-900 rounded-xl text-gray-500 hover:text-white transition-colors"><XCircle className="w-6 h-6" /></button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-20">
        {editingId && editData ? (
          <form onSubmit={handleSaveEdit} className="bg-zinc-900/50 border-2 border-gold/30 p-6 rounded-[2.5rem] space-y-8 animate-in slide-in-from-bottom-4 duration-300">
            <div className="space-y-6">
              {/* Sekcja: Podstawowe info */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-gold uppercase tracking-[0.2em] flex items-center gap-2 opacity-70">
                  <Info className="w-3 h-3" /> Dane podstawowe
                </h3>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Nazwa</label>
                  <input 
                    className="w-full bg-black border-2 border-zinc-800 rounded-2xl py-3 px-4 text-white focus:border-gold outline-none transition-all"
                    value={editData.name}
                    onChange={e => setEditData({...editData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Adres</label>
                  <input 
                    className="w-full bg-black border-2 border-zinc-800 rounded-2xl py-3 px-4 text-white focus:border-gold outline-none transition-all"
                    value={editData.address}
                    onChange={e => setEditData({...editData, address: e.target.value})}
                  />
                </div>

                <div className="space-y-1 pt-2">
                  <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Pozycja na mapie</label>
                  <div className="h-40 rounded-2xl overflow-hidden border-2 border-zinc-800 relative">
                    <MapContainer center={[editData.lat || 52.2297, editData.lng || 21.0122]} zoom={13} className="h-full w-full" zoomControl={false}>
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <LocationPicker 
                        position={[editData.lat || 52.2297, editData.lng || 21.0122]} 
                        onLocationSelect={(lat, lng) => setEditData({...editData, lat, lng})} 
                      />
                      <MapUpdater center={[editData.lat || 52.2297, editData.lng || 21.0122]} />
                    </MapContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="bg-black/40 p-2 rounded-xl border border-white/5 flex flex-col">
                      <span className="text-[7px] text-gray-500 font-black uppercase">Lat</span>
                      <span className="text-[9px] text-gold font-mono">{(editData.lat || 0).toFixed(6)}</span>
                    </div>
                    <div className="bg-black/40 p-2 rounded-xl border border-white/5 flex flex-col">
                      <span className="text-[7px] text-gray-500 font-black uppercase">Lng</span>
                      <span className="text-[9px] text-gold font-mono">{(editData.lng || 0).toFixed(6)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sekcja: Kontakt */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                <h3 className="text-[10px] font-black text-gold uppercase tracking-[0.2em] flex items-center gap-2 opacity-70">
                  <Phone className="w-3 h-3" /> Kontakt i Prywatność
                </h3>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <input 
                      className="w-full bg-black border-2 border-zinc-800 rounded-2xl py-3 px-4 text-white focus:border-gold outline-none transition-all"
                      value={editData.phone || ''}
                      placeholder="Numer telefonu"
                      onChange={e => setEditData({...editData, phone: e.target.value})}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditData({...editData, isPhoneVisible: !editData.isPhoneVisible})}
                    className={cn(
                      "px-4 rounded-2xl border-2 transition-all flex items-center gap-2 text-[8px] font-black uppercase",
                      editData.isPhoneVisible ? "bg-gold border-gold text-black" : "bg-zinc-900 border-zinc-800 text-gray-500"
                    )}
                  >
                    {editData.isPhoneVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    {editData.isPhoneVisible ? 'Widoczny' : 'Ukryty'}
                  </button>
                </div>
              </div>

              {/* Sekcja: Godziny */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                <h3 className="text-[10px] font-black text-gold uppercase tracking-[0.2em] flex items-center gap-2 opacity-70">
                  <Clock className="w-3 h-3" /> Harmonogram pracy
                </h3>
                <div className="flex items-center justify-between bg-black/40 p-3 rounded-2xl border border-white/5">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Całodobowo (24/7)</span>
                  <button
                    type="button"
                    onClick={() => setEditData((prev: any) => ({ ...prev, openingHours: { ...(prev.openingHours || { weekday: { open: '08:00', close: '20:00', closed: false }, saturday: { open: '08:00', close: '18:00', closed: false }, sunday: { open: '10:00', close: '16:00', closed: true } }), is24h: !prev.openingHours?.is24h } }))}
                    className={cn(
                      "w-12 h-6 rounded-full transition-all relative border-2",
                      editData.openingHours?.is24h ? "bg-gold border-gold" : "bg-zinc-800 border-zinc-700"
                    )}
                  >
                    <div className={cn(
                      "absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full transition-all",
                      editData.openingHours?.is24h ? "right-1" : "left-1"
                    )} />
                  </button>
                </div>

                {!editData.openingHours?.is24h && (
                  <div className="space-y-3">
                    {[
                      { id: 'weekday', label: 'Pon-Pt' },
                      { id: 'saturday', label: 'Sobota' },
                      { id: 'sunday', label: 'Niedziela' }
                    ].map(day => (
                      <div key={day.id} className="p-3 bg-black/40 rounded-2xl border border-white/5 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{day.label}</span>
                          <button
                            type="button"
                            onClick={() => setEditData({ ...editData, openingHours: { ...editData.openingHours, [day.id]: { ...(editData.openingHours[day.id] || {}), closed: !editData.openingHours[day.id]?.closed } } })}
                            className={cn("text-[7px] font-black uppercase px-2 py-1 rounded-lg border", editData.openingHours?.[day.id]?.closed ? "border-rose-500 text-rose-500 bg-rose-500/10" : "border-emerald-500 text-emerald-500 bg-emerald-500/10")}
                          >
                            {editData.openingHours?.[day.id]?.closed ? 'Zamknięte' : 'Otwarte'}
                          </button>
                        </div>
                        {!editData.openingHours?.[day.id]?.closed && (
                          <div className="grid grid-cols-2 gap-3">
                            <input type="time" className="bg-black border-2 border-zinc-800 rounded-xl py-2 px-3 text-white text-xs outline-none focus:border-gold" value={editData.openingHours?.[day.id]?.open || '08:00'} onChange={e => setEditData({ ...editData, openingHours: { ...editData.openingHours, [day.id]: { ...editData.openingHours[day.id], open: e.target.value } } })} />
                            <input type="time" className="bg-black border-2 border-zinc-800 rounded-xl py-2 px-3 text-white text-xs outline-none focus:border-gold" value={editData.openingHours?.[day.id]?.close || '20:00'} onChange={e => setEditData({ ...editData, openingHours: { ...editData.openingHours, [day.id]: { ...editData.openingHours[day.id], close: e.target.value } } })} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Sekcja: Płatności i Wyposażenie */}
              <div className="grid grid-cols-1 gap-6 pt-4 border-t border-white/5">
                <div className="space-y-3">
                  <h3 className="text-[10px] font-black text-gold uppercase tracking-[0.2em] flex items-center gap-2 opacity-70">
                    <CreditCard className="w-3 h-3" /> Płatności
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {GLOBAL_SPECS.payment.map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => toggleItem('payment', p)}
                        className={cn(
                          "px-3 py-1.5 rounded-xl text-[8px] font-black uppercase border-2 transition-all",
                          editData.payment?.includes(p) ? "bg-gold border-gold text-black" : "bg-black text-gray-500 border-zinc-800"
                        )}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-[10px] font-black text-gold uppercase tracking-[0.2em] flex items-center gap-2 opacity-70">
                    <Settings className="w-3 h-3" /> Wyposażenie
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {GLOBAL_SPECS.equipment.map(e => (
                      <button
                        key={e}
                        type="button"
                        onClick={() => toggleItem('equipment', e)}
                        className={cn(
                          "px-3 py-1.5 rounded-xl text-[8px] font-black uppercase border-2 transition-all",
                          editData.equipment?.includes(e) ? "bg-gold border-gold text-black" : "bg-black text-gray-500 border-zinc-800"
                        )}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sekcja: Usługi */}
              <div className="space-y-3 pt-4 border-t border-white/5">
                <h3 className="text-[10px] font-black text-gold uppercase tracking-[0.2em] flex items-center gap-2 opacity-70">
                  <Plus className="w-3 h-3" /> Usługi {editData.type}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {WASH_SPECS[editData.type as CarWashType].map((service: string) => (
                    <button
                      key={service}
                      type="button"
                      onClick={() => toggleItem('services', service)}
                      className={cn(
                        "px-3 py-1.5 rounded-xl font-bold text-[8px] uppercase transition-all border-2",
                        editData.services.includes(service) ? "bg-gold border-gold text-black" : "bg-black text-gray-500 border-zinc-800"
                      )}
                    >
                      {service}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sekcja: Zdjęcia */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                <h3 className="text-[10px] font-black text-gold uppercase tracking-[0.2em] flex items-center gap-2 opacity-70">
                  <Camera className="w-3 h-3" /> Zdjęcia punktu
                </h3>
                <div className="grid grid-cols-4 gap-2">
                  {(editData.images || []).map((img: string, idx: number) => (
                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-white/10 group">
                      <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                      <button 
                        type="button"
                        onClick={() => removeEditImage(idx)}
                        className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {(editData.images || []).length < 8 && (
                    <label className="aspect-square rounded-xl border-2 border-dashed border-zinc-800 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-gold transition-colors text-gray-500 hover:text-gold bg-black/20">
                      <Camera className="w-5 h-5" />
                      <span className="text-[8px] font-black uppercase tracking-widest">Dodaj</span>
                      <input type="file" accept="image/*" multiple className="hidden" onChange={handleEditImageUpload} />
                    </label>
                  )}
                </div>
              </div>

              {/* Sekcja: Opis */}
              <div className="space-y-3 pt-4 border-t border-white/5">
                <h3 className="text-[10px] font-black text-gold uppercase tracking-[0.2em] flex items-center gap-2 opacity-70">
                  <FileText className="w-3 h-3" /> Opis dodatkowy
                </h3>
                <textarea 
                  className="w-full bg-black border-2 border-zinc-800 rounded-2xl py-4 px-4 text-white focus:border-gold outline-none text-xs min-h-[120px] resize-none"
                  value={editData.description}
                  onChange={e => setEditData({...editData, description: e.target.value})}
                />
              </div>
            </div>

            {/* Przyciski akcji (Fixed na dole formsa) */}
            <div className="flex gap-3 pt-6">
              <button type="submit" className="flex-1 py-4 bg-luxury-gold text-black font-black uppercase italic rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-gold/20 hover:scale-[1.02] active:scale-95 transition-all">
                <Save className="w-5 h-5" /> Zapisz zmiany
              </button>
              <button type="button" onClick={() => { setEditingId(null); setEditData(null); }} className="flex-1 py-4 bg-zinc-800 text-white font-black uppercase italic rounded-2xl hover:bg-zinc-700 transition-all">
                Anuluj
              </button>
            </div>
          </form>
        ) : submissions.length === 0 ? (
          <div className="text-center py-20 text-gray-600 italic">Brak nowych zgłoszeń.</div>
        ) : (
          submissions.map(sub => (
            <div key={sub.id} className={cn(
              "bg-zinc-900 border p-4 rounded-2xl space-y-3",
              sub.isEdit ? "border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.1)]" : 
              sub.isPromotionRequest ? "border-gold/50 shadow-[0_0_20px_rgba(212,175,55,0.15)]" : "border-gold/20"
            )}>
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-black text-white uppercase italic">{sub.name}</h3>
                    <span className={cn(
                      "text-[7px] px-1.5 py-0.5 rounded-full font-black uppercase tracking-widest",
                      sub.isEdit ? "bg-blue-500 text-white" : 
                      sub.isPromotionRequest ? "bg-luxury-gold text-black" : "bg-gold text-black"
                    )}>
                      {sub.isEdit ? 'Edycja' : sub.isPromotionRequest ? `Premium (${sub.durationDays} dni)` : 'Nowy'}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-500">{sub.address}</p>
                </div>
                <span className="text-[8px] bg-gold/10 text-gold px-2 py-0.5 rounded-full font-black uppercase">{sub.type}</span>
              </div>

              {sub.isPromotionRequest && (
                <div className="bg-gold/5 p-3 rounded-xl border border-gold/20">
                  <p className="text-[8px] text-gold font-black uppercase tracking-widest mb-1">Tekst Promocyjny:</p>
                  <p className="text-[10px] text-white italic">"{sub.promotionText}"</p>
                </div>
              )}
              
              <div className="flex flex-wrap gap-1">
                {[...(sub.payment || []), ...(sub.equipment || []), ...(sub.services || [])].slice(0, 6).map((s: string) => (
                  <span key={s} className="text-[8px] bg-black text-gray-400 px-2 py-0.5 rounded-md">{s}</span>
                ))}
                {([...(sub.payment || []), ...(sub.equipment || []), ...(sub.services || [])].length > 6) && (
                  <span className="text-[8px] text-gray-600">...</span>
                )}
              </div>

              <div className="flex gap-2 pt-2 border-t border-white/5">
                <button 
                  onClick={() => onAccept(sub.id)}
                  className="flex-1 py-2 bg-emerald-900/50 text-emerald-400 border border-emerald-900 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2 hover:bg-emerald-900"
                >
                  <CheckCircle2 className="w-4 h-4" /> Akceptuj
                </button>
                <button 
                  onClick={() => startEdit(sub)}
                  className="flex-1 py-2 bg-zinc-800 text-gold border border-gold/30 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2 hover:bg-zinc-700"
                >
                  <Edit3 className="w-4 h-4" /> Edytuj
                </button>
                <button 
                  onClick={() => onReject(sub.id)}
                  className="flex-1 py-2 bg-rose-900/50 text-rose-400 border border-rose-900 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2 hover:bg-rose-900"
                >
                  <XCircle className="w-4 h-4" /> Odrzuć
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function PromotionModal({ wash, onCancel, onSuccess }: { wash: CarWash, onCancel: () => void, onSuccess: (submission: any) => void }) {
  const [duration, setDuration] = useState<7 | 30>(7);
  const [promoText, setPromoText] = useState(wash.promotionText || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSuccess({
      ...wash,
      isPromoted: true,
      promotionText: promoText,
      isPromotionRequest: true,
      durationDays: duration,
      status: 'pending'
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3 border-b border-gold/20 pb-4">
        <button onClick={onCancel} className="text-gray-500 hover:text-white">
          <Navigation className="w-6 h-6 rotate-180" />
        </button>
        <div>
          <h2 className="text-xl font-black text-gold uppercase italic tracking-tighter">Wykup Wyróżnienie</h2>
          <p className="text-[10px] text-gray-500 uppercase font-black">{wash.name}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-4">
          <h3 className="text-[10px] font-black text-gold uppercase tracking-[0.2em] flex items-center gap-2 opacity-70">
            <CreditCard className="w-3 h-3" /> Wybierz Pakiet
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setDuration(7)}
              className={cn(
                "p-5 rounded-3xl border-2 transition-all text-center space-y-1",
                duration === 7 ? "bg-gold/10 border-gold shadow-[0_0_20px_rgba(212,175,55,0.1)]" : "bg-zinc-900 border-zinc-800 text-gray-500"
              )}
            >
              <p className={cn("text-lg font-black italic uppercase", duration === 7 ? "text-white" : "text-gray-400")}>7 Dni</p>
              <p className="text-[10px] font-bold opacity-60">Pakiet Startowy</p>
              <p className="text-sm font-black text-gold mt-2">49.00 PLN</p>
            </button>
            <button
              type="button"
              onClick={() => setDuration(30)}
              className={cn(
                "p-5 rounded-3xl border-2 transition-all text-center space-y-1 relative overflow-hidden",
                duration === 30 ? "bg-gold/10 border-gold shadow-[0_0_20px_rgba(212,175,55,0.1)]" : "bg-zinc-900 border-zinc-800 text-gray-500"
              )}
            >
              <div className="absolute top-0 right-0 bg-gold text-black text-[7px] font-black px-2 py-0.5 rounded-bl-lg uppercase tracking-tighter">Polecane</div>
              <p className={cn("text-lg font-black italic uppercase", duration === 30 ? "text-white" : "text-gray-400")}>30 Dni</p>
              <p className="text-[10px] font-bold opacity-60">Pełny Miesiąc</p>
              <p className="text-sm font-black text-gold mt-2">149.00 PLN</p>
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-[10px] font-black text-gold uppercase tracking-[0.2em] flex items-center gap-2 opacity-70">
            <Sparkles className="w-3 h-3" /> Tekst Promocyjny
          </h3>
          <input 
            className="w-full bg-black border-2 border-zinc-800 rounded-2xl py-4 px-4 text-white focus:border-gold outline-none text-xs"
            placeholder="np. -20% na mycie kompletu do końca dnia!"
            value={promoText}
            onChange={e => setPromoText(e.target.value)}
            maxLength={50}
          />
          <p className="text-[8px] text-gray-600 uppercase font-bold tracking-widest text-right">
            {promoText.length} / 50 znaków
          </p>
        </div>

        <div className="bg-zinc-900/50 p-6 rounded-[2.5rem] border border-white/5 space-y-4">
          <h3 className="text-[10px] font-black text-white uppercase tracking-widest italic">Zalety Wyróżnienia</h3>
          <div className="grid grid-cols-1 gap-2">
            {[
              "Złoty, pulsujący marker na mapie",
              "Pierwsze miejsce w wynikach wyszukiwania",
              "Złota ramka i etykieta Premium na liście",
              "Możliwość dodania własnego hasła promocyjnego"
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle2 className="w-3.5 h-3.5 text-gold" />
                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wide">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <button type="submit" className="w-full py-5 bg-luxury-gold text-black font-black uppercase italic rounded-2xl shadow-2xl shadow-gold/30 active:scale-95 transition-all flex items-center justify-center gap-3">
          <CreditCard className="w-5 h-5" /> Zapłać i aktywuj
        </button>
      </form>
    </div>
  );
}

function OwnerAnalytics({ wash, onBack }: { wash: CarWash, onBack: () => void }) {
  const stats = wash.analytics || {
    views: 0,
    navigationClicks: 0,
    phoneClicks: 0,
    last7Days: [0, 0, 0, 0, 0, 0, 0]
  };

  const maxVal = Math.max(...stats.last7Days, 1);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3 border-b border-gold/20 pb-4">
        <button onClick={onBack} className="text-gray-500 hover:text-white">
          <Navigation className="w-6 h-6 rotate-180" />
        </button>
        <div>
          <h2 className="text-xl font-black text-gold uppercase italic tracking-tighter">Statystyki Punktu</h2>
          <p className="text-[10px] text-gray-500 uppercase font-black">{wash.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="bg-zinc-900/50 p-6 rounded-[2.5rem] border border-white/5 space-y-4">
          <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-gold" /> Popularność (7 dni)
          </h3>
          <div className="flex items-end justify-between h-32 gap-2 px-2">
            {stats.last7Days.map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div 
                  className="w-full bg-gold/20 rounded-t-lg border-t border-x border-gold/30 relative group"
                  style={{ height: `${(val / maxVal) * 100}%` }}
                >
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gold text-black text-[8px] font-black px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    {val}
                  </div>
                </div>
                <span className="text-[7px] text-gray-600 font-black uppercase">Dzień {i+1}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-zinc-900/50 p-5 rounded-[2rem] border border-white/5">
            <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-1">Wyświetlenia</p>
            <p className="text-2xl font-black text-white italic">{stats.views.toLocaleString()}</p>
            <div className="mt-2 flex items-center gap-1 text-[8px] text-emerald-500 font-black">
              <Plus className="w-2.5 h-2.5" /> 12% vs ost. tydzień
            </div>
          </div>
          <div className="bg-zinc-900/50 p-5 rounded-[2rem] border border-white/5">
            <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-1">Nawigacje</p>
            <p className="text-2xl font-black text-gold italic">{stats.navigationClicks.toLocaleString()}</p>
            <div className="mt-2 flex items-center gap-1 text-[8px] text-emerald-500 font-black">
              <Plus className="w-2.5 h-2.5" /> 8% vs ost. tydzień
            </div>
          </div>
        </div>

        <div className="bg-gold/5 p-6 rounded-[2.5rem] border border-gold/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] font-black text-white uppercase tracking-widest italic">Konwersja</h3>
            <span className="text-[10px] font-black text-gold">{( (stats.navigationClicks / stats.views) * 100).toFixed(1)}%</span>
          </div>
          <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
            <div 
              className="h-full bg-luxury-gold" 
              style={{ width: `${(stats.navigationClicks / stats.views) * 100}%` }}
            />
          </div>
          <p className="text-[8px] text-gray-500 mt-3 leading-relaxed">
            Ten wskaźnik pokazuje, ilu użytkowników po zobaczeniu Twojego punktu zdecydowało się do niego nawigować.
          </p>
        </div>
      </div>

      <button className="w-full py-4 bg-zinc-900 text-gold border border-gold/50 rounded-2xl font-black uppercase italic tracking-widest shadow-xl hover:bg-zinc-800 transition-all active:scale-95">
        Pobierz raport PDF
      </button>
    </div>
  );
}

function WeatherModal({ onBack, userLocation }: { onBack: () => void, userLocation: [number, number] | null }) {
  const [weatherData, setWeatherData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      const lat = userLocation ? userLocation[0] : 52.2297;
      const lon = userLocation ? userLocation[1] : 21.0122;
      
      try {
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weathercode,temperature_2m_max,precipitation_probability_max&current_weather=true&timezone=auto`);
        const data = await response.json();
        setWeatherData(data);
      } catch (error) {
        console.error("Weather fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [userLocation]);

  const getWeatherIcon = (code: number) => {
    if (code <= 1) return <Sun className="w-6 h-6 text-gold" />;
    if (code <= 3) return <CloudSun className="w-6 h-6 text-gray-400" />;
    if (code >= 51) return <CloudRain className="w-6 h-6 text-blue-400" />;
    return <Sun className="w-6 h-6 text-gold" />;
  };

  const getWeatherDesc = (code: number) => {
    if (code <= 1) return { label: 'Słonecznie', desc: 'Idealne na detailing' };
    if (code <= 3) return { label: 'Zachmurzenie', desc: 'Dobre warunki' };
    if (code >= 51) return { label: 'Opady', desc: 'Odradzamy mycie' };
    return { label: 'Słonecznie', desc: 'Dobre warunki' };
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-gold animate-spin" />
      </div>
    );
  }

  const current = weatherData?.current_weather;
  const daily = weatherData?.daily;
  
  // Simple Wash Index calculation: 100 - (precipitation probability * 1.5)
  const washIndex = Math.max(0, 100 - (daily?.precipitation_probability_max[0] || 0) * 1.5);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3 border-b border-gold/20 pb-4">
        <button onClick={onBack} className="text-gray-500 hover:text-white">
          <Navigation className="w-6 h-6 rotate-180" />
        </button>
        <div>
          <h2 className="text-xl font-black text-gold uppercase italic tracking-tighter">Pogoda na mycie</h2>
          <p className="text-[10px] text-gray-500 uppercase font-black">
            {userLocation ? 'Realne dane dla Twojej lokalizacji' : 'Warszawa (brak GPS)'}
          </p>
        </div>
      </div>

      <div className="bg-gold/5 p-6 rounded-[2.5rem] border border-gold/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Sun className="w-20 h-20 text-gold animate-spin-slow" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-4 bg-gold rounded-3xl shadow-lg shadow-gold/20">
              <Sun className="w-8 h-8 text-black" />
            </div>
            <div>
              <p className="text-4xl font-black text-white italic">{Math.round(washIndex)}<span className="text-lg text-gold ml-1">/100</span></p>
              <p className="text-[10px] text-gold font-black uppercase tracking-widest">
                Wash Index ({washIndex > 70 ? 'Excellent' : washIndex > 40 ? 'Good' : 'Poor'})
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-300 font-medium leading-relaxed">
            {washIndex > 70 
              ? 'Aktualnie panują idealne warunki do pielęgnacji auta. Brak opadów gwarantuje długotrwały efekt.'
              : washIndex > 40
              ? 'Warunki są poprawne, ale istnieje ryzyko lekkich opadów. Rozważ szybkie mycie bez woskowania.'
              : 'Odradzamy kompleksowe mycie. Wysokie prawdopodobieństwo opadów w najbliższym czasie.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-zinc-900/50 p-4 rounded-3xl border border-white/5 flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-xl">
            <Droplets className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest">Szansa opadów</p>
            <p className="text-xs font-black text-white">{daily?.precipitation_probability_max[0]}%</p>
          </div>
        </div>
        <div className="bg-zinc-900/50 p-4 rounded-3xl border border-white/5 flex items-center gap-3">
          <div className="p-2 bg-orange-500/10 rounded-xl">
            <Wind className="w-4 h-4 text-orange-400" />
          </div>
          <div>
            <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest">Wiatr</p>
            <p className="text-xs font-black text-white">{current?.windspeed} km/h</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">Prognoza na najbliższe dni</h3>
        {daily?.time.slice(0, 4).map((time: string, i: number) => {
          const code = daily.weathercode[i];
          const info = getWeatherDesc(code);
          const score = Math.max(0, 100 - daily.precipitation_probability_max[i] * 1.5);
          return (
            <div key={i} className="bg-zinc-900/50 p-4 rounded-2xl border border-white/5 flex items-center justify-between group hover:border-gold/30 transition-all">
              <div className="flex items-center gap-4">
                <span className="w-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  {i === 0 ? 'Dziś' : new Date(time).toLocaleDateString('pl-PL', { weekday: 'short' })}
                </span>
                <div className="p-2 bg-black rounded-xl">
                  {getWeatherIcon(code)}
                </div>
                <div>
                  <p className="text-xs font-black text-white uppercase italic">{info.label}</p>
                  <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">{info.desc}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-gold italic">{Math.round(daily.temperature_2m_max[i])}°C</p>
                <div className="w-16 h-1 bg-black rounded-full mt-1 overflow-hidden">
                  <div className={cn("h-full transition-all", score > 70 ? "bg-gold" : score > 40 ? "bg-orange-400" : "bg-rose-500")} style={{ width: `${score}%` }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-6 bg-zinc-900/80 rounded-[2.5rem] border border-white/5 space-y-4">
        <div className="flex items-center gap-2 text-gold">
          <Info className="w-4 h-4" />
          <h4 className="text-[10px] font-black uppercase tracking-widest">Wskazówka Premium</h4>
        </div>
        <p className="text-[11px] text-gray-400 leading-relaxed font-medium">
          {washIndex > 70 
            ? 'Przy tak dobrych warunkach polecamy aplikację twardego wosku lub szybkiego detailera dla maksymalnego połysku.'
            : 'Zalecamy użycie osuszacza lakieru po myciu, aby uniknąć zacieków (water spots) w razie nagłej zmiany pogody.'}
        </p>
      </div>
    </div>
  );
}

function App() {
  const [activeView, setActiveView] = useState<View>('map');
  const [selectedType, setSelectedType] = useState<CarWashType | 'all'>('all');
  const [selectedWash, setSelectedWash] = useState<CarWash | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([52.2297, 21.0122]);
  const [user, setUser] = useState<User | null>(null);
  const [isAddingWash, setIsAddingWash] = useState(false);
  const [editingWash, setEditingWash] = useState<any | null>(null);
  const [viewingAnalytics, setViewingAnalytics] = useState<CarWash | null>(null);
  const [viewingWeather, setViewingWeather] = useState(false);
  const [promotingWash, setPromotingWash] = useState<CarWash | null>(null);
  const [carWashes, setCarWashes] = useState<CarWash[]>(mockCarWashes);
  const [showOnboarding, setShowOnboarding] = useState(() => !localStorage.getItem('autospa_onboarding_complete'));
  const [likedWashes, setLikedWashes] = useState<string[]>([]);
  const [animatingLike, setAnimatingLike] = useState<string | null>(null);
  const [pendingWashes, setPendingWashes] = useState<any[]>([]);
  const [logoClicks, setLogoClicks] = useState(0);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [showNearestSelector, setShowNearestSelector] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'default' | 'likes' | 'distance'>('default');
  const [activeFilters, setActiveFilters] = useState({
    minLikes: 0,
    payment: [] as string[],
    equipment: [] as string[],
    services: [] as string[],
    onlyWorking: false,
    isPromoted: false
  });

  const handleLike = (washId: string) => {
    if (likedWashes.includes(washId)) return;
    
    setLikedWashes(prev => [...prev, washId]);
    setAnimatingLike(washId);
    
    setCarWashes(prev => prev.map(w => 
      w.id === washId ? { ...w, likes: w.likes + 1 } : w
    ));
    
    if (selectedWash?.id === washId) {
      setSelectedWash(prev => prev ? { ...prev, likes: prev.likes + 1 } : null);
    }

    setTimeout(() => setAnimatingLike(null), 600);
  };

  const findNearestWash = (type: CarWashType) => {
    setIsLocating(true);
    
    if (!navigator.geolocation) {
      alert("Twoja przeglądarka nie obsługuje geolokalizacji.");
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        const washesOfType = carWashes.filter(w => w.type === type);
        
        if (washesOfType.length === 0) {
          alert(`Brak punktów typu ${type} w bazie.`);
          setIsLocating(false);
          return;
        }

        // Proste obliczenie dystansu (Euklidesowe wystarczy dla małych odległości)
        const nearest = washesOfType.reduce((prev, curr) => {
          const distPrev = Math.sqrt(Math.pow(prev.lat - latitude, 2) + Math.pow(prev.lng - longitude, 2));
          const distCurr = Math.sqrt(Math.pow(curr.lat - latitude, 2) + Math.pow(curr.lng - longitude, 2));
          return distPrev < distCurr ? prev : curr;
        });

        setSelectedWash(nearest);
        setMapCenter([nearest.lat, nearest.lng]);
        setActiveView('detail');
        setIsLocating(false);
        setShowNearestSelector(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert("Nie udało się pobrać Twojej lokalizacji. Upewnij się, że masz włączony GPS.");
        setIsLocating(false);
      },
      { enableHighAccuracy: true }
    );
  };

  useEffect(() => {
    // Pobierz lokalizację użytkownika na starcie
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => console.error("Geolocation error:", error),
        { enableHighAccuracy: true }
      );
    }

    // Sprawdź aktualną sesję
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Słuchaj zmian w autoryzacji
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogoClick = () => {
    const newCount = logoClicks + 1;
    if (newCount === 5) {
      setShowAdminLogin(true);
      setLogoClicks(0);
    } else {
      setLogoClicks(newCount);
      // Reset clicks after 2 seconds of inactivity
      setTimeout(() => setLogoClicks(0), 2000);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
  };

  const handleAddWashSuccess = (newSubmission: any) => {
    if (newSubmission.isPromotionRequest) {
      // Automatycznie potwierdź wyróżnienie (płatność zasymulowana jako sukces)
      setCarWashes(prev => prev.map(w => w.id === newSubmission.id ? { 
        ...w, 
        isPromoted: true, 
        promotionText: newSubmission.promotionText 
      } : w));
      alert('Wyróżnienie zostało aktywowane pomyślnie! Twój punkt jest teraz promowany.');
    } else {
      setPendingWashes(prev => [newSubmission, ...prev]);
      let message = 'Twoje zgłoszenie zostało wysłane do weryfikacji!';
      if (newSubmission.isEdit) message = 'Zmiany zostały wysłane do akceptacji przez administratora!';
      alert(message);
    }
    
    setIsAddingWash(false);
    setEditingWash(null);
    setPromotingWash(null);
  };

  const handleApproveWash = (id: string) => {
    const washToApprove = pendingWashes.find(w => w.id === id);
    if (washToApprove) {
      if (washToApprove.isPromotionRequest) {
        setCarWashes(prev => prev.map(w => w.id === washToApprove.id ? { 
          ...w, 
          isPromoted: true, 
          promotionText: washToApprove.promotionText 
        } : w));
      } else if (washToApprove.isEdit) {
        setCarWashes(prev => prev.map(w => w.id === washToApprove.id ? { ...washToApprove, status: 'approved' } : w));
      } else {
        setCarWashes(prev => [{...washToApprove, status: 'approved'}, ...prev]);
      }
      setPendingWashes(prev => prev.filter(w => w.id !== id));
    }
  };

  const handleRejectWash = (id: string) => {
    setPendingWashes(prev => prev.filter(w => w.id !== id));
  };

  const handleNavigate = (wash: CarWash) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${wash.lat},${wash.lng}`;
    window.open(url, '_blank');

    // Increment navigation analytics
    setCarWashes(prev => prev.map(w => {
      if (w.id === wash.id) {
        return {
          ...w,
          analytics: {
            ...(w.analytics || { views: 0, navigationClicks: 0, phoneClicks: 0, last7Days: [0,0,0,0,0,0,0] }),
            navigationClicks: (w.analytics?.navigationClicks || 0) + 1
          }
        };
      }
      return w;
    }));
  };

  const handleReportQueue = (washId: string, status: 'brak' | 'mała' | 'duża') => {
    if (!userLocation) {
      alert("Musimy znać Twoją lokalizację, abyś mógł zgłosić kolejkę.");
      return;
    }

    const wash = carWashes.find(w => w.id === washId);
    if (!wash) return;

    // Oblicz dystans w metrach
    const R = 6371e3; // promień Ziemi w metrach
    const φ1 = userLocation[0] * Math.PI/180;
    const φ2 = wash.lat * Math.PI/180;
    const Δφ = (wash.lat-userLocation[0]) * Math.PI/180;
    const Δλ = (wash.lng-userLocation[1]) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;

    if (distance > 50) {
      alert(`Jesteś za daleko (${Math.round(distance)}m). Podejdź bliżej (max 50m), aby zgłosić status.`);
      return;
    }

    // Proste zabezpieczenie przed spamem (cooldown 2 min)
    if (wash.userReports && wash.userReports.userId === (user?.id || 'anonymous') && (Date.now() - wash.userReports.timestamp < 2 * 60 * 1000)) {
      alert("Twoje zgłoszenie zostało już wysłane. Możesz dodać kolejne za chwilę.");
      return;
    }

    // Aktualizuj stan
    setCarWashes(prev => prev.map(w => {
      if (w.id === washId) {
        return {
          ...w,
          queueStatus: status,
          userReports: {
            status,
            timestamp: Date.now(),
            userId: user?.id || 'anonymous'
          }
        };
      }
      return w;
    }));

    alert("Dziękujemy! Twoje zgłoszenie zostało dodane i jest widoczne dla innych.");
  };

  const handlePhoneClick = (wash: CarWash) => {
    if (!wash.phone) return;
    window.open(`tel:${wash.phone}`, '_self');

    // Increment phone analytics
    setCarWashes(prev => prev.map(w => {
      if (w.id === wash.id) {
        return {
          ...w,
          analytics: {
            ...(w.analytics || { views: 0, navigationClicks: 0, phoneClicks: 0, last7Days: [0,0,0,0,0,0,0] }),
            phoneClicks: (w.analytics?.phoneClicks || 0) + 1
          }
        };
      }
      return w;
    }));
  };

  const handleUpdateSubmission = (updatedWash: any) => {
    setPendingWashes(prev => prev.map(w => w.id === updatedWash.id ? updatedWash : w));
  };

  const filteredAndSortedWashes = useMemo(() => {
    const filtered = carWashes.filter(wash => {
      const typeMatch = selectedType === 'all' || wash.type === selectedType;
      const likesMatch = wash.likes >= activeFilters.minLikes;
      const workingMatch = !activeFilters.onlyWorking || wash.isMachineWorking;
      const promotedMatch = !activeFilters.isPromoted || wash.isPromoted;
      
      const paymentMatch = activeFilters.payment.length === 0 || 
        activeFilters.payment.every(p => wash.payment?.includes(p));
        
      const equipmentMatch = activeFilters.equipment.length === 0 || 
        activeFilters.equipment.every(e => wash.equipment?.includes(e));

      const servicesMatch = activeFilters.services.length === 0 || 
        activeFilters.services.every(s => 
          wash.services?.includes(s) || 
          (s.includes('Aktywna piana') && wash.hasActiveFoam)
        );

      return typeMatch && likesMatch && workingMatch && promotedMatch && paymentMatch && equipmentMatch && servicesMatch;
    });

    const calculateDistanceRaw = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 6371;
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
                Math.sin(dLon/2) * Math.sin(dLon/2);
      return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
    };

    return [...filtered].sort((a, b) => {
      if (sortBy === 'likes') return b.likes - a.likes;
      
      if (sortBy === 'distance' && userLocation) {
        const distA = calculateDistanceRaw(userLocation[0], userLocation[1], a.lat, a.lng);
        const distB = calculateDistanceRaw(userLocation[0], userLocation[1], b.lat, b.lng);
        return distA - distB;
      }

      // Default: Promoted first, then by likes
      if (a.isPromoted && !b.isPromoted) return -1;
      if (!a.isPromoted && b.isPromoted) return 1;
      return b.likes - a.likes;
    });
  }, [carWashes, selectedType, activeFilters, sortBy, userLocation]);

  const activeFilterCount = useMemo(() => {
     let count = 0;
     if (selectedType !== 'all') count++;
     if (activeFilters.minLikes > 0) count++;
     if (activeFilters.onlyWorking) count++;
     if (activeFilters.isPromoted) count++;
     if (activeFilters.payment.length > 0) count++;
     if (activeFilters.equipment.length > 0) count++;
     if (activeFilters.services.length > 0) count++;
     return count;
   }, [activeFilters, selectedType]);

  const resetFilters = () => {
    setActiveFilters({
      minLikes: 0,
      payment: [],
      equipment: [],
      services: [],
      onlyWorking: false,
      isPromoted: false
    });
    setSelectedType('all');
  };

  const handleWashClick = (wash: CarWash) => {
    setSelectedWash(wash);
    setMapCenter([wash.lat, wash.lng]);
    setActiveView('detail');
    
    // Increment view analytics
    setCarWashes(prev => prev.map(w => {
      if (w.id === wash.id) {
        return {
          ...w,
          analytics: {
            ...(w.analytics || { views: 0, navigationClicks: 0, phoneClicks: 0, last7Days: [0,0,0,0,0,0,0] }),
            views: (w.analytics?.views || 0) + 1
          }
        };
      }
      return w;
    }));
  };

  const handleMarkerClick = (wash: CarWash) => {
    setSelectedWash(wash);
    setActiveView('detail');
  };

  const handleOnboardingComplete = () => {
    localStorage.setItem('autospa_onboarding_complete', 'true');
    setShowOnboarding(false);
  };

  return (
    <div className="flex flex-col h-screen max-w-lg mx-auto bg-black text-white font-sans shadow-xl relative overflow-hidden">
      {showOnboarding && <Onboarding onComplete={handleOnboardingComplete} />}
      {showAdminLogin && (
        <AdminLoginModal 
          onLogin={() => { setIsAdmin(true); setShowAdminLogin(false); setActiveView('b2b'); }} 
          onCancel={() => setShowAdminLogin(false)} 
        />
      )}

      {/* Weather Modal Overlay */}
      {viewingWeather && (
        <div className="fixed inset-0 z-[4000] bg-black animate-slide-up overflow-y-auto no-scrollbar p-6">
          <WeatherModal 
            onBack={() => setViewingWeather(false)} 
            userLocation={userLocation}
          />
        </div>
      )}

      {/* App Header (Midnight Gold Style) */}
      <header className="bg-gold-gradient text-white p-4 shadow-lg z-20 flex flex-col gap-4 border-b border-white/10">
        <div className="flex justify-between items-center px-2">
          <div className="flex flex-col group" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
             <div className="flex items-baseline relative">
               <h1 className="text-3xl font-black tracking-[-0.08em] italic uppercase select-none leading-none flex items-center">
                 <span className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">Auto</span>
                 <span className="animate-text-shimmer ml-1 drop-shadow-[0_0_20px_rgba(212,175,55,0.4)]">Spa</span>
               </h1>
               <div className="absolute -top-2 -right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                 <Sparkles className="w-4 h-4 text-gold animate-pulse" />
               </div>
             </div>
             <div className="flex items-center gap-1.5 mt-1">
               <div className="h-[3px] w-12 bg-gradient-to-r from-gold via-gold to-transparent rounded-full shadow-[0_0_10px_rgba(212,175,55,0.5)]" />
               <div className="flex gap-0.5">
                 <div className="w-1 h-1 rounded-full bg-gold/40" />
                 <div className="w-1 h-1 rounded-full bg-gold/20" />
               </div>
             </div>
          </div>
          <div className="flex gap-1">
            <button 
              onClick={() => setViewingWeather(true)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors text-gold flex items-center gap-1 group"
              title="Pogoda na mycie"
            >
              <CloudSun className="w-5 h-5 group-active:scale-90 transition-transform" />
            </button>
            <button 
              onClick={() => setShowNearestSelector(true)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors text-gold flex items-center gap-1 group"
              title="Znajdź najbliższą"
            >
              <LocateFixed className="w-5 h-5 group-active:scale-90 transition-transform" />
            </button>
            <button 
              onClick={() => setShowFilters(true)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors text-gold relative"
            >
              <Filter className="w-5 h-5" />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[8px] font-black rounded-full flex items-center justify-center border border-black animate-in zoom-in">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>
        
        {activeView !== 'b2b' && activeView !== 'detail' && (
          <div className="flex flex-col gap-3 px-2">
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide no-scrollbar">
              <FilterChip active={selectedType === 'all'} onClick={() => setSelectedType('all')} label="Wszystkie" />
              <FilterChip active={selectedType === 'bezdotykowa'} onClick={() => setSelectedType('bezdotykowa')} label="Bezdotykowa" />
              <FilterChip active={selectedType === 'reczna'} onClick={() => setSelectedType('reczna')} label="Ręczna" />
              <FilterChip active={selectedType === 'autodetailing'} onClick={() => setSelectedType('autodetailing')} label="Autodetailing" />
            </div>
          </div>
        )}
      </header>

      {/* Panel: Znajdź najbliższe (Slide-up Overlay) */}
      {showNearestSelector && (
        <div className="fixed inset-0 z-[3000] flex items-end">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" 
            onClick={() => setShowNearestSelector(false)}
          />
          <div className="w-full bg-zinc-950 border-t-2 border-gold/50 rounded-t-[2.5rem] p-6 pb-12 animate-slide-up relative z-10 shadow-[0_-10px_40px_rgba(212,175,55,0.15)]">
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-white/10 rounded-full" />
            
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-gold/10 p-2 rounded-xl">
                  <LocateFixed className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-gold uppercase tracking-[0.2em]">Znajdź najbliższe</h3>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Wybierz kategorię punktu</p>
                </div>
              </div>
              <button 
                onClick={() => setShowNearestSelector(false)}
                className="p-2 bg-zinc-900 rounded-xl text-gray-500 hover:text-white transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {(['bezdotykowa', 'reczna', 'autodetailing'] as CarWashType[]).map(t => (
                <button
                  key={t}
                  disabled={isLocating}
                  onClick={() => findNearestWash(t)}
                  className="w-full p-5 bg-zinc-900 border-2 border-zinc-800 rounded-2xl flex items-center justify-between group hover:border-gold transition-all active:scale-95 disabled:opacity-50"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                      t === 'bezdotykowa' ? "bg-gold text-black" : t === 'reczna' ? "bg-black border-2 border-gold text-gold" : "bg-gold text-black"
                    )}>
                      {t === 'bezdotykowa' ? <Car className="w-5 h-5" /> : t === 'reczna' ? <Hand className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest text-gray-300 group-hover:text-gold transition-colors">
                      {t === 'bezdotykowa' ? 'Myjnia Bezdotykowa' : t === 'reczna' ? 'Myjnia Ręczna' : 'Autodetailing'}
                    </span>
                  </div>
                  {isLocating ? <Loader2 className="w-5 h-5 animate-spin text-gold" /> : <Navigation className="w-4 h-4 text-gray-600 group-hover:text-gold rotate-45 transition-colors" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Panel: Filtrowanie (Slide-up Overlay) */}
      {showFilters && (
        <div className="fixed inset-0 z-[3000] flex items-end">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300" 
            onClick={() => setShowFilters(false)}
          />
          <div className="w-full bg-zinc-950 border-t-2 border-gold/30 rounded-t-[3rem] p-6 pb-12 animate-slide-up relative z-10 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-white/10 rounded-full" />
            
            <div className="flex justify-between items-center mb-8 sticky top-0 bg-zinc-950/80 backdrop-blur-md z-20 py-4 -mx-6 px-6 border-b border-white/5">
              <div className="flex items-center gap-4">
                <div className="bg-gold/10 p-2.5 rounded-2xl border border-gold/20 shadow-inner">
                  <Filter className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] italic">Filtry</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
                    <p className="text-[9px] text-gold font-black uppercase tracking-widest">{filteredAndSortedWashes.length} znalezionych</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={resetFilters}
                  className="text-[9px] font-black uppercase text-gray-400 hover:text-rose-500 transition-colors px-3 py-2"
                >
                  Wyczyść
                </button>
                <button 
                  onClick={() => setShowFilters(false)}
                  className="p-2.5 bg-zinc-900/50 border border-white/10 rounded-2xl text-white hover:border-gold/50 transition-all active:scale-90 shadow-lg"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="space-y-10">
              {/* Sekcja: Typ Punktu */}
              <section className="space-y-5">
                <div className="flex items-center gap-2">
                  <Car className="w-3.5 h-3.5 text-gold/50" />
                  <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Kategoria punktu</h4>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                  <FilterChip active={selectedType === 'all'} onClick={() => setSelectedType('all')} label="Wszystkie" />
                  <FilterChip active={selectedType === 'bezdotykowa'} onClick={() => setSelectedType('bezdotykowa')} label="Bezdotykowa" />
                  <FilterChip active={selectedType === 'reczna'} onClick={() => setSelectedType('reczna')} label="Ręczna" />
                  <FilterChip active={selectedType === 'autodetailing'} onClick={() => setSelectedType('autodetailing')} label="Autodetailing" />
                </div>
              </section>

              {/* Sekcja: Usługi specyficzne dla typu */}
              {selectedType !== 'all' && (
                <section className="space-y-5 animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-gold/50" />
                    <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
                      Usługi: {selectedType === 'bezdotykowa' ? 'Bezdotykowe' : selectedType === 'reczna' ? 'Ręczne' : 'Detailing'}
                    </h4>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {WASH_SPECS[selectedType].map(s => (
                      <button
                        key={s}
                        onClick={() => setActiveFilters(f => ({
                          ...f,
                          services: f.services.includes(s) ? f.services.filter(x => x !== s) : [...f.services, s]
                        }))}
                        className={cn(
                          "px-4 py-3 rounded-2xl border-2 transition-all text-[9px] font-black uppercase tracking-tight flex items-center gap-3 text-left",
                          activeFilters.services.includes(s) 
                            ? "bg-gold text-black border-gold shadow-lg" 
                            : "bg-zinc-900/50 border-white/5 text-gray-400 hover:border-white/10"
                        )}
                      >
                        <div className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", activeFilters.services.includes(s) ? "bg-black" : "bg-zinc-700")} />
                        <span className="leading-tight">{s}</span>
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {/* Sekcja: Status Myjni */}
              <section className="space-y-5">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 text-gold/50" />
                  <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Status techniczny</h4>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  <button 
                    onClick={() => setActiveFilters(f => ({ ...f, onlyWorking: !f.onlyWorking }))}
                    className={cn(
                      "p-4 rounded-[2rem] border-2 transition-all flex items-center gap-4 relative overflow-hidden group",
                      activeFilters.onlyWorking 
                        ? "bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.1)]" 
                        : "bg-zinc-900/50 border-white/5 text-gray-500 hover:border-white/10"
                    )}
                  >
                    <div className={cn("p-2 rounded-xl transition-colors", activeFilters.onlyWorking ? "bg-emerald-500 text-black" : "bg-zinc-800")}>
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest">Pokaż tylko sprawne stanowiska</span>
                  </button>
                </div>
              </section>

              {/* Sekcja: Płatność */}
              <section className="space-y-5">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-3.5 h-3.5 text-gold/50" />
                  <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Metody płatności</h4>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {GLOBAL_SPECS.payment.map(p => (
                    <button
                      key={p}
                      onClick={() => setActiveFilters(f => ({
                        ...f,
                        payment: f.payment.includes(p) ? f.payment.filter(x => x !== p) : [...f.payment, p]
                      }))}
                      className={cn(
                        "py-3.5 rounded-2xl border-2 transition-all text-[9px] font-black uppercase tracking-tighter flex flex-col items-center gap-1.5",
                        activeFilters.payment.includes(p) 
                          ? "bg-gold text-black border-gold shadow-[0_10px_20px_rgba(212,175,55,0.2)]" 
                          : "bg-zinc-900/50 border-white/5 text-gray-400 hover:border-white/10"
                      )}
                    >
                      <span className="opacity-80">{p === 'Karta' ? <CreditCard className="w-3.5 h-3.5" /> : p === 'Gotówka' ? <span className="text-[12px]">zł</span> : <span className="text-[12px]">📱</span>}</span>
                      {p}
                    </button>
                  ))}
                </div>
              </section>

              {/* Sekcja: Wyposażenie */}
              <section className="space-y-5">
                <div className="flex items-center gap-2">
                  <Settings className="w-3.5 h-3.5 text-gold/50" />
                  <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Wyposażenie dodatkowe</h4>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {GLOBAL_SPECS.equipment.map(e => (
                    <button
                      key={e}
                      onClick={() => setActiveFilters(f => ({
                        ...f,
                        equipment: f.equipment.includes(e) ? f.equipment.filter(x => x !== e) : [...f.equipment, e]
                      }))}
                      className={cn(
                        "px-4 py-3.5 rounded-2xl border-2 transition-all text-[9px] font-black uppercase tracking-tight flex items-center gap-3",
                        activeFilters.equipment.includes(e) 
                          ? "bg-white text-black border-white shadow-xl" 
                          : "bg-zinc-900/50 border-white/5 text-gray-400 hover:border-white/10"
                      )}
                    >
                      <div className={cn("w-2 h-2 rounded-full", activeFilters.equipment.includes(e) ? "bg-black" : "bg-zinc-700")} />
                      {e}
                    </button>
                  ))}
                </div>
              </section>

              {/* Sekcja: Popularność */}
              <section className="space-y-5">
                <div className="flex items-center gap-2">
                  <ThumbsUp className="w-3.5 h-3.5 text-gold/50" />
                  <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Minimalne polubienia</h4>
                </div>
                <div className="flex p-1.5 bg-zinc-900/50 border border-white/5 rounded-[1.5rem] gap-1">
                  {[0, 50, 100, 200].map(likes => (
                    <button
                      key={likes}
                      onClick={() => setActiveFilters(f => ({ ...f, minLikes: likes }))}
                      className={cn(
                        "flex-1 py-3 rounded-2xl transition-all text-[10px] font-black uppercase tracking-widest",
                        activeFilters.minLikes === likes 
                          ? "bg-gold text-black shadow-lg" 
                          : "text-gray-500 hover:text-white"
                      )}
                    >
                      {likes === 0 ? 'Wszystkie' : `${likes}+`}
                    </button>
                  ))}
                </div>
              </section>

              {/* Sekcja: Wyróżnione */}
              <button 
                onClick={() => setActiveFilters(f => ({ ...f, isPromoted: !f.isPromoted }))}
                className={cn(
                  "w-full p-5 rounded-[2.5rem] border-2 transition-all flex items-center justify-between group overflow-hidden relative",
                  activeFilters.isPromoted 
                    ? "bg-gold/10 border-gold text-gold shadow-[0_0_30px_rgba(212,175,55,0.1)]" 
                    : "bg-zinc-900/50 border-white/5 text-gray-500 hover:border-white/10"
                )}
              >
                <div className="flex items-center gap-4 relative z-10">
                  <div className={cn("p-2.5 rounded-2xl transition-all", activeFilters.isPromoted ? "bg-gold text-black rotate-12" : "bg-zinc-800")}>
                    <Star className="w-5 h-5 fill-current" />
                  </div>
                  <div className="text-left">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] block">Tylko wyróżnione</span>
                    <span className="text-[8px] opacity-50 font-bold uppercase tracking-widest">Pokaż punkty Premium</span>
                  </div>
                </div>
                <div className={cn("w-1.5 h-1.5 rounded-full relative z-10", activeFilters.isPromoted ? "bg-gold shadow-[0_0_10px_#D4AF37] animate-pulse" : "bg-zinc-700")} />
              </button>
            </div>

            <button 
              onClick={() => setShowFilters(false)}
              className="w-full mt-10 py-5 bg-luxury-gold text-black font-black uppercase italic rounded-[2.5rem] shadow-2xl shadow-gold/30 active:scale-95 transition-all flex items-center justify-center gap-3 sticky bottom-0"
            >
              <span>Zastosuj filtry</span>
              <div className="w-1 h-1 rounded-full bg-black/30" />
              <span className="opacity-70 text-xs">({filteredAndSortedWashes.length})</span>
            </button>
          </div>
        </div>
      )}

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
              {filteredAndSortedWashes.map((wash) => (
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
          <div className="p-4 space-y-4 bg-black no-scrollbar overflow-y-auto">
            {/* Sort Bar */}
            <div className="flex items-center gap-2 pb-2 overflow-x-auto no-scrollbar">
              <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest whitespace-nowrap mr-1">Sortuj:</span>
              <button 
                onClick={() => setSortBy('default')}
                className={cn(
                  "px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest transition-all whitespace-nowrap border",
                  sortBy === 'default' ? "bg-gold text-black border-gold" : "bg-zinc-900 text-gray-400 border-white/5"
                )}
              >
                Domyślne
              </button>
              <button 
                onClick={() => setSortBy('likes')}
                className={cn(
                  "px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest transition-all whitespace-nowrap border",
                  sortBy === 'likes' ? "bg-gold text-black border-gold" : "bg-zinc-900 text-gray-400 border-white/5"
                )}
              >
                Najwięcej polubień
              </button>
              <button 
                onClick={() => setSortBy('distance')}
                disabled={!userLocation}
                className={cn(
                  "px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest transition-all whitespace-nowrap border disabled:opacity-30",
                  sortBy === 'distance' ? "bg-gold text-black border-gold" : "bg-zinc-900 text-gray-400 border-white/5"
                )}
              >
                Najbliżej mnie
              </button>
            </div>

            {filteredAndSortedWashes.map((wash, index) => (
              <div 
                key={wash.id} 
                className="animate-fade-in-up" 
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CarWashCard 
                  wash={wash} 
                  onClick={() => handleWashClick(wash)} 
                  userLocation={userLocation}
                />
              </div>
            ))}
          </div>
        )}

        {activeView === 'detail' && selectedWash && (
          <div className="fixed inset-0 z-[2000] bg-black animate-slide-up overflow-y-auto no-scrollbar">
            {/* Drag Handle for visual cue */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-white/20 rounded-full z-[2010] pointer-events-none"></div>
            
            <div className="relative h-64 bg-zinc-900 overflow-hidden shrink-0">
               {selectedWash.images && selectedWash.images.length > 0 ? (
                 <div 
                   className="flex h-full overflow-x-auto snap-x scrollbar-hide no-scrollbar scroll-smooth"
                   onScroll={(e) => {
                     const scrollLeft = (e.target as HTMLDivElement).scrollLeft;
                     const width = (e.target as HTMLDivElement).clientWidth;
                     const index = Math.round(scrollLeft / width);
                     setCurrentImageIndex(index);
                   }}
                 >
                   {selectedWash.images.map((img, idx) => (
                     <img key={idx} src={img} alt={`${selectedWash.name} ${idx}`} className="h-full min-w-full object-cover snap-center" />
                   ))}
                 </div>
               ) : (
                 <div className="absolute inset-0 flex items-center justify-center bg-zinc-800 text-zinc-700">
                   <ImageIcon className="w-20 h-20 opacity-20" />
                 </div>
               )}
               <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent pointer-events-none"></div>
               
               <button 
                 onClick={() => { setActiveView('map'); setCurrentImageIndex(0); }}
                 className="absolute top-4 left-4 p-2 bg-black/60 hover:bg-black/80 rounded-xl text-white backdrop-blur border border-white/20 z-10 transition-all active:scale-90"
               >
                 <XCircle className="w-6 h-6" />
               </button>

               {selectedWash.images && selectedWash.images.length > 1 && (
                 <div className="absolute bottom-16 right-4 px-3 py-1 bg-black/60 backdrop-blur rounded-full text-[10px] font-black text-white border border-white/10 z-10 flex items-center gap-1.5">
                   <span className="text-gold">{currentImageIndex + 1}</span>
                   <span className="opacity-40">/</span>
                   <span>{selectedWash.images.length}</span>
                 </div>
               )}

               <div className="absolute bottom-4 left-4 right-4 text-white z-10">
                 <h2 className="text-2xl font-black italic uppercase tracking-tighter text-gold">{selectedWash.name}</h2>
                 <p className="text-sm opacity-80 text-gray-300">{selectedWash.address}</p>
               </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex justify-between items-center">
                 <div className="flex items-center gap-3">
                    <div className="relative group/like">
                      <button 
                        onClick={() => handleLike(selectedWash.id)}
                        disabled={likedWashes.includes(selectedWash.id)}
                        className={cn(
                          "relative p-3 rounded-2xl border-2 transition-all active:scale-90",
                          likedWashes.includes(selectedWash.id) 
                              ? "bg-gold border-gold text-black shadow-[0_0_15px_rgba(212,175,55,0.3)]" 
                              : "bg-zinc-900 border-zinc-800 text-gold hover:border-gold animate-hint-pulse"
                        )}
                      >
                        <ThumbsUp className={cn(
                           "w-6 h-6", 
                           likedWashes.includes(selectedWash.id) ? "fill-black scale-110 text-black" : "text-gold animate-icon-wiggle",
                           animatingLike === selectedWash.id && "animate-thumb-pop"
                         )} style={{ 
                           opacity: 1, 
                           visibility: 'visible',
                           position: 'relative',
                           zIndex: 10
                         }} />
                         {animatingLike === selectedWash.id && (
                           <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                             <Sparkles className="w-8 h-8 text-gold animate-sparkle-burst" />
                           </div>
                         )}
                        
                        {!likedWashes.includes(selectedWash.id) && (
                            <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-luxury-gold text-black text-[10px] font-black py-1.5 px-3 rounded-xl opacity-0 group-hover/like:opacity-100 transition-all pointer-events-none whitespace-nowrap shadow-xl border border-white/20">
                              Polub ten punkt!
                              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-luxury-gold rotate-45" />
                            </div>
                          )}
                      </button>
                    </div>
                    <div>
                      <span className="font-black text-2xl text-gold block leading-none">{selectedWash.likes}</span>
                      <span className="text-gray-500 text-[9px] font-black uppercase tracking-widest">Polubień</span>
                    </div>
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
                 {selectedWash.type === 'bezdotykowa' && (
                   <StatusCard 
                     icon={<List className="w-5 h-5" />} 
                     label="Kolejka" 
                     value={selectedWash.queueStatus} 
                     color={selectedWash.queueStatus === 'brak' ? 'text-emerald-500' : selectedWash.queueStatus === 'mała' ? 'text-gold' : 'text-rose-500'}
                   />
                 )}
                 <StatusCard 
                   icon={<AlertCircle className="w-5 h-5" />} 
                   label="Automat" 
                   value={selectedWash.isMachineWorking ? 'Działa' : 'Awaria'} 
                   color={selectedWash.isMachineWorking ? 'text-emerald-500' : 'text-rose-500'}
                 />
              </div>

              {selectedWash.type === 'bezdotykowa' && (
                <div className="space-y-4 bg-zinc-900/50 p-5 rounded-[2.5rem] border border-white/5 relative overflow-hidden">
                  <div className="flex justify-between items-center relative z-10">
                    <h3 className="font-black text-gold text-[10px] uppercase tracking-[0.2em] flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Status Kolejki na żywo
                    </h3>
                    {selectedWash.userReports && (Date.now() - selectedWash.userReports.timestamp < 30 * 60 * 1000) && (
                      <span className="text-[8px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 animate-in fade-in duration-500">
                        Potwierdzone {Math.floor((Date.now() - selectedWash.userReports.timestamp) / 60000)} min temu
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2 relative z-10">
                     <button 
                       onClick={() => handleReportQueue(selectedWash.id, 'brak')}
                       className={cn(
                         "flex-1 py-3 rounded-2xl text-[10px] font-black uppercase transition-all active:scale-95 border-2",
                         selectedWash.queueStatus === 'brak' 
                           ? "bg-emerald-500 text-black border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]" 
                           : "bg-zinc-900 text-gray-400 border-zinc-800 hover:border-emerald-500/50"
                       )}
                     >
                       Brak
                     </button>
                     <button 
                       onClick={() => handleReportQueue(selectedWash.id, 'mała')}
                       className={cn(
                         "flex-1 py-3 rounded-2xl text-[10px] font-black uppercase transition-all active:scale-95 border-2",
                         selectedWash.queueStatus === 'mała' 
                           ? "bg-gold text-black border-gold shadow-[0_0_15px_rgba(212,175,55,0.3)]" 
                           : "bg-zinc-900 text-gray-400 border-zinc-800 hover:border-gold/50"
                       )}
                     >
                       Mała
                     </button>
                     <button 
                       onClick={() => handleReportQueue(selectedWash.id, 'duża')}
                       className={cn(
                         "flex-1 py-3 rounded-2xl text-[10px] font-black uppercase transition-all active:scale-95 border-2",
                         selectedWash.queueStatus === 'duża' 
                           ? "bg-rose-500 text-black border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)]" 
                           : "bg-zinc-900 text-gray-400 border-zinc-800 hover:border-rose-500/50"
                       )}
                     >
                       Duża
                     </button>
                  </div>
                  <p className="text-[8px] text-gray-500 text-center font-bold uppercase tracking-widest opacity-60">
                    Zgłoś status będąc na miejscu (max 50m)
                  </p>
                </div>
              )}

              <button 
                onClick={() => handleNavigate(selectedWash)}
                className="w-full py-4 bg-luxury-gold text-black rounded-2xl font-black text-lg shadow-lg shadow-gold/20 hover:scale-[1.02] active:scale-95 uppercase italic tracking-[0.1em] transition-all flex items-center justify-center gap-2"
              >
                <Navigation className="w-5 h-5 rotate-45" />
                Nawiguj Teraz
              </button>

              <div className="space-y-6 pt-4 border-t border-white/10">
                {selectedWash.openingHours && (
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-gold flex-shrink-0" />
                    <div>
                      <h4 className="text-[10px] font-black text-gold uppercase tracking-widest flex items-center gap-2">
                        Godziny działania
                        {getOpeningStatus(selectedWash) && (
                          <span className={cn("text-[8px] px-1.5 py-0.5 rounded-full bg-white/5", getOpeningStatus(selectedWash)?.color)}>
                            {getOpeningStatus(selectedWash)?.text}
                          </span>
                        )}
                      </h4>
                      <p className="text-sm text-gray-300 font-medium">{selectedWash.hours}</p>
                    </div>
                  </div>
                )}

                {selectedWash.payment && selectedWash.payment.length > 0 && (
                  <div className="flex items-start gap-3">
                    <CreditCard className="w-5 h-5 text-gold flex-shrink-0" />
                    <div>
                      <h4 className="text-[10px] font-black text-gold uppercase tracking-widest">Płatność</h4>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedWash.payment.map(p => (
                          <span key={p} className="text-[10px] bg-zinc-900 border border-white/5 px-2 py-0.5 rounded-lg text-gray-400">{p}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {selectedWash.equipment && selectedWash.equipment.length > 0 && (
                  <div className="flex items-start gap-3">
                    <Settings className="w-5 h-5 text-gold flex-shrink-0" />
                    <div>
                      <h4 className="text-[10px] font-black text-gold uppercase tracking-widest">Wyposażenie</h4>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedWash.equipment.map(item => (
                          <span key={item} className="text-[10px] bg-zinc-900 border border-white/5 px-2 py-0.5 rounded-lg text-gray-400">{item}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {selectedWash.services && selectedWash.services.length > 0 && (
                  <div className="flex items-start gap-3">
                    <Plus className="w-5 h-5 text-gold flex-shrink-0" />
                    <div>
                      <h4 className="text-[10px] font-black text-gold uppercase tracking-widest">Dostępne Usługi</h4>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedWash.services.map(item => (
                          <span key={item} className="text-[10px] bg-zinc-900 border border-white/5 px-2 py-0.5 rounded-lg text-gray-400">{item}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {selectedWash.description && (
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-gold flex-shrink-0" />
                    <div>
                      <h4 className="text-[10px] font-black text-gold uppercase tracking-widest">Dodatkowe informacje</h4>
                      <p className="text-sm text-gray-400 leading-relaxed italic">{selectedWash.description}</p>
                    </div>
                  </div>
                )}

                {selectedWash.phone && selectedWash.isPhoneVisible && (
                  <button 
                    onClick={() => handlePhoneClick(selectedWash)}
                    className="flex items-start gap-3 w-full text-left group"
                  >
                    <Phone className="w-5 h-5 text-gold flex-shrink-0 group-hover:scale-110 transition-transform" />
                    <div>
                      <h4 className="text-[10px] font-black text-gold uppercase tracking-widest">Kontakt</h4>
                      <p className="text-sm text-gray-300 font-bold tracking-widest">{selectedWash.phone}</p>
                    </div>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {activeView === 'b2b' && (
          <div className="fixed inset-0 z-[2000] bg-black animate-slide-up overflow-y-auto no-scrollbar p-6 space-y-6 font-medium pb-24">
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-white/20 rounded-full z-[2010] pointer-events-none"></div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-black text-gold uppercase italic tracking-tighter">Panel Biznesowy</h2>
              <button 
                onClick={() => setActiveView('map')}
                className="p-2 bg-zinc-900 rounded-xl text-gray-500 hover:text-white transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            {isAdmin ? (
              <AdminPanel 
                submissions={pendingWashes} 
                onAccept={handleApproveWash} 
                onReject={handleRejectWash} 
                onUpdate={handleUpdateSubmission}
                onBack={() => setIsAdmin(false)}
              />
            ) : !user ? (
              <AuthUI />
            ) : isAddingWash || editingWash ? (
              <AddWashForm 
                onCancel={() => { setIsAddingWash(false); setEditingWash(null); }} 
                onSuccess={handleAddWashSuccess}
                initialData={editingWash}
                userEmail={user.email}
              />
            ) : promotingWash ? (
              <PromotionModal 
                wash={promotingWash} 
                onCancel={() => setPromotingWash(null)} 
                onSuccess={handleAddWashSuccess} 
              />
            ) : viewingAnalytics ? (
              <OwnerAnalytics 
                wash={viewingAnalytics} 
                onBack={() => setViewingAnalytics(null)} 
              />
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-500 uppercase font-black">Zalogowany jako</span>
                    <span className="text-gold text-sm font-bold truncate max-w-[150px]">{user.email}</span>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="p-2 bg-zinc-900 border border-gold/30 rounded-xl text-gold hover:bg-zinc-800 transition-all active:scale-95"
                    title="Wyloguj"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>

                <div className="text-center space-y-2">
                  <div className="bg-luxury-gold w-20 h-20 rounded-3xl flex items-center justify-center mx-auto shadow-xl transform rotate-3">
                    <Store className="w-10 h-10 text-black" />
                  </div>
                  <h2 className="text-2xl font-black text-gold uppercase italic tracking-tighter mt-4">Strefa Premium</h2>
                  <p className="text-gray-400 text-sm">Zarządzaj swoją myjnią z poziomu chmury.</p>
                </div>

                <div className="bg-zinc-900 p-5 rounded-3xl shadow-gold border border-white/10 space-y-4">
                  <h3 className="font-black flex items-center gap-2 text-gold text-xs uppercase tracking-widest">
                    <TrendingDown className="w-5 h-5 text-gold" /> Twoje Myjnie
                  </h3>
                  
                  {carWashes.filter(w => w.ownerEmail === user?.email).length > 0 ? (
                    <div className="space-y-3">
                      {carWashes.filter(w => w.ownerEmail === user?.email).map(wash => (
                        <div key={wash.id} className="p-4 bg-black/40 rounded-2xl border border-zinc-800 flex justify-between items-center">
                          <div>
                            <h4 className="text-sm font-black text-white uppercase italic">{wash.name}</h4>
                            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">{wash.address}</p>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => setViewingAnalytics(wash)}
                              className="p-2.5 bg-zinc-900 border border-gold/30 rounded-xl text-gold hover:bg-zinc-800 transition-all active:scale-95"
                              title="Statystyki"
                            >
                              <TrendingDown className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => setEditingWash(wash)}
                              className="p-2.5 bg-zinc-900 border border-gold/30 rounded-xl text-gold hover:bg-zinc-800 transition-all active:scale-95"
                              title="Edytuj"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            {!wash.isPromoted && (
                              <button 
                                onClick={() => setPromotingWash(wash)}
                                className="p-2.5 bg-gold/10 border border-gold rounded-xl text-gold hover:bg-gold/20 transition-all active:scale-95 animate-pulse"
                                title="Promuj"
                              >
                                <Star className="w-4 h-4 fill-current" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                      <button 
                        onClick={() => setIsAddingWash(true)}
                        className="w-full py-3 border-2 border-dashed border-zinc-800 rounded-2xl text-gray-500 text-[10px] font-black uppercase tracking-widest hover:border-gold/30 hover:text-gold transition-all"
                      >
                        + Dodaj kolejny punkt
                      </button>
                    </div>
                  ) : (
                    <div className="p-4 bg-black/40 rounded-2xl border-2 border-dashed border-zinc-800 text-center">
                      <p className="text-sm text-gray-500 mb-2 font-bold italic">Brak zarejestrowanych myjni.</p>
                      <button 
                        onClick={() => setIsAddingWash(true)}
                        className="text-gold text-xs font-black uppercase tracking-widest hover:text-white transition-colors flex items-center gap-2 mx-auto"
                      >
                        <Plus className="w-4 h-4" /> Zgłoś nową myjnię
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-zinc-900 p-4 rounded-3xl border border-white/10 shadow-sm">
                      <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Zasięg (Suma)</p>
                      <p className="text-2xl font-black text-gold">
                        {carWashes
                          .filter(w => w.ownerEmail === user?.email)
                          .reduce((sum, w) => sum + (w.analytics?.views || 0), 0)
                          .toLocaleString()}
                      </p>
                  </div>
                  <div className="bg-zinc-900 p-4 rounded-3xl border border-white/10 shadow-sm">
                      <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Interakcje</p>
                      <p className="text-2xl font-black text-gold">
                        {carWashes
                          .filter(w => w.ownerEmail === user?.email)
                          .reduce((sum, w) => sum + (w.analytics?.navigationClicks || 0) + (w.analytics?.phoneClicks || 0), 0)
                          .toLocaleString()}
                      </p>
                  </div>
                </div>

                <div className="bg-gold/5 p-6 rounded-[2.5rem] border border-gold/30 space-y-4 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-3 opacity-20">
                    <Star className="w-12 h-12 text-gold animate-pulse" />
                  </div>
                  <h3 className="text-sm font-black text-gold uppercase italic tracking-widest">Zwiększ zasięgi</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
                    Wykup Wyróżnienie, aby Twój punkt był widoczny na samej górze listy i posiadał złoty, pulsujący marker na mapie.
                  </p>
                  <button 
                    onClick={() => {
                      const firstWash = carWashes.find(w => w.ownerEmail === user?.email && !w.isPromoted);
                      if (firstWash) setPromotingWash(firstWash);
                      else alert("Wszystkie Twoje punkty są już promowane lub nie masz jeszcze żadnego punktu.");
                    }}
                    className="w-full py-4 bg-luxury-gold text-black rounded-2xl font-black uppercase italic tracking-widest shadow-xl hover:scale-[1.02] transition-all active:scale-95"
                  >
                    Wykup Wyróżnienie
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Bottom Navigation (Midnight Gold Style) */}
      <nav className="glass-morphism p-2 flex justify-around items-center z-30 fixed bottom-0 left-0 right-0 max-w-lg mx-auto">
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

const getOpeningStatus = (wash: CarWash) => {
  if (!wash.openingHours) return null;
  if (wash.openingHours.is24h) return { status: 'open', text: 'Otwarte 24/7', color: 'text-emerald-500' };

  const now = new Date();
  const day = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const time = now.getHours() * 60 + now.getMinutes();

  let hours;
  if (day === 0) hours = wash.openingHours.sunday;
  else if (day === 6) hours = wash.openingHours.saturday;
  else hours = wash.openingHours.weekday;

  if (!hours || hours.closed) return { status: 'closed', text: 'Zamknięte', color: 'text-rose-500' };

  const [openH, openM] = hours.open.split(':').map(Number);
  const [closeH, closeM] = hours.close.split(':').map(Number);
  const openTime = openH * 60 + openM;
  const closeTime = closeH * 60 + closeM;

  if (time >= openTime && time < closeTime) {
    const minutesToClose = closeTime - time;
    if (minutesToClose <= 30) return { status: 'closing', text: `Zamyka się za ${minutesToClose} min`, color: 'text-gold' };
    return { status: 'open', text: `Otwarte do ${hours.close}`, color: 'text-emerald-500' };
  }

  return { status: 'closed', text: 'Zamknięte', color: 'text-rose-500' };
};

function CarWashCard({ wash, onClick, userLocation }: { wash: CarWash, onClick: () => void, userLocation?: [number, number] | null }) {
  const openingStatus = getOpeningStatus(wash);
  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const d = R * c;
    return d < 1 ? `${(d * 1000).toFixed(0)} m` : `${d.toFixed(1)} km`;
  };
  const getIconStyles = (type: CarWashType) => {
    switch (type) {
      case 'bezdotykowa':
        return {
          container: cn(
            "bg-luxury-gold rounded-[50%_50%_50%_0] border-2 border-black",
            wash.isPromoted ? "animate-premium-bezdotykowa border-white" : "-rotate-45 shadow-lg"
          ),
          icon: "rotate-45 text-black",
          Component: Car
        };
      case 'reczna':
        return {
          container: cn(
            "bg-black rounded-sm border-[3px] border-luxury-gold",
            wash.isPromoted ? "animate-premium-reczna border-white shadow-[0_0_15px_#fff]" : "rotate-45 shadow-[0_0_10px_rgba(212,175,55,0.4)]"
          ),
          icon: "-rotate-45 text-gold",
          Component: Hand
        };
      case 'autodetailing':
        return {
          container: cn(
            "bg-luxury-gold rounded-[30%_70%_30%_70%/70%_30%_70%_30%] border-2 transition-all",
            wash.isPromoted 
              ? "border-white animate-premium-autodetailing shadow-[0_0_20px_rgba(212,175,55,0.6),0_0_10px_#fff]" 
              : "border-black shadow-lg"
          ),
          icon: "text-white drop-shadow-[0_0_2px_rgba(0,0,0,0.3)]",
          Component: Sparkles
        };
      default:
        return {
          container: "bg-zinc-800 rounded-2xl",
          icon: "text-white",
          Component: Car
        };
    }
  };

  const styles = getIconStyles(wash.type);
  const IconComponent = styles.Component;

  return (
    <div 
      onClick={onClick}
      className={cn(
        "bg-zinc-900 p-4 rounded-3xl shadow-sm border border-white/10 flex gap-4 items-center active:scale-[0.98] transition-all cursor-pointer hover:shadow-gold hover:border-gold/30",
        wash.isPromoted && "border-gold/50 bg-gold/5"
      )}
    >
      <div className="w-16 h-16 flex items-center justify-center flex-shrink-0">
        <div className={cn(
          "w-12 h-12 flex items-center justify-center transition-all",
          styles.container
        )}>
          <IconComponent className={cn("w-6 h-6", styles.icon)} />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <h3 className="font-black text-white truncate italic uppercase tracking-tighter">{wash.name}</h3>
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-1.5">
              {wash.userReports && (Date.now() - wash.userReports.timestamp < 30 * 60 * 1000) && (
                <div className="flex items-center gap-1 bg-emerald-500/10 px-1.5 py-0.5 rounded-lg border border-emerald-500/20 animate-pulse">
                  <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />
                  <span className="text-[7px] font-black text-emerald-500 uppercase tracking-widest">LIVE</span>
                </div>
              )}
              {openingStatus && (
                <div className={cn("text-[8px] font-black uppercase tracking-widest flex items-center gap-1", openingStatus.color)}>
                  <Clock className="w-2.5 h-2.5" />
                  {openingStatus.text}
                </div>
              )}
              <div className="flex items-center gap-1 bg-black px-1.5 py-0.5 rounded-lg border border-gold/20">
                <ThumbsUp className="w-3 h-3 fill-gold text-gold" />
                <span className="text-[10px] font-black text-gold">{wash.likes}</span>
              </div>
            </div>
            {userLocation && (
              <div className="flex items-center gap-1.5 text-gray-400 bg-white/5 px-2 py-1 rounded-lg border border-white/10 shadow-sm">
                <Navigation className="w-3.5 h-3.5 rotate-45" />
                <span className="text-[11px] font-black uppercase tracking-widest">
                  {getDistance(userLocation[0], userLocation[1], wash.lat, wash.lng)}
                </span>
              </div>
            )}
          </div>
        </div>
        <p className="text-[10px] text-gray-500 truncate mb-2 font-medium">{wash.address}</p>
        <div className="flex gap-2">
          {wash.type === 'bezdotykowa' && (
            <span className={cn(
              "text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider border-2",
              wash.queueStatus === 'brak' ? "bg-emerald-950/30 text-emerald-500 border-emerald-900" : wash.queueStatus === 'mała' ? "bg-gold/10 text-gold border-gold/30" : "bg-rose-950/30 text-rose-500 border-rose-900"
            )}>
              {wash.queueStatus}
            </span>
          )}
          {wash.isPromoted && (
            <span className="text-[9px] font-black px-2 py-0.5 rounded-full uppercase bg-luxury-gold text-black shadow-md italic tracking-widest">
              PREMIUM
            </span>
          )}
        </div>
        {wash.isPromoted && wash.promotionText && (
          <div className="mt-2 p-2 bg-gold/10 border border-gold/30 rounded-xl animate-in slide-in-from-left duration-500">
            <p className="text-[9px] text-gold italic font-bold">"{wash.promotionText}"</p>
          </div>
        )}
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
