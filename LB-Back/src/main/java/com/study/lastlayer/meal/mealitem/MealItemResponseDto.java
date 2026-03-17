package com.study.lastlayer.meal.mealitem;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Getter;

/**
 * 식단 항목(MealItem) 조회 응답 DTO
 */
@Getter
@Builder
public class MealItemResponseDto {

	private Long id;
	private Long mealId;
	private String name;
	private Integer amount;
	private Integer carbohydrate;
	private Integer protein;
	private Integer fat;
	private Integer calories;
	/**
	 * 추천 API로 저장된 재료 목록.
	 * - DB에는 JSON 배열 문자열(TEXT)로 저장되어 있어 그대로 내려줍니다.
	 * - 프론트에서 JSON.parse로 List로 변환해 사용하면 됩니다.
	 */
	private String ingredients;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;

	public static MealItemResponseDto fromEntity(MealItem entity) {
		return MealItemResponseDto.builder()
				.id(entity.getId())
				.mealId(entity.getMeal() != null ? entity.getMeal().getId() : null)
				.name(entity.getName())
				.amount(entity.getAmount())
				.carbohydrate(entity.getCarbohydrate() != null ? entity.getCarbohydrate() : 0)
				.protein(entity.getProtein() != null ? entity.getProtein() : 0)
				.fat(entity.getFat() != null ? entity.getFat() : 0)
				.calories(entity.getCalories() != null ? entity.getCalories() : 0)
				.ingredients(entity.getIngredients())
				.createdAt(entity.getCreatedAt())
				.updatedAt(entity.getUpdatedAt())
				.build();
	}
}
