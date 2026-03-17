package com.study.lastlayer.externapi.dietanalysis;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.multipart.MultipartFile;

import com.study.lastlayer.externapi.FastApiClient;

@Service
public class DietAnalysisService {
	private final FastApiClient fastApiClient;
	private final String fastApiUrl;

	// 1. 생성자 파라미터로 직접 받습니다.
	public DietAnalysisService(FastApiClient fastApiClient) {
		this.fastApiClient = fastApiClient;
		this.fastApiUrl = fastApiClient.getFullUrl("dietanalyzer/analyze");
	}

	public DietAnalysisResponse analyzeDiet(MultipartFile file) throws Exception {
		try {
			// 1. 헤더 설정
			HttpHeaders headers = new HttpHeaders();
			headers.setContentType(MediaType.MULTIPART_FORM_DATA);

			// 2. 바디 구성: MultipartFile을 ByteArrayResource로 변환
			ByteArrayResource fileResource = new ByteArrayResource(file.getBytes()) {
				@Override
				public String getFilename() {
					return file.getOriginalFilename(); // 파일명이 있어야 FastAPI가 인식함
				}
			};

			MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
			body.add("file", fileResource);

			// 3. 요청 전송
			HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

			return fastApiClient.getRestTemplate().postForObject(fastApiUrl, requestEntity, DietAnalysisResponse.class);
		} catch (org.springframework.web.client.ResourceAccessException e) {
			// 타임아웃 발생 시 에러 핸들링
			throw new RuntimeException("AI 분석 서버 연결 시간이 초과되었습니다.");
		} catch (org.springframework.web.client.RestClientException e) {
			// 4xx, 5xx 에러 등 서버 호출 실패 시
			throw new RuntimeException("AI 분석 중 서버 오류가 발생했습니다: " + e.getMessage());
		}
	}

	public String analyzeDietRaw(MultipartFile file) throws Exception {
		try {
			// 1. 헤더 설정
			HttpHeaders headers = new HttpHeaders();
			headers.setContentType(MediaType.MULTIPART_FORM_DATA);

			// 2. 파일 리소스 생성 및 Content-Type 설정 (FastAPI 검사 통과용)
			ByteArrayResource fileResource = new ByteArrayResource(file.getBytes()) {
				@Override
				public String getFilename() {
					return file.getOriginalFilename();
				}
			};

			// 파일의 실제 MIME 타입을 헤더에 담아 묶어줌 (가공 방지의 핵심)
			HttpHeaders filePartHeaders = new HttpHeaders();
			filePartHeaders.setContentType(
					MediaType.parseMediaType(file.getContentType() != null ? file.getContentType() : "image/jpeg"));
			HttpEntity<ByteArrayResource> filePart = new HttpEntity<>(fileResource, filePartHeaders);

			MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
			body.add("file", filePart);

			// 3. 요청 전송 (String.class로 받아 원본 JSON 유지)
			HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

			return fastApiClient.getRestTemplate().postForObject(fastApiUrl, requestEntity, String.class);

		} catch (org.springframework.web.client.HttpStatusCodeException e) {
			// FastAPI가 던진 에러(400, 422 등)를 가공하지 않고 그대로 컨트롤러로 던짐
			throw e;
		} catch (org.springframework.web.client.ResourceAccessException e) {
			throw new RuntimeException("AI 분석 서버 연결 시간이 초과되었습니다.");
		} catch (Exception e) {
			throw new RuntimeException("분석 요청 중 오류 발생");
		}
	}
}