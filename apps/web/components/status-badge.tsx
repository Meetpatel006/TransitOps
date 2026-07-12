import { Badge } from '@/components/ui/badge';

type StatusVariant = 'success' | 'info' | 'warning' | 'danger' | 'neutral';

export function StatusBadge({ status }: { status: string }) {
  let variant: StatusVariant = 'neutral';
  
  const statusLower = status.toLowerCase();
  
  if (['available', 'completed', 'active'].includes(statusLower)) variant = 'success';
  else if (['on trip', 'dispatched'].includes(statusLower)) variant = 'info';
  else if (['in shop', 'in progress', 'pending'].includes(statusLower)) variant = 'warning';
  else if (['suspended', 'cancelled', 'expired'].includes(statusLower)) variant = 'danger';
  else if (['off duty', 'draft', 'retired', 'inactive', 'unassigned'].includes(statusLower)) variant = 'neutral';

  switch (variant) {
    case 'success':
      return (
        <Badge className="border-0 bg-green-500/15 text-green-700 hover:bg-green-500/25 dark:bg-green-500/10 dark:text-green-400 dark:hover:bg-green-500/20" variant="outline">
          {status}
        </Badge>
      );
    case 'info':
      return (
        <Badge className="border-0 bg-blue-500/15 text-blue-700 hover:bg-blue-500/25 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20" variant="outline">
          {status}
        </Badge>
      );
    case 'warning':
      return (
        <Badge className="border-0 bg-amber-500/15 text-amber-700 hover:bg-amber-500/25 dark:bg-amber-500/10 dark:text-amber-300 dark:hover:bg-amber-500/20" variant="outline">
          {status}
        </Badge>
      );
    case 'danger':
      return (
        <Badge className="border-0 bg-rose-500/15 text-rose-700 hover:bg-rose-500/25 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20" variant="outline">
          {status}
        </Badge>
      );
    case 'neutral':
    default:
      return (
        <Badge className="border-0 bg-slate-500/15 text-slate-700 hover:bg-slate-500/25 dark:bg-slate-500/10 dark:text-slate-400 dark:hover:bg-slate-500/20" variant="outline">
          {status}
        </Badge>
      );
  }
}
