CREATE DATABASE IF NOT EXISTS authdb;
CREATE DATABASE IF NOT EXISTS productdb;
CREATE DATABASE IF NOT EXISTS inventorydb;
CREATE DATABASE IF NOT EXISTS cartdb;
CREATE DATABASE IF NOT EXISTS orderdb;
CREATE DATABASE IF NOT EXISTS paymentdb;
CREATE DATABASE IF NOT EXISTS notificationdb;

GRANT ALL PRIVILEGES ON authdb.* TO 'ecommerce'@'%';
GRANT ALL PRIVILEGES ON productdb.* TO 'ecommerce'@'%';
GRANT ALL PRIVILEGES ON inventorydb.* TO 'ecommerce'@'%';
GRANT ALL PRIVILEGES ON cartdb.* TO 'ecommerce'@'%';
GRANT ALL PRIVILEGES ON orderdb.* TO 'ecommerce'@'%';
GRANT ALL PRIVILEGES ON paymentdb.* TO 'ecommerce'@'%';
GRANT ALL PRIVILEGES ON notificationdb.* TO 'ecommerce'@'%';
FLUSH PRIVILEGES;