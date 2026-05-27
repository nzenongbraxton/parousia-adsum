# MySQL 8 Optimization Instructions for Multi-Tenant SaaS

As the Database Architect for **ParousiaAdsum**, your goal is to ensure MySQL 8 performs at maximum efficiency under heavy, concurrent write and read patterns (e.g., thousands of simultaneous attendance geofence validations and check-ins).

---

## 1. MySQL 8 Engine Tuning (Hetzner VPS Context)

Depending on the tenant's memory pool (defined in `docs/architecture.md`), tune the `my.cnf` configuration:

```ini
[mysqld]
# --- InnoDB Memory Buffer Tuning ---
# Allocate 50-60% of total system RAM to the buffer pool on a dedicated DB server
# e.g., for a 4GB RAM VPS, allocate 2GB. For 8GB RAM, allocate 4.5GB.
innodb_buffer_pool_size = 2G

# Increase chunk size if buffer pool is larger than 1GB to reduce contention
innodb_buffer_pool_instances = 2

# --- Threading & Concurrency ---
max_connections = 150
thread_cache_size = 16

# --- Redo Log & Writes ---
innodb_log_file_size = 512M
innodb_log_buffer_size = 16M
# Keep at 1 for strict ACID compliance. 
# If slight loss is tolerable for write throughput during high-traffic check-in spikes, set to 2.
innodb_flush_log_at_trx_commit = 1
innodb_flush_method = O_DIRECT

# --- Performance Schema & Slow Queries ---
slow_query_log = 1
slow_query_log_file = /var/log/mysql/mysql-slow.log
long_query_time = 1.0
log_queries_not_using_indexes = 0
```

---

## 2. Table Indexing & Schema Best Practices

For our geofenced attendance tables:

### Indexing Geolocation Columns
- Never perform math-heavy bounding box queries directly on standard numeric indices.
- Leverage **MySQL Spatial Extensions** and `SPATIAL` index types.
- Store geofence shapes as a `POLYGON` or `MULTIPOLYGON` and user coordinate pings as `POINT` types.

```sql
-- Efficient spatial check-in queries
ALTER TABLE tenant_geofences ADD SPATIAL INDEX(boundary);

SELECT name FROM tenant_geofences 
WHERE ST_Contains(boundary, ST_GeomFromText('POINT(latitude longitude)'));
```

### Foreign Keys and BigInt IDs
- Always use unsigned `BIGINT` for auto-incrementing primary keys.
- Ensure all foreign keys use matching data types (`bigint(20) unsigned`).
- Keep foreign key constraints active for referential integrity, but index them explicitly to prevent full table scans on deletes and updates.

### JSON Columns for Extensibility
- When saving dynamic check-in metadata (such as device telemetry, network routing, or custom SMS payloads), use the `JSON` data type.
- Optimize search performance over JSON structures by creating **Virtual Generated Columns** and indexing them.

```sql
-- Virtual generated column example for check_in_metadata
ALTER TABLE attendance_records
ADD COLUMN device_os VARCHAR(50) GENERATED ALWAYS AS (json_unquote(json_extract(metadata, '$.device.os'))) VIRTUAL,
ADD INDEX (device_os);
```

---

## 3. High Concurrent Spikes (Optimistic Locks)

To prevent double-billing, double-check-ins, or race conditions during rapid QR code regeneration:
- Implement **Optimistic Locking** using a version integer counter (`version` column) at the application layer.
- Set strict rate-limits inside Redis prior to touching the MySQL transactions.
- Use explicit database rows locking (`LOCK IN SHARE MODE` or `FOR UPDATE`) only inside short, isolated transaction blocks to avoid deadlocks.
