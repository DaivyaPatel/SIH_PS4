-- Synthetic compatibility proof only; never point this module at an existing database.
create table if not exists proof_case (
    id varchar(80) primary key,
    process_id varchar(80) not null unique,
    state varchar(40) not null
);
create table if not exists proof_audit (
    id varchar(80) primary key,
    case_id varchar(80) not null references proof_case(id),
    kind varchar(80) not null
);
create table if not exists proof_outbox (
    id varchar(80) primary key,
    case_id varchar(80) not null references proof_case(id),
    kind varchar(80) not null
);
