import { useState, useEffect } from "react"
import { Plus, Pencil, Trash2 } from "lucide-react"
import toast from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import PageHeader from "../../components/shared/PageHeader"
import DataTable from "../../components/shared/DataTable"
import ConfirmDialog from "../../components/shared/ConfirmDialog"
import { getInvoicesApi, addInvoiceApi, updateInvoiceApi, deleteInvoiceApi } from "../../api-calls/commonApi"
import { getClientsApi } from "../../api-calls/clientApi"

const defaultForm = { clientId: "", amount: "", dueDate: "", status: "unpaid", description: "" }

export default function Invoices() {
  const [invoices, setInvoices] = useState([])
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
      const [invRes, clientRes] = await Promise.all([getInvoicesApi(), getClientsApi()])
      setInvoices(invRes.data || [])
      setClients(clientRes.data || [])
    } catch {
      toast.error("Data fetch karne mein error!")
    } finally {
      setLoading(false)
    }
  }

  const openAdd = () => { setEditData(null); setForm(defaultForm); setModalOpen(true) }

  const openEdit = (inv) => {
    setEditData(inv)
    setForm({
      clientId: inv.clientId?._id || inv.clientId || "",
      amount: inv.amount || "",
      dueDate: inv.dueDate?.split("T")[0] || "",
      status: inv.status || "unpaid",
      description: inv.description || ""
    })
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.clientId || !form.amount) {
      toast.error("Client aur Amount required hai!")
      return
    }
    setSaving(true)
    try {
      if (editData) {
        await updateInvoiceApi(editData._id, form)
        toast.success("Invoice updated!")
      } else {
        await addInvoiceApi(form)
        toast.success("Invoice added!")
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
      await deleteInvoiceApi(deleteDialog.id)
      toast.success("Invoice deleted!")
      setDeleteDialog({ open: false, id: null })
      fetchData()
    } catch {
      toast.error("Delete karne mein error!")
    } finally {
      setDeleting(false)
    }
  }

  const columns = [
    { key: "clientId", label: "Client", render: (val) => val?.name || "—" },
    {
      key: "amount", label: "Amount",
      render: (val) => val ? `₹${Number(val).toLocaleString()}` : "—"
    },
    {
      key: "dueDate", label: "Due Date",
      render: (val) => val ? new Date(val).toLocaleDateString("en-IN") : "—"
    },
    { key: "description", label: "Description", render: (val) => val || "—" },
    {
      key: "status", label: "Status",
      render: (val) => (
        <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${
          val === "paid" ? "bg-green-500/10 text-green-500" :
          val === "unpaid" ? "bg-red-500/10 text-red-500" :
          "bg-yellow-500/10 text-yellow-500"
        }`}>{val}</span>
      )
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
        title="Invoices"
        subtitle="Billing aur payment management"
        action={
          <Button onClick={openAdd} size="sm" className="gap-2">
            <Plus className="w-4 h-4" /> Add Invoice
          </Button>
        }
      />

      <DataTable columns={columns} data={invoices} loading={loading} emptyText="Koi invoice nahi — pehla invoice add karein!" />

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editData ? "Invoice Edit" : "New Invoice"}</DialogTitle>
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
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Amount (₹)</Label>
                <Input type="number" placeholder="5000" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input placeholder="Tax filing charges" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <select
                value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground text-sm"
              >
                {["unpaid", "paid", "overdue"].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
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
        title="Invoice Delete karein?"
        description="Yeh invoice permanently delete ho jaayega."
      />
    </div>
  )
}