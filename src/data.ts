export type CarWashType = 'bezdotykowa' | 'reczna' | 'autodetailing';

export interface CarWash {
  id: string;
  name: string;
  type: CarWashType;
  address: string;
  rating: number;
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
}

export const mockCarWashes: CarWash[] = [
  {
    id: '1',
    name: 'AutoBłysk - Bezdotykowa 24h',
    type: 'bezdotykowa',
    address: 'ul. Sezamkowa 1, Warszawa',
    rating: 4.5,
    lat: 52.2297,
    lng: 21.0122,
    isQueue: false,
    queueStatus: 'brak',
    isMachineWorking: true,
    hasActiveFoam: true,
    isPromoted: true,
    promotionText: 'Happy Hour: -20% do 06:00!'
  },
  {
    id: '2',
    name: 'Spa dla Auta - Ręczna Myjnia',
    type: 'reczna',
    address: 'ul. Kolorowa 12, Warszawa',
    rating: 4.8,
    lat: 52.2350,
    lng: 21.0200,
    isQueue: true,
    queueStatus: 'mała',
    isMachineWorking: true,
    hasActiveFoam: false
  },
  {
    id: '3',
    name: 'Royal Detailing - Autodetailing',
    type: 'autodetailing',
    address: 'ul. Główna 5, Warszawa',
    rating: 4.9,
    lat: 52.2200,
    lng: 21.0050,
    isQueue: false,
    queueStatus: 'brak',
    isMachineWorking: true,
    hasActiveFoam: true,
    isPromoted: true,
    promotionText: 'Powłoka Ceramiczna -15%!'
  },
  {
    id: '4',
    name: 'Golden Steam - Myjnia Parowa',
    type: 'reczna',
    address: 'Al. Jerozolimskie 100, Warszawa',
    rating: 4.7,
    lat: 52.2250,
    lng: 21.0000,
    isQueue: false,
    queueStatus: 'brak',
    isMachineWorking: true,
    hasActiveFoam: false,
    hours: 'Pon-Pt: 08:00-20:00 | Sob: 09:00-17:00',
    phone: '+48 500 100 200',
    isPhoneVisible: true,
    description: 'Specjalizujemy się w ekologicznym myciu parowym i czyszczeniu tapicerki.'
  },
  {
    id: '5',
    name: 'QuickWash - Myjnia Bezdotykowa',
    type: 'bezdotykowa',
    address: 'ul. Puławska 150, Warszawa',
    rating: 4.2,
    lat: 52.1850,
    lng: 21.0250,
    isQueue: true,
    queueStatus: 'duża',
    isMachineWorking: true,
    hasActiveFoam: true,
    hours: '24/7 (Całodobowo)',
    payment: ['Gotówka', 'Karta', 'Blik']
  },
  {
    id: '6',
    name: 'Elite Gloss Detailing',
    type: 'autodetailing',
    address: 'ul. Belwederska 23, Warszawa',
    rating: 5.0,
    lat: 52.2100,
    lng: 21.0350,
    isQueue: false,
    queueStatus: 'brak',
    isMachineWorking: true,
    hasActiveFoam: true,
    isPromoted: true,
    promotionText: 'Korekta lakieru One Step w super cenie!',
    hours: 'Wymagana rezerwacja',
    phone: '+48 600 700 800',
    isPhoneVisible: true
  },
  {
    id: '7',
    name: 'Eko Myjnia Ręczna - Wilanów',
    type: 'reczna',
    address: 'ul. Klimczaka 1, Warszawa',
    rating: 4.6,
    lat: 52.1650,
    lng: 21.0750,
    isQueue: true,
    queueStatus: 'mała',
    isMachineWorking: true,
    hasActiveFoam: false,
    hours: 'Codziennie: 07:00-22:00',
    payment: ['Karta', 'Blik', 'Aplikacja']
  }
];
