import Link from 'next/link'
import { Phone, Mail } from 'lucide-react'

// TODO: change to real data
const CONTACT = {
  phone: '(555) 123-4567',
  phoneHref: 'tel:+15551234567',
  email: 'hello@blackroses.com',
  emailHref: 'mailto:hello@blackroses.com',
}

export default function Footer() {
  return (
    <footer className="border-t border-gray-darker bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col items-center text-center">
          <Link
            href="/"
            className="font-serif text-2xl tracking-widest text-foreground mb-6"
          >
            BLACK ROSE
          </Link>

          <p className="text-zinc-500 text-sm font-light mb-8 max-w-md">
            Elegance in Shadows — Luxury Floral Design
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
            <a
              href={CONTACT.phoneHref}
              className="inline-flex items-center gap-2 text-zinc-400 hover:text-rose-soft transition-colors text-sm"
            >
              <Phone className="h-4 w-4" />
              <span>{CONTACT.phone}</span>
            </a>
            <a
              href={CONTACT.emailHref}
              className="inline-flex items-center gap-2 text-zinc-400 hover:text-rose-soft transition-colors text-sm"
            >
              <Mail className="h-4 w-4" />
              <span>{CONTACT.email}</span>
            </a>
          </div>
        </div>

        <div className="h-px w-full bg-gray-darker mt-12 mb-6" />

        <p className="text-center text-zinc-600 text-xs tracking-wider">
          &copy; {new Date().getFullYear()} Black Rose. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
