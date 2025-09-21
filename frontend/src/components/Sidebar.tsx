import { FileText, Upload, Settings, Home } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Reportes', href: '/reports', icon: FileText },
  { name: 'Subir Archivos', href: '/upload', icon: Upload },
  { name: 'Configuración', href: '/settings', icon: Settings },
]

export function Sidebar() {
  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:h-[calc(100vh-65px)]">
      <div className="flex flex-col h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        {/* Navegación principal */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                    isActive
                      ? 'bg-veterinary-primary text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-veterinary-primary'
                  }`
                }
              >
                <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                {item.name}
              </NavLink>
            )
          })}
        </nav>
        
        {/* Información del sistema - fijo en la parte inferior */}
        <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center">
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                diagnoVET v1.0.0
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Sistema de Gestión Veterinaria
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
