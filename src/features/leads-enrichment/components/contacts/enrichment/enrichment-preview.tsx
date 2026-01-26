import {
  ArrowLeft,
  ArrowRightLeft,
  CheckCircle2,
  User,
  Workflow,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { EnrichmentPreviewResponse } from "@/leads/types";

interface EnrichmentPreviewProps {
  preview: EnrichmentPreviewResponse | null;
  isLoading: boolean;
  onApprove: () => void;
  onBack: () => void;
  isApproving: boolean;
}

export function EnrichmentPreview({
  preview,
  isLoading,
  onApprove,
  onBack,
  isApproving,
}: EnrichmentPreviewProps) {
  if (isLoading || !preview) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="font-normal">
          {preview.enrichment_type === "PRESET"
            ? preview.preset_action?.replace(/_/g, " ")
            : "Custom AI"}
        </Badge>
        <Badge variant="secondary" className="font-normal">
          {preview.contact_count} contact
          {preview.contact_count !== 1 ? "s" : ""}
        </Badge>
        <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 font-normal">
          Preview
        </Badge>
      </div>

      {/* Pipeline Visualization */}
      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-center gap-2 mb-4">
          <Workflow className="h-4 w-4 text-primary" />
          <h4 className="font-medium text-sm">Enrichment Pipeline</h4>
        </div>
        <div className="space-y-3">
          {preview.pipeline.map((pipe, index) => (
            <div
              key={pipe.pipe_id}
              className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border"
            >
              <div className="shrink-0 h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-mono text-xs text-muted-foreground truncate">
                  {pipe.pipe_id}
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  {/* Input fields */}
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground">In:</span>
                    {Object.entries(pipe.config.input_fields).map(
                      ([key, val]) => (
                        <Badge
                          key={key}
                          variant="outline"
                          className="text-xs font-normal"
                        >
                          {val.alias}
                        </Badge>
                      )
                    )}
                  </div>
                  <ArrowRightLeft className="h-3 w-3 text-muted-foreground" />
                  {/* Output fields */}
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground">Out:</span>
                    {Object.entries(pipe.config.output_fields).map(
                      ([key, val]) => (
                        <Badge
                          key={key}
                          className="text-xs font-normal bg-primary/10 text-primary border-primary/20"
                        >
                          {val.alias}
                        </Badge>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contacts Preview */}
      <div className="rounded-lg border bg-card">
        <div className="flex items-center gap-2 p-4 border-b">
          <User className="h-4 w-4 text-primary" />
          <h4 className="font-medium text-sm">Contacts to Enrich</h4>
        </div>
        <ScrollArea className="max-h-[200px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Name</TableHead>
                <TableHead>Email</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {preview.contacts.slice(0, 10).map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell className="font-medium">
                    {contact.first_name} {contact.last_name}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {contact.email_address}
                  </TableCell>
                </TableRow>
              ))}
              {preview.contacts.length > 10 && (
                <TableRow>
                  <TableCell
                    colSpan={2}
                    className="text-center text-muted-foreground text-sm"
                  >
                    +{preview.contacts.length - 10} more contacts
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-2">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button onClick={onApprove} disabled={isApproving} className="gap-2">
          {isApproving ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Approving...
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4" />
              Approve & Start
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
