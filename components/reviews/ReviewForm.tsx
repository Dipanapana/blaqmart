'use client';

import { useState } from 'react';
import StarRating from './StarRating';
import { Loader2, CheckCircle } from 'lucide-react';

interface ReviewFormProps {
  productId?: string;
  storeId?: string;
  driverId?: string;
  orderId: string;
  type: 'product' | 'store' | 'driver';
  onSuccess?: () => void;
}

export default function ReviewForm({
  productId,
  storeId,
  driverId,
  orderId,
  type,
  onSuccess,
}: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    setLoading(true);

    try {
      let url = '';
      if (type === 'product' && productId) {
        url = `/api/products/${productId}/reviews`;
      } else if (type === 'store' && storeId) {
        url = `/api/stores/${storeId}/reviews`;
      } else if (type === 'driver' && driverId) {
        url = `/api/drivers/${driverId}/ratings`;
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          rating,
          comment: comment.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setRating(0);
        setComment('');
        if (onSuccess) onSuccess();
      } else {
        setError(data.error || 'Failed to submit review');
      }
    } catch (err) {
      setError('Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-green-900 mb-2">
          Thank you for your review!
        </h3>
        <p className="text-green-700">
          {type === 'product' || type === 'store'
            ? 'Your review will be visible after admin approval.'
            : 'Your rating has been submitted successfully.'}
        </p>
      </div>
    );
  }

  const getTitle = () => {
    switch (type) {
      case 'product':
        return 'Rate this product';
      case 'store':
        return 'Rate this store';
      case 'driver':
        return 'Rate your delivery driver';
      default:
        return 'Leave a review';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-semibold">{getTitle()}</h3>

      {/* Rating */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Rating *
        </label>
        <StarRating
          rating={rating}
          size={32}
          interactive
          onRatingChange={setRating}
        />
      </div>

      {/* Comment */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Review (Optional)
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience..."
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          maxLength={500}
        />
        <p className="text-xs text-gray-500 mt-1">
          {comment.length}/500 characters
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || rating === 0}
        className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Submitting...
          </>
        ) : (
          'Submit Review'
        )}
      </button>
    </form>
  );
}
