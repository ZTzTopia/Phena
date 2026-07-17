"use client";

import type { ChallengeModel } from "@phena/schema";
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
import { ChallengeForm } from "@/app/(admin)/admin/challenges/_components/challenge-form";
import Loading from "@/app/(admin)/loading";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { ServerDataTable } from "@/components/data-table";
import { usePaginatedSearchState } from "@/hooks/use-paginated-search-state";
import { client } from "@/lib/api-client";
import type { ChallengeFormInput, ChallengeResponse } from "./_types";
import { getChallengeColumns } from "./columns";

type DialogMode = "create" | "update" | null;

export default function ChallengesPage() {
  const queryClient = useQueryClient();

  const [dialogState, setDialogState] = useState<{
    mode: DialogMode;
    open: boolean;
  }>({ mode: null, open: false });
  const [selectedChallenge, setSelectedChallenge] = useState<ChallengeResponse | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [challengeToDelete, setChallengeToDelete] = useState<string | null>(null);
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
    queryKey: [
      "admin",
      "challenges",
      { page: pageIndex + 1, limit: pageSize, search: debouncedSearch },
    ],
    queryFn: async () =>
      parseResponse(
        client.api.challenges.$get({
          query: { page: String(pageIndex + 1), limit: String(pageSize), search: debouncedSearch },
        }),
      ),
    placeholderData: (previousData) => previousData,
  });

  const challenges = data?.challenges ?? [];
  const pagination = data?.pagination;

  const createMutation = useMutation({
    mutationFn: async (data: ChallengeModel["createChallenge"]) => {
      const res = await parseResponse(
        client.api.challenges.$post({
          json: data,
        }),
      );
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "challenges"] });
      toast.success("Challenge created");
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
    mutationFn: async ({
      publicId,
      data,
    }: {
      publicId: string;
      data: ChallengeModel["updateChallenge"];
    }) => {
      const res = await parseResponse(
        client.api.challenges[":publicId"].$put({
          param: { publicId },
          json: data,
        }),
      );
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "challenges"] });
      toast.success("Challenge updated");
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
    mutationFn: async (publicId: string) => {
      const res = await parseResponse(
        client.api.challenges[":publicId"].$delete({
          param: { publicId },
        }),
      );
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "challenges"] });
      toast.success("Challenge deleted");
      setDeleteConfirmOpen(false);
      setChallengeToDelete(null);
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
      setChallengeToDelete(null);
    },
    meta: { skipGlobalError: true },
  });

  const uploadMutation = useMutation({
    mutationFn: async ({ publicId, file }: { publicId: string; file: File }) => {
      const formData = new FormData();
      formData.append("file", file);

      const res = await client.api.challenges[":publicId"].upload.$post(
        { param: { publicId } },
        formData as unknown as Record<string, unknown>,
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error((data as { error?: string }).error || "Upload failed");
      }

      return res.json();
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "An unexpected error occurred");
    },
    meta: { skipGlobalError: true },
  });

  const handleDownload = async (challenge: ChallengeResponse) => {
    try {
      const res = await client.api.challenges[":publicId"].download.$get({
        param: { publicId: challenge.id },
      });

      if (!res.ok) {
        throw new Error("Download failed");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = challenge.filePath?.split("/").pop() || "challenge-file";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "An unexpected error occurred");
    }
  };

  const openCreateDialog = () => {
    setSelectedChallenge(null);
    setDialogState({ mode: "create", open: true });
  };

  const openEditDialog = (challenge: ChallengeResponse) => {
    setSelectedChallenge(challenge);
    setDialogState({ mode: "update", open: true });
  };

  const closeDialog = () => {
    setDialogState({ mode: dialogState.mode, open: false });
    setSelectedChallenge(null);
  };

  const handleDeleteClick = (id: string) => {
    setChallengeToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (challengeToDelete !== null) {
      deleteMutation.mutate(challengeToDelete);
    }
  };

  const handleFormSubmit = async (data: ChallengeFormInput) => {
    const { file, ...challengeData } = data;

    if (dialogState.mode === "create") {
      const result = await createMutation.mutateAsync(challengeData);

      if (file && result.challenge.id) {
        await uploadMutation.mutateAsync({
          publicId: result.challenge.id,
          file,
        });
      }
    } else if (selectedChallenge) {
      await updateMutation.mutateAsync({
        publicId: selectedChallenge.id,
        data: challengeData,
      });

      if (file) {
        await uploadMutation.mutateAsync({
          publicId: selectedChallenge.id,
          file,
        });
      }
    }
  };

  const columns = getChallengeColumns({
    onEdit: openEditDialog,
    onDelete: handleDeleteClick,
    onDownload: handleDownload,
    isDeleting: deleteMutation.isPending,
  });

  if (isLoading) {
    return <Loading />;
  }

  if (isError && !data) {
    return <QueryError onRetry={() => refetch()} message="Failed to load challenges" />;
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="flex items-center justify-between px-4 lg:px-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Challenge Management</h1>
          <p className="text-muted-foreground">Create and manage Attack & Defense challenges</p>
        </div>
        <Button onClick={openCreateDialog}>
          <PlusIcon className="mr-2 size-4" />
          New Challenge
        </Button>
      </div>

      <div className="px-4 lg:px-6">
        <ServerDataTable<ChallengeResponse>
          columns={columns}
          data={challenges}
          filterPlaceholder="Search challenges..."
          noResultsText='No challenges yet. Click "New Challenge" to create one.'
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {dialogState.mode === "create" ? "New Challenge" : "Edit Challenge"}
            </DialogTitle>
            <DialogDescription>
              {dialogState.mode === "create"
                ? "Create a new Attack & Defense challenge"
                : "Update challenge configuration"}
            </DialogDescription>
          </DialogHeader>
          <ChallengeForm
            defaultValues={selectedChallenge}
            mode={dialogState.mode ?? "create"}
            onSubmit={handleFormSubmit}
            onCancel={closeDialog}
            isSubmitting={
              createMutation.isPending || updateMutation.isPending || uploadMutation.isPending
            }
            submitLabel={dialogState.mode === "create" ? "Create Challenge" : "Save Changes"}
          />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Challenge"
        description="Are you sure you want to delete this challenge? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        variant="destructive"
      />
    </div>
  );
}
