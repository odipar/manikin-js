import { Id, Trs, Context } from './core';

/* 
 * A minimal (mutable!) Manikin Context implementation
 * Note that everything is untyped!
 */

/* eslint-disable */
export class DefaultContext implements Context {
    objMap: Map<any, any>
    oldMap: Map<any, any>

    msg: any
    slf: any

    old: any
    obj: any

    id: number

    mk<O>(obj: O): Id<O> {
        // basic ID scheme
        this.id = this.id + 1

        const mid = this.id as Id<O>
        if (this.objMap.get(mid) || this.oldMap.get(mid)) throw "MANIKIN: Duplicate ID"

        this.objMap.set(mid, obj)
        return mid
    }
    val<O>(val: O): Id<O> {
        const sVal = JSON.stringify(val)
        const cHash = sVal as Id<O>
        if (this.objMap.get(cHash) && (JSON.stringify(this.objMap.get(cHash)) != sVal)) {
            throw `MANIKIN: Different values map to same value content + ${cHash}`
        }
        this.objMap.set(cHash, val)

        return cHash
    }

    /// Convenience function to 'change' obj
    chg(o: any): any {
        if (typeof this.obj == "object" && typeof o == 'object') return { ...this.obj, ...o }
        throw "MANIKIN: Only objects can be 'changed'"
    }

    snd<O, M, R>(id: Id<O>, trs: () => Trs<O, M, R>, msg: M): R {
        const _slf = this.slf
        const _msg = this.msg
        const _obj = this.obj
        const _old = this.old

        try {
            this.slf = id
            this.msg = msg
            this.obj = this.objMap.get(id)

            const t = trs()

            if (!t.pre(this)) throw `MANIKIN: Pre condition failed: ${t.pre.toString()}`
            else {
                const old = this.obj
                const app = t.app(this)

                this.old = old
                this.obj = app

                this.oldMap.set(id, old)
                this.objMap.set(id, app)

                const result = t.eff(this)

                if (!t.pst(this)) throw `MANIKIN: Post condition failed: ${t.pst.toString()}`

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

    $obj<O>(id: Id<O>): O { return this.objMap.get(id) }

    $old<O>(id: Id<O>): O { return this.oldMap.get(id) }

    constructor() {
        this.objMap = new Map()
        this.oldMap = new Map()
        this.id = 0
    }
}
