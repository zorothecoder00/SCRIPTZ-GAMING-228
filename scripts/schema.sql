-- Contenu du site (géré depuis /admin). Idempotent : peut être relancé sans risque.

CREATE TABLE IF NOT EXISTS players (
  id          serial PRIMARY KEY,
  pseudo      text NOT NULL,
  real_name   text,
  game        text NOT NULL,
  role        text,
  country     char(2) NOT NULL DEFAULT 'TG',
  photo_url   text,
  bio         text,
  twitter     text,
  instagram   text,
  tiktok      text,
  twitch      text,
  youtube     text,
  sort_order  integer NOT NULL DEFAULT 0,
  active      boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS achievements (
  id           serial PRIMARY KEY,
  year         integer NOT NULL,
  competition  text NOT NULL,
  result       text NOT NULL,
  game         text,
  players      text,
  event_date   date,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS posts (
  id            serial PRIMARY KEY,
  slug          text NOT NULL UNIQUE,
  title         text NOT NULL,
  excerpt       text,
  content       text NOT NULL,
  cover_url     text,
  published     boolean NOT NULL DEFAULT false,
  published_at  timestamptz NOT NULL DEFAULT now(),
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS partners (
  id          serial PRIMARY KEY,
  name        text NOT NULL,
  logo_url    text,
  website     text,
  sort_order  integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id          serial PRIMARY KEY,
  name        text NOT NULL,
  email       text NOT NULL,
  subject     text,
  message     text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS posts_published_idx ON posts (published, published_at DESC);
CREATE INDEX IF NOT EXISTS achievements_year_idx ON achievements (year DESC);
