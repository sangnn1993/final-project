ĐỀ BÀI FINAL PROJECT
═════════════════════

Yêu cầu chính:
1. Sử dụng Docker để cài đặt tất cả ứng dụng, dự án,...
2. Đóng gói dự án bằng Dockerfile và docker-compose.yml
3. Viết scripts workflows (GitHub Actions) và pipeline (Jenkins) để tự động deploy
4. Cài đặt hệ thống giám sát (Monitoring): Grafana + Prometheus
   → Theo dõi cấu hình phần cứng + trạng thái database của dự án
5. Viết scripts Terraform tự động tạo hạ tầng VPS
6. Viết scripts Ansible tự động cài đặt ứng dụng phù hợp và deploy dự án


TIẾN HÀNH THỰC HIỆN
═══════════════════

1. Dự án: ToDo List
   └─ Môi trường: Production trên VPS (đã cài sẵn: Nginx Proxy Manager, Docker, Docker Compose)
   └─ Công nghệ: MERN Stack
      ├─ Frontend: React (Vite + Shadcn)
      ├─ Backend:  Node.js (Express)
      └─ Database: MongoDB Atlas (không tự host local)

   Cấu trúc thư mục dự án:
   final-project/
   ├── Frontend/
   │   ├── Dockerfile
   │   └── ... (src, public, package.json, ...)
   ├── Backend/
   │   ├── Dockerfile
   │   └── ... (src, controllers, models, ...)
   ├── docker-compose.yml
   ├── .github/
   │   └── workflows/
   │       └── main.yml
   └── Jenkinsfile


2. Cách triển khai theo từng yêu cầu

   2.1 Yêu cầu 1 & 2 – Triển khai thủ công trên VPS
   ────────────────────────────────────────────────
   • ssh root@[Domain-IP]
   • cd /root
   • git pull https://github.com/sangnn1993/final-project.git    (hoặc git clone nếu chưa có)
   • cd final-project
   • docker compose up -d

   • Truy cập Nginx Proxy Manager: http://[Domain-IP]:81 → login admin
   • Tạo Proxy Host + bật SSL cho các domain:
     • frontend → www.fastinvest.cloud + fastinvest.cloud
       → forward đến http://frontend:80
     • backend  → api.fastinvest.cloud
       → forward đến http://backend:5001


   2.2 Yêu cầu 3 – Tự động hóa deploy

      2.2.1 GitHub Actions
      ────────────────────
      • Tạo file: .github/workflows/main.yml
      • Cấu hình workflow:
        - trigger: push vào nhánh main
        - không hardcode domain-ip, ssh private key
      • Vào repo GitHub → Settings → Secrets and variables → Actions
        Thêm 2 secrets:
        - DOMAIN_IP     (ví dụ: 123.45.67.89)
        - SSH_PRIVATE_KEY  (toàn bộ nội dung private key)
      • Push code lên nhánh main → xem tab Actions để kiểm tra kết quả


      2.2.2 Jenkins
      ─────────────
      • Cài Jenkins bằng Docker trên VPS
      • Truy cập http://[Domain-IP]:8080 → lấy initial admin password từ log
      • Thiết lập tài khoản admin + cài các plugin cần thiết

      • Tạo Proxy Host trong Nginx Proxy Manager:
        Domain: jenkins.fastinvest.cloud
        Forward đến: http://[Domain-IP]:8080
        Bật SSL

      • Truy cập Jenkins qua https://jenkins.fastinvest.cloud
      • Tạo Pipeline mới:
        - General → Triggers → check "GitHub hook trigger for GITScm polling"
        - Pipeline → Definition: Pipeline script from SCM
          • SCM: Git
          • Repository URL: https://github.com/sangnn1993/final-project.git
          • Credentials: (tạo mới nếu chưa có)
          • Branch Specifier: */main
          • Script Path: Jenkinsfile

      • Vào Manage Jenkins → Credentials → thêm:
        - ID: ssh-key        → loại: SSH Username with private key
        - ID: webhook-secret → loại: Secret text

      • Vào GitHub repo → Settings → Webhooks → Add webhook:
        - Payload URL: https://jenkins.fastinvest.cloud/github-webhook/
        - Content type: application/x-www-form-urlencoded
        - Secret:       (dán giá trị webhook-secret vừa tạo)
        - SSL verification: Enable
        - Which events: Just the push event
        - Active: checked

      • Push code lên nhánh main → kiểm tra pipeline trong Jenkins
    
    2.3 Yêu cầu 4 - Giám sát
    ────────────────────────
      • Cài đặt grafana qua lệnh: docker run -d --name=grafana -p 3000:3000 --network final-project_demo_network grafana/grafana
      • Vào NPM tạo host và gắn vào domain grafana.fastinvest.cloud
      • Truy cập grafana qua tài khoản admin và đổi pass
      • Tạo file prometheus.yml trong thư mục dự án trong VPS qua vim/nano và cấu hình nội dung:
        global:
          scrape_interval: 1m
          scrape_configs:
            - job_name: 'prometheus'
              static_configs:
                - targets: ['prometheus.fastinvest.cloud']
            - job_name: 'node'
              static_configs:
                - targets: ['host-node-exporter:9100']
            - job_name: "todoX-mongo-metrics"
              scrape_interval: 10s
              metrics_path: /metrics
              scheme: http
              static_configs:
                - targets: ['mongodb-exporter:9216']
            rule_files:
                - "/etc/prometheus/alert.rules.yml"
      •Tạo file alert.rules.yml trong thư mục dự án trong VPS qua vim/nano và cấu hình nội dung:
        groups:
          - name: mongodb-alerts
            rules:
            - alert: MongoDBDown
              expr: up{job="todoX-mongo-metrics"} == 0
              for: 2m
              labels:
                severity: critical
              annotations:
                summary: "MongoDB exporter down"
            - alert: HighMongoDBConnections
              expr: mongodb_connections_current > 500
              for: 5m
              labels:
                severity: warning
      • Cài đặt prometheus qua lệnh: docker run --name prometheus -d -p 9090:9090 --network final-project_demo_network -v ./prometheus.yml:/etc/prometheus/prometheus.yml prom/prometheus
      • Vào NPM tạo host và gắn vào domain prometheus.fastinvest.cloud
      • Cài đặt node-exporter (docker run -d --name host-node-exporter --net="final-project_demo_network" -p 9100:9100 prom/node-exporter)
        và mongo-exporter (docker run -d --name mongo-exporter --network final-project_demo_network percona/mongodb_exporter:0.49.0 --mongodb.uri="mongodb://mongo:27017") để lấy metric cho prometheus
      • Kiểm tra metrics có hoạt động:
        - Truy cập Prometheus UI: http://prometheus.fastinvest.cloud/targets → kiểm tra các target UP (prometheus, node, todoX-mongo-metrics)
      • Cấu hình Grafana:
        - Thêm Data Source → Prometheus
        - URL: http://prometheus:9090 (dùng tên container trong network)
        - Access: Server (default)
        - Save & Test → phải thành công
        - Import dashboard có sẵn cho MongoDB:
        - Vào Dashboards → Import
        - ID phổ biến & tốt:
          + 2583 (MongoDB Exporter)
          + 1860 (Node Exporter)
        - Chọn Data Source vừa thêm → Import
        - Tùy chỉnh dashboard nếu cần
    
    2.4 Tạo script Terraform
    ────────────────────────
      • Lấy API Token từ Hostinger
      • Cài đặt Teraaform nầu chưa có dựa theo slide bài giảng
      • Tạo thư mục Terraform và file cơ bản:
        - main.tf
        - outputs.tf
        - providers.tf
        - variables.tf
      • Kiểm tra & lấy thông tin cần thiết theo các bước sau:
          # Khởi tạo
          terraform init
          # Xem list plan có sẵn (bao gồm KVM2)
          terraform console
          > provider.hostinger.data_centers   # hoặc check docs
          > provider.hostinger.os_templates
      • Chạy Terraform theo các bước sau:
          # Set biến
          export TF_VAR_hostinger_api_token="your_token_here"
          export TF_VAR_root_password="MatKhauManh123!"
          # Chạy lệnh
          terraform plan   # xem trước sẽ tạo gì
          terraform apply  # gõ yes để tạo VPS thật
                          
