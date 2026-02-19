import { useMemo, useState } from "react";
import { useSnackbar } from "notistack";

interface AccessRequestsProps {
  openModal: boolean;
  setModalState: (value: boolean) => void;
}

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

const AccessRequests = ({ openModal, setModalState }: AccessRequestsProps) => {
  const apiBase = useMemo(() => import.meta.env.VITE_API_BASE as string | undefined, []);
  const apiToken = useMemo(() => import.meta.env.VITE_API_TOKEN as string | undefined, []);
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
      const resp = await fetch(`${apiBase}/access-requests`, {
        method: "POST",
        headers: headers(true),
        body: JSON.stringify({
          studentId: studentId.trim(),
          requesterGroup: requesterGroup.trim(),
          dataGroup: dataGroup.trim(),
          purpose: purpose.trim(),
        }),
      });
      const data = await parseResponse(resp);
      if (!resp.ok) throw new Error(data.error || "failed to create request");
      const createdId = data.request?.id as string | undefined;
      if (createdId) setRequestId(createdId);
      enqueueSnackbar("Access request created", { variant: "success" });
      await fetchStudentRequests();
    } catch (e) {
      enqueueSnackbar(`Create request failed: ${e instanceof Error ? e.message : "unknown"}`, { variant: "error" });
    }
    setLoading(false);
  };

  const fetchStudentRequests = async () => {
    if (!ensureApi()) return;
    if (!studentId.trim()) {
      enqueueSnackbar("studentId is required", { variant: "warning" });
      return;
    }
    setLoading(true);
    try {
      const resp = await fetch(`${apiBase}/access-requests/student/${encodeURIComponent(studentId.trim())}`, {
        headers: headers(false),
      });
      const data = await parseResponse(resp);
      if (!resp.ok) throw new Error(data.error || "failed to fetch student requests");
      setStudentRequests((data.requests as AccessRequest[] | undefined) || []);
      enqueueSnackbar("Student requests refreshed", { variant: "success" });
    } catch (e) {
      enqueueSnackbar(`Fetch student requests failed: ${e instanceof Error ? e.message : "unknown"}`, { variant: "error" });
    }
    setLoading(false);
  };

  const fetchRequesterRequests = async () => {
    if (!ensureApi()) return;
    if (!requesterGroup.trim()) {
      enqueueSnackbar("requesterGroup is required", { variant: "warning" });
      return;
    }
    setLoading(true);
    try {
      const resp = await fetch(`${apiBase}/access-requests/requester/${encodeURIComponent(requesterGroup.trim())}`, {
        headers: headers(false),
      });
      const data = await parseResponse(resp);
      if (!resp.ok) throw new Error(data.error || "failed to fetch requester requests");
      setRequesterRequests((data.requests as AccessRequest[] | undefined) || []);
      enqueueSnackbar("Requester requests refreshed", { variant: "success" });
    } catch (e) {
      enqueueSnackbar(`Fetch requester requests failed: ${e instanceof Error ? e.message : "unknown"}`, { variant: "error" });
    }
    setLoading(false);
  };

  const approveRequest = async () => {
    if (!ensureApi()) return;
    if (!requestId.trim()) {
      enqueueSnackbar("requestId is required", { variant: "warning" });
      return;
    }
    setLoading(true);
    try {
      const resp = await fetch(`${apiBase}/access-requests/${encodeURIComponent(requestId.trim())}/approve`, {
        method: "POST",
        headers: headers(false),
      });
      const data = await parseResponse(resp);
      if (!resp.ok) throw new Error(data.error || "failed to approve request");
      enqueueSnackbar("Access request approved (on-chain grant sent)", { variant: "success" });
      await fetchStudentRequests();
      await fetchRequesterRequests();
    } catch (e) {
      enqueueSnackbar(`Approve failed: ${e instanceof Error ? e.message : "unknown"}`, { variant: "error" });
    }
    setLoading(false);
  };

  const rejectRequest = async () => {
    if (!ensureApi()) return;
    if (!requestId.trim()) {
      enqueueSnackbar("requestId is required", { variant: "warning" });
      return;
    }
    setLoading(true);
    try {
      const resp = await fetch(`${apiBase}/access-requests/${encodeURIComponent(requestId.trim())}/reject`, {
        method: "POST",
        headers: headers(true),
        body: JSON.stringify({ reason: rejectReason.trim() }),
      });
      const data = await parseResponse(resp);
      if (!resp.ok) throw new Error(data.error || "failed to reject request");
      enqueueSnackbar("Access request rejected", { variant: "success" });
      await fetchStudentRequests();
      await fetchRequesterRequests();
    } catch (e) {
      enqueueSnackbar(`Reject failed: ${e instanceof Error ? e.message : "unknown"}`, { variant: "error" });
    }
    setLoading(false);
  };

  const renderRow = (r: AccessRequest, idx: number) => {
    const id = r.id || r._id || "n/a";
    return (
      <li key={`${id}-${idx}`} className="text-sm border rounded p-2">
        <div className="font-semibold break-all">{id}</div>
        <div>{r.studentId} → {r.requesterGroup} / {r.dataGroup}</div>
        <div>Status: {r.status}</div>
        {r.approvedTxId && <div className="text-xs break-all">Tx: {r.approvedTxId}</div>}
        {r.rejectReason && <div className="text-xs">Reason: {r.rejectReason}</div>}
      </li>
    );
  };

  return (
    <dialog id="access_requests_modal" className={`modal ${openModal ? "modal-open" : ""} bg-slate-200`}>
      <form method="dialog" className="modal-box">
        <h3 className="font-bold text-lg">Access Requests Tester</h3>
        <p className="text-sm">Create/list/approve/reject access requests (backend API).</p>

        <div className="mt-3 space-y-2">
          <input className="input input-bordered w-full" placeholder="Student ID" value={studentId} onChange={(e) => setStudentId(e.target.value)} />
          <input className="input input-bordered w-full" placeholder="Requester Group" value={requesterGroup} onChange={(e) => setRequesterGroup(e.target.value)} />
          <input className="input input-bordered w-full" placeholder="Data Group" value={dataGroup} onChange={(e) => setDataGroup(e.target.value)} />
          <input className="input input-bordered w-full" placeholder="Purpose" value={purpose} onChange={(e) => setPurpose(e.target.value)} />

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <button type="button" className={`btn ${loading ? "btn-disabled" : ""}`} onClick={createRequest}>Create request</button>
            <button type="button" className={`btn btn-outline ${loading ? "btn-disabled" : ""}`} onClick={fetchStudentRequests}>Refresh student inbox</button>
            <button type="button" className={`btn btn-outline ${loading ? "btn-disabled" : ""}`} onClick={fetchRequesterRequests}>Refresh requester list</button>
          </div>

          <input className="input input-bordered w-full" placeholder="Request ID" value={requestId} onChange={(e) => setRequestId(e.target.value)} />
          <input className="input input-bordered w-full" placeholder="Reject reason" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <button type="button" className={`btn ${loading ? "btn-disabled" : ""}`} onClick={approveRequest}>Approve request</button>
            <button type="button" className={`btn btn-outline ${loading ? "btn-disabled" : ""}`} onClick={rejectRequest}>Reject request</button>
          </div>
        </div>

        <div className="modal-action">
          <button className="btn" onClick={() => setModalState(!openModal)}>Close</button>
        </div>

        {studentRequests.length > 0 && (
          <div className="mt-4 text-left">
            <div className="font-semibold mb-2">Student Inbox</div>
            <ul className="space-y-1 max-h-44 overflow-y-auto">{studentRequests.map(renderRow)}</ul>
          </div>
        )}

        {requesterRequests.length > 0 && (
          <div className="mt-4 text-left">
            <div className="font-semibold mb-2">Requester View</div>
            <ul className="space-y-1 max-h-44 overflow-y-auto">{requesterRequests.map(renderRow)}</ul>
          </div>
        )}
      </form>
    </dialog>
  );
};

export default AccessRequests;
