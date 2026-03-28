import React, { useState, useMemo, useEffect } from 'react';
import { Map as MapIcon, List, Search, Filter, Car, Star, Navigation, AlertCircle, TrendingDown, Store, LogIn, Mail, Lock, LogOut, Plus, CheckCircle2, MapPin, Info, ShieldCheck, XCircle, Edit3, Save } from 'lucide-react';
import { mockCarWashes } from './data';
import type { CarWash, CarWashType } from './data';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
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

type View = 'map' | 'list' | 'b2b' | 'detail';

const WASH_SPECS = {
  bezdotykowa: [
    'Aktywna piana', 'Mycie podwozia', 'Woskowanie na gorąco', 
    'Nabłyszczanie', 'Odkurzacz', 'Kompresor', 
    'Płatność kartą', 'Rozmieniarka', 'Uchwyty na dywaniki'
  ],
  reczna: [
    'Mycie ręczne (gąbka)', 'Osuszanie ręczne', 'Woskowanie ręczne', 
    'Czyszczenie felg', 'Pranie tapicerki', 'Czyszczenie skór', 
    'Czyszczenie plastików', 'Niewidzialna wycieraczka', 'Dezynfekcja klimatyzacji'
  ],
  autodetailing: [
    'Korekta lakieru (polerka)', 'Powłoka ceramiczna', 'Powłoka grafenowa', 
    'Folie ochronne PPF', 'Detailing wnętrza', 'Renowacja skór', 
    'Renowacja reflektorów', 'Zabezpieczenie felg ceramiczne', 'Czyszczenie komory silnika'
  ]
};

function AddWashForm({ onCancel, onSuccess }: { onCancel: () => void, onSuccess: (wash: any) => void }) {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    type: 'bezdotykowa' as CarWashType,
    lat: 52.2297,
    lng: 21.0122,
    services: [] as string[]
  });
  const [loading, setLoading] = useState(false);

  const toggleService = (service: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const newSubmission = {
      ...formData,
      id: Math.random().toString(36).substr(2, 9),
      rating: 5.0,
      isQueue: false,
      queueStatus: 'brak',
      isMachineWorking: true,
      hasActiveFoam: formData.services.includes('Aktywna piana'),
      isPromoted: false,
      status: 'pending' as 'pending' | 'approved'
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
        <h2 className="text-xl font-black text-gold uppercase italic tracking-tighter">Nowa Myjnia</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gold uppercase tracking-widest ml-1">Nazwa Myjni</label>
            <input 
              required
              className="w-full bg-zinc-900 border-2 border-zinc-800 rounded-2xl py-3 px-4 text-white focus:border-gold outline-none"
              placeholder="np. Golden Wash Premium"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-gold uppercase tracking-widest ml-1">Adres</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input 
                required
                className="w-full bg-zinc-900 border-2 border-zinc-800 rounded-2xl py-3 pl-10 pr-4 text-white focus:border-gold outline-none"
                placeholder="ul. Złota 44, Warszawa"
                value={formData.address}
                onChange={e => setFormData({...formData, address: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-gold uppercase tracking-widest ml-1">Typ Usługi</label>
            <div className="grid grid-cols-3 gap-2">
              {(['bezdotykowa', 'reczna', 'autodetailing'] as CarWashType[]).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setFormData({...formData, type: t, services: []})}
                  className={cn(
                    "py-2 rounded-xl text-[9px] font-black uppercase transition-all border-2",
                    formData.type === t ? "bg-luxury-gold text-black border-gold" : "bg-zinc-900 text-gray-500 border-zinc-800"
                  )}
                >
                  {t === 'reczna' ? 'Ręczna' : t === 'bezdotykowa' ? 'Bezdotyk.' : 'Detailing'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black text-gold uppercase tracking-widest ml-1 flex items-center gap-2">
            <Info className="w-3 h-3" /> Wyposażenie / Usługi
          </label>
          <div className="grid grid-cols-1 gap-2">
            {WASH_SPECS[formData.type].map(service => (
              <button
                key={service}
                type="button"
                onClick={() => toggleService(service)}
                className={cn(
                  "flex items-center justify-between p-3 rounded-2xl border-2 transition-all",
                  formData.services.includes(service) ? "bg-gold/10 border-gold text-white" : "bg-zinc-900/50 border-zinc-800 text-gray-500"
                )}
              >
                <span className="text-xs font-bold">{service}</span>
                {formData.services.includes(service) && <CheckCircle2 className="w-4 h-4 text-gold" />}
              </button>
            ))}
          </div>
        </div>

        <button 
          disabled={loading}
          type="submit"
          className="w-full py-4 bg-luxury-gold text-black rounded-2xl font-black text-lg shadow-lg hover:scale-[1.02] active:scale-95 transition-all uppercase italic tracking-widest"
        >
          {loading ? 'Zapisywanie...' : 'Dodaj moją myjnię'}
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

  const toggleService = (service: string) => {
    setEditData((prev: any) => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter((s: string) => s !== service)
        : [...prev.services, service]
    }));
  };

  return (
    <div className="space-y-6 py-4 animate-in fade-in duration-500">
      <div className="flex items-center justify-between border-b border-gold/20 pb-4">
        <h2 className="text-2xl font-black text-gold uppercase italic tracking-tighter">
          {editingId ? 'Edycja' : 'Zarządzanie'}
        </h2>
        <button onClick={onBack} className="p-2 bg-zinc-900 rounded-xl text-gray-500"><XCircle className="w-6 h-6" /></button>
      </div>

      <div className="space-y-4">
        {editingId && editData ? (
          <form onSubmit={handleSaveEdit} className="bg-zinc-900 border-2 border-gold/30 p-6 rounded-3xl space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gold uppercase tracking-widest">Nazwa Myjni</label>
                <input 
                  className="w-full bg-black border border-zinc-800 rounded-xl py-3 px-4 text-white focus:border-gold outline-none"
                  value={editData.name}
                  onChange={e => setEditData({...editData, name: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gold uppercase tracking-widest">Adres</label>
                <input 
                  className="w-full bg-black border border-zinc-800 rounded-xl py-3 px-4 text-white focus:border-gold outline-none"
                  value={editData.address}
                  onChange={e => setEditData({...editData, address: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gold uppercase tracking-widest">Usługi ({editData.type})</label>
                <div className="flex flex-wrap gap-2">
                  {WASH_SPECS[editData.type as CarWashType].map((service: string) => (
                    <button
                      key={service}
                      type="button"
                      onClick={() => toggleService(service)}
                      className={cn(
                        "text-[9px] px-3 py-1.5 rounded-full font-bold uppercase transition-all border",
                        editData.services.includes(service) ? "bg-gold text-black border-gold" : "bg-black text-gray-500 border-zinc-800"
                      )}
                    >
                      {service}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="flex-1 py-3 bg-gold text-black font-black uppercase italic rounded-xl flex items-center justify-center gap-2">
                <Save className="w-4 h-4" /> Zapisz
              </button>
              <button type="button" onClick={() => setEditingId(null)} className="flex-1 py-3 bg-zinc-800 text-white font-black uppercase italic rounded-xl">
                Anuluj
              </button>
            </div>
          </form>
        ) : submissions.length === 0 ? (
          <div className="text-center py-20 text-gray-600 italic">Brak nowych zgłoszeń.</div>
        ) : (
          submissions.map(sub => (
            <div key={sub.id} className="bg-zinc-900 border border-gold/20 p-4 rounded-2xl space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-black text-white uppercase italic">{sub.name}</h3>
                  <p className="text-[10px] text-gray-500">{sub.address}</p>
                </div>
                <span className="text-[8px] bg-gold/10 text-gold px-2 py-0.5 rounded-full font-black uppercase">{sub.type}</span>
              </div>
              
              <div className="flex flex-wrap gap-1">
                {sub.services.map((s: string) => (
                  <span key={s} className="text-[8px] bg-black text-gray-400 px-2 py-0.5 rounded-md">{s}</span>
                ))}
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

function App() {
  const [activeView, setActiveView] = useState<View>('map');
  const [selectedType, setSelectedType] = useState<CarWashType | 'all'>('all');
  const [selectedWash, setSelectedWash] = useState<CarWash | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([52.2297, 21.0122]);
  const [user, setUser] = useState<User | null>(null);
  const [isAddingWash, setIsAddingWash] = useState(false);
  const [carWashes, setCarWashes] = useState<CarWash[]>(mockCarWashes);
  const [pendingWashes, setPendingWashes] = useState<any[]>([]);
  const [logoClicks, setLogoClicks] = useState(0);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
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
    setPendingWashes(prev => [newSubmission, ...prev]);
    setIsAddingWash(false);
    alert('Twoje zgłoszenie zostało wysłane do weryfikacji!');
  };

  const handleApproveWash = (id: string) => {
    const washToApprove = pendingWashes.find(w => w.id === id);
    if (washToApprove) {
      setCarWashes(prev => [{...washToApprove, status: 'approved'}, ...prev]);
      setPendingWashes(prev => prev.filter(w => w.id !== id));
    }
  };

  const handleRejectWash = (id: string) => {
    setPendingWashes(prev => prev.filter(w => w.id !== id));
  };

  const handleUpdateSubmission = (updatedWash: any) => {
    setPendingWashes(prev => prev.map(w => w.id === updatedWash.id ? updatedWash : w));
  };

  const filteredWashes = useMemo(() => {
    if (selectedType === 'all') return carWashes;
    return carWashes.filter(w => w.type === selectedType);
  }, [selectedType, carWashes]);

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
      {showAdminLogin && (
        <AdminLoginModal 
          onLogin={() => { setIsAdmin(true); setShowAdminLogin(false); setActiveView('b2b'); }} 
          onCancel={() => setShowAdminLogin(false)} 
        />
      )}

      {/* App Header (Midnight Gold Style) */}
      <header className="bg-gold-gradient text-white p-4 shadow-lg z-20 flex flex-col gap-4 border-b border-white/10">
        <div className="flex justify-between items-center px-2">
          <div className="flex items-center gap-3" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
             <div className="bg-luxury-gold p-2 rounded-xl shadow-lg transform -rotate-3 transition-transform active:scale-90">
               <Car className="w-6 h-6 text-black" />
             </div>
             <h1 className="text-2xl font-black tracking-tighter italic uppercase tracking-widest text-gold select-none">AutoSpa</h1>
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
                 {selectedWash.type !== 'autodetailing' && (
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

              {selectedWash.type !== 'autodetailing' && (
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
              )}

              <button className="w-full py-4 bg-luxury-gold text-black rounded-2xl font-black text-lg shadow-lg shadow-gold/20 hover:scale-[1.02] active:scale-95 uppercase italic tracking-[0.1em] transition-all">
                Nawiguj Teraz
              </button>
            </div>
          </div>
        )}

        {activeView === 'b2b' && (
          <div className="p-6 space-y-6 bg-black min-h-full font-medium">
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
            ) : isAddingWash ? (
              <AddWashForm onCancel={() => setIsAddingWash(false)} onSuccess={handleAddWashSuccess} />
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
                  <div className="p-4 bg-black/40 rounded-2xl border-2 border-dashed border-zinc-800 text-center">
                    <p className="text-sm text-gray-500 mb-2 font-bold italic">Brak zarejestrowanych myjni.</p>
                    <button 
                      onClick={() => setIsAddingWash(true)}
                      className="text-gold text-xs font-black uppercase tracking-widest hover:text-white transition-colors flex items-center gap-2 mx-auto"
                    >
                      <Plus className="w-4 h-4" /> Zgłoś nową myjnię
                    </button>
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
          {wash.type !== 'autodetailing' && (
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
