import { useMemo, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { differenceInCalendarDays, format, subDays } from "date-fns";
import { ru } from "date-fns/locale";
import { useParams, useNavigate } from "react-router-dom";
import {
  CalendarDays,
  Check,
  Coffee,
  CreditCard,
  Lock,
  MapPin,
  ShieldCheck,
  Users,
  Wallet,
  XCircle,
} from "lucide-react";
import Header from "../../components/layout/Header.jsx";
import Footer from "../../components/layout/Footer.jsx";
import { useHotel } from "../../hooks/useQueries.js";
import useSearchStore from "../../Search/store/useSearchStore.js";

function formatMoney(value) {
  return `UZS ${Math.round(Number(value || 0)).toLocaleString("ru-RU")}`;
}

function formatDateLabel(date) {
  if (!date) return "Дата не выбрана";
  return format(date, "EEE, d MMM yyyy", { locale: ru });
}

function getStars(stars) {
  return "★".repeat(Math.max(0, Math.min(Number(stars || 0), 5)));
}

function getLocationLine(hotel) {
  return [hotel.address, hotel.city, hotel.country].filter(Boolean).join(", ");
}

function getGuestSummary(adults, children, rooms) {
  const parts = [`${adults} взрослых`];
  if (children > 0) parts.push(`${children} детей`);
  parts.push(`${rooms} номер`);
  return parts.join(" · ");
}

function FieldError({ message }) {
  if (!message) return null;
  return (
    <div style={{ marginTop: 6, fontSize: 12, color: "#d93025" }}>
      {message}
    </div>
  );
}

export default function CheckoutPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: hotelData, isLoading } = useHotel(id);
  const hotel = hotelData || null;

  const checkIn = useSearchStore((state) => state.checkIn);
  const checkOut = useSearchStore((state) => state.checkOut);
  const adults = useSearchStore((state) => state.adults);
  const children = useSearchStore((state) => state.children);
  const rooms = useSearchStore((state) => state.rooms);

  const [step, setStep] = useState(1);

  const bookingNumber = useMemo(
    () => `#BK-${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
    [],
  );

  const guestFields = ["firstName", "lastName", "email", "phone", "country"];

  const guestSchema = Yup.object({
    firstName: Yup.string().trim().required("Введите имя"),
    lastName: Yup.string().trim().required("Введите фамилию"),
    email: Yup.string()
      .trim()
      .email("Введите корректный email")
      .required("Введите email"),
    phone: Yup.string().trim().required("Введите телефон"),
    country: Yup.string().trim().required("Выберите страну"),
  });

  const paymentSchema = Yup.object({
    paymentMethod: Yup.string().required("Выберите способ оплаты"),
    cardNumber: Yup.string().when("paymentMethod", {
      is: "card",
      then: (schema) =>
        schema
          .trim()
          .required("Введите номер карты")
          .test(
            "card-number-length",
            "Введите корректный номер карты",
            (value = "") => value.replace(/\s/g, "").length === 16,
          ),
      otherwise: (schema) => schema.notRequired(),
    }),
    cardName: Yup.string().when("paymentMethod", {
      is: "card",
      then: (schema) => schema.trim().required("Введите имя на карте"),
      otherwise: (schema) => schema.notRequired(),
    }),
    cardExpiry: Yup.string().when("paymentMethod", {
      is: "card",
      then: (schema) =>
        schema
          .trim()
          .required("Введите срок действия")
          .matches(/^(0[1-9]|1[0-2])\/[0-9]{2}$/, "Формат: MM/YY"),
      otherwise: (schema) => schema.notRequired(),
    }),
    cardCvv: Yup.string().when("paymentMethod", {
      is: "card",
      then: (schema) =>
        schema
          .trim()
          .required("Введите CVV")
          .matches(/^[0-9]{3}$/, "CVV должен содержать 3 цифры"),
      otherwise: (schema) => schema.notRequired(),
    }),
  });

  const formik = useFormik({
    initialValues: {
      firstName: "Joha",
      lastName: "Salimov",
      email: "joha@example.com",
      phone: "+998 90 123 45 67",
      country: "Узбекистан",
      specialRequests: "",
      paymentMethod: "card",
      cardNumber: "",
      cardName: "",
      cardExpiry: "",
      cardCvv: "",
    },
    validateOnChange: false,
    validateOnBlur: true,
    validate: async (values) => {
      const schema =
        step === 1 ? guestSchema : step === 2 ? paymentSchema : null;
      if (!schema) return {};

      try {
        await schema.validate(values, { abortEarly: false });
        return {};
      } catch (error) {
        return error.inner.reduce((acc, issue) => {
          if (issue.path && !acc[issue.path]) acc[issue.path] = issue.message;
          return acc;
        }, {});
      }
    },
    onSubmit: () => setStep(3),
  });

  const nights = Math.max(
    differenceInCalendarDays(checkOut || new Date(), checkIn || new Date()),
    1,
  );
  const roomPrice = Number(hotel?.price || 620000);
  const subtotal = roomPrice * nights * Math.max(rooms, 1);
  const geniusDiscount = hotel?.genius ? Math.round(subtotal * 0.1) : 0;
  const taxes = Math.round((subtotal - geniusDiscount) * 0.12);
  const grandTotal = subtotal - geniusDiscount + taxes;
  const cancelUntil = checkIn ? formatDateLabel(subDays(checkIn, 1)) : null;
  const locationLine = hotel ? getLocationLine(hotel) : "";

  const inputStyle = {
    width: "100%",
    padding: "11px 14px",
    border: "1px solid var(--booking-border)",
    borderRadius: 6,
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
    background: "#fff",
  };

  const labelStyle = {
    fontSize: 13,
    fontWeight: 700,
    color: "#1a1a1a",
    display: "block",
    marginBottom: 6,
  };

  const cardStyle = {
    background: "#fff",
    borderRadius: 8,
    border: "1px solid var(--booking-border)",
    padding: 20,
  };

  const showFieldError = (field) =>
    formik.touched[field] && formik.errors[field] ? formik.errors[field] : "";

  const markTouched = async (fields) => {
    await formik.setTouched(
      fields.reduce((acc, field) => {
        acc[field] = true;
        return acc;
      }, {}),
      true,
    );
  };

  const handleDetailsContinue = async () => {
    await markTouched(guestFields);
    const errors = await formik.validateForm();
    const hasGuestErrors = guestFields.some((field) => Boolean(errors[field]));
    if (!hasGuestErrors) setStep(2);
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", background: "#f5f5f5" }}>
        <Header />
        <div
          style={{
            maxWidth: 900,
            margin: "40px auto",
            padding: "0 16px",
            textAlign: "center",
            color: "#888",
          }}
        >
          Загрузка...
        </div>
        <Footer />
      </div>
    );
  }

  if (!hotel) {
    return (
      <div style={{ minHeight: "100vh", background: "#f5f5f5" }}>
        <Header />
        <div
          style={{
            maxWidth: 800,
            margin: "40px auto",
            padding: "0 16px",
            textAlign: "center",
          }}
        >
          <p>Отель не найден.</p>
          <button
            onClick={() => navigate("/")}
            style={{
              marginTop: 16,
              padding: "10px 24px",
              background: "#0071c2",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            На главную
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5" }}>
      <Header />

      <div className="page-shell">
        <div className="checkout-steps">
          {[
            { n: 1, label: "Ваши данные" },
            { n: 2, label: "Оплата" },
            { n: 3, label: "Подтверждение" },
          ].map((item, index) => (
            <div
              key={item.n}
              className="flex items-center"
              style={{ flex: index < 2 ? 1 : "none" }}
            >
              <div className="flex items-center" style={{ gap: 10 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background:
                      step >= item.n ? "var(--booking-blue)" : "#e0e0e0",
                    color: step >= item.n ? "#fff" : "#999",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: 14,
                  }}
                >
                  {step > item.n ? <Check size={16} /> : item.n}
                </div>
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: step === item.n ? 700 : 400,
                    color: step >= item.n ? "#333" : "#999",
                  }}
                >
                  {item.label}
                </span>
              </div>
              {index < 2 && (
                <div
                  style={{
                    flex: 1,
                    height: 1,
                    background:
                      step > item.n ? "var(--booking-blue)" : "#e0e0e0",
                    margin: "0 12px",
                  }}
                />
              )}
            </div>
          ))}
        </div>

        <div className="split-layout">
          <aside className="sidebar-panel" style={{ width: 360 }}>
            <div
              style={{ position: "sticky", top: 20, display: "grid", gap: 16 }}
            >
              <div style={{ ...cardStyle, padding: 0, overflow: "hidden" }}>
                <img
                  src={hotel.image}
                  alt={hotel.name}
                  style={{ width: "100%", height: 220, objectFit: "cover" }}
                  onError={(event) => {
                    event.currentTarget.src = `https://picsum.photos/seed/${hotel.id}/720/480`;
                  }}
                />

                <div style={{ padding: 20 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      flexWrap: "wrap",
                      marginBottom: 8,
                    }}
                  >
                    {!!hotel.stars && (
                      <span
                        style={{
                          color: "#f5a623",
                          fontSize: 14,
                          letterSpacing: 2,
                        }}
                      >
                        {getStars(hotel.stars)}
                      </span>
                    )}
                    {hotel.type && (
                      <span
                        style={{
                          border: "1px solid var(--booking-border)",
                          borderRadius: 999,
                          padding: "3px 10px",
                          fontSize: 11,
                          color: "#555",
                        }}
                      >
                        {hotel.type}
                      </span>
                    )}
                  </div>

                  <div
                    style={{
                      fontSize: 22,
                      fontWeight: 800,
                      lineHeight: 1.25,
                      marginBottom: 10,
                    }}
                  >
                    {hotel.name}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 8,
                      fontSize: 13,
                      color: "#555",
                      marginBottom: 14,
                    }}
                  >
                    <MapPin
                      size={16}
                      color="#0071c2"
                      style={{ flexShrink: 0, marginTop: 1 }}
                    />
                    <span>
                      {locationLine || hotel.location || "Адрес уточняется"}
                    </span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 12, color: "#6b6b6b" }}>
                        Оценка гостей
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>
                        {hotel.ratingLabel || "Очень хорошо"}
                      </div>
                    </div>
                    <div
                      style={{
                        background: "#003580",
                        color: "#fff",
                        borderRadius: "6px 6px 6px 0",
                        padding: "8px 10px",
                        minWidth: 52,
                        textAlign: "center",
                        fontWeight: 800,
                        fontSize: 16,
                      }}
                    >
                      {Number(hotel.rating || 0)
                        .toFixed(1)
                        .replace(".", ",")}
                    </div>
                  </div>
                </div>
              </div>

              <div style={cardStyle}>
                <div
                  style={{ fontSize: 18, fontWeight: 800, marginBottom: 16 }}
                >
                  Ваше бронирование
                </div>

                <div style={{ display: "grid", gap: 16 }}>
                  <div style={{ display: "flex", gap: 10 }}>
                    <CalendarDays
                      size={18}
                      color="#0071c2"
                      style={{ flexShrink: 0, marginTop: 2 }}
                    />
                    <div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "#6b6b6b",
                          marginBottom: 4,
                        }}
                      >
                        Даты
                      </div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>
                        {formatDateLabel(checkIn)}
                      </div>
                      <div style={{ fontSize: 13, color: "#555" }}>
                        — {formatDateLabel(checkOut)}
                      </div>
                      <div
                        style={{ fontSize: 12, color: "#6b6b6b", marginTop: 4 }}
                      >
                        {nights}{" "}
                        {nights === 1 ? "ночь" : nights < 5 ? "ночи" : "ночей"}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 10 }}>
                    <Users
                      size={18}
                      color="#0071c2"
                      style={{ flexShrink: 0, marginTop: 2 }}
                    />
                    <div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "#6b6b6b",
                          marginBottom: 4,
                        }}
                      >
                        Гости
                      </div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>
                        {getGuestSummary(adults, children, rooms)}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 10 }}>
                    <Wallet
                      size={18}
                      color="#0071c2"
                      style={{ flexShrink: 0, marginTop: 2 }}
                    />
                    <div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "#6b6b6b",
                          marginBottom: 4,
                        }}
                      >
                        Размещение
                      </div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>
                        {hotel.type || "Стандартный номер"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div style={cardStyle}>
                <div
                  style={{ fontSize: 18, fontWeight: 800, marginBottom: 16 }}
                >
                  Сводка по цене
                </div>

                <div style={{ display: "grid", gap: 10, fontSize: 14 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                    }}
                  >
                    <span>
                      {formatMoney(roomPrice)} × {nights} × {rooms}
                    </span>
                    <span>{formatMoney(subtotal)}</span>
                  </div>

                  {geniusDiscount > 0 && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 12,
                        color: "#008009",
                      }}
                    >
                      <span>Genius-скидка</span>
                      <span>−{formatMoney(geniusDiscount)}</span>
                    </div>
                  )}

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      color: "#6b6b6b",
                    }}
                  >
                    <span>Налоги и сборы</span>
                    <span>{formatMoney(taxes)}</span>
                  </div>

                  <div
                    style={{
                      borderTop: "1px solid var(--booking-border)",
                      paddingTop: 12,
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      fontWeight: 800,
                      fontSize: 19,
                    }}
                  >
                    <span>Итого</span>
                    <span>{formatMoney(grandTotal)}</span>
                  </div>
                </div>

                <div style={{ marginTop: 16, display: "grid", gap: 10 }}>
                  {hotel.breakfast && (
                    <div
                      style={{
                        display: "flex",
                        gap: 10,
                        fontSize: 13,
                        color: "#333",
                      }}
                    >
                      <Coffee
                        size={16}
                        color="#008009"
                        style={{ flexShrink: 0, marginTop: 1 }}
                      />
                      <span>Завтрак доступен в выбранном тарифе</span>
                    </div>
                  )}
                  {hotel.freeCancel && (
                    <div
                      style={{
                        display: "flex",
                        gap: 10,
                        fontSize: 13,
                        color: "#333",
                      }}
                    >
                      <XCircle
                        size={16}
                        color="#008009"
                        style={{ flexShrink: 0, marginTop: 1 }}
                      />
                      <span>
                        Бесплатная отмена{" "}
                        {cancelUntil ? `до ${cancelUntil}` : "доступна"}
                      </span>
                    </div>
                  )}
                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                      fontSize: 13,
                      color: "#333",
                    }}
                  >
                    <ShieldCheck
                      size={16}
                      color="#0071c2"
                      style={{ flexShrink: 0, marginTop: 1 }}
                    />
                    <span>Безопасное оформление и защита платежа</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <div style={{ flex: 1, minWidth: 0 }}>
            {step === 1 && (
              <form
                onSubmit={formik.handleSubmit}
                style={{ display: "grid", gap: 16 }}
              >
                <div style={cardStyle}>
                  <div
                    style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}
                  >
                    Введите данные гостя
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      color: "#6b6b6b",
                      marginBottom: 20,
                      lineHeight: 1.55,
                    }}
                  >
                    Мы используем эти данные для подтверждения бронирования и
                    связи с объектом размещения.
                  </div>

                  <div className="form-grid-2" style={{ marginBottom: 16 }}>
                    <div>
                      <label style={labelStyle}>Имя *</label>
                      <input
                        name="firstName"
                        value={formik.values.firstName}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        style={inputStyle}
                      />
                      <FieldError message={showFieldError("firstName")} />
                    </div>
                    <div>
                      <label style={labelStyle}>Фамилия *</label>
                      <input
                        name="lastName"
                        value={formik.values.lastName}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        style={inputStyle}
                      />
                      <FieldError message={showFieldError("lastName")} />
                    </div>
                    <div>
                      <label style={labelStyle}>Email *</label>
                      <input
                        name="email"
                        type="email"
                        value={formik.values.email}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        style={inputStyle}
                      />
                      <FieldError message={showFieldError("email")} />
                    </div>
                    <div>
                      <label style={labelStyle}>Телефон *</label>
                      <input
                        name="phone"
                        value={formik.values.phone}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        style={inputStyle}
                      />
                      <FieldError message={showFieldError("phone")} />
                    </div>
                    <div style={{ gridColumn: "1/-1" }}>
                      <label style={labelStyle}>Страна / регион *</label>
                      <select
                        name="country"
                        value={formik.values.country}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        style={inputStyle}
                      >
                        {[
                          "Узбекистан",
                          "Россия",
                          "Казахстан",
                          "Турция",
                          "ОАЭ",
                          "Грузия",
                        ].map((country) => (
                          <option key={country}>{country}</option>
                        ))}
                      </select>
                      <FieldError message={showFieldError("country")} />
                    </div>
                  </div>
                </div>

                <div style={cardStyle}>
                  <div
                    style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}
                  >
                    Особые пожелания
                  </div>
                  <div
                    style={{ fontSize: 13, color: "#6b6b6b", marginBottom: 14 }}
                  >
                    Например: поздний заезд, одна большая кровать, верхний этаж,
                    трансфер.
                  </div>
                  <textarea
                    name="specialRequests"
                    value={formik.values.specialRequests}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    rows={4}
                    placeholder="Напишите пожелания по заселению или номеру"
                    style={{
                      ...inputStyle,
                      resize: "vertical",
                      fontFamily: "inherit",
                    }}
                  />
                </div>

                <div style={cardStyle}>
                  <div
                    style={{ fontSize: 20, fontWeight: 800, marginBottom: 12 }}
                  >
                    Что дальше
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gap: 10,
                      fontSize: 14,
                      color: "#333",
                    }}
                  >
                    <div>
                      • После следующего шага вы выберете способ оплаты.
                    </div>
                    <div>
                      • Подтверждение бронирования отправится на ваш email.
                    </div>
                    <div>
                      • Некоторые условия могут зависеть от выбранного тарифа
                      отеля.
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleDetailsContinue}
                  style={{
                    width: "100%",
                    background: "var(--booking-blue-light)",
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    padding: "15px 18px",
                    fontSize: 16,
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  Продолжить к оплате
                </button>
              </form>
            )}

            {step === 2 && (
              <form
                onSubmit={formik.handleSubmit}
                style={{ display: "grid", gap: 16 }}
              >
                <div style={cardStyle}>
                  <div
                    style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}
                  >
                    Выберите способ оплаты
                  </div>
                  <div
                    style={{ fontSize: 14, color: "#6b6b6b", marginBottom: 20 }}
                  >
                    Платёжные данные используются только для оформления
                    бронирования и защищены шифрованием.
                  </div>

                  <div style={{ display: "grid", gap: 10, marginBottom: 20 }}>
                    {[
                      {
                        key: "card",
                        label: "Банковская карта",
                        note: "Visa, MasterCard и другие карты",
                      },
                      {
                        key: "cash",
                        label: "Оплата при заселении",
                        note: "Если тариф поддерживает оплату на месте",
                      },
                      {
                        key: "click",
                        label: "Click",
                        note: "Быстрая онлайн-оплата",
                      },
                      {
                        key: "payme",
                        label: "Payme",
                        note: "Оплата через Payme",
                      },
                    ].map((option) => (
                      <label
                        key={option.key}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 12,
                          padding: "14px 16px",
                          border: `2px solid ${formik.values.paymentMethod === option.key ? "var(--booking-blue-light)" : "var(--booking-border)"}`,
                          borderRadius: 8,
                          cursor: "pointer",
                          background:
                            formik.values.paymentMethod === option.key
                              ? "#ebf3ff"
                              : "#fff",
                        }}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={formik.values.paymentMethod === option.key}
                          onChange={() =>
                            formik.setFieldValue("paymentMethod", option.key)
                          }
                          onBlur={formik.handleBlur}
                          style={{ marginTop: 2 }}
                        />
                        <div>
                          <div
                            style={{
                              fontSize: 14,
                              fontWeight: 700,
                              color: "#1a1a1a",
                              marginBottom: 2,
                            }}
                          >
                            {option.label}
                          </div>
                          <div style={{ fontSize: 12, color: "#6b6b6b" }}>
                            {option.note}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                  <FieldError message={showFieldError("paymentMethod")} />

                  {formik.values.paymentMethod === "card" && (
                    <div className="form-grid-2">
                      <div style={{ gridColumn: "1/-1" }}>
                        <label style={labelStyle}>Номер карты</label>
                        <div style={{ position: "relative" }}>
                          <input
                            name="cardNumber"
                            value={formik.values.cardNumber}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            placeholder="0000 0000 0000 0000"
                            maxLength={19}
                            style={{ ...inputStyle, paddingRight: 44 }}
                          />
                          <CreditCard
                            size={18}
                            color="#888"
                            style={{
                              position: "absolute",
                              right: 12,
                              top: "50%",
                              transform: "translateY(-50%)",
                            }}
                          />
                        </div>
                        <FieldError message={showFieldError("cardNumber")} />
                      </div>
                      <div style={{ gridColumn: "1/-1" }}>
                        <label style={labelStyle}>Имя на карте</label>
                        <input
                          name="cardName"
                          value={formik.values.cardName}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          placeholder="IVAN IVANOV"
                          style={inputStyle}
                        />
                        <FieldError message={showFieldError("cardName")} />
                      </div>
                      <div>
                        <label style={labelStyle}>Срок действия</label>
                        <input
                          name="cardExpiry"
                          value={formik.values.cardExpiry}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          placeholder="MM/YY"
                          maxLength={5}
                          style={inputStyle}
                        />
                        <FieldError message={showFieldError("cardExpiry")} />
                      </div>
                      <div>
                        <label style={labelStyle}>CVV</label>
                        <input
                          name="cardCvv"
                          type="password"
                          value={formik.values.cardCvv}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          placeholder="•••"
                          maxLength={3}
                          style={inputStyle}
                        />
                        <FieldError message={showFieldError("cardCvv")} />
                      </div>
                    </div>
                  )}
                </div>

                <div className="checkout-actions">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    style={{
                      flex: 1,
                      background: "#fff",
                      color: "var(--booking-blue)",
                      border: "1px solid var(--booking-blue)",
                      borderRadius: 6,
                      padding: "14px",
                      fontSize: 15,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Назад
                  </button>
                  <button
                    type="submit"
                    style={{
                      flex: 2,
                      background: "var(--booking-blue-light)",
                      color: "#fff",
                      border: "none",
                      borderRadius: 6,
                      padding: "14px",
                      fontSize: 16,
                      fontWeight: 800,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                  >
                    <Lock size={16} /> Оплатить {formatMoney(grandTotal)}
                  </button>
                </div>
              </form>
            )}

            {step === 3 && (
              <div style={{ ...cardStyle, padding: 40, textAlign: "center" }}>
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: "50%",
                    background: "#e8f5e9",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 20px",
                  }}
                >
                  <Check size={36} color="#00a550" />
                </div>

                <div
                  style={{ fontSize: 26, fontWeight: 800, marginBottom: 10 }}
                >
                  Бронирование подтверждено
                </div>
                <div
                  style={{
                    fontSize: 15,
                    color: "#555",
                    marginBottom: 24,
                    lineHeight: 1.6,
                  }}
                >
                  Номер бронирования: <b>{bookingNumber}</b>
                  <br />
                  Подтверждение отправлено на <b>{formik.values.email}</b>
                </div>

                <div
                  style={{
                    background: "#f9f9f9",
                    borderRadius: 8,
                    padding: 20,
                    marginBottom: 24,
                    textAlign: "left",
                  }}
                >
                  <div
                    className="confirm-grid-2"
                    style={{ gap: 12, fontSize: 14 }}
                  >
                    <div>
                      <span style={{ color: "#888" }}>Отель:</span>{" "}
                      <b>{hotel.name}</b>
                    </div>
                    <div>
                      <span style={{ color: "#888" }}>Заезд:</span>{" "}
                      <b>{formatDateLabel(checkIn)}</b>
                    </div>
                    <div>
                      <span style={{ color: "#888" }}>Гость:</span>{" "}
                      <b>
                        {formik.values.firstName} {formik.values.lastName}
                      </b>
                    </div>
                    <div>
                      <span style={{ color: "#888" }}>Выезд:</span>{" "}
                      <b>{formatDateLabel(checkOut)}</b>
                    </div>
                    <div>
                      <span style={{ color: "#888" }}>Гости:</span>{" "}
                      <b>{getGuestSummary(adults, children, rooms)}</b>
                    </div>
                    <div>
                      <span style={{ color: "#888" }}>Итого:</span>{" "}
                      <b>{formatMoney(grandTotal)}</b>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => navigate("/")}
                  style={{
                    background: "var(--booking-blue-light)",
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    padding: "12px 32px",
                    fontSize: 15,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  На главную
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
