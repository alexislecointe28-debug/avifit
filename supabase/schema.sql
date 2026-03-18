-- =============================================
-- AVIFIT — Schema Supabase
-- Projet : kiyhjgikyjduyupnubuc
-- =============================================

-- SÉANCES
create table if not exists seances (
  id uuid primary key default gen_random_uuid(),
  titre text not null,
  type text not null check (type in ('avifit_debutant', 'avifit_intermediaire', 'avifit_tous_niveaux')),
  date date not null,
  heure_debut time not null,
  heure_fin time not null,
  places_max integer not null default 10,
  places_reservees integer not null default 0,
  prix integer not null default 1000, -- en centimes
  statut text not null default 'disponible' check (statut in ('disponible', 'complet', 'annule')),
  created_at timestamptz default now()
);

-- RÉSERVATIONS
create table if not exists reservations (
  id uuid primary key default gen_random_uuid(),
  seance_id uuid not null references seances(id) on delete cascade,
  client_email text not null,
  client_nom text not null,
  client_prenom text not null,
  statut text not null default 'pending' check (statut in ('pending', 'confirmed', 'cancelled')),
  stripe_payment_id text,
  stripe_session_id text,
  avec_licence_ffa boolean not null default false,
  montant_total integer not null, -- en centimes
  created_at timestamptz default now()
);

-- ACHATS FORFAIT (10 séances)
create table if not exists achats_forfait (
  id uuid primary key default gen_random_uuid(),
  client_email text not null,
  client_nom text not null,
  client_prenom text not null,
  seances_restantes integer not null default 10,
  expire_le date not null default (current_date + interval '3 months'),
  stripe_payment_id text not null,
  created_at timestamptz default now()
);

-- INDEX utiles
create index if not exists seances_date_idx on seances(date);
create index if not exists seances_statut_idx on seances(statut);
create index if not exists reservations_seance_idx on reservations(seance_id);
create index if not exists reservations_email_idx on reservations(client_email);
create index if not exists reservations_session_idx on reservations(stripe_session_id);
create index if not exists achats_forfait_email_idx on achats_forfait(client_email);

-- RLS désactivé (auth simplifiée comme Paynelope)
alter table seances disable row level security;
alter table reservations disable row level security;
alter table achats_forfait disable row level security;

-- TRIGGER : met à jour places_reservees automatiquement
create or replace function update_places_reservees()
returns trigger as $$
begin
  if TG_OP = 'INSERT' and NEW.statut = 'confirmed' then
    update seances
    set places_reservees = places_reservees + 1,
        statut = case when places_reservees + 1 >= places_max then 'complet' else 'disponible' end
    where id = NEW.seance_id;
  elsif TG_OP = 'UPDATE' and OLD.statut != 'confirmed' and NEW.statut = 'confirmed' then
    update seances
    set places_reservees = places_reservees + 1,
        statut = case when places_reservees + 1 >= places_max then 'complet' else 'disponible' end
    where id = NEW.seance_id;
  elsif TG_OP = 'UPDATE' and OLD.statut = 'confirmed' and NEW.statut = 'cancelled' then
    update seances
    set places_reservees = greatest(places_reservees - 1, 0),
        statut = 'disponible'
    where id = NEW.seance_id;
  end if;
  return NEW;
end;
$$ language plpgsql;

create or replace trigger trigger_places_reservees
after insert or update on reservations
for each row execute function update_places_reservees();

-- DONNÉES DE TEST (à supprimer en prod)
insert into seances (titre, type, date, heure_debut, heure_fin, places_max, prix) values
  ('Avifit — Débutant', 'avifit_debutant', current_date + 2, '19:00', '20:00', 10, 1000),
  ('Avifit — Intermédiaire', 'avifit_intermediaire', current_date + 4, '18:30', '19:30', 10, 1000),
  ('Avifit — Tous niveaux', 'avifit_tous_niveaux', current_date + 6, '10:00', '11:00', 10, 1000),
  ('Avifit — Débutant', 'avifit_debutant', current_date + 9, '19:00', '20:00', 10, 1000),
  ('Avifit — Intermédiaire', 'avifit_intermediaire', current_date + 11, '18:30', '19:30', 10, 1000),
  ('Avifit — Tous niveaux', 'avifit_tous_niveaux', current_date + 13, '10:00', '11:00', 10, 1000);
