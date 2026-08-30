# PreToolUse guardrail (Read + Bash) — forces an explicit confirmation prompt whenever a
# tool call would read or scan somewhere under the user's home directory that isn't this
# project or the kitchen-service sibling repo.
#
# Why this exists: a background subagent ended up with a "Read(//c/Users/guijm/**)" allow
# entry silently added to .claude/settings.local.json, and a security classifier separately
# blocked a `find` command it described as "credential-hunting". A blanket `deny` on that
# glob isn't usable here — it would also block legitimate reads of this project and of
# kitchen-service, both of which live under the same home directory. This hook instead
# inspects the actual target path/command and only asks for confirmation when it falls
# outside those two allowed roots.
#
# Add new legitimate project roots to $allowedRoots below as needed — don't broaden the
# match to the whole home directory again.

$allowedRoots = @('order-manager', 'kitchen-service')

function Test-BroadHomeAccess([string]$text) {
  if (-not $text) { return $false }
  $norm = $text.ToLower().Replace('\', '/')
  if ($norm -notlike '*/users/guijm*') { return $false }
  foreach ($root in $allowedRoots) {
    if ($norm -like "*$root*") { return $false }
  }
  return $true
}

$json = [Console]::In.ReadToEnd()
try { $data = $json | ConvertFrom-Json } catch { exit 0 }

$toolName = $data.tool_name
$target = $null
if ($toolName -eq 'Read') {
  $target = $data.tool_input.file_path
} elseif ($toolName -eq 'Bash') {
  $target = $data.tool_input.command
}

if (Test-BroadHomeAccess $target) {
  $reason = "This $toolName call targets a path under the user's home directory outside the order-manager project or the kitchen-service sibling repo. Confirm with the user before allowing broad access like this."
  $out = @{ hookSpecificOutput = @{ hookEventName = 'PreToolUse'; permissionDecision = 'ask'; permissionDecisionReason = $reason } }
  $out | ConvertTo-Json -Compress
}
