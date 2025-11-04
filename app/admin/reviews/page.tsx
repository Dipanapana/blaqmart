'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import AdminNav from '@/components/admin/AdminNav';
import StarRating from '@/components/reviews/StarRating';
import { useAuth } from '@/lib/auth-context';
import { Loader2, Package, Store, CheckCircle, XCircle } from 'lucide-react';

interface ProductReview {
  id: string;
  rating: number;
  comment: string | null;
  customerName: string;
  customerPhone: string;
  productName: string;
  createdAt: string;
}

interface StoreReview {
  id: string;
  rating: number;
  comment: string | null;
  customerName: string;
  customerPhone: string;
  storeName: string;
  createdAt: string;
}

export default function AdminReviewsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [productReviews, setProductReviews] = useState<ProductReview[]>([]);
  const [storeReviews, setStoreReviews] = useState<StoreReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    // Redirect if not admin
    if (!authLoading && user?.role !== 'ADMIN') {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    async function fetchReviews() {
      try {
        const res = await fetch('/api/admin/reviews');

        if (res.ok) {
          const data = await res.json();
          setProductReviews(data.productReviews || []);
          setStoreReviews(data.storeReviews || []);
        }
      } catch (error) {
        console.error('Failed to fetch reviews:', error);
      } finally {
        setLoading(false);
      }
    }

    if (user?.role === 'ADMIN') {
      fetchReviews();
    }
  }, [user]);

  const handleAction = async (
    reviewId: string,
    type: 'product' | 'store',
    action: 'approve' | 'reject'
  ) => {
    setActionLoading(reviewId);

    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId, type, action }),
      });

      if (res.ok) {
        // Remove the review from the list
        if (type === 'product') {
          setProductReviews((prev) => prev.filter((r) => r.id !== reviewId));
        } else {
          setStoreReviews((prev) => prev.filter((r) => r.id !== reviewId));
        }
      } else {
        alert('Failed to moderate review');
      }
    } catch (error) {
      console.error('Failed to moderate review:', error);
      alert('Failed to moderate review');
    } finally {
      setActionLoading(null);
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

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <AdminNav />

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Review Moderation</h1>
          <p className="text-gray-600">Approve or reject customer reviews</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">
                  Pending Product Reviews
                </p>
                <p className="text-3xl font-bold">{productReviews.length}</p>
              </div>
              <Package className="w-12 h-12 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">
                  Pending Store Reviews
                </p>
                <p className="text-3xl font-bold">{storeReviews.length}</p>
              </div>
              <Store className="w-12 h-12 text-green-600" />
            </div>
          </div>
        </div>

        {/* Product Reviews */}
        {productReviews.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Package className="w-6 h-6 text-blue-600" />
              Product Reviews
            </h2>
            <div className="space-y-4">
              {productReviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg mb-1">{review.productName}</h3>
                      <p className="text-sm text-gray-600">
                        by {review.customerName} ({review.customerPhone})
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(review.createdAt).toLocaleDateString('en-ZA', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <StarRating rating={review.rating} size={20} />
                  </div>

                  {review.comment && (
                    <p className="text-gray-700 mb-4 bg-gray-50 p-4 rounded-lg">
                      "{review.comment}"
                    </p>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleAction(review.id, 'product', 'approve')}
                      disabled={actionLoading === review.id}
                      className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      {actionLoading === review.id ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          Approve
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleAction(review.id, 'product', 'reject')}
                      disabled={actionLoading === review.id}
                      className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      {actionLoading === review.id ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <XCircle className="w-5 h-5" />
                          Reject
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Store Reviews */}
        {storeReviews.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Store className="w-6 h-6 text-green-600" />
              Store Reviews
            </h2>
            <div className="space-y-4">
              {storeReviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg mb-1">{review.storeName}</h3>
                      <p className="text-sm text-gray-600">
                        by {review.customerName} ({review.customerPhone})
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(review.createdAt).toLocaleDateString('en-ZA', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <StarRating rating={review.rating} size={20} />
                  </div>

                  {review.comment && (
                    <p className="text-gray-700 mb-4 bg-gray-50 p-4 rounded-lg">
                      "{review.comment}"
                    </p>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleAction(review.id, 'store', 'approve')}
                      disabled={actionLoading === review.id}
                      className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      {actionLoading === review.id ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          Approve
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleAction(review.id, 'store', 'reject')}
                      disabled={actionLoading === review.id}
                      className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      {actionLoading === review.id ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <XCircle className="w-5 h-5" />
                          Reject
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {productReviews.length === 0 && storeReviews.length === 0 && !loading && (
          <div className="bg-white rounded-xl shadow-sm p-12 border border-gray-100 text-center">
            <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">All caught up!</h2>
            <p className="text-gray-600">
              There are no pending reviews to moderate at this time.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
