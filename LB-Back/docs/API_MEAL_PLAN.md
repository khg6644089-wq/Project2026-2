# 추천 식단(Meal Plan) · 식단 기록(Diet Log) API 명세서

- **인증**: 아래 API는 모두 **로그인(Authorization)** 필요. Bearer 토큰 또는 세션 기준 회원 식별.
- **Base URL**: 서버 주소 기준 (예: `http://localhost:8080`).

---

## 1. 플로우 요약

| 순서 | 설명 | API |
|------|------|-----|
| 1 | 로그인 후 "추천받기" | `POST /meal-plans/recommend/today` |
| 2 | 파이썬(FastAPI)이 회원 정보로 개인 맞춤 식단 추천 | (백엔드 내부 호출) |
| 3 | 추천 결과를 `meal`, `meal_item`, `meal_plan`에 저장 | (동일 API 내 처리) |
| 4 | 유저가 "먹겠습니다(accept)" → `diet_log`에 저장·조회 가능 | `POST /meal-plans/{id}/accept`, `GET /diet-logs` |
| 5 | 추천받은 식단 목록 조회 | `GET /meal-plans/today`, `GET /meal-plans?date=yyyy-MM-dd` |
| 6 | 메뉴가 마음에 안 들면 "전체 다시 받기" | `POST /meal-plans/recommend/today/replace` |

---

## 2. Meal Plan API

### 2.1 오늘 추천 식단 생성 (추천받기)

**요청**

```
POST /meal-plans/recommend/today
```

- **Headers**: `Authorization` (Bearer 또는 세션 쿠키)
- **Body**: 없음 (로그인한 회원 정보로 자동 요청)

**응답**

- **201 Created**  
  - Body: 없음

**에러**

| 상태 코드 | 설명 |
|-----------|------|
| 401 | 미로그인 |
| 404 / 500 | 회원 없음, 추천 서버(Python) 오류 등 |

---

### 2.2 전체 다시 받기

**요청**

```
POST /meal-plans/recommend/today/replace
```

- **Headers**: `Authorization`
- **Body**: 없음

**동작**  
오늘 날짜의 **미채택** 추천 식단을 모두 삭제한 뒤, 파이썬에서 새로 추천받아 `meal` / `meal_item` / `meal_plan`에 다시 저장합니다.

**응답**

- **201 Created**  
  - Body: 없음

**에러**

| 상태 코드 | 설명 |
|-----------|------|
| 400 | 해당 날짜에 이미 채택(accept)한 식단이 있음 |
| 401 | 미로그인 |
| 404 / 500 | 회원 없음, 추천 서버 오류 등 |

---

### 2.3 오늘 날짜 추천 식단 목록 조회

**요청**

```
GET /meal-plans/today
```

- **Headers**: `Authorization`
- **Query**: 없음

**응답**

- **200 OK**  
  - Content-Type: `application/json`  
  - Body: `MealPlanResponseDto[]` (배열)

**응답 예시**

```json
[
  {
    "id": 1,
    "mealId": 10,
    "dateAt": "2025-03-06",
    "isAccepted": false,
    "mealType": "B",
    "menu": "오트밀 with 베리",
    "totalCalories": 350,
    "comment": "아침 권장 메뉴",
    "createdAt": "2025-03-06T09:00:00"
  },
  {
    "id": 2,
    "mealId": 11,
    "dateAt": "2025-03-06",
    "isAccepted": false,
    "mealType": "L",
    "menu": "닭가슴살 샐러드",
    "totalCalories": 420,
    "comment": "",
    "createdAt": "2025-03-06T09:00:01"
  },
  {
    "id": 3,
    "mealId": 12,
    "dateAt": "2025-03-06",
    "isAccepted": false,
    "mealType": "D",
    "menu": "연어 구이",
    "totalCalories": 480,
    "comment": "",
    "createdAt": "2025-03-06T09:00:02"
  }
]
```

**필드 설명**

| 필드 | 타입 | 설명 |
|------|------|------|
| id | Long | meal_plan PK |
| mealId | Long | 연결된 meal PK |
| dateAt | String (yyyy-MM-dd) | 식단 적용 날짜 |
| isAccepted | Boolean | 먹겠습니다(채택) 여부 |
| mealType | String | B: 아침, L: 점심, D: 저녁, S: 간식 |
| menu | String | 메뉴명 |
| totalCalories | Integer | 총 칼로리(kcal) |
| comment | String | 메모/설명 |
| createdAt | String (ISO 8601) | 생성 시각 |

---

### 2.4 특정 날짜 추천 식단 목록 조회

**요청**

```
GET /meal-plans?date={yyyy-MM-dd}
```

- **Headers**: `Authorization`
- **Query**

| 파라미터 | 필수 | 설명 |
|----------|------|------|
| date | X | 조회할 날짜. 생략 시 **오늘** |

**응답**

- **200 OK**  
  - Body: `MealPlanResponseDto[]` (형식은 2.3과 동일)

**예시**

```
GET /meal-plans?date=2025-03-05
```

---

### 2.5 추천 식단 채택 (먹겠습니다)

**요청**

```
POST /meal-plans/{id}/accept
```

- **Headers**: `Authorization`
- **Path**
  - `id`: 채택할 **meal_plan** ID (Long)

**응답**

- **201 Created**  
  - Content-Type: `application/json`  
  - Body: `DietLogResponseDto` (생성된 식단 기록)

**응답 예시**

```json
{
  "id": 101,
  "memberId": 1,
  "mealId": 10,
  "dateAt": "2025-03-06T00:00:00",
  "createdAt": "2025-03-06T10:30:00",
  "updatedAt": "2025-03-06T10:30:00",
  "meal": {
    "id": 10,
    "mealType": "B",
    "menu": "오트밀 with 베리",
    "totalCalories": 350,
    "comment": "아침 권장 메뉴",
    "carbohydrate": 0,
    "protein": 0,
    "fat": 0
  }
}
```

**에러**

| 상태 코드 | 설명 |
|-----------|------|
| 400 | 추천 식단 없음, 본인 소유 아님, 이미 채택됨 |
| 401 | 미로그인 |

---

## 3. Diet Log API (식단 기록 조회)

채택(accept)한 식단은 `diet_log`에 저장되며, 아래 API로 조회합니다.

### 3.1 식단 기록 목록 조회

**요청**

```
GET /diet-logs
GET /diet-logs?date={yyyy-MM-dd}
GET /diet-logs?fromDate={yyyy-MM-dd}&toDate={yyyy-MM-dd}
```

- **Headers**: `Authorization`
- **Query**

| 파라미터 | 필수 | 설명 |
|----------|------|------|
| date | X | 해당 날짜만 조회 |
| fromDate | X | 기간 조회 시작일 |
| toDate | X | 기간 조회 종료일 (fromDate와 함께 사용) |
| (없음) | - | 전체 목록 (최신 순) |

**응답**

- **200 OK**  
  - Body: `DietLogResponseDto[]`

**DietLogResponseDto 필드**

| 필드 | 타입 | 설명 |
|------|------|------|
| id | Long | diet_log PK |
| memberId | Long | 회원 ID |
| mealId | Long | 식단(meal) ID |
| dateAt | String (ISO 8601) | 기록 날짜·시각 |
| createdAt | String (ISO 8601) | 생성 시각 |
| updatedAt | String (ISO 8601) | 수정 시각 |
| meal | MealResponseDto | 연결된 식단 상세 (메뉴명, 칼로리, 탄단지 등) |

---

### 3.2 식단 기록 단건 조회

**요청**

```
GET /diet-logs/{id}
```

- **Path**: `id` — diet_log ID

**응답**

- **200 OK**  
  - Body: `DietLogResponseDto` (단일 객체)

---

### 3.3 식단 기록 추가 (직접 등록)

추천이 아닌, 사용자가 직접 식단을 기록할 때 사용합니다.

**요청**

```
POST /diet-logs
Content-Type: application/json
```

**Body**

```json
{
  "mealId": 10
}
```

| 필드 | 필수 | 설명 |
|------|------|------|
| mealId | O | 기록할 meal ID |

**응답**

- **201 Created**  
  - Body: `DietLogResponseDto`

---

## 4. API 목록 요약

| 메서드 | URL | 설명 |
|--------|-----|------|
| POST | `/meal-plans/recommend/today` | 추천받기 (오늘 식단 생성) |
| POST | `/meal-plans/recommend/today/replace` | 전체 다시 받기 |
| GET | `/meal-plans/today` | 오늘 추천 식단 목록 |
| GET | `/meal-plans?date=yyyy-MM-dd` | 특정 날짜 추천 식단 목록 |
| POST | `/meal-plans/{id}/accept` | 먹겠습니다 (채택 → diet_log 저장) |
| GET | `/diet-logs` | 식단 기록 목록 (날짜/기간 필터 가능) |
| GET | `/diet-logs/{id}` | 식단 기록 단건 |
| POST | `/diet-logs` | 식단 기록 직접 추가 |
| POST | `/services/dietrecommendation/recommend` | (디버깅) FastAPI 추천 원본 JSON 프록시 |

---

## 5. 공통 에러

- **401 Unauthorized**: 로그인 필요.
- **400 Bad Request**: 요청 파라미터/바디 오류, 비즈니스 규칙 위반 (예: 이미 채택된 경우 전체 다시 받기 불가).
- **404 Not Found**: 리소스 없음 (회원, meal_plan, diet_log 등).
- **500 Internal Server Error**: 서버/추천(Python) 연동 오류 등.

---

## 6. (디버깅/연동 확인) FastAPI 추천 원본 프록시

MealPlan 저장 로직과 별개로, FastAPI가 반환한 **원본 JSON**을 바로 확인하고 싶을 때 사용합니다.

**요청**

```
POST /services/dietrecommendation/recommend
```

- **Headers**: `Authorization`
- **Body**: 없음 (로그인 사용자 기준)

**응답**

- **200 OK** + `application/json` : FastAPI 원본 JSON 문자열
- FastAPI가 4xx/5xx를 주면 **상태 코드 + 에러 바디 그대로** 반환
