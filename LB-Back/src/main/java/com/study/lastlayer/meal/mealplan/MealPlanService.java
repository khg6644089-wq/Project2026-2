package com.study.lastlayer.meal.mealplan;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.study.lastlayer.exception.BadRequestException;
import com.study.lastlayer.meal.Meal;
import com.study.lastlayer.meal.MealRepository;
import com.study.lastlayer.meal.MealResponseDto;
import com.study.lastlayer.meal.MealService;
import com.study.lastlayer.meal.dietlog.DietLogRequestDto;
import com.study.lastlayer.meal.dietlog.DietLogResponseDto;
import com.study.lastlayer.meal.dietlog.DietLogService;
import com.study.lastlayer.meal.mealitem.MealItem;
import com.study.lastlayer.meal.mealitem.MealItemRepository;
import com.study.lastlayer.member.Member;
import com.study.lastlayer.member.MemberRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class MealPlanService {

	private final MealPlanRepository mealPlanRepository;
	private final MealItemRepository mealItemRepository;
	private final MealRepository mealRepository;
	private final MemberRepository memberRepository;
	private final MealService mealService;
	private final DietLogService dietLogService;
	private final ObjectMapper objectMapper;

	/**
	 * 추천 식단(MealPlan)을 실제로 '먹겠습니다'로 채택할 때,
	 * - meal_plan.isAccepted = true 로 변경
	 * - 해당 회원 + meal + dateAt 기준으로 diet_log 1건 자동 생성
	 */
	public DietLogResponseDto acceptMealPlan(Long memberId, Long mealPlanId) {
		if (memberId == null) {
			throw new IllegalArgumentException("memberId는 필수입니다.");
		}

		MealPlan plan = mealPlanRepository.findById(mealPlanId)
				.orElseThrow(() -> new BadRequestException("추천 식단이 존재하지 않습니다. id=" + mealPlanId));

		if (!plan.getMember().getMember_id().equals(memberId)) {
			throw new BadRequestException("본인의 추천 식단만 채택할 수 있습니다.");
		}

		// 이미 채택된 경우 중복 생성 방지
		if (Boolean.TRUE.equals(plan.getIsAccepted())) {
			throw new BadRequestException("이미 채택된 추천 식단입니다.");
		}

		// 1) 채택 처리 (DB에 반영)
		plan.setIsAccepted(true);
		mealPlanRepository.save(plan);

		// 2) diet_log 생성 (plan.dateAt이 있으면 그 날짜 기준, 없으면 현재 시각)
		LocalDateTime logDateTime = plan.getDateAt() != null ? plan.getDateAt().atStartOfDay() : LocalDateTime.now();
		return dietLogService.create(memberId, plan.getMeal().getId(), logDateTime);
	}

	/**
	 * 특정 날짜(예: 오늘)에 추천받은 미채택 식단을 한 번에 모두 채택하고, 각각 diet_log 1건씩 생성합니다.
	 * - 아침/점심/저녁 3개가 있으면 diet_log 3건 생성
	 * - 모든 diet_log의 date_at은 채택 시각(같은 분)으로 통일합니다.
	 */
	public List<DietLogResponseDto> acceptAllMealPlansForDate(Long memberId, LocalDate dateAt) {
		if (memberId == null) {
			throw new IllegalArgumentException("memberId는 필수입니다.");
		}
		if (dateAt == null) {
			dateAt = LocalDate.now();
		}
		List<MealPlan> plans = mealPlanRepository.findByMemberIdAndDateAtOrderById(memberId, dateAt);
		// 채택 시각 하나로 통일 (같은 분)
		LocalDateTime logDateTime = LocalDateTime.now().truncatedTo(ChronoUnit.MINUTES);
		return plans.stream()
				.filter(plan -> !Boolean.TRUE.equals(plan.getIsAccepted()))
				.map(plan -> {
					plan.setIsAccepted(true);
					mealPlanRepository.save(plan);
					return dietLogService.create(memberId, plan.getMeal().getId(), logDateTime);
				})
				.collect(Collectors.toList());
	}

	/**
	 * Python 추천 결과(JSON 파싱 후 메뉴 1개)을 기반으로
	 * - Meal 1건
	 * - MealItem 1건
	 * - MealPlan 1건을 생성합니다.
	 *
	 * 기존 MealRecommend* DTO를 거치지 않고 바로 MealPlan을 만드는 용도입니다.
	 *
	 * @param memberId 추천 대상 회원 ID
	 * @param item     추천 메뉴 1개 (예: 아침/점심/저녁 중 하나)
	 * @param mealType 식사 유형 (B/L/D/S)
	 * @param dateAt   적용 날짜 (null이면 오늘)
	 * @return 생성된 MealPlan
	 */
	public MealPlan createRecommendedMealFromPython(Long memberId,
			PythonRecommendedMenu item,
			char mealType,
			LocalDate dateAt) {

		if (memberId == null) {
			throw new IllegalArgumentException("memberId는 필수입니다.");
		}
		if (mealType == 0) {
			throw new IllegalArgumentException("mealType은 필수입니다.");
		}
		if (item == null) {
			throw new IllegalArgumentException("추천 메뉴가 비어 있습니다.");
		}

		Member member = memberRepository.findById(memberId)
				.orElseThrow(() -> new BadRequestException("회원이 존재하지 않습니다. id=" + memberId));

		// 1) Meal 생성
		Meal meal = new Meal();
		meal.setMealType(mealType);
		meal.setMenu(item.getName() != null ? item.getName() : "");
		meal.setTotalCalories(item.getCalories() != null ? item.getCalories() : 0);
		meal.setCarbohydrate(item.getCarbohydrate() != null ? item.getCarbohydrate() : 0);
		meal.setProtein(item.getProtein() != null ? item.getProtein() : 0);
		meal.setFat(item.getFat() != null ? item.getFat() : 0);
		meal.setComment(item.getDescription() != null ? item.getDescription() : "");

		Meal savedMeal = mealService.saveMeal(meal);

		// 2) MealItem 1건 생성 (메뉴명 + 영양정보 + 재료 목록 JSON). 재료는 API 원본 그대로 "계란 2개" 형태로 ingredients에 저장
		List<String> ingredientDisplayStrings = item.getIngredientDisplayStrings() != null
				? item.getIngredientDisplayStrings()
				: new ArrayList<>();
		if (ingredientDisplayStrings.isEmpty() && item.getIngredientPortions() != null && !item.getIngredientPortions().isEmpty()) {
			for (IngredientPortion p : item.getIngredientPortions()) {
				ingredientDisplayStrings.add(p.getGrams() > 0 ? (p.getName() + " " + p.getGrams() + "g") : p.getName());
			}
		}
		MealItem mealItem = new MealItem();
		mealItem.setMeal(savedMeal);
		mealItem.setName(item.getName() != null ? item.getName() : "");
		mealItem.setAmount(item.getIngredientPortions() != null && !item.getIngredientPortions().isEmpty()
				? item.getIngredientPortions().stream().mapToInt(IngredientPortion::getGrams).sum()
				: 0);
		mealItem.setCarbohydrate(item.getCarbohydrate() != null ? item.getCarbohydrate() : 0);
		mealItem.setProtein(item.getProtein() != null ? item.getProtein() : 0);
		mealItem.setFat(item.getFat() != null ? item.getFat() : 0);
		mealItem.setCalories(item.getCalories() != null ? item.getCalories() : 0);
		if (!ingredientDisplayStrings.isEmpty()) {
			try {
				mealItem.setIngredients(objectMapper.writeValueAsString(ingredientDisplayStrings));
			} catch (JsonProcessingException e) {
				mealItem.setIngredients(String.join(",", ingredientDisplayStrings));
			}
		}
		mealItemRepository.save(mealItem);

		// 3) MealPlan 생성
		MealPlan mealPlan = new MealPlan();
		mealPlan.setMember(member);
		mealPlan.setMeal(savedMeal);
		mealPlan.setDateAt(dateAt != null ? dateAt : LocalDate.now());
		mealPlan.setIsAccepted(false);

		return mealPlanRepository.save(mealPlan);
	}

	/**
	 * FastAPI에서 받은 추천 결과 원본 JSON을 파싱하여
	 * 아침/점심/저녁 메뉴를 meal/meal_item/meal_plan에 저장합니다.
	 *
	 * 기대 JSON(예시):
	 * {
	 *   "breakfast": {"name": "...", "description": "...", "calories": 123, ...},
	 *   "lunch": {...},
	 *   "dinner": {...}
	 * }
	 */
	public void createRecommendedMealsFromPythonJson(Long memberId, String pythonJson, LocalDate dateAt) {
		if (memberId == null) {
			throw new IllegalArgumentException("memberId는 필수입니다.");
		}
		if (dateAt == null) {
			dateAt = LocalDate.now();
		}
		if (pythonJson == null || pythonJson.isBlank()) {
			throw new BadRequestException("추천 결과(JSON)가 비어 있습니다.");
		}

		JsonNode root;
		try {
			root = objectMapper.readTree(pythonJson);
		} catch (Exception e) {
			throw new BadRequestException("추천 결과(JSON) 파싱에 실패했습니다: " + e.getMessage());
		}

		saveIfPresent(memberId, root.get("breakfast"), 'B', dateAt);
		saveIfPresent(memberId, root.get("lunch"), 'L', dateAt);
		saveIfPresent(memberId, root.get("dinner"), 'D', dateAt);
	}

	private void saveIfPresent(Long memberId, JsonNode node, char mealType, LocalDate dateAt) {
		if (node == null || node.isNull() || node.isMissingNode()) {
			return;
		}
		String name = textOrEmpty(node.get("name"));
		String description = textOrEmpty(node.get("description"));
		Integer calories = intOrNull(node.get("calories"));

		JsonNode nutrients = node.get("nutrients");
		Integer carbohydrate = null;
		Integer protein = null;
		Integer fat = null;
		if (nutrients != null && !nutrients.isNull()) {
			// 파이썬: carbohydrates(복수형), protein, fat (float)
			carbohydrate = floatToInt(nutrients.get("carbohydrates"));
			protein = floatToInt(nutrients.get("protein"));
			fat = floatToInt(nutrients.get("fat"));
		}

		// ingredients 배열 파싱: 문자열이면 그대로, 객체면 name(+ amount 등) 조합. DB에는 전체 문구 저장
		List<String> ingredientDisplayStrings = parseIngredientDisplayStrings(node.get("ingredients"));
		List<IngredientPortion> ingredientPortions = parseIngredientPortions(node.get("ingredients"));

		// 이름이 없으면 저장 가치가 없으므로 스킵 (파이썬 응답이 불완전한 경우 안전 처리)
		if (name.isBlank()) {
			return;
		}
		createRecommendedMealFromPython(memberId,
				new PythonRecommendedMenu(name, description, calories, carbohydrate, protein, fat, ingredientPortions, ingredientDisplayStrings),
				mealType, dateAt);
	}

	/**
	 * API 응답의 ingredients를 그대로 DB에 넣기 위한 표시 문자열 목록.
	 * - 요소가 문자열 "계란 2개" → 그대로 "계란 2개"
	 * - 요소가 객체 {"name":"계란","amount":"2개"} 또는 {"name":"계란","grams":50} → "계란 2개" / "계란 50g" 조합
	 */
	private static List<String> parseIngredientDisplayStrings(JsonNode ingredientsNode) {
		List<String> list = new ArrayList<>();
		if (ingredientsNode == null || ingredientsNode.isNull() || !ingredientsNode.isArray()) {
			return list;
		}
		for (JsonNode el : ingredientsNode) {
			if (el.isTextual()) {
				String s = el.asText("").trim();
				if (!s.isEmpty()) list.add(s);
			} else if (el.isObject() && el.has("name")) {
				String name = textOrEmpty(el.get("name")).trim();
				if (name.isEmpty()) continue;
				// amount, quantity, display 등이 있으면 붙여서 "계란 2개" 형태로
				String amount = textOrEmpty(el.get("amount")).trim();
				if (amount.isEmpty()) amount = textOrEmpty(el.get("quantity")).trim();
				if (amount.isEmpty()) amount = textOrEmpty(el.get("display")).trim();
				if (amount.isEmpty() && el.has("grams")) {
					Integer g = floatToInt(el.get("grams"));
					if (g != null && g > 0) amount = g + "g";
				}
				list.add(amount.isEmpty() ? name : (name + " " + amount));
			} else {
				String s = el.asText("").trim();
				if (!s.isEmpty()) list.add(s);
			}
		}
		return list;
	}

	/** JSON 배열 노드 파싱: [ {"name": "오트밀", "grams": 50}, ... ] 또는 [ "문자열" ] (grams=0) */
	private static List<IngredientPortion> parseIngredientPortions(JsonNode ingredientsNode) {
		List<IngredientPortion> list = new ArrayList<>();
		if (ingredientsNode == null || ingredientsNode.isNull() || !ingredientsNode.isArray()) {
			return list;
		}
		for (JsonNode el : ingredientsNode) {
			if (el.isObject() && el.has("name")) {
				String n = textOrEmpty(el.get("name"));
				int g = el.has("grams") ? intOrNull(el.get("grams")) != null ? intOrNull(el.get("grams")) : 0 : 0;
				if (!n.isEmpty()) {
					list.add(new IngredientPortion(n, g));
				}
			} else {
				String s = el.isTextual() ? el.asText("").trim() : el.asText("").trim();
				if (!s.isEmpty()) {
					list.add(new IngredientPortion(s, 0));
				}
			}
		}
		return list;
	}

	/** float 값은 반올림하여 Integer로 (파이썬 nutrients가 float이므로) */
	private static Integer floatToInt(JsonNode node) {
		if (node == null || node.isNull() || node.isMissingNode()) return null;
		if (node.isNumber()) return (int) Math.round(node.asDouble());
		String text = node.asText(null);
		if (text == null || text.isBlank()) return null;
		try {
			return (int) Math.round(Double.parseDouble(text.trim()));
		} catch (NumberFormatException e) {
			return null;
		}
	}

	private static String textOrEmpty(JsonNode node) {
		return (node == null || node.isNull()) ? "" : node.asText("");
	}

	private static Integer intOrNull(JsonNode node) {
		if (node == null || node.isNull() || node.isMissingNode()) return null;
		if (node.isNumber()) return node.asInt();
		String text = node.asText(null);
		if (text == null || text.isBlank()) return null;
		try {
			return Integer.parseInt(text.trim());
		} catch (NumberFormatException e) {
			return null;
		}
	}

	/**
	 * FastAPI 추천 메뉴 최소 필드만 보관하는 내부 DTO.
	 * ingredientDisplayStrings: DB ingredients 컬럼에 넣을 재료 문구 목록 ("계란 2개" 등 원본 그대로).
	 */
	public static class PythonRecommendedMenu {
		private final String name;
		private final String description;
		private final Integer calories;
		private final Integer carbohydrate;
		private final Integer protein;
		private final Integer fat;
		private final List<IngredientPortion> ingredientPortions;
		private final List<String> ingredientDisplayStrings;

		public PythonRecommendedMenu(String name, String description, Integer calories,
				Integer carbohydrate, Integer protein, Integer fat,
				List<IngredientPortion> ingredientPortions,
				List<String> ingredientDisplayStrings) {
			this.name = name;
			this.description = description;
			this.calories = calories;
			this.carbohydrate = carbohydrate;
			this.protein = protein;
			this.fat = fat;
			this.ingredientPortions = ingredientPortions != null ? ingredientPortions : new ArrayList<>();
			this.ingredientDisplayStrings = ingredientDisplayStrings != null ? ingredientDisplayStrings : new ArrayList<>();
		}

		public String getName() {
			return name;
		}

		public String getDescription() {
			return description;
		}

		public Integer getCalories() {
			return calories;
		}

		public Integer getCarbohydrate() {
			return carbohydrate;
		}

		public Integer getProtein() {
			return protein;
		}

		public Integer getFat() {
			return fat;
		}

		public List<IngredientPortion> getIngredientPortions() {
			return ingredientPortions;
		}

		public List<String> getIngredientDisplayStrings() {
			return ingredientDisplayStrings;
		}
	}

	/** 재료별 권장 그람수 (Python 응답 ingredients 요소: name, grams) */
	public static class IngredientPortion {
		private final String name;
		private final int grams;

		public IngredientPortion(String name, int grams) {
			this.name = name;
			this.grams = grams;
		}

		public String getName() {
			return name;
		}

		public int getGrams() {
			return grams;
		}
	}

	/**
	 * 특정 회원의 특정 날짜에 해당하는 추천 식단 목록을 조회합니다.
	 * (오늘 날짜 조회 시 GET /meal-plans/today 에서 사용)
	 */
	@Transactional(readOnly = true)
	public List<MealPlanResponseDto> getMealPlansByDate(Long memberId, LocalDate dateAt) {
		if (memberId == null) {
			throw new IllegalArgumentException("memberId는 필수입니다.");
		}
		if (dateAt == null) {
			dateAt = LocalDate.now();
		}
		return mealPlanRepository.findByMemberIdAndDateAtOrderById(memberId, dateAt).stream()
				.map(MealPlanResponseDto::fromEntity)
				.collect(Collectors.toList());
	}

	/**
	 * 특정 회원의 오늘 날짜 추천 식단을 모두 삭제합니다.
	 * - 채택(accepted)된 식단이 있어도 허용: 해당 meal에 연결된 diet_log를 먼저 삭제한 뒤, MealPlan → MealItem → Meal 순으로 삭제합니다.
	 */
	public void deleteMealPlansForDate(Long memberId, LocalDate dateAt) {
		if (memberId == null) {
			throw new IllegalArgumentException("memberId는 필수입니다.");
		}
		if (dateAt == null) {
			dateAt = LocalDate.now();
		}
		List<MealPlan> plans = mealPlanRepository.findByMemberIdAndDateAtOrderById(memberId, dateAt);
		List<Long> mealIds = plans.stream()
				.map(p -> p.getMeal().getId())
				.distinct()
				.toList();
		// 채택된 식단으로 생성된 diet_log 먼저 삭제 (FK 제약 때문에 Meal 삭제 전에 필요)
		dietLogService.deleteByMealIds(mealIds);
		mealPlanRepository.deleteAll(plans);
		for (Long mealId : mealIds) {
			mealItemRepository.deleteByMealId(mealId);
			mealRepository.deleteById(mealId);
		}
	}
}

