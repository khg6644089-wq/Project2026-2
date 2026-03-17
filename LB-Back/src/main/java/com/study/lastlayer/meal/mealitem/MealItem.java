package com.study.lastlayer.meal.mealitem;

import java.time.LocalDateTime;

import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.Comment;

import com.study.lastlayer.meal.Meal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "meal_item")
@Getter
@Setter
@NoArgsConstructor
public class MealItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "meal_id",
        nullable = false, // meal_item은 meal에 소속되는 게 자연스러움(권장)
        foreignKey = @ForeignKey(name = "fk_meal_item__meal")
    )
    private Meal meal;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    @Comment("섭취량 (g)")
    private Integer amount;

    @Column(nullable = false)
    @ColumnDefault("0")
    @Comment("탄수화물 (kcal)")
    private Integer carbohydrate = 0;

    @Column(nullable = false)
    @ColumnDefault("0")
    @Comment("단백질 (kcal)")
    private Integer protein = 0;

    @Column(nullable = false)
    @ColumnDefault("0")
    @Comment("지방 (kcal)")
    private Integer fat = 0;

    @Column(nullable = false)
    @ColumnDefault("0")
    @Comment("해당 음식의 칼로리 (kcal)")
    private Integer calories = 0;

    @Column(columnDefinition = "TEXT")
    @Comment("재료 목록 (JSON 배열 문자열). 예: [\"계란 2개\", \"피망 1/4개\"]. 추천 API ingredients를 원본 그대로 저장")
    private String ingredients;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreated() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now; 
    }

    @PreUpdate
    public void onUpdated() {
        this.updatedAt = LocalDateTime.now();
    }
}