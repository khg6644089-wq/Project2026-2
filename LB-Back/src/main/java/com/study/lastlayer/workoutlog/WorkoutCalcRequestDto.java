package com.study.lastlayer.workoutlog;

import java.time.LocalDate;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class WorkoutCalcRequestDto {
	
	private LocalDate dateAt;
	private List<ExerciseTimeDto> exercises;
	
	@Getter
	@NoArgsConstructor
	@AllArgsConstructor
	public static class ExerciseTimeDto{
		private Long exerciseId;
		private Integer durationMin;
	}

}
