Table: customers
Columns:
id int AI PK 
name varchar(255) 
email varchar(255) 
phone varchar(50) 
address text 
province varchar(100) 
city varchar(100) 
customerType varchar(50) 
notes text 
image varchar(255) 
createdAt datetime 
updatedAt datetime

Table: orders
Columns:
id int AI PK 
customerId int 
productId int 
qty int 
price float 
date date 
status varchar(255) 
createdAt datetime 
updatedAt datetime

Table: products
Columns:
id int AI PK 
sku varchar(100) 
name varchar(255) 
category varchar(100) 
price float 
stock int 
description text 
variants text 
image varchar(255) 
createdAt datetime 
updatedAt datetime


