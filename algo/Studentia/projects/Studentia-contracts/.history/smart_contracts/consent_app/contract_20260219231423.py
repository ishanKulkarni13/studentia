from algopy import ARC4Contract, Box, String, UInt64
from algopy.arc4 import abimethod


class ConsentApp(ARC4Contract):
    # Box-backed consent map per composite key: 1 (granted) or 0 (revoked)

    def _make_key(self, student_id: String, receiver_group: String, data_group: String) -> String:
        return student_id + ":" + receiver_group + ":" + data_group

    def _box_for(self, key: String) -> Box[UInt64]:
        # Creates a lightweight Box reference; creation happens lazily in grant/revoke
        return Box(UInt64, key=key)

    @abimethod()
    def grant_consent(self, student_id: String, receiver_group: String, data_group: String) -> String:
        key = self._make_key(student_id, receiver_group, data_group)
        consent_box = self._box_for(key)
        if not consent_box:
            consent_box.create()
        consent_box.value = UInt64(1)
        return "GRANTED:" + key

    @abimethod()
    def revoke_consent(self, student_id: String, receiver_group: String, data_group: String) -> String:
        key = self._make_key(student_id, receiver_group, data_group)
        consent_box = self._box_for(key)
        if not consent_box:
            consent_box.create()
        consent_box.value = UInt64(0)
        return "REVOKED:" + key

    @abimethod(readonly=True)
    def get_consent(self, student_id: String, receiver_group: String, data_group: String) -> String:
        key = self._make_key(student_id, receiver_group, data_group)
        consent_box = self._box_for(key)
        if not consent_box:
            return "NONE:" + key
        status = consent_box.value
        return ("GRANTED:" if status == UInt64(1) else "REVOKED:") + key
