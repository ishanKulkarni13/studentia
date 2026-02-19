type ConsentStatus = 'granted' | 'revoked'

type RecordEntry = {
  studentId: string
  receiverGroup: string
  dataGroup: string
  status: ConsentStatus
  txId: string
  encrypted?: {
    iv: string
    tag: string
    data: string
  }
}

class InMemoryStore {
  private records: RecordEntry[] = []

  add(entry: RecordEntry) {
    this.records.unshift(entry)
  }

  getByStudent(studentId: string) {
    return this.records.filter((r) => r.studentId === studentId)
  }
}

export const recordStore = new InMemoryStore()
