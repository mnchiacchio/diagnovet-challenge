import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface SelectProps {
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
}

interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
}

interface SelectContentProps {
  children: React.ReactNode
  className?: string
}

interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
  children: React.ReactNode
}

interface SelectValueProps {
  placeholder?: string
}

// Select Context
const SelectContext = React.createContext<{
  value?: string
  onValueChange?: (value: string) => void
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}>({
  isOpen: false,
  setIsOpen: () => {}
})

const Select = ({ value, onValueChange, children }: SelectProps) => {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <SelectContext.Provider value={{ value, onValueChange, isOpen, setIsOpen }}>
      <div className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  )
}

const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className, children, ...props }, ref) => {
    const { isOpen, setIsOpen } = React.useContext(SelectContext)

    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        onClick={() => setIsOpen(!isOpen)}
        {...props}
      >
        {children}
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>
    )
  }
)
SelectTrigger.displayName = "SelectTrigger"

const SelectContent = ({ children, className }: SelectContentProps) => {
  const { isOpen, setIsOpen } = React.useContext(SelectContext)

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40" 
        onClick={() => setIsOpen(false)}
      />
      {/* Content */}
      <div
        className={cn(
          "absolute top-full z-50 mt-1 max-h-96 min-w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md",
          className
        )}
      >
        <div className="p-1">
          {children}
        </div>
      </div>
    </>
  )
}

const SelectItem = ({ value, children, className, onClick, ...props }: SelectItemProps) => {
  const { onValueChange, setIsOpen } = React.useContext(SelectContext)

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    onValueChange?.(value)
    setIsOpen(false)
    onClick?.(e)
  }

  return (
    <div
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {children}
    </div>
  )
}

const SelectValue = ({ placeholder }: SelectValueProps) => {
  const { value } = React.useContext(SelectContext)

  // Mapear valores a texto legible
  const getDisplayText = (val?: string) => {
    if (!val) return placeholder
    const mapping: Record<string, string> = {
      'PROCESSING': 'Procesando',
      'COMPLETED': 'Completado',
      'NEEDS_REVIEW': 'Necesita Revisión',
      'ERROR': 'Error'
    }
    return mapping[val] || val
  }

  return (
    <span className="block truncate">
      {getDisplayText(value) || placeholder}
    </span>
  )
}

export {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
}
