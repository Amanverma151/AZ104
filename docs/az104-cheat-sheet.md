# AZ-104 Pattern Cheat Sheet

## How to use this sheet

Treat each keyword as a strong signal, not an automatic answer. Microsoft writes distractors that contain the right keyword but miss a second requirement, so match every requirement in the question before you pick.

1. Underline the requirements (availability, region, who needs access, what must happen).
2. Underline the constraint phrase (minimize cost, minimize administrative effort, least privilege). It is usually the tiebreaker.
3. Eliminate options that fail any single requirement, then apply the constraint to what is left.

These patterns were written as of November 2026. Azure renames and retires features often, so confirm anything surprising against Microsoft Learn.

## Identities and governance

The core split: RBAC controls who can do things, Azure Policy controls what can exist, and locks stop changes regardless of who you are.

| When you see… | The answer is usually… | Why / watch out |
| --- | --- | --- |
| “ensure resources can only be created in X region”, “enforce tags”, “prevent a VM size” | Azure Policy (Deny effect) | RBAC can’t restrict *what* is deployed, only *who* deploys. |
| “existing non-compliant resources” must be fixed | Policy with Modify or DeployIfNotExists + a remediation task | New assignments only evaluate; existing resources need remediation. |
| “tag inherited from the resource group” | Policy: Inherit a tag from the resource group (Modify) | Tags do not inherit by default. |
| “prevent accidental deletion” | CanNotDelete lock | Users can still modify. |
| “prevent any changes” | ReadOnly lock | Also blocks POST actions: starting VMs, listing storage keys. |
| Who can remove a lock? | Owner or User Access Administrator | Contributor can’t (excludes Microsoft.Authorization/*/Delete). |
| “manage access for others” without managing resources | User Access Administrator | Owner = both; Contributor = resources but no access. |
| “least privilege” for VMs only | Virtual Machine Contributor | Does not grant access to the VNet or storage the VM uses. |
| Apply a policy or role to many subscriptions | Management group | Assignments inherit downward: MG → subscription → RG → resource. |
| “move resources between subscriptions” | Both subscriptions in the same Entra tenant | Resource IDs change; check move support per resource type. |
| “custom role” with specific actions | Custom role JSON with Actions / NotActions / AssignableScopes | NotActions subtracts; it is not a deny. Deny needs deny assignments. |
| “users from a partner company” | Entra B2B guest users (invite) | B2C is for customer-facing apps, not employees or partners. |
| “automatically add users to a group based on department” | Dynamic membership group | Requires Entra ID P1 licenses. |
| “self-service password reset” | SSPR in Entra ID | Cloud-only users: Entra ID Free covers basic SSPR; writeback to on-premises needs P1. |
| “bulk create users” | Bulk create (CSV) in the Entra admin center, or PowerShell/Graph | Bulk invite is for guests. |
| “device must be joined to Entra and on-premises AD” | Hybrid Entra join | Entra registered = personal (BYOD) devices. |
| “cost alert when spending reaches X” | Budget in Cost Management with alert thresholds | Budgets alert; they don’t stop spending (except via action groups and automation). |

## Storage

For redundancy, read the question as two independent switches: zones in the primary region (Z) and a secondary region (G), plus whether the secondary must be readable without failover (RA).

| When you see… | The answer is usually… | Why / watch out |
| --- | --- | --- |
| “datacenter failure”, lowest cost | LRS | Three copies in one datacenter. |
| “availability zone fails”, single region | ZRS | Three zones in one region. |
| “regional outage” | GRS (or GZRS if zones also matter) | Secondary is unreadable until failover. |
| “read from secondary without failover” | RA-GRS / RA-GZRS | The “RA” is the only thing that adds read access. |
| Zone + region + read secondary | RA-GZRS | Most resilient, most expensive. |
| “rarely accessed, kept 180+ days, lowest cost, hours to retrieve is fine” | Archive tier | Must be rehydrated before reading; 180-day minimum. |
| Infrequent access, 30 days | Cool tier | Cold tier = 90 days minimum. |
| “automatically move blobs to a cooler tier after N days” | Lifecycle management policy | Not available on legacy general-purpose v1 accounts. |
| “grant time-limited access to a third party” | SAS token | Account SAS = multiple services; service SAS = one. |
| “revoke a SAS” | Regenerate the signing key, or use a stored access policy | A stored access policy lets you revoke without rotating keys. |
| “SAS secured with Entra credentials” | User delegation SAS | Blob storage only. |
| “rotate keys without downtime” | Switch apps to key2, regenerate key1 | Two keys exist exactly for this. |
| “prevent deletion or modification for compliance” (WORM) | Immutable storage: time-based retention or legal hold | Not the same as a resource lock. |
| “recover deleted blobs” | Soft delete for blobs | Container soft delete is separate. Versioning keeps old versions on overwrite. |
| “copy data between storage accounts” / large copy from CLI | AzCopy | Storage Explorer = GUI; uses AzCopy underneath. |
| “ship terabytes offline” | Azure Import/Export or Data Box | Data Box for very large volumes; Microsoft supplies the device. |
| “SMB share” for lift-and-shift | Azure Files | Port 445 must be open outbound. |
| “cache on-premises file server, cloud tiering” | Azure File Sync | Storage Sync Service + sync group + cloud endpoint + server endpoint. |
| Identity-based access to Azure Files with AD credentials | Entra Domain Services or on-premises AD DS authentication | Then assign share-level RBAC + NTFS permissions. |
| “restrict storage to a specific VNet” | Storage firewall + service endpoint | Private endpoint if they need a private IP or no public access at all. |

## Compute

SLA numbers map directly to deployment choices: 99.9% single VM (Premium SSD), 99.95% availability set, 99.99% availability zones.

| When you see… | The answer is usually… | Why / watch out |
| --- | --- | --- |
| “99.99%” | 2+ VMs across availability zones | Availability set tops out at 99.95%. |
| “protect from rack / hardware failure”, “planned maintenance” | Availability set (fault + update domains) | Must be chosen at VM creation; can’t add an existing VM. |
| “move VM to an availability set” | Delete and recreate the VM from its disks | Common trap: there is no “add to set” button. |
| “scale automatically based on CPU” | Virtual Machine Scale Set with autoscale rules | Or App Service plan scale-out for web apps. |
| “resize VM” fails | Deallocate (stop) first; the size may need a different cluster | Resizing a running VM restarts it. |
| “move VM to another region” | Azure Resource Mover (or Site Recovery) | Moving between RGs or subscriptions is not a region move. |
| “encrypt OS and data disks inside the VM with keys you control” | Azure Disk Encryption (BitLocker/DM-Crypt) + Key Vault | Key Vault must be in the same region and have disk-encryption access enabled. |
| “run a script on the VM after deployment” | Custom Script Extension | Desired State Configuration for ongoing config. |
| “deploy the same configuration repeatedly” | ARM template / Bicep | Export a template from an existing RG to start. |
| “web app needs deployment slots” | Standard tier or higher | Basic has no slots. |
| “swap staging to production with no downtime” | Deployment slot swap | Slot-specific (sticky) settings don’t swap. |
| “autoscale a web app” | Standard tier or higher | Basic = manual scale only. |
| “run a container quickly, no orchestration” | Azure Container Instances | Cheapest, simplest single container. |
| “orchestration, scaling, many containers” | AKS (or Container Apps) | Node pools, cluster autoscaler. |
| “store private container images” | Azure Container Registry | Admin user or managed identity / service principal to pull. |
| “VM must access Key Vault without stored credentials” | Managed identity | System-assigned dies with the resource; user-assigned is shared. |
| “move a managed disk to another region” | Snapshot → copy → create disk | Or Resource Mover. |

## Networking

Peering is never transitive, address spaces can’t overlap, and NSG questions are almost always solved by reading rule priorities lowest number first.

| When you see… | The answer is usually… | Why / watch out |
| --- | --- | --- |
| VNet1–VNet2–VNet3, VNet1 can’t reach VNet3 | Peer VNet1 and VNet3 directly | Or hub NVA + UDRs + allow forwarded traffic (more effort). |
| “peering fails to create” | Overlapping address spaces | Must change the address space first. |
| “spokes use the hub’s VPN gateway” | Allow gateway transit (hub) + Use remote gateways (spoke) | Only one gateway per VNet. |
| “connect two VNets in different regions cheaply and fast” | Global VNet peering | VNet-to-VNet VPN is the older, slower option. |
| “connect an on-premises site over the internet, encrypted” | Site-to-site VPN | Needs a VPN gateway, local network gateway, and connection. |
| “individual remote users” | Point-to-site VPN | Certificate, Entra ID (OpenVPN only), or RADIUS auth. |
| “private, dedicated, not over the internet” | ExpressRoute | Can add VPN as a failover. |
| “GatewaySubnet” | Must be named exactly GatewaySubnet | /27 or larger recommended. |
| NSG: which traffic is allowed? | Lowest priority number wins; first match stops processing | Inbound: subnet NSG, then NIC NSG. Both must allow. |
| “group VMs by role in NSG rules without IPs” | Application security groups | ASGs must be in the same VNet as the NICs. |
| “force traffic through a firewall / NVA” | Route table (UDR) with next hop = virtual appliance | Associate it with the subnet; enable IP forwarding on the NVA NIC. |
| “centralized, stateful filtering with FQDN rules” | Azure Firewall | NSGs can’t filter by FQDN. |
| “load balance HTTP, URL path routing, TLS termination, WAF” | Application Gateway | Layer 7, regional. |
| “load balance TCP/UDP, any port” | Azure Load Balancer | Layer 4. Standard SKU for zones and SLA. |
| “global HTTP routing, nearest region” | Azure Front Door | Traffic Manager = DNS-based, any protocol. |
| “VMs resolve each other by name across VNets” | Private DNS zone linked to each VNet (auto-registration) | A VNet can have auto-registration for only one private zone. |
| “delegate a domain to Azure DNS” | Update NS records at the registrar | Azure DNS doesn’t register domains. |
| “access a PaaS service over a private IP” | Private endpoint (+ private DNS zone) | Service endpoint keeps the public IP but restricts the source. |
| “RDP to VMs without public IPs, through the portal” | Azure Bastion | Needs AzureBastionSubnet (/26 or larger). |
| “outbound internet with a static IP for many VMs” | NAT gateway | Associate with the subnet. |
| “why can’t VM1 reach VM2” troubleshooting | Network Watcher: IP flow verify / effective security rules | Next hop for routing issues; Connection troubleshoot end to end. |

## Monitoring and backup

Vaults follow region, not resource group: count the distinct regions to get the minimum number of vaults.

| When you see… | The answer is usually… | Why / watch out |
| --- | --- | --- |
| “minimum number of Recovery Services vaults” | One per region containing VMs | Resource group doesn’t matter. |
| “back up Azure VMs, SQL in VM, Azure Files” | Recovery Services vault | Backup vault covers newer workloads: blobs, managed disks, PostgreSQL. |
| “restore a single file from a VM backup” | File Recovery (mount the recovery point with a script) | No need to restore the whole VM. |
| “back up on-premises files and folders” | MARS agent | MABS / DPM for app-aware on-premises workloads. |
| “replicate VMs to another region for disaster recovery” | Azure Site Recovery | Backup = point-in-time restore; ASR = failover. |
| “restore backups in the paired region” | GRS vault + Cross Region Restore | LRS and ZRS vaults keep data in one region. |
| “delete a vault” fails | Stop backup, delete backup data, wait out soft delete (14 days) | Then remove remaining dependencies. |
| “notify admins by email/SMS when an alert fires” | Action group | One action group can be reused by many alert rules. |
| “alert when CPU > 80%” | Metric alert | Log alert for KQL queries; activity log alert for “someone deleted a resource”. |
| “who deleted / changed a resource” | Activity log | Retained 90 days by default; send to Log Analytics for longer. |
| “collect performance counters and event logs from VMs” | Azure Monitor Agent + data collection rule → Log Analytics | The older Log Analytics agent (MMA) is retired. |
| “query logs” | KQL in a Log Analytics workspace | Know: where, summarize, project, render, ago(). |
| “see dependencies and performance across VMs” | VM insights | Requires the Dependency agent for the map. |
| “monitor web app availability from multiple locations” | Application Insights availability tests | |
| “capture packets on a VM” | Network Watcher packet capture | Needs the Network Watcher extension on the VM. |
| “continuously monitor latency to on-premises” | Network Watcher Connection monitor | IP flow verify and next hop are one-time checks. |

## Constraint phrases that change the answer

When two options both work, the constraint phrase at the end of the question picks the winner.

| Phrase | Pick the option that… | Example |
| --- | --- | --- |
| “minimize administrative effort” | Is built in, managed, or a single setting | Direct peering over NVA + UDRs; Azure Policy over a script. |
| “minimize cost” | Uses the cheapest tier that still meets every requirement | LRS over GRS when there’s no regional requirement; ACI over AKS. |
| “least privilege” | Grants the narrowest role at the narrowest scope | VM Contributor on one RG, not Contributor on the subscription. |
| “without downtime” | Avoids a restart or redeploy | Slot swap; key rotation with two keys. |
| “must be able to… without failover” | Adds a read-access secondary | RA-GRS / RA-GZRS. |
| “from the portal only” / “without installing software” | Uses a browser-based tool | Bastion, Cloud Shell. |
| “existing resources” | Needs remediation, not just a new assignment | Policy remediation task. |
| “Each correct answer presents a complete solution” | Every selected option must work on its own | Don’t pick two halves of one solution. |
| “Each correct answer presents part of the solution” | The selected options work together | Order and dependencies matter. |

## Classic traps checklist

Run through these before you lock in an answer.

- Contributor can’t assign roles or delete locks.
- ReadOnly lock blocks starting VMs and listing storage keys, not just edits.
- Peering is not transitive.
- Overlapping address spaces block peering.
- Vaults must match the VM’s region, not its resource group.
- Availability sets can only be set at VM creation.
- GRS secondary is not readable until failover; only RA-* is.
- Archive-tier blobs must be rehydrated before they can be read.
- Basic App Service tier has no deployment slots or autoscale.
- Policy Deny doesn’t affect resources that already exist.
- NSG rules: lowest number wins, and both subnet and NIC NSGs must allow.
- ASGs and NICs must be in the same VNet.
- Dynamic groups need Entra ID P1.
- Resizing or changing a VM’s availability usually means a restart or a rebuild.
