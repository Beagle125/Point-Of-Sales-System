FROM mysql:8.4.11-oraclelinux9

# Copy any initialization SQL scripts or shell scripts
COPY ./init.sql /docker-entrypoint-initdb.d/

EXPOSE 3306