// Function to determine semantic version based on branch name
def determineSemanticVersion(branchName, highestVersion) {
    def versionIncrement = 'patch' // default
    def finalVersion
    
    if (branchName.startsWith('breaking/') || branchName.startsWith('major/')) {
        versionIncrement = 'major'
        finalVersion = "${highestVersion.getMajor() + 1}.0.0"
        echo "Branch indicates MAJOR version increment"
    } else if (branchName.startsWith('feature/') || branchName.startsWith('feat/') || branchName.startsWith('minor/')) {
        versionIncrement = 'minor'
        finalVersion = "${highestVersion.getMajor()}.${highestVersion.getMinor() + 1}.0"
        echo "Branch indicates MINOR version increment"
    } else {
        // Default to PATCH for all other branches
        versionIncrement = 'patch'
        finalVersion = "${highestVersion.getMajor()}.${highestVersion.getMinor()}.${highestVersion.getPatch() + 1}"
        echo "Branch '${branchName}' - using default PATCH version increment"
    }
    
    return [
        version: finalVersion,
        increment: versionIncrement
    ]
}

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
                            env:
                            - name: CREATE_TAGS
                              value: "true"
                          - name: git
                            image: "alpine/git:latest"
                            command:
                            - cat
                            tty: true
                        """
                }
            }
            steps {
                container('docker') {
                    script {
                        // Get current branch name
                        def branchName = env.BRANCH_NAME
                        if (!branchName) {
                            container('git') {
                                branchName = sh(script: 'git rev-parse --abbrev-ref HEAD', returnStdout: true).trim()
                            }
                        }
                        echo "Current branch: ${branchName}"
                        
                        // Get the highest existing version
                        def highestVersion = getHighestSemanticVersion()
                        echo "Highest existing version: ${highestVersion.toString()}"
                        
                        // Determine semantic version using the function
                        def versionInfo = determineSemanticVersion(branchName, highestVersion)
                        def finalVersion = versionInfo.version
                        def versionIncrement = versionInfo.increment
                        
                        echo "=== BRANCH-BASED VERSION ANALYSIS ==="
                        echo "Branch: ${branchName}"
                        echo "Version increment type: ${versionIncrement}"
                        echo "Previous version: ${highestVersion.toString()}"
                        echo "New version: ${finalVersion}"
                        
                        def imageName = "app-ui:${finalVersion}"
                        def registry = "your-registry.com" // Replace with your actual registry
                        
                        // Create Git tag for the new version (configurable)
                        // Set CREATE_TAGS=true in Jenkins environment to enable tagging
                        if (env.CREATE_TAGS == 'true') {
                            container('git') {
                                sh """
                                    echo "Creating Git tag: v${finalVersion}"
                                    git tag -a "v${finalVersion}" -m "Release version ${finalVersion}"
                                    echo "Tag created successfully"
                                """
                            }
                        } else {
                            echo "Skipping Git tag creation (CREATE_TAGS=${env.CREATE_TAGS})"
                        }
                        
                        
                        sh """
                            echo "Starting Docker daemon..."
                            dockerd-entrypoint.sh &
                            
                            echo "Waiting for Docker daemon to start..."
                            sleep 10
                            
                            echo "Checking Docker daemon status..."
                            docker version
                            
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
