import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Pencil, Trash2, Phone, Mail } from "lucide-react"
import toast from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import PageHeader from "../../components/shared/PageHeader"
import DataTable from "../../components/shared/DataTable"
import ConfirmDialog from "../../components/shared/ConfirmDialog"
import {
  getClientsApi, addClientApi,
  updateClientApi, deleteClientApi
} from "../../api-calls/clientApi"

const defaultForm = { name: "", email: "", phone: "", address: "", type: "individual" }

export default function Clients() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null })
  const [editData, setEditData] = useState(null)
  const [form, setForm] = useState(defaultForm)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => { fetchClients() }, [])

  const fetchClients = async () => {
    setLoading(true)
    try {
      const res = await getClientsApi()
      setClients(res.data || [])
    } catch {
      toast.error("Clients fetch karne mein error!")
    } finally {
      setLoading(false)
    }
  }

  const openAdd = () => {
    setEditData(null)
    setForm(defaultForm)
    setModalOpen(true)
  }

  const openEdit = (client) => {
    setEditData(client)
    setForm({
      name: client.name || "",
      email: client.email || "",
      phone: client.phone || "",
      address: client.address || "",
      type: client.type || "individual"
    })
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.phone) {  // ← email optional, phone required
        toast.error("Name aur phone required hai!")
        return
    }
    setSaving(true)
    try {
        const payload = {
            ...form,
            phone: Number(form.phone)  // ← String to Number convert karo
        }
        if (editData) {
            await updateClientApi(editData._id, payload)
            toast.success("Client updated!")
        } else {
            await addClientApi(payload)
            toast.success("Client added!")
        }
      setModalOpen(false)
      fetchClients()
    } catch (err) {
      toast.error(err.response?.data?.message || "Error!")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteClientApi(deleteDialog.id)
      toast.success("Client deleted!")
      setDeleteDialog({ open: false, id: null })
      fetchClients()
    } catch {
      toast.error("Delete karne mein error!")
    } finally {
      setDeleting(false)
    }
  }

  const columns = [
    { key: "name", label: "Name" },
    {
      key: "email", label: "Contact",
      render: (_, row) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs">
            <Mail className="w-3 h-3 text-muted-foreground" />
            <span>{row.email}</span>
          </div>
          {row.phone && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Phone className="w-3 h-3" />
              <span>{row.phone}</span>
            </div>
          )}
        </div>
      )
    },
    {
      key: "type", label: "Type",
      render: (val) => (
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
          val === "individual"
            ? "bg-blue-500/10 text-blue-500"
            : "bg-purple-500/10 text-purple-500"
        }`}>
          {val === "individual" ? "Individual" : "Company"}
        </span>
      )
    },
    {
      key: "actions", label: "",
      render: (_, row) => (
        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={() => openEdit(row)}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
          >
            <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          <button
            onClick={() => setDeleteDialog({ open: true, id: row._id })}
            className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5 text-destructive" />
          </button>
        </div>
      )
    }
  ]

  return (
    <div>
      <PageHeader
        title="Clients"
        subtitle="Apne saare clients manage karein"
        action={
          <Button onClick={openAdd} size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            Add Client
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={clients}
        loading={loading}
        emptyText="Koi client nahi mila — pehla client add karein!"
      />

      {/* Add/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editData ? "Client Edit" : "New Client"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                placeholder="Client ka naam"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="client@example.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                placeholder="9876543210"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input
                placeholder="City, State"
                value={form.address}
                onChange={e => setForm({ ...form, address: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <div className="grid grid-cols-2 gap-2">
                {["individual", "company"].map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm({ ...form, type: t })}
                    className={`h-10 rounded-lg border text-sm font-medium capitalize transition-all ${
                      form.type === t
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted border-border text-muted-foreground hover:border-primary"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : editData ? "Update" : "Add Client"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null })}
        onConfirm={handleDelete}
        loading={deleting}
        title="Client Delete karein?"
        description="Yeh client permanently delete ho jaayega."
      />
    </div>
  )
}