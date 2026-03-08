resource "hostinger_vps" "todo_vps" {
  plan              = var.plan
  data_center_id    = var.data_center_id
  template_id       = var.template_id
  hostname          = var.hostname
  password          = var.root_password

  # tags = ["todo-project", "mern"]
}