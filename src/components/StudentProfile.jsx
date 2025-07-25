"use client"

import { useState, useEffect } from "react"
import apiService from "../services/api"
import "../styles/StudentProfile.css"

const StudentProfile = () => {
  const [profileData, setProfileData] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingPhoto, setEditingPhoto] = useState(false)
  const [formData, setFormData] = useState({})
  const [photo, setPhoto] = useState(null)

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const data = await apiService.getStudentProfile()
        setProfileData(data)
        setFormData({
          semester: data.semester,
          departmentName: data.department?.name || "",
          address: data.info?.address || "",
          mobile: data.info?.mobile || "",
          fatherName: data.info?.fatherName || "",
          fatherMobile: data.info?.fatherMobile || "",
          guardianName: data.info?.guardianName || "",
          city: data.info?.city || "",
        })
      } catch (err) {
        console.error("Failed to load student profile:", err)
      }
    }
    fetchProfileData()
  }, [])

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleProfileUpdate = async () => {
    try {
      await apiService.updateStudentProfile(formData)
      setShowEditModal(false)
      const updated = await apiService.getStudentProfile()
      setProfileData(updated)
    } catch (err) {
      console.error("Error updating student profile:", err)
    }
  }

  const handlePhotoChange = (e) => {
    setPhoto(e.target.files[0])
  }

  const handlePhotoUpload = async () => {
    try {
      const form = new FormData()
      form.append("profilePhoto", photo)
      await apiService.updateStudentProfilePhoto(form)
      setEditingPhoto(false)
      const data = await apiService.getStudentProfile()
      setProfileData(data)
    } catch (err) {
      console.error("Error uploading profile photo:", err)
    }
  }

  if (!profileData) return <div>Loading...</div>

  const profileFields = [
    { label: "Name", value: profileData.user.name },
    { label: "Email", value: profileData.user.email },
    { label: "Semester", value: profileData.semester },
    { label: "Department", value: profileData.department?.name },
    { label: "Address", value: profileData.info?.address || "Not provided" },
    { label: "Mobile", value: profileData.info?.mobile || "Not provided" },
    { label: "Father's Name", value: profileData.info?.fatherName || "Not provided" },
    { label: "Father's Mobile", value: profileData.info?.fatherMobile || "Not provided" },
    { label: "Guardian Name", value: profileData.info?.guardianName || "Not provided" },
    { label: "City", value: profileData.info?.city || "Not provided" },
  ]

  return (
    <div className="student-profile-container">
      <h2 className="student-profile-title">Student Profile</h2>

      <div className="student-profile-content">
        <div className="student-profile-photo">
          <img
            src={profileData.profilePhoto || "/placeholder.svg?height=160&width=160&query=student profile"}
            alt="Profile"
          />
          {editingPhoto ? (
            <div className="photo-edit-actions">
              <input type="file" onChange={handlePhotoChange} accept="image/*" />
              <button onClick={handlePhotoUpload} disabled={!photo}>
                Upload Photo
              </button>
              <button onClick={() => setEditingPhoto(false)}>Cancel</button>
            </div>
          ) : (
            <button onClick={() => setEditingPhoto(true)}>Change Photo</button>
          )}
        </div>

        <div className="student-profile-details">
          <div className="student-profile-info-grid">
            {profileFields.map((field, index) => (
              <div key={index} className="student-profile-field">
                <strong>{field.label}:</strong>
                <span>{field.value}</span>
              </div>
            ))}
          </div>

          <div className="student-profile-actions">
            <button onClick={() => setShowEditModal(true)}>Edit Profile Information</button>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="student-profile-modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="student-profile-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Edit Profile Information</h3>

            <div className="student-profile-edit-form">
              {[
                { label: "Semester", name: "semester", type: "text" },
                { label: "Address", name: "address", type: "text" },
                { label: "Mobile Number", name: "mobile", type: "tel" },
                { label: "Father's Name", name: "fatherName", type: "text" },
                { label: "Father's Mobile", name: "fatherMobile", type: "tel" },
                { label: "Guardian Name", name: "guardianName", type: "text" },
                { label: "City", name: "city", type: "text" },
              ].map(({ label, name, type }) => (
                <label key={name}>
                  {label}:
                  <input
                    type={type}
                    name={name}
                    value={formData[name] || ""}
                    onChange={handleInputChange}
                    placeholder={`Enter ${label.toLowerCase()}`}
                  />
                </label>
              ))}
            </div>

            <div className="student-profile-form-actions">
              <button onClick={handleProfileUpdate}>Save Changes</button>
              <button className="cancel-btn" onClick={() => setShowEditModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StudentProfile
