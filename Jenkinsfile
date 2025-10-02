pipeline {
    agent any

    environment {
        // Customize image name and registry if needed
        DOCKER_REGISTRY = "your-registry-url"   // e.g., <aws_account_id>.dkr.ecr.ap-south-1.amazonaws.com
        IMAGE_NAME = "react-app-ui"
        IMAGE_TAG = "latest"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build and Push to ECR') {
            steps {
                script {
                    // Build Docker image using the Dockerfile which handles npm install and build
                    sh '''
                        echo "Building Docker image..."
                        docker build -t $DOCKER_REGISTRY/$IMAGE_NAME:$IMAGE_TAG .
                        
                        echo "Docker image built successfully: $DOCKER_REGISTRY/$IMAGE_NAME:$IMAGE_TAG"
                    '''
                    
                    // Uncomment and configure these steps when you have ECR setup
                    // sh '''
                    //     echo "Logging into ECR..."
                    //     aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $DOCKER_REGISTRY
                    //     
                    //     echo "Pushing Docker image to ECR..."
                    //     docker push $DOCKER_REGISTRY/$IMAGE_NAME:$IMAGE_TAG
                    //     
                    //     echo "Successfully pushed image to ECR!"
                    // '''
                }
            }
        }
    }

    post {
        success {
            echo "Build and push completed successfully!"
        }
        failure {
            echo "Build or push failed!"
        }
    }
}
