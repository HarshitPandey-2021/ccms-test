// src/components/FeedbackModal.jsx
import React, { useState } from "react";
import {
  RiStarLine,
  RiStarFill,
  RiCloseLine,
  RiEmotionHappyLine,
  RiEmotionNormalLine,
  RiEmotionUnhappyLine,
  RiSendPlaneFill,
  RiCheckboxCircleFill,
  RiSparklingLine,
} from "react-icons/ri";

const FeedbackModal = ({ isOpen, onClose, complaint, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState(null);

  const emojis = [
    { id: 1, icon: RiEmotionUnhappyLine, label: "Poor", color: "text-red-500", bg: "bg-red-100 dark:bg-red-900/30" },
    { id: 2, icon: RiEmotionNormalLine, label: "Okay", color: "text-yellow-500", bg: "bg-yellow-100 dark:bg-yellow-900/30" },
    { id: 3, icon: RiEmotionHappyLine, label: "Great", color: "text-green-500", bg: "bg-green-100 dark:bg-green-900/30" },
  ];

  const quickFeedbacks = [
    "Quick resolution! 👍",
    "Very helpful staff",
    "Good communication",
    "Could be faster",
    "Excellent service! ⭐",
  ];

  const handleSubmit = async () => {
    if (rating === 0) return;

    setIsSubmitting(true);

    try {
      await onSubmit({
        complaintId: complaint._id,
        rating,
        satisfaction: selectedEmoji,
        feedback: feedback.trim(),
      });

      setIsSubmitted(true);

      // Auto close after success
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error) {
      console.error("Feedback error:", error);
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    // Reset after animation
    setTimeout(() => {
      setRating(0);
      setHoveredRating(0);
      setFeedback("");
      setSelectedEmoji(null);
      setIsSubmitted(false);
      setIsSubmitting(false);
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* ✅ Success State */}
        {isSubmitted ? (
          <div className="p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <RiCheckboxCircleFill className="w-12 h-12 text-green-500 animate-bounce" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
              Thank You! 🎉
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Your feedback helps us improve!
            </p>
            <div className="mt-4 flex justify-center gap-1">
              {[...Array(rating)].map((_, i) => (
                <RiStarFill 
                  key={i} 
                  className="w-6 h-6 text-yellow-400 animate-pulse" 
                  style={{ animationDelay: `${i * 100}ms` }} 
                />
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5">
              <button
                onClick={handleClose}
                className="absolute right-4 top-4 p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
              >
                <RiCloseLine className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <RiSparklingLine className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Rate Your Experience</h2>
                  <p className="text-white/80 text-sm">{complaint?.complaintId}</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              
              {/* ⭐ Star Rating */}
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  How was the resolution?
                </p>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="p-1 transition-all duration-150 hover:scale-125 active:scale-110"
                    >
                      {star <= (hoveredRating || rating) ? (
                        <RiStarFill className="w-10 h-10 text-yellow-400 drop-shadow-lg" />
                      ) : (
                        <RiStarLine className="w-10 h-10 text-gray-300 dark:text-gray-600" />
                      )}
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <p className="mt-2 text-sm font-medium text-indigo-600 dark:text-indigo-400">
                    {rating === 1 && "Poor 😕"}
                    {rating === 2 && "Fair 🙁"}
                    {rating === 3 && "Good 🙂"}
                    {rating === 4 && "Very Good 😊"}
                    {rating === 5 && "Excellent! 🤩"}
                  </p>
                )}
              </div>

              {/* 😊 Emoji Satisfaction */}
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Overall satisfaction
                </p>
                <div className="flex justify-center gap-4">
                  {emojis.map((emoji) => (
                    <button
                      key={emoji.id}
                      onClick={() => setSelectedEmoji(emoji.id)}
                      className={`p-4 rounded-xl transition-all duration-200 ${
                        selectedEmoji === emoji.id
                          ? `${emoji.bg} ring-2 ring-offset-2 ring-indigo-500 dark:ring-offset-gray-800 scale-110`
                          : "bg-gray-100 dark:bg-gray-700 hover:scale-105"
                      }`}
                    >
                      <emoji.icon 
                        className={`w-8 h-8 ${
                          selectedEmoji === emoji.id ? emoji.color : "text-gray-400"
                        }`} 
                      />
                      <p className={`text-xs mt-1 font-medium ${
                        selectedEmoji === emoji.id ? emoji.color : "text-gray-500"
                      }`}>
                        {emoji.label}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* 💬 Quick Feedback Chips */}
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Quick feedback (optional)
                </p>
                <div className="flex flex-wrap gap-2">
                  {quickFeedbacks.map((qf) => (
                    <button
                      key={qf}
                      onClick={() => setFeedback(feedback === qf ? "" : qf)}
                      className={`px-3 py-1.5 text-sm rounded-full transition-all ${
                        feedback === qf
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                      }`}
                    >
                      {qf}
                    </button>
                  ))}
                </div>
              </div>

              {/* 📝 Custom Feedback */}
              <div>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Share more details (optional)..."
                  rows={3}
                  maxLength={500}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-200 resize-none transition-all text-sm"
                />
                <p className="text-xs text-gray-500 text-right mt-1">
                  {feedback.length}/500
                </p>
              </div>
            </div>

            {/* Footer - Submit Button */}
            <div className="px-6 pb-6">
              <button
                onClick={handleSubmit}
                disabled={rating === 0 || isSubmitting}
                className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-white transition-all duration-200 ${
                  rating === 0
                    ? "bg-gray-300 dark:bg-gray-600 cursor-not-allowed"
                    : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl active:scale-[0.98]"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <RiSendPlaneFill className="w-5 h-5" />
                    Submit Feedback
                  </>
                )}
              </button>
              
              {rating === 0 && (
                <p className="text-center text-xs text-gray-500 mt-2">
                  Please select a star rating to continue
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FeedbackModal;