import config from "@/config/config";

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

interface requestOTPParams {
    email: string;
    successTask: () => void;
    errorTask: (error: string) => void;
}

interface loginWithOTPParams {
    email: string;
    otp: string;
    organizationId: string;
    successTask: (accessToken: string) => void;
    errorTask: (error: string) => void;
}

interface loginUserWithOTPParams {
    email: string;
    otp: string;
    organizationId: string;
    successTask: (accessToken: string) => void;
    errorTask: (error: string) => void;
}

interface signupRootParams {
    email: string;
    otp: string;
    successTask: (data: { message: string; organization_id?: string }) => void;
    conflictTask: (data: { message: string; organization_id?: string }) => void;
    errorTask: (error: string) => void;
}

interface retrieveOrgParams {
    email: string;
    otp: string;
    successTask: (message: string) => void;
    errorTask: (error: string) => void;
}

interface fetchLogoutURLParams {
    retry?: boolean;
    errorTask: () => void;
}

export const logoutUser = async ({successTask, failureTask, errorTask}: logoutRequestParams) => {
    try {
        const accessToken = localStorage.getItem('access_token');
        if (accessToken) {
            const response = await fetch(config.ENDPOINTS.AUTH.FETCH_LOGOUT_URL, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                }
            });

            if (!response.ok) {
                throw new Error(`Logout failed with status: ${response.status}`);
            }
            const responseText = await response.text();
            const responseData = JSON.parse(responseText);
            if (responseData.url) {
                successTask(responseData.url);
                window.location.href = responseData.url;
            } else {
                failureTask();
                console.error('Logout failed - no logout URL received');
            }
        }
    } catch (err) {
        errorTask();
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
            if (newAccessToken.access_token) {
                localStorage.setItem("access_token", newAccessToken.access_token || "");
                localStorage.setItem("is_authenticated", "true");
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

export const requestOTP = async ({ email, successTask, errorTask }: requestOTPParams) => {
    try {
        const response = await fetch(config.ENDPOINTS.AUTH.REQUEST_OTP, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
        });

        const responseText = await response.text();
        const responseData = JSON.parse(responseText);

        if (response.ok) {
            successTask();
        } else {
            errorTask(responseData.message || 'Failed to request OTP');
        }
    } catch (error) {
        errorTask('An error occurred while requesting OTP');
    }
};

export const loginWithOTP = async ({ email, otp, organizationId, successTask, errorTask }: loginWithOTPParams) => {
    try {
        const response = await fetch(config.ENDPOINTS.AUTH.ROOT_ACCESS_TOKEN, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                otp,
                organization_id: organizationId,
            }),
        });

        const responseData = await response.json();

        if (response.ok) {
            if (responseData.access_token) {
                successTask(responseData.access_token);
            } else {
                errorTask('No access token received');
            }
        } else {
            errorTask(responseData.message || 'Login failed');
        }
    } catch (error) {
        errorTask('An error occurred during login');
        console.error('Error during OTP login:', error);
    }
};

export const loginUserWithOTP = async ({ email, otp, organizationId, successTask, errorTask }: loginUserWithOTPParams) => {
    try {
        const response = await fetch(config.ENDPOINTS.AUTH.USER_ACCESS_TOKEN, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                otp,
                organization_id: organizationId,
            }),
        });

        const responseData = await response.json();

        if (response.ok) {
            if (responseData.access_token) {
                successTask(responseData.access_token);
            } else {
                errorTask('No access token received');
            }
        } else {
            errorTask(responseData.message || 'Login failed');
        }
    } catch (error) {
        errorTask('An error occurred during login');
        console.error('Error during user OTP login:', error);
    }
};

export const signupRoot = async ({ email, otp, successTask, conflictTask, errorTask }: signupRootParams) => {
    try {
        const response = await fetch(config.ENDPOINTS.AUTH.SIGNUP_ROOT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, otp }),
        });

        const responseData = await response.json();

        if (response.ok || response.status === 201) {
            successTask(responseData);
        } else if (response.status === 409) {
            conflictTask(responseData);
        } else {
            errorTask(responseData.message || 'Signup failed');
        }
    } catch (error) {
        errorTask('An error occurred during signup');
        console.error('Error during root signup:', error);
    }
};

export const retrieveOrg = async ({ email, otp, successTask, errorTask }: retrieveOrgParams) => {
    try {
        const response = await fetch(config.ENDPOINTS.AUTH.RETRIEVE_ORG, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, otp }),
        });

        const responseData = await response.json();

        if (response.ok) {
            successTask(responseData.message || 'Organization ID sent to your email');
        } else {
            errorTask(responseData.message || 'Failed to retrieve organization');
        }
    } catch (error) {
        errorTask('An error occurred while retrieving organization');
        console.error('Error during org retrieval:', error);
    }
};

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
                reauthenticationStep(errorTask);
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
        return "";
    }
}

export const reauthenticationStep = async (errorTask: () => void) => {
    if (typeof window !== 'undefined' && window.location.pathname.includes('/auth/callback')) {
        return;
    }
    if (process.env.NEXT_PUBLIC_MOCK_AUTH === "true") {
        return;
    }
    window.location.href = '/';
}

