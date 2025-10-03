// ===============================
// Jenkinsfile for app-ui (Using AWS CLI + Credentials Binding)
// ===============================

@NonCPS
def getHighestSemanticVersion() {
    echo "WARNING: Using dummy version. Implement real getHighestSemanticVersion()."
    return new groovy.json.JsonSlurper().parseText('{"major": 1, "minor": 2, "patch": 3}')
}

def determineSemanticVersionFromBaseBranch(baseBranch, highestVersion) {
    def versionIncrement = 'patch'
    def finalVersion
    
    if (baseBranch.startsWith('breaking/') || baseBranch.startsWith('major/')) {
        versionIncrement = 'major'
        finalVersion = "${highestVersion.major + 1}.0.0"
        echo "Base branch indicates MAJOR version increment"
    } else if (baseBranch.startsWith('feature/') || baseBranch.startsWith('feat/') || baseBranch.startsWith('minor/')) {
        versionIncrement = 'minor'
        finalVersion = "${highestVersion.major}.${highestVersion.minor + 1}.0"
        echo "Base branch indicates MINOR version increment"
    } else {
        versionIncrement = 'patch'
        finalVersion = "${highestVersion.major}.${highestVersion.minor}.${highestVersion.patch + 1}"
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
        ECR_REPO       = "argus-prod-cicd-ecr"
        APP_NAME       = "app-ui"
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
            steps {
                container('docker') {
                    script {
                        def branchInfo = getBranchInfo()
                        def shortCommit = branchInfo.commitSHA.take(8)

                        echo "Current branch: ${branchInfo.branchName}"
                        
                        def imageTag
                        if (branchInfo.isMaster) {
                            echo "=== MASTER BRANCH BUILD ==="
                            def highestVersion = getHighestSemanticVersion()
                            def baseBranch = env.CHANGE_TARGET ?: 'main'
                            def versionInfo = determineSemanticVersionFromBaseBranch(baseBranch, highestVersion)
                            imageTag = versionInfo.version
                        } else {
                            echo "=== PR BRANCH BUILD ==="
                            def cleanBranchName = branchInfo.branchName.replaceAll('[^a-zA-Z0-9._-]', '-').toLowerCase()
                            imageTag = "${cleanBranchName}-${shortCommit}"
                        }

                        def fullImageName = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO}/${APP_NAME}:${imageTag}"
                        currentBuild.displayName = imageTag

                        // Use AWS CLI with Jenkins AWS credentials
                        withCredentials([[$class: 'AmazonWebServicesCredentialsBinding', 
                                          credentialsId: 'argus-cicd-ecr-fullaccess-iam-user']]) {
                            sh """
                                echo "Installing AWS CLI..."
                                apk add --no-cache aws-cli

                                echo "Logging in to ECR..."
                                aws ecr get-login-password --region ${AWS_REGION} \
                                  | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com
                                
                                echo "Building Docker image: ${fullImageName}"
                                docker build -t ${fullImageName} .
                                
                                echo "Pushing Docker image to ECR..."
                                docker push ${fullImageName}
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
    command: ['cat']
    tty: true
"""
                }
            }
            steps {
                container('git') {
                    script {
                        def finalVersion = currentBuild.displayName
                        echo "Creating and pushing Git tag: v${finalVersion}"
                        
                        // Uncomment when GitHub writer credentials available
                        // withCredentials([usernamePassword(credentialsId: 'github-writer', usernameVariable: 'GIT_USER', passwordVariable: 'GIT_PASS')]) {
                        //     sh """
                        //         git config user.email "ci-bot@your-fintech.com"
                        //         git config user.name "Jenkins CI"
                        //         git tag v${finalVersion} -m "Release version ${finalVersion}"
                        //         git push https://${GIT_USER}:${GIT_PASS}@github.com/your-org/app-ui.git v${finalVersion}
                        //     """
                        // }
                    }
                }
            }
        }
    }
}
