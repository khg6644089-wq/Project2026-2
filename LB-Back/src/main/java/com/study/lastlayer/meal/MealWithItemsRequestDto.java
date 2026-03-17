package com.study.lastlayer.meal;

import java.time.LocalDate;
import java.util.List;

import com.study.lastlayer.meal.mealitem.MealItemRequestDto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Meal + MealItem을 한 번에 생성하기 위한 요청 DTO
 * - mealType: 식사 유형 (B/L/D/S)
 * - imageFileId, comment: 선택
 * - items: 필수, 각 항목의 영양 정보를 사용해 Meal의 총 영양 값을 계산
 */
@Getter
@Setter
@NoArgsConstructor
public class MealWithItemsRequestDto {

	/** 식사 유형 (B: 아침, L: 점심, D: 저녁, S: 간식) */
	private String mealType;

	/** 기록 날짜 (선택). 지정하면 diet_log.date_at을 해당 날짜로 저장합니다. */
	private LocalDate date;

	/** 이미지 파일 ID (선택) */
	private Long imageFileId;

	/** 메모 */
	private String comment;

	/** 함께 저장할 식단 항목 목록 (필수) */
	private List<MealItemRequestDto> items;
}

