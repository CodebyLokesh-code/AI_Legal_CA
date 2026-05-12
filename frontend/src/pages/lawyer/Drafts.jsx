import { useState, useEffect } from "react"
import { Plus, Pencil, Trash2, FileText } from "lucide-react"
import toast from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import PageHeader from "../../components/shared/PageHeader"
import DataTable from "../../components/shared/DataTable"
import ConfirmDialog from "../../components/shared/ConfirmDialog"
import { getDraftsApi, addDraftApi, updateDraftApi, deleteDraftApi } from "../../api-calls/lawyerApi"
import { getClientsApi } from "../../api-calls/clientApi"

const defaultForm = { clientId: "", title: "", type: "notice", content: "", status: "draft" }

export default function Drafts() {
  const [drafts, setDrafts] = useState([])
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null })
  const [editData, setEditData] = useState(null)
  const [form, setForm] = useState(defaultForm)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [draftRes, clientRes] = await Promise.all([getDraftsApi(), getClientsApi()])
      setDrafts(draftRes.data || [])
      setClients(clientRes.data || [])
    } catch {
      toast.error("Data fetch karne mein error!")
    } finally {
      setLoading(false)
    }
  }

  const openAdd = () => { setEditData(null); setForm(defaultForm); setModalOpen(true) }

  const openEdit = (draft) => {
    setEditData(draft)
    setForm({
      clientId: draft.clientId?._id || draft.clientId || "",
      title: draft.title || "",
      type: draft.type || "notice",
      content: draft.content || "",
      status: draft.status || "draft"
    })
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.clientId || !form.title || !form.type) {
      toast.error("Client, Title aur Type required hai!")
      return
    }
    setSaving(true)
    try {
      if (editData) {
        await updateDraftApi(editData._id, form)
        toast.success("Draft updated!")
      } else {
        await addDraftApi(form)
        toast.success("Draft added!")
      }
      setModalOpen(false)
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.message || "Error!")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteDraftApi(deleteDialog.id)
      toast.success("Draft deleted!")
      setDeleteDialog({ open: false, id: null })
      fetchData()
    } catch {
      toast.error("Delete karne mein error!")
    } finally {
      setDeleting(false)
    }
  }

  const columns = [
    {
      key: "title", label: "Title",
      render: (val) => (
        <div className="flex items-center gap-2">
          <FileText className="w-3.5 h-3.5 text-muted-foreground" />
          <span>{val}</span>
        </div>
      )
    },
    { key: "clientId", label: "Client", render: (val) => val?.name || "—" },
    {
      key: "type", label: "Type",
      render: (val) => (
        <span className="text-xs px-2 py-1 rounded-full bg-purple-500/10 text-purple-500 capitalize">{val}</span>
      )
    },
    {
      key: "status", label: "Status",
      render: (val) => (
        <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${
          val === "final" ? "bg-green-500/10 text-green-500" :
          val === "sent" ? "bg-blue-500/10 text-blue-500" :
          "bg-yellow-500/10 text-yellow-500"
        }`}>{val}</span>
      )
    },
    {
      key: "isAIGenerated", label: "AI",
      render: (val) => val ? (
        <span className="text-xs px-2 py-1 rounded-full bg-pink-500/10 text-pink-500">AI Generated</span>
      ) : "—"
    },
    {
      key: "actions", label: "",
      render: (_, row) => (
        <div className="flex items-center gap-2 justify-end">
          <button onClick={() => openEdit(row)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          <button onClick={() => setDeleteDialog({ open: true, id: row._id })} className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors">
            <Trash2 className="w-3.5 h-3.5 text-destructive" />
          </button>
        </div>
      )
    }
  ]

  return (
    <div>
      <PageHeader
        title="Drafts"
        subtitle="Legal documents aur drafts management"
        action={
          <Button onClick={openAdd} size="sm" className="gap-2">
            <Plus className="w-4 h-4" /> Add Draft
          </Button>
        }
      />

      <DataTable columns={columns} data={drafts} loading={loading} emptyText="Koi draft nahi — pehla draft add karein!" />

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editData ? "Draft Edit" : "New Draft"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>Client</Label>
              <select
                value={form.clientId}
                onChange={e => setForm({ ...form, clientId: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground text-sm"
              >
                <option value="">Client select karein</option>
                {clients.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Title</Label>
              <Input placeholder="Legal Notice - Property" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Type</Label>
                <select
                  value={form.type}
                  onChange={e => setForm({ ...form, type: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground text-sm"
                >
                  {["notice", "agreement", "petition", "affidavit", "contract", "other"].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <select
                  value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground text-sm"
                >
                  {["draft", "final", "sent"].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Content</Label>
              <textarea
                placeholder="Draft content..."
                value={form.content}
                onChange={e => setForm({ ...form, content: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm resize-none h-28"
              />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>{saving ? "Saving..." : editData ? "Update" : "Add"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null })}
        onConfirm={handleDelete}
        loading={deleting}
        title="Draft Delete karein?"
        description="Yeh draft permanently delete ho jaayega."
      />
    </div>
  )
}