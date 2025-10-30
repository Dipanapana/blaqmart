'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { useAuth } from '@/lib/auth-context';
import { Truck, Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface DriverProfile {
  id: string;
  userId: string;
  name: string;
  idNumber: string;
  licenseNumber: string;
  vehicleType: string;
  vehicleReg: string;
  bankName: string;
  accountNumber: string;
  branchCode: string;
  isApproved: boolean;
  isActive: boolean;
  createdAt: string;
  user: {
    phone: string;
  };
}

export default function AdminDriversPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [drivers, setDrivers] = useState<DriverProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('pending');

  useEffect(() => {
    // Redirect if not admin
    if (!authLoading && user?.role !== 'ADMIN') {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    async function fetchDrivers() {
      try {
        const res = await fetch('/api/admin/drivers');

        if (res.ok) {
          const data = await res.json();
          setDrivers(data.drivers || []);
        }
      } catch (error) {
        console.error('Failed to fetch drivers:', error);
      } finally {
        setLoading(false);
      }
    }

    if (user?.role === 'ADMIN') {
      fetchDrivers();
    }
  }, [user]);

  const handleApproveDriver = async (driverId: string, userId: string) => {
    try {
      const res = await fetch('/api/admin/approve-driver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driverId, userId }),
      });

      if (res.ok) {
        // Refresh drivers list
        const driversRes = await fetch('/api/admin/drivers');
        if (driversRes.ok) {
          const data = await driversRes.json();
          setDrivers(data.drivers || []);
        }
        alert('Driver approved successfully');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to approve driver');
      }
    } catch (error) {
      console.error('Failed to approve driver:', error);
      alert('Failed to approve driver');
    }
  };

  const handleRejectDriver = async (driverId: string) => {
    if (!confirm('Are you sure you want to reject this driver application?')) {
      return;
    }

    try {
      const res = await fetch('/api/admin/reject-driver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driverId }),
      });

      if (res.ok) {
        // Refresh drivers list
        const driversRes = await fetch('/api/admin/drivers');
        if (driversRes.ok) {
          const data = await driversRes.json();
          setDrivers(data.drivers || []);
        }
        alert('Driver application rejected');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to reject driver');
      }
    } catch (error) {
      console.error('Failed to reject driver:', error);
      alert('Failed to reject driver');
    }
  };

  const handleToggleActive = async (driverId: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/admin/toggle-driver-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driverId, isActive: !currentStatus }),
      });

      if (res.ok) {
        // Refresh drivers list
        const driversRes = await fetch('/api/admin/drivers');
        if (driversRes.ok) {
          const data = await driversRes.json();
          setDrivers(data.drivers || []);
        }
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update driver status');
      }
    } catch (error) {
      console.error('Failed to update driver status:', error);
      alert('Failed to update driver status');
    }
  };

  if (authLoading || (user?.role === 'ADMIN' && loading)) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
          </div>
        </div>
      </main>
    );
  }

  if (user?.role !== 'ADMIN') {
    return null;
  }

  const filteredDrivers = drivers.filter((driver) => {
    if (filter === 'pending') return !driver.isApproved;
    if (filter === 'approved') return driver.isApproved;
    return true;
  });

  const pendingCount = drivers.filter((d) => !d.isApproved).length;

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Driver Management</h1>
            <p className="text-gray-600">Approve and manage delivery drivers</p>
          </div>

          {pendingCount > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <p className="text-orange-800 font-medium flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                {pendingCount} pending application{pendingCount !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === 'pending'
                ? 'bg-orange-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === 'approved'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Approved ({drivers.filter((d) => d.isApproved).length})
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            All ({drivers.length})
          </button>
        </div>

        {/* Drivers List */}
        {filteredDrivers.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
            <Truck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">No Drivers</h2>
            <p className="text-gray-600">
              {filter === 'pending'
                ? 'No pending driver applications'
                : filter === 'approved'
                ? 'No approved drivers'
                : 'No driver registrations yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDrivers.map((driver) => (
              <div
                key={driver.id}
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg mb-1">{driver.name}</h3>
                    <p className="text-sm text-gray-600">{driver.user.phone}</p>
                  </div>
                  <div className="flex gap-2">
                    {driver.isApproved ? (
                      <>
                        <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-700">
                          Approved
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            driver.isActive
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {driver.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-sm font-semibold bg-orange-100 text-orange-700">
                        Pending
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">ID Number</p>
                    <p className="font-medium">{driver.idNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">License Number</p>
                    <p className="font-medium">{driver.licenseNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Vehicle</p>
                    <p className="font-medium">
                      {driver.vehicleType} - {driver.vehicleReg}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Bank</p>
                    <p className="font-medium">
                      {driver.bankName} - {driver.accountNumber}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  {!driver.isApproved ? (
                    <>
                      <button
                        onClick={() => handleApproveDriver(driver.id, driver.userId)}
                        className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-5 h-5" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejectDriver(driver.id)}
                        className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-5 h-5" />
                        Reject
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleToggleActive(driver.id, driver.isActive)}
                      className={`flex-1 py-2 rounded-lg font-semibold ${
                        driver.isActive
                          ? 'bg-gray-600 text-white hover:bg-gray-700'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      {driver.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
