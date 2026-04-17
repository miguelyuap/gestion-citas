import { useEffect, useState } from "react"
import { Button } from "@/components/common/Button"
import { User, ArrowRight, AlertCircle, Loader2, CheckCircle } from "lucide-react"
import { appointmentService } from "@/services/appointmentService"
import type { Appointment } from "@/services/appointmentService"
import { providerService } from "@/services/providerService"
import type { Provider } from "@/services/providerService"
import { useAuthStore } from "@/store/useAuthStore"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export default function ProviderDashboard() {
    const { user } = useAuthStore()
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [providerProfile, setProviderProfile] = useState<Provider | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                const profile = await providerService.getMyProfile();
                const allAppointments = await appointmentService.getProviderAppointments(profile.id);
                setProviderProfile(profile)
                setAppointments(allAppointments)
            } catch (err: any) {
                console.error("Error fetching provider data:", err)
                setError("No se pudo cargar la información del panel.")
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    const handleConfirm = async (id: string) => {
        try {
            const updated = await appointmentService.confirm(id);
            setAppointments(prev => prev.map(apt => apt.id === id ? { ...apt, status: updated.status } : apt));
        } catch (err: any) {
            console.error("Error al confirmar:", err);
            setError(err.response?.data?.message || "No se pudo confirmar la cita.");
        }
    };

    const handleComplete = async (id: string) => {
        try {
            const updated = await appointmentService.complete(id);
            setAppointments(prev => prev.map(apt => apt.id === id ? { ...apt, status: updated.status } : apt));
        } catch (err: any) {
            console.error("Error al completar:", err);
            setError(err.response?.data?.message || "No se pudo completar la cita.");
        }
    };

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const upcomingAppointments = appointments
        .filter(apt => {
            const aptDate = new Date(apt.startTime)
            return aptDate >= today && apt.status !== 'CANCELLED' && apt.status !== 'PENDING'
        })
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())

    const pendingAppointments = appointments
        .filter(apt => apt.status === 'PENDING')
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString)
            return format(date, "d MMM, HH:mm", { locale: es })
        } catch (e) {
            return dateString
        }
    }

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex h-96 flex-col items-center justify-center gap-4 text-center">
                <AlertCircle className="h-12 w-12 text-destructive" />
                <h2 className="text-xl font-bold">{error}</h2>
                <Button onClick={() => window.location.reload()}>Reintentar</Button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{providerProfile?.businessName || 'Panel de Proveedor'}</h1>
                    <p className="text-muted-foreground">Bienvenido, {user?.fullName}</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline">Configurar Horarios</Button>
                    <Button>Nueva Cita</Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <div className="rounded-xl border bg-card p-6 shadow-sm">
                    <p className="text-sm font-medium text-muted-foreground">Próximas</p>
                    <h3 className="text-2xl font-bold">{upcomingAppointments.length}</h3>
                </div>
                <div className="rounded-xl border bg-card p-6 shadow-sm">
                    <p className="text-sm font-medium text-muted-foreground">Pendientes</p>
                    <h3 className="text-2xl font-bold text-yellow-600">{pendingAppointments.length}</h3>
                </div>
                <div className="rounded-xl border bg-card p-6 shadow-sm">
                    <p className="text-sm font-medium text-muted-foreground">Este Mes</p>
                    <h3 className="text-2xl font-bold">{appointments.length}</h3>
                </div>
                <div className="rounded-xl border bg-card p-6 shadow-sm">
                    <p className="text-sm font-medium text-muted-foreground">Calificación</p>
                    <h3 className="text-2xl font-bold text-primary">★ {providerProfile?.rating || '0.0'}</h3>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Agenda de hoy */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Próximas Citas</h2>
                    <div className="rounded-lg border bg-card">
                        {upcomingAppointments.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground">
                                No hay citas confirmadas próximas.
                            </div>
                        ) : (
                            <div className="divide-y">
                                {upcomingAppointments.map((apt) => (
                                    <div key={apt.id} className="flex items-center justify-between p-4 hover:bg-muted/50">
                                        <div className="flex items-center gap-4">
                                            <div className="text-center font-bold text-primary">
                                                {formatDate(apt.startTime)}
                                            </div>
                                            <div>
                                                <p className="font-medium">{apt.client?.fullName || 'Cliente'}</p>
                                                <p className="text-xs text-muted-foreground">{apt.serviceType}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button size="icon" variant="ghost" className="text-green-600" onClick={() => handleComplete(apt.id)} disabled={apt.status !== 'CONFIRMED'} title={apt.status === 'COMPLETED' ? "Completada" : "Marcar como completada"}>
                                                <CheckCircle className="h-5 w-5" />
                                            </Button>
                                            <Button size="icon" variant="ghost">
                                                <ArrowRight className="h-5 w-5" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Solicitudes Pendientes */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold">Solicitudes Pendientes</h2>
                        <Button variant="link" size="sm">Ver historial</Button>
                    </div>
                    <div className="space-y-3">
                        {pendingAppointments.length === 0 ? (
                            <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                                No hay solicitudes pendientes.
                            </div>
                        ) : (
                            pendingAppointments.map((apt) => (
                                <div key={apt.id} className="rounded-lg border bg-card p-4 shadow-sm">
                                    <div className="mb-2 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-medium">{apt.client?.fullName}</span>
                                        </div>
                                        <span className="text-xs text-muted-foreground">
                                            {format(new Date(apt.startTime), "d MMM, HH:mm", { locale: es })}
                                        </span>
                                    </div>
                                    <p className="mb-4 text-sm text-muted-foreground">{apt.serviceType}</p>
                                    <div className="flex gap-2">
                                        <Button className="h-8 flex-1" size="sm" onClick={() => handleConfirm(apt.id)}>Confirmar</Button>
                                        <Button className="h-8 flex-1" variant="outline" size="sm">Rechazar</Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
