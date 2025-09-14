import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import FormInput from '../FormInput';
import { validateName, validateEmail } from '../../utils/validation';
import { setCurrentUser } from '../../store/userSlice';
import { useUpdateProfile } from '../../services/api';

/**
 * ProfileInfo - User profile information and editing
 */
const ProfileInfo = ({ user }) => {
  const dispatch = useDispatch();
  const updateProfileHook = useUpdateProfile();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.profile?.firstName || '',
    lastName: user?.profile?.lastName || '',
    email: user?.email || '',
    bio: user?.profile?.bio || '',
    location: user?.profile?.location || '',
    website: user?.profile?.website || '',
    github: user?.profile?.github || '',
    linkedin: user?.profile?.linkedin || ''
  });
  const [errors, setErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleInputBlur = (e) => {
    const { name } = e.target;
    setTouchedFields(prev => ({
      ...prev,
      [name]: true
    }));

    // Validate field on blur
    validateField(name, formData[name]);
  };

  const validateField = (fieldName, value) => {
    let error = '';

    switch (fieldName) {
      case 'firstName':
        error = validateName(value);
        break;
      case 'lastName':
        error = validateName(value);
        break;
      case 'email':
        error = validateEmail(value);
        break;
      default:
        break;
    }

    setErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));

    return error;
  };

  const handleSave = async () => {
    // Validate all fields
    const fieldErrors = {};
    Object.keys(formData).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) fieldErrors[field] = error;
    });

    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    try {
      // Prepare profile data for API
      const profileData = {
        email: formData.email,
        profile: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          bio: formData.bio,
          location: formData.location,
          website: formData.website,
          github: formData.github,
          linkedin: formData.linkedin
        }
      };

      // Update profile via API
      const updatedUser = await updateProfileHook.execute(profileData);

      // Update user in store
      dispatch(setCurrentUser(updatedUser));
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      // You could add error handling here (e.g., show an error message)
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.profile?.firstName || '',
      lastName: user?.profile?.lastName || '',
      email: user?.email || '',
      bio: user?.profile?.bio || '',
      location: user?.profile?.location || '',
      website: user?.profile?.website || '',
      github: user?.profile?.github || '',
      linkedin: user?.profile?.linkedin || ''
    });
    setErrors({});
    setTouchedFields({});
    setIsEditing(false);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-medium text-zinc-100">Profile Information</h2>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="
              px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg
              transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500
            "
          >
            Edit Profile
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={handleCancel}
              className="
                px-4 py-2 border border-zinc-600 text-zinc-300 hover:text-zinc-100 hover:border-zinc-500
                rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-zinc-500
              "
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={updateProfileHook.loading}
              className="
                px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white rounded-lg
                transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500
              "
            >
              {updateProfileHook.loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* Avatar Section */}
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-2xl">
            {formData.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
          </div>
          <div>
            <h3 className="text-zinc-100 font-medium text-lg">
              {formData.firstName || formData.lastName ? 
                `${formData.firstName} ${formData.lastName}`.trim() : 
                'Set your name'
              }
            </h3>
            <p className="text-zinc-400">{formData.email}</p>
            {!isEditing && (
              <button className="text-blue-400 hover:text-blue-300 text-sm mt-1">
                Change Avatar
              </button>
            )}
          </div>
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput
            label="First Name"
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            error={touchedFields.firstName ? errors.firstName : ''}
            required
            disabled={!isEditing}
            placeholder="Enter your first name"
          />

          <FormInput
            label="Last Name"
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            error={touchedFields.lastName ? errors.lastName : ''}
            disabled={!isEditing}
            placeholder="Enter your last name"
          />

          <div className="md:col-span-2">
            <FormInput
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              error={touchedFields.email ? errors.email : ''}
              required
              disabled={!isEditing}
              placeholder="Enter your email"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Bio
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              disabled={!isEditing}
              placeholder="Tell us about yourself..."
              rows={4}
              className={`
                w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-zinc-100
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                disabled:bg-zinc-800 disabled:text-zinc-400 disabled:border-zinc-700
                transition-colors duration-200
              `}
            />
          </div>

          <FormInput
            label="Location"
            type="text"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            disabled={!isEditing}
            placeholder="City, Country"
          />

          <FormInput
            label="Website"
            type="url"
            name="website"
            value={formData.website}
            onChange={handleInputChange}
            disabled={!isEditing}
            placeholder="https://yourwebsite.com"
          />

          <FormInput
            label="GitHub"
            type="text"
            name="github"
            value={formData.github}
            onChange={handleInputChange}
            disabled={!isEditing}
            placeholder="github.com/username"
          />

          <FormInput
            label="LinkedIn"
            type="text"
            name="linkedin"
            value={formData.linkedin}
            onChange={handleInputChange}
            disabled={!isEditing}
            placeholder="linkedin.com/in/username"
          />
        </div>

        {/* Account Stats */}
        {!isEditing && (
          <div className="border-t border-zinc-700 pt-6">
            <h3 className="text-lg font-medium text-zinc-100 mb-4">Account Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-zinc-700/50 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-400">12</div>
                <div className="text-zinc-400 text-sm">Problems Solved</div>
              </div>
              <div className="bg-zinc-700/50 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-400">5</div>
                <div className="text-zinc-400 text-sm">Day Streak</div>
              </div>
              <div className="bg-zinc-700/50 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-400">2</div>
                <div className="text-zinc-400 text-sm">Badges Earned</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileInfo;


