"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DetailedError, parseResponse } from "hono/client";
import { useState } from "react";
import { toast } from "sonner";
import { MissingServicesAlert } from "@/app/(admin)/admin/services/_components/service-missing-alert";
import Loading from "@/app/(admin)/loading";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { ServerDataTable } from "@/components/data-table";
import { usePaginatedSearchState } from "@/hooks/use-paginated-search-state";
import { client } from "@/lib/api-client";
import type { ServiceResponse } from "./_types";
import { getServicesColumns } from "./columns";

export default function ServicesPage() {
  const queryClient = useQueryClient();

  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [serviceToReset, setServiceToReset] = useState<ServiceResponse | null>(null);
  const {
    pageIndex,
    pageSize,
    searchInput,
    debouncedSearch,
    setPageIndex,
    setPageSize,
    setSearchInput,
  } = usePaginatedSearchState({ initialPageSize: 20 });

  const { data, isLoading, isFetching } = useQuery({
    queryKey: [
      "admin",
      "services",
      { page: pageIndex + 1, limit: pageSize, search: debouncedSearch },
    ],
    queryFn: async () =>
      parseResponse(
        client.api.services.$get({
          query: { page: String(pageIndex + 1), limit: String(pageSize), search: debouncedSearch },
        }),
      ),
    placeholderData: (previousData) => previousData,
  });

  const services = data?.services ?? [];
  const pagination = data?.pagination;

  const autoCreateMutation = useMutation({
    mutationFn: async () => {
      const res = await parseResponse(client.api.services["auto-create"].$post());
      return res;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "services"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "services", "missing"] });
      toast.success(data.message ?? "Missing services created");
    },
    onError: (err: unknown) => {
      toast.error(
        err instanceof DetailedError
          ? err.detail.data.error
          : err instanceof Error
            ? err.message
            : "Failed to auto-create services",
      );
    },
    meta: { skipGlobalError: true },
  });

  const operationMutation = useMutation({
    mutationFn: async ({ id, type }: { id: number; type: "provision" | "reset" | "restart" }) => {
      const res = await parseResponse(
        client.api.services[":id"].operations.$post({
          param: { id: String(id) },
          json: { type },
        }),
      );
      return res;
    },
    onSuccess: (_, variables: { id: number; type: "provision" | "reset" | "restart" }) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "services"] });
      toast.success(
        `${variables.type.charAt(0).toUpperCase() + variables.type.slice(1)} operation initiated`,
      );
    },
    onError: (err: unknown) => {
      toast.error(
        err instanceof DetailedError
          ? err.detail.data.error
          : err instanceof Error
            ? err.message
            : "An unexpected error occurred",
      );
    },
    meta: { skipGlobalError: true },
  });

  const handleResetClick = (service: ServiceResponse) => {
    setServiceToReset(service);
    setResetConfirmOpen(true);
  };

  const handleConfirmReset = () => {
    if (serviceToReset !== null) {
      operationMutation.mutate({ id: serviceToReset.id, type: "reset" });
    }
    setResetConfirmOpen(false);
    setServiceToReset(null);
  };

  const handleProvision = (id: number) => {
    operationMutation.mutate({ id, type: "provision" });
  };

  const handleRestart = (id: number) => {
    operationMutation.mutate({ id, type: "restart" });
  };

  const columns = getServicesColumns({
    onProvision: handleProvision,
    onReset: handleResetClick,
    onRestart: handleRestart,
    isProvisioning: operationMutation.isPending,
    isResetting: operationMutation.isPending,
    isRestarting: operationMutation.isPending,
  });

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Service Management</h1>
          <p className="text-muted-foreground">
            Manage team service instances. Services are auto-created and immutable.
          </p>
        </div>
      </div>

      <MissingServicesAlert
        onAutoCreate={() => autoCreateMutation.mutate()}
        isAutoCreating={autoCreateMutation.isPending}
      />

      <div className="px-4 lg:px-6">
        <ServerDataTable
          columns={columns}
          data={services}
          filterPlaceholder="Search services..."
          noResultsText="No services found."
          pageCount={pagination?.totalPages ?? 1}
          totalRows={pagination?.total}
          pageIndex={pageIndex}
          pageSize={pageSize}
          onPageChange={setPageIndex}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPageIndex(0);
          }}
          searchValue={searchInput}
          onSearchChange={setSearchInput}
          isLoading={isFetching}
        />
      </div>

      <ConfirmDialog
        open={resetConfirmOpen}
        onOpenChange={setResetConfirmOpen}
        title="Reset Service"
        description={
          serviceToReset
            ? `Are you sure you want to reset the service for team "${serviceToReset.team?.name}" and challenge "${serviceToReset.challenge?.title}"? This will restore the service to its initial state.`
            : "Are you sure you want to reset this service?"
        }
        confirmText="Reset"
        cancelText="Cancel"
        onConfirm={handleConfirmReset}
        variant="destructive"
      />
    </div>
  );
}
