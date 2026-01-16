import React, { useState, useMemo } from 'react';
import { Head } from '@inertiajs/react';
import AppLayoutShopOwner from '../../layout/AppLayout_shopOwner';
import Swal from 'sweetalert2';
import Button from '../../components/ui/button/Button';
import { Modal } from '../../components/ui/modal';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  UserCircleIcon,
  LockIcon,
  GroupIcon,
  CheckCircleIcon,
  AlertIcon,
  PlusIcon,
  PencilIcon,
  TrashBinIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from '../../icons';

interface Employee {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  createdAt: Date;
}

interface Role {
  id: number;
  name: string;
  userCount: number;
  permissions: string[];
}

interface UserAccount {
  id: number;
  name: string;
  status: 'active' | 'suspended';
}

interface MetricData {
  title: string;
  value: number;
  change: number;
  changeType: 'increase' | 'decrease';
  icon: React.ComponentType<{ className?: string }>;
  color: 'success' | 'error' | 'warning' | 'info';
  description: string;
}

// Professional Metric Card Component
const MetricCard: React.FC<MetricData> = ({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  color,
  description
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
    <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-500 hover:shadow-xl hover:border-gray-300 hover:-translate-y-1 dark:border-gray-800 dark:bg-white/[0.03] dark:hover:border-gray-700">
      {/* Animated background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${getColorClasses()} opacity-0 transition-opacity duration-500 group-hover:opacity-5`} />

      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className={`flex items-center justify-center w-14 h-14 bg-gradient-to-br ${getColorClasses()} rounded-2xl shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-6`}>
            <Icon className="text-white size-7 drop-shadow-sm" />
          </div>

          <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-all duration-300 ${changeType === 'increase'
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            }`}>
            {changeType === 'increase' ? <ArrowUpIcon className="size-3" /> : <ArrowDownIcon className="size-3" />}
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

const UserAccessControl: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'employees' | 'roles' | 'users'>('employees');
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);
  const [employeeFilter, setEmployeeFilter] = useState<'all' | 'recent' | 'Staff' | 'Manager'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Sample data - in real app this would come from API
  const [employees, setEmployees] = useState<Employee[]>([
    { id: 1, name: 'paragas', email: '123@example.com', role: 'Manager', status: 'active', createdAt: new Date() },
    { id: 2, name: 'yambao apawan', email: '123@example.com', role: 'Staff', status: 'active', createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
  ]);

  const [roles, setRoles] = useState<Role[]>([
    { id: 1, name: 'Managers and Staff', userCount: 15, permissions: ['Read Users', 'Edit Users'] },
    { id: 3, name: 'Staff', userCount: 23, permissions: ['Read Users'] },
  ]);

  const [userAccounts, setUserAccounts] = useState<UserAccount[]>([
    { id: 1, name: 'hotdog mo', status: 'active' },
    { id: 2, name: 'brennan lester', status: 'suspended' },
    { id: 3, name: 'apawan lester', status: 'active' },
  ]);

  // Form states
  const [employeeForm, setEmployeeForm] = useState({ name: '', email: '', role: 'Manager' });
  const [roleForm, setRoleForm] = useState({ name: '', permissions: [] as string[] });
  const [accountAction, setAccountAction] = useState<'activate' | 'suspend'>('activate');
  const [accountReason, setAccountReason] = useState('');

  // Computed values
  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const matchesFilter = employeeFilter === 'all' ||
        (employeeFilter === 'recent' && employee.createdAt >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) ||
        (employeeFilter === 'Staff' && employee.role === 'Staff') ||
        (employeeFilter === 'Manager' && employee.role === 'Manager');

      const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.role.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesFilter && matchesSearch;
    });
  }, [employees, employeeFilter, searchTerm]);

  const filteredRoles = useMemo(() => {
    return roles.filter((role) =>
      role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.permissions.some(p => p.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [roles, searchTerm]);

  const filteredUsers = useMemo(() => {
    return userAccounts.filter((user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.status.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [userAccounts, searchTerm]);

  const stats = useMemo(() => ({
    totalUsers: userAccounts.length,
    activeUsers: userAccounts.filter(u => u.status === 'active').length,
    suspendedUsers: userAccounts.filter(u => u.status === 'suspended').length,
    totalEmployees: employees.length,
    activeEmployees: employees.filter(e => e.status === 'active').length,
    totalRoles: roles.length,
  }), [userAccounts, employees, roles]);

  const metricsData: MetricData[] = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      change: 12,
      changeType: 'increase',
      icon: UserCircleIcon,
      color: 'info',
      description: 'from last month'
    },
    {
      title: 'Active Employees',
      value: stats.activeEmployees,
      change: 5,
      changeType: 'increase',
      icon: GroupIcon,
      color: 'success',
      description: 'from last month'
    },
    {
      title: 'Total Roles',
      value: stats.totalRoles,
      change: 0,
      changeType: 'increase',
      icon: LockIcon,
      color: 'warning',
      description: 'from last month'
    },
    {
      title: 'Suspended Users',
      value: stats.suspendedUsers,
      change: 8,
      changeType: 'decrease',
      icon: AlertIcon,
      color: 'error',
      description: 'from last month'
    }
  ];

  // CRUD Functions
  const handleAddEmployee = async () => {
    if (!employeeForm.name || !employeeForm.email) {
      setIsEmployeeModalOpen(false);
      setTimeout(() => {
        Swal.fire({
          icon: 'error',
          title: 'Validation Error',
          text: 'Please fill in all required fields',
          timer: 3000,
          showConfirmButton: false
        });
      }, 100);
      return;
    }

    setIsEmployeeModalOpen(false);
    setTimeout(async () => {
      const result = await Swal.fire({
        title: 'Add Employee',
        text: `Are you sure you want to add ${employeeForm.name} as an employee?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, add it!'
      });

      if (result.isConfirmed) {
        const newEmployee: Employee = {
          id: Date.now(),
          name: employeeForm.name,
          email: employeeForm.email,
          role: employeeForm.role,
          status: 'active',
          createdAt: new Date()
        };

        setEmployees([...employees, newEmployee]);
        setEmployeeForm({ name: '', email: '', role: 'Manager' });
        setTimeout(() => {
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'Employee added successfully!',
            timer: 2000,
            showConfirmButton: false
          });
        }, 100);
      }
    }, 100);
  };

  const handleEditEmployee = () => {
    if (!editingEmployee || !employeeForm.name || !employeeForm.email) {
      setIsEmployeeModalOpen(false);
      setTimeout(() => {
        Swal.fire({
          icon: 'error',
          title: 'Validation Error',
          text: 'Please fill in all required fields',
          timer: 3000,
          showConfirmButton: false
        });
      }, 100);
      return;
    }

    setEmployees(employees.map(employee =>
      employee.id === editingEmployee.id
        ? { ...employee, name: employeeForm.name, email: employeeForm.email, role: employeeForm.role }
        : employee
    ));

    setEditingEmployee(null);
    setEmployeeForm({ name: '', email: '', role: 'Manager' });
    setIsEmployeeModalOpen(false);
    setTimeout(() => {
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Employee updated successfully!',
        timer: 2000,
        showConfirmButton: false
      });
    }, 100);
  };

  const handleDeleteEmployee = async (employeeId: number) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      setEmployees(employees.filter(employee => employee.id !== employeeId));
      Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: 'Employee deleted successfully!',
        timer: 2000,
        showConfirmButton: false
      });
    }
  };

  const handleAddRole = async () => {
    if (!roleForm.name) {
      setIsRoleModalOpen(false);
      setTimeout(() => {
        Swal.fire({
          icon: 'error',
          title: 'Validation Error',
          text: 'Please enter a role name',
          timer: 3000,
          showConfirmButton: false
        });
      }, 100);
      return;
    }

    setIsRoleModalOpen(false);
    setTimeout(async () => {
      const result = await Swal.fire({
        title: 'Create Role',
        text: `Are you sure you want to create the role "${roleForm.name}"?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, create it!'
      });

      if (result.isConfirmed) {
        const newRole: Role = {
          id: Date.now(),
          name: roleForm.name,
          userCount: 0,
          permissions: roleForm.permissions
        };

        setRoles([...roles, newRole]);
        setRoleForm({ name: '', permissions: [] });
        setTimeout(() => {
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'Role created successfully!',
            timer: 2000,
            showConfirmButton: false
          });
        }, 100);
      }
    }, 100);
  };

  const handleEditRole = () => {
    if (!editingRole || !roleForm.name) {
      setIsRoleModalOpen(false);
      setTimeout(() => {
        Swal.fire({
          icon: 'error',
          title: 'Validation Error',
          text: 'Please enter a role name',
          timer: 3000,
          showConfirmButton: false
        });
      }, 100);
      return;
    }

    setRoles(roles.map(role =>
      role.id === editingRole.id
        ? { ...role, name: roleForm.name, permissions: roleForm.permissions }
        : role
    ));

    setEditingRole(null);
    setRoleForm({ name: '', permissions: [] });
    setIsRoleModalOpen(false);
    setTimeout(() => {
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Role updated successfully!',
        timer: 2000,
        showConfirmButton: false
      });
    }, 100);
  };

  const handleDeleteRole = async (roleId: number) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this! All users assigned to this role will lose their permissions.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      setRoles(roles.filter(role => role.id !== roleId));
      Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: 'Role deleted successfully!',
        timer: 2000,
        showConfirmButton: false
      });
    }
  };

  const handleAccountAction = async () => {
    if (!selectedUser) {
      setIsAccountModalOpen(false);
      setTimeout(() => {
        Swal.fire({
          icon: 'error',
          title: 'Validation Error',
          text: 'Please select a user',
          timer: 3000,
          showConfirmButton: false
        });
      }, 100);
      return;
    }

    setIsAccountModalOpen(false);
    setTimeout(async () => {
      const result = await Swal.fire({
        title: `${accountAction.charAt(0).toUpperCase() + accountAction.slice(1)} Account`,
        text: `Are you sure you want to ${accountAction} the account for ${selectedUser.name}?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: accountAction === 'activate' ? '#3085d6' : '#d33',
        cancelButtonColor: '#6c757d',
        confirmButtonText: `Yes, ${accountAction} it!`
      });

      if (result.isConfirmed) {
        setUserAccounts(userAccounts.map(user =>
          user.id === selectedUser.id
            ? { ...user, status: accountAction === 'activate' ? 'active' : 'suspended' }
            : user
        ));

        setSelectedUser(null);
        setAccountAction('activate');
        setAccountReason('');
        setTimeout(() => {
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: `Account ${accountAction}d successfully!`,
            timer: 2000,
            showConfirmButton: false
          });
        }, 100);
      }
    }, 100);
  };

  // Modal open handlers
  const openAddEmployeeModal = () => {
    setEditingEmployee(null);
    setEmployeeForm({ name: '', email: '', role: 'Manager' });
    setIsEmployeeModalOpen(true);
  };

  const openEditEmployeeModal = (employee: Employee) => {
    setEditingEmployee(employee);
    setEmployeeForm({ name: employee.name, email: employee.email, role: employee.role });
    setIsEmployeeModalOpen(true);
  };

  const openAddRoleModal = () => {
    setEditingRole(null);
    setRoleForm({ name: '', permissions: [] });
    setIsRoleModalOpen(true);
  };

  const openEditRoleModal = (role: Role) => {
    setEditingRole(role);
    setRoleForm({ name: role.name, permissions: role.permissions });
    setIsRoleModalOpen(true);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'employees':
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex items-center space-x-4">
                <input
                  type="text"
                  placeholder="Search Employee..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white w-64"
                />
                <label htmlFor="admin-filter-select" className="sr-only">Filter admins</label>
                <select
                  id="employee-filter-select"
                  value={employeeFilter}
                  onChange={(e) => setEmployeeFilter(e.target.value as 'all' | 'recent' | 'Staff' | 'Manager')}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  aria-label="Filter employees"
                  title="Filter employees"
                >
                  <option value="all">All</option>
                  <option value="Staff">Staff</option>
                  <option value="Manager">Manager</option>
                  <option value="recent">Recent (7 days)</option>
                </select>
              </div>
              <Button onClick={openAddEmployeeModal} className="flex items-center space-x-2">
                <PlusIcon className="h-4 w-4" />
                <span>Add Employee</span>
              </Button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableCell isHeader className="px-6 py-4 font-semibold text-gray-900 dark:text-white">Name</TableCell>
                      <TableCell isHeader className="px-6 py-4 font-semibold text-gray-900 dark:text-white">Email</TableCell>
                      <TableCell isHeader className="px-6 py-4 font-semibold text-gray-900 dark:text-white">Role</TableCell>
                      <TableCell isHeader className="px-6 py-4 font-semibold text-gray-900 dark:text-white">Status</TableCell>
                      <TableCell isHeader className="px-6 py-4 font-semibold text-gray-900 dark:text-white">Created</TableCell>
                      <TableCell isHeader className="px-6 py-4 font-semibold text-gray-900 dark:text-white">Actions</TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEmployees.map((employee) => (
                      <TableRow key={employee.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <TableCell className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                              {employee.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-gray-900 dark:text-white">{employee.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300">{employee.email}</TableCell>
                        <TableCell className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${employee.role === 'Manager' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' :
                              employee.role === 'Staff' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                                'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                            }`}>
                            {employee.role}
                          </span>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${employee.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                              'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            }`}>
                            {employee.status}
                          </span>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300">
                          {employee.createdAt.toLocaleDateString()}
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => openEditEmployeeModal(employee)}
                              className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                              title="Edit"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteEmployee(employee.id)}
                              className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                              title="Delete"
                            >
                              <TrashBinIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        );

      case 'roles':
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <input
                type="text"
                placeholder="Search roles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white w-64"
              />
              <Button onClick={openAddRoleModal} className="flex items-center space-x-2">
                <PlusIcon className="h-4 w-4" />
                <span>Create Role</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRoles.map((role) => {
                const getRoleIcon = (roleName: string) => {
                  switch (roleName.toLowerCase()) {
                    case 'managers and staff':
                      return GroupIcon;
                    case 'staff':
                      return UserCircleIcon;
                    default:
                      return LockIcon;
                  }
                };

                const getRoleGradient = (roleName: string) => {
                  switch (roleName.toLowerCase()) {
                    case 'managers and staff':
                      return 'from-blue-500 to-indigo-600';
                    case 'staff':
                      return 'from-green-500 to-emerald-600';
                    default:
                      return 'from-gray-500 to-slate-600';
                  }
                };

                const IconComponent = getRoleIcon(role.name);
                const gradientClass = getRoleGradient(role.name);

                return (
                  <div key={`role-${role.id}`} className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300 hover:shadow-xl hover:border-gray-300 hover:-translate-y-1 dark:hover:border-gray-600">
                    {/* Animated background gradient */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-0 transition-opacity duration-500 group-hover:opacity-5`} />

                    <div className="relative">
                      <div className="flex items-center gap-4 mb-6">
                        <div className={`flex items-center justify-center w-12 h-12 bg-gradient-to-br ${gradientClass} rounded-2xl shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-6`}>
                          <IconComponent className="text-white size-6 drop-shadow-sm" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white transition-colors duration-300">{role.name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                            <UserCircleIcon className="size-4" />
                            {role.userCount} users assigned
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Permissions</p>
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs text-gray-600 dark:text-gray-300 rounded-full font-medium">
                            {role.permissions.length} total
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {role.permissions.length > 0 ? (
                            role.permissions.slice(0, 3).map((permission, index) => (
                              <span key={index} className="px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 text-xs text-blue-700 dark:text-blue-300 rounded-full border border-blue-200 dark:border-blue-800 font-medium">
                                {permission}
                              </span>
                            ))
                          ) : (
                            <span className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-xs text-gray-500 dark:text-gray-400 rounded-full">
                              No permissions assigned
                            </span>
                          )}
                          {role.permissions.length > 3 && (
                            <span className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-xs text-gray-500 dark:text-gray-400 rounded-full">
                              +{role.permissions.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action buttons - always visible on mobile, hidden on desktop until hover */}
                      <div className="flex items-center justify-center mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => openEditRoleModal(role)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                          >
                            <PencilIcon className="h-4 w-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteRole(role.id)}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                          >
                            <TrashBinIcon className="h-4 w-4" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'users':
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white w-64"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-700 dark:text-green-300">Active Users</p>
                    <p className="text-3xl font-bold text-green-800 dark:text-green-200">{stats.activeUsers}</p>
                  </div>
                  <CheckCircleIcon className="h-12 w-12 text-green-500" />
                </div>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-700 dark:text-red-300">Suspended Users</p>
                    <p className="text-3xl font-bold text-red-800 dark:text-red-200">{stats.suspendedUsers}</p>
                  </div>
                  <AlertIcon className="h-12 w-12 text-red-500" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableCell isHeader className="px-6 py-4 font-semibold text-gray-900 dark:text-white text-left">Name</TableCell>
                      <TableCell isHeader className="px-6 py-4 font-semibold text-gray-900 dark:text-white text-center">Status</TableCell>
                      <TableCell isHeader className="px-6 py-4 font-semibold text-gray-900 dark:text-white text-right">Actions</TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <TableCell className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white font-semibold">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-gray-900 dark:text-white">{user.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-center">
                          <div className="flex justify-center">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                              }`}>
                              {user.status}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-right">
                          <div className="flex justify-end">
                            <Button
                              size="sm"
                              variant={user.status === 'active' ? 'outline' : 'primary'}
                              onClick={() => {
                                setSelectedUser(user);
                                setAccountAction(user.status === 'active' ? 'suspend' : 'activate');
                                setIsAccountModalOpen(true);
                              }}
                            >
                              {user.status === 'active' ? 'Suspend' : 'Activate'}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AppLayoutShopOwner>
      <Head title="User Access Control" />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">User Access Control</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">Manage users, roles, and permissions with ease</p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {metricsData.map((metric, index) => (
              <MetricCard
                key={index}
                title={metric.title}
                value={metric.value}
                change={metric.change}
                changeType={metric.changeType}
                icon={metric.icon}
                color={metric.color}
                description={metric.description}
              />
            ))}
          </div>

          {/* Tabs */}
          <div className="mb-6">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="-mb-px flex space-x-8">
                {[
                  { id: 'employees', label: 'Employees', icon: UserCircleIcon },
                  { id: 'roles', label: 'Roles', icon: LockIcon },
                  { id: 'users', label: 'Users', icon: GroupIcon },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id as typeof activeTab);
                      setSearchTerm('');
                    }}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                      }`}
                  >
                    <tab.icon className="h-5 w-5" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          {renderTabContent()}

          {/* Modals */}
          <Modal isOpen={isEmployeeModalOpen} onClose={() => setIsEmployeeModalOpen(false)}>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={employeeForm.name}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={employeeForm.email}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <label htmlFor="employee-role-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Role
                  </label>
                  <select
                    id="employee-role-select"
                    value={employeeForm.role}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    aria-label="Select employee role"
                    title="Select employee role"
                  >
                    <option>Manager</option>
                    <option>Staff</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setIsEmployeeModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={editingEmployee ? handleEditEmployee : handleAddEmployee}>
                  {editingEmployee ? 'Update Employee' : 'Add Employee'}
                </Button>
              </div>
            </div>
          </Modal>

          <Modal isOpen={isRoleModalOpen} onClose={() => setIsRoleModalOpen(false)}>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {editingRole ? 'Edit Role' : 'Create New Role'}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Role Name
                  </label>
                  <input
                    type="text"
                    value={roleForm.name}
                    onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter role name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Permissions
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Read Users', 'Create Users', 'Edit Users', 'Delete Users', 'Manage Roles', 'View Reports'].map((permission) => (
                      <label key={permission} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={roleForm.permissions.includes(permission)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setRoleForm({ ...roleForm, permissions: [...roleForm.permissions, permission] });
                            } else {
                              setRoleForm({ ...roleForm, permissions: roleForm.permissions.filter(p => p !== permission) });
                            }
                          }}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{permission}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setIsRoleModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={editingRole ? handleEditRole : handleAddRole}>
                  {editingRole ? 'Update Role' : 'Create Role'}
                </Button>
              </div>
            </div>
          </Modal>

          <Modal isOpen={isAccountModalOpen} onClose={() => setIsAccountModalOpen(false)}>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {accountAction.charAt(0).toUpperCase() + accountAction.slice(1)} Account
              </h3>
              <div className="space-y-4">
                <p className="text-gray-600 dark:text-gray-400">
                  Are you sure you want to {accountAction} the selected account{accountAction === 'suspend' ? ' and provide a reason?' : '?'}
                </p>
                {accountAction === 'suspend' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Reason for Suspension
                    </label>
                    <textarea
                      value={accountReason}
                      onChange={(e) => setAccountReason(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Enter reason for suspension"
                      rows={3}
                    />
                  </div>
                )}
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setIsAccountModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAccountAction}>
                  {accountAction.charAt(0).toUpperCase() + accountAction.slice(1)} Account
                </Button>
              </div>
            </div>
          </Modal>
        </div>
      </div>
    </AppLayoutShopOwner>
  );
};

export default UserAccessControl;
