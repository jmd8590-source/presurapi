-- Presurapi — bucket de Storage para logos de empresa
--
-- Privado: el logo se sirve mediante URL firmada generada en el servidor
-- (service role), tanto en el panel del usuario como en el PDF/enlace
-- público del presupuesto (Fase 5). Así no se expone el bucket completo.
-- Convención de ruta: "<user_id>/logo.<ext>" — cada usuario solo puede
-- tocar su propia carpeta.
insert into
  storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'logos',
    'logos',
    false,
    2097152, -- 2 MB
    array['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp']
  );

create policy logos_select on storage.objects
for select
to authenticated
using (
  bucket_id = 'logos'
  and (select auth.uid ()::text) = (storage.foldername (name)) [1]
);

create policy logos_insert on storage.objects
for insert
to authenticated
with
  check (
    bucket_id = 'logos'
    and (select auth.uid ()::text) = (storage.foldername (name)) [1]
  );

create policy logos_update on storage.objects
for update
to authenticated
using (
  bucket_id = 'logos'
  and (select auth.uid ()::text) = (storage.foldername (name)) [1]
)
with
  check (
    bucket_id = 'logos'
    and (select auth.uid ()::text) = (storage.foldername (name)) [1]
  );

create policy logos_delete on storage.objects
for delete
to authenticated
using (
  bucket_id = 'logos'
  and (select auth.uid ()::text) = (storage.foldername (name)) [1]
);
