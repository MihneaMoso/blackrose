'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Product } from '@/lib/types'
import { cn } from '@/lib/utils'
import { X, Upload, Loader2, ImageOff } from 'lucide-react'

interface EditProductModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
  onSaved: () => void
  onToast: (toast: { type: 'success' | 'error'; message: string }) => void
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function EditProductModal({
  product,
  isOpen,
  onClose,
  onSaved,
  onToast,
}: EditProductModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [basePrice, setBasePrice] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imageUrlInput, setImageUrlInput] = useState('')
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isEditing = !!product
  const effectiveImageUrl = imageFile
    ? URL.createObjectURL(imageFile)
    : imageUrlInput || product?.image_url || ''

  useEffect(() => {
    if (product && isOpen) {
      setName(product.name)
      setDescription(product.description)
      setBasePrice(String(product.base_price))
      setImageUrlInput(product.image_url ?? '')
      setImageFile(null)
    } else if (!product && isOpen) {
      setName('')
      setDescription('')
      setBasePrice('')
      setImageUrlInput('')
      setImageFile(null)
    }
  }, [product, isOpen])

  useEffect(() => {
    if (!isOpen) {
      setImageFile(null)
    }
  }, [isOpen])

  if (!isOpen) return null

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !description.trim() || !basePrice.trim()) return

    setSubmitting(true)

    try {
      let finalImageUrl = imageUrlInput || null

      if (imageFile) {
        setUploading(true)
        const supabase = createClient()
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = `${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, imageFile)

        if (uploadError) throw new Error(uploadError.message)

        const { data: urlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath)

        finalImageUrl = urlData.publicUrl
        setUploading(false)
      }

      const supabase = createClient()
      const slug = generateSlug(name.trim())

      const payload: Record<string, unknown> = {
        name: name.trim(),
        description: description.trim(),
        base_price: Number(basePrice),
        slug,
        image_url: finalImageUrl,
      }

      if (isEditing && product) {
        const { error } = await supabase
          .from('products')
          .update(payload)
          .eq('id', product.id)

        if (error) throw new Error(error.message)

        onToast({ type: 'success', message: 'Product updated successfully' })
      } else {
        const { error } = await supabase
          .from('products')
          .insert(payload)

        if (error) throw new Error(error.message)

        onToast({ type: 'success', message: 'Product created successfully' })
      }

      onSaved()
      onClose()
    } catch (err) {
      onToast({
        type: 'error',
        message: err instanceof Error ? err.message : 'Something went wrong',
      })
    } finally {
      setSubmitting(false)
      setUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg rounded-xl border border-zinc-800 bg-zinc-900 shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <h2 className="font-serif text-lg text-rose-200">
            {isEditing ? 'Edit Product' : 'New Product'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-5">
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5 font-medium uppercase tracking-wider">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Product name"
              className="w-full px-3 py-2 rounded-md bg-zinc-950 border border-zinc-800 text-zinc-200 text-sm placeholder-zinc-600 focus:outline-none focus:border-rose-200/40 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1.5 font-medium uppercase tracking-wider">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={3}
              placeholder="Product description"
              className="w-full px-3 py-2 rounded-md bg-zinc-950 border border-zinc-800 text-zinc-200 text-sm placeholder-zinc-600 focus:outline-none focus:border-rose-200/40 transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1.5 font-medium uppercase tracking-wider">
              Base Price ($)
            </label>
            <input
              type="number"
              value={basePrice}
              onChange={(e) => setBasePrice(e.target.value)}
              required
              min={0}
              step="0.01"
              placeholder="0.00"
              className="w-full px-3 py-2 rounded-md bg-zinc-950 border border-zinc-800 text-zinc-200 text-sm placeholder-zinc-600 focus:outline-none focus:border-rose-200/40 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1.5 font-medium uppercase tracking-wider">
              Image
            </label>

            {effectiveImageUrl && (
              <div className="mb-3 rounded-lg overflow-hidden border border-zinc-800 w-28 h-28 bg-zinc-950 flex items-center justify-center">
                <img
                  src={effectiveImageUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                    e.currentTarget.parentElement!.classList.add('flex', 'items-center', 'justify-center')
                  }}
                />
              </div>
            )}

            <div className="space-y-2">
              <input
                type="text"
                value={imageUrlInput}
                onChange={(e) => {
                  setImageUrlInput(e.target.value)
                  setImageFile(null)
                }}
                placeholder="Paste an external image URL..."
                className="w-full px-3 py-2 rounded-md bg-zinc-950 border border-zinc-800 text-zinc-200 text-sm placeholder-zinc-600 focus:outline-none focus:border-rose-200/40 transition-colors"
              />

              <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-zinc-800" />
                <span className="text-xs text-zinc-600 uppercase tracking-wider">or</span>
                <div className="h-px flex-1 bg-zinc-800" />
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-md border border-dashed border-zinc-700 text-zinc-400 text-sm hover:border-rose-200/40 hover:text-rose-200 transition-colors"
              >
                <Upload className="h-4 w-4" />
                {imageFile ? imageFile.name : 'Upload a local image'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    setImageFile(file)
                    setImageUrlInput('')
                  }
                }}
                className="hidden"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || uploading}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-rose-200/10 text-rose-200 text-sm font-medium border border-rose-200/20 hover:bg-rose-200/20 disabled:opacity-50 transition-colors"
            >
              {(submitting || uploading) && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              {submitting || uploading
                ? uploading
                  ? 'Uploading...'
                  : 'Saving...'
                : isEditing
                  ? 'Save Changes'
                  : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
