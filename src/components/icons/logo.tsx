import { cn } from '@/lib/utils';
import { useSidebar } from '@/components/ui/sidebar';

export function Logo({ className }: { className?: string }) {
  const { state } = useSidebar();

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 text-primary"
      >
        <rect width="32" height="32" rx="8" fill="currentColor" />
        <path
          d="M10 16H22"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M16 10V22"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M19 13H18C16.8954 13 16 13.8954 16 15V15C16 16.1046 15.1046 17 14 17H13"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span
        className={cn(
          'font-headline text-xl font-bold tracking-tight',
          'duration-200 ease-linear',
          'group-data-[collapsible=icon]/sidebar-wrapper:hidden'
        )}
      >
        SpendWise
      </span>
    </div>
  );
}
