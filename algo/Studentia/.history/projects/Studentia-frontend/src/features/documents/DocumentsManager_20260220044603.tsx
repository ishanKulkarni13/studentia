import { useEffect } from 'react'
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
  const {
    store,
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
            Manage data groups, upload files, and review uploaded files grouped by category.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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

            <div className="flex items-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  void loadDataGroups()
                  void loadGroupedDocuments()
                }}
                disabled={store.isLoadingGroups || store.isLoadingDocuments}
                className="w-full md:w-auto"
              >
                Refresh Data
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">Student: {store.studentId || '—'}</Badge>
            <Badge variant="secondary">Group: {store.receiverGroup === 'Custom' ? store.customReceiverGroup || 'Custom' : store.receiverGroup}</Badge>
            <Badge variant="outline">Data Group: {store.selectedDataGroup || '—'}</Badge>
          </div>

          <Separator />

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

          <Separator />

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

          <div className="grid gap-4 md:grid-cols-[1fr_auto]">
            <div className="space-y-2">
              <Label htmlFor="fileUpload">File</Label>
              <Input
                id="fileUpload"
                type="file"
                onChange={(event) => store.setSelectedFile(event.target.files?.[0] || null)}
              />
            </div>

            <div className="flex items-end">
              <Button onClick={uploadSelectedFile} disabled={store.isUploading} className="w-full md:w-auto">
                {store.isUploading ? 'Uploading...' : 'Upload File'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

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
    </div>
  )
}
