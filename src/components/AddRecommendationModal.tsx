"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useCallback, useState } from "react";
import { AddRecommendationForm } from "./AddRecommendationForm";
import { ConfirmModal } from "./ConfirmModal";

interface AddRecommendationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddRecommendationModal({
  isOpen,
  onClose,
}: AddRecommendationModalProps) {
  const [dirty, setDirty] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  const handleRequestClose = useCallback(() => {
    if (dirty) {
      setShowDiscardConfirm(true);
    } else {
      onClose();
    }
  }, [dirty, onClose]);

  const handleDiscardConfirm = useCallback(() => {
    setShowDiscardConfirm(false);
    onClose();
  }, [onClose]);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) handleRequestClose();
    },
    [handleRequestClose]
  );

  return (
    <>
      <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
            <div className="mb-6 flex items-center justify-between">
              <Dialog.Title className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Add recommendation
              </Dialog.Title>
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="rounded p-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </Dialog.Close>
            </div>

            <AddRecommendationForm
              onCancel={handleRequestClose}
              onDirtyChange={setDirty}
              onSuccess={onClose}
            />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <ConfirmModal
        open={showDiscardConfirm}
        onOpenChange={setShowDiscardConfirm}
        title="Unsaved changes"
        description="You have unsaved changes. Discard them?"
        confirmLabel="Discard"
        onConfirm={handleDiscardConfirm}
        destructive
      />
    </>
  );
}
