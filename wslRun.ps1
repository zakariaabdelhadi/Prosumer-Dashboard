# Prüfen, ob das Skript im Administratormodus ausgeführt wird
if (-not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    # Neues PowerShell-Fenster im Administratormodus öffnen und dieses Skript darin ausführen
    Start-Process powershell -Verb RunAs -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`""

    # Das aktuelle Skript beenden
    Exit
}
$WslInstanceName = 'Ubuntu'
$WindowsHostIPAddress = '192.168.2.1'
$UbuntuInstanceIPAddress = '192.168.2.2'
$SubnetMaskNumberOfBits = 24

$WslFirewallRuleName = 'WSL'
$WslNetworkInterfaceName = 'vEthernet (WSL)'
$UbuntuNetworkInterfaceName = 'eth0'

# Ensure the "vEthernet (WSL)" network adapter has been created by starting WSL.
Write-Host 'Ensure WSL network exists...'
wsl --distribution "$WslInstanceName" /bin/false
Write-Host 'WSL network exists'

# All inbound traffic from Ubuntu through Windows firewall and assign a static IP address to the "vEthernet (WSL)"
# network adapter in Windows.
Write-Host 'Configuring Windows host network...'
  Write-Host 'Checking firewall...'
  If (-Not (Get-NetFirewallRule -Name '$WslFirewallRuleName' -ErrorAction SilentlyContinue)) {
    Write-Host 'Configuring firewall...'
    New-NetFirewallRule -Name '$WslFirewallRuleName' -DisplayName 'WSL' -InterfaceAlias 'vEthernet (WSL)' -Direction Inbound -Action Allow
    Write-Host 'Finished configuring firewall'
  }
  Else {
    Write-Host 'Already configured firewall'
  }
 Write-Host 'Configuring network interface...'
 New-NetIPAddress -InterfaceAlias 'vEthernet (WSL)' -IPAddress '192.168.2.1' -PrefixLength 24
 Write-Host 'Finished configuring network interface'
Write-Host 'Finished configuring Windows host network'

# Assign a static IP address to the "eth0" network interface in Ubuntu.
Write-Host 'Configuring Ubuntu instance network...'
wsl --distribution "$WslInstanceName" --user root /bin/sh -c "if !(ip address show dev $UbuntuNetworkInterfaceName | grep -q $UbuntuInstanceIPAddress/$SubnetMaskNumberOfBits); then ip address add $UbuntuInstanceIPAddress/24 brd + dev $UbuntuNetworkInterfaceName; fi"
Write-Host 'Finished configuring Ubuntu instance network'

# start docker daemon
Write-Host 'start docker daemon ...'
wsl sudo dockerd
Exit
