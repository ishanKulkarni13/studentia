import { Outlet, useNavigate } from "react-router-dom";
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
import { Home, Shield, FileText, Upload, Send, User } from "lucide-react";
import ConnectWallet from "../components/ConnectWallet";
import { useState } from "react";
import { useWallet } from "@txnlab/use-wallet-react";

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
  const [openWalletModal, setOpenWalletModal] = useState(false);
  const { activeAddress } = useWallet();

  const toggleWalletModal = () => {
    setOpenWalletModal(!openWalletModal);
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2 px-4 py-2">
              <User className="h-6 w-6" />
              <span className="font-semibold">Studentia</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton onClick={() => navigate(item.url)}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <div className="p-4">
              <button
                className="btn btn-primary w-full"
                onClick={toggleWalletModal}
              >
                {activeAddress ? "Wallet Connected" : "Connect Wallet"}
              </button>
            </div>
          </SidebarFooter>
        </Sidebar>
        <main className="flex-1 overflow-auto">
          <header className="flex items-center gap-2 border-b px-4 py-2">
            <SidebarTrigger />
            <h1 className="font-semibold">Student Dashboard</h1>
          </header>
          <div className="flex-1">
            <Outlet />
          </div>
        </main>
        <ConnectWallet openModal={openWalletModal} closeModal={toggleWalletModal} />
      </div>
    </SidebarProvider>
  );
}

export default DashboardLayout;
