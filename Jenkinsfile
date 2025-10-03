// Main Pipeline Dispatcher
// This pipeline determines which specific pipeline to run based on branch type

pipeline {
    agent none
    stages {
        stage('Pipeline Router') {
            steps {
                script {
                    def branchName = env.BRANCH_NAME ?: env.GIT_BRANCH?.replace('origin/', '') ?: 'main'
                    def isMaster = (branchName == 'main' || branchName == 'master')
                    
                    echo "Current branch v4: ${branchName}"
                    echo "Is master branch: ${isMaster}"
                    
                    if (isMaster) {
                        echo "=== ROUTING TO MASTER PIPELINE ==="
                        echo "Running semantic versioning pipeline for master branch"
                        // Load and run the master pipeline
                        load 'Jenkinsfile.master'
                    } else {
                        echo "=== ROUTING TO PR PIPELINE ==="
                        echo "Running PR build pipeline for branch: ${branchName}"
                        // Load and run the PR pipeline
                        load 'Jenkinsfile.pr'
                    }
                }
            }
        }
    }
}
