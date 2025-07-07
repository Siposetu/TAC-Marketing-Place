import React, { useState } from 'react';
import { Shield, Users, CheckCircle, XCircle, Trash2, Eye, AlertTriangle, Search, Filter, Building, Award } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useServiceProviders } from '../hooks/useServiceProviders';
import { useLocalProfiles } from '../hooks/useLocalProfiles';
import { useAppointments } from '../hooks/useAppointments';
import { ServiceProvider } from '../types';
import { LocalProfile } from '../hooks/useLocalProfiles';

export function AdminDashboard() {
  const { user, getAllUsers, updateUserStatus } = useAuth();
  const { providers, updateProvider, deleteProvider } = useServiceProviders();
  const { profiles: localProfiles, updateProfile: updateLocalProfile, deleteProfile: deleteLocalProfile } = useLocalProfiles();
  const { appointments, updateAppointment } = useAppointments();
  
  const [activeTab, setActiveTab] = useState<'providers' | 'profiles' | 'users' | 'appointments' | 'business'>('business');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState<ServiceProvider | LocalProfile | null>(null);

  if (!user || user.role !== 'admin') {
    return (
      <div className="max-w-4xl mx-auto text-center py-16">
        <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600">You need admin privileges to access this page.</p>
      </div>
    );
  }

  const allUsers = getAllUsers();
  const pendingProviders = providers.filter(p => p.status === 'Pending' || p.status === 'Ready');
  const pendingProfiles = localProfiles.filter(p => p.status === 'Pending Bio' || p.status === 'Ready');
  const businessProfiles = providers.filter(p => p.isBusinessOwner);
  const pendingAppointments = appointments.filter(a => a.status === 'Pending');

  const handleApproveProvider = (id: string) => {
    updateProvider(id, { status: 'Published' });
  };

  const handleRejectProvider = (id: string) => {
    updateProvider(id, { status: 'Pending' });
  };

  const handleDeleteProvider = (id: string) => {
    if (confirm('Are you sure you want to delete this provider? This action cannot be undone.')) {
      deleteProvider(id);
    }
  };

  const handleApproveProfile = (id: string) => {
    updateLocalProfile(id, { status: 'Published' });
  };

  const handleDeleteProfile = (id: string) => {
    if (confirm('Are you sure you want to delete this profile? This action cannot be undone.')) {
      deleteLocalProfile(id);
    }
  };

  const handleToggleUserStatus = (userId: string, currentStatus: boolean) => {
    updateUserStatus(userId, !currentStatus);
  };

  const handleApproveAppointment = (appointmentId: string) => {
    updateAppointment(appointmentId, { status: 'Confirmed' });
  };

  const handleRejectAppointment = (appointmentId: string) => {
    updateAppointment(appointmentId, { status: 'Cancelled' });
  };

  const filteredProviders = providers.filter(provider => {
    const matchesSearch = provider.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         provider.service.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || provider.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredProfiles = localProfiles.filter(profile => {
    const matchesSearch = profile.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         profile.skill.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || profile.status.toLowerCase().includes(statusFilter.toLowerCase());
    return matchesSearch && matchesStatus;
  });

  const filteredBusinessProfiles = businessProfiles.filter(provider => {
    const matchesSearch = provider.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         provider.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (provider.businessInfo?.businessName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || provider.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = appointment.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.service.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || appointment.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">Admin Dashboard</h2>
            <p className="text-gray-600 text-lg">Manage service providers and community guidelines</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
            <div className="text-2xl font-bold text-blue-900">{providers.length}</div>
            <div className="text-sm text-blue-700">Total Providers</div>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
            <div className="text-2xl font-bold text-green-900">{localProfiles.length}</div>
            <div className="text-sm text-green-700">Local Profiles</div>
          </div>
          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl p-6 border border-yellow-200">
            <div className="text-2xl font-bold text-yellow-900">{pendingProviders.length + pendingProfiles.length}</div>
            <div className="text-sm text-yellow-700">Pending Approval</div>
          </div>
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
            <div className="text-2xl font-bold text-purple-900">{businessProfiles.length}</div>
            <div className="text-sm text-purple-700">Business Profiles</div>
          </div>
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
            <div className="text-2xl font-bold text-orange-900">{pendingAppointments.length}</div>
            <div className="text-sm text-orange-700">Pending Appointments</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="flex space-x-8 px-6 overflow-x-auto">
          {[
            { id: 'business', label: 'Business Profiles', count: businessProfiles.length, icon: Building },
            { id: 'providers', label: 'Service Providers', count: providers.length, icon: Users },
            { id: 'profiles', label: 'Local Profiles', count: localProfiles.length, icon: Award },
            { id: 'appointments', label: 'Appointments', count: appointments.length, icon: AlertTriangle },
            { id: 'users', label: 'User Management', count: allUsers.length, icon: Users }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-3 font-medium text-sm transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-red-500 text-red-600 bg-red-50/50'
                  : 'border-transparent text-gray-500 hover:text-red-600 hover:border-red-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
              <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent appearance-none min-w-[150px]"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="ready">Ready</option>
              <option value="published">Published</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Business Profiles Management */}
        {activeTab === 'business' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Business Profiles Management</h3>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Building className="w-4 h-4" />
                <span>{businessProfiles.length} business profiles</span>
              </div>
            </div>
            <div className="space-y-4">
              {filteredBusinessProfiles.map(provider => (
                <div key={provider.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <Building className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{provider.businessInfo?.businessName || provider.fullName}</h4>
                        <p className="text-sm text-gray-600">{provider.service} • {provider.location}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            provider.status === 'Published' ? 'bg-green-100 text-green-800' :
                            provider.status === 'Ready' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {provider.status}
                          </span>
                          <span className="text-xs text-gray-500">
                            {provider.businessInfo?.businessType} • R{provider.suggestedPrice}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedItem(provider)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      {provider.status === 'Ready' && (
                        <button
                          onClick={() => handleApproveProvider(provider.id)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Approve Business"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      
                      {provider.status === 'Published' && (
                        <button
                          onClick={() => handleRejectProvider(provider.id)}
                          className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                          title="Unpublish"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDeleteProvider(provider.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Business"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredBusinessProfiles.length === 0 && (
                <div className="text-center py-12">
                  <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No business profiles found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Appointments Management */}
        {activeTab === 'appointments' && (
          <div className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Appointments Management</h3>
            <div className="space-y-4">
              {filteredAppointments.map(appointment => (
                <div key={appointment.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                        <AlertTriangle className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{appointment.clientName}</h4>
                        <p className="text-sm text-gray-600">{appointment.service} • {appointment.date}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            appointment.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                            appointment.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                            appointment.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {appointment.status}
                          </span>
                          <span className="text-xs text-gray-500">
                            {appointment.startTime} - {appointment.endTime}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {appointment.status === 'Pending' && (
                        <>
                          <button
                            onClick={() => handleApproveAppointment(appointment.id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Approve Appointment"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRejectAppointment(appointment.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Reject Appointment"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredAppointments.length === 0 && (
                <div className="text-center py-12">
                  <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No appointments found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Service Providers Management */}
        {activeTab === 'providers' && (
          <div className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Service Providers Management</h3>
            <div className="space-y-4">
              {filteredProviders.map(provider => (
                <div key={provider.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">
                          {provider.fullName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{provider.fullName}</h4>
                        <p className="text-sm text-gray-600">{provider.service} • {provider.location}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            provider.status === 'Published' ? 'bg-green-100 text-green-800' :
                            provider.status === 'Ready' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {provider.status}
                          </span>
                          <span className="text-xs text-gray-500">
                            R{provider.suggestedPrice} • {provider.yearsExperience} years exp
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedItem(provider)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      {provider.status === 'Ready' && (
                        <button
                          onClick={() => handleApproveProvider(provider.id)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Approve"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      
                      {provider.status === 'Published' && (
                        <button
                          onClick={() => handleRejectProvider(provider.id)}
                          className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                          title="Unpublish"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDeleteProvider(provider.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredProviders.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No service providers found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Local Profiles Management */}
        {activeTab === 'profiles' && (
          <div className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Local Profiles Management</h3>
            <div className="space-y-4">
              {filteredProfiles.map(profile => (
                <div key={profile.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">
                          {profile.fullName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{profile.fullName}</h4>
                        <p className="text-sm text-gray-600">{profile.skill} • {profile.location}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            profile.status === 'Published' ? 'bg-green-100 text-green-800' :
                            profile.status === 'Ready' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {profile.status}
                          </span>
                          <span className="text-xs text-gray-500">
                            R{profile.suggestedPriceZAR} • {profile.yearsExperience} years exp
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedItem(profile)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      {profile.status === 'Ready' && (
                        <button
                          onClick={() => handleApproveProfile(profile.id)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Approve"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDeleteProfile(profile.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredProfiles.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No local profiles found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* User Management */}
        {activeTab === 'users' && (
          <div className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">User Management</h3>
            <div className="space-y-4">
              {allUsers.map(user => (
                <div key={user.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        user.role === 'admin' ? 'bg-red-100' :
                        user.role === 'provider' ? 'bg-green-100' : 'bg-blue-100'
                      }`}>
                        <span className={`font-bold ${
                          user.role === 'admin' ? 'text-red-600' :
                          user.role === 'provider' ? 'text-green-600' : 'text-blue-600'
                        }`}>
                          {user.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{user.name}</h4>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.role === 'admin' ? 'bg-red-100 text-red-800' :
                            user.role === 'provider' ? 'bg-green-100 text-green-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {user.role}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {user.isActive ? 'Active' : 'Suspended'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {user.role !== 'admin' && (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleToggleUserStatus(user.id, user.isActive)}
                          className={`p-2 rounded-lg transition-colors ${
                            user.isActive 
                              ? 'text-red-600 hover:bg-red-50' 
                              : 'text-green-600 hover:bg-green-50'
                          }`}
                          title={user.isActive ? 'Suspend User' : 'Activate User'}
                        >
                          {user.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Profile Details</h3>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900">{selectedItem.fullName}</h4>
                  <p className="text-gray-600">
                    {'service' in selectedItem ? selectedItem.service : selectedItem.skill}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Experience</label>
                    <p className="text-gray-900">{selectedItem.yearsExperience} years</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Location</label>
                    <p className="text-gray-900">{selectedItem.location}</p>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Bio</label>
                  <p className="text-gray-900 mt-1 p-3 bg-gray-50 rounded-lg">
                    {'generatedBio' in selectedItem ? selectedItem.generatedBio : selectedItem.bioAI}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Suggested Price</label>
                  <p className="text-gray-900 text-lg font-semibold">
                    R{'suggestedPrice' in selectedItem ? selectedItem.suggestedPrice : selectedItem.suggestedPriceZAR}
                  </p>
                </div>

                {/* Business Info for Business Profiles */}
                {'businessInfo' in selectedItem && selectedItem.businessInfo && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Business Information</label>
                    <div className="mt-1 p-3 bg-gray-50 rounded-lg space-y-2">
                      <p><strong>Business Name:</strong> {selectedItem.businessInfo.businessName}</p>
                      <p><strong>Type:</strong> {selectedItem.businessInfo.businessType}</p>
                      <p><strong>Description:</strong> {selectedItem.businessInfo.description}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}