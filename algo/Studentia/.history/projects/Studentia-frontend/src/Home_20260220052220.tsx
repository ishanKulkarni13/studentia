// src/components/Home.tsx
import React, { useMemo } from "react";
import { useWallet } from "@txnlab/use-wallet-react";
import { useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import ConnectWallet from "./components/ConnectWallet";
import { useUIStore } from "@/stores/uiStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ellipseAddress } from "@/utils/ellipseAddress";

interface HomeProps {}

const Home: React.FC<HomeProps> = () => {
  const { openWalletModal, setWalletModal } = useUIStore();
  const { activeAddress } = useWallet();
  const navigate = useNavigate();
  const appId = useMemo(() => import.meta.env.VITE_APP_ID ?? "Set VITE_APP_ID", []);
  const network = useMemo(() => import.meta.env.VITE_ALGOD_NETWORK ?? "localnet", []);
  const hasApiBase = useMemo(() => Boolean(import.meta.env.VITE_API_BASE), []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 space-y-12">
        {/* Hero Section */}
        <section className="text-center space-y-6">
          <h1 className="text-5xl font-bold">Own your student data. Grant access with consent.</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Studentia lets students control who can view which data groups, with wallet-based identity and on-chain consent tracking.
          </p>
        </section>

        {/* How it Works */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle className="text-center">How it Works</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-2 text-center">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold mx-auto">1</div>
                  <h3 className="text-lg font-medium">Connect Wallet</h3>
                  <p className="text-muted-foreground">Link your wallet to establish identity and enable consent management.</p>
                </div>
                <div className="space-y-2 text-center">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold mx-auto">2</div>
                  <h3 className="text-lg font-medium">Set Consent</h3>
                  <p className="text-muted-foreground">Grant or revoke access by data group and requester group.</p>
                </div>
                <div className="space-y-2 text-center">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold mx-auto">3</div>
                  <h3 className="text-lg font-medium">Manage in Dashboard</h3>
                  <p className="text-muted-foreground">Handle requests and documents from your centralized control panel.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Key Value Props */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Key Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-2 text-center">
                  <h3 className="text-lg font-medium">Granular Consent</h3>
                  <p className="text-muted-foreground">Control access by specific data categories.</p>
                </div>
                <div className="space-y-2 text-center">
                  <h3 className="text-lg font-medium">Request-Group Access</h3>
                  <p className="text-muted-foreground">Manage permissions based on requester groups.</p>
                </div>
                <div className="space-y-2 text-center">
                  <h3 className="text-lg font-medium">On-Chain Verification</h3>
                  <p className="text-muted-foreground">All consent tracked immutably on the blockchain.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Quick Access Tiles */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Quick Access</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate("/dashboard/consents")}>
                  <CardHeader>
                    <CardTitle>Consent Controls</CardTitle>
                    <CardDescription>Manage your data sharing permissions</CardDescription>
                  </CardHeader>
                </Card>
                <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate("/dashboard/access-requests")}>
                  <CardHeader>
                    <CardTitle>Access Requests</CardTitle>
                    <CardDescription>Review and respond to data requests</CardDescription>
                  </CardHeader>
                </Card>
                <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate("/dashboard/documents")}>
                  <CardHeader>
                    <CardTitle>Documents</CardTitle>
                    <CardDescription>Upload and manage documents</CardDescription>
                  </CardHeader>
                </Card>
                <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate("/dashboard")}>
                  <CardHeader>
                    <CardTitle>Dashboard</CardTitle>
                    <CardDescription>Full overview of your account</CardDescription>
                  </CardHeader>
                </Card>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Trust / Security Note */}
        <section>
          <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-6 text-center">
              <h3 className="text-lg font-medium mb-2">Trust & Security</h3>
              <p className="text-muted-foreground">
                Your consent state is auditable on-chain. You can revoke access anytime, ensuring you remain in full control of your data sharing.
              </p>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-muted py-6 mt-12">
        <div className="container mx-auto px-4 text-center space-y-4">
          <div className="flex justify-center space-x-4">
            <Badge variant="outline">Network: {network}</Badge>
            <Badge variant="outline">API: {hasApiBase ? "Connected" : "Disconnected"}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            <a href="/docs" className="hover:underline">Documentation</a>
          </p>
        </div>
      </footer>

      <ConnectWallet openModal={openWalletModal} closeModal={() => setWalletModal(false)} />
    </div>
  );
};

export default Home;
