import { useState } from "react";
import AccessRequests from "../components/AccessRequests";

function AccessRequestsPage() {
  const [openModal, setOpenModal] = useState(true);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Access Requests</h1>
      <p className="mb-4">Manage access requests from organizations.</p>
      <AccessRequests openModal={openModal} setModalState={setOpenModal} />
    </div>
  );
}

export default AccessRequestsPage;
