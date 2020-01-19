import { Role } from '../models/role';
import { SessionFactory } from '../util/session-factory';


export class RoleDAO {

    // get all roles
    public async getAllRoles(): Promise<Role[]> {
        const client = await SessionFactory.getConnectionPool().connect();
        const result = await client.query('SELECT * from "role"');
        const role = result.rows;
        const roleData = [];
        role.forEach(r => {
          roleData.push(new Role(
             r.roleid,
             r.role
            ));
        });
        client.release();
        return roleData;
    }
}