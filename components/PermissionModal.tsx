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
          title: "Camera and Microphone Permission Required",
          description:
            "You need to grant camera and microphone access to make video calls.",
          steps: [
            "Click the lock/camera icon in the browser address bar",
            "Allow Camera and Microphone permissions",
            "Reload the page or click the Retry button",
          ],
        };
      case "device":
        return {
          title: "Camera or Microphone Not Found",
          description:
            "Your device does not have a camera or microphone connected, or another application is using it.",
          steps: [
            "Check that your camera/microphone is properly connected",
            "Check if another app (Zoom, Teams, etc.) is using the camera/microphone",
            "Enable camera/microphone in device settings",
          ],
        };
      default:
        return {
          title: "Something Went Wrong",
          description: "Unable to access camera or microphone.",
          steps: [
            "Check browser permissions",
            "Check device settings",
            "Reload the page and try again",
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
            How to fix:
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
            Cancel
          </button>
          <button
            onClick={onRetry}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    </div>
  );
}
