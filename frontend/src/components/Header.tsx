import { useState } from 'react'
import { Menu, X, Bell, User, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import diagnovetLogo from '@/assets/images/diagnovet-icon.png'

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <img 
                src={diagnovetLogo} 
                alt="diagnoVET Logo" 
                className="h-10 w-auto"
              />
            </div>
          </div>

          {/* Navegación desktop */}
          <nav className="hidden md:flex space-x-8">
            <a href="/" className="text-gray-700 dark:text-gray-300 hover:text-veterinary-primary px-3 py-2 rounded-md text-sm font-medium">
              Dashboard
            </a>
            <a href="/reports" className="text-gray-700 dark:text-gray-300 hover:text-veterinary-primary px-3 py-2 rounded-md text-sm font-medium">
              Reportes
            </a>
            <a href="/upload" className="text-gray-700 dark:text-gray-300 hover:text-veterinary-primary px-3 py-2 rounded-md text-sm font-medium">
              Subir Archivos
            </a>
          </nav>

          {/* Acciones del header */}
          <div className="flex items-center space-x-4">
            {/* Notificaciones */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                3
              </Badge>
            </Button>

            {/* Usuario */}
            <Button variant="ghost" size="sm">
              <User className="h-5 w-5 mr-2" />
              <span className="hidden sm:inline">Usuario</span>
            </Button>

            {/* Configuración */}
            <Button variant="ghost" size="sm">
              <Settings className="h-5 w-5" />
            </Button>

            {/* Menú móvil */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Menú móvil */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50 dark:bg-gray-700 rounded-lg mt-2">
              <a href="/" className="text-gray-700 dark:text-gray-300 hover:text-veterinary-primary block px-3 py-2 rounded-md text-base font-medium">
                Dashboard
              </a>
              <a href="/reports" className="text-gray-700 dark:text-gray-300 hover:text-veterinary-primary block px-3 py-2 rounded-md text-base font-medium">
                Reportes
              </a>
              <a href="/upload" className="text-gray-700 dark:text-gray-300 hover:text-veterinary-primary block px-3 py-2 rounded-md text-base font-medium">
                Subir Archivos
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
