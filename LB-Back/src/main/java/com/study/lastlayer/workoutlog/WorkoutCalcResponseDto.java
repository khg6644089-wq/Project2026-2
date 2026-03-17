package com.study.lastlayer.workoutlog;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;


@Getter
@AllArgsConstructor
public class WorkoutCalcResponseDto {
	
	private List<ExerciseCalorieDto> exerciseCarories;
	private Integer totalCalories;
	
	@Getter
	@AllArgsConstructor
	public static class ExerciseCalorieDto{
		private String exerciseName;
		private Integer durationMin;
		private Integer calories;
	}

}
