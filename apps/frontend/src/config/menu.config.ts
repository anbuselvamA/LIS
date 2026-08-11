import { Role } from '../types/auth.types';
import { 
  LayoutDashboard, 
  Users, 
  TestTube2, 
  Microscope, 
  FileText, 
  Network, 
  Settings,
  UserCog,
  Building2,
  Stethoscope,
  Library,
  ClipboardCheck,
  LucideIcon 
} from 'lucide-react';

export interface MenuItem {
  title: string;
  href: string;
  icon: LucideIcon;
  roles: Role[];
  adminGroup?: string;
}

export const menuConfig: MenuItem[] = [
  {
    title: 'Admin Dashboard',
    href: '/dashboard/admin',
    icon: LayoutDashboard,
    roles: ['ADMIN'],
  },
  {
    title: 'Reception Dashboard',
    href: '/dashboard/reception',
    icon: LayoutDashboard,
    roles: ['RECEPTIONIST'],
  },
  {
    title: 'Lab Dashboard',
    href: '/dashboard/lab',
    icon: LayoutDashboard,
    roles: ['LAB_TECHNICIAN'],
  },
  {
    title: 'Doctor Dashboard',
    href: '/dashboard/doctor',
    icon: LayoutDashboard,
    roles: ['DOCTOR'],
  },
  {
    title: 'Referral Dashboard',
    href: '/dashboard/referral',
    icon: LayoutDashboard,
    roles: ['REFERRAL_DOCTOR'],
  },
  {
    title: 'System Users',
    href: '/dashboard/users',
    icon: UserCog,
    roles: ['ADMIN'],
    adminGroup: 'MASTER DATA',
  },
  {
    title: 'Test Catalogue',
    href: '/dashboard/tests',
    icon: Library,
    roles: ['ADMIN', 'LAB_TECHNICIAN'],
    adminGroup: 'MASTER DATA',
  },
  {
    title: 'Referral Doctors',
    href: '/dashboard/doctors',
    icon: Stethoscope,
    roles: ['ADMIN', 'RECEPTIONIST'],
    adminGroup: 'MASTER DATA',
  },
  {
    title: 'Patients',
    href: '/dashboard/patients',
    icon: Users,
    roles: ['ADMIN', 'RECEPTIONIST', 'DOCTOR'],
    adminGroup: 'MONITORING',
  },
  {
    title: 'Orders',
    href: '/dashboard/orders',
    icon: FileText,
    roles: ['ADMIN', 'RECEPTIONIST'],
    adminGroup: 'MONITORING',
  },
  {
    title: 'Samples',
    href: '/dashboard/samples',
    icon: TestTube2,
    roles: ['ADMIN', 'LAB_TECHNICIAN'],
    adminGroup: 'MONITORING',
  },
  {
    title: 'Results',
    href: '/dashboard/results',
    icon: Microscope,
    roles: ['ADMIN', 'LAB_TECHNICIAN'],
    adminGroup: 'MONITORING',
  },
  {
    title: 'Result Verification',
    href: '/dashboard/doctor/results',
    icon: ClipboardCheck,
    roles: ['DOCTOR'],
    adminGroup: 'MONITORING',
  },
  {
    title: 'Referral Queue',
    href: '/dashboard/referrals',
    icon: Network,
    roles: ['ADMIN', 'RECEPTIONIST'],
    adminGroup: 'MONITORING',
  },
  {
    title: 'New Referral Request',
    href: '/dashboard/referrals/new',
    icon: Network,
    roles: ['REFERRAL_DOCTOR'],
  },
  {
    title: 'Reports & Analytics',
    href: '/dashboard/reports',
    icon: FileText,
    roles: ['ADMIN', 'RECEPTIONIST'],
    adminGroup: 'REPORTS',
  },
  {
    title: 'My Reports',
    href: '/dashboard/referral/reports',
    icon: FileText,
    roles: ['REFERRAL_DOCTOR'],
  },
  {
    title: 'System Settings',
    href: '/dashboard/settings',
    icon: Settings,
    roles: ['ADMIN'],
    adminGroup: 'SYSTEM',
  },
];

export const getMenuForRole = (role: Role) => {
  return menuConfig.filter((item) => item.roles.includes(role));
};

