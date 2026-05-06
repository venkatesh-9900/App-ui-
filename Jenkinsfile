// ===============================
// Jenkinsfile (Kaniko Version - No DinD)
// ===============================

def APP_NAME = "app-ui" //TODO: Replace in line https://api.github.com/repos/void-kernel/app-ui/pulls too. Currently it does not work after replacing

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
        ECR_REPO       = "docker/${APP_NAME}"
        ECR_BASE_URL   = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
        CHART_PATH     = "helm" //chart path in the github repo
        CHART_NAME     = "${APP_NAME}"
    }
    
    stages {

        stage('Cleanup Workspace') {
            steps {
                cleanWs()
                echo "Cleaned Up Workspace For Project"
                script {
                    if (env.CHANGE_BRANCH?.startsWith("bump/helm")) {
                        echo "Skipping build for automated Helm bump branch: ${env.CHANGE_BRANCH}"
                        currentBuild.result = 'SUCCESS'
                        error("Skipping rest of pipeline for automated bump branch.")
                    }
                }
            }
        }

        // -----------------------------------------
        // STAGE 1: Build & Push Docker Image to ECR
        // -----------------------------------------
        stage('Build & Push Docker Image to ECR') {
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
                        env.IS_MASTER = branchInfo.isMaster
                        def imageTag
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
                        echo "Highest version: " + highestVersion.toString() //eg: 1.0.0

                        if (branchInfo.isMaster) {
                            // Ensure tags are present                    
                            def baseBranch = env.CHANGE_TARGET ?: 'main'
                            def targetBranch = env.CHANGE_BRANCH
                            def versionInfo = determineSemanticVersionFromBaseBranch(baseBranch, highestVersion)
                            imageTag = versionInfo.version
                            echo "Image tag: " + imageTag
                            env.IMAGE_TAG = imageTag
                        } else {
                            def highestVersionString = highestVersion.toString()

                            // Sanitize branch name: replace invalid chars, collapse multiple hyphens, and trim
                            def cleanBranchName = branchInfo.branchName
                                .replaceAll('[^a-zA-Z0-9.-]', '-')   // replace everything except letters, numbers, dot, hyphen
                                .replaceAll('-+', '-')               // collapse multiple hyphens
                                .replaceAll('^-|-$', '')             // remove leading/trailing hyphen
                                .toLowerCase()

                            def maxBranchPartLength = 40
                            def truncatedBranch = cleanBranchName.take(maxBranchPartLength) 
                            // Construct Helm-safe image tag
                            def rawImageTag = "${highestVersionString}-${truncatedBranch}-${shortCommit}"

                            // Enforce Helm/Kubernetes label character rules and limit length
                            imageTag = rawImageTag
                                .replaceAll('[^a-z0-9.-]', '-')      // strictly conform to Helm allowed chars
                                .replaceAll('-+', '-')               // collapse consecutive dashes
                                .replaceAll('^-|-$', '')             // trim leading/trailing hyphen
                                .take(63)                            // ensure <= 63 characters (safe for K8s labels)

                            // Ensure it doesn’t end with a hyphen or dot after truncation
                            imageTag = imageTag.replaceAll('[-.]+$', '')

                            echo "✅ Helm-safe Image tag: ${imageTag}"
                            env.IMAGE_TAG = imageTag
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
            post {  
                success {
                    githubNotify(
                        account: 'void-kernel',
                        repo:"${APP_NAME}",
                        sha: "${env.GIT_COMMIT}",
                        credentialsId: 'argus-cicd-pat',
                        context: 'Build',
                        status: 'SUCCESS',
                        description: 'Build successful and pushed to ECR'
                    )
                }
                failure {
                    githubNotify(
                        account: 'void-kernel',
                        repo: "${APP_NAME}",
                        sha: "${env.GIT_COMMIT}",
                        credentialsId: 'argus-cicd-pat',
                        context: 'Build',
                        status: 'FAILURE',
                        description: 'Build failed'
                    )
                }
            }
        }

        // -----------------------------------------
        // STAGE 2: Update Helm Chart + Push via Git Plugin
        // -----------------------------------------
        stage('[NON-MAIN] Update Repo Helm Chart Version & Push Branch to git repository') {
            when {
                not { anyOf { branch 'main'; branch 'master' } }
            }
            steps {
                script {
                    // ✅ Always start clean from main
                    checkout([
                        $class: 'GitSCM',
                        branches: [[name: '*/main']],
                        doGenerateSubmoduleConfigurations: false,
                        extensions: [
                            [$class: 'WipeWorkspace'],
                            [$class: 'CleanCheckout']
                        ],
                        userRemoteConfigs: scm.userRemoteConfigs
                    ])
                    
                    def newBranch = "bump/helm-version-dev"

                    // Setup git and fetch all branches
                    withCredentials([gitUsernamePassword(credentialsId: 'argus-cicd-pat', gitToolName: 'Default')]) {
                        sh """
                            git config user.name "argus-cicd"
                            git config user.email "cicd@kernelmind.ai"
                            git config pull.rebase true
                            git config pull.ff false
                            echo "Fetching all branches..."
                            git fetch origin
                            
                            # Check if remote branch exists
                            if git ls-remote --exit-code --heads origin ${newBranch}; then
                                echo "Remote branch ${newBranch} exists, checking it out..."
                                git checkout -B ${newBranch} origin/${newBranch}
                            else
                                echo "Remote branch ${newBranch} does not exist, creating new branch..."
                                git checkout -b ${newBranch}
                            fi
                            
                            echo "Pulling latest changes from main..."
                            git pull origin main
                            echo "Pulled main branch"
                        """
                    }

                    // Update Chart.yaml version and appVersion before packaging
                    def chartFile = readYaml file: "${CHART_PATH}/Chart.yaml" 
                    chartFile.appVersion = env.IMAGE_TAG
                    writeYaml file: "${CHART_PATH}/Chart.yaml", data: chartFile, overwrite: true
                    echo "Updated ${CHART_PATH}/Chart.yaml with version ${env.IMAGE_TAG}"

                    //Update Values.yaml image.tag with env.IMAGE_TAG
                    def values = readYaml file: "${CHART_PATH}/values-dev.yaml"
                    values.image.repository = "${ECR_BASE_URL}/${ECR_REPO}"
                    values.image.tag = env.IMAGE_TAG
                    values.timestamp = (System.currentTimeMillis() / 1000)
                    // Write back
                    writeYaml file: "${CHART_PATH}/values-dev.yaml", data: values, overwrite: true
                    echo "Updated ${CHART_PATH}/values-dev.yaml with tag ${env.IMAGE_TAG}"
                    
                    //cat values.yaml and chart.yaml
                    sh """
                        cat ${CHART_PATH}/values-dev.yaml
                        cat ${CHART_PATH}/Chart.yaml
                    """

                    echo "Chart file updated: ${CHART_PATH}/Chart.yaml"
                    echo "Branch created: ${newBranch}"

                    // Commit and push using credentials
                    // Commit, push, and create PR using credentials
                    withCredentials([gitUsernamePassword(credentialsId: 'argus-cicd-pat', gitToolName: 'Default')]) {
                        sh """
                            git config user.name "argus-cicd"
                            git config user.email "cicd@kernelmind.ai"
                            git add ${CHART_PATH}/values-dev.yaml ${CHART_PATH}/Chart.yaml
                            if ! git diff --cached --quiet; then
                                git commit -m "chore: bump Helm chart version to ${env.IMAGE_TAG}"
                                echo "Pushing branch ${newBranch}..."
                            else
                                echo "No changes to commit"
                            fi
                            git push --force "https://${GIT_USERNAME}:${GIT_PASSWORD}@${scm.userRemoteConfigs[0].url.split('//')[1]}" HEAD:${newBranch}
                        """
                    }

                    echo "Commit created: ${env.IMAGE_TAG}"
                    echo "Branch pushed: ${newBranch}"

                    echo "Creating PR using GitHub plugin..."
                    
                    echo "Creating Pull Request..."
                    withCredentials([gitUsernamePassword(credentialsId: 'argus-cicd-pat', gitToolName: 'Default')]) {
                        def payload = """
                        {
                            "title": "[DEV]: Helm Chart: Version Upgrade",
                            "head": "${newBranch}",
                            "base": "main",
                            "body": "Automated PR created by Jenkins for Helm Chart version bump. Check commit logs for details."
                        }
                        """.stripIndent()

                        writeFile file: 'payload.json', text: payload

                        sh '''
                        curl -s -o /dev/null -w "%{http_code}" -X POST \
                        -H "Authorization: token ${GIT_PASSWORD}" \
                        -H "Content-Type: application/json" \
                        -d @payload.json \
                        https://api.github.com/repos/void-kernel/app-ui/pulls
                        '''

                    }
                    echo "PR created: ${newBranch}"
                }
            }
            post {
                success {
                    githubNotify(
                        account: 'void-kernel',
                        repo: "${APP_NAME}",
                        sha: "${env.GIT_COMMIT}",
                        credentialsId: 'argus-cicd-pat',
                        context: 'Helm Chart',
                        status: 'SUCCESS',
                        description: 'Helm Chart version bumped & pushed to git repository'
                    )
                }
                failure {
                    githubNotify(
                        account: 'void-kernel',
                        repo: "${APP_NAME}",
                        sha: "${env.GIT_COMMIT}",
                        credentialsId: 'argus-cicd-pat',
                        context: 'Helm Chart',
                        status: 'FAILURE',
                        description: 'Helm Chart version bump failed & pushed to git repository'
                    )
                }
            }
        }

        stage('[MAIN] Update Repo Helm Chart Version & Push Branch to git repository') {
            when {
                anyOf { branch 'main'; branch 'master' }
            }
            steps {
                script {
                    // ✅ Always start clean from main
                    checkout([
                        $class: 'GitSCM',
                        branches: [[name: '*/main']],
                        doGenerateSubmoduleConfigurations: false,
                        extensions: [
                            [$class: 'WipeWorkspace'],
                            [$class: 'CleanCheckout']
                        ],
                        userRemoteConfigs: scm.userRemoteConfigs
                    ])
                    
                    def newBranch = "bump/helm-version-qa"

                    // Setup git and fetch all branches
                    withCredentials([gitUsernamePassword(credentialsId: 'argus-cicd-pat', gitToolName: 'Default')]) {
                        sh """
                            git config user.name "argus-cicd"
                            git config user.email "cicd@kernelmind.ai"
                            git config pull.rebase true
                            git config pull.ff false
                            echo "Fetching all branches..."
                            git fetch origin
                            
                            # Check if remote branch exists
                            if git ls-remote --exit-code --heads origin ${newBranch}; then
                                echo "Remote branch ${newBranch} exists, checking it out..."
                                git checkout -B ${newBranch} origin/${newBranch}
                            else
                                echo "Remote branch ${newBranch} does not exist, creating new branch..."
                                git checkout -b ${newBranch}
                            fi
                            
                            echo "Pulling latest changes from main..."
                            git pull origin main
                            echo "Pulled main branch"
                        """
                    }

                    // Update Chart.yaml version and appVersion before packaging
                    def chartFile = readYaml file: "${CHART_PATH}/Chart.yaml" 
                    chartFile.appVersion = env.IMAGE_TAG
                    writeYaml file: "${CHART_PATH}/Chart.yaml", data: chartFile, overwrite: true
                    echo "Updated ${CHART_PATH}/Chart.yaml with version ${env.IMAGE_TAG}"

                    //Update Values.yaml image.tag with env.IMAGE_TAG
                    def values = readYaml file: "${CHART_PATH}/values-qa.yaml"
                    values.image.repository = "${ECR_BASE_URL}/${ECR_REPO}"
                    values.image.tag = env.IMAGE_TAG
                    values.timestamp = (System.currentTimeMillis() / 1000)
                    // Write back
                    writeYaml file: "${CHART_PATH}/values-qa.yaml", data: values, overwrite: true
                    echo "Updated ${CHART_PATH}/values-qa.yaml with tag ${env.IMAGE_TAG}"
                    
                    //cat values.yaml and chart.yaml
                    sh """
                        cat ${CHART_PATH}/values-qa.yaml
                        cat ${CHART_PATH}/Chart.yaml
                    """

                    echo "Chart file updated: ${CHART_PATH}/Chart.yaml"
                    echo "Branch created: ${newBranch}"

                    // Commit and push using credentials
                    // Commit, push, and create PR using credentials
                    withCredentials([gitUsernamePassword(credentialsId: 'argus-cicd-pat', gitToolName: 'Default')]) {
                        sh """
                            git config user.name "argus-cicd"
                            git config user.email "cicd@kernelmind.ai"
                            git add ${CHART_PATH}/values-qa.yaml ${CHART_PATH}/Chart.yaml
                            if ! git diff --cached --quiet; then
                                git commit -m "chore: bump Helm chart version to ${env.IMAGE_TAG}"
                                echo "Pushing branch ${newBranch}..."
                                git push --force "https://${GIT_USERNAME}:${GIT_PASSWORD}@${scm.userRemoteConfigs[0].url.split('//')[1]}" HEAD:${newBranch}
                            else
                                echo "No changes to commit"
                            fi
                        """
                    }

                    echo "Commit created: ${env.IMAGE_TAG}"
                    echo "Branch pushed: ${newBranch}"

                    echo "Creating PR using GitHub plugin..."
                    
                    echo "Creating Pull Request..."
                    withCredentials([gitUsernamePassword(credentialsId: 'argus-cicd-pat', gitToolName: 'Default')]) {
                        def payload = """
                        {
                            "title": "[QA]: Helm Chart: Version Upgrade",
                            "head": "${newBranch}",
                            "base": "main",
                            "body": "Automated PR created by Jenkins for Helm Chart version bump. Check commit logs for details."
                        }
                        """.stripIndent()

                        writeFile file: 'payload.json', text: payload

                        sh '''
                        curl -s -o /dev/null -w "%{http_code}" -X POST \
                        -H "Authorization: token ${GIT_PASSWORD}" \
                        -H "Content-Type: application/json" \
                        -d @payload.json \
                        https://api.github.com/repos/void-kernel/app-ui/pulls
                        '''

                    }
                    echo "PR created: ${newBranch}"
                }
            }
            post {
                success {
                    githubNotify(
                        account: 'void-kernel',
                        repo: "${APP_NAME}",
                        sha: "${env.GIT_COMMIT}",
                        credentialsId: 'argus-cicd-pat',
                        context: 'Helm Chart',
                        status: 'SUCCESS',
                        description: 'Helm Chart version bumped & pushed to git repository'
                    )
                }
                failure {
                    githubNotify(
                        account: 'void-kernel',
                        repo: "${APP_NAME}",
                        sha: "${env.GIT_COMMIT}",
                        credentialsId: 'argus-cicd-pat',
                        context: 'Helm Chart',
                        status: 'FAILURE',
                        description: 'Helm Chart version bump failed & pushed to git repository'
                    )
                }
            }
        }

        // -----------------------------------------
        // STAGE 3: Tag Release to git repository
        // -----------------------------------------
        stage('[MAIN] Tag Release to git repository') {
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
                        git config user.email "cicd@kernelmind.ai"
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
            post {
                success {
                    githubNotify(
                        account: 'void-kernel',
                        repo: "${APP_NAME}",
                        sha: "${env.GIT_COMMIT}",
                        credentialsId: 'argus-cicd-pat',
                        context: 'Git Tag Release',
                        status: 'SUCCESS',
                        description: 'Git tag release successful'
                    )
                }
                failure {
                    githubNotify(
                        account: 'void-kernel',
                        repo: "${APP_NAME}",
                        sha: "${env.GIT_COMMIT}",
                        credentialsId: 'argus-cicd-pat',
                        context: 'Git Tag Release',
                        status: 'FAILURE',
                        description: 'Git tag release failed'
                    )
                }
            }
        }

    }
}