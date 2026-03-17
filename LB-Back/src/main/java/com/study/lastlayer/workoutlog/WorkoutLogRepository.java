package com.study.lastlayer.workoutlog;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.study.lastlayer.member.Member;

public interface WorkoutLogRepository extends JpaRepository<WorkoutLog, Long> {
	
	// 특정 날짜 조회
	List<WorkoutLog> findByMemberAndDateAtOrderByCreatedAtAsc(Member member, LocalDate dateAt);

    // Pageable 기반 조회 (기존 유지)
    Page<WorkoutLog> findByMember(Member member, Pageable pageable);

    // 날짜별 + 하루 안 운동 등록순 정렬 (오래된순)
    @Query("""
        SELECT w
        FROM WorkoutLog w
        WHERE w.member = :member
        ORDER BY w.dateAt ASC, w.createdAt ASC
    """)
    List<WorkoutLog> findByMemberOrderByDateAscCreatedAsc(@Param("member") Member member);

    // 날짜별 + 하루 안 운동 등록순 정렬 (최신순)
    @Query("""
        SELECT w
        FROM WorkoutLog w
        WHERE w.member = :member
        ORDER BY w.dateAt DESC, w.createdAt ASC
    """)
    List<WorkoutLog> findByMemberOrderByDateDescCreatedAsc(@Param("member") Member member);

    // 날짜별 칼로리 합계
    @Query("""
        SELECT w.dateAt, SUM(w.burntCalories)
        FROM WorkoutLog w
        WHERE w.member = :member
          AND w.dateAt BETWEEN :startDate AND :endDate
        GROUP BY w.dateAt
        ORDER BY w.dateAt ASC
    """)
    List<Object[]> sumCaloriesByDate(
            @Param("member") Member member,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );
}
