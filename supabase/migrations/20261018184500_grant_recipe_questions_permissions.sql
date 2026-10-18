-- Cấp quyền thao tác bảng hỏi đáp (recipe_questions) cho authenticated và service_role
grant select, insert, update, delete on public.recipe_questions to authenticated, service_role;
grant usage, select on all sequences in schema public to authenticated, service_role;
