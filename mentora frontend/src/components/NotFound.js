import React from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { Compass, DoorClosed, Book } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div
      
      className=" col-md-12 d-flex align-items-center justify-content-center h-100 "
      style={{
        direction: "rtl",
        fontFamily: "Vazir, sans-serif",
        paddingTop:"100px"
      }}
    >
      <div className="d-flex w-100 justify-content-center">
        <Col xs={11} sm={9} md={7} lg={5} xl={4}>
          <Card className=" border-0 text-center">
            <Card.Body className="p-5">

              <div className="mb-4">
                <span
                  className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center"
                  style={{ width: 70, height: 70 }}
                >
                  <Compass size={34} />
                </span>
              </div>

              <h1 className="display-2 fw-bold text-primary">404</h1>

              <h4 className="fw-bold mt-3">
                مسیر مطالعه پیدا نشد
              </h4>

              <p className="text-muted mt-3 mb-4">
                صفحه‌ای که دنبال آن هستید وجود ندارد یا منتقل شده است.
                برای ادامه مسیر یادگیری به داشبورد برگردید.
              </p>

              <div className="d-flex justify-content-center gap-2 flex-wrap">

                <Button
                  variant="primary"
                  className="d-flex align-items-center gap-2"
                  onClick={() => navigate("/home")}
                >
                  <Book size={18} />
                  داشبورد
                </Button>

                <Button
                  variant="outline-secondary"
                  className="d-flex align-items-center gap-2"
                  onClick={() => navigate("/")}
                >
                  <DoorClosed size={18} />
                  صفحه اصلی
                </Button>

              </div>

            </Card.Body>
          </Card>
        </Col>
      </div>
    </div>
  );
};

export default NotFound;
