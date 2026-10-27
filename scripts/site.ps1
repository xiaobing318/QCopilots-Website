# Compatible with Windows PowerShell 5.1. No global tools or PATH changes.
# Plain $args (no param block) forwards every argument as typed, including "--", -w or --with-deps.
$SiteArguments = @($args)
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
$SiteRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$SiteToolchain = Get-Content -LiteralPath (Join-Path $SiteRoot 'config/toolchain.json') -Raw | ConvertFrom-Json
$SiteNodeVersion = $SiteToolchain.nodeVersion
$SiteArch = 'x64'
if ($env:PROCESSOR_ARCHITECTURE -eq 'ARM64' -or $env:PROCESSOR_ARCHITEW6432 -eq 'ARM64') { $SiteArch = 'arm64' }
if (-not [Environment]::Is64BitOperatingSystem) { throw 'A 64-bit Windows system is required.' }
$SiteNodeDirectory = Join-Path $SiteRoot ('.tools/node-v' + $SiteNodeVersion + '-win-' + $SiteArch)
$SiteNode = Join-Path $SiteNodeDirectory 'node.exe'
$SiteSystemNode = Get-Command node.exe -ErrorAction SilentlyContinue
if (-not (Test-Path -LiteralPath $SiteNode) -and $SiteSystemNode) {
    $SiteDetectedVersion = & $SiteSystemNode.Source --version
    $SiteSystemNpm = Join-Path (Split-Path -Parent $SiteSystemNode.Source) 'node_modules/npm/bin/npm-cli.js'
    if ($LASTEXITCODE -eq 0 -and $SiteDetectedVersion -eq ('v' + $SiteNodeVersion) -and (Test-Path -LiteralPath $SiteSystemNpm)) {
        $SiteDetectedNpm = & $SiteSystemNode.Source $SiteSystemNpm --version
        if ($LASTEXITCODE -eq 0 -and $SiteDetectedNpm -eq $SiteToolchain.npmVersion) { $SiteNode = $SiteSystemNode.Source }
    }
}
if (-not (Test-Path -LiteralPath $SiteNode)) {
    [Net.ServicePointManager]::SecurityProtocol = [Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12
    $SiteTools = Join-Path $SiteRoot '.tools'
    New-Item -ItemType Directory -Force -Path $SiteTools | Out-Null
    $SiteUrl = $SiteToolchain.('node-win32-' + $SiteArch + '-url')
    $SiteSha = $SiteToolchain.('node-win32-' + $SiteArch + '-sha256')
    $SiteArchive = Join-Path $SiteTools ('node-' + [Guid]::NewGuid().ToString('N') + '.zip')
    $SiteExtract = Join-Path $SiteTools ('extract-' + [Guid]::NewGuid().ToString('N'))
    try {
        Write-Host ('Downloading pinned Node.js ' + $SiteNodeVersion + '...')
        $SiteRequest = @{ Uri = $SiteUrl; OutFile = $SiteArchive; UseBasicParsing = $true }
        if ($env:HTTPS_PROXY) { $SiteRequest.Proxy = $env:HTTPS_PROXY }
        elseif ($env:HTTP_PROXY) { $SiteRequest.Proxy = $env:HTTP_PROXY }
        Invoke-WebRequest @SiteRequest
        if ((Get-FileHash -LiteralPath $SiteArchive -Algorithm SHA256).Hash.ToLowerInvariant() -ne $SiteSha) { throw 'Node.js download checksum mismatch.' }
        Add-Type -AssemblyName System.IO.Compression.FileSystem
        [IO.Compression.ZipFile]::ExtractToDirectory($SiteArchive, $SiteExtract)
        Move-Item -LiteralPath (Join-Path $SiteExtract ('node-v' + $SiteNodeVersion + '-win-' + $SiteArch)) -Destination $SiteNodeDirectory
    }
    finally {
        if (Test-Path -LiteralPath $SiteArchive) { Remove-Item -LiteralPath $SiteArchive -Force }
        # Resolve and constrain every recursive cleanup to this repository's .tools directory.
        $SiteCleanup = [IO.Path]::GetFullPath($SiteExtract)
        $SiteBoundary = [IO.Path]::GetFullPath($SiteTools) + [IO.Path]::DirectorySeparatorChar
        if ($SiteCleanup.StartsWith($SiteBoundary, [StringComparison]::OrdinalIgnoreCase) -and (Test-Path -LiteralPath $SiteCleanup)) { Remove-Item -LiteralPath $SiteCleanup -Recurse -Force }
    }
}
& $SiteNode (Join-Path $SiteRoot 'scripts/site.mjs') @SiteArguments
exit $LASTEXITCODE
