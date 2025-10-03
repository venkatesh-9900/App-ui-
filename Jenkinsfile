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
        APP_NAME       = "app-ui"
        AWS_CREDS      = credentials('argus-cicd-ecr-fullaccess-iam-user')
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
                          echo "Installing AWS CLI inside docker:dind..."
                          apk add --no-cache aws-cli curl

                          echo "Configuring AWS credentials..."
                          aws configure set aws_access_key_id $AWS_CREDS_USR
                          aws configure set aws_secret_access_key $AWS_CREDS_PSW
                          aws configure set region $AWS_REGION

                          echo "Logging in to AWS ECR..."
                          aws ecr get-login-password --region $AWS_REGION \
                            | docker login --username AWS --password-stdin $ECR_REGISTRY

                          echo "Building Docker image..."
                          IMAGE_TAG=$ECR_REGISTRY/$ECR_REPO:$APP_VERSION
                          docker build -t $IMAGE_TAG .

                          echo "Pushing Docker image..."
                          docker push $IMAGE_TAG
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
