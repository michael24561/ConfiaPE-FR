'use client'

import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">ConfiaPE</h3>
            <p className="text-gray-400 text-sm">
              Conectando clientes con técnicos profesionales en Perú
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Enlaces</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>
                <Link href="/Tecnicos" className="hover:text-white transition-colors">
                  Buscar Técnicos
                </Link>
              </li>
              <li>
                <Link href="/Registro" className="hover:text-white transition-colors">
                  Registrarse
                </Link>
              </li>
              <li>
                <Link href="/Login" className="hover:text-white transition-colors">
                  Iniciar Sesión
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Servicios</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>Electricista</li>
              <li>Fontanero</li>
              <li>Carpintero</li>
              <li>Pintor</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contacto</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>Email: contacto@confiape.com</li>
              <li>Teléfono: +51 999 999 999</li>
              <li>Lima, Perú</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} ConfiaPE. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
