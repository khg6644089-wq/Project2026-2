package com.study.lastlayer.externapi.dietanalysis;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/services/dietanalyzer")
@RequiredArgsConstructor
//@CrossOrigin(origins = "http://localhost:3000") // React 개발 서버 허용
public class DietAnalysisController {

	private final DietAnalysisService dietAnalysisService;

	@PostMapping("/analyze")
	public ResponseEntity<String> uploadAndAnalyze(@RequestParam("file") MultipartFile file) {
		try {
			// 서비스에서 String으로 원본 JSON을 받아옵니다.
			String jsonResponse = dietAnalysisService.analyzeDietRaw(file);
			return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(jsonResponse);
		} catch (org.springframework.web.client.HttpStatusCodeException e) {
			// [중요] FastAPI가 보낸 400, 422, 500 등 모든 에러 본문을 그대로 리턴
			return ResponseEntity.status(e.getStatusCode()).contentType(MediaType.APPLICATION_JSON)
					.body(e.getResponseBodyAsString());
		} catch (Exception e) {
			// Spring 자체 오류 상황
			return ResponseEntity.status(500).contentType(MediaType.APPLICATION_JSON)
					.body("{\"detail\":\"Spring Server Error: " + e.getMessage() + "\"}");
		}
	}
}