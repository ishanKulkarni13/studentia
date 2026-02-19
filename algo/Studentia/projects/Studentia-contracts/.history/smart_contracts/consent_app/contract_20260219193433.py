from algopy import ARC4Contract, String
from algopy.arc4 import abimethod


class ConsentApp(ARC4Contract):
    @abimethod()
    def grant_consent(self, student_id: String, receiver_group: String, data_group: String) -> String:
        """Record a grant event; keep payload minimal for audit only."""
        return "GRANTED:" + student_id + ":" + receiver_group + ":" + data_group

    @abimethod()
    def revoke_consent(self, student_id: String, receiver_group: String, data_group: String) -> String:
        """Record a revoke event; keep payload minimal for audit only."""
        return "REVOKED:" + student_id + ":" + receiver_group + ":" + data_group
