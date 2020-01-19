import { Reimbursement } from '../models/reimbursement';
import { User } from '../models/user';
import { Role } from '../models/role';
import { ReimbursementStatus } from '../models/reimbursementstatus';
import { ReimbursementType } from '../models/reimbursementtype';
import { SessionFactory } from '../util/session-factory';

// Okay, this is *Really Ugly*... but it works and dowsn't cause the pool to clog.
const dbdump = `
select
	r.reimbursementid,
	a.userid as authoruserid,
	a.username as authorusername,
	a."password" as authorpassword,
	a.firstname as authorfirstname,
	a.lastname as authorlastname,
	a.email as authoremail,
	ra.roleid as authorroleid,
	ra."role" as authorroletext,
	r.amount,
    r.datesubmitted,
    r.dateresolved,
    r.description,
	re.userid as resolveruserid,
	re.username as resolverusername,
	re."password" as resolverpassword,
	re.firstname as resolverfirstname,
	re.lastname as resolverlastname,
	re.email as resolveremail,
	rre.roleid as resolverroleid,
	rre."role" as resolverroletext,
    rs.statusid,
    rs.status as statustext,
	rt.typeid,
	rt."type" as typetext
from
	reimbursement as r
join
	reimbursementstatus as rs on r.status = rs.statusid
join
	reimbursementtype as rt on r."type" = rt.typeid
join
	"user" as a on r.author = a.userid
join
	"role" as ra on a."role" = ra."roleid"
join
	"user" as re on r.resolver = re.userid
join
	"role" as rre on re."role" = rre."roleid"`;

export class ReimbursementDAO {

    // gets all reimbursements that match id
    public async getReimbursementsById(id: number): Promise<Reimbursement[]> {
        return this.getReimbursementsByquery(`reimbursementid = ${id}`);
    }

    // get all reimbusements that match provided status
    public async getReimbursementsByStatus(status_id: number): Promise<Reimbursement[]> {
        return this.getReimbursementsByquery(`rs.statusid = ${status_id}`);
    }

    //  get all reimbursements that match author(user) id
    public async getReimbursementsByUserId(user_id: number): Promise<Reimbursement[]> {
        return this.getReimbursementsByquery(`a.userid = ${user_id}`);
    }

    //  get all reimbursements where ${modifier}
    public async getReimbursementsByquery(modifier: string): Promise<Reimbursement[]> {
        const client = await SessionFactory.getConnectionPool().connect();
        const result = await client.query(`${dbdump} where ${modifier} order by reimbursementid`);
        const reimbursement = result.rows;
        const reimbursementData = [];
        reimbursement.forEach(rei => {
            reimbursementData.push(new Reimbursement(
                rei.reimbursementid,
                new User(
                    rei.authoruserid,
                    rei.authorusername,
                    rei.authorpassword,
                    rei.authorfirstname,
                    rei.authorlastname,
                    rei.authoremail,
                    new Role(
                        rei.authorroleid,
                        rei.authorroletext
                    )
                ),
                rei.amount,
                rei.datesubmitted,
                rei.dateresolved,
                rei.description,
                new User(
                    rei.resolveruserid,
                    rei.resolverusername,
                    rei.resolverpassword,
                    rei.resolverfirstname,
                    rei.resolverlastname,
                    rei.resolveremail,
                    new Role(
                        rei.resolverroleid,
                        rei.resolverroletext
                    )
                ),
                new ReimbursementStatus(
                    rei.statusid,
                    rei.statustext
                ),
                new ReimbursementType(
                    rei.typeid,
                    rei.typetext
                )
            ));
        });
        client.release();
        return reimbursementData;
    }

    // insert new reimbursement into table
    public static async addReimbursements(
        author: number,         amount: number,
        dateSubmitted: number,  description: string,
        type: number
    ) {
        const client = await SessionFactory.getConnectionPool().connect();
        const text = `INSERT INTO reimbursement (
            author,             amount,
            datesubmitted,      dateresolved,
            description,        resolver,
            status,             "type"
        ) VALUES (
            ${author},          ${amount},
            ${dateSubmitted},   0,
            '${description.replace(`'`, ``)}',   2,
            1,                  ${type}
        );`;
        try {
            const res = await client.query(text);
            client.release();
        } catch (err) {
            console.log(err.stack);
        }
    }

    // update reimbursement
    public static async updateReimbursement(status, reimbursementId): Promise<any> {
        const client = await SessionFactory.getConnectionPool().connect();
        await client.query(`UPDATE reimbursement set status=${status}, dateresolved =${Math.round((new Date()).getTime() / 1000)} WHERE reimbursementid = ${reimbursementId};`);
        client.release();
    }
}