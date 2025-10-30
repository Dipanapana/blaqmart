'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { useAuth } from '@/lib/auth-context';
import { Truck, Upload, Loader2, ArrowLeft } from 'lucide-react';

export default function DriverRegisterPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const [formData, setFormData] = useState({
    name: '',
    idNumber: '',
    licenseNumber: '',
    vehicleType: 'MOTORCYCLE',
    vehicleReg: '',
    bankName: '',
    accountNumber: '',
    branchCode: '',
  });

  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }

    if (!formData.idNumber.trim()) {
      newErrors.idNumber = 'ID number is required';
    } else if (!/^\d{13}$/.test(formData.idNumber)) {
      newErrors.idNumber = 'ID number must be 13 digits';
    }

    if (!formData.licenseNumber.trim()) {
      newErrors.licenseNumber = 'License number is required';
    }

    if (!formData.vehicleReg.trim()) {
      newErrors.vehicleReg = 'Vehicle registration is required';
    }

    if (!formData.bankName.trim()) {
      newErrors.bankName = 'Bank name is required';
    }

    if (!formData.accountNumber.trim()) {
      newErrors.accountNumber = 'Account number is required';
    }

    if (!formData.branchCode.trim()) {
      newErrors.branchCode = 'Branch code is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!user) {
      alert('Please sign in to continue');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/driver/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to register');
      }

      alert('Driver registration submitted! You will be notified once approved.');
      router.push('/');
    } catch (error: any) {
      alert(error.message || 'Failed to register as driver');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to home
        </Link>

        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Truck className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Become a Driver</h1>
              <p className="text-gray-600">Join BLAQMART and start earning</p>
            </div>
          </div>

          {!user ? (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
              <p className="text-orange-800">
                Please sign in to register as a driver
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div>
                <h2 className="text-lg font-semibold mb-4">Personal Information</h2>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-2">
                      Full Name *
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value });
                        setErrors({ ...errors, name: undefined });
                      }}
                      placeholder="John Doe"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-600 mt-1">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="idNumber" className="block text-sm font-medium mb-2">
                      ID Number *
                    </label>
                    <input
                      id="idNumber"
                      type="text"
                      value={formData.idNumber}
                      onChange={(e) => {
                        setFormData({ ...formData, idNumber: e.target.value });
                        setErrors({ ...errors, idNumber: undefined });
                      }}
                      placeholder="13-digit ID number"
                      maxLength={13}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        errors.idNumber ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.idNumber && (
                      <p className="text-sm text-red-600 mt-1">{errors.idNumber}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* License & Vehicle */}
              <div>
                <h2 className="text-lg font-semibold mb-4">License & Vehicle</h2>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="licenseNumber" className="block text-sm font-medium mb-2">
                      Driver's License Number *
                    </label>
                    <input
                      id="licenseNumber"
                      type="text"
                      value={formData.licenseNumber}
                      onChange={(e) => {
                        setFormData({ ...formData, licenseNumber: e.target.value });
                        setErrors({ ...errors, licenseNumber: undefined });
                      }}
                      placeholder="License number"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        errors.licenseNumber ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.licenseNumber && (
                      <p className="text-sm text-red-600 mt-1">{errors.licenseNumber}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="vehicleType" className="block text-sm font-medium mb-2">
                      Vehicle Type *
                    </label>
                    <select
                      id="vehicleType"
                      value={formData.vehicleType}
                      onChange={(e) =>
                        setFormData({ ...formData, vehicleType: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="MOTORCYCLE">Motorcycle</option>
                      <option value="CAR">Car</option>
                      <option value="BAKKIE">Bakkie</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="vehicleReg" className="block text-sm font-medium mb-2">
                      Vehicle Registration *
                    </label>
                    <input
                      id="vehicleReg"
                      type="text"
                      value={formData.vehicleReg}
                      onChange={(e) => {
                        setFormData({ ...formData, vehicleReg: e.target.value });
                        setErrors({ ...errors, vehicleReg: undefined });
                      }}
                      placeholder="ABC 123 GP"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        errors.vehicleReg ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.vehicleReg && (
                      <p className="text-sm text-red-600 mt-1">{errors.vehicleReg}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Banking Details */}
              <div>
                <h2 className="text-lg font-semibold mb-4">Banking Details</h2>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="bankName" className="block text-sm font-medium mb-2">
                      Bank Name *
                    </label>
                    <input
                      id="bankName"
                      type="text"
                      value={formData.bankName}
                      onChange={(e) => {
                        setFormData({ ...formData, bankName: e.target.value });
                        setErrors({ ...errors, bankName: undefined });
                      }}
                      placeholder="e.g., FNB, Standard Bank"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        errors.bankName ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.bankName && (
                      <p className="text-sm text-red-600 mt-1">{errors.bankName}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="accountNumber" className="block text-sm font-medium mb-2">
                      Account Number *
                    </label>
                    <input
                      id="accountNumber"
                      type="text"
                      value={formData.accountNumber}
                      onChange={(e) => {
                        setFormData({ ...formData, accountNumber: e.target.value });
                        setErrors({ ...errors, accountNumber: undefined });
                      }}
                      placeholder="Account number"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        errors.accountNumber ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.accountNumber && (
                      <p className="text-sm text-red-600 mt-1">{errors.accountNumber}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="branchCode" className="block text-sm font-medium mb-2">
                      Branch Code *
                    </label>
                    <input
                      id="branchCode"
                      type="text"
                      value={formData.branchCode}
                      onChange={(e) => {
                        setFormData({ ...formData, branchCode: e.target.value });
                        setErrors({ ...errors, branchCode: undefined });
                      }}
                      placeholder="Branch code"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        errors.branchCode ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.branchCode && (
                      <p className="text-sm text-red-600 mt-1">{errors.branchCode}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Your application will be reviewed by our team.
                  You'll receive a notification once approved. All information is kept
                  confidential.
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    Submit Application
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
