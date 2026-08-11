import { Role } from './auth.types';

export interface User {
  id: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type SpecimenType = 'BLOOD' | 'SERUM' | 'PLASMA' | 'URINE' | 'STOOL' | 'SALIVA' | 'SWAB' | 'TISSUE' | 'OTHER';
export type ContainerType = 'RED_TOP' | 'PURPLE_TOP' | 'BLUE_TOP' | 'GREEN_TOP' | 'YELLOW_TOP' | 'GREY_TOP' | 'STERILE_CUP' | 'SWAB_TUBE' | 'OTHER';

export interface Test {
  id: string;
  testCode: string;
  testName: string;
  description?: string;
  specimenType: SpecimenType;
  containerType: ContainerType;
  fastingRequired: boolean;
  turnaroundTimeHours: number;
  price: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ReferralHospital {
  id: string;
  hospitalCode: string;
  name: string;
  address?: string;
  contactEmail?: string;
  contactPhone?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ReferralDoctor {
  id: string;
  doctorCode: string;
  firstName: string;
  lastName: string;
  specialization?: string;
  phone?: string;
  userId: string;
  hospitalId: string;
  isActive: boolean; // Virtual or joined property depending on backend. We'll handle it carefully.
  createdAt?: string;
  updatedAt?: string;
  
  // Potential joined fields from backend
  hospital?: {
    name: string;
  };
  user?: {
    email: string;
    isActive: boolean;
  };
}
