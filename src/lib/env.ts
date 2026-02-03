export const isDesktop = typeof window !== 'undefined' && !!(window as any).electron;

export const getApiUrl = (path: string) => {
    if (isDesktop) {
        // In desktop, we might want to call logic directly or use a specific local path
        return path;
    }
    return path;
};
