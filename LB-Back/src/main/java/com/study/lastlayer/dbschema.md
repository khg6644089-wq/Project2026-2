```mermaid
erDiagram
    member ||--|| profile : "has"
    member ||--o{ meal_plan : "manages"
    member ||--o{ diet_log : "records"
    member ||--o{ workout_log : "performs"
    member ||--o{ club : "owns"
    member ||--o{ club_member : "joins"
    member ||--o{ likes : "clicks"

    club ||--o{ club_member : "has"
    club ||--o{ board : "contains"

    board ||--o{ board_file : "attaches"
    board ||--o{ likes : "receives"

    file ||--o{ board_file : "belongs_to"
    file ||--o{ meal : "represents"

    meal ||--o{ meal_item : "consists_of"
    meal ||--o{ meal_plan : "assigned_to"
    meal ||--o{ diet_log : "logged_in"

    exercise ||--o{ workout_log : "referenced_by"

    member {
        bigint id PK
        varchar email
        varchar password
        timestamp created_at
    }

    profile {
        bigint member_id PK, FK
        varchar gender
        date birth_date
        float height
        float weight
        varchar goal
        float goal_weight
        text_array allergies
        text special_notes
    }

    meal {
        bigint id PK
        varchar type
        varchar menu
        integer total_calories
        bigint file_id FK
    }

    meal_item {
        bigint id PK
        bigint meal_id FK
        varchar name
        float amount
        integer calories
    }

    meal_plan {
        bigint id PK
        bigint member_id FK
        bigint meal_id FK
        date date_at
        boolean is_accepted
        timestamp created_at
    }

    diet_log {
        bigint id PK
        bigint member_id FK
        bigint meal_id FK
        date date_at
    }

    exercise {
        bigint id PK
        varchar name
        float met
    }

    workout_log {
        bigint id PK
        bigint member_id FK
        bigint exercise_id FK
        integer duration_min
        integer burnt_calories
        date date_at
    }

    file {
        bigint id PK
        varchar filename
        varchar org_filename
    }

    club {
        bigint id PK
        varchar name
        text description
        bigint owner_id FK
    }

    club_member {
        bigint id PK
        bigint club_id FK
        bigint member_id FK
    }

    board {
        bigint id PK
        bigint club_id FK
        varchar title
        text content
        integer view_count
        integer like_count
    }

    board_file {
        bigint file_id PK, FK
        bigint board_id FK
    }

    likes {
        bigint id PK
        bigint board_id FK
        bigint member_id FK
    }
