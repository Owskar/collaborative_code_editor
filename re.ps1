# Generate-ProjectTree.ps1
# Description: Generates a Markdown-compatible directory tree and saves it to README.md or a separate file

param (
    [string]$RootDir = ".\collaborative-editor",
    [string]$OutputFile = ".\PROJECT_STRUCTURE.md",
    [string]$Header = "## Project Structure`n"
)

function Get-Tree {
    param (
        [string]$Path,
        [int]$Indent = 0
    )

    $entries = Get-ChildItem -Path $Path | Sort-Object -Property PSIsContainer, Name
    foreach ($entry in $entries) {
        $prefix = "│   " * $Indent + "├── "
        if ($entry.PSIsContainer) {
            "$prefix$($entry.Name)" | Out-File -FilePath $OutputFile -Append
            Get-Tree -Path $entry.FullName -Indent ($Indent + 1)
        } else {
            "$prefix$($entry.Name)" | Out-File -FilePath $OutputFile -Append
        }
    }
}

# Create / overwrite output file
$Header | Out-File -FilePath $OutputFile -Encoding UTF8
"```" | Out-File -FilePath $OutputFile -Append
Get-Tree -Path $RootDir
"```" | Out-File -FilePath $OutputFile -Append

Write-Host "✅ Project structure saved to $OutputFile"
