package com.study.lastlayer.workoutlog;

import java.time.LocalDate;

import lombok.Getter;
import lombok.Setter;


@Getter
@Setter
public class WorkoutCreateRequestDto {
	
	private Long exerciseId;
	private Integer durationMin;
	private LocalDate dateAt;

}
