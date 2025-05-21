import { useCallback, useEffect, useState } from 'react';
import { IProduct } from '@/Helpers/Interfaces';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Loader2 } from 'lucide-react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';
import config from '@/Helpers/config';
import apiClient from '@/lib/apiClient';

interface AddEditProductModalProps {
  open: boolean;
  onClose: CallableFunction;
  selectedProduct: IProduct | null;
  reloadProducts: CallableFunction;
}

function AddEditProductModal(props: AddEditProductModalProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    price: 0,
    stock: 0
  })

  useEffect(() => {
    if (props.open) {
      if (props.selectedProduct) {
        const { code, name, description, price, stock } = props.selectedProduct;
        setFormData({ code, name, description, price, stock });
      } else {
        clearFields();
      }
    }
  }, [props.open, props.selectedProduct]);

  const closeModal = useCallback(() => {
    clearFields();
    props.onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.onClose]);

  function clearFields() {
    setFormData({
      code: "",
      name: "",
      description: "",
      price: 0,
      stock: 0
    });
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      if (props.selectedProduct) {
        await apiClient.patch(config.apiUrl + 'product/update/' + props.selectedProduct?.id, { ...formData })
      } else {
        await apiClient.post(config.apiUrl + 'products/create', { ...formData })
      }

      toast.success(props.selectedProduct ? 'Product updated successfully' : 'Product added successfully', { description: new Date().toLocaleString() });
      props.reloadProducts();
      closeModal();
    } catch (error) {
      toast.error(props.selectedProduct ? 'Failed to update product' : 'Failed to add product', { description: 'An unknown error has occurred' });
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleDeleteProduct = async () => {
    try {
      setIsDeleteLoading(true);
      if (props.selectedProduct && props.selectedProduct.orderCount > 0) {
        await apiClient.patch(config.apiUrl + 'product/hide/' + props.selectedProduct?.id)
      } else {
        await apiClient.delete(config.apiUrl + 'product/delete/' + props.selectedProduct?.id)
      }
      toast.success('Product deleted successfully', { description: new Date().toLocaleString() });
      props.reloadProducts();
      closeModal();
    } catch (error) {
      toast.error('Failed to delete product', { description: 'An unknown error has occurred' });
      console.log(error);
    } finally {
      setIsDeleteLoading(false);
    }
  }

  return (
    <Dialog open={props.open} onOpenChange={() => closeModal()}>
      <DialogContent className='sm:max-w-4xl'>
        <DialogHeader>
          <DialogTitle>{props.selectedProduct ? 'Update Product' : 'Add Product'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} id='product_form' className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Product Code</Label>
            <Input
              id="code" name="code" type="text" placeholder="Product Code"
              value={formData.code} onChange={handleChange} required readOnly={!!props.selectedProduct}
            />
          </div>
          <div>
            <Label className="text-sm font-medium">Product Name</Label>
            <Input
              id="name" name="name" type="text" placeholder="Product Name"
              value={formData.name} onChange={handleChange} required
            />
          </div>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
            <div>
              <Label className="text-sm font-medium">Stock</Label>
              <Input
                id="stock" name="stock" type="number" placeholder="Stock" required
                value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: parseFloat(e.target.value) })}
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Price</Label>
              <Input
                id="price" name="price" type="number" placeholder="Price" required
                value={formData.price} onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
              />
            </div>
          </div>
          <div>
            <Label className="text-sm font-medium">Description</Label>
            <Input
              id="description" name="description" type="text" placeholder="Description"
              value={formData.description} onChange={handleChange} required maxLength={100}
            />
          </div>
        </form>
        <DialogFooter className='flex-row justify-between sm:justify-between'>
          {props.selectedProduct ? (
            <Button variant="destructive" onClick={() => handleDeleteProduct()} disabled={isDeleteLoading}>
              {isDeleteLoading && <Loader2 className="animate-spin" />} Delete
            </Button>
          ) : <div></div>}
          <div className='flex gap-2'>
            <Button variant='outline' onClick={() => closeModal()}>Cancel</Button>
            <Button form='product_form' type='submit' disabled={isLoading}>
              {isLoading && <Loader2 className="animate-spin" />} {props.selectedProduct ? 'Update' : 'Add'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog >
  )
}

export default AddEditProductModal