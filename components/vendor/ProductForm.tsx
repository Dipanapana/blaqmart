'use client';

import { useState } from 'react';
import { Upload, Loader2, X, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface ProductFormProps {
  storeId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ProductForm({ storeId, onSuccess, onCancel }: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    imageUrl: '',
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setFormData(prev => ({ ...prev, imageUrl: data.url }));
      } else {
        alert('Failed to upload image');
        setImagePreview(null);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image');
      setImagePreview(null);
    } finally {
      setUploading(false);
    }
  }

  function removeImage() {
    setFormData(prev => ({ ...prev, imageUrl: '' }));
    setImagePreview(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock),
          storeId,
        }),
      });

      if (res.ok) {
        onSuccess();
        // Reset form
        setFormData({
          name: '',
          description: '',
          price: '',
          stock: '',
          imageUrl: '',
        });
        setImagePreview(null);
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to create product');
      }
    } catch (error) {
      console.error('Create product error:', error);
      alert('Failed to create product');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-xl font-bold">Add New Product</h2>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Product Image
        </label>
        {imagePreview ? (
          <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
            <Image
              src={imagePreview}
              alt="Product preview"
              fill
              className="object-cover"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <label className="block w-full h-48 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 transition-colors cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled={uploading}
            />
            <div className="h-full flex flex-col items-center justify-center">
              {uploading ? (
                <>
                  <Loader2 className="w-12 h-12 text-green-600 animate-spin mb-2" />
                  <p className="text-sm text-gray-600">Uploading...</p>
                </>
              ) : (
                <>
                  <ImageIcon className="w-12 h-12 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">Click to upload image</p>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                </>
              )}
            </div>
          </label>
        )}
      </div>

      {/* Product Name */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Product Name *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Fresh Tomatoes"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe your product..."
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      {/* Price and Stock */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Price (R) *
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            placeholder="0.00"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Stock Quantity *
          </label>
          <input
            type="number"
            min="0"
            value={formData.stock}
            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
            placeholder="0"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={saving || uploading}
          className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Adding Product...
            </span>
          ) : (
            'Add Product'
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
