'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { UserPlus, Upload, AlertCircle, CheckCircle } from 'lucide-react'
import { inviteUserToOrganization, bulkInviteUsers } from '@/actions/admin'

export function UserInviteForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [csvData, setCsvData] = useState('')

  const handleSingleInvite = async (formData: FormData) => {
    setIsLoading(true)
    setResult(null)

    try {
      const result = await inviteUserToOrganization(formData)
      setResult({ success: true, message: 'Invitation sent successfully!' })
    } catch (error: any) {
      setResult({ success: false, message: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  const handleBulkInvite = async (formData: FormData) => {
    setIsLoading(true)
    setResult(null)

    try {
      const result = await bulkInviteUsers(formData)
      setResult({
        success: true,
        message: `Processed ${result.total} invitations`,
        details: result,
      })
    } catch (error: any) {
      setResult({ success: false, message: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setCsvData(e.target?.result as string)
      }
      reader.readAsText(file)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Invite Users
        </CardTitle>
        <CardDescription>
          Add new users to your organization via email invitations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="single">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="single">Single Invitation</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Import</TabsTrigger>
          </TabsList>

          <TabsContent value="single" className="space-y-4">
            <form action={handleSingleInvite} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" name="firstName" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" name="lastName" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" name="email" type="email" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select name="role" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="trainee">Trainee</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="hr">HR</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department (Optional)</Label>
                  <Input id="department" name="department" />
                </div>
              </div>

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? 'Sending...' : 'Send Invitation'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="bulk" className="space-y-4">
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                <h4 className="font-medium text-blue-800 mb-2">CSV Format</h4>
                <p className="text-sm text-blue-700 mb-2">
                  Upload a CSV file with the following columns (header row required):
                </p>
                <code className="text-xs bg-blue-100 px-2 py-1 rounded">
                  email,firstname,lastname,role,department
                </code>
                <p className="text-xs text-blue-600 mt-2">
                  Roles: trainee, manager, hr, admin. Department is optional.
                </p>
              </div>

              <form action={handleBulkInvite} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="csvFile">Upload CSV File</Label>
                  <Input
                    id="csvFile"
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                  />
                </div>

                {csvData && (
                  <div className="space-y-2">
                    <Label htmlFor="csvPreview">CSV Preview</Label>
                    <Textarea
                      id="csvPreview"
                      value={csvData}
                      onChange={(e) => setCsvData(e.target.value)}
                      className="min-h-[200px] font-mono text-xs"
                    />
                  </div>
                )}

                <input type="hidden" name="csvData" value={csvData} />

                <Button type="submit" disabled={isLoading || !csvData} className="w-full">
                  <Upload className="h-4 w-4 mr-2" />
                  {isLoading ? 'Processing...' : 'Import Users'}
                </Button>
              </form>
            </div>
          </TabsContent>
        </Tabs>

        {result && (
          <Alert className={`mt-4 ${result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
            <div className="flex items-center gap-2">
              {result.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={result.success ? 'text-green-800' : 'text-red-800'}>
                {result.message}
              </AlertDescription>
            </div>

            {result.details && (
              <div className="mt-3 space-y-2">
                <div className="flex gap-4 text-sm">
                  <Badge variant="outline" className="text-green-700">
                    Success: {result.details.results.length}
                  </Badge>
                  <Badge variant="outline" className="text-red-700">
                    Failed: {result.details.errors.length}
                  </Badge>
                </div>

                {result.details.errors.length > 0 && (
                  <div className="text-xs text-red-700">
                    <p className="font-medium">Errors:</p>
                    <ul className="list-disc pl-4">
                      {result.details.errors.map((error: any, i: number) => (
                        <li key={i}>{error.email}: {error.error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}