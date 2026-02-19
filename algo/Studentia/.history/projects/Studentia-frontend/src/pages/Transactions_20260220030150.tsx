import { useState } from "react";
import Transact from "../components/Transact";
import { Button } from "@/components/ui/button";

function Transactions() {
  const [openModal, setOpenModal] = useState(false);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Transactions</h1>
        <p className="text-gray-600 mb-4">Send test transactions and manage blockchain interactions.</p>
        <Button onClick={() => setOpenModal(true)} className="bg-blue-600 hover:bg-blue-700">
          Open Transaction Manager
        </Button>
      </div>
      <Transact openModal={openModal} setModalState={setOpenModal} />
    </div>
  );
}

export default Transactions;
