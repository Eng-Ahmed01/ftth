CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT,
  username TEXT,
  password TEXT,
  coords TEXT,
  ssid TEXT,
  plan_type TEXT,
  plan_value NUMERIC,
  install_fee NUMERIC,
  materials TEXT,
  device_type TEXT
);

ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON subscribers TO anon;
