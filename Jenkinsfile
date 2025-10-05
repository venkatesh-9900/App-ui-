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
        echo "Base branch indicates MINOR version increment test"
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
        ECR_REPO       = "docker/app-ui"
        ECR_HELM_REPO  = "helm/app-ui"
        CHART_PATH     = "helm"
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
                    // Ensure tags are present
                    // Re-checkout with full history + tags
                    checkout([
                        $class: 'GitSCM',
                        branches: scm.branches,
                        doGenerateSubmoduleConfigurations: false,
                        extensions: [
                            [$class: 'CloneOption', noTags: false, shallow: false, depth: 0, reference: ''],
                            [$class: 'CheckoutOption', timeout: 15]
                        ],
                        submoduleCfg: [],
                        userRemoteConfigs: scm.userRemoteConfigs
                    ])

                    // Get highest semantic version from Git tags using GitHub Changelog plugin
                    def highestVersion = getHighestSemanticVersion()
                    println "Highest version: " + highestVersion.toString()
                    println " Major 1: " + highestVersion.getMajor()
                    println " Minor: " + highestVersion.getMinor()
                    println " Patch: " + highestVersion.getPatch()
                    println " Git tag: " + highestVersion.findTag().orElse("")
                    
                    def baseBranch = env.CHANGE_TARGET ?: 'main'
                    def targetBranch = env.CHANGE_BRANCH
                    def versionInfo = determineSemanticVersionFromBaseBranch(baseBranch, highestVersion)
                    imageTag = versionInfo.version
                    println "Image tag: " + imageTag
                    env.IMAGE_TAG = imageTag
                } else {
                    def cleanBranchName = branchInfo.branchName.replaceAll('[^a-zA-Z0-9._-]', '-').toLowerCase()
                    imageTag = "${cleanBranchName}-${shortCommit}"
                    env.IMAGE_TAG = imageTag
                }

                def fullImageName = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO}:${imageTag}"
                currentBuild.displayName = imageTag

                // withCredentials([[$class: 'AmazonWebServicesCredentialsBinding',
                //                   credentialsId: 'argus-cicd-ecr-fullaccess-iam-user']]) {
                //     sh """
                //         echo "Building and pushing with Kaniko..."
                //         /kaniko/executor \
                //           --context dir://\$(pwd) \
                //           --dockerfile \$(pwd)/Dockerfile \
                //           --destination ${fullImageName} \
                //           --cleanup \
                //           --verbosity info
                //     """
                // }
            }
        }
    }
}

        // -----------------------------------------
        // STAGE 2: Update Helm Chart + Push via Git Plugin
        // -----------------------------------------
        stage('Update Helm Chart Version & Push Branch') {
            when { expression { env.IMAGE_TAG } }
            steps {
                script {
                    echo "Updating Helm chart version to ${env.IMAGE_TAG}"

                    // Checkout current repo
                    checkout scm

                    def newBranch = "bump/helm-version"

                    sh """
                         git checkout -b ${newBranch}
                    """

                    // Update Chart.yaml version and appVersion
                    def chartFile = readFile("${CHART_PATH}/Chart.yaml")
                    chartFile = chartFile.replaceAll(/(?m)^version: .*/, "version: ${env.IMAGE_TAG}")
                    chartFile = chartFile.replaceAll(/(?m)^appVersion: .*/, "appVersion: ${env.IMAGE_TAG}")
                    writeFile file: "${CHART_PATH}/Chart.yaml", text: chartFile

                    echo "Chart file updated: ${CHART_PATH}/Chart.yaml"
                    echo "Branch created: ${newBranch}"

                    // Commit and push using credentials
                    // Commit, push, and create PR using credentials
                    withCredentials([gitUsernamePassword(credentialsId: 'argus-cicd-pat', gitToolName: 'Default')]) {
                        sh """
                            git config user.name "argus-cicd"
                            git config user.email "cicd@argusintelligence.net"
                            git config pull.rebase true
                            git config pull.ff false
                            git add ${CHART_PATH}/Chart.yaml
                            git commit -m "chore: bump Helm chart version to ${env.IMAGE_TAG}"
                            echo "Pulling main branch..."
                            git pull origin main --rebase
                            echo "Pushing branch ${newBranch}..."
                            git push "https://${GIT_USERNAME}:${GIT_PASSWORD}@${scm.userRemoteConfigs[0].url.split('//')[1]}" HEAD:${newBranch}
                        """
                    }

                    echo "Commit created: ${env.IMAGE_TAG}"
                    echo "Branch pushed: ${newBranch}"

                    echo "Creating PR using GitHub plugin..."
                    
                    echo "Creating Pull Request..."
                    withCredentials([gitUsernamePassword(credentialsId: 'argus-cicd-pat', gitToolName: 'Default')]) {
                        sh """#!/bin/sh
                        curl -X POST \
                        -H "Authorization: token $GIT_PASSWORD" \
                        -H "Content-Type: application/json" \
                        -d '{
                            "title": "Helm Chart: v${IMAGE_TAG}",
                            "head": "${newBranch}",
                            "base": "main",
                            "body": "Automated PR created by Jenkins for Helm Chart version bump to ${env.IMAGE_TAG}"
                        }' \
                        https://api.github.com/repos/void-kernel/app-ui/pulls
                        """

                    }
                    echo "PR created: ${newBranch}"
                }
            }
        }


        stage('Tag Release') {
        when {
            anyOf { branch 'main'; branch 'master' }
        }
        steps {
            script {
            // Re-checkout with full history + tags
            checkout([
                $class: 'GitSCM',
                branches: scm.branches,
                doGenerateSubmoduleConfigurations: false,
                extensions: [
                    [$class: 'CloneOption', noTags: false, shallow: false, depth: 0, reference: ''],
                    [$class: 'CheckoutOption', timeout: 15]
                ],
                submoduleCfg: [],
                userRemoteConfigs: scm.userRemoteConfigs
            ])

            // Get highest semantic version from Git tags using GitHub Changelog plugin
            def highestVersion = getHighestSemanticVersion()
            echo "Highest version: ${highestVersion.toString()}"
            echo " Major: ${highestVersion.getMajor()}"
            echo " Minor: ${highestVersion.getMinor()}"
            echo " Patch: ${highestVersion.getPatch()}"
            echo " Git tag: ${highestVersion.findTag().orElse('')}"

            // Calculate next version based on branch
            def baseBranch = env.CHANGE_TARGET ?: 'main'
            def versionInfo = determineSemanticVersionFromBaseBranch(baseBranch, highestVersion)
            def finalVersion = versionInfo.version

            echo "Creating and pushing Git tag: v${finalVersion}"

            // Configure Git and create the tag
            sh """
                git config user.email "cicd@argusintelligence.net"
                git config user.name "argus-cicd"
                git tag -a v${finalVersion} -m "Release version ${finalVersion}"
            """

            // Push the new tag
            gitPush(
                gitScm: scm,
                targetBranch: env.BRANCH_NAME,
                targetRepo: 'origin'
            )
        }
    }
}

    }
}