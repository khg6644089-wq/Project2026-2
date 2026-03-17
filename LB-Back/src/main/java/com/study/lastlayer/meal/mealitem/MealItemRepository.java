package com.study.lastlayer.meal.mealitem;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MealItemRepository extends JpaRepository<MealItem, Long> {

	@Query("SELECT m FROM MealItem m WHERE m.meal.id = :mealId")
	List<MealItem> findByMealId(@Param("mealId") Long mealId);

	@Modifying
	@Query("DELETE FROM MealItem m WHERE m.meal.id = :mealId")
	void deleteByMealId(@Param("mealId") Long mealId);
}