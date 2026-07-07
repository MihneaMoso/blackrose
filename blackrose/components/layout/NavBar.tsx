import Link from 'next/link'
import { NavBarActions } from './NavBarActions'
import { NavBarCart } from './NavBarCart'
import { MobileNavMenu } from './MobileNavMenu'

export default function NavBar() {
  return (
    <nav className="fixed w-full top-0 z-50 bg-background/80 backdrop-blur-md border-b border-gray-darker">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="font-serif text-2xl tracking-widest text-foreground">
              BLACK ROSE
            </Link>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
            <Link href="/shop" className="text-foreground hover:text-rose-soft px-3 py-2 text-sm uppercase tracking-wider transition-colors">
              Shop
            </Link>
            <Link href="/collections" className="text-foreground hover:text-rose-soft px-3 py-2 text-sm uppercase tracking-wider transition-colors">
              Collections
            </Link>
            <Link href="/about" className="text-foreground hover:text-rose-soft px-3 py-2 text-sm uppercase tracking-wider transition-colors">
              About
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <NavBarCart />
            <NavBarActions />
            <MobileNavMenu />
          </div>
        </div>
      </div>
    </nav>
  )
}
