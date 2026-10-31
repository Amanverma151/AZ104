/* ===== Content: helpers ===== */
const B=(id,k,x,y,label,sub,w,h)=>({op:"box",id,k,x,y,label,sub,w,h});
const N=(id,x,y,text,tone)=>({op:"note",id,x,y,text,tone});
const T=(id,x,y,rows,title)=>({op:"table",id,x,y,rows,title});
const L=(id,from,to,label,style)=>({op:"link",id,from,to,label,style});
const P=(path,label,tone,blocked)=>({op:"packet",path,label,tone,blocked});
const H=(id)=>({op:"hl",id});
const D=(...ids)=>ids.map(id=>({op:"del",id}));
const C=()=>({op:"clear"});
const SET=(id,label,sub)=>({op:"set",id,label,sub});
const M=(id,tone)=>({op:"mark",id,tone});
const R=(id,row,tone)=>({op:"hlrow",id,row,tone});
const LEARN="https://learn.microsoft.com/en-us/azure/";

const DOMAINS=[
  {id:"identity",name:"Manage Azure identities and governance",weight:"20–25%",built:false},
  {id:"storage",name:"Implement and manage storage",weight:"15–20%",built:false},
  {id:"compute",name:"Deploy and manage Azure compute resources",weight:"20–25%",built:false},
  {id:"network",name:"Implement and manage virtual networking",weight:"15–20%",built:true},
  {id:"monitor",name:"Monitor and maintain Azure resources",weight:"10–15%",built:false}
];

const GROUPS=[
  {id:"g1",name:"Configure and manage virtual networks",lessons:["vnet","peer","pip","udr","nw"]},
  {id:"g2",name:"Configure secure access to virtual networks",lessons:["nsg","asg","bastion","endpoints"]},
  {id:"g3",name:"Configure name resolution and load balancing",lessons:["dns","lb"]}
];

/* ===== Lessons ===== */
const LESSONS={};

LESSONS.vnet={id:"vnet",title:"Virtual networks & subnets",mins:2,
 keywords:["vnet","virtual network","subnet","cidr","address space","reserved ip","ip address","/29","/24"],
 scenes:[
  {say:"A virtual network, or VNet, is your private network in Azure. Each VNet lives in one region and one subscription.",
   ops:[B("v1","vnet",60,50,"vnet-prod","East US",840,450)]},
  {say:"You give it an address space in CIDR notation. Slash sixteen means sixty-five thousand five hundred thirty-six addresses.",
   ops:[SET("v1","vnet-prod","10.0.0.0/16 · East US"),N("n1",560,70,"10.0.0.0/16 = 65,536 addresses","accent")]},
  {say:"Then you carve that space into subnets. Subnets can't overlap, and each one must fit inside the VNet's address space.",
   ops:[...D("n1"),B("s1","subnet",100,110,"snet-web","10.0.1.0/24",370,170),B("s2","subnet",490,110,"snet-app","10.0.2.0/24",370,170)]},
  {say:"Azure reserves five addresses in every subnet: the network address, the default gateway, two for Azure DNS, and the broadcast address.",
   ops:[T("t1",110,300,[["Address","Reserved for"],["10.0.1.0","Network address"],["10.0.1.1","Default gateway"],["10.0.1.2 – .3","Azure DNS mapping"],["10.0.1.255","Broadcast"]],"Reserved in 10.0.1.0/24")]},
  {say:"So a slash twenty-four gives you two hundred fifty-one usable addresses. The smallest subnet is a slash twenty-nine, with only three usable.",
   ops:[N("n2",500,330,"/24 → 256 − 5 = 251 usable\n/29 →   8 − 5 =   3 usable\nFirst VM gets .4","accent"),H("t1")]},
  {say:"Resources in different subnets of the same VNet can talk to each other by default. No routes or peering needed.",
   ops:[...D("t1","n2"),B("vm1","vm",210,175,"vm-web1","10.0.1.4"),B("vm2","vm",600,175,"vm-app1","10.0.2.4"),P(["vm1","vm2"],"","ok")]},
  {say:"You can add another address space to a VNet later. But you can't change a subnet's range while resources are using it.",
   ops:[B("s3","subnet",100,310,"snet-data","10.0.3.0/24",370,160),N("n3",500,340,"Out of room? Add an address space\nto the VNet, e.g. 10.1.0.0/16","accent")]},
  {say:"Remember: a VNet and all its subnets stay in one region. To connect separate VNets, you use peering. That's the next lesson.",
   ops:[H("v1")]}
 ],
 takeaways:["A VNet belongs to one region and one subscription; subnets can't span VNets.","Azure reserves 5 IPs per subnet (.0, .1, .2, .3 and the last). /29 is the smallest IPv4 subnet (3 usable).","Subnets in the same VNet route to each other by default through system routes.","You can add address spaces to a VNet; you can't resize a subnet that has resources in it."],
 traps:["\"How many VMs fit in a /27?\" → 32 − 5 = 27, not 30 or 32.","Address spaces of VNets you plan to peer or connect to on-premises must not overlap. Plan this up front."],
 mnemonic:"Five are taken: Network, Gateway, DNS, DNS, Broadcast → \"No Good Dogs Do Barking.\"",
 lab:"Create vnet-lab (10.10.0.0/16) with subnets web (10.10.1.0/24) and app (10.10.2.0/27). On the subnet blade, note the available-IP count: 251 and 27.",
 ref:LEARN+"virtual-network/virtual-networks-overview"};

LESSONS.peer={id:"peer",title:"VNet peering",mins:2,
 keywords:["peering","vnet peering","global peering","transitive","hub and spoke","gateway transit","use remote gateways","initiated","connected"],
 scenes:[
  {say:"Two VNets can't talk to each other by default, even in the same subscription.",
   ops:[B("A","vnet",40,80,"vnet-hub","10.0.0.0/16",380,240),B("Bv","vnet",540,80,"vnet-spoke1","10.1.0.0/16",380,240),B("a1","vm",155,175,"vm-hub","10.0.0.4"),B("b1","vm",655,175,"vm-spoke1","10.1.0.4"),P(["a1","b1"],"","bad",true)]},
  {say:"VNet peering connects them over Microsoft's backbone with low latency. Traffic stays private. No public internet, and no gateway needed.",
   ops:[L("p1","A","Bv","peering","peer"),P(["a1","b1"],"","ok")]},
  {say:"You must create the peering on both sides. Until both links exist, the status shows Initiated instead of Connected.",
   ops:[T("t1",310,370,[["Link","Status"],["hub → spoke1","Initiated"],["spoke1 → hub","not created"]]),T("t1",310,370,[["Link","Status"],["hub → spoke1","Connected"],["spoke1 → hub","Connected"]])]},
  {say:"The address spaces must not overlap. If both VNets used ten dot zero dot zero dot zero slash sixteen, peering would be refused.",
   ops:[...D("t1"),N("n2",250,380,"10.0.0.0/16 ↔ 10.0.0.0/16 → overlap, peering not allowed","bad")]},
  {say:"Peering works across regions, which is called global peering, and even across subscriptions and Microsoft Entra tenants.",
   ops:[...D("n2"),SET("A","vnet-hub","10.0.0.0/16 · East US"),SET("Bv","vnet-spoke1","10.1.0.0/16 · West Europe"),N("n3",270,380,"Regional or global · cross-subscription · cross-tenant","accent")]},
  {say:"Here's the big exam trap: peering is not transitive. Spoke one and spoke two both peer with the hub, but they still can't reach each other.",
   ops:[C(),B("hub","vnet",300,40,"vnet-hub","10.0.0.0/16",360,170),B("sp1","vnet",40,320,"vnet-spoke1","10.1.0.0/16",300,170),B("sp2","vnet",620,320,"vnet-spoke2","10.2.0.0/16",300,170),
        B("h1","vm",320,110,"vm-hub"),B("x1","vm",115,390,"vm-spoke1"),B("x2","vm",695,390,"vm-spoke2"),L("l1","hub","sp1","peering","peer"),L("l2","hub","sp2","peering","peer"),P(["x1","h1","x2"],"","bad",true)]},
  {say:"To fix it, peer the spokes directly, or route spoke traffic through a firewall or virtual appliance in the hub using user-defined routes.",
   ops:[L("l3","sp1","sp2","direct peering","dash"),P(["x1","x2"],"","ok")]},
  {say:"Hub and spoke with a VPN gateway: enable Allow gateway transit on the hub side, and Use remote gateways on the spoke side. Then spokes share the hub's gateway.",
   ops:[B("gw","gw",490,110,"vpngw-hub","Gateway"),N("n4",250,240,"Hub: Allow gateway transit   ·   Spoke: Use remote gateways","accent")]}
 ],
 takeaways:["Peering is private, low-latency and needs no gateway. It works regionally, globally, across subscriptions and across tenants.","You need a peering link on both VNets. One side alone shows Initiated.","Peered address spaces must not overlap.","Peering is NOT transitive. Spoke-to-spoke needs direct peering or an NVA/firewall in the hub with UDRs.","Gateway transit: Allow gateway transit (hub) plus Use remote gateways (spoke)."],
 traps:["A spoke can't use remote gateways if it already has its own gateway.","\"Allow forwarded traffic\" must be enabled on a spoke to accept traffic that an NVA in the hub forwards."],
 mnemonic:"Peering is a handshake, not a chain: both hands must reach out, and a friend of a friend isn't your friend.",
 lab:"Create two VNets with non-overlapping ranges and a VM in each. Peer them from one side only and check the status (Initiated). Add the reverse peering, then ping VM to VM.",
 ref:LEARN+"virtual-network/virtual-network-peering-overview"};

LESSONS.pip={id:"pip",title:"Public IP addresses",mins:2,
 keywords:["public ip","pip","standard sku","basic sku","static","dynamic","zone redundant","nat gateway","outbound"],
 scenes:[
  {say:"A public IP address lets an Azure resource talk to the internet, and be reached from it.",
   ops:[B("inet","internet",120,40,"Internet"),B("v","vnet",40,250,"vnet-prod","10.0.0.0/16",360,260),B("ip","ip",120,165,"pip-web1","52.170.10.25"),B("vm","vm",60,370,"vm-web1","10.0.1.4"),L("l1","inet","ip"),L("l2","ip","vm")]},
  {say:"Public IPs come in two SKUs. Basic was retired at the end of September twenty twenty-five, so new deployments use Standard.",
   ops:[T("t1",440,50,[["Feature","Basic (retired)","Standard"],["Allocation","Static or dynamic","Static only"],["Inbound","Open by default","Closed until an NSG allows"],["Zones","None","Zone-redundant or zonal"],["Load balancer","Basic LB","Standard LB"]],"Public IP SKUs")]},
  {say:"Standard public IPs are secure by default. Inbound traffic is blocked until a network security group allows it.",
   ops:[P(["inet","ip","vm"],"443","bad",true),B("nsg","nsg",230,370,"nsg-web","allow 443",155),P(["inet","ip","vm"],"443","ok")]},
  {say:"Allocation on Standard is always static. The address is reserved when you create the resource and kept until you delete it.",
   ops:[N("n1",440,270,"Standard = static. The IP never changes\nwhen the VM stops or restarts.","accent")]},
  {say:"You can attach public IPs to a VM's network interface, a load balancer frontend, a NAT gateway, a VPN gateway, Application Gateway, or Azure Bastion.",
   ops:[...D("n1"),N("n2",440,270,"Attach to: NIC · Load balancer frontend · NAT gateway\nVPN gateway · Application Gateway · Bastion","accent")]},
  {say:"Exam tip: SKUs must match. A Standard load balancer needs Standard public IPs, and zone-redundant IPs keep working if one zone fails.",
   ops:[H("t1"),R("t1",4,"accent")]},
  {say:"For outbound-only internet access, attach a NAT gateway to the subnet instead of giving every VM its own public IP.",
   ops:[...D("n2"),N("n3",440,300,"Outbound only? NAT gateway on the subnet:\none static outbound IP, no inbound exposure.","ok")]}
 ],
 takeaways:["Standard SKU: static only, zone-redundant or zonal, closed to inbound until an NSG allows it.","Basic public IPs were retired on 30 September 2025. Expect Standard in every current scenario.","Public IP and load balancer SKUs must match.","Use a NAT gateway for scalable outbound connectivity without inbound exposure."],
 traps:["If a VM with a Standard public IP can't be reached, the usual cause is a missing NSG allow rule.","A public IP must be in the same region as the resource it's attached to."],
 mnemonic:"STANDARD = STatic, Armored (closed by default), Zone-aware.",
 lab:"Create a Standard public IP and attach it to a VM's NIC with no NSG. Try to browse to it (fails). Add an NSG allowing port 80 and try again.",
 ref:LEARN+"virtual-network/ip-services/public-ip-addresses"};

LESSONS.udr={id:"udr",title:"User-defined routes",mins:3,
 keywords:["udr","user defined route","route table","next hop","virtual appliance","nva","ip forwarding","system routes","forced tunneling","0.0.0.0/0"],
 scenes:[
  {say:"Every subnet gets system routes automatically: traffic inside the VNet, to peered VNets, and out to the internet.",
   ops:[B("v","vnet",20,30,"vnet-prod","10.0.0.0/16",560,480),B("sw","subnet",45,80,"snet-web","10.0.1.0/24",245,170),B("sa","subnet",310,80,"snet-app","10.0.2.0/24",245,170),B("sf","subnet",45,290,"snet-firewall","10.0.3.0/24",510,190),
        B("w","vm",90,150,"vm-web","10.0.1.4"),B("a","vm",355,150,"vm-app","10.0.2.4"),B("fw","nva",225,370,"nva-fw","10.0.3.4"),
        T("sys",600,40,[["Prefix","Next hop"],["10.0.0.0/16","Virtual network"],["0.0.0.0/0","Internet"],["Private ranges outside VNet","None"]],"System routes"),P(["w","a"],"","ok")]},
  {say:"To force traffic through a firewall appliance, create a route table with a user-defined route.",
   ops:[T("rt",600,210,[["Prefix","Next hop type","Next hop IP"],["10.0.2.0/24","Virtual appliance","10.0.3.4"]],"rt-web (route table)")]},
  {say:"Associate the route table with the source subnet, here snet-web. Now traffic to the app subnet detours through the appliance.",
   ops:[H("sw"),L("lr","sw","sf","rt-web","dash"),P(["w","fw","a"],"","ok")]},
  {say:"Two gotchas. Enable IP forwarding on the appliance's network interface, or Azure drops traffic that isn't addressed to it. The operating system must forward packets too.",
   ops:[N("n1",600,330,"NIC of nva-fw → IP forwarding: Enabled\n+ forwarding turned on inside the OS","bad")]},
  {say:"Azure picks routes by longest prefix match. If two routes share the same prefix, a user-defined route beats BGP, and BGP beats a system route.",
   ops:[...D("n1"),T("pr",600,330,[["Tie on prefix?","Wins"],["User-defined route","1st"],["BGP route","2nd"],["System route","3rd"]],"Route selection")]},
  {say:"Next hop types to know: virtual appliance, virtual network gateway, virtual network, internet, and none, which simply drops the traffic.",
   ops:[...D("pr","sys","rt","lr"),T("nh",600,40,[["Next hop type","Meaning"],["Virtual appliance","Send to an NVA IP"],["Virtual network gateway","Send to VPN gateway"],["Virtual network","Route inside the VNet"],["Internet","Send to the internet"],["None","Drop the packet"]],"Next hop types")]},
  {say:"Watch the return path. If only snet-web uses the appliance, replies from the app go straight back, and stateful firewalls drop that asymmetric traffic. Add a route table to snet-app too.",
   ops:[P(["a","w"],"reply","bad"),N("n2",600,330,"Asymmetric routing! Add rt-app on snet-app:\n10.0.1.0/24 → Virtual appliance 10.0.3.4","bad")]},
  {say:"One route table can be associated with many subnets, but each subnet has at most one route table, in the same region and subscription.",
   ops:[...D("n2"),N("n3",600,330,"Route table → many subnets\nSubnet → zero or one route table","accent")]}
 ],
 takeaways:["Route tables hold UDRs and are associated with subnets, not VMs or NICs.","Next hop \"Virtual appliance\" needs a next hop IP, and the NVA's NIC needs IP forwarding enabled.","Longest prefix wins. On a tie: UDR > BGP > system route.","0.0.0.0/0 → Virtual appliance or Virtual network gateway = forced tunneling of internet traffic.","Fix asymmetric routing with route tables on both subnets."],
 traps:["Next hop type \"None\" drops traffic. Use it to block a route.","UDRs don't change traffic between VMs in the same subnet unless the route table is on that subnet and the prefix matches."],
 mnemonic:"Routes are like postcodes: the most specific address wins, and the user's handwriting beats the printed label.",
 lab:"Create a route table with 0.0.0.0/0 → None and associate it with a test subnet. From a VM there, try to reach the internet. Then use Network Watcher Next hop to see why it fails.",
 ref:LEARN+"virtual-network/virtual-networks-udr-overview"};
