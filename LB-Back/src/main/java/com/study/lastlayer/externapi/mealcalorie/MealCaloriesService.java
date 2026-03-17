package com.study.lastlayer.externapi.mealcalorie;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClientException;

import com.study.lastlayer.externapi.FastApiClient;

@Service
public class MealCaloriesService {

	private final FastApiClient fastApiClient;
	private final String calculateUrl;

	public MealCaloriesService(FastApiClient fastApiClient) {
		this.fastApiClient = fastApiClient;
		// FastAPI docs 기준: /api/v1/meal/calculate-calories
		this.calculateUrl = fastApiClient.getFullUrl("meal/calculate-calories");
	}

	public CaloriesCalculationResponse calculate(CaloriesCalculationRequest request) {
		HttpHeaders headers = new HttpHeaders();
		headers.setContentType(MediaType.APPLICATION_JSON);
		HttpEntity<CaloriesCalculationRequest> entity = new HttpEntity<>(request, headers);

		try {
			return fastApiClient.getRestTemplate()
					.postForObject(calculateUrl, entity, CaloriesCalculationResponse.class);
		} catch (HttpStatusCodeException e) {
			throw e;
		} catch (ResourceAccessException e) {
			throw new RuntimeException("칼로리 계산 서버 연결 시간이 초과되었습니다.");
		} catch (RestClientException e) {
			throw new RuntimeException("칼로리 계산 요청 중 서버 오류가 발생했습니다: " + e.getMessage());
		}
	}
}

