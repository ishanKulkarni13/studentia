import { useMemo, useState } from "react";
import { useSnackbar } from "notistack";

interface DocumentUploadsProps {
  openModal: boolean;
  setModalState: (value: boolean) => void;
}

type DocMeta = {
  id: string;
  studentId: string;
  receiverGroup: string;
  dataGroup: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  storageMode: string;
  sharedWith: string[];
  createdAt?: string;
};

const DocumentUploads = ({ openModal, setModalState }: DocumentUploadsProps) => {
  const apiBase = useMemo(() => {
    const raw = import.meta.env.VITE_API_BASE as string | undefined;
    if (!raw) return undefined;
    return raw.trim().replace(/\/+$/, "");
  }, []);
  const apiToken = useMemo(() => import.meta.env.VITE_API_TOKEN as string | undefined, []);
  const documentBaseCandidates = useMemo(() => (apiBase ? [`${apiBase}/documents`, `${apiBase}/api/documents`] : []), [apiBase]);
  const { enqueueSnackbar } = useSnackbar();

  const [studentId, setStudentId] = useState("student-001");
  const [receiverGroup, setReceiverGroup] = useState("Recruiters");
  const [dataGroup, setDataGroup] = useState("Portfolio");

  const [selectedFileName, setSelectedFileName] = useState("");
  const [selectedMimeType, setSelectedMimeType] = useState("application/octet-stream");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [docId, setDocId] = useState("");
  const [downloadOwnerId, setDownloadOwnerId] = useState("student-001");
  const [downloadRequesterGroup, setDownloadRequesterGroup] = useState("Recruiters");

  const [documents, setDocuments] = useState<DocMeta[]>([]);
  const [downloadPreview, setDownloadPreview] = useState("");
  const [loading, setLoading] = useState(false);

  const headers = (withJson = true) => ({
    ...(withJson ? { "Content-Type": "application/json" } : {}),
    ...(apiToken ? { Authorization: `Bearer ${apiToken}` } : {}),
  });

  const ensureApi = () => {
    if (!apiBase) {
      enqueueSnackbar("Set VITE_API_BASE to use documents APIs", { variant: "warning" });
      return false;
    }
    return true;
  };

  const parseResponse = async (resp: Response) => {
    const contentType = resp.headers.get("content-type") || "";
    if (contentType.includes("application/json")) return resp.json();
    const text = await resp.text();
    throw new Error(`Expected JSON but got '${contentType || "unknown"}' (status ${resp.status}). Response: ${text.slice(0, 120)}`);
  };

  const fetchDocumentsApi = async (path: string, init?: RequestInit) => {
    let lastError: Error | null = null;
    for (const base of documentBaseCandidates) {
      const resp = await fetch(`${base}${path}`, init);
      if (resp.status === 404) {
        lastError = new Error(`Route not found at ${base}${path}`);
        continue;
      }
      return { resp, data: await parseResponse(resp) };
    }
    throw lastError || new Error("No valid documents endpoint found");
  };

  const onFileSelected = async (file: File | null) => {
    if (!file) return;
    setSelectedFile(file);
    setSelectedFileName(file.name);
    setSelectedMimeType(file.type || "application/octet-stream");
    enqueueSnackbar(`Loaded file: ${file.name}`, { variant: "success" });
  };

  const uploadDocument = async () => {
    if (!ensureApi()) return;
    if (!studentId.trim() || !receiverGroup.trim() || !dataGroup.trim()) {
      enqueueSnackbar("studentId, receiverGroup, dataGroup are required", { variant: "warning" });
      return;
    }
    if (!selectedFileName || !selectedFile) {
      enqueueSnackbar("Select a file first", { variant: "warning" });
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.set("studentId", studentId.trim());
      formData.set("receiverGroup", receiverGroup.trim());
      formData.set("dataGroup", dataGroup.trim());
      formData.set("file", selectedFile, selectedFileName);

      const { resp, data } = await fetchDocumentsApi("/upload-form", {
        method: "POST",
        headers: headers(false),
        body: formData,
      });
      if (!resp.ok) throw new Error(data.error || "upload failed");
      const uploadedId = data.document?.id as string | undefined;
      if (uploadedId) setDocId(uploadedId);
      enqueueSnackbar("Document uploaded", { variant: "success" });
      await listDocuments();
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown";
      if (message.includes("status 413") || message.includes("PayloadTooLarge")) {
        enqueueSnackbar("Upload failed: file too large for current backend limit", { variant: "error" });
      } else {
        enqueueSnackbar(`Upload failed: ${message}`, { variant: "error" });
      }
    }
    setLoading(false);
  };

  const listDocuments = async () => {
    if (!ensureApi()) return;
    if (!studentId.trim()) {
      enqueueSnackbar("studentId is required", { variant: "warning" });
      return;
    }
    setLoading(true);
    try {
      const { resp, data } = await fetchDocumentsApi(`/${encodeURIComponent(studentId.trim())}`, {
        headers: headers(false),
      });
      if (!resp.ok) throw new Error(data.error || "list failed");
      setDocuments((data.documents as DocMeta[] | undefined) || []);
      enqueueSnackbar("Documents refreshed", { variant: "success" });
    } catch (e) {
      enqueueSnackbar(`List failed: ${e instanceof Error ? e.message : "unknown"}`, { variant: "error" });
    }
    setLoading(false);
  };

  const shareDocument = async () => {
    if (!ensureApi()) return;
    if (!docId.trim() || !studentId.trim() || !receiverGroup.trim()) {
      enqueueSnackbar("docId, studentId, receiverGroup are required", { variant: "warning" });
      return;
    }
    setLoading(true);
    try {
      const { resp, data } = await fetchDocumentsApi(`/${encodeURIComponent(docId.trim())}/share`, {
        method: "POST",
        headers: headers(true),
        body: JSON.stringify({ studentId: studentId.trim(), receiverGroup: receiverGroup.trim() }),
      });
      if (!resp.ok) throw new Error(data.error || "share failed");
      enqueueSnackbar("Document shared", { variant: "success" });
      await listDocuments();
    } catch (e) {
      enqueueSnackbar(`Share failed: ${e instanceof Error ? e.message : "unknown"}`, { variant: "error" });
    }
    setLoading(false);
  };

  const downloadDocument = async () => {
    if (!ensureApi()) return;
    if (!docId.trim() || !downloadOwnerId.trim()) {
      enqueueSnackbar("docId and ownerStudentId are required", { variant: "warning" });
      return;
    }
    setLoading(true);
    try {
      const query = new URLSearchParams({ ownerStudentId: downloadOwnerId.trim() });
      if (downloadRequesterGroup.trim()) query.set("requesterGroup", downloadRequesterGroup.trim());

      const { resp, data } = await fetchDocumentsApi(`/download/${encodeURIComponent(docId.trim())}?${query.toString()}`, {
        headers: headers(false),
      });
      if (!resp.ok) throw new Error(data.error || "download failed");

      const rawB64 = String(data.fileBase64 || "");
      const preview = rawB64 ? atob(rawB64).slice(0, 120) : "";
      setDownloadPreview(preview);
      enqueueSnackbar("Download payload fetched", { variant: "success" });
    } catch (e) {
      enqueueSnackbar(`Download failed: ${e instanceof Error ? e.message : "unknown"}`, { variant: "error" });
    }
    setLoading(false);
  };

  return (
    <dialog id="documents_modal" className={`modal ${openModal ? "modal-open" : ""} bg-slate-200`}>
      <form method="dialog" className="modal-box">
        <h3 className="font-bold text-lg">Document Upload Tester</h3>
        <p className="text-sm">Upload/list/share/download document payloads through backend APIs.</p>

        <div className="mt-3 space-y-2">
          <input className="input input-bordered w-full" placeholder="Student ID" value={studentId} onChange={(e) => setStudentId(e.target.value)} />
          <input className="input input-bordered w-full" placeholder="Receiver Group" value={receiverGroup} onChange={(e) => setReceiverGroup(e.target.value)} />
          <input className="input input-bordered w-full" placeholder="Data Group" value={dataGroup} onChange={(e) => setDataGroup(e.target.value)} />

          <input
            type="file"
            className="file-input file-input-bordered w-full"
            onChange={(e) => onFileSelected(e.target.files?.[0] || null)}
          />
          {selectedFileName && <div className="text-xs">Selected: {selectedFileName} ({selectedMimeType})</div>}

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <button type="button" className={`btn ${loading ? "btn-disabled" : ""}`} onClick={uploadDocument}>Upload document</button>
            <button type="button" className={`btn btn-outline ${loading ? "btn-disabled" : ""}`} onClick={listDocuments}>Refresh documents</button>
          </div>

          <input className="input input-bordered w-full" placeholder="Document ID" value={docId} onChange={(e) => setDocId(e.target.value)} />

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <button type="button" className={`btn ${loading ? "btn-disabled" : ""}`} onClick={shareDocument}>Share document</button>
            <button type="button" className={`btn btn-outline ${loading ? "btn-disabled" : ""}`} onClick={downloadDocument}>Download payload</button>
          </div>

          <input className="input input-bordered w-full" placeholder="Download ownerStudentId" value={downloadOwnerId} onChange={(e) => setDownloadOwnerId(e.target.value)} />
          <input className="input input-bordered w-full" placeholder="Download requesterGroup (optional for owner mode)" value={downloadRequesterGroup} onChange={(e) => setDownloadRequesterGroup(e.target.value)} />
        </div>

        <div className="modal-action">
          <button className="btn" onClick={() => setModalState(!openModal)}>Close</button>
        </div>

        {documents.length > 0 && (
          <div className="mt-4 text-left">
            <div className="font-semibold mb-2">Documents</div>
            <ul className="space-y-1 max-h-44 overflow-y-auto">
              {documents.map((d, idx) => (
                <li key={`${d.id}-${idx}`} className="text-sm border rounded p-2">
                  <div className="font-semibold break-all">{d.id}</div>
                  <div>{d.fileName} ({d.mimeType})</div>
                  <div>{d.dataGroup} → {d.receiverGroup}</div>
                  <div>Shared with: {(d.sharedWith || []).join(", ") || "none"}</div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {downloadPreview && (
          <div className="mt-4 text-left">
            <div className="font-semibold mb-2">Downloaded Preview</div>
            <pre className="text-xs whitespace-pre-wrap break-all bg-slate-100 p-2 rounded">{downloadPreview}</pre>
          </div>
        )}
      </form>
    </dialog>
  );
};

export default DocumentUploads;
