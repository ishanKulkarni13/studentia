import { useMemo, useState } from "react";
import { useSnackbar } from "notistack";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type AccessRequest = {
  _id?: string;
  id?: string;
  studentId: string;
  requesterGroup: string;
  dataGroup: string;
  purpose?: string;
  status: string;
  approvedTxId?: string;
  approvedReturnValue?: string;
  rejectReason?: string;
  createdAt?: string;
  updatedAt?: string;
};

const AccessRequestsForm = () => {
  const apiBase = useMemo(() => {
    const raw = import.meta.env.VITE_API_BASE as string | undefined;
    if (!raw) return undefined;
    return raw.trim().replace(/\/+$/, "");
  }, []);
  const apiToken = useMemo(() => import.meta.env.VITE_API_TOKEN as string | undefined, []);
  const accessBaseCandidates = useMemo(
    () => (apiBase ? [`${apiBase}/access-requests`, `${apiBase}/api/access-requests`] : []),
    [apiBase],
  );
  const { enqueueSnackbar } = useSnackbar();

  const [studentId, setStudentId] = useState("student-001");
  const [requesterGroup, setRequesterGroup] = useState("Recruiters");
  const [dataGroup, setDataGroup] = useState("Portfolio");
  const [purpose, setPurpose] = useState("Screening");
  const [requestId, setRequestId] = useState("");
  const [rejectReason, setRejectReason] = useState("Not required right now");
  const [loading, setLoading] = useState(false);

  const [studentRequests, setStudentRequests] = useState<AccessRequest[]>([]);
  const [requesterRequests, setRequesterRequests] = useState<AccessRequest[]>([]);

  const headers = (withJson = true) => ({
    ...(withJson ? { "Content-Type": "application/json" } : {}),
    ...(apiToken ? { Authorization: `Bearer ${apiToken}` } : {}),
  });

  const parseResponse = async (resp: Response) => {
    const contentType = resp.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      return resp.json();
    }
    const text = await resp.text();
    throw new Error(
      `Expected JSON but got '${contentType || "unknown"}' (status ${resp.status}). Response starts with: ${text.slice(0, 120)}`,
    );
  };

  const fetchAccess = async (path: string, init?: RequestInit) => {
    let lastError: Error | null = null;

    for (const base of accessBaseCandidates) {
      const resp = await fetch(`${base}${path}`, init);
      if (resp.status === 404) {
        lastError = new Error(`Route not found at ${base}${path}`);
        continue;
      }
      return { resp, data: await parseResponse(resp) };
    }

    throw lastError || new Error("No valid access-requests endpoint found");
  };

  const ensureApi = () => {
    if (!apiBase) {
      enqueueSnackbar("Set VITE_API_BASE to use access-request APIs", { variant: "warning" });
      return false;
    }
    return true;
  };

  const createRequest = async () => {
    if (!ensureApi()) return;
    if (!studentId.trim() || !requesterGroup.trim() || !dataGroup.trim()) {
      enqueueSnackbar("studentId, requesterGroup, dataGroup are required", { variant: "warning" });
      return;
    }
    setLoading(true);
    try {
      const { resp, data } = await fetchAccess("", {
        method: "POST",
        headers: headers(true),
        body: JSON.stringify({
          studentId: studentId.trim(),
          requesterGroup: requesterGroup.trim(),
          dataGroup: dataGroup.trim(),
          purpose: purpose.trim(),
        }),
      });
      if (!resp.ok) throw new Error(data.error || "Backend error");
      enqueueSnackbar("Request created", { variant: "success" });
      await fetchStudentRequests();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unknown error";
      enqueueSnackbar(`Error creating request: ${message}`, { variant: "error" });
    }
    setLoading(false);
  };

  const fetchStudentRequests = async () => {
    if (!ensureApi()) return;
    try {
      const { resp, data } = await fetchAccess(`/student/${encodeURIComponent(studentId.trim())}`);
      if (!resp.ok) throw new Error(data.error || "Backend error");
      const requests = (data.requests as AccessRequest[] | undefined) || [];
      setStudentRequests(requests);
      enqueueSnackbar("Student inbox refreshed", { variant: "success" });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unknown error";
      enqueueSnackbar(`Error fetching student requests: ${message}`, { variant: "error" });
    }
  };

  const fetchRequesterRequests = async () => {
    if (!ensureApi()) return;
    try {
      const { resp, data } = await fetchAccess(`/requester/${encodeURIComponent(requesterGroup.trim())}`);
      if (!resp.ok) throw new Error(data.error || "Backend error");
      const requests = (data.requests as AccessRequest[] | undefined) || [];
      setRequesterRequests(requests);
      enqueueSnackbar("Requester list refreshed", { variant: "success" });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unknown error";
      enqueueSnackbar(`Error fetching requester requests: ${message}`, { variant: "error" });
    }
  };

  const approveRequest = async () => {
    if (!ensureApi()) return;
    if (!requestId.trim()) {
      enqueueSnackbar("Request ID is required", { variant: "warning" });
      return;
    }
    setLoading(true);
    try {
      const { resp, data } = await fetchAccess(`/${encodeURIComponent(requestId.trim())}/approve`, {
        method: "POST",
        headers: headers(false),
      });
      if (!resp.ok) throw new Error(data.error || "Backend error");
      enqueueSnackbar("Request approved", { variant: "success" });
      await fetchStudentRequests();
      await fetchRequesterRequests();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unknown error";
      enqueueSnackbar(`Error approving request: ${message}`, { variant: "error" });
    }
    setLoading(false);
  };

  const rejectRequest = async () => {
    if (!ensureApi()) return;
    if (!requestId.trim()) {
      enqueueSnackbar("Request ID is required", { variant: "warning" });
      return;
    }
    setLoading(true);
    try {
      const { resp, data } = await fetchAccess(`/${encodeURIComponent(requestId.trim())}/reject`, {
        method: "POST",
        headers: headers(true),
        body: JSON.stringify({
          reason: rejectReason.trim(),
        }),
      });
      if (!resp.ok) throw new Error(data.error || "Backend error");
      enqueueSnackbar("Request rejected", { variant: "success" });
      await fetchStudentRequests();
      await fetchRequesterRequests();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unknown error";
      enqueueSnackbar(`Error rejecting request: ${message}`, { variant: "error" });
    }
    setLoading(false);
  };

  const renderRow = (r: AccessRequest, idx: number) => {
    const id = r.id || r._id || "n/a";
    return (
      <li key={`${id}-${idx}`} className="p-3 bg-gray-50 rounded-lg border">
        <div className="font-medium text-sm break-all mb-1">{id}</div>
        <div className="text-sm text-gray-600 mb-1">
          {r.studentId} → {r.requesterGroup} / {r.dataGroup}
        </div>
        <div className="text-sm mb-1">
          <span className={`font-medium ${
            r.status === 'approved' ? 'text-green-600' :
            r.status === 'rejected' ? 'text-red-600' :
            'text-yellow-600'
          }`}>
            Status: {r.status}
          </span>
        </div>
        {r.approvedTxId && (
          <div className="text-xs text-gray-500 break-all">Tx: {r.approvedTxId}</div>
        )}
        {r.rejectReason && (
          <div className="text-xs text-gray-500">Reason: {r.rejectReason}</div>
        )}
        {r.purpose && (
          <div className="text-xs text-gray-500">Purpose: {r.purpose}</div>
        )}
      </li>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Access Requests Management</CardTitle>
          <CardDescription>Create, view, and manage access requests from organizations.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
              <Input
                placeholder="Student ID"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Requester Group</label>
              <Input
                placeholder="Requester Group"
                value={requesterGroup}
                onChange={(e) => setRequesterGroup(e.target.value)}
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
              <Input
                placeholder="Purpose"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={createRequest} disabled={loading}>
              {loading ? "Creating..." : "Create Request"}
            </Button>
            <Button onClick={fetchStudentRequests} variant="outline" disabled={loading}>
              Refresh Student Inbox
            </Button>
            <Button onClick={fetchRequesterRequests} variant="outline" disabled={loading}>
              Refresh Requester List
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Request ID</label>
              <Input
                placeholder="Request ID"
                value={requestId}
                onChange={(e) => setRequestId(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reject Reason</label>
              <Input
                placeholder="Reject reason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={approveRequest} disabled={loading} className="bg-green-600 hover:bg-green-700">
              {loading ? "Approving..." : "Approve Request"}
            </Button>
            <Button onClick={rejectRequest} disabled={loading} variant="destructive">
              {loading ? "Rejecting..." : "Reject Request"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {studentRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Student Inbox</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 max-h-96 overflow-y-auto">
              {studentRequests.map(renderRow)}
            </ul>
          </CardContent>
        </Card>
      )}

      {requesterRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Requester View</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 max-h-96 overflow-y-auto">
              {requesterRequests.map(renderRow)}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AccessRequestsForm;
