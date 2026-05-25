'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'nav-blur shadow-lg' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-md">
              <span style={{fontSize:'20px'}}>🏥</span>
            </div>
            <div>
              <span className="font-display text-white font-bold text-lg leading-none">Santé Connect</span>
              <div className="text-xs text-green-300 font-sans">Cameroun</div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="#services" className="text-green-100 hover:text-white font-sans text-sm font-medium transition-colors">Services</Link>
            <Link href="#professionnels" className="text-green-100 hover:text-white font-sans text-sm font-medium transition-colors">Professionnels</Link>
            <Link href="#pharmacies" className="text-green-100 hover:text-white font-sans text-sm font-medium transition-colors">Pharmacies</Link>
            <Link href="/structures" className="text-green-100 hover:text-white font-sans text-sm font-medium transition-colors">Structures</Link>
            <Link href="/urgences" className="text-red-300 hover:text-red-200 font-sans text-sm font-bold transition-colors flex items-center gap-1">
              <span>🚨</span> Urgences
            </Link>
            <Link href="#tarifs" className="text-green-100 hover:text-white font-sans text-sm font-medium transition-colors">Tarifs</Link>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/auth/login" className="text-white font-sans text-sm font-medium hover:text-green-200 transition-colors">
              Connexion
            </Link>
            <Link href="/auth/register" className="btn-gold text-sm py-2 px-5">
              S&apos;inscrire
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-white p-2">
            <div className={`w-6 h-0.5 bg-white mb-1.5 transition-all ${menuOpen ? 'rotate-45 translate-y-2' : ''}`}></div>
            <div className={`w-6 h-0.5 bg-white mb-1.5 transition-all ${menuOpen ? 'opacity-0' : ''}`}></div>
            <div className={`w-6 h-0.5 bg-white transition-all ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`}></div>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-green-900 border-t border-green-700 px-4 py-4 space-y-3">
          <Link href="#services" className="block text-green-100 font-sans py-2">Services</Link>
          <Link href="#professionnels" className="block text-green-100 font-sans py-2">Professionnels</Link>
          <Link href="#pharmacies" className="block text-green-100 font-sans py-2">Pharmacies</Link>
          <Link href="/structures" className="block text-green-100 font-sans py-2">🏥 Structures</Link>
          <Link href="/urgences" className="block text-red-300 font-bold font-sans py-2">🚨 Urgences</Link>
          <Link href="#tarifs" className="block text-green-100 font-sans py-2">Tarifs</Link>
          <div className="pt-3 border-t border-green-700 flex flex-col gap-2">
            <Link href="/auth/login" className="block text-center text-white font-sans py-2 border border-green-500 rounded-full">Connexion</Link>
            <Link href="/auth/register" className="btn-gold text-center block">S&apos;inscrire</Link>
          </div>
        </div>
      )}
    </nav>
  )
}
