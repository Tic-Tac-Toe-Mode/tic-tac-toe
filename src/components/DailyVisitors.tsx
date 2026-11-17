import { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export function DailyVisitors() {
  const [total, setTotal] = useState<number | null>(null);
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
        const { data, error } = await supabase.rpc('record_daily_visit', { visitor_key: key });
        if (error) throw error;
        if (active && data?.[0]) {
          setTotal(Number(data[0].visitor_count));
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

  return (
    <div className="flex items-center justify-center gap-3 border-t border-border py-3 text-foreground" aria-label="Daily visitors">
      <Users className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">Visitors today</p>
        <p className="text-xs text-muted-foreground">Lagos · UTC+1</p>
      </div>
      <span className="min-w-8 text-right text-xl font-semibold tabular-nums" aria-live="polite">
        {total !== null ? total.toLocaleString() : failed ? 'Unavailable' : '…'}
      </span>
    </div>
  );
}