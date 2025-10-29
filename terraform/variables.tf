variable "compartment_ocid" {
  type = string
  description = "Compartment OCID to create the resources at"
}

variable "tenancy_ocid" {
  type = string
  description = "Tenancy OCID"
}

variable "subnet_ocid" {
  type = string
  description = "Subnet OCID to create the resources at, preferably private"
}

variable "ocir_region" {
  type = string
  default = "fra.ocir.io"
  description = "OCIR region"
}

#### LIST ALL APP IMAGES HERE ####

variable "sidecar_image" {
  type = string
  default = "prometheus-sidecar:1.0.0"
  description = "CI sidecar image e.g. prometheus-sidecar:1.0.0"
}

variable "prometheus_node_exporter_image" {
  type = string
  default = "quay.io/prometheus/node-exporter:latest"
  description = "Prometheus Node Exporter image e.g. quay.io/prometheus/node-exporter:latest"
}

variable "prometheus_image" {
  type = string
  default = "prom/prometheus:main"
  description = "Prometheus image e.g. prom/prometheus:main"
}

variable "app_image_1" {
  type = string
  default = "prometheusjavademo:1.0.0"
  description = "App image e.g. prometheusjavademo:1.0.0"
}

##################################

variable "ad_number" {
  type    = number
  default = 1
  description = "AD number (1,2,or 3)"
}

variable "log_ocid" {
  type    = string
  description = "OCI Logging log OCID"
}

variable "log_mount_path" {
  type    = string
  default = "/var/log"
}

variable "log_mount_name" {
  type    = string
  default = "applog"
}

variable "config_mount_name" {
  type    = string
  default = "prometheus_config"
}

variable "config_mount_path" {
  type    = string
  default = "/etc/prometheus"
}

variable "config_bucket" {
  type    = string
  default = "prometheus"
}

variable "config_file" {
  type    = string
  default = "prometheus.yml"
}

variable "log_file" {
  type    = string
  default = "app.log"
}



