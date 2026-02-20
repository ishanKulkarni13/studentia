// src/components/Home.tsx
import { useWallet } from "@txnlab/use-wallet-react";
import React from "react";
import ConnectWallet from "./components/ConnectWallet";
import { useNavigate } from "react-router-dom";
import { useUIStore } from "@/stores/uiStore";
import { Button } from "@/components/ui/button";

interface HomeProps {}

const Home: React.FC<HomeProps> = () => {
  const { openWalletModal, setWalletModal } = useUIStore();
  const { activeAddress } = useWallet();
  const navigate = useNavigate();

  const toggleWalletModal = () => {
    setWalletModal(!openWalletModal);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-8">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold text-gray-900">Studentia</h1>
          <h2 className="text-2xl font-semibold text-indigo-600">Consent Control Center</h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Manage your data consents, access requests, and document uploads seamlessly from one centralized platform.
            Connect your wallet and take control of your digital privacy.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            size="lg"
            onClick={toggleWalletModal}
            className="px-8 py-3 text-lg"
          >
            {activeAddress ? "Change / Disconnect Wallet" : "Connect Wallet"}
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate("/dashboard")}
            className="px-8 py-3 text-lg"
          >
            Go to Dashboard
          </Button>
        </div>
      </div>

      <ConnectWallet openModal={openWalletModal} closeModal={() => setWalletModal(false)} />
    </div>
  );
};

export default Home;
