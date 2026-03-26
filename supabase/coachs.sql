-- Table coachs
create table if not exists coachs (
  id uuid primary key default gen_random_uuid(),
  prenom text not null,
  nom text not null,
  email text not null unique,
  password_hash text not null, -- bcrypt
  -- Règle financière : montant fixe en centimes par type de réservation
  tarif_seance_ext integer not null default 600,    -- 6€ sur 10€
  tarif_seance_adh integer not null default 300,    -- 3€ sur 5€
  tarif_formule_ext integer not null default 480,   -- 4.80€ sur 8€
  tarif_formule_adh integer not null default 240,   -- 2.40€ sur 4€
  actif boolean not null default true,
  created_at timestamptz default now()
);

-- Colonne coach_id sur seances
alter table seances add column if not exists coach_id uuid references coachs(id) on delete set null;

alter table coachs disable row level security;
