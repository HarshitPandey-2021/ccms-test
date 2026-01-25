// src/pages/SubmitComplaint.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { CATEGORY_GROUPS, PRIORITIES, SENSITIVE_CATEGORIES,  isSensitiveCategory  } from '../utils/constants';
import api from '../api';
import {
  RiSendPlaneFill,
  RiArrowLeftLine,
  RiErrorWarningLine,
  RiCheckLine,
  RiUploadCloudLine,
  RiImageAddLine,
  RiFilePdfLine,
  RiCloseLine,
  RiEyeOffLine,
  RiFlagLine,
  RiMapPinLine,
  RiFileTextLine,
  RiShieldLine,
  RiAlertLine,
  RiLockLine,
} from 'react-icons/ri';

const SubmitComplaint = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success, error: showError } = useToast();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    category: '',
    categoryLabel: '',
    location: '',
    priority: '',
    description: '',
    isAnonymous: false,
  });
  const [images, setImages] = useState([]);
  const [pdf, setPdf] = useState(null);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [dragActive, setDragActive] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);

  // Check if selected category is sensitive
  const isSensitive = SENSITIVE_CATEGORIES.includes(formData.category);

  // Priority colors
  const priorityColors = {
    Low: 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700',
    Medium: 'bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700',
    High: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700',
  };

  // Progress calculation
  const calculateProgress = () => {
    let completed = 0;
    const total = 5;

    if (formData.subject.trim().length >= 5) completed++;
    if (formData.category) completed++;
    if (formData.location.trim().length >= 5) completed++;
    if (formData.priority) completed++;
    if (formData.description.trim().length >= 20) completed++;

    return Math.round((completed / total) * 100);
  };

  const progress = calculateProgress();

  // Validation
  const validateField = (name, value) => {
    switch (name) {
      case 'subject':
        if (!value.trim()) return 'Subject is required';
        if (value.length < 5) return 'Subject must be at least 5 characters';
        if (value.length > 100) return 'Subject must not exceed 100 characters';
        return '';
      case 'category':
        if (!value) return 'Please select a category';
        return '';
      case 'location':
        if (!value.trim()) return 'Location is required';
        if (value.length < 5) return 'Location must be at least 5 characters';
        return '';
      case 'priority':
        if (!value) return 'Please select a priority';
        return '';
      case 'description':
        if (!value.trim()) return 'Description is required';
        if (value.length < 20) return 'Description must be at least 20 characters';
        if (value.length > 2000) return 'Description must not exceed 2000 characters';
        return '';
      default:
        return '';
    }
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    setFormData((prev) => ({ ...prev, [name]: newValue }));
    setTouched((prev) => ({ ...prev, [name]: true }));

    if (name !== 'isAnonymous') {
      const error = validateField(name, newValue);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  // Handle category selection
  const handleCategorySelect = (category) => {
    const isCategorySensitive = SENSITIVE_CATEGORIES.includes(category.id);
    
    setFormData((prev) => ({ 
      ...prev, 
      category: category.id,
      categoryLabel: category.label,
      // Auto-enable anonymous for sensitive categories
      isAnonymous: isCategorySensitive ? true : prev.isAnonymous,
    }));
    setTouched((prev) => ({ ...prev, category: true }));
    setErrors((prev) => ({ ...prev, category: '' }));
  };

  const handlePrioritySelect = (priority) => {
    setFormData((prev) => ({ ...prev, priority }));
    setTouched((prev) => ({ ...prev, priority: true }));
    setErrors((prev) => ({ ...prev, priority: '' }));
  };

  // Validate all
  const validateAll = () => {
    const newErrors = {};
    newErrors.subject = validateField('subject', formData.subject);
    newErrors.category = validateField('category', formData.category);
    newErrors.location = validateField('location', formData.location);
    newErrors.priority = validateField('priority', formData.priority);
    newErrors.description = validateField('description', formData.description);

    const filteredErrors = Object.fromEntries(
      Object.entries(newErrors).filter(([_, v]) => v)
    );

    setErrors(filteredErrors);
    return Object.keys(filteredErrors).length === 0;
  };

  // Drag handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files);
    handleImageFiles(files);
  };

  const handleImageFiles = (files) => {
    if (images.length + files.length > 3) {
      showError('Maximum 3 images allowed');
      return;
    }

    const validFiles = files.filter((file) => {
      if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
        showError(`${file.name} is not valid (JPG/PNG only)`);
        return false;
      }
      if (file.size > 2 * 1024 * 1024) {
        showError(`${file.name} exceeds 2MB`);
        return false;
      }
      return true;
    });

    const newImages = validFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
    }));

    setImages((prev) => [...prev, ...newImages]);
  };

  const removeImage = (index) => {
    setImages((prev) => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index].preview);
      newImages.splice(index, 1);
      return newImages;
    });
  };

  const handlePdfChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      showError('Only PDF files allowed');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showError('PDF must not exceed 5MB');
      return;
    }
    setPdf(file);
  };

  const removePdf = () => setPdf(null);

  useEffect(() => {
    return () => {
      images.forEach((img) => URL.revokeObjectURL(img.preview));
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateAll()) {
      showError('Please fix all errors before submitting');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const submitData = new FormData();

      submitData.append('subject', formData.subject.trim());
      submitData.append('category', formData.categoryLabel); // Send label for display
      submitData.append('categoryId', formData.category); // Send ID for processing
      submitData.append('location', formData.location.trim());
      submitData.append('priority', formData.priority);
      submitData.append('description', formData.description.trim());
      submitData.append('isAnonymous', formData.isAnonymous || isSensitive);
      submitData.append('isSensitive', isSensitive);

      images.forEach((img) => submitData.append('images', img.file));
      if (pdf) submitData.append('pdfDocument', pdf);

      const response = await api.submitComplaint(submitData, token);
      
      success(
        isSensitive 
          ? `Confidential complaint submitted securely! ID: ${response.complaint?.complaintId || ''}` 
          : `Complaint submitted successfully! ID: ${response.complaint?.complaintId || ''}`
      );
      
      setTimeout(() => navigate('/user/my-complaints'), 1500);
    } catch (err) {
      console.error('Submit error:', err);
      showError(err.response?.data?.message || 'Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getCounterColor = (current, max) => {
    const percentage = (current / max) * 100;
    if (percentage < 50) return 'text-green-600 dark:text-green-400';
    if (percentage < 80) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getFieldStatus = (fieldName) => {
    if (!touched[fieldName]) return null;
    if (errors[fieldName]) {
      return <RiErrorWarningLine className="h-5 w-5 text-red-500" />;
    }
    if (formData[fieldName]) {
      return <RiCheckLine className="h-5 w-5 text-green-500" />;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 animate-fadeIn">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-4 transition-all group"
          >
            <RiArrowLeftLine className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-semibold">Back</span>
          </button>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-800 dark:text-gray-200 mb-2">
            Submit New Complaint
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Fill out the form below to report an issue
          </p>
        </div>

        {/* ⚠️ SENSITIVE CATEGORY BANNER */}
        {isSensitive && (
          <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-300 dark:border-purple-700 rounded-xl animate-fadeIn">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-800 rounded-lg">
                <RiShieldLine className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="font-bold text-purple-800 dark:text-purple-300 mb-1">
                  🔒 Confidential Complaint Mode
                </h3>
                <p className="text-sm text-purple-700 dark:text-purple-400">
                  You've selected a <strong>sensitive category</strong>. Your complaint will be:
                </p>
                <ul className="text-sm text-purple-700 dark:text-purple-400 mt-2 space-y-1">
                  <li className="flex items-center gap-2">
                    <RiCheckLine className="h-4 w-4" />
                    Automatically submitted <strong>anonymously</strong>
                  </li>
                  <li className="flex items-center gap-2">
                    <RiCheckLine className="h-4 w-4" />
                    Routed to <strong>specialized cell</strong> (Women's Cell / Anti-Ragging)
                  </li>
                  <li className="flex items-center gap-2">
                    <RiCheckLine className="h-4 w-4" />
                    Handled with <strong>strict confidentiality</strong>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        <div className="sticky top-16 md:top-16 z-40 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-sm mb-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Form Progress
                  </p>
                  <p className="text-xs sm:text-sm font-bold text-indigo-600 dark:text-indigo-400">
                    {progress}%
                  </p>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ease-out rounded-full ${
                      isSensitive 
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500' 
                        : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
              {progress === 100 && (
                <div className={`flex-shrink-0 flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-full text-xs font-bold ${
                  isSensitive 
                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                    : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                }`}>
                  <RiCheckLine className="h-4 w-4" />
                  <span className="hidden sm:inline">Ready!</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className={`px-4 sm:px-6 py-3 sm:py-4 ${
              isSensitive 
                ? 'bg-gradient-to-r from-purple-600 to-pink-600' 
                : 'bg-gradient-to-r from-indigo-600 to-purple-600'
            }`}>
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <RiFileTextLine className="h-5 w-5 sm:h-6 sm:w-6" />
                Basic Information
              </h2>
            </div>
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Subject */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Subject <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    maxLength={100}
                    placeholder="Brief description of the issue"
                    className={`w-full px-4 py-2.5 sm:py-3 pr-12 rounded-lg border-2 transition-all ${
                      touched.subject && errors.subject
                        ? 'border-red-500 focus:ring-red-500'
                        : touched.subject && formData.subject.length >= 5
                        ? 'border-green-500 focus:ring-green-500'
                        : 'border-gray-300 dark:border-gray-600 focus:ring-indigo-500'
                    } bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2`}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {getFieldStatus('subject')}
                  </div>
                </div>
                <div className="flex justify-between items-center mt-2">
                  {touched.subject && errors.subject && (
                    <p className="text-xs sm:text-sm text-red-500 flex items-center gap-1">
                      <RiErrorWarningLine className="h-4 w-4" />
                      {errors.subject}
                    </p>
                  )}
                  <p className={`text-xs ml-auto font-semibold ${getCounterColor(formData.subject.length, 100)}`}>
                    {formData.subject.length}/100
                  </p>
                </div>
              </div>

              {/* ✅ NEW: CATEGORY SELECTION WITH GROUPS */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Category <span className="text-red-500">*</span>
                </label>
                
                {/* Category Groups */}
                <div className="space-y-4">
                  {Object.entries(CATEGORY_GROUPS).map(([groupName, categories]) => {
                    const hasSensitive = categories.some(c => c.sensitive);
                    
                    return (
                      <div key={groupName} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                        {/* Group Header */}
                        <button
                          type="button"
                          onClick={() => setSelectedGroup(selectedGroup === groupName ? null : groupName)}
                          className={`w-full px-4 py-3 flex items-center justify-between transition-all ${
                            hasSensitive 
                              ? 'bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30' 
                              : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-800 dark:text-gray-200">
                              {groupName}
                            </span>
                            {hasSensitive && (
                              <span className="px-2 py-0.5 text-xs font-bold bg-purple-200 dark:bg-purple-800 text-purple-700 dark:text-purple-300 rounded-full">
                                🔒 Confidential
                              </span>
                            )}
                          </div>
                          <span className={`transform transition-transform ${selectedGroup === groupName ? 'rotate-180' : ''}`}>
                            ▼
                          </span>
                        </button>
                        
                        {/* Category Options */}
                        {selectedGroup === groupName && (
                          <div className="p-3 grid grid-cols-2 sm:grid-cols-3 gap-2 bg-white dark:bg-gray-800">
                            {categories.map((cat) => (
                              <button
                                key={cat.id}
                                type="button"
                                onClick={() => handleCategorySelect(cat)}
                                className={`p-3 rounded-lg border-2 transition-all text-left ${
                                  formData.category === cat.id
                                    ? cat.sensitive
                                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 shadow-md'
                                      : 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 shadow-md'
                                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-xl">{cat.icon}</span>
                                  <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-semibold truncate ${
                                      formData.category === cat.id
                                        ? cat.sensitive 
                                          ? 'text-purple-700 dark:text-purple-300'
                                          : 'text-indigo-700 dark:text-indigo-300'
                                        : 'text-gray-700 dark:text-gray-300'
                                    }`}>
                                      {cat.label}
                                    </p>
                                  </div>
                                  {cat.sensitive && (
                                    <RiLockLine className="h-4 w-4 text-purple-500 flex-shrink-0" />
                                  )}
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Selected Category Display */}
                {formData.category && (
                  <div className={`mt-3 p-3 rounded-lg flex items-center gap-3 ${
                    isSensitive 
                      ? 'bg-purple-100 dark:bg-purple-900/30 border border-purple-300 dark:border-purple-700'
                      : 'bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700'
                  }`}>
                    <RiCheckLine className={`h-5 w-5 ${isSensitive ? 'text-purple-600' : 'text-green-600'}`} />
                    <span className={`font-semibold ${isSensitive ? 'text-purple-700 dark:text-purple-300' : 'text-green-700 dark:text-green-300'}`}>
                      Selected: {formData.categoryLabel}
                    </span>
                    {isSensitive && (
                      <span className="ml-auto text-xs bg-purple-200 dark:bg-purple-800 px-2 py-1 rounded text-purple-700 dark:text-purple-300">
                        🔒 Confidential
                      </span>
                    )}
                  </div>
                )}

                {touched.category && errors.category && (
                  <p className="text-xs sm:text-sm text-red-500 flex items-center gap-1 mt-2">
                    <RiErrorWarningLine className="h-4 w-4" />
                    {errors.category}
                  </p>
                )}
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <RiMapPinLine className="inline h-4 w-4 mr-1" />
                  Location <span className="text-red-500">*</span>
                  {isSensitive && (
                    <span className="ml-2 text-xs text-purple-600 dark:text-purple-400">
                      (Can be approximate for privacy)
                    </span>
                  )}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder={isSensitive ? "e.g., Near Library, Campus Area" : "e.g., Room 301, Block A"}
                    className={`w-full px-4 py-2.5 sm:py-3 pr-12 rounded-lg border-2 transition-all ${
                      touched.location && errors.location
                        ? 'border-red-500 focus:ring-red-500'
                        : touched.location && formData.location.length >= 5
                        ? 'border-green-500 focus:ring-green-500'
                        : 'border-gray-300 dark:border-gray-600 focus:ring-indigo-500'
                    } bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2`}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {getFieldStatus('location')}
                  </div>
                </div>
                {touched.location && errors.location && (
                  <p className="text-xs sm:text-sm text-red-500 flex items-center gap-1 mt-2">
                    <RiErrorWarningLine className="h-4 w-4" />
                    {errors.location}
                  </p>
                )}
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  <RiFlagLine className="inline h-4 w-4 mr-1" />
                  Priority <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {PRIORITIES.map((priority) => (
                    <button
                      key={priority}
                      type="button"
                      onClick={() => handlePrioritySelect(priority)}
                      className={`px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border-2 font-semibold text-sm sm:text-base transition-all ${
                        formData.priority === priority
                          ? `${priorityColors[priority]} shadow-md scale-105`
                          : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {priority === 'High' && '🔴 '}
                      {priority === 'Medium' && '🟡 '}
                      {priority === 'Low' && '🟢 '}
                      {priority}
                    </button>
                  ))}
                </div>
                {touched.priority && errors.priority && (
                  <p className="text-xs sm:text-sm text-red-500 flex items-center gap-1 mt-2">
                    <RiErrorWarningLine className="h-4 w-4" />
                    {errors.priority}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Description <span className="text-red-500">*</span>
                  {isSensitive && (
                    <span className="ml-2 text-xs text-purple-600 dark:text-purple-400">
                      (Describe what happened - your identity is protected)
                    </span>
                  )}
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  maxLength={2000}
                  rows={isSensitive ? 6 : 4}
                  placeholder={
                    isSensitive 
                      ? "Please describe the incident in detail. Include when it happened, who was involved (if comfortable sharing), and any other relevant information. Your identity is protected."
                      : "Provide detailed description..."
                  }
                  className={`w-full px-4 py-3 rounded-lg border-2 transition-all resize-none ${
                    touched.description && errors.description
                      ? 'border-red-500 focus:ring-red-500'
                      : touched.description && formData.description.length >= 20
                      ? 'border-green-500 focus:ring-green-500'
                      : isSensitive
                      ? 'border-purple-300 dark:border-purple-600 focus:ring-purple-500'
                      : 'border-gray-300 dark:border-gray-600 focus:ring-indigo-500'
                  } bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2`}
                />
                <div className="flex justify-between items-center mt-2">
                  {touched.description && errors.description && (
                    <p className="text-xs sm:text-sm text-red-500 flex items-center gap-1">
                      <RiErrorWarningLine className="h-4 w-4" />
                      {errors.description}
                    </p>
                  )}
                  <p className={`text-xs ml-auto font-semibold ${getCounterColor(formData.description.length, 2000)}`}>
                    {formData.description.length}/2000
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Attachments Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-4 sm:px-6 py-3 sm:py-4">
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <RiUploadCloudLine className="h-5 w-5 sm:h-6 sm:w-6" />
                Attachments (Optional)
              </h2>
            </div>
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Images */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  <RiImageAddLine className="inline h-4 w-4 mr-1" />
                  Images (Max 3, 2MB each)
                  {isSensitive && (
                    <span className="ml-2 text-xs text-purple-600 dark:text-purple-400">
                      - Evidence photos (optional)
                    </span>
                  )}
                </label>
                {images.length < 3 && (
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={`relative border-2 border-dashed rounded-xl p-6 sm:p-8 transition-all ${
                      dragActive
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400'
                    }`}
                  >
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png"
                      multiple
                      onChange={(e) => handleImageFiles(Array.from(e.target.files))}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="text-center">
                      <RiUploadCloudLine className={`h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-2 sm:mb-3 ${
                        dragActive ? 'text-indigo-600 animate-bounce' : 'text-gray-400'
                      }`} />
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        {dragActive ? 'Drop here' : 'Drag & drop or click'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {images.length}/3 uploaded
                      </p>
                    </div>
                  </div>
                )}

                {images.length > 0 && (
                  <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-4">
                    {images.map((image, index) => (
                      <div key={index} className="relative group aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-600">
                        <img
                          src={image.preview}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        >
                          <RiCloseLine className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* PDF */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  <RiFilePdfLine className="inline h-4 w-4 mr-1" />
                  Document (PDF, Max 5MB)
                </label>
                {!pdf ? (
                  <label className="block border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 hover:border-indigo-400 transition-all cursor-pointer">
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={handlePdfChange}
                      className="hidden"
                    />
                    <div className="text-center">
                      <RiFilePdfLine className="h-10 w-10 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Click to upload PDF
                      </p>
                    </div>
                  </label>
                ) : (
                  <div className="flex items-center gap-3 p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border-2 border-red-200 dark:border-red-800">
                    <RiFilePdfLine className="h-8 w-8 text-red-600 dark:text-red-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                        {pdf.name}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {(pdf.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={removePdf}
                      className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors flex-shrink-0"
                    >
                      <RiCloseLine className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Privacy Toggle - Only show if NOT sensitive (sensitive is auto-anonymous) */}
          {!isSensitive && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
              <label className="flex items-start gap-3 sm:gap-4 cursor-pointer group">
                <input
                  type="checkbox"
                  name="isAnonymous"
                  checked={formData.isAnonymous}
                  onChange={handleChange}
                  className="w-5 h-5 mt-0.5 rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <RiEyeOffLine className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-sm sm:text-base font-bold text-gray-800 dark:text-gray-200">
                      Submit Anonymously
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    Your identity will be hidden from public view
                  </p>
                </div>
              </label>
            </div>
          )}

          {/* Sensitive Auto-Anonymous Notice */}
          {isSensitive && (
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl border-2 border-purple-300 dark:border-purple-700 p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-800 rounded-lg">
                  <RiLockLine className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="font-bold text-purple-800 dark:text-purple-300">
                    🔒 Your identity is automatically protected
                  </p>
                  <p className="text-sm text-purple-700 dark:text-purple-400">
                    Sensitive complaints are always submitted anonymously for your safety.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              disabled={loading}
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-100 dark:hover:bg-gray-700 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || progress < 100}
              className={`w-full sm:flex-1 flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl ${
                isSensitive
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
              }`}
            >
              {loading ? (
                <>
                  <LoadingSpinner />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  {isSensitive ? <RiShieldLine className="h-5 w-5" /> : <RiSendPlaneFill className="h-5 w-5" />}
                  <span>{isSensitive ? 'Submit Confidentially' : 'Submit Complaint'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitComplaint;