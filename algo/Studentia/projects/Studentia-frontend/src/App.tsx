import { SupportedWallet, WalletId, WalletManager, WalletProvider } from "@txnlab/use-wallet-react";
import { SnackbarProvider } from "notistack";
import Home from "./Home";
import { getAlgodConfigFromViteEnvironment, getKmdConfigFromViteEnvironment } from "./utils/network/getAlgoClientConfigs";
import { Routes, Route } from "react-router-dom";

// pages
import StudentDashboard from "./pages/StudentDashboard.tsx";
import DashboardHome from "./pages/DashboardHome.tsx";
import Consent from "./pages/Consent.tsx";
import AccessRequestsPage from "./pages/AccessRequestsPage.tsx";
import Documents from "./pages/Documents.tsx";
import Transactions from "./pages/Transactions.tsx";

let supportedWallets: SupportedWallet[];
if (import.meta.env.VITE_ALGOD_NETWORK === "localnet") {
  const kmdConfig = getKmdConfigFromViteEnvironment();
  supportedWallets = [
    {
      id: WalletId.KMD,
      options: {
        baseServer: kmdConfig.server,
        token: String(kmdConfig.token),
        port: String(kmdConfig.port),
      },
    },
  ];
} else {
  supportedWallets = [
    { id: WalletId.DEFLY },
    { id: WalletId.PERA },
    { id: WalletId.EXODUS },
    // If you are interested in WalletConnect v2 provider
    // refer to https://github.com/TxnLab/use-wallet for detailed integration instructions
  ];
}

export default function App() {
  const algodConfig = getAlgodConfigFromViteEnvironment();

  const walletManager = new WalletManager({
    wallets: supportedWallets,
    defaultNetwork: algodConfig.network,
    networks: {
      [algodConfig.network]: {
        algod: {
          baseServer: algodConfig.server,
          port: algodConfig.port,
          token: String(algodConfig.token),
        },
      },
    },
    options: {
      resetNetwork: true,
    },
  });

  return (
    <SnackbarProvider maxSnack={3}>
      <WalletProvider manager={walletManager}>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<StudentDashboard />}>
            <Route index element={<DashboardHome />} />
            <Route path="consent" element={<Consent />} />
            <Route path="access-requests" element={<AccessRequestsPage />} />
            <Route path="documents" element={<Documents />} />
            <Route path="transactions" element={<Transactions />} />
          </Route>
        </Routes>
      </WalletProvider>
    </SnackbarProvider>
  );
}
