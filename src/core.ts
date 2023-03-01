export type Id<O> = { 
    readonly evidence?: O    // type evidence member that is always undefined
}
     
export type Context = {
    mk<O2>(obj: O2): Id<O2>
    val<O2>(val: O2): Id<O2>

    snd<O2, M2, R2>(id: Id<O2>, trs: () => Trs<O2, M2, R2>, msg: M2): R2
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