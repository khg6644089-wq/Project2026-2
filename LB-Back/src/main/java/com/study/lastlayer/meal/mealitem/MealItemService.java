package com.study.lastlayer.meal.mealitem;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.study.lastlayer.exception.BadRequestException;
import com.study.lastlayer.meal.Meal;
import com.study.lastlayer.meal.MealRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class MealItemService {

	private final MealItemRepository mealItemRepository;
	private final MealRepository mealRepository;

	/** 특정 식단(meal)에 속한 항목 목록 조회 */
	@Transactional(readOnly = true)
	public List<MealItemResponseDto> getByMealId(Long mealId) {
		return mealItemRepository.findByMealId(mealId).stream()
				.map(MealItemResponseDto::fromEntity)
				.toList();
	}

	/** 식단 항목 단건 조회 */
	@Transactional(readOnly = true)
	public MealItemResponseDto getById(Long id) {
		MealItem item = mealItemRepository.findById(id)
				.orElseThrow(() -> new BadRequestException("식단 항목이 존재하지 않습니다. id=" + id));
		return MealItemResponseDto.fromEntity(item);
	}

	/** 식단 항목 추가 */
	public MealItemResponseDto create(Long mealId, MealItemRequestDto dto) {
		if (dto.getName() == null || dto.getName().isBlank()) {
			throw new IllegalArgumentException("음식명(name)은 필수입니다.");
		}
		if (dto.getAmount() == null || dto.getAmount() < 0) {
			throw new IllegalArgumentException("섭취량(amount)은 0 이상 필수입니다.");
		}
		Meal meal = mealRepository.findById(mealId)
				.orElseThrow(() -> new BadRequestException("식단이 존재하지 않습니다. id=" + mealId));
		MealItem item = new MealItem();
		item.setMeal(meal);
		item.setName(dto.getName().trim());
		item.setAmount(dto.getAmount());
		item.setCarbohydrate(dto.getCarbohydrate() != null ? dto.getCarbohydrate() : 0);
		item.setProtein(dto.getProtein() != null ? dto.getProtein() : 0);
		item.setFat(dto.getFat() != null ? dto.getFat() : 0);
		item.setCalories(dto.getCalories() != null ? dto.getCalories() : 0);
		MealItem saved = mealItemRepository.save(item);

		// Meal의 총 영양 정보 및 대표 메뉴명 업데이트
		recalculateMealNutrition(meal);

		return MealItemResponseDto.fromEntity(saved);
	}

	/** 식단 항목 수정 */
	public MealItemResponseDto update(Long id, MealItemRequestDto dto) {
		MealItem item = mealItemRepository.findById(id)
				.orElseThrow(() -> new BadRequestException("식단 항목이 존재하지 않습니다. id=" + id));
		applyDtoToEntity(dto, item);
		MealItem saved = mealItemRepository.save(item);

		// Meal의 총 영양 정보 및 대표 메뉴명 업데이트
		recalculateMealNutrition(saved.getMeal());

		return MealItemResponseDto.fromEntity(saved);
	}

	/** 식단 항목 삭제 */
	public void delete(Long id) {
		MealItem item = mealItemRepository.findById(id)
				.orElseThrow(() -> new BadRequestException("식단 항목이 존재하지 않습니다. id=" + id));

		Meal meal = item.getMeal();

		mealItemRepository.delete(item);

		// Meal의 총 영양 정보 및 대표 메뉴명 업데이트
		recalculateMealNutrition(meal);
	}

	private void applyDtoToEntity(MealItemRequestDto dto, MealItem item) {
		if (dto.getName() != null) {
			item.setName(dto.getName());
		}
		if (dto.getAmount() != null) {
			item.setAmount(dto.getAmount());
		}
		if (dto.getCarbohydrate() != null) {
			item.setCarbohydrate(dto.getCarbohydrate());
		}
		if (dto.getProtein() != null) {
			item.setProtein(dto.getProtein());
		}
		if (dto.getFat() != null) {
			item.setFat(dto.getFat());
		}
		if (dto.getCalories() != null) {
			item.setCalories(dto.getCalories());
		}
	}

	/**
	 * 특정 Meal에 속한 모든 MealItem을 조회하여
	 * - 총 칼로리 및 탄·단·지 합계
	 * - 첫 번째 항목 이름을 대표 메뉴명으로
	 * 로 Meal 엔티티를 갱신한다.
	 */
	private void recalculateMealNutrition(Meal meal) {
		if (meal == null || meal.getId() == null) {
			return;
		}

		List<MealItem> items = mealItemRepository.findByMealId(meal.getId());
		int totalCalories = 0;
		int totalCarb = 0;
		int totalProtein = 0;
		int totalFat = 0;
		String firstItemName = null;

		for (int i = 0; i < items.size(); i++) {
			MealItem mi = items.get(i);
			if (i == 0) {
				firstItemName = mi.getName();
			}
			totalCalories += mi.getCalories() != null ? mi.getCalories() : 0;
			totalCarb += mi.getCarbohydrate() != null ? mi.getCarbohydrate() : 0;
			totalProtein += mi.getProtein() != null ? mi.getProtein() : 0;
			totalFat += mi.getFat() != null ? mi.getFat() : 0;
		}

		meal.setMenu(firstItemName != null ? firstItemName : "");
		meal.setTotalCalories(totalCalories);
		meal.setCarbohydrate(totalCarb);
		meal.setProtein(totalProtein);
		meal.setFat(totalFat);

		mealRepository.save(meal);
	}
}
