import { useState } from "react";
import Transact from "../components/Transact";

function Transactions() {
  const [openModal, setOpenModal] = useState(true);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Transactions</h1>
      <p className="mb-4">Send test transactions.</p>
      <Transact openModal={openModal} setModalState={setOpenModal} />
    </div>
  );
}

export default Transactions;
