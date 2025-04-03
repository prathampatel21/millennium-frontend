import React, { useState, useEffect, useRef } from 'react';
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "@/components/ui/carousel";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useOrders } from '../context/OrderContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from 'embla-carousel-autoplay';

type StockData = {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  chartData: Array<{ day: string; value: number }>;
};

const generateChartData = (basePrice: number, volatility: number, trend: number) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map((day, index) => {
    const noise = (Math.random() - 0.5) * volatility;
    const trendEffect = trend * index / 10;
    const value = basePrice * (1 + noise + trendEffect);
    return { day, value: parseFloat(value.toFixed(2)) };
  });
};

const popularStocks: StockData[] = [
  { 
    ticker: 'AAPL', 
    name: 'Apple Inc.', 
    price: 174.79, 
    change: 2.35, 
    changePercent: 1.36,
    chartData: generateChartData(174.79, 0.03, 0.01)
  },
  { 
    ticker: 'MSFT', 
    name: 'Microsoft Corp.', 
    price: 416.38, 
    change: 5.21, 
    changePercent: 1.27,
    chartData: generateChartData(416.38, 0.02, 0.015)
  },
  { 
    ticker: 'NVDA', 
    name: 'NVIDIA Corp.', 
    price: 950.02, 
    change: -3.65, 
    changePercent: -0.38,
    chartData: generateChartData(950.02, 0.04, -0.005)
  },
  { 
    ticker: 'AMZN', 
    name: 'Amazon.com Inc.', 
    price: 178.25, 
    change: 1.43, 
    changePercent: 0.81,
    chartData: generateChartData(178.25, 0.025, 0.01)
  },
  { 
    ticker: 'TSLA', 
    name: 'Tesla Inc.', 
    price: 177.56, 
    change: -1.98, 
    changePercent: -1.1,
    chartData: generateChartData(177.56, 0.05, -0.015)
  },
  { 
    ticker: 'GOOG', 
    name: 'Alphabet Inc.', 
    price: 170.63, 
    change: 0.87, 
    changePercent: 0.51,
    chartData: generateChartData(170.63, 0.02, 0.008)
  },
  { 
    ticker: 'META', 
    name: 'Meta Platforms Inc.', 
    price: 480.28, 
    change: 7.42, 
    changePercent: 1.57,
    chartData: generateChartData(480.28, 0.03, 0.02)
  },
  { 
    ticker: 'AMD', 
    name: 'Advanced Micro Devices', 
    price: 147.41, 
    change: 2.89, 
    changePercent: 2.0,
    chartData: generateChartData(147.41, 0.04, 0.025)
  },
];

interface StockCardProps {
  stock: StockData; 
  isActive: boolean; 
  onSelect: () => void;
  isHovered: boolean;
}

const StockCard: React.FC<StockCardProps> = ({ 
  stock, 
  isActive,
  onSelect,
  isHovered
}) => {
  const isPositive = stock.change >= 0;
  
  return (
    <Card 
      className={`w-full transition-all duration-300 cursor-pointer hover:shadow-lg ${
        isActive ? 'scale-105 border-primary shadow-md' : ''
      } ${isHovered ? 'scale-[1.03]' : ''}`}
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
      <CardContent className="pb-2 h-[100px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={stock.chartData}>
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={isPositive ? "#10B981" : "#EF4444"} 
              strokeWidth={2} 
              dot={false} 
              activeDot={{ r: 4 }}
            />
            <XAxis dataKey="day" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis hide domain={['auto', 'auto']} />
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white p-2 rounded-md border shadow-sm text-xs">
                      <p className="font-medium">${payload[0].value}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
          </LineChart>
        </ResponsiveContainer>
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
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const navigate = useNavigate();
  const { setFormData } = useOrders();
  const isMobile = useIsMobile();
  
  const autoplay = useRef(
    Autoplay({ 
      delay: 3000, 
      stopOnInteraction: true,
      rootNode: (emblaRoot) => emblaRoot.parentElement
    })
  );

  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true,
    align: "start",
    skipSnaps: false,
  }, [autoplay.current]);

  const handleSelectStock = (stock: StockData, index: number) => {
    setActiveIndex(index);
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

  const slidesPerView = isMobile ? 1.2 : 4;

  return (
    <div className="w-full py-4 sm:py-6">
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Popular Stocks</h2>
        <p className="text-sm text-gray-500">Click on a stock to use it in your order</p>
      </div>
      
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {popularStocks.map((stock, index) => (
            <div key={stock.ticker} className="min-w-0 flex-[0_0_80%] sm:flex-[0_0_45%] md:flex-[0_0_30%] lg:flex-[0_0_25%] pl-4">
              <div 
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <StockCard 
                  stock={stock} 
                  isActive={activeIndex === index}
                  isHovered={hoveredIndex === index}
                  onSelect={() => handleSelectStock(stock, index)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-end gap-2 mt-4">
        <Carousel>
          <CarouselPrevious 
            onClick={() => emblaApi?.scrollPrev()} 
            className="relative static left-0 translate-y-0" 
          />
          <CarouselNext 
            onClick={() => emblaApi?.scrollNext()} 
            className="relative static right-0 translate-y-0" 
          />
        </Carousel>
      </div>
    </div>
  );
};

export default StockCarousel;
