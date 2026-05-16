import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/layout/Header.jsx";
import Footer from "../../components/layout/Footer.jsx";
import { ChevronDown, ChevronUp } from "lucide-react";

const BOOKINGS_NEEDED = 5;
const USER_BOOKINGS = 0;

const LEVEL1_BENEFITS = [
  {
    icon: "🏷️",
    title: "Скидки 10% на жильё",
    desc: "Применяется без учёта налогов и сборов",
  },
  {
    icon: "🚗",
    title: "Скидка 10% на аренду автомобилей",
    desc: "Распространяется только на стоимость бронирования автомобиля",
  },
];
const LEVEL2_BENEFITS = [
  {
    icon: "🏷️",
    title: "Скидки 10–15% на жильё",
    desc: "Применяется без учёта налогов и сборов",
  },
  {
    icon: "🚗",
    title: "Скидки 10–15% на аренду автомобилей",
    desc: "Распространяется только на стоимость бронирования автомобиля",
  },
];
const LEVEL3_BENEFITS = [
  {
    icon: "🏷️",
    title: "Скидки 10–20% на жильё",
    desc: "Применяется без учёта налогов и сборов",
  },
  {
    icon: "🚗",
    title: "Скидки 10–15% на аренду автомобилей",
    desc: "Распространяется только на стоимость бронирования автомобиля",
  },
];

const PERKS_EXTRA = [
  {
    icon: "☕",
    title: "Бесплатный завтрак",
    desc: "Начните утро с бесплатного завтрака (доступно в ряде вариантов жилья).",
    level: 2,
  },
  {
    icon: "🛏️",
    title: "Бесплатное повышение категории номера",
    desc: "Отдыхайте с комфортом благодаря автоматическому бесплатному повышению категории номера (доступно в ряде вариантов жилья).",
    level: 2,
  },
  {
    icon: "💬",
    title: "Приоритетная поддержка по бронированиям жилья",
    desc: "Вас соединят напрямую с оператором, и вы сможете обсудить любые вопросы или изменения, касающиеся вашего бронирования жилья.",
    level: 3,
  },
];

const FAQ_ITEMS = [
  {
    q: "Как перейти на следующий уровень Genius",
    a: "Чтобы перейти на 2-й уровень программы Genius, необходимо завершить 5 бронирований в течение 2 лет.\n\nДля перехода на следующий уровень Genius засчитываются любые завершённые бронирования вариантов жилья, авиабилетов, автомобилей, такси, а также вариантов досуга. Например, бронирования жилья считаются завершёнными, если вы заселились и отъехали, а бронирования автомобилей в аренду — если вы получили автомобиль и вернули его.\n\nОбратите внимание: вы увидите новые завершённые бронирования, после того как информация о них будет обработана нашей системой. Это может занять некоторое время.",
  },
  {
    q: "Какие бронирования засчитываются для перехода на следующий уровень Genius?",
    a: "Для перехода на следующий уровень программы Genius засчитываются любые завершённые бронирования вариантов жилья, авиабилетов, автомобилей, такси, а также вариантов досуга.\n\nОбратите внимание: вы увидите новые завершённые бронирования, после того как информация о них будет обработана нашей системой. Это может занять некоторое время.",
  },
  {
    q: "Где я могу воспользоваться Genius-скидкой?",
    a: "Вы можете воспользоваться Genius-скидкой при бронировании вариантов жилья и аренды автомобилей по всему миру, участвующих в программе.\n\nGenius-варианты отмечены синим значком Genius и озвучиваются программами чтения с экрана.",
  },
  {
    q: "Как найти варианты жилья, где предлагаются вознаграждения?",
    a: "Genius-варианты отмечены синим значком Genius и озвучиваются программами чтения с экрана.",
  },
  {
    q: "Как применяются Genius-вознаграждения?",
    a: "Genius-скидки и вознаграждения автоматически применяются при бронировании участвующих в программе вариантов жилья и аренды автомобилей — не нужно вводить коды!\n\nGenius-варианты отмечены синим значком Genius и озвучиваются программами чтения с экрана.",
  },
  {
    q: "Почему мой уровень Genius понизился?",
    a: "Убедитесь, что вы вошли в правильный аккаунт с использованием корректного адреса электронной почты.\n\nМы не понижаем уровни участников программы. Получив доступ к новому уровню с его вознаграждениями, вы сохраняете их навсегда.",
  },
  {
    q: "Я уже завершил(а) более 5 бронирований. Почему мне не присвоили следующий уровень?",
    a: "Чтобы бронирование было засчитано, его необходимо завершить. Это значит, что вы должны, например, выехать из варианта размещения или вернуть автомобиль в пункт проката.\n\nОбратите внимание: нашей системе может понадобиться некоторое время для отображения ваших бронирований. Все полностью завершённые бронирования будут учтены.",
  },
  {
    q: "Почему мои бронирования не засчитаны?",
    a: "Чтобы бронирование было засчитано, его необходимо завершить. Это значит, что вы должны, например, выехать из варианта размещения или вернуть автомобиль в пункт проката.",
  },
  {
    q: "Почему у меня разные уровни Genius на компьютере и в мобильном телефоне?",
    a: "Убедитесь, что вы вошли в один и тот же аккаунт на компьютере и на мобильном устройстве.",
  },
  {
    q: "Каким образом подсчитывается количество бронирований?",
    a: "Каждое отдельное бронирование засчитывается за одно, вне зависимости от срока проживания, количества авиабилетов и размера группы.",
  },
  {
    q: "Какие вознаграждения предусмотрены на следующих уровнях?",
    a: "На 2-м уровне программы Genius вас ждёт не только бесплатный завтрак и бесплатное повышение категории номера в ряде вариантов, но и скидки от 10% до 15% на бронирование участвующих в программе вариантов жилья, а также скидка 10% на некоторые варианты аренды автомобилей.\n\nСтатус Genius 3-го уровня позволит вам пользоваться скидками от 10% до 20% на бронирование вариантов жилья, участвующих в программе, бесплатным завтраком и бесплатным повышением категории номера в ряде вариантов, а также скидкой 10% на некоторые варианты аренды автомобилей.",
  },
  {
    q: "Какой у меня уровень Genius и почему?",
    a: "У вас 1-й уровень программы лояльности Genius. Мы присвоили его вам, потому что вы создали бесплатный аккаунт на Booking.com.\n\nСтатус Genius 1-го уровня позволяет вам пользоваться скидкой 10% при бронировании участвующих в программе вариантов жилья и ряда автомобилей в аренду по всему миру.\n\nЧтобы получить статус Genius 2-го уровня, завершите 5 бронирований в течение 2 лет.",
  },
  {
    q: "Как работает программа лояльности Genius?",
    a: "Genius — это программа лояльности Booking.com с бесплатным участием.\n\nСоздав бесплатный аккаунт на Booking.com, вы получили статус Genius 1-го уровня, который даёт вам скидку 10% в ряде вариантов жилья и аренды автомобилей.\n\nПрограмма Genius состоит из 3 уровней. Для перехода на 2-й уровень необходимо завершить 5 бронирований в течение 2 лет, а для получения статуса Genius 3-го уровня нужно завершить 15 бронирований в течение 2 лет.",
  },
];

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{ borderBottom: "1px solid #e7e7e7", cursor: "pointer" }}
      onClick={() => setOpen(!open)}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 0",
          gap: 16,
        }}
      >
        <span style={{ fontSize: 15, fontWeight: 600 }}>{q}</span>
        {open ? (
          <ChevronUp size={18} color="#595959" />
        ) : (
          <ChevronDown size={18} color="#595959" />
        )}
      </div>
      {open && (
        <div
          style={{
            paddingBottom: 16,
            fontSize: 14,
            color: "#333",
            lineHeight: 1.7,
          }}
        >
          {a.split("\n\n").map((p, i) => (
            <p key={i} style={{ margin: "0 0 10px" }}>
              {p}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

export default function GeniusPage() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#fff",
        fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
        color: "#1a1a1a",
      }}
    >
      <Header />

      {/* ── HERO ─────────────────────────────── */}
      <div
        style={{
          backgroundImage:
            "url(https://r-xx.bstatic.com/data/genius_expand/genius-page-hero-desktop.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          minHeight: 320,
          display: "flex",
          alignItems: "center",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
          }}
        />
        <div
          style={{
            position: "relative",
            maxWidth: 700,
            padding: "48px 40px",
            color: "#fff",
          }}
        >
          <div
            style={{
              fontSize: 16,
              fontWeight: 600,
              marginBottom: 12,
              opacity: 0.9,
            }}
          >
            Путешествуйте в своём стиле
          </div>
          <div
            style={{
              fontSize: 64,
              fontWeight: 900,
              fontStyle: "italic",
              color: "#febb02",
              lineHeight: 1,
              marginBottom: 12,
              letterSpacing: "-2px",
            }}
          >
            Genius
          </div>
          <div style={{ fontSize: 18, opacity: 0.9 }}>
            Программа лояльности Booking.com
          </div>
        </div>
      </div>

      {/* ── LEVEL CARD ──────────────────────── */}
      <div
        style={{
          maxWidth: 780,
          margin: "-60px auto 0",
          padding: "0 16px",
          position: "relative",
          zIndex: 10,
        }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: 8,
            boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
            padding: "32px",
            textAlign: "center",
          }}
        >
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
            Joha, вы на 1-м уровне!
          </h2>
          <p
            style={{
              fontSize: 14,
              color: "#595959",
              marginBottom: 24,
              maxWidth: 500,
              margin: "0 auto 24px",
            }}
          >
            Завершите пять бронирований в течение двух лет, чтобы пользоваться
            скидками и вознаграждениями 2-го уровня. Учитываются все
            бронирования!
          </p>

          {/* Progress circles */}
          <div
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "center",
              marginBottom: 20,
            }}
          >
            {Array.from({ length: BOOKINGS_NEEDED }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  border:
                    i < USER_BOOKINGS
                      ? "3px solid #0071c2"
                      : "2px dashed #d0d5dd",
                  background: i < USER_BOOKINGS ? "#0071c2" : "#f9f9f9",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {i < USER_BOOKINGS && (
                  <span style={{ color: "#fff", fontSize: 18 }}>✓</span>
                )}
              </div>
            ))}
          </div>

          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              navigate("/search");
            }}
            style={{
              color: "#0071c2",
              fontSize: 14,
              fontWeight: 600,
              textDecoration: "none",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.textDecoration = "underline")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.textDecoration = "none")
            }
          >
            Как перейти на уровень выше
          </a>
        </div>
      </div>

      <div style={{ maxWidth: 1150, margin: "0 auto", padding: "60px 16px 0" }}>
        {/* ── SAVE ON NEXT TRIP ───────────────── */}
        <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
          Сэкономьте на следующей поездке
        </h2>
        <p
          style={{
            fontSize: 15,
            color: "#333",
            marginBottom: 32,
            maxWidth: 700,
          }}
        >
          Вам <strong>бесплатно и бессрочно</strong> доступны Genius-скидки 1-го
          уровня{" "}
          <strong>на отдельные варианты жилья и автомобили в аренду</strong> по
          всему миру. Скидки применяются к цене без учёта налогов и сборов.
        </p>

        {/* Level benefits grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
            marginBottom: 40,
          }}
        >
          {/* Discount card */}
          <div
            style={{
              border: "1px solid #e7e7e7",
              borderRadius: 8,
              padding: 24,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 16,
                marginBottom: 20,
              }}
            >
              <div style={{ fontSize: 40 }}>🏷️</div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>
                  Genius-скидки
                </div>
                <div style={{ fontSize: 14, color: "#333", lineHeight: 1.6 }}>
                  Вы можете сэкономить на бронировании 850 000 вариантов жилья
                  по всему миру,{" "}
                  <span
                    style={{ color: "#0071c2", cursor: "pointer" }}
                    onClick={() => navigate("/search")}
                  >
                    участвующего в программе
                  </span>
                  , а также на{" "}
                  <span
                    style={{ color: "#0071c2", cursor: "pointer" }}
                    onClick={() => navigate("/car-rental")}
                  >
                    ряде автомобилей в аренду
                  </span>
                  .
                </div>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 0,
                border: "1px solid #e7e7e7",
                borderRadius: 6,
                overflow: "hidden",
              }}
            >
              {[
                { level: 1, active: true, discounts: LEVEL1_BENEFITS },
                { level: 2, active: false, discounts: LEVEL2_BENEFITS },
                { level: 3, active: false, discounts: LEVEL3_BENEFITS },
              ].map((col) => (
                <div
                  key={col.level}
                  style={{
                    padding: "12px",
                    borderRight: col.level < 3 ? "1px solid #e7e7e7" : "none",
                    background: col.active ? "#fff" : "#fafafa",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      marginBottom: 12,
                      fontSize: 12,
                      fontWeight: 700,
                      color: col.active ? "#0071c2" : "#888",
                    }}
                  >
                    {col.active ? (
                      <span
                        style={{
                          background: "#febb02",
                          color: "#1a1a1a",
                          padding: "2px 8px",
                          borderRadius: 12,
                          fontSize: 11,
                        }}
                      >
                        ✓ Уровень {col.level}
                      </span>
                    ) : (
                      <span style={{ color: "#888" }}>
                        🔒 Уровень {col.level}
                      </span>
                    )}
                  </div>
                  {col.discounts.map((d, i) => (
                    <div key={i} style={{ marginBottom: 12 }}>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          marginBottom: 2,
                        }}
                      >
                        {d.title}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: "#595959",
                          lineHeight: 1.4,
                        }}
                      >
                        {d.desc}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Extra perks */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {PERKS_EXTRA.map((p, i) => (
              <div
                key={i}
                style={{
                  border: "1px solid #e7e7e7",
                  borderRadius: 8,
                  padding: 20,
                  display: "flex",
                  gap: 16,
                  alignItems: "flex-start",
                  background: "#fafafa",
                }}
              >
                <div style={{ fontSize: 32, flexShrink: 0 }}>{p.icon}</div>
                <div>
                  <div
                    style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}
                  >
                    {p.title}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "#595959",
                      lineHeight: 1.5,
                      marginBottom: 8,
                    }}
                  >
                    {p.desc}
                  </div>
                  <div style={{ fontSize: 12, color: "#888" }}>
                    🔒 Уровень {p.level}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── HOW IT WORKS ───────────────────── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 48,
            alignItems: "center",
            marginBottom: 60,
            padding: "40px 0",
            borderTop: "1px solid #e7e7e7",
          }}
        >
          <div>
            <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 16 }}>
              Экономить просто
            </h2>
            <p
              style={{
                fontSize: 15,
                color: "#333",
                lineHeight: 1.7,
                marginBottom: 12,
              }}
            >
              Участвующие в программе Genius{" "}
              <strong>варианты жилья и автомобили отмечены</strong> синим
              значком Genius. Все скидки и вознаграждения применяются
              автоматически при бронировании — вам для этого ничего не нужно
              делать.
            </p>
            <p style={{ fontSize: 15, color: "#333" }}>
              Genius: все гениальное просто.
            </p>
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div
              style={{
                background: "#f0f4ff",
                borderRadius: 12,
                padding: 32,
                textAlign: "center",
                maxWidth: 280,
              }}
            >
              <div
                style={{
                  background: "#003580",
                  color: "#febb02",
                  fontWeight: 900,
                  fontSize: 20,
                  fontStyle: "italic",
                  padding: "8px 20px",
                  borderRadius: 4,
                  display: "inline-block",
                  marginBottom: 20,
                }}
              >
                Genius
              </div>
              <div
                style={{ display: "flex", gap: 4, justifyContent: "center" }}
              >
                {[1, 2, 3, 4].map((s) => (
                  <span key={s} style={{ color: "#febb02", fontSize: 20 }}>
                    ★
                  </span>
                ))}
              </div>
              <div
                style={{
                  marginTop: 12,
                  background: "#e7e7e7",
                  height: 10,
                  borderRadius: 4,
                }}
              />
              <div
                style={{
                  marginTop: 8,
                  background: "#e7e7e7",
                  height: 10,
                  borderRadius: 4,
                  width: "70%",
                }}
              />
            </div>
          </div>
        </div>

        {/* ── LEVELS ─────────────────────────── */}
        <div
          style={{
            marginBottom: 60,
            paddingTop: 40,
            borderTop: "1px solid #e7e7e7",
          }}
        >
          <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
            Откройте новые уровни вознаграждений для путешествий
          </h2>
          <p style={{ fontSize: 15, color: "#595959", marginBottom: 32 }}>
            В программе учитывается каждое ваше бронирование. Достигнув
            определённого уровня, вы навсегда получаете скидки и вознаграждения
            для путешествий. Нужно лишь выбрать, куда отправиться!
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 16,
            }}
          >
            {[
              {
                level: "Genius 1-го уровня",
                active: true,
                desc: "Войдя в аккаунт, вы сразу получите доступ к скидкам на отдельные варианты жилья и автомобили в аренду по всему миру.",
                perks: [
                  "Скидки 10% на жильё",
                  "Скидка 10% на аренду ряда автомобилей",
                ],
              },
              {
                level: "Genius 2-го уровня",
                active: false,
                desc: "Эти вознаграждения для отдельных вариантов жилья и автомобилей в аренду по всему миру станут доступны, если вы завершите 5 бронирований за 2 года.",
                perks: [
                  "Скидки 10–15% на жильё",
                  "Скидки 10–15% на аренду ряда автомобилей",
                  "Бесплатный завтрак в некоторых объектах размещения",
                  "Бесплатное повышение категории номера в некоторых объектах размещения",
                ],
              },
              {
                level: "Genius 3-го уровня",
                active: false,
                desc: "Эти вознаграждения для отдельных вариантов жилья и автомобилей в аренду по всему миру станут доступны, если вы завершите 15 бронирований за 2 года.",
                perks: [
                  "Скидки 10–20% на жильё",
                  "Скидки 10–15% на аренду ряда автомобилей",
                  "Бесплатный завтрак в некоторых объектах размещения",
                  "Бесплатное повышение категории номера в некоторых объектах размещения",
                  "Приоритетная поддержка по всем бронированиям жилья",
                ],
              },
            ].map((col) => (
              <div
                key={col.level}
                style={{
                  border: col.active
                    ? "2px solid #0071c2"
                    : "1px solid #e7e7e7",
                  borderRadius: 8,
                  padding: 20,
                }}
              >
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: "#0071c2",
                    marginBottom: 12,
                  }}
                >
                  {col.level}
                </div>
                <p
                  style={{
                    fontSize: 13,
                    color: "#595959",
                    lineHeight: 1.6,
                    marginBottom: 16,
                  }}
                >
                  {col.desc}
                </p>
                {col.perks.map((p, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      gap: 8,
                      marginBottom: 8,
                      fontSize: 13,
                    }}
                  >
                    <span style={{ color: "#0071c2", flexShrink: 0 }}>✓</span>
                    <span>{p}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* ── WITH GENIUS ─────────────────────── */}
        <div
          style={{
            marginBottom: 60,
            paddingTop: 40,
            borderTop: "1px solid #e7e7e7",
          }}
        >
          <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
            С Genius Booking.com ещё лучше
          </h2>
          <p style={{ fontSize: 15, color: "#595959", marginBottom: 28 }}>
            Программа лояльности Booking.com дарит вам бессрочный доступ к
            скидкам и вознаграждениям, которыми можно воспользоваться при
            бронировании сотен тысяч вариантов жилья и автомобилей в аренду по
            всему миру.
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 24,
            }}
          >
            {[
              {
                title: "Легко находить",
                desc: "После того как вы войдёте в аккаунт, ищите синий значок Genius. Им будут отмечены вознаграждения для путешествий.",
              },
              {
                title: "Легко сохранять",
                desc: "На каком бы уровне программы Genius вы ни находились, вознаграждения остаются с вами навсегда.",
              },
              {
                title: "Легко переходить на новый уровень",
                desc: "Чем больше вы бронируете, тем больше выгоды получаете. Мы учитываем каждое ваше бронирование.",
              },
            ].map((item) => (
              <div key={item.title}>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: "#0071c2",
                    marginBottom: 8,
                  }}
                >
                  {item.title}
                </div>
                <div
                  style={{ fontSize: 14, color: "#595959", lineHeight: 1.7 }}
                >
                  {item.desc}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── FAQ ─────────────────────────────── */}
        <div
          style={{
            marginBottom: 60,
            paddingTop: 40,
            borderTop: "1px solid #e7e7e7",
          }}
        >
          <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>
            Часто задаваемые вопросы о программе Genius
          </h2>
          <div style={{ maxWidth: 860 }}>
            {FAQ_ITEMS.map((item, i) => (
              <FaqItem key={i} q={item.q} a={item.a} />
            ))}
          </div>
        </div>

        {/* ── SEARCH BLOCK ────────────────────── */}
        <div style={{ padding: "40px 0 60px", borderTop: "1px solid #e7e7e7" }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>
            Получите максимум от статуса Genius 1-го уровня
          </h2>
          <p style={{ fontSize: 15, color: "#595959", marginBottom: 24 }}>
            Вас ждут тысячи Genius-вариантов — рядом с вашим домом и не только.
            Куда вы отправитесь в следующий раз?
          </p>
          <button
            onClick={() => navigate("/search")}
            style={{
              padding: "14px 32px",
              background: "#0071c2",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              fontSize: 16,
              fontWeight: 700,
              cursor: "pointer",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#005fa3")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#0071c2")}
          >
            Найти Genius-варианты
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
