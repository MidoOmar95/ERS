import { ReimbursementType } from '../models/reimbursementtype';
import { SessionFactory } from '../util/session-factory';

export class ReimbursementTypeDAO {

    // gets all reimbursements types
    public async getAllReimbursementTypes(): Promise<ReimbursementType[]> {
        const client = await SessionFactory.getConnectionPool().connect();
        const result = await client.query('SELECT * from reimbursementtype');
        const reimbursementType = result.rows;
        const reimbursementTypeData = [];
        reimbursementType.forEach(reiType => {
            reimbursementTypeData.push(new ReimbursementType(
                reiType.typeid,
                reiType.type
            ));
        });
        client.release();
        return reimbursementTypeData;
    }
}