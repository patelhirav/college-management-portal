import React, { useEffect, useState } from 'react';
import '../styles/SuperAdminProfile.css'; // optional CSS file
import apiService from '../services/api'; // your API service to fetch profile

const SuperAdminProfile = () => {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await apiService.getSuperAdminProfile();// adjust endpoint if different
        setProfile(res);
      } catch (error) {
        console.error('Failed to fetch super admin profile:', error);
      }
    };

    fetchProfile();
  }, []);

  return (

      <div className="superadmin-profile-container">
        <h2 className="superadmin-heading">Super Admin Profile</h2>
        {profile ? (
          <div className="superadmin-details">
            <p><strong>Name:</strong> {profile.name}</p>
            <p><strong>Email:</strong> {profile.email}</p>
          </div>
        ) : (
          <p>Loading profile...</p>
        )}
      </div>
  );
};

export default SuperAdminProfile;
