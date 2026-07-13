"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";

import { CustomerDialog } from "@/components/customers/customer-dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { deleteCustomer } from "@/features/customers/actions";
import type { Customer } from "@/types";

export function CustomerActions({ customer }: { customer: Customer }) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <Button variant="outline" onClick={() => setEditOpen(true)}>
        <Pencil data-icon="inline-start" />
        Edit
      </Button>
      <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
        <Trash2 data-icon="inline-start" />
        Delete
      </Button>
      <CustomerDialog
        customer={customer}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={`Delete ${customer.name}?`}
        description="This permanently deletes the customer and their entire appointment history. This can't be undone."
        confirmLabel="Delete customer"
        onConfirm={() => deleteCustomer(customer.id)}
      />
    </>
  );
}
