-- Agrega a Raquel Peña como opción de precandidata

alter table public.dirigentes drop constraint if exists dirigentes_preferencia_check;
alter table public.dirigentes add constraint dirigentes_preferencia_check
  check (preferencia in ('DC','CM','WA','GG','YL','TP','RP'));
