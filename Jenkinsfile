// ===============================
// Jenkinsfile for app-ui
// Handles PR builds + master branch releases
// ===============================

// Function: determine semantic version from base branch
def determineSemanticVersionFromBaseBranch(baseBranch, highestVersion) {
    def versionIncrement = 'patch'
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
        versionIncrement = 'patch'
        finalVersion = "${highestVersion.getMajor()}.${highestVersion.getMinor()}.${highestVersion.getPatch() + 1}"
        echo "Base branch '${baseBranch}' - using default PATCH version increment"
    }
    
    return [version: finalVersion, increment: versionIncrement]
}

// Function: create PR image name
def createPRImageName(branchName, commitSHA, registry) {
    def cleanBranchName = branchName.replaceAll('[^a-zA-Z0-9._-]', '-').toLowerCase()
    def shortCommit = commitSHA.take(8)
    return "${registry}/app-ui:${cleanBranchName}-${shortCommit}"
}

// Function: get branch info
def getBranchInfo() {
    def branchName = env.BRANCH_NAME ?: env.GIT_BRANCH?.replace('origin/', '') ?: 'main'
    def commitSHA = env.GIT_COMMIT ?: 'unknown'
    def isMaster = (branchName == 'main' || branchName == 'master')
    
    return [branchName: branchName, commitSHA: commitSHA, isMaster: isMaster]
}

// ===============================
// Pipeline
// ===============================
pipeline {
    agent {
        kubernetes {
            yaml """
                apiVersion: v1
                kind: Pod
                spec:
                containers:
                - name: docker
                    image: docker:24.0.0-dind
                    command:
                    - cat
                    tty: true
                    securityContext:
                    privileged: true
                """
        }
    }

    stages {
        stage('Build Docker Image') {
            steps {
                container('docker') {
                    script {
                        def branchInfo = getBranchInfo()
                        def branchName = branchInfo.branchName
                        def commitSHA = branchInfo.commitSHA
                        def isMaster = branchInfo.isMaster
                        def registry = "your-registry.com" // TODO: replace with real registry
                        
                        echo "Current branch: ${branchName}"
                        echo "Commit SHA: ${commitSHA}"
                        echo "Is master branch: ${isMaster}"
                        
                        def imageName
                        def finalVersion
                        
                        if (isMaster) {
                            echo "=== MASTER BRANCH - SEMANTIC VERSIONING ==="
                            def highestVersion = getHighestSemanticVersion() // implement function in shared lib
                            echo "Highest existing version: ${highestVersion.toString()}"
                            
                            def baseBranch = env.CHANGE_TARGET ?: 'main'
                            echo "PR base branch: ${baseBranch}"
                            
                            def versionInfo = determineSemanticVersionFromBaseBranch(baseBranch, highestVersion)
                            finalVersion = versionInfo.version
                            
                            echo "New version: ${finalVersion}"
                            imageName = "app-ui:${finalVersion}"
                        } else {
                            echo "=== PR BRANCH - BRANCH + COMMIT VERSIONING ==="
                            imageName = createPRImageName(branchName, commitSHA, registry)
                            finalVersion = imageName.split(':')[1]
                            
                            echo "PR image name: ${imageName}"
                            echo "Version: ${finalVersion}"
                        }
                        
                        currentBuild.displayName = isMaster ? "v${finalVersion}" : "${branchName}-${commitSHA.take(8)}"
                        currentBuild.description = isMaster ? 
                            "Release version ${finalVersion} from master branch" : 
                            "PR build from branch ${branchName} (${commitSHA.take(8)})"
                        
                        sh """
                            echo "Starting Docker daemon..."
                            dockerd-entrypoint.sh &
                            sleep 10
                            docker version
                            
                            echo "Building Docker image: ${imageName}"
                            docker build -t ${imageName} .
                            docker tag ${imageName} ${registry}/${imageName}
                            echo "Docker image built successfully."
                        """
                        
                        // Uncomment to push
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
            container('docker') {
                script {
                    def branchInfo = getBranchInfo()
                    if (branchInfo.isMaster) {
                        def finalVersion = currentBuild.displayName.replace('v', '')
                        echo "Creating Git tag for master release: v${finalVersion}"
                        
                        withCredentials([usernamePassword(credentialsId: 'argus-cicd-writer', usernameVariable: 'GIT_USER', passwordVariable: 'GIT_PASS')]) {
                            sh """
                                git config user.email "cicd@argusintelligence.net"
                                git config user.name "argus-cicd"
                                
                                git fetch --tags
                                git tag v${finalVersion}
                                git push https://\${GIT_USER}:\${GIT_PASS}@github.com/void-kernel/app-ui.git v${finalVersion}
                            """
                        }
                    } else {
                        echo "PR branch build - skipping Git tag creation"
                    }
                }
            }
        }
    }
}
