"use client";

import type { TeamModel } from "@phena/schema";
import { Button } from "@phena/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@phena/ui/components/dialog";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DetailedError, parseResponse } from "hono/client";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { QueryError } from "@/app/(admin)/_components/query-error";
import { TeamForm } from "@/app/(admin)/admin/teams/_components/team-form";
import Loading from "@/app/(admin)/loading";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { ServerDataTable } from "@/components/data-table";
import { usePaginatedSearchState } from "@/hooks/use-paginated-search-state";
import { client } from "@/lib/api-client";
import type { TeamResponse } from "./_types";
import { getTeamColumns } from "./columns";

type DialogMode = "create" | "edit" | null;

export default function TeamsPage() {
  const queryClient = useQueryClient();

  const [dialogState, setDialogState] = useState<{
    mode: DialogMode;
    open: boolean;
  }>({ mode: null, open: false });
  const [selectedTeam, setSelectedTeam] = useState<TeamResponse | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<string | null>(null);
  const {
    pageIndex,
    pageSize,
    searchInput,
    debouncedSearch,
    setPageIndex,
    setPageSize,
    setSearchInput,
  } = usePaginatedSearchState({ initialPageSize: 20 });

  const { data, isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: ["admin", "teams", { page: pageIndex + 1, limit: pageSize, search: debouncedSearch }],
    queryFn: async () =>
      parseResponse(
        client.api.teams.$get({
          query: { page: String(pageIndex + 1), limit: String(pageSize), search: debouncedSearch },
        }),
      ),
    placeholderData: (previousData) => previousData,
  });

  const teams = data?.teams ?? [];
  const pagination = data?.pagination;

  const createMutation = useMutation({
    mutationFn: async (data: TeamModel["createTeam"]) => {
      const res = await parseResponse(
        client.api.teams.$post({
          json: data,
        }),
      );
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "teams"] });
      toast.success("Team created");
      closeDialog();
    },
    onError: (err) => {
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

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: TeamModel["updateTeam"] }) => {
      const res = await parseResponse(
        client.api.teams[":publicId"].$put({
          param: { publicId: id },
          json: data,
        }),
      );
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "teams"] });
      toast.success("Team updated");
      closeDialog();
    },
    onError: (err) => {
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

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await parseResponse(
        client.api.teams[":publicId"].$delete({
          param: { publicId: id },
        }),
      );
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "teams"] });
      toast.success("Team deleted");
      setDeleteConfirmOpen(false);
      setTeamToDelete(null);
    },
    onError: (err) => {
      toast.error(
        err instanceof DetailedError
          ? err.detail.data.error
          : err instanceof Error
            ? err.message
            : "An unexpected error occurred",
      );
      setDeleteConfirmOpen(false);
      setTeamToDelete(null);
    },
    meta: { skipGlobalError: true },
  });

  const openCreateDialog = () => {
    setSelectedTeam(null);
    setDialogState({ mode: "create", open: true });
  };

  const openEditDialog = (team: TeamResponse) => {
    setSelectedTeam(team);
    setDialogState({ mode: "edit", open: true });
  };

  const closeDialog = () => {
    setDialogState({ mode: dialogState.mode, open: false });
    setSelectedTeam(null);
  };

  const handleDeleteClick = (id: string) => {
    setTeamToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (teamToDelete !== null) {
      deleteMutation.mutate(teamToDelete);
    }
  };

  const handleFormSubmit = (data: TeamModel["createTeam"] | TeamModel["updateTeam"]) => {
    if (dialogState.mode === "create") {
      createMutation.mutate(data as TeamModel["createTeam"]);
    } else if (dialogState.mode === "edit" && selectedTeam) {
      updateMutation.mutate({
        id: selectedTeam.id,
        data: data as TeamModel["updateTeam"],
      });
    }
  };

  const columns = getTeamColumns({
    onEdit: openEditDialog,
    onDelete: handleDeleteClick,
    isDeleting: deleteMutation.isPending,
  });

  if (isLoading) {
    return <Loading />;
  }

  if (isError && !data) {
    return <QueryError onRetry={() => refetch()} message="Failed to load teams" />;
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="flex items-center justify-between px-4 lg:px-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Team Management</h1>
          <p className="text-muted-foreground">Create and manage teams</p>
        </div>
        <Button onClick={openCreateDialog}>
          <PlusIcon className="mr-2 size-4" />
          New Team
        </Button>
      </div>

      <div className="px-4 lg:px-6">
        <ServerDataTable<TeamResponse>
          columns={columns}
          data={teams}
          filterPlaceholder="Search teams..."
          noResultsText='No teams yet. Click "New Team" to create one.'
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

      <Dialog open={dialogState.open} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{dialogState.mode === "create" ? "New Team" : "Edit Team"}</DialogTitle>
            <DialogDescription>
              {dialogState.mode === "create"
                ? "Create a new team with login credentials"
                : "Update team information"}
            </DialogDescription>
          </DialogHeader>
          <TeamForm
            defaultValues={{
              name: selectedTeam?.name ?? "",
              password: "",
            }}
            onSubmit={handleFormSubmit}
            onCancel={closeDialog}
            isSubmitting={
              dialogState.mode === "create" ? createMutation.isPending : updateMutation.isPending
            }
            submitLabel={dialogState.mode === "create" ? "Create Team" : "Save Changes"}
          />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Team"
        description="Are you sure you want to delete this team? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        variant="destructive"
      />
    </div>
  );
}
