import { Id, Trs, Context } from './core';

/* 
 * A minimal (mutable!) Manikin Context implementation
 * Note that everything is untyped!
 */

/* eslint-disable */
export class DefaultContext implements Context {
    objMap: any
    oldMap: any

    msg: any
    slf: any

    old: any
    obj: any

    id: number

    mk<O>(obj: O): Id<O> {
        // basic ID scheme
        this.id = this.id + 1

        const mid = this.id 
        if (this.objMap[mid] || this.oldMap[mid]) throw "MANIKIN: Duplicate ID"

        this.objMap[mid] = obj
        return mid as Id<O>
    }
    val<O>(val: O): Id<O> {
        const sVal = JSON.stringify(val)
        const cHash = sVal

        if (this.objMap[cHash] && (JSON.stringify(this.objMap[cHash]) != sVal)) {
            throw `MANIKIN: Different values map to same value content + ${cHash}`
        }
        this.objMap[cHash] = val
        return cHash as Id<O>
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
            this.obj = this.objMap[id as any]

            const t = trs()

            if (!t.pre(this)) throw `MANIKIN: Pre condition failed: ${t.pre.toString()}`
            else {
                const old = this.obj
                const app = t.app(this)

                this.old = old
                this.obj = app

                this.oldMap[id as any] = old
                this.objMap[id as any] = app

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
            this.objMap[_slf] = _obj
            this.oldMap[_slf] = _old
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

    $obj<O>(id: Id<O>): O { return this.objMap[id as any] }

    $old<O>(id: Id<O>): O { return this.oldMap[id as any] }

    constructor() {
        this.objMap = {}
        this.oldMap = {}
        this.id = 0
    }
}
