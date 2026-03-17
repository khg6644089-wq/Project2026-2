package com.study.lastlayer.externapi.dietanalysis;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;

@Data
public class DietAnalysisResponse {
	@JsonProperty("food_name")
	private String foodName;

	private int calories;
	private List<FoodItem> items;
	private NutrientInfo nutrients;

	@JsonProperty("health_tip")
	private String healthTip;

	private String status;

	@Data
	public static class FoodItem {
		private String name;
		@JsonProperty("weight_gram")
		private int weightGram;
		private int calories;
	}

	@Data
	public static class NutrientInfo {
		private float carbohydrates;
		private float protein;
		private float fat;
	}
}