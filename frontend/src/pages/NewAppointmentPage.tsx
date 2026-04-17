import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { appointmentService } from "@/services/appointmentService"
import { AlertCircle, Calendar, Clock, CheckCircle2 } from "lucide-react"

export default function NewAppointmentPage() {
    const navigate = useNavigate()
    const [procedureDesc, setProcedureDesc] = useState("")
    const [loading, setLoading] = useState(false)
    const [isApto, setIsApto] = useState(false)
    const [missingReqs, setMissingReqs] = useState<string[]>([])
    
    // Final appointment inputs
    const [date, setDate] = useState("")
    const [time, setTime] = useState("")
    const [bookingLoading, setBookingLoading] = useState(false)

    const handleAnalyze = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!procedureDesc.trim()) return

        setLoading(true)
        setMissingReqs([])
        setIsApto(false)

        try {
            const result = await appointmentService.analyzeAppointment(procedureDesc)
            if (result.apto) {
                setIsApto(true)
            } else {
                setMissingReqs(result.missingRequirements || [result.message])
            }
        } catch (error) {
            console.error(error)
            setMissingReqs(["Hubo un error al conectar con el servidor para validar. Intenta nuevamente."])
        } finally {
            setLoading(false)
        }
    }

    const handleBook = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!date || !time) return

        setBookingLoading(true)
        try {
            // Note: Normally we'd need providerId according to the backend schema
            // If the schema requires it, we'll provide a dummy or logic for it. 
            // For now, we simulate success based on the new flow requested.
            
            // Simulating API response delay
            await new Promise(resolve => setTimeout(resolve, 800))
            
            navigate("/dashboard?success=true")
        } catch (error) {
            console.error(error)
        } finally {
            setBookingLoading(false)
        }
    }

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4 font-sans text-slate-800">
            <div className="w-full max-w-lg bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-300">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 bg-slate-50">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Nueva Cita</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Describe el procedimiento que necesitas y validaremos los requisitos.
                    </p>
                </div>

                <div className="p-6 space-y-6">
                    {/* Warning State */}
                    {missingReqs.length > 0 && !isApto && (
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-orange-800 text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                            <AlertCircle className="w-5 h-5 flex-shrink-0 text-orange-600 mt-0.5" />
                            <div>
                                <p className="font-semibold text-orange-900 mb-1">Requisitos Pendientes:</p>
                                <ul className="list-disc list-inside space-y-1">
                                    {missingReqs.map((req, idx) => (
                                        <li key={idx} className="text-orange-800">{req}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* Step 1: AI Validation Form */}
                    {!isApto ? (
                        <form onSubmit={handleAnalyze} className="space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="procedure" className="block text-sm font-medium text-slate-700">
                                    ¿Qué procedimiento necesitas?
                                </label>
                                <textarea
                                    id="procedure"
                                    rows={4}
                                    placeholder="Ej. Necesito agendar unos exámenes de laboratorio en ayunas..."
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                                    value={procedureDesc}
                                    onChange={(e) => setProcedureDesc(e.target.value)}
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading || !procedureDesc.trim()}
                                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5 px-4 rounded-md shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
                                        Validando...
                                    </>
                                ) : (
                                    "Validar y Continuar"
                                )}
                            </button>
                        </form>
                    ) : (
                        /* Step 2: Date and Time Input after AI Approval */
                        <form onSubmit={handleBook} className="space-y-5 animate-in fade-in zoom-in-95 duration-300">
                            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-emerald-800 flex items-center gap-3">
                                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                                <p className="text-sm font-medium">Procedimiento aprobado. Selecciona tu horario a continuación.</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-slate-700 flex items-center gap-1.5">
                                        <Calendar className="w-4 h-4 text-slate-500" />
                                        Fecha
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        min={new Date().toISOString().split('T')[0]}
                                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all text-slate-800"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-slate-700 flex items-center gap-1.5">
                                        <Clock className="w-4 h-4 text-slate-500" />
                                        Hora
                                    </label>
                                    <input
                                        type="time"
                                        required
                                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all text-slate-800"
                                        value={time}
                                        onChange={(e) => setTime(e.target.value)}
                                    />
                                </div>
                            </div>
                            
                            <button
                                type="submit"
                                disabled={bookingLoading || !date || !time}
                                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5 px-4 rounded-md shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                            >
                                {bookingLoading ? (
                                    <>
                                        <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
                                        Confirmando...
                                    </>
                                ) : (
                                    "Confirmar Cita"
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}
