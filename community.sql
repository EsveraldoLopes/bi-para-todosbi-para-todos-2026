-- Additive migration: reader poll and aggregate referral counts.
BEGIN;
CREATE SCHEMA jpt_community;
REVOKE ALL ON SCHEMA jpt_community FROM PUBLIC;
GRANT USAGE ON SCHEMA jpt_community TO anon, authenticated;
CREATE TABLE jpt_community.polls (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), slug text UNIQUE NOT NULL,
 question text NOT NULL, options jsonb NOT NULL,
 starts_at timestamptz NOT NULL DEFAULT now(), ends_at timestamptz NOT NULL,
 CHECK (ends_at > starts_at), CHECK (jsonb_typeof(options)='array')
);
CREATE TABLE jpt_community.votes (
 poll_id uuid NOT NULL REFERENCES jpt_community.polls(id),
 token_hash text NOT NULL, option_id text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(poll_id,token_hash)
);
CREATE TABLE jpt_community.traffic_daily (
 day date NOT NULL DEFAULT (now() at time zone 'UTC')::date,
 source text NOT NULL CHECK(source IN ('facebook','instagram','whatsapp','telegram','google','other','direct')),
 event text NOT NULL CHECK(event IN ('landing','share','follow')),
 total bigint NOT NULL DEFAULT 1 CHECK(total>=0), PRIMARY KEY(day,source,event)
);
ALTER TABLE jpt_community.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE jpt_community.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE jpt_community.traffic_daily ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON ALL TABLES IN SCHEMA jpt_community FROM PUBLIC,anon,authenticated;

CREATE FUNCTION jpt_community.read_poll(p_token uuid DEFAULT NULL) RETURNS jsonb
LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
 SELECT jsonb_build_object('id',p.id,'question',p.question,'ends_at',p.ends_at,
 'total',(SELECT count(*) FROM jpt_community.votes v WHERE v.poll_id=p.id),
 'selected',(SELECT v.option_id FROM jpt_community.votes v WHERE v.poll_id=p.id AND v.token_hash=encode(sha256(convert_to(p_token::text,'UTF8')),'hex')),
 'options',(SELECT jsonb_agg(jsonb_build_object('id',o->>'id','label',o->>'label','votes',
 (SELECT count(*) FROM jpt_community.votes v WHERE v.poll_id=p.id AND v.option_id=o->>'id')) ORDER BY ord)
 FROM jsonb_array_elements(p.options) WITH ORDINALITY AS opt(o,ord)))
 FROM jpt_community.polls p WHERE p.starts_at<=now() AND p.ends_at>now()
 ORDER BY p.starts_at DESC,p.id LIMIT 1;
$$;
CREATE FUNCTION jpt_community.cast_vote(p_poll uuid,p_option text,p_token uuid) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
 IF p_token IS NULL OR p_token='00000000-0000-0000-0000-000000000000'::uuid OR NOT EXISTS(
  SELECT 1 FROM jpt_community.polls p CROSS JOIN LATERAL jsonb_array_elements(p.options) o
  WHERE p.id=p_poll AND p.starts_at<=now() AND p.ends_at>now() AND o->>'id'=p_option
 ) THEN RAISE EXCEPTION 'Sondagem ou opção indisponível' USING ERRCODE='22023'; END IF;
 INSERT INTO jpt_community.votes(poll_id,token_hash,option_id)
 VALUES(p_poll,encode(sha256(convert_to(p_token::text,'UTF8')),'hex'),p_option)
 ON CONFLICT(poll_id,token_hash) DO NOTHING;
 RETURN jpt_community.read_poll(p_token);
END;
$$;
CREATE FUNCTION jpt_community.record_event(p_source text,p_event text) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
 IF p_source IS NULL OR p_event IS NULL OR p_source NOT IN ('facebook','instagram','whatsapp','telegram','google','other','direct') OR p_event NOT IN ('landing','share','follow')
 THEN RAISE EXCEPTION 'Invalid event' USING ERRCODE='22023'; END IF;
 INSERT INTO jpt_community.traffic_daily(day,source,event,total)
 VALUES((now() at time zone 'UTC')::date,p_source,p_event,1)
 ON CONFLICT(day,source,event) DO UPDATE SET total=jpt_community.traffic_daily.total+1;
END;
$$;
CREATE FUNCTION jpt_community.dashboard() RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path='' AS $$
BEGIN
 IF auth.uid() IS NULL OR NOT EXISTS(SELECT 1 FROM public.profiles WHERE id=auth.uid() AND role='admin')
 THEN RAISE EXCEPTION 'Acesso reservado à administração' USING ERRCODE='42501'; END IF;
 RETURN jsonb_build_object('traffic',coalesce((SELECT jsonb_agg(t ORDER BY t.day DESC,t.source,t.event) FROM (
 SELECT day,source,event,total FROM jpt_community.traffic_daily WHERE day >= (now() at time zone 'UTC')::date-29
 ) t),'[]'::jsonb),'poll',jpt_community.read_poll(NULL),'started_at',
 (SELECT min(starts_at) FROM jpt_community.polls));
END;
$$;
-- The Data API exposes only invoker wrappers; no direct table access.
CREATE FUNCTION public.jpt_current_poll(p_token uuid DEFAULT NULL) RETURNS jsonb
LANGUAGE sql STABLE SECURITY INVOKER SET search_path='' AS $$ SELECT jpt_community.read_poll(p_token); $$;
CREATE FUNCTION public.jpt_vote(p_poll uuid,p_option text,p_token uuid) RETURNS jsonb
LANGUAGE sql SECURITY INVOKER SET search_path='' AS $$ SELECT jpt_community.cast_vote(p_poll,p_option,p_token); $$;
CREATE FUNCTION public.jpt_record_event(p_source text,p_event text) RETURNS void
LANGUAGE sql SECURITY INVOKER SET search_path='' AS $$ SELECT jpt_community.record_event(p_source,p_event); $$;
CREATE FUNCTION public.jpt_community_dashboard() RETURNS jsonb
LANGUAGE sql STABLE SECURITY INVOKER SET search_path='' AS $$ SELECT jpt_community.dashboard(); $$;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA jpt_community FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION jpt_community.read_poll(uuid),jpt_community.cast_vote(uuid,text,uuid),jpt_community.record_event(text,text) TO anon,authenticated;
GRANT EXECUTE ON FUNCTION jpt_community.dashboard() TO authenticated;
REVOKE ALL ON FUNCTION public.jpt_current_poll(uuid),public.jpt_vote(uuid,text,uuid),public.jpt_record_event(text,text),public.jpt_community_dashboard() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.jpt_current_poll(uuid),public.jpt_vote(uuid,text,uuid),public.jpt_record_event(text,text) TO anon,authenticated;
GRANT EXECUTE ON FUNCTION public.jpt_community_dashboard() TO authenticated;
INSERT INTO jpt_community.polls(slug,question,options,ends_at)
VALUES('temas-jingolokela-2026-10','Que tema gostarias de acompanhar mais no Jingolokela?',
 '[{"id":"angola","label":"Angola"},{"id":"mundo","label":"Mundo"},{"id":"diaspora","label":"Diáspora"},{"id":"desporto","label":"Desporto"},{"id":"tecnologia","label":"Tecnologia"},{"id":"oportunidades","label":"Oportunidades"}]',now()+interval '7 days');
NOTIFY pgrst,'reload schema';
COMMIT;
