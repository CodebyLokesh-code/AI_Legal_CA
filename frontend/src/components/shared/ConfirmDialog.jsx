import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export default function ConfirmDialog({ open, onClose, onConfirm, title, description, loading }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{title || "Are you sure?"}</DialogTitle>
          <DialogDescription>
            {description || "Yeh action undo nahi ho sakta."}
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-2 justify-end mt-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={loading}>
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}