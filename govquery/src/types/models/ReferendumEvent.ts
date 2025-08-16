// Auto-generated , DO NOT EDIT
import {Entity, FunctionPropertyNames} from "@subql/types";
import assert from 'assert';




export type ReferendumEventProps = Omit<ReferendumEvent, NonNullable<FunctionPropertyNames<ReferendumEvent>>| '_name'>;

export class ReferendumEvent implements Entity {

    constructor(id: string) {
        this.id = id;
    }


    public id: string;

    public referendumId?: string;

    public section?: string;

    public method?: string;

    public status?: string;

    public blockHeight?: bigint;

    public blockHash?: string;

    public indexInBlock?: number;

    public ts?: Date;

    public data?: string;

    public args?: string;

    public callArgsJson?: string;

    public detailsJson?: string;

    public extrinsicHash?: string;


    get _name(): string {
        return 'ReferendumEvent';
    }

    async save(): Promise<void>{
        let id = this.id;
        assert(id !== null, "Cannot save ReferendumEvent entity without an ID");
        await store.set('ReferendumEvent', id.toString(), this);
    }
    static async remove(id:string): Promise<void>{
        assert(id !== null, "Cannot remove ReferendumEvent entity without an ID");
        await store.remove('ReferendumEvent', id.toString());
    }

    static async get(id:string): Promise<ReferendumEvent | undefined>{
        assert((id !== null && id !== undefined), "Cannot get ReferendumEvent entity without an ID");
        const record = await store.get('ReferendumEvent', id.toString());
        if (record){
            return this.create(record as ReferendumEventProps);
        }else{
            return;
        }
    }



    static create(record: ReferendumEventProps): ReferendumEvent {
        assert(typeof record.id === 'string', "id must be provided");
        let entity = new this(record.id);
        Object.assign(entity,record);
        return entity;
    }
}
