backup
======

Quickly backup a directory to s3.

backup will zip the directory and upload that zip to a bucket you specify.

Installation:

    git clone https://github.com/breck7/backup.git
    sudo npm install -g backup/

Example use:

    backup --directory . --aws ./aws_credentials.json --bucket my_bucket

Example output:

    Successfully uploaded backup_at_2.4.2013_1.47.18pm.zip to my_bucket

