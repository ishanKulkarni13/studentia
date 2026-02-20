import React from 'react'
import { useWallet } from '@txnlab/use-wallet-react'
import { useNavigate } from 'react-router-dom'
import { useUIStore } from '@/stores/uiStore'
import { Button } from '@/components/ui/button'

interface NavbarProps {}

const Navbar: React.FC<NavbarProps> = () => {
  const { activeAddress } = useWallet()
  const navigate = useNavigate()
  const { openWalletModal, setWalletModal } = useUIStore()

  const toggleWalletModal = () => {
    setWalletModal(!openWalletModal)
  }

  return (
    <nav className="bg-white shadow-md border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              {/* Logo placeholder */}
              <div className="w-8 h-8 bg-indigo-600 rounded-md flex items-center justify-center text-white font-bold">
                S
              </div>
              <span className="ml-2 text-xl font-semibold text-gray-900">Studentia</span>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <a href="/" className="text-gray-900 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
                  Home
                </a>
                <a href="/about" className="text-gray-500 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
                  About
                </a>
                {/* Add more sections here */}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              onClick={toggleWalletModal}
              variant="outline"
            >
              {activeAddress ? 'Wallet' : 'Connect Wallet'}
            </Button>
            <Button onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
