if (Get-Command git-crypt -ErrorAction SilentlyContinue) {
    Write-Host "git-crypt already installed"
    exit 0
}

if (Get-Command scoop -ErrorAction SilentlyContinue) {
    Write-Host "Installing git-crypt via Scoop..."
    scoop install git-crypt
    exit $LASTEXITCODE
}

if (Get-Command choco -ErrorAction SilentlyContinue) {
    Write-Host "Installing git-crypt via Chocolatey..."
    choco install git-crypt -y
    exit $LASTEXITCODE
}

Write-Error "No package manager found. Install Scoop (https://scoop.sh) or Chocolatey (https://chocolatey.org) first."
exit 1
