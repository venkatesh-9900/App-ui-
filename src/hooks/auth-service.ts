import config from "../config/config.ts";

interface logoutRequestParams {
    successTask: (idToken: string) => void;
    failureTask: () => void;
    errorTask: () => void;
}

interface refreshAccessTokenParams {
    failureTask: () => void;
    errorTask: () => void;
}

export const logoutUser = async ({successTask, failureTask, errorTask}: logoutRequestParams) => {
    try {
        const accessToken = localStorage.getItem('access_token');
        if (accessToken) {
            const response = await fetch(config.ENDPOINTS.AUTH.LOGOUT, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                }
            });

            if (!response.ok) {
                throw new Error(`Logout failed with status: ${response.status}`);
            }
            const responseText = await response.text();
            const idToken = JSON.parse(responseText);
            console.log(idToken);
            if (idToken.id_token) {
                successTask(idToken.id_token);
            } else {
                failureTask();
            }
        }
    } catch (err) {
        errorTask();
        console.error('Logout failed:', err);
    }
};

export const refreshAccessToken = async ({failureTask, errorTask}: refreshAccessTokenParams) => {
    try {
        const accessToken = localStorage.getItem('access_token');
        if (accessToken) {
            const response = await fetch(config.ENDPOINTS.AUTH.REFRESH_TOKEN, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                }
            });

            if (!response.ok) {
                throw new Error(`Refresh token failed with status: ${response.status}`);
            }
            const responseText = await response.text();
            const newAccessToken = JSON.parse(responseText);
            console.log(newAccessToken);
            if (newAccessToken.access_token) {
                localStorage.setItem("access_token", newAccessToken.access_token || "");
                localStorage.setItem("isAuthenticated", "true");
            } else {
                failureTask();
            }
        }
    } catch (err) {
        errorTask();
        console.error('Refresh token failed:', err);
    }
}