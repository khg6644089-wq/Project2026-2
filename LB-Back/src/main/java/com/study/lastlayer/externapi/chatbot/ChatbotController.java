package com.study.lastlayer.externapi.chatbot;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.study.lastlayer.auth.CustomUserPrincipal;
import com.study.lastlayer.member.Member;
import com.study.lastlayer.member.MemberService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/services/chatbot")
@RequiredArgsConstructor
public class ChatbotController {

	private final ChatbotService chatbotService;
	private final MemberService memberService;

	@PostMapping
	@PreAuthorize("isAuthenticated()")
	public ResponseEntity<ChatResponseDto> askChatbot(
			@AuthenticationPrincipal CustomUserPrincipal principal,
			@RequestBody ChatRequestDto requestDto) {

		Member member = memberService.getMember(principal.getMemberId());

		requestDto.setUserInfo(buildUserInfo(member));

		log.info("ChatbotController userInfo: {}", requestDto.getUserInfo());

		try {
			ChatResponseDto response = chatbotService.ask(requestDto);
			return ResponseEntity.ok(response);
		} catch (RuntimeException e) {
			log.warn("Chatbot request failed: {}", e.getMessage());
			throw e;
		}
	}

	private String buildUserInfo(Member member) {
		return String.format(
				"성별:%s, 생년월일:%s, 키:%.1fcm, 현재 체중:%.1fkg, " +
						"목표:%s, 목표 체중:%.1fkg, 목표 기간:%d일, " +
						"알레르기 정보:%s, 특이사항:%s, 일일 권장 칼로리:%d kcal",
				"M".equalsIgnoreCase(member.getGender()) ? "남성" : "여성",
				member.getBirthday().toString(),
				member.getHeight(),
				member.getWeight(),
				member.getGoal(),
				member.getGoal_weight(),
				member.getTarget_date(),
				(member.getAllergies() == null || member.getAllergies().isEmpty()) ? "없음" : member.getAllergies(),
				(member.getSpecial_notes() == null || member.getSpecial_notes().isEmpty()) ? "없음" : member.getSpecial_notes(),
				member.getDaily_calories());
	}
}
