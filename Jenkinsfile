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

        stage('Install Dependencies & Build React App') {
            steps {
                sh '''
                  echo "Installing dependencies..."
                  npm install
                  
                  echo "Building React app..."
                  npm run build
                '''
            }
        }

        stage('Docker Build') {
            steps {
                sh '''
                  echo "Building Docker image..."
                  docker build -t $DOCKER_REGISTRY/$IMAGE_NAME:$IMAGE_TAG .
                '''
            }
        }

        // stage('Docker Login') {
        //     steps {
        //         withCredentials([usernamePassword(credentialsId: 'docker-credentials-id', 
        //                                           usernameVariable: 'DOCKER_USER', 
        //                                           passwordVariable: 'DOCKER_PASS')]) {
        //             sh '''
        //               echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin $DOCKER_REGISTRY
        //             '''
        //         }
        //     }
        // }

        // stage('Docker Push') {
        //     steps {
        //         sh '''
        //           echo "Pushing Docker image..."
        //           docker push $DOCKER_REGISTRY/$IMAGE_NAME:$IMAGE_TAG
        //         '''
        //     }
        // }
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
