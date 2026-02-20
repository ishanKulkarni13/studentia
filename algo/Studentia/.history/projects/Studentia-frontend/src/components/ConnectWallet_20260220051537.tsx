import { useWallet, Wallet, WalletId } from '@txnlab/use-wallet-react'
import Account from './Account'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface ConnectWalletInterface {
  openModal: boolean
  closeModal: () => void
}

const ConnectWallet = ({ openModal, closeModal }: ConnectWalletInterface) => {
  const { wallets, activeAddress } = useWallet()

  const isKmd = (wallet: Wallet) => wallet.id === WalletId.KMD

  return (
    <Dialog open={openModal} onOpenChange={closeModal}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Select wallet provider</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {activeAddress && (
            <>
              <Account />
              <div className="divider" />
            </>
          )}
          {!activeAddress &&
            wallets?.map((wallet) => (
              <Button
                data-test-id={`${wallet.id}-connect`}
                key={`provider-${wallet.id}`}
                onClick={() => wallet.connect()}
                variant="outline"
                className="justify-start"
              >
                {!isKmd(wallet) && (
                  <img
                    alt={`wallet_icon_${wallet.id}`}
                    src={wallet.metadata.icon}
                    className="w-6 h-6 mr-2"
                  />
                )}
                <span>{isKmd(wallet) ? 'LocalNet Wallet' : wallet.metadata.name}</span>
              </Button>
            ))}
        </div>
        <DialogFooter>
          <Button onClick={closeModal}>Close</Button>
          {activeAddress && (
            <Button
              variant="destructive"
              onClick={async () => {
                if (wallets) {
                  const activeWallet = wallets.find((w) => w.isActive)
                  if (activeWallet) {
                    await activeWallet.disconnect()
                  } else {
                    // Required for logout/cleanup of inactive providers
                    // For instance, when you login to localnet wallet and switch network
                    // to testnet/mainnet or vice verse.
                    localStorage.removeItem('@txnlab/use-wallet:v3')
                    window.location.reload()
                  }
                }
              }}
            >
              Logout
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ConnectWallet
