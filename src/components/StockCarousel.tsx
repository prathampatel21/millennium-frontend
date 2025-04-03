import React, { useState } from 'react';
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "@/components/ui/carousel";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from "@/components/ui/scroll-area";
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useOrders } from '../context/OrderContext';
import { OrderFormData } from '../types/order';

type StockData = {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
};

const popularStocks: StockData[] = [
  { ticker: 'AAPL', name: 'Apple Inc.', price: 174.79, change: 2.35, changePercent: 1.36 },
  { ticker: 'MSFT', name: 'Microsoft Corp.', price: 416.38, change: 5.21, changePercent: 1.27 },
  { ticker: 'NVDA', name: 'NVIDIA Corp.', price: 950.02, change: -3.65, changePercent: -0.38 },
  { ticker: 'AMZN', name: 'Amazon.com Inc.', price: 178.25, change: 1.43, changePercent: 0.81 },
  { ticker: 'TSLA', name: 'Tesla Inc.', price: 177.56, change: -1.98, changePercent: -1.1 },
  { ticker: 'GOOG', name: 'Alphabet Inc.', price: 170.63, change: 0.87, changePercent: 0.51 },
  { ticker: 'META', name: 'Meta Platforms Inc.', price: 480.28, change: 7.42, changePercent: 1.57 },
  { ticker: 'AMD', name: 'Advanced Micro Devices', price: 147.41, change: 2.89, changePercent: 2.0 },
];

const StockCard: React.FC<{ stock: StockData; isActive: boolean; onSelect: () => void }> = ({ 
  stock, 
  isActive,
  onSelect
}) => {
  const isPositive = stock.change >= 0;
  
  return (
    <Card 
      className={`w-full transition-all duration-200 cursor-pointer hover:shadow-lg ${
        isActive ? 'scale-105 border-primary shadow-md' : ''
      }`}
      onClick={onSelect}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{stock.ticker}</CardTitle>
            <CardDescription className="text-xs line-clamp-1">{stock.name}</CardDescription>
          </div>
          <div className={`flex items-center text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? (
              <TrendingUp className="h-4 w-4 mr-1" />
            ) : (
              <TrendingDown className="h-4 w-4 mr-1" />
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex flex-col space-y-1">
          <div className="w-full h-12 bg-gray-100 rounded-md relative overflow-hidden">
            {[...Array(20)].map((_, i) => {
              const height = 20 + Math.sin(i * 0.5) * 15 + Math.random() * 10;
              return (
                <div 
                  key={i} 
                  className={`flex-1 ${isPositive ? 'bg-green-400' : 'bg-red-400'}`}
                  style={{ 
                    height: `${height}%`,
                    opacity: 0.7 + (i / 20) * 0.3
                  }}
                />
              );
            })}
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <div className="flex justify-between items-center w-full">
          <span className="font-bold">${stock.price.toFixed(2)}</span>
          <span className={`text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? '+' : ''}{stock.change.toFixed(2)} ({isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%)
          </span>
        </div>
      </CardFooter>
    </Card>
  );
};

const StockCarousel: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();
  const { setFormData } = useOrders();

  const handleSelectStock = (stock: StockData) => {
    if (setFormData) {
      setFormData({
        ticker: stock.ticker,
        type: 'Buy',
        executionType: 'Market',
        price: '',
        size: '1'
      });
    }
  };

  return (
    <div className="w-full py-4 sm:py-6">
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Popular Stocks</h2>
        <p className="text-sm text-gray-500">Click on a stock to use it in your order</p>
      </div>
      
      <Carousel className="w-full">
        <CarouselContent className="-ml-2 md:-ml-4">
          {popularStocks.map((stock, index) => (
            <CarouselItem key={stock.ticker} className="pl-2 md:pl-4 sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
              <StockCard 
                stock={stock} 
                isActive={activeIndex === index}
                onSelect={() => {
                  setActiveIndex(index);
                  handleSelectStock(stock);
                }}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="flex justify-end gap-2 mt-4">
          <CarouselPrevious className="relative static left-0 translate-y-0" />
          <CarouselNext className="relative static right-0 translate-y-0" />
        </div>
      </Carousel>
    </div>
  );
};

export default StockCarousel;
