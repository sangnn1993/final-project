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