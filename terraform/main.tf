terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
}

provider "azurerm" {
  features {}
  # Authentication can be provided through Azure CLI or environment variables
  subscription_id = "2d11a686-addd-44f1-a843-bfa93bd8a96f"
  tenant_id       = "b20e3f13-a2ac-42d3-9422-fa22eb05deb7"
}

module "aks" {
  source         = "./modules/aks"
  resource_group = var.resource_group
  location       = var.location
  cluster_name   = var.cluster_name
  dns_prefix     = var.dns_prefix
  node_count     = var.node_count
}