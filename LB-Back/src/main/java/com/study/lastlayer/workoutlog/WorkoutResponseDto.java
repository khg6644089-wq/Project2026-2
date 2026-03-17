package com.study.lastlayer.workoutlog;

import java.time.LocalDate;

import com.study.lastlayer.workoutlog.WorkoutLog;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class WorkoutResponseDto {
	
	private Long id;
	private Long exerciseId;
	private String exerciseName;
	private Integer durationMin;
	private Integer burntCalories;
	private LocalDate dateAt;
	
	public static WorkoutResponseDto fromEntity(WorkoutLog log) {
		return WorkoutResponseDto.builder()
				.id(log.getId())
				.exerciseId(log.getExercise().getId())
				.exerciseName(log.getExercise().getName())
				.durationMin(log.getDurationMin())
				.burntCalories(log.getBurntCalories())
				.dateAt(log.getDateAt())
				.build();
	}

}
