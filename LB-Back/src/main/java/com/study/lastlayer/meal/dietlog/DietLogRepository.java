package com.study.lastlayer.meal.dietlog;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface DietLogRepository extends JpaRepository<DietLog, Long> {

	/** 회원별 식단 기록 목록 (최신 순) */
	@Query("SELECT d FROM DietLog d WHERE d.member.member_id = :memberId ORDER BY d.dateAt DESC")
	List<DietLog> findByMemberIdOrderByDateAtDesc(@Param("memberId") Long memberId);

	/** 회원별 기간 내 식단 기록 목록 (최신 순) */
	@Query("SELECT d FROM DietLog d WHERE d.member.member_id = :memberId AND d.dateAt BETWEEN :from AND :to ORDER BY d.dateAt DESC")
	List<DietLog> findByMemberIdAndDateAtBetween(@Param("memberId") Long memberId, @Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

	/** 지정한 meal id들에 연결된 diet_log 삭제 (전체 다시 받기 시 채택 기록 정리용) */
	@Modifying
	@Query("DELETE FROM DietLog d WHERE d.meal.id IN :mealIds")
	int deleteByMealIdIn(@Param("mealIds") List<Long> mealIds);

	/** 특정 meal을 참조하는 diet_log가 존재하는지 여부 */
	boolean existsByMeal_Id(Long mealId);
}