export type Id<O> = { 
    readonly evidence?: O    // type evidence member that is always undefined
}
     
export type Context = {
    mk<O2>(obj: O2): Id<O2>
    val<O2>(val: O2): Id<O2>

    snd<I2 extends Id<O2>, O2, M2, R2>(id: I2, trs: () => Trs<I2, O2, M2, R2>, msg: M2): R2
}

export type IniContext<I extends Id<O>, O, M> = {
    readonly slf: I
    readonly obj: O
    readonly msg: M
}

export type PreContext<I extends Id<O>, O, M> = IniContext<I, O, M> & {
    $obj<O2>(id: Id<O2>): O2
}

export type AppContext<I extends Id<O>, O, M> = IniContext<I, O, M> & { 
    chg(o: O): O
}

export type OldContext<I extends Id<O>, O, M> = PreContext<I, O, M> & {
    readonly old: O
}

export type EffContext<I extends Id<O>, O, M> = OldContext<I, O, M> & Context

export type PstContext<I extends Id<O>, O, M> = OldContext<I, O, M> & {
    $old<O2>(id: Id<O2>): O2
}

export type Trs<I extends Id<O>, O, M, R> = {
    pre: (_: PreContext<I, O, M>) => boolean
    app: (_: AppContext<I, O, M>) => O
    eff: (_: EffContext<I, O, M>) => R
    pst: (_: PstContext<I, O, M>) => boolean
}