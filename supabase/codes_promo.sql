create table if not exists codes_promo (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  type text not null check (type in ('gratuit', 'pourcentage', 'montant')),
  valeur integer not null default 100, -- 100 = 100% gratuit, ou montant en centimes
  nb_max integer default null, -- null = illimité
  nb_utilises integer not null default 0,
  expire_le date default null, -- null = pas d'expiration
  actif boolean not null default true,
  description text,
  created_at timestamptz default now()
);

alter table codes_promo disable row level security;

-- Code exemple : ESSAI-GRATUIT
insert into codes_promo (code, type, valeur, nb_max, description)
values ('ESSAI-GRATUIT', 'gratuit', 100, 50, 'Séance d''essai offerte pour les adhérents AUNL');
