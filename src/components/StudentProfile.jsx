import React, { useState, useEffect } from 'react';
import apiService from '../services/api';
import '../styles/StudentProfile.css';

const StudentProfile = () => {
  const [profileData, setProfileData] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState(false);
  const [formData, setFormData] = useState({});
  const [photo, setPhoto] = useState(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const data = await apiService.getStudentProfile();
        setProfileData(data);
        setFormData({
          semester: data.semester,
          departmentName: data.department?.name || '',
          address: data.info?.address || '',
          mobile: data.info?.mobile || '',
          fatherName: data.info?.fatherName || '',
          fatherMobile: data.info?.fatherMobile || '',
          guardianName: data.info?.guardianName || '',
          city: data.info?.city || '',
        });
      } catch (err) {
        console.error('Failed to load student profile:', err);
      }
    };
    fetchProfileData();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProfileUpdate = async () => {
    try {
      await apiService.updateStudentProfile(formData);
      setShowEditModal(false);
      const updated = await apiService.getStudentProfile();
      setProfileData(updated);
    } catch (err) {
      console.error('Error updating student profile:', err);
    }
  };

  const handlePhotoChange = (e) => {
    setPhoto(e.target.files[0]);
  };

  const handlePhotoUpload = async () => {
    try {
      const form = new FormData();
      form.append('profilePhoto', photo);
      await apiService.updateStudentProfilePhoto(form);
      setEditingPhoto(false);
      const data = await apiService.getStudentProfile();
      setProfileData(data);
    } catch (err) {
      console.error('Error uploading profile photo:', err);
    }
  };

  if (!profileData) return <div>Loading...</div>;

  return (
    <div className="student-profile-container">
      <h2 className="student-profile-title">Student Profile</h2>
      <div className="student-profile-content">
        <div className="student-profile-photo">
          <img src={profileData.profilePhoto || '/default-profile.jpg'} alt="Profile" />
          {editingPhoto ? (
            <div className="photo-edit-actions">
              <input type="file" onChange={handlePhotoChange} />
              <button onClick={handlePhotoUpload}>Upload</button>
              <button onClick={() => setEditingPhoto(false)}>Cancel</button>
            </div>
          ) : (
            <button onClick={() => setEditingPhoto(true)}>Edit Photo</button>
          )}
        </div>

        <div className="student-profile-details">
          <p><strong>Name:</strong> {profileData.user.name}</p>
          <p><strong>Email:</strong> {profileData.user.email}</p>
          <p><strong>Semester:</strong> {profileData.semester}</p>
          <p><strong>Department:</strong> {profileData.department?.name}</p>
          <p><strong>Address:</strong> {profileData.info?.address || 'Not provided'}</p>
          <p><strong>Mobile:</strong> {profileData.info?.mobile || 'Not provided'}</p>
          <p><strong>Father's Name:</strong> {profileData.info?.fatherName || 'Not provided'}</p>
          <p><strong>Father's Mobile:</strong> {profileData.info?.fatherMobile || 'Not provided'}</p>
          <p><strong>Guardian Name:</strong> {profileData.info?.guardianName || 'Not provided'}</p>
          <p><strong>City:</strong> {profileData.info?.city || 'Not provided'}</p>
          <button onClick={() => setShowEditModal(true)}>Edit Info</button>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="student-profile-modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="student-profile-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Edit Profile Info</h3>
            <div className="student-profile-edit-form">
              {[
                { label: 'Semester', name: 'semester' },
                { label: 'Address', name: 'address' },
                { label: 'Mobile', name: 'mobile' },
                { label: "Father's Name", name: 'fatherName' },
                { label: "Father's Mobile", name: 'fatherMobile' },
                { label: 'Guardian Name', name: 'guardianName' },
                { label: 'City', name: 'city' },
              ].map(({ label, name }) => (
                <label key={name}>
                  {label}:
                  <input type="text" name={name} value={formData[name]} onChange={handleInputChange} />
                </label>
              ))}
              <button onClick={handleProfileUpdate}>Save</button>
              <button className="cancel-btn" onClick={() => setShowEditModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentProfile;
