$env:DB_HOST = "friocheck-db-server.postgres.database.azure.com"
$env:DB_PORT = "5432"
$env:DB_USERNAME = "friocheck_admin"
$env:DB_PASSWORD = "Fr1o-Ch3ck"
$env:DB_NAME = "friocheck_db"

cd C:\Users\escuela05\nfcproject
npx ts-node -r tsconfig-paths/register scripts/seed.ts