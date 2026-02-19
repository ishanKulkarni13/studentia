import { useMemo, useState } from "react";
import { useSnackbar } from "notistack";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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

const DocumentUploadsForm = () => {
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
      const fileBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(selectedFile);
      });

      const base64Data = fileBase64.split(',')[1]; // Remove data:mime;base64, prefix

      const { resp, data } = await fetchDocumentsApi("/upload", {
        method: "POST",
        headers: headers(true),
        body: JSON.stringify({
          studentId: studentId.trim(),
          receiverGroup: receiverGroup.trim(),
          dataGroup: dataGroup.trim(),
          fileName: selectedFileName,
          mimeType: selectedMimeType,
          fileBase64: base64Data,
        }),
      });

      if (!resp.ok) throw new Error(data.error || "Backend error");
      enqueueSnackbar("Document uploaded", { variant: "success" });
      await listDocuments();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unknown error";
      enqueueSnackbar(`Error uploading document: ${message}`, { variant: "error" });
    }
    setLoading(false);
  };

  const listDocuments = async () => {
    if (!ensureApi()) return;
    try {
      const { resp, data } = await fetchDocumentsApi(`/${encodeURIComponent(studentId.trim())}`);
      if (!resp.ok) throw new Error(data.error || "Backend error");
      const docs = (data.documents as DocMeta[] | undefined) || [];
      setDocuments(docs);
      enqueueSnackbar("Documents refreshed", { variant: "success" });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unknown error";
      enqueueSnackbar(`Error listing documents: ${message}`, { variant: "error" });
    }
  };

  const shareDocument = async () => {
    if (!ensureApi()) return;
    if (!docId.trim() || !studentId.trim() || !receiverGroup.trim()) {
      enqueueSnackbar("Document ID, studentId, receiverGroup are required", { variant: "warning" });
      return;
    }
    setLoading(true);
    try {
      const { resp, data } = await fetchDocumentsApi(`/${encodeURIComponent(docId.trim())}/share`, {
        method: "POST",
        headers: headers(true),
        body: JSON.stringify({
          studentId: studentId.trim(),
          receiverGroup: receiverGroup.trim(),
        }),
      });
      if (!resp.ok) throw new Error(data.error || "Backend error");
      enqueueSnackbar("Document shared", { variant: "success" });
      await listDocuments();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unknown error";
      enqueueSnackbar(`Error sharing document: ${message}`, { variant: "error" });
    }
    setLoading(false);
  };

  const downloadDocument = async () => {
    if (!ensureApi()) return;
    if (!docId.trim()) {
      enqueueSnackbar("Document ID is required", { variant: "warning" });
      return;
    }
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        ownerStudentId: downloadOwnerId.trim(),
        ...(downloadRequesterGroup.trim() && { requesterGroup: downloadRequesterGroup.trim() }),
      });

      const { resp, data } = await fetchDocumentsApi(`/download/${encodeURIComponent(docId.trim())}?${queryParams}`);
      if (!resp.ok) throw new Error(data.error || "Backend error");

      const preview = data.fileBase64
        ? `Data: ${data.fileBase64.slice(0, 100)}...`
        : "No file data available";
      setDownloadPreview(preview);
      enqueueSnackbar("Document downloaded", { variant: "success" });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unknown error";
      enqueueSnackbar(`Error downloading document: ${message}`, { variant: "error" });
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Document Management</CardTitle>
          <CardDescription>Upload, share, and download documents with consent-gated access.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
              <Input
                placeholder="Student ID"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Receiver Group</label>
              <Input
                placeholder="Receiver Group"
                value={receiverGroup}
                onChange={(e) => setReceiverGroup(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data Group</label>
              <Input
                placeholder="Data Group"
                value={dataGroup}
                onChange={(e) => setDataGroup(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select File</label>
            <Input
              type="file"
              onChange={(e) => onFileSelected(e.target.files?.[0] || null)}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {selectedFileName && (
              <p className="text-sm text-gray-600 mt-1">
                Selected: {selectedFileName} ({selectedMimeType})
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={uploadDocument} disabled={loading}>
              {loading ? "Uploading..." : "Upload Document"}
            </Button>
            <Button onClick={listDocuments} variant="outline" disabled={loading}>
              Refresh Documents
            </Button>
          </div>

          <div className="border-t pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Document ID</label>
                <Input
                  placeholder="Document ID"
                  value={docId}
                  onChange={(e) => setDocId(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Download Owner ID</label>
                <Input
                  placeholder="Download ownerStudentId"
                  value={downloadOwnerId}
                  onChange={(e) => setDownloadOwnerId(e.target.value)}
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Download Requester Group (optional)</label>
              <Input
                placeholder="Download requesterGroup"
                value={downloadRequesterGroup}
                onChange={(e) => setDownloadRequesterGroup(e.target.value)}
              />
            </div>

            <div className="flex gap-2 mt-4">
              <Button onClick={shareDocument} disabled={loading} className="bg-green-600 hover:bg-green-700">
                {loading ? "Sharing..." : "Share Document"}
              </Button>
              <Button onClick={downloadDocument} disabled={loading} variant="outline">
                {loading ? "Downloading..." : "Download Payload"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {documents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 max-h-96 overflow-y-auto">
              {documents.map((d, idx) => (
                <li key={`${d.id}-${idx}`} className="p-3 bg-gray-50 rounded-lg border">
                  <div className="font-medium text-sm break-all mb-1">{d.id}</div>
                  <div className="text-sm text-gray-600 mb-1">
                    {d.fileName} ({d.mimeType})
                  </div>
                  <div className="text-sm text-gray-600 mb-1">
                    {d.dataGroup} → {d.receiverGroup}
                  </div>
                  <div className="text-sm text-gray-600">
                    Shared with: {(d.sharedWith || []).join(", ") || "none"}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Size: {d.sizeBytes} bytes
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {downloadPreview && (
        <Card>
          <CardHeader>
            <CardTitle>Download Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs whitespace-pre-wrap break-all bg-gray-50 p-3 rounded-lg border max-h-48 overflow-y-auto">
              {downloadPreview}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DocumentUploadsForm;
