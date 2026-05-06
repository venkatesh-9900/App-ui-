export interface BaseServiceParams {
    successTask: (data: any) => void;
    failureTask: () => void;
    errorTask: () => void;
    forbiddenTask?: () => void;
    retry?: boolean;
    page?: number;
    limit?: number;
    search?: string;
}
