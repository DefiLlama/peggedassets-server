
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
ROOT_DIR=$SCRIPT_DIR/../../..

# Check if CUSTOM_GIT_BRANCH_DEPLOYMENT environment variable is set
if [ -n "$CUSTOM_GIT_BRANCH_DEPLOYMENT" ]; then
    echo "***WARNING***: Custom branch deployment requested: $CUSTOM_GIT_BRANCH_DEPLOYMENT"
    # Checkout the specified branch
    git checkout "$CUSTOM_GIT_BRANCH_DEPLOYMENT"  --quiet
    # Pull latest code from the branch
    git pull origin "$CUSTOM_GIT_BRANCH_DEPLOYMENT"  --quiet
# else
    # echo "Using default branch deployment: $(git branch --show-current)"
fi

git pull -q
pnpm install --silent

CURRENT_COMMIT_HASH=$(git rev-parse HEAD)
echo "$CURRENT_COMMIT_HASH" >  $ROOT_DIR/.current_commit_hash


if [ -n "$API_STORAGE_HOST" ]; then

    # Sync cache from storage box to local cache dir
    sshpass -p "$API_STORAGEBOX_PASSWORD" rsync --recursive -az \
        -e "ssh -p23 -o StrictHostKeyChecking=no" \
        "$API_STORAGE_HOST:$REMOTE_DIR" "$CACHE_DIR"
    
    # set nodejs port to 5000 and use nginx
    export PORT=5000
else
    pnpm run api2-cron-task
fi

# start node server
timeout 6m npx pm2 startOrReload api2/ecosystem.config.js

# nginx: install config and start/reload if API_STORAGE_HOST is set
if [ -n "$API_STORAGE_HOST" ]; then
    NGINX_CONF_SRC="$SCRIPT_DIR/../deploy/nginx.conf"
    NGINX_CONF_DST="/etc/nginx/sites-available/stablecoin-api.conf"

    cp "$NGINX_CONF_SRC" "$NGINX_CONF_DST"
    ln -sf "$NGINX_CONF_DST" /etc/nginx/sites-enabled/stablecoin-api.conf

    if nginx -t 2>/dev/null; then
        if [ -s /run/nginx.pid ] && kill -0 "$(cat /run/nginx.pid)" 2>/dev/null; then
            nginx -s reload
            echo "nginx config updated and reloaded"
        else
            nginx
            echo "nginx started"
        fi
    else
        echo "ERROR: nginx config test failed, not reloading"
        nginx -t
    fi
fi
