package com.study.lastlayer.externapi.chatbot;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;

import com.study.lastlayer.externapi.FastApiClient;

@Service
public class ChatbotService {

	private final FastApiClient fastApiClient;
	private final String fastApiUrl;

	public ChatbotService(FastApiClient fastApiClient) {
		this.fastApiClient = fastApiClient;
		this.fastApiUrl = fastApiClient.getFullUrl("chatbot");
	}

	/**
	 * FastAPI 챗봇 엔드포인트로 질문을 전달하고 응답을 반환합니다.
	 *
	 * @param request 질문(question), 사용자 정보(name, point, userInfo)가 채워진 요청 DTO
	 * @return FastAPI가 반환한 챗봇 응답 DTO
	 */
	public ChatResponseDto ask(ChatRequestDto request) {
		try {
			return fastApiClient.getRestTemplate().postForObject(
					fastApiUrl, request, ChatResponseDto.class);
		} catch (org.springframework.web.client.ResourceAccessException e) {
			throw new RuntimeException("챗봇 서버 연결 시간이 초과되었습니다.");
		} catch (RestClientException e) {
			throw new RuntimeException("챗봇 응답 처리 중 오류가 발생했습니다: " + e.getMessage());
		}
	}
}
