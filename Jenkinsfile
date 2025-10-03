pipeline {
    agent none
    stages {
        stage('app-ui') {
            agent {
                kubernetes {
                    yaml """
                        apiVersion: v1
                        kind: Pod
                        spec:
                        containers:
                        - name: node
                            image: node:22.20.0-alpine3.22
                            command:
                            - cat
                            tty: true
                        """
                }
            }
            steps {
                container('node') {
                    sh 'node --version'
                }
            }
        }
    }
}
