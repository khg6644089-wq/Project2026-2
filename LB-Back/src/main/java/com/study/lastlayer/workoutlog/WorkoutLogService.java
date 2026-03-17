package com.study.lastlayer.workoutlog;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.study.lastlayer.exercise.Exercise;
import com.study.lastlayer.exercise.ExerciseRepository;
import com.study.lastlayer.member.Member;
import com.study.lastlayer.member.MemberRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class WorkoutLogService {

    private final WorkoutLogRepository workoutLogRepository;
    private final ExerciseRepository exerciseRepository;
    private final MemberRepository memberRepository;

    // 운동 기록 생성
    public WorkoutResponseDto createWorkout(Long memberId, WorkoutCreateRequestDto dto) {

        Member member = getMember(memberId);
        Exercise exercise = getExercise(dto.getExerciseId());

        int calories = calculateCalories(exercise.getMet(), member.getWeight(), dto.getDurationMin());

        WorkoutLog log = new WorkoutLog();
        log.setMember(member);
        log.setExercise(exercise);
        log.setDurationMin(dto.getDurationMin());
        log.setBurntCalories(calories);
        log.setDateAt(dto.getDateAt());

        workoutLogRepository.save(log);

        return WorkoutResponseDto.fromEntity(log);
    }

    // 운동 기록 조회 (Pageable)
    @Transactional(readOnly = true)
    public Page<WorkoutResponseDto> getWorkouts(Long memberId, String sort, Pageable pageable) {

        Member member = getMember(memberId);

        Sort sorting = sort.equalsIgnoreCase("oldest")
                ? Sort.by(Sort.Order.asc("dateAt"), Sort.Order.asc("createdAt"))
                : Sort.by(Sort.Order.desc("dateAt"), Sort.Order.asc("createdAt"));

        Pageable sortedPageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), sorting);

        return workoutLogRepository.findByMember(member, sortedPageable)
                .map(WorkoutResponseDto::fromEntity);
    }

    // **리스트 기반 조회 (하루 안 운동 순서 보장)**
    @Transactional(readOnly = true)
    public List<WorkoutResponseDto> getWorkoutsSorted(Long memberId, String sort) {
        Member member = getMember(memberId);

        List<WorkoutLog> logs = "oldest".equalsIgnoreCase(sort)
                ? workoutLogRepository.findByMemberOrderByDateAscCreatedAsc(member)
                : workoutLogRepository.findByMemberOrderByDateDescCreatedAsc(member);

        return logs.stream()
                .map(WorkoutResponseDto::fromEntity)
                .toList();
    }

    // 수정
    public WorkoutResponseDto updateWorkout(Long memberId, Long workoutId, WorkoutCreateRequestDto dto) {

        WorkoutLog log = workoutLogRepository.findById(workoutId)
                .orElseThrow(() -> new IllegalArgumentException("운동 기록이 존재하지 않습니다."));

        if (!log.getMember().getMember_id().equals(memberId)) {
            throw new IllegalArgumentException("해당 회원의 기록이 아닙니다.");
        }

        Exercise exercise = getExercise(dto.getExerciseId());
        int calories = calculateCalories(exercise.getMet(), log.getMember().getWeight(), dto.getDurationMin());

        log.setExercise(exercise);
        log.setDurationMin(dto.getDurationMin());
        log.setBurntCalories(calories);
        log.setDateAt(dto.getDateAt());

        return WorkoutResponseDto.fromEntity(log);
    }

    // 삭제
    public void deleteWorkout(Long memberId, Long workoutId) {

        WorkoutLog log = workoutLogRepository.findById(workoutId)
                .orElseThrow(() -> new IllegalArgumentException("운동 기록이 존재하지 않습니다."));

        if (!log.getMember().getMember_id().equals(memberId)) {
            throw new IllegalArgumentException("해당 회원의 기록이 아닙니다.");
        }

        workoutLogRepository.delete(log);
    }

    // 날짜별 칼로리 합계
    @Transactional(readOnly = true)
    public List<WorkoutCaloriesResponseDto> getCaloriesByDate(Long memberId, LocalDate startDate, LocalDate endDate) {

        Member member = getMember(memberId);

        if (startDate == null) startDate = LocalDate.of(2000, 1, 1);
        if (endDate == null) endDate = LocalDate.now();

        return workoutLogRepository.sumCaloriesByDate(member, startDate, endDate)
                .stream()
                .map(obj -> new WorkoutCaloriesResponseDto(
                        (LocalDate) obj[0],
                        ((Number) obj[1]).intValue()
                ))
                .toList();
    }

    // 칼로리 계산 공식
    public int calculateCalories(Float met, Float weight, int durationMin) {
        double hours = durationMin / 60.0;
        return (int) (met * weight * hours);
    }

    // 회원 조회
    public Member getMember(Long memberId) {
        if (memberId == null) throw new IllegalArgumentException("회원 ID가 전달되지 않았습니다.");

        return memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("회원이 존재하지 않습니다."));
    }

    // 운동 조회
    public Exercise getExercise(Long exerciseId) {
        return exerciseRepository.findById(exerciseId)
                .orElseThrow(() -> new IllegalArgumentException("운동이 존재하지 않습니다."));
    }
    
    // 특정 날짜 조회
    @Transactional(readOnly = true)
    public List<WorkoutResponseDto> getWorkoutByDate(Long memberId, LocalDate dateAt){
    	
    	Member member = getMember(memberId);
    	
    	List<WorkoutLog> logs = 
    			workoutLogRepository.findByMemberAndDateAtOrderByCreatedAtAsc(member, dateAt);
    	
    	return logs.stream()
    			.map(WorkoutResponseDto::fromEntity)
    			.toList();
    }
}
