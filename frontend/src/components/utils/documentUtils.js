export const getDocumentIcon = (url) => {
  const extension = url?.split(".").pop()?.toLowerCase();
  switch (extension) {
    case "pdf":
      return "fas fa-file-pdf";
    case "doc":
    case "docx":
      return "fas fa-file-word";
    case "xls":
    case "xlsx":
      return "fas fa-file-excel";
    case "ppt":
    case "pptx":
      return "fas fa-file-powerpoint";
    case "zip":
    case "rar":
      return "fas fa-file-archive";
    case "png":
    case "jpg":
    case "jpeg":
      return "fas fa-file-image";
    default:
      return "fas fa-file-alt";
  }
};

export const getDocumentColor = (type) => {
  switch (type) {
    case "reglamento":
      return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10";
    case "formulario":
      return "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/10";
    case "instructivo":
      return "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/10";
    default:
      return "text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/10";
  }
};
