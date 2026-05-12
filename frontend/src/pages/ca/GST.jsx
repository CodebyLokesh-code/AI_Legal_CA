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
import { getGSTsApi, addGSTApi, updateGSTApi, deleteGSTApi } from "../../api-calls/caApi"
import { getClientsApi } from "../../api-calls/clientApi"

const defaultForm = { clientId: "", gstNumber: "", returnType: "GSTR-1", period: "", totalTax: "", status: "draft" }

export default function GST() {
  const [gsts, setGsts] = useState([])
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
      const [gstRes, clientRes] = await Promise.all([getGSTsApi(), getClientsApi()])
      setGsts(gstRes.data || [])
      setClients(clientRes.data || [])
    } catch {
      toast.error("Data fetch karne mein error!")
    } finally {
      setLoading(false)
    }
  }

  const openAdd = () => { setEditData(null); setForm(defaultForm); setModalOpen(true) }

  const openEdit = (gst) => {
    setEditData(gst)
    setForm({
      clientId: gst.clientId?._id || gst.clientId || "",
      gstNumber: gst.gstNumber || "",
      returnType: gst.returnType || "GSTR-1",
      period: gst.period || "",
      totalTax: gst.totalTax || "",
      status: gst.status || "draft"
    })
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.clientId || !form.gstNumber || !form.period) {
      toast.error("Client, GST Number aur Period required hai!")
      return
    }
    setSaving(true)
    try {
      if (editData) {
        await updateGSTApi(editData._id, form)
        toast.success("GST record updated!")
      } else {
        await addGSTApi(form)
        toast.success("GST record added!")
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
      await deleteGSTApi(deleteDialog.id)
      toast.success("GST record deleted!")
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
    { key: "gstNumber", label: "GST Number" },
    { key: "returnType", label: "Return Type" },
    { key: "period", label: "Period" },
    {
      key: "totalTax", label: "Total Tax",
      render: (val) => val ? `₹${Number(val).toLocaleString()}` : "—"
    },
    {
      key: "status", label: "Status",
      render: (val) => (
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
          val === "filed" ? "bg-green-500/10 text-green-500" :
          val === "draft" ? "bg-yellow-500/10 text-yellow-500" :
          "bg-blue-500/10 text-blue-500"
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
        title="GST Records"
        subtitle="GST filing aur returns management"
        action={
          <Button onClick={openAdd} size="sm" className="gap-2">
            <Plus className="w-4 h-4" /> Add GST Record
          </Button>
        }
      />

      <DataTable columns={columns} data={gsts} loading={loading} emptyText="Koi GST record nahi — pehla record add karein!" />

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editData ? "GST Record Edit" : "New GST Record"}</DialogTitle>
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
              <Label>GST Number</Label>
              <Input placeholder="27AAPFU0939F1ZV" value={form.gstNumber} onChange={e => setForm({ ...form, gstNumber: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Return Type</Label>
                <select
                  value={form.returnType}
                  onChange={e => setForm({ ...form, returnType: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground text-sm"
                >
                  {["GSTR-1", "GSTR-3B", "GSTR-9", "GSTR-9C"].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Period</Label>
                <Input placeholder="April-2024" value={form.period} onChange={e => setForm({ ...form, period: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Total Tax (₹)</Label>
                <Input type="number" placeholder="18000" value={form.totalTax} onChange={e => setForm({ ...form, totalTax: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <select
                  value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground text-sm"
                >
                  {["draft", "filed", "nil"].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
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
        title="GST Record Delete karein?"
        description="Yeh record permanently delete ho jaayega."
      />
    </div>
  )
}