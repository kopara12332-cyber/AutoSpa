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
}

export const mockCarWashes: CarWash[] = [
  {
    id: '1',
    name: 'AutoBłysk - Bezdotykowa 24h',
    type: 'bezdotykowa',
    address: 'ul. Sezamkowa 1, Warszawa',
    likes: 124,
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
    likes: 85,
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
    likes: 210,
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
    likes: 42,
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
    likes: 67,
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
    likes: 156,
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
    likes: 93,
    lat: 52.1650,
    lng: 21.0750,
    isQueue: true,
    queueStatus: 'mała',
    isMachineWorking: true,
    hasActiveFoam: false,
    hours: 'Codziennie: 07:00-22:00',
    payment: ['Karta', 'Blik', 'Aplikacja']
  },
  {
    id: '8',
    name: 'Turbo Piana - Bemowo',
    type: 'bezdotykowa',
    address: 'ul. Górczewska 212, Warszawa',
    likes: 44,
    lat: 52.2400,
    lng: 20.9100,
    isQueue: false,
    queueStatus: 'brak',
    isMachineWorking: true,
    hasActiveFoam: true,
    hours: '24/7 (Całodobowo)'
  },
  {
    id: '9',
    name: 'Diamond Gloss Studio',
    type: 'autodetailing',
    address: 'ul. Radzymińska 120, Warszawa',
    likes: 112,
    lat: 52.2650,
    lng: 21.0500,
    isQueue: false,
    queueStatus: 'brak',
    isMachineWorking: true,
    hasActiveFoam: true,
    isPromoted: true,
    promotionText: 'Ozonowanie GRATIS do każdego mycia!'
  },
  {
    id: '10',
    name: 'Myjnia u Janka',
    type: 'reczna',
    address: 'ul. Modlińska 50, Warszawa',
    likes: 31,
    lat: 52.2900,
    lng: 20.9800,
    isQueue: true,
    queueStatus: 'duża',
    isMachineWorking: true,
    hasActiveFoam: false,
    hours: 'Pon-Sob: 08:00-19:00'
  },
  {
    id: '11',
    name: 'Clean Car Point - Wola',
    type: 'bezdotykowa',
    address: 'ul. Kasprzaka 25, Warszawa',
    likes: 53,
    lat: 52.2300,
    lng: 20.9600,
    isQueue: true,
    queueStatus: 'mała',
    isMachineWorking: true,
    hasActiveFoam: true,
    payment: ['Karta', 'Gotówka', 'Blik']
  },
  {
    id: '12',
    name: 'Luxury Car Spa - Ochota',
    type: 'autodetailing',
    address: 'ul. Grójecka 110, Warszawa',
    likes: 88,
    lat: 52.2100,
    lng: 20.9750,
    isQueue: false,
    queueStatus: 'brak',
    isMachineWorking: true,
    hasActiveFoam: true,
    phone: '+48 700 800 900',
    isPhoneVisible: true
  },
  {
    id: '13',
    name: 'Bąbelkowa Myjnia - Ursynów',
    type: 'bezdotykowa',
    address: 'ul. Ciszewskiego 15, Warszawa',
    likes: 75,
    lat: 52.1500,
    lng: 21.0400,
    isQueue: false,
    queueStatus: 'brak',
    isMachineWorking: true,
    hasActiveFoam: true,
    hours: '24/7 (Całodobowo)'
  },
  {
    id: '14',
    name: 'Prestige Detailing Praga',
    type: 'autodetailing',
    address: 'ul. Grochowska 44, Warszawa',
    likes: 190,
    lat: 52.2450,
    lng: 21.0650,
    isQueue: false,
    queueStatus: 'brak',
    isMachineWorking: true,
    hasActiveFoam: true,
    isPromoted: true,
    promotionText: 'Ceramika 3-letnia w cenie 2-letniej!'
  },
  {
    id: '15',
    name: 'Myjnia pod Mostem',
    type: 'reczna',
    address: 'Wybrzeże Kościuszkowskie 20, Warszawa',
    likes: 40,
    lat: 52.2420,
    lng: 21.0250,
    isQueue: true,
    queueStatus: 'mała',
    isMachineWorking: true,
    hasActiveFoam: false,
    description: 'Tradycyjne mycie ręczne z widokiem na Wisłę.'
  },
  {
    id: '16',
    name: 'Express Wash - Targówek',
    type: 'bezdotykowa',
    address: 'ul. Kondratowicza 37, Warszawa',
    likes: 62,
    lat: 52.2850,
    lng: 21.0450,
    isQueue: true,
    queueStatus: 'duża',
    isMachineWorking: true,
    hasActiveFoam: true,
    hours: '24/7 (Całodobowo)'
  },
  {
    id: '17',
    name: 'Car Beauty Center - Mokotów',
    type: 'autodetailing',
    address: 'ul. Wołoska 12, Warszawa',
    likes: 127,
    lat: 52.1900,
    lng: 21.0050,
    isQueue: false,
    queueStatus: 'brak',
    isMachineWorking: true,
    hasActiveFoam: true,
    phone: '+48 222 333 444',
    isPhoneVisible: true
  }
];
