'use client';

import { useEffect, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
    Home,
    Users,
    FolderTree,
    FileText,
    Database,
    MapPin,
    Image,
    Inbox,
    Bell,
    Settings,
    LogOut,
    Menu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface AdminLayoutProps {
    children: ReactNode;
}

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Users', href: '/users', icon: Users },
    { name: 'Categories', href: '/categories', icon: FolderTree },
    { name: 'Forms', href: '/forms', icon: FileText },
    { name: 'Reference Data', href: '/reference-data', icon: Database },
    { name: 'Locations', href: '/locations', icon: MapPin },
    { name: 'Media', href: '/media', icon: Image },
    { name: 'Requests', href: '/requests', icon: Inbox },
    { name: 'Notifications', href: '/notifications', icon: Bell },
    { name: 'Settings', href: '/settings', icon: Settings },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
    const { user, logout, loading, isAuthenticated } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push('/auth/login');
        } else if (!loading && isAuthenticated && user) {
            // Check if user has required roles (ADMIN or MODERATOR)
            const hasRequiredRole = user.roles?.some(
                role => role === 'ADMIN' || role === 'MODERATOR'
            );

            if (!hasRequiredRole) {
                logout();
            }
        }
    }, [loading, isAuthenticated, user, router, logout]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    const getUserInitials = () => {
        if (!user?.name) return 'AD';
        const parts = user.name.split(' ');
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
        }
        return user.name.substring(0, 2).toUpperCase();
    };

    const Sidebar = () => (
        <div className="flex flex-col h-full">
            <div className="p-6">
                <h1 className="text-2xl font-bold">LookForX</h1>
                <p className="text-sm text-muted-foreground">Admin Panel</p>
            </div>

            <nav className="flex-1 px-4 space-y-1">
                {navigation.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                                ? 'bg-primary text-primary-foreground'
                                : 'hover:bg-muted'
                                }`}
                        >
                            <Icon className="h-5 w-5" />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t">
                <div className="flex items-center gap-3 px-3 py-2">
                    <Avatar>
                        <AvatarImage src={user?.thumbnailUrl || user?.imageUrl || user?.profileImageUrl} />
                        <AvatarFallback>{getUserInitials()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                            {user?.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Settings className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => router.push('/settings')}>
                                <Settings className="mr-2 h-4 w-4" />
                                Settings
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={logout}>
                                <LogOut className="mr-2 h-4 w-4" />
                                Logout
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-background">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex md:w-64 md:flex-col border-r">
                <Sidebar />
            </aside>

            {/* Mobile Sidebar */}
            <Sheet>
                <SheetTrigger asChild className="md:hidden fixed top-4 left-4 z-50">
                    <Button variant="outline" size="icon">
                        <Menu className="h-5 w-5" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0">
                    <Sidebar />
                </SheetContent>
            </Sheet>

            {/* Main Content */}
            <main className="flex-1 overflow-auto flex flex-col">
                {/* Header */}
                <header className="border-b bg-background sticky top-0 z-40">
                    <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <h2 className="text-lg font-semibold">
                                {navigation.find(item => item.href === pathname)?.name || 'LookForX Admin'}
                            </h2>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Profile Dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-10 gap-2">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={user?.thumbnailUrl || user?.imageUrl || user?.profileImageUrl} />
                                            <AvatarFallback>{getUserInitials()}</AvatarFallback>
                                        </Avatar>
                                        <div className="hidden md:flex flex-col items-start">
                                            <span className="text-sm font-medium">
                                                {user?.name}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {user?.email}
                                            </span>
                                        </div>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuLabel>
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium leading-none">
                                                {user?.name}
                                            </p>
                                            <p className="text-xs leading-none text-muted-foreground">
                                                {user?.email}
                                            </p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => router.push('/settings')}>
                                        <Settings className="mr-2 h-4 w-4" />
                                        Settings
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={logout} className="text-red-600">
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Logout
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 overflow-auto">
                    <div className="container mx-auto p-6">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
