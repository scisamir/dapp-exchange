use aiken/hash.{Blake2b_224, Hash}
use aiken/transaction.{Transaction, ScriptContext, Spend, ValidityRange}
use aiken/transaction/credential.{VerificationKey}
use aiken/interval.{Finite}
use aiken/list

type Datum {
    lock_until: POSIXTime,
    locker: VerificationKeyHash,
}

type VerificationKeyHash =
    Hash<Blake2b_224, VerificationKey>

type POSIXTime =
    Int

validator {
    fn vesting(datum: Datum, _redeemer: Void, ctx: ScriptContext) -> Bool {
        when ctx.purpose is {
            Spend(_) ->
                and {
                    must_be_signed_by(ctx.transaction, datum.locker),
                    must_start_after(ctx.transaction.validity_range, datum.lock_until),
                }
            _ -> False
        }
    }
}

fn must_be_signed_by(transaction: Transaction, vk: VerificationKeyHash) {
        list.has(transaction.extra_signatories, vk)
}

fn must_start_after(range: ValidityRange, lock_expiration_time: POSIXTime) {
    when range.lower_bound.bound_type is {
        Finite(tx_earliest_time) -> lock_expiration_time <= tx_earliest_time
        _ -> False
    }
}