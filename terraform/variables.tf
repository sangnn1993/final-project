variable "hostinger_api_token" {
  description = "Hostinger API Token"
  type        = string
  sensitive   = true
}

variable "hostname" {
  description = "Hostname cho VPS"
  type        = string
  default     = "todo-app-vps"
}

variable "plan" {
  description = "Plan VPS (KVM2)"
  type        = string
  default     = "hostingercom-vps-kvm2-usd-1m"
}

variable "data_center_id" {
  description = "ID datacenter"
  type        = number
  default     = 13 
}

variable "template_id" {
  description = "OS template ID"
  type        = number
  default     = 1002   # Ubuntu 22.04
}

variable "root_password" {
  description = "Mật khẩu root"
  type        = string
  sensitive   = true
}

variable "public_key" {
  description = "Khóa để truy cập"
  type        = string
  sensitive   = true
}