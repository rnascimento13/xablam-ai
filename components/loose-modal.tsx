"use client";

import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLooseModal } from "@/hooks/use-loose-modal";

export const LooseModal = () => { // ask before remove img
  const looseModal = useLooseModal();

  const onConfirm = async () => {
    looseModal.onConfirm()
    looseModal.onClose()
  }

  return (
    <Dialog open={looseModal.isOpen} onOpenChange={looseModal.onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex justify-center items-center flex-col gap-y-4 pb-2">
            <div className="flex items-center gap-x-2 font-bold text-xl">
              Warning!
            </div>
          </DialogTitle>
          <DialogDescription className="text-center pt-2 space-y-2 text-zinc-900 font-medium">
            <div className="font-semibold text-sm">
              This will erase you previous image, do you want to continue?
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={onConfirm} size="lg" variant="default" className="object-left">
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
