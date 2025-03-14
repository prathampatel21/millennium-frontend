
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Order, OrderStatus } from '../context/OrderContext';
import { SlidersHorizontal, Search } from 'lucide-react';

interface OrderTableProps {
  orders: Order[];
  title?: string;
  showFilters?: boolean;
}

const OrderTable: React.FC<OrderTableProps> = ({ 
  orders, 
  title = 'Orders', 
  showFilters = true 
}) => {
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'All'>('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
    const matchesSearch = order.ticker.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusClass = (status: OrderStatus) => {
    switch (status) {
      case 'Processing':
        return 'status-processing';
      case 'In-Progress':
        return 'status-progress';
      case 'Completed':
        return 'status-completed';
      default:
        return '';
    }
  };

  return (
    <div className="w-full animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
        
        {showFilters && (
          <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3 mt-4 md:mt-0">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search ticker..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 py-2 pr-4 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            
            <div className="relative inline-block">
              <div className="flex items-center">
                <SlidersHorizontal className="h-4 w-4 text-gray-500 mr-2" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'All')}
                  className="py-2 px-4 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none"
                >
                  <option value="All">All Statuses</option>
                  <option value="Processing">Processing</option>
                  <option value="In-Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {filteredOrders.length > 0 ? (
        <div className="table-wrapper">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="table-header">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ticker
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="table-row">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order.ticker}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    <span 
                      className={`inline-flex items-center ${
                        order.type === 'Buy' ? 'text-trade-green' : 'text-trade-red'
                      }`}
                    >
                      {order.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    ${order.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {order.size}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getStatusClass(order.status)}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {format(order.timestamp, 'MMM d, yyyy h:mm a')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-10 glass rounded-lg">
          <p className="text-gray-500">No orders match the current filters</p>
        </div>
      )}
    </div>
  );
};

export default OrderTable;
