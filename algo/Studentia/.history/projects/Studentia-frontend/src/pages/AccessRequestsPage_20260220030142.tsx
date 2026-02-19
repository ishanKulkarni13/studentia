import { useState } from "react";
import AccessRequests from "../components/AccessRequests";
import { Button } from "@/components/ui/button";

function AccessRequestsPage() {
  const [openModal, setOpenModal] = useState(false);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Requests</h1>
        <p className="text-gray-600 mb-4">Manage access requests from organizations.</p>
        <Button onClick={() => setOpenModal(true)} className="bg-blue-600 hover:bg-blue-700">
          Open Access Requests Manager
        </Button>
      </div>
      <AccessRequests openModal={openModal} setModalState={setOpenModal} />
    </div>
  );
}

export default AccessRequestsPage;
