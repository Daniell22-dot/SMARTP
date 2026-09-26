import { NavItem } from '@/types';
import {
  LayoutDashboard,
  Home,
  CreditCard,
  Wrench,
  FileText,
  Bell,
  MessageSquare,
  Settings,
  Users,
  Building2,
  DollarSign,
  BarChart3,
  Droplets,
  Wifi,
  ClipboardList,
  Shield,
  Activity,
  LogOut,
} from 'lucide-react';

export const tenantNavItems: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    href: '/my-property',
    label: 'My Property',
    icon: <Home className="h-5 w-5" />,
  },
  {
    href: '/payments',
    label: 'Payments',
    icon: <CreditCard className="h-5 w-5" />,
  },
  {
    href: '/maintenance',
    label: 'Maintenance',
    icon: <Wrench className="h-5 w-5" />,
  },
  {
    href: '/documents',
    label: 'Documents',
    icon: <FileText className="h-5 w-5" />,
  },
  {
    href: '/notifications',
    label: 'Notifications',
    icon: <Bell className="h-5 w-5" />,
  },
  {
    href: '/messages',
    label: 'Messages',
    icon: <MessageSquare className="h-5 w-5" />,
  },
  {
    href: '/profile',
    label: 'Settings',
    icon: <Settings className="h-5 w-5" />,
  },
];

export const landlordNavItems: NavItem[] = [
  {
    href: '/landlord/dashboard',
    label: 'Dashboard',
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    href: '/landlord/tenants',
    label: 'Tenants',
    icon: <Users className="h-5 w-5" />,
  },
  {
    href: '/landlord/properties',
    label: 'Properties',
    icon: <Building2 className="h-5 w-5" />,
  },
  {
    href: '/landlord/payments',
    label: 'Payments',
    icon: <DollarSign className="h-5 w-5" />,
  },
  {
    href: '/landlord/maintenance',
    label: 'Maintenance',
    icon: <Wrench className="h-5 w-5" />,
  },
  {
    href: '/landlord/utilities',
    label: 'Utilities',
    icon: <Droplets className="h-5 w-5" />,
    children: [
      { href: '/landlord/utilities', label: 'All Charges', icon: <Droplets className="h-4 w-4" /> },
      { href: '/landlord/utilities/water', label: 'Water', icon: <Droplets className="h-4 w-4" /> },
      { href: '/landlord/utilities/wifi', label: 'WiFi', icon: <Wifi className="h-4 w-4" /> },
      { href: '/landlord/utilities/statements', label: 'Statements', icon: <ClipboardList className="h-4 w-4" /> },
    ],
  },
  {
    href: '/landlord/reports',
    label: 'Reports',
    icon: <BarChart3 className="h-5 w-5" />,
  },
  {
    href: '/landlord/messages',
    label: 'Messages',
    icon: <MessageSquare className="h-5 w-5" />,
  },
];

export const adminNavItems: NavItem[] = [
  {
    href: '/admin/dashboard',
    label: 'Dashboard',
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    href: '/admin/tenants',
    label: 'Tenants',
    icon: <Users className="h-5 w-5" />,
  },
  {
    href: '/admin/properties',
    label: 'Properties',
    icon: <Building2 className="h-5 w-5" />,
  },
  {
    href: '/admin/finance',
    label: 'Finance',
    icon: <DollarSign className="h-5 w-5" />,
  },
  {
    href: '/admin/maintenance',
    label: 'Maintenance',
    icon: <Wrench className="h-5 w-5" />,
  },
  {
    href: '/admin/system',
    label: 'System',
    icon: <Activity className="h-5 w-5" />,
  },
];

export const caretakerNavItems: NavItem[] = [
  {
    href: '/caretaker/dashboard',
    label: 'Dashboard',
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    href: '/caretaker/properties',
    label: 'Properties',
    icon: <Building2 className="h-5 w-5" />,
  },
  {
    href: '/caretaker/maintenance',
    label: 'Maintenance',
    icon: <Wrench className="h-5 w-5" />,
  },
  {
    href: '/caretaker/tenants',
    label: 'Tenants',
    icon: <Users className="h-5 w-5" />,
  },
];