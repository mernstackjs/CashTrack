// Utility to extract error messages from API responses
export const getErrorMessage = (error: any): string => {
  // If it's our custom ApiError
  if (error.name === "ApiError") {
    return error.message;
  }

  // If it's a regular Error
  if (error instanceof Error) {
    return error.message;
  }

  // If it's an axios error
  if (error.response) {
    const data = error.response.data;
    if (typeof data === "string") {
      return data;
    }
    if (data?.message) {
      return data.message;
    }
    if (data?.error) {
      return data.error;
    }
  }

  // Fallback
  return "An unexpected error occurred. Please try again later.";
};

export const isNetworkError = (error: any): boolean => {
  return error.message === "Network error. Please check your connection.";
};

export const isAuthError = (error: any): boolean => {
  return error.status === 401;
};

export const isNotFoundError = (error: any): boolean => {
  return error.status === 404;
};

export const isValidationError = (error: any): boolean => {
  return error.status === 400 || error.status === 422;
};
