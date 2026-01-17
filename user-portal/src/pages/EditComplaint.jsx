// src/pages/EditComplaint.jsx - FULL EDIT WITH IMAGES/PDF
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../hooks/useToast';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Loading from '../components/common/Loading';
import { CATEGORIES, PRIORITIES } from '../utils/constants';
import api from '../api';
import {
  RiSaveLine,
  RiArrowLeftLine,
  RiErrorWarningLine,
  RiCheckLine,
  RiUploadCloudLine,
  RiImageAddLine,
  RiFilePdfLine,
  RiCloseLine,
  RiDeleteBinLine,
  RiFlagLine,
  RiMapPinLine,
  RiFileTextLine,
} from 'react-icons/ri';

const EditComplaint = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error: showError } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [complaint, setComplaint] = useState(null);

  const [formData, setFormData] = useState({
    subject: '',
    category: '',
    location: '',
    priority: 'Medium',
    description: '',
  });

  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [existingPdf, setExistingPdf] = useState(null);
  const [newPdf, setNewPdf] = useState(null);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [deletePdf, setDeletePdf] = useState(false);

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [dragActive, setDragActive] = useState(false);

  // Category icons
  const categoryIcons = {
    Fan: '🌀',
    Light: '💡',
    Projector: '📽️',
    Furniture: '🪑',
    Washroom: '🚻',
    Water: '💧',
    Internet: '📶',
    Other: '📋',
  };

  // Priority colors
  const priorityColors = {
    Low: 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700',
    Medium: 'bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700',
    High: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700',
  };

  // Fetch complaint
  useEffect(() => {
    fetchComplaint();
  }, [id]);

  const fetchComplaint = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const data = await api.getComplaintById(id, token);

      // Check if editable
      if (data.status?.toLowerCase() !== 'pending' || data.assignedTo) {
        showError('This complaint cannot be edited');
        navigate('/user/my-complaints');
        return;
      }

      setComplaint(data);
      setFormData({
        subject: data.subject || '',
        category: data.category || '',
        location: data.location || '',
        priority: data.priority || 'Medium',
        description: data.description || '',
      });

      setExistingImages(data.images || []);
      setExistingPdf(data.pdfDocument || null);
    } catch (err) {
      console.error('Fetch error:', err);
      showError('Failed to load complaint');
      navigate('/user/my-complaints');
    } finally {
      setLoading(false);
    }
  };

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

      case 'description':
        if (!value.trim()) return 'Description is required';
        if (value.length < 20) return 'Description must be at least 20 characters';
        if (value.length > 500) return 'Description must not exceed 500 characters';
        return '';

      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));

    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleCategorySelect = (category) => {
    setFormData((prev) => ({ ...prev, category }));
    setTouched((prev) => ({ ...prev, category: true }));
    const error = validateField('category', category);
    setErrors((prev) => ({ ...prev, category: error }));
  };

  const handlePrioritySelect = (priority) => {
    setFormData((prev) => ({ ...prev, priority }));
  };

  const validateAll = () => {
    const newErrors = {};
    newErrors.subject = validateField('subject', formData.subject);
    newErrors.category = validateField('category', formData.category);
    newErrors.location = validateField('location', formData.location);
    newErrors.description = validateField('description', formData.description);

    const filteredErrors = Object.fromEntries(
      Object.entries(newErrors).filter(([_, v]) => v)
    );

    setErrors(filteredErrors);
    return Object.keys(filteredErrors).length === 0;
  };

  // Image handlers
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
    const totalImages = existingImages.length - imagesToDelete.length + newImages.length;
    if (totalImages + files.length > 3) {
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

    const images = validFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
    }));

    setNewImages((prev) => [...prev, ...images]);
  };

  const removeExistingImage = (imageUrl) => {
    setImagesToDelete((prev) => [...prev, imageUrl]);
  };

  const removeNewImage = (index) => {
    setNewImages((prev) => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
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
    setNewPdf(file);
  };

  const removeNewPdf = () => setNewPdf(null);
  const removeExistingPdf = () => setDeletePdf(true);
  const restoreExistingPdf = () => setDeletePdf(false);

  // Cleanup
  useEffect(() => {
    return () => {
      newImages.forEach((img) => URL.revokeObjectURL(img.preview));
    };
  }, []);

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateAll()) {
      showError('Please fix all errors');
      return;
    }

    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      const updateData = new FormData();

      updateData.append('subject', formData.subject.trim());
      updateData.append('category', formData.category);
      updateData.append('location', formData.location.trim());
      updateData.append('priority', formData.priority);
      updateData.append('description', formData.description.trim());

      // Images
      newImages.forEach((img) => updateData.append('images', img.file));
      if (imagesToDelete.length > 0) {
        updateData.append('imagesToDelete', JSON.stringify(imagesToDelete));
      }

      // PDF
      if (newPdf) {
        updateData.append('pdfDocument', newPdf);
      }
      if (deletePdf) {
        updateData.append('deletePdf', 'true');
      }

      await api.updateComplaint(id, updateData, token);
      success('Complaint updated successfully!');
      setTimeout(() => navigate(`/user/complaints/${id}`), 1000);
    } catch (err) {
      console.error('Update error:', err);
      showError(err.response?.data?.message || 'Failed to update');
    } finally {
      setSaving(false);
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

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
        <Loading />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-4 transition-all group"
          >
            <RiArrowLeftLine className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-semibold">Back</span>
          </button>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-800 dark:text-gray-200 mb-2">
            Edit Complaint
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Update your complaint details
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 sm:px-6 py-3 sm:py-4">
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
                    className={`w-full px-4 py-2.5 sm:py-3 pr-12 rounded-lg border-2 transition-all ${
                      touched.subject && errors.subject
                        ? 'border-red-500 focus:ring-red-500'
                        : touched.subject
                        ? 'border-green-500 focus:ring-green-500'
                        : 'border-gray-300 dark:border-gray-600 focus:ring-indigo-500'
                    } bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2`}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {getFieldStatus('subject')}
                  </div>
                </div>
                <div className="flex justify-between mt-2">
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

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Category <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => handleCategorySelect(cat)}
                      className={`p-3 sm:p-4 rounded-xl border-2 transition-all ${
                        formData.category === cat
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 shadow-md scale-105'
                          : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400'
                      }`}
                    >
                      <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">{categoryIcons[cat]}</div>
                      <p className={`text-xs sm:text-sm font-semibold ${
                        formData.category === cat
                          ? 'text-indigo-600 dark:text-indigo-400'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        {cat}
                      </p>
                    </button>
                  ))}
                </div>
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
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-2.5 sm:py-3 pr-12 rounded-lg border-2 transition-all ${
                      touched.location && errors.location
                        ? 'border-red-500 focus:ring-red-500'
                        : touched.location
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
                  Priority
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
                          : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {priority}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  maxLength={500}
                  rows={4}
                  className={`w-full px-4 py-3 rounded-lg border-2 transition-all resize-none ${
                    touched.description && errors.description
                      ? 'border-red-500 focus:ring-red-500'
                      : touched.description
                      ? 'border-green-500 focus:ring-green-500'
                      : 'border-gray-300 dark:border-gray-600 focus:ring-indigo-500'
                  } bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2`}
                />
                <div className="flex justify-between mt-2">
                  {touched.description && errors.description && (
                    <p className="text-xs sm:text-sm text-red-500 flex items-center gap-1">
                      <RiErrorWarningLine className="h-4 w-4" />
                      {errors.description}
                    </p>
                  )}
                  <p className={`text-xs ml-auto font-semibold ${getCounterColor(formData.description.length, 500)}`}>
                    {formData.description.length}/500
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Attachments */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-4 sm:px-6 py-3 sm:py-4">
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <RiUploadCloudLine className="h-5 w-5 sm:h-6 sm:w-6" />
                Attachments
              </h2>
            </div>
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Images */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  <RiImageAddLine className="inline h-4 w-4 mr-1" />
                  Images (Max 3)
                </label>

                {/* Existing Images */}
                {existingImages.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Current Images:</p>
                    <div className="grid grid-cols-3 gap-3">
                      {existingImages
                        .filter((img) => !imagesToDelete.includes(img))
                        .map((imageUrl, index) => (
                          <div key={index} className="relative group aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-600">
                            <img
                              src={imageUrl}
                              alt={`Existing ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removeExistingImage(imageUrl)}
                              className="absolute top-1 right-1 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                            >
                              <RiDeleteBinLine className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* New Images Upload */}
                {existingImages.length - imagesToDelete.length + newImages.length < 3 && (
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
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {dragActive ? 'Drop here' : 'Add new images'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {existingImages.length - imagesToDelete.length + newImages.length}/3 images
                      </p>
                    </div>
                  </div>
                )}

                {/* New Images Preview */}
                {newImages.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">New Images:</p>
                    <div className="grid grid-cols-3 gap-3">
                      {newImages.map((image, index) => (
                        <div key={index} className="relative group aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden border-2 border-green-300 dark:border-green-700">
                          <img
                            src={image.preview}
                            alt={`New ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeNewImage(index)}
                            className="absolute top-1 right-1 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <RiCloseLine className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* PDF */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  <RiFilePdfLine className="inline h-4 w-4 mr-1" />
                  Document (PDF)
                </label>

                {/* Existing PDF */}
                {existingPdf && !deletePdf && !newPdf && (
                  <div className="flex items-center gap-3 p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border-2 border-red-200 dark:border-red-800 mb-4">
                    <RiFilePdfLine className="h-8 w-8 text-red-600 dark:text-red-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                        Current Document
                      </p>
                      <a
                        href={existingPdf}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        View PDF
                      </a>
                    </div>
                    <button
                      type="button"
                      onClick={removeExistingPdf}
                      className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors flex-shrink-0"
                    >
                      <RiDeleteBinLine className="h-5 w-5" />
                    </button>
                  </div>
                )}

                {/* Upload New PDF */}
                {(!existingPdf || deletePdf) && !newPdf && (
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
                        Upload new PDF
                      </p>
                    </div>
                  </label>
                )}

                {/* New PDF Preview */}
                {newPdf && (
                  <div className="flex items-center gap-3 p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border-2 border-green-300 dark:border-green-700">
                    <RiFilePdfLine className="h-8 w-8 text-green-600 dark:text-green-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                        {newPdf.name}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {(newPdf.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={removeNewPdf}
                      className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors flex-shrink-0"
                    >
                      <RiCloseLine className="h-5 w-5" />
                    </button>
                  </div>
                )}

                {/* Restore deleted PDF */}
                {existingPdf && deletePdf && !newPdf && (
                  <button
                    type="button"
                    onClick={restoreExistingPdf}
                    className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                  >
                    Restore previous document
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              disabled={saving}
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-100 dark:hover:bg-gray-700 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || Object.keys(errors).some((key) => errors[key])}
              className="w-full sm:flex-1 flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {saving ? (
                <>
                  <LoadingSpinner />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <RiSaveLine className="h-5 w-5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditComplaint;