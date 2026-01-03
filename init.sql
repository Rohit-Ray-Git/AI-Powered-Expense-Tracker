-- TimescaleDB extension - Commented out for standard local PostgreSQL support
-- CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) DEFAULT 'User',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(50) DEFAULT '📁',
  color VARCHAR(20) DEFAULT '#10B981',
  UNIQUE(user_id, name)
);

CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  category_id UUID REFERENCES categories(id),
  amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
  description TEXT,
  merchant_name VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Hypertable creation - Commented out for standard local PostgreSQL support
-- SELECT create_hypertable('expenses', 'created_at', if_not_exists => TRUE);

CREATE INDEX idx_expenses_user_created ON expenses(user_id, created_at DESC);
CREATE INDEX idx_expenses_category ON expenses(category_id);
