package com.study.lastlayer.meal;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 식단 생성/수정 요청 DTO
 */
@Getter
@Setter
@NoArgsConstructor
public class MealRequestDto {

	/** 식사 유형 (B: 아침, L: 점심, D: 저녁, S: 간식) */
	private String mealType;

	/** 메뉴명 */
	private String menu;

	/** 총 칼로리 (kcal) */
	private Integer totalCalories;

	/** 이미지 파일 ID (선택) */
	private Long imageFileId;

	/** 탄수화물 (g) */
	private Integer carbohydrate;

	/** 지방 (g) */
	private Integer fat;

	/** 단백질 (g) */
	private Integer protein;

	/** 메모 */
	private String comment;
}
