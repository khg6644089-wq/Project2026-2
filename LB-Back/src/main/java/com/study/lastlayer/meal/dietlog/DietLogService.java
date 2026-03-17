package com.study.lastlayer.meal.dietlog;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.study.lastlayer.exception.BadRequestException;
import com.study.lastlayer.meal.Meal;
import com.study.lastlayer.meal.MealRepository;
import com.study.lastlayer.meal.mealitem.MealItemRepository;
import com.study.lastlayer.meal.mealplan.MealPlanRepository;
import com.study.lastlayer.member.Member;
import com.study.lastlayer.member.MemberRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class DietLogService {

	private final DietLogRepository dietLogRepository;
	private final MealRepository mealRepository;
	private final MemberRepository memberRepository;
	private final MealItemRepository mealItemRepository;
	private final MealPlanRepository mealPlanRepository;

	/** 회원별 식단 기록 목록 조회 (diet_log를 통한 조회, 기간 선택 가능) */
	@Transactional(readOnly = true)
	public List<DietLogResponseDto> getByMember(Long memberId, LocalDate fromDate, LocalDate toDate) {
		validateMemberExists(memberId);
		List<DietLog> list;
		if (fromDate != null && toDate != null) {
			LocalDateTime from = fromDate.atStartOfDay();
			LocalDateTime to = toDate.atTime(LocalTime.MAX);
			list = dietLogRepository.findByMemberIdAndDateAtBetween(memberId, from, to);
		} else {
			list = dietLogRepository.findByMemberIdOrderByDateAtDesc(memberId);
		}
		return list.stream()
				.map(DietLogResponseDto::fromEntity)
				.toList();
	}

	/** 식단 기록 단건 조회 */
	@Transactional(readOnly = true)
	public DietLogResponseDto getById(Long id) {
		DietLog log = dietLogRepository.findById(id)
				.orElseThrow(() -> new BadRequestException("식단 기록이 존재하지 않습니다. id=" + id));
		return DietLogResponseDto.fromEntity(log);
	}

	/** 식단 기록 추가 */
	public DietLogResponseDto create(Long memberId, DietLogRequestDto dto) {
		if (dto.getMealId() == null) {
			throw new IllegalArgumentException("mealId는 필수입니다.");
		}
		return create(memberId, dto.getMealId(), null);
	}

	/** 식단 기록 추가 (내부용: 날짜 직접 지정 가능, null이면 현재 시각) */
	public DietLogResponseDto create(Long memberId, Long mealId, LocalDateTime dateAt) {
		Member member = memberRepository.findById(memberId)
				.orElseThrow(() -> new BadRequestException("회원이 존재하지 않습니다. id=" + memberId));
		Meal meal = mealRepository.findById(mealId)
				.orElseThrow(() -> new BadRequestException("식단이 존재하지 않습니다. id=" + mealId));
		DietLog log = new DietLog();
		log.setMember(member);
		log.setMeal(meal);
		log.setDateAt(dateAt != null ? dateAt : LocalDateTime.now());
		DietLog saved = dietLogRepository.save(log);
		return DietLogResponseDto.fromEntity(saved);
	}

	/**
	 * 식단 기록 삭제 (본인 소유만).
	 * - diet_log 삭제 후, 해당 Meal을 참조하는 다른 diet_log가 없으면 MealItem + Meal도 함께 삭제합니다.
	 */
	public void delete(Long memberId, Long id) {
		if (memberId == null) {
			throw new IllegalArgumentException("memberId는 필수입니다.");
		}
		DietLog log = dietLogRepository.findById(id)
				.orElseThrow(() -> new BadRequestException("식단 기록이 존재하지 않습니다. id=" + id));
		Long ownerId = log.getMember() != null ? log.getMember().getMember_id() : null;
		if (ownerId == null || !ownerId.equals(memberId)) {
			throw new BadRequestException("본인의 식단 기록만 삭제할 수 있습니다.");
		}
		Long mealId = log.getMeal() != null ? log.getMeal().getId() : null;
		dietLogRepository.delete(log);

		// 다른 diet_log가 더 이상 이 meal을 참조하지 않으면 MealPlan + meal_item + meal도 정리
		if (mealId != null && !dietLogRepository.existsByMeal_Id(mealId)) {
			// 추천 식단(MealPlan)에서만 참조되고 있을 수 있으므로 우선 정리
			mealPlanRepository.deleteByMealId(mealId);
			mealItemRepository.deleteByMealId(mealId);
			mealRepository.deleteById(mealId);
		}
	}

	private void validateMemberExists(Long memberId) {
		if (!memberRepository.existsById(memberId)) {
			throw new BadRequestException("회원이 존재하지 않습니다. id=" + memberId);
		}
	}

	/**
	 * 지정한 meal id들에 연결된 diet_log를 삭제합니다.
	 * 전체 다시 받기(replace) 시, 채택된 추천 식단으로 생성된 기록을 정리할 때 사용합니다.
	 */
	public void deleteByMealIds(List<Long> mealIds) {
		if (mealIds == null || mealIds.isEmpty()) {
			return;
		}
		dietLogRepository.deleteByMealIdIn(mealIds);
	}
}
