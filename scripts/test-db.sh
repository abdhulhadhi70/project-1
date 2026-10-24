#!/usr/bin/env bash
# Applies the migrations and seed to a throwaway local Postgres database and
# runs the RLS checks. Needs psql and a local Postgres you can connect to
# (set PGHOST/PGUSER etc. as usual). Does not touch your Supabase project.
set -euo pipefail
cd "$(dirname "$0")/.."
DB="${TEST_DB:-gold_souk_test}"
psql -q -v ON_ERROR_STOP=1 -d postgres -c "drop database if exists $DB" -c "create database $DB"
run() { psql -q -v ON_ERROR_STOP=1 -d "$DB" -f "$1"; }
run supabase/tests/supabase_stub.sql
for f in supabase/migrations/*.sql; do run "$f"; done
run supabase/seed.sql
run supabase/tests/rls_test.sql
psql -q -d postgres -c "drop database $DB"
