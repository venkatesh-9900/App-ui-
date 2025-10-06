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

interface fetchLoginURLParams {
    errorTask: () => void;
}

interface fetchLogoutURLParams {
    retry?: boolean;
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

export const fetchLoginURL = async ({errorTask}: fetchLoginURLParams) : Promise<string> => {
    try {
        const response = await fetch(config.ENDPOINTS.AUTH.FETCH_LOGIN_URL, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error(`Fetch login URL failed with status: ${response.status}`);
        }
        const responseJSON = await response.json();
        console.log(responseJSON);
        if (responseJSON.url) {
            return responseJSON.url;
        } else {
            errorTask();
            return "";
        }

    } catch (err) {
        errorTask();
        console.error('Fetch login URL failed with error:', err);
        return "";
    }
}

export const fetchLogoutURL = async ({retry = false, errorTask}: fetchLogoutURLParams) : Promise<string> => {
    try {
        if (retry) {
            console.log("Refreshing access token");
            await refreshAccessToken({
                failureTask: () => {
                    console.log("Failed to refresh token")
                }, 
                errorTask: () => {
                    console.log("Error encountered while refreshing token")
                }
            });
        }
        const access_token = localStorage.getItem('access_token');
        const response = await fetch(config.ENDPOINTS.AUTH.FETCH_LOGOUT_URL, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'Content-Type': 'application/json'
            }
        });
        console.log(response);
        if (response.status == 401) {
            if (retry) {
                console.log("Redirecting to login page");
                const login_url = await fetchLoginURL({
                    errorTask: errorTask
                });
                window.location.replace(login_url);
                return "";
            } else {
                return await fetchLogoutURL({
                    retry: true,
                    errorTask
                });
            }
        } else if (response.status == 200) {
            const response_data = await response.json();
            const { url: url } = response_data;
            if (!url) {
                throw new Error(`Failed to fetch logout URL`); 
            }
            return url;
        } else {
            errorTask();
            console.error("Failed to get file details with status code:", response.status);
            return "";
        }
    } catch (error) {
        errorTask();
        console.error(`Failed to get file details`, error);
        return "";
    }
}