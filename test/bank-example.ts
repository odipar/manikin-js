
import { Id, Trs } from "../src/core"

export type Account = { readonly balance: number }
export type AccountTrs<M> = Trs<Account, M, void>

export function Deposit(): AccountTrs<number> {
    return {
        pre: (_) => _.msg > 0,
        app: (_) => _.chg({balance: _.obj.balance + _.msg}),
        eff: (_) => { },
        pst: (_) => _.obj.balance == _.old.balance + _.msg,
    }
}

export function Withdraw(): AccountTrs<number> {
    return {
        pre: (_) => _.msg > 0 && _.obj.balance >= _.msg,
        app: (_) => _.chg({balance: _.obj.balance - _.msg}),
        eff: (_) => { },
        pst: (_) => _.obj.balance == _.old.balance - _.msg,
    }
}

export type Transaction = { readonly from: Id<Account>, readonly to: Id<Account>, readonly amount: number }

export function Transfer(): Trs<Transaction, null, void> {
    return {
        pre: (_) => _.obj.amount > 0,
        app: (_) => _.obj,
        eff: (_) => {
            _.snd(_.obj.from, Withdraw, _.obj.amount)
            _.snd(_.obj.to, Deposit, _.obj.amount)
        },
        pst: (_) => // don't lose any money!
            _.$obj(_.obj.from).balance + _.$obj(_.obj.to).balance === 
            _.$old(_.obj.from).balance + _.$old(_.obj.to).balance
        
    }
}
