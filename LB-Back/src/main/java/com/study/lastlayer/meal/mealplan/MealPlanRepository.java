package com.study.lastlayer.meal.mealplan;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface MealPlanRepository extends JpaRepository<MealPlan, Long> {

	/**
	 * 특정 회원의 특정 날짜에 해당하는 추천 식단 목록을 id 오름차순으로 조회합니다.
	 */
	@Query("""
			SELECT mp
			FROM MealPlan mp
			WHERE mp.member.member_id = :memberId
			  AND mp.dateAt = :dateAt
			ORDER BY mp.id
			""")
	List<MealPlan> findByMemberIdAndDateAtOrderById(@Param("memberId") Long memberId, @Param("dateAt") LocalDate dateAt);

	/** 특정 Meal을 참조하는 MealPlan 삭제 (diet_log 삭제 후 meal 정리용) */
	@Modifying
	@Query("DELETE FROM MealPlan mp WHERE mp.meal.id = :mealId")
	void deleteByMealId(@Param("mealId") Long mealId);
}

