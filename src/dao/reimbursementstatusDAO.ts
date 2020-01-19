import { ReimbursementStatus } from '../models/reimbursementstatus';
import { SessionFactory } from '../util/session-factory';


export class ReimbursementStatusDAO {

    // get all reimbursement statuses
    public async getAllReimbursementStatuses(): Promise<ReimbursementStatus[]> {
        const client = await SessionFactory.getConnectionPool().connect();
        const result = await client.query('SELECT * from reimbursementstatus order by statusid');
        const reimbursementStatus = result.rows;
        const reimbursementStatusData = [];
        reimbursementStatus.forEach(reiStatus => {
            reimbursementStatusData.push(new ReimbursementStatus(
                reiStatus.statusid,
                reiStatus.status
            ));
        });
        client.release();
        return reimbursementStatusData;
    }
}