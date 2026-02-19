import { useState } from "react";
import DocumentUploads from "../components/DocumentUploads";
import { Button } from "@/components/ui/button";

function Documents() {
  const [openModal, setOpenModal] = useState(false);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Document Management</h1>
        <p className="text-gray-600 mb-4">Upload, share, and manage your documents.</p>
        <Button onClick={() => setOpenModal(true)} className="bg-blue-600 hover:bg-blue-700">
          Open Document Manager
        </Button>
      </div>
      <DocumentUploads openModal={openModal} setModalState={setOpenModal} />
    </div>
  );
}

export default Documents;
