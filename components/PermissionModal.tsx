"use client";

import { Camera, Mic, X } from "lucide-react";

interface PermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRetry: () => void;
  errorType: "permission" | "device" | "unknown";
}

export default function PermissionModal({
  isOpen,
  onClose,
  onRetry,
  errorType,
}: PermissionModalProps) {
  if (!isOpen) return null;

  const getContent = () => {
    switch (errorType) {
      case "permission":
        return {
          title: "Camera ও Mic Permission প্রয়োজন",
          description:
            "Video call করতে আপনার camera এবং microphone access দিতে হবে।",
          steps: [
            "Browser এর address bar এ lock/camera icon এ ক্লিক করুন",
            "Camera এবং Microphone permission 'Allow' করুন",
            "Page reload করুন অথবা 'আবার চেষ্টা করুন' বাটনে ক্লিক করুন",
          ],
        };
      case "device":
        return {
          title: "Camera বা Mic খুঁজে পাওয়া যায়নি",
          description:
            "আপনার device এ camera বা microphone সংযুক্ত নেই বা অন্য app ব্যবহার করছে।",
          steps: [
            "নিশ্চিত করুন camera/mic সঠিকভাবে সংযুক্ত আছে",
            "অন্য কোনো app (Zoom, Teams, etc.) camera/mic ব্যবহার করছে কিনা চেক করুন",
            "Device settings থেকে camera/mic enable করুন",
          ],
        };
      default:
        return {
          title: "কিছু সমস্যা হয়েছে",
          description: "Camera বা Mic access করতে সমস্যা হচ্ছে।",
          steps: [
            "Browser permission চেক করুন",
            "Device settings চেক করুন",
            "Page reload করে আবার চেষ্টা করুন",
          ],
        };
    }
  };

  const content = getContent();

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl max-w-md w-full p-6 relative shadow-2xl border border-gray-800">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        {/* Icon */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
            <Camera className="text-red-400" size={24} />
          </div>
          <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
            <Mic className="text-red-400" size={24} />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-lg md:text-xl font-semibold text-white text-center mb-2">
          {content.title}
        </h2>

        {/* Description */}
        <p className="text-gray-400 text-sm text-center mb-4">{content.description}</p>

        {/* Steps */}
        <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
          <p className="text-sm md:text-base font-bold text-gray-300 mb-3">
            কিভাবে ঠিক করবেন:
          </p>
          <ol className="space-y-2">
            {content.steps.map((step, index) => (
              <li key={index} className="text-xs md:text-sm text-gray-400 flex gap-2">
                <span className="text-blue-400 font-medium">{index + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Actions */}
        <div className="flex gap-3 text-sm md:text-base">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            বাতিল করুন
          </button>
          <button
            onClick={onRetry}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            আবার চেষ্টা করুন
          </button>
        </div>
      </div>
    </div>
  );
}
