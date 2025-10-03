pipeline {
    agent none
    stages {
        stage('app-ui') {
            agent {
                docker { image 'node:22.20.0-alpine3.22' }
            }
            steps {
                sh 'node --version'
            }
        }
    }
}