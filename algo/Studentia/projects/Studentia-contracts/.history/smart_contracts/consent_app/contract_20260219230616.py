from algopy import ARC4Contract, BoxMap, String, UInt64
from algopy.arc4 import abimethod


class ConsentApp(ARC4Contract):
    # Box-backed consent map: key = student:receiver:data, value = 1 (granted) or 0 (revoked)
    consents: BoxMap[String, UInt64]

    def _make_key(self, student_id: String, receiver_group: String, data_group: String) -> String:
        return student_id + ":" + receiver_group + ":" + data_group

    @abimethod()
    def grant_consent(self, student_id: String, receiver_group: String, data_group: String) -> String:
        key = self._make_key(student_id, receiver_group, data_group)
        self.consents[key] = UInt64(1)
        return "GRANTED:" + key

    @abimethod()
    def revoke_consent(self, student_id: String, receiver_group: String, data_group: String) -> String:
        key = self._make_key(student_id, receiver_group, data_group)
        self.consents[key] = UInt64(0)
        return "REVOKED:" + key

    @abimethod(readonly=True)
    def get_consent(self, student_id: String, receiver_group: String, data_group: String) -> String:
        key = self._make_key(student_id, receiver_group, data_group)
        status, exists = self.consents.maybe(key)
        if not exists:
            return "NONE:" + key
        return ("GRANTED:" if status == UInt64(1) else "REVOKED:") + key
