'use client'

import { useState, useCallback, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  X,
  Zap,
  Settings,
  CreditCard
} from 'lucide-react'
import Link from 'next/link'
import { useDropzone } from 'react-dropzone'
import { uploadPOFile, pollPOUploadStatus, type POUpload } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

interface UploadedFile {
  file: File
  id: string
  status: 'uploading' | 'processing' | 'completed' | 'failed'
  progress: number
  uploadId?: string
  result?: {
    po_number: string
    vendor_name: string
    total_amount: number
    line_items: number
  }
  error?: string
}

export default function UploadPage() {
  const { user } = useAuth()
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [credits, setCredits] = useState(8) // This should come from API
  const [isUploading, setIsUploading] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      status: 'uploading' as const,
      progress: 0
    }))

    setFiles(prev => [...prev, ...newFiles])

    // Process each file
    newFiles.forEach(uploadedFile => {
      processFileUpload(uploadedFile)
    })
  }, [])

  const processFileUpload = async (uploadedFile: UploadedFile) => {
    try {
      setIsUploading(true)
      
      // Upload file to Supabase
      const result = await uploadPOFile(uploadedFile.file)
      
      if (!result.success) {
        throw new Error(result.error || 'Upload failed')
      }

      // Update file with upload ID
      setFiles(prev => prev.map(f => 
        f.id === uploadedFile.id 
          ? { ...f, uploadId: result.upload!.id, progress: 100, status: 'processing' }
          : f
      ))

      // Start polling for status
      if (result.upload) {
        pollPOUploadStatus(
          result.upload.id,
          (upload) => {
            setFiles(prev => prev.map(f => 
              f.uploadId === upload.id ? {
                ...f,
                status: upload.status,
                progress: upload.status === 'processing' ? 75 : upload.status === 'completed' ? 100 : 50,
                error: upload.error_message,
                result: upload.extracted_data ? {
                  po_number: upload.extracted_data.po_number || 'N/A',
                  vendor_name: upload.extracted_data.vendor_name || 'N/A',
                  total_amount: upload.extracted_data.total_amount || 0,
                  line_items: upload.extracted_data.line_items || 0
                } : undefined
              } : f
            ))
          },
          (upload) => {
            // Processing complete
            if (upload.status === 'completed') {
              setCredits(prev => Math.max(0, prev - 1))
            }
          },
          (error) => {
            setFiles(prev => prev.map(f => 
              f.id === uploadedFile.id ? { ...f, status: 'failed', error } : f
            ))
          }
        )
      }

    } catch (error) {
      console.error('File upload error:', error)
      setFiles(prev => prev.map(f => 
        f.id === uploadedFile.id 
          ? { 
              ...f, 
              status: 'failed', 
              error: error instanceof Error ? error.message : 'Upload failed'
            } 
          : f
      ))
    } finally {
      setIsUploading(false)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'message/rfc822': ['.eml'],
      'text/plain': ['.txt']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
  })

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId))
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'uploading':
      case 'processing':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'uploading':
      case 'processing':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Zap className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <h1 className="text-xl font-semibold text-gray-900">TradeFlow AI</h1>
              </div>
            </div>
            
            <nav className="hidden md:flex space-x-8">
              <a href="/dashboard" className="text-gray-500 hover:text-gray-700">Dashboard</a>
              <a href="/upload" className="text-blue-600 font-medium">Upload PO</a>
              <a href="/integrations" className="text-gray-500 hover:text-gray-700">Integrations</a>
              <a href="/billing" className="text-gray-500 hover:text-gray-700">Billing</a>
            </nav>

            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-sm">
                {credits} credits left
              </Badge>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Sign Out</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Upload Purchase Orders</h1>
          <p className="mt-2 text-gray-600">
            Upload your PO files and let AI extract the data automatically
          </p>
        </div>

        {/* Credits Warning */}
        {credits <= 2 && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You're running low on credits ({credits} remaining). 
              <Link href="/billing" className="font-medium text-blue-600 hover:text-blue-500 ml-1">
                Upgrade your plan
              </Link> to continue processing.
            </AlertDescription>
          </Alert>
        )}

        {/* Upload Area */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Upload Files</CardTitle>
            <CardDescription>
              Drag and drop your PO files here, or click to browse. Supports PDF, EML, and TXT files up to 10MB.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive 
                  ? 'border-blue-400 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} disabled={isUploading} />
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              {isDragActive ? (
                <p className="text-lg text-blue-600">Drop the files here...</p>
              ) : (
                <>
                  <p className="text-lg text-gray-600 mb-2">
                    {isUploading ? 'Uploading files...' : 'Drag & drop files here, or'}{' '}
                    <span className="text-blue-600 font-medium">
                      {isUploading ? 'please wait' : 'browse'}
                    </span>
                  </p>
                  <p className="text-sm text-gray-500">
                    PDF, EML, TXT files up to 10MB each
                  </p>
                </>
              )}
            </div>

            {/* Supported Formats */}
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="secondary">PDF Documents</Badge>
              <Badge variant="secondary">Email Files (.eml)</Badge>
              <Badge variant="secondary">Text Files (.txt)</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Processing Files */}
        {files.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Processing Files</CardTitle>
              <CardDescription>
                Track the progress of your uploaded files
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {files.map((uploadedFile) => (
                  <div key={uploadedFile.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(uploadedFile.status)}
                        <div>
                          <p className="font-medium text-gray-900">{uploadedFile.file.name}</p>
                          <p className="text-sm text-gray-500">
                            {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(uploadedFile.status)}>
                          {uploadedFile.status === 'uploading' && 'Uploading'}
                          {uploadedFile.status === 'processing' && 'Processing'}
                          {uploadedFile.status === 'completed' && 'Completed'}
                          {uploadedFile.status === 'failed' && 'Failed'}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(uploadedFile.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {(uploadedFile.status === 'uploading' || uploadedFile.status === 'processing') && (
                      <div className="mb-3">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>
                            {uploadedFile.status === 'uploading' ? 'Uploading to cloud...' : 'Processing with AI...'}
                          </span>
                          <span>{uploadedFile.progress}%</span>
                        </div>
                        <Progress value={uploadedFile.progress} className="h-2" />
                      </div>
                    )}

                    {/* Results */}
                    {uploadedFile.status === 'completed' && uploadedFile.result && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h4 className="font-medium text-green-900 mb-2">Extraction Results</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">PO Number:</span>
                            <span className="ml-2 font-medium">{uploadedFile.result.po_number}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Vendor:</span>
                            <span className="ml-2 font-medium">{uploadedFile.result.vendor_name}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Total Amount:</span>
                            <span className="ml-2 font-medium">₹{uploadedFile.result.total_amount.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Line Items:</span>
                            <span className="ml-2 font-medium">{uploadedFile.result.line_items}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Error */}
                    {uploadedFile.status === 'failed' && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-800 text-sm">
                          {uploadedFile.error || 'Failed to process file. Please try again.'}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Help Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Supported File Types</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• PDF documents with purchase order data</li>
                  <li>• Email files (.eml) containing PO information</li>
                  <li>• Text files (.txt) with structured PO data</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Processing Tips</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Ensure files are clear and readable</li>
                  <li>• Each file costs 1 processing credit</li>
                  <li>• Processing typically takes 30-60 seconds</li>
                  <li>• Results are automatically saved to your dashboard</li>
                  <li>• Files are stored securely in cloud storage</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
