import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Cable } from 'lucide-react';

export const UserIdSection = ({ userIdParts, onUserIdPartChange, finalUserId }) => (
  <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-600">
    <h3 className="text-lg font-semibold text-sky-300 mb-4">إنشاء اسم المستخدم</h3>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="space-y-2">
        <Label htmlFor="zone">Zone (الأرقام فقط)</Label>
        <Input 
          id="zone" 
          type="number" 
          value={userIdParts.zone} 
          onChange={onUserIdPartChange} 
          className="glass-effect" 
          placeholder="e.g., 61"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="f">F (الأرقام فقط)</Label>
        <Input 
          id="f" 
          type="number" 
          value={userIdParts.f} 
          onChange={onUserIdPartChange} 
          className="glass-effect" 
          placeholder="e.g., 44" 
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="p">P (الأرقام فقط)</Label>
        <Input 
          id="p" 
          type="number" 
          value={userIdParts.p} 
          onChange={onUserIdPartChange} 
          className="glass-effect" 
          placeholder="e.g., 1" 
        />
      </div>
      <div className="space-y-2">
        <Label>اسم المستخدم النهائي</Label>
        <Input 
          value={finalUserId} 
          readOnly 
          disabled 
          className="glass-effect disabled:opacity-75 font-bold text-green-400" 
        />
      </div>
    </div>
  </div>
);

export const BasicInfoSection = ({ formData, onChange, onSubscriptionChange, onGetLocation, offers }) => (
  <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-600">
    <h3 className="text-lg font-semibold text-sky-300 mb-4">المعلومات الأساسية</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div className="space-y-2">
        <Label htmlFor="name">الاسم</Label>
        <Input id="name" value={formData.name} onChange={onChange} className="glass-effect" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">رقم الهاتف</Label>
        <Input id="phone" value={formData.phone} onChange={onChange} className="glass-effect" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="userPassword">كلمة السر</Label>
        <Input id="userPassword" value={formData.userPassword} onChange={onChange} className="glass-effect" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="ssid">SSID</Label>
        <Input id="ssid" value={formData.ssid} onChange={onChange} className="glass-effect" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="coordinates">الإحداثيات</Label>
        <div className="flex gap-2">
          <Input id="coordinates" value={formData.coordinates} onChange={onChange} className="glass-effect" />
          <Button type="button" variant="secondary" onClick={onGetLocation}>
            <MapPin className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="subscriptionType">نوع الاشتراك</Label>
        <Select onValueChange={onSubscriptionChange}>
          <SelectTrigger className="glass-effect">
            <SelectValue placeholder="اختر عرض..." />
          </SelectTrigger>
          <SelectContent>
            {offers.map(offer => (
              <SelectItem key={offer.name} value={offer.name}>{offer.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>قيمة الاشتراك (د.ع)</Label>
        <Input value={formData.subscriptionCost} readOnly disabled className="glass-effect disabled:opacity-75" />
      </div>
      <div className="space-y-2">
        <Label>أجور التنصيب</Label>
        <Input value={formData.installationFee} readOnly disabled className="glass-effect disabled:opacity-75" />
      </div>
    </div>
  </div>
);

export const CableSection = ({ formData, onChange, cableTypes, calculateTotalCable }) => (
  <div className="p-4 bg-purple-800/20 rounded-lg border border-purple-500/30">
    <h3 className="text-lg font-semibold text-purple-300 mb-4 flex items-center gap-2">
      <Cable className="w-6 h-6" />
      أنواع الكيبل المتطورة
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cableTypes.map(type => (
        <div key={type.key} className="space-y-2">
          <Label htmlFor={type.key} className="flex items-center gap-2">
            🔌 {type.name}
          </Label>
          <Input 
            id={type.key} 
            type="number" 
            value={formData[type.key]} 
            onChange={onChange} 
            className="glass-effect" 
            placeholder="عدد القطع"
          />
        </div>
      ))}
    </div>
    <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
      <p className="text-green-300 font-semibold">
        إجمالي الكيبل: {calculateTotalCable()} متر
      </p>
    </div>
  </div>
);

export const MaterialsSection = ({ formData, onChange }) => (
  <div className="p-4 bg-orange-800/20 rounded-lg border border-orange-500/30">
    <h3 className="text-lg font-semibold text-orange-300 mb-4">المواد المستخدمة</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="space-y-2">
        <Label htmlFor="sHook">🪝 فراشة (S-Hook)</Label>
        <Input id="sHook" type="number" value={formData.sHook} onChange={onChange} className="glass-effect" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="steelBag">🔩 شناطة ستيل</Label>
        <Input id="steelBag" type="number" value={formData.steelBag} onChange={onChange} className="glass-effect" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="plasticBag">🛍️ شناطة بلاستك</Label>
        <Input id="plasticBag" type="number" value={formData.plasticBag} onChange={onChange} className="glass-effect" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="externalPlug">🔌 فيشة خارجية</Label>
        <Input id="externalPlug" type="number" value={formData.externalPlug} onChange={onChange} className="glass-effect" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="internalPlug">🏠 فيشة داخلية</Label>
        <Input id="internalPlug" type="number" value={formData.internalPlug} onChange={onChange} className="glass-effect" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="tape">📏 تيب</Label>
        <Input id="tape" type="number" value={formData.tape} onChange={onChange} className="glass-effect" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="buckles">🔗 بكتيلات</Label>
        <Input id="buckles" type="number" value={formData.buckles} onChange={onChange} className="glass-effect" />
      </div>
    </div>
  </div>
);

export const DeviceSection = ({ formData, onChange }) => (
  <div className="p-4 bg-green-800/20 rounded-lg border border-green-500/30">
    <h3 className="text-lg font-semibold text-green-300 mb-4">نوع الجهاز</h3>
    <Input id="deviceType" value={formData.deviceType} onChange={onChange} className="glass-effect" />
  </div>
);