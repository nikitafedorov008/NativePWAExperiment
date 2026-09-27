import { Badge } from '@/ui/web/components/ui/badge';

export default function StreakBadge({ count }) {
  if (!count) return null;
  return (
    <Badge variant="secondary" aria-label={`${count} day streak`} className="shrink-0 tabular-nums">
      🔥 {count}
    </Badge>
  );
}
