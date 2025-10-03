// ===============================
// Jenkinsfile for app-ui (Kaniko Version - No DinD)
// ===============================

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
    agent any

    environment {
        AWS_REGION     = "ap-south-1"
        AWS_ACCOUNT_ID = "210519480143"
        ECR_REPO       = "app-ui"
    }

    stages {
        stage('Build & Push Docker Image') {
    agent {
        kubernetes {
            yaml """
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: kaniko
    image: gcr.io/kaniko-project/executor:debug
    command:
    - /busybox/cat
    tty: true
"""
        }
    }
    steps {
        container('kaniko') {
            script {
                def branchInfo = getBranchInfo()
                def shortCommit = branchInfo.commitSHA.take(8)

                def imageTag
                if (branchInfo.isMaster) {
                    // Get highest semantic version from Git tags using GitHub Changelog plugin
                    def highestVersion = getHighestSemanticVersion()
                    println "Highest version: " + highestVersion.toString()
                    println " Major1: " + highestVersion.getMajor()
                    println " Minor: " + highestVersion.getMinor()
                    println " Patch: " + highestVersion.getPatch()
                    println " Git tag: " + highestVersion.findTag().orElse("")
                    
                    def baseBranch = env.CHANGE_TARGET ?: 'main'
                    def versionInfo = determineSemanticVersionFromBaseBranch(baseBranch, highestVersion)
                    imageTag = versionInfo.version
                } else {
                    def cleanBranchName = branchInfo.branchName.replaceAll('[^a-zA-Z0-9._-]', '-').toLowerCase()
                    imageTag = "${cleanBranchName}-${shortCommit}"
                }

                def fullImageName = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO}:${imageTag}"
                currentBuild.displayName = imageTag

                withCredentials([[$class: 'AmazonWebServicesCredentialsBinding',
                                  credentialsId: 'argus-cicd-ecr-fullaccess-iam-user']]) {
                    sh """
                        echo "Building and pushing with Kaniko..."
                        /kaniko/executor \
                          --context dir://\$(pwd) \
                          --dockerfile \$(pwd)/Dockerfile \
                          --destination ${fullImageName} \
                          --cleanup \
                          --verbosity info
                    """
                }
            }
        }
    }
}

        stage('Tag Release') {
            when {
                anyOf { branch 'main'; branch 'master' }
            }
            agent {
                kubernetes {
                    yaml """
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: git
    image: alpine/git:2.43.0
    command: ['/bin/sh', '-c', 'sleep 9999999']
    tty: true
"""
                }
            }
            steps {
                container('git') {
                    script {
                        def finalVersion = currentBuild.displayName
                        echo "Creating and pushing Git tag: v${finalVersion}"
                        
                        withCredentials([usernamePassword(
                            credentialsId: 'argus-cicd-writer',
                            usernameVariable: 'GIT_USER',
                            passwordVariable: 'GIT_PASS'
                        )]) {
                            sh """
                                # Clone the repository with depth 1 (shallow clone)
                                git clone --depth 1 https://${GIT_USER}:${GIT_PASS}@github.com/void-kernel/app-ui.git repo
                                cd repo
                                
                                # Configure git user
                                git config user.email "jenkins-ci@argusintelligence.net"
                                git config user.name "Jenkins CI"
                                
                                # Checkout the commit that was built
                                git fetch --depth 1 origin ${env.GIT_COMMIT}
                                git checkout ${env.GIT_COMMIT}
                                
                                # Create and push the tag
                                git tag v${finalVersion} -m "Release version ${finalVersion}"
                                git push origin v${finalVersion}
                            """
                        }
                    }
                }
            }
        }
    }
}
