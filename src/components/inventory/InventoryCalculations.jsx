import { materialTypes, calculateTotalCableMeters } from '@/components/inventory/MaterialTypes';

export const useInventoryCalculations = (users, reports) => {
  const initializeInventories = () => {
    const inventories = {};
    
    // تهيئة المخزون لكل مستخدم
    users.filter(u => u.role === 'technician').forEach(user => {
      if (!inventories[user.username]) {
        inventories[user.username] = {
          available: Object.keys(materialTypes).reduce((acc, key) => ({ ...acc, [key]: 0 }), {}),
          used: Object.keys(materialTypes).reduce((acc, key) => ({ ...acc, [key]: 0 }), {})
        };
      }
    });

    // حساب المواد المستخدمة من التقارير
    reports.forEach(report => {
      const username = report.submittedBy;
      if (inventories[username]) {
        // حساب الكيبل المستخدم من التقارير القديمة والجديدة
        const totalCableUsed = (parseInt(report.cable) || 0) + 
                              (parseInt(report.cable80) || 0) * 80 +
                              (parseInt(report.cable100) || 0) * 100 +
                              (parseInt(report.cable150) || 0) * 150 +
                              (parseInt(report.cable200) || 0) * 200;
        
        // توزيع الكيبل المستخدم على الأنواع المختلفة (للتوافق مع النظام القديم)
        if (report.cable && !report.cable80) {
          inventories[username].used.cable80 += Math.ceil(totalCableUsed / 80);
        } else {
          inventories[username].used.cable80 += parseInt(report.cable80) || 0;
          inventories[username].used.cable100 += parseInt(report.cable100) || 0;
          inventories[username].used.cable150 += parseInt(report.cable150) || 0;
          inventories[username].used.cable200 += parseInt(report.cable200) || 0;
        }
        
        inventories[username].used.sHook += parseInt(report.sHook) || 0;
        inventories[username].used.steelBag += parseInt(report.steelBag) || 0;
        inventories[username].used.plasticBag += parseInt(report.plasticBag) || 0;
        inventories[username].used.externalPlug += parseInt(report.externalPlug) || 0;
        inventories[username].used.internalPlug += parseInt(report.internalPlug) || 0;
        inventories[username].used.tape += parseInt(report.tape) || 0;
        inventories[username].used.buckles += parseInt(report.buckles) || 0;
      }
    });

    // تحميل المخزون المحفوظ
    const savedInventories = JSON.parse(localStorage.getItem('userInventories')) || {};
    Object.keys(inventories).forEach(username => {
      if (savedInventories[username]) {
        inventories[username].available = { ...inventories[username].available, ...savedInventories[username].available };
      }
    });

    return inventories;
  };

  const getTotalMaterials = (userInventories) => {
    const totals = Object.keys(materialTypes).reduce((acc, key) => ({ ...acc, [key]: 0 }), {});
    Object.values(userInventories).forEach(inventory => {
      Object.keys(totals).forEach(material => {
        totals[material] += inventory.available[material] || 0;
      });
    });
    return totals;
  };

  const getTotalCableMeters = (userInventories) => {
    const totals = getTotalMaterials(userInventories);
    return calculateTotalCableMeters(totals);
  };

  const getLowStockUsers = (userInventories) => {
    return Object.entries(userInventories).filter(([username, inventory]) => {
      return Object.values(inventory.available).some(quantity => quantity < 5);
    });
  };

  return {
    initializeInventories,
    getTotalMaterials,
    getTotalCableMeters,
    getLowStockUsers
  };
};