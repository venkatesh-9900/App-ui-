pipeline {
    agent none
    stages {
        stage('app-ui') {
            agent {
                kubernetes {
                    yaml """
                        apiVersion: v1
                        kind: Pod
                        spec:
                          containers:
                          - name: docker
                            image: "docker:24.0.0-dind"
                            command:
                            - cat
                            tty: true
                            securityContext:
                              privileged: true
                        """
                }
            }
            steps {
                container('docker') {
                    script {
                        def imageName = "app-ui:${env.BUILD_NUMBER ?: 'latest'}"
                        def registry = "your-registry.com" // Replace with your actual registry
                        
                        sh """
                            echo "Building Docker image: ${imageName}"
                            docker build -t ${imageName} .
                            docker tag ${imageName} ${registry}/${imageName}
                            
                            echo "Docker image built successfully. Tag: ${imageName}"
                            docker images | grep app-ui
                        """
                        
                        // Uncomment the following lines if you want to push to registry
                        // withCredentials([usernamePassword(credentialsId: 'docker-registry-credentials', usernameVariable: 'DOCKER_USERNAME', passwordVariable: 'DOCKER_PASSWORD')]) {
                        //     sh "echo \$DOCKER_PASSWORD | docker login ${registry} -u \$DOCKER_USERNAME --password-stdin"
                        //     sh "docker push ${registry}/${imageName}"
                        // }
                    }
                }
            }
        }
    }
}
