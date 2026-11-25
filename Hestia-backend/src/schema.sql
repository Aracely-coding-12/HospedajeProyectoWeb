CREATE TABLE IF NOT EXISTS rooms (
  id text PRIMARY KEY,
  number text NOT NULL,
  floor integer NOT NULL,
  type text NOT NULL,
  capacity integer NOT NULL,
  price numeric(10,2) NOT NULL,
  status text NOT NULL DEFAULT 'disponible',
  image text,
  description text,
  created_at timestamptz,
  updated_at timestamptz
);

CREATE TABLE IF NOT EXISTS clients (
  id text PRIMARY KEY,
  name text NOT NULL,
  first_name text,
  last_name text,
  document_type text,
  document text,
  email text UNIQUE,
  phone text,
  active boolean NOT NULL DEFAULT true,
  source text NOT NULL DEFAULT 'admin',
  role text NOT NULL DEFAULT 'client',
  authorized boolean NOT NULL DEFAULT true,
  password_hash text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz
);

CREATE TABLE IF NOT EXISTS reservations (
  id text PRIMARY KEY,
  code text UNIQUE NOT NULL,
  room_id text,
  client_id text,
  guest_name text,
  check_in date NOT NULL,
  check_out date NOT NULL,
  status text NOT NULL DEFAULT 'pendiente',
  nights integer NOT NULL,
  total numeric(10,2) NOT NULL,
  guests integer,
  promotion_code text,
  created_at timestamptz,
  updated_at timestamptz
);

CREATE TABLE IF NOT EXISTS payments (
  id text PRIMARY KEY,
  code text UNIQUE NOT NULL,
  reservation_id text,
  reservation_number text,
  amount numeric(10,2) NOT NULL,
  method text NOT NULL,
  status text NOT NULL DEFAULT 'pendiente',
  paid_at timestamptz
);

CREATE TABLE IF NOT EXISTS services (
  id text PRIMARY KEY,
  name text NOT NULL,
  category text NOT NULL,
  price numeric(10,2) NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'disponible'
);

CREATE TABLE IF NOT EXISTS promotions (
  id text PRIMARY KEY,
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  reservation_number text,
  type text NOT NULL,
  category text NOT NULL,
  discount numeric(10,2),
  start_date date,
  end_date date,
  status text NOT NULL DEFAULT 'activa',
  visible_on_web boolean NOT NULL DEFAULT true,
  image text,
  created_at timestamptz
);

CREATE TABLE IF NOT EXISTS admins (
  id text PRIMARY KEY,
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  phone text,
  document text,
  address text,
  language text DEFAULT 'es',
  theme text DEFAULT 'oscuro',
  session_timeout integer DEFAULT 15,
  avatar text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz
);

CREATE TABLE IF NOT EXISTS notifications (
  id text PRIMARY KEY,
  type text,
  title text NOT NULL,
  message text NOT NULL,
  target text,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS service_requests (
  id text PRIMARY KEY,
  client_id text,
  client_name text,
  service_id text,
  service_name text,
  category text,
  price numeric(10,2),
  quantity integer,
  total numeric(10,2),
  notes text,
  status text NOT NULL DEFAULT 'pendiente',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reservations_room ON reservations(room_id);
CREATE INDEX IF NOT EXISTS idx_reservations_client ON reservations(client_id);
CREATE INDEX IF NOT EXISTS idx_payments_reservation ON payments(reservation_id);
