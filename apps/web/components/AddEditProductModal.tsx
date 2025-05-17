import { useEffect, useState } from 'react';
import ReactDragListView from 'react-drag-listview';
import { IProduct } from '@/Helpers/Interfaces';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { GripVertical, Loader2, Plus, Trash } from 'lucide-react';
import { Input } from './ui/input';
import Image from 'next/image';
import { Card, CardContent } from './ui/card';
import { Label } from './ui/label';
import { toast } from 'sonner';

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
  const [images, setImages] = useState<string[]>([]);

  // TODO: Add support for adding images from multiple domains or else use standard image tag

  useEffect(() => {
    if (props.selectedProduct) {
      const { code, name, description, price, stock, images } = props.selectedProduct;
      setFormData({ code, name, description, price, stock });
      setImages(images);
    } else {
      clearFields();
    }
  }, [props.selectedProduct]);

  function closeModal() {
    clearFields();
    props.onClose();
  }

  function clearFields() {
    setFormData({
      code: "",
      name: "",
      description: "",
      price: 0,
      stock: 0
    });
    setImages([]);
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleImageAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const imageUrl = (e.target as HTMLFormElement).image_url.value;
    if (imageUrl) {
      setImages((prev) => [...prev, imageUrl]);
      (e.target as HTMLFormElement).reset();
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();

    if (images.length === 0) {
      toast.error('No images added', { description: 'Please add at least one image' });
      return;
    }

    try {
      setIsLoading(true);
      if (props.selectedProduct) {
        handleUpdateProduct()
      } else {
        handleAddProduct()
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

  const handleAddProduct = async () => {
    // TODO: save product to database
  }

  const handleUpdateProduct = async () => {
    // TODO: update product in database
  }

  const handleDeleteProduct = async () => {
    try {
      setIsDeleteLoading(true);
      if (props.selectedProduct && props.selectedProduct.orderCount > 0) {
        await handleDeleteUpdate();
      } else {
        await handleDelete();
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

  const handleDelete = async () => {
    // TODO: delete product from database
  }

  const handleDeleteUpdate = async () => {
    // TODO: update product in database as deleted
  }

  const onDragEnd = (fromIndex: number, toIndex: number) => {
    const updatedImages = [...images];
    const item = updatedImages.splice(fromIndex, 1)[0] as string;
    updatedImages.splice(toIndex, 0, item);
    setImages(updatedImages);
  }

  return (
    <Dialog open={props.open} onOpenChange={() => closeModal()}>
      <DialogContent className='sm:max-w-4xl'>
        <DialogHeader>
          <DialogTitle>{props.selectedProduct ? 'Update Product' : 'Add Product'}</DialogTitle>
        </DialogHeader>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          <div>
            {images.length > 0 && (
              <ReactDragListView onDragEnd={onDragEnd} nodeSelector='.image-item' handleSelector='.image-dragger'>
                {images.map((image, index) => (
                  <Card key={index} className='image-item border rounded-md my-4'>
                    <CardContent className='flex justify-between items-center gap-2'>
                      <h4 className='text-xl'>{index + 1}</h4>
                      <div className='grow-1'>
                        <Image key={index} src={image} alt='product' width='50' height='50' style={{ objectFit: 'contain' }} />
                      </div>
                      {index === 0 && <p className='text-cyan-500 grow-1'>Main Image</p>}
                      <div className='flex items-center gap-2'>
                        {images.length > 1 && (
                          <Button variant="ghost" size="icon" onClick={() => setImages(images.filter((_, i) => i !== index))}>
                            <Trash />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className='image-dragger'><GripVertical /></Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </ReactDragListView>
            )}
            {images.length < 4 && (
              <form onSubmit={handleImageAdd} className="w-full flex items-end space-x-2 rounded-md border p-4">
                <div className='w-full'>
                  <Label className="text-sm font-medium">Product Image</Label>
                  <Input id="image_url" name="image_url" type="text" placeholder="Image URL" required />
                </div>
                <Button size="icon" type="submit"><Plus /></Button>
              </form>
            )}
          </div>
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
        </div>
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