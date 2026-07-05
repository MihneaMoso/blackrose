'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Product } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Plus, Pencil, Trash2, Loader2, ImageOff, X, Check, Sparkles } from 'lucide-react'
import { EditProductModal } from './EditProductModal'

interface Toast {
  type: 'success' | 'error'
  message: string
}

type FeatureMap = Record<string, { featured: boolean; offer_text: string }>

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 p-4 rounded-lg bg-white/5 animate-pulse">
      <div className="w-12 h-12 rounded-lg bg-white/10 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-48 rounded bg-white/10" />
        <div className="h-3 w-20 rounded bg-white/10" />
      </div>
      <div className="h-8 w-20 rounded bg-white/10" />
    </div>
  )
}

export function ProductList() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [toast, setToast] = useState<Toast | null>(null)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [imgErrors, setImgErrors] = useState<Set<string>>(new Set())
  const [features, setFeatures] = useState<FeatureMap>({})
  const [savingFeature, setSavingFeature] = useState<Set<string>>(new Set())

  const showToast = useCallback((t: Toast) => {
    setToast(t)
    setTimeout(() => setToast(null), 3500)
  }, [])

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw new Error(error.message)
      const list = (data as Product[]) ?? []
      setProducts(list)

      const featureMap: FeatureMap = {}
      for (const p of list) {
        featureMap[p.id] = {
          featured: p.featured ?? false,
          offer_text: p.offer_text ?? '',
        }
      }
      setFeatures(featureMap)
    } catch (err) {
      showToast({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to load products',
      })
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  async function handleDelete(productId: string) {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) return

    setDeletingId(productId)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)

      if (error) throw new Error(error.message)

      setProducts((prev) => prev.filter((p) => p.id !== productId))
      showToast({ type: 'success', message: 'Product deleted successfully' })
    } catch (err) {
      showToast({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to delete product',
      })
    } finally {
      setDeletingId(null)
    }
  }

  async function handleSaveFeature(productId: string) {
    const feat = features[productId]
    if (!feat) return

    setSavingFeature((prev) => new Set(prev).add(productId))
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('products')
        .update({
          featured: feat.featured,
          offer_text: feat.featured ? feat.offer_text : null,
        })
        .eq('id', productId)

      if (error) throw new Error(error.message)

      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId
            ? { ...p, featured: feat.featured, offer_text: feat.featured ? feat.offer_text : null }
            : p
        )
      )
      showToast({ type: 'success', message: 'Product updated' })
    } catch (err) {
      showToast({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to save',
      })
    } finally {
      setSavingFeature((prev) => {
        const next = new Set(prev)
        next.delete(productId)
        return next
      })
    }
  }

  function handleImgError(productId: string) {
    setImgErrors((prev) => new Set(prev).add(productId))
  }

  function openEdit(product: Product) {
    setEditingProduct(product)
    setModalOpen(true)
  }

  function openCreate() {
    setEditingProduct(null)
    setModalOpen(true)
  }

  function handleModalSaved() {
    fetchProducts()
  }

  return (
    <div className="relative">
      {/* Toast */}
      {toast && (
        <div
          className={cn(
            'fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium transition-all',
            toast.type === 'success'
              ? 'bg-emerald-900/80 text-emerald-200 border border-emerald-700/50'
              : 'bg-red-900/80 text-red-200 border border-red-700/50',
          )}
        >
          {toast.message}
          <button onClick={() => setToast(null)} className="ml-3 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Edit / Create Modal */}
      <EditProductModal
        product={editingProduct}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={handleModalSaved}
        onToast={showToast}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-serif text-lg text-rose-200">
          Products
          {!loading && (
            <span className="ml-2 text-sm text-zinc-500 font-sans font-normal">
              ({products.length})
            </span>
          )}
        </h3>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-accent/10 text-rose-200 text-sm font-medium border border-rose-accent/20 hover:bg-rose-accent/20 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </button>
      </div>

      {/* Product list */}
      <div className="space-y-2">
        {loading ? (
          <>
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
            <p className="text-sm font-medium">No products yet</p>
            <p className="text-xs mt-1">Click &quot;Add Product&quot; to create one</p>
          </div>
        ) : (
          products.map((product) => {
            const feat = features[product.id]
            const isSaving = savingFeature.has(product.id)
            const isFeatured = feat?.featured ?? false

            return (
              <div
                key={product.id}
                className={cn(
                  'rounded-lg border transition-colors',
                  isFeatured
                    ? 'border-rose-200/20 bg-rose-200/5'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                )}
              >
                {/* Main row */}
                <div className="flex items-center gap-3 p-4">
                  {/* Featured checkbox */}
                  <label className="flex items-center justify-center w-10 h-10 rounded-lg cursor-pointer hover:bg-white/5 transition-colors shrink-0">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) =>
                        setFeatures((prev) => ({
                          ...prev,
                          [product.id]: {
                            ...prev[product.id],
                            featured: e.target.checked,
                          },
                        }))
                      }
                      className="sr-only"
                    />
                    <div
                      className={cn(
                        'w-5 h-5 rounded border-2 flex items-center justify-center transition-colors',
                        isFeatured
                          ? 'border-rose-200 bg-rose-200/20'
                          : 'border-zinc-600 hover:border-zinc-400'
                      )}
                    >
                      {isFeatured && <Check className="h-3 w-3 text-rose-200" />}
                    </div>
                  </label>

                  {/* Thumbnail */}
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-zinc-950 shrink-0 flex items-center justify-center border border-zinc-800">
                    {product.image_url && !imgErrors.has(product.id) ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={() => handleImgError(product.id)}
                      />
                    ) : (
                      <ImageOff className="h-4 w-4 text-zinc-600" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-200 truncate flex items-center gap-2">
                      {product.name}
                      {isFeatured && (
                        <Sparkles className="h-3 w-3 text-rose-200 shrink-0" />
                      )}
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      ${Number(product.base_price).toFixed(2)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleSaveFeature(product.id)}
                      disabled={isSaving}
                      className={cn(
                        'p-2 rounded-lg transition-colors',
                        isFeatured
                          ? 'text-rose-200 hover:bg-rose-200/10'
                          : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                      )}
                      aria-label="Save featured state"
                    >
                      {isSaving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={() => openEdit(product)}
                      className="p-2 rounded-lg text-zinc-500 hover:text-rose-200 hover:bg-rose-200/10 transition-colors"
                      aria-label={`Edit ${product.name}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      disabled={deletingId === product.id}
                      className="p-2 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-900/20 disabled:opacity-50 transition-colors"
                      aria-label={`Delete ${product.name}`}
                    >
                      {deletingId === product.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Offer text (expandable when featured) */}
                {isFeatured && (
                  <div className="px-4 pb-4 pt-0">
                    <div className="pl-14">
                      <label className="block text-xs text-zinc-500 mb-1.5 font-medium uppercase tracking-wider">
                        Offer text
                      </label>
                      <textarea
                        value={feat?.offer_text ?? ''}
                        onChange={(e) =>
                          setFeatures((prev) => ({
                            ...prev,
                            [product.id]: {
                              ...prev[product.id],
                              offer_text: e.target.value,
                            },
                          }))
                        }
                        rows={2}
                        placeholder="Write a custom offer or description for this featured product..."
                        className="w-full px-3 py-2 rounded-md bg-zinc-950 border border-zinc-800 text-zinc-200 text-sm placeholder-zinc-600 focus:outline-none focus:border-rose-200/40 transition-colors resize-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
