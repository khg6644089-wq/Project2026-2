package com.study.lastlayer.meal.mealplan;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.study.lastlayer.meal.Meal;

import lombok.Builder;
import lombok.Getter;

/**
 * 추천 식단(MealPlan) 조회 응답 DTO.
 * DB에 저장된 추천 식단과 연결된 Meal 정보를 함께 반환합니다.
 */
@Getter
@Builder
public class MealPlanResponseDto {

	private Long id;
	private Long mealId;
	private LocalDate dateAt;
	private Boolean isAccepted;
	private String mealType;
	private String menu;
	private Integer totalCalories;
	private Integer carbohydrate;
	private Integer protein;
	private Integer fat;
	private String comment;
	private LocalDateTime createdAt;

	public static MealPlanResponseDto fromEntity(MealPlan plan) {
		Meal meal = plan.getMeal();
		return MealPlanResponseDto.builder()
				.id(plan.getId())
				.mealId(meal != null ? meal.getId() : null)
				.dateAt(plan.getDateAt())
				.isAccepted(plan.getIsAccepted())
				.mealType(meal != null ? String.valueOf(meal.getMealType()) : null)
				.menu(meal != null && meal.getMenu() != null ? meal.getMenu() : "")
				.totalCalories(meal != null && meal.getTotalCalories() != null ? meal.getTotalCalories() : 0)
				.carbohydrate(meal != null && meal.getCarbohydrate() != null ? meal.getCarbohydrate() : 0)
				.protein(meal != null && meal.getProtein() != null ? meal.getProtein() : 0)
				.fat(meal != null && meal.getFat() != null ? meal.getFat() : 0)
				.comment(meal != null && meal.getComment() != null ? meal.getComment() : "")
				.createdAt(plan.getCreatedAt())
				.build();
	}
}
