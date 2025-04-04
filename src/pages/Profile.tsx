
import React, { useEffect } from 'react';
import Header from '../components/Header';
import ProfileInfo from '../components/ProfileInfo';
import { useOrders } from '../context/OrderContext';
import { Briefcase } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Profile = () => {
  const { refreshUserData, holdings } = useOrders();

  // Ensure we get the latest data when component mounts
  useEffect(() => {
    refreshUserData();
  }, [refreshUserData]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
            <p className="text-gray-600 mt-2">
              Manage your account and view your trading information
            </p>
          </div>
          
          <div className="grid md:grid-cols-[1fr_2fr] gap-8">
            <div>
              <ProfileInfo />
            </div>
            
            <div>
              <div className="glass rounded-xl p-6 h-full">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">
                  <span className="flex items-center">
                    <Briefcase className="h-5 w-5 text-primary mr-2" />
                    Stock Holdings
                  </span>
                </h2>
                
                {holdings.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Stock</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {holdings.map((holding) => (
                        <TableRow key={holding.ticker}>
                          <TableCell className="font-medium">{holding.ticker}</TableCell>
                          <TableCell className="text-right">{holding.quantity} shares</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No stock holdings yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
