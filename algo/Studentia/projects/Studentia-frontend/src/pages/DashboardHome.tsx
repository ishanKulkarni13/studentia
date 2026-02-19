import { useWallet } from "@txnlab/use-wallet-react";
import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, FileText, Upload, Send, Wallet } from "lucide-react";

function DashboardHome() {
  const { activeAddress } = useWallet();
  const appId = useMemo(() => import.meta.env.VITE_APP_ID ?? "Set VITE_APP_ID", []);

  const features = [
    {
      title: "Consent Management",
      description: "Grant or revoke consent for data sharing with organizations",
      icon: Shield,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Access Requests",
      description: "Manage incoming access requests from organizations",
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Document Management",
      description: "Upload and share documents with consent-gated access",
      icon: Upload,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Transactions",
      description: "Send test transactions and manage blockchain interactions",
      icon: Send,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Studentia</h1>
        <p className="text-gray-600">Manage your data consent and sharing securely on the blockchain.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Wallet Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Status:</span>
                <span className={`text-sm font-medium ${activeAddress ? 'text-green-600' : 'text-red-600'}`}>
                  {activeAddress ? 'Connected' : 'Not Connected'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">App ID:</span>
                <span className="text-sm font-medium">{appId}</span>
              </div>
              {activeAddress && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Address</p>
                  <p className="text-sm font-mono break-all">{activeAddress}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-sm text-gray-600">
                1. Connect your wallet to interact with the blockchain
              </div>
              <div className="text-sm text-gray-600">
                2. Grant consent for data sharing with organizations
              </div>
              <div className="text-sm text-gray-600">
                3. Upload documents and manage access requests
              </div>
              <div className="text-sm text-gray-600">
                4. Monitor your transactions and consent status
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className={`w-10 h-10 rounded-lg ${feature.bgColor} flex items-center justify-center mb-2`}>
                  <feature.icon className={`h-5 w-5 ${feature.color}`} />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
          </div>
          </div>

    </div>
  );
}

export default DashboardHome;
