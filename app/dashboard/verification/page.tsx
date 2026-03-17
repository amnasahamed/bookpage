'use client'

import { useState } from 'react'
import { useToast } from '@/app/providers'
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Upload, 
  FileText,
  Video,
  Shield,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Camera,
  Home,
  User
} from 'lucide-react'
import { DashboardSidebar } from '@/components/shared/DashboardSidebar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

type VerificationStatus = 'not_started' | 'documents_uploaded' | 'call_scheduled' | 'under_review' | 'verified' | 'rejected'
type DocumentType = 'registration' | 'gst' | 'utility' | null

const timeSlots = [
  '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
]

const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
const MAX_FILE_SIZE_MB = 5

const VERIFICATION_STEPS = [
  { number: 1, label: 'Documents', icon: FileText },
  { number: 2, label: 'Video Call', icon: Video },
  { number: 3, label: 'Review', icon: Shield },
]

export default function VerificationPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [status, setStatus] = useState<VerificationStatus>('not_started')
  const [selectedDocType, setSelectedDocType] = useState<DocumentType>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const { addToast } = useToast()

  const handleFileSelect = async (file: File, docType: string) => {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      addToast({
        title: 'Invalid file type',
        description: 'Please upload JPG, PNG, or PDF files only',
        variant: 'destructive'
      })
      return
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      addToast({
        title: 'File too large',
        description: `Maximum file size is ${MAX_FILE_SIZE_MB}MB`,
        variant: 'destructive'
      })
      return
    }

    setIsUploading(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setUploadedFile(file)
    setIsUploading(false)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    await handleFileSelect(file, selectedDocType ?? '')
  }

  const handleDocumentSubmit = () => {
    if (!uploadedFile || !selectedDocType) return
    setStatus('documents_uploaded')
    setCurrentStep(2)
  }

  const handleScheduleCall = () => {
    if (!selectedDate || !selectedTime) return
    setStatus('call_scheduled')
    setCurrentStep(3)
  }

  const handleResubmit = () => {
    setStatus('not_started')
    setCurrentStep(1)
    setUploadedFile(null)
    setSelectedDocType(null)
    setRejectionReason('')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardSidebar />
      
      <main className="lg:ml-[260px] min-h-screen">
        <div className="p-6 lg:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Property Verification</h1>
            <p className="text-gray-500 mt-1">
              Complete verification to get the verified badge on your page
            </p>
          </div>

          {/* Stepper */}
          <div className="mb-8">
            <div className="flex items-center justify-center">
              {VERIFICATION_STEPS.map((step, index) => {
                const Icon = step.icon
                const isActive = currentStep === step.number
                const isCompleted = currentStep > step.number ||
                  (status === 'verified' && step.number <= 3) ||
                  (status === 'under_review' && step.number <= 2)
                const isLast = index === VERIFICATION_STEPS.length - 1

                return (
                  <div key={step.number} className="flex items-center">
                    <div className={cn(
                      'flex flex-col items-center',
                      isActive && 'text-trust-blue-600'
                    )}>
                      <div className={cn(
                        'h-12 w-12 rounded-full flex items-center justify-center border-2 transition-colors',
                        isCompleted 
                          ? 'bg-success-green-500 border-success-green-500 text-white'
                          : isActive
                            ? 'bg-trust-blue-600 border-trust-blue-600 text-white'
                            : 'bg-white border-gray-300 text-gray-400'
                      )}>
                        {isCompleted ? (
                          <CheckCircle className="h-6 w-6" />
                        ) : (
                          <Icon className="h-5 w-5" />
                        )}
                      </div>
                      <span className={cn(
                        'mt-2 text-sm font-medium',
                        isActive ? 'text-trust-blue-600' : 'text-gray-500'
                      )}>
                        {step.label}
                      </span>
                    </div>
                    {!isLast && (
                      <div className={cn(
                        'w-16 sm:w-24 h-0.5 mx-2 sm:mx-4',
                        isCompleted ? 'bg-success-green-500' : 'bg-gray-200'
                      )} />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Step 1: Documents */}
          {currentStep === 1 && (
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle>Upload Documents</CardTitle>
                <CardDescription>
                  Upload one of the following documents to verify your property
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Document Type Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <button
                    onClick={() => setSelectedDocType('registration')}
                    className={cn(
                      'p-4 border-2 rounded-xl text-left transition-colors',
                      selectedDocType === 'registration'
                        ? 'border-trust-blue-500 bg-trust-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <Home className="h-6 w-6 text-trust-blue-600 mb-2" />
                    <p className="font-medium text-gray-900">Property Registration</p>
                    <p className="text-xs text-gray-500 mt-1">Deed or registration certificate</p>
                  </button>

                  <button
                    onClick={() => setSelectedDocType('gst')}
                    className={cn(
                      'p-4 border-2 rounded-xl text-left transition-colors',
                      selectedDocType === 'gst'
                        ? 'border-trust-blue-500 bg-trust-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <FileText className="h-6 w-6 text-trust-blue-600 mb-2" />
                    <p className="font-medium text-gray-900">GSTIN Certificate</p>
                    <p className="text-xs text-gray-500 mt-1">Valid GST registration</p>
                  </button>

                  <button
                    onClick={() => setSelectedDocType('utility')}
                    className={cn(
                      'p-4 border-2 rounded-xl text-left transition-colors',
                      selectedDocType === 'utility'
                        ? 'border-trust-blue-500 bg-trust-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <Upload className="h-6 w-6 text-trust-blue-600 mb-2" />
                    <p className="font-medium text-gray-900">Utility Bill</p>
                    <p className="text-xs text-gray-500 mt-1">Recent electricity/water bill</p>
                  </button>
                </div>

                {/* Upload Area */}
                {selectedDocType && (
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-trust-blue-400 transition-colors">
                    <input
                      type="file"
                      id="document"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileUpload}
                      className="sr-only"
                    />
                    <label htmlFor="document" className="cursor-pointer block">
                      {isUploading ? (
                        <div className="flex flex-col items-center">
                          <div className="h-8 w-8 border-2 border-trust-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
                          <p className="text-gray-600">Uploading...</p>
                        </div>
                      ) : uploadedFile ? (
                        <div className="flex flex-col items-center">
                          <CheckCircle className="h-12 w-12 text-success-green-500 mb-3" />
                          <p className="font-medium text-gray-900">{uploadedFile.name}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                          <p className="text-sm text-trust-blue-600 mt-2">Click to change file</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <Upload className="h-12 w-12 text-gray-400 mb-3" />
                          <p className="font-medium text-gray-900">Click to upload</p>
                          <p className="text-sm text-gray-500 mt-1">
                            or drag and drop
                          </p>
                          <p className="text-xs text-gray-400 mt-3">
                            PDF, JPG, PNG up to 5MB
                          </p>
                        </div>
                      )}
                    </label>
                  </div>
                )}

                {/* Requirements */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Document Requirements:</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success-green-500" />
                      Clear, readable image or scan
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success-green-500" />
                      All corners visible
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success-green-500" />
                      Not expired or outdated
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success-green-500" />
                      Property address must match
                    </li>
                  </ul>
                </div>

                <div className="flex justify-end">
                  <Button 
                    onClick={handleDocumentSubmit}
                    disabled={!uploadedFile || isUploading}
                  >
                    Continue to Video Call
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Video Call */}
          {currentStep === 2 && (
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle>Schedule Video Call</CardTitle>
                <CardDescription>
                  Book a quick 60-second video call for verification
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* What to Expect */}
                <div className="bg-trust-blue-50 border border-trust-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-trust-blue-900 mb-3 flex items-center gap-2">
                    <Video className="h-5 w-5" />
                    What to expect
                  </h4>
                  <ul className="space-y-2 text-sm text-trust-blue-700">
                    <li className="flex items-start gap-2">
                      <span className="font-bold">1.</span>
                      Show your property signage or reception area
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold">2.</span>
                      Quick tour of the property (1-2 rooms)
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold">3.</span>
                      Brief identity verification
                    </li>
                  </ul>
                  <p className="text-sm text-trust-blue-600 mt-3">
                    The call will take approximately 60 seconds.
                  </p>
                </div>

                {/* Date Selection */}
                <div>
                  <Label className="text-sm font-medium text-gray-700">Select Date</Label>
                  <div className="mt-2">
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:border-trust-blue-500 focus:ring-2 focus:ring-trust-blue-100"
                    />
                  </div>
                </div>

                {/* Time Selection */}
                {selectedDate && (
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Select Time Slot</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                      {timeSlots.map((time) => (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={cn(
                            'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                            selectedTime === time
                              ? 'bg-trust-blue-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          )}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-between">
                  <Button 
                    variant="outline" 
                    onClick={() => setCurrentStep(1)}
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <Button 
                    onClick={handleScheduleCall}
                    disabled={!selectedDate || !selectedTime}
                  >
                    Schedule Call
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Review Status */}
          {currentStep === 3 && (
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle>Verification Status</CardTitle>
                <CardDescription>
                  Track your verification progress
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Status: Under Review */}
                {(status === 'call_scheduled' || status === 'under_review') && (
                  <div className="text-center py-8">
                    <div className="h-20 w-20 bg-warning-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Clock className="h-10 w-10 text-warning-amber-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Under Review
                    </h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                      Our team is reviewing your documents and video call.
                      This usually takes 24-48 hours.
                    </p>
                  </div>
                )}

                {/* Status: Verified */}
                {status === 'verified' && (
                  <div className="text-center py-8">
                    <div className="h-20 w-20 bg-success-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="h-10 w-10 text-success-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Verification Complete!
                    </h3>
                    <p className="text-gray-500 max-w-md mx-auto mb-6">
                      Your property has been verified. The verified badge will now appear on your page.
                    </p>
                    
                    {/* Verified Badge Preview */}
                    <div className="bg-gray-50 rounded-lg p-6 max-w-sm mx-auto">
                      <p className="text-sm text-gray-500 mb-3">Badge Preview</p>
                      <div className="flex items-center justify-center gap-2 bg-success-green-50 text-success-green-600 px-4 py-2 rounded-full inline-flex">
                        <Shield className="h-4 w-4" />
                        <span className="text-sm font-medium">Verified Property</span>
                      </div>
                    </div>

                    <div className="mt-6">
                      <Button onClick={() => window.location.href = '/dashboard'}>
                        Go to Dashboard
                      </Button>
                    </div>
                  </div>
                )}

                {/* Status: Rejected */}
                {status === 'rejected' && (
                  <div className="text-center py-8">
                    <div className="h-20 w-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <XCircle className="h-10 w-10 text-red-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Verification Failed
                    </h3>
                    <p className="text-gray-500 max-w-md mx-auto mb-4">
                      We couldn&apos;t verify your property at this time.
                    </p>
                    
                    {rejectionReason && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto mb-6">
                        <p className="text-sm text-red-700">
                          <span className="font-medium">Reason:</span> {rejectionReason}
                        </p>
                      </div>
                    )}

                    <div className="flex justify-center gap-3">
                      <Button onClick={handleResubmit}>
                        Try Again
                      </Button>
                      <Button variant="outline">
                        Contact Support
                      </Button>
                    </div>
                  </div>
                )}

                {/* Progress Summary */}
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="font-medium text-gray-900 mb-4">Verification Progress</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'h-6 w-6 rounded-full flex items-center justify-center',
                        status !== 'not_started' 
                          ? 'bg-success-green-500 text-white' 
                          : 'bg-gray-200 text-gray-400'
                      )}>
                        <CheckCircle className="h-4 w-4" />
                      </div>
                      <span className={cn(
                        'text-sm',
                        status !== 'not_started' ? 'text-gray-900' : 'text-gray-400'
                      )}>
                        Documents uploaded
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'h-6 w-6 rounded-full flex items-center justify-center',
                        status === 'call_scheduled' || status === 'under_review' || status === 'verified'
                          ? 'bg-success-green-500 text-white' 
                          : 'bg-gray-200 text-gray-400'
                      )}>
                        <CheckCircle className="h-4 w-4" />
                      </div>
                      <span className={cn(
                        'text-sm',
                        status === 'call_scheduled' || status === 'under_review' || status === 'verified'
                          ? 'text-gray-900' 
                          : 'text-gray-400'
                      )}>
                        Video call scheduled
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'h-6 w-6 rounded-full flex items-center justify-center',
                        status === 'verified'
                          ? 'bg-success-green-500 text-white' 
                          : status === 'rejected'
                            ? 'bg-red-500 text-white'
                            : 'bg-gray-200 text-gray-400'
                      )}>
                        {status === 'verified' ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : status === 'rejected' ? (
                          <XCircle className="h-4 w-4" />
                        ) : (
                          <Clock className="h-4 w-4" />
                        )}
                      </div>
                      <span className={cn(
                        'text-sm',
                        status === 'verified' || status === 'rejected'
                          ? 'text-gray-900' 
                          : 'text-gray-400'
                      )}>
                        {status === 'verified' 
                          ? 'Verification complete' 
                          : status === 'rejected'
                            ? 'Verification failed'
                            : 'Awaiting review'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
