import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Trash2, Edit, Save, X, FileText, Users, AlertTriangle, Search, ChevronDown, Folder, File, ArrowRight, ShieldCheck, Activity, CreditCard, BarChart2, Bell, Settings, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AdminTickets } from '../components/admin/AdminTickets';

interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    createdAt: string;
    fileLimit: number;
    messageLimit: number;
    filesCount: number;
    messagesCount: number;
    _count: {
        subjects: number;
        chatSessions: number;
    };
}

interface Resource {
    id: string;
    title: string;
    type: string;
    size: string;
    date: string;
    subjectName: string;
}

export const AdminDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'users' | 'tickets'>('users');
    const [editingUser, setEditingUser] = useState<string | null>(null);
    const [editLimits, setEditLimits] = useState({ fileLimit: 10, messageLimit: 50 });
    
    // User Details Modal State
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [userResources, setUserResources] = useState<Resource[]>([]);
    const [loadingResources, setLoadingResources] = useState(false);

    useEffect(() => {
        const checkAdmin = async () => {
            if (!user) return; 
            
            if (user.role === 'ADMIN') {
                fetchData();
                return;
            }

            try {
                const res = await api.get('/auth/me');
                if (res.data.role === 'ADMIN') {
                    fetchData();
                    return;
                }
            } catch (e) {
                console.error("Double check failed", e);
            }

            navigate('/app');
        };

        checkAdmin();
    }, [user]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/users');
            setUsers(res.data);
        } catch (error) {
            console.error("Failed to fetch admin data", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserResources = async (userId: string) => {
        setLoadingResources(true);
        try {
            const res = await api.get(`/admin/users/${userId}/resources`);
            setUserResources(res.data);
        } catch (error) {
            console.error("Failed to fetch user resources", error);
        } finally {
            setLoadingResources(false);
        }
    };

    const handleUserClick = (user: User) => {
        setSelectedUser(user);
        fetchUserResources(user.id);
    };

    const handleDeleteUser = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('هل أنت متأكد من حذف هذا المستخدم؟ لا يمكن التراجع عن هذا الإجراء.')) return;
        try {
            await api.delete(`/admin/users/${id}`);
            setUsers(users.filter(u => u.id !== id));
            if (selectedUser?.id === id) setSelectedUser(null);
        } catch (error) {
            alert('فشل حذف المستخدم');
        }
    };

    const handleDeleteResource = async (id: string) => {
        if (!confirm('هل أنت متأكد من حذف هذا الملف؟')) return;
        try {
            await api.delete(`/resources/${id}`);
            setUserResources(userResources.filter(r => r.id !== id));
        } catch (error) {
            alert('فشل حذف الملف');
        }
    };

    const startEditUser = (user: User, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingUser(user.id);
        setEditLimits({ fileLimit: user.fileLimit, messageLimit: user.messageLimit });
    };

    const saveUserLimits = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await api.put(`/admin/users/${id}/limits`, editLimits);
            setUsers(users.map(u => u.id === id ? { ...u, ...editLimits } : u));
            setEditingUser(null);
        } catch (error) {
            alert('فشل تحديث الحدود');
        }
    };

    return (
        <div className="flex h-screen bg-[#FFF8E7] font-hand text-stone-800" dir="rtl">
            {/* Sidebar */}
            <div className="w-64 bg-white border-l border-stone-200 shadow-sm flex-shrink-0 flex flex-col">
                <div className="p-6 border-b border-stone-100 flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                        <ShieldCheck className="text-amber-600" size={24} />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg leading-tight">لوحة التحكم</h1>
                        <p className="text-xs text-stone-400 font-sans">v1.0.0</p>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    <div className="text-xs font-bold text-stone-400 px-3 mb-2 font-sans">القائمة الرئيسية</div>
                    
                    <button 
                        onClick={() => setActiveTab('users')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'users' ? 'bg-amber-50 text-amber-700 font-bold shadow-sm' : 'text-stone-500 hover:bg-stone-50 hover:text-stone-700'}`}
                    >
                        <Users size={20} />
                        المستخدمين
                    </button>

                    <button 
                        onClick={() => setActiveTab('tickets')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'tickets' ? 'bg-amber-50 text-amber-700 font-bold shadow-sm' : 'text-stone-500 hover:bg-stone-50 hover:text-stone-700'}`}
                    >
                        <MessageSquare size={20} />
                        تذاكر الدعم
                    </button>
                    
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-stone-500 hover:bg-stone-50 transition-all opacity-50 cursor-not-allowed" title="قريباً">
                        <Activity size={20} />
                        مراقبة الذكاء الاصطناعي
                    </button>

                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-stone-500 hover:bg-stone-50 transition-all opacity-50 cursor-not-allowed" title="قريباً">
                        <CreditCard size={20} />
                        الاشتراكات
                    </button>

                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-stone-500 hover:bg-stone-50 transition-all opacity-50 cursor-not-allowed" title="قريباً">
                        <BarChart2 size={20} />
                        الإحصائيات
                    </button>

                    <div className="text-xs font-bold text-stone-400 px-3 mt-6 mb-2 font-sans">النظام</div>

                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-stone-500 hover:bg-stone-50 transition-all opacity-50 cursor-not-allowed" title="قريباً">
                        <Bell size={20} />
                        الإشعارات العامة
                    </button>
                    
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-stone-500 hover:bg-stone-50 transition-all opacity-50 cursor-not-allowed" title="قريباً">
                        <Settings size={20} />
                        الإعدادات
                    </button>
                </nav>

                <div className="p-4 border-t border-stone-100">
                    <button 
                        onClick={() => navigate('/app')}
                        className="w-full flex items-center justify-center gap-2 bg-stone-800 text-[#FFF8E7] px-4 py-3 rounded-xl hover:bg-stone-700 transition shadow-sm font-bold"
                    >
                        <ArrowRight size={18} />
                        العودة للتطبيق
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {activeTab === 'users' ? (
                    <>
                        {/* Top Header */}
                        <header className="bg-white border-b border-stone-200 px-8 py-4 flex justify-between items-center shadow-sm z-10">
                            <h2 className="text-2xl font-bold text-stone-800">المستخدمين المسجلين</h2>
                            <div className="flex items-center gap-4">
                                <div className="bg-stone-100 px-4 py-2 rounded-lg flex items-center gap-2 text-stone-500 border border-stone-200">
                                    <Search size={18} />
                                    <input 
                                        type="text" 
                                        placeholder="بحث عن مستخدم..." 
                                        className="bg-transparent border-none outline-none text-sm font-sans w-64"
                                    />
                                </div>
                                <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    <span className="text-sm font-bold text-amber-800">{users.length} مستخدم نشط</span>
                                </div>
                            </div>
                        </header>

                        {/* Content Scrollable Area */}
                        <main className="flex-1 overflow-y-auto p-8">
                            <div className="max-w-6xl mx-auto">
                                {loading ? (
                                    <div className="flex flex-col items-center justify-center h-96 text-stone-400">
                                        <div className="w-12 h-12 border-4 border-stone-200 border-t-amber-500 rounded-full animate-spin mb-4"></div>
                                        <p>جاري تحميل البيانات...</p>
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-right">
                                                <thead className="bg-stone-50 text-stone-600 font-bold text-sm border-b border-stone-100">
                                                    <tr>
                                                        <th className="p-5 w-1/3">المستخدم</th>
                                                        <th className="p-5">تاريخ التسجيل</th>
                                                        <th className="p-5 text-center">الملفات</th>
                                                        <th className="p-5 text-center">الرسائل</th>
                                                        <th className="p-5 text-left">إجراءات</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-stone-100">
                                                    {users.map(u => (
                                                        <tr 
                                                            key={u.id} 
                                                            onClick={() => handleUserClick(u)}
                                                            className={`cursor-pointer transition-colors group ${selectedUser?.id === u.id ? 'bg-amber-50' : 'hover:bg-stone-50'}`}
                                                        >
                                                            <td className="p-5">
                                                                <div className="flex items-center gap-3">
                                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-600' : 'bg-stone-100 text-stone-500'}`}>
                                                                        {u.name.charAt(0).toUpperCase()}
                                                                    </div>
                                                                    <div>
                                                                        <div className="font-bold text-stone-800 flex items-center gap-2">
                                                                            {u.name}
                                                                            {u.role === 'ADMIN' && <span className="text-[10px] bg-purple-600 text-white px-2 py-0.5 rounded-full font-sans shadow-sm">ADMIN</span>}
                                                                        </div>
                                                                        <div className="text-sm text-stone-400 font-sans">{u.email}</div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="p-5 text-stone-500 text-sm font-sans">
                                                                {new Date(u.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                                            </td>
                                                            <td className="p-5">
                                                                {editingUser === u.id ? (
                                                                    <div className="flex justify-center" onClick={e => e.stopPropagation()}>
                                                                        <input 
                                                                            type="number" 
                                                                            value={editLimits.fileLimit}
                                                                            onChange={e => setEditLimits({...editLimits, fileLimit: Number(e.target.value)})}
                                                                            className="w-20 border-2 border-amber-300 rounded-lg px-2 py-1 text-center font-sans focus:outline-none shadow-sm"
                                                                            autoFocus
                                                                        />
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex flex-col items-center">
                                                                        <span className="font-bold text-stone-700 font-sans text-sm mb-1">{u.filesCount} <span className="text-stone-300">/</span> {u.fileLimit}</span>
                                                                        <div className="w-24 h-2 bg-stone-100 rounded-full overflow-hidden">
                                                                            <div 
                                                                                className={`h-full rounded-full transition-all duration-500 ${u.filesCount >= u.fileLimit ? 'bg-red-400' : 'bg-green-400'}`} 
                                                                                style={{ width: `${Math.min((u.filesCount / u.fileLimit) * 100, 100)}%` }}
                                                                            ></div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </td>
                                                            <td className="p-5">
                                                                {editingUser === u.id ? (
                                                                    <div className="flex justify-center" onClick={e => e.stopPropagation()}>
                                                                        <input 
                                                                            type="number" 
                                                                            value={editLimits.messageLimit}
                                                                            onChange={e => setEditLimits({...editLimits, messageLimit: Number(e.target.value)})}
                                                                            className="w-24 border-2 border-amber-300 rounded-lg px-2 py-1 text-center font-sans focus:outline-none shadow-sm"
                                                                        />
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex flex-col items-center">
                                                                        <span className="font-bold text-stone-700 font-sans text-sm mb-1">{u.messagesCount} <span className="text-stone-300">/</span> {u.messageLimit}</span>
                                                                        <div className="w-24 h-2 bg-stone-100 rounded-full overflow-hidden">
                                                                            <div 
                                                                                className={`h-full rounded-full transition-all duration-500 ${u.messagesCount >= u.messageLimit ? 'bg-red-400' : 'bg-blue-400'}`} 
                                                                                style={{ width: `${Math.min((u.messagesCount / u.messageLimit) * 100, 100)}%` }}
                                                                            ></div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </td>
                                                            <td className="p-5">
                                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    {editingUser === u.id ? (
                                                                        <>
                                                                            <button onClick={(e) => saveUserLimits(u.id, e)} className="text-white bg-green-500 hover:bg-green-600 p-2 rounded-lg transition shadow-sm"><Save size={16} /></button>
                                                                            <button onClick={(e) => { e.stopPropagation(); setEditingUser(null); }} className="text-stone-500 bg-white border border-stone-200 hover:bg-stone-50 p-2 rounded-lg transition shadow-sm"><X size={16} /></button>
                                                                        </>
                                                                    ) : (
                                                                        <button onClick={(e) => startEditUser(u, e)} className="text-stone-500 bg-white border border-stone-200 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 p-2 rounded-lg transition shadow-sm" title="تعديل الحدود"><Edit size={16} /></button>
                                                                    )}
                                                                    {u.role !== 'ADMIN' && (
                                                                        <button onClick={(e) => handleDeleteUser(u.id, e)} className="text-stone-500 bg-white border border-stone-200 hover:text-red-600 hover:border-red-200 hover:bg-red-50 p-2 rounded-lg transition shadow-sm" title="حذف المستخدم"><Trash2 size={16} /></button>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </main>
                    </>
                ) : (
                    <main className="flex-1 overflow-y-auto bg-stone-50">
                        <AdminTickets />
                    </main>
                )}
            </div>

            {/* User Details Modal / Panel */}
            <AnimatePresence>
                {selectedUser && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-center justify-end"
                        onClick={() => setSelectedUser(null)}
                    >
                        <motion.div 
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="bg-white w-full max-w-xl h-full shadow-2xl overflow-hidden flex flex-col border-r border-stone-200"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-6 border-b border-stone-100 bg-stone-50 flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 font-bold text-2xl border-2 border-white shadow-sm">
                                        {selectedUser.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-stone-800">{selectedUser.name}</h2>
                                        <p className="text-sm text-stone-500 font-sans flex items-center gap-2">
                                            {selectedUser.email}
                                            <span className="w-1 h-1 bg-stone-300 rounded-full"></span>
                                            {selectedUser.role}
                                        </p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setSelectedUser(null)}
                                    className="p-2 hover:bg-stone-200 rounded-full transition text-stone-400"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto flex-1 bg-[#FFF8E7]/30">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="font-bold text-lg flex items-center gap-2 text-stone-700">
                                        <Folder className="text-amber-500" />
                                        ملفات المستخدم
                                    </h3>
                                    <span className="text-xs font-bold text-stone-500 bg-white px-3 py-1 rounded-full border border-stone-200 shadow-sm">
                                        {userResources.length} ملف
                                    </span>
                                </div>

                                {loadingResources ? (
                                    <div className="py-20 text-center text-stone-400 flex flex-col items-center">
                                        <div className="w-8 h-8 border-4 border-stone-200 border-t-amber-500 rounded-full animate-spin mb-4"></div>
                                        جاري تحميل الملفات...
                                    </div>
                                ) : userResources.length === 0 ? (
                                    <div className="py-20 text-center border-2 border-dashed border-stone-200 rounded-3xl bg-stone-50/50">
                                        <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <FileText className="text-stone-300" size={32} />
                                        </div>
                                        <p className="text-stone-500 font-bold">لا توجد ملفات</p>
                                        <p className="text-xs text-stone-400 mt-1">هذا المستخدم لم يقم برفع أي ملفات بعد</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {userResources.map(file => (
                                            <div key={file.id} className="bg-white p-4 rounded-2xl border border-stone-100 shadow-sm hover:shadow-md transition group flex items-center justify-between">
                                                <div className="flex items-center gap-4 overflow-hidden">
                                                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 flex-shrink-0">
                                                        <FileText size={24} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h4 className="font-bold text-stone-800 truncate text-sm">{file.title}</h4>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-[10px] font-sans bg-stone-100 text-stone-500 px-2 py-0.5 rounded-md border border-stone-200">
                                                                {file.size || 'Unknown'}
                                                            </span>
                                                            <span className="text-[10px] font-sans text-stone-400">
                                                                {new Date(file.date).toLocaleDateString('en-US')}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={() => handleDeleteResource(file.id)}
                                                    className="w-8 h-8 flex items-center justify-center text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                                                    title="حذف الملف وكل محتوياته"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            
                            <div className="p-4 bg-stone-50 border-t border-stone-200 text-center text-xs text-stone-400 font-sans">
                                User ID: {selectedUser.id}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
