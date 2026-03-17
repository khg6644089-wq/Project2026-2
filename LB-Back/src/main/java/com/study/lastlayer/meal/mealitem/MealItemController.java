package com.study.lastlayer.meal.mealitem;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.study.lastlayer.auth.CustomUserPrincipal;

import lombok.RequiredArgsConstructor;

/**
 * 식단 항목(MealItem) CRUD API — 로그인 사용자만 사용
 * - 특정 식단(meal)에 속한 항목 목록/추가: /meals/{mealId}/items
 * - 항목 단건 조회/수정/삭제: /meal-items/{id}
 */
@RestController
@RequestMapping
@RequiredArgsConstructor
public class MealItemController {

	private final MealItemService mealItemService;

	/** 특정 식단에 속한 항목 목록 조회 */
	@GetMapping("/meals/{mealId}/items")
	public List<MealItemResponseDto> getItemsByMeal(
			@AuthenticationPrincipal CustomUserPrincipal principal,
			@PathVariable("mealId") Long mealId) {
		return mealItemService.getByMealId(mealId);
	}

	/** 식단 항목 단건 조회 */
	@GetMapping("/meal-items/{id}")
	public MealItemResponseDto getItem(
			@AuthenticationPrincipal CustomUserPrincipal principal,
			@PathVariable("id") Long id) {
		return mealItemService.getById(id);
	}

	/** 특정 식단에 항목 추가 */
	@PostMapping("/meals/{mealId}/items")
	@ResponseStatus(HttpStatus.CREATED)
	public MealItemResponseDto createItem(
			@AuthenticationPrincipal CustomUserPrincipal principal,
			@PathVariable("mealId") Long mealId,
			@RequestBody MealItemRequestDto dto) {
		return mealItemService.create(mealId, dto);
	}

	/** 식단 항목 수정 */
	@PutMapping("/meal-items/{id}")
	public MealItemResponseDto updateItem(
			@AuthenticationPrincipal CustomUserPrincipal principal,
			@PathVariable("id") Long id,
			@RequestBody MealItemRequestDto dto) {
		return mealItemService.update(id, dto);
	}

	/** 식단 항목 삭제 */
	@DeleteMapping("/meal-items/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void deleteItem(
			@AuthenticationPrincipal CustomUserPrincipal principal,
			@PathVariable("id") Long id) {
		mealItemService.delete(id);
	}
}
