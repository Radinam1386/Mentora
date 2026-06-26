import React, { useState } from "react";
import { Check, Crown } from "lucide-react";

const baseMonthlyPrice = 300000;

const plansData = [
  { id: 1, name: "۱ ماهه", months: 1, price: baseMonthlyPrice, highlight: false },
  { id: 2, name: "۳ ماهه", months: 3, price: baseMonthlyPrice * 3 * 0.97, highlight: false },
  { id: 3, name: "۶ ماهه", months: 6, price: baseMonthlyPrice * 6 * 0.95, highlight: true },
  { id: 4, name: "۱ ساله", months: 12, price: baseMonthlyPrice * 12 * 0.90, highlight: false },
];

const features = [
  "دسترسی کامل به تایمر حرفه‌ای",
  "گزارش پیشرفته و نمودارهای تحلیلی",
  "Planning Assistant هوشمند",
  "Tutor هوشمند نامحدود",
  "ذخیره تاریخچه و تحلیل عملکرد",
];

const formatPrice = (price) =>
  Math.round(price).toLocaleString("fa-IR") + " تومان";

export default function SubscriptionPlans() {

  const [hoveredCard, setHoveredCard] = useState(null);
  const [hoveredBtn, setHoveredBtn] = useState(null);

  return (
    <div
      className="container py-4 py-md-5"
      style={{ direction: "rtl", fontFamily: "Vazir, Tahoma, sans-serif" }}
    >
      <div className="text-center mb-4 mb-md-5">
        <h2 className="fw-bold fs-4 fs-md-2">پلن‌های اشتراک منتورا</h2>
        <p className="text-muted small small-md">
          با انتخاب پلن بلندمدت، تخفیف بیشتری بگیر 🚀
        </p>
      </div>

      <div className="row g-3 g-md-4 justify-content-center">

        {plansData.map((plan) => {

          const isHovered = hoveredCard === plan.id;
          const isBtnHovered = hoveredBtn === plan.id;

          return (
            <div key={plan.id} className="col-12 col-sm-6 col-lg-3">

              <div
                className="card h-100 border-2 shadow-sm position-relative"
                onMouseEnter={() => setHoveredCard(plan.id)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  borderRadius: "22px",
                  border: plan.highlight
                    ? "2px solid #6255f5"
                    : "1px solid #eee",

                  transform: isHovered
                    ? "translateY(-10px)"
                    : plan.highlight
                    ? "scale(1.03)"
                    : "scale(1)",

                  transition: "all .3s ease",

                  boxShadow: isHovered
                    ? "0 20px 50px rgba(98,85,245,0.25)"
                    : "0 8px 20px rgba(0,0,0,0.05)",

                  background: plan.highlight
                    ? "linear-gradient(180deg,#ffffff 0%,#f7f6ff 100%)"
                    : "#fff",
                }}
              >

                {plan.highlight && (
                  <div
                    className="position-absolute top-0 start-50 translate-middle-x px-3 px-md-4 py-1"
                    style={{
                      background: "#6255f5",
                      color: "white",
                      borderRadius: "0 0 12px 12px",
                      fontSize: "11px",
                      fontWeight: "bold",
                    }}
                  >
                    <Crown size={14} className="me-1" />
                    پیشنهاد ویژه
                  </div>
                )}

                <div className="card-body p-3 p-md-4 text-center">

                  <h5 className="fw-bold mb-2 mb-md-3 fs-6 fs-md-5">
                    {plan.name}
                  </h5>

                  <h4
                    className="fw-bolder fs-5 fs-md-4"
                    style={{ color: "#6255f5" }}
                  >
                    {formatPrice(plan.price)}
                  </h4>

                  <p className="text-muted small mb-3 mb-md-4">
                    {formatPrice(plan.price / plan.months)} / ماه
                  </p>

                  <ul className="list-unstyled text-end mb-3 mb-md-4">

                    {features.map((feature, index) => (

                      <li
                        key={index}
                        className="mb-2 d-flex align-items-center"
                        style={{ fontSize: "13px" }}
                      >

                        <Check
                          size={16}
                          style={{ color: "#10b981" }}
                          className="me-2 flex-shrink-0"
                        />

                        <span>{feature}</span>

                      </li>
                    ))}

                  </ul>

                  <button
                    className="btn w-100 fw-bold"
                    onMouseEnter={() => setHoveredBtn(plan.id)}
                    onMouseLeave={() => setHoveredBtn(null)}
                    style={{
                      borderRadius: "12px",
                      border: "1px solid #6255f5",

                      background:
                        isBtnHovered || plan.highlight
                          ? "#6255f5"
                          : "transparent",

                      color:
                        isBtnHovered || plan.highlight
                          ? "#fff"
                          : "#6255f5",

                      transition: "all .25s ease",

                      transform: isBtnHovered
                        ? "scale(1.05)"
                        : "scale(1)",

                      boxShadow: isBtnHovered
                        ? "0 10px 25px rgba(98,85,245,0.35)"
                        : "none",
                    }}
                  >
                    انتخاب پلن
                  </button>

                </div>
              </div>

            </div>
          );
        })}
      </div>

      <div className="text-center mt-4 mt-md-5">
        <p className="text-muted small">
          پرداخت امن • فعال‌سازی فوری • امکان تمدید در هر زمان
        </p>
      </div>

    </div>
  );
}
