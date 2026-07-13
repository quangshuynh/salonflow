"use client";

import { useMemo } from "react";
import { Scissors } from "lucide-react";

import { NewServiceDialog } from "@/components/services/new-service-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { groupServicesByCategory } from "@/features/services/helpers";
import { formatCurrency } from "@/lib/utils";
import type { Service } from "@/types";

type ServicesViewProps = {
  services: Service[];
};

export function ServicesView({ services }: ServicesViewProps) {
  const groups = useMemo(() => groupServicesByCategory(services), [services]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Services"
        description={`${services.length} ${services.length === 1 ? "service" : "services"} on your menu.`}
      >
        <NewServiceDialog />
      </PageHeader>

      {groups.length === 0 ? (
        <EmptyState
          icon={Scissors}
          title="No services yet"
          description="Add your first service so appointments have something to book."
        />
      ) : (
        groups.map((group) => (
          <Card key={group.category}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {group.label}
                <Badge variant="secondary">{group.services.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead className="text-right">Duration</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {group.services.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell className="font-medium">
                        {service.name}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground tabular-nums">
                        {service.durationMin} min
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums">
                        {formatCurrency(service.price)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
