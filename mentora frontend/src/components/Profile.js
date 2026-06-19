import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Form, Badge } from "react-bootstrap";
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
} from "lucide-react";
import ProfileSidebar from "./ProfileSideBar";

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
    return () => {
      active = false;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { response, data } = await apiJson("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        throw new Error(data.error || "ذخیره اطلاعات با مشکل مواجه شد.");
      }
      const p = data.profile || {};
      updateProfile({
        name: p.name,
        grade: p.grade,
        major: p.major,
        targetRank: p.targetRank,
        studyHours: p.studyHours,
      });
      alert("اطلاعات با موفقیت ذخیره شد");
    } catch (err) {
      alert(err.message || "خطا در ذخیره اطلاعات.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ direction: "rtl", background: "#f8f7ff", minHeight: "100vh", fontFamily: "Vazir, sans-serif" }}>
      <div style={{ display: "flex" }}>
        <ProfileSidebar />

        <div style={{ flexGrow: 1, padding: "24px" }}>
          <Container fluid>
            {/* Header */}
            <Card
              id="overview"
              style={{
                border: "none",
                borderRadius: "24px",
                overflow: "hidden",
                marginBottom: "24px",
                boxShadow: "0 16px 50px rgba(98,85,245,0.08)",
              }}
            >
              <div
                style={{
                  background: "linear-gradient(135deg, #6255f5, #8f84ff)",
                  padding: "32px",
                  color: "#fff",
                }}
              >
                <Row className="align-items-center g-4">
                  <Col md={12}>
                    <div className="d-flex align-items-center gap-4 flex-wrap">
                      <div style={{ position: "relative" }}>
                        <div
                          style={{
                            width: "110px",
                            height: "110px",
                            borderRadius: "50%",
                            border: "4px solid rgba(255,255,255,0.6)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "48px",
                            fontWeight: "900",
                            color: "#fff",
                            background: profileImage
                              ? `center / cover no-repeat url(${profileImage})`
                              : "rgba(255,255,255,0.2)",
                            lineHeight: "1",
                            overflow: "hidden",
                          }}
                        >
                          {profileImage ? "" : (formData.name || "؟").slice(0, 1)}
                        </div>

                        <label
                          htmlFor="profile-upload"
                          style={{
                            position: "absolute",
                            bottom: "4px",
                            left: "4px",
                            width: "36px",
                            height: "36px",
                            borderRadius: "50%",
                            background: "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            color: "#6255f5",
                            boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
                          }}
                        >
                          <Camera size={18} />
                        </label>
                        <input
                          id="profile-upload"
                          type="file"
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={handleImageUpload}
                        />
                      </div>

                      <div>
                        <h2 style={{ fontWeight: "900", marginBottom: "8px" }}>{formData.name}</h2>
                        <div style={{ opacity: 0.9, marginBottom: "6px" }}>
                          دانش‌آموز {formData.grade} | رشته {formData.major}
                        </div>
                        <Badge
                          bg=""
                          style={{
                            background: "rgba(255,255,255,0.18)",
                            color: "#fff",
                            padding: "8px 14px",
                            borderRadius: "999px",
                            fontWeight: "700",
                          }}
                        >
                          هدف رتبه: {formData.targetRank}
                        </Badge>
                      </div>
                    </div>
                  </Col>

                </Row>
              </div>
            </Card>

            {/* Edit profile */}
            <Card
              style={sectionCardStyle}
              id="settings"
              className="mb-4"
            >
              <Card.Body style={{ padding: "24px" }}>
                <div className="d-flex align-items-center gap-2 mb-4">
                  <PencilLine size={20} color="#6255f5" />
                  <h5 style={{ margin: 0, fontWeight: "800", color: "#2a1f68" }}>
                    ویرایش اطلاعات کاربری
                  </h5>
                </div>

                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>نام و نام خانوادگی</Form.Label>
                      <Form.Control
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        style={inputStyle}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>ایمیل</Form.Label>
                      <Form.Control
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        style={inputStyle}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>شماره موبایل</Form.Label>
                      <Form.Control
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        style={inputStyle}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>رشته</Form.Label>
                      <Form.Select
                        name="major"
                        value={formData.major}
                        onChange={handleChange}
                        style={inputStyle}
                      >
                        <option value="">انتخاب کنید</option>
                        <option value="ریاضی">ریاضی</option>
                        <option value="تجربی">تجربی</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>پایه</Form.Label>
                      <Form.Select
                        name="grade"
                        value={formData.grade}
                        onChange={handleChange}
                        style={inputStyle}
                      >
                        <option value="">انتخاب کنید</option>
                        <option value="یازدهم">یازدهم</option>
                        <option value="دوازدهم">دوازدهم</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>هدف رتبه</Form.Label>
                      <Form.Control
                        name="targetRank"
                        value={formData.targetRank}
                        onChange={handleChange}
                        style={inputStyle}
                      />
                    </Form.Group>
                  </Col>

                  <Col xs={12}>
                    <Form.Group>
                      <Form.Label>درباره من</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={4}
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        style={inputStyle}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <div className="mt-4">
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    style={{
                      background: "#6255f5",
                      border: "none",
                      borderRadius: "12px",
                      padding: "10px 18px",
                      fontWeight: "700",
                    }}
                  >
                    <Save size={18} className="ms-2" />
                    {saving ? "در حال ذخیره..." : "ذخیره تغییرات"}
                  </Button>
                </div>
              </Card.Body>
            </Card>

            {/* Security */}
            <Card style={sectionCardStyle} id="security">
              <Card.Body style={{ padding: "24px" }}>
                <div className="d-flex align-items-center gap-2 mb-4">
                  <ShieldCheck size={20} color="#6255f5" />
                  <h5 style={{ margin: 0, fontWeight: "800", color: "#2a1f68" }}>
                    امنیت حساب
                  </h5>
                </div>

                <Row className="g-3">
                  <Col md={6}>
                    <Card style={miniCardStyle}>
                      <Card.Body>
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <Mail size={16} color="#6255f5" />
                          <strong>ایمیل تایید شده</strong>
                        </div>
                        <div style={{ color: "#6f6898" }}>{formData.email}</div>
                      </Card.Body>
                    </Card>
                  </Col>

                  <Col md={6}>
                    <Card style={miniCardStyle}>
                      <Card.Body>
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <Phone size={16} color="#6255f5" />
                          <strong>شماره تماس</strong>
                        </div>
                        <div style={{ color: "#6f6898" }}>{formData.phone}</div>
                      </Card.Body>
                    </Card>
                  </Col>

                  <Col md={12}>
                    <Card style={miniCardStyle}>
                      <Card.Body>
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <School size={16} color="#6255f5" />
                          <strong>وضعیت تحصیلی</strong>
                        </div>
                        <div style={{ color: "#6f6898" }}>
                          {formData.grade} - رشته {formData.major} - هدف رتبه {formData.targetRank}
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Container>
        </div>
      </div>
    </div>
  );
}

const sectionCardStyle = {
  border: "none",
  borderRadius: "24px",
  boxShadow: "0 12px 35px rgba(98,85,245,0.07)",
  background: "#fff",
};

const miniCardStyle = {
  border: "1px solid #f0edff",
  borderRadius: "18px",
  background: "#fcfbff",
};

const inputStyle = {
  borderRadius: "12px",
  padding: "12px 14px",
  border: "1px solid #e7e2ff",
  background: "#fcfbff",
};
