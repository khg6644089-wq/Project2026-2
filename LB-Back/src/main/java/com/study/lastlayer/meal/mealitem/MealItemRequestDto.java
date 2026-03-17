package com.study.lastlayer.meal.mealitem;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 식단 항목(MealItem) 생성/수정 요청 DTO
 */
@Getter
@Setter
@NoArgsConstructor
public class MealItemRequestDto {

	/** 음식명 */
	private String name;

	/** 섭취량 (g) */
	private Integer amount;

	/** 탄수화물 (kcal) */
	private Integer carbohydrate;

	/** 단백질 (kcal) */
	private Integer protein;

	/** 지방 (kcal) */
	private Integer fat;

	/** 칼로리 (kcal) */
	private Integer calories;
}
