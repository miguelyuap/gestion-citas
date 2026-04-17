import React, { useState } from "react"
import { Outlet, Link, useLocation } from "react-router-dom"
import { Button } from "@/components/common/Button"
import { cn } from "@/lib/utils"
import {
    LayoutDashboard,
    Calendar,
    Users,
    Settings,
    LogOut,
    Menu,
    X,
    Plus,
    Clock
} from "lucide-react"
import { useAuthStore } from "@/store/useAuthStore"

interface SidebarItemProps {
    icon: React.ElementType
    label: string
    href: string
    isActive?: boolean
    onClick?: () => void
}

function SidebarItem({ icon: Icon, label, href, isActive, onClick }: SidebarItemProps) {
    return (
        <Link
            to={href}
            onClick={onClick}
            className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-slate-800 hover:text-white",
                isActive ? "bg-slate-800 text-white" : "text-slate-400"
            )}
        >
            <Icon className="h-4 w-4" />
            {label}
        </Link>
    )
}

export default function DashboardLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const location = useLocation()
    const { user, logout } = useAuthStore()

    const isProvider = user?.role === "PROVIDER";

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)

    return (
        <div className="flex min-h-screen flex-col md:flex-row">
            {/* Mobile Header */}
            <header className="flex h-14 items-center gap-4 border-b bg-background px-4 md:hidden">
                <Button variant="ghost" size="icon" onClick={toggleSidebar}>
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle Sidebar</span>
                </Button>
                <div className="font-semibold">Gestión Citas</div>
            </header>

            {/* Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 w-64 bg-black border-r-2 border-emerald-400 transition-transform md:static md:translate-x-0 text-slate-200",
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex h-14 items-center border-b border-slate-800 px-4 font-semibold text-white">
                    <Calendar className="mr-2 h-6 w-6 text-emerald-400" />
                    <span>Gestión Citas</span>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="ml-auto md:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <div className="flex flex-1 flex-col justify-between py-4">
                    <nav className="space-y-1 px-2">
                        <SidebarItem
                            icon={LayoutDashboard}
                            label="Dashboard"
                            href="/dashboard"
                            isActive={location.pathname === "/dashboard" || location.pathname === "/dashboard/provider"}
                            onClick={() => setIsSidebarOpen(false)}
                        />
                        <SidebarItem
                            icon={Calendar}
                            label={isProvider ? "Agenda" : "Mis Citas"}
                            href="/dashboard/appointments"
                            isActive={location.pathname.startsWith("/dashboard/appointments")}
                            onClick={() => setIsSidebarOpen(false)}
                        />
                        {isProvider && (
                            <SidebarItem
                                icon={Clock}
                                label="Horarios"
                                href="/dashboard/schedule"
                                isActive={location.pathname.startsWith("/dashboard/schedule")}
                                onClick={() => setIsSidebarOpen(false)}
                            />
                        )}
                        {isProvider && (
                            <SidebarItem
                                icon={Users}
                                label="Clientes"
                                href="/dashboard/clients"
                                isActive={location.pathname.startsWith("/dashboard/clients")}
                                onClick={() => setIsSidebarOpen(false)}
                            />
                        )}
                        <SidebarItem
                            icon={Settings}
                            label="Configuración"
                            href="/dashboard/settings"
                            isActive={location.pathname.startsWith("/dashboard/settings")}
                            onClick={() => setIsSidebarOpen(false)}
                        />
                    </nav>

                    <div className="px-2">
                        <div className="mb-4 px-2">
                            {!isProvider ? (
                                <Link to="/dashboard/new-appointment">
                                    <Button className="w-full justify-start" size="sm">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Nueva Cita
                                    </Button>
                                </Link>
                            ) : (
                                <Link to="/dashboard/schedule">
                                    <Button className="w-full justify-start" variant="outline" size="sm">
                                        <Clock className="mr-2 h-4 w-4" />
                                        Gestionar Horarios
                                    </Button>
                                </Link>
                            )}
                        </div>
                        <div className="border-t pt-4">
                            <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-destructive" onClick={logout}>
                                <LogOut className="mr-2 h-4 w-4" />
                                Cerrar Sesión
                            </Button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 bg-[#F8FAFC] p-[3rem] overflow-y-auto">
                <Outlet />
            </main>
        </div>
    )
}
