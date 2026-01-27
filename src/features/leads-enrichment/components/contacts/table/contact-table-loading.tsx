import { Skeleton } from "@/components/ui/skeleton";

interface ContactTableLoadingBodyProps {
  dataColumnsCount: number;
  rows?: number;
}

export function ContactTableLoadingBody({
  dataColumnsCount,
  rows = 10,
}: ContactTableLoadingBodyProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={rowIndex} className="border-b border-border">
          {/* Selector column */}
          <td className="sticky left-0 z-10 bg-background border-r border-border w-[60px] min-w-[60px]">
            <div className="flex items-center gap-1 px-2 py-1">
              <Skeleton className="h-4 w-4" />
            </div>
          </td>

          {/* Data columns */}
          {Array.from({ length: dataColumnsCount }).map((_, colIndex) => (
            <td
              key={colIndex}
              className="border-r border-border p-0"
              style={{ width: 120, minWidth: 120, maxWidth: 120 }}
            >
              <div className="px-2 py-1">
                <Skeleton className="h-4 w-full" />
              </div>
            </td>
          ))}

          {/* Add Column cell */}
          <td className="border-r border-border w-[50px] min-w-[50px] p-0" />

          {/* Empty cell for remaining space */}
          <td className="w-full" />
        </tr>
      ))}
    </>
  );
}
