# Microservices
Frontend [icon: cloud]

Cluster [style: dashed] {
  User Service [icon: server]
  Billing Service [icon: server]
  Event Bus [icon: cloud]
}

Primary DB [icon: database]

Frontend > User Service
Frontend > Billing Service
User Service <> Event Bus
Billing Service <> Event Bus
User Service > Primary DB
Billing Service > Primary DB
