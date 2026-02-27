pipeline {
    agent any

    environment {
        DEPLOY_PATH = '/root/final-project'
    }

    stages {
        stage('Restart Container') {
            steps {
                withCredentials([sshUserPrivateKey(
                    credentialsId: 'ssh-key',
                    keyFileVariable: 'SSH_KEY',
                    usernameVariable: 'SSH_USER'
                )]) {
                    sh """
                        ssh -o StrictHostKeyChecking=no -i \${SSH_KEY} \${SSH_USER} '
                            cd \${DEPLOY_PATH}
                            git pull
                            docker compose down
                            docker compose up -d --build
                        '
                    """
                }
            }
        }
    }
}