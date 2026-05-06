
const iam_login_url = `https://qa.brokeridp.kernelmind.ai/realms/broker-idp/protocol/openid-connect/auth?client_id=argus-auth&redirect_uri=http%3A%2F%2Flocalhost%3A20000%2Fauth%2Fcallback&response_type=code&scope=openid%20organization%20app_permissions&state=random-uuid-string`;

const iam_logout_url = (idToken: String) => `https://qa.brokeridp.kernelmind.ai/realms/broker-idp/protocol/openid-connect/logout?id_token_hint=${idToken}&post_logout_redirect_uri=http%3A%2F%2Flocalhost%3A20000%2Flogin`;

export { iam_login_url, iam_logout_url };
