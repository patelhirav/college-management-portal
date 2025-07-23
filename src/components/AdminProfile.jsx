import React, { useState, useEffect } from 'react';
import '../styles/AdminProfile.css';
import apiService from '../services/api';

const AdminProfile = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [bioForm, setBioForm] = useState({
    contact: '',
    profession: '',
    degree: '',
    linkedin: '',
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const data = await apiService.getAdminProfile();
        setProfileData(data);
        if (data.bio) {
          setBioForm(data.bio); // pre-fill if bio exists
        }
      } catch (err) {
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const handleInputChange = (e) => {
    setBioForm({ ...bioForm, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      if (profileData.bio) {
        await apiService.updateAdminBio(bioForm); // update
      } else {
        await apiService.addAdminBio(bioForm); // add
      }
      const updatedProfile = await apiService.getAdminProfile(); // refresh
      setProfileData(updatedProfile);
      setShowModal(false);
    } catch (err) {
      console.error('Error saving bio:', err);
    }
  };

  if (loading) return <div className="loading-indicator">Loading profile...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!profileData) return <div className="error-message">No profile data found</div>;

  return (
    <div className="admin-profile">
      <div className="profile-header">
        <h2>{profileData.name}</h2>
        <div className="profile-id">Head of Department</div>
      </div>

      <div className="profile-section">
        <h3>Department Information</h3>
        <div className="profile-field">
          <span className="field-label">Department ID:</span>
          <span className="field-value">{profileData.departmentId}</span>
        </div>
        <div className="profile-field">
          <span className="field-label">Department:</span>
          <span className="field-value">{profileData.departmentName}</span>
        </div>
      </div>

      <div className="profile-section">
        <h3>Professional Information</h3>
        {profileData.bio ? (
          <>
            <div className="profile-field"><span className="field-label">Contact:</span><span className="field-value">{profileData.bio.contact}</span></div>
            <div className="profile-field"><span className="field-label">Profession:</span><span className="field-value">{profileData.bio.profession}</span></div>
            <div className="profile-field"><span className="field-label">Highest Degree:</span><span className="field-value">{profileData.bio.degree}</span></div>
            <div className="profile-field"><span className="field-label">LinkedIn:</span><a className="field-value link" href={profileData.bio.linkedin}>{profileData.bio.linkedin}</a></div>
          </>
        ) : (
          <div className="profile-field"><span className="field-value">Not provided</span></div>
        )}
        <button onClick={() => setShowModal(true)} className="edit-btn">
          {profileData.bio ? 'Edit Bio' : 'Add Bio'}
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>{profileData.bio ? 'Edit Bio' : 'Add Bio'}</h3>
            <input type="text" name="contact" placeholder="Contact" value={bioForm.contact} onChange={handleInputChange} />
            <input type="text" name="profession" placeholder="Profession" value={bioForm.profession} onChange={handleInputChange} />
            <input type="text" name="degree" placeholder="Highest Degree" value={bioForm.degree} onChange={handleInputChange} />
            <input type="text" name="linkedin" placeholder="LinkedIn URL" value={bioForm.linkedin} onChange={handleInputChange} />
            <div className="modal-actions">
              <button onClick={handleSave}>Save</button>
              <button onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProfile;
