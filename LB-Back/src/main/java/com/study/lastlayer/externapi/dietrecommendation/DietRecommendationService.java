package com.study.lastlayer.externapi.dietrecommendation;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClientException;

import com.study.lastlayer.externapi.FastApiClient;
import com.study.lastlayer.member.Member;

@Service
public class DietRecommendationService {

	private static final Set<String> SUPPORTED_ALLERGIES = Set.of(
			"우유", "달걀", "생선", "갑각류", "건과류", "땅콩", "밀");

	private final FastApiClient fastApiClient;
	private final String recommendUrl;

	public DietRecommendationService(FastApiClient fastApiClient) {
		this.fastApiClient = fastApiClient;
		// FastAPI docs 기준: /api/v1/meal/recommend
		this.recommendUrl = fastApiClient.getFullUrl("meal/recommend");
	}

	/**
	 * 회원 정보를 Python(FastAPI) 서버로 전송하는 메서드입니다.
	 *
	 * @param requestBody Python이 기대하는 JSON 구조에 맞는 객체 (DTO, Map<String,
	 *                    Object>, Record 등 자유롭게 사용 가능)
	 * @return FastAPI가 반환한 원본 응답(JSON String 등)
	 */
	public String sendMemberInfo(Object requestBody) {
		HttpHeaders headers = new HttpHeaders();
		headers.setContentType(MediaType.APPLICATION_JSON);

		HttpEntity<Object> entity = new HttpEntity<>(requestBody, headers);

		try {
			return fastApiClient.getRestTemplate().postForObject(recommendUrl, entity, String.class);
		} catch (HttpStatusCodeException e) {
			// FastAPI가 반환한 4xx/5xx 응답은 그대로 던져서 컨트롤러에서 처리할 수 있게 합니다.
			throw e;
		} catch (ResourceAccessException e) {
			throw new RuntimeException("추천 식단 서버 연결 시간이 초과되었습니다.");
		} catch (RestClientException e) {
			throw new RuntimeException("추천 식단 요청 중 서버 오류가 발생했습니다: " + e.getMessage());
		}
	}

	/**
	 * Spring Member 엔티티를 기반으로 Python이 기대하는 요청(JSON)을 구성하고
	 * 추천 식단을 요청합니다.
	 *
	 * @param member 스프링 Member 엔티티
	 * @return FastAPI가 반환한 추천 결과 원본 JSON 문자열
	 */
	public String recommendDailyMeal(Member member) {
		return sendMemberInfo(buildRecommendRequest(member));
	}

	private Map<String, Object> buildRecommendRequest(Member member) {
		List<String> rawAllergies = parseCommaSeparatedValues(member != null ? member.getAllergies() : null);
		List<String> supportedAllergies = rawAllergies.stream()
				.filter(SUPPORTED_ALLERGIES::contains)
				.distinct()
				.collect(Collectors.toList());

		Map<String, Object> profile = new LinkedHashMap<>();
		profile.put("member_id", member.getMember_id());
		profile.put("name", member.getName());
		profile.put("gender", member.getGender());
		profile.put("birthday", member.getBirthday());
		profile.put("height", member.getHeight());
		profile.put("weight", member.getWeight());
		profile.put("goal", member.getGoal());
		profile.put("goal_weight", member.getGoal_weight());
		profile.put("target_date", member.getTarget_date());
		profile.put("allergies", rawAllergies);
		profile.put("special_notes", member.getSpecial_notes());
		profile.put("daily_calories", member.getDaily_calories());

		Map<String, Object> root = new LinkedHashMap<>();
		root.put("goal", mapGoalToFastApiValue(member.getGoal()));
		root.put("allergies", supportedAllergies);
		root.put("disliked_items", List.of());
		root.put("profile", profile);

		return root;
	}

	private static List<String> parseCommaSeparatedValues(String value) {
		if (value == null || value.isBlank()) {
			return List.of();
		}
		String[] parts = value.split(",");
		List<String> results = new ArrayList<>();
		for (String p : parts) {
			if (p == null) continue;
			String trimmed = p.trim();
			if (!trimmed.isEmpty()) {
				results.add(trimmed);
			}
		}
		return results;
	}

	private static String mapGoalToFastApiValue(String goal) {
		if (goal == null) {
			return "체중감량";
		}
		String normalized = goal.replace(" ", "");
		if (normalized.contains("감량")) return "체중감량";
		if (normalized.contains("건강")) return "건강유지";
		if (normalized.contains("근육")) return "근육량증가";
		if (normalized.contains("혈당")) return "혈당관리";
		if (normalized.contains("콜레스테롤")) return "콜레스테롤";
		return "체중감량";
	}

}