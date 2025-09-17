import axios, { AxiosInstance, AxiosRequestConfig, AxiosHeaders, AxiosRequestHeaders  } from 'axios';

interface ExtendedAxios extends AxiosInstance {
    buildHeader: (isStream: boolean) => AxiosRequestConfig['headers'];
}

const axiosAuthServices = axios.create({
    headers: {
        'Content-Type': 'application/json'
    }
}) as ExtendedAxios;

export const axiosKratos = axios.create({
    withCredentials: true, // Sends cookies like ory_kratos_session
    headers: {
        'Content-Type': 'application/json'
    }
}) as ExtendedAxios;

export const axiosAuthUploadServices = axios.create({

});


axiosAuthServices.buildHeader = (isStream: boolean) => ({
    Accept: isStream ? 'text/event-stream' : 'application/json',
    'Content-Type': 'application/json'
});
export default axiosAuthServices;


export function buildHeader(isStream: boolean): AxiosRequestConfig['headers'] {
    const token = localStorage.getItem('access_token');
    return {
        Accept: isStream ? 'text/event-stream' : 'application/json',
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
}

export function buildHeaderJSON(isStream: boolean): any {
    const token = localStorage.getItem('access_token');
    return {
        Accept: isStream ? 'text/event-stream' : 'application/json',
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
}

export function buildFileHeader(): AxiosRequestHeaders {
    const token = localStorage.getItem("access_token");
    const headersMap: Record<string, string> = {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    return new AxiosHeaders(headersMap);
}