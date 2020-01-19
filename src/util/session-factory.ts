import { Pool } from 'pg';

export class SessionFactory{

    // static cred = {
    //     user: process.env.user,
    //     host: process.env.host,
    //     database: process.env.database,
    //     password: process.env.password,
    //     max: 10
    // }

    static cred = {
        user: 'momar',
        host: 'momar-psql.cgrqyxc5cx1m.us-east-2.rds.amazonaws.com',
        database: 'postgres',
        password: 'A$$ignment0!',
        max: 10
    }

    static pool: Pool;
    static created = false;
    static getConnectionPool(): Pool{

        if(!this.created){
            this.pool = new Pool(this.cred);
            this.created = true;
        }

        return this.pool;
    }

}