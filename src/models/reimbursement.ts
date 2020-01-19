import { ReimbursementStatus } from './reimbursementstatus';
import { ReimbursementType } from './reimbursementtype';
import { User } from'./user';

export class Reimbursement {
    reimbursementId: number; // primary key
    author: User;  // foreign key -> User, not null
    amount: number;  // not null
    dateSubmitted: number; // not null      //why not a date object?
    dateResolved: number; // not null       //why not a date object?
    description: string; // not null
    resolver: User; // foreign key -> User
    status: ReimbursementStatus; // foreign ey -> ReimbursementStatus, not null
    type: ReimbursementType; // foreign key -> ReimbursementType

    constructor(
        reimbursementId: number,
        author: User,
        amount: number,
        dateSubmitted: number,
        dateResolved: number,
        description: string,
        resolver: User,
        status: ReimbursementStatus,
        type: ReimbursementType
    ) {
        this.reimbursementId = reimbursementId;
        this.author = author;
        this.amount = amount;
        this.dateSubmitted = dateSubmitted;
        this.dateResolved = dateResolved;
        this.description = description;
        this.resolver = resolver;
        this.status = status;
        this. type = type;
    }
}