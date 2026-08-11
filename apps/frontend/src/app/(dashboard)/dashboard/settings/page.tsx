'use client';

import * as React from 'react';
import { PageHeader } from '../../../../components/shared/PageHeader';
import { Button } from '../../../../components/ui/button';
import { Building2, Save, Image as ImageIcon, Bell, Shield, Database, Webhook, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../../../context/AuthContext';
import { useSettings } from '../../../../hooks/useSettings';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState('hospital');
  const { settingsQuery, auditQuery, statusQuery, updateSettings } = useSettings();

  // Local state for forms
  const [hospitalForm, setHospitalForm] = React.useState<any>({});
  const [brandingForm, setBrandingForm] = React.useState<any>({ 
    qrEnabled: true, barcodeEnabled: true, electronicVerification: true 
  });
  const [notificationsForm, setNotificationsForm] = React.useState<any>({
    reportReadyApp: true, reportReadyEmail: true,
    referralRequestApp: true, referralRequestEmail: false,
  });

  // Hydrate forms on load
  React.useEffect(() => {
    if (settingsQuery.data) {
      if (settingsQuery.data.HOSPITAL_PROFILE) setHospitalForm(settingsQuery.data.HOSPITAL_PROFILE);
      if (settingsQuery.data.REPORT_BRANDING) setBrandingForm(settingsQuery.data.REPORT_BRANDING);
      if (settingsQuery.data.NOTIFICATIONS) setNotificationsForm(settingsQuery.data.NOTIFICATIONS);
    }
  }, [settingsQuery.data]);

  if (!user) return null;

  if (user.role !== 'ADMIN') {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <Shield className="w-16 h-16 text-red-500 opacity-50" />
        <h2 className="text-xl font-semibold text-slate-800">403 Forbidden</h2>
        <p className="text-slate-500">You do not have permission to access System Settings.</p>
        <Button onClick={() => router.push('/dashboard')}>Return to Dashboard</Button>
      </div>
    );
  }

  const handleSaveHospital = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings.mutate({ key: 'HOSPITAL_PROFILE', value: hospitalForm });
  };

  const handleSaveBranding = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings.mutate({ key: 'REPORT_BRANDING', value: brandingForm });
  };

  const handleSaveNotifications = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings.mutate({ key: 'NOTIFICATIONS', value: notificationsForm });
  };

  const tabs = [
    { id: 'hospital', label: 'Hospital Profile', icon: Building2 },
    { id: 'branding', label: 'Report Branding', icon: ImageIcon },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security & Audit', icon: Shield },
    { id: 'backup', label: 'Data Backup', icon: Database },
    { id: 'integration', label: 'API & Integrations', icon: Webhook },
  ];

  if (settingsQuery.isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (settingsQuery.isError) {
    return (
      <div className="flex flex-col justify-center items-center h-full">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <p className="text-slate-700 font-medium mb-4">Unable to load system settings.</p>
        <Button onClick={() => settingsQuery.refetch()} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" /> Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-6">
      <PageHeader 
        title="System Settings" 
        description="Configure enterprise LIS settings, branding, notifications and integrations."
      />
      
      <div className="flex flex-1 min-h-0 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Settings Sidebar */}
        <div className="w-64 border-r border-slate-100 bg-slate-50/50 p-4">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 mr-3 ${activeTab === tab.id ? 'text-primary-600' : 'text-slate-400'}`} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
        
        {/* Settings Content */}
        <div className="flex-1 overflow-y-auto p-8">
          
          {/* HOSPITAL PROFILE */}
          {activeTab === 'hospital' && (
            <form onSubmit={handleSaveHospital} className="max-w-3xl space-y-6 animate-fadeIn">
              <div>
                <h3 className="text-lg font-medium leading-6 text-slate-900">Hospital Profile</h3>
                <p className="mt-1 text-sm text-slate-500">Basic information about the healthcare facility.</p>
              </div>
              
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-4">
                  <label className="block text-sm font-medium text-slate-700">Laboratory / Hospital Name</label>
                  <input type="text" required value={hospitalForm.name || ''} onChange={e => setHospitalForm({...hospitalForm, name: e.target.value})} className="mt-1 block w-full rounded-md border border-slate-300 bg-white text-slate-900 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm" placeholder="Enterprise Diagnostic Laboratory" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700">License Number</label>
                  <input type="text" value={hospitalForm.license || ''} onChange={e => setHospitalForm({...hospitalForm, license: e.target.value})} className="mt-1 block w-full rounded-md border border-slate-300 bg-white text-slate-900 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm" />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-sm font-medium text-slate-700">Email Address</label>
                  <input type="email" required value={hospitalForm.email || ''} onChange={e => setHospitalForm({...hospitalForm, email: e.target.value})} className="mt-1 block w-full rounded-md border border-slate-300 bg-white text-slate-900 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm" />
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-sm font-medium text-slate-700">Contact Number</label>
                  <input type="tel" required value={hospitalForm.phone || ''} onChange={e => setHospitalForm({...hospitalForm, phone: e.target.value})} className="mt-1 block w-full rounded-md border border-slate-300 bg-white text-slate-900 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm" />
                </div>
                
                <div className="sm:col-span-6">
                  <label className="block text-sm font-medium text-slate-700">Address Line 1</label>
                  <input type="text" required value={hospitalForm.address1 || ''} onChange={e => setHospitalForm({...hospitalForm, address1: e.target.value})} className="mt-1 block w-full rounded-md border border-slate-300 bg-white text-slate-900 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700">City</label>
                  <input type="text" required value={hospitalForm.city || ''} onChange={e => setHospitalForm({...hospitalForm, city: e.target.value})} className="mt-1 block w-full rounded-md border border-slate-300 bg-white text-slate-900 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700">State</label>
                  <input type="text" required value={hospitalForm.state || ''} onChange={e => setHospitalForm({...hospitalForm, state: e.target.value})} className="mt-1 block w-full rounded-md border border-slate-300 bg-white text-slate-900 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700">ZIP / Postal Code</label>
                  <input type="text" required value={hospitalForm.zip || ''} onChange={e => setHospitalForm({...hospitalForm, zip: e.target.value})} className="mt-1 block w-full rounded-md border border-slate-300 bg-white text-slate-900 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm" />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-sm font-medium text-slate-700">Medical Director</label>
                  <input type="text" value={hospitalForm.medicalDirector || ''} onChange={e => setHospitalForm({...hospitalForm, medicalDirector: e.target.value})} className="mt-1 block w-full rounded-md border border-slate-300 bg-white text-slate-900 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm" />
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-sm font-medium text-slate-700">Pathologist Name</label>
                  <input type="text" value={hospitalForm.pathologist || ''} onChange={e => setHospitalForm({...hospitalForm, pathologist: e.target.value})} className="mt-1 block w-full rounded-md border border-slate-300 bg-white text-slate-900 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm" />
                </div>
              </div>

              <div className="pt-8 flex justify-end">
                <Button type="submit" disabled={updateSettings.isPending}>
                  {updateSettings.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  {updateSettings.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          )}

          {/* REPORT BRANDING */}
          {activeTab === 'branding' && (
            <form onSubmit={handleSaveBranding} className="max-w-3xl space-y-6 animate-fadeIn">
              <div>
                <h3 className="text-lg font-medium leading-6 text-slate-900">Report Branding</h3>
                <p className="mt-1 text-sm text-slate-500">Customize the appearance of A4 laboratory reports.</p>
              </div>
              
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-6">
                  <label className="block text-sm font-medium text-slate-700">Logo Image URL</label>
                  <input type="url" value={brandingForm.logoUrl || ''} onChange={e => setBrandingForm({...brandingForm, logoUrl: e.target.value})} placeholder="https://example.com/logo.png" className="mt-1 block w-full rounded-md border border-slate-300 bg-white text-slate-900 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm" />
                  <p className="mt-1 text-xs text-slate-500">Provide a secure HTTPS URL for your external logo image. Avoid uploading large Base64 strings directly.</p>
                </div>
                
                <div className="sm:col-span-6">
                  <label className="block text-sm font-medium text-slate-700">Report Header Title</label>
                  <input type="text" value={brandingForm.headerTitle || ''} onChange={e => setBrandingForm({...brandingForm, headerTitle: e.target.value})} placeholder="E-LAB Enterprise Diagnostics" className="mt-1 block w-full rounded-md border border-slate-300 bg-white text-slate-900 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm" />
                </div>
                
                <div className="sm:col-span-6">
                  <label className="block text-sm font-medium text-slate-700">Report Subtitle</label>
                  <input type="text" value={brandingForm.subtitle || ''} onChange={e => setBrandingForm({...brandingForm, subtitle: e.target.value})} placeholder="NABL & ISO 9001:2015 Certified" className="mt-1 block w-full rounded-md border border-slate-300 bg-white text-slate-900 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm" />
                </div>

                <div className="sm:col-span-6">
                  <div className="flex items-center">
                    <input type="checkbox" id="qrEnabled" checked={brandingForm.qrEnabled} onChange={e => setBrandingForm({...brandingForm, qrEnabled: e.target.checked})} className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-600" />
                    <label htmlFor="qrEnabled" className="ml-2 block text-sm text-slate-900">Show QR Verification Code on Reports</label>
                  </div>
                </div>

                <div className="sm:col-span-6">
                  <div className="flex items-center">
                    <input type="checkbox" id="electronicVerification" checked={brandingForm.electronicVerification} onChange={e => setBrandingForm({...brandingForm, electronicVerification: e.target.checked})} className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-600" />
                    <label htmlFor="electronicVerification" className="ml-2 block text-sm text-slate-900">Enable Electronic Pathologist Signature Section</label>
                  </div>
                </div>
              </div>

              <div className="pt-8 flex justify-end">
                <Button type="submit" disabled={updateSettings.isPending}>
                  {updateSettings.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  {updateSettings.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          )}

          {/* NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <form onSubmit={handleSaveNotifications} className="max-w-3xl space-y-6 animate-fadeIn">
              <div>
                <h3 className="text-lg font-medium leading-6 text-slate-900">Notification Preferences</h3>
                <p className="mt-1 text-sm text-slate-500">Configure how and when the system sends alerts.</p>
              </div>
              
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Event</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">In-App</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">SMS</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">Report Ready</td>
                      <td className="px-6 py-4 text-center"><input type="checkbox" checked={notificationsForm.reportReadyApp} onChange={e=>setNotificationsForm({...notificationsForm, reportReadyApp: e.target.checked})} /></td>
                      <td className="px-6 py-4 text-center"><input type="checkbox" checked={notificationsForm.reportReadyEmail} onChange={e=>setNotificationsForm({...notificationsForm, reportReadyEmail: e.target.checked})} /></td>
                      <td className="px-6 py-4 text-center"><span className="text-xs text-slate-400">Not Configured</span></td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">Referral Request Received</td>
                      <td className="px-6 py-4 text-center"><input type="checkbox" checked={notificationsForm.referralRequestApp} onChange={e=>setNotificationsForm({...notificationsForm, referralRequestApp: e.target.checked})} /></td>
                      <td className="px-6 py-4 text-center"><input type="checkbox" checked={notificationsForm.referralRequestEmail} onChange={e=>setNotificationsForm({...notificationsForm, referralRequestEmail: e.target.checked})} /></td>
                      <td className="px-6 py-4 text-center"><span className="text-xs text-slate-400">Not Configured</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="pt-8 flex justify-end">
                <Button type="submit" disabled={updateSettings.isPending}>
                  {updateSettings.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  {updateSettings.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          )}

          {/* SECURITY & AUDIT */}
          {activeTab === 'security' && (
            <div className="max-w-5xl space-y-6 animate-fadeIn">
              <div>
                <h3 className="text-lg font-medium leading-6 text-slate-900">Security & Audit Logs</h3>
                <p className="mt-1 text-sm text-slate-500">Read-only view of recent administrative actions.</p>
              </div>
              
              <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
                {auditQuery.isLoading ? (
                  <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
                ) : auditQuery.isError ? (
                  <div className="p-8 text-center text-red-500">Unable to load audit logs.</div>
                ) : auditQuery.data?.items?.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">No audit logs found.</div>
                ) : (
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Timestamp</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Resource</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {auditQuery.data.items.map((log: any) => (
                        <tr key={log.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{new Date(log.createdAt).toLocaleString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-slate-900">{log.userEmail}</div>
                            <div className="text-xs text-slate-500">{log.userRole}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-emerald-600">{log.action}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{log.entity} : {log.entityId}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* DATA BACKUP */}
          {activeTab === 'backup' && (
            <div className="max-w-3xl space-y-6 animate-fadeIn">
              <div>
                <h3 className="text-lg font-medium leading-6 text-slate-900">Data Backup</h3>
                <p className="mt-1 text-sm text-slate-500">Database backup and recovery status.</p>
              </div>
              
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 flex flex-col items-center justify-center text-center">
                <Database className="w-12 h-12 text-slate-300 mb-4" />
                <h4 className="text-base font-semibold text-slate-700">Backup Infrastructure Not Configured</h4>
                <p className="text-sm text-slate-500 mt-2 max-w-md">
                  Automatic backups are not currently integrated with this environment. Restore is administrator-only and currently unavailable.
                </p>
                <div className="mt-6 flex space-x-3">
                  <Button variant="outline" disabled>Create Backup</Button>
                  <Button variant="outline" disabled>Download Backup</Button>
                </div>
              </div>
            </div>
          )}

          {/* API & INTEGRATIONS */}
          {activeTab === 'integration' && (
            <div className="max-w-3xl space-y-6 animate-fadeIn">
              <div>
                <h3 className="text-lg font-medium leading-6 text-slate-900">API & Integrations</h3>
                <p className="mt-1 text-sm text-slate-500">Live health status of internal and external services.</p>
              </div>
              
              {statusQuery.isLoading ? (
                <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
              ) : statusQuery.isError ? (
                <div className="p-8 text-center text-red-500">Unable to load integration status.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.entries(statusQuery.data || {}).map(([key, info]: [string, any]) => (
                    <div key={key} className="border border-slate-200 rounded-lg p-4 bg-white shadow-sm flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</h4>
                        <p className="text-xs text-slate-500 mt-1">{info.details}</p>
                      </div>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        info.status === 'Connected' ? 'bg-emerald-100 text-emerald-700' :
                        info.status === 'Not Configured' ? 'bg-slate-100 text-slate-600' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {info.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}
