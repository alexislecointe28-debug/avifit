import Link from 'next/link'
import Image from 'next/image'

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex flex-col gap-0.5">
          <Image
            src="/avifit-logo.svg"
            alt="Avifit FFA"
            width={100}
            height={32}
            className="h-8 w-auto object-contain"
            priority
          />
          <span className="text-[10px] text-gray-400 tracking-wide pl-0.5">
            by Alexis
          </span>
        </Link>

        {/* Links */}
        <div className="hidden md:flex items-center gap-8">
          {[
            { href: '/#concept', label: 'Concept' },
            { href: '/planning', label: 'Planning' },
            { href: '/#tarifs', label: 'Tarifs' },
            { href: '/#contact', label: 'Contact' },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <Link
          href="/planning"
          className="bg-brand text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-brand-700 transition-colors"
        >
          Réserver une séance
        </Link>
      </div>
    </nav>
  )
}
