import { useWallet } from "@txnlab/use-wallet-react";
import { useMemo } from "react";

function DashboardHome() {
  const { activeAddress } = useWallet();
  const appId = useMemo(() => import.meta.env.VITE_APP_ID ?? "Set VITE_APP_ID", []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Student Dashboard</h1>
      <p className="mb-4">Welcome to your consent management dashboard.</p>

      <div className="stats shadow w-full mb-4">
        <div className="stat">
          <div className="stat-title">Wallet</div>
          <div className="stat-value text-lg break-all">{activeAddress ?? "Not connected"}</div>
        </div>
        <div className="stat">
          <div className="stat-title">App ID</div>
          <div className="stat-value text-lg">{appId}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Consent Management</h2>
            <p>Grant or revoke consent for data sharing with organizations.</p>
          </div>
        </div>
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Access Requests</h2>
            <p>Manage incoming access requests from organizations.</p>
          </div>
        </div>
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Documents</h2>
            <p>Upload and share documents with consent-gated access.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardHome;
