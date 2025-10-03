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
                        """
                }
            }
            steps {
                container('docker') {
                    script {
                        // Get current branch name from Jenkins environment variables
                        def branchName = env.BRANCH_NAME ?: env.GIT_BRANCH?.replace('origin/', '') ?: 'main'
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
                        
                        // Create Git tag using Jenkins Git plugin
                        if (env.CREATE_TAGS == 'true') {
                            echo "Creating Git tag: v${finalVersion}"
                            // This will be handled by the Git plugin in post-build actions
                            currentBuild.displayName = "v${finalVersion}"
                            currentBuild.description = "Release version ${finalVersion} from branch ${branchName}"
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
    post {
        success {
            script {
                if (env.CREATE_TAGS == 'true') {
                    // Create Git tag using Jenkins Git plugin
                    def finalVersion = currentBuild.displayName.replace('v', '')
                    echo "Creating Git tag: v${finalVersion}"
                    
                    // This requires the Git plugin to be configured in Jenkins
                    // You can also use the Git Publisher post-build action in Jenkins UI
                    sh """
                        echo "Tag would be created: v${finalVersion}"
                        echo "Configure Git Publisher in Jenkins job settings for automatic tagging"
                    """
                    withCredentials([usernamePassword(credentialsId: 'argus-cicd-writer', usernameVariable: 'GIT_USER', passwordVariable: 'GIT_PASS')]) {
                        sh """
                            git config user.email "cicd@argusintelligence.net"
                            git config user.name "argus-cicd"

                            # fetch all tags to ensure we have the latest
                            git fetch --tags

                            git tag v${finalVersion}
                            git push https://${GIT_USER}:${GIT_PASS}@github.com/your-org/app-ui.git v${finalVersion}
                        """
                    }

                }
            }
        }
    }
}
