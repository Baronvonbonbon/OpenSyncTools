#!/usr/bin/env bash
set -euo pipefail

NAME=${NAME:-subquery-postgres}
PORT=${PORT:-5432}           # host port
DB=${DB:-subquery}
PASS=${PASS:-postgres}
VOL=${VOL:-subquery-pgdata}

cmd=${1:-status}

case "$cmd" in
  status)
    echo "== Docker status =="
    docker ps -a --filter "name=^/${NAME}$" --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}' || true
    echo
    echo "== Listeners on $PORT =="
    (ss -ltnp "sport = :$PORT" 2>/dev/null || lsof -nP -iTCP:"$PORT" -sTCP:LISTEN 2>/dev/null || true)
    ;;

  up)
    docker volume inspect "$VOL" >/dev/null 2>&1 || docker volume create "$VOL" >/dev/null
    if docker ps -a --format '{{.Names}}' | grep -qx "$NAME"; then
      docker start "$NAME"
    else
      docker run -d --name "$NAME" \
        -e POSTGRES_PASSWORD="$PASS" \
        -e POSTGRES_DB="$DB" \
        -p "$PORT":5432 \
        -v "$VOL":/var/lib/postgresql/data \
        postgres:14
    fi
    ;;

  restart)
    docker restart "$NAME"
    ;;

  stop)
    docker stop "$NAME"
    ;;

  rm)
    docker rm -f "$NAME"
    ;;

  nuke) # remove container + data volume (DESTRUCTIVE)
    docker rm -f "$NAME" 2>/dev/null || true
    docker volume rm -f "$VOL" 2>/dev/null || true
    echo "Removed container and volume."
    ;;

  logs)
    docker logs -f --tail=200 "$NAME"
    ;;

  isready)
    PGPASSWORD="$PASS" pg_isready -h 127.0.0.1 -p "$PORT" -d "$DB" || true
    ;;

  psql)
    PGPASSWORD="$PASS" psql "postgresql://postgres:$PASS@127.0.0.1:$PORT/$DB"
    ;;

  *)
    echo "Usage: $0 {status|up|restart|stop|rm|nuke|logs|isready|psql}"
    exit 1
    ;;
esac

