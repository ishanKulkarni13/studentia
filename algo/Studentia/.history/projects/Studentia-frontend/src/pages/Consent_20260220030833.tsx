import { useState } from "react";
import AppCalls from "../components/AppCalls";
import { Button } from "@/components/ui/button";

function Consent() {
  const [openModal, setOpenModal] = useState(false);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Consent Management</h1>
        <p className="text-gray-600 mb-4">Grant or revoke consent for data sharing with organizations.</p>
        <Button onClick={() => setOpenModal(true)} className="bg-blue-600 hover:bg-blue-700">
          Open Consent Manager
        </Button>
      </div>
      <AppCalls openModal={openModal} setModalState={setOpenModal} />
    </div>
  );
}

export default Consent;
