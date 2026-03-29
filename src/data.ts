export type CarWashType = 'bezdotykowa' | 'reczna' | 'autodetailing';

export interface CarWash {
  id: string;
  name: string;
  type: CarWashType;
  address: string;
  likes: number;
  lat: number;
  lng: number;
  isQueue: boolean;
  queueStatus: 'brak' | 'mała' | 'duża';
  isMachineWorking: boolean;
  hasActiveFoam: boolean;
  isPromoted?: boolean;
  promotionText?: string;
  payment?: string[];
  equipment?: string[];
  hours?: string;
  openingHours?: {
    is24h: boolean;
    weekday?: { open: string; close: string; closed: boolean };
    saturday?: { open: string; close: string; closed: boolean };
    sunday?: { open: string; close: string; closed: boolean };
  };
  phone?: string;
  isPhoneVisible?: boolean;
  description?: string;
  services?: string[];
  images?: string[];
  rating?: number;
  ownerEmail?: string;
  userReports?: {
    status: 'brak' | 'mała' | 'duża';
    timestamp: number;
    userId: string;
  };
  analytics?: {
    views: number;
    navigationClicks: number;
    phoneClicks: number;
    last7Days: number[];
  };
}

export const mockCarWashes: CarWash[] = [
  {
    id: 'cw_1',
    name: 'Luxury Shine Detailing',
    type: 'autodetailing',
    address: 'ul. Marszałkowska 10, Warszawa',
    likes: 342,
    lat: 52.2322,
    lng: 21.0083,
    isQueue: false,
    queueStatus: 'brak',
    isMachineWorking: true,
    hasActiveFoam: true,
    isPromoted: true,
    promotionText: 'Ceramika 9H -20% do końca tygodnia!',
    payment: ['Karta', 'Gotówka', 'Aplikacja'],
    equipment: ['Wi-Fi', 'Kawa/Herbata', 'Poczekalnia VIP', 'Monitoring'],
    hours: 'Pon-Pt: 08:00-20:00 | Sob: 09:00-16:00',
    openingHours: {
      is24h: false,
      weekday: { open: '08:00', close: '20:00', closed: false },
      saturday: { open: '09:00', close: '16:00', closed: false },
      sunday: { open: '00:00', close: '00:00', closed: true }
    },
    phone: '+48 600 100 200',
    isPhoneVisible: true,
    description: 'Najwyższej jakości usługi detailingowe w sercu Warszawy. Używamy tylko certyfikowanych kosmetyków premium.',
    services: ['Powłoki ceramiczne', 'Korekta lakieru', 'Pranie tapicerki', 'Czyszczenie skór'],
    rating: 4.9,
    ownerEmail: 'admin@luxury-shine.pl',
    images: ['https://images.unsplash.com/photo-1601362840469-51e4d8d59085?q=80&w=1000&auto=format&fit=crop'],
    analytics: {
      views: 1248,
      navigationClicks: 342,
      phoneClicks: 89,
      last7Days: [120, 145, 190, 160, 210, 240, 183]
    }
  },
  {
    id: 'cw_2',
    name: 'Ehrle JetWash 24h',
    type: 'bezdotykowa',
    address: 'ul. Puławska 150, Warszawa',
    likes: 156,
    lat: 52.1850,
    lng: 21.0230,
    isQueue: true,
    queueStatus: 'mała',
    isMachineWorking: true,
    hasActiveFoam: true,
    payment: ['Karta', 'Bilon', 'Żetony'],
    equipment: ['Odkurzacz', 'Kompresor', 'Czernidło do opon', 'Rozmieniarka'],
    hours: '24/7 (Całodobowo)',
    openingHours: { is24h: true },
    isPromoted: true,
    promotionText: 'Happy Hour: -20% do 06:00!',
    ownerEmail: 'demo@demo.pl',
    description: 'Nowoczesna myjnia 6-stanowiskowa z najnowszą technologią mikroproszku Ehrle.',
    services: ['Turbopiana', 'Mycie podwozia', 'Woskowanie na gorąco', 'Nabłyszczanie'],
    rating: 4.5,
    images: ['https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?q=80&w=1000&auto=format&fit=crop'],
    analytics: {
      views: 856,
      navigationClicks: 124,
      phoneClicks: 32,
      last7Days: [80, 95, 110, 130, 105, 140, 196]
    }
  },
  {
    id: 'cw_3',
    name: 'Stacja Detailing "Garaż"',
    type: 'reczna',
    address: 'ul. Grochowska 44, Warszawa',
    likes: 89,
    lat: 52.2450,
    lng: 21.0800,
    isQueue: false,
    queueStatus: 'brak',
    isMachineWorking: true,
    hasActiveFoam: false,
    isPromoted: true,
    promotionText: 'Darmowe ozonowanie do każdego mycia kompletu!',
    payment: ['Gotówka', 'Blik'],
    equipment: ['Sklep z kosmetykami', 'Automat z napojami'],
    hours: 'Pon-Pt: 07:00-19:00 | Sob: 08:00-15:00',
    openingHours: {
      is24h: false,
      weekday: { open: '07:00', close: '19:00', closed: false },
      saturday: { open: '08:00', close: '15:00', closed: false },
      sunday: { open: '00:00', close: '00:00', closed: true }
    },
    phone: '+48 555 444 333',
    isPhoneVisible: true,
    description: 'Tradycyjne mycie ręczne z dbałością o detale. Bezpieczne dla Twojego lakieru.',
    services: ['Mycie ręczne premium', 'Glinkowanie', 'Wosk twardy', 'Ozonowanie'],
    rating: 4.7
  },
  {
    id: 'cw_4',
    name: 'QuickWash Express',
    type: 'bezdotykowa',
    address: 'ul. Górczewska 124, Warszawa',
    likes: 67,
    lat: 52.2410,
    lng: 20.9320,
    isQueue: true,
    queueStatus: 'duża',
    isMachineWorking: true,
    hasActiveFoam: false,
    payment: ['Karta', 'Bilon'],
    equipment: ['Odkurzacz', 'Automat do zapachów'],
    hours: '24/7 (Całodobowo)',
    openingHours: { is24h: true },
    description: 'Szybkie mycie w dobrej lokalizacji. Duża moc ciśnienia.',
    services: ['Mycie zasadnicze', 'Spłukiwanie', 'Woskowanie'],
    rating: 4.2
  },
  {
    id: 'cw_5',
    name: 'Elite Car Spa',
    type: 'autodetailing',
    address: 'Al. Jerozolimskie 200, Warszawa',
    likes: 512,
    lat: 52.2100,
    lng: 20.9500,
    isQueue: false,
    queueStatus: 'brak',
    isMachineWorking: true,
    hasActiveFoam: true,
    isPromoted: true,
    promotionText: 'Pakiety Jesienne: -15%!',
    payment: ['Karta', 'Gotówka', 'Przelew'],
    equipment: ['Wi-Fi', 'Klimatyzowana poczekalnia', 'Kawa z ekspresu', 'Monitoring 24h'],
    hours: 'Pon-Pt: 09:00-21:00 | Sob: 10:00-18:00 | Ndz: 10:00-14:00',
    openingHours: {
      is24h: false,
      weekday: { open: '09:00', close: '21:00', closed: false },
      saturday: { open: '10:00', close: '18:00', closed: false },
      sunday: { open: '10:00', close: '14:00', closed: false }
    },
    phone: '+48 700 800 900',
    isPhoneVisible: true,
    description: 'Ekskluzywne studio detailingu. Zabezpieczamy auta najdroższymi powłokami na świecie.',
    services: ['Folie PPF', 'Powłoki grafenowe', 'Przygotowanie do sprzedaży', 'Renowacja felg'],
    rating: 5.0,
    images: ['https://images.unsplash.com/photo-1552933529-e359b2477252?q=80&w=1000&auto=format&fit=crop']
  },
  {
    id: 'cw_6',
    name: 'Green Clean Eco',
    type: 'reczna',
    address: 'ul. Radzymińska 80, Warszawa',
    likes: 45,
    lat: 52.2650,
    lng: 21.0550,
    isQueue: false,
    queueStatus: 'brak',
    isMachineWorking: true,
    hasActiveFoam: false,
    payment: ['Gotówka', 'Karta'],
    equipment: ['Odkurzacz piorący'],
    hours: 'Pon-Sob: 08:00-18:00',
    openingHours: {
      is24h: false,
      weekday: { open: '08:00', close: '18:00', closed: false },
      saturday: { open: '08:00', close: '18:00', closed: false },
      sunday: { open: '00:00', close: '00:00', closed: true }
    },
    description: 'Ekologiczna myjnia parowa. Zużywamy tylko 2 litry wody na auto!',
    services: ['Mycie parowe', 'Dezynfekcja wnętrza', 'Czyszczenie silnika'],
    rating: 4.4
  },
  {
    id: 'cw_7',
    name: 'Blue Water Wash',
    type: 'bezdotykowa',
    address: 'ul. Modlińska 22, Warszawa',
    likes: 92,
    lat: 52.3000,
    lng: 20.9800,
    isQueue: true,
    queueStatus: 'mała',
    isMachineWorking: false,
    hasActiveFoam: true,
    payment: ['Karta', 'Bilon', 'Aplikacja'],
    equipment: ['Odkurzacz', 'Kompresor', 'Uchwyty na dywaniki'],
    hours: '24/7 (Całodobowo)',
    openingHours: { is24h: true },
    description: 'Myjnia z osmozą i systemem zmiękczania wody. Brak zacieków gwarantowany.',
    services: ['Turbopiana', 'Nabłyszczanie osmotyczne', 'Woskowanie'],
    rating: 4.1
  },
  {
    id: 'cw_8',
    name: 'City Spa - Myjnia pod dachem',
    type: 'reczna',
    address: 'Złote Tarasy (Parking), Warszawa',
    likes: 128,
    lat: 52.2300,
    lng: 21.0000,
    isQueue: true,
    queueStatus: 'mała',
    isMachineWorking: true,
    hasActiveFoam: true,
    isPromoted: true,
    promotionText: 'Umyj auto podczas zakupów - parking gratis!',
    payment: ['Karta', 'Gotówka', 'Aplikacja'],
    equipment: ['Poczekalnia', 'Sklep'],
    hours: 'Pon-Sob: 09:00-22:00 | Ndz: 10:00-20:00',
    openingHours: {
      is24h: false,
      weekday: { open: '09:00', close: '22:00', closed: false },
      saturday: { open: '09:00', close: '22:00', closed: false },
      sunday: { open: '10:00', close: '20:00', closed: false }
    },
    phone: '+48 22 123 45 67',
    isPhoneVisible: true,
    description: 'Wygodne mycie ręczne w samym centrum miasta. Idealne rozwiązanie dla zapracowanych.',
    services: ['Mycie zewnętrzne', 'Sprzątanie wnętrza', 'Pranie foteli', 'Zabezpieczenie lakieru'],
    rating: 4.6,
    images: ['https://images.unsplash.com/photo-1599256621730-535171e28e50?q=80&w=1000&auto=format&fit=crop']
  },
  {
    id: 'cw_9',
    name: 'Pro-Detailing North',
    type: 'autodetailing',
    address: 'ul. Marymoncka 33, Warszawa',
    likes: 187,
    lat: 52.2850,
    lng: 20.9600,
    isQueue: false,
    queueStatus: 'brak',
    isMachineWorking: true,
    hasActiveFoam: true,
    payment: ['Przelew', 'Karta', 'Gotówka'],
    equipment: ['Monitoring', 'Ubezpieczony garaż'],
    hours: 'Pon-Pt: 08:30-17:30',
    openingHours: {
      is24h: false,
      weekday: { open: '08:30', close: '17:30', closed: false },
      saturday: { open: '00:00', close: '00:00', closed: true },
      sunday: { open: '00:00', close: '00:00', closed: true }
    },
    phone: '+48 888 999 000',
    isPhoneVisible: true,
    description: 'Specjaliści od trudnych przypadków. Usuwamy rysy, których inni nie potrafią.',
    services: ['Polerowanie 3-etapowe', 'Naprawa tapicerki', 'Przygotowanie pod sprzedaż'],
    rating: 4.8
  },
  {
    id: 'cw_10',
    name: 'SuperWash 24/7',
    type: 'bezdotykowa',
    address: 'ul. Fieldorfa 41, Warszawa',
    likes: 74,
    lat: 52.2350,
    lng: 21.0950,
    isQueue: false,
    queueStatus: 'brak',
    isMachineWorking: true,
    hasActiveFoam: true,
    payment: ['Bilon', 'Karta', 'Żetony'],
    equipment: ['Odkurzacz', 'Czernidło', 'Płyn do spryskiwaczy'],
    hours: '24/7 (Całodobowo)',
    openingHours: { is24h: true },
    description: 'Szerokie stanowiska, mocna chemia i zawsze sprawny sprzęt.',
    services: ['Turbopiana', 'Mycie felg', 'Osuszanie'],
    rating: 4.3
  }
];
