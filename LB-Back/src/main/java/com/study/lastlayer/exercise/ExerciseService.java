package com.study.lastlayer.exercise;

import java.util.List;

import org.springframework.stereotype.Service;

import com.study.lastlayer.exercise.ExerciseResponseDto;

import lombok.RequiredArgsConstructor;


@Service
@RequiredArgsConstructor
public class ExerciseService {
	
	private final ExerciseRepository exerciseRepository;
	
	// 전체 운동 종목 조회
	public List<ExerciseResponseDto> getAllExercises(){
		return exerciseRepository.findAll()
				.stream()
				.map(ExerciseResponseDto::fromEntity)
				.toList();
	}
	
	public Exercise getExerciseEntity(Long id) {
		return exerciseRepository.findById(id)
				.orElseThrow(()-> new IllegalArgumentException("운동이 존재하지 않습니다."));
	}

}
