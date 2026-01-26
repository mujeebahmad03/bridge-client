import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface MappingPreviewProps {
  sourceFields: string[];
  preview: Record<string, string>[];
}

export function MappingPreview({ sourceFields, preview }: MappingPreviewProps) {
  if (preview.length <= 1) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-foreground">Data Preview</h4>
      <div className="rounded-lg border border-border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {sourceFields.slice(0, 5).map((field) => (
                <TableHead key={field} className="min-w-[120px]">
                  {field}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {preview.slice(0, 3).map((row) => {
              console.log("🚀 ~ MappingPreview ~ row:", row);
              return (
                <TableRow key={row.id}>
                  {sourceFields.slice(0, 5).map((field) => (
                    <TableCell
                      key={field}
                      className="text-muted-foreground truncate max-w-[150px]"
                    >
                      {row[field] || "-"}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
