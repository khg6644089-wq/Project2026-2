package com.study.lastlayer.externapi.mealcalorie;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CaloriesCalculationResponse {

	private List<FoodEntryCaloriesResult> items;

	@JsonProperty("total_calories")
	private Integer totalCalories;

	@Getter
	@Setter
	@NoArgsConstructor
	public static class FoodEntryCaloriesResult {
		private String name;

		@JsonProperty("amount_grams")
		private Integer amountGrams;

		@JsonProperty("estimated_calories")
		private Integer estimatedCalories;

		private NutrientInfo nutrients;
	}

	@Getter
	@Setter
	@NoArgsConstructor
	public static class NutrientInfo {
		private Double carbohydrates;
		private Double protein;
		private Double fat;
	}
}

