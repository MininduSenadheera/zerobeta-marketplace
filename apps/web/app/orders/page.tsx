"use client"
import { IOrder } from '@/Helpers/Interfaces';
import { AgGridReact } from 'ag-grid-react'
import { AllCommunityModule, ColDef, ModuleRegistry } from 'ag-grid-community';
import { Loader2 } from 'lucide-react';
import { useContext, useEffect, useState } from 'react'
import { ProtectedRoute } from '@/Helpers/ProtectedRoute';
import ViewOrderModal from '@/components/ViewOrderModal';
import config from '@/Helpers/config';
import { AuthContext } from '@/context/AuthContext';
import apiClient from '@/lib/apiClient';
ModuleRegistry.registerModules([AllCommunityModule]);

function Inventory() {
  const { user } = useContext(AuthContext)
  const [orders, setOrders] = useState<IOrder[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null)
  const [showViewOrderModal, setShowViewOrderModal] = useState<boolean>(false)

  useEffect(() => {
    fetchOrders()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const fetchOrders = async (page = 1, pageSize = 10) => {
    try {
      setIsLoading(true)
      if (!user) return
      const response = await apiClient.get(config.apiUrl + 'orders/' + user.userRole.toLowerCase() + `?page=${page}&limit=${pageSize}`)
      setOrders(response.data.data)
    } catch (error) {
      console.log(error)
    } finally {
      setIsLoading(false)
    }
  }

  const getTotalPrice = (order: IOrder) => {
    const itemsTotal = order.items.reduce((acc, item) => {
      return acc + (parseFloat(item.unitPrice) * item.quantity)
    }, 0)
    return itemsTotal + parseFloat(order.shippingCost || '0')
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="animate-spin" />
      </div>
    )
  }

  const columnDefs: ColDef[] = [
    { headerName: 'Reference No', field: 'referenceNo' },
    {
      headerName: 'Products', sortable: true, filter: true, autoHeight: true,
      cellRenderer: (params: { data: IOrder }) => {
        return (
          <div>
            {params.data.items.map((product, index) => (
              <div className='text-start' key={index}>{product.product.name}</div>
            ))}
          </div>
        )
      }
    },
    {
      headerName: 'Unit Prices', sortable: true, filter: true, type: 'numericColumn',
      cellRenderer: (params: { data: IOrder }) => {
        return (
          <div>
            {params.data.items.map((product, index) => (
              <div key={index}>${product.unitPrice}</div>
            ))}
          </div>
        )
      }
    },
    {
      headerName: 'Quantity', sortable: true, filter: true,
      cellRenderer: (params: { data: IOrder }) => {
        return (
          <div>
            {params.data.items.map((product, index) => (
              <div key={index}>{product.quantity}</div>
            ))}
          </div>
        )
      }
    },
    {
      headerName: 'Total', field: 'totalPrice', sortable: true, filter: true, type: 'numericColumn',
      cellRenderer: (params: { data: IOrder }) => {
        return (
          <div>
            <div>${getTotalPrice(params.data).toFixed(2)}</div>
            {params.data.shipping === 'Deliver' && <small>shipping included</small>}
          </div>
        )
      }
    },
    { headerName: 'Shipping', field: 'shipping', sortable: true, filter: true },
    {
      headerName: 'Status', field: 'status', sortable: true, filter: true,
      cellRenderer: (params: { data: IOrder }) => {
        return (
          <div className={params.data.status === 'Pending' ? 'text-yellow-500' : params.data.status === 'Completed' ? 'text-green-500' : 'text-red-500'}>
            {params.data.status}
          </div>
        )
      }
    },
    {
      headerName: 'Created At', field: 'createdAt', sortable: true, filter: true,
      valueFormatter: (params) => {
        return new Date(params.value).toLocaleDateString()
      }
    }
  ]

  return (
    <ProtectedRoute>
      <div className='container my-5 mx-auto px-4 sm:px-0'>
        <h4 className='text-3xl mb-5'>Orders</h4>
        <AgGridReact
          columnDefs={columnDefs}
          defaultColDef={{ sortable: true, filter: true, resizable: true }}
          rowData={orders}
          autoSizeStrategy={{ type: 'fitGridWidth' }}
          domLayout='autoHeight'
          onRowClicked={(props) => { setShowViewOrderModal(true); setSelectedOrder(props.data as IOrder) }}
          paginationPageSize={10}
          paginationPageSizeSelector={[10]}
          onPaginationChanged={(params) => {
            if (!params.api || params.api.paginationGetCurrentPage() === 0) return;
            fetchOrders(params.api.paginationGetCurrentPage() + 1)
          }}
          pagination={true}
        />
        <ViewOrderModal
          open={showViewOrderModal} selectedOrder={selectedOrder}
          onClose={() => { setShowViewOrderModal(false); setSelectedOrder(null) }}
          reloadOrders={() => fetchOrders()}
        />
      </div>
    </ProtectedRoute>
  )
}

export default Inventory