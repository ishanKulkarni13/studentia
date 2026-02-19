import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Home, Shield, FileText, Upload, Send, User, Wallet, LogOut } from "lucide-react";
import ConnectWallet from "../components/ConnectWallet";
import { useState } from "react";
import { useWallet } from "@txnlab/use-wallet-react";
import { Button } from "@/components/ui/button";

const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Consent",
    url: "/dashboard/consent",
    icon: Shield,
  },
  {
    title: "Access Requests",
    url: "/dashboard/access-requests",
    icon: FileText,
  },
  {
    title: "Documents",
    url: "/dashboard/documents",
    icon: Upload,
  },
  {
    title: "Transactions",
    url: "/dashboard/transactions",
    icon: Send,
  },
];

function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [openWalletModal, setOpenWalletModal] = useState(false);
  const { activeAddress, activeWallet } = useWallet();

  const toggleWalletModal = () => {
    setOpenWalletModal(!openWalletModal);
  };

  const handleLogout = () => {
    // Navigate back to home
    navigate("/");
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-gray-50">
        <Sidebar className="border-r border-gray-200">
          <SidebarHeader className="border-b border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                <User className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-gray-900">Studentia</h2>
                <p className="text-xs text-gray-500">Consent Management</p>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent className="px-2 py-4">
            <SidebarGroup>
              <SidebarGroupLabel className="px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Navigation
              </SidebarGroupLabel>
              <SidebarGroupContent className="mt-2">
                <SidebarMenu className="space-y-1">
                  {menuItems.map((item) => {
                    const isActive = location.pathname === item.url;
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          onClick={() => navigate(item.url)}
                          className={`w-full justify-start px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                            isActive
                              ? "bg-blue-100 text-blue-700 border border-blue-200"
                              : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                          }`}
                        >
                          <item.icon className={`h-4 w-4 mr-3 ${isActive ? "text-blue-600" : "text-gray-500"}`} />
                          <span>{item.title}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="border-t border-gray-200 p-4">
            <div className="space-y-3">
              {activeAddress ? (
                <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg border border-green-200">
                  <Wallet className="h-4 w-4 text-green-600" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-green-800 truncate">
                      {activeWallet?.metadata.name || "Wallet"}
                    </p>
                    <p className="text-xs text-green-600 truncate">
                      {truncateAddress(activeAddress)}
                    </p>
                  </div>
                </div>
              ) : (
                <Button
                  onClick={toggleWalletModal}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  size="sm"
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  Connect Wallet
                </Button>
              )}
              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
                size="sm"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>
        <main className="flex-1 overflow-auto">
          <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="text-gray-500 hover:text-gray-700" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Student Dashboard</h1>
                <p className="text-sm text-gray-500">Manage your data consent and sharing</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {activeAddress && (
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {activeWallet?.metadata.name || "Connected"}
                  </p>
                  <p className="text-xs text-gray-500">{truncateAddress(activeAddress)}</p>
                </div>
              )}
            </div>
          </header>
          <div className="flex-1 p-6">
            <Outlet />
          </div>
        </main>
        <ConnectWallet openModal={openWalletModal} closeModal={toggleWalletModal} />
      </div>
    </SidebarProvider>
  );
}

export default DashboardLayout;
