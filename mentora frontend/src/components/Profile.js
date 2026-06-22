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
        grade: p.grade,
        major: p.major,
        targetRank: p.targetRank,
        studyHours: p.studyHours,
      });

      alert("اطلاعات با موفقیت ذخیره شد");
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ direction: "rtl", background: "#f8f7ff", minHeight: "100vh", fontFamily: "Vazir" }}>
      <div style={{ display: "flex" }}>

        <ProfileSidebar />

        <div style={{ flexGrow: 1, padding: "28px" }}>
          <Container fluid>

            {/* HEADER */}
            <Card
              id="overview"
              className="mb-4 border-0"
              style={{
                borderRadius: "24px",
                overflow: "hidden",
                boxShadow: "0 16px 50px rgba(98,85,245,0.08)",
              }}
            >
              <div
                style={{
                  background: "linear-gradient(135deg,#6255f5,#8f84ff)",
                  padding: "36px",
                  color: "#fff",
                }}
              >
                <Row className="align-items-center g-4">

                  <Col md={12}>
                    <div className="d-flex align-items-center gap-4 flex-wrap">

                      {/* Avatar */}
                      <div style={{ position: "relative" }}>
                        <div
                          style={{
                            width: "110px",
                            height: "110px",
                            borderRadius: "50%",
                            border: "4px solid rgba(255,255,255,0.6)",
                            background: profileImage
                              ? `center/cover url(${profileImage})`
                              : "rgba(255,255,255,0.2)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "44px",
                            fontWeight: "900",
                          }}
                        >
                          {!profileImage && (formData.name || "؟").slice(0, 1)}
                        </div>

                        <label
                          htmlFor="profile-upload"
                          style={{
                            position: "absolute",
                            bottom: 4,
                            left: 4,
                            width: 36,
                            height: 36,
                            borderRadius: "50%",
                            background: "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            color: "#6255f5",
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

                      {/* Info */}
                      <div>

                        <h2 style={{ fontWeight: 900, marginBottom: 6 }}>
                          {formData.name || "نام کاربر"}
                        </h2>

                        <div style={{ opacity: 0.9 }}>
                          دانش‌آموز {formData.grade || "-"} | رشته {formData.major || "-"}
                        </div>

                        <Badge
                          style={{
                            marginTop: 8,
                            background: "rgba(255,255,255,0.2)",
                            padding: "8px 14px",
                            borderRadius: "999px",
                          }}
                        >
                          هدف رتبه: {formData.targetRank || "-"}
                        </Badge>

                      </div>
                    </div>
                  </Col>

                </Row>
              </div>
            </Card>


            {/* EDIT PROFILE */}
            <Card style={sectionCardStyle} id="settings" className="mb-4">
              <Card.Body className="p-4">

                <div className="d-flex align-items-center gap-2 mb-4">
                  <PencilLine size={20} color="#6255f5" />
                  <h5 className="fw-bold m-0">ویرایش اطلاعات کاربری</h5>
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

                <div className="d-flex justify-content-end mt-4">
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    style={{
                      background: "#6255f5",
                      border: "none",
                      borderRadius: "12px",
                      padding: "10px 22px",
                      fontWeight: 700,
                    }}
                  >
                    <Save size={18} className="ms-2" />
                    {saving ? "در حال ذخیره..." : "ذخیره تغییرات"}
                  </Button>
                </div>

              </Card.Body>
            </Card>


            {/* SECURITY */}
            <Card style={sectionCardStyle} id="security">
              <Card.Body className="p-4">

                <div className="d-flex align-items-center gap-2 mb-4">
                  <ShieldCheck size={20} color="#6255f5" />
                  <h5 className="fw-bold m-0">امنیت حساب</h5>
                </div>

                <Row className="g-3">

                  <Col md={6}>
                    <Card style={miniCardStyle}>
                      <Card.Body>
                        <Mail size={16} color="#6255f5" className="mb-2" />
                        <div className="fw-bold">ایمیل</div>
                        <div className="text-muted">{formData.email}</div>
                      </Card.Body>
                    </Card>
                  </Col>

                  <Col md={6}>
                    <Card style={miniCardStyle}>
                      <Card.Body>
                        <Phone size={16} color="#6255f5" className="mb-2" />
                        <div className="fw-bold">شماره تماس</div>
                        <div className="text-muted">{formData.phone}</div>
                      </Card.Body>
                    </Card>
                  </Col>

                  <Col md={12}>
                    <Card style={miniCardStyle}>
                      <Card.Body>
                        <School size={16} color="#6255f5" className="mb-2" />
                        <div className="fw-bold">وضعیت تحصیلی</div>
                        <div className="text-muted">
                          {formData.grade} - {formData.major} - هدف رتبه {formData.targetRank}
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
  borderRadius: "22px",
  boxShadow: "0 10px 35px rgba(98,85,245,0.07)",
};

const miniCardStyle = {
  border: "1px solid #f0edff",
  borderRadius: "16px",
  background: "#fcfbff",
};

const inputStyle = {
  borderRadius: "12px",
  padding: "12px 14px",
  border: "1px solid #e7e2ff",
  background: "#fcfbff",
};
