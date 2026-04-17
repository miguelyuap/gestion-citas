import { Button } from "@/components/common/Button"
import { Input } from "@/components/common/Input"
import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuthStore } from "@/store/useAuthStore"
import { AlertCircle } from "lucide-react"
import { UserRole } from "@/types/auth"

export default function RegisterPage() {
    const navigate = useNavigate()
    const { register, isLoading, error, isAuthenticated, clearError } = useAuthStore()

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        phone: "",
        role: UserRole.CLIENT
    })

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            navigate("/dashboard")
        }
        return () => clearError()
    }, [isAuthenticated, navigate, clearError])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        await register(formData)
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
            <div className="w-full max-w-sm space-y-6 rounded-lg border bg-card p-6 shadow-md md:p-8">
                <div className="flex flex-col space-y-2 text-center">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Crear una cuenta
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Ingresa tus datos para registrarte en el sistema
                    </p>
                </div>

                {error && (
                    <div className="flex items-center gap-2 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                        <AlertCircle className="h-4 w-4" />
                        <p>{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="fullName" className="text-sm font-medium leading-none">
                            Nombre Completo
                        </label>
                        <Input
                            id="fullName"
                            placeholder="Juan Pérez"
                            required
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="phone" className="text-sm font-medium leading-none">
                            Teléfono
                        </label>
                        <Input
                            id="phone"
                            placeholder="+57 300 123 4567"
                            required
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium leading-none">
                            Email
                        </label>
                        <Input
                            id="email"
                            placeholder="nombre@ejemplo.com"
                            type="email"
                            autoCapitalize="none"
                            autoComplete="email"
                            autoCorrect="off"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="password" className="text-sm font-medium leading-none">
                            Contraseña
                        </label>
                        <Input
                            id="password"
                            type="password"
                            required
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>
                    <Button className="w-full" type="submit" disabled={isLoading}>
                        {isLoading ? "Registrando..." : "Registrarse"}
                    </Button>
                </form>
                <div className="text-center text-sm text-muted-foreground">
                    ¿Ya tienes una cuenta?{" "}
                    <Link to="/login" className="font-medium text-primary hover:underline">
                        Inicia Sesión
                    </Link>
                </div>
            </div>
        </div>
    )
}
