-- ============================================================
-- BOOKING.COM CLONE — ПОЛНЫЙ ПЕРЕСОЗДАНИЕ БД
-- Запустить в Supabase Dashboard → SQL Editor
-- ============================================================

-- ============================================================
-- ШАГ 1: Удалить старые таблицы (чистый старт)
-- ============================================================
drop table if exists bookings cascade;
drop table if exists reviews cascade;
drop table if exists airport_taxis cascade;
drop table if exists car_rentals cascade;
drop table if exists cars cascade;
drop table if exists taxis cascade;
drop table if exists attraction_collections cascade;
drop table if exists attractions_cities cascade;
drop table if exists attractions cascade;
drop table if exists flight_routes cascade;
drop table if exists flight_airports cascade;
drop table if exists flights cascade;
drop table if exists destinations cascade;
drop table if exists hotels cascade;

-- ============================================================
-- ШАГ 2: Создать таблицы с правильной схемой
-- ============================================================

create table hotels (
  id               bigserial primary key,
  name             text not null,
  city             text,
  country          text,
  address          text,
  stars            integer default 0,
  rating           numeric(3,1) default 0,
  reviews_count    integer default 0,
  price_per_night  integer default 0,
  original_price   integer,
  category         text default 'hotel',
  is_genius        boolean default false,
  image_url        text,
  description      text,
  distance_center  text,
  badge            text,
  free_cancel      boolean default true,
  no_prepay        boolean default true,
  breakfast        boolean default false,
  created_at       timestamptz default now()
);

create table destinations (
  id          bigserial primary key,
  name        text not null,
  country     text,
  flag        text,
  variants    integer default 0,
  avg_price   integer default 0,
  image_url   text,
  dest_id     text,
  dest_type   text default 'CITY',
  is_trending boolean default true,
  region      text default 'uz',
  created_at  timestamptz default now()
);

create table attractions (
  id             bigserial primary key,
  city_slug      text,
  name           text not null,
  city           text,
  country        text,
  category       text,
  short_description text,
  rating         numeric(3,1) default 0,
  rating_label   text,
  reviews_count  integer default 0,
  price          integer default 0,
  original_price integer,
  duration_hours integer default 2,
  duration_label text,
  image_url      text,
  gallery_images text[],
  badge          text,
  free_cancel    boolean default true,
  available_today boolean default true,
  bestseller_rank integer,
  is_genius      boolean default false,
  created_at     timestamptz default now()
);

create table attractions_cities (
  id             bigserial primary key,
  slug           text not null unique,
  city           text not null,
  country        text not null,
  region         text default 'Европа',
  hero_title     text,
  hero_subtitle  text,
  discovery_text text,
  image_url      text,
  gallery_images text[],
  variants_count integer default 0,
  sort_order     integer default 999,
  created_at     timestamptz default now()
);

create table attraction_collections (
  id            text primary key,
  title         text not null,
  subtitle      text,
  category      text,
  city_slug     text default 'all',
  image_url     text,
  total_items   integer default 0,
  sort_order    integer default 999,
  created_at    timestamptz default now()
);

create table flights (
  id                  bigserial primary key,
  airline             text,
  airline_code        text,
  from_city           text,
  from_code           text,
  to_city             text,
  to_code             text,
  depart_time         text,
  arrive_time         text,
  return_depart_time  text,
  return_arrive_time  text,
  duration            text,
  return_duration     text,
  stops               text default 'nonstop',
  out_airline         text,
  out_airline_code    text,
  out_depart_time     text,
  out_arrive_time     text,
  out_duration        text,
  out_stops           text default 'nonstop',
  out_stop_city       text,
  back_airline        text,
  back_airline_code   text,
  back_depart_time    text,
  back_arrive_time    text,
  back_duration       text,
  back_stops          text default 'nonstop',
  back_stop_city      text,
  price               integer,
  cabin_class         text default 'Economy Cabin',
  tags                text[],
  is_best             boolean default false,
  is_cheapest         boolean default false,
  created_at          timestamptz default now()
);

create table flight_airports (
  id            bigserial primary key,
  code          text not null unique,
  city          text not null,
  airport_name  text not null,
  country       text not null,
  popular_rank  integer default 999,
  created_at    timestamptz default now()
);

create table flight_routes (
  id            bigserial primary key,
  from_code     text not null,
  from_city     text not null,
  to_code       text not null,
  to_city       text not null,
  to_country    text not null,
  route_label   text not null,
  teaser        text,
  sample_price  integer default 0,
  is_featured   boolean default true,
  sort_order    integer default 999,
  created_at    timestamptz default now()
);

create table car_rentals (
  id            serial primary key,
  company       text not null,
  car_model     text not null,
  car_class     text,
  city          text not null,
  country       text not null,
  price_per_day integer not null,
  image_url     text,
  rating        numeric(3,1),
  reviews       integer default 0,
  seats         integer default 5,
  transmission  text default 'Автомат',
  fuel_type     text default 'Бензин',
  is_available  boolean default true,
  created_at    timestamptz default now()
);

create table airport_taxis (
  id            serial primary key,
  from_location text not null,
  to_location   text not null,
  city          text not null,
  price         integer not null,
  duration_min  integer,
  car_type      text,
  image_url     text,
  provider      text,
  rating        numeric(3,1),
  is_available  boolean default true,
  created_at    timestamptz default now()
);

create table bookings (
  id               bigserial primary key,
  user_id          uuid references auth.users(id),
  hotel_id         bigint references hotels(id),
  check_in         date,
  check_out        date,
  adults           integer default 2,
  children         integer default 0,
  rooms            integer default 1,
  total_price      integer,
  status           text default 'upcoming',
  booking_ref      text,
  guest_name       text,
  guest_email      text,
  guest_phone      text,
  payment_method   text default 'card',
  special_requests text,
  created_at       timestamptz default now()
);

-- ============================================================
-- ШАГ 3: Вставить данные — HOTELS
-- ============================================================
insert into hotels (name, city, country, address, stars, rating, reviews_count, price_per_night, original_price, category, is_genius, image_url, description, distance_center, badge, free_cancel, no_prepay, breakfast) values
('Citadines Metro Central Dubai', 'Дубай', 'ОАЭ', 'Al Rigga Metro Station Area, Deira', 4, 8.7, 3450, 623020, 1064991, 'apartment', true, 'https://picsum.photos/seed/hotel1/300/200', 'Апарт-отель рядом с метро в центре Дубая. Просторные номера с кухней, бассейн, фитнес.', '14.6 км от центра', null, true, true, false),
('Grand Heights Dubai Hotel Apartments', 'Дубай', 'ОАЭ', 'Al Tharyah Street, Теком, 502400', 4, 8.7, 3179, 513036, 982816, 'apartment', true, 'https://picsum.photos/seed/hotel2/300/200', 'Апарт-отель с собственной кухней, открытый бассейн и паровая баня.', '14.4 км от центра', null, true, true, false),
('Gulf Oasis Hotel Apartments Fz LLC', 'Дубай', 'ОАЭ', 'Al Barsha, Dubai', 3, 8.5, 1582, 457946, 500829, 'apartment', true, 'https://picsum.photos/seed/hotel3/300/200', 'Уютные апартаменты в районе Аль-Барша с полным оснащением кухни.', '14.8 км от центра', null, true, true, false),
('Ramada by Wyndham Downtown Dubai', 'Дубай', 'ОАЭ', 'Al Raffa Street, Bur Dubai', 5, 8.9, 9477, 693427, 963094, 'hotel', true, 'https://picsum.photos/seed/hotel4/300/200', 'Пятизвёздочный отель в самом центре Дубая. Ресторан, спа, панорамный бассейн.', '0.3 км от центра', null, true, true, true),
('City Seasons Suites Hotel Apartment', 'Дубай', 'ОАЭ', 'Al Muroor Area, Dubai', 4, 8.6, 2341, 580000, 850000, 'apartment', true, 'https://picsum.photos/seed/hotel_d5/300/200', 'Сьюты с отдельными гостиными и полностью оборудованной кухней.', '5.2 км от центра', 'Сезонное предложение', true, true, true),
('Savoy Central Hotel Apartments', 'Дубай', 'ОАЭ', 'Al Nahda Area, Dubai', 4, 8.4, 1876, 490000, 720000, 'apartment', true, 'https://picsum.photos/seed/hotel_d6/300/200', 'Комфортабельные апартаменты с бесплатным Wi-Fi и парковкой.', '12.1 км от центра', null, true, true, false),
('Blueloft 47 | studio with balcony Tashkent City Center', 'Ташкент', 'Узбекистан', 'Tashkent City, Yunusobod district', 0, 9.3, 164, 1153986, 1424675, 'apartment', true, 'https://picsum.photos/seed/hotel5/300/200', 'Стильная студия с балконом в центре Ташкента. Панорамный вид на город.', '0.5 км от центра', null, true, true, false),
('SADI Hotel', 'Ташкент', 'Узбекистан', 'Shota Rustaveli Street 43, Mirzo Ulugbek', 0, 8.9, 373, 902616, 1014175, 'hotel', true, 'https://picsum.photos/seed/hotel6/300/200', 'Современный бутик-отель с дизайнерскими номерами в спокойном районе.', '3.5 км от центра', null, true, true, true),
('Farovon Tashkent Boutique Hotel', 'Ташкент', 'Узбекистан', 'Amir Temur Avenue 108B', 0, 9.0, 48, 3187770, 3561688, 'hotel', true, 'https://picsum.photos/seed/hotel7/300/200', 'Бутик-отель премиум класса. Эксклюзивный интерьер, ресторан узбекской кухни.', '1.2 км от центра', null, true, true, true),
('South Hotel Tashkent', 'Ташкент', 'Узбекистан', 'Chilanzar District, Tashkent', 4, 8.3, 1373, 1118853, 1521625, 'hotel', true, 'https://picsum.photos/seed/hotel8/300/200', 'Четырёхзвёздочный отель с конференц-залами, рестораном и фитнес-центром.', '4.8 км от центра', null, true, true, true),
('Garnet Mir Airport Hotel', 'Ташкент', 'Узбекистан', 'Islam Karimov Street, Near Airport', 2, 9.2, 28, 1229567, 1871395, 'hotel', true, 'https://picsum.photos/seed/hotel_t5/300/200', 'Удобный отель рядом с аэропортом. Бесплатный трансфер, ресторан.', '9.2 км от центра', 'Новинка на Booking.com', true, true, true),
('Pakhtakor Athletics Hotel', 'Ташкент', 'Узбекистан', 'Buyuk Ipak Yuli Avenue, Tashkent', 0, 8.7, 1543, 977955, 1808617, 'hotel', true, 'https://picsum.photos/seed/hotel_t6/300/200', 'Отель при спортивном комплексе с бассейном и тренажёрным залом.', '1.0 км от центра', null, true, true, false),
('Leader Hotel', 'Ташкент', 'Узбекистан', 'Yunusabad District, Tashkent', 0, 8.7, 1075, 1772996, 1992130, 'hotel', true, 'https://picsum.photos/seed/hotel_t7/300/200', 'Современный отель в деловом районе. Ресторан, конференц-залы, спа.', '2.3 км от центра', null, false, true, true),
('Grand Nur Hotel', 'Ташкент', 'Узбекистан', 'Minor Street 3, Old City', 4, 9.0, 412, 1450000, 1900000, 'hotel', true, 'https://picsum.photos/seed/hotel_t8/300/200', 'Роскошный отель в историческом центре Ташкента.', '0.8 км от центра', 'Сезонное предложение', true, true, true),
('Olchazor Hotel', 'Ташкент', 'Узбекистан', 'Olmazor District, Tashkent', 2, 9.5, 4, 1174028, 1569557, 'hotel', true, 'https://picsum.photos/seed/hotel_t9/300/200', 'Новый отель с отличным соотношением цены и качества.', '11.7 км от центра', 'Новинка на Booking.com', true, true, false),
('Bentley Hotel Tashkent', 'Ташкент', 'Узбекистан', 'Mirzo Ulugbek Street, Tashkent', 0, 9.3, 873, 3578348, 5942254, 'hotel', true, 'https://picsum.photos/seed/hotel_t10/300/200', 'Бутик-отель премиум класса с уникальным дизайном и отличным сервисом.', '4.5 км от центра', 'Сезонное предложение', true, true, false),
('Orient Star Khiva Hotel-Madrasah Muhammad Amin-Khan', 'Хива', 'Узбекистан', 'Ichan-Qala, Khiva', 0, 8.8, 1136, 956222, 1062469, 'hotel', true, 'https://picsum.photos/seed/unique1/300/200', 'Исторический отель в медресе 19 века внутри крепости Ичан-Кала.', '0.1 км от центра', null, true, true, true),
('Komil Boutique Hotel', 'Самарканд', 'Узбекистан', 'Old City, near Registan', 0, 9.4, 892, 780000, 1050000, 'hotel', true, 'https://picsum.photos/seed/hotel_s2/300/200', 'Бутик-отель в историческом центре Самарканда. Традиционный узбекский дизайн.', '0.3 км от центра', null, true, true, true),
('Antica B&B Samarkand', 'Самарканд', 'Узбекистан', 'Registan Square Area, Samarkand', 0, 9.1, 634, 620000, 890000, 'guesthouse', true, 'https://picsum.photos/seed/hotel_s3/300/200', 'Уютный гостевой дом рядом с площадью Регистан. Домашний завтрак, сад.', '0.2 км от центра', null, true, true, true),
('Tsinandali Estate', 'Tsinandali', 'Грузия', 'Tsinandali, Kakheti Region', 5, 9.2, 764, 3349049, 3721165, 'resort', true, 'https://picsum.photos/seed/unique2/300/200', 'Роскошный курорт на территории исторической усадьбы Чавчавадзе в Кахетии.', '2.0 км от центра', null, true, true, true),
('Rooms Hotel Tbilisi', 'Тбилиси', 'Грузия', 'Merab Kostava Street 14, Tbilisi', 5, 9.3, 2341, 2800000, 3500000, 'hotel', true, 'https://picsum.photos/seed/hotel_g2/300/200', 'Дизайн-отель в историческом здании в центре Тбилиси.', '1.5 км от центра', null, true, true, false),
('Shahdag Hotel & Spa', 'Шахдаг', 'Азербайджан', 'Shahdag Mountain Resort, Quba', 5, 9.3, 4172, 1116933, 1241037, 'resort', true, 'https://picsum.photos/seed/unique3/300/200', 'Горнолыжный курорт с панорамными видами. Спа-центр, несколько ресторанов.', '0.5 км от центра', null, true, true, true),
('Marxal Resort & Spa', 'Шеки', 'Азербайджан', 'Sheki City, Nukha district', 5, 9.6, 1080, 1276495, null, 'resort', true, 'https://picsum.photos/seed/unique4/300/200', 'Эко-курорт в горах Шеки. Панорамные виды, органическая кухня, хайкинг.', '3.0 км от центра', null, true, true, true);

-- DESTINATIONS
insert into destinations (name, country, flag, variants, avg_price, image_url, dest_id, dest_type, is_trending, region) values
('Ташкент', 'Узбекистан', '🇺🇿', 1408, 1275630, 'https://cf.bstatic.com/xdata/images/city/max1280x900/686023.jpg?k=315b82bac9991c71d6f14f8618e68a9b6d3f45b61b9ceb335523918d0e086dbf&o=', '-2579372', 'CITY', true, 'uz'),
('Самарканд', 'Узбекистан', '🇺🇿', 864, 859361, 'https://cf.bstatic.com/xdata/images/city/max1280x900/916707.jpg?k=92d3c6a6f59fe96b7044218defba0d9e1b9b376b424121dbb29db63a45c62d24&o=', '-2578646', 'CITY', true, 'uz'),
('Бухара', 'Узбекистан', '🇺🇿', 570, 741463, 'https://cf.bstatic.com/xdata/images/city/max1280x900/948982.jpg?k=df876b79aa087808adf33387dfdad56350813a328ca436dbad74fb9fa597bc16&o=', '-2575720', 'CITY', true, 'uz'),
('Стамбул', 'Турция', '🇹🇷', 4863, 2138357, 'https://cf.bstatic.com/xdata/images/city/max1280x900/999839.jpg?k=0c48abf88150a98bc1ec9280347e9ea97f41265ebfc439c53a5b8fec61ab4fa5&o=', '-755070', 'CITY', true, 'tr'),
('Дубай', 'ОАЭ', '🇦🇪', 28003, 3557890, 'https://cf.bstatic.com/xdata/images/city/max1280x900/1000203.jpg?k=207c20a3559b06975deaac8d2e5721e7bb33797dcc064c386533101d12281a39&o=', '-782831', 'CITY', true, 'ae'),
('Хива', 'Узбекистан', '🇺🇿', 154, 750000, 'https://picsum.photos/seed/khiva/400/250', '-2577440', 'CITY', true, 'uz'),
('Тбилиси', 'Грузия', '🇬🇪', 1200, 1800000, 'https://picsum.photos/seed/tbilisi/400/250', '-2972', 'CITY', true, 'ge'),
('Алматы', 'Казахстан', '🇰🇿', 890, 1650000, 'https://picsum.photos/seed/almaty/400/250', '-2118', 'CITY', true, 'kz');

-- ATTRACTIONS
insert into attractions (city_slug, name, city, country, category, short_description, rating, rating_label, reviews_count, price, original_price, duration_hours, duration_label, image_url, gallery_images, badge, free_cancel, available_today, bestseller_rank, is_genius) values
('samarkand', 'Площадь Регистан', 'Самарканд', 'Узбекистан', 'История', 'Главный ансамбль Самарканда с удобным входом и красивыми вечерними видами.', 9.8, 'Потрясающе', 4821, 60000, 72000, 3, '2 ч. – 3 ч.', 'https://images.unsplash.com/photo-1624965085074-94774e187c86?w=900', array['https://picsum.photos/seed/samarkand-registan-1/320/240','https://picsum.photos/seed/samarkand-registan-2/320/240','https://picsum.photos/seed/samarkand-registan-3/320/240','https://picsum.photos/seed/samarkand-registan-4/320/240'], 'Топ выбор', true, true, 1, true),
('khiva', 'Ичан-Кала (Старый город)', 'Хива', 'Узбекистан', 'История', 'Прогулка по древнему городу-музею с билетами в главные памятники.', 9.4, 'Потрясающе', 3102, 80000, 91000, 4, '3 ч. – 4 ч.', 'https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?w=900', array['https://picsum.photos/seed/khiva-ichan-1/320/240','https://picsum.photos/seed/khiva-ichan-2/320/240','https://picsum.photos/seed/khiva-ichan-3/320/240','https://picsum.photos/seed/khiva-ichan-4/320/240'], null, true, true, 2, false),
('bukhara', 'Крепость Арк', 'Бухара', 'Узбекистан', 'История', 'Самая известная крепость Бухары с короткой экскурсией и входным билетом.', 9.2, 'Превосходно', 2341, 50000, 62000, 2, '1 ч. 30 мин. – 2 ч.', 'https://images.unsplash.com/photo-1610641818989-c2051b5e2cfd?w=900', array['https://picsum.photos/seed/bukhara-ark-1/320/240','https://picsum.photos/seed/bukhara-ark-2/320/240','https://picsum.photos/seed/bukhara-ark-3/320/240','https://picsum.photos/seed/bukhara-ark-4/320/240'], null, true, true, 3, false),
('bukhara', 'Пои-Калон', 'Бухара', 'Узбекистан', 'Музеи', 'Комплекс минарета и медресе для первого знакомства с древней Бухарой.', 9.4, 'Потрясающе', 3102, 45000, 56000, 2, '1 ч. 30 мин. – 2 ч.', 'https://picsum.photos/seed/attr2/900/620', array['https://picsum.photos/seed/attr2-1/320/240','https://picsum.photos/seed/attr2-2/320/240','https://picsum.photos/seed/attr2-3/320/240','https://picsum.photos/seed/attr2-4/320/240'], null, true, true, 4, false),
('tashkent', 'Телебашня Ташкента', 'Ташкент', 'Узбекистан', 'Смотровые площадки', 'Панорамный билет на самую узнаваемую обзорную площадку столицы.', 8.8, 'Очень хорошо', 1892, 80000, 96000, 1, '1 ч. – 1 ч. 30 мин.', 'https://picsum.photos/seed/attr4/900/620', array['https://picsum.photos/seed/attr4-1/320/240','https://picsum.photos/seed/attr4-2/320/240','https://picsum.photos/seed/attr4-3/320/240','https://picsum.photos/seed/attr4-4/320/240'], null, true, true, null, true),
('chimgan', 'Горнолыжный курорт Чимган', 'Чимган', 'Узбекистан', 'Однодневные поездки', 'Выезд в горы с трансфером, канатной дорогой и лучшими фото-локациями.', 9.1, 'Превосходно', 2654, 350000, 420000, 8, '8 ч. – 10 ч.', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=900', array['https://picsum.photos/seed/chimgan-1/320/240','https://picsum.photos/seed/chimgan-2/320/240','https://picsum.photos/seed/chimgan-3/320/240','https://picsum.photos/seed/chimgan-4/320/240'], 'Популярно', true, true, null, false),
('tashkent', 'Рынок Чорсу', 'Ташкент', 'Узбекистан', 'Шопинг', 'Маршрут по одному из самых атмосферных рынков Ташкента.', 8.7, 'Очень хорошо', 3210, 0, 0, 2, '1 ч. 30 мин. – 2 ч.', 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=900', array['https://picsum.photos/seed/chorsu-1/320/240','https://picsum.photos/seed/chorsu-2/320/240','https://picsum.photos/seed/chorsu-3/320/240','https://picsum.photos/seed/chorsu-4/320/240'], null, true, true, null, false),
('samarkand', 'Некрополь Шах-и-Зинда', 'Самарканд', 'Узбекистан', 'История', 'Один из самых красивых архитектурных ансамблей Узбекистана.', 9.5, 'Потрясающе', 2987, 45000, 58000, 2, '1 ч. 30 мин. – 2 ч.', 'https://picsum.photos/seed/attr7/900/620', array['https://picsum.photos/seed/attr7-1/320/240','https://picsum.photos/seed/attr7-2/320/240','https://picsum.photos/seed/attr7-3/320/240','https://picsum.photos/seed/attr7-4/320/240'], null, true, true, 5, true),
('dubai', 'Бурдж-Халифа — смотровая', 'Дубай', 'ОАЭ', 'Смотровые площадки', 'Билеты на самую узнаваемую башню Дубая с выбором временного слота.', 9.4, 'Потрясающе', 15230, 750000, 820000, 2, '1 ч. 30 мин. – 2 ч.', 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=900', array['https://picsum.photos/seed/burj-1/320/240','https://picsum.photos/seed/burj-2/320/240','https://picsum.photos/seed/burj-3/320/240','https://picsum.photos/seed/burj-4/320/240'], 'Топ выбор', true, true, 1, true),
('dubai', 'Дубай Молл', 'Дубай', 'ОАЭ', 'Шопинг', 'Комбинированный маршрут по одному из самых больших торговых центров мира.', 9.1, 'Превосходно', 8920, 0, 0, 3, '2 ч. – 3 ч.', 'https://picsum.photos/seed/dubai_mall/900/620', array['https://picsum.photos/seed/dubai-mall-1/320/240','https://picsum.photos/seed/dubai-mall-2/320/240','https://picsum.photos/seed/dubai-mall-3/320/240','https://picsum.photos/seed/dubai-mall-4/320/240'], null, true, true, null, false),
('istanbul', 'Айя-София', 'Стамбул', 'Турция', 'Музеи', 'Главный must-see Стамбула с гидом или входным билетом без долгого ожидания.', 9.6, 'Потрясающе', 28400, 180000, 225000, 2, '1 ч. 30 мин. – 2 ч.', 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=900', array['https://picsum.photos/seed/hagia-1/320/240','https://picsum.photos/seed/hagia-2/320/240','https://picsum.photos/seed/hagia-3/320/240','https://picsum.photos/seed/hagia-4/320/240'], null, true, true, 2, true),
('istanbul', 'Гранд Базар', 'Стамбул', 'Турция', 'Шопинг', 'Прогулка по легендарному рынку с советами по лучшим рядам и сувенирам.', 9.0, 'Превосходно', 12300, 0, 0, 3, '2 ч. – 3 ч.', 'https://picsum.photos/seed/istanbul_bazar/900/620', array['https://picsum.photos/seed/istanbul-bazar-1/320/240','https://picsum.photos/seed/istanbul-bazar-2/320/240','https://picsum.photos/seed/istanbul-bazar-3/320/240','https://picsum.photos/seed/istanbul-bazar-4/320/240'], null, true, true, null, false);

with city_seed as (
  select * from (values
    ('london', 'Лондон', 'Великобритания', 'Европа', 1, 'Варианты досуга в городе Лондон', 'Тауэр, круизы, лучшие музеи и смотровые площадки столицы Великобритании.', 'Исторические районы, культовые музеи и вечерние прогулки по Темзе.', 'https://picsum.photos/seed/london-card/1200/820', array['https://picsum.photos/seed/london-gallery-1/560/420','https://picsum.photos/seed/london-gallery-2/560/420','https://picsum.photos/seed/london-gallery-3/560/420','https://picsum.photos/seed/london-gallery-4/560/420']::text[], array['Лондонский Тауэр и королевские регалии|История','Круиз по Темзе от Westminster|Круизы','Лондонский глаз — билет Fast Track|Смотровые площадки','Вестминстер и Биг-Бен с гидом|История','Британский музей — экскурсия|Музеи','Тауэрский мост — стеклянный переход|Смотровые площадки','Borough Market: гастрономический тур|Гастрономия','Камден и рынки северного Лондона|Шопинг','Стоунхендж на один день|Однодневные поездки','Собор Святого Павла|История','National Gallery Highlights|Музеи','SEA LIFE London Aquarium|Семейные','The Shard — обзорная площадка|Смотровые площадки','Гарри Поттер Studio Tour|Семейные','Ночной автобусный тур по Лондону|История']::text[]),
    ('paris', 'Париж', 'Франция', 'Европа', 2, 'Варианты досуга в городе Париж', 'Круизы по Сене, Лувр, Эйфелева башня и знаковые прогулки по городу.', 'Романтичные маршруты, музеи и вечерние виды на Париж.', 'https://picsum.photos/seed/paris-card/1200/820', array['https://picsum.photos/seed/paris-gallery-1/560/420','https://picsum.photos/seed/paris-gallery-2/560/420','https://picsum.photos/seed/paris-gallery-3/560/420','https://picsum.photos/seed/paris-gallery-4/560/420']::text[], array['Круиз по Сене от Эйфелевой башни|Круизы','Лувр — приоритетный вход|Музеи','Эйфелева башня — билет Summit|Смотровые площадки','Монмартр с местным гидом|История','Музей Орсе — входной билет|Музеи','Нотр-Дам и остров Сите|История','Диснейленд Париж — билет на день|Семейные','Версаль с трансфером|Однодневные поездки','Гастротур по Маре|Гастрономия','Латинский квартал и Пантеон|История','Смотровая площадка Монпарнас|Смотровые площадки','Парижские пассажи и бутики|Шопинг','Круиз с ужином по Сене|Круизы','Музей Оранжери — быстрый вход|Музеи','Парк Астерикс — билет|Семейные']::text[]),
    ('istanbul', 'Стамбул', 'Турция', 'Ближний Восток', 3, 'Варианты досуга в городе Стамбул', 'Айя-София, дворцы, Босфор и лучшие исторические маршруты между двумя континентами.', 'Босфорские круизы, дворцы и рынки в главном городе Турции.', 'https://picsum.photos/seed/istanbul-card/1200/820', array['https://picsum.photos/seed/istanbul-gallery-1/560/420','https://picsum.photos/seed/istanbul-gallery-2/560/420','https://picsum.photos/seed/istanbul-gallery-3/560/420','https://picsum.photos/seed/istanbul-gallery-4/560/420']::text[], array['Айя-София и Голубая мечеть|История','Круиз по Босфору на закате|Круизы','Дворец Топкапы|История','Цистерна Базилика|История','Галатская башня|Смотровые площадки','Гранд-базар с гидом|Шопинг','Вкусный Стамбул: street food тур|Гастрономия','Дворец Долмабахче|История','Принцевы острова на день|Однодневные поездки','Музей турецкого и исламского искусства|Музеи','Miniatürk для всей семьи|Семейные','Султанахмет на рассвете|История','Крытый рынок специй|Шопинг','Вечерний круиз с шоу|Круизы','Террасы Бейоглу|Смотровые площадки']::text[]),
    ('hamburg', 'Гамбург', 'Германия', 'Европа', 4, 'Варианты досуга в городе Гамбург', 'Портовые круизы, филармония и атмосферные кварталы у воды.', 'Морской характер города, набережные и лучшие видовые точки.', 'https://picsum.photos/seed/hamburg-card/1200/820', array['https://picsum.photos/seed/hamburg-gallery-1/560/420','https://picsum.photos/seed/hamburg-gallery-2/560/420','https://picsum.photos/seed/hamburg-gallery-3/560/420','https://picsum.photos/seed/hamburg-gallery-4/560/420']::text[], array['Портовый круиз по Гамбургу|Круизы','Эльбская филармония — Plaza Tour|Смотровые площадки','Speicherstadt и HafenCity|История','Миниатюрная страна чудес|Семейные','Музей эмиграции BallinStadt|Музеи','Рыбный рынок Гамбурга|Гастрономия','Ратуша и центр города|История','Репербан — вечерний тур|История','Аутлеты и бутики Jungfernstieg|Шопинг','Тоннель под Эльбой|История','Парк Плентен ун Бломен|Семейные','Дворец в Альтоне|История','Круиз по озёрам Альстер|Круизы','Пивной гастротур|Гастрономия','Люнебург на один день|Однодневные поездки']::text[]),
    ('amsterdam', 'Амстердам', 'Нидерланды', 'Европа', 5, 'Варианты досуга в городе Амстердам', 'Каналы, музеи и кварталы Амстердама на отдельной странице с результатами.', 'Классические музеи, прогулки по каналам и красивые городские маршруты.', 'https://picsum.photos/seed/amsterdam-card/1200/820', array['https://picsum.photos/seed/amsterdam-gallery-1/560/420','https://picsum.photos/seed/amsterdam-gallery-2/560/420','https://picsum.photos/seed/amsterdam-gallery-3/560/420','https://picsum.photos/seed/amsterdam-gallery-4/560/420']::text[], array['Круиз по каналам Амстердама|Круизы','Музей Ван Гога — билет|Музеи','Дом Анны Франк|История','Rijksmuseum Highlights|Музеи','Jordan и Nine Streets|Шопинг','Heineken Experience|Гастрономия','A’DAM Lookout Swing|Смотровые площадки','Zaanse Schans на один день|Однодневные поездки','Королевский дворец Амстердама|История','NEMO Science Museum|Семейные','Прогулка по кварталу Йордан|История','Рынок цветов и сувениров|Шопинг','Круиз с ужином по каналам|Круизы','This is Holland 5D Experience|Семейные','Гаага и Делфт на один день|Однодневные поездки']::text[]),
    ('lisbon', 'Лиссабон', 'Португалия', 'Европа', 6, 'Варианты досуга в городе Лиссабон', 'Трамваи, смотровые площадки, Белен и лучшие гастрономические прогулки.', 'Солнечный Лиссабон с холмами, видами и выездными турами.', 'https://picsum.photos/seed/lisbon-card/1200/820', array['https://picsum.photos/seed/lisbon-gallery-1/560/420','https://picsum.photos/seed/lisbon-gallery-2/560/420','https://picsum.photos/seed/lisbon-gallery-3/560/420','https://picsum.photos/seed/lisbon-gallery-4/560/420']::text[], array['Трамвайный тур по Лиссабону|История','Башня Белен и монастырь Жеронимуш|История','Смотровые площадки Алфамы|Смотровые площадки','Фаду и ужин в Байрру-Алту|Гастрономия','Океанариум Лиссабона|Семейные','Синтра и Кашкайш на день|Однодневные поездки','LX Factory и местный дизайн|Шопинг','Круиз по реке Тежу|Круизы','MAAT и музей карет|Музеи','Тайные улочки Алфамы|История','Пастел-де-ната тур|Гастрономия','Канатная дорога Parque das Nações|Смотровые площадки','Лиссабонский зоопарк|Семейные','Обидуш и Назаре на день|Однодневные поездки','Прогулка по кварталу Шиаду|Шопинг']::text[]),
    ('rome', 'Рим', 'Италия', 'Европа', 7, 'Варианты досуга в городе Рим', 'Колизей, Ватикан, площади барокко и насыщенные маршруты по вечному городу.', 'Древний Рим, музеи Ватикана и прогулки с идеальными фото-точками.', 'https://picsum.photos/seed/rome-card/1200/820', array['https://picsum.photos/seed/rome-gallery-1/560/420','https://picsum.photos/seed/rome-gallery-2/560/420','https://picsum.photos/seed/rome-gallery-3/560/420','https://picsum.photos/seed/rome-gallery-4/560/420']::text[], array['Колизей, Форум и Палатин|История','Музеи Ватикана и Сикстинская капелла|Музеи','Подземелья Колизея|История','Рим на закате с гидом|История','Замок Святого Ангела|История','Фонтан Треви и Испанская лестница|История','Ватиканские сады|Музеи','Кулинарный тур по Трастевере|Гастрономия','Тиволи и вилла д’Эсте|Однодневные поездки','Купол собора Святого Петра|Смотровые площадки','Bioparco Rome|Семейные','Галерея Боргезе|Музеи','Пантеон и площади барокко|История','Castel Romano Outlet|Шопинг','Ночной тур по античному Риму|История']::text[]),
    ('athens', 'Афины', 'Греция', 'Европа', 8, 'Варианты досуга в городе Афины', 'Акрополь, древняя агора и однодневные поездки по Аттике.', 'Античные памятники, смотровые точки и гастрономические маршруты.', 'https://picsum.photos/seed/athens-card/1200/820', array['https://picsum.photos/seed/athens-gallery-1/560/420','https://picsum.photos/seed/athens-gallery-2/560/420','https://picsum.photos/seed/athens-gallery-3/560/420','https://picsum.photos/seed/athens-gallery-4/560/420']::text[], array['Акрополь и музей Акрополя|История','Храм Посейдона на мысе Сунион|Однодневные поездки','Древняя агора Афин|История','Смотровая Ликавиттос|Смотровые площадки','Плака и старый город|История','Кулинарный тур по Афинам|Гастрономия','Круиз по Сароническим островам|Круизы','Национальный археологический музей|Музеи','Monastiraki Flea Market|Шопинг','Athens Riviera Sunset Tour|Однодневные поездки','Парк Stavros Niarchos|Семейные','Мастер-класс по греческой кухне|Гастрономия','Hop-on Hop-off Athens|История','Музей иллюзий Афины|Семейные','Традиционные лавки Плаки|Шопинг']::text[]),
    ('berlin', 'Берлин', 'Германия', 'Европа', 9, 'Варианты досуга в городе Берлин', 'История XX века, музеи, альтернативные кварталы и семейные маршруты.', 'Берлин для первого знакомства, музеев и насыщенных выходных.', 'https://picsum.photos/seed/berlin-card/1200/820', array['https://picsum.photos/seed/berlin-gallery-1/560/420','https://picsum.photos/seed/berlin-gallery-2/560/420','https://picsum.photos/seed/berlin-gallery-3/560/420','https://picsum.photos/seed/berlin-gallery-4/560/420']::text[], array['Бранденбургские ворота и Рейхстаг|История','Музейный остров — pass|Музеи','East Side Gallery|История','TV Tower Fast View|Смотровые площадки','Кройцберг и уличная еда|Гастрономия','Потсдам и Сан-Суси|Однодневные поездки','KaDeWe и Kurfürstendamm|Шопинг','Берлинский зоопарк|Семейные','Чекпойнт Чарли и Стена|История','Панорама на Потсдамской площади|Смотровые площадки','Pergamon Museum Highlights|Музеи','Круиз по Шпрее|Круизы','Темпельхоф и городские легенды|История','LEGOLAND Berlin|Семейные','Пивной тур по Берлину|Гастрономия']::text[]),
    ('barcelona', 'Барселона', 'Испания', 'Европа', 10, 'Варианты досуга в городе Барселона', 'Саграда Фамилия, Парк Гуэль, пляжи и вечерние прогулки по Барселоне.', 'Лучшие билеты, районы Гауди и однодневные выезды из города.', 'https://picsum.photos/seed/barcelona-card/1200/820', array['https://picsum.photos/seed/barcelona-gallery-1/560/420','https://picsum.photos/seed/barcelona-gallery-2/560/420','https://picsum.photos/seed/barcelona-gallery-3/560/420','https://picsum.photos/seed/barcelona-gallery-4/560/420']::text[], array['Саграда Фамилия — билет|Музеи','Парк Гуэль и наследие Гауди|История','Камп Ноу Experience|Семейные','Готический квартал и Рамбла|История','Круиз вдоль побережья Барселоны|Круизы','Монтсеррат на один день|Однодневные поездки','Бункеры Кармель — лучший вид|Смотровые площадки','Boqueria food tour|Гастрономия','Passeig de Gràcia и бутики|Шопинг','Casa Batlló|Музеи','Барселонский аквариум|Семейные','Монжуик и канатная дорога|Смотровые площадки','Тапас и вечерний тур|Гастрономия','Пляжи Барселонеты|История','Таррагона и Ситжес на день|Однодневные поездки']::text[]),
    ('venice', 'Венеция', 'Италия', 'Европа', 11, 'Варианты досуга в городе Венеция', 'Гондолы, музеи, дворцы и острова Венецианской лагуны.', 'Романтичные круизы, дворцы и островные маршруты.', 'https://picsum.photos/seed/venice-card/1200/820', array['https://picsum.photos/seed/venice-gallery-1/560/420','https://picsum.photos/seed/venice-gallery-2/560/420','https://picsum.photos/seed/venice-gallery-3/560/420','https://picsum.photos/seed/venice-gallery-4/560/420']::text[], array['Гондола по Гранд-каналу|Круизы','Дворец дожей — билет|Музеи','Собор Сан-Марко|История','Острова Мурано и Бурано|Однодневные поездки','Rialto Food Walk|Гастрономия','Коллекция Пегги Гуггенхайм|Музеи','Смотровая на колокольне Сан-Марко|Смотровые площадки','Секретные кварталы Cannaregio|История','Бутики ремесленников Венеции|Шопинг','Круиз по лагуне на закате|Круизы','Lido для семейной прогулки|Семейные','Театр Ла Фениче|История','Мастер-класс по маскам|Семейные','Террасы Fondaco dei Tedeschi|Смотровые площадки','Падуя на один день|Однодневные поездки']::text[]),
    ('vienna', 'Вена', 'Австрия', 'Европа', 12, 'Варианты досуга в городе Вена', 'Императорские дворцы, музеи и классическая музыка на отдельной странице.', 'Вена для музеев, дворцов, детей и вечерних концертов.', 'https://picsum.photos/seed/vienna-card/1200/820', array['https://picsum.photos/seed/vienna-gallery-1/560/420','https://picsum.photos/seed/vienna-gallery-2/560/420','https://picsum.photos/seed/vienna-gallery-3/560/420','https://picsum.photos/seed/vienna-gallery-4/560/420']::text[], array['Шёнбрунн и императорские сады|История','Belvedere Museum — билет|Музеи','Собор Святого Стефана|История','Vienna Ring Tram|Круизы','Prater и колесо обозрения|Семейные','Моцарт и Штраус концерт|Семейные','Naschmarkt гастротур|Гастрономия','Долина Вахау на день|Однодневные поездки','Kärntner Straße и бутики|Шопинг','Дом Хундертвассера|История','Смотровая башня Дунай|Смотровые площадки','Музей естествознания|Музеи','Венский лес на день|Однодневные поездки','Вечерняя Вена с гидом|История','Музей Sisi|Музеи']::text[])
  ) as t(slug, city, country, region, sort_order, hero_title, hero_subtitle, discovery_text, image_url, gallery_images, items)
), city_rows as (
  select
    slug,
    city,
    country,
    region,
    hero_title,
    hero_subtitle,
    discovery_text,
    image_url,
    gallery_images,
    cardinality(items) as variants_count,
    sort_order
  from city_seed
), expanded as (
  select
    city_seed.slug,
    city_seed.city,
    city_seed.country,
    city_seed.items,
    item,
    ordinality
  from city_seed,
  unnest(city_seed.items) with ordinality as u(item, ordinality)
)
insert into attractions_cities (slug, city, country, region, hero_title, hero_subtitle, discovery_text, image_url, gallery_images, variants_count, sort_order)
select slug, city, country, region, hero_title, hero_subtitle, discovery_text, image_url, gallery_images, variants_count, sort_order
from city_rows;

insert into attraction_collections (id, title, subtitle, category, city_slug, image_url, total_items, sort_order) values
('historic', 'Исторические хиты', 'Главные памятники, площади и архитектурные must-see в популярных городах.', 'История', 'all', 'https://picsum.photos/seed/attractions-history/1200/760', 72, 1),
('museums', 'Музеи и искусство', 'Коллекции, дворцы, галереи и входные билеты с быстрым проходом.', 'Музеи', 'all', 'https://picsum.photos/seed/attractions-museums/1200/760', 52, 2),
('cruises', 'Круизы и прогулки', 'Каналы, реки, лагуны и вечерние виды на лучшие города Европы.', 'Круизы', 'all', 'https://picsum.photos/seed/attractions-cruises/1200/760', 31, 3),
('daytrips', 'Поездки на весь день', 'Популярные выезды за пределы города с трансфером и гидом.', 'Однодневные поездки', 'all', 'https://picsum.photos/seed/attractions-daytrips/1200/760', 38, 4);

with city_seed as (
  select * from (values
    ('london', 'Лондон', 'Великобритания', array['Лондонский Тауэр и королевские регалии|История','Круиз по Темзе от Westminster|Круизы','Лондонский глаз — билет Fast Track|Смотровые площадки','Вестминстер и Биг-Бен с гидом|История','Британский музей — экскурсия|Музеи','Тауэрский мост — стеклянный переход|Смотровые площадки','Borough Market: гастрономический тур|Гастрономия','Камден и рынки северного Лондона|Шопинг','Стоунхендж на один день|Однодневные поездки','Собор Святого Павла|История','National Gallery Highlights|Музеи','SEA LIFE London Aquarium|Семейные','The Shard — обзорная площадка|Смотровые площадки','Гарри Поттер Studio Tour|Семейные','Ночной автобусный тур по Лондону|История']::text[]),
    ('paris', 'Париж', 'Франция', array['Круиз по Сене от Эйфелевой башни|Круизы','Лувр — приоритетный вход|Музеи','Эйфелева башня — билет Summit|Смотровые площадки','Монмартр с местным гидом|История','Музей Орсе — входной билет|Музеи','Нотр-Дам и остров Сите|История','Диснейленд Париж — билет на день|Семейные','Версаль с трансфером|Однодневные поездки','Гастротур по Маре|Гастрономия','Латинский квартал и Пантеон|История','Смотровая площадка Монпарнас|Смотровые площадки','Парижские пассажи и бутики|Шопинг','Круиз с ужином по Сене|Круизы','Музей Оранжери — быстрый вход|Музеи','Парк Астерикс — билет|Семейные']::text[]),
    ('istanbul', 'Стамбул', 'Турция', array['Айя-София и Голубая мечеть|История','Круиз по Босфору на закате|Круизы','Дворец Топкапы|История','Цистерна Базилика|История','Галатская башня|Смотровые площадки','Гранд-базар с гидом|Шопинг','Вкусный Стамбул: street food тур|Гастрономия','Дворец Долмабахче|История','Принцевы острова на день|Однодневные поездки','Музей турецкого и исламского искусства|Музеи','Miniatürk для всей семьи|Семейные','Султанахмет на рассвете|История','Крытый рынок специй|Шопинг','Вечерний круиз с шоу|Круизы','Террасы Бейоглу|Смотровые площадки']::text[]),
    ('hamburg', 'Гамбург', 'Германия', array['Портовый круиз по Гамбургу|Круизы','Эльбская филармония — Plaza Tour|Смотровые площадки','Speicherstadt и HafenCity|История','Миниатюрная страна чудес|Семейные','Музей эмиграции BallinStadt|Музеи','Рыбный рынок Гамбурга|Гастрономия','Ратуша и центр города|История','Репербан — вечерний тур|История','Аутлеты и бутики Jungfernstieg|Шопинг','Тоннель под Эльбой|История','Парк Плентен ун Бломен|Семейные','Дворец в Альтоне|История','Круиз по озёрам Альстер|Круизы','Пивной гастротур|Гастрономия','Люнебург на один день|Однодневные поездки']::text[]),
    ('amsterdam', 'Амстердам', 'Нидерланды', array['Круиз по каналам Амстердама|Круизы','Музей Ван Гога — билет|Музеи','Дом Анны Франк|История','Rijksmuseum Highlights|Музеи','Jordan и Nine Streets|Шопинг','Heineken Experience|Гастрономия','A’DAM Lookout Swing|Смотровые площадки','Zaanse Schans на один день|Однодневные поездки','Королевский дворец Амстердама|История','NEMO Science Museum|Семейные','Прогулка по кварталу Йордан|История','Рынок цветов и сувениров|Шопинг','Круиз с ужином по каналам|Круизы','This is Holland 5D Experience|Семейные','Гаага и Делфт на один день|Однодневные поездки']::text[]),
    ('lisbon', 'Лиссабон', 'Португалия', array['Трамвайный тур по Лиссабону|История','Башня Белен и монастырь Жеронимуш|История','Смотровые площадки Алфамы|Смотровые площадки','Фаду и ужин в Байрру-Алту|Гастрономия','Океанариум Лиссабона|Семейные','Синтра и Кашкайш на день|Однодневные поездки','LX Factory и местный дизайн|Шопинг','Круиз по реке Тежу|Круизы','MAAT и музей карет|Музеи','Тайные улочки Алфамы|История','Пастел-де-ната тур|Гастрономия','Канатная дорога Parque das Nações|Смотровые площадки','Лиссабонский зоопарк|Семейные','Обидуш и Назаре на день|Однодневные поездки','Прогулка по кварталу Шиаду|Шопинг']::text[]),
    ('rome', 'Рим', 'Италия', array['Колизей, Форум и Палатин|История','Музеи Ватикана и Сикстинская капелла|Музеи','Подземелья Колизея|История','Рим на закате с гидом|История','Замок Святого Ангела|История','Фонтан Треви и Испанская лестница|История','Ватиканские сады|Музеи','Кулинарный тур по Трастевере|Гастрономия','Тиволи и вилла д’Эсте|Однодневные поездки','Купол собора Святого Петра|Смотровые площадки','Bioparco Rome|Семейные','Галерея Боргезе|Музеи','Пантеон и площади барокко|История','Castel Romano Outlet|Шопинг','Ночной тур по античному Риму|История']::text[]),
    ('athens', 'Афины', 'Греция', array['Акрополь и музей Акрополя|История','Храм Посейдона на мысе Сунион|Однодневные поездки','Древняя агора Афин|История','Смотровая Ликавиттос|Смотровые площадки','Плака и старый город|История','Кулинарный тур по Афинам|Гастрономия','Круиз по Сароническим островам|Круизы','Национальный археологический музей|Музеи','Monastiraki Flea Market|Шопинг','Athens Riviera Sunset Tour|Однодневные поездки','Парк Stavros Niarchos|Семейные','Мастер-класс по греческой кухне|Гастрономия','Hop-on Hop-off Athens|История','Музей иллюзий Афины|Семейные','Традиционные лавки Плаки|Шопинг']::text[]),
    ('berlin', 'Берлин', 'Германия', array['Бранденбургские ворота и Рейхстаг|История','Музейный остров — pass|Музеи','East Side Gallery|История','TV Tower Fast View|Смотровые площадки','Кройцберг и уличная еда|Гастрономия','Потсдам и Сан-Суси|Однодневные поездки','KaDeWe и Kurfürstendamm|Шопинг','Берлинский зоопарк|Семейные','Чекпойнт Чарли и Стена|История','Панорама на Потсдамской площади|Смотровые площадки','Pergamon Museum Highlights|Музеи','Круиз по Шпрее|Круизы','Темпельхоф и городские легенды|История','LEGOLAND Berlin|Семейные','Пивной тур по Берлину|Гастрономия']::text[]),
    ('barcelona', 'Барселона', 'Испания', array['Саграда Фамилия — билет|Музеи','Парк Гуэль и наследие Гауди|История','Камп Ноу Experience|Семейные','Готический квартал и Рамбла|История','Круиз вдоль побережья Барселоны|Круизы','Монтсеррат на один день|Однодневные поездки','Бункеры Кармель — лучший вид|Смотровые площадки','Boqueria food tour|Гастрономия','Passeig de Gràcia и бутики|Шопинг','Casa Batlló|Музеи','Барселонский аквариум|Семейные','Монжуик и канатная дорога|Смотровые площадки','Тапас и вечерний тур|Гастрономия','Пляжи Барселонеты|История','Таррагона и Ситжес на день|Однодневные поездки']::text[]),
    ('venice', 'Венеция', 'Италия', array['Гондола по Гранд-каналу|Круизы','Дворец дожей — билет|Музеи','Собор Сан-Марко|История','Острова Мурано и Бурано|Однодневные поездки','Rialto Food Walk|Гастрономия','Коллекция Пегги Гуггенхайм|Музеи','Смотровая на колокольне Сан-Марко|Смотровые площадки','Секретные кварталы Cannaregio|История','Бутики ремесленников Венеции|Шопинг','Круиз по лагуне на закате|Круизы','Lido для семейной прогулки|Семейные','Театр Ла Фениче|История','Мастер-класс по маскам|Семейные','Террасы Fondaco dei Tedeschi|Смотровые площадки','Падуя на один день|Однодневные поездки']::text[]),
    ('vienna', 'Вена', 'Австрия', array['Шёнбрунн и императорские сады|История','Belvedere Museum — билет|Музеи','Собор Святого Стефана|История','Vienna Ring Tram|Круизы','Prater и колесо обозрения|Семейные','Моцарт и Штраус концерт|Семейные','Naschmarkt гастротур|Гастрономия','Долина Вахау на день|Однодневные поездки','Kärntner Straße и бутики|Шопинг','Дом Хундертвассера|История','Смотровая башня Дунай|Смотровые площадки','Музей естествознания|Музеи','Венский лес на день|Однодневные поездки','Вечерняя Вена с гидом|История','Музей Sisi|Музеи']::text[])
  ) as t(slug, city, country, items)
), expanded as (
  select slug, city, country, item, ordinality
  from city_seed,
  unnest(city_seed.items) with ordinality as u(item, ordinality)
)
insert into attractions (city_slug, name, city, country, category, short_description, rating, rating_label, reviews_count, price, original_price, duration_hours, duration_label, image_url, gallery_images, badge, free_cancel, available_today, bestseller_rank, is_genius)
select
  slug,
  split_part(item, '|', 1) as name,
  city,
  country,
  split_part(item, '|', 2) as category,
  split_part(item, '|', 1) || ' — популярный вариант досуга в городе ' || city || '. Онлайн-бронирование, мобильный билет и удобные временные слоты без сложного поиска.' as short_description,
  round((4.2 + ((ordinality - 1) % 6) * 0.1)::numeric, 1) as rating,
  case
    when round((4.2 + ((ordinality - 1) % 6) * 0.1)::numeric, 1) >= 4.7 then 'Потрясающе'
    when round((4.2 + ((ordinality - 1) % 6) * 0.1)::numeric, 1) >= 4.5 then 'Превосходно'
    else 'Очень хорошо'
  end as rating_label,
  860 + ordinality * 145 + char_length(city) * 11 as reviews_count,
  15500 + ordinality * 2400 + char_length(city) * 350 as price,
  round((15500 + ordinality * 2400 + char_length(city) * 350) * 1.14) as original_price,
  case split_part(item, '|', 2)
    when 'Круизы' then 1.3
    when 'Музеи' then 2.5
    when 'История' then 3
    when 'Смотровые площадки' then 1.5
    when 'Семейные' then 3.5
    when 'Однодневные поездки' then 8
    when 'Гастрономия' then 2.8
    when 'Шопинг' then 3
    else 2
  end as duration_hours,
  case split_part(item, '|', 2)
    when 'Круизы' then '1 ч. – 1 ч. 20 мин.'
    when 'Музеи' then '2 ч. – 3 ч.'
    when 'История' then '2 ч. – 4 ч.'
    when 'Смотровые площадки' then '1 ч. – 2 ч.'
    when 'Семейные' then '2 ч. – 5 ч.'
    when 'Однодневные поездки' then '6 ч. – 10 ч.'
    when 'Гастрономия' then '2 ч. – 3 ч. 30 мин.'
    when 'Шопинг' then '2 ч. – 4 ч.'
    else '2 ч.'
  end as duration_label,
  'https://picsum.photos/seed/' || slug || '-' || ordinality || '-main/900/650' as image_url,
  array[
    'https://picsum.photos/seed/' || slug || '-' || ordinality || '-g1/320/240',
    'https://picsum.photos/seed/' || slug || '-' || ordinality || '-g2/320/240',
    'https://picsum.photos/seed/' || slug || '-' || ordinality || '-g3/320/240',
    'https://picsum.photos/seed/' || slug || '-' || ordinality || '-g4/320/240'
  ]::text[] as gallery_images,
  case when ordinality <= 3 then 'Bestseller' else null end as badge,
  (ordinality % 5) <> 0 as free_cancel,
  (ordinality % 4) <> 0 as available_today,
  case when ordinality <= 5 then ordinality else null end as bestseller_rank,
  (ordinality % 4) = 2 as is_genius
from expanded;

-- FLIGHTS
insert into flight_airports (code, city, airport_name, country, popular_rank) values
('TAS', 'Tashkent', 'Islam Karimov Tashkent International Airport', 'Uzbekistan', 1),
('DXB', 'Dubai', 'Dubai International Airport', 'UAE', 2),
('IST', 'Istanbul', 'Istanbul Airport', 'Turkey', 3),
('SHJ', 'Sharjah', 'Sharjah International Airport', 'UAE', 4),
('DOH', 'Doha', 'Hamad International Airport', 'Qatar', 5),
('AUH', 'Abu Dhabi', 'Zayed International Airport', 'UAE', 6),
('SAW', 'Istanbul', 'Sabiha Gokcen International Airport', 'Turkey', 7),
('GYD', 'Baku', 'Heydar Aliyev International Airport', 'Azerbaijan', 8),
('TBS', 'Tbilisi', 'Tbilisi International Airport', 'Georgia', 9),
('ALA', 'Almaty', 'Almaty International Airport', 'Kazakhstan', 10);

insert into flight_routes (from_code, from_city, to_code, to_city, to_country, route_label, teaser, sample_price, is_featured, sort_order) values
('TAS', 'Tashkent', 'DXB', 'Dubai', 'UAE', 'Tashkent → Dubai', 'Nonstop round trips and mixed-airline fares', 5374124, true, 1),
('TAS', 'Tashkent', 'IST', 'Istanbul', 'Turkey', 'Tashkent → Istanbul', 'Popular direct flights', 7200000, true, 2),
('TAS', 'Tashkent', 'SHJ', 'Sharjah', 'UAE', 'Tashkent → Sharjah', 'Budget nonstop fares', 5900000, true, 3),
('TAS', 'Tashkent', 'DOH', 'Doha', 'Qatar', 'Tashkent → Doha', 'One-stop and premium options', 8267352, true, 4),
('TAS', 'Tashkent', 'AUH', 'Abu Dhabi', 'UAE', 'Tashkent → Abu Dhabi', 'Flexible fares with one stop', 6480000, true, 5),
('TAS', 'Tashkent', 'GYD', 'Baku', 'Azerbaijan', 'Tashkent → Baku', 'Short city-break friendly fares', 5840000, true, 6),
('TAS', 'Tashkent', 'TBS', 'Tbilisi', 'Georgia', 'Tashkent → Tbilisi', 'Leisure and city break connections', 6390000, true, 7),
('TAS', 'Tashkent', 'ALA', 'Almaty', 'Kazakhstan', 'Tashkent → Almaty', 'Fast direct flights', 4510000, true, 8);

insert into flights (
  airline,
  airline_code,
  from_city,
  from_code,
  to_city,
  to_code,
  depart_time,
  arrive_time,
  return_depart_time,
  return_arrive_time,
  duration,
  return_duration,
  stops,
  out_airline,
  out_airline_code,
  out_depart_time,
  out_arrive_time,
  out_duration,
  out_stops,
  out_stop_city,
  back_airline,
  back_airline_code,
  back_depart_time,
  back_arrive_time,
  back_duration,
  back_stops,
  back_stop_city,
  price,
  cabin_class,
  tags,
  is_best,
  is_cheapest
) values
('Centrum Air', 'CA', 'Tashkent', 'TAS', 'Dubai', 'DXB', '7:50 am', '11:30 am', '1:00 pm', '6:50 pm', '4h 40m', '4h 50m', 'nonstop', 'Centrum Air', 'CA', '7:50 am', '11:30 am', '4h 40m', 'nonstop', null, 'Centrum Air', 'CA', '1:00 pm', '6:50 pm', '4h 50m', 'nonstop', null, 5374124, 'Economy Cabin', array['Best', 'Cheapest'], true, true),
('Uzbekistan Airways', 'HY', 'Tashkent', 'TAS', 'Dubai', 'DXB', '8:25 am', '11:00 am', '12:30 pm', '4:40 pm', '3h 35m', '3h 10m', 'nonstop', 'Uzbekistan Airways', 'HY', '8:25 am', '11:00 am', '3h 35m', 'nonstop', null, 'Uzbekistan Airways', 'HY', '12:30 pm', '4:40 pm', '3h 10m', 'nonstop', null, 6615478, 'Economy Cabin', array[]::text[], false, false),
('flydubai', 'FZ', 'Tashkent', 'TAS', 'Dubai', 'DXB', '5:30 pm', '8:10 pm', '11:35 am', '4:10 pm', '3h 40m', '3h 35m', 'nonstop', 'flydubai', 'FZ', '5:30 pm', '8:10 pm', '3h 40m', 'nonstop', null, 'flydubai', 'FZ', '11:35 am', '4:10 pm', '3h 35m', 'nonstop', null, 7881379, 'Lite', array[]::text[], false, false),
('Hahn Air', 'HR', 'Tashkent', 'TAS', 'Dubai', 'DXB', '7:50 am', '11:30 am', '1:00 pm', '6:50 pm', '4h 40m', '4h 50m', 'nonstop', 'Hahn Air', 'HR', '7:50 am', '11:30 am', '4h 40m', 'nonstop', null, 'Hahn Air', 'HR', '1:00 pm', '6:50 pm', '4h 50m', 'nonstop', null, 6591294, 'Economy Cabin', array[]::text[], false, false),
('Emirates', 'EK', 'Tashkent', 'TAS', 'Dubai', 'DXB', '5:30 am', '8:10 am', '11:35 am', '4:10 pm', '3h 40m', '3h 35m', 'nonstop', 'Emirates', 'EK', '5:30 am', '8:10 am', '3h 40m', 'nonstop', null, 'Emirates', 'EK', '11:35 am', '4:10 pm', '3h 35m', 'nonstop', null, 9517534, 'Economy Cabin', array[]::text[], false, false),
('Qatar Airways', 'QR', 'Tashkent', 'TAS', 'Doha', 'DOH', '8:25 am', '4:05 pm', '5:35 pm', '7:20 am', '9h 40m', '11h 45m', '1 stop', 'Qatar Airways', 'QR', '8:25 am', '4:05 pm', '9h 40m', '1 stop', 'Baku', 'Qatar Airways', 'QR', '5:35 pm', '7:20 am', '11h 45m', '1 stop', 'Dubai', 8267352, 'Economy Cabin', array[]::text[], false, false),
('Uzbekistan Airways', 'HY', 'Tashkent', 'TAS', 'Istanbul', 'IST', '2:30 am', '5:00 am', '6:00 pm', '11:30 pm', '5h 30m', '5h 30m', 'nonstop', 'Uzbekistan Airways', 'HY', '2:30 am', '5:00 am', '5h 30m', 'nonstop', null, 'Uzbekistan Airways', 'HY', '6:00 pm', '11:30 pm', '5h 30m', 'nonstop', null, 7200000, 'Economy Cabin', array[]::text[], false, false),
('Turkish Airlines', 'TK', 'Tashkent', 'TAS', 'Istanbul', 'IST', '10:15 am', '1:45 pm', '5:00 pm', '10:30 pm', '5h 30m', '5h 30m', 'nonstop', 'Turkish Airlines', 'TK', '10:15 am', '1:45 pm', '5h 30m', 'nonstop', null, 'Turkish Airlines', 'TK', '5:00 pm', '10:30 pm', '5h 30m', 'nonstop', null, 8500000, 'Economy Cabin', array[]::text[], false, false),
('Air Arabia', 'G9', 'Tashkent', 'TAS', 'Sharjah', 'SHJ', '10:00 pm', '11:45 pm', '10:00 am', '3:30 pm', '3h 45m', '4h 30m', 'nonstop', 'Air Arabia', 'G9', '10:00 pm', '11:45 pm', '3h 45m', 'nonstop', null, 'Air Arabia', 'G9', '10:00 am', '3:30 pm', '4h 30m', 'nonstop', null, 5900000, 'Economy Cabin', array['Cheapest'], false, true),
('Etihad Airways', 'EY', 'Tashkent', 'TAS', 'Abu Dhabi', 'AUH', '3:20 am', '9:20 am', '2:10 pm', '1:40 am', '7h 0m', '8h 30m', '1 stop', 'Etihad Airways', 'EY', '3:20 am', '9:20 am', '7h 0m', '1 stop', 'Doha', 'Etihad Airways', 'EY', '2:10 pm', '1:40 am', '8h 30m', '1 stop', 'Muscat', 6480000, 'Economy Cabin', array[]::text[], false, false),
('Pegasus Airlines', 'PC', 'Tashkent', 'TAS', 'Istanbul', 'SAW', '5:40 am', '11:10 am', '12:15 pm', '12:35 am', '7h 30m', '8h 20m', '1 stop', 'Pegasus Airlines', 'PC', '5:40 am', '11:10 am', '7h 30m', '1 stop', 'Bishkek', 'Pegasus Airlines', 'PC', '12:15 pm', '12:35 am', '8h 20m', '1 stop', 'Almaty', 6120000, 'Economy Cabin', array[]::text[], false, false),
('Azerbaijan Airlines', 'J2', 'Tashkent', 'TAS', 'Baku', 'GYD', '2:40 pm', '7:15 pm', '8:40 pm', '4:20 am', '5h 35m', '6h 40m', '1 stop', 'Azerbaijan Airlines', 'J2', '2:40 pm', '7:15 pm', '5h 35m', '1 stop', 'Aktau', 'Azerbaijan Airlines', 'J2', '8:40 pm', '4:20 am', '6h 40m', '1 stop', 'Aktau', 5840000, 'Economy Cabin', array['Cheapest'], false, true),
('Turkish Airlines', 'TK', 'Tashkent', 'TAS', 'Tbilisi', 'TBS', '6:10 am', '1:25 pm', '2:50 pm', '2:10 am', '8h 15m', '8h 20m', '1 stop', 'Turkish Airlines', 'TK', '6:10 am', '1:25 pm', '8h 15m', '1 stop', 'Istanbul', 'Turkish Airlines', 'TK', '2:50 pm', '2:10 am', '8h 20m', '1 stop', 'Istanbul', 6390000, 'Economy Cabin', array[]::text[], false, false),
('Air Astana', 'KC', 'Tashkent', 'TAS', 'Almaty', 'ALA', '9:10 am', '11:35 am', '7:20 pm', '9:50 pm', '2h 25m', '2h 30m', 'nonstop', 'Air Astana', 'KC', '9:10 am', '11:35 am', '2h 25m', 'nonstop', null, 'Air Astana', 'KC', '7:20 pm', '9:50 pm', '2h 30m', 'nonstop', null, 4510000, 'Economy Cabin', array['Best'], true, false);

-- CAR RENTALS
insert into car_rentals (company, car_model, car_class, city, country, price_per_day, image_url, rating, reviews, seats, transmission, fuel_type) values
('Hertz', 'Chevrolet Cobalt', 'economy', 'Ташкент', 'Узбекистан', 180000, 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600', 8.2, 245, 5, 'Механика', 'Бензин'),
('Budget', 'Chevrolet Nexia 3', 'economy', 'Ташкент', 'Узбекистан', 150000, 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600', 7.9, 312, 5, 'Механика', 'Бензин'),
('Avis', 'Toyota Camry', 'standard', 'Ташкент', 'Узбекистан', 350000, 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600', 9.0, 178, 5, 'Автомат', 'Бензин'),
('Premium Auto', 'Mercedes-Benz E-Class', 'luxury', 'Ташкент', 'Узбекистан', 750000, 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=600', 9.3, 89, 5, 'Автомат', 'Бензин'),
('Sixt', 'Hyundai Tucson', 'suv', 'Ташкент', 'Узбекистан', 450000, 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=600', 8.7, 156, 5, 'Автомат', 'Бензин'),
('Emirates Drive', 'Toyota Corolla', 'economy', 'Дубай', 'ОАЭ', 320000, 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600', 8.5, 432, 5, 'Автомат', 'Бензин'),
('Thrifty', 'Nissan Patrol', 'suv', 'Дубай', 'ОАЭ', 900000, 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=600', 9.1, 201, 7, 'Автомат', 'Бензин'),
('Hertz', 'BMW 5 Series', 'luxury', 'Дубай', 'ОАЭ', 1200000, 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=600', 9.4, 98, 5, 'Автомат', 'Бензин');

-- AIRPORT TAXIS
insert into airport_taxis (from_location, to_location, city, price, duration_min, car_type, image_url, provider, rating) values
('Аэропорт Ташкент (TAS)', 'Центр города', 'Ташкент', 80000, 25, 'sedan', 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600', 'Yandex Taxi', 8.8),
('Аэропорт Ташкент (TAS)', 'Центр города', 'Ташкент', 130000, 25, 'minivan', 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600', 'Uber', 8.5),
('Аэропорт Ташкент (TAS)', 'Центр города', 'Ташкент', 250000, 20, 'business', 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=600', 'Premium Taxi', 9.2),
('Аэропорт Дубай (DXB)', 'Центр Дубая', 'Дубай', 350000, 35, 'sedan', 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600', 'Dubai Taxi', 8.9),
('Аэропорт Дубай (DXB)', 'Центр Дубая', 'Дубай', 600000, 30, 'business', 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=600', 'Careem Business', 9.4),
('Аэропорт Самарканд (SKD)', 'Центр города', 'Самарканд', 60000, 15, 'sedan', 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600', 'Local Taxi', 8.1),
('Аэропорт Хива (URG)', 'Ичан-Кала', 'Хива', 90000, 20, 'sedan', 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600', 'Local Taxi', 8.3);

-- ============================================================
-- ШАГ 4: RLS политики
-- ============================================================
alter table hotels enable row level security;
alter table destinations enable row level security;
alter table attractions enable row level security;
alter table attractions_cities enable row level security;
alter table attraction_collections enable row level security;
alter table flights enable row level security;
alter table flight_airports enable row level security;
alter table flight_routes enable row level security;
alter table car_rentals enable row level security;
alter table airport_taxis enable row level security;
alter table bookings enable row level security;

drop policy if exists "Public read hotels" on hotels;
drop policy if exists "Public read destinations" on destinations;
drop policy if exists "Public read attractions" on attractions;
drop policy if exists "Public read attractions cities" on attractions_cities;
drop policy if exists "Public read attraction collections" on attraction_collections;
drop policy if exists "Public read flights" on flights;
drop policy if exists "Public read flight_airports" on flight_airports;
drop policy if exists "Public read flight_routes" on flight_routes;
drop policy if exists "Public read car_rentals" on car_rentals;
drop policy if exists "Public read airport_taxis" on airport_taxis;
drop policy if exists "Users read own bookings" on bookings;
drop policy if exists "Users insert own bookings" on bookings;
drop policy if exists "Users update own bookings" on bookings;

create policy "Public read hotels" on hotels for select using (true);
create policy "Public read destinations" on destinations for select using (true);
create policy "Public read attractions" on attractions for select using (true);
create policy "Public read attractions cities" on attractions_cities for select using (true);
create policy "Public read attraction collections" on attraction_collections for select using (true);
create policy "Public read flights" on flights for select using (true);
create policy "Public read flight_airports" on flight_airports for select using (true);
create policy "Public read flight_routes" on flight_routes for select using (true);
create policy "Public read car_rentals" on car_rentals for select using (true);
create policy "Public read airport_taxis" on airport_taxis for select using (true);
create policy "Users read own bookings" on bookings for select using (auth.uid() = user_id);
create policy "Users insert own bookings" on bookings for insert with check (auth.uid() = user_id);
create policy "Users update own bookings" on bookings for update using (auth.uid() = user_id);
