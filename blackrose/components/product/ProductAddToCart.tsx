'use client'

import { useCart } from '@/lib/context/cart-context'
import type { AddonSelection, VariantSelection } from '@/lib/types'
import { useState } from 'react'

interface ProductVariant {
  id: string
  name: string
  priceAdjustment: number
}

interface ProductAddon {
  id: string
  name: string
  price: number
}

interface ProductAddToCartProps {
  productId: string
  productName: string
  productImage?: string
  basePrice: number
  variants: ProductVariant[]
  addons: ProductAddon[]
}

export default function ProductAddToCart({
  productId,
  productName,
  productImage,
  basePrice,
  variants,
  addons,
}: ProductAddToCartProps) {
  const { addItem } = useCart()
  const [selectedVariant, setSelectedVariant] =
    useState<VariantSelection | null>(null)
  const [selectedAddons, setSelectedAddons] = useState<AddonSelection[]>([])
  const [added, setAdded] = useState(false)
  const [quantity, setQuantity] = useState(1)

  const variantAdjustment = selectedVariant?.priceAdjustment ?? 0
  const addonsTotal = selectedAddons.reduce((s, a) => s + a.price, 0)
  const unitPrice = basePrice + variantAdjustment + addonsTotal

  const handleAddonToggle = (addon: ProductAddon) => {
    setSelectedAddons((prev) => {
      const exists = prev.find((a) => a.id === addon.id)
      if (exists) {
        return prev.filter((a) => a.id !== addon.id)
      }
      return [
        ...prev,
        { id: addon.id, name: addon.name, price: addon.price },
      ]
    })
  }

  const handleAddToCart = () => {
    addItem({
      productId,
      productName,
      productImage,
      basePrice,
      selectedVariant,
      selectedAddons,
      customConfig: {},
      quantity,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <>
      {/* Dynamic price */}
      <div className="text-2xl text-foreground mb-6 font-serif">
        ${unitPrice.toFixed(2)}
        {(variantAdjustment > 0 || addonsTotal > 0) && (
          <span className="text-sm text-gray-400 font-sans font-light ml-2">
            (${basePrice.toFixed(2)} base)
          </span>
        )}
      </div>

      <p className="text-gray-400 font-light leading-relaxed mb-10">
        {/* description is rendered server-side, keep as is */}
      </p>

      <div className="h-px w-full bg-gray-darker mb-10" />

      {/* Variants */}
      {variants.length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm uppercase tracking-widest text-gray-300 mb-4">
            Size
          </h3>
          <div className="space-y-3">
            {variants.map((variant) => {
              const isSelected = selectedVariant?.id === variant.id
              return (
                <label
                  key={variant.id}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <input
                    type="radio"
                    name="size"
                    checked={isSelected}
                    onChange={() =>
                      setSelectedVariant(
                        isSelected
                          ? null
                          : {
                              id: variant.id,
                              name: variant.name,
                              priceAdjustment: variant.priceAdjustment,
                            }
                      )
                    }
                    className="appearance-none w-4 h-4 rounded-full border border-gray-500 checked:border-rose-soft checked:bg-rose-soft transition-colors"
                  />
                  <span className="text-gray-300 group-hover:text-foreground transition-colors">
                    {variant.name}
                    {variant.priceAdjustment > 0 && (
                      <span className="text-gray-500 ml-1">
                        (+${variant.priceAdjustment.toFixed(0)})
                      </span>
                    )}
                  </span>
                </label>
              )
            })}
          </div>
        </div>
      )}

      {/* Add-ons */}
      {addons.length > 0 && (
        <div className="mb-10">
          <h3 className="text-sm uppercase tracking-widest text-gray-300 mb-4">
            Add-ons
          </h3>
          <div className="space-y-3">
            {addons.map((addon) => {
              const isChecked = selectedAddons.some((a) => a.id === addon.id)
              return (
                <label
                  key={addon.id}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleAddonToggle(addon)}
                    className="appearance-none w-4 h-4 border border-gray-500 checked:bg-rose-soft checked:border-rose-soft transition-colors"
                  />
                  <span className="text-gray-300 group-hover:text-foreground transition-colors">
                    {addon.name}
                    {addon.price > 0 && (
                      <span className="text-gray-500 ml-1">
                        (+${addon.price.toFixed(0)})
                      </span>
                    )}
                  </span>
                </label>
              )
            })}
          </div>
        </div>
      )}

      {/* Quantity */}
      <div className="mb-6">
        <h3 className="text-sm uppercase tracking-widest text-gray-300 mb-3">
          Quantity
        </h3>
        <div className="flex items-center border border-gray-darker w-fit">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
            className="px-4 py-2 text-gray-400 hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            −
          </button>
          <span className="px-4 py-2 text-foreground min-w-[3rem] text-center tabular-nums">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity((q) => q + 1)}
            className="px-4 py-2 text-gray-400 hover:text-foreground transition-colors"
          >
            +
          </button>
        </div>
      </div>

      {/* Add to Cart */}
      <button
        onClick={handleAddToCart}
        className={`w-full py-4 font-medium tracking-widest uppercase transition-colors duration-300 mb-4 ${
          added
            ? 'bg-rose-soft text-background'
            : 'bg-foreground text-background hover:bg-rose-soft hover:text-background'
        }`}
      >
        {added ? '✓ Added to Cart' : 'Add to Cart'}
      </button>
    </>
  )
}
