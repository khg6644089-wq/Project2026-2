package com.study.lastlayer.meal.dietlog;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.study.lastlayer.auth.CustomUserPrincipal;

import lombok.RequiredArgsConstructor;

/**
 * 식단 기록(DietLog) API — 로그인 사용자 기준, diet_log를 통한 조회 및 등록
 * - meal 기록과 기록을 작성한 날짜(dateAt) 조회
 * - 원하는 날짜별 조회: date (해당 날짜), 또는 fromDate~toDate 기간 조회
 */
@RestController
@RequestMapping("/diet-logs")
@RequiredArgsConstructor
public class DietLogController {

	private final DietLogService dietLogService;

	/**
	 * 로그인 사용자의 식단 기록 목록 조회 (meal + 기록 날짜 포함).
	 * - date: 해당 날짜만 조회
	 * - fromDate, toDate: 기간으로 조회 (둘 다 있으면 적용)
	 * - 파라미터 없음: 전체 목록 (최신 순)
	 */
	@GetMapping
	public List<DietLogResponseDto> getByMember(
			@AuthenticationPrincipal CustomUserPrincipal principal,
			@RequestParam(name = "date", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
			@RequestParam(name = "fromDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
			@RequestParam(name = "toDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {
		Long memberId = principal.getMemberId();
		if (date != null) {
			return dietLogService.getByMember(memberId, date, date);
		}
		return dietLogService.getByMember(memberId, fromDate, toDate);
	}

	/** 식단 기록 단건 조회 (meal + 기록 작성 날짜 포함) */
	@GetMapping("/{id}")
	public DietLogResponseDto getById(
			@AuthenticationPrincipal CustomUserPrincipal principal,
			@PathVariable("id") Long id) {
		return dietLogService.getById(id);
	}

	/** 식단 기록 추가 (로그인 사용자로 저장) */
	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public DietLogResponseDto create(
			@AuthenticationPrincipal CustomUserPrincipal principal,
			@RequestBody DietLogRequestDto dto) {
		return dietLogService.create(principal.getMemberId(), dto);
	}

	/** 식단 기록 삭제 (diet_log만 삭제, meal/meal_item은 유지) */
	@DeleteMapping("/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void delete(
			@AuthenticationPrincipal CustomUserPrincipal principal,
			@PathVariable("id") Long id) {
		dietLogService.delete(principal.getMemberId(), id);
	}
}
