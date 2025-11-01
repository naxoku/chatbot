import { FileText, File, Image, Video, Music } from "lucide-react";

export const getDocumentIcon = (url: string) => {
  const extension = url.split(".").pop()?.toLowerCase();

  switch (extension) {
    case "pdf":
      return <FileText className="h-5 w-5 text-red-600" />;
    case "doc":
    case "docx":
      return <FileText className="h-5 w-5 text-blue-600" />;
    case "xls":
    case "xlsx":
      return <FileText className="h-5 w-5 text-green-600" />;
    case "ppt":
    case "pptx":
      return <FileText className="h-5 w-5 text-orange-600" />;
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
      return <Image className="h-5 w-5 text-purple-600" />;
    case "mp4":
    case "avi":
    case "mov":
      return <Video className="h-5 w-5 text-pink-600" />;
    case "mp3":
    case "wav":
      return <Music className="h-5 w-5 text-indigo-600" />;
    default:
      return <File className="h-5 w-5 text-gray-600" />;
  }
};

export const getDocumentColor = (type: string): string => {
  switch (type.toLowerCase()) {
    case "pdf":
      return "bg-red-100 dark:bg-red-900/20";
    case "word":
    case "doc":
    case "docx":
      return "bg-blue-100 dark:bg-blue-900/20";
    case "excel":
    case "xls":
    case "xlsx":
      return "bg-green-100 dark:bg-green-900/20";
    case "powerpoint":
    case "ppt":
    case "pptx":
      return "bg-orange-100 dark:bg-orange-900/20";
    case "image":
    case "jpg":
    case "png":
      return "bg-purple-100 dark:bg-purple-900/20";
    case "video":
      return "bg-pink-100 dark:bg-pink-900/20";
    case "audio":
      return "bg-indigo-100 dark:bg-indigo-900/20";
    default:
      return "bg-gray-100 dark:bg-gray-800";
  }
};
