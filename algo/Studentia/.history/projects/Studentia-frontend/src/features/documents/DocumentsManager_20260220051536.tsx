import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { useDocumentsFeature } from './useDocumentsFeature'

const DEFAULT_REQUEST_GROUPS = ['College', 'Recruiters']

export function DocumentsManager() {
  const [activeTab, setActiveTab] = useState<'upload' | 'files'>('upload')
  const [uploadStep, setUploadStep] = useState<1 | 2 | 3>(1)

  const {
    store,
    resolvedReceiverGroup,
    loadDataGroups,
    loadGroupedDocuments,
    createGroup,
    uploadSelectedFile,
  } = useDocumentsFeature()

  useEffect(() => {
    void loadDataGroups()
    void loadGroupedDocuments()
  }, [])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
          <CardDescription>
            Simplified flow for uploading and reviewing student documents.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap gap-2">
            <Button variant={activeTab === 'upload' ? 'default' : 'outline'} onClick={() => setActiveTab('upload')}>
              Upload Doc
            </Button>
            <Button variant={activeTab === 'files' ? 'default' : 'outline'} onClick={() => setActiveTab('files')}>
              Uploaded Files
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                void loadDataGroups()
                void loadGroupedDocuments()
              }}
              disabled={store.isLoadingGroups || store.isLoadingDocuments}
            >
              Refresh
            </Button>
          </div>

          <Separator />

          {activeTab === 'upload' && (
            <div className="space-y-5">
              <div className="grid gap-2 md:grid-cols-3">
                <Button variant={uploadStep === 1 ? 'default' : 'outline'} onClick={() => setUploadStep(1)} className="justify-start">
                  1. Upload Doc
                </Button>
                <Button variant={uploadStep === 2 ? 'default' : 'outline'} onClick={() => setUploadStep(2)} className="justify-start">
                  2. Select Group
                </Button>
                <Button variant={uploadStep === 3 ? 'default' : 'outline'} onClick={() => setUploadStep(3)} className="justify-start">
                  3. Confirm
                </Button>
              </div>

              {uploadStep === 1 && (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="studentId">Student ID</Label>
                      <Input
                        id="studentId"
                        value={store.studentId}
                        onChange={(event) => store.setStudentId(event.target.value)}
                        placeholder="student-001"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fileUpload">File</Label>
                      <Input
                        id="fileUpload"
                        type="file"
                        onChange={(event) => store.setSelectedFile(event.target.files?.[0] || null)}
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button onClick={() => setUploadStep(2)} disabled={!store.studentId.trim() || !store.selectedFile}>
                      Next: Select Group
                    </Button>
                  </div>
                </div>
              )}

              {uploadStep === 2 && (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Request Group</Label>
                      <Select value={store.receiverGroup} onValueChange={store.setReceiverGroup}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select request group" />
                        </SelectTrigger>
                        <SelectContent>
                          {DEFAULT_REQUEST_GROUPS.map((group) => (
                            <SelectItem key={group} value={group}>
                              {group}
                            </SelectItem>
                          ))}
                          <SelectItem value="Custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Data Group</Label>
                      <Select value={store.selectedDataGroup} onValueChange={store.setSelectedDataGroup}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select data group" />
                        </SelectTrigger>
                        <SelectContent>
                          {store.dataGroups.map((group) => (
                            <SelectItem key={group.id} value={group.name}>
                              {group.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {store.receiverGroup === 'Custom' && (
                    <div className="space-y-2">
                      <Label htmlFor="customReceiverGroup">Custom Request Group</Label>
                      <Input
                        id="customReceiverGroup"
                        value={store.customReceiverGroup}
                        onChange={(event) => store.setCustomReceiverGroup(event.target.value)}
                        placeholder="e.g. Scholarship Committee"
                      />
                    </div>
                  )}

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="customDataGroup">Add Custom Data Group</Label>
                      <Input
                        id="customDataGroup"
                        value={store.newDataGroupName}
                        onChange={(event) => store.setNewDataGroupName(event.target.value)}
                        placeholder="e.g. Research"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button onClick={createGroup} disabled={store.isCreatingGroup} className="w-full">
                        {store.isCreatingGroup ? 'Saving...' : 'Add Data Group'}
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {store.dataGroups.map((group) => (
                      <Badge key={group.id} variant={group.isCustom ? 'secondary' : 'outline'}>
                        {group.name}
                      </Badge>
                    ))}
                    {store.dataGroups.length === 0 && <Badge variant="outline">No data groups</Badge>}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={() => setUploadStep(1)}>
                      Back
                    </Button>
                    <Button onClick={() => setUploadStep(3)} disabled={!store.selectedDataGroup || !resolvedReceiverGroup}>
                      Next: Confirm
                    </Button>
                  </div>
                </div>
              )}

              {uploadStep === 3 && (
                <div className="space-y-4">
                  <div className="rounded-md border p-4">
                    <p className="mb-2 text-sm font-medium">Review before upload</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">Student: {store.studentId || '—'}</Badge>
                      <Badge variant="outline">File: {store.selectedFile?.name || '—'}</Badge>
                      <Badge variant="secondary">Request Group: {resolvedReceiverGroup || '—'}</Badge>
                      <Badge variant="outline">Data Group: {store.selectedDataGroup || '—'}</Badge>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={() => setUploadStep(2)}>
                      Back
                    </Button>
                    <Button onClick={uploadSelectedFile} disabled={store.isUploading}>
                      {store.isUploading ? 'Uploading...' : 'Confirm & Upload'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {activeTab === 'files' && (
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Files</CardTitle>
            <CardDescription>Grouped by data group for the selected student.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {store.groupedDocuments.length === 0 && (
              <div className="rounded-md border border-dashed p-6 text-sm text-muted-foreground">
                No files found for this student yet.
              </div>
            )}

            {store.groupedDocuments.map((group) => (
              <div key={group.dataGroup} className="space-y-2 rounded-lg border bg-card p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold">{group.dataGroup}</h3>
                  <Badge variant="outline">{group.count} file(s)</Badge>
                </div>

                <div className="overflow-x-auto rounded-md border">
                  <table className="w-full text-sm">
                    <thead className="border-b bg-muted/40 text-left">
                      <tr>
                        <th className="px-3 py-2 font-medium">File</th>
                        <th className="px-3 py-2 font-medium">Type</th>
                        <th className="px-3 py-2 font-medium">Size</th>
                        <th className="px-3 py-2 font-medium">Request Group</th>
                        <th className="px-3 py-2 font-medium">Storage</th>
                        <th className="px-3 py-2 font-medium">Shared</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.documents.map((document) => (
                        <tr key={document.id} className="border-b last:border-b-0">
                          <td className="px-3 py-2 font-medium">{document.fileName}</td>
                          <td className="px-3 py-2 text-muted-foreground">{document.mimeType}</td>
                          <td className="px-3 py-2">{Math.max(1, Math.round(document.sizeBytes / 1024))} KB</td>
                          <td className="px-3 py-2">{document.receiverGroup}</td>
                          <td className="px-3 py-2">
                            <Badge variant="secondary">{document.storageMode}</Badge>
                          </td>
                          <td className="px-3 py-2">{document.sharedWith.length}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
