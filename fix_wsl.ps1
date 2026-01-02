Write-Host "Starting Windows Update Service (wuauserv)..."
try {
    Start-Service wuauserv
    Write-Host "Service started."
} catch {
    Write-Error "Failed to start Windows Update service. Make sure you are running as Administrator."
}

Write-Host "Enabling Windows Subsystem for Linux..."
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart

Write-Host "Enabling Virtual Machine Platform..."
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart

Write-Host "Done. Please RESTART your computer now."
Write-Host "After restarting, open a terminal and run: wsl --username <your_username>"
