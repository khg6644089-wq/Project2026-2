package com.study.lastlayer.meal.dietlog;

import java.time.LocalDateTime;

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
@Table(name = "diet_log")
@Getter
@Setter
@NoArgsConstructor
public class DietLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "member_id",
        nullable = false,
        foreignKey = @ForeignKey(name = "fk_diet_log__member")
    )
    private Member member;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "meal_id",
        nullable = false,
        foreignKey = @ForeignKey(name = "fk_diet_log__meal")
    )
    private Meal meal;

    @Column(name = "date_at", nullable = false)
    @Comment("섭취 날짜 및 시간")
    private LocalDateTime dateAt;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreated() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;

        // dateAt을 따로 안 넣고 저장하면 '먹은 시각=저장 시각'으로 처리(원하면 제거 가능)
        if (this.dateAt == null) this.dateAt = now;
    }

    @PreUpdate
    public void onUpdated() {
        this.updatedAt = LocalDateTime.now();
    }
    
}