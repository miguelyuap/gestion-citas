import React, { useState, useEffect } from "react"
import { useAuthStore } from "@/store/useAuthStore"
import { Button } from "@/components/common/Button"
import { User, Shield, Bot, Save, Loader2, AlertCircle, CheckCircle2 } from "lucide-react"
import axios from 'axios'

export default function Settings() {
    const { user, setAuth } = useAuthStore()
    const [activeTab, setActiveTab] = useState<'profile' | 'ai' | 'security'>('profile')
    
    const [loading, setLoading] = useState(false)
    const [successMsg, setSuccessMsg] = useState('')
    const [errorMsg, setErrorMsg] = useState('')

    // Profile state
    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')

    // AI state
    const [triageEnabled, setTriageEnabled] = useState(true)
    const [specialInstructions, setSpecialInstructions] = useState('')

    // Security state
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    useEffect(() => {
        if (user) {
            setFullName(user.fullName || '')
            setEmail(user.email || '')
            // @ts-ignore
            setTriageEnabled(user.triageEnabled ?? true)
            // @ts-ignore
            setSpecialInstructions(user.specialInstructions || '')
        }
    }, [user])

    const handleSaveSettings = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        setLoading(true)
        setErrorMsg('')
        setSuccessMsg('')
        
        try {
            const token = localStorage.getItem('token')
            const res = await axios.patch('http://localhost:8000/api/users/settings', {
                fullName,
                email,
                triageEnabled,
                specialInstructions
            }, {
                headers: { Authorization: `Bearer ${token}` }
            })
            
            if (res.data.success) {
                setAuth(res.data.data, token!)
                setSuccessMsg('Configuración guardada correctamente.')
            }
        } catch (error: any) {
            setErrorMsg(error.response?.data?.message || 'Error al guardar la configuración')
        } finally {
            setLoading(false)
        }
    }

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setErrorMsg('')
        setSuccessMsg('')
        
        if (newPassword !== confirmPassword) {
            setErrorMsg('Las credenciales nuevas no coinciden')
            setLoading(false)
            return
        }

        try {
            const token = localStorage.getItem('token')
            const res = await axios.post('http://localhost:8000/api/users/change-password', {
                currentPassword,
                newPassword,
                confirmPassword
            }, {
                headers: { Authorization: `Bearer ${token}` }
            })
            
            if (res.data.success) {
                setSuccessMsg('Contraseña actualizada correctamente.')
                setCurrentPassword('')
                setNewPassword('')
                setConfirmPassword('')
            }
        } catch (error: any) {
            setErrorMsg(error.response?.data?.message || 'Error al cambiar la contraseña')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-4xl space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Configuración</h1>
                <p className="text-sm text-slate-500 mt-1">Gestiona tu perfil, preferencias de atención y seguridad.</p>
            </div>

            {successMsg && (
                <div className="bg-emerald-50 text-emerald-800 border-l-4 border-emerald-500 p-4 rounded-r-lg flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <p className="text-sm font-medium">{successMsg}</p>
                </div>
            )}
            
            {errorMsg && (
                <div className="bg-red-50 text-red-800 border-l-4 border-red-500 p-4 rounded-r-lg flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <p className="text-sm font-medium">{errorMsg}</p>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="flex flex-col sm:flex-row border-b border-slate-100 bg-slate-50">
                    <button 
                        onClick={() => setActiveTab('profile')}
                        className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors border-b-2 ${activeTab === 'profile' ? 'border-primary text-primary bg-white' : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}
                    >
                        <User className="w-4 h-4" /> Perfil
                    </button>
                    <button 
                        onClick={() => setActiveTab('ai')}
                        className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors border-b-2 ${activeTab === 'ai' ? 'border-primary text-primary bg-white' : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}
                    >
                        <Bot className="w-4 h-4" /> Preferencias de IA
                    </button>
                    <button 
                        onClick={() => setActiveTab('security')}
                        className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors border-b-2 ${activeTab === 'security' ? 'border-primary text-primary bg-white' : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}
                    >
                        <Shield className="w-4 h-4" /> Seguridad
                    </button>
                </div>

                <div className="p-6 sm:p-8">
                    {activeTab === 'profile' && (
                        <form onSubmit={handleSaveSettings} className="space-y-6 max-w-xl animate-in fade-in">
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700">Nombre Completo</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700">Correo Electrónico</label>
                                    <input 
                                        type="email" 
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                                    />
                                </div>
                            </div>
                            <Button type="submit" disabled={loading} className="w-full sm:w-auto flex items-center justify-center gap-2">
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Guardar Cambios
                            </Button>
                        </form>
                    )}

                    {activeTab === 'ai' && (
                        <form onSubmit={handleSaveSettings} className="space-y-6 max-w-xl animate-in fade-in">
                            <div className="space-y-6">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                                    <div className="space-y-0.5">
                                        <h3 className="text-base font-semibold text-slate-900">Asistente de Triaje IA</h3>
                                        <p className="text-sm text-slate-500">Permitir a la IA recomendar requisitos previos cuando solicites una cita.</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            className="sr-only peer"
                                            checked={triageEnabled}
                                            onChange={(e) => setTriageEnabled(e.target.checked)}
                                        />
                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                    </label>
                                </div>
                                
                                <div className="space-y-2">
                                    <h3 className="text-base font-semibold text-slate-900">Instrucciones Especiales</h3>
                                    <p className="text-sm text-slate-500">Estas instrucciones siempre se pasarán a la IA y aparecerán en los detalles de tu cita (ej. alergias, movilidad reducida, siempre recordar traer orden médica).</p>
                                    <textarea 
                                        rows={4}
                                        value={specialInstructions}
                                        onChange={(e) => setSpecialInstructions(e.target.value)}
                                        placeholder="Ej: Uso silla de ruedas, soy alérgico a la penicilina..."
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
                                    />
                                </div>
                            </div>
                            <Button type="submit" disabled={loading} className="w-full sm:w-auto flex items-center justify-center gap-2">
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Actualizar Preferencias
                            </Button>
                        </form>
                    )}

                    {activeTab === 'security' && (
                        <form onSubmit={handleChangePassword} className="space-y-6 max-w-xl animate-in fade-in">
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700">Contraseña Actual</label>
                                    <input 
                                        type="password" 
                                        required
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700">Nueva Contraseña</label>
                                    <input 
                                        type="password" 
                                        required
                                        minLength={6}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700">Confirmar Nueva Contraseña</label>
                                    <input 
                                        type="password" 
                                        required
                                        minLength={6}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                                    />
                                </div>
                            </div>
                            <Button type="submit" variant="destructive" disabled={loading} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 border-none hover:bg-slate-800 text-white shadow-sm">
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                                Cambiar Contraseña
                            </Button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}
