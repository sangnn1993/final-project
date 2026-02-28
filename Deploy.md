Đề bài Final Project:
     1. Sử dụng docker để cài đặt tất cả ứng dụng, dự án,...
     2. Đóng gói bằng Dockerfile và docker-compose.yml dự án
     3. Viết scripts workflows (github actions) và pipeline (Jenkins) để tự động deploy.
     4. Cài đặt hệ thống giám sát (monitoring) Grafana, Prometheus để theo dõi cấu hình phần cứng và theo dõi trạng thái database dự án.
     5. Viết scripts Terraform tự động tạo hạ tầng VPS
     6. Viết scripts Ansible tự động cài đặt ứng dụng phù hợp và deploy dự án đang có

Tiến hành:
    1. Dự án: ToDo List
        - Môi trường: Production trên VPS (đã cài Nginx Proxy Manager, Docker và Docker Compose)
        - Công Nghệ: MERN Stack
            + Frontend: React (kết hợp Vite + Shadcn)
            + Backend: Nodejs (dung Express)
            + Database: MongoDB (dùng Atlas thay vì tự host)
        - Thư Mục:
            |_ Frontend
            |   |_ Dockerfile
            |   |_ ... src
            |_ Backend
            |   |_ Dockerfile
            |   |_ ... src
            |_ docker-compose.yml
            |_ .github
            |   |_workflows
            |        |_ main.yml
            |_ Jenkinsfile
    
    2. Cách triển khai theo đề bài:

        2.1. Yêu cầu 1 & 2:
                + ssh vào VPS thông qua tài khoản root@[Domain-Ip]
                + cd vào thư mục root và dùng lệnh git pull thư mục dự án từ github về: https://github.com/sangnn1993/final-project.git
                + cd vào thư mục app vừa clone: cd final-project
                + chạy lệnh: docker compose up -d
                + truy cập trang quản lý Nginx Proxy Manager bằng tài khoản admin qua [Domain-Ip]:81
                + tạo host và bật SSL cho các domain name đã thiết lập:
                    . frontend: www.fastinvest.cloud, fastinvest.cloud qua http://frontend:80
                    . backend: api.fastinvest.cloud qua http://backend:5001
        
        2.2. Yêu cầu 3:
            2.2.1. Github Action:
                + tạo thư mục .github/workflows/main.yml
                + cấu hình file main.yml (event push nhánh main - không hardcode domain-ip, ssh-key)
                + truy cập thư mục dự án trên github, vào setting tạo các secrets: domain-ip, ssh-key
                + push updated files lên github nhánh main, sau đó kiểm tra github action để thấy kết quả
            2.2.2. Jenkins:
                + cài đặt Jenkins thông qua docker
                + truy cập Jenkins thông qua mật khẩu trong logs sau khi cài, thiết lập tài khoản và install
                + tạo host và bật SSL cho Jenkins thông qua NPM, trỏ đến http://[Domain-Ip]:8080 với domain name là jenkins.fastinvest.cloud (để dùng trong github webhook tránh lộ IP và có xác thực SSL) 
                + truy vập vào trang quản lý của Jenkins, tạo Pipline mới:
                    . phần Triggers chọn 'GitHub hook trigger for GITScm polling'
                    . phần Pipeline chọn Pipelinescript from SCM, sau đó khai báo như bên dưới và Save:
                        .. SCM: Git
                        .. Repo URL: https://github.com/sangnn1993/final-project.git
                        .. Credentials: cấu hình thông qua nút add và chọn tên credential vừa thêm
                        .. Branch: */main
                        .. Repository browser: Auto
                        .. Script Path: Jenkinsfile
                + vào Settings tạo thêm Credentials:
                    . ssh-key (dùng gọi ẩn ssh key thông qua Jenkinsfile)
                    . webhook-secret (dùng cấu hình trong webhook cảu github)
                + truy cập thư mục dự án trên github, vào setting - webhook - Add Webhook, khai báo như bên dưới và Save:
                    . Payload URL: https://jenkins.fastinvest.cloud/github-webhook/
                    . Content type: application/x-www-form-urlencoded
                    . Secret: nội dung trong Credential đã khai báo ở bước trên có tên webhook-secret
                    . SSL verification: Enable
                    . Which events: Push
                    . Active: true
                + push updated files lên github nhánh main, sau đó kiểm tra Pipline đã tạo để thấy kết quả