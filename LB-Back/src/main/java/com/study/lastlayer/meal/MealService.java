package com.study.lastlayer.meal;

import java.util.List;
import java.time.LocalDateTime;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.study.lastlayer.exception.BadRequestException;
import com.study.lastlayer.file.File;
import com.study.lastlayer.file.FileRepository;
import com.study.lastlayer.meal.dietlog.DietLogRequestDto;
import com.study.lastlayer.meal.dietlog.DietLogService;
import com.study.lastlayer.meal.mealitem.MealItem;
import com.study.lastlayer.meal.mealitem.MealItemRepository;
import com.study.lastlayer.meal.mealitem.MealItemRequestDto;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class MealService {

	private final MealRepository mealRepository;
	private final FileRepository fileRepository;
	private final MealItemRepository mealItemRepository;
	private final DietLogService dietLogService;

	/** 식단 목록 조회 
	 * @param memberId */
	@Transactional(readOnly = true)
	public List<MealResponseDto> getAllMeals(Long memberId) {
		return mealRepository.findAll().stream()
				.map(MealResponseDto::fromEntity)
				.toList();
	}

	/** 식단 단건 조회 */
	@Transactional(readOnly = true)
	public MealResponseDto getMeal(Long id) {
		Meal meal = mealRepository.findById(id)
				.orElseThrow(() -> new BadRequestException("식단이 존재하지 않습니다. id=" + id));
		return MealResponseDto.fromEntity(meal);
	}

	/** 식단 생성 */
	public MealResponseDto createMeal(MealRequestDto dto) {
		if (dto.getMealType() == null || dto.getMealType().isEmpty()) {
			throw new IllegalArgumentException("식사 유형(mealType)은 필수입니다.");
		}
		Meal meal = new Meal();
		meal.setMealType(dto.getMealType().charAt(0));
		meal.setMenu(dto.getMenu() != null ? dto.getMenu() : "");
		meal.setTotalCalories(dto.getTotalCalories() != null ? dto.getTotalCalories() : 0);
		meal.setCarbohydrate(dto.getCarbohydrate() != null ? dto.getCarbohydrate() : 0);
		meal.setFat(dto.getFat() != null ? dto.getFat() : 0);
		meal.setProtein(dto.getProtein() != null ? dto.getProtein() : 0);
		meal.setComment(dto.getComment() != null ? dto.getComment() : "");
		if (dto.getImageFileId() != null) {
			File file = fileRepository.findById(dto.getImageFileId())
					.orElseThrow(() -> new IllegalArgumentException("이미지 파일이 존재하지 않습니다. id=" + dto.getImageFileId()));
			meal.setImageFile(file);
		}
		Meal saved = mealRepository.save(meal);
		return MealResponseDto.fromEntity(saved);
	}

	/**
	 * Meal + MealItem을 한 번에 생성하고,
	 * - MealItem의 영양 정보를 합산해 Meal의 totalCalories / 탄·단·지에 반영
	 * - 첫 번째 MealItem의 name을 Meal의 메뉴명으로 사용
	 * - diet_log도 함께 생성
	 */
	public MealResponseDto createMealWithItems(Long memberId, MealWithItemsRequestDto dto) {
		if (memberId == null) {
			throw new IllegalArgumentException("memberId는 필수입니다.");
		}
		if (dto.getMealType() == null || dto.getMealType().isEmpty()) {
			throw new IllegalArgumentException("식사 유형(mealType)은 필수입니다.");
		}
		if (dto.getItems() == null || dto.getItems().isEmpty()) {
			throw new IllegalArgumentException("최소 1개 이상의 식단 항목(items)이 필요합니다.");
		}

		// 1) Meal 기본 정보 생성
		Meal meal = new Meal();
		meal.setMealType(dto.getMealType().charAt(0));
		meal.setComment(dto.getComment() != null ? dto.getComment() : "");

		if (dto.getImageFileId() != null) {
			File file = fileRepository.findById(dto.getImageFileId())
					.orElseThrow(() -> new IllegalArgumentException("이미지 파일이 존재하지 않습니다. id=" + dto.getImageFileId()));
			meal.setImageFile(file);
		}

		// 2) MealItem 기반으로 총 영양 정보 계산 및 대표 메뉴명 설정
		int totalCalories = 0;
		int totalCarb = 0;
		int totalProtein = 0;
		int totalFat = 0;
		String firstItemName = null;

		for (int i = 0; i < dto.getItems().size(); i++) {
			MealItemRequestDto itemDto = dto.getItems().get(i);
			if (i == 0) {
				firstItemName = itemDto.getName();
			}
			Integer c = itemDto.getCarbohydrate() != null ? itemDto.getCarbohydrate() : 0;
			Integer p = itemDto.getProtein() != null ? itemDto.getProtein() : 0;
			Integer f = itemDto.getFat() != null ? itemDto.getFat() : 0;
			Integer cal = itemDto.getCalories() != null ? itemDto.getCalories() : 0;

			totalCarb += c;
			totalProtein += p;
			totalFat += f;
			totalCalories += cal;
		}

		meal.setMenu(firstItemName != null ? firstItemName : "");
		meal.setTotalCalories(totalCalories);
		meal.setCarbohydrate(totalCarb);
		meal.setProtein(totalProtein);
		meal.setFat(totalFat);

		// 3) Meal 저장
		Meal savedMeal = mealRepository.save(meal);

		// 4) MealItem 저장
		for (MealItemRequestDto itemDto : dto.getItems()) {
			MealItem item = new MealItem();
			item.setMeal(savedMeal);
			item.setName(itemDto.getName());
			item.setAmount(itemDto.getAmount() != null ? itemDto.getAmount() : 0);
			item.setCarbohydrate(itemDto.getCarbohydrate() != null ? itemDto.getCarbohydrate() : 0);
			item.setProtein(itemDto.getProtein() != null ? itemDto.getProtein() : 0);
			item.setFat(itemDto.getFat() != null ? itemDto.getFat() : 0);
			item.setCalories(itemDto.getCalories() != null ? itemDto.getCalories() : 0);
			mealItemRepository.save(item);
		}

		// 5) diet_log 생성 (회원 + 방금 생성한 Meal 기준, 날짜는 요청 date가 있으면 그 날짜로 저장)
		LocalDateTime dateAt = dto.getDate() != null ? dto.getDate().atStartOfDay() : null;
		dietLogService.create(memberId, savedMeal.getId(), dateAt);

		return MealResponseDto.fromEntity(savedMeal);
	}

	/**
	 * 외부 추천 결과 등, 이미 구성된 Meal 엔티티를 그대로 저장하고 싶을 때 사용할 수 있는 헬퍼 메서드입니다.
	 */
	public Meal saveMeal(Meal meal) {
		return mealRepository.save(meal);
	}

	/** 식단 수정 */
	public MealResponseDto updateMeal(Long id, MealRequestDto dto) {
		Meal meal = mealRepository.findById(id)
				.orElseThrow(() -> new BadRequestException("식단이 존재하지 않습니다. id=" + id));
		applyDtoToEntity(dto, meal);
		Meal saved = mealRepository.save(meal);
		return MealResponseDto.fromEntity(saved);
	}

	/** 식단 삭제 */
	public void deleteMeal(Long id) {
		if (!mealRepository.existsById(id)) {
			throw new BadRequestException("식단이 존재하지 않습니다. id=" + id);
		}
		mealRepository.deleteById(id);
	}

	private void applyDtoToEntity(MealRequestDto dto, Meal meal) {
		if (dto.getMealType() != null && !dto.getMealType().isEmpty()) {
			meal.setMealType(dto.getMealType().charAt(0));
		}
		if (dto.getMenu() != null) {
			meal.setMenu(dto.getMenu());
		}
		if (dto.getTotalCalories() != null) {
			meal.setTotalCalories(dto.getTotalCalories());
		}
		if (dto.getImageFileId() != null) {
			File file = fileRepository.findById(dto.getImageFileId())
					.orElseThrow(() -> new IllegalArgumentException("이미지 파일이 존재하지 않습니다. id=" + dto.getImageFileId()));
			meal.setImageFile(file);
		} else {
			meal.setImageFile(null);
		}
		if (dto.getCarbohydrate() != null) {
			meal.setCarbohydrate(dto.getCarbohydrate());
		}
		if (dto.getFat() != null) {
			meal.setFat(dto.getFat());
		}
		if (dto.getProtein() != null) {
			meal.setProtein(dto.getProtein());
		}
		if (dto.getComment() != null) {
			meal.setComment(dto.getComment());
		}
	}
}
