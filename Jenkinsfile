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
    securityContext:
      privileged: true
    command:
    - cat
    tty: true
"""
        }
    }

    environment {
        AWS_REGION     = "ap-south-1"
        AWS_ACCOUNT_ID = "210519480143"
        ECR_REGISTRY   = "210519480143.dkr.ecr.ap-south-1.amazonaws.com"
        ECR_REPO       = "argus-prod-cicd-ecr"
        APP_NAME       = "app-ui" // Added for clarity
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Determine Version') {
            steps {
                script {
                    def highestVersion = getHighestSemanticVersion()
                    echo "Highest version: ${highestVersion.toString()}"
                    echo " Major: ${highestVersion.getMajor()}"
                    echo " Minor: ${highestVersion.getMinor()}"
                    echo " Patch: ${highestVersion.getPatch()}"
                    echo " Git tag: ${highestVersion.findTag().orElse("")}"

                    def baseBranch = env.BRANCH_NAME ?: "main"
                    def result = determineSemanticVersionFromBaseBranch(baseBranch, highestVersion)

                    env.APP_VERSION = result.version
                    echo "Final version for build: ${env.APP_VERSION}"
                }
            }
        }

        stage('Docker Build & Push') {
            steps {
                container('docker') {
                    script {
                        sh '''
                          echo "Logging in to AWS ECR..."
                          aws ecr get-login-password --region $AWS_DEFAULT_REGION \
                            | docker login --username AWS --password-stdin $ECR_REPO

                          echo "Building Docker image..."
                          docker build -t $ECR_REPO:$APP_VERSION .

                          echo "Pushing Docker image..."
                          docker push $ECR_REPO:$APP_VERSION
                        '''
                    }
                }
            }
        }
    }
}

@NonCPS
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
