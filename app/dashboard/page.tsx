'use client';

import AdminLayout from '@/components/layout/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FolderTree, FileText, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
    const { user } = useAuth();

    const stats = [
        {
            title: 'Total Users',
            value: '1,234',
            change: '+12.5%',
            icon: Users,
            color: 'text-blue-500',
        },
        {
            title: 'Categories',
            value: '89',
            change: '+5.2%',
            icon: FolderTree,
            color: 'text-green-500',
        },
        {
            title: 'Active Forms',
            value: '42',
            change: '+8.1%',
            icon: FileText,
            color: 'text-purple-500',
        },
        {
            title: 'Total Requests',
            value: '5,678',
            change: '+23.4%',
            icon: TrendingUp,
            color: 'text-orange-500',
        },
    ];

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Welcome back, {user?.firstName}!</h1>
                    <p className="text-muted-foreground">
                        Here's what's happening with your platform today.
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <Card key={stat.title}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                                    <Icon className={`h-4 w-4 ${stat.color}`} />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stat.value}</div>
                                    <p className="text-xs text-muted-foreground">
                                        <span className="text-green-600">{stat.change}</span> from last month
                                    </p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                            <CardDescription>Latest actions in your system</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium">New user registered</p>
                                        <p className="text-sm text-muted-foreground">2 minutes ago</p>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium">Form submitted</p>
                                        <p className="text-sm text-muted-foreground">10 minutes ago</p>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium">Category updated</p>
                                        <p className="text-sm text-muted-foreground">1 hour ago</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                            <CardDescription>Common administrative tasks</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-2">
                            <button className="text-left p-3 rounded-lg border hover:bg-muted transition-colors">
                                <p className="font-medium">Create New Category</p>
                                <p className="text-sm text-muted-foreground">Add a new category to the system</p>
                            </button>
                            <button className="text-left p-3 rounded-lg border hover:bg-muted transition-colors">
                                <p className="font-medium">Manage Users</p>
                                <p className="text-sm text-muted-foreground">View and edit user accounts</p>
                            </button>
                            <button className="text-left p-3 rounded-lg border hover:bg-muted transition-colors">
                                <p className="font-medium">View Reports</p>
                                <p className="text-sm text-muted-foreground">Access system analytics</p>
                            </button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
}
