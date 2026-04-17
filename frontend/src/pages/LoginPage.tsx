import { Button } from "@/components/common/Button"
import { Input } from "@/components/common/Input"
import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuthStore } from "@/store/useAuthStore"
import { AlertCircle } from "lucide-react"

export default function LoginPage() {
    const navigate = useNavigate()
    const { login, isLoading, error, isAuthenticated, clearError } = useAuthStore()
    const [formData, setFormData] = useState({
        email: "",
        password: ""
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
        await login(formData)
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
            <div className="w-full max-w-sm space-y-6 rounded-lg border bg-card p-6 shadow-md md:p-8">
                <div className="flex flex-col space-y-2 text-center">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Bienvenido de nuevo
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Ingresa tus credenciales para acceder a tu cuenta
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
                        <label
                            htmlFor="email"
                            className="text-sm font-medium leading-none"
                        >
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
                        <div className="flex items-center justify-between">
                            <label
                                htmlFor="password"
                                className="text-sm font-medium leading-none"
                            >
                                Contraseña
                            </label>
                            <Link
                                to="/forgot-password"
                                className="text-sm font-medium text-primary hover:underline"
                            >
                                ¿Olvidaste tu contraseña?
                            </Link>
                        </div>
                        <Input
                            id="password"
                            type="password"
                            required
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>
                    <Button className="w-full" type="submit" disabled={isLoading}>
                        {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
                    </Button>
                </form>
                <div className="text-center text-sm text-muted-foreground">
                    ¿No tienes una cuenta?{" "}
                    <Link to="/register" className="font-medium text-primary hover:underline">
                        Regístrate
                    </Link>
                </div>
            </div>
        </div>
    )
}
