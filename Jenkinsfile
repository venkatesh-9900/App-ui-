// Main Pipeline - Handles both Master and PR builds
// This pipeline determines which build type to run based on branch type

// Function to determine semantic version based on PR base branch (for master merges)
def determineSemanticVersionFromBaseBranch(baseBranch, highestVersion) {
    def versionIncrement = 'patch' // default
    def finalVersion
    
    if (baseBranch.startsWith('breaking/') || baseBranch.startsWith('major/')) {
        versionIncrement = 'major'
        finalVersion = "${highestVersion.getMajor() + 1}.0.0"
        echo "Base branch indicates MAJOR version increment"
    } else if (baseBranch.startsWith('feature/') || baseBranch.startsWith('feat/') || baseBranch.startsWith('minor/')) {
        versionIncrement = 'minor'
        finalVersion = "${highestVersion.getMajor()}.${highestVersion.getMinor() + 1}.0"
        echo "Base branch indicates MINOR version increment"
    } else {
        // Default to PATCH for all other base branches
        versionIncrement = 'patch'
        finalVersion = "${highestVersion.getMajor()}.${highestVersion.getMinor()}.${highestVersion.getPatch() + 1}"
        echo "Base branch '${baseBranch}' - using default PATCH version increment"
    }
    
    return [
        version: finalVersion,
        increment: versionIncrement
    ]
}

// Function to create PR image name with branch and commit SHA
def createPRImageName(branchName, commitSHA, registry) {
    def cleanBranchName = branchName.replaceAll('[^a-zA-Z0-9._-]', '-').toLowerCase()
    def shortCommit = commitSHA.take(8)
    return "${registry}/app-ui:${cleanBranchName}-${shortCommit}"
}

// Function to get branch information and determine if it's master
def getBranchInfo() {
    def branchName = env.BRANCH_NAME ?: env.GIT_BRANCH?.replace('origin/', '') ?: 'main'
    def commitSHA = env.GIT_COMMIT ?: 'unknown'
    def isMaster = (branchName == 'main' || branchName == 'master')
    
    return [
        branchName: branchName,
        commitSHA: commitSHA,
        isMaster: isMaster
    ]
}

pipeline {
    agent kubernetes
    stages {
        stage('Build') {
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
                        // Get branch information using the function
                        def branchInfo = getBranchInfo()
                        def branchName = branchInfo.branchName
                        def commitSHA = branchInfo.commitSHA
                        def isMaster = branchInfo.isMaster
                        def registry = "your-registry.com" // Replace with your actual registry
                        
                        echo "Current branch: ${branchName}"
                        echo "Commit SHA: ${commitSHA}"
                        echo "Is master branch: ${isMaster}"
                        
                        def imageName
                        def finalVersion
                        
                        if (isMaster) {
                            // MASTER BRANCH: Use semantic versioning based on merged PR base branch
                            echo "=== MASTER BRANCH - SEMANTIC VERSIONING ==="
                            
                            // Get the highest existing version
                            def highestVersion = getHighestSemanticVersion()
                            echo "Highest existing version: ${highestVersion.toString()}"
                            
                            // For master, we need to determine the base branch of the merged PR
                            def baseBranch = env.CHANGE_TARGET ?: 'main' // Default to main if not available
                            echo "PR base branch: ${baseBranch}"
                            
                            // Determine semantic version using the base branch
                            def versionInfo = determineSemanticVersionFromBaseBranch(baseBranch, highestVersion)
                            finalVersion = versionInfo.version
                            def versionIncrement = versionInfo.increment
                            
                            echo "Version increment type: ${versionIncrement}"
                            echo "Previous version: ${highestVersion.toString()}"
                            echo "New version: ${finalVersion}"
                            
                            imageName = "app-ui:${finalVersion}"
                            
                        } else {
                            // PR BRANCH: Use branch name and commit SHA
                            echo "=== PR BRANCH - BRANCH + COMMIT VERSIONING ==="
                            
                            imageName = createPRImageName(branchName, commitSHA, registry)
                            finalVersion = imageName.split(':')[1] // Extract version part
                            
                            echo "PR image name: ${imageName}"
                            echo "Version: ${finalVersion}"
                        }
                        
                        // Set build display name and description
                        currentBuild.displayName = isMaster ? "v${finalVersion}" : "${branchName}-${commitSHA.take(8)}"
                        currentBuild.description = isMaster ? 
                            "Release version ${finalVersion} from master branch" : 
                            "PR build from branch ${branchName} (${commitSHA.take(8)})"
                        
                        // Only create Git tags for master branch releases
                        if (isMaster) {
                            echo "Master branch detected - will create Git tag: v${finalVersion}"
                        } else {
                            echo "PR branch detected - skipping Git tag creation"
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
                def branchInfo = getBranchInfo()
                def branchName = branchInfo.branchName
                def isMaster = branchInfo.isMaster
                
                if (isMaster) {
                    // Only create Git tags for master branch releases
                    def finalVersion = currentBuild.displayName.replace('v', '')
                    echo "Test line"
                    echo "Creating Git tag for master release: v${finalVersion}"
                    
                    withCredentials([usernamePassword(credentialsId: 'argus-cicd-writer', usernameVariable: 'GIT_USER', passwordVariable: 'GIT_PASS')]) {
                        sh """
                            git config user.email "cicd@argusintelligence.net"
                            git config user.name "argus-cicd"

                            # fetch all tags to ensure we have the latest
                            git fetch --tags

                            git tag v${finalVersion}
                            git push https://\${GIT_USER}:\${GIT_PASS}@github.com/your-org/app-ui.git v${finalVersion}
                        """
                    }
                } else {
                    echo "PR branch build - skipping Git tag creation"
                }
            }
        }
    }
}
