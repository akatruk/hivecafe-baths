ssh -i test.pem ec2-user@3.235.240.95


CREATE TABLE appointments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    telephone VARCHAR(15) NOT NULL,
    date DATE NOT NULL,
    time VARCHAR(5) NOT NULL
);
