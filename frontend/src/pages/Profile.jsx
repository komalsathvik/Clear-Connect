import React,{useState,useEffect} from 'react';
function Profile() {
    let [username,setUsername]=useState("");
    let [password,setPassword]=useState("");
    let [profilePic,setNewProfilePic]=useState(null);
    let [profilePreview,setProfilePreview]=useState(null);
    function handleProfileChange(e){
        const file=e.target.files[0];
        if(file){
            setNewProfilePic(file);
            const preview=URL.createObjectURL(file);
            setProfilePreview(preview);
        }
    }
  return (
    <>
      <div className="container mt-5 p-4" style={{ minHeight:"650px",width: "600px",height:"500px", background: "linear-gradient(to right, #ffe5b4, #d0f0c0)", borderRadius: "1rem", boxShadow: "0px 4px 12px rgba(0,0,0,0.1)" }}>
        <h3 className="text-center mb-4 fw-bold text-dark">View and Edit Your Profile</h3>

        <div className="mb-3">
          <label className="form-label fw-semibold">Username</label>
          <input
            className="form-control form-control-lg"
            type="text"
            placeholder="Enter your username"
          />
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold">Cannot change your Email</label>
          <input
            className="form-control form-control-lg"
            type="text"
            placeholder="email"
            readOnly
          />
        </div>

        <div className="mb-3">
          <label htmlFor="inputPassword5" className="form-label fw-semibold">Password</label>
          <input
            type="password"
            id="inputPassword5"
            className="form-control"
            placeholder="Set or change your password"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="formFile" className="form-label fw-semibold">Upload Profile Picture</label>
          <input className="form-control" type="file" id="formFile" onChange={handleProfileChange}/>
        </div>
    {profilePreview && (
  <div className="text-center mb-3">
    <p>Your profile pic preview</p>
    <img 
      src={profilePreview} 
      alt="Preview" 
      style={{ width: "100px", height: "100px", borderRadius: "50%", objectFit: "cover" }} 
    />
  </div>
)}
        <div className="d-flex justify-content-between">
          <button className="btn btn-success px-4">Save Changes</button>
          <button className="btn btn-danger px-4">Delete Account</button>
        </div>
      </div>
    </>
  );
}

export default Profile;
