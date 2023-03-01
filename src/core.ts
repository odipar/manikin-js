export type Id<O> = {
    readonly evidence?: O    // type evidence member that is always undefined
}

/* 
 * With a Context you can:
 *
 * 1) make (mk) new identities Id<O>, given object O 
 * 2) create new values (val) with identity Id<O>, given value O
 * 3) send 'transactional' messages M to object/value O with identity Id<O>, given transaction TRS<O, M, R>, returning R
 */
export type Context = {
    mk<O>(obj: O): Id<O>
    val<V>(val: V): Id<V>

    snd<O, M, R>(id: Id<O>, trs: () => Trs<O, M, R>, msg: M): R
}

export type IniContext<O, M> = {
    readonly slf: Id<O>
    readonly obj: O
    readonly msg: M
}

export type PreContext<O, M> = IniContext<O, M> & {
    $obj<O2>(id: Id<O2>): O2
}

export type AppContext<O, M> = IniContext<O, M> & {
    chg(o: O): O
}

export type OldContext<O, M> = PreContext<O, M> & {
    readonly old: O
}

export type EffContext<O, M> = OldContext<O, M> & Context

export type PstContext<O, M> = OldContext<O, M> & {
    $old<O2>(id: Id<O2>): O2
}

export type Trs<O, M, R> = {
    pre: (_: PreContext<O, M>) => boolean
    app: (_: AppContext<O, M>) => O
    eff: (_: EffContext<O, M>) => R
    pst: (_: PstContext<O, M>) => boolean
}