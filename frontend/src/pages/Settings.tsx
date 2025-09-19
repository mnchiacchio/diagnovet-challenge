import { useState } from 'react'
import { Save, User, Database, Cloud, Bell } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

export function Settings() {
  const [settings, setSettings] = useState({
    // Configuración de usuario
    userName: 'Usuario',
    email: 'usuario@ejemplo.com',
    
    // Configuración de API
    apiUrl: 'http://localhost:5000/api/v1',
    
    // Configuración de Cloudinary
    cloudinaryCloudName: '',
    cloudinaryApiKey: '',
    
    // Configuración de notificaciones
    emailNotifications: true,
    pushNotifications: false,
    processingAlerts: true,
    
    // Configuración de OCR
    ocrConfidenceThreshold: 80,
    autoProcess: true,
    
    // Configuración de interfaz
    darkMode: false,
    language: 'es'
  })

  const handleSave = () => {
    // Aquí se guardarían las configuraciones
    console.log('Guardando configuraciones:', settings)
    // Mostrar mensaje de éxito
  }

  const handleInputChange = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Configuración
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Personaliza la configuración del sistema
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuración de Usuario */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5" />
              Información de Usuario
            </CardTitle>
            <CardDescription>
              Configura tu información personal
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="userName">Nombre de Usuario</Label>
              <Input
                id="userName"
                value={settings.userName}
                onChange={(e) => handleInputChange('userName', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={settings.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Configuración de API */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="mr-2 h-5 w-5" />
              Configuración de API
            </CardTitle>
            <CardDescription>
              Configura la conexión con el backend
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="apiUrl">URL de la API</Label>
              <Input
                id="apiUrl"
                value={settings.apiUrl}
                onChange={(e) => handleInputChange('apiUrl', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Configuración de Cloudinary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Cloud className="mr-2 h-5 w-5" />
              Configuración de Cloudinary
            </CardTitle>
            <CardDescription>
              Configura el almacenamiento de archivos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="cloudinaryCloudName">Cloud Name</Label>
              <Input
                id="cloudinaryCloudName"
                value={settings.cloudinaryCloudName}
                onChange={(e) => handleInputChange('cloudinaryCloudName', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="cloudinaryApiKey">API Key</Label>
              <Input
                id="cloudinaryApiKey"
                type="password"
                value={settings.cloudinaryApiKey}
                onChange={(e) => handleInputChange('cloudinaryApiKey', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Configuración de Notificaciones */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="mr-2 h-5 w-5" />
              Notificaciones
            </CardTitle>
            <CardDescription>
              Configura las notificaciones del sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="emailNotifications">Notificaciones por Email</Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Recibir notificaciones por correo electrónico
                </p>
              </div>
              <Switch
                id="emailNotifications"
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => handleInputChange('emailNotifications', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="pushNotifications">Notificaciones Push</Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Recibir notificaciones en el navegador
                </p>
              </div>
              <Switch
                id="pushNotifications"
                checked={settings.pushNotifications}
                onCheckedChange={(checked) => handleInputChange('pushNotifications', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="processingAlerts">Alertas de Procesamiento</Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Recibir alertas cuando se complete el procesamiento
                </p>
              </div>
              <Switch
                id="processingAlerts"
                checked={settings.processingAlerts}
                onCheckedChange={(checked) => handleInputChange('processingAlerts', checked)}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configuración de OCR */}
      <Card>
        <CardHeader>
          <CardTitle>Configuración de OCR</CardTitle>
          <CardDescription>
            Configura el procesamiento de texto con OCR
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="ocrConfidenceThreshold">
              Umbral de Confianza OCR ({settings.ocrConfidenceThreshold}%)
            </Label>
            <input
              id="ocrConfidenceThreshold"
              type="range"
              min="0"
              max="100"
              value={settings.ocrConfidenceThreshold}
              onChange={(e) => handleInputChange('ocrConfidenceThreshold', parseInt(e.target.value))}
              className="w-full mt-2"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Archivos con confianza menor a este valor requerirán revisión manual
            </p>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="autoProcess">Procesamiento Automático</Label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Procesar automáticamente archivos con alta confianza
              </p>
            </div>
            <Switch
              id="autoProcess"
              checked={settings.autoProcess}
              onCheckedChange={(checked) => handleInputChange('autoProcess', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Botón de Guardar */}
      <div className="flex justify-end">
        <Button onClick={handleSave} className="veterinary-button">
          <Save className="mr-2 h-4 w-4" />
          Guardar Configuración
        </Button>
      </div>
    </div>
  )
}
