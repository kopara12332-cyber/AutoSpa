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
];
