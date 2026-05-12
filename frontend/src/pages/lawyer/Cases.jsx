import { useState, useEffect } from "react"
import { Plus, Pencil, Trash2, Calendar } from "lucide-react"
import toast from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import PageHeader from "../../components/shared/PageHeader"
import DataTable from "../../components/shared/DataTable"
import ConfirmDialog from "../../components/shared/ConfirmDialog"
import { getCasesApi, addCaseApi, updateCaseApi, deleteCaseApi, addHearingApi } from "../../api-calls/lawyerApi"
import { getClientsApi } from "../../api-calls/clientApi"

const defaultForm = { clientId: "", caseNumber: "", caseTitle: "", court: "", caseType: "civil", opposingParty: "", status: "active" }
const defaultHearing = { date: "", notes: "", nextDate: "" }

export default function Cases() {
  const [cases, setCases] = useState([])
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [hearingModal, setHearingModal] = useState({ open: false, caseId: null })
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null })
  const [editData, setEditData] = useState(null)
  const [form, setForm] = useState(defaultForm)
  const [hearingForm, setHearingForm] = useState(defaultHearing)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [caseRes, clientRes] = await Promise.all([getCasesApi(), getClientsApi()])
      setCases(caseRes.data || [])
      setClients(clientRes.data || [])
    } catch {
      toast.error("Data fetch karne mein error!")
    } finally {
      setLoading(false)
    }
  }

  const openAdd = () => { setEditData(null); setForm(defaultForm); setModalOpen(true) }

  const openEdit = (c) => {
    setEditData(c)
    setForm({
      clientId: c.clientId?._id || c.clientId || "",
      caseNumber: c.caseNumber || "",
      caseTitle: c.caseTitle || "",
      court: c.court || "",
      caseType: c.caseType || "civil",
      opposingParty: c.opposingParty || "",
      status: c.status || "active"
    })
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.clientId || !form.caseNumber || !form.caseTitle || !form.court) {
      toast.error("Client, Case Number, Title aur Court required hai!")
      return
    }
    setSaving(true)
    try {
      if (editData) {
        await updateCaseApi(editData._id, form)
        toast.success("Case updated!")
      } else {
        await addCaseApi(form)
        toast.success("Case added!")
      }
      setModalOpen(false)
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.message || "Error!")
    } finally {
      setSaving(false)
    }
  }

  const handleHearing = async (e) => {
    e.preventDefault()
    if (!hearingForm.date) {
      toast.error("Date required hai!")
      return
    }
    setSaving(true)
    try {
      await addHearingApi(hearingModal.caseId, hearingForm)
      toast.success("Hearing added!")
      setHearingModal({ open: false, caseId: null })
      setHearingForm(defaultHearing)
      fetchData()
    } catch {
      toast.error("Hearing add karne mein error!")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteCaseApi(deleteDialog.id)
      toast.success("Case deleted!")
      setDeleteDialog({ open: false, id: null })
      fetchData()
    } catch {
      toast.error("Delete karne mein error!")
    } finally {
      setDeleting(false)
    }
  }

  const columns = [
    { key: "caseNumber", label: "Case No." },
    { key: "caseTitle", label: "Title" },
    { key: "court", label: "Court" },
    {
      key: "caseType", label: "Type",
      render: (val) => (
        <span className="text-xs px-2 py-1 rounded-full bg-blue-500/10 text-blue-500 capitalize">{val}</span>
      )
    },
    {
      key: "status", label: "Status",
      render: (val) => (
        <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${
          val === "active" ? "bg-green-500/10 text-green-500" :
          val === "closed" ? "bg-gray-500/10 text-gray-500" :
          val === "won" ? "bg-blue-500/10 text-blue-500" :
          val === "lost" ? "bg-red-500/10 text-red-500" :
          "bg-yellow-500/10 text-yellow-500"
        }`}>{val}</span>
      )
    },
    {
      key: "hearings", label: "Hearings",
      render: (val) => (
        <span className="text-xs text-muted-foreground">{val?.length || 0} hearings</span>
      )
    },
    {
      key: "actions", label: "",
      render: (_, row) => (
        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={() => setHearingModal({ open: true, caseId: row._id })}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
            title="Add Hearing"
          >
            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
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
        title="Cases"
        subtitle="Legal cases aur hearings management"
        action={
          <Button onClick={openAdd} size="sm" className="gap-2">
            <Plus className="w-4 h-4" /> Add Case
          </Button>
        }
      />

      <DataTable columns={columns} data={cases} loading={loading} emptyText="Koi case nahi — pehla case add karein!" />

      {/* Add/Edit Case Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editData ? "Case Edit" : "New Case"}</DialogTitle>
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
                <Label>Case Number</Label>
                <Input placeholder="CASE-001" value={form.caseNumber} onChange={e => setForm({ ...form, caseNumber: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Case Type</Label>
                <select
                  value={form.caseType}
                  onChange={e => setForm({ ...form, caseType: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground text-sm"
                >
                  {["civil", "criminal", "family", "corporate", "tax", "other"].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Case Title</Label>
              <Input placeholder="Property Dispute vs Sharma" value={form.caseTitle} onChange={e => setForm({ ...form, caseTitle: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Court</Label>
              <Input placeholder="Delhi High Court" value={form.court} onChange={e => setForm({ ...form, court: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Opposing Party</Label>
              <Input placeholder="Ramesh Kumar" value={form.opposingParty} onChange={e => setForm({ ...form, opposingParty: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <select
                value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground text-sm"
              >
                {["active", "closed", "adjourned", "won", "lost", "settled"].map(s => (
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

      {/* Add Hearing Modal */}
      <Dialog open={hearingModal.open} onOpenChange={(o) => setHearingModal({ open: o, caseId: null })}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Add Hearing</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleHearing} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>Hearing Date</Label>
              <Input type="date" value={hearingForm.date} onChange={e => setHearingForm({ ...hearingForm, date: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <textarea
                placeholder="Hearing notes..."
                value={hearingForm.notes}
                onChange={e => setHearingForm({ ...hearingForm, notes: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm resize-none h-20"
              />
            </div>
            <div className="space-y-2">
              <Label>Next Date</Label>
              <Input type="date" value={hearingForm.nextDate} onChange={e => setHearingForm({ ...hearingForm, nextDate: e.target.value })} />
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setHearingModal({ open: false, caseId: null })}>Cancel</Button>
              <Button type="submit" disabled={saving}>{saving ? "Adding..." : "Add Hearing"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null })}
        onConfirm={handleDelete}
        loading={deleting}
        title="Case Delete karein?"
        description="Yeh case permanently delete ho jaayega."
      />
    </div>
  )
}