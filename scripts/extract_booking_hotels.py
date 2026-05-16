from __future__ import annotations

import json
from pathlib import Path

DOWNLOADS_DIR = Path.home() / "Downloads"
OUTPUT_PATH = Path(__file__).resolve().parents[1] / "data" / "booking-hotels-extracted.json"
BASE_IMAGE_URL = "https://cf.bstatic.com"
CITY_ALIASES = {
    "Xiva": "Хива",
    "Khiva": "Хива",
    "Kokand": "Коканд",
    "Toshkent": "Ташкент",
    "Tashkent": "Ташкент",
    "Istanbul": "Стамбул",
    "Almaty": "Алматы",
    "Tbilisi": "Тбилиси",
    "Dubai": "Дубай",
}
COUNTRY_BY_CODE = {
    "uz": "Узбекистан",
    "ae": "ОАЭ",
    "tr": "Турция",
    "kz": "Казахстан",
    "ge": "Грузия",
}
FILE_CITY_MAP = {
    "Хива": "Хива",
    "Ташкент": "Ташкент",
    "Дубай": "Дубай",
    "Стамбул": "Стамбул",
    "Алматы": "Алматы",
    "Тбилиси": "Тбилиси",
    "Коканд": "Коканд",
}


def normalize_space(value: str | None) -> str | None:
    if not value:
        return None
    return " ".join(str(value).replace("\xa0", " ").split())


def normalize_city(value: str | None, fallback: str | None = None) -> str | None:
    value = normalize_space(value)
    if value in CITY_ALIASES:
        return CITY_ALIASES[value]
    return value or fallback


def normalize_country(code: str | None) -> str | None:
    if not code:
        return None
    return COUNTRY_BY_CODE.get(code.lower(), code.upper())


def normalize_image(relative_url: str | None) -> str | None:
    if not relative_url:
        return None
    if relative_url.startswith("http"):
        return relative_url
    return f"{BASE_IMAGE_URL}{relative_url}".replace("\\u0026", "&")


def infer_category(name: str | None, taxonomy: list[dict] | None) -> str:
    text = (name or "").lower()
    taxonomy_values = " ".join(
        normalize_space(((item.get("value") or {}).get("text"))) or ""
        for item in (taxonomy or [])
    ).lower()
    blob = f"{text} {taxonomy_values}"

    if any(token in blob for token in ["hostel", "хостел"]):
        return "Хостел"
    if any(
        token in blob
        for token in [
            "guest house",
            "guesthouse",
            "гостевой дом",
            "b&b",
            "bed and breakfast",
        ]
    ):
        return "Гостевой дом"
    if any(
        token in blob
        for token in [
            "apartment",
            "apart",
            "апартамент",
            "апартаменты",
            "квартира",
            "residence",
            "studio",
        ]
    ):
        return "Апартаменты"
    if any(token in blob for token in ["resort", "курорт"]):
        return "Курортный отель"
    return "Гостиница"


def extract_results_array(text: str) -> str:
    marker = 'results":['
    start = text.find(marker)
    if start == -1:
        raise ValueError("results array marker not found")

    array_start = start + len(marker) - 1
    depth = 0
    in_string = False
    escape = False

    for index in range(array_start, len(text)):
        char = text[index]
        if in_string:
            if escape:
                escape = False
            elif char == "\\":
                escape = True
            elif char == '"':
                in_string = False
        else:
            if char == '"':
                in_string = True
            elif char == "[":
                depth += 1
            elif char == "]":
                depth -= 1
                if depth == 0:
                    return text[array_start : index + 1]

    raise ValueError("results array is not closed")


def extract_file_city(file_name: str) -> str | None:
    for key, value in FILE_CITY_MAP.items():
        if key in file_name:
            return value
    return None


def parse_file(path: Path) -> dict:
    text = path.read_text(encoding="utf-8", errors="ignore")
    results = json.loads(extract_results_array(text))
    fallback_city = extract_file_city(path.name)

    hotels = []
    for item in results:
        basic = item.get("basicPropertyData") or {}
        location = basic.get("location") or {}
        reviews = basic.get("reviews") or {}
        display = item.get("displayName") or {}
        photos = ((basic.get("photos") or {}).get("main") or {})
        price_info = item.get("priceDisplayInfoIrene") or {}
        display_price = (price_info.get("displayPrice") or {}).get("amountPerStay") or {}
        old_price = (price_info.get("priceBeforeDiscount") or {}).get("amountPerStay") or {}
        taxonomy = item.get("taxonomyInfos") or []
        category = infer_category(display.get("text"), taxonomy)
        normalized_city = fallback_city or normalize_city(location.get("city"))

        hotels.append(
            {
                "booking_id": basic.get("id"),
                "name": normalize_space(display.get("text")),
                "city": normalized_city,
                "country": normalize_country(location.get("countryCode")),
                "address": normalize_space(location.get("address")),
                "stars": (basic.get("starRating") or {}).get("value") or 0,
                "rating": reviews.get("totalScore"),
                "rating_text": (reviews.get("totalScoreTextTag") or {}).get("translation"),
                "reviews_count": reviews.get("reviewsCount"),
                "price": normalize_space(display_price.get("amountRounded")),
                "price_unformatted": display_price.get("amountUnformatted"),
                "old_price": normalize_space(old_price.get("amountRounded")),
                "old_price_unformatted": old_price.get("amountUnformatted"),
                "category": category,
                "page_name": basic.get("pageName"),
                "image_url": normalize_image((photos.get("highResJpegUrl") or {}).get("relativeUrl"))
                or normalize_image((photos.get("lowResJpegUrl") or {}).get("relativeUrl")),
                "image_preview_url": normalize_image((photos.get("lowResJpegUrl") or {}).get("relativeUrl")),
                "is_genius": any(
                    (discount.get("name") or {}).get("translation") == "Скидка Genius"
                    for discount in (price_info.get("discounts") or [])
                ),
            }
        )

    return {
        "source_file": path.name,
        "city": fallback_city,
        "count": len(hotels),
        "hotels": hotels,
    }


def main() -> None:
    files = sorted(DOWNLOADS_DIR.glob("Booking.com_ Отели по направлению *.html"))
    parsed = [parse_file(path) for path in files]
    payload = {
        "source_dir": str(DOWNLOADS_DIR),
        "files": parsed,
        "total_hotels": sum(item["count"] for item in parsed),
    }
    OUTPUT_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Saved {payload['total_hotels']} hotels to {OUTPUT_PATH}")
    for item in parsed:
        print(f"- {item['city']}: {item['count']}")


if __name__ == "__main__":
    main()
