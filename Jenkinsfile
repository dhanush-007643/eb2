pipeline {
    agent any

    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials-id')
        DOCKER_IMAGE = 'your-dockerhub-username/chatbot-app'
        IMAGE_TAG = "${env.BUILD_NUMBER}"
        KUBECONFIG_CREDENTIALS = credentials('kubeconfig-credentials-id')
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    echo "Building Docker image ${DOCKER_IMAGE}:${IMAGE_TAG}..."
                    sh "docker build -t ${DOCKER_IMAGE}:${IMAGE_TAG} -t ${DOCKER_IMAGE}:latest ."
                }
            }
        }

        stage('Push to Registry') {
            steps {
                script {
                    echo "Pushing image to Docker Hub..."
                    sh "echo ${DOCKERHUB_CREDENTIALS_PSW} | docker login -u ${DOCKERHUB_CREDENTIALS_USR} --password-stdin"
                    sh "docker push ${DOCKER_IMAGE}:${IMAGE_TAG}"
                    sh "docker push ${DOCKER_IMAGE}:latest"
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                withCredentials([file(credentialsId: 'kubeconfig-credentials-id', variable: 'KUBECONFIG')]) {
                    script {
                        echo "Deploying to Kubernetes cluster..."
                        sh "kubectl apply -f k8s/service.yaml --kubeconfig=${KUBECONFIG}"
                        sh "kubectl apply -f k8s/deployment.yaml --kubeconfig=${KUBECONFIG}"
                        
                        // Update the deployment with the newly built image tag
                        sh "kubectl set image deployment/chatbot-deployment chatbot-web=${DOCKER_IMAGE}:${IMAGE_TAG} --kubeconfig=${KUBECONFIG}"
                        
                        // Check rollout status
                        sh "kubectl rollout status deployment/chatbot-deployment --kubeconfig=${KUBECONFIG}"
                    }
                }
            }
        }
    }

    post {
        always {
            echo "Pipeline execution completed."
        }
        success {
            echo "Deployment successful! Chatbot is live."
        }
        failure {
            echo "Deployment failed. Please check the logs."
        }
    }
}
