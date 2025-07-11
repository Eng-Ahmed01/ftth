import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { initSupabase } from '@/lib/supabaseClient';

const FIELDS = [
  { key: 'name', label: 'Subscriber name', definition: 'name TEXT NOT NULL' },
  { key: 'phone', label: 'Phone number', definition: 'phone TEXT' },
  { key: 'username', label: 'Username', definition: 'username TEXT' },
  { key: 'password', label: 'Password', definition: 'password TEXT' },
  { key: 'coords', label: 'Coordinates', definition: 'coords TEXT' },
  { key: 'ssid', label: 'SSID', definition: 'ssid TEXT' },
  { key: 'plan_type', label: 'Plan type', definition: 'plan_type TEXT' },
  { key: 'plan_value', label: 'Plan value', definition: 'plan_value NUMERIC' },
  { key: 'install_fee', label: 'Install fee', definition: 'install_fee NUMERIC' },
  { key: 'materials', label: 'Materials', definition: 'materials TEXT' },
  { key: 'device_type', label: 'Device type', definition: 'device_type TEXT' },
];

export default function SupabaseSettings() {
  const [projectUrl, setProjectUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [checked, setChecked] = useState(() => ({}));
  const [sql, setSql] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    const savedUrl = localStorage.getItem('supabaseUrl') || '';
    const savedKey = localStorage.getItem('supabaseApiKey') || '';
    setProjectUrl(savedUrl);
    setApiKey(savedKey);
  }, []);

  const handleConnect = () => {
    try {
      initSupabase(projectUrl.trim(), apiKey.trim());
      setStatus('Connected successfully');
    } catch (err) {
      setStatus('Connection failed');
    }
  };

  const toggleField = (key) => {
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const generateSql = () => {
    const columns = FIELDS.filter(f => checked[f.key]).map(f => `  ${f.definition}`);
    const script = [
      'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";',
      '',
      'CREATE TABLE IF NOT EXISTS subscribers (',
      '  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),',
      columns.join(',\n'),
      ');',
      '',
      'ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;',
      '',
      'GRANT SELECT, INSERT, UPDATE, DELETE ON subscribers TO anon;',
    ].join('\n');
    setSql(script);
  };

  return (
    <Card className="glass-effect border-sky-500/30 max-w-xl mx-auto">
      <CardHeader>
        <CardTitle>Supabase Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="supabase-url">Project URL</Label>
          <Input id="supabase-url" value={projectUrl} onChange={(e) => setProjectUrl(e.target.value)} placeholder="https://xyz.supabase.co" className="glass-effect" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="supabase-key">API Key</Label>
          <Input id="supabase-key" type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="public anon key" className="glass-effect" />
        </div>
        <Button onClick={handleConnect}>Connect</Button>
        {status && <p className="text-sm text-gray-400">{status}</p>}
        <div className="pt-4 space-y-2">
          <p className="font-semibold">Select fields:</p>
          {FIELDS.map(f => (
            <label key={f.key} className="flex items-center gap-2">
              <input type="checkbox" checked={!!checked[f.key]} onChange={() => toggleField(f.key)} />
              {f.label}
            </label>
          ))}
        </div>
        <Button className="mt-2" onClick={generateSql}>Generate SQL</Button>
        {sql && (
          <Textarea readOnly className="w-full h-40 mt-4" value={sql} />
        )}
      </CardContent>
    </Card>
  );
}
