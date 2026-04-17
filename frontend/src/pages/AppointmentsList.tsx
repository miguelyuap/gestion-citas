import { useEffect, useState } from "react"
import { Button } from "@/components/common/Button"
import { Calendar, Clock, AlertCircle, Loader2 } from "lucide-react"
import { appointmentService } from "@/services/appointmentService"
import type { Appointment } from "@/services/appointmentService"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export default function AppointmentsList() {
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'COMPLETED' | 'CANCELLED'>('ALL')
    
    // Modal State
    const [cancelModalOpen, setCancelModalOpen] = useState(false)
    const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null)
    const [cancelLoading, setCancelLoading] = useState(false)

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
        fetchAppointments()
    }, [])

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString)
            return format(date, "EEEE, d 'de' MMMM, HH:mm", { locale: es })
        } catch (e) {
            return dateString
        }
    }

    const openCancelModal = (id: string) => {
        setSelectedAppointmentId(id)
        setCancelModalOpen(true)
    }

    const confirmCancel = async () => {
        if (!selectedAppointmentId) return
        setCancelLoading(true)
        try {
            await new Promise(resolve => setTimeout(resolve, 800))
            setAppointments(prev => prev.map(apt => 
                apt.id === selectedAppointmentId ? { ...apt, status: 'CANCELLED' } : apt
            ))
        } catch (err) {
            console.error("Error al cancelar cita", err)
        } finally {
            setCancelLoading(false)
            setCancelModalOpen(false)
            setSelectedAppointmentId(null)
        }
    }

    const filteredAppointments = appointments.filter(apt => 
        filter === 'ALL' ? true : apt.status === filter
    )

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Mis Citas</h1>
                    <p className="text-slate-500 mt-1">Gestiona todo el historial de tus atenciones.</p>
                </div>
                
                {/* Status Filter */}
                <div className="flex bg-white rounded-lg p-1 border shadow-sm">
                    {['ALL', 'PENDING', 'COMPLETED', 'CANCELLED'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status as any)}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                                filter === status 
                                ? 'bg-slate-100 text-slate-900' 
                                : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            {status === 'ALL' ? 'Todas' : 
                             status === 'PENDING' ? 'Pendientes' : 
                             status === 'COMPLETED' ? 'Completadas' : 'Canceladas'}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="flex h-32 items-center justify-center rounded-lg border bg-card">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : error ? (
                <div className="flex h-32 items-center justify-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 text-destructive">
                    <AlertCircle className="h-5 w-5" />
                    <p>{error}</p>
                </div>
            ) : filteredAppointments.length === 0 ? (
                <div className="flex h-48 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white text-muted-foreground">
                    <p>No tienes citas con este filtro.</p>
                </div>
            ) : (
                <div className="rounded-xl border bg-white shadow-[0_4px_20px_rgba(0,0,0,0.04)] overflow-hidden">
                    <div className="divide-y divide-slate-100">
                        {filteredAppointments.map((apt) => (
                            <div key={apt.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 hover:bg-slate-50 transition-colors">
                                <div className="flex items-start sm:items-center gap-4">
                                    <div className="bg-emerald-50 p-3 rounded-full flex-shrink-0">
                                        <Calendar className="w-5 h-5 text-emerald-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-900">{apt.serviceType}</h3>
                                        <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-slate-500">
                                            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {formatDate(apt.startTime)}</span>
                                            <span className="hidden sm:inline-block">•</span>
                                            <span className="flex items-center gap-1">{apt.provider?.businessName || 'Consultorio Principal'}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="mt-4 sm:mt-0 flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                                    <div className="flex items-center">
                                        {apt.status === 'PENDING' && <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-1 rounded-full">Pendiente</span>}
                                        {apt.status === 'CONFIRMED' && <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-1 rounded-full">Confirmada</span>}
                                        {apt.status === 'COMPLETED' && <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full">Completada</span>}
                                        {apt.status === 'CANCELLED' && <span className="bg-slate-100 text-slate-600 text-xs font-medium px-2.5 py-1 rounded-full">Cancelada</span>}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {apt.status !== 'CANCELLED' && apt.status !== 'COMPLETED' && (
                                            <Button variant="outline" size="sm" onClick={() => openCancelModal(apt.id)} className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 shadow-none">
                                                Cancelar
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Cancel Confirmation Modal */}
            {cancelModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 fade-in">
                        <div className="p-6">
                            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4 text-red-500">
                                <AlertCircle className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Cancelar Cita</h3>
                            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                                ¿Estás seguro que deseas cancelar esta cita? Esta acción liberará el espacio en el calendario permanentemente.
                            </p>
                            <div className="flex gap-3 justify-end">
                                <Button variant="outline" className="shadow-none border-slate-200" onClick={() => setCancelModalOpen(false)} disabled={cancelLoading}>
                                    Volver
                                </Button>
                                <Button className="bg-red-500 hover:bg-red-600 text-white shadow-none" onClick={confirmCancel} disabled={cancelLoading}>
                                    {cancelLoading ? 'Cancelando...' : 'Sí, cancelar'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
