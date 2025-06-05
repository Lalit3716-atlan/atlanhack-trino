/*
 * File: extract_database.sql
 * Purpose: Extracts basic database metadata from the current Trino catalog
 *
 * This query retrieves fundamental catalog information including catalog name
 * and associated metadata, converted from PostgreSQL to Trino syntax.
 *
 * Returns:
 *   - Catalog metadata including name and system properties
 *
 * Notes:
 *   - Scoped to the current catalog (current_catalog)
 *   - Trino uses catalogs instead of databases
 */
SELECT 
  current_catalog as datname,
  null as datdba,
  null as encoding,
  null as datcollate,
  null as datctype,
  true as datistemplate,
  true as datallowconn,
  -1 as datconnlimit,
  null as datlastsysoid,
  null as datfrozenxid,
  null as datminmxid,
  null as dattablespace,
  null as datacl,
  current_catalog as database_name,
  0 as schema_count
