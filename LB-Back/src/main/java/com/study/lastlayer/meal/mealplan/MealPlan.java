package com.study.lastlayer.meal.mealplan;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.Comment;

import com.study.lastlayer.meal.Meal;
import com.study.lastlayer.member.Member;

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
@Table(name = "meal_plan")
@Getter
@Setter
@NoArgsConstructor
public class MealPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "member_id",
        nullable = false,
        foreignKey = @ForeignKey(name = "fk_meal_plan__member")
    )
    private Member member;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "meal_id",
        nullable = false,
        foreignKey = @ForeignKey(name = "fk_meal_plan__meal")
    )
    private Meal meal;

    @Column(name = "date_at", nullable = false)
    @Comment("식단 적용 예정 날짜")
    private LocalDate dateAt;

    @Column(name = "is_accepted", nullable = false)
    @ColumnDefault("0") // MySQL 기준 false=0
    @Comment("실제 식단으로 채택 여부. true로 변경 시 MealPlanService.acceptMealPlan()에서 diet_log 1건 생성")
    private Boolean isAccepted = false;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreated() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
        if (this.isAccepted == null) this.isAccepted = false; // 안전장치
    }

    @PreUpdate
    public void onUpdated() {
        this.updatedAt = LocalDateTime.now();
        if (this.isAccepted == null) this.isAccepted = false; // 안전장치
    }
}