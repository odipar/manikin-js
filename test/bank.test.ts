import { DefaultContext } from "../src/default"
import { Transfer } from "./bank-example"

test("Execute a million bank transfers with pre/post condition checks", () => {
    const _ = new DefaultContext()
    
    const a1 = _.mk({name: "rob", balance: 20000000})
    const a2 = _.mk({name: "kev", balance: 30000000})
    const t1 = _.mk({tid: 0, from: a1, to: a2, amount: 1})
    const million = 1000000
    
    for (var i = 0; i < million; i++) {
        _.snd(t1, Transfer, null)
    }

    expect(_.$obj(a1).balance).toEqual(20000000 - million)
    expect(_.$obj(a2).balance).toEqual(30000000 + million)
});