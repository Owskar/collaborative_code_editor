# Generate-ProjectTree.ps1
# Description: Generates a Markdown-compatible directory tree and saves it to README.md or a separate file

param (
    [string]$RootDir = ".\collaborative-editor",
    [string]$OutputFile = ".\PROJECT_STRUCTURE.md",
    [string]$Header = "## Project Structure`n",
    [string[]]$ExcludeFolders = @(".git", "node_modules", "__pycache__", ".venv", "venv", "dist", "build", ".next"),
    [string[]]$ExcludeFiles = @("*.log", "*.tmp", ".DS_Store", "Thumbs.db", "*.pyc"),
    [int]$MaxDepth = 10
)

function Get-Tree {
    param (
        [string]$Path,
        [int]$Indent = 0,
        [bool]$IsLast = $false,
        [int]$CurrentDepth = 0
    )

    # Stop if we've reached max depth
    if ($CurrentDepth -ge $MaxDepth) {
        return
    }

    # Check if path exists
    if (-not (Test-Path -Path $Path)) {
        Write-Warning "Path does not exist: $Path"
        return
    }

    try {
        # Get all items, excluding specified folders and files
        $entries = Get-ChildItem -Path $Path -Force -ErrorAction SilentlyContinue | 
                   Where-Object { 
                       -not ($_.PSIsContainer -and $_.Name -in $ExcludeFolders) -and
                       -not ($ExcludeFiles | Where-Object { $_.Name -like $_ })
                   } | 
                   Sort-Object PSIsContainer -Descending | Sort-Object Name

        if ($entries.Count -eq 0) {
            return
        }

        for ($i = 0; $i -lt $entries.Count; $i++) {
            $entry = $entries[$i]
            $isLastEntry = ($i -eq ($entries.Count - 1))
            
            # Build the prefix based on indentation and position
            $prefix = ""
            for ($j = 0; $j -lt $Indent; $j++) {
                $prefix += "│   "
            }
            
            if ($isLastEntry) {
                $prefix += "└── "
            } else {
                $prefix += "├── "
            }

            # Add entry to output
            $line = "$prefix$($entry.Name)"
            if ($entry.PSIsContainer) {
                $line += "/"
            }
            
            Add-Content -Path $OutputFile -Value $line -Encoding UTF8

            # Recursively process directories
            if ($entry.PSIsContainer) {
                Get-Tree -Path $entry.FullName -Indent ($Indent + 1) -IsLast $isLastEntry -CurrentDepth ($CurrentDepth + 1)
            }
        }
    }
    catch {
        Write-Warning "Error processing directory $Path`: $($_.Exception.Message)"
    }
}

function Initialize-OutputFile {
    param (
        [string]$FilePath,
        [string]$HeaderText
    )
    
    # Create directory if it doesn't exist
    $directory = Split-Path -Parent $FilePath
    if ($directory -and -not (Test-Path -Path $directory)) {
        New-Item -ItemType Directory -Path $directory -Force | Out-Null
    }
    
    # Create/overwrite the output file with header
    Set-Content -Path $FilePath -Value $HeaderText -Encoding UTF8
    Add-Content -Path $FilePath -Value '```' -Encoding UTF8
}

function Finalize-OutputFile {
    param (
        [string]$FilePath
    )
    
    Add-Content -Path $FilePath -Value '```' -Encoding UTF8
}

# Main execution
Write-Host "🌳 Generating project tree..." -ForegroundColor Green
Write-Host "📂 Root Directory: $RootDir" -ForegroundColor Cyan
Write-Host "📄 Output File: $OutputFile" -ForegroundColor Cyan

# Validate root directory
if (-not (Test-Path -Path $RootDir)) {
    Write-Error "❌ Root directory does not exist: $RootDir"
    Write-Host "💡 Current directory contents:" -ForegroundColor Yellow
    Get-ChildItem -Path "." | Select-Object Name, PSIsContainer | Format-Table -AutoSize
    exit 1
}

# Check if output file exists and prompt for overwrite
if (Test-Path -Path $OutputFile) {
    $overwrite = Read-Host "📄 Output file already exists. Overwrite? (y/N)"
    if ($overwrite -ne 'y' -and $overwrite -ne 'Y') {
        Write-Host "❌ Operation cancelled." -ForegroundColor Red
        exit 0
    }
}

try {
    # Initialize the output file
    Initialize-OutputFile -FilePath $OutputFile -HeaderText $Header
    
    # Add root directory name
    $rootName = Split-Path -Leaf (Resolve-Path $RootDir)
    Add-Content -Path $OutputFile -Value "$rootName/" -Encoding UTF8
    
    # Generate the tree
    Get-Tree -Path $RootDir
    
    # Finalize the output file
    Finalize-OutputFile -FilePath $OutputFile
    
    # Success message
    Write-Host "✅ Project structure saved to: $OutputFile" -ForegroundColor Green
    
    # Show file info
    $fileInfo = Get-Item $OutputFile
    Write-Host "📊 File size: $($fileInfo.Length) bytes" -ForegroundColor Yellow
    Write-Host "📅 Created: $($fileInfo.CreationTime)" -ForegroundColor Yellow
    
    # Option to view the file
    $viewFile = Read-Host "👀 Would you like to view the generated file? (y/N)"
    if ($viewFile -eq 'y' -or $viewFile -eq 'Y') {
        Get-Content $OutputFile | Write-Host
    }
    
    # Option to open the file
    $openFile = Read-Host "📝 Would you like to open the file in default editor? (y/N)"
    if ($openFile -eq 'y' -or $openFile -eq 'Y') {
        Start-Process $OutputFile
    }
}
catch {
    Write-Error "❌ Failed to generate project tree: $($_.Exception.Message)"
    exit 1
}

Write-Host "🎉 Project tree generation complete!" -ForegroundColor Green