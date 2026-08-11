'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { usePatient } from '../../../../../hooks/usePatients';
import { useAuth } from '../../../../../context/AuthContext';
import { PageHeader } from '../../../../../components/shared/PageHeader';
import { Button } from '../../../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../components/ui/card';
import { Badge } from '../../../../../components/ui/badge';
import { ArrowLeft, UserSquare2, Phone, Mail, Calendar, Activity, Clock, FileText } from 'lucide-react';

export default function PatientProfilePage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;
  const { data: patient, isLoading, isError } = usePatient(patientId);
  const { user } = useAuth();
  const isReadOnly = user?.role === 'ADMIN' || user?.role === 'DOCTOR';

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (isError || !patient) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center space-y-4">
        <p className="text-gray-500">Patient not found.</p>
        <Button onClick={() => router.push('/dashboard/patients')} variant="outline">
          Back to Patients
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6 animate-fadeIn pb-8">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => router.push('/dashboard/patients')}
          className="text-gray-500 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <PageHeader 
          title={`${patient.firstName} ${patient.lastName}`} 
          description={`MRN: ${patient.mrn}`}
        />
        <div className="ml-auto flex gap-3">
          {!isReadOnly && (
            <Button onClick={() => router.push('/dashboard/orders/new')} className="bg-blue-600 hover:bg-blue-700">
              Create Order
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Demographics */}
        <div className="space-y-6">
          <Card className="border-gray-100 shadow-sm">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100">
              <CardTitle className="text-sm font-semibold text-gray-700">Patient Information</CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                  {patient.firstName.charAt(0)}{patient.lastName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{patient.firstName} {patient.lastName}</h3>
                  <Badge variant="outline" className="mt-1 font-mono">{patient.mrn}</Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-y-3 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600 w-24">Date of Birth:</span>
                  <span className="font-medium text-gray-900">
                    {patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Activity className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600 w-24">Gender:</span>
                  <span className="font-medium text-gray-900 capitalize">{patient.gender.toLowerCase()}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600 w-24">Phone:</span>
                  <span className="font-medium text-gray-900">{patient.phone || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600 w-24">Email:</span>
                  <span className="font-medium text-gray-900">{patient.email || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600 w-24">Registered:</span>
                  <span className="font-medium text-gray-900">{new Date(patient.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: History */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-gray-100 shadow-sm h-full">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100 flex flex-row items-center justify-between py-4">
              <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-600" />
                Order History
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {(!patient.orders || patient.orders.length === 0) ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="rounded-full bg-gray-50 p-4 mb-3">
                    <FileText className="h-8 w-8 text-gray-400" />
                  </div>
                  <h4 className="text-gray-900 font-medium">No Orders Yet</h4>
                  <p className="text-gray-500 text-sm max-w-sm mt-1">
                    This patient doesn&apos;t have any test orders in the system. Click &quot;Create Order&quot; to begin.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="px-4 py-3 font-medium">Order #</th>
                        <th className="px-4 py-3 font-medium">Date</th>
                        <th className="px-4 py-3 font-medium">Tests</th>
                        <th className="px-4 py-3 font-medium">Total</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {patient.orders.map((order, i) => (
                        <tr key={i} className="border-b last:border-0 hover:bg-gray-50/50">
                          <td className="px-4 py-3 font-semibold text-gray-900">{order.orderNumber}</td>
                          <td className="px-4 py-3 text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</td>
                          <td className="px-4 py-3">
                            <Badge variant="outline" className="bg-blue-50 text-blue-700">
                              {order._count?.items || order.items?.length || 0} Tests
                            </Badge>
                          </td>
                          <td className="px-4 py-3 font-medium">${order.totalAmount?.toFixed(2) || '0.00'}</td>
                          <td className="px-4 py-3">
                            <Badge variant="outline" className="bg-gray-50">
                              {order.orderStatus.replace('_', ' ')}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
