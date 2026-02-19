// src/components/Home.tsx
import { useWallet } from '@txnlab/use-wallet-react'
import React, { useMemo, useState } from 'react'
import ConnectWallet from './components/ConnectWallet'
import Transact from './components/Transact'
import AppCalls from './components/AppCalls'

interface HomeProps {}

const Home: React.FC<HomeProps> = () => {
  const [openWalletModal, setOpenWalletModal] = useState<boolean>(false)
  const [openDemoModal, setOpenDemoModal] = useState<boolean>(false)
  const [appCallsDemoModal, setAppCallsDemoModal] = useState<boolean>(false)
  const { activeAddress } = useWallet()
  const appId = useMemo(() => import.meta.env.VITE_APP_ID ?? 'Set VITE_APP_ID', [])

  const toggleWalletModal = () => {
    setOpenWalletModal(!openWalletModal)
  }

  const toggleDemoModal = () => {
    setOpenDemoModal(!openDemoModal)
  }

  const toggleAppCallsModal = () => {
    setAppCallsDemoModal(!appCallsDemoModal)
  }

  return (
    <div className="hero min-h-screen bg-teal-400">
      <div className="hero-content text-center rounded-lg p-6 max-w-xl bg-white mx-auto shadow-lg">
        <div className="max-w-xl space-y-4">
          <h1 className="text-4xl font-bold">Studentia – Consent Control</h1>
          <p className="py-2 text-sm text-gray-700">
            Connect a wallet, then grant or revoke consent by data group (Academic, Portfolio, Personal, Custom) and receiver group
            (College, Recruiters, Custom). Contract App ID: {appId}.
          </p>

          <div className="stats shadow w-full">
            <div className="stat">
              <div className="stat-title">Wallet</div>
              <div className="stat-value text-lg break-all">{activeAddress ?? 'Not connected'}</div>
            </div>
          </div>

          <div className="grid gap-3">
            <button data-test-id="connect-wallet" className="btn btn-primary" onClick={toggleWalletModal}>
              {activeAddress ? 'Change / Disconnect Wallet' : 'Connect Wallet'}
            </button>

            <button
              data-test-id="appcalls-demo"
              className={`btn ${!activeAddress ? 'btn-disabled' : ''}`}
              onClick={toggleAppCallsModal}
            >
              Consent: Grant / Revoke
            </button>

            <button
              data-test-id="transactions-demo"
              className={`btn ${!activeAddress ? 'btn-disabled' : ''}`}
              onClick={toggleDemoModal}
            >
              Send 1 Algo (test)
            </button>
          </div>

          <div className="text-left text-sm bg-slate-100 p-3 rounded">
            <div className="font-semibold mb-1">Quick steps</div>
            <ol className="list-decimal list-inside space-y-1">
              <li>Connect wallet (LocalNet or Testnet).</li>
              <li>Open “Consent: Grant / Revoke”, pick data/receiver groups, click Grant or Revoke.</li>
              <li>Copy the txn ID to show on chain.</li>
            </ol>
          </div>

          <ConnectWallet openModal={openWalletModal} closeModal={toggleWalletModal} />
          <Transact openModal={openDemoModal} setModalState={setOpenDemoModal} />
          <AppCalls openModal={appCallsDemoModal} setModalState={setAppCallsDemoModal} />
        </div>
      </div>
    </div>
  )
}

export default Home
