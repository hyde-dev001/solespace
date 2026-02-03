import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    BookOpen, Plus, Search, Filter, Edit2, Trash2, Users, 
    Clock, DollarSign, Award, CheckCircle, XCircle, Calendar,
    TrendingUp, BarChart3, Download, ArrowUp, ArrowDown
} from 'lucide-react';

interface TrainingProgram {
    id: number;
    title: string;
    description: string;
    category: string;
    delivery_method: string;
    duration_hours: number;
    cost: number;
    max_participants: number | null;
    prerequisites: string | null;
    learning_objectives: string | null;
    instructor_name: string | null;
    instructor_email: string | null;
    is_mandatory: boolean;
    is_active: boolean;
    issues_certificate: boolean;
    certificate_validity_months: number | null;
    enrollments_count: number;
    active_enrollments_count: number;
    completed_enrollments_count: number;
    created_at: string;
}

interface Statistics {
    total_programs: number;
    active_programs: number;
    mandatory_programs: number;
    total_enrollments: number;
    active_enrollments: number;
    completed_enrollments: number;
    completion_rate: number;
    total_certifications: number;
    active_certifications: number;
    expiring_soon: number;
    upcoming_sessions: number;
    by_category: Record<string, number>;
    by_delivery_method: Record<string, number>;
}

const categoryLabels: Record<string, string> = {
    technical: 'Technical',
    soft_skills: 'Soft Skills',
    compliance: 'Compliance',
    leadership: 'Leadership',
    safety: 'Safety',
    product: 'Product',
    other: 'Other',
};

const deliveryMethodLabels: Record<string, string> = {
    classroom: 'Classroom',
    online: 'Online',
    hybrid: 'Hybrid',
    workshop: 'Workshop',
    seminar: 'Seminar',
    self_paced: 'Self-Paced',
};

// Metric Card Component
const MetricCard = ({ title, value, change, changeType, icon: Icon, color, description }: {
  title: string;
  value: number;
  change: number;
  changeType: 'increase' | 'decrease';
  icon: React.FC<{ className?: string }>;
  color: 'success' | 'error' | 'warning' | 'info';
  description: string;
}) => {
  const getColorClasses = () => {
    switch (color) {
      case 'success': return 'from-green-500 to-emerald-600';
      case 'error': return 'from-red-500 to-rose-600';
      case 'warning': return 'from-yellow-500 to-orange-600';
      case 'info': return 'from-blue-500 to-indigo-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-500 hover:shadow-xl hover:border-gray-300 hover:-translate-y-1 dark:border-gray-800 dark:bg-white/[0.03] dark:hover:border-gray-700"
      tabIndex={0} aria-label={`${title}: ${value} (${description})`}>
      {/* Animated background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${getColorClasses()} opacity-0 transition-opacity duration-500 group-hover:opacity-5`} />

      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className={`flex items-center justify-center w-14 h-14 bg-gradient-to-br ${getColorClasses()} rounded-2xl shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-6`}>
            <Icon className="text-white size-7 drop-shadow-sm" />
          </div>

          <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-all duration-300 ${
            changeType === 'increase'
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
          }`}>
            {changeType === 'increase' ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
            {Math.abs(change)}%
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
            {value.toLocaleString()}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};

const Training: React.FC = () => {
    const [programs, setPrograms] = useState<TrainingProgram[]>([]);
    const [statistics, setStatistics] = useState<Statistics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [editingProgram, setEditingProgram] = useState<TrainingProgram | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'technical',
        delivery_method: 'online',
        duration_hours: '',
        cost: '',
        max_participants: '',
        prerequisites: '',
        learning_objectives: '',
        instructor_name: '',
        instructor_email: '',
        is_mandatory: false,
        is_active: true,
        issues_certificate: false,
        certificate_validity_months: '',
    });

    useEffect(() => {
        loadPrograms();
        loadStatistics();
    }, [searchTerm, categoryFilter, activeFilter]);

    const loadPrograms = async () => {
        try {
            setLoading(true);
            const params: any = {};
            if (searchTerm) params.search = searchTerm;
            if (categoryFilter) params.category = categoryFilter;
            if (activeFilter !== 'all') params.is_active = activeFilter === 'active' ? '1' : '0';

            const response = await axios.get('/api/hr/training/programs', { params });

            if (response.data.success) {
                setPrograms(response.data.programs);
            }
        } catch (err: any) {
            console.error('Error loading programs:', err);
            setError(err.response?.data?.message || 'Failed to load programs');
        } finally {
            setLoading(false);
        }
    };

    const loadStatistics = async () => {
        try {
            const response = await axios.get('/api/hr/training/statistics');

            if (response.data.success) {
                setStatistics(response.data.statistics);
            }
        } catch (err: any) {
            console.error('Error loading statistics:', err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = editingProgram
                ? await axios.put(`/api/hr/training/programs/${editingProgram.id}`, formData)
                : await axios.post('/api/hr/training/programs', formData);

            if (response.data.success) {
                setShowModal(false);
                resetForm();
                loadPrograms();
                loadStatistics();
            } else {
                setError(response.data.message || 'Failed to save program');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to save program');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this training program?')) {
            return;
        }

        try {
            const response = await axios.delete(`/api/hr/training/programs/${id}`);

            if (response.data.success) {
                loadPrograms();
                loadStatistics();
            } else {
                alert(response.data.message || 'Failed to delete program');
            }
        } catch (err: any) {
            alert('An error occurred while deleting the program');
            console.error(err);
        }
    };

    const openEditModal = (program: TrainingProgram) => {
        setEditingProgram(program);
        setFormData({
            title: program.title,
            description: program.description,
            category: program.category,
            delivery_method: program.delivery_method,
            duration_hours: program.duration_hours.toString(),
            trainer: program.trainer || '',
            is_active: program.is_active,
            issues_certificate: program.issues_certificate,
            certificate_validity_months: program.certificate_validity_months?.toString() || '',
        });
        setShowModal(true);
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            category: 'technical',
            delivery_method: 'online',
            duration_hours: '',
            trainer: '',
            is_active: true,
            issues_certificate: false,
            certificate_validity_months: '',
        });
        setEditingProgram(null);
        setError('');
    };

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <BookOpen className="w-8 h-8 text-blue-600" />
                        Training Management
                    </h1>
                    <p className="text-gray-600 mt-2">Manage training programs, sessions, and employee enrollments</p>
                </div>
                <button
                    onClick={() => {
                        resetForm();
                        setShowModal(true);
                    }}
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
                >
                    <Plus className="w-5 h-5" />
                    New Program
                </button>
            </div>

            {/* Statistics Dashboard */}
            {statistics && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6 mb-8">
                    <MetricCard
                        title="Total Programs"
                        value={statistics.total_programs}
                        change={12}
                        changeType="increase"
                        icon={BookOpen}
                        color="info"
                        description={`${statistics.active_programs} active`}
                    />
                    <MetricCard
                        title="Total Enrollments"
                        value={statistics.total_enrollments}
                        change={8}
                        changeType="increase"
                        icon={Users}
                        color="success"
                        description={`${statistics.active_enrollments} active`}
                    />
                    <MetricCard
                        title="Completion Rate"
                        value={statistics.completion_rate}
                        change={5}
                        changeType="decrease"
                        icon={TrendingUp}
                        color="warning"
                        description={`${statistics.completed_enrollments} completed`}
                    />
                    <MetricCard
                        title="Certifications"
                        value={statistics.total_certifications}
                        change={15}
                        changeType="increase"
                        icon={Award}
                        color="success"
                        description={`${statistics.expiring_soon} expiring soon`}
                    />
                </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search programs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">All Categories</option>
                        {Object.entries(categoryLabels).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </select>

                    <select
                        value={activeFilter}
                        onChange={(e) => setActiveFilter(e.target.value)}
                        className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="all">All Programs</option>
                        <option value="active">Active Only</option>
                        <option value="inactive">Inactive Only</option>
                    </select>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
                    <XCircle className="w-5 h-5" />
                    {error}
                </div>
            )}

            {/* Programs List */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-gray-600">Loading programs...</p>
                </div>
            ) : programs.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                    <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Training Programs</h3>
                    <p className="text-gray-600 mb-4">Get started by creating your first training program</p>
                    <button
                        onClick={() => {
                            resetForm();
                            setShowModal(true);
                        }}
                        className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
                    >
                        <Plus className="w-5 h-5" />
                        Create Program
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {programs.map((program) => (
                        <div key={program.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition">
                            <div className="p-6">
                                {/* Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{program.title}</h3>
                                        <div className="flex flex-wrap gap-2">
                                            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                                                {categoryLabels[program.category]}
                                            </span>
                                            <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full">
                                                {deliveryMethodLabels[program.delivery_method]}
                                            </span>
                                            {program.is_mandatory && (
                                                <span className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full">
                                                    Mandatory
                                                </span>
                                            )}
                                            {program.issues_certificate && (
                                                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full flex items-center gap-1">
                                                    <Award className="w-3 h-3" />
                                                    Certificate
                                                </span>
                                            )}
                                            <span className={`px-3 py-1 text-sm rounded-full ${program.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                                                {program.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 ml-4">
                                        <button
                                            onClick={() => openEditModal(program)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                            title="Edit"
                                        >
                                            <Edit2 className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(program.id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Description */}
                                {program.description && (
                                    <p className="text-gray-600 mb-4 line-clamp-2">{program.description}</p>
                                )}

                                {/* Details */}
                                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                                    {program.duration_hours && (
                                        <div className="flex items-center gap-2 text-gray-700">
                                            <Clock className="w-4 h-4 text-gray-400" />
                                            <span>{program.duration_hours} hours</span>
                                        </div>
                                    )}
                                    {program.cost > 0 && (
                                        <div className="flex items-center gap-2 text-gray-700">
                                            <DollarSign className="w-4 h-4 text-gray-400" />
                                            <span>${program.cost.toFixed(2)}</span>
                                        </div>
                                    )}
                                    {program.max_participants && (
                                        <div className="flex items-center gap-2 text-gray-700">
                                            <Users className="w-4 h-4 text-gray-400" />
                                            <span>Max {program.max_participants} participants</span>
                                        </div>
                                    )}
                                    {program.instructor_name && (
                                        <div className="flex items-center gap-2 text-gray-700">
                                            <Users className="w-4 h-4 text-gray-400" />
                                            <span>{program.instructor_name}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Enrollments Stats */}
                                <div className="border-t pt-4">
                                    <div className="grid grid-cols-3 gap-4 text-center">
                                        <div>
                                            <p className="text-2xl font-bold text-blue-600">{program.enrollments_count}</p>
                                            <p className="text-xs text-gray-600">Total</p>
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold text-orange-600">{program.active_enrollments_count}</p>
                                            <p className="text-xs text-gray-600">Active</p>
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold text-green-600">{program.completed_enrollments_count}</p>
                                            <p className="text-xs text-gray-600">Completed</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[999999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 pointer-events-auto overflow-y-auto">
                    <div className="bg-white rounded-lg max-w-3xl w-full my-8">
                        <div className="p-6 border-b">
                            <h2 className="text-2xl font-bold text-gray-900">
                                {editingProgram ? 'Edit Training Program' : 'Create Training Program'}
                            </h2>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[60vh] overflow-y-auto pr-2">
                                {/* Title */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Program Title *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                {/* Description */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={3}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                {/* Category */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Category *
                                    </label>
                                    <select
                                        required
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        {Object.entries(categoryLabels).map(([key, label]) => (
                                            <option key={key} value={key}>{label}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Delivery Method */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Delivery Method *
                                    </label>
                                    <select
                                        required
                                        value={formData.delivery_method}
                                        onChange={(e) => setFormData({ ...formData, delivery_method: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        {Object.entries(deliveryMethodLabels).map(([key, label]) => (
                                            <option key={key} value={key}>{label}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Duration */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Duration (hours)
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={formData.duration_hours}
                                        onChange={(e) => setFormData({ ...formData, duration_hours: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                {/* Cost */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Cost ($)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={formData.cost}
                                        onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                {/* Max Participants */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Max Participants
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={formData.max_participants}
                                        onChange={(e) => setFormData({ ...formData, max_participants: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                {/* Instructor Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Instructor Name
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.instructor_name}
                                        onChange={(e) => setFormData({ ...formData, instructor_name: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                {/* Instructor Email */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Instructor Email
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.instructor_email}
                                        onChange={(e) => setFormData({ ...formData, instructor_email: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                {/* Certificate Validity */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Certificate Validity (months)
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={formData.certificate_validity_months}
                                        onChange={(e) => setFormData({ ...formData, certificate_validity_months: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        disabled={!formData.issues_certificate}
                                    />
                                </div>

                                {/* Prerequisites */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Prerequisites
                                    </label>
                                    <textarea
                                        value={formData.prerequisites}
                                        onChange={(e) => setFormData({ ...formData, prerequisites: e.target.value })}
                                        rows={2}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                {/* Learning Objectives */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Learning Objectives
                                    </label>
                                    <textarea
                                        value={formData.learning_objectives}
                                        onChange={(e) => setFormData({ ...formData, learning_objectives: e.target.value })}
                                        rows={2}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                {/* Checkboxes */}
                                <div className="md:col-span-2 space-y-3">
                                    <label className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            checked={formData.is_mandatory}
                                            onChange={(e) => setFormData({ ...formData, is_mandatory: e.target.checked })}
                                            className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                        />
                                        <span className="text-sm font-medium text-gray-700">Mandatory Training</span>
                                    </label>

                                    <label className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            checked={formData.is_active}
                                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                            className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                        />
                                        <span className="text-sm font-medium text-gray-700">Active Program</span>
                                    </label>

                                    <label className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            checked={formData.issues_certificate}
                                            onChange={(e) => setFormData({ ...formData, issues_certificate: e.target.checked })}
                                            className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                        />
                                        <span className="text-sm font-medium text-gray-700">Issues Certificate</span>
                                    </label>
                                </div>
                            </div>

                            {/* Error */}
                            {error && (
                                <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                                    <XCircle className="w-5 h-5" />
                                    {error}
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        resetForm();
                                    }}
                                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                                >
                                    <CheckCircle className="w-5 h-5" />
                                    {editingProgram ? 'Update Program' : 'Create Program'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Training;
