#!/usr/bin/env bash
# One-time Vercel bootstrap for the Shalgam monorepo.
#
# Creates (or links) three Vercel projects — storefront, admin and Storybook — sets each
# project's Root Directory, and stores the ids plus a deploy token as GitHub repository
# secrets so .github/workflows/deploy.yml can publish on every push.
#
# Needs: the Vercel CLI (`npm i -g vercel`), the GitHub CLI (`gh auth login`), and a
# Vercel access token from https://vercel.com/account/tokens (pasted when prompted).
#
#   bash scripts/vercel-setup.sh
#   VERCEL_TOKEN=... bash scripts/vercel-setup.sh   # non-interactive token
set -euo pipefail

cd "$(dirname "$0")/.."

require() { command -v "$1" >/dev/null 2>&1 || { echo "✗ $1 is required ($2)"; exit 1; }; }
require gh "https://cli.github.com"
require vercel "npm i -g vercel"
require curl "system package"
require node "for JSON parsing"
gh auth status >/dev/null 2>&1 || { echo "✗ run: gh auth login"; exit 1; }

if [ -z "${VERCEL_TOKEN:-}" ]; then
  echo "Create a token at https://vercel.com/account/tokens (scope: your account/team, no expiry or long)."
  read -r -s -p "Paste the Vercel token: " VERCEL_TOKEN
  echo
fi
[ -n "$VERCEL_TOKEN" ] || { echo "✗ a token is required"; exit 1; }

# The token authenticates both the CLI and the REST API below.
vercel whoami --token="$VERCEL_TOKEN" >/dev/null || { echo "✗ token rejected by Vercel"; exit 1; }

# name | root directory | GitHub secret holding the project id
# `.vercel.app` names are global: shalgam.vercel.app is already owned by another account, so the
# storefront defaults to shalgam-app (override with STOREFRONT_PROJECT=<name>). It builds from
# the repository root (root vercel.json), so its Root Directory stays empty.
STOREFRONT_PROJECT="${STOREFRONT_PROJECT:-shalgam-app}"
PROJECTS=(
  "$STOREFRONT_PROJECT||VERCEL_PROJECT_ID_STOREFRONT"
  "${ADMIN_PROJECT:-shalgam-admin}|apps/admin|VERCEL_PROJECT_ID_ADMIN"
  "${STORYBOOK_PROJECT:-shalgam-storybook}|packages/ui|VERCEL_PROJECT_ID_STORYBOOK"
)

ORG_ID=""
for entry in "${PROJECTS[@]}"; do
  IFS='|' read -r name root secret <<<"$entry"
  echo "── $name"
  # Creates the project when it does not exist yet, then links this checkout to it.
  vercel project add "$name" --token="$VERCEL_TOKEN" >/dev/null 2>&1 || true
  rm -rf .vercel
  vercel link --yes --project "$name" --token="$VERCEL_TOKEN" >/dev/null
  project_id=$(node -e "console.log(require('./.vercel/project.json').projectId)")
  ORG_ID=$(node -e "console.log(require('./.vercel/project.json').orgId)")

  # Root Directory lets Vercel (CLI builds and, if ever connected, the Git integration)
  # build the right workspace package from the repository root.
  team_query=""
  case "$ORG_ID" in team_*) team_query="?teamId=$ORG_ID" ;; esac
  root_json=$([ -n "$root" ] && echo "\"$root\"" || echo null)
  curl -sS -X PATCH "https://api.vercel.com/v9/projects/$project_id$team_query" \
    -H "Authorization: Bearer $VERCEL_TOKEN" -H "Content-Type: application/json" \
    -d "{\"rootDirectory\":$root_json}" >/dev/null

  gh secret set "$secret" --body "$project_id"
  echo "   project $project_id → secret $secret, root directory ${root:-<repository root>}"
done
rm -rf .vercel

gh secret set VERCEL_ORG_ID --body "$ORG_ID"
gh secret set VERCEL_TOKEN --body "$VERCEL_TOKEN"
echo "── secrets VERCEL_ORG_ID and VERCEL_TOKEN stored"

echo
echo "Done. Push to main (or run: gh workflow run deploy.yml) and the Deploy workflow publishes:"
echo "  https://$STOREFRONT_PROJECT.vercel.app   https://${ADMIN_PROJECT:-shalgam-admin}.vercel.app   https://${STORYBOOK_PROJECT:-shalgam-storybook}.vercel.app"
echo "(Vercel adds a suffix when a name is taken; the workflow summary prints the exact URLs.)"
