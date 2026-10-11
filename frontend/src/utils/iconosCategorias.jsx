import React from 'react';
import {
  Utensils,
  Car,
  Home,
  Gift,
  Receipt,
  HeartPulse,
  GraduationCap,
  MoreHorizontal,
  Wallet,
  ArrowDownLeft,
  ShoppingBag,
  PlusCircle,
  HelpCircle
} from 'lucide-react';

export function getCategoryIcon(iconName, size = 20, className = '') {
  const props = { size, className };
  switch (iconName?.toLowerCase()) {
    case 'utensils':
    case 'comida':
      return <Utensils {...props} />;
    case 'car':
    case 'transporte':
      return <Car {...props} />;
    case 'home':
    case 'hogar':
      return <Home {...props} />;
    case 'gift':
    case 'regalos':
      return <Gift {...props} />;
    case 'receipt':
    case 'impuestos':
      return <Receipt {...props} />;
    case 'heart-pulse':
    case 'salud':
      return <HeartPulse {...props} />;
    case 'graduation-cap':
    case 'educacion':
    case 'educación':
      return <GraduationCap {...props} />;
    case 'wallet':
    case 'sueldo':
      return <Wallet {...props} />;
    case 'arrow-down-left':
    case 'transferencia':
      return <ArrowDownLeft {...props} />;
    case 'shopping-bag':
    case 'venta':
      return <ShoppingBag {...props} />;
    case 'plus-circle':
      return <PlusCircle {...props} />;
    case 'more-horizontal':
    case 'otros':
    default:
      return <MoreHorizontal {...props} />;
  }
}
