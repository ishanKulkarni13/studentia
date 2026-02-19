import { useState } from "react";
import DocumentUploads from "../components/DocumentUploads";

function Documents() {
  const [openModal, setOpenModal] = useState(true);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Document Management</h1>
      <p className="mb-4">Upload, share, and manage your documents.</p>
      <DocumentUploads openModal={openModal} setModalState={setOpenModal} />
    </div>
  );
}

export default Documents;
