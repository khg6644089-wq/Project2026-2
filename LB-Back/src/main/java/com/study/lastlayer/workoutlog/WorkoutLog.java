package com.study.lastlayer.workoutlog;



import java.time.LocalDate;
import java.time.LocalDateTime;

import com.study.lastlayer.exercise.Exercise;
import com.study.lastlayer.member.Member;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "workout_log", indexes = { @Index(name = "idx_workout_member_date", columnList = "member_id, date_at") })
@Getter
@Setter
@NoArgsConstructor

public class WorkoutLog {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "member_id", nullable = false)
	private Member member;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "exercise_id", nullable = false)
	private Exercise exercise;

	@Column(name = "duration_min", nullable = false)
	private Integer durationMin;

	@Column(name = "burnt_calories", nullable = false)
	private Integer burntCalories;

	@Column(name = "date_at", nullable = false)
	private LocalDate dateAt;

	@Column(nullable = false)
	private LocalDateTime createdAt;

	@PrePersist
	public void onCreated() {
		this.createdAt = LocalDateTime.now();
	}
}
