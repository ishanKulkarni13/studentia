import { algo, AlgorandClient } from '@algorandfoundation/algokit-utils'
import { useWallet } from '@txnlab/use-wallet-react'
import { useSnackbar } from 'notistack'
import { useState } from 'react'
import { getAlgodConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs'
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const TransactionsForm = () => {
  const [loading, setLoading] = useState<boolean>(false)
  const [receiverAddress, setReceiverAddress] = useState<string>('')

  const algodConfig = getAlgodConfigFromViteEnvironment()
  const algorand = AlgorandClient.fromConfig({ algodConfig })

  const { enqueueSnackbar } = useSnackbar()
  const { transactionSigner, activeAddress } = useWallet()

  const handleSubmitAlgo = async () => {
    setLoading(true)

    if (!transactionSigner || !activeAddress) {
      enqueueSnackbar('Please connect wallet first', { variant: 'warning' })
      return
    }

    try {
      enqueueSnackbar('Sending transaction...', { variant: 'info' })
      const result = await algorand.send.payment({
        signer: transactionSigner,
        sender: activeAddress,
        receiver: receiverAddress,
        amount: algo(1),
      })
      enqueueSnackbar(`Transaction sent: ${result.txIds[0]}`, { variant: 'success' })
      setReceiverAddress('')
    } catch (e) {
      enqueueSnackbar('Failed to send transaction', { variant: 'error' })
    }

    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Send Payment Transaction</CardTitle>
          <CardDescription>Send test transactions on the Algorand blockchain.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Receiver Address</label>
            <Input
              type="text"
              placeholder="Provide wallet address"
              value={receiverAddress}
              onChange={(e) => setReceiverAddress(e.target.value)}
              className={receiverAddress.length === 58 ? '' : 'border-red-300'}
            />
            {receiverAddress && receiverAddress.length !== 58 && (
              <p className="text-sm text-red-600 mt-1">Address must be 58 characters long</p>
            )}
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Transaction Details</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p><strong>Amount:</strong> 1 ALGO</p>
              <p><strong>Network:</strong> {algodConfig.network}</p>
              {activeAddress && (
                <p><strong>From:</strong> {activeAddress.slice(0, 6)}...{activeAddress.slice(-4)}</p>
              )}
            </div>
          </div>

          <Button
            onClick={handleSubmitAlgo}
            disabled={loading || receiverAddress.length !== 58 || !activeAddress}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Sending...
              </div>
            ) : (
              'Send 1 Algo'
            )}
          </Button>

          {!activeAddress && (
            <div className="text-center text-sm text-gray-600">
              Please connect your wallet first to send transactions.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default TransactionsForm
