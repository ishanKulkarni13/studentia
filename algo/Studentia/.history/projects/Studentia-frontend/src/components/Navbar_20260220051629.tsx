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