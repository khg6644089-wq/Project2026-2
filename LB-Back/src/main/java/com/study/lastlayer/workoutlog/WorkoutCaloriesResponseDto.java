package com.study.lastlayer.workoutlog;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@AllArgsConstructor
public class WorkoutCaloriesResponseDto {

    private LocalDate date;
    private Integer totalCalories;
}