'use client'

import { ProductCard } from '@/components/product/ProductCard'
import { SkeletonCard } from '@/components/product/SkeletonCard'
import { createClient } from '@/lib/supabase/client'
import type { Product } from '@/lib/types'
import { useEffect, useRef, useState } from 'react'

const ITEMS_PER_PAGE = 8

type SortOption = 'name-asc' | 'price-asc' | 'price-desc'

const SORT_LABELS: Record<SortOption, string> = {
  'name-asc': 'Name A-Z',
  'price-asc': 'Price Low-High',
  'price-desc': 'Price High-Low',
}

function buildOrder(sort: SortOption) {
  switch (sort) {
    case 'price-asc':
      return { column: 'base_price', ascending: true as const }
    case 'price-desc':
      return { column: 'base_price', ascending: false as const }
    default:
      return { column: 'name', ascending: true as const }
  }
}

interface ProductGridProps {
  filterColumn?: string
  filterValue?: string
  showSort?: boolean
}

export function ProductGrid({
  filterColumn,
  filterValue,
  showSort = true,
}: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [initialLoading, setInitialLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [sort, setSort] = useState<SortOption>('name-asc')
  const [error, setError] = useState<string | null>(null)

  const loadMoreRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  const fetchPage = async (
    pageNum: number,
    currentSort: SortOption,
    append: boolean
  ) => {
    if (append) setLoadingMore(true)

    const { column, ascending } = buildOrder(currentSort)
    const from = pageNum * ITEMS_PER_PAGE
    const to = from + ITEMS_PER_PAGE - 1

    let query = supabase
      .from('products')
      .select('*')
      .order(column, { ascending })
      .range(from, to)

    if (filterColumn && filterValue) {
      query = query.eq(filterColumn, filterValue)
    }

    const { data, error: fetchError } = await query

    if (fetchError) {
      setError(fetchError.message)
      setInitialLoading(false)
      setLoadingMore(false)
      return
    }

    const fetched = (data as Product[]) ?? []
    setProducts((prev) => (append ? [...prev, ...fetched] : fetched))
    setHasMore(fetched.length === ITEMS_PER_PAGE)
    setInitialLoading(false)
    setLoadingMore(false)
  }

  useEffect(() => {
    setProducts([])
    setPage(0)
    setHasMore(true)
    setInitialLoading(true)
    setError(null)
    fetchPage(0, sort, false)
  }, [sort, filterColumn, filterValue])

  const handleLoadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchPage(nextPage, sort, true)
  }

  useEffect(() => {
    const el = loadMoreRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasMore &&
          !loadingMore &&
          !initialLoading
        ) {
          handleLoadMore()
        }
      },
      { rootMargin: '200px' }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [hasMore, loadingMore, initialLoading, page, sort, filterColumn, filterValue])

  return (
    <>
      {/* Sort bar */}
      <div className="flex items-center justify-between mb-10">
        {!initialLoading && (
          <span className="text-neutral-500 tracking-wider uppercase text-xs">
            {products.length}
            {hasMore ? '+' : ''} item{products.length !== 1 ? 's' : ''}
          </span>
        )}
        {showSort && (
          <div className="flex items-center gap-3 ml-auto">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="bg-zinc-900 border border-zinc-800 text-neutral-200 px-3 py-2 text-xs uppercase tracking-widest focus:outline-none focus:border-rose-200/50 transition-colors cursor-pointer"
            >
              {Object.entries(SORT_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="border border-rose-200/20 bg-rose-200/5 px-5 py-4 mb-10">
          <p className="text-rose-200 text-sm">
            Unable to load products. Please try again later.
          </p>
          <p className="text-neutral-600 text-xs mt-1">{error}</p>
        </div>
      )}

      {/* Initial loading skeletons */}
      {initialLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* Product grid */}
      {!initialLoading && !error && (
        <>
          {products.length === 0 ? (
            <div className="py-24 text-center">
              <p className="text-neutral-500 text-sm uppercase tracking-widest">
                No products found
              </p>
              {filterColumn && (
                <p className="text-neutral-700 text-xs mt-2">
                  Try adjusting your filter or browse all products.
                </p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Load More */}
          <div ref={loadMoreRef} className="mt-14 flex justify-center">
            {loadingMore ? (
              <div className="flex items-center gap-3 text-neutral-500 text-xs uppercase tracking-widest">
                <span className="inline-block w-4 h-4 border border-neutral-500 border-t-transparent rounded-full animate-spin" />
                Loading...
              </div>
            ) : hasMore ? (
              <button
                onClick={handleLoadMore}
                className="px-8 py-3 border border-zinc-700 text-neutral-300 text-xs uppercase tracking-widest hover:border-rose-200/50 hover:text-rose-200 transition-colors duration-300"
              >
                Load More
              </button>
            ) : products.length > 0 ? (
              <p className="text-neutral-600 text-xs uppercase tracking-widest">
                All items loaded
              </p>
            ) : null}
          </div>
        </>
      )}
    </>
  )
}
