package com.study.lastlayer.externapi.mealcalorie;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CaloriesCalculationRequest {

	private List<FoodEntryForCalories> items;

	@Getter
	@Setter
	@NoArgsConstructor
	public static class FoodEntryForCalories {
		private String name;

		@JsonProperty("amount_grams")
		private Integer amountGrams;
	}
}

