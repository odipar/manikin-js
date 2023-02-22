import Immutable from 'immutable';
import { Id, Trs, Context } from './core';
import SHA256 from 'crypto-js/sha256';
import Base64 from 'crypto-js/enc-base64';


export class DefaultContext implements Context {
    objMap: Immutable.Map<Id<any>, any>
    oldMap: Immutable.Map<Id<any>, any>

    msg: any
    slf: any

    old: any
    obj: any

    id: number

    mk<O2>(obj: O2): Id<O2> {
        this.id = this.id + 1
        
        const mid = this.id as Id<O2>
        if (this.objMap.get(mid)) throw "Duplicate ID"

        this.objMap = this.objMap.set(mid, obj)
        return mid
    }
    val<O2>(val: O2): Id<O2> {
        const sVal = JSON.stringify(val)
        const cHash = Base64.stringify(SHA256(sVal)) as Id<O2>
        if (this.objMap.get(cHash) && (JSON.stringify(this.objMap.get(cHash)) != sVal)) { 
            throw `Different values map to same sha256 hash! + ${cHash}`
        }
        this.objMap = this.objMap.set(cHash, val)

        return cHash
    }
    
    /// Convenience function to 'change' obj
    chg(o: any): any {
        if (typeof this.obj == "object" && typeof o == 'object') return { ...this.obj, ...o}
        throw "only objects can be changed"
    }

    snd<I2 extends Id<O2>, O2, M2, R2>(id: I2, trs: () => Trs<I2, O2, M2, R2>, msg: M2): R2 {
        const _slf = this.slf
        const _msg = this.msg

        const _objMap = this.objMap
        const _oldMap = this.oldMap
        
        try {
            this.slf = id
            this.msg = msg
            this.obj = this.objMap.get(id)

            const t = trs()

            if (!t.pre(this)) throw `Pre condition failed: ${t.pre.toString()}`
            else {
                const old = this.obj
                const app = t.app(this)

                this.old = old
                this.oldMap = this.oldMap.set(id, old)
                this.obj = app
                this.objMap = this.objMap.set(id, app)

                const result = t.eff(this)

                if (!t.pst(this)) throw `Post condition failed: ${t.pst.toString()}`

                return result
            }
        }
        catch (error) {
            // rollback to previous obj, old map state
            this.objMap = _objMap
            this.oldMap = _oldMap
            throw error
        }
        finally {
            // re-instate previous values
            this.slf = _slf
            this.msg = _msg
            this.obj = this.$obj(_slf)
            this.old = this.$old(_slf)
        }
    }

    $obj<O2>(id: Id<O2>): O2 { return this.objMap.get(id) }

    $old<O2>(id: Id<O2>): O2 { return this.oldMap.get(id) }

    constructor() {
        this.objMap = Immutable.Map()
        this.oldMap = Immutable.Map()
        this.id = 0
    }
}
