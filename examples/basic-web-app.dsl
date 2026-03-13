# Basic web app
direction: left-right

Users [icon: user]
Edge [icon: cloud]
API Gateway [icon: server]
Auth Service [icon: shield]

Platform [style: dashed] {
  App Server [icon: server]
  Database [icon: database]
}

Users > Edge: requests
Edge > API Gateway
API Gateway <> Auth Service: validates
API Gateway > App Server: routes
App Server > Database: queries
