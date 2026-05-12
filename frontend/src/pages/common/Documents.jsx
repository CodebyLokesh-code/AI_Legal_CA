import { useState, useEffect } from "react"
import { Trash2, Upload, FileText, Image, File } from "lucide-react"
import toast from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import PageHeader from "../../components/shared/PageHeader"
import DataTable from "../../components/shared/DataTable"
import ConfirmDialog from "../../components/shared/ConfirmDialog"
import { getDocumentsApi, deleteDocumentApi } from "../../api-calls/commonApi"
import { getClientsApi } from "../../api-calls/clientApi"
import api from "../../api-calls/axios"

export default function Documents() {
  const [documents, setDocuments] = useState([])
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null })
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [file, setFile] = useState(null)
  const [clientId, setClientId] = useState("")
  const [relatedTo, setRelatedTo] = useState("general")

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [docRes, clientRes] = await Promise.all([getDocumentsApi(), getClientsApi()])
      setDocuments(docRes.data || [])
      setClients(clientRes.data || [])
    } catch {
      toast.error("Data fetch karne mein error!")
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!file || !clientId) {
      toast.error("File aur Client required hai!")
      return
    }
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("clientId", clientId)
      formData.append("relatedTo", relatedTo)
      await api.post("/documents/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      })
      toast.success("Document uploaded!")
      setModalOpen(false)
      setFile(null)
      setClientId("")
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed!")
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteDocumentApi(deleteDialog.id)
      toast.success("Document deleted!")
      setDeleteDialog({ open: false, id: null })
      fetchData()
    } catch {
      toast.error("Delete karne mein error!")
    } finally {
      setDeleting(false)
    }
  }

  const getFileIcon = (mimeType) => {
    if (mimeType?.includes("image")) return <Image className="w-4 h-4 text-blue-500" />
    if (mimeType?.includes("pdf")) return <FileText className="w-4 h-4 text-red-500" />
    return <File className="w-4 h-4 text-muted-foreground" />
  }

  const columns = [
    {
      key: "fileName", label: "File",
      render: (val, row) => (
        <div className="flex items-center gap-2">
          {getFileIcon(row.mimeType)}
          <span className="text-sm truncate max-w-48">{val}</span>
        </div>
      )
    },
    { key: "clientId", label: "Client", render: (val) => val?.name || "—" },
    {
      key: "relatedTo", label: "Category",
      render: (val) => (
        <span className="text-xs px-2 py-1 rounded-full bg-blue-500/10 text-blue-500 capitalize">{val}</span>
      )
    },
    {
      key: "size", label: "Size",
      render: (val) => val ? `${(val / 1024).toFixed(1)} KB` : "—"
    },
    {
      key: "url", label: "View",
      render: (val) => (
        <a href={val} target="_blank" rel="noreferrer"
          className="text-xs text-primary hover:underline">
          View File
        </a>
      )
    },
    {
      key: "actions", label: "",
      render: (_, row) => (
        <div className="flex items-center gap-2 justify-end">
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
        title="Documents"
        subtitle="Files aur documents management"
        action={
          <Button onClick={() => setModalOpen(true)} size="sm" className="gap-2">
            <Upload className="w-4 h-4" /> Upload Document
          </Button>
        }
      />

      <DataTable columns={columns} data={documents} loading={loading} emptyText="Koi document nahi — pehla document upload karein!" />

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpload} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>Client</Label>
              <select
                value={clientId}
                onChange={e => setClientId(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground text-sm"
              >
                <option value="">Client select karein</option>
                {clients.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <select
                value={relatedTo}
                onChange={e => setRelatedTo(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground text-sm"
              >
                {["general", "tax", "gst", "audit", "case", "draft"].map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>File</Label>
              <div
                className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
                onClick={() => document.getElementById("fileInput").click()}
              >
                {file ? (
                  <div>
                    <FileText className="w-8 h-8 mx-auto text-primary mb-2" />
                    <p className="text-sm text-foreground">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                ) : (
                  <div>
                    <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Click karke file select karein</p>
                    <p className="text-xs text-muted-foreground mt-1">PDF, Images, Word files</p>
                  </div>
                )}
                <input
                  id="fileInput"
                  type="file"
                  className="hidden"
                  onChange={e => setFile(e.target.files[0])}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={uploading}>
                {uploading ? "Uploading..." : "Upload"}
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
        title="Document Delete karein?"
        description="Yeh document permanently delete ho jaayega."
      />
    </div>
  )
}