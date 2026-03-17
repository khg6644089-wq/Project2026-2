package com.study.lastlayer.meal;

import java.time.LocalDateTime;

import com.study.lastlayer.file.File;

import lombok.Builder;
import lombok.Getter;

/**
 * 식단 조회 응답 DTO
 */
@Getter
@Builder
public class MealResponseDto {

	private Long id;
	private String mealType;
	private String menu;
	private Integer totalCalories;
	private Long imageFileId;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;
	private Integer carbohydrate;
	private Integer fat;
	private Integer protein;
	private String comment;

	public static MealResponseDto fromEntity(Meal meal) {
		File imageFile = meal.getImageFile();
		return MealResponseDto.builder()
				.id(meal.getId())
				.mealType(String.valueOf(meal.getMealType()))
				.menu(meal.getMenu())
				.totalCalories(meal.getTotalCalories())
				.imageFileId(imageFile != null ? imageFile.getId() : null)
				.createdAt(meal.getCreatedAt())
				.updatedAt(meal.getUpdatedAt())
				.carbohydrate(meal.getCarbohydrate() != null ? meal.getCarbohydrate() : 0)
				.fat(meal.getFat() != null ? meal.getFat() : 0)
				.protein(meal.getProtein() != null ? meal.getProtein() : 0)
				.comment(meal.getComment() != null ? meal.getComment() : "")
				.build();
	}
}
