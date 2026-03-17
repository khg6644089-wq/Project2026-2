package com.study.lastlayer.exercise;

import com.study.lastlayer.exercise.Exercise;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ExerciseResponseDto {
	
	private Long id;
	private String name;
	
	public static ExerciseResponseDto fromEntity(Exercise exercise) {
		return ExerciseResponseDto.builder()
				.id(exercise.getId())
				.name(exercise.getName())
				.build();
	}

}
