"use client";

import { useMemo, useState } from "react";

import { NewServiceDialog } from "@/components/services/new-service-dialog";
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
import { groupServicesByCategory } from "@/features/services/queries";
import { formatCurrency } from "@/lib/utils";
import type { ServiceFormValues } from "@/lib/validations/service";
import type { Service } from "@/types";

type ServicesViewProps = {
  initialServices: Service[];
};

export function ServicesView({ initialServices }: ServicesViewProps) {
  const [services, setServices] = useState(initialServices);
  const groups = useMemo(() => groupServicesByCategory(services), [services]);

  function handleCreate(values: ServiceFormValues) {
    // Mock-data stage: append locally. Becomes a Supabase insert in Sprint 4.
    const service: Service = { id: `srv-local-${Date.now()}`, ...values };
    setServices((current) => [...current, service]);
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Services"
        description={`${services.length} services on your menu.`}
      >
        <NewServiceDialog onCreate={handleCreate} />
      </PageHeader>

      {groups.map((group) => (
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
      ))}
    </div>
  );
}
