export const formatValidationErrors = errors => {
  if (!errors || errors.issues) {
    return 'validation failed';
  }
  if (Array.isArray(errors.issues)) {
    return errors.issues.map(error => {
      const { path, message } = error;
      return `${path.join('.')} - ${message}`;
    });
  }
  return JSON.stringify(errors);
};
