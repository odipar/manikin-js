import { Id, Trs } from "./core"
import { DefaultContext } from "./default"

type Account = { readonly balance: number }
type AccountId = Id<Account>
type AccountTrs<M> = Trs<AccountId, Account, M, void>

function Deposit(): AccountTrs<number> {
    return {
        pre: (_) => _.msg > 0,
        app: (_) => _.chg({balance: _.obj.balance + _.msg}),
        eff: (_) => { },
        pst: (_) => _.obj.balance == _.old.balance + _.msg,
    }
}


function Withdraw(): AccountTrs<number> {
    return {
        pre: (_) => _.msg > 0 && _.obj.balance >= _.msg,
        app: (_) => _.chg({balance: _.obj.balance - _.msg}),
        eff: (_) => { },
        pst: (_) => _.obj.balance == _.old.balance - _.msg,
    }
}

type Transaction = { readonly from: AccountId, readonly to: AccountId, readonly amount: number }
type TransactionId = Id<Transaction>
type TransactionTrs<M> = Trs<TransactionId, Transaction, M, void>

function Transfer(): TransactionTrs<null> {
    return {
        pre: (_) => _.obj.amount > 0,
        app: (_) => _.obj,
        eff: (_) => {
            _.snd(_.obj.from, Withdraw, _.obj.amount)
            _.snd(_.obj.to, Deposit, _.obj.amount)
        },
        pst: (_) => 
            _.$obj(_.obj.from).balance + _.$obj(_.obj.to).balance === 
            _.$old(_.obj.from).balance + _.$old(_.obj.to).balance
        
    }
}


export function runExample() {
    interface MyTransaction extends Transaction { tid: number} 

    const _ = new DefaultContext()
    
    const n1 = _.val<number>(1)
    console.log("n1: " + n1)

    const account1 = {name: "rob", balance: 20000000}
    const account2 = {name: "kev", balance: 30000000}

    const a1 = _.mk(account1)
    const a2 = _.mk<Account>(account2)

    const trans1 = {tid: 1, from: a1, to: a2, amount: 1}
    const t1 = _.mk<Transaction>(trans1)

    for (var i = 0; i < 10000000; i++) {
        _.snd(t1, Transfer, null)
        if ((i % 1000000) == 0) console.log("i: " + i)
    }
    console.log(_.objMap.toJSON())
}