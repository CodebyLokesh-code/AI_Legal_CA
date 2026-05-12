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
import { getTaxesApi, addTaxApi, updateTaxApi, deleteTaxApi } from "../../api-calls/caApi"
import { getClientsApi } from "../../api-calls/clientApi"

const defaultForm = { clientId: "", financialYear: "", itrType: "ITR-1", income: "", deductions: "", status: "pending" }

export default function Tax() {
  const [taxes, setTaxes] = useState([])
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
      const [taxRes, clientRes] = await Promise.all([getTaxesApi(), getClientsApi()])
      setTaxes(taxRes.data || [])
      setClients(clientRes.data || [])
    } catch {
      toast.error("Data fetch karne mein error!")
    } finally {
      setLoading(false)
    }
  }

  const openAdd = () => {
    setEditData(null)
    setForm(defaultForm)
    setModalOpen(true)
  }

  const openEdit = (tax) => {
    setEditData(tax)
    setForm({
      clientId: tax.clientId?._id || tax.clientId || "",
      financialYear: tax.financialYear || "",
      itrType: tax.itrType || "ITR-1",
      income: tax.income || "",
      deductions: tax.deductions || "",
      status: tax.status || "pending"
    })
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.clientId || !form.financialYear || !form.itrType) {
      toast.error("Client, Financial Year aur ITR Type required hai!")
      return
    }
    setSaving(true)
    try {
      if (editData) {
        await updateTaxApi(editData._id, form)
        toast.success("Tax record updated!")
      } else {
        await addTaxApi(form)
        toast.success("Tax record added!")
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
      await deleteTaxApi(deleteDialog.id)
      toast.success("Tax record deleted!")
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
      key: "clientId", label: "Client",
      render: (val) => val?.name || "—"
    },
    { key: "financialYear", label: "Financial Year" },
    { key: "itrType", label: "ITR Type" },
    {
      key: "income", label: "Income",
      render: (val) => val ? `₹${Number(val).toLocaleString()}` : "—"
    },
    {
      key: "status", label: "Status",
      render: (val) => (
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
          val === "filed" ? "bg-green-500/10 text-green-500" :
          val === "pending" ? "bg-yellow-500/10 text-yellow-500" :
          "bg-red-500/10 text-red-500"
        }`}>
          {val}
        </span>
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
        title="Tax Records"
        subtitle="ITR filing aur tax management"
        action={
          <Button onClick={openAdd} size="sm" className="gap-2">
            <Plus className="w-4 h-4" /> Add Tax Record
          </Button>
        }
      />

      <DataTable columns={columns} data={taxes} loading={loading} emptyText="Koi tax record nahi — pehla record add karein!" />

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editData ? "Tax Record Edit" : "New Tax Record"}</DialogTitle>
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
                {clients.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Financial Year</Label>
              <Input placeholder="2023-24" value={form.financialYear} onChange={e => setForm({ ...form, financialYear: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>ITR Type</Label>
              <select
                value={form.itrType}
                onChange={e => setForm({ ...form, itrType: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground text-sm"
              >
                {["ITR-1", "ITR-2", "ITR-3", "ITR-4"].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Income (₹)</Label>
                <Input type="number" placeholder="500000" value={form.income} onChange={e => setForm({ ...form, income: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Deductions (₹)</Label>
                <Input type="number" placeholder="150000" value={form.deductions} onChange={e => setForm({ ...form, deductions: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <select
                value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground text-sm"
              >
                {["pending", "filed", "overdue"].map(s => (
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
        title="Tax Record Delete karein?"
        description="Yeh record permanently delete ho jaayega."
      />
    </div>
  )
}