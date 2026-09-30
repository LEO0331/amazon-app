$ErrorActionPreference = 'Stop'
$env:ASTRO_TELEMETRY_DISABLED = '1'

function Invoke-NpmStep([string[]]$StepArguments) {
    & npm @StepArguments
    if ($LASTEXITCODE -ne 0) {
        throw "npm $($StepArguments -join ' ') failed with exit code $LASTEXITCODE"
    }
}

Invoke-NpmStep @('ci')
Invoke-NpmStep @('run', 'check')
Invoke-NpmStep @('test')
Invoke-NpmStep @('run', 'build')
Invoke-NpmStep @('run', 'verify:build')
