package com.study.lastlayer.meal.dietlog;

import java.time.LocalDateTime;

import com.study.lastlayer.meal.Meal;
import com.study.lastlayer.meal.MealResponseDto;

import lombok.Builder;
import lombok.Getter;

/**
 * 식단 기록(DietLog) 조회 응답 DTO
 * diet_log를 통해 조회할 때 연결된 meal 정보를 함께 반환
 */
@Getter
@Builder
public class DietLogResponseDto {

	private Long id;
	private Long memberId;
	private Long mealId;
	private LocalDateTime dateAt;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;

	/** 연결된 식단(Meal) 정보 — diet_log를 통한 조회 시 함께 제공 */
	private MealResponseDto meal;

	public static DietLogResponseDto fromEntity(DietLog entity) {
		Meal mealEntity = entity.getMeal();
		MealResponseDto mealDto = mealEntity != null ? MealResponseDto.fromEntity(mealEntity) : null;
		return DietLogResponseDto.builder()
				.id(entity.getId())
				.memberId(entity.getMember() != null ? entity.getMember().getMember_id() : null)
				.mealId(mealEntity != null ? mealEntity.getId() : null)
				.dateAt(entity.getDateAt())
				.createdAt(entity.getCreatedAt())
				.updatedAt(entity.getUpdatedAt())
				.meal(mealDto)
				.build();
	}
}
