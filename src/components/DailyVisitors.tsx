import { useEffect, useState } from 'react';
import { Users, Globe } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export function DailyVisitors() {
  const [stats, setStats] = useState<{ today: number; allTime: number } | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    async function refresh() {
      try {
        let key = localStorage.getItem('daily-visitor-key');
        if (!key || !/^[0-9a-f-]{36}$/i.test(key)) {
          key = crypto.randomUUID();
          localStorage.setItem('daily-visitor-key', key);
        }
        const { data, error } = await supabase.rpc('record_visit_stats', { visitor_key: key });
        if (error) throw error;
        if (active && data?.[0]) {
          setStats({ today: Number(data[0].today_count), allTime: Number(data[0].all_time_count) });
          setFailed(false);
        }
      } catch {
        if (active) setFailed(true);
      }
    }
    void refresh();
    const onFocus = () => { void refresh(); };
    window.addEventListener('focus', onFocus);
    // No idle polling: refresh only when the player returns to the app.
    return () => { active = false; window.removeEventListener('focus', onFocus); };
  }, []);

  const show = (n?: number) => (stats ? n!.toLocaleString() : failed ? '—' : '…');

  return (
    <div className="grid grid-cols-2 divide-x divide-border border-t border-border py-3 text-foreground" aria-label="Visitors">
      <div className="flex items-center justify-center gap-2 px-2">
        <Users className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
        <div className="min-w-0 text-left">
          <p className="text-xs text-muted-foreground">Today</p>
          <p className="text-lg font-semibold tabular-nums leading-tight" aria-live="polite">{show(stats?.today)}</p>
        </div>
      </div>
      <div className="flex items-center justify-center gap-2 px-2">
        <Globe className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
        <div className="min-w-0 text-left">
          <p className="text-xs text-muted-foreground">All time</p>
          <p className="text-lg font-semibold tabular-nums leading-tight">{show(stats?.allTime)}</p>
        </div>
      </div>
    </div>
  );
}
