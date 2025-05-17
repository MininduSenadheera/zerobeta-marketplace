"use client"
import { Button } from '@/components/ui/button';
import { IProduct } from '@/Helpers/Interfaces';
import { AgGridReact } from 'ag-grid-react'
import { AllCommunityModule, ColDef, ModuleRegistry } from 'ag-grid-community';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react'
import AddEditProductModal from '@/components/AddEditProductModal';
ModuleRegistry.registerModules([AllCommunityModule]);

function Inventory() {
  const [products, setProducts] = useState<IProduct[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [showAddEditProductModal, setShowAddEditProductModal] = useState<boolean>(false)
  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setIsLoading(true)
      // TODO: Fetch products from server
      setProducts([])
    } catch (error) {
      console.log(error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="animate-spin" />
      </div>
    )
  }

  const columnDefs: ColDef[] = [
    { headerName: 'Product Code', field: 'code'},
    { headerName: 'Name', field: 'name'},
    { headerName: 'Description', field: 'description', sortable: false, autoHeight: true},
    {
      headerName: 'Price', field: 'price', type: 'numericColumn',
      valueGetter: params => `$${params.data.price.toFixed(2)}`
    },
    { headerName: 'Orders', field: 'orderCount'},
    {
      headerName: 'Stock', field: 'stock',
      cellRenderer: (props: { value: number }) => {
        return (
          <p color={props.value > 10 ? 'success' : 'error'}>
            {props.value}
          </p >
        )
      }
    },
  ]

  return (
    <div className='container my-5 mx-auto px-4 sm:px-0'>
      <div className='flex justify-between items-center mb-4'>
        <h4 className='text-3xl'>Inventory</h4>
        <Button onClick={() => { setShowAddEditProductModal(true); setSelectedProduct(null) }}>
          Add Product
        </Button>
      </div>
      <AgGridReact
        columnDefs={columnDefs}
        defaultColDef={{ sortable: true, filter: true, resizable: true }}
        rowData={products}
        autoSizeStrategy={{ type: 'fitGridWidth' }}
        domLayout='autoHeight'
        onRowClicked={(props) => { setShowAddEditProductModal(true); setSelectedProduct(props.data as IProduct) }}
        paginationAutoPageSize={true}
        pagination={true}
      />
      <AddEditProductModal
        open={showAddEditProductModal} selectedProduct={selectedProduct}
        onClose={() => { setShowAddEditProductModal(false); setSelectedProduct(null) }}
        reloadProducts={() => fetchProducts()}
      />
    </div>
  )
}

export default Inventory