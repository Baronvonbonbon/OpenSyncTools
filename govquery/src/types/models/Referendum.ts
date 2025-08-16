// Auto-generated , DO NOT EDIT
import {Entity, FunctionPropertyNames} from "@subql/types";
import assert from 'assert';




export type ReferendumProps = Omit<Referendum, NonNullable<FunctionPropertyNames<Referendum>>| '_name'>;

export class Referendum implements Entity {

    constructor(id: string) {
        this.id = id;
    }


    public id: string;

    public track?: number;

    public status?: string;

    public createdAt?: Date;

    public lastSeenAt?: Date;

    public lastStatus?: string;

    public lastStatusAt?: Date;

    public submittedAt?: Date;

    public confirmStartedAt?: Date;

    public decisionStartedAt?: Date;

    public approvedAt?: Date;

    public rejectedAt?: Date;

    public executedAt?: Date;

    public cancelledAt?: Date;

    public killedAt?: Date;

    public executionOutcome?: string;

    public lastUpdatedAt?: Date;

    public blockHashLast?: string;

    public extrinsicHashLast?: string;


    get _name(): string {
        return 'Referendum';
    }

    async save(): Promise<void>{
        let id = this.id;
        assert(id !== null, "Cannot save Referendum entity without an ID");
        await store.set('Referendum', id.toString(), this);
    }
    static async remove(id:string): Promise<void>{
        assert(id !== null, "Cannot remove Referendum entity without an ID");
        await store.remove('Referendum', id.toString());
    }

    static async get(id:string): Promise<Referendum | undefined>{
        assert((id !== null && id !== undefined), "Cannot get Referendum entity without an ID");
        const record = await store.get('Referendum', id.toString());
        if (record){
            return this.create(record as ReferendumProps);
        }else{
            return;
        }
    }



    static create(record: ReferendumProps): Referendum {
        assert(typeof record.id === 'string', "id must be provided");
        let entity = new this(record.id);
        Object.assign(entity,record);
        return entity;
    }
}
