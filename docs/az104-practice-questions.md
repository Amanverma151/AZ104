# AZ-104 Practice Exam: 100 Scenario Questions

Each question is followed by its answer, the signal phrases that point to it, and an explanation. Domains are weighted roughly like the real exam.

## Identities & governance

### Question 1

Contoso has an Azure subscription named Sub1 that contains an existing virtual machine named VM1 in the West US region. You assign the built-in Allowed locations policy to Sub1 and configure it to allow only East US and East US 2.

What happens to VM1?

- A. VM1 is stopped and deallocated until it is moved
- B. VM1 is deleted automatically at the next evaluation cycle
- C. VM1 is moved to East US
- D. VM1 is flagged as non-compliant but continues to run

**Answer:** D

**Signal phrases:** “an existing virtual machine”; “Allowed locations policy”

**Why:** “Existing” is the signal. A Deny-effect policy such as Allowed locations blocks new create and update requests, but it never deletes, moves or stops resources that are already deployed. The compliance scan simply marks VM1 as non-compliant. To fix it you would redeploy VM1 in an allowed region.

---

### Question 2

Your company has a management group named MG1 that contains a subscription named Sub1. Sub1 contains a resource group named RG1. RG1 has a CanNotDelete lock. You have the role assignments shown in the following table.

For each of the following statements, select Yes if the statement is true. Otherwise, select No.

| User | Role | Scope |
| --- | --- | --- |
| User1 | Reader | MG1 |
| User2 | Contributor | Sub1 |
| User3 | Owner | RG1 |

| Statement | Yes | No |
| --- | --- | --- |
| User1 can view the virtual machines in RG1. | ○ | ○ |
| User2 can assign the Reader role to other users for RG1. | ○ | ○ |
| User3 can delete the lock on RG1. | ○ | ○ |

**Answer:** Yes, No, Yes

**Signal phrases:** “that contains a subscription named Sub1”; “Reader”; “Contributor”; “Owner”

**Why:** Role assignments inherit downward (MG1 → Sub1 → RG1 → resources), so User1’s Reader role at MG1 lets them view everything in RG1. Contributor manages resources but can’t grant access, because it excludes Microsoft.Authorization write and delete actions. Owner includes those actions, so User3 can remove the lock.

---

### Question 3

The operations team at Fabrikam must be able to start, stop, and restart all virtual machines in a resource group named RG-Prod. The team must not be able to create, resize, or delete virtual machines.

You need to grant the required access. The solution must follow the principle of least privilege.

What should you do?

- A. Create a custom role that includes only the read, start, powerOff, restart, and deallocate actions for virtual machines, and assign it at the RG-Prod scope
- B. Assign the Virtual Machine Contributor role at the RG-Prod scope
- C. Assign the Contributor role at the RG-Prod scope
- D. Assign the Reader role at the subscription scope and the Virtual Machine Contributor role at the RG-Prod scope

**Answer:** A

**Signal phrases:** “must not be able to create, resize, or delete”; “principle of least privilege”

**Why:** Contributor and Virtual Machine Contributor can both create, resize and delete VMs, which “must not be able to create, resize, or delete” rules out. When no listed built-in role is narrow enough, “least privilege” points to a custom role containing only Microsoft.Compute/virtualMachines/read plus the start, powerOff, restart and deallocate actions.

---

### Question 4

Litware uses Microsoft Entra ID Free. HR wants each employee to be added automatically to a security group based on the department attribute in their user profile. Group membership must update automatically when the department attribute changes, without custom code.

You need to recommend a solution that minimizes licensing costs.

What should you recommend?

- A. Create an assigned security group and a PowerShell script that runs nightly
- B. Upgrade to Microsoft Entra ID P1 and create a dynamic membership group
- C. Upgrade to Microsoft Entra ID P2 and create a dynamic membership group
- D. Create a Microsoft 365 group and set the HR manager as the owner

**Answer:** B

**Signal phrases:** “added automatically to a security group based on the department attribute”; “without custom code”; “minimizes licensing costs”

**Why:** Automatic membership driven by a user attribute is a dynamic membership group, and “without custom code” rules out the script. Dynamic groups need Entra ID P1. P2 also works but costs more, so “minimizes licensing costs” makes P1 the answer.

---

### Question 5

Contoso is starting a joint project with Fabrikam. Fabrikam consultants must access a Contoso web app that uses Microsoft Entra ID for authentication. Fabrikam already uses its own Microsoft Entra tenant, and the consultants must sign in with their existing Fabrikam credentials. Contoso administrators must be able to remove a consultant’s access at any time.

What should you do?

- A. Create a Microsoft Entra ID B2C tenant and register the web app
- B. Create new member accounts for the consultants in the Contoso tenant
- C. Invite the consultants as guest users in the Contoso tenant
- D. Configure Microsoft Entra Connect to synchronize Fabrikam users to the Contoso tenant

**Answer:** C

**Signal phrases:** “sign in with their existing Fabrikam credentials”; “Fabrikam already uses its own Microsoft Entra tenant”

**Why:** Partner users signing in with their own organization’s credentials is B2B collaboration: invite them as guests. Contoso can delete or block a guest at any time. B2C is for customer-facing apps, new member accounts would give them new credentials, and Entra Connect syncs on-premises AD, not another tenant.

---

### Question 6

*This question is part of a series that presents the same scenario. Each question in the series contains a unique solution that might meet the stated goals.*

You have a resource group named RG1 that contains production resources. Administrators must be able to modify the configuration of resources in RG1. You need to ensure that no one can accidentally delete RG1 or any resource in it.

Solution: You apply a ReadOnly lock to RG1.

Does this meet the goal?

- Yes
- No

**Answer:** No

**Signal phrases:** “must be able to modify the configuration”; “ReadOnly lock”

**Why:** A ReadOnly lock prevents deletion, but it also blocks every modification, so administrators could no longer change configuration. The requirement “must be able to modify the configuration” makes this solution fail.

---

### Question 7

*This question is part of a series that presents the same scenario. Each question in the series contains a unique solution that might meet the stated goals.*

You have a resource group named RG1 that contains production resources. Administrators must be able to modify the configuration of resources in RG1. You need to ensure that no one can accidentally delete RG1 or any resource in it.

Solution: You apply a CanNotDelete lock to RG1.

Does this meet the goal?

- Yes
- No

**Answer:** Yes

**Signal phrases:** “accidentally delete”; “CanNotDelete lock”

**Why:** A CanNotDelete lock blocks deletion of RG1 and every resource in it while still allowing read and modify operations. It applies to all users, including Owners, until someone with lock permissions removes it.

---

### Question 8

*This question is part of a series that presents the same scenario. Each question in the series contains a unique solution that might meet the stated goals.*

You have a resource group named RG1 that contains production resources. Administrators must be able to modify the configuration of resources in RG1. You need to ensure that no one can accidentally delete RG1 or any resource in it.

Solution: You remove the Owner role from all administrators and assign them the Contributor role on RG1.

Does this meet the goal?

- Yes
- No

**Answer:** No

**Signal phrases:** “no one can accidentally delete”; “Contributor role”

**Why:** Contributor can still delete resources and resource groups; it only lacks permission to manage access. RBAC changes who can act, not what can be deleted. Preventing deletion for everyone is the job of a lock.

---

### Question 9

Your subscription contains 15 resource groups. Each resource group has a tag named CostCenter with a unique value. The finance team reports that most resources do not have a CostCenter tag, so cost reports cannot be grouped by cost center.

You need to ensure that every resource, including resources that already exist, has the same CostCenter tag value as its resource group. The solution must minimize administrative effort.

What should you do?

- A. Reapply the CostCenter tag to each resource group so that resources inherit it
- B. Apply the CostCenter tag at the subscription level
- C. Assign the Inherit a tag from the resource group policy and create a remediation task
- D. Assign the Require a tag on resources policy with the Deny effect

**Answer:** C

**Signal phrases:** “including resources that already exist”; “same CostCenter tag value as its resource group”

**Why:** Tags never inherit on their own, so reapplying them does nothing. The Inherit a tag from the resource group policy uses the Modify effect to copy the value, and “including resources that already exist” means you also need a remediation task. A Deny policy only blocks new untagged resources.

---

### Question 10

Contoso has 12 Azure subscriptions. Eight subscriptions belong to the research department and four belong to the finance department. The security team must apply the same set of 14 policy definitions to all research subscriptions, and any research subscription created in the future must automatically receive the same policies.

The solution must minimize administrative effort.

What should you do?

- A. Assign each of the 14 policies to each research subscription
- B. Create a management group for research, move the research subscriptions into it, and assign a policy initiative to the management group
- C. Create a resource group in each research subscription and assign the policies to the resource groups
- D. Create a policy initiative and assign it to each research subscription

**Answer:** B

**Signal phrases:** “same set of 14 policy definitions”; “created in the future must automatically receive”

**Why:** Grouping 14 definitions points to an initiative. Applying it automatically to subscriptions that don’t exist yet points to a management group, because anything placed under it inherits its assignments. Together that’s one assignment instead of eight, plus one move for each new subscription.

---

### Question 11

You plan to move a virtual machine named VM1, its managed disks, and its network interface from a subscription named Sub1 to a subscription named Sub2. Before starting the move, you need to verify a prerequisite.

What should you verify?

- A. Sub1 and Sub2 are associated with the same Microsoft Entra tenant
- B. Sub1 and Sub2 contain resource groups with identical names
- C. VM1 is running
- D. Sub1 and Sub2 use the same billing account

**Answer:** A

**Signal phrases:** “from a subscription named Sub1 to a subscription named Sub2”

**Why:** Moving resources between subscriptions requires both subscriptions to trust the same Entra tenant. The resource group names, billing account and VM power state don’t matter. If the tenants differ, you must first transfer the subscription to the same tenant.

---

### Question 12

Contoso synchronizes on-premises Active Directory users to Microsoft Entra ID by using Microsoft Entra Connect. Users must be able to reset forgotten passwords from the internet, and the new password must work when they sign in to on-premises domain-joined computers.

What should you configure?

- A. Password hash synchronization only
- B. Self-service password reset with password writeback, and Microsoft Entra ID P1 licenses
- C. Seamless single sign-on
- D. Self-service password reset only

**Answer:** B

**Signal phrases:** “synchronizes on-premises Active Directory users”; “must work when they sign in to on-premises domain-joined computers”

**Why:** SSPR alone changes only the cloud password. For a hybrid user whose new password must work on-premises, the change has to be written back to AD DS: that’s password writeback, which requires P1. Password hash sync moves passwords in the other direction, from on-premises to the cloud.

---

### Question 13

You assign Microsoft 365 E3 licenses to a group named Sales that has 120 members. The tenant has 200 unassigned E3 licenses. Licenses are applied successfully to 112 users, but 8 users are in an error state. All 8 users were created recently by a PowerShell script that set only their display name, user principal name, and password.

What is the most likely cause of the error?

- A. The Sales group is a Microsoft 365 group instead of a security group
- B. The users do not have a usage location set
- C. The users do not have a manager assigned
- D. There are not enough available licenses

**Answer:** B

**Signal phrases:** “200 unassigned”; “set only their display name, user principal name, and password”; “8 users are in an error state”

**Why:** “200 unassigned” rules out a license shortage. The script that “set only” three properties is the clue: a license can’t be assigned to a user without a usage location, because service availability varies by country. Set the usage location and reprocess the group license.

---

### Question 14

Your company sets a monthly budget of USD 5,000 for a resource group named RG-Dev. Managers want an email when actual spending reaches 80 percent of the budget. When actual spending reaches 100 percent, all virtual machines in RG-Dev must be shut down automatically.

What should you configure?

- A. An Azure Policy assignment that denies VM creation when the budget is exceeded
- B. An Azure Advisor alert with a cost recommendation
- C. A budget with a spending cap that stops resources at 100 percent
- D. A budget with two alert conditions, where the 100 percent condition triggers an action group that runs an Automation runbook to stop the VMs

**Answer:** D

**Signal phrases:** “an email when actual spending reaches 80 percent”; “must be shut down automatically”

**Why:** Budgets only alert; they never stop resources by themselves. To act automatically, attach an action group that triggers a runbook, Logic App or function. Policy can’t read spending, and spending caps exist only on some offer types at subscription level.

---

### Question 15

Your manager asks you to identify virtual machines that have had consistently low CPU utilization over the past two weeks so they can be resized or shut down to reduce costs. You need to identify the virtual machines by using the least amount of effort.

What should you use?

- A. Cost analysis in Microsoft Cost Management
- B. Azure Advisor cost recommendations
- C. A Log Analytics query against the Perf table
- D. Azure Policy compliance reports

**Answer:** B

**Signal phrases:** “consistently low CPU utilization”; “least amount of effort”

**Why:** Azure Advisor already analyzes VM utilization and recommends resizing or shutting down underused machines, with no setup. Cost analysis shows spending, not utilization. A Log Analytics query would work but needs agents, data collection and a query, which isn’t “least amount of effort”.

---

### Question 16

You assign a policy initiative named Prod-Baseline to a subscription named Sub1. The initiative denies the creation of public IP addresses. The networking team needs to create public IP addresses in a resource group named RG-Edge in Sub1. All other resource groups in Sub1 must remain subject to the initiative.

What should you do?

- A. Create a second initiative without the public IP policy and assign it to RG-Edge
- B. Add RG-Edge as an exclusion on the Prod-Baseline assignment
- C. Apply a CanNotDelete lock to RG-Edge
- D. Assign the Owner role to the networking team for RG-Edge

**Answer:** B

**Signal phrases:** “needs to create public IP addresses in a resource group named RG-Edge”; “All other resource groups in Sub1 must remain subject”

**Why:** Policy applies regardless of RBAC role, so making the team Owners doesn’t help. Adding another, more permissive assignment doesn’t either, because every applicable Deny still wins. An exclusion (or an exemption) on the assignment removes just RG-Edge from its scope.

---

### Question 17

You have a subscription named Sub1 that contains two resource groups named RG1 and RG2. You assign the Allowed locations policy twice, as shown in the following table. Both assignments use the Deny effect.

For each of the following statements, select Yes if the statement is true. Otherwise, select No.

| Assignment | Scope | Allowed locations |
| --- | --- | --- |
| Policy1 | Sub1 | East US, West US |
| Policy2 | RG1 | East US |

| Statement | Yes | No |
| --- | --- | --- |
| You can create a storage account in RG1 in West US. | ○ | ○ |
| You can create a storage account in RG1 in East US. | ○ | ○ |
| You can create a storage account in RG2 in West US. | ○ | ○ |

**Answer:** No, Yes, Yes

**Signal phrases:** “Both assignments use the Deny effect”

**Why:** A resource must satisfy every policy assignment that applies to it, whether direct or inherited. RG1 is subject to both, so only East US passes both. RG2 is subject only to Policy1, so West US is allowed there. With policy, the most restrictive result wins.

---

### Question 18

A network engineer named User1 must manage virtual networks, network security groups, and route tables in a resource group named RG-Net. User1 must not be able to manage virtual machines or storage accounts in RG-Net.

Which role should you assign to User1 at the RG-Net scope?

- A. Network Contributor
- B. Security Admin
- C. Virtual Machine Contributor
- D. Contributor

**Answer:** A

**Signal phrases:** “must not be able to manage virtual machines or storage accounts”

**Why:** Network Contributor covers VNets, NSGs, route tables and other networking resources, without access to compute or storage. Contributor is too broad given “must not be able to manage virtual machines or storage accounts”. Virtual Machine Contributor manages VMs, the opposite of what’s needed.

---

### Question 19

Your company is onboarding 400 new employees next week. HR has provided a spreadsheet that contains each employee’s name, user principal name, and department. You need to create the user accounts in Microsoft Entra ID.

The solution must minimize administrative effort and must not require writing scripts.

What should you do?

- A. Create the users one at a time in the Azure portal
- B. Run New-MgUser in a loop from Azure Cloud Shell
- C. Use Bulk create in the Microsoft Entra admin center with the CSV template
- D. Use Bulk invite in the Microsoft Entra admin center

**Answer:** C

**Signal phrases:** “new employees”; “must not require writing scripts”

**Why:** Bulk create takes a CSV upload and creates member accounts with no code. Bulk invite looks similar but creates guest users, which is wrong for “new employees”. PowerShell works but breaks “must not require writing scripts”.

---

### Question 20

User1 is a Global Administrator in your Microsoft Entra tenant. User1 needs to view and manage all Azure subscriptions in the tenant, including subscriptions created by other teams where User1 has no role assignments. User1 can sign in to the Azure portal but cannot see those subscriptions.

What should User1 do first?

- A. Activate the Privileged Role Administrator role
- B. Enable Access management for Azure resources in the Microsoft Entra ID properties
- C. Create a management group and move the subscriptions into it
- D. Assign themselves the Owner role on each subscription

**Answer:** B

**Signal phrases:** “Global Administrator”; “has no role assignments”

**Why:** Global Administrator is an Entra role and grants no Azure RBAC access by default. Elevating access through the Access management for Azure resources toggle gives User1 User Access Administrator at the root scope (/), after which they can assign themselves roles on any subscription. User1 can’t do the other options without that access.

---

### Question 21

Your organization frequently invites guest users. A recent audit found that guests were invited from personal email domains. Security policy now requires that guest invitations be sent only to users at the partner domains fabrikam.com and litware.com.

What should you configure?

- A. Collaboration restrictions in the external collaboration settings that allow invitations only to the specified domains
- B. A Conditional Access policy that blocks guest sign-ins
- C. An Azure Policy assignment that denies guest user creation
- D. Cross-tenant access settings that block all inbound B2B collaboration

**Answer:** A

**Signal phrases:** “invitations be sent only to users at the partner domains”

**Why:** Restricting which domains can be invited is the allow list in the external collaboration settings. Conditional Access controls sign-in, not invitations. Blocking all B2B would also block the partners, and Azure Policy governs Azure resources, not Entra users.

---

### Question 22

Contoso deploys resources for three departments across five subscriptions. Every resource has a Department tag. Finance needs a single monthly view of Azure costs broken down by department across all five subscriptions.

What should you do?

- A. Create a budget in each subscription
- B. Create a separate resource group for each department in each subscription
- C. Export the activity log to a storage account
- D. Use Cost analysis at a scope that contains all five subscriptions, such as a management group, and group costs by the Department tag

**Answer:** D

**Signal phrases:** “across all five subscriptions”; “broken down by department”; “Department tag”

**Why:** Cost analysis can group costs by tag, and running it at a management group or billing scope covers all five subscriptions in one view. Budgets alert on thresholds rather than report. The activity log records operations, not costs.

---

### Question 23

Help desk staff must be able to reset passwords for non-administrator users. They must not be able to perform any other user management tasks. The solution must follow the principle of least privilege.

Which Microsoft Entra role should you assign?

- A. Helpdesk Administrator
- B. Global Administrator
- C. Password Administrator
- D. User Administrator

**Answer:** C

**Signal phrases:** “must not be able to perform any other user management tasks”; “principle of least privilege”

**Why:** Password Administrator can reset passwords for non-administrators and other Password Administrators, and nothing else. Helpdesk Administrator adds abilities such as invalidating refresh tokens, and User Administrator can create and delete users. “Least privilege” plus “must not … perform any other” tasks points to the narrowest role.

---

## Storage

### Question 24

An application writes diagnostic logs to a blob container in a general-purpose v2 storage account. Logs are read frequently during the first 30 days, occasionally until day 180, and almost never after that, but they must be retained for seven years. Retrieval delays of several hours are acceptable for logs older than 180 days.

You need to minimize storage costs while meeting the requirements with the least administrative effort.

What should you do?

- A. Set the default access tier of the storage account to Archive
- B. Configure a lifecycle management rule that moves blobs to Cool after 30 days, to Archive after 180 days, and deletes them after 2,555 days
- C. Configure a lifecycle management rule that deletes blobs after 30 days
- D. Create an Azure Automation runbook that changes blob tiers every month

**Answer:** B

**Signal phrases:** “Retrieval delays of several hours are acceptable”; “retained for seven years”; “least administrative effort”

**Why:** Access that drops off over time, with tiering by age, is a lifecycle management rule, and that is less effort than a runbook. “Retrieval delays of several hours are acceptable” is the code for Archive. The account’s default tier can only be Hot or Cool, never Archive, and deleting after 30 days breaks the seven-year retention.

---

### Question 25

A blob named report2019.pdf is stored in the Archive tier. A user reports that attempts to download the blob fail. The user needs to read the blob, and it will be accessed regularly for the next month.

What should you do?

- A. Give the user the storage account access key
- B. Generate a SAS token with read permission for the blob
- C. Change the blob’s access tier to Hot and wait for rehydration to complete
- D. Enable blob versioning on the storage account

**Answer:** C

**Signal phrases:** “stored in the Archive tier”; “accessed regularly for the next month”

**Why:** Archived blobs are offline: no credential, SAS or key can read them until they’re rehydrated to an online tier. Rehydration can take up to 15 hours at standard priority. Because the blob “will be accessed regularly”, Hot is the right target tier.

---

### Question 26

A vendor must upload files to a container named incoming in a storage account named contosodata for the next 14 days. Other applications use the account access keys and must not be affected if the vendor’s access needs to be revoked early.

You need to grant access to the vendor.

What should you do?

- A. Set the public access level of the incoming container to Container
- B. Generate an account SAS with write permission that is valid for 14 days
- C. Give the vendor the key2 access key
- D. Create a stored access policy on the incoming container and generate a service SAS that references it

**Answer:** D

**Signal phrases:** “revoked early”; “must not be affected”

**Why:** An ordinary SAS can only be revoked by regenerating the key that signed it, which would break the other apps. A SAS tied to a stored access policy can be revoked by deleting or editing the policy. That leaves the keys, and the apps that use them, untouched.

---

### Question 27

You are reviewing the shared access signature (SAS) options for a storage account named storage1.

For each of the following statements, select Yes if the statement is true. Otherwise, select No.

| Statement | Yes | No |
| --- | --- | --- |
| A user delegation SAS is secured with Microsoft Entra credentials instead of an account key. | ○ | ○ |
| A single account SAS can grant access to both the Blob and Queue services. | ○ | ○ |
| A service SAS can grant access to both the Blob and File services in the same token. | ○ | ○ |

**Answer:** Yes, Yes, No

**Signal phrases:** “user delegation SAS”; “account SAS”; “service SAS”

**Why:** A user delegation SAS is signed with a key obtained by using Entra credentials, and it works for Blob storage only. An account SAS can span several services. A service SAS is limited to one service, as the name suggests.

---

### Question 28

Contoso has an on-premises Active Directory Domain Services (AD DS) domain that is synchronized to Microsoft Entra ID. You create an Azure file share named share1 in a storage account named storage1. Domain-joined computers must access share1 by using users’ existing AD DS credentials, and administrators must control access by using NTFS permissions.

Which two actions should you perform? Each correct answer presents part of the solution.

- A. Enable anonymous access on storage1
- B. Configure a private endpoint for storage1
- C. Generate a SAS token for share1 and distribute it by using Group Policy
- D. Assign a share-level role, such as Storage File Data SMB Share Contributor, to the users or groups
- E. Enable AD DS authentication for storage1 by joining the storage account to the domain

**Answer:** D and E

**Signal phrases:** “existing AD DS credentials”; “NTFS permissions”; “Each correct answer presents part of the solution”

**Why:** Identity-based access to Azure Files has two layers. Enable AD DS authentication on the account so Kerberos tickets work, then grant share-level permission with an RBAC role. NTFS permissions then apply on top of that. SAS tokens don’t work with SMB mounts, and a private endpoint is about network path, not identity.

---

### Question 29

You plan to use Azure File Sync to cache an Azure file share on an on-premises Windows Server named FS1. You have already created a storage account and a file share.

Which resource must you create before you can register FS1?

- A. A sync group
- B. A Recovery Services vault
- C. A Storage Sync Service
- D. A server endpoint

**Answer:** C

**Signal phrases:** “before you can register FS1”

**Why:** The File Sync order is: Storage Sync Service, then install the agent and register the server to that service, then create a sync group with a cloud endpoint, then add a server endpoint. A server can only be registered to an existing Storage Sync Service, and sync groups and endpoints come later.

---

### Question 30

Every night, a Linux server must copy new blobs from a container in a storage account in East US to a container in a storage account in West Europe. The copy must be scripted and must run without a graphical interface.

What should you use?

- A. Azure Storage Explorer
- B. Robocopy
- C. AzCopy
- D. Azure Data Box

**Answer:** C

**Signal phrases:** “Linux server”; “must be scripted”; “without a graphical interface”

**Why:** AzCopy is the cross-platform command-line tool for copying blobs, including server-side copies between accounts. Storage Explorer is a GUI, Data Box is for offline transfers, and Robocopy is a Windows file copy tool that doesn’t speak the Blob API.

---

### Question 31

Contoso needs to migrate 60 TB of archived video files from its datacenter to Azure Blob Storage. The datacenter has a 50 Mbps internet connection that is shared with production traffic. Contoso does not want to purchase or prepare its own hard drives.

What should you recommend?

- A. AzCopy over the internet connection
- B. Azure Import/Export service
- C. Azure File Sync
- D. Azure Data Box

**Answer:** D

**Signal phrases:** “60 TB”; “50 Mbps”; “does not want to purchase or prepare its own hard drives”

**Why:** 60 TB over a shared 50 Mbps link would take months, so an offline transfer is needed. Import/Export is offline too, but you supply your own drives. “Does not want to purchase or prepare its own hard drives” means Data Box, where Microsoft ships you the device.

---

### Question 32

Virtual machines in a subnet named Subnet1 in VNet1 access a storage account named storage1. You need to ensure that storage1 accepts requests only from Subnet1. Traffic may continue to use the storage account’s public endpoint.

The solution must minimize cost.

What should you do?

- A. Enable the Microsoft.Storage service endpoint on Subnet1 and add Subnet1 to the storage1 firewall
- B. Configure an NSG on Subnet1 that allows outbound traffic to the Storage service tag
- C. Create a private endpoint for storage1 in Subnet1
- D. Rotate the storage1 access keys

**Answer:** A

**Signal phrases:** “may continue to use the storage account’s public endpoint”; “minimize cost”

**Why:** A service endpoint plus a virtual network rule on the storage firewall restricts access to Subnet1, and service endpoints are free. A private endpoint also works but is billed and is meant for when the public endpoint must be avoided. “May continue to use the … public endpoint” plus “minimize cost” tips it to the service endpoint.

---

### Question 33

A storage account named finance1 must be reachable only through a private IP address, both from VNet1 and from on-premises servers that connect through a site-to-site VPN. Public network access to finance1 must be disabled.

Which two resources should you configure? Each correct answer presents part of the solution.

- A. A NAT gateway
- B. A public IP address for finance1
- C. A service endpoint on the VNet1 subnet
- D. A private DNS zone named privatelink.blob.core.windows.net linked to VNet1, with DNS forwarding configured for on-premises clients
- E. A private endpoint for finance1 in VNet1

**Answer:** D and E

**Signal phrases:** “only through a private IP address”; “Public network access to finance1 must be disabled”; “on-premises servers”

**Why:** A private IP for a PaaS service means a private endpoint, and disabling public access rules out service endpoints, which still use the public endpoint. Clients also need the account name to resolve to that private IP. That is the privatelink DNS zone, with forwarding so on-premises servers can resolve it too.

---

### Question 34

An administrator accidentally deleted an entire blob container named invoices last week. Management wants to be able to recover a deleted container for up to 14 days in the future.

What should you enable?

- A. Container soft delete
- B. A CanNotDelete lock on the storage account
- C. Blob soft delete
- D. Blob versioning

**Answer:** A

**Signal phrases:** “deleted an entire blob container”

**Why:** Container soft delete is the feature that restores deleted containers. Blob soft delete and versioning protect individual blobs, not a whole container. A lock protects management-plane operations such as deleting the account; it doesn’t give you anything to restore.

---

### Question 35

Regulations require that trade records stored in Azure Blob Storage cannot be modified or deleted by anyone, including administrators, for seven years after they are written.

What should you configure?

- A. Blob soft delete with 365-day retention
- B. A ReadOnly lock on the storage account
- C. A locked time-based retention policy on the container
- D. A scheduled rotation of the storage account access keys

**Answer:** C

**Signal phrases:** “cannot be modified or deleted”; “including administrators”

**Why:** Write once, read many (WORM) compliance is immutable storage. Once a time-based retention policy is locked, nobody, administrators included, can shorten it or delete the data before it expires. Owners can remove a ReadOnly lock, and soft delete still allows changes and deletion.

---

### Question 36

You want blobs written to a container in storage1 in East US to be copied asynchronously to a container in storage2 in Southeast Asia, so that users in Asia get lower-latency reads. You plan to configure object replication.

Which feature must be enabled on both storage1 and storage2?

- A. Container soft delete
- B. Blob versioning
- C. Hierarchical namespace
- D. Change feed

**Answer:** B

**Signal phrases:** “object replication”; “both storage1 and storage2”

**Why:** Object replication requires blob versioning on both the source and destination accounts. Change feed is required only on the source, which is why the question says “both”. Hierarchical namespace accounts don’t support object replication.

---

### Question 37

A line-of-business application needs an SMB file share with consistently low latency and high IOPS. You need to create a storage account to host the share.

Which storage account type should you create?

- A. Premium page blobs
- B. Standard general-purpose v2
- C. Premium file shares (FileStorage)
- D. Premium block blobs

**Answer:** C

**Signal phrases:** “SMB file share”; “consistently low latency and high IOPS”

**Why:** Premium Azure Files runs only in a FileStorage account on SSDs. Standard general-purpose v2 hosts file shares on HDD-backed storage. The other premium kinds are for blobs, not files.

---

### Question 38

*This question is part of a series that presents the same scenario. Each question in the series contains a unique solution that might meet the stated goals.*

Your storage account named storage1 contains a private container named reports. A partner needs read-only access to the blobs in reports for the next 24 hours. You must not share the storage account keys, and access must expire automatically.

Solution: You change the public access level of reports to Blob (anonymous read access for blobs only).

Does this meet the goal?

- Yes
- No

**Answer:** No

**Signal phrases:** “access must expire automatically”; “anonymous read access”

**Why:** Anonymous access works for anyone with the URL, not only the partner, and it never expires on its own. It fails “access must expire automatically” and is a security risk.

---

### Question 39

*This question is part of a series that presents the same scenario. Each question in the series contains a unique solution that might meet the stated goals.*

Your storage account named storage1 contains a private container named reports. A partner needs read-only access to the blobs in reports for the next 24 hours. You must not share the storage account keys, and access must expire automatically.

Solution: You generate a service SAS for the reports container with Read and List permissions and an expiry time 24 hours from now.

Does this meet the goal?

- Yes
- No

**Answer:** Yes

**Signal phrases:** “access must expire automatically”; “expiry time 24 hours from now”

**Why:** A SAS is a delegated token with built-in permissions and an expiry. The partner never sees the account key, and access stops automatically after 24 hours.

---

### Question 40

*This question is part of a series that presents the same scenario. Each question in the series contains a unique solution that might meet the stated goals.*

Your storage account named storage1 contains a private container named reports. A partner needs read-only access to the blobs in reports for the next 24 hours. You must not share the storage account keys, and access must expire automatically.

Solution: You give the partner the key1 access key and regenerate key1 after 24 hours.

Does this meet the goal?

- Yes
- No

**Answer:** No

**Signal phrases:** “You must not share the storage account keys”

**Why:** This directly breaks “must not share the storage account keys”. An account key also grants full control of the whole account, not read-only access to one container, and regenerating it is manual rather than automatic expiry.

---

### Question 41

You need to configure a storage account to encrypt data by using a customer-managed key stored in an existing Azure key vault named KV1. The configuration fails validation because of a key vault setting.

Which settings must be enabled on KV1?

- A. Soft delete and purge protection
- B. Public network access from all networks
- C. The Azure RBAC permission model
- D. A key rotation policy

**Answer:** A

**Signal phrases:** “customer-managed key”; “fails validation because of a key vault setting”

**Why:** Storage encryption with customer-managed keys requires the vault to have soft delete and purge protection enabled. That stops anyone from permanently destroying the key and making the data unreadable. The other settings are optional.

---

## Compute

### Question 42

You deploy 15 virtual machines to an availability set named AS1. AS1 is configured with 3 fault domains and 5 update domains.

For each of the following statements, select Yes if the statement is true. Otherwise, select No.

| Statement | Yes | No |
| --- | --- | --- |
| During planned maintenance, no more than 3 virtual machines are rebooted at the same time. | ○ | ○ |
| A single rack failure can affect up to 5 virtual machines. | ○ | ○ |
| You can add an existing virtual machine named VM16 to AS1. | ○ | ○ |

**Answer:** Yes, Yes, No

**Signal phrases:** “3 fault domains”; “5 update domains”; “existing virtual machine”

**Why:** VMs are spread evenly. Across 5 update domains, 15 VMs means 3 per domain, and Azure reboots one update domain at a time. Across 3 fault domains (racks), 15 VMs means 5 per rack. An availability set can only be chosen when a VM is created, so an existing VM must be recreated from its disks to join.

---

### Question 43

VM1 runs as a Standard_D2s_v3 virtual machine. You need to resize VM1 to a size from a different VM family. In the Azure portal, the target size is not listed for VM1 while it is running.

What should you do first?

- A. Stop (deallocate) VM1
- B. Detach all data disks
- C. Move VM1 to a new resource group
- D. Create a snapshot of the OS disk

**Answer:** A

**Signal phrases:** “not listed for VM1 while it is running”

**Why:** A running VM can only be resized to sizes available on its current hardware cluster. Deallocating releases it from that cluster, so every size available in the region appears. Snapshots, moves and detaching disks don’t affect which sizes are offered.

---

### Question 44

You need to move a virtual machine named VM1, along with its disks, network interface, and virtual network, from the West US region to the Central US region. You need a solution that identifies dependencies and orchestrates the move with the least administrative effort.

What should you use?

- A. Azure Migrate: Server Migration
- B. Azure Resource Mover
- C. Move the resources to a new resource group
- D. Export a template and redeploy manually

**Answer:** B

**Signal phrases:** “from the West US region to the Central US region”; “identifies dependencies”

**Why:** Azure Resource Mover is built for moving resources across regions; it finds dependencies and orchestrates them as one move. Moving to another resource group never changes a resource’s region. Azure Migrate is for bringing on-premises or other-cloud servers into Azure.

---

### Question 45

A virtual machine scale set named VMSS1 has the following autoscale settings: minimum 2 instances, maximum 6 instances, default 2 instances. A scale-out rule increases the instance count by 2 when average CPU exceeds 70 percent over 10 minutes. A scale-in rule decreases the count by 1 when average CPU is below 30 percent over 10 minutes. Both rules have a 5-minute cooldown.

VMSS1 currently runs 2 instances, and average CPU stays at 90 percent for 45 minutes.

How many instances will be running at the end of the 45 minutes?

- A. 2
- B. 4
- C. 6
- D. 8

**Answer:** C

**Signal phrases:** “maximum 6 instances”; “increases the instance count by 2”; “stays at 90 percent for 45 minutes”

**Why:** Sustained 90 percent CPU keeps triggering the scale-out rule: 2 → 4 → 6, with cooldowns between steps. It would continue, but autoscale never exceeds the maximum. These questions almost always hinge on the minimum or maximum, so find them first.

---

### Question 46

You plan to host a web app in Azure App Service. The app requires a staging deployment slot and must scale out automatically based on CPU.

The solution must minimize cost.

Which pricing tier should you choose?

- A. Premium v3 (P1v3)
- B. Free (F1)
- C. Basic (B1)
- D. Standard (S1)

**Answer:** D

**Signal phrases:** “staging deployment slot”; “scale out automatically”; “minimize cost”

**Why:** Deployment slots and autoscale both start at the Standard tier. Basic supports only manual scale-out and has no slots. Premium also works, but “minimize cost” picks the lowest tier that meets every requirement.

---

### Question 47

WebApp1 has a production slot and a staging slot. Each slot connects to a different database by using a connection string named DbConn. After you swap the slots, production starts using the staging database.

You need to prevent this from happening in future swaps.

What should you do?

- A. Enable auto swap on the staging slot
- B. Move the connection string into the application code
- C. Scale the App Service plan to Premium
- D. Mark DbConn as a deployment slot setting in each slot

**Answer:** D

**Signal phrases:** “After you swap the slots, production starts using the staging database”

**Why:** By default, app settings and connection strings move with the app during a swap. Marking a setting as a deployment slot setting (sticky) keeps it with the slot, so each environment keeps its own database. Auto swap only automates the swap; it doesn’t change what moves.

---

### Question 48

You need to map the custom domain www.contoso.com to WebApp1 in Azure App Service. The domain is hosted in Azure DNS. Before App Service will accept the custom domain, you must prove that you own the domain.

Which DNS record type is used to verify domain ownership?

- A. SRV
- B. MX
- C. PTR
- D. TXT

**Answer:** D

**Signal phrases:** “prove that you own the domain”

**Why:** App Service verifies ownership with a TXT record (asuid.www) containing the app’s domain verification ID. A CNAME or A record then routes traffic to the app. MX is for mail, PTR for reverse lookups and SRV for service discovery.

---

### Question 49

A data team runs a containerized Python script once each night. The script runs for about 20 minutes and then exits. The team does not want to manage servers or a cluster and wants to pay only while the container runs. The container must not restart after it finishes successfully, but it should restart if it fails.

Which two configurations should you use? Each correct answer presents part of the solution.

- A. Azure Container Instances
- B. An App Service plan
- C. Azure Kubernetes Service
- D. Restart policy: Always
- E. Restart policy: OnFailure

**Answer:** A and E

**Signal phrases:** “does not want to manage servers or a cluster”; “pay only while the container runs”; “should restart if it fails”

**Why:** Azure Container Instances runs a single container with per-second billing and no infrastructure to manage. The restart policy OnFailure restarts only on a non-zero exit code. Always would rerun the script forever, and Never wouldn’t retry failures.

---

### Question 50

An AKS cluster named AKS1 uses a horizontal pod autoscaler for a web workload. During traffic peaks, new pods stay in the Pending state because there are not enough node resources.

You need to ensure that capacity is added automatically.

What should you configure?

- A. Add a second node pool manually
- B. Increase the maximum replica count of the horizontal pod autoscaler
- C. Configure a pod disruption budget
- D. Enable the cluster autoscaler on the node pool

**Answer:** D

**Signal phrases:** “stay in the Pending state because there are not enough node resources”

**Why:** The horizontal pod autoscaler adds pods; the cluster autoscaler adds nodes. Pods stuck in Pending because nodes are full is exactly the trigger the cluster autoscaler watches for. Raising the replica count would just create more Pending pods.

---

### Question 51

You have an AKS cluster named AKS1 and an Azure Container Registry named contosoacr. Pods in AKS1 fail to pull images from contosoacr with an authorization error. You must not store registry credentials in Kubernetes secrets.

What should you do?

- A. Make contosoacr publicly accessible
- B. Create an image pull secret that contains the registry password
- C. Run az aks update with the --attach-acr parameter to grant AKS1 the AcrPull role on contosoacr
- D. Enable the admin user on contosoacr

**Answer:** C

**Signal phrases:** “must not store registry credentials”

**Why:** Attaching the registry assigns AcrPull to the cluster’s kubelet managed identity, so no password is stored anywhere. The admin user and image pull secrets both rely on stored credentials, and a public registry is a security risk.

---

### Question 52

You maintain an ARM template that deploys a web app and an Azure SQL database. The same template must be deployed to development, test, and production environments, and each environment uses different SKUs and resource names.

You need to minimize changes to the template.

What should you do?

- A. Create a separate parameters file for each environment
- B. Deploy from the portal and edit the values each time
- C. Use the variables section to store the values for all three environments
- D. Create three copies of the template with hard-coded values

**Answer:** A

**Signal phrases:** “same template must be deployed”; “minimize changes to the template”

**Why:** Parameters are for values that change per deployment, and a parameters file per environment keeps one template unchanged. Variables are computed inside the template and can’t be set at deployment time. Copies of the template drift apart.

---

### Question 53

An ARM template deploys a Windows virtual machine. The local administrator password must not appear in the template, the parameters file, or source control. The password is stored as a secret in a key vault named KV1.

What should you do?

- A. Pass the password as a tag on the resource group
- B. Store the password in the variables section
- C. Reference the KV1 secret in the parameters file and enable KV1 for template deployment
- D. Define the adminPassword parameter as a string with a default value

**Answer:** C

**Signal phrases:** “must not appear in the template”; “stored as a secret in a key vault”

**Why:** A securestring parameter whose value is a Key Vault reference (vault ID plus secret name) keeps the password out of every file. Resource Manager reads it at deployment time, which requires enabledForTemplateDeployment on the vault. Every other option puts the password in plain text.

---

### Question 54

You have a Bicep file named main.bicep that deploys resources into an existing resource group named RG1.

Which Azure CLI command should you run?

- A. `az deployment sub create --template-file main.bicep`
- B. `az deployment group create --resource-group RG1 --template-file main.bicep`
- C. `az group create --name RG1 --template-file main.bicep`
- D. `az bicep build --file main.bicep --resource-group RG1`

**Answer:** B

**Signal phrases:** “into an existing resource group”

**Why:** The deployment scope picks the command: az deployment group targets a resource group, sub a subscription, mg a management group and tenant a tenant. az group create only creates the group. az bicep build compiles to JSON without deploying.

---

### Question 55

You attempt to enable Azure Disk Encryption on VM1, which is in the East US region. VM1 must remain in East US. The operation fails. The encryption key is stored in a key vault named KV1 in the West US region, and KV1 has the Azure Disk Encryption for volume encryption access policy enabled.

What should you do to resolve the issue?

- A. Create a key vault in East US and use it for encryption
- B. Move VM1 to West US
- C. Enable the Azure RBAC permission model on KV1
- D. Assign the Key Vault Reader role to VM1

**Answer:** A

**Signal phrases:** “in the East US region”; “VM1 must remain in East US”; “in the West US region”

**Why:** Azure Disk Encryption requires the key vault and the VM to be in the same region and subscription. Since “VM1 must remain in East US”, you need a vault in East US. The access setting is already correct, so changing permissions won’t fix a region mismatch.

---

### Question 56

You deploy 20 Windows Server virtual machines by using an ARM template. After each VM is provisioned, a PowerShell script stored in a storage account must run once to install IIS and copy website files.

What should you add to the template?

- A. A Log Analytics agent
- B. An Azure Automation schedule
- C. A Custom Script Extension resource for each VM
- D. Boot diagnostics

**Answer:** C

**Signal phrases:** “PowerShell script stored in a storage account”; “must run once”

**Why:** The Custom Script Extension downloads a script from storage or a URL and runs it once after provisioning, and it can be declared directly in the template. Automation schedules run on a recurring basis, and the other options don’t execute scripts.

---

### Question 57

A virtual machine named VM2 restarted after an update and is no longer reachable over RDP. The Azure portal shows the VM as Running. You need to view the screen output of VM2 to determine whether it is stuck during startup.

What should you use?

- A. Boot diagnostics screenshot
- B. Azure Bastion
- C. Network Watcher IP flow verify
- D. The activity log

**Answer:** A

**Signal phrases:** “view the screen output”; “stuck during startup”

**Why:** Boot diagnostics captures a screenshot of the VM console and the serial log, so you can see an update screen or a boot error without connecting. Bastion still needs a working OS to connect to, and IP flow verify only checks NSG rules.

---

### Question 58

*This question is part of a series that presents the same scenario. Each question in the series contains a unique solution that might meet the stated goals.*

You plan to deploy two virtual machines that run a stateless web application in the East US 2 region. The application must remain available if an entire datacenter in East US 2 fails.

Solution: You deploy both VMs to the same availability set.

Does this meet the goal?

- Yes
- No

**Answer:** No

**Signal phrases:** “an entire datacenter”; “same availability set”

**Why:** An availability set spreads VMs across racks (fault domains) inside one datacenter. It protects against rack and hardware failures, not against the loss of the whole datacenter.

---

### Question 59

*This question is part of a series that presents the same scenario. Each question in the series contains a unique solution that might meet the stated goals.*

You plan to deploy two virtual machines that run a stateless web application in the East US 2 region. The application must remain available if an entire datacenter in East US 2 fails.

Solution: You deploy each VM to a different availability zone.

Does this meet the goal?

- Yes
- No

**Answer:** Yes

**Signal phrases:** “an entire datacenter”; “different availability zone”

**Why:** Availability zones are physically separate datacenters within a region, each with independent power, cooling and networking. Losing one zone leaves the VM in the other running, and this setup also earns the 99.99 percent SLA.

---

### Question 60

*This question is part of a series that presents the same scenario. Each question in the series contains a unique solution that might meet the stated goals.*

You plan to deploy two virtual machines that run a stateless web application in the East US 2 region. The application must remain available if an entire datacenter in East US 2 fails.

Solution: You deploy both VMs in a scale set that uses Premium SSD disks, and you pin the scale set to zone 1.

Does this meet the goal?

- Yes
- No

**Answer:** No

**Signal phrases:** “an entire datacenter”; “zone 1”

**Why:** Both instances are in zone 1, so losing that zone takes down both. Disk type affects performance and the single-VM SLA, not datacenter resilience. A scale set only survives a zone failure when it spans multiple zones.

---

### Question 61

Your team runs a large batch rendering job that can be stopped and resumed at any time without data loss. You need to run it on Azure virtual machines at the lowest possible cost.

What should you use?

- A. Three-year reserved VM instances
- B. B-series burstable VMs with Premium SSD disks
- C. Azure Dedicated Hosts
- D. Azure Spot Virtual Machines

**Answer:** D

**Signal phrases:** “can be stopped and resumed at any time”; “lowest possible cost”

**Why:** Spot VMs use spare capacity at deep discounts but can be evicted at short notice. That is acceptable only for interruptible work, which is what “can be stopped and resumed at any time” signals. Reservations suit steady 24/7 workloads, and dedicated hosts cost more.

---

### Question 62

A database on VM5 needs a data disk with sub-millisecond latency, and the team must be able to change IOPS and throughput without restarting the VM.

Which disk type should you use?

- A. Standard HDD
- B. Standard SSD
- C. Ultra Disk
- D. Premium SSD

**Answer:** C

**Signal phrases:** “sub-millisecond latency”; “change IOPS and throughput without restarting”

**Why:** Ultra Disk delivers sub-millisecond latency and lets you adjust IOPS and throughput on the fly. Among these options, it’s the only one that meets both requirements. Note that Ultra Disks can only be used as data disks, not OS disks.

---

### Question 63

An application on VM3 must read blobs from a storage account named data1. Security policy forbids storing secrets, keys, or connection strings on the VM.

Which two actions should you perform? Each correct answer presents part of the solution.

- A. Assign the Storage Blob Data Reader role on data1 to the managed identity of VM3
- B. Store the data1 access key in an environment variable
- C. Assign the Reader role on data1 to VM3
- D. Enable a system-assigned managed identity on VM3
- E. Generate an account SAS and save it in a file on VM3

**Answer:** A and D

**Signal phrases:** “forbids storing secrets, keys, or connection strings”

**Why:** A managed identity gives VM3 an Entra identity whose tokens Azure handles, so nothing is stored. It still needs a data-plane role to read blobs. Reader is a control-plane role that shows the account in the portal but doesn’t grant access to the data.

---

### Question 64

Users report that they cannot connect to VM7 by using RDP. You have already verified that network security groups allow port 3389 and that the guest operating system is running. Microsoft support suggests the problem might be with the underlying Azure host.

You need to move VM7 to a new Azure host while keeping its disks and configuration.

What should you do?

- A. Resize VM7
- B. Reapply VM7
- C. Capture an image of VM7
- D. Redeploy VM7

**Answer:** D

**Signal phrases:** “move VM7 to a new Azure host”

**Why:** Redeploy shuts down the VM, moves it to a new node in the Azure infrastructure and powers it back on, keeping its disks and configuration. Data on the temporary disk is lost. Reapply reruns the VM’s state on the same host, and capturing an image generalizes the VM.

---

### Question 65

WebApp2 runs on a Standard S1 App Service plan with three instances. Each instance regularly runs out of memory while generating large reports, while CPU usage remains low.

You need to resolve the memory issue.

What should you do?

- A. Scale out the plan to six instances
- B. Add a deployment slot
- C. Scale up the plan to a tier with more memory per instance
- D. Enable Always On

**Answer:** C

**Signal phrases:** “Each instance regularly runs out of memory”

**Why:** Scaling out adds more instances of the same size, so each one still runs out of memory. Scaling up gives each instance more memory. Remember: up means a bigger instance, out means more instances.

---

## Networking

### Question 66

A subnet named Subnet1 in VNet1 (10.0.0.0/16) has a network security group named NSG1 associated with it. The VMs in Subnet1 have no NSG on their network interfaces. NSG1 contains the custom inbound rules shown in the following table, plus the default rules.

For each of the following statements, select Yes if the statement is true. Otherwise, select No.

| Priority | Name | Port | Protocol | Source | Action |
| --- | --- | --- | --- | --- | --- |
| 100 | Rule1 | 3389 | TCP | Any | Deny |
| 200 | Rule2 | 3389 | TCP | 10.0.1.0/24 | Allow |
| 300 | Rule3 | 80 | TCP | Any | Allow |

| Statement | Yes | No |
| --- | --- | --- |
| A VM in 10.0.1.0/24 can connect to a VM in Subnet1 by using RDP. | ○ | ○ |
| Users on the internet can connect on TCP port 80 to a VM in Subnet1 that has a public IP address. | ○ | ○ |
| A VM in another subnet of VNet1 can ping a VM in Subnet1. | ○ | ○ |

**Answer:** No, Yes, Yes

**Signal phrases:** “Deny”; “have no NSG on their network interfaces”; “plus the default rules”

**Why:** Rules are processed from the lowest priority number, and processing stops at the first match. Rule1 (100) denies all RDP before Rule2 (200) is ever checked. Rule3 allows port 80 from anywhere. Ping is allowed by the default AllowVnetInBound rule, which permits all protocols within the virtual network.

---

### Question 67

VM1 has a public IP address and runs a web server on TCP port 443. The NSG associated with VM1’s subnet allows inbound TCP 443 from the internet. The NSG associated with VM1’s network interface contains only the default rules. Users on the internet cannot reach the website.

What should you do?

- A. Remove the public IP address and add a load balancer
- B. Enable IP forwarding on the network interface
- C. Add an inbound rule that allows TCP 443 from the internet to the network interface NSG
- D. Add an outbound rule that allows TCP 443 to the internet to the subnet NSG

**Answer:** C

**Signal phrases:** “contains only the default rules”; “allows inbound TCP 443 from the internet”

**Why:** Inbound traffic must be allowed by the subnet NSG and then by the NIC NSG. The NIC NSG has only defaults, so DenyAllInBound drops the traffic. NSGs are stateful, so return traffic needs no outbound rule.

---

### Question 68

VNet1 hosts web servers and database servers in the same subnet. Servers are added and removed frequently, and their IP addresses change. You need to allow SQL traffic on TCP 1433 only from the web servers to the database servers without maintaining IP addresses in NSG rules.

What should you use?

- A. User-defined routes
- B. Azure Firewall DNAT rules
- C. Service tags
- D. Application security groups

**Answer:** D

**Signal phrases:** “added and removed frequently”; “without maintaining IP addresses”

**Why:** Application security groups let you group your own VMs’ NICs by role and write rules such as WebASG → DbASG on 1433. New servers only need to join the right ASG. Service tags represent Azure services such as Storage or Sql, not your own VMs.

---

### Question 69

All internet-bound traffic from Subnet1 must be inspected by a network virtual appliance (NVA) named NVA1 that has the private IP address 10.0.5.4 in another subnet.

Which two actions should you perform? Each correct answer presents part of the solution.

- A. Enable IP forwarding on the network interface of NVA1
- B. Create a route table with a route for 0.0.0.0/0 that uses next hop type Virtual appliance and address 10.0.5.4, and associate it with Subnet1
- C. Add an NSG rule on Subnet1 that allows outbound traffic to 10.0.5.4
- D. Create a route that uses next hop type Internet
- E. Enable gateway transit on VNet1

**Answer:** A and B

**Signal phrases:** “internet-bound traffic”; “must be inspected by a network virtual appliance”

**Why:** A user-defined route for 0.0.0.0/0 pointing at the NVA overrides the system route to the internet. The NVA’s NIC also needs IP forwarding enabled, or Azure drops packets that aren’t addressed to the NVA itself. Outbound traffic within the VNet is already allowed by default.

---

### Question 70

Hub-VNet has a VPN gateway connected to the on-premises network. Spoke-VNet is peered with Hub-VNet. VMs in Spoke-VNet must reach on-premises servers through the existing VPN gateway, and you must not deploy another gateway.

Which two settings should you configure? Each correct answer presents part of the solution.

- A. Allow forwarded traffic on Hub-VNet only
- B. Allow gateway transit on the Hub-VNet peering
- C. Use remote gateways on the Spoke-VNet peering
- D. Create a VPN gateway in Spoke-VNet
- E. Create a local network gateway in Spoke-VNet

**Answer:** B and C

**Signal phrases:** “through the existing VPN gateway”; “must not deploy another gateway”

**Why:** Gateway sharing is a pair of settings: the hub offers its gateway (Allow gateway transit) and the spoke uses it (Use remote gateways). Neither works alone. Because of “must not deploy another gateway”, the spoke can’t have its own.

---

### Question 71

You need to peer VNet-A, which uses the address space 10.10.0.0/16, with VNet-B, which uses the address space 10.10.128.0/17. Creating the peering fails.

What is the cause?

- A. Global peering requires a VPN gateway
- B. The virtual networks are in different resource groups
- C. VNet-B has no subnets
- D. The address spaces overlap

**Answer:** D

**Signal phrases:** “10.10.0.0/16”; “10.10.128.0/17”

**Why:** 10.10.0.0/16 covers 10.10.0.0 to 10.10.255.255, which includes all of 10.10.128.0/17. Peered virtual networks can’t have overlapping address spaces. Whenever a question gives you two CIDR ranges, check them for overlap first.

---

### Question 72

You are configuring a site-to-site VPN between VNet1 and a branch office. The branch office firewall has a public IP address of 203.0.113.10 and uses the address space 192.168.10.0/24.

Which Azure resource stores this branch office information?

- A. Local network gateway
- B. Connection
- C. Public IP address
- D. Virtual network gateway

**Answer:** A

**Signal phrases:** “branch office firewall has a public IP address”; “address space 192.168.10.0/24”

**Why:** The local network gateway represents the on-premises side: its device’s public IP and the address ranges behind it. The virtual network gateway is the Azure side, and the connection links the two with a shared key.

---

### Question 73

Remote developers on Windows and macOS laptops must connect to VNet1 by using a point-to-site VPN and authenticate with their Microsoft Entra ID accounts, including MFA.

Which tunnel type must you configure on the VPN gateway?

- A. SSTP
- B. IKEv2
- C. OpenVPN
- D. IPsec site-to-site

**Answer:** C

**Signal phrases:** “authenticate with their Microsoft Entra ID accounts”

**Why:** Microsoft Entra ID authentication for point-to-site VPN is supported only with the OpenVPN protocol. IKEv2 and SSTP use certificate or RADIUS authentication.

---

### Question 74

You attempt to create a VPN gateway in VNet1 and receive an error that a valid gateway subnet is missing. VNet1 already contains a /27 subnet named Gateway-Subnet that you created for the gateway.

What should you do?

- A. Create a subnet named GatewaySubnet
- B. Associate an NSG with Gateway-Subnet
- C. Add a service endpoint to Gateway-Subnet
- D. Resize Gateway-Subnet to /24

**Answer:** A

**Signal phrases:** “named Gateway-Subnet”

**Why:** The gateway subnet must be named exactly GatewaySubnet, with no hyphen or space. A /27 is already a good size. Watch for exact names on the exam: GatewaySubnet, AzureBastionSubnet and AzureFirewallSubnet.

---

### Question 75

Contoso hosts a website on two pools of VMs. Requests for contoso.com/images/* must go to Pool1, and requests for contoso.com/video/* must go to Pool2. The solution must also terminate TLS and protect against common web exploits.

What should you deploy?

- A. Azure Traffic Manager
- B. Azure NAT Gateway
- C. Azure Application Gateway with Web Application Firewall
- D. Azure Load Balancer Standard

**Answer:** C

**Signal phrases:** “/images/*”; “/video/*”; “protect against common web exploits”

**Why:** Routing by URL path is a layer 7 feature, and protection against web exploits is a WAF. Application Gateway does both, plus TLS termination. Load Balancer works at layer 4 and can’t see URLs, and Traffic Manager routes by DNS.

---

### Question 76

A public Standard load balancer distributes HTTP traffic to VM1, VM2, and VM3. The health probe uses TCP port 8080. VM3 receives no traffic, although its website responds normally on port 80.

What is the most likely cause?

- A. The load balancer uses the Basic SKU
- B. VM3 is in a different availability zone
- C. Nothing on VM3 is listening on port 8080, so the probe marks VM3 as unhealthy
- D. VM3 has a public IP address

**Answer:** C

**Signal phrases:** “The health probe uses TCP port 8080”; “responds normally on port 80”

**Why:** The load balancer sends traffic only to instances that pass the health probe. If VM3 doesn’t answer on the probe port, it’s taken out of rotation, even though the site itself works on port 80. Fix the probe port or the service listening on it.

---

### Question 77

VMs in Subnet2 have no public IP addresses and are in the backend pool of an internal Standard load balancer. The VMs must download updates from the internet, and the software vendor requires that all requests come from a single, static public IP address.

What should you configure?

- A. Add a public IP address to each VM
- B. Configure a service endpoint for Microsoft.Web on Subnet2
- C. Associate a NAT gateway that has a static public IP address with Subnet2
- D. Change the load balancer to the Basic SKU

**Answer:** C

**Signal phrases:** “internal Standard load balancer”; “single, static public IP address”

**Why:** A NAT gateway gives every VM in the subnet outbound internet access through one static public IP, which is exactly what an allow-listing vendor needs. Public IPs per VM would mean many addresses. An internal Standard load balancer provides no outbound internet path.

---

### Question 78

You create a private DNS zone named corp.contoso.com. You link VNet1 to the zone with auto-registration enabled, and you link VNet2 to the zone with auto-registration disabled. VM1 is in VNet1 and VM2 is in VNet2.

For each of the following statements, select Yes if the statement is true. Otherwise, select No.

| Statement | Yes | No |
| --- | --- | --- |
| An A record for VM1 is created automatically in corp.contoso.com. | ○ | ○ |
| An A record for VM2 is created automatically in corp.contoso.com. | ○ | ○ |
| VM2 can resolve vm1.corp.contoso.com. | ○ | ○ |

**Answer:** Yes, No, Yes

**Signal phrases:** “auto-registration enabled”; “auto-registration disabled”

**Why:** Auto-registration creates records only for VMs in VNets linked with registration enabled. Any linked VNet, with or without registration, can resolve names in the zone. That’s why VM2 can look up VM1 even though VM2 isn’t registered itself.

---

### Question 79

Contoso purchased the domain contoso.com from a third-party registrar and created a public DNS zone named contoso.com in Azure DNS. Records in the Azure DNS zone are not being resolved on the internet.

What should you do?

- A. Create a private DNS zone named contoso.com
- B. Update the name server (NS) records at the registrar to the Azure DNS name servers
- C. Create a CNAME record for contoso.com in the Azure DNS zone
- D. Link the zone to a virtual network

**Answer:** B

**Signal phrases:** “from a third-party registrar”; “not being resolved on the internet”

**Why:** Azure DNS hosts zones but isn’t a registrar. The internet finds a zone through the NS records held at the registrar, so you must delegate the domain to the four Azure DNS name servers shown in the zone. Virtual network links are only for private zones.

---

### Question 80

Administrators must connect to VMs in VNet1 by using RDP and SSH from the Azure portal over TLS. The VMs must not have public IP addresses, and no client software can be installed on administrator workstations. You plan to deploy Azure Bastion.

What must you create in VNet1 first?

- A. A NAT gateway
- B. A local network gateway
- C. A subnet named AzureBastionSubnet with a /26 or larger prefix
- D. A subnet named GatewaySubnet

**Answer:** C

**Signal phrases:** “from the Azure portal”; “must not have public IP addresses”; “no client software”

**Why:** Those three requirements together describe Azure Bastion, which needs a dedicated subnet named exactly AzureBastionSubnet with a /26 or larger prefix. GatewaySubnet is for VPN and ExpressRoute gateways.

---

### Question 81

VM1 cannot connect to VM2 on TCP port 1433. Several NSGs and rules apply to both VMs. You need to quickly identify whether a security rule is blocking the traffic and which rule it is.

Which Network Watcher feature should you use?

- A. Topology
- B. IP flow verify
- C. Packet capture
- D. Next hop

**Answer:** B

**Signal phrases:** “whether a security rule is blocking”; “which rule it is”

**Why:** IP flow verify tests a specific 5-tuple against the effective NSG rules and returns allow or deny along with the name of the rule responsible. Next hop is for routing, and packet capture shows traffic but doesn’t name rules.

---

### Question 82

Traffic from VM4 to an on-premises network should pass through an NVA, but logs on the NVA show none of VM4’s traffic. You suspect a routing issue.

Which Network Watcher tool shows the route type and next hop that Azure uses for traffic from VM4 to a specific destination IP address?

- A. IP flow verify
- B. NSG flow logs
- C. Next hop
- D. Connection monitor

**Answer:** C

**Signal phrases:** “You suspect a routing issue”

**Why:** Next hop shows which route Azure applies (system, user-defined or BGP) and where packets go next. It’s the go-to tool when a UDR isn’t taking effect. Use IP flow verify for NSG problems and next hop for routing problems.

---

### Question 83

*This question is part of a series that presents the same scenario. Each question in the series contains a unique solution that might meet the stated goals.*

VMs in Subnet1 must not be able to initiate connections to the internet. They must still be able to communicate with other VMs in the virtual network.

Solution: You add an outbound rule with priority 100 to the NSG associated with Subnet1 that denies traffic to the Internet service tag.

Does this meet the goal?

- Yes
- No

**Answer:** Yes

**Signal phrases:** “must not be able to initiate connections to the internet”; “denies traffic to the Internet service tag”

**Why:** The Internet service tag covers public addresses outside the VNet, so the deny rule blocks outbound internet traffic. Traffic to other VMs still matches the default AllowVnetOutBound rule.

---

### Question 84

*This question is part of a series that presents the same scenario. Each question in the series contains a unique solution that might meet the stated goals.*

VMs in Subnet1 must not be able to initiate connections to the internet. They must still be able to communicate with other VMs in the virtual network.

Solution: You associate a route table with Subnet1 that contains a route for 0.0.0.0/0 with next hop type None.

Does this meet the goal?

- Yes
- No

**Answer:** Yes

**Signal phrases:** “next hop type None”

**Why:** Next hop type None drops matching traffic. Because the more specific system route for the VNet address space still wins for internal traffic, VMs can still reach each other while internet-bound packets are discarded.

---

### Question 85

*This question is part of a series that presents the same scenario. Each question in the series contains a unique solution that might meet the stated goals.*

VMs in Subnet1 must not be able to initiate connections to the internet. They must still be able to communicate with other VMs in the virtual network.

Solution: You associate a NAT gateway with Subnet1.

Does this meet the goal?

- Yes
- No

**Answer:** No

**Signal phrases:** “NAT gateway”

**Why:** A NAT gateway provides outbound internet connectivity, so it’s the opposite of what’s required. It’s a common distractor whenever a question mentions outbound traffic.

---

## Monitor & maintain

### Question 86

You have a subscription that contains the resources shown in the following table. You plan to back up the virtual machines by using Recovery Services vaults.

For each of the following statements, select Yes if the statement is true. Otherwise, select No.

| Name | Type | Region | Resource group |
| --- | --- | --- | --- |
| VM1 | Virtual machine | East US | RG1 |
| VM2 | Virtual machine | West US | RG2 |
| Vault1 | Recovery Services vault | East US | RG2 |
| Vault2 | Recovery Services vault | West US | RG1 |

| Statement | Yes | No |
| --- | --- | --- |
| VM1 can be backed up to Vault1. | ○ | ○ |
| VM2 can be backed up to Vault1. | ○ | ○ |
| VM2 can be backed up to Vault2. | ○ | ○ |

**Answer:** Yes, No, Yes

**Signal phrases:** “Region”

**Why:** A Recovery Services vault can only protect VMs in its own region; the resource group doesn’t matter. The resource group column is there to distract you: VM1 and Vault1 are in different resource groups but the same region, so it works.

---

### Question 87

VM1 is backed up daily to a Recovery Services vault. A user accidentally deleted a single folder from VM1 three days ago. You need to restore only that folder as quickly as possible without affecting the rest of VM1.

What should you do?

- A. Use File Recovery to mount the recovery point and copy the folder
- B. Restore the disks to a storage account
- C. Create a new VM from the recovery point
- D. Restore VM1 by replacing the existing disks

**Answer:** A

**Signal phrases:** “restore only that folder”; “without affecting the rest of VM1”

**Why:** File Recovery gives you a script that mounts the recovery point’s disks as drives on a machine. You copy out only what you need, and nothing on VM1 changes. Replacing disks would roll back the whole VM.

---

### Question 88

Contoso has an on-premises Windows file server. You need to back up specific folders on the server directly to Azure without deploying additional on-premises backup servers.

What should you install on the file server?

- A. The Microsoft Azure Recovery Services (MARS) agent
- B. Microsoft Azure Backup Server (MABS)
- C. The Azure Monitor Agent
- D. The Azure File Sync agent

**Answer:** A

**Signal phrases:** “specific folders”; “without deploying additional on-premises backup servers”

**Why:** The MARS agent backs up files, folders and system state from a Windows machine directly to a Recovery Services vault. MABS is itself an extra on-premises backup server. File Sync syncs and tiers files but isn’t a backup with retention points.

---

### Question 89

You back up production VMs in East US to a Recovery Services vault named Vault1. If East US experiences a regional outage, you must be able to restore the VMs in the paired region, West US, by using the existing backups.

What should you configure on Vault1?

- A. Geo-redundant storage with Cross Region Restore enabled
- B. Locally redundant storage
- C. Soft delete
- D. Zone-redundant storage

**Answer:** A

**Signal phrases:** “restore the VMs in the paired region”; “using the existing backups”

**Why:** Backup data reaches the paired region only if the vault uses GRS, and Cross Region Restore lets you restore from that secondary copy on demand. LRS and ZRS keep everything in East US.

---

### Question 90

You need to protect Azure managed disks by using snapshot-based Azure Disk Backup, and protect blobs in a storage account by using operational backup.

Which type of vault should you create?

- A. Key vault
- B. A storage account with soft delete enabled
- C. Recovery Services vault
- D. Backup vault

**Answer:** D

**Signal phrases:** “Azure Disk Backup”; “operational backup”

**Why:** Newer workloads such as Azure Disk Backup, blob backup and Azure Database for PostgreSQL use a Backup vault. Recovery Services vaults handle Azure VMs, SQL Server in VMs, Azure Files and on-premises agents. Expect a question on which vault fits which workload.

---

### Question 91

Contoso must be able to fail over 25 production VMs from East US to Central US within minutes during a regional disaster, with a recovery point objective (RPO) measured in minutes. Daily backups are already in place.

What should you implement?

- A. Azure Backup with Cross Region Restore
- B. Availability zones
- C. Azure Site Recovery
- D. Geo-redundant storage for the VM disks

**Answer:** C

**Signal phrases:** “fail over”; “(RPO) measured in minutes”

**Why:** Site Recovery continuously replicates VMs to another region and orchestrates failover, with an RPO of minutes. Daily backups mean an RPO of up to 24 hours and a slow restore. Availability zones protect within a single region only.

---

### Question 92

You configured Azure Site Recovery replication for VM1 to a secondary region. Auditors require you to prove every quarter that the disaster recovery plan works, without any impact on production or on ongoing replication.

What should you do?

- A. Run an unplanned failover
- B. Run a planned failover
- C. Disable replication and then re-enable it
- D. Run a test failover to an isolated virtual network

**Answer:** D

**Signal phrases:** “without any impact on production or on ongoing replication”

**Why:** A test failover creates the VM in the target region, ideally in an isolated VNet, while replication continues. You clean it up afterward. Planned and unplanned failovers move production for real.

---

### Question 93

A virtual machine named VM8 was deleted yesterday. You need to identify which user deleted it.

What should you review?

- A. Azure Advisor recommendations
- B. The boot diagnostics logs
- C. The activity log for the subscription
- D. The Azure Monitor metrics for VM8

**Answer:** C

**Signal phrases:** “which user deleted it”

**Why:** The activity log records control-plane operations (create, update, delete), with who performed them and when. Metrics are performance numbers, and VM8’s own diagnostics are gone along with the VM.

---

### Question 94

The security team wants to be notified by email whenever anyone deletes a virtual machine in a subscription named Sub1.

What should you create?

- A. A log search alert rule on the Perf table
- B. A metric alert rule for Percentage CPU
- C. A budget alert
- D. An activity log alert rule for the Delete Virtual Machine operation, with an action group that sends email

**Answer:** D

**Signal phrases:** “whenever anyone deletes a virtual machine”

**Why:** Deleting a resource is a control-plane event recorded in the activity log, so an activity log alert catches it. Metric alerts watch performance numbers. The email itself comes from an action group.

---

### Question 95

You have 40 alert rules across several resource groups. Every rule must send an email to the operations team, send an SMS message to the on-call engineer, and start an Automation runbook. The notification list changes often.

You need to minimize administrative effort when the list changes.

What should you do?

- A. Create one action group that contains the email, SMS, and runbook actions, and use it in all 40 alert rules
- B. Create an alert processing rule that suppresses notifications
- C. Create 40 action groups, one for each alert rule
- D. Configure the email and SMS settings directly in each alert rule

**Answer:** A

**Signal phrases:** “40 alert rules”; “The notification list changes often”

**Why:** Action groups are reusable. Put the recipients and the runbook in one group and reference it from all 40 rules, and a change to the list is then a single edit. Alert processing rules suppress or redirect notifications; they don’t define who gets them.

---

### Question 96

Your VMs send data to a Log Analytics workspace. You need a query that lists each computer that has not sent a heartbeat in the last 15 minutes.

Which query should you use?

- A. `Heartbeat | summarize LastHeartbeat = max(TimeGenerated) by Computer | where LastHeartbeat < ago(15m)`
- B. `Heartbeat | where TimeGenerated > ago(15m) | project Computer`
- C. `Perf | summarize count() by Computer`
- D. `Heartbeat | where TimeGenerated < ago(15m) | distinct Computer`

**Answer:** A

**Signal phrases:** “has not sent a heartbeat in the last 15 minutes”

**Why:** You need each computer’s latest heartbeat, then a filter for the ones older than 15 minutes. The second query lists computers that did report recently, the opposite of what’s asked. The last query lists every computer with any old heartbeat, including healthy ones.

---

### Question 97

You need to collect Windows Security and System event logs from 50 Azure VMs into a Log Analytics workspace. The solution must use the currently supported agent.

Which two components should you configure? Each correct answer presents part of the solution.

- A. Boot diagnostics
- B. A data collection rule that specifies the event logs and the destination workspace
- C. The Log Analytics agent (MMA)
- D. A diagnostic setting for the subscription activity log
- E. The Azure Monitor Agent on each VM

**Answer:** B and E

**Signal phrases:** “currently supported agent”; “event logs”

**Why:** The Azure Monitor Agent collects data from inside the guest OS, and a data collection rule tells it what to collect and where to send it. The Log Analytics agent (MMA) has been retired. Activity log settings cover Azure operations, not guest events.

---

### Question 98

You enable VM insights for VM1. The Performance view shows data, but the Map view shows no processes or network connections.

What should you install on VM1?

- A. The Custom Script Extension
- B. The Network Watcher extension
- C. The MARS agent
- D. The Dependency agent

**Answer:** D

**Signal phrases:** “Map view shows no processes or network connections”

**Why:** The VM insights Map feature relies on the Dependency agent to discover processes and their connections. Performance data comes from the Azure Monitor Agent alone, which is why that view already works.

---

### Question 99

Compliance requires that subscription activity log events be queryable for two years.

What should you do?

- A. Nothing; the activity log retains events for two years by default
- B. Create a diagnostic setting that sends the activity log to a Log Analytics workspace with retention set to two years
- C. Enable Azure Advisor
- D. Export the activity log to a CSV file every month

**Answer:** B

**Signal phrases:** “queryable for two years”

**Why:** The activity log keeps events for 90 days. To keep them longer and still query them, route them with a diagnostic setting to a Log Analytics workspace configured for the needed retention. CSV exports aren’t queryable in place.

---

### Question 100

You need to continuously monitor latency and packet loss between VM1 in Azure and an on-premises server, and receive an alert when the round-trip time exceeds 100 ms.

What should you use?

- A. Network Watcher next hop
- B. Network Watcher Connection monitor
- C. NSG flow logs
- D. Network Watcher IP flow verify

**Answer:** B

**Signal phrases:** “continuously monitor latency and packet loss”

**Why:** Connection monitor runs ongoing tests between endpoints, including on-premises ones, tracks round-trip time and packet loss, and can raise alerts. IP flow verify and next hop are one-time diagnostic checks.

---
