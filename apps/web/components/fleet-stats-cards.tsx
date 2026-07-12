"use client"

import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FleetStatItem {
  metric: string;
  current: string;
  previous: string;
  trend: 'up' | 'down';
  difference: string;
}

interface FleetStatsCardsProps {
  items: FleetStatItem[];
  cols?: number;
  className?: string;
}

export default function FleetStatsCards({
  items,
  cols = 3,
  className,
}: FleetStatsCardsProps) {
  const gridCols =
    cols === 4
      ? 'md:grid-cols-4'
      : cols === 2
        ? 'md:grid-cols-2'
        : 'md:grid-cols-3';

  return (
    <div className={cn('w-full', className)}>
      <div
        className={cn(
          'grid grid-cols-1 divide-y divide-border overflow-hidden rounded-lg bg-border w-full',
          gridCols,
          'md:divide-x md:divide-y-0'
        )}
      >
        {items.map((item) => (
          <Card
            className="rounded-none border-0 py-0 shadow-sm"
            key={item.metric}
          >
            <CardContent className="p-3 sm:p-4">
              <CardTitle className="font-normal text-sm">
                {item.metric}
              </CardTitle>
              <div className="mt-1 flex items-baseline gap-2 md:block lg:flex lg:flex-wrap">
                <div className="flex items-baseline font-semibold text-xl text-primary tabular-nums">
                  {item.current}
                  <span className="ml-1.5 font-medium text-muted-foreground text-xs tabular-nums">
                    from {item.previous}
                  </span>
                </div>

                <Badge
                  className={cn(
                    'inline-flex items-center px-1.5 py-0.5 ps-2.5 font-medium text-xs tabular-nums md:mt-2 lg:mt-0',
                    item.trend === 'up'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                  )}
                  variant="outline"
                >
                  {item.trend === 'up' ? (
                    <TrendingUp className="-ml-1 mr-0.5 h-5 w-5 shrink-0 self-center text-green-500" />
                  ) : (
                    <TrendingDown className="-ml-1 mr-0.5 h-5 w-5 shrink-0 self-center text-red-500" />
                  )}

                  <span className="sr-only">
                    {' '}
                    {item.trend === 'up' ? 'Increased' : 'Decreased'} by{' '}
                  </span>
                  {item.difference}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
