package com.study.lastlayer.exercise;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;


@RestController
@RequestMapping("/api/exercises")
@RequiredArgsConstructor
public class ExerciseController {
	
	private final ExerciseService exerciseService;
	
	
	@GetMapping
	public List<ExerciseResponseDto> getExercises(){
		return exerciseService.getAllExercises();
	}

}
