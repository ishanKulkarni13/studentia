import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { useRequestersFeature } from './useRequestersFeature'

export function RequestersManager() {
  const [activeTab, setActiveTab] = useState<'create' | 'inbox' | 'sent' | 'setup'>('create')
  const {
    store,
    loadRequestGroups,
    loadMembers,
    loadAccessRequests,
    createGroup,
    addMember,
    toggleMemberStatus,
    createNewAccessRequest,
    approveRequest,
    rejectRequest,
  } = useRequestersFeature()

  useEffect(() => {
    void loadRequestGroups()
    void loadMembers()
    void loadAccessRequests()
  }, [])

  useEffect(() => {
    if (!store.selectedRequestGroup) return
    void loadMembers()
    void loadAccessRequests()
  }, [store.selectedRequestGroup])

  const requestStatusVariant = (status: string): 'success' | 'warning' | 'error' | 'secondary' => {
    const normalized = status.toLowerCase()
    if (normalized === 'approved') return 'success'
    if (normalized === 'rejected') return 'error'
    if (normalized === 'pending') return 'warning'
    return 'secondary'
  }

  const refreshAll = () => {
    void loadRequestGroups()
    void loadMembers()
    void loadAccessRequests()
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Access Requests</CardTitle>
          <CardDescription>Create, track, and process requests without switching through complex forms.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="studentId">Student ID</Label>
              <Input
                id="studentId"
                value={store.studentId}
                onChange={(event) => store.setStudentId(event.target.value)}
                placeholder="student-001"
              />
            </div>
            <div className="space-y-2">
              <Label>Selected Group</Label>
              <Select value={store.selectedRequestGroup} onValueChange={store.setSelectedRequestGroup}>
                <SelectTrigger>
                  <SelectValue placeholder="Select request group" />
                </SelectTrigger>
                <SelectContent>
                  {store.requestGroups.map((group) => (
                    <SelectItem key={group.id} value={group.name}>
                      {group.name} ({group.memberCount})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                className="w-full"
                onClick={refreshAll}
                disabled={store.isLoadingGroups || store.isLoadingMembers || store.isLoadingRequests}
              >
                Refresh
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">Student: {store.studentId || '—'}</Badge>
            <Badge variant="secondary">Group: {store.selectedRequestGroup || '—'}</Badge>
            <Badge variant="outline">Members: {store.members.length}</Badge>
            <Badge variant="outline">Student Requests: {(store.studentRequests || []).length}</Badge>
          </div>

          <Separator />

          <div className="grid gap-2 md:grid-cols-4">
            <Button variant={activeTab === 'create' ? 'default' : 'outline'} onClick={() => setActiveTab('create')}>
              Create Request
            </Button>
            <Button variant={activeTab === 'inbox' ? 'default' : 'outline'} onClick={() => setActiveTab('inbox')}>
              Inbox
            </Button>
            <Button variant={activeTab === 'sent' ? 'default' : 'outline'} onClick={() => setActiveTab('sent')}>
              Sent
            </Button>
            <Button variant={activeTab === 'setup' ? 'default' : 'outline'} onClick={() => setActiveTab('setup')}>
              Setup
            </Button>
          </div>

          {activeTab === 'create' && (
            <div className="space-y-5">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">New Access Request</CardTitle>
                  <CardDescription>Create a request for the selected group.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="dataGroup">Data Group</Label>
                      <Input
                        id="dataGroup"
                        value={store.accessDataGroup}
                        onChange={(event) => store.setAccessDataGroup(event.target.value)}
                        placeholder="Portfolio"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="purpose">Purpose</Label>
                      <Input
                        id="purpose"
                        value={store.accessPurpose}
                        onChange={(event) => store.setAccessPurpose(event.target.value)}
                        placeholder="Screening"
                      />
                    </div>
                  </div>

                  <Button onClick={createNewAccessRequest} disabled={store.isSubmittingRequest}>
                    {store.isSubmittingRequest ? 'Creating...' : 'Create Access Request'}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Approve or Reject</CardTitle>
                  <CardDescription>Pick a request from Inbox, then process it here.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="requestId">Request ID</Label>
                      <Input
                        id="requestId"
                        value={store.accessRequestId}
                        onChange={(event) => store.setAccessRequestId(event.target.value)}
                        placeholder="Select from Inbox or paste request id"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rejectReason">Reject Reason</Label>
                      <Input
                        id="rejectReason"
                        value={store.rejectReason}
                        onChange={(event) => store.setRejectReason(event.target.value)}
                        placeholder="Optional reason"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button onClick={approveRequest} disabled={store.isUpdatingRequest}>
                      {store.isUpdatingRequest ? 'Updating...' : 'Approve Request'}
                    </Button>
                    <Button onClick={rejectRequest} variant="destructive" disabled={store.isUpdatingRequest}>
                      {store.isUpdatingRequest ? 'Updating...' : 'Reject Request'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'inbox' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Student Inbox</CardTitle>
                <CardDescription>Incoming requests for this student.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto rounded-md border">
                  <table className="w-full text-sm">
                    <thead className="border-b bg-muted/40 text-left">
                      <tr>
                        <th className="px-3 py-2 font-medium">ID</th>
                        <th className="px-3 py-2 font-medium">Requester Group</th>
                        <th className="px-3 py-2 font-medium">Data Group</th>
                        <th className="px-3 py-2 font-medium">Status</th>
                        <th className="px-3 py-2 font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(store.studentRequests || []).map((request, index) => {
                        const requestId = (request.id || request._id || `student-${index}`).toString()
                        return (
                          <tr key={requestId} className="border-b last:border-b-0">
                            <td className="px-3 py-2">{requestId}</td>
                            <td className="px-3 py-2">{request.requesterGroup}</td>
                            <td className="px-3 py-2">{request.dataGroup}</td>
                            <td className="px-3 py-2">
                              <Badge variant={requestStatusVariant(request.status)}>{request.status}</Badge>
                            </td>
                            <td className="px-3 py-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  store.setAccessRequestId(requestId)
                                  setActiveTab('create')
                                }}
                              >
                                Process
                              </Button>
                            </td>
                          </tr>
                        )
                      })}
                      {(store.studentRequests || []).length === 0 && (
                        <tr>
                          <td className="px-3 py-4 text-muted-foreground" colSpan={5}>
                            No student requests found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'sent' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sent Requests</CardTitle>
                <CardDescription>Requests created by the selected requester group.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto rounded-md border">
                  <table className="w-full text-sm">
                    <thead className="border-b bg-muted/40 text-left">
                      <tr>
                        <th className="px-3 py-2 font-medium">ID</th>
                        <th className="px-3 py-2 font-medium">Student</th>
                        <th className="px-3 py-2 font-medium">Data Group</th>
                        <th className="px-3 py-2 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(store.requesterRequests || []).map((request, index) => {
                        const requestId = (request.id || request._id || `requester-${index}`).toString()
                        return (
                          <tr key={requestId} className="border-b last:border-b-0">
                            <td className="px-3 py-2">{requestId}</td>
                            <td className="px-3 py-2">{request.studentId}</td>
                            <td className="px-3 py-2">{request.dataGroup}</td>
                            <td className="px-3 py-2">
                              <Badge variant={requestStatusVariant(request.status)}>{request.status}</Badge>
                            </td>
                          </tr>
                        )
                      })}
                      {(store.requesterRequests || []).length === 0 && (
                        <tr>
                          <td className="px-3 py-4 text-muted-foreground" colSpan={4}>
                            No requester requests found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'setup' && (
            <div className="space-y-5">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Request Groups</CardTitle>
                  <CardDescription>Create and select groups used for requests.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="newRequestGroup">Add Custom Request Group</Label>
                      <Input
                        id="newRequestGroup"
                        value={store.newRequestGroupName}
                        onChange={(event) => store.setNewRequestGroupName(event.target.value)}
                        placeholder="e.g. Scholarship Committee"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button className="w-full" onClick={createGroup} disabled={store.isSavingGroup}>
                        {store.isSavingGroup ? 'Saving...' : 'Add Group'}
                      </Button>
                    </div>
                  </div>

                  <div className="overflow-x-auto rounded-md border">
                    <table className="w-full text-sm">
                      <thead className="border-b bg-muted/40 text-left">
                        <tr>
                          <th className="px-3 py-2 font-medium">Group</th>
                          <th className="px-3 py-2 font-medium">Type</th>
                          <th className="px-3 py-2 font-medium">Members</th>
                          <th className="px-3 py-2 font-medium">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {store.requestGroups.map((group) => {
                          const isSelected = store.selectedRequestGroup === group.name
                          return (
                          <tr key={group.id} className={`border-b last:border-b-0 ${isSelected ? 'bg-muted/30' : ''}`}>
                            <td className="px-3 py-2">{group.name}</td>
                            <td className="px-3 py-2">
                              <Badge variant={group.isCustom ? 'secondary' : 'outline'}>
                                {group.isCustom ? 'Custom' : 'Default'}
                              </Badge>
                            </td>
                            <td className="px-3 py-2">{group.memberCount}</td>
                            <td className="px-3 py-2">
                              <Button
                                size="sm"
                                variant={isSelected ? 'default' : 'outline'}
                                onClick={() => store.setSelectedRequestGroup(group.name)}
                              >
                                {isSelected ? 'Selected' : 'Select'}
                              </Button>
                            </td>
                          </tr>
                        )})}
                        {store.requestGroups.length === 0 && (
                          <tr>
                            <td className="px-3 py-4 text-muted-foreground" colSpan={4}>
                              No request groups found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Members</CardTitle>
                  <CardDescription>Add and manage identities inside the selected group.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="memberName">Member Name</Label>
                      <Input
                        id="memberName"
                        value={store.memberDisplayName}
                        onChange={(event) => store.setMemberDisplayName(event.target.value)}
                        placeholder="e.g. Asha Verma"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="memberEmail">Email</Label>
                      <Input
                        id="memberEmail"
                        value={store.memberEmail}
                        onChange={(event) => store.setMemberEmail(event.target.value)}
                        placeholder="asha@company.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="memberWallet">Wallet Address</Label>
                      <Input
                        id="memberWallet"
                        value={store.memberWalletAddress}
                        onChange={(event) => store.setMemberWalletAddress(event.target.value)}
                        placeholder="Optional wallet address"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="memberOrg">Organization</Label>
                      <Input
                        id="memberOrg"
                        value={store.memberOrganization}
                        onChange={(event) => store.setMemberOrganization(event.target.value)}
                        placeholder="e.g. Acme Talent"
                      />
                    </div>
                  </div>

                  <Button onClick={addMember} disabled={store.isSavingMember}>
                    {store.isSavingMember ? 'Adding...' : 'Add Member'}
                  </Button>

                  <div className="overflow-x-auto rounded-md border">
                    <table className="w-full text-sm">
                      <thead className="border-b bg-muted/40 text-left">
                        <tr>
                          <th className="px-3 py-2 font-medium">Name</th>
                          <th className="px-3 py-2 font-medium">Email</th>
                          <th className="px-3 py-2 font-medium">Organization</th>
                          <th className="px-3 py-2 font-medium">Status</th>
                          <th className="px-3 py-2 font-medium">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {store.members.map((member) => (
                          <tr key={member.id} className="border-b last:border-b-0">
                            <td className="px-3 py-2">{member.displayName}</td>
                            <td className="px-3 py-2">{member.email || '—'}</td>
                            <td className="px-3 py-2">{member.organization || '—'}</td>
                            <td className="px-3 py-2">
                              <Badge variant={member.status === 'active' ? 'success' : 'warning'}>{member.status}</Badge>
                            </td>
                            <td className="px-3 py-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  toggleMemberStatus(member.id, member.status === 'active' ? 'inactive' : 'active')
                                }
                              >
                                Set {member.status === 'active' ? 'Inactive' : 'Active'}
                              </Button>
                            </td>
                          </tr>
                        ))}
                        {store.members.length === 0 && (
                          <tr>
                            <td className="px-3 py-4 text-muted-foreground" colSpan={5}>
                              No members found for {store.selectedRequestGroup || 'this group'}.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
