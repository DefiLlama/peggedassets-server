
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
ROOT_DIR=$SCRIPT_DIR/../../..

# pull latest changes
git pull

CURRENT_COMMIT_HASH=$(git rev-parse HEAD)
echo "$CURRENT_COMMIT_HASH" >  $ROOT_DIR/.current_commit_hash

npm run api2-cron-task

# start API2 server
timeout 6m npx pm2 startOrReload api2/ecosystem.config.js
exit_status=$?

if [ $exit_status -eq 124 ]
then
    MESSAGE="pm2 command was terminated because it ran for more than 4 minutes."
    echo "ERROR: $MESSAGE"
    exit 1
elif [ $exit_status -ne 0 ]
then
    MESSAGE="pm2 command exited with an error. Exit status: $exit_status"
    echo "ERROR: $MESSAGE"
    exit 1
else
    SAFE_COMMIT_HASH=$(cat "$ROOT_DIR/.safe_commit_hash")
    if [[ $SAFE_COMMIT_HASH != $CURRENT_COMMIT_HASH ]]; then
        MESSAGE="Current commit hash does not match safe commit hash"
        echo "ERROR: $MESSAGE"
        exit 1
    else
        echo "Stablecoin rest server started without issue: $SAFE_COMMIT_HASH"
    fi
fi
