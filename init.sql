CREATE DATABASE IF NOT EXISTS automation_dev;
GRANT all ON automation_dev.* TO 'automation'@'%' identified BY 'S3cret';
FLUSH PRIVILEGES;
USE automation_dev;
