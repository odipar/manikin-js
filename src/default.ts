import Immutable from 'immutable';
import { Id, Trs, Context } from './core';

/* A minimal (mutable!) Manikin Context implementation */
export class DefaultContext implements Context {
    objMap: Map<Id<any>, any>
    oldMap: Map<Id<any>, any>

    msg: any
    slf: any

    old: any
    obj: any

    id: number

    mk<O2>(obj: O2): Id<O2> {
        this.id = this.id + 1
        
        const mid = this.id as Id<O2>
        if (this.objMap.get(mid)) throw "Duplicate ID"

        this.objMap.set(mid, obj)
        return mid
    }
    val<O2>(val: O2): Id<O2> {
        const sVal = JSON.stringify(val)
        const cHash = sVal as Id<O2>
        if (this.objMap.get(cHash) && (JSON.stringify(this.objMap.get(cHash)) != sVal)) { 
            throw `Different values map to same value content + ${cHash}`
        }
        this.objMap.set(cHash, val)

        return cHash
    }
    
    /// Convenience function to 'change' obj
    chg(o: any): any {
        if (typeof this.obj == "object" && typeof o == 'object') return { ...this.obj, ...o}
        throw "only objects can be changed"
    }

    snd<O2, M2, R2>(id: Id<O2>, trs: () => Trs<O2, M2, R2>, msg: M2): R2 {
        const _slf = this.slf
        const _msg = this.msg
        const _obj = this.obj
        const _old = this.old
        
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
                this.oldMap.set(id, old)
                this.obj = app
                this.objMap.set(id, app)

                const result = t.eff(this)

                if (!t.pst(this)) throw `Post condition failed: ${t.pst.toString()}`

                return result
            }
        }
        catch (error) {
            // rollback to previous obj, old map state
            this.obj = _obj
            this.old = _old
            this.slf = _slf
            this.objMap.set(_slf, _obj)
            this.oldMap.set(_slf, _old)
            throw error
        }
        finally {
            // re-instate previous values
            this.obj = _obj
            this.old = _old
            this.slf = _slf
            this.msg = _msg
        }
    }

    $obj<O2>(id: Id<O2>): O2 { return this.objMap.get(id) }

    $old<O2>(id: Id<O2>): O2 { return this.oldMap.get(id) }

    constructor() {
        this.objMap = new Map()
        this.oldMap = new Map()
        this.id = 0
    }
}
