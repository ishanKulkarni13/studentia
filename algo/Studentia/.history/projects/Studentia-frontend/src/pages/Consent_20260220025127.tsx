import { useState } from "react";
import AppCalls from "../components/AppCalls";

function Consent() {
  const [openModal, setOpenModal] = useState(true);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Consent Management</h1>
      <p className="mb-4">Grant or revoke consent for data sharing.</p>
      <AppCalls openModal={openModal} setModalState={setOpenModal} />
    </div>
  );
}

export default Consent;
