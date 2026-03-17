package com.study.lastlayer.workoutlog;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.study.lastlayer.auth.CustomUserPrincipal;
import com.study.lastlayer.exercise.Exercise;
import com.study.lastlayer.member.Member;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/workouts")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class WorkoutLogController {

    private final WorkoutLogService workoutLogService;

    // 운동 기록 생성
    @PostMapping
    public WorkoutResponseDto createWorkout(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @Valid @RequestBody WorkoutCreateRequestDto dto
    ) {

        Long memberId = principal.getMemberId();
        if (memberId == null) throw new IllegalArgumentException("로그인된 회원 ID가 없습니다.");

        return workoutLogService.createWorkout(memberId, dto);
    }

    // 운동 기록 조회 (Pageable)
    @GetMapping
    public Page<WorkoutResponseDto> getWorkouts(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @RequestParam(name = "sort", defaultValue = "latest") String sort,
            Pageable pageable
    ) {
        return workoutLogService.getWorkouts(principal.getMemberId(), sort, pageable);
    }

    // 운동 기록 조회 (리스트 기반, 하루 안 운동 순서 보장)
    @GetMapping("/list")
    public List<WorkoutResponseDto> getWorkoutsList(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @RequestParam(name = "sort", defaultValue = "latest") String sort
    ) {
        return workoutLogService.getWorkoutsSorted(principal.getMemberId(), sort);
    }

    // 수정
    @PutMapping("/{workoutId}")
    public WorkoutResponseDto updateWorkout(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @PathVariable("workoutId") Long workoutId,
            @RequestBody WorkoutCreateRequestDto dto
    ) {
        return workoutLogService.updateWorkout(principal.getMemberId(), workoutId, dto);
    }

    // 삭제
    @DeleteMapping("/{workoutId}")
    public String deleteWorkout(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @PathVariable("workoutId") Long workoutId
    ) {
        workoutLogService.deleteWorkout(principal.getMemberId(), workoutId);
        return "운동 기록이 정상적으로 삭제되었습니다.";
    }

    // 날짜별 칼로리
    @GetMapping("/calories")
    public List<WorkoutCaloriesResponseDto> getCaloriesByDate(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @RequestParam(name = "startDate", required = false) LocalDate startDate,
            @RequestParam(name = "endDate", required = false) LocalDate endDate
    ) {
        return workoutLogService.getCaloriesByDate(principal.getMemberId(), startDate, endDate);
    }

    // 운동 칼로리 계산
    @PostMapping("/calc")
    public WorkoutCalcResponseDto calculateWorkout(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @RequestBody WorkoutCalcRequestDto request
    ) {

        Member member = workoutLogService.getMember(principal.getMemberId());

        List<WorkoutCalcResponseDto.ExerciseCalorieDto> results = new ArrayList<>();
        int totalCalories = 0;

        for (WorkoutCalcRequestDto.ExerciseTimeDto e : request.getExercises()) {

            Exercise exercise = workoutLogService.getExercise(e.getExerciseId());

            int calories = workoutLogService.calculateCalories(
                    exercise.getMet(),
                    member.getWeight(),
                    e.getDurationMin()
            );

            totalCalories += calories;

            results.add(new WorkoutCalcResponseDto.ExerciseCalorieDto(
                    exercise.getName(),
                    e.getDurationMin(),
                    calories
            ));
        }

        return new WorkoutCalcResponseDto(results, totalCalories);
    }
    
    // 특정 날짜 조회
    @GetMapping("/date")
    public List<WorkoutResponseDto> getWorkoutsByDate(
    		@AuthenticationPrincipal CustomUserPrincipal principal,
    		@RequestParam("date") LocalDate date
    		){
    	return workoutLogService.getWorkoutByDate(principal.getMemberId(), date);
    }
}
