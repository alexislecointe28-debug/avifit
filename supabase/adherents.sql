-- Table adhérents AUNL
create table if not exists adherents (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  nom text,
  prenom text,
  created_at timestamptz default now()
);

create index if not exists adherents_email_idx on adherents(email);
alter table adherents disable row level security;
