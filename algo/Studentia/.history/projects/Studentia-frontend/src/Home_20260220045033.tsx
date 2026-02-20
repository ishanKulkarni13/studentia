// src/components/Home.tsx
import { useWallet } from "@txnlab/use-wallet-react";
import React, { useMemo } from "react";
import ConnectWallet from "./components/ConnectWallet";
import Transact from "./components/Transact";
import AppCalls from "./components/AppCalls";
import { useNavigate } from "react-router-dom";
import { useUIStore } from "@/stores/uiStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface HomeProps {}

const Home: React.FC<HomeProps> = () => {
  const {
    openWalletModal,
    setWalletModal,
    openDemoModal,
    setDemoModal,
    appCallsDemoModal,
    setAppCallsDemoModal,
  } = useUIStore();

  const { activeAddress } = useWallet();
  const navigate = useNavigate();
  const appId = useMemo(() => import.meta.env.VITE_APP_ID ?? "Set VITE_APP_ID", []);
  const network = useMemo(() => import.meta.env.VITE_ALGOD_NETWORK ?? "localnet", []);
  const hasApiBase = useMemo(() => Boolean(import.meta.env.VITE_API_BASE), []);

  const toggleWalletModal = () => {
    setWalletModal(!openWalletModal);
  };

  const toggleDemoModal = () => {
    setDemoModal(!openDemoModal);
  };

  const toggleAppCallsModal = () => {
    setAppCallsDemoModal(!appCallsDemoModal);
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8 md:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <Card>
          <CardHeader className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">Studentia</Badge>
              <Badge variant="outline">Network: {network}</Badge>
              <Badge variant="outline">App ID: {appId}</Badge>
            </div>
            <CardTitle className="text-3xl">Consent Control Center</CardTitle>
            <CardDescription>
              Connect wallet, manage consent, access requests, and document uploads from one place.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 rounded-md border p-4">
              <p className="text-sm font-medium">Wallet</p>
              <p className="break-all text-sm text-muted-foreground">{activeAddress ?? "Not connected"}</p>
            </div>
            <div className="space-y-2 rounded-md border p-4">
              <p className="text-sm font-medium">Backend API</p>
              <p className="text-sm text-muted-foreground">{hasApiBase ? "Configured" : "Not configured"}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Start common test and demo flows.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Button data-test-id="connect-wallet" onClick={toggleWalletModal}>
                {activeAddress ? "Change / Disconnect Wallet" : "Connect Wallet"}
              </Button>

              <Button
                data-test-id="appcalls-demo"
                variant="secondary"
                onClick={toggleAppCallsModal}
                disabled={!activeAddress && !hasApiBase}
              >
                Consent: Grant / Revoke
              </Button>

              <Button
                data-test-id="access-requests-demo"
                variant="outline"
                onClick={() => navigate("/dashboard/access-requests")}
                disabled={!hasApiBase}
              >
                Access Requests
              </Button>

              <Button
                data-test-id="documents-demo"
                variant="outline"
                onClick={() => navigate("/dashboard/documents")}
                disabled={!hasApiBase}
              >
                Documents Upload
              </Button>

              <Button
                data-test-id="transactions-demo"
                variant="secondary"
                onClick={toggleDemoModal}
                disabled={!activeAddress}
              >
                Send 1 Algo (test)
              </Button>

              <Button onClick={() => navigate("/dashboard")}>Go to Dashboard</Button>
            </div>

            <Separator />

            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Quick steps</p>
              <ol className="list-decimal space-y-1 pl-5">
                <li>Connect wallet (LocalNet or Testnet).</li>
                <li>Open consent controls and grant/revoke access for data and receiver groups.</li>
                <li>Use Access Requests and Documents pages for end-to-end testing.</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        <ConnectWallet openModal={openWalletModal} closeModal={() => setWalletModal(false)} />
        <Transact openModal={openDemoModal} setModalState={setDemoModal} />
        <AppCalls openModal={appCallsDemoModal} setModalState={setAppCallsDemoModal} />
      </div>
    </div>
  );
};

export default Home;
