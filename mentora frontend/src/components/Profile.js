import React, { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import { apiJson } from "../utils/api";
import {
  Camera,
  PencilLine,
  Save,
  Mail,
  Phone,
  School,
  ShieldCheck,
  User,
} from "lucide-react";

export default function Profile() {
  const { updateProfile } = useApp();
  const [profileImage, setProfileImage] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    major: "",
    grade: "",
    targetRank: "",
    bio: "",
  });

  useEffect(() => {
    let active = true;
    const fetchProfile = async () => {
      try {
        const { response, data } = await apiJson("/api/profile");
        if (response.ok) {
          const p = data.profile || {};
          if (active) {
            setFormData({
              name: p.name || "",
              email: p.email || "",
              phone: p.phone || "",
              major: p.major || "",
              grade: p.grade || "",
              targetRank: p.targetRank || "",
              bio: p.bio || "",
            });
          }
        }
      } catch (err) {
        console.error("خطا در دریافت پروفایل:", err);
      }
    };
    fetchProfile();
    return () => (active = false);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) setProfileImage(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { response, data } = await apiJson("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error(data.error);
      const p = data.profile || {};
      updateProfile({
        name: p.name,
        email: p.email,
        phone: p.phone,
        grade: p.grade,
        major: p.major,
        targetRank: p.targetRank,
        bio: p.bio,
        studyHours: p.studyHours,
        examYear: p.examYear,
      });

      alert("اطلاعات با موفقیت ذخیره شد");
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const sectionsData = [
    { id: "profile-header", label: "پروفایل" },
    { id: "profile-edit", label: "ویرایش اطلاعات" },
    { id: "account-info", label: "اطلاعات حساب" },
  ];

  return (
    <div
      className="col-md-12 col-12 d-flex row justify-content-center"
      style={{
        direction: "rtl",
        minHeight: "100vh",
        fontFamily: "Vazir, Tahoma",
      }}
    >
      <div
        className="container-fluid px-0 col-md-12"
        style={{ maxWidth: "1200px" }}
      >
        <div style={sectionNavWrapperStyle}>
          <div style={sectionNavStyle}>
            {sectionsData.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                style={sectionNavItemStyle}
              >
                {section.label}
              </button>
            ))}
          </div>
        </div>
        <div
          id="profile-header"
          className="card mb-4 border-0 text-white"
          style={{
            ...sectionBlockStyle,
            borderRadius: "24px",
            background: "linear-gradient(135deg,#6255f5,#8f84ff)",
            boxShadow: "0 16px 50px rgba(98,85,245,0.15)",
          }}
        >
          <div className="card-body p-4 p-md-5">
            <div className="d-flex flex-column flex-md-row align-items-center gap-4">
              <div style={{ position: "relative" }}>
                <div
                  style={{
                    width: "120px",
                    height: "120px",
                    borderRadius: "50%",
                    border: "4px solid rgba(255,255,255,0.3)",
                    background: profileImage
                      ? `url(${profileImage}) center/cover`
                      : "rgba(255,255,255,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "40px",
                    fontWeight: "bold",
                  }}
                >
                  {!profileImage && (formData.name || "؟").slice(0, 1)}
                </div>

                <label
                  htmlFor="profile-upload"
                  style={{
                    position: "absolute",
                    bottom: "5px",
                    left: "5px",
                    width: "35px",
                    height: "35px",
                    background: "#fff",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: "#6255f5",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                  }}
                >
                  <Camera size={18} />
                </label>

                <input
                  id="profile-upload"
                  type="file"
                  hidden
                  onChange={handleImageUpload}
                />
              </div>

              <div className="text-center text-md-end">
                <h2 className="fw-bold mb-2">
                  {formData.name || "کاربر مهمان"}
                </h2>
                <p className="mb-2 opacity-75">
                  دانش‌آموز {formData.grade || "-"} | رشته {formData.major || "-"}
                </p>
                <span className="badge bg-light text-dark px-3 py-2 rounded-pill">
                  هدف رتبه: {formData.targetRank || "نامشخص"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div
          id="profile-edit"
          className="card border-0 shadow-sm mb-4"
          style={{ ...sectionBlockStyle, borderRadius: "20px" }}
        >
          <div className="card-body p-4">
            <div className="d-flex align-items-center gap-2 mb-4">
              <PencilLine size={22} className="text-primary" />
              <h5 className="fw-bold m-0">ویرایش پروفایل</h5>
            </div>

            <div className="row g-3">
              {[
                { label: "نام و نام خانوادگی", name: "name", type: "text" },
                { label: "ایمیل", name: "email", type: "email" },
                { label: "شماره موبایل", name: "phone", type: "tel" },
                { label: "هدف رتبه", name: "targetRank", type: "text" },
              ].map((field) => (
                <div className="col-md-6" key={field.name}>
                  <div className="mb-3">
                    <label className="small fw-bold text-muted mb-1">
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      name={field.name}
                      className="form-control"
                      value={formData[field.name]}
                      onChange={handleChange}
                      style={inputStyle}
                    />
                  </div>
                </div>
              ))}

              <div className="col-md-6">
                <div className="mb-3">
                  <label className="small fw-bold text-muted mb-1">رشته</label>
                  <select
                    name="major"
                    className="form-select"
                    value={formData.major}
                    onChange={handleChange}
                    style={inputStyle}
                  >
                    <option value="">انتخاب کنید</option>
                    <option value="ریاضی">ریاضی</option>
                    <option value="تجربی">تجربی</option>
                  </select>
                </div>
              </div>

              <div className="col-md-6">
                <div className="mb-3">
                  <label className="small fw-bold text-muted mb-1">پایه</label>
                  <select
                    name="grade"
                    className="form-select"
                    value={formData.grade}
                    onChange={handleChange}
                    style={inputStyle}
                  >
                    <option value="">انتخاب کنید</option>
                    <option value="یازدهم">یازدهم</option>
                    <option value="دوازدهم">دوازدهم</option>
                  </select>
                </div>
              </div>

              <div className="col-12">
                <div className="mb-3">
                  <label className="small fw-bold text-muted mb-1">
                    درباره من
                  </label>
                  <textarea
                    rows={3}
                    name="bio"
                    className="form-control"
                    value={formData.bio}
                    onChange={handleChange}
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>

            <div className="d-flex justify-content-end mt-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn px-4 py-2 border-0 text-white d-flex"
                style={{
                  background: "#6255f5",
                  borderRadius: "12px",
                  fontWeight: "600",
                }}
              >
                <Save size={18} className="ms-2" />
                {saving ? "در حال ذخیره..." : "ذخیره تغییرات"}
              </button>
            </div>
          </div>
        </div>

        <div
          id="account-info"
          className="card border-0 shadow-sm"
          style={{ ...sectionBlockStyle, borderRadius: "20px" }}
        >
          <div className="card-body p-4">
            <div className="d-flex align-items-center gap-2 mb-4">
              <ShieldCheck size={22} className="text-primary" />
              <h5 className="fw-bold m-0">اطلاعات حساب</h5>
            </div>

            <div className="row g-3">
              {[
                { icon: Mail, label: "ایمیل", val: formData.email },
                { icon: Phone, label: "تلفن", val: formData.phone },
                {
                  icon: School,
                  label: "پایه و رشته",
                  val: `${formData.grade} / ${formData.major}`,
                },
              ].map((item, idx) => (
                <div className="col-md-4" key={idx}>
                  <div className="p-3 border rounded-4 bg-light">
                    <item.icon size={16} className="text-primary mb-2" />
                    <div className="small fw-bold">{item.label}</div>
                    <div className="small text-truncate">
                      {item.val || "ثبت نشده"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const sectionPageTitleStyle = {
  fontSize: "1.8rem",
  fontWeight: "800",
  color: "#2b2b2b",
  marginBottom: "18px",
  padding: "8px 4px",
};

const sectionNavWrapperStyle = {
  position: "sticky",
  top: "0",
  zIndex: 100,
  background: "#fff",
  marginBottom: "20px",
};

const sectionNavStyle = {
  display: "flex",
  gap: "10px",
  overflowX: "auto",
  whiteSpace: "nowrap",
  scrollbarWidth: "thin",
};

const sectionNavItemStyle = {
  border: "none",
  background: "#f3f1ff",
  color: "#6255f5",
  padding: "10px 16px",
  borderRadius: "999px",
  fontWeight: "600",
  cursor: "pointer",
  transition: "0.2s",
  flexShrink: 0,
};

const sectionBlockStyle = {
  scrollMarginTop: "100px",
};

const inputStyle = {
  borderRadius: "12px",
  padding: "10px 15px",
  border: "1px solid #eee",
  background: "#fcfbff",
  fontSize: "0.95rem",
};
