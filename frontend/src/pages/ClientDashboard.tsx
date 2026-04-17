import { useEffect, useState } from "react"
import { Calendar, Clock, MapPin, ArrowRight, Loader2, AlertCircle } from "lucide-react"
import { appointmentService } from "@/services/appointmentService"
import type { Appointment } from "@/services/appointmentService"
import { useAuthStore } from "@/store/useAuthStore"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Link } from "react-router-dom"
import { Button } from "@/components/common/Button"

export default function ClientDashboard() {
    const { user } = useAuthStore()
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    
    // Stats State
    const [dashboardStats, setDashboardStats] = useState({
        metrics: { upcoming: 0, completed: 0, locations: 0 },
        chartData: [] as {month: string, citas: number}[]
    })

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                setLoading(true)
                const data = await appointmentService.getMyAppointments()
                setAppointments(data)
            } catch (err: any) {
                console.error("Error fetching appointments:", err)
                setError("No se pudieron cargar tus citas.")
            } finally {
                setLoading(false)
            }
        }

        const fetchStats = async () => {
            try {
                const res = await fetch("http://localhost:8000/dashboard-stats")
                if (res.ok) {
                    const data = await res.json()
                    setDashboardStats(data)
                    return
                }
            } catch (e) {
                console.info("FastAPI backend no detectado en el puerto 8000. Utilizando diccionario de simulación local.")
            }
            
            setDashboardStats({
                metrics: { upcoming: 12, completed: 45, locations: 2 },
                chartData: [
                    { month: "Ene", citas: 15 },
                    { month: "Feb", citas: 28 },
                    { month: "Mar", citas: 34 },
                    { month: "Abr", citas: 42 },
                    { month: "May", citas: 25 },
                    { month: "Jun", citas: 50 },
                    { month: "Jul", citas: 48 }
                ]
            })
        }

        fetchAppointments()
        fetchStats()
    }, [])

    const upcomingAppointments = appointments
        .filter(apt => apt.status !== 'CANCELLED' && apt.status !== 'COMPLETED')
        .slice(0, 3)

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString)
            return format(date, "EEEE, d 'de' MMMM, HH:mm", { locale: es })
        } catch (e) {
            return dateString
        }
    }

    if (!user) return null

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Hola, {user.fullName || 'Usuario'}</h1>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Último acceso: Hoy 08:30</span>
                </div>
            </div>

            {/* Stats / Quick Overview */}
            <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-xl border bg-card p-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="rounded-full bg-primary/10 p-2">
                            <Calendar className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Próximas Citas</p>
                            <h3 className="text-2xl font-bold">{dashboardStats.metrics.upcoming}</h3>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border bg-card p-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="rounded-full bg-green-500/10 p-2">
                            <Clock className="h-6 w-6 text-green-500" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Citas Completadas</p>
                            <h3 className="text-2xl font-bold">{dashboardStats.metrics.completed}</h3>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border bg-card p-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="rounded-full bg-blue-500/10 p-2">
                            <MapPin className="h-6 w-6 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Localidades</p>
                            <h3 className="text-2xl font-bold">{dashboardStats.metrics.locations}</h3>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col xl:flex-row gap-6">
                {/* Bar Chart Section */}
                <div className="flex-1 rounded-xl border bg-card p-6 shadow-sm">
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-slate-800">Citas por Mes</h3>
                        <p className="text-sm text-slate-500">Histórico de atenciones programadas</p>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={dashboardStats.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} />
                                <Tooltip 
                                    cursor={{fill: '#F1F5F9'}}
                                    contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="citas" fill="#0F172A" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Upcoming Appointments Section */}
                <div className="xl:w-[350px] shrink-0 rounded-xl border bg-card p-6 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-semibold text-slate-800">Próximas</h3>
                            <p className="text-sm text-slate-500">Últimas 3 programadas</p>
                        </div>
                    </div>

                    <div className="flex-1">
                        {loading ? (
                            <div className="flex h-32 items-center justify-center">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : error ? (
                            <div className="flex h-32 items-center justify-center gap-2 text-destructive bg-destructive/10 rounded-lg">
                                <AlertCircle className="h-5 w-5" />
                                <p>{error}</p>
                            </div>
                        ) : upcomingAppointments.length === 0 ? (
                            <div className="flex h-32 flex-col items-center justify-center rounded-lg border border-dashed text-muted-foreground p-4 text-center">
                                <p>No tienes citas programadas.</p>
                                <Link to="/dashboard/new-appointment">
                                    <Button variant="link" className="mt-2 text-primary">Agendar una cita</Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {upcomingAppointments.map((apt) => (
                                    <div key={apt.id} className="flex flex-col border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                                        <h4 className="font-semibold text-slate-900 text-sm line-clamp-1">{apt.serviceType}</h4>
                                        <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                                            <div className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded">
                                                <Calendar className="w-3.5 h-3.5 text-slate-600" />
                                                <span>{formatDate(apt.startTime).split(',')[0]}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    <div className="pt-4 mt-auto">
                        <Link to="/dashboard/appointments">
                            <Button variant="outline" className="w-full text-slate-700 bg-slate-50 hover:bg-slate-100 border-slate-200">
                                Ver todas <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
