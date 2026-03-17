package com.study.lastlayer.externapi.dietrecommendation;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.study.lastlayer.auth.CustomUserPrincipal;
import com.study.lastlayer.member.Member;
import com.study.lastlayer.member.MemberRepository;

import lombok.RequiredArgsConstructor;

/**
 * FastAPI(추천 식단) 프록시 컨트롤러.
 *
 * 목적:
 * - 파이썬(FastAPI) 응답 원본(JSON)을 그대로 확인할 수 있게 함
 * - FastAPI의 4xx/5xx 에러 바디도 그대로 전달하여 디버깅/연동 확인을 쉽게 함
 *
 * 참고:
 * - 실제 서비스 기능(추천 생성/저장/채택/조회)은 {@code /meal-plans} 도메인 API에서 처리합니다.
 */
@RestController
@RequestMapping("/services/dietrecommendation")
@RequiredArgsConstructor
public class DietRecommendationController {

	private final DietRecommendationService dietRecommendationService;
	private final MemberRepository memberRepository;

	/**
	 * 로그인 사용자 기준으로 FastAPI 추천 식단을 요청하고,
	 * FastAPI가 반환한 원본 JSON을 그대로 리턴합니다.
	 *
	 * 응답:
	 * - 200 OK + application/json: FastAPI 원본 JSON
	 * - FastAPI가 4xx/5xx 응답을 주면 상태 코드/바디 그대로 전달
	 */
	@PostMapping(value = "/recommend", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<String> recommendRaw(@AuthenticationPrincipal CustomUserPrincipal principal) {
		try {
			Long memberId = principal.getMemberId();
			Member member = memberRepository.findById(memberId)
					.orElseThrow(() -> new IllegalArgumentException("회원이 존재하지 않습니다. id=" + memberId));

			String jsonResponse = dietRecommendationService.recommendDailyMeal(member);
			return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(jsonResponse);
		} catch (org.springframework.web.client.HttpStatusCodeException e) {
			return ResponseEntity.status(e.getStatusCode())
					.contentType(MediaType.APPLICATION_JSON)
					.body(e.getResponseBodyAsString());
		} catch (Exception e) {
			return ResponseEntity.status(500)
					.contentType(MediaType.APPLICATION_JSON)
					.body("{\"detail\":\"Spring Server Error: " + e.getMessage() + "\"}");
		}
	}
}

