import { useWallet } from "@txnlab/use-wallet-react";
import { useSnackbar } from "notistack";
import { useMemo, useState } from "react";
import algosdk from "algosdk";
import { getAlgodConfigFromViteEnvironment } from "../utils/network/getAlgoClientConfigs";
import { AlgorandClient } from "@algorandfoundation/algokit-utils";

interface AppCallsInterface {
  openModal: boolean;
  setModalState: (value: boolean) => void;
}

const AppCalls = ({ openModal, setModalState }: AppCallsInterface) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [studentId, setStudentId] = useState<string>("student-001");
  const [dataGroup, setDataGroup] = useState<string>("Academic");
  const [dataGroupCustom, setDataGroupCustom] = useState<string>("");
  const [receiverGroup, setReceiverGroup] = useState<string>("College");
  const [receiverGroupCustom, setReceiverGroupCustom] = useState<string>("");
  const [logs, setLogs] = useState<{ status: "Granted" | "Revoked"; receiver: string; data: string; txId: string }[]>([]);
  const [records, setRecords] = useState<{ status: string; receiver: string; data: string; txId: string }[]>([]);
  const apiBase = useMemo(() => import.meta.env.VITE_API_BASE as string | undefined, []);
  const { enqueueSnackbar } = useSnackbar();
  const { transactionSigner, activeAddress } = useWallet();

  const algodConfig = getAlgodConfigFromViteEnvironment();
  const algorand = useMemo(() => AlgorandClient.fromConfig({ algodConfig }), [algodConfig]);

  const explorerBase = useMemo(() => {
    switch ((algodConfig.network ?? "").toLowerCase()) {
      case "testnet":
        return "https://testnet.explorer.perawallet.app/tx/";
      case "mainnet":
        return "https://explorer.perawallet.app/tx/";
      default:
        return ""; // LocalNet has no public explorer
    }
  }, [algodConfig.network]);

  const appId = useMemo(() => {
    const raw = import.meta.env.VITE_APP_ID;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : 0;
  }, []);

  const resolveDataGroup = () => (dataGroup === "Custom" ? dataGroupCustom.trim() : dataGroup);
  const resolveReceiverGroup = () => (receiverGroup === "Custom" ? receiverGroupCustom.trim() : receiverGroup);

  const makeMethod = (name: "grant_consent" | "revoke_consent") =>
    new algosdk.ABIMethod({
      name,
      args: [
        { name: "student_id", type: "string" },
        { name: "receiver_group", type: "string" },
        { name: "data_group", type: "string" },
      ],
      returns: { type: "string" },
    });

  const callConsent = async (action: "grant" | "revoke") => {
    const dataGroupValue = resolveDataGroup();
    const receiverGroupValue = resolveReceiverGroup();

    if (!dataGroupValue || !receiverGroupValue || !studentId.trim()) {
      enqueueSnackbar("Student ID, receiver group, and data group are required", { variant: "warning" });
      return;
    }

    setLoading(true);
    try {
      if (apiBase) {
        // Backend-signed path
        const resp = await fetch(`${apiBase}/consents/${action === "grant" ? "grant" : "revoke"}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(import.meta.env.VITE_API_TOKEN ? { Authorization: `Bearer ${import.meta.env.VITE_API_TOKEN}` } : {}),
          },
          body: JSON.stringify({
            studentId: studentId.trim(),
            receiverGroup: receiverGroupValue,
            dataGroup: dataGroupValue,
          }),
        });
        const data = await resp.json();
        if (!resp.ok) throw new Error(data.error || "Backend error");
        const txId = data.txId as string;
        enqueueSnackbar(`Txn sent: ${txId}`, { variant: "success" });
        setLogs((prev) => [
          {
            status: action === "grant" ? "Granted" : "Revoked",
            receiver: receiverGroupValue,
            data: dataGroupValue,
            txId,
          },
          ...prev,
        ]);
        if (data.returnValue) enqueueSnackbar(`Contract returned: ${data.returnValue}`, { variant: "info" });
        // fetch latest records after backend write
        await refreshStatus(studentId.trim());
      } else {
        // Frontend signer path
        if (!transactionSigner || !activeAddress) {
          enqueueSnackbar("Please connect wallet first", { variant: "warning" });
          return;
        }
        if (!appId) {
          enqueueSnackbar("Missing VITE_APP_ID env pointing to deployed contract", { variant: "error" });
          return;
        }
        const algod = algorand.client.algod;
        const suggestedParams = await algod.getTransactionParams().do();
        suggestedParams.flatFee = true;
        suggestedParams.fee = 1_000n;
        const atc = new algosdk.AtomicTransactionComposer();
        const boxKey = `${studentId.trim()}:${receiverGroupValue}:${dataGroupValue}`;
        atc.addMethodCall({
          appID: appId,
          method: makeMethod(action === "grant" ? "grant_consent" : "revoke_consent"),
          sender: activeAddress,
          suggestedParams,
          signer: transactionSigner,
          methodArgs: [studentId.trim(), receiverGroupValue, dataGroupValue],
          boxes: [
            {
              appIndex: 0,
              name: new TextEncoder().encode(boxKey),
            },
          ],
        });
        const result = await atc.execute(algod, 3);
        const txId = result.txIDs[0];
        const returnValue = result.methodResults[0]?.returnValue as string | undefined;
        enqueueSnackbar(`Txn sent: ${txId}`, { variant: "success" });
        setLogs((prev) => [
          {
            status: action === "grant" ? "Granted" : "Revoked",
            receiver: receiverGroupValue,
            data: dataGroupValue,
            txId,
          },
          ...prev,
        ]);
        if (returnValue) enqueueSnackbar(`Contract returned: ${returnValue}`, { variant: "info" });
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Unknown error";
      enqueueSnackbar(`Error sending consent txn: ${message}`, { variant: "error" });
    }
    setLoading(false);
  };

  const refreshStatus = async (student: string) => {
    if (!apiBase) {
      enqueueSnackbar("Backend API not configured; set VITE_API_BASE for status reads", { variant: "warning" });
      return;
    }
    if (!student.trim()) {
      enqueueSnackbar("Student ID is required to fetch status", { variant: "warning" });
      return;
    }
    try {
      const resp = await fetch(`${apiBase}/consents/${encodeURIComponent(student.trim())}`, {
        headers: {
          ...(import.meta.env.VITE_API_TOKEN ? { Authorization: `Bearer ${import.meta.env.VITE_API_TOKEN}` } : {}),
        },
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Backend error");
      const recs = (data.records as any[] | undefined) || [];
      setRecords(
        recs.map((r) => ({
          status: r.status ?? "unknown",
          receiver: r.receiverGroup ?? r.receiver ?? "",
          data: r.dataGroup ?? r.data ?? "",
          txId: r.txId ?? "",
        }))
      );
      enqueueSnackbar("Status refreshed", { variant: "success" });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unknown error";
      enqueueSnackbar(`Error fetching status: ${message}`, { variant: "error" });
    }
  };

  return (
    <dialog id="appcalls_modal" className={`modal ${openModal ? "modal-open" : ""} bg-slate-200`}>
      <form method="dialog" className="modal-box">
        <h3 className="font-bold text-lg">Consent controls (Testnet)</h3>
        <p className="text-sm">App ID: {appId || "Set VITE_APP_ID"}</p>

        <div className="mt-3 space-y-2">
          <input
            type="text"
            placeholder="Student ID"
            className="input input-bordered w-full"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
          />

          <div className="grid grid-cols-1 gap-2">
            <label className="text-sm font-semibold">Data group</label>
            <select className="select select-bordered w-full" value={dataGroup} onChange={(e) => setDataGroup(e.target.value)}>
              <option>Academic</option>
              <option>Portfolio</option>
              <option>Personal</option>
              <option>Custom</option>
            </select>
            {dataGroup === "Custom" && (
              <input
                type="text"
                placeholder="Custom data group"
                className="input input-bordered w-full"
                value={dataGroupCustom}
                onChange={(e) => setDataGroupCustom(e.target.value)}
              />
            )}
          </div>

          <div className="grid grid-cols-1 gap-2">
            <label className="text-sm font-semibold">Receiver group</label>
            <select className="select select-bordered w-full" value={receiverGroup} onChange={(e) => setReceiverGroup(e.target.value)}>
              <option>College</option>
              <option>Recruiters</option>
              <option>Custom</option>
            </select>
            {receiverGroup === "Custom" && (
              <input
                type="text"
                placeholder="Custom receiver group"
                className="input input-bordered w-full"
                value={receiverGroupCustom}
                onChange={(e) => setReceiverGroupCustom(e.target.value)}
              />
            )}
          </div>
        </div>

        <div className="modal-action grid">
          <button className="btn" onClick={() => setModalState(!openModal)}>
            Close
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" className={`btn ${loading ? "btn-disabled" : ""}`} onClick={() => callConsent("grant")}>
              {loading ? <span className="loading loading-spinner" /> : "Grant"}
            </button>
            <button type="button" className={`btn ${loading ? "btn-disabled" : ""}`} onClick={() => callConsent("revoke")}>
              {loading ? <span className="loading loading-spinner" /> : "Revoke"}
            </button>
          </div>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => refreshStatus(studentId)}
            disabled={loading}
          >
            Refresh status
          </button>
        </div>

        {logs.length > 0 && (
          <div className="mt-4 text-left">
            <div className="font-semibold mb-2">Recent actions</div>
            <ul className="space-y-1 max-h-48 overflow-y-auto">
              {logs.map((log, idx) => (
                <li key={`${log.txId}-${idx}`} className="text-sm border rounded p-2">
                  <div>
                    {log.status} → {log.receiver} / {log.data}
                  </div>
                  <div className="text-xs text-blue-700 break-all">
                    Txn:{" "}
                    {explorerBase ? (
                      <a className="link" href={`${explorerBase}${log.txId}`} target="_blank" rel="noreferrer">
                        {log.txId}
                      </a>
                    ) : (
                      log.txId
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {records.length > 0 && (
          <div className="mt-4 text-left">
            <div className="font-semibold mb-2">Stored status (backend)</div>
            <ul className="space-y-1 max-h-48 overflow-y-auto">
              {records.map((rec, idx) => (
                <li key={`${rec.txId}-${idx}`} className="text-sm border rounded p-2">
                  <div>
                    {rec.status} → {rec.receiver} / {rec.data}
                  </div>
                  <div className="text-xs text-blue-700 break-all">
                    Txn: {rec.txId || "n/a"}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </form>
    </dialog>
  );
};

export default AppCalls;
