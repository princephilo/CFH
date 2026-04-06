import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FiUpload, FiX, FiPlus, FiSend, FiCpu
} from 'react-icons/fi';
import API from '../../api/axios';
import CircuitSimulator from '../../components/CircuitSimulator/CircuitSimulator';
import { useAuth } from '../../context/AuthContext';
import './SubmitIssue.css';

const CATEGORIES = [
  { value: 'short-circuit', label: 'Short Circuit' },
  { value: 'open-circuit', label: 'Open Circuit' },
  { value: 'component-failure', label: 'Component Failure' },
  { value: 'wrong-value', label: 'Wrong Value' },
  { value: 'design-error', label: 'Design Error' },
  { value: 'soldering-issue', label: 'Soldering Issue' },
  { value: 'signal-integrity', label: 'Signal Integrity' },
  { value: 'power-issue', label: 'Power Issue' },
  { value: 'grounding', label: 'Grounding' },
  { value: 'thermal', label: 'Thermal' },
  { value: 'other', label: 'Other' }
];

const SubmitIssue = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium',
    difficulty: 'intermediate',
    tags: [],
    components: []
  });

  const [images, setImages] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [componentInput, setComponentInput] = useState({ name: '', value: '' });
  const [circuitData, setCircuitData] = useState(null);
  const [showSimulator, setShowSimulator] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 5) {
      return toast.error('Maximum 5 images allowed');
    }
    setImages(prev => [...prev, ...files]);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const addTag = (e) => {
    e.preventDefault();
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const addComponent = () => {
    if (componentInput.name.trim()) {
      setFormData(prev => ({
        ...prev,
        components: [...prev.components, { ...componentInput }]
      }));
      setComponentInput({ name: '', value: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.category) {
      return toast.error('Please fill in all required fields');
    }

    setLoading(true);

    try {
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('category', formData.category);
      submitData.append('priority', formData.priority);
      submitData.append('difficulty', formData.difficulty);
      submitData.append('tags', JSON.stringify(formData.tags));
      submitData.append('components', JSON.stringify(formData.components));

      if (circuitData) {
        submitData.append('circuitData', JSON.stringify(circuitData));
      }

      images.forEach(img => {
        submitData.append('circuitImage', img);
      });

      const res = await API.post('/issues', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Issue submitted successfully!');
      navigate(`/issues/${res.data.data._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit issue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="submit-page">
        <h1>Submit Circuit Issue</h1>
        <p className="submit-subtitle">
          Describe your circuit problem and get help from AI and the community
        </p>

        <form onSubmit={handleSubmit} className="submit-form">
          {/* Title */}
          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Brief description of the issue"
              required
              maxLength={200}
              className="input-field"
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label>Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide detailed information about the circuit issue...&#10;- What should happen?&#10;- What actually happens?&#10;- Steps to reproduce&#10;- Any error symptoms"
              required
              maxLength={5000}
              className="input-field"
              rows={8}
            />
          </div>

          {/* Category and Priority */}
          <div className="form-row">
            <div className="form-group">
              <label>Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="input-field"
              >
                <option value="">Select category</option>
                {CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Priority</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="input-field"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div className="form-group">
              <label>Difficulty</label>
              <select
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
                className="input-field"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>
            </div>
          </div>

          {/* Tags */}
          <div className="form-group">
            <label>Tags</label>
            <div className="tags-input-wrapper">
              <div className="tags-display">
                {formData.tags.map(tag => (
                  <span key={tag} className="tag">
                    #{tag}
                    <button type="button" onClick={() => removeTag(tag)}>
                      <FiX />
                    </button>
                  </span>
                ))}
              </div>
              <div className="tag-input-row">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add tags (e.g., arduino, resistor)"
                  className="input-field"
                  onKeyPress={(e) => e.key === 'Enter' && addTag(e)}
                />
                <button type="button" className="btn btn-secondary btn-sm" onClick={addTag}>
                  <FiPlus /> Add
                </button>
              </div>
            </div>
          </div>

          {/* Components */}
          <div className="form-group">
            <label>Components Involved</label>
            <div className="components-input">
              <div className="component-input-row">
                <input
                  type="text"
                  placeholder="Component name"
                  value={componentInput.name}
                  onChange={(e) => setComponentInput(prev => ({ ...prev, name: e.target.value }))}
                  className="input-field"
                />
                <input
                  type="text"
                  placeholder="Value (e.g., 10kΩ)"
                  value={componentInput.value}
                  onChange={(e) => setComponentInput(prev => ({ ...prev, value: e.target.value }))}
                  className="input-field"
                />
                <button type="button" className="btn btn-secondary btn-sm" onClick={addComponent}>
                  <FiPlus />
                </button>
              </div>
              {formData.components.length > 0 && (
                <div className="components-list-display">
                  {formData.components.map((comp, i) => (
                    <span key={i} className="component-chip">
                      {comp.name} {comp.value && `(${comp.value})`}
                      <button type="button" onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          components: prev.components.filter((_, idx) => idx !== i)
                        }));
                      }}>
                        <FiX />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Image Upload */}
          <div className="form-group">
            <label>Upload Images (max 5)</label>
            <div className="image-upload-area">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                id="image-upload"
                hidden
              />
              <label htmlFor="image-upload" className="upload-label">
                <FiUpload />
                <span>Click to upload circuit images</span>
              </label>
            </div>
            {images.length > 0 && (
              <div className="image-previews">
                {images.map((img, i) => (
                  <div key={i} className="image-preview">
                    <img src={URL.createObjectURL(img)} alt={`Preview ${i}`} />
                    <button type="button" onClick={() => removeImage(i)} className="remove-image">
                      <FiX />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Circuit Simulator */}
          <div className="form-group">
            <label>Circuit Simulator (optional)</label>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowSimulator(!showSimulator)}
            >
              <FiCpu /> {showSimulator ? 'Hide' : 'Open'} Circuit Simulator
            </button>
            {showSimulator && (
              <div style={{ marginTop: 16 }}>
                <CircuitSimulator
                  onSave={(data) => {
                    setCircuitData(data);
                    toast.success('Circuit data saved!');
                  }}
                  initialData={circuitData}
                />
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="btn btn-primary btn-lg submit-btn"
            disabled={loading}
          >
            {loading ? (
              <span className="spinner" style={{width: 20, height: 20, borderWidth: 2}}></span>
            ) : (
              <>
                <FiSend /> Submit Issue
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SubmitIssue;