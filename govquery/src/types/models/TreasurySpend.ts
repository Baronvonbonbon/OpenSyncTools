// Auto-generated , DO NOT EDIT
import {Entity, FunctionPropertyNames} from "@subql/types";
import assert from 'assert';




export type TreasurySpendProps = Omit<TreasurySpend, NonNullable<FunctionPropertyNames<TreasurySpend>>| '_name'>;

export class TreasurySpend implements Entity {

    constructor(id: string) {
        this.id = id;
    }


    public id: string;

    public referendumId?: string;

    public blockHeight?: bigint;

    public blockHash?: string;

    public eventMethod?: string;

    public amount?: bigint;

    public beneficiary?: string;

    public args?: string;

    public createdAt?: Date;

    public updatedAt?: Date;

    public extrinsicHash?: string;


    get _name(): string {
        return 'TreasurySpend';
    }

    async save(): Promise<void>{
        let id = this.id;
        assert(id !== null, "Cannot save TreasurySpend entity without an ID");
        await store.set('TreasurySpend', id.toString(), this);
    }
    static async remove(id:string): Promise<void>{
        assert(id !== null, "Cannot remove TreasurySpend entity without an ID");
        await store.remove('TreasurySpend', id.toString());
    }

    static async get(id:string): Promise<TreasurySpend | undefined>{
        assert((id !== null && id !== undefined), "Cannot get TreasurySpend entity without an ID");
        const record = await store.get('TreasurySpend', id.toString());
        if (record){
            return this.create(record as TreasurySpendProps);
        }else{
            return;
        }
    }



    static create(record: TreasurySpendProps): TreasurySpend {
        assert(typeof record.id === 'string', "id must be provided");
        let entity = new this(record.id);
        Object.assign(entity,record);
        return entity;
    }
}
