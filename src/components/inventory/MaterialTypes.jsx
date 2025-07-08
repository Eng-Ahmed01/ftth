export const materialTypes = {
  cable80: { name: 'كيبل 80 متر', unit: 'قطعة', icon: '🔌', length: 80 },
  cable100: { name: 'كيبل 100 متر', unit: 'قطعة', icon: '🔌', length: 100 },
  cable150: { name: 'كيبل 150 متر', unit: 'قطعة', icon: '🔌', length: 150 },
  cable200: { name: 'كيبل 200 متر', unit: 'قطعة', icon: '🔌', length: 200 },
  sHook: { name: 'فراشة', unit: 'قطعة', icon: '🪝' },
  steelBag: { name: 'شناطة ستيل', unit: 'قطعة', icon: '🔩' },
  plasticBag: { name: 'شناطة بلاستك', unit: 'قطعة', icon: '🛍️' },
  externalPlug: { name: 'فيشة خارجية', unit: 'قطعة', icon: '🔌' },
  internalPlug: { name: 'فيشة داخلية', unit: 'قطعة', icon: '🏠' },
  tape: { name: 'تيب', unit: 'قطعة', icon: '📏' },
  buckles: { name: 'بكتيلات', unit: 'قطعة', icon: '🔗' }
};

export const getCableTypes = () => [
  { key: 'cable80', name: 'كيبل 80 متر', length: 80 },
  { key: 'cable100', name: 'كيبل 100 متر', length: 100 },
  { key: 'cable150', name: 'كيبل 150 متر', length: 150 },
  { key: 'cable200', name: 'كيبل 200 متر', length: 200 }
];

export const calculateTotalCableMeters = (inventory) => {
  return (inventory.cable80 * 80) + 
         (inventory.cable100 * 100) + 
         (inventory.cable150 * 150) + 
         (inventory.cable200 * 200);
};

export const initializeInventoryForUser = () => {
  return {
    available: Object.keys(materialTypes).reduce((acc, key) => ({ ...acc, [key]: 0 }), {}),
    used: Object.keys(materialTypes).reduce((acc, key) => ({ ...acc, [key]: 0 }), {})
  };
};