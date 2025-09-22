import type { ComponentProps, HTMLAttributes } from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type StatusProps = ComponentProps<typeof Badge> & {
  status: 'accepted' | 'pending' | 'blocked' | 'cancelled' | 'connection-sent';
};

export const Status = ({ className, status, ...props }: StatusProps) => (
  <Badge
    className={cn('flex items-center gap-2', 'group', status, className)}
    variant="secondary"
    {...props}
  />
);

export type StatusIndicatorProps = HTMLAttributes<HTMLSpanElement>;

export const StatusIndicator = ({
  className,
  ...props
}: StatusIndicatorProps) => (
  <span className={cn("relative flex h-2 w-2", className)} {...props}>
    <span
      className={cn(
        'absolute inline-flex h-full w-full animate-ping rounded-full opacity-75',
        'group-[.accepted]:bg-emerald-500',
        'group-[.pending]:bg-amber-500',
        'group-[.blocked]:bg-red-500',
        'group-[.cancelled]:bg-gray-500',
        'group-[.connection-sent]:bg-blue-500'
      )}
    />
    <span
      className={cn(
        'relative inline-flex h-2 w-2 rounded-full',
        'group-[.accepted]:bg-emerald-500',
        'group-[.pending]:bg-amber-500',
        'group-[.blocked]:bg-red-500',
        'group-[.cancelled]:bg-gray-500',
        'group-[.connection-sent]:bg-blue-500'
      )}
    />
  </span>
);

export type StatusLabelProps = HTMLAttributes<HTMLSpanElement>;

export const StatusLabel = ({
  className,
  children,
  ...props
}: StatusLabelProps) => (
  <span className={cn('text-muted-foreground', className)} {...props}>
    {children ?? (
      <>
        <span className="hidden group-[.accepted]:block">Accepted</span>
        <span className="hidden group-[.pending]:block">Pending</span>
        <span className="hidden group-[.blocked]:block">Blocked</span>
        <span className="hidden group-[.cancelled]:block">Cancelled</span>
        <span className="hidden group-[.connection-sent]:block">Connection Sent</span>
      </>
    )}
  </span>
);