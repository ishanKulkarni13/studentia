import { useEffect } from 'react'
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Request Groups & Members</CardTitle>
          <CardDescription>
            Manage who can request student data by organizing requester identities into request groups.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="studentId">Student ID</Label>
              <Input
                id="studentId"
                value={store.studentId}
                onChange={(event) => store.setStudentId(event.target.value)}
                placeholder="student-001"
              />
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  void loadRequestGroups()
                  void loadMembers()
                  void loadAccessRequests()
                }}
                disabled={store.isLoadingGroups || store.isLoadingMembers || store.isLoadingRequests}
              >
                Refresh
              </Button>
            </div>
          </div>

          <Separator />

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

          <div className="space-y-2">
            <Label>Selected Request Group</Label>
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

          <div className="flex flex-wrap gap-2">
            {store.requestGroups.map((group) => (
              <Badge key={group.id} variant={group.isCustom ? 'secondary' : 'outline'}>
                {group.name} • {group.memberCount}
              </Badge>
            ))}
          </div>

          <Separator />

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
            {store.isSavingMember ? 'Adding...' : 'Add Member to Group'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Group Members</CardTitle>
          <CardDescription>Active and inactive identities for {store.selectedRequestGroup}.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {store.members.length === 0 && (
            <div className="rounded-md border border-dashed p-5 text-sm text-muted-foreground">
              No members found in this request group.
            </div>
          )}

          {store.members.map((member) => (
            <div key={member.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-3">
              <div>
                <p className="font-medium">{member.displayName}</p>
                <p className="text-xs text-muted-foreground">{member.email || 'No email'} • {member.organization || 'No org'}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={member.status === 'active' ? 'success' : 'warning'}>{member.status}</Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toggleMemberStatus(member.id, member.status === 'active' ? 'inactive' : 'active')}
                >
                  Set {member.status === 'active' ? 'Inactive' : 'Active'}
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Access Requests</CardTitle>
          <CardDescription>Create and process requests for selected request group.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
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

          <Separator />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="requestId">Request ID</Label>
              <Input
                id="requestId"
                value={store.accessRequestId}
                onChange={(event) => store.setAccessRequestId(event.target.value)}
                placeholder="Paste request id"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rejectReason">Reject Reason</Label>
              <Input
                id="rejectReason"
                value={store.rejectReason}
                onChange={(event) => store.setRejectReason(event.target.value)}
                placeholder="Not required right now"
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

          <Separator />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h3 className="font-semibold">Student Inbox</h3>
              {(store.studentRequests || []).map((request, index) => (
                <div
                  key={(request.id || request._id || `student-${index}`).toString()}
                  className="rounded-md border p-3"
                >
                  <p className="text-sm font-medium">{request.requesterGroup} → {request.dataGroup}</p>
                  <p className="text-xs text-muted-foreground">Status: {request.status}</p>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold">Requester View</h3>
              {(store.requesterRequests || []).map((request, index) => (
                <div
                  key={(request.id || request._id || `requester-${index}`).toString()}
                  className="rounded-md border p-3"
                >
                  <p className="text-sm font-medium">{request.studentId} / {request.dataGroup}</p>
                  <p className="text-xs text-muted-foreground">Status: {request.status}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
