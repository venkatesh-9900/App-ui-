
const iam_login_url = `http://35.225.223.235:8080/realms/main/protocol/openid-connect/auth?response_type=code&client_id=xyz-app&redirect_uri=http%3A%2F%2Flocalhost%3A20000%2Fauth%2Fcallback&scope=openid%20organization%20app_permissions&state=random-uuid-string`;

const iam_logout_url = (idToken: String) => `http://35.225.223.235:8080/realms/main/protocol/openid-connect/logout?id_token_hint=${idToken}&post_logout_redirect_uri=http%3A%2F%2Flocalhost%3A20000`;

export { iam_login_url, iam_logout_url };