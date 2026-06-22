import React, { useEffect } from 'react';
import { BiPlus, BiTrash, BiPlay, BiTime, BiCheckCircle, BiLoaderAlt, BiRecycle } from 'react-icons/bi';
import { useOrderStore } from '@/stores/useOrderStore';
import { shoppingService } from '@/services/shoppingService';
import OrderHistorySkeleton from '@/components/UI/skeleton/OrderHistorySkeleton';

export default function OrderHistoryStep() {
  const store = useOrderStore();
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      setLoading(true);
      const data = await shoppingService.getHistory();
      store.setHistory(data);
      setLoading(false);
    };
    loadHistory();
  }, []);

  const handleContinue = (order: any) => {
    store.loadOrderToStore(order); 
    store.setStep('cart'); 
  };

  const handleDelete = async (id:string) => {
    if (confirm('Delete this order record?')) {
      await shoppingService.deleteOrder(id);
      store.fetchHistory(); 
    }
  };


  if (loading) return <OrderHistorySkeleton/>

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-black">Order History</h2>
        <button 
          onClick={() => store.setStep('cart')} 
          className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2"
        >
          <BiPlus /> New Order
        </button>
      </div>

      <div className="space-y-3">
        {store.history.orders && store.history.orders.map((order) => (
          <div key={order.id} className="p-4 bg-surface border border-outline-variant rounded-2xl flex justify-between items-center">
            <div>
              <h4 className="font-bold">{order.title || 'Untitled Order'}</h4>
              <p className="text-xs text-on-surface-variant flex items-center gap-1">
                <BiTime /> {new Date(order.created_at).toLocaleDateString()} • {order.status}
              </p>
            </div>
            
            <div className="flex gap-2 items-center">
              {order.status === 'draft' ? (
                <button onClick={() => handleContinue(order)} className="p-2 text-primary hover:bg-primary/10 rounded-xl">
                  <BiPlay className="text-xl" />
                </button>
              ) : (
                <button onClick={() => handleContinue(order)} className="text-emerald-600"><BiRecycle   className="text-xl" /></button>
              )}
              
              <button onClick={() => handleDelete(order.id)} className="p-2 text-error hover:bg-error/10 rounded-xl">
                <BiTrash className="text-xl" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}