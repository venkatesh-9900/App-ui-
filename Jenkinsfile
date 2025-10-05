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
        ECR_HELM_REPO  = "helm" //not helm/app-ui because Helm appends the chart name to that repository path when pushing, so it attempts to push to the registry path helm/app-ui/
        PARENT_HELM_REPO = "https://github.com/void-kernel/application-helm.git"
        ECR_BASE_URL   = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
        CHART_PATH     = "helm" //chart path in the github repo
        CHART_NAME     = "app-ui"
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
                    println " Major: " + highestVersion.getMajor()
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
    
                stage('Package & Push Helm Chart to ECR') {
            when { expression { env.IMAGE_TAG } }
            agent {
                kubernetes {
                    yaml """
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: helm
    image: alpine/helm:3.9.0
    command:
      - cat
    tty: true
"""
                }
            }
            steps {
                container('helm') {
                    script {

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

                        def highestVersion = getHighestSemanticVersion()
                        println "Highest version: " + highestVersion.toString()
                        def chartVersion = "${highestVersion.getMajor()}.${highestVersion.getMinor()}.${highestVersion.getPatch()}-${env.IMAGE_TAG}"
                        // Install AWS CLI
                        sh 'apk add --no-cache aws-cli'

                        // Update Chart.yaml version and appVersion before packaging
                        def chartFile = readFile("${CHART_PATH}/Chart.yaml")
                        chartFile = chartFile.replaceAll(/(?m)^version: .*/, "version: ${chartVersion}")
                        chartFile = chartFile.replaceAll(/(?m)^appVersion: .*/, "appVersion: ${env.IMAGE_TAG}")
                        writeFile file: "${CHART_PATH}/Chart.yaml", text: chartFile
                        echo "Updated ${CHART_PATH}/Chart.yaml with version ${chartVersion}"

                        //Update Values.yaml image.tag with env.IMAGE_TAG
                        def valuesFile = readFile("${CHART_PATH}/values.yaml")
                        valuesFile = valuesFile.replaceAll(/(?m)^tag: .*/, "tag: ${env.IMAGE_TAG}")
                        writeFile file: "${CHART_PATH}/values.yaml", text: valuesFile
                        echo "Updated ${CHART_PATH}/values.yaml with tag ${env.IMAGE_TAG}"

                        //Update Values.yaml image.repository with ECR_BASE_URL+ECR_REPO
                        valuesFile = valuesFile.replaceAll(/(?m)^repository: .*/, "repository: ${ECR_BASE_URL}/${ECR_REPO}")
                        writeFile file: "${CHART_PATH}/values.yaml", text: valuesFile
                        echo "Updated ${CHART_PATH}/values.yaml with repository ${ECR_BASE_URL}/${ECR_REPO}"

                        withCredentials([[$class: 'AmazonWebServicesCredentialsBinding', credentialsId: 'argus-cicd-ecr-fullaccess-iam-user']]) {
                            sh """
                                echo "Logging into ECR..."
                                aws ecr get-login-password --region ${AWS_REGION} | helm registry login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com

                                echo "Packaging and pushing Helm chart..."
                                helm package ${CHART_PATH}
                                
                                helm push ${CHART_NAME}-${chartVersion}.tgz oci://${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_HELM_REPO}
                            """
                        }
                    }
                }
            }
        }
    
        // -----------------------------------------
        // STAGE 2: Update Helm Chart + Push via Git Plugin
        // -----------------------------------------
        stage('Update Repo Helm Chart Version & Push Branch') {
            when { expression { env.IMAGE_TAG } }
            steps {
                script {
                    // Checkout current repo
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

                    def newBranch = "bump/helm-version"

                    sh """
                         git checkout -b ${newBranch} origin/${newBranch}
                    """

                    // Pull main branch
                    withCredentials([gitUsernamePassword(credentialsId: 'argus-cicd-pat', gitToolName: 'Default')]) {
                        sh """
                            git config user.name "argus-cicd"
                            git config user.email "cicd@argusintelligence.net"
                            git config pull.rebase true
                            git config pull.ff false
                            echo "Fetching branch ${newBranch}..."
                            git fetch origin ${newBranch}
                        """
                    }

                    def highestVersion = getHighestSemanticVersion()
                    echo "Highest version: " + highestVersion.toString()
                    def chartVersion = "${highestVersion.getMajor()}.${highestVersion.getMinor()}.${highestVersion.getPatch()}-${env.IMAGE_TAG}"
                    echo "Chart version: " + chartVersion

                    // Update Chart.yaml version and appVersion before packaging
                    def chartFile = readFile("${CHART_PATH}/Chart.yaml")
                    chartFile = chartFile.replaceAll(/(?m)^version: .*/, "version: ${chartVersion}")
                    chartFile = chartFile.replaceAll(/(?m)^appVersion: .*/, "appVersion: ${env.IMAGE_TAG}")
                    writeFile file: "${CHART_PATH}/Chart.yaml", text: chartFile
                    echo "Updated ${CHART_PATH}/Chart.yaml with version ${chartVersion}"

                    //Update Values.yaml image.tag with env.IMAGE_TAG
                    def valuesFile = readFile("${CHART_PATH}/values.yaml")
                    valuesFile = valuesFile.replaceAll(/(?m)^tag: .*/, "tag: ${env.IMAGE_TAG}")
                    writeFile file: "${CHART_PATH}/values.yaml", text: valuesFile
                    echo "Updated ${CHART_PATH}/values.yaml with tag ${env.IMAGE_TAG}"

                    //Update Values.yaml image.repository with ECR_BASE_URL+ECR_REPO
                    valuesFile = valuesFile.replaceAll(/(?m)^repository: .*/, "repository: ${ECR_BASE_URL}/${ECR_REPO}")
                    writeFile file: "${CHART_PATH}/values.yaml", text: valuesFile
                    echo "Updated ${CHART_PATH}/values.yaml with repository ${ECR_BASE_URL}/${ECR_REPO}"


                    echo "Chart file updated: ${CHART_PATH}/Chart.yaml"
                    echo "Branch created: ${newBranch}"

                    // Commit and push using credentials
                    // Commit, push, and create PR using credentials
                    withCredentials([gitUsernamePassword(credentialsId: 'argus-cicd-pat', gitToolName: 'Default')]) {
                        sh """
                            git config user.name "argus-cicd"
                            git config user.email "cicd@argusintelligence.net"
                            git add ${CHART_PATH}/Chart.yaml ${CHART_PATH}/values.yaml
                            git commit -m "chore: bump Helm chart version to ${chartVersion}"
                            echo "Pushing branch ${newBranch}..."
                            git push "https://${GIT_USERNAME}:${GIT_PASSWORD}@${scm.userRemoteConfigs[0].url.split('//')[1]}" HEAD:${newBranch}
                        """
                    }

                    echo "Commit created: ${chartVersion}"
                    echo "Branch pushed: ${newBranch}"

                    echo "Creating PR using GitHub plugin..."
                    
                    echo "Creating Pull Request..."
                    withCredentials([gitUsernamePassword(credentialsId: 'argus-cicd-pat', gitToolName: 'Default')]) {
                        sh """#!/bin/sh
                        curl -s -o /dev/null -w "%{http_code}" -X POST \
                        -H "Authorization: token $GIT_PASSWORD" \
                        -H "Content-Type: application/json" \
                        -d '{
                            "title": "Helm Chart: v${chartVersion}",
                            "head": "${newBranch}",
                            "base": "main",
                            "body": "Automated PR created by Jenkins for Helm Chart version bump to ${chartVersion}"
                        }' \
                        https://api.github.com/repos/void-kernel/app-ui/pulls
                        """

                    }
                    echo "PR created: ${newBranch}"
                }
            }
        }

        // stage('Update Parent Helm Chart Version') {
        //     when {
        //         anyOf { branch 'main'; branch 'master' }
        //     }
        //     steps {
        //         script {
                    
        //             //if current branch is master or main, then stage 3 will create a pr to update the helm version in parent heml chart prod-values file repo [application-helm] in bump/helm-version branch
        //             echo "Updating Parent Helm Chart Version"
                                
        //         }
        //     }
        //     // To add an else condition to the 'when' block, you can use 'not' to specify the opposite branches.
        //     // For example, to run the stage when NOT on 'main' or 'master', use:
        //     when {
        //         not {
        //             anyOf { branch 'main'; branch 'master' }
        //         }
        //         //will directly update the helm version in parent heml chart repo qa-values file [application-helm] in main branch
        //     }
        //     steps {
        //         script {
        //             echo "Updating Parent Helm Chart Version"

        //         }
        //     }
        // }

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