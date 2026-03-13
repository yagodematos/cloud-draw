direction: top-bottom

Internet [icon: cloud]

VPC [style: dashed] {
  Public Subnet [style: dashed] {
    Load Balancer [icon: cloud]
  }

  Private Subnet [style: dashed] {
    App Server [icon: server]
    Cache [icon: database]
  }
}

Internet > Load Balancer
Load Balancer > App Server
App Server <> Cache
