import { useState } from 'react';
import { IOrder } from '@/Helpers/Interfaces';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import config from '@/Helpers/config';
import apiClient from '@/lib/apiClient';
import axios from 'axios';

interface ViewOrderModalProps {
  open: boolean;
  onClose: CallableFunction;
  selectedOrder: IOrder | null;
  reloadOrders: CallableFunction;
}

function ViewOrderModal(props: ViewOrderModalProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleOrderCancel = async () => {
    setIsLoading(true)
    try {
      await apiClient.patch(config.apiUrl + 'orders/cancel/' + props.selectedOrder?.id)
      toast.success('Order cancelled', { description: new Date().toLocaleString() });
      props.reloadOrders();
      props.onClose();
    } catch (error) {
      toast.error('Failed to cancel order', { description: 'An unknown error occurred' });
      console.error('Failed to cancel order', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={props.open} onOpenChange={() => props.onClose()}>
      <DialogContent className='sm:max-w-4xl'>
        <DialogHeader>
          <DialogTitle>Order - {props.selectedOrder?.referenceNo}</DialogTitle>
        </DialogHeader>
        {props.selectedOrder && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4 px-2">
            <div>
              <h3 className="text-lg font-semibold mb-2">Customer Info</h3>
              <p><strong>Name:</strong> {props.selectedOrder.buyer.firstname} {props.selectedOrder.buyer.lastname}</p>
              <p><strong>Email:</strong> {props.selectedOrder.buyer.email}</p>
            </div>
            <div className='text-right'>
              <h3 className="text-lg font-semibold mb-2">Shipping Info</h3>
              <p><strong>Address:</strong> {props.selectedOrder.address}</p>
              <p><strong>City:</strong> {props.selectedOrder.city}</p>
              <p><strong>Country:</strong> {props.selectedOrder.country}</p>
              <p><strong>Method:</strong> {props.selectedOrder.shipping}</p>
            </div>
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold mb-2">Products</h3>
              <div className="grid grid-cols-1 gap-4">
                {props.selectedOrder.items.map(({ product, quantity, unitPrice }) => (
                  <div
                    key={product.id} className="border rounded-lg divide-y cursor-pointer"
                    onClick={() => router.push('/products/' + product.id)}
                  >
                    <div className="p-2 space-x-4 flex justify-between items-center">
                      <Image
                        src='/images/product.png' alt={product.name} width={64} height={64}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className='flex-1'>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">{quantity} × ${unitPrice}</p>
                      </div>
                      <div className="font-semibold">${(quantity * unitPrice).toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Summary</h3>
              <p><strong>Shipping Cost:</strong> ${props.selectedOrder.shippingCost}</p>
              <p><strong>Total Price:</strong> ${props.selectedOrder.totalPrice}</p>
            </div>
            <div className='text-right'>
              <h3 className="text-lg font-semibold mb-2">Order Details</h3>
              <p><strong>Date:</strong> {new Date(props.selectedOrder.createdAt).toLocaleDateString()}</p>
              <p className={props.selectedOrder.status === 'Pending' ? 'text-yellow-500' : props.selectedOrder.status === 'Completed' ? 'text-green-500' : 'text-red-500'}><strong>Status:</strong> {props.selectedOrder.status}</p>
            </div>
          </div>
        )}
        <DialogFooter className='flex-row justify-between sm:justify-between'>
          {(props.selectedOrder && props.selectedOrder.status === 'Pending') ? (
            <Button
              variant="destructive" disabled={isLoading}
              onClick={() => handleOrderCancel()}
            >
              {isLoading && <Loader2 className="animate-spin" />} Cancel Order
            </Button>
          ) : <div></div>}
          <Button variant='outline' onClick={() => props.onClose()}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog >
  )
}

export default ViewOrderModal