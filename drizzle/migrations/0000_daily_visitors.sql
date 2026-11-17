CREATE TABLE public.daily_visitor_totals (
 visit_date date PRIMARY KEY,
 visitor_count bigint NOT NULL DEFAULT 0,
 updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.daily_visitor_totals TO anon, authenticated;
GRANT ALL ON public.daily_visitor_totals TO service_role;
ALTER TABLE public.daily_visitor_totals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public daily totals" ON public.daily_visitor_totals FOR SELECT TO anon, authenticated USING (true);
CREATE TABLE public.daily_visitor_keys (
 visit_date date NOT NULL,
 visitor_hash text NOT NULL,
 PRIMARY KEY (visit_date, visitor_hash)
);
GRANT ALL ON public.daily_visitor_keys TO service_role;
ALTER TABLE public.daily_visitor_keys ENABLE ROW LEVEL SECURITY;
CREATE OR REPLACE FUNCTION public.ensure_daily_visitor_date() RETURNS void
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$ INSERT INTO public.daily_visitor_totals(visit_date) VALUES ((now() AT TIME ZONE 'Africa/Lagos')::date) ON CONFLICT DO NOTHING; $$;
REVOKE ALL ON FUNCTION public.ensure_daily_visitor_date() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.ensure_daily_visitor_date() TO service_role;
CREATE OR REPLACE FUNCTION public.record_daily_visit(visitor_key uuid)
RETURNS TABLE(visit_date date, visitor_count bigint)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE today date := (now() AT TIME ZONE 'Africa/Lagos')::date; added integer;
BEGIN
 IF visitor_key IS NULL THEN RAISE EXCEPTION 'Visitor key required'; END IF;
 INSERT INTO public.daily_visitor_totals(visit_date) VALUES(today) ON CONFLICT DO NOTHING;
 INSERT INTO public.daily_visitor_keys(visit_date, visitor_hash) VALUES(today, encode(sha256(convert_to(visitor_key::text || today::text, 'UTF8')), 'hex')) ON CONFLICT DO NOTHING;
 GET DIAGNOSTICS added = ROW_COUNT;
 IF added = 1 THEN UPDATE public.daily_visitor_totals t SET visitor_count = t.visitor_count + 1, updated_at = now() WHERE t.visit_date = today; END IF;
 RETURN QUERY SELECT t.visit_date, t.visitor_count FROM public.daily_visitor_totals t WHERE t.visit_date = today;
END; $$;
REVOKE ALL ON FUNCTION public.record_daily_visit(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_daily_visit(uuid) TO anon, authenticated;
