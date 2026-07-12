'use client';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Props {
  title?: string;
  total?: number;
  totalLabel?: string;
  showFree?: boolean;
  segments?: {
    label: string;
    value: number;
    color: string;
  }[];
  className?: string;
}

export default function Stats13({
  title = 'Status',
  total = 100,
  totalLabel = '',
  showFree = false,
  segments = [],
  className,
}: Props) {
  const segmentTotal = segments.reduce((s, seg) => s + seg.value, 0);

  return (
    <Card className={cn('w-full shadow-sm', className)}>
      <CardContent className="py-0">
        <p className="mb-4 text-pretty text-base text-muted-foreground">
          {title}{' '}
          <span className="font-semibold text-foreground tabular-nums">
            {segmentTotal}
          </span>{' '}
          of {total} {totalLabel}
        </p>

        <div className="mb-4 flex h-2.5 w-full overflow-hidden rounded-full bg-muted">
          {segments.map((segment) => {
            const percentage = (segment.value / total) * 100;
            return (
              <div
                aria-label={segment.label}
                aria-valuemax={total}
                aria-valuemin={0}
                aria-valuenow={segment.value}
                className={cn('h-full', segment.color)}
                key={segment.label}
                role="progressbar"
                style={{ width: `${percentage}%` }}
              />
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          {segments.map((segment) => (
            <div className="flex items-center gap-2" key={segment.label}>
              <span
                aria-hidden="true"
                className={cn('size-3 shrink-0 rounded', segment.color)}
              />
              <span className="text-muted-foreground text-sm">
                {segment.label}
              </span>
              <span className="text-muted-foreground text-sm tabular-nums">
                {segment.value}
              </span>
            </div>
          ))}
          {showFree && (
            <div className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="size-3 shrink-0 rounded-sm bg-muted"
              />
              <span className="text-muted-foreground text-sm">Free</span>
              <span className="text-muted-foreground text-sm tabular-nums">
                {total - segmentTotal}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
