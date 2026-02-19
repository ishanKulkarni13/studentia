import { useWallet } from "@txnlab/use-wallet-react";
import { useSnackbar } from "notistack";
import { useMemo, useState } from "react";
import algosdk from "algosdk";
import { getAlgodConfigFromViteEnvironment } from "../utils/network/getAlgoClientConfigs";
import { AlgorandClient } from "@algorandfoundation/algokit-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ExternalLink, RefreshCw, CheckCircle, XCircle, AlertCircle, Shield } from "lucide-react";

const ConsentForm = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [studentId, setStudentId] = useState<string>("student-001");
  const [dataGroup, setDataGroup] = useState<string>("Academic");
  const [dataGroupCustom, setDataGroupCustom] = useState<string>("");
  const [receiverGroup, setReceiverGroup] = useState<string>("College");
  const [receiverGroupCustom, setReceiverGroupCustom] = useState<string>("");
  const [logs, setLogs] = useState<{ status: "Granted" | "Revoked"; receiver: string; data: string; txId: string }[]>([]);
  const [records, setRecords] = useState<{ status: string; receiver: string; data: string; txId: string }[]>([]);
  const [onChainStatuses, setOnChainStatuses] = useState<{ status: string; receiver: string; data: string; boxKey: string }[]>([]);
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
        return "";
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
    algosdk.ABIMethod.fromSignature(`${name}(string,string,string)void`);

  const refreshStatus = async (student: string) => {
    if (!apiBase) return;
    try {
      const resp = await fetch(`${apiBase}/consents/${encodeURIComponent(student)}`, {
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
          receiver: r.receiverGroup ?? "",
          data: r.dataGroup ?? "",
          txId: r.txId ?? "",
        })),
      );
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unknown error";
      enqueueSnackbar(`Error fetching status: ${message}`, { variant: "error" });
    }
  };

  const refreshOnChainStatus = async () => {
    if (!apiBase) return;
    if (!studentId.trim()) {
      enqueueSnackbar("Student ID is required to fetch on-chain status", { variant: "warning" });
      return;
    }
    try {
      const resp = await fetch(`${apiBase}/consents/onchain/${encodeURIComponent(studentId.trim())}`, {
        headers: {
          ...(import.meta.env.VITE_API_TOKEN ? { Authorization: `Bearer ${import.meta.env.VITE_API_TOKEN}` } : {}),
        },
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Backend error");
      const statuses = (data.statuses as any[] | undefined) || [];
      setOnChainStatuses(
        statuses.map((s) => ({
          status: s.status ?? "unknown",
          receiver: s.receiverGroup ?? "",
          data: s.dataGroup ?? "",
          boxKey: s.boxKey ?? "",
        })),
      );
      enqueueSnackbar("On-chain status refreshed", { variant: "success" });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unknown error";
      enqueueSnackbar(`Error fetching on-chain status: ${message}`, { variant: "error" });
    }
  };

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
        await refreshStatus(studentId.trim());
      } else {
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Consent Management
          </CardTitle>
          <CardDescription>
            Grant or revoke consent for data sharing with organizations. App ID: {appId || "Set VITE_APP_ID"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="student-id">Student ID</Label>
              <Input
                id="student-id"
                placeholder="Enter student ID"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="data-group">Data Group</Label>
                <Select value={dataGroup} onValueChange={setDataGroup}>
                  <SelectTrigger id="data-group">
                    <SelectValue placeholder="Select data group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Academic">Academic</SelectItem>
                    <SelectItem value="Portfolio">Portfolio</SelectItem>
                    <SelectItem value="Personal">Personal</SelectItem>
                    <SelectItem value="Custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
                {dataGroup === "Custom" && (
                  <Input
                    placeholder="Enter custom data group"
                    value={dataGroupCustom}
                    onChange={(e) => setDataGroupCustom(e.target.value)}
                    className="mt-2"
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="receiver-group">Receiver Group</Label>
                <Select value={receiverGroup} onValueChange={setReceiverGroup}>
                  <SelectTrigger id="receiver-group">
                    <SelectValue placeholder="Select receiver group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="College">College</SelectItem>
                    <SelectItem value="Recruiters">Recruiters</SelectItem>
                    <SelectItem value="Custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
                {receiverGroup === "Custom" && (
                  <Input
                    placeholder="Enter custom receiver group"
                    value={receiverGroupCustom}
                    onChange={(e) => setReceiverGroupCustom(e.target.value)}
                    className="mt-2"
                  />
                )}
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => callConsent("grant")}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
              size="lg"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              {loading ? "Processing..." : "Grant Consent"}
            </Button>
            <Button
              onClick={() => callConsent("revoke")}
              disabled={loading}
              variant="destructive"
              size="lg"
            >
              <XCircle className="h-4 w-4 mr-2" />
              {loading ? "Processing..." : "Revoke Consent"}
            </Button>
            <Button
              onClick={() => refreshStatus(studentId.trim())}
              variant="outline"
              size="lg"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Status
            </Button>
            <Button
              onClick={refreshOnChainStatus}
              variant="outline"
              size="lg"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh On-Chain
            </Button>
          </div>
        </CardContent>
      </Card>

      {logs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Recent Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {logs.map((log, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Badge variant={log.status === "Granted" ? "success" : "error"}>
                      {log.status}
                    </Badge>
                    <div className="text-sm">
                      <span className="font-medium">{log.receiver}</span>
                      <span className="text-muted-foreground"> / {log.data}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-background px-2 py-1 rounded">
                      {log.txId.slice(0, 10)}...
                    </code>
                    {explorerBase && (
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                      >
                        <a
                          href={`${explorerBase}${log.txId}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {records.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Stored Status (Backend)</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {records.map((rec, idx) => (
                <li key={idx} className="p-3 bg-gray-50 rounded-lg">
                  <div className="font-medium">{rec.status} → {rec.receiver} / {rec.data}</div>
                  <div className="text-sm text-gray-600">Txn: {rec.txId || "n/a"}</div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {onChainStatuses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Stored Status (On-Chain)</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {onChainStatuses.map((rec, idx) => (
                <li key={idx} className="p-3 bg-gray-50 rounded-lg">
                  <div className="font-medium">{rec.status} → {rec.receiver} / {rec.data}</div>
                  <div className="text-sm text-gray-600">Box: {rec.boxKey || "n/a"}</div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ConsentForm;
