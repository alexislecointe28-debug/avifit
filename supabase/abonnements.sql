-- Abonnements mercredi
create table if not exists abonnements (
  id uuid primary key default gen_random_uuid(),
  client_email text not null,
  client_nom text not null,
  client_prenom text not null,
  stripe_subscription_id text not null unique,
  stripe_customer_id text not null,
  statut text not null default 'active' check (statut in ('active', 'cancelled', 'paused')),
  est_adherent boolean not null default false,
  avec_licence_ffa boolean not null default false,
  montant_semaine integer not null, -- en centimes
  debut_le date not null default current_date,
  fin_engagement date not null,     -- début + 4 semaines minimum
  created_at timestamptz default now()
);

create index if not exists abonnements_email_idx on abonnements(client_email);
create index if not exists abonnements_stripe_idx on abonnements(stripe_subscription_id);
alter table abonnements disable row level security;
