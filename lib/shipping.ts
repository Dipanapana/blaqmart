// Province-based shipping rates for nationwide South Africa delivery

export const SHIPPING_RATES: Record<string, number> = {
  GAUTENG: 99,
  WESTERN_CAPE: 99,
  KWAZULU_NATAL: 99,
  EASTERN_CAPE: 129,
  FREE_STATE: 129,
  LIMPOPO: 129,
  MPUMALANGA: 129,
  NORTH_WEST: 129,
  NORTHERN_CAPE: 129,
};

export const FREE_SHIPPING_THRESHOLD = 1500;

export const PROVINCE_DISPLAY_NAMES: Record<string, string> = {
  GAUTENG: 'Gauteng',
  WESTERN_CAPE: 'Western Cape',
  KWAZULU_NATAL: 'KwaZulu-Natal',
  EASTERN_CAPE: 'Eastern Cape',
  FREE_STATE: 'Free State',
  LIMPOPO: 'Limpopo',
  MPUMALANGA: 'Mpumalanga',
  NORTH_WEST: 'North West',
  NORTHERN_CAPE: 'Northern Cape',
};

export const PROVINCES = Object.keys(SHIPPING_RATES);

export function calculateShippingFee(
  province: string | null,
  subtotal: number
): number {
  if (subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
  if (!province) return 0;
  return SHIPPING_RATES[province] || 129;
}

export function getProvinceDisplayName(province: string): string {
  return PROVINCE_DISPLAY_NAMES[province] || province;
}

export function getEstimatedDeliveryDays(province: string): string {
  const majorProvinces = ['GAUTENG', 'WESTERN_CAPE', 'KWAZULU_NATAL'];
  if (majorProvinces.includes(province)) {
    return '3-5 business days';
  }
  return '5-7 business days';
}
