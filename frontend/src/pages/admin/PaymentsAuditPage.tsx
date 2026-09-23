import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { paymentsApi } from "@/api/payments";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CreditCard, Search, ShieldCheck } from "lucide-react";

export const PaymentsAuditPage: React.FC = () => {
  const [orderIdQuery, setOrderIdQuery] = useState("");
  const [searchedId, setSearchedId] = useState("");

  const { data: payments = [], isLoading, refetch } = useQuery({
    queryKey: ["paymentsLedger", searchedId],
    queryFn: () => paymentsApi.getByOrderId(searchedId),
    enabled: !!searchedId,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderIdQuery.trim()) return;
    setSearchedId(orderIdQuery.trim());
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Payments Ledger & Audit
          </h1>
          <Badge variant="default">Payment Service :8086</Badge>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Inspect idempotent captured transactions, payment keys, and audit logs.
        </p>
      </div>

      {/* Lookup Card */}
      <Card className="p-6">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 items-end max-w-xl">
          <div className="flex-1 w-full">
            <Input
              label="Search by Order UUID"
              placeholder="e.g. 11111111-2222-3333-4444-555555555555"
              value={orderIdQuery}
              onChange={(e) => setOrderIdQuery(e.target.value)}
              required
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            leftIcon={<Search className="w-4 h-4" />}
          >
            Audit Payments
          </Button>
        </form>
      </Card>

      {/* Results */}
      {searchedId && (
        <div className="space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Audit Records for Order: <span className="font-mono text-slate-700 dark:text-slate-300">{searchedId}</span>
          </h3>

          {isLoading ? (
            <div className="flex h-32 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            </div>
          ) : payments.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-xs text-slate-500">
              No payments recorded for this order UUID.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payment UUID</TableHead>
                  <TableHead>Idempotency Key</TableHead>
                  <TableHead>Settlement Status</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead className="text-right">Amount Captured</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-xs font-semibold">
                      {p.id}
                    </TableCell>
                    <TableCell className="font-mono text-[11px] text-slate-500">
                      {p.idempotencyKey}
                    </TableCell>
                    <TableCell>
                      <Badge variant="success" size="sm">{p.status}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {formatDate(p.createdAt)}
                    </TableCell>
                    <TableCell className="text-right text-xs font-bold text-slate-900 dark:text-white">
                      {formatCurrency(p.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      )}
    </div>
  );
};
