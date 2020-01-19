rollback;
begin transaction;

drop table "role"
drop table "user"
drop table reimbursement
drop table reimbursementtype
drop table reimbursementstatus


create table "role" (
    roleid serial not null unique,
    "role" text not null unique,
    constraint pk_role primary key (roleid)
);
create table "user"(
    userid serial not null unique,
    username text  not null,
    "password" text not null,
    firstname text not null,
    lastname text not null,
    email text not null,
    "role" int not null,
    constraint pk_user primary key (userid),
    constraint fk_role foreign key ("role") references "role" (roleid)
);
create table reimbursementstatus(
	statusid serial not null unique,
	status text not null unique,
    constraint pk_reimbursementstatus primary key (statusid)
);
create table reimbursementtype(
	typeid serial not null unique,
	"type" text not null unique,
    constraint pk_reimbursementtype primary key (typeid)
);
create table reimbursement(
	reimbursementid serial not null unique,
	author int not null,
	amount int not null,
	datesubmitted int not null,
	dateresolved int not null, 
	description text not null,
	resolver int not null, 
	status int not null,
	"type" int not null,
    constraint pk_reimbursement primary key (reimbursementid),
    constraint fk_user_author foreign key (author) references "user" (userid),
    constraint fk_user_resolver foreign key (resolver) references "user" (userid),
    constraint fk_reimbursementstatus foreign key (status) references reimbursementstatus (statusid),
    constraint fk_reimbursementtype foreign key ("type") references reimbursementtype (typeid)
);

-- Roles
insert into "role" ("role") values ('Admin'          );
insert into "role" ("role") values ('Finance-Manager');
insert into "role" ("role") values ('Associate'      );
--users
insert into "user" (username, "password", firstname, lastname, email, "role") values ('pjacks',  'password', 'Peter', 'Jackson', 'pjacks@projco.com', 1);
insert into "user" (username, "password", firstname, lastname, email, "role") values ('admin',  'password', 'Adam', 'Admenson', 'admin@projco.com', 1);
insert into "user" (username, "password", firstname, lastname, email, "role") values ('kholmes', 'password', 'Kyle',  'Holmes',  'kholms@projco.com', 2);
insert into "user" (username, "password", firstname, lastname, email, "role") values ('momar',  'password', 'Mohamed',  'Omar',   'momar@projco.com',  2);
insert into "user" (username, "password", firstname, lastname, email, "role") values ('porladna', 'password', 'Peter', 'Orlando', 'porlaando@projco.com',  3);
insert into "user" (username, "password", firstname, lastname, email, "role") values ('jsmall',  'password', 'John',  'Small',   'jsmal@projco.com',  3);
--reimbursementstatus
insert into reimbursementstatus (status) values ('Pending');
insert into reimbursementstatus (status) values ('Approved');
insert into reimbursementstatus (status) values ('Denied');
--reimbursementtype
insert into reimbursementtype ("type") values ('Lodging');
insert into reimbursementtype ("type") values ('Travel' );
insert into reimbursementtype ("type") values ('Food'   );
insert into reimbursementtype ("type") values ('Other'  );
--reimbursement
insert into reimbursement(author, amount, datesubmitted, dateresolved, description, resolver, status, "type") values (3, 10, 1546300800, 1546387200, 'Shots',       2, 3, 3);
insert into reimbursement(author, amount, datesubmitted, dateresolved, description, resolver, status, "type") values (3, 20, 1546387200, 1546473600, 'Econo-Lodge', 2, 2, 1);
insert into reimbursement(author, amount, datesubmitted, dateresolved, description, resolver, status, "type") values (3, 30, 1546473600, 0,          'Bus fare',    2, 1, 2);
--
commit;